<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">SYLLABUS MANAGEMENT</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Scope: school board / entrance / competitive -->
    <div class="row p-2 justify-content-center mb-2">
      <div class="col-12 col-sm-10 col-md-10">
        <ul class="nav nav-tabs category-tabs">
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: syllabusScope === 'board' }"
              @click="setSyllabusScope('board')"
            >
              School Board
            </button>
          </li>
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: syllabusScope === 'ENTRANCE' }"
              @click="setSyllabusScope('ENTRANCE')"
            >
              Entrance Exams
            </button>
          </li>
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: syllabusScope === 'COMPETITIVE' }"
              @click="setSyllabusScope('COMPETITIVE')"
            >
              Competitive Exams
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Form Section -->
    <div class="row gy-2 g-3 justify-content-center">
      <form v-if="syllabusScope === 'board'" @submit.prevent="handleSubmit" id="viewSyllabusForm">
        <div class="row gy-2 justify-content-center">
          <!-- Board Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterBoard"
                label="Board"
                placeholder="Search for Board"
                :items="boards"
                v-model="selectedBoard"
                :search-keys="['name', 'abbreviation']"
                :class="{
                  'is-invalid': !validationStates.board.valid && validationStates.board.touched,
                  'is-valid': validationStates.board.valid && validationStates.board.touched,
                }"
                required
                @change="handleBoardChange"
                @update:modelValue="handleBoardInput"
                next-field-id="filterMedium"
              >
                <template #label> Board <span class="text-danger">*</span> </template>
              </SearchableDropdown>
              <div
                class="invalid-feedback"
                v-if="!validationStates.board.valid && validationStates.board.touched"
              >
                Please select a board
              </div>
            </div>
          </div>

          <!-- Medium Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterMedium"
                label="Medium"
                placeholder="Search for Medium"
                :items="boardMediums"
                v-model="selectedMedium"
                label-key="instruction_medium"
                :search-keys="['instruction_medium']"
                :disabled="!selectedBoard"
                :class="{
                  'is-invalid': !validationStates.medium.valid && validationStates.medium.touched,
                  'is-valid': validationStates.medium.valid && validationStates.medium.touched,
                }"
                required
                @change="handleMediumChange"
                @update:modelValue="handleMediumInput"
                next-field-id="filterStandard"
              >
                <template #label> Medium <span class="text-danger">*</span> </template>
              </SearchableDropdown>
              <div
                class="invalid-feedback"
                v-if="!validationStates.medium.valid && validationStates.medium.touched"
              >
                Please select a medium
              </div>
            </div>
          </div>

          <!-- Standard Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterStandard"
                label="Standard"
                placeholder="Search for Standard"
                :items="boardStandards"
                v-model="selectedStandard"
                :disabled="!selectedBoard"
                :class="{
                  'is-invalid':
                    !validationStates.standard.valid && validationStates.standard.touched,
                  'is-valid': validationStates.standard.valid && validationStates.standard.touched,
                }"
                required
                @change="handleStandardChange"
                @update:modelValue="handleStandardInput"
                next-field-id="viewSyllabusBtn"
              >
                <template #label> Standard <span class="text-danger">*</span> </template>
                <template #item="{ item }">Standard {{ item.name }}</template>
              </SearchableDropdown>
              <div
                class="invalid-feedback"
                v-if="!validationStates.standard.valid && validationStates.standard.touched"
              >
                Please select a standard
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewSyllabusBtn"
              :disabled="!isFormValid"
            >
              Manage Syllabus
            </button>
          </div>
        </div>
      </form>

      <form v-else-if="isExamScope" @submit.prevent="handleExamSubmit" id="viewExamSyllabusForm">
        <div class="row gy-2 justify-content-center">
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterExamProgram"
                label="Exam"
                :placeholder="examSearchPlaceholder"
                :items="filteredExamPrograms"
                v-model="selectedExamProgram"
                :search-keys="['name', 'label']"
                label-key="label"
                required
                @change="handleExamProgramChange"
              >
                <template #label> Exam Program <span class="text-danger">*</span> </template>
                <template #item="{ item }">
                  {{ item.label }}
                </template>
              </SearchableDropdown>
            </div>
          </div>
          <div v-if="examStages.length" class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <label class="form-label fw-bold" for="filterExamStage">Stage <span class="text-danger">*</span></label>
              <select
                id="filterExamStage"
                v-model="selectedExamStageId"
                class="form-select"
                required
              >
                <option :value="null" disabled>Select stage</option>
                <option v-for="stage in examStages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
              </select>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <button
              type="submit"
              class="btn btn-dark mt-3"
              :disabled="!selectedExamProgram || (examStages.length > 0 && !selectedExamStageId)"
            >
              Manage Syllabus
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'
import { examCatalogService } from '@/services/examCatalogService'
import type { ExamCategoryCode, ExamProgram, ExamStage } from '@/types/exam'
import { examSyllabusQueryString } from '@/utils/examSyllabus'
import { boardSyllabusQueryString } from '@/utils/boardSyllabus'

type SyllabusScope = 'board' | ExamCategoryCode

interface Board {
  id: number
  name: string
  abbreviation: string
}

interface InstructionMedium {
  id: number
  board_id: number
  instruction_medium: string
}

interface Standard {
  id: number
  board_id: number
  name: string
}

interface BoardDetails extends Board {
  instruction_mediums: InstructionMedium[]
  standards: Standard[]
}

// Update Item interface to match SearchableDropdown's interface
interface Item {
  id?: number | string
  [key: string]: unknown
}

const router = useRouter()
const route = useRoute()

const syllabusScope = ref<SyllabusScope>('board')
const allExamPrograms = ref<Array<ExamProgram & { label: string }>>([])
const selectedExamProgram = ref<(ExamProgram & { label: string }) | null>(null)
const examStages = ref<ExamStage[]>([])
const selectedExamStageId = ref<number | null>(null)

// Form data
const selectedBoard = ref<BoardDetails | null>(null)
const selectedMedium = ref<InstructionMedium | null>(null)
const selectedStandard = ref<Standard | null>(null)

// Validation states
const validationStates = ref({
  board: { valid: false, touched: false },
  medium: { valid: false, touched: false },
  standard: { valid: false, touched: false },
})

// Data lists
const boards = ref<Board[]>([])
const boardMediums = computed(() => selectedBoard.value?.instruction_mediums ?? [])
const boardStandards = computed(() => selectedBoard.value?.standards ?? [])

const isExamScope = computed(() => syllabusScope.value === 'ENTRANCE' || syllabusScope.value === 'COMPETITIVE')

const filteredExamPrograms = computed(() =>
  allExamPrograms.value.filter(
    (program) => program.exam_body?.exam_category?.code === syllabusScope.value,
  ),
)

const examSearchPlaceholder = computed(() =>
  syllabusScope.value === 'ENTRANCE'
    ? 'Search entrance exam (JEE, NEET...)'
    : 'Search competitive exam (UPSC, SSC...)',
)

// Computed
const isFormValid = computed(() => {
  return (
    validationStates.value.board.valid &&
    validationStates.value.medium.valid &&
    validationStates.value.standard.valid
  )
})

function setSyllabusScope(scope: SyllabusScope) {
  syllabusScope.value = scope
  if (scope !== 'board') {
    if (selectedExamProgram.value?.exam_body?.exam_category?.code !== scope) {
      selectedExamProgram.value = null
      selectedExamStageId.value = null
      examStages.value = []
    }
  }
  router.replace({ query: { scope } })
}

function resolveExamScope(program?: ExamProgram | null): ExamCategoryCode {
  const category = program?.exam_body?.exam_category?.code
  return category === 'ENTRANCE' || category === 'COMPETITIVE' ? category : 'COMPETITIVE'
}

// Input handlers
const handleBoardInput = (value: unknown) => {
  validationStates.value.board.touched = true
  validationStates.value.board.valid = value !== null
}

const handleMediumInput = (value: unknown) => {
  validationStates.value.medium.touched = true
  validationStates.value.medium.valid = value !== null
}

const handleStandardInput = (value: unknown) => {
  validationStates.value.standard.touched = true
  validationStates.value.standard.valid = value !== null
}

// Fetch boards on component mount
onMounted(async () => {
  try {
    const response = await axiosInstance.get('/boards')
    if (response.data?.data) {
      boards.value = response.data.data
    } else {
      boards.value = response.data
    }
  } catch (error) {
    console.error('Error fetching boards:', error)
    boards.value = []
  }

  try {
    const [entrance, competitive] = await Promise.all([
      examCatalogService.getPrograms({ category: 'ENTRANCE' }),
      examCatalogService.getPrograms({ category: 'COMPETITIVE' }),
    ])
    allExamPrograms.value = [...entrance, ...competitive].map((program) => ({
      ...program,
      label: `${program.exam_body?.abbreviation ?? ''} — ${program.name}`.trim(),
    }))
  } catch (error) {
    console.error('Error fetching exam programs:', error)
    allExamPrograms.value = []
  }

  const programId = route.query.programId
  const scope = route.query.scope as string | undefined
  if (scope === 'ENTRANCE' || scope === 'COMPETITIVE') {
    syllabusScope.value = scope
  } else if (scope === 'board') {
    syllabusScope.value = 'board'
  }

  if (scope === 'exam' || programId) {
    const match = allExamPrograms.value.find((p) => String(p.id) === String(programId))
    if (match) {
      syllabusScope.value = resolveExamScope(match)
      selectedExamProgram.value = match
      await loadExamStages(match.id)
    } else if (scope === 'exam') {
      syllabusScope.value = 'COMPETITIVE'
    }
    const stageId = route.query.stageId
    if (stageId) {
      selectedExamStageId.value = Number(stageId)
    }
  }
})

// Selection handlers
const handleBoardChange = async (board: Item | null) => {
  try {
    // Reset dependent selections and validation states
    selectedMedium.value = null
    selectedStandard.value = null
    validationStates.value.medium.valid = false
    validationStates.value.medium.touched = false
    validationStates.value.standard.valid = false
    validationStates.value.standard.touched = false

    if (!board?.id) return

    // Fetch board details
    const response = await axiosInstance.get(`/boards/${board.id}`)

    // Check if the response has the new format with pagination
    if (response.data?.data) {
      // New format with pagination - use the first item in the data array
      if (response.data.data.length > 0) {
        selectedBoard.value = response.data.data[0]
      } else {
        selectedBoard.value = null
      }
    } else {
      // Old format (direct object)
      selectedBoard.value = response.data
    }
  } catch (error) {
    console.error('Error fetching board details:', error)
    selectedBoard.value = null
  }
}

const handleMediumChange = (medium: Item | null) => {
  selectedMedium.value = medium as InstructionMedium | null
  selectedStandard.value = null
  validationStates.value.standard.valid = false
  validationStates.value.standard.touched = false
}

const handleStandardChange = (standard: Item | null) => {
  selectedStandard.value = standard as Standard | null
}

// Form submission handler
const handleSubmit = () => {
  // Mark all fields as touched
  for (const key of Object.keys(validationStates.value)) {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  }

  if (!isFormValid.value) {
    return
  }

  if (selectedBoard.value && selectedMedium.value && selectedStandard.value) {
    router.push({
      name: 'syllabusStandard',
      query: boardSyllabusQueryString({
        board: selectedBoard.value.id,
        medium: selectedMedium.value.id,
        standard: selectedStandard.value.id,
        boardName: selectedBoard.value.name,
        mediumName: selectedMedium.value.instruction_medium,
        standardName: selectedStandard.value.name,
      }),
    })
  }
}

const handleExamProgramChange = async (program: Item | null) => {
  selectedExamStageId.value = null
  examStages.value = []
  if (program?.id) {
    await loadExamStages(Number(program.id))
    if (examStages.value.length === 1) {
      selectedExamStageId.value = examStages.value[0].id
    }
  }
}

async function loadExamStages(programId: number) {
  try {
    examStages.value = await examCatalogService.getStages(programId)
  } catch {
    examStages.value = []
  }
}

const handleExamSubmit = () => {
  if (!selectedExamProgram.value) return
  const stage = examStages.value.find((s) => s.id === selectedExamStageId.value)
  const query = examSyllabusQueryString({
    programId: selectedExamProgram.value.id,
    scope: syllabusScope.value as ExamCategoryCode,
    programName: selectedExamProgram.value.label,
    stageId: selectedExamStageId.value,
    stageName: stage?.name ?? null,
  })
  router.push({
    name: 'examSyllabusSubjects',
    params: { programId: String(selectedExamProgram.value.id) },
    query,
  })
}
</script>

<style scoped>
.category-tabs {
  border-bottom: 2px solid #dee2e6;
}

.category-tabs .nav-link {
  color: #495057;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.5rem 1rem;
  font-weight: 500;
  background: transparent;
}

.category-tabs .nav-link:hover {
  color: #212529;
  border-bottom-color: #adb5bd;
}

.category-tabs .nav-link.active {
  color: #212529;
  font-weight: 600;
  border-bottom-color: #212529;
  background: transparent;
}

/* Default styles for screens above 576px */
.dynamic-style {
  position: static;
  background-color: transparent;
  box-shadow: none;
  width: auto;
}

/* Styles for screens below 576px */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
  }

  #viewSyllabusBtn {
    width: 100% !important;
  }
}

/* Mobile styles for nav link */
@media (max-width: 768px) {
  #navSyllabus {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

/* Button styling */
.btn-dark {
  transition: all 0.3s ease;
}

.btn-dark:hover {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Form validation styles */
.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}
</style>
