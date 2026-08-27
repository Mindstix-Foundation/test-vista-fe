<template>
  <div>
    <div v-if="isLoading" class="text-center my-5">
      <output class="spinner-border text-primary d-block">
        <span class="visually-hidden">Loading...</span>
      </output>
    </div>

    <template v-else>
      <div class="row p-2 justify-content-center mb-2">
        <div class="col-12 col-sm-10 col-md-10">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              class="form-control search-input"
              placeholder="Search exams by name or body..."
              v-model="searchQuery"
              autocomplete="off"
            />
            <i v-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="searchQuery = ''"></i>
          </div>
        </div>
      </div>

      <div class="row p-2 justify-content-center">
        <div class="col col-12 col-sm-10 col-md-10">
          <div class="table-responsive">
            <table class="table table-sm table-hover table-striped table-bordered">
              <caption class="visually-hidden">List of exams with stages, paper patterns and management options</caption>
              <thead class="table-dark">
                <tr>
                  <th scope="col" style="width: 40px">#</th>
                  <th scope="col">Exam</th>
                  <th scope="col" class="d-none d-md-table-cell">Stages</th>
                  <th scope="col" class="text-center" style="width: 110px">Patterns</th>
                  <th scope="col" class="text-center" style="width: 80px">Manage</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr v-for="(program, index) in filteredPrograms" :key="program.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>
                    <strong>{{ program.exam_body?.abbreviation }}</strong> — {{ program.name }}
                  </td>
                  <td class="d-none d-md-table-cell">
                    <span
                      v-for="stage in program.exam_stages"
                      :key="stage.id"
                      class="badge bg-light text-dark border me-1"
                    >
                      {{ stage.name }}
                    </span>
                    <span v-if="!program.exam_stages?.length" class="text-muted small">—</span>
                  </td>
                  <td class="text-center">{{ program._count?.paper_templates ?? 0 }}</td>
                  <td class="text-center">
                    <i class="bi bi-three-dots manage-icon" @click="showProgramInfo(program)"></i>
                  </td>
                </tr>
                <tr v-if="filteredPrograms.length === 0">
                  <td colspan="5" class="text-center">
                    {{ searchQuery ? 'No matching results found.' : 'No exams in this category yet. Click "Add Exam" to create one.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Exam Info Modal (read-only stages/patterns; links to dedicated pages) -->
    <div v-if="showInfoModal" class="modal d-block modal-overlay" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Exam Information</h5>
            <button type="button" class="btn-close" @click="closeInfoModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="!programDetail" class="text-center py-4">
              <output class="spinner-border text-primary">
                <span class="visually-hidden">Loading...</span>
              </output>
            </div>
            <template v-else>
              <div class="row mb-2">
                <label class="col-form-label col-12 col-lg-3 fw-bold" for="examDetailName">Exam Name:</label>
                <div class="col-12 col-lg-9">
                  <input id="examDetailName" type="text" readonly class="form-control-plaintext" :value="programDetail.name" />
                </div>
              </div>
              <div class="row mb-2">
                <label class="col-form-label col-12 col-lg-3 fw-bold" for="examDetailBody">Conducting Body:</label>
                <div class="col-12 col-lg-9">
                  <input
                    id="examDetailBody"
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    :value="`${programDetail.exam_body?.name} (${programDetail.exam_body?.abbreviation})`"
                  />
                </div>
              </div>
              <div v-if="programDetail.exam_body?.jurisdiction" class="row mb-2">
                <label class="col-form-label col-12 col-lg-3 fw-bold" for="examDetailJurisdiction">Jurisdiction:</label>
                <div class="col-12 col-lg-9">
                  <input id="examDetailJurisdiction" type="text" readonly class="form-control-plaintext" :value="programDetail.exam_body.jurisdiction" />
                </div>
              </div>
              <div class="row mb-2">
                <label class="col-form-label col-12 col-lg-3 fw-bold" for="examDetailNegative">Negative Marking:</label>
                <div class="col-12 col-lg-9">
                  <input
                    id="examDetailNegative"
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    :value="programDetail.has_negative_marking ? `Yes (${formatRatio(programDetail.negative_marks_ratio)} per wrong answer)` : 'No'"
                  />
                </div>
              </div>

              <fieldset class="border p-2 rounded mb-3">
                <legend class="float-none w-auto fs-6 fw-bold px-2 mb-0">Stages</legend>
                <ul class="list-group list-group-flush">
                  <li
                    v-for="stage in programDetail.exam_stages"
                    :key="stage.id"
                    class="list-group-item d-flex align-items-center px-1"
                  >
                    {{ stage.sequence_number }}. {{ stage.name }}
                    <span v-if="stage.is_qualifying" class="badge bg-light text-dark border ms-2">
                      Qualifying{{ stage.qualifying_pct ? ` · ${stage.qualifying_pct}%` : '' }}
                    </span>
                  </li>
                  <li v-if="!programDetail.exam_stages?.length" class="list-group-item text-muted px-1">
                    No stages yet. Add stages from the Edit Exam page.
                  </li>
                </ul>
              </fieldset>

              <fieldset class="border p-2 rounded mb-2">
                <legend class="float-none w-auto fs-6 fw-bold px-2 mb-0">Paper Patterns</legend>
                <ul class="list-group list-group-flush">
                  <li
                    v-for="template in programDetail.paper_templates"
                    :key="template.id"
                    class="list-group-item px-1"
                  >
                    <div>{{ template.name }}</div>
                    <small class="text-muted">
                      {{ template.total_questions }} questions · {{ template.total_marks }} marks ·
                      {{ template.duration_minutes }} min ·
                      {{ template.sections?.length ?? 0 }} section(s)
                    </small>
                  </li>
                  <li v-if="!programDetail.paper_templates?.length" class="list-group-item text-muted px-1">
                    No paper patterns yet. Teachers need at least one pattern to create mock tests.
                  </li>
                </ul>
              </fieldset>
            </template>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-dark" @click="goToSyllabus">
              <i class="bi bi-arrow-return-right"></i> Syllabus
            </button>
            <button type="button" class="btn btn-dark" @click="goToPatterns">
              <i class="bi bi-arrow-return-right"></i> Patterns
            </button>
            <button type="button" class="btn btn-dark" @click="goToEdit">
              Edit
            </button>
            <button
              type="button"
              class="btn btn-custom"
              @click="confirmDeleteProgram"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (destructive action — same as board delete) -->
    <div v-if="deleteTarget" class="modal d-block modal-overlay" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Exam</h5>
            <button type="button" class="btn-close" @click="deleteTarget = null"></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">
              Are you sure you want to delete "{{ deleteTarget.name }}"? This action cannot be undone.
              <span class="text-danger">
                All stages, syllabus, paper patterns and mock tests of this exam will also be deleted!
              </span>
            </p>
            <div class="form-group">
              <label for="confirmText" class="form-label">Type "sure" to confirm deletion:</label>
              <input
                type="text"
                class="form-control"
                id="confirmText"
                v-model="confirmationText"
                placeholder="Type 'sure' here"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" @click="deleteTarget = null">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              :disabled="confirmationText !== 'sure'"
              @click="executeDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <ToastNotification
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { examCatalogService } from '@/services/examCatalogService'
import type { ExamCategoryCode, ExamProgram } from '@/types/exam'
import { examSyllabusQueryString, programLabel } from '@/utils/examSyllabus'
import ToastNotification from '@/components/common/ToastNotification.vue'

const props = defineProps<{
  category: ExamCategoryCode
}>()

const router = useRouter()

const programs = ref<ExamProgram[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

const showInfoModal = ref(false)
const selectedProgram = ref<ExamProgram | null>(null)
const programDetail = ref<any>(null)

const deleteTarget = ref<{ id: number; name: string } | null>(null)
const confirmationText = ref('')

const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

const notify = (type: 'success' | 'error', message: string) => {
  toastTitle.value = type === 'success' ? 'Success' : 'Error'
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const filteredPrograms = computed(() => {
  if (!searchQuery.value.trim()) return programs.value
  const query = searchQuery.value.toLowerCase()
  return programs.value.filter(
    program =>
      program.name.toLowerCase().includes(query) ||
      (program.exam_body?.abbreviation ?? '').toLowerCase().includes(query) ||
      (program.exam_body?.name ?? '').toLowerCase().includes(query)
  )
})

function formatRatio(ratio?: number) {
  if (!ratio) return ''
  if (Math.abs(ratio - 1 / 3) < 0.01) return '1/3 mark'
  if (Math.abs(ratio - 0.25) < 0.01) return '1/4 mark'
  return `${ratio} mark`
}

async function loadPrograms() {
  isLoading.value = true
  try {
    programs.value = await examCatalogService.getPrograms({ category: props.category })
  } catch (error) {
    console.error('Error loading exams:', error)
    notify('error', 'Failed to load exams')
  } finally {
    isLoading.value = false
  }
}

function goToSyllabus() {
  if (!selectedProgram.value) return
  const scope: ExamCategoryCode =
    selectedProgram.value.exam_body?.exam_category?.code === 'ENTRANCE' ? 'ENTRANCE' : 'COMPETITIVE'
  router.push({
    name: 'examSyllabusSubjects',
    params: { programId: String(selectedProgram.value.id) },
    query: examSyllabusQueryString({
      programId: selectedProgram.value.id,
      scope,
      programName: programLabel(selectedProgram.value),
    }),
  })
}

function goToPatterns() {
  if (!selectedProgram.value) return
  router.push({
    name: 'patternDashboard',
    query: { scope: 'exam', examProgramId: String(selectedProgram.value.id) },
  })
}

function goToEdit() {
  if (!selectedProgram.value) return
  router.push({ name: 'editExam', params: { id: String(selectedProgram.value.id) } })
}

async function showProgramInfo(program: ExamProgram) {
  selectedProgram.value = program
  programDetail.value = null
  showInfoModal.value = true
  try {
    programDetail.value = await examCatalogService.getProgram(program.id)
  } catch (error) {
    console.error('Error loading exam details:', error)
    notify('error', 'Failed to load exam details')
    showInfoModal.value = false
  }
}

function closeInfoModal() {
  showInfoModal.value = false
  selectedProgram.value = null
  programDetail.value = null
}

function confirmDeleteProgram() {
  if (!selectedProgram.value) return
  confirmationText.value = ''
  deleteTarget.value = { id: selectedProgram.value.id, name: selectedProgram.value.name }
}

async function executeDelete() {
  if (!deleteTarget.value) return
  const { id, name } = deleteTarget.value
  try {
    await examCatalogService.deleteProgram(id)
    deleteTarget.value = null
    closeInfoModal()
    notify('success', `Exam "${name}" deleted`)
    await loadPrograms()
  } catch (error: any) {
    console.error('Error deleting:', error)
    notify('error', error?.response?.data?.message ?? 'Delete failed — it may have linked data')
  }
}

onMounted(() => {
  loadPrograms()
})

watch(
  () => props.category,
  () => {
    searchQuery.value = ''
    loadPrograms()
  }
)
</script>

<style scoped>
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
}

.manage-icon {
  cursor: pointer;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-input {
  padding-left: 40px;
  padding-right: 40px;
  height: 48px;
  border-radius: 6px;
}

.clear-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 11;
}

.btn-custom {
  border: 1px solid gray;
  background-color: #f8f9fa;
  color: black;
}

.btn-custom:hover {
  border: 1px solid #dc3545;
  background-color: #dc3545;
  color: white;
}

@media (max-width: 576px) {
  .btn-custom {
    background-color: #dc3545 !important;
    color: white !important;
  }
}
</style>
