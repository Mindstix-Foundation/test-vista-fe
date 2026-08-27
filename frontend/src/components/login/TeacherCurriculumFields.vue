<template>
  <div class="teacher-curriculum-fields">
    <h6 class="section-label mb-3">Teaching scope</h6>
    <p class="text-muted small mb-3">
      Select the board, standards, and subjects you teach. Medium is chosen when creating a paper.
    </p>

    <div class="mb-3">
      <SearchableDropdown
        :id="`${idPrefix}Board`"
        label="Board"
        required
        placeholder="Select board"
        :items="boards"
        :model-value="selectedBoard"
        @update:model-value="onBoard"
      >
        <template #item="{ item }">{{ item.name }}</template>
      </SearchableDropdown>
      <div v-if="touched && !boardId" class="invalid-feedback d-block">Please select a board</div>
    </div>

    <fieldset v-if="boardId" class="mb-3 border-0 p-0">
      <legend class="form-label fw-semibold float-none w-auto">Standards <span class="text-danger">*</span></legend>
      <div v-if="loadingStandards" class="text-muted small">Loading standards…</div>
      <div v-else-if="!standards.length" class="text-muted small">No standards for this board.</div>
      <div v-else class="border rounded p-3 check-grid">
        <div v-for="s in standards" :key="s.id" class="form-check">
          <input
            :id="`${idPrefix}Std-${s.id}`"
            class="form-check-input"
            type="checkbox"
            :value="s.id"
            v-model="selectedStandardIds"
            @change="onStandardsChange"
          />
          <label class="form-check-label" :for="`${idPrefix}Std-${s.id}`">{{ s.name }}</label>
        </div>
      </div>
      <div v-if="touched && !selectedStandardIds.length" class="invalid-feedback d-block">
        Select at least one standard
      </div>
    </fieldset>

    <fieldset v-for="stdId in selectedStandardIds" :key="stdId" class="mb-3 border-0 p-0">
      <legend class="form-label fw-semibold float-none w-auto">
        Subjects for {{ standardName(stdId) }}
        <span class="text-danger">*</span>
      </legend>
      <div v-if="loadingSubjects[stdId]" class="text-muted small">Loading subjects…</div>
      <div v-else-if="!(subjectsByStandard[stdId] || []).length" class="text-muted small">
        No subjects found.
      </div>
      <div v-else class="border rounded p-3 check-grid">
        <div v-for="sub in subjectsByStandard[stdId]" :key="sub.id" class="form-check">
          <input
            :id="`${idPrefix}Sub-${stdId}-${sub.id}`"
            class="form-check-input"
            type="checkbox"
            :value="sub.id"
            v-model="selectedSubjects[stdId]"
            @change="emitUpdate"
          />
          <label class="form-check-label" :for="`${idPrefix}Sub-${stdId}-${sub.id}`">
            {{ sub.name }}
          </label>
        </div>
      </div>
      <div
        v-if="touched && !(selectedSubjects[stdId] || []).length"
        class="invalid-feedback d-block"
      >
        Select at least one subject for {{ standardName(stdId) }}
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import type { Item } from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'

export type CurriculumScopePayload = {
  board_id: number
  scopes: { standard_id: number; subject_ids: number[] }[]
}

const props = withDefaults(
  defineProps<{
    idPrefix?: string
    touched?: boolean
    initial?: {
      board?: { id: number; name: string }
      standards?: { id: number; name: string; subjects: { id: number; name: string }[] }[]
    } | null
  }>(),
  { idPrefix: 'curr', touched: false, initial: null },
)

const emit = defineEmits<(e: 'update', payload: CurriculumScopePayload | null) => void>()

const boards = ref<Item[]>([])
const selectedBoard = ref<Item | null>(null)
const boardId = ref(0)
const standards = ref<{ id: number; name: string }[]>([])
const selectedStandardIds = ref<number[]>([])
const subjectsByStandard = reactive<Record<number, { id: number; name: string }[]>>({})
const selectedSubjects = reactive<Record<number, number[]>>({})
const loadingStandards = ref(false)
const loadingSubjects = reactive<Record<number, boolean>>({})

const standardName = (id: number) =>
  standards.value.find((s) => s.id === id)?.name || `Standard ${id}`

const emitUpdate = () => {
  if (!boardId.value || !selectedStandardIds.value.length) {
    emit('update', null)
    return
  }
  const scopes = selectedStandardIds.value.map((standard_id) => ({
    standard_id,
    subject_ids: [...(selectedSubjects[standard_id] || [])],
  }))
  if (scopes.some((s) => !s.subject_ids.length)) {
    emit('update', null)
    return
  }
  emit('update', { board_id: boardId.value, scopes })
}

const loadSubjectsForStandard = async (standardId: number) => {
  loadingSubjects[standardId] = true
  try {
    const { data } = await axiosInstance.get(
      `/curriculum/boards/${boardId.value}/standards/${standardId}/subjects`,
    )
    subjectsByStandard[standardId] = Array.isArray(data) ? data : data?.data || []
  } catch {
    subjectsByStandard[standardId] = []
  } finally {
    loadingSubjects[standardId] = false
  }
}

const onBoard = async (item: Item | null) => {
  selectedBoard.value = item
  boardId.value = (item?.id as number) || 0
  selectedStandardIds.value = []
  for (const k of Object.keys(subjectsByStandard)) delete subjectsByStandard[Number(k)];
  for (const k of Object.keys(selectedSubjects)) delete selectedSubjects[Number(k)];
  standards.value = []
  emitUpdate()
  if (!item) return
  loadingStandards.value = true
  try {
    const { data } = await axiosInstance.get(`/curriculum/boards/${item.id}/standards`)
    standards.value = Array.isArray(data) ? data : data?.data || []
  } catch {
    standards.value = []
  } finally {
    loadingStandards.value = false
  }
}

const onStandardsChange = async () => {
  for (const id of selectedStandardIds.value) {
    if (!subjectsByStandard[id]) {
      if (!selectedSubjects[id]) selectedSubjects[id] = []
      await loadSubjectsForStandard(id)
    }
  }
  for (const k of Object.keys(selectedSubjects)) {
    const id = Number(k)
    if (!selectedStandardIds.value.includes(id)) delete selectedSubjects[id]
  }
  emitUpdate()
}

onMounted(async () => {
  try {
    const { data } = await axiosInstance.get('/curriculum/boards')
    boards.value = (Array.isArray(data) ? data : data?.data || []).map(
      (b: { id: number; name: string; abbreviation?: string }) => ({
        id: b.id,
        name: b.abbreviation ? `${b.name} (${b.abbreviation})` : b.name,
      }),
    )
  } catch {
    boards.value = []
  }

  if (props.initial?.board?.id) {
    const boardItem =
      boards.value.find((b) => b.id === props.initial!.board!.id) ||
      ({ id: props.initial.board.id, name: props.initial.board.name } as Item)
    await onBoard(boardItem)
    selectedStandardIds.value = (props.initial.standards || []).map((s) => s.id)
    for (const std of props.initial.standards || []) {
      await loadSubjectsForStandard(std.id)
      selectedSubjects[std.id] = (std.subjects || []).map((s) => s.id)
    }
    emitUpdate()
  }
})

defineExpose({
  validate(): string | null {
    if (!boardId.value) return 'Please select a board'
    if (!selectedStandardIds.value.length) return 'Select at least one standard'
    for (const id of selectedStandardIds.value) {
      if (!(selectedSubjects[id] || []).length) {
        return `Select at least one subject for ${standardName(id)}`
      }
    }
    return null
  },
})
</script>

<style scoped>
.section-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #212529;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #dee2e6;
}
.check-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.35rem 1rem;
  max-height: 220px;
  overflow: auto;
}
</style>
