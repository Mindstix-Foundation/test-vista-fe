<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">Syllabus Dashboard</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <form id="viewSyllabusForm" @submit.prevent="viewSyllabus">
        <div class="row gy-2 justify-content-center">
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Board Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterBoard"
                label="Board"
                placeholder="Search for Board"
                :items="boards"
                v-model="selectedBoardObj"
                :search-keys="['name', 'abbreviation']"
                required
                @change="handleBoardChange"
                next-field-id="filterMedium"
              >
                <template #label>Board <span class="text-danger">*</span></template>
                <template #item="{ item }">
                  {{ item.name }} ({{ item.abbreviation }})
                </template>
              </SearchableDropdown>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Instruction Medium Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterMedium"
                label="Instruction Medium"
                placeholder="Search for Instruction Medium"
                :items="instructionMediums"
                v-model="selectedMediumObj"
                :search-keys="['instruction_medium']"
                :disabled="!selectedBoardObj"
                required
                @change="handleMediumChange"
                next-field-id="filterClass"
                label-key="instruction_medium"
              >
                <template #label>Instruction Medium <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Class Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterClass"
                label="Standard"
                placeholder="Search for Standard"
                :items="standards"
                v-model="selectedStandardObj"
                :search-keys="['name', 'sequence_number']"
                :disabled="!selectedMediumObj"
                required
                @change="handleStandardChange"
                next-field-id="filterSubject"
              >
                <template #label>Standard <span class="text-danger">*</span></template>
                <template #item="{ item }">
                  {{ item.name }} 
                </template>
              </SearchableDropdown>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Subject Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterSubject"
                label="Subject"
                placeholder="Search for Subject"
                :items="subjects"
                v-model="selectedSubjectObj"
                :search-keys="['subject_name']"
                :disabled="!selectedStandardObj"
                required
                label-key="subject_name"
                item-key="subject_id"
              >
                <template #label>Subject <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <!-- View Syllabus Button -->
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewSyllabusBtn"
              :disabled="!isFormValid || isLoading"
            >
              <output v-if="isLoading" class="spinner-border spinner-border-sm me-2"></output>
              View Syllabus
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
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import ToastNotification from '@/components/common/ToastNotification.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import { VALIDATION_MESSAGES } from '@/utils/validationConstants'

// Define component name (for linter)
defineOptions({
  name: 'ViewSyllabusDashboard'
})

// Initialize router at the top level of setup
const router = useRouter()

// Define interfaces for our data types
interface BoardItem {
  id: number;
  name: string;
  abbreviation: string;
}

interface InstructionMediumItem {
  id: number;
  board_id: number;
  instruction_medium: string;
  created_at: string;
  updated_at: string;
}

interface StandardItem {
  id: number;
  board_id: number;
  name: string;
  sequence_number: number;
  created_at: string;
  updated_at: string;
}

interface SubjectItem {
  subject_id: number;
  subject_name: string;
}

// Selected objects (not just IDs)
const selectedBoardObj = ref<BoardItem | null>(null)
const selectedMediumObj = ref<InstructionMediumItem | null>(null)
const selectedStandardObj = ref<StandardItem | null>(null)
const selectedSubjectObj = ref<SubjectItem | null>(null)

// Computed values for form values
const selectedBoard = computed(() => selectedBoardObj.value?.id?.toString() ?? '')
const selectedInstructionMedium = computed(() => selectedMediumObj.value?.id?.toString() ?? '')
const selectedStandard = computed(() => selectedStandardObj.value?.id?.toString() ?? '')
const selectedSubject = computed(() => selectedSubjectObj.value?.subject_id?.toString() ?? '')

// Options for dropdowns
const boards = ref<BoardItem[]>([])
const instructionMediums = ref<InstructionMediumItem[]>([])
const standards = ref<StandardItem[]>([])
const subjects = ref<SubjectItem[]>([])

// Form validation
const isFormValid = computed(() => {
  return (
    selectedBoardObj.value !== null &&
    selectedMediumObj.value !== null &&
    selectedStandardObj.value !== null &&
    selectedSubjectObj.value !== null
  )
})

// Loading state
const isLoading = ref(false)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Handlers for dropdown changes
const handleBoardChange = async () => {
  if (!selectedBoardObj.value) {
    resetDependentFields('board')
    return
  }
  
  try {
    isLoading.value = true
    // Fetch instruction mediums from API
    const response = await axiosInstance.get(`/instruction-mediums/board/${selectedBoard.value}`)
    instructionMediums.value = response.data
    
    resetDependentFields('board')
  } catch (error) {
    showErrorToast('Failed to load instruction mediums')
    console.error('Error loading instruction mediums:', error)
  } finally {
    isLoading.value = false
  }
}

const handleMediumChange = async () => {
  if (!selectedMediumObj.value) {
    resetDependentFields('medium')
    return
  }
  
  try {
    isLoading.value = true
    // Fetch standards from API for the selected board
    const response = await axiosInstance.get(`/standards/board/${selectedBoard.value}`)
    standards.value = response.data
    
    resetDependentFields('medium')
  } catch (error) {
    showErrorToast('Failed to load standards')
    console.error('Error loading standards:', error)
  } finally {
    isLoading.value = false
  }
}

const handleStandardChange = async () => {
  if (!selectedStandardObj.value) {
    resetDependentFields('standard')
    return
  }
  
  try {
    isLoading.value = true
    // Fetch subjects using the API for the selected medium and standard
    const response = await axiosInstance.get(
      `/medium-standard-subjects/medium/${selectedInstructionMedium.value}/standard/${selectedStandard.value}`,
      {
        params: {
          board_id: selectedBoard.value
        }
      }
    )
    subjects.value = response.data
    
    resetDependentFields('standard')
  } catch (error) {
    showErrorToast('Failed to load subjects')
    console.error('Error loading subjects:', error)
  } finally {
    isLoading.value = false
  }
}

// View syllabus function
const viewSyllabus = async () => {
  if (!isFormValid.value) {
    showErrorToast(VALIDATION_MESSAGES.FORM.FILL_ALL_REQUIRED)
    return
  }
  
  try {
    isLoading.value = true
    
    // Set syllabus details with both display names and IDs
    const queryParams = {
      // Display names for UI
      board: encodeURIComponent(selectedBoardObj.value ? `${selectedBoardObj.value.name} (${selectedBoardObj.value.abbreviation})` : ''),
      medium: encodeURIComponent(selectedMediumObj.value?.instruction_medium ?? ''),
      standard: encodeURIComponent(selectedStandardObj.value?.name ?? ''),
      subject: encodeURIComponent(selectedSubjectObj.value?.subject_name ?? ''),
      
      // IDs for API calls
      boardId: selectedBoardObj.value?.id.toString() ?? '',
      mediumId: selectedMediumObj.value?.id.toString() ?? '',
      standardId: selectedStandardObj.value?.id.toString() ?? '',
      subjectId: selectedSubjectObj.value?.subject_id.toString() ?? ''
    }
    
    // Navigate to the detailed view page with query parameters
    router.push({
      name: 'viewSyllabusDetail',
      query: queryParams
    })
    
    showSuccessToast('Navigating to syllabus view')
  } catch (error) {
    showErrorToast('Failed to load syllabus')
    console.error('Error loading syllabus:', error)
  } finally {
    isLoading.value = false
  }
}

// Reset dependent fields based on starting point
const resetDependentFields = (startingField: 'board' | 'medium' | 'standard'): void => {
  if (startingField === 'board') {
    selectedMediumObj.value = null
    selectedStandardObj.value = null
    selectedSubjectObj.value = null
    standards.value = []
    subjects.value = []
  } else if (startingField === 'medium') {
    selectedStandardObj.value = null
    selectedSubjectObj.value = null
    subjects.value = []
  } else if (startingField === 'standard') {
    selectedSubjectObj.value = null
  }
}

// Toast notification functions
const showSuccessToast = (message: string): void => {
  toastTitle.value = 'Success'
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
}

const showErrorToast = (message: string): void => {
  toastTitle.value = 'Error'
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
}

const closeToast = (): void => {
  showToast.value = false
}

// Load initial data
onMounted(async () => {
  try {
    // Fetch boards from API
    const response = await axiosInstance.get('/boards')
    boards.value = response.data?.data ?? []
  } catch (error) {
    console.error('Error loading boards:', error)
    showErrorToast('Failed to load boards. Please refresh the page and try again.')
  }
})
</script>

<style scoped>
/* Styling the card */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

/* Button styles */
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

/* Responsive styles to match TeacherProfile.vue */
@media (max-width: 768px) {
  /* Font size adjustments to match TeacherProfile.vue */
  h5 {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
  }
  
  /* Improve form spacing */
  .mb-3 {
    margin-bottom: 1rem !important;
  }
  
  /* Button sizing */
  .btn-dark {
    min-width: 140px;
  }
  
  /* Form layout adjustments */
  form .row {
    margin-left: 0;
    margin-right: 0;
  }
  
  /* Container padding for better small screen layout */
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 576px) {
  /* Phone-specific adjustments to match TeacherProfile.vue */
  h5 {
    font-size: 1.15rem !important;
  }
  
  /* Form element spacing */
  .mb-3 {
    margin-bottom: 0.8rem !important;
  }
  
  /* Button full width on mobile */
  .btn-dark {
    width: 100%;
    min-width: auto;
  }
  
  /* Container padding adjustments for phones */
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  /* Better field spacing on small screens */
  form .col-12 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style> 