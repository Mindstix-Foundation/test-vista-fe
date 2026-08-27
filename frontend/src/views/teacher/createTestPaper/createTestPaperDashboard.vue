<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">Create Test Paper (PDF / Offline)</h5>
        </div>
      </div>
      <hr />
    </div>

    <div class="row justify-content-center mb-3">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="alert alert-info mb-0 small">
          For <strong>UPSC / competitive mocks</strong>, use
          <router-link :to="{ name: 'createMockTest' }">
            Assign Online Test → Competitive → Create Mock
          </router-link>
          instead of this board PDF flow.
        </div>
      </div>
    </div>

    <div class="row justify-content-center mb-3">
      <div class="col-12 col-sm-10 col-md-8">
        <ol class="wizard-steps list-unstyled d-flex flex-wrap gap-2 mb-0 small">
          <li :class="{ active: wizardStep >= 1, done: wizardStep > 1 }">1. Medium</li>
          <li :class="{ active: wizardStep >= 2, done: wizardStep > 2 }">2. Standard</li>
          <li :class="{ active: wizardStep >= 3, done: wizardStep > 3 }">3. Subject</li>
          <li :class="{ active: wizardStep >= 4, done: wizardStep > 4 }">4. Chapters</li>
          <li :class="{ active: wizardStep >= 5 }">5. Pattern</li>
        </ol>
      </div>
    </div>

    <div v-if="!useCurriculumScope && !standards.length" class="row justify-content-center mb-3">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="alert alert-warning mb-0">
          Teaching scope is empty — org standards do not auto-apply.
          Set board, standards, and subjects in
          <router-link to="/teacher/profile">Profile</router-link>
          before creating an offline paper.
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <form id="createTestPaperForm" @submit.prevent="selectPattern">
        <div class="row gy-2 justify-content-center">
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Instruction Medium Selection -->
            <div class="mb-3">
              <div class="card">
                <div class="card-header bg-light">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Instruction Medium <span class="text-danger">*</span></h6>
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="selectAllMediums" 
                        v-model="selectAllMediums" 
                        @change="toggleAllMediums"
                      >
                      <label class="form-check-label" for="selectAllMediums">
                        {{ selectAllMediums ? 'Deselect All' : 'Select All' }}
                      </label>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="row g-2">
                    <div 
                      v-for="medium in instructionMediums" 
                      :key="medium.id" 
                      class="col-12"
                    >
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :id="`medium-${medium.id}`" 
                          v-model="medium.selected" 
                          @change="updateSelectedMediums"
                        >
                        <label class="form-check-label" :for="`medium-${medium.id}`">
                          {{ medium.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                :disabled="!selectedMediums.length"
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
                @change="handleSubjectChange"
              >
                <template #label>Subject <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          
          <!-- Chapter Selection Section (New) -->
          <div class="col-12 col-sm-10 col-md-8" v-if="chapters.length > 0">
            <div class="card mb-3">
              <div class="card-header bg-light">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Chapter Selection</h6>
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="selectAllChapters" 
                      v-model="selectAllChapters" 
                      @change="toggleAllChapters"
                    >
                    <label class="form-check-label" for="selectAllChapters">
                      {{ selectAllChapters ? 'Deselect All' : 'Select All' }}
                      <span class="text-muted">(with questions)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-2">
                  <div 
                    v-for="chapter in chapters" 
                    :key="chapter.id" 
                    class="col-12"
                  >
                    <div class="form-check d-flex align-items-center gap-2">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :id="`chapter-${chapter.id}`" 
                        v-model="chapter.selected" 
                        :disabled="(chapter.question_count ?? 0) === 0"
                        @change="updateSelectedChapters"
                      >
                      <label class="form-check-label flex-grow-1" :for="`chapter-${chapter.id}`"
                        :class="{ 'text-muted': (chapter.question_count ?? 0) === 0 }"
                      >
                        {{ chapter.sequential_chapter_number }}. {{ chapter.name }}
                      </label>
                      <span
                        class="badge"
                        :class="(chapter.question_count ?? 0) > 0 ? 'bg-secondary' : 'bg-light text-muted border'"
                      >
                        {{ chapter.question_count ?? 0 }} Q
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
    
          <!-- Question Origin Selection -->
          <div class="col-12 col-sm-10 col-md-8" v-if="chapters.length > 0">
            <div class="mb-4">
              <div class="form-label fw-bold mb-3">Question Source <span class="text-danger">*</span></div>
              
              <div class="d-flex flex-column gap-2">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    name="questionSource" 
                    id="bothQuestions" 
                    value="both"
                    v-model="questionSource"
                  >
                  <label class="form-check-label" for="bothQuestions">
                    Both Board and Other Questions
                  </label>
                </div>
                
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    name="questionSource" 
                    id="boardQuestionsOnly" 
                    value="board"
                    v-model="questionSource"
                  >
                  <label class="form-check-label" for="boardQuestionsOnly">
                    Board Questions Only
                  </label>
                </div>
                
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    name="questionSource" 
                    id="otherQuestionsOnly" 
                    value="other"
                    v-model="questionSource"
                  >
                  <label class="form-check-label" for="otherQuestionsOnly">
                    Other Questions Only
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Total Marks Input (Moved here) -->
          <div class="col-12 col-sm-10 col-md-8" v-if="chapters.length > 0">
            <div class="mb-3">
              <SearchableDropdown
                id="totalMarks"
                label="Total Marks"
                placeholder="Search for Total Marks"
                :items="availableMarks"
                v-model="selectedMarksObj"
                :search-keys="['name']"
                required
                @change="handleMarksChange"
                :disabled="isLoading"
              >
                <template #label>Total Marks <span class="text-danger">*</span></template>
                <template #item="{ item }">
                  {{ item.name }} Marks
                </template>
              </SearchableDropdown>
            </div>
          </div>

          <div class="col-12 col-sm-10 col-md-8 text-end">
            <!-- View Syllabus Button -->
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewSyllabusBtn"
              :disabled="!isFormValid || isLoading || !totalMarks || selectedChapters.length === 0"
            >
              <output v-if="isLoading" class="spinner-border spinner-border-sm me-2"></output>
              Select Pattern
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import ToastNotification from '@/components/common/ToastNotification.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import { VALIDATION_MESSAGES } from '@/utils/validationConstants'
import type {
  InstructionMediumItem,
  StandardItem,
  SubjectItem,
  MarksItem,
  CreateTestUserProfile as UserProfile,
  ChapterItem,
} from '@/types/createTestPaperForm'

// Define component name (for linter)
defineOptions({
  name: 'CreateTestPaperDashboard'
})

// Initialize router and route at the top level of setup
const router = useRouter()


// Question source selection
const questionSource = ref('both') // Default selection


// User data
const userProfile = ref<UserProfile | null>(null)
const schoolId = computed(() => userProfile.value?.schools?.[0]?.id ?? 0)
const curriculumBoardId = computed(
  () => userProfile.value?.curriculum_scope?.board?.id ?? userProfile.value?.schools?.[0]?.board?.id ?? 0,
)
const useCurriculumScope = computed(() => !!userProfile.value?.curriculum_scope?.board?.id)

const wizardStep = computed(() => {
  if (!selectedMediums.value.length) return 1
  if (!selectedStandardObj.value) return 2
  if (!selectedSubjectObj.value) return 3
  if (!selectedChapters.value.length || !totalMarks.value) return 4
  return 5
})

const LAST_PREFS_KEY = 'createTestPaperLastPrefs'

// Options for dropdowns
const instructionMediums = ref<InstructionMediumItem[]>([])
const standards = ref<StandardItem[]>([])
const subjects = ref<SubjectItem[]>([])

// Replace selectedMediumObj with selectedMediums array
const selectedMediums = ref<InstructionMediumItem[]>([])

// Add selectAllMediums ref
const selectAllMediums = ref(false)

// Update the computed property for selected instruction medium
const selectedInstructionMedium = computed(() => {
  return selectedMediums.value.map(medium => medium.id.toString()).join(',')
})

// Selected objects (not just IDs)
const selectedStandardObj = ref<StandardItem | null>(null)
const selectedSubjectObj = ref<SubjectItem | null>(null)

// Chapter-related state
const chapters = ref<ChapterItem[]>([])
const selectAllChapters = ref(false)
const totalMarks = ref<number | null>(null)

// New state for marks dropdown
const availableMarks = ref<MarksItem[]>([])
const selectedMarksObj = ref<MarksItem | null>(null)

// Computed property to get only selected chapters
const selectedChapters = computed(() => {
  return chapters.value.filter(chapter => chapter.selected)
})

// Form validation
const isFormValid = computed(() => {
  return (
    selectedMediums.value.length > 0 &&
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

const unwrapProfile = (data: any): UserProfile | null => {
  if (!data) return null
  if (data.curriculum_scope !== undefined || data.schools || data.email_id) return data
  if (data.data) return unwrapProfile(data.data)
  return null
}

// Fetch user profile to get school ID / curriculum scope
const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/auth/profile')
    const profile = unwrapProfile(response.data)
    if (profile) {
      userProfile.value = profile
      await fetchInstructionMediums()
    } else {
      showErrorToast('Failed to load user profile data')
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    showErrorToast('Failed to load user profile. Please refresh the page and try again.')
  } finally {
    isLoading.value = false
  }
}

// Load mediums by board (curriculum scope) or by school
const fetchInstructionMediums = async () => {
  try {
    isLoading.value = true
    if (curriculumBoardId.value) {
      const response = await axiosInstance.get(
        `/instruction-mediums/board/${curriculumBoardId.value}`,
      )
      const list = Array.isArray(response.data) ? response.data : response.data?.data || []
      instructionMediums.value = list.map((item: any) => ({
        id: item.id,
        name: item.instruction_medium || item.name,
        original: item,
        selected: false,
      }))
      // Default to a single medium so Total Marks can populate (multi-medium needs questions in ALL)
      if (instructionMediums.value.length) {
        const english = instructionMediums.value.find((m) =>
          /english/i.test(m.name),
        )
        const pick = english || instructionMediums.value[0]
        pick.selected = true
        selectAllMediums.value = instructionMediums.value.length === 1
        selectedMediums.value = [pick]
        await handleMediumChange()
      }
      return
    }

    if (schoolId.value) {
      const response = await axiosInstance.get(`/school-instruction-mediums/school/${schoolId.value}`)
      if (Array.isArray(response.data)) {
        instructionMediums.value = response.data.map((item: SchoolInstructionMedium) => ({
          id: item.instruction_medium.id,
          name: item.instruction_medium.instruction_medium,
          original: item,
          selected: false,
        }))
      }
      return
    }

    showErrorToast(
      'No teaching scope found. Set board, standards, and subjects in your Profile, or join an organization.',
    )
  } catch (error) {
    console.error('Error loading instruction mediums:', error)
    showErrorToast('Failed to load instruction mediums. Please refresh the page and try again.')
  } finally {
    isLoading.value = false
  }
}

// Update the handleStandardChange function
const handleStandardChange = async () => {
  if (!selectedStandardObj.value) {
    resetDependentFields('standard')
    return
  }
  
  try {
    isLoading.value = true

    if (useCurriculumScope.value) {
      const std = userProfile.value?.curriculum_scope?.standards.find(
        (s) => s.id === selectedStandardObj.value!.id,
      )
      subjects.value = (std?.subjects || []).map((item) => ({
        subject_id: item.id,
        subject_name: item.name,
      }))
      resetDependentFields('standard')
      return
    }
    
    const mediumIds = selectedMediums.value.map(medium => medium.id)
    const response = await axiosInstance.get('/subjects/common-subjects', {
      params: {
        standard_id: selectedStandardObj.value.id,
        medium_ids: mediumIds
      }
    })
    
    subjects.value = response.data.map(item => ({
      subject_id: item.id,
      subject_name: item.name
    }))
    
    resetDependentFields('standard')
  } catch (error) {
    showErrorToast('Failed to load subjects')
    console.error('Error loading subjects:', error)
    subjects.value = []
  } finally {
    isLoading.value = false
  }
}

// Update the handleMediumChange function to also handle subjects
const handleMediumChange = async () => {
  if (selectedMediums.value.length === 0) {
    resetDependentFields('medium')
    return
  }
  
  try {
    isLoading.value = true

    if (useCurriculumScope.value) {
      const scopeStandards = userProfile.value?.curriculum_scope?.standards || []
      standards.value = scopeStandards.map((s) => ({
        id: s.id,
        board_id: curriculumBoardId.value,
        name: s.name,
        sequence_number: s.sequence_number,
        created_at: '',
        updated_at: '',
      }))
      if (selectedStandardObj.value) {
        await handleStandardChange()
      }
      resetDependentFields('medium')
      return
    }
    
    const mediumIds = selectedMediums.value.map(medium => medium.id)
    const response = await axiosInstance.get('/standards/common-standards', {
      params: {
        instruction_medium_ids: mediumIds
      }
    })
    
    standards.value = response.data
    
    if (selectedStandardObj.value) {
      await handleStandardChange()
    }
    
    resetDependentFields('medium')
  } catch (error) {
    showErrorToast('Failed to load standards')
    console.error('Error loading standards:', error)
    standards.value = []
  } finally {
    isLoading.value = false
  }
}

// Update the handleSubjectChange function
const handleSubjectChange = async () => {
  if (!selectedSubjectObj.value) {
    chapters.value = []
    return
  }
  
  try {
    isLoading.value = true
    
    // Fetch chapters for the selected subject, standard, and medium
    // Chapters API accepts a single mediumId; use the first selected medium
    const primaryMediumId = selectedMediums.value[0]?.id
    if (!primaryMediumId) {
      chapters.value = []
      return
    }

    const response = await axiosInstance.get('/chapters', {
      params: {
        subjectId: selectedSubjectObj.value.subject_id,
        standardId: selectedStandardObj.value?.id,
        mediumId: primaryMediumId,
      },
    })
    
    // Transform the chapters data with UI properties
    chapters.value = response.data.map((chapter: ChapterItem) => ({
      ...chapter,
      selected: false,
      marks: 0,
      question_count: Number((chapter as any).question_count ?? 0),
    }))

    if (!chapters.value.length) {
      showErrorToast(
        'No chapters found for this medium / standard / subject. Try another combination or pick a board with seeded content (e.g. Demo MSBSHSE).',
      )
    }
    
    // Reset the "select all" checkbox
    selectAllChapters.value = false
    
    // Reset marks dropdown when subject changes
    availableMarks.value = []
    selectedMarksObj.value = null
    totalMarks.value = null
  } catch (error) {
    console.error('Error loading chapters:', error)
    showErrorToast('Failed to load chapters for the selected subject')
    chapters.value = []
  } finally {
    isLoading.value = false
  }
}

// Update the selectPattern function
const selectPattern = async () => {
  if (!isFormValid.value) {
    showErrorToast(VALIDATION_MESSAGES.FORM.FILL_ALL_REQUIRED)
    return
  }
  
  if (!totalMarks.value || totalMarks.value <= 0) {
    showErrorToast('Please enter total marks for the test paper')
    return
  }
  
  if (selectedChapters.value.length === 0) {
    showErrorToast('Please select at least one chapter')
    return
  }
  
  try {
    isLoading.value = true
    
    // Prepare chapter data for passing to the next screen
    const chapterData = selectedChapters.value.map(chapter => ({
      id: chapter.id,
      name: chapter.name,
      sequential_chapter_number: chapter.sequential_chapter_number
    }))
    
    // Set test paper details with both display names and IDs
    const queryParams = {
      // Display names for UI
      medium: encodeURIComponent(selectedMediums.value.map(m => m.name).join(',')),
      standard: encodeURIComponent(selectedStandardObj.value?.name ?? ''),
      subject: encodeURIComponent(selectedSubjectObj.value?.subject_name ?? ''),
      
      // IDs for API calls
      mediumId: selectedInstructionMedium.value,
      standardId: selectedStandardObj.value?.id?.toString() ?? '',
      subjectId: selectedSubjectObj.value?.subject_id?.toString() ?? '',
      schoolId: schoolId.value.toString(),
      totalMarks: totalMarks.value.toString(),
      questionSource: questionSource.value,
      
      // Chapter data (encoded as a JSON string)
      chapters: encodeURIComponent(JSON.stringify(chapterData))
    }
    
    // Save form state to localStorage before navigating
    saveFormState()
    
    // Navigate to the pattern selection page with query parameters
    router.push({
      name: 'selectTestPattern',
      query: queryParams
    })
    
    showSuccessToast('Navigating to pattern selection')
  } catch (error) {
    showErrorToast('Failed to select pattern')
    console.error('Error selecting pattern:', error)
  } finally {
    isLoading.value = false
  }
}

// Update the saveFormState function
const saveFormState = () => {
  try {
    // Only save if we have selected at least the basic criteria
    if (selectedMediums.value.length === 0 || !selectedStandardObj.value || !selectedSubjectObj.value) {
      return
    }
    
    const formState = {
      selectedMediums: selectedMediums.value,
      selectedStandardObj: selectedStandardObj.value,
      selectedSubjectObj: selectedSubjectObj.value,
      totalMarks: totalMarks.value,
      questionSource: questionSource.value,
      chapters: chapters.value.map(c => ({
        id: c.id,
        selected: c.selected
      })),
      selectedMarksObj: selectedMarksObj.value,
      timestamp: Date.now()
    }
    localStorage.setItem('testPaperDashboardState', JSON.stringify(formState))
    localStorage.setItem(
      LAST_PREFS_KEY,
      JSON.stringify({
        mediumIds: selectedMediums.value.map((m) => m.id),
        standardId: selectedStandardObj.value?.id ?? null,
      }),
    )
  } catch (error) {
    console.error('Error saving form state:', error)
  }
}

// Reset dependent fields based on starting point
const resetDependentFields = (startingField: 'medium' | 'standard'): void => {
  if (startingField === 'medium') {
    selectedStandardObj.value = null
    selectedSubjectObj.value = null
    subjects.value = []
    chapters.value = []
    totalMarks.value = null
  } else if (startingField === 'standard') {
    selectedSubjectObj.value = null
    chapters.value = []
    totalMarks.value = null
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

// Helper functions to reduce complexity in restoreFormState
const restoreMediumsSelection = (formState) => {
  if (!formState.selectedMediums) return
  
  selectedMediums.value = formState.selectedMediums
  // Update the selected state in instructionMediums
  for (const medium of instructionMediums.value) {
    medium.selected = selectedMediums.value.some(m => m.id === medium.id)
  }
  // Update selectAll state
  selectAllMediums.value = instructionMediums.value.length > 0 && 
    instructionMediums.value.every(m => m.selected)
}

const restoreChaptersSelection = (formState) => {
  if (!formState.chapters || chapters.value.length === 0) return
  
  for (const savedChapter of formState.chapters) {
    const matchingChapter = chapters.value.find(c => c.id === savedChapter.id)
    if (matchingChapter) {
      matchingChapter.selected = savedChapter.selected
    }
  }
  
  // Update selectAll checkbox state based on individual selections
  selectAllChapters.value = chapters.value.length > 0 && chapters.value.every(c => c.selected)
  
  // Trigger an update of selected chapters
  updateSelectedChapters()
}

const restoreMarksSelection = async (formState) => {
  if (!formState.totalMarks) return
  
  await fetchAvailableMarks()
  
  if (!formState.selectedMarksObj || availableMarks.value.length === 0) return
  
  selectedMarksObj.value = availableMarks.value.find(
    m => m.name === formState.selectedMarksObj.name
  ) ?? null
  
  if (selectedMarksObj.value) {
    totalMarks.value = Number.parseInt(selectedMarksObj.value.name, 10)
  }
}

const restoreFormState = async () => {
  try {
    const savedState = localStorage.getItem('testPaperDashboardState')
    if (!savedState) return
    
    const formState = JSON.parse(savedState)
    
    // Restore selected values in separate functions
    restoreMediumsSelection(formState)
    if (selectedMediums.value.length) {
      await handleMediumChange()
    }
    
    if (formState.selectedStandardObj) {
      selectedStandardObj.value = formState.selectedStandardObj
      await handleStandardChange()
    }
    
    if (formState.selectedSubjectObj) {
      selectedSubjectObj.value = formState.selectedSubjectObj
      await handleSubjectChange()
    }
    
    if (formState.questionSource) {
      questionSource.value = formState.questionSource
    }
    
    // Restore chapters and marks using helper functions
    restoreChaptersSelection(formState)
    await restoreMarksSelection(formState)
    
  } catch (error) {
    console.error('Error restoring form state:', error)
  }
}

async function restoreLastCreatePaperPrefs() {
  if (localStorage.getItem('testPaperDashboardState')) return
  try {
    const raw = localStorage.getItem(LAST_PREFS_KEY)
    if (!raw) return
    const prefs = JSON.parse(raw) as { mediumIds?: number[]; standardId?: number | null }
    if (!prefs.mediumIds?.length) return
    for (const m of instructionMediums.value) {
      m.selected = prefs.mediumIds!.includes(m.id)
    }
    updateSelectedMediums()
    await handleMediumChange()
    if (!prefs.standardId) return
    const std = standards.value.find((s) => s.id === prefs.standardId) || null
    if (!std) return
    selectedStandardObj.value = std
    await handleStandardChange()
  } catch (e) {
    console.warn('Could not restore last create-paper prefs', e)
  }
}

// Load initial data
onMounted(async () => {
  await fetchUserProfile()
  await restoreLastCreatePaperPrefs()
  await restoreFormState()
})

// Watch for changes to total marks and selected chapters to auto-distribute marks
watch([totalMarks, () => selectedChapters.value.length], () => {
  if (selectedChapters.value.length === 0 || !totalMarks.value) {
    return
  }
}, { deep: true });

// Watch for changes to questionSource to fetch available marks
watch(questionSource, () => {
  if (selectedChapters.value.length > 0) {
    fetchAvailableMarks()
  }
})

// Update the fetchAvailableMarks function
const fetchAvailableMarks = async () => {
  if (selectedChapters.value.length === 0) {
    availableMarks.value = []
    return
  }
  
  try {
    isLoading.value = true
    
    // Get the chapter IDs from selected chapters and ensure they are numbers
    const chapterIds = selectedChapters.value.map(chapter => Number(chapter.id))
    
    // Get the medium IDs from selected mediums and ensure they are numbers
    const mediumIds = selectedMediums.value.map(medium => Number(medium.id))
    
    console.log('Fetching marks with params:', {
      mediumIds,
      chapterIds,
      questionOrigin: questionSource.value
    })
    
    // Fetch available marks for the selected criteria
    const response = await axiosInstance.get('/pattern-filter/unique-marks', {
      params: {
        mediumIds,
        chapterIds,
        questionOrigin: questionSource.value
      }
    })
    
    // Transform marks for the dropdown
    if (response.data?.marks?.length) {
      availableMarks.value = response.data.marks.map((mark: number) => ({
        id: mark,
        name: mark.toString()
      }))
      
      console.log('Available marks:', availableMarks.value)
      
      // Reset selected marks
      selectedMarksObj.value = null
      totalMarks.value = null
    } else {
      availableMarks.value = []
      selectedMarksObj.value = null
      totalMarks.value = null
      const mediumNames = selectedMediums.value.map((m) => m.name).join(' + ')
      if (selectedMediums.value.length > 1) {
        showErrorToast(
          `No common patterns for ${mediumNames}. Deselect extra mediums (try English only) to load Total Marks.`,
        )
      } else {
        showErrorToast(
          response.data?.message ||
            'No available marks found for the selected chapters / medium / question source.',
        )
      }
    }
  } catch (error) {
    console.error('Error loading available marks:', error)
    showErrorToast('Failed to load available marks')
    availableMarks.value = []
  } finally {
    isLoading.value = false
  }
}

// Update the updateSelectedChapters function to fetch marks
const updateSelectedChapters = () => {
  const selectable = chapters.value.filter((c) => (c.question_count ?? 0) > 0)
  selectAllChapters.value =
    selectable.length > 0 && selectable.every((c) => c.selected)

  // If no chapters are selected, return
  if (selectedChapters.value.length === 0) {
    return
  }

  // Fetch available marks when chapter selection changes
  fetchAvailableMarks()
}

// Update the watch for selectedMediums to fetch marks
watch(() => selectedMediums.value, () => {
  if (selectedChapters.value.length > 0) {
    fetchAvailableMarks()
  }
}, { deep: true })

// New handler for marks dropdown change
const handleMarksChange = () => {
  if (selectedMarksObj.value) {
    totalMarks.value = Number.parseInt(selectedMarksObj.value.name, 10)
  } else {
    totalMarks.value = null
  }
}

// Watch for changes in the form to automatically save state
watch(
  [
    () => selectedMediums.value,
    selectedStandardObj, 
    selectedSubjectObj,
    questionSource,
    totalMarks,
    () => chapters.value.map(c => c.selected)
  ],
  () => {
    saveFormState()
  },
  { deep: true }
)

// Navigation guard setup
// Clean up on component unmount if not navigating to related pages
onBeforeUnmount(() => {
  // Don't clear if navigating to selectPattern or createTestPaperDetail
  const currentRoute = router.currentRoute.value
  
  // Only save form state while navigating within the test paper flow
  if (currentRoute.name === 'selectTestPattern' || 
      currentRoute.name === 'createTestPaperDetail') {
    // We already saved the state with the watcher, no need to do anything
  } else {
    // Clear saved state if navigating away from the test paper flow
    localStorage.removeItem('testPaperDashboardState')
  }
})

// Add new functions for handling medium selection
const toggleAllMediums = () => {
  for (const medium of instructionMediums.value) {
    medium.selected = selectAllMediums.value
  }
  updateSelectedMediums()
}

// Add the missing toggleAllChapters function
const toggleAllChapters = () => {
  for (const chapter of chapters.value) {
    if ((chapter.question_count ?? 0) === 0) {
      chapter.selected = false
      continue
    }
    chapter.selected = selectAllChapters.value
  }
  updateSelectedChapters()
}

const updateSelectedMediums = () => {
  // Update selectAll checkbox state based on individual selections
  selectAllMediums.value = instructionMediums.value.length > 0 && 
    instructionMediums.value.every(m => m.selected)
  
  // Update selected mediums array
  selectedMediums.value = instructionMediums.value.filter(m => m.selected)
  
  // Call handleMediumChange to update standards and subjects
  handleMediumChange()
  
  // Reset dependent fields if no mediums are selected
  if (selectedMediums.value.length === 0) {
    resetDependentFields('medium')
  }
}

// Add a watch to monitor instructionMediums changes
watch(instructionMediums, (newValue) => {
  console.log('Instruction mediums updated:', newValue)
}, { deep: true })
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

/* Form check styling */
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

/* Chapter marks input styling */
.input-group .form-control {
  border-right: none;
}

.input-group .input-group-text {
  background-color: #f8f9fa;
}

/* Custom validation styling without exclamation mark */
.form-control.is-invalid {
  border-color: #dc3545;
  background-image: none;
}

/* Improved validation border for input group */
.form-control.is-invalid + .input-group-text {
  border-color: #dc3545;
  border-left: none;
}

/* Ensure text remains centered in invalid inputs */
.form-control.text-center.is-invalid {
  text-align: center !important;
}

/* Additional fix for centering numbers in inputs */
.marks-input-group input[type="number"] {
  text-align: center !important;
}

.marks-input-group input[type="number"].is-invalid {
  text-align: center !important;
  padding-right: 0.75rem !important; /* Override Bootstrap's padding for validation icon */
}

/* Mobile optimized marks input group */
.marks-input-group {
  width: 150px;
}

/* New style for chapter name on small screens */
@media (max-width: 576px) {
  .d-flex.flex-column.flex-md-row .me-2.flex-grow-1 {
    display: block;
    width: 100%;
   
    word-break: break-word;
  }
  
  /* Style for chapter name in single chapter alert */
  .alert-dark small .chapter-name {
    display: block;
    margin-top: 0.5rem;
    word-break: break-word;
  }
}

/* Responsive styles to match TeacherProfile.vue */
@media (max-width: 768px) {
  /* Font size adjustments to match TeacherProfile.vue */
  h5 {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
  }
  
  h6 {
    font-size: 1rem !important;
  }
  
  /* Improve form spacing */
  .mb-3 {
    margin-bottom: 1rem !important;
  }
  
  .mb-4 {
    margin-bottom: 1.5rem !important;
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
  
  /* Increase input area for better touch targets */
  .marks-input-group {
    width: 140px;
  }
  
  .marks-input-group .form-control,
  .marks-input-group .input-group-text {
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
  }
  
  /* Radio option spacing */
  .form-check {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  /* Phone-specific adjustments to match TeacherProfile.vue */
  h5 {
    font-size: 1.15rem !important;
  }
  
  h6 {
    font-size: 0.95rem !important;
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
  
  /* Make inputs larger and more touchable on small screens */
  .marks-input-group {
    width: 100%;
    max-width: 160px;
  }
  
  /* Make percentage and marks row full width on small screens */
  .chapter-marks-controls {
    width: 100%;
    margin-left: 0 !important;
    margin-top: 0.25rem;
    justify-content: space-evenly;
  }
  
  .chapter-marks-controls .percent-display {
    min-width: 50px;
    text-align: right;
  }
  
  /* Optimize marks summary for small screens */
  .marks-summary .text-muted {
    font-size: 0.9rem;
  }
  
  .marks-summary .badge {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }
  
  .marks-input-group .form-control,
  .marks-input-group .input-group-text {
    padding: 0.625rem 0.75rem;
    font-size: 1.1rem;
    height: auto;
  }
  
  /* Hide number input spinners ONLY on small screens */
  .no-spinner-sm::-webkit-inner-spin-button, 
  .no-spinner-sm::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  
  .no-spinner-sm {
    appearance: textfield;
    -moz-appearance: textfield; /* Firefox */
  }
}

/* Floating input for total marks */
.marks-floating-input {
  position: relative;
}

.marks-floating-input .form-control {
  height: calc(3.5rem + 2px);
  padding: 1rem 0.75rem;
}

.marks-floating-input label {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  padding: 1rem 0.75rem;
  pointer-events: none;
  border: 1px solid transparent;
  transform-origin: 0 0;
  transition: opacity .1s ease-in-out,transform .1s ease-in-out;
}

.marks-floating-input .form-control:focus,
.marks-floating-input .form-control:not(:placeholder-shown) {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}

.marks-floating-input .form-control:focus ~ label,
.marks-floating-input .form-control:not(:placeholder-shown) ~ label {
  opacity: 0.65;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
}

.wizard-steps li {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: #f1f3f5;
  color: #6c757d;
  font-weight: 600;
}
.wizard-steps li.active {
  background: #212529;
  color: #fff;
}
.wizard-steps li.done {
  background: #dee2e6;
  color: #212529;
}
</style> 