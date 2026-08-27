<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="backRoute" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-5">
          <p v-if="program" class="text-muted text-start fs-5 m-0">{{ programLabel(program) }}</p>
          <h4 class="fw-bolder text-start text-dark m-0">Exam Settings</h4>
        </div>
        <div class="col col-12 col-sm-5 text-end align-self-end">
          <h3 class="text-left fw-bolder text-uppercase mb-2">Edit Exam</h3>
        </div>
      </div>
      <hr />
    </div>

    <div v-if="isLoading" class="text-center my-5">
      <output class="spinner-border text-primary"><span class="visually-hidden">Loading...</span></output>
    </div>

    <div v-else-if="error" class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 alert alert-danger">{{ error }}</div>
    </div>

    <template v-else>
      <div id="form-container" class="row mt-2 justify-content-center">
        <ExamFormComponent
          mode="edit"
          :initial-data="formInitial"
          :conducting-body-label="conductingBodyLabel"
          :submitting="saving"
          @submit="saveProgram"
        />
      </div>

      <div class="row mt-4 justify-content-center">
        <div class="col-12 col-sm-10 col-md-8">
          <fieldset class="border p-3 rounded">
            <legend class="float-none w-auto fs-6 fw-bold px-2">Exam Stages</legend>
            <ul class="list-group mb-3">
              <li v-for="stage in stages" :key="stage.id" class="list-group-item d-flex align-items-center">
                <span>
                  {{ stage.sequence_number }}. {{ stage.name }}
                  <span v-if="stage.is_qualifying" class="badge bg-light text-dark border ms-2">
                    Qualifying{{ stage.qualifying_pct ? ` · ${stage.qualifying_pct}%` : '' }}
                  </span>
                </span>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger py-0 ms-auto"
                  @click="confirmDeleteStage(stage)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </li>
              <li v-if="!stages.length" class="list-group-item text-muted">No stages yet.</li>
            </ul>
            <div class="row g-2 align-items-end">
              <div class="col-12 col-md-5">
                <label class="form-label fw-bold" for="newStageName">New Stage Name</label>
                <input id="newStageName" v-model="stageForm.name" class="form-control" placeholder="e.g. Prelims" />
              </div>
              <div class="col-auto">
                <div class="form-check mb-2">
                  <input v-model="stageForm.is_qualifying" class="form-check-input" type="checkbox" id="stageQualifying" />
                  <label class="form-check-label" for="stageQualifying">Qualifying</label>
                </div>
              </div>
              <div class="col-auto" v-if="stageForm.is_qualifying">
                <label class="form-label fw-bold" for="stageCutoff">Cutoff %</label>
                <input id="stageCutoff" v-model.number="stageForm.qualifying_pct" type="number" class="form-control" style="width: 90px" />
              </div>
              <div class="col-auto">
                <button
                  type="button"
                  class="btn btn-dark"
                  :disabled="!stageForm.name.trim() || addingStage"
                  @click="addStage"
                >
                  <output v-if="addingStage" class="spinner-border spinner-border-sm me-1"></output>
                  Add Stage
                </button>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </template>

    <div v-if="stageToDelete" class="modal d-block modal-overlay" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Stage</h5>
            <button type="button" class="btn-close" @click="stageToDelete = null"></button>
          </div>
          <div class="modal-body">
            Delete stage "{{ stageToDelete.name }}"? Linked syllabus or patterns may block deletion.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" @click="stageToDelete = null">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteStage">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamFormComponent from '@/components/forms/ExamFormComponent.vue'
import type { ExamFormData } from '@/components/forms/ExamFormComponent.vue'
import { examCatalogService } from '@/services/examCatalogService'
import { useToastStore } from '@/stores/toast'
import type { ExamProgram, ExamStage } from '@/types/exam'
import { programLabel } from '@/utils/examSyllabus'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const programId = Number(route.params.id)
const isLoading = ref(true)
const saving = ref(false)
const addingStage = ref(false)
const error = ref<string | null>(null)
const program = ref<ExamProgram | null>(null)
const stages = ref<ExamStage[]>([])

const stageForm = ref({
  name: '',
  is_qualifying: false,
  qualifying_pct: null as number | null,
})

const stageToDelete = ref<ExamStage | null>(null)

const backRoute = computed(() => {
  const tab = program.value?.exam_body?.exam_category?.code
  if (tab === 'ENTRANCE' || tab === 'COMPETITIVE') {
    return { name: 'examCatalog', query: { tab } }
  }
  return { name: 'examCatalog' }
})

const conductingBodyLabel = computed(() => {
  if (!program.value?.exam_body) return ''
  return `${program.value.exam_body.name} (${program.value.exam_body.abbreviation})`
})

const formInitial = computed<Partial<ExamFormData>>(() => ({
  name: program.value?.name ?? '',
  duration: program.value?.default_duration_minutes ?? 120,
  hasNegative: program.value?.has_negative_marking ?? true,
  negativeRatio: program.value?.negative_marks_ratio ?? 0.33,
}))

async function loadProgram() {
  isLoading.value = true
  error.value = null
  try {
    program.value = await examCatalogService.getProgram(programId)
    stages.value = program.value.exam_stages ?? []
  } catch {
    error.value = 'Failed to load exam details.'
  } finally {
    isLoading.value = false
  }
}

async function saveProgram(formData: ExamFormData) {
  saving.value = true
  try {
    await examCatalogService.updateProgram(programId, {
      name: formData.name.trim(),
      default_duration_minutes: formData.duration || undefined,
      has_negative_marking: formData.hasNegative,
      negative_marks_ratio: formData.hasNegative ? formData.negativeRatio : undefined,
    })
    toastStore.showToast({ type: 'success', title: 'Success', message: 'Exam updated successfully.' })
    router.push(backRoute.value)
  } catch (err: any) {
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: err?.response?.data?.message ?? 'Failed to update exam.',
    })
  } finally {
    saving.value = false
  }
}

async function addStage() {
  if (!stageForm.value.name.trim()) return
  addingStage.value = true
  try {
    await examCatalogService.createStage({
      exam_program_id: programId,
      name: stageForm.value.name.trim(),
      sequence_number: stages.value.length + 1,
      is_qualifying: stageForm.value.is_qualifying,
      qualifying_pct: stageForm.value.is_qualifying ? stageForm.value.qualifying_pct ?? undefined : undefined,
    })
    stageForm.value = { name: '', is_qualifying: false, qualifying_pct: null }
    await loadProgram()
    toastStore.showToast({ type: 'success', title: 'Success', message: 'Stage added.' })
  } catch (err: any) {
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: err?.response?.data?.message ?? 'Failed to add stage.',
    })
  } finally {
    addingStage.value = false
  }
}

function confirmDeleteStage(stage: ExamStage) {
  stageToDelete.value = stage
}

async function deleteStage() {
  if (!stageToDelete.value) return
  try {
    await examCatalogService.deleteStage(stageToDelete.value.id)
    stageToDelete.value = null
    await loadProgram()
    toastStore.showToast({ type: 'success', title: 'Success', message: 'Stage deleted.' })
  } catch (err: any) {
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: err?.response?.data?.message ?? 'Failed to delete stage.',
    })
  }
}

onMounted(loadProgram)
</script>

<style scoped>
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.container {
  max-width: 1200px;
}

fieldset {
  border-color: #dee2e6;
}

legend {
  font-size: 1rem;
  margin-bottom: 0;
  color: #6c757d;
}

@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
