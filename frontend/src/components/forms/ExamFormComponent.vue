<template>
  <form @submit.prevent="handleSubmit">
    <div class="row g-3 justify-content-center">
      <template v-if="mode === 'create'">
        <div class="col col-12 col-sm-10 col-md-8">
          <SearchableDropdown
            id="category"
            label="Category"
            placeholder="Search category"
            :items="categoryItems"
            v-model="selectedCategory"
            label-key="name"
            value-key="code"
            item-key="code"
            :search-keys="['name', 'code']"
            next-field-id="body"
            required
            @change="onCategoryChange"
          />
        </div>

        <div class="col col-12 col-sm-10 col-md-8">
          <SearchableDropdown
            id="body"
            label="Conducting Body"
            placeholder="Search conducting body"
            :items="bodyItems"
            v-model="selectedBody"
            label-key="label"
            value-key="id"
            item-key="id"
            :search-keys="['name', 'abbreviation', 'label']"
            :next-field-id="form.bodyId === 0 ? 'newBodyName' : 'examName'"
            required
            @change="onBodyChange"
          >
            <template #item="{ item }">
              {{ item.label || item.name }}
            </template>
          </SearchableDropdown>
        </div>

        <template v-if="form.bodyId === 0">
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="row g-2">
              <div class="col-md-8">
                <div class="form-floating">
                  <input
                    id="newBodyName"
                    v-model="form.newBodyName"
                    class="form-control"
                    placeholder="e.g. Staff Selection Commission"
                    required
                  />
                  <label for="newBodyName">Body Name <span class="text-danger">*</span></label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-floating">
                  <input
                    id="newBodyAbbr"
                    v-model="form.newBodyAbbr"
                    class="form-control"
                    placeholder="e.g. SSC"
                    required
                  />
                  <label for="newBodyAbbr">Abbreviation <span class="text-danger">*</span></label>
                </div>
              </div>
            </div>
          </div>
          <div class="col col-12 col-sm-10 col-md-8">
            <SearchableDropdown
              id="jurisdiction"
              label="Jurisdiction"
              placeholder="Select jurisdiction"
              :items="jurisdictionItems"
              v-model="selectedJurisdiction"
              label-key="name"
              value-key="id"
              item-key="id"
              :search-keys="['name']"
              next-field-id="examName"
              @change="onJurisdictionChange"
            />
          </div>
        </template>
      </template>

      <template v-else>
        <div class="col col-12 col-sm-10 col-md-8">
          <div class="form-floating">
            <input
              id="conductingBody"
              type="text"
              readonly
              class="form-control"
              :value="conductingBodyLabel"
              placeholder="Conducting Body"
            />
            <label for="conductingBody">Conducting Body</label>
          </div>
        </div>
      </template>

      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            id="examName"
            v-model="form.name"
            class="form-control"
            placeholder="e.g. Combined Graduate Level"
            required
          />
          <label for="examName">Exam Name <span class="text-danger">*</span></label>
        </div>
      </div>

      <div class="col col-12 col-sm-10 col-md-8">
        <div class="row g-2">
          <div class="col-md-6">
            <div class="form-floating">
              <input id="duration" v-model.number="form.duration" type="number" class="form-control" min="1" placeholder="120" />
              <label for="duration">Default Duration (min)</label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-floating">
              <input
                id="negativeRatio"
                v-model.number="form.negativeRatio"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="0.33"
                :disabled="!form.hasNegative"
              />
              <label for="negativeRatio">Negative Marks Ratio</label>
            </div>
          </div>
        </div>
      </div>

      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-check">
          <input v-model="form.hasNegative" type="checkbox" class="form-check-input" id="hasNegative" />
          <label class="form-check-label" for="hasNegative">Has negative marking</label>
        </div>
      </div>

      <div class="col col-12 col-sm-10 col-md-8 mt-2">
        <div class="text-center">
          <button type="submit" class="btn btn-dark" :disabled="!canSubmit || submitting">
            <output v-if="submitting" class="spinner-border spinner-border-sm me-1"></output>
            {{ mode === 'create' ? 'Save' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SearchableDropdown, { type Item } from '@/components/common/SearchableDropdown.vue'
import type { ExamCategory, ExamCategoryCode, ExamBody, ExamBodyJurisdiction } from '@/types/exam'

export interface ExamFormData {
  categoryCode: ExamCategoryCode
  bodyId: number
  newBodyName: string
  newBodyAbbr: string
  jurisdiction: ExamBodyJurisdiction
  name: string
  duration: number
  hasNegative: boolean
  negativeRatio: number
}

const ADD_NEW_BODY_ITEM: Item = {
  id: 0,
  name: '+ Add new body…',
  label: '+ Add new body…',
  abbreviation: '',
}

const jurisdictionItems: Item[] = [
  { id: 'NATIONAL', name: 'National' },
  { id: 'STATE', name: 'State' },
  { id: 'INSTITUTIONAL', name: 'Institutional' },
]

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    categories?: ExamCategory[]
    bodies?: ExamBody[]
    initialCategory?: ExamCategoryCode
    initialData?: Partial<ExamFormData>
    conductingBodyLabel?: string
    submitting?: boolean
  }>(),
  {
    mode: 'create',
    categories: () => [],
    bodies: () => [],
    initialCategory: 'COMPETITIVE',
    submitting: false,
  },
)

const emit = defineEmits<(e: 'submit', data: ExamFormData) => void>()

const form = ref<ExamFormData>({
  categoryCode: props.initialCategory,
  bodyId: 0,
  newBodyName: '',
  newBodyAbbr: '',
  jurisdiction: 'NATIONAL',
  name: '',
  duration: 120,
  hasNegative: true,
  negativeRatio: 0.33,
  ...props.initialData,
})

const selectedCategory = ref<Item | null>(null)
const selectedBody = ref<Item | null>(null)
const selectedJurisdiction = ref<Item | null>(null)

const categoryItems = computed<Item[]>(() =>
  props.categories.map((category) => ({
    id: category.code,
    code: category.code,
    name: category.name,
  })),
)

const bodiesForCategory = computed(() =>
  props.bodies.filter((body) => body.exam_category?.code === form.value.categoryCode),
)

const bodyItems = computed<Item[]>(() => [
  ...bodiesForCategory.value.map((body) => ({
    id: body.id,
    name: body.name,
    abbreviation: body.abbreviation,
    label: `${body.abbreviation} — ${body.name}`,
  })),
  ADD_NEW_BODY_ITEM,
])

function syncDropdownSelections() {
  selectedCategory.value =
    categoryItems.value.find((item) => item.code === form.value.categoryCode) ?? null
  selectedBody.value = bodyItems.value.find((item) => item.id === form.value.bodyId) ?? null
  selectedJurisdiction.value =
    jurisdictionItems.find((item) => item.id === form.value.jurisdiction) ?? jurisdictionItems[0]
}

function onCategoryChange(item: Item | null) {
  if (!item?.code) return
  form.value.categoryCode = item.code as ExamCategoryCode
}

function onBodyChange(item: Item | null) {
  const bodyId = typeof item?.id === 'number' ? item.id : 0
  form.value.bodyId = bodyId
  if (bodyId !== 0) {
    form.value.newBodyName = ''
    form.value.newBodyAbbr = ''
  }
}

function onJurisdictionChange(item: Item | null) {
  if (!item?.id) return
  form.value.jurisdiction = String(item.id) as ExamBodyJurisdiction
}

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.value = { ...form.value, ...data }
      syncDropdownSelections()
    }
  },
  { deep: true },
)

watch(
  [categoryItems, bodyItems, () => props.mode],
  () => {
    if (props.mode !== 'create') return
    if (bodiesForCategory.value.length > 0 && form.value.bodyId === 0 && !form.value.newBodyName && !form.value.newBodyAbbr) {
      form.value.bodyId = bodiesForCategory.value[0].id
    }
    syncDropdownSelections()
  },
  { immediate: true },
)

watch(
  () => form.value.categoryCode,
  () => {
    if (props.mode !== 'create') return
    const bodies = bodiesForCategory.value
    form.value.bodyId = bodies[0]?.id ?? 0
    form.value.newBodyName = ''
    form.value.newBodyAbbr = ''
    syncDropdownSelections()
  },
)

const canSubmit = computed(() => {
  if (!form.value.name.trim()) return false
  if (props.mode === 'create' && form.value.bodyId === 0) {
    return Boolean(form.value.newBodyName.trim() && form.value.newBodyAbbr.trim())
  }
  if (props.mode === 'create' && !form.value.bodyId && form.value.bodyId !== 0) return false
  return true
})

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.form-floating > label {
  left: 0.5rem;
}

.btn-dark {
  min-width: 120px;
}
</style>
