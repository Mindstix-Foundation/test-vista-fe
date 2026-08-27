<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10 d-flex justify-content-between align-items-center">
          <h5 class="text-left fw-bolder text-uppercase m-0">Create {{ categoryTitle }} Mock Test</h5>
          <button class="btn btn-outline-dark btn-sm" @click="goBack">
            <i class="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>
      </div>
      <hr />
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <form id="createMockTestForm" @submit.prevent="createMock">
        <div class="row gy-2 justify-content-center">
          <!-- Exam Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="mockExam"
                label="Exam"
                placeholder="Search for Exam"
                :items="programItems"
                v-model="selectedProgramItem"
                :search-keys="['name', 'abbreviation']"
                required
                @change="handleProgramChange"
                next-field-id="mockStage"
              >
                <template #label>Exam <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>

          <!-- Stage Selection -->
          <div class="col-12 col-sm-10 col-md-8" v-if="stageItems.length > 0">
            <div class="mb-3">
              <SearchableDropdown
                id="mockStage"
                label="Stage / Paper"
                placeholder="Search for Stage"
                :items="stageItems"
                v-model="selectedStageItem"
                :search-keys="['name']"
                :disabled="!selectedProgramItem"
                @change="handleStageChange"
                next-field-id="mockTemplate"
              >
                <template #label>Stage / Paper</template>
              </SearchableDropdown>
            </div>
          </div>

          <!-- Template Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="mockTemplate"
                label="Paper Pattern"
                placeholder="Search for Paper Pattern"
                :items="templateItems"
                v-model="selectedTemplateItem"
                :search-keys="['name']"
                :disabled="!selectedProgramItem"
                required
                @change="handleTemplateChange"
              >
                <template #label>Paper Pattern <span class="text-danger">*</span></template>
              </SearchableDropdown>
              <div v-if="selectedProgramItem && templateItems.length === 0 && !isLoading" class="form-text text-danger">
                No paper patterns available for this selection. Ask an admin to add one in the Exam Catalog.
              </div>
            </div>
          </div>

          <!-- Selected Pattern Summary -->
          <div class="col-12 col-sm-10 col-md-8" v-if="selectedTemplate">
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">Pattern Summary</h6>
              </div>
              <div class="card-body">
                <div class="row text-center mb-3">
                  <div class="col-3">
                    <div class="fw-bold">{{ selectedTemplate.total_questions }}</div>
                    <small class="text-muted">Questions</small>
                  </div>
                  <div class="col-3">
                    <div class="fw-bold">{{ selectedTemplate.total_marks }}</div>
                    <small class="text-muted">Marks</small>
                  </div>
                  <div class="col-3">
                    <div class="fw-bold">{{ selectedTemplate.duration_minutes }}</div>
                    <small class="text-muted">Minutes</small>
                  </div>
                  <div class="col-3">
                    <div class="fw-bold">{{ selectedTemplate.negative_marking ? `-${selectedTemplate.negative_marks_ratio}` : 'No' }}</div>
                    <small class="text-muted">Negative</small>
                  </div>
                </div>
                <div class="table-responsive">
                  <table class="table table-sm table-striped mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Section</th>
                        <th class="text-center">Questions</th>
                        <th class="text-center">Marks/Q</th>
                        <th class="text-center">Type</th>
                        <th class="text-center">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="section in selectedTemplate.sections" :key="section.id">
                        <td>{{ section.name }}</td>
                        <td class="text-center">{{ section.total_questions }}</td>
                        <td class="text-center">{{ section.marks_per_question }}</td>
                        <td class="text-center">{{ section.answer_format === 'NUMERIC' ? 'Numerical' : 'MCQ' }}</td>
                        <td class="text-center">{{ section.time_limit_minutes ? `${section.time_limit_minutes} min` : '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Details -->
          <div class="col-12 col-sm-10 col-md-8" v-if="selectedTemplate">
            <div class="mb-3">
              <div class="form-floating">
                <input
                  type="text"
                  class="form-control"
                  id="mockName"
                  v-model="mockName"
                  :placeholder="defaultMockName"
                  maxlength="100"
                  required
                />
                <label for="mockName">Test Name <span class="text-danger">*</span></label>
              </div>
            </div>
            <div class="mb-3">
              <div class="form-floating">
                <textarea
                  class="form-control"
                  id="mockInstructions"
                  v-model="mockInstructions"
                  placeholder="Additional instructions"
                  style="height: 90px"
                ></textarea>
                <label for="mockInstructions">Additional Instructions (optional)</label>
              </div>
            </div>
            <div class="form-check mb-2">
              <input v-model="randomizeQuestions" class="form-check-input" type="checkbox" id="randQ" />
              <label class="form-check-label" for="randQ">Randomize question order</label>
            </div>
            <div class="form-check mb-2">
              <input v-model="randomizeOptions" class="form-check-input" type="checkbox" id="randO" />
              <label class="form-check-label" for="randO">Randomize options</label>
            </div>
          </div>

          <div class="col-12 col-sm-10 col-md-8 text-end" v-if="selectedTemplate">
            <button
              type="submit"
              class="btn btn-dark mt-3"
              :disabled="!mockName.trim() || isLoading"
            >
              <output v-if="isLoading" class="spinner-border spinner-border-sm me-2"></output>
              Create Mock Test
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Toast Notification for status messages -->
    <ToastNotification
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import ToastNotification from '@/components/common/ToastNotification.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import { examCatalogService } from '@/services/examCatalogService'
import type { ExamCategoryCode, ExamProgram, ExamStage, PaperTemplate } from '@/types/exam'

defineOptions({
  name: 'CreateMockTest'
})

const router = useRouter()
const route = useRoute()

const category = computed<ExamCategoryCode>(() =>
  route.query.category === 'ENTRANCE' ? 'ENTRANCE' : 'COMPETITIVE'
)
const categoryTitle = computed(() =>
  category.value === 'ENTRANCE' ? 'Entrance Exam' : 'Competitive Exam'
)

// Dropdown item wrappers (SearchableDropdown expects { id, name })
interface ProgramItem { id: number; name: string; abbreviation: string; original: ExamProgram }
interface StageItem { id: number; name: string; original: ExamStage }
interface TemplateItem { id: number; name: string; original: PaperTemplate }

const programItems = ref<ProgramItem[]>([])
const stageItems = ref<StageItem[]>([])
const templateItems = ref<TemplateItem[]>([])

const selectedProgramItem = ref<ProgramItem | null>(null)
const selectedStageItem = ref<StageItem | null>(null)
const selectedTemplateItem = ref<TemplateItem | null>(null)

const selectedTemplate = computed<PaperTemplate | null>(
  () => selectedTemplateItem.value?.original ?? null
)

const mockName = ref('')
const mockInstructions = ref('')
const randomizeQuestions = ref(true)
const randomizeOptions = ref(true)
const isLoading = ref(false)

const defaultMockName = computed(() =>
  selectedTemplate.value ? `${selectedTemplate.value.name} — Mock` : 'e.g. UPSC Prelims GS Mock 1'
)

// Toast state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

const showErrorToast = (message: string) => {
  toastTitle.value = 'Error'
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
}

const showSuccessToast = (message: string) => {
  toastTitle.value = 'Success'
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
}

const closeToast = () => {
  showToast.value = false
}

const goBack = () => {
  router.push({ name: 'assignOnlineTest' })
}

const fetchPrograms = async () => {
  try {
    isLoading.value = true
    const programs = await examCatalogService.getPrograms({ category: category.value })
    programItems.value = programs.map(program => ({
      id: program.id,
      name: `${program.exam_body?.abbreviation ?? ''} — ${program.name}`,
      abbreviation: program.exam_body?.abbreviation ?? '',
      original: program
    }))
  } catch (error) {
    console.error('Error loading exams:', error)
    showErrorToast('Failed to load exams. Please refresh the page.')
  } finally {
    isLoading.value = false
  }
}

const handleProgramChange = async () => {
  selectedStageItem.value = null
  selectedTemplateItem.value = null
  stageItems.value = []
  templateItems.value = []
  if (!selectedProgramItem.value) return

  try {
    isLoading.value = true
    const stages = await examCatalogService.getStages(selectedProgramItem.value.id)
    stageItems.value = stages.map(stage => ({
      id: stage.id,
      name: stage.is_qualifying ? `${stage.name} (qualifying)` : stage.name,
      original: stage
    }))
    await loadTemplates()
  } catch (error) {
    console.error('Error loading stages:', error)
    showErrorToast('Failed to load exam stages')
  } finally {
    isLoading.value = false
  }
}

const handleStageChange = async () => {
  selectedTemplateItem.value = null
  await loadTemplates()
}

const loadTemplates = async () => {
  if (!selectedProgramItem.value) return
  try {
    isLoading.value = true
    const templates = await examCatalogService.filterTemplates({
      exam_program_id: selectedProgramItem.value.id,
      exam_stage_id: selectedStageItem.value?.id
    })
    templateItems.value = templates.map(template => ({
      id: template.id,
      name: `${template.name} (${template.total_marks} marks)`,
      original: template
    }))
  } catch (error) {
    console.error('Error loading paper patterns:', error)
    showErrorToast('Failed to load paper patterns')
  } finally {
    isLoading.value = false
  }
}

const handleTemplateChange = () => {
  if (selectedTemplate.value && !mockName.value.trim()) {
    mockName.value = `${selectedTemplate.value.name} — Mock`
  }
}

const createMock = async () => {
  if (!selectedTemplate.value || !mockName.value.trim()) {
    showErrorToast('Please select a paper pattern and enter a test name')
    return
  }

  try {
    isLoading.value = true
    await axiosInstance.post('/paper-templates/create-mock-test', {
      paper_template_id: selectedTemplate.value.id,
      name: mockName.value.trim(),
      instructions: mockInstructions.value.trim() || undefined,
      randomize_questions: randomizeQuestions.value,
      randomize_options: randomizeOptions.value,
    })

    showSuccessToast('Mock test created — assign it to enrolled aspirants from the dashboard.')
    // Return to the dashboard with the matching category tab active
    localStorage.setItem('assignTestActiveCategory', category.value)
    setTimeout(() => {
      router.push({ name: 'assignOnlineTest' })
    }, 1200)
  } catch (error: any) {
    console.error('Error creating mock test:', error)
    const apiMsg = error?.response?.data?.message
    const message = Array.isArray(apiMsg) ? apiMsg.join(' ') : (apiMsg ?? 'Failed to create mock test')
    showErrorToast(message)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPrograms)
</script>

<style scoped>
/* Styling the card — matches the board Create Test page */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.btn-dark {
  min-width: 150px;
  transition: all 0.3s ease;
}

.btn-dark:hover:not(:disabled):not(.disabled) {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled,
.btn-dark.disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}

.form-check-input:checked {
  background-color: #212529;
  border-color: #212529;
}

.form-check {
  padding-left: 1.8rem;
  margin-bottom: 0.5rem;
}

.form-check-input {
  width: 1.2rem;
  height: 1.2rem;
  margin-top: 0.2rem;
  margin-left: -1.8rem;
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  font-weight: 500;
  padding-top: 0.1rem;
}

@media (max-width: 768px) {
  h5 {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
  }

  .btn-dark {
    min-width: 140px;
  }

  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 576px) {
  .btn-dark {
    width: 100%;
    min-width: auto;
  }
}
</style>
