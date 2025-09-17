<template>
  <div class="container my-4" :class="{ 'page-leaving': isPageLeaving }">
    <!-- Header Section -->
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <div class="col-auto">
          <button type="button" class="btn-close" aria-label="Close" @click="goBack"></button>
        </div>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col-12 col-sm-10">
          <p class="text-muted text-start fs-5 mb-1">
            <span class="d-inline-block">{{ decodeURIComponent(boardName) }}</span>
            <span class="d-inline-block ms-1">| {{ decodeURIComponent(mediumName) }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark mb-2">
            Standard {{ decodeURIComponent(standardName) }}
            <span class="d-block text-start text-secondary mt-1">
              {{ decodeURIComponent(subjectName) }}
              <span class="optional-info-marks-heading fs-5">{{ totalMarksFromPrevious }} Marks</span>
            </span>
          </h4>
          <h5 class="fw-bolder text-start text-primary mb-2">
            Pattern: {{ decodeURIComponent(patternName) }}
          </h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Test Paper Preview Form -->
    <div class="row p-2 justify-content-center mb-3">
      <div class="col-12 col-sm-10">
        <form @submit.prevent class="test-paper-form">
          <h6 class="fw-semibold mb-3">Test Paper Details</h6>
          
          <!-- Test Paper Name -->
          <div class="mb-3">
            <label for="testPaperName" class="form-label fw-semibold">Test Paper Name *</label>
            <input
              type="text"
              class="form-control"
              id="testPaperName"
              v-model="form.testPaperName"
              placeholder="Enter test paper name"
              required
              maxlength="100"
              :disabled="isSubmitting"
            />
            <div class="form-text">
              {{ form.testPaperName.length }}/100 characters
            </div>
          </div>

          <!-- Duration -->
          <div class="mb-3">
            <label for="duration" class="form-label fw-semibold">Duration (minutes) *</label>
            <input
              type="number"
              class="form-control"
              id="duration"
              v-model.number="form.duration"
              placeholder="Enter duration in minutes"
              min="1"
              max="300"
              required
              :disabled="isSubmitting"
            />
            <div class="form-text">
              Duration should be between 1 and 300 minutes
            </div>
          </div>

          <!-- Instructions -->
          <div class="mb-3">
            <label for="instructions" class="form-label fw-semibold">Instructions</label>
            <textarea
              class="form-control"
              id="instructions"
              v-model="form.instructions"
              rows="4"
              placeholder="Enter test instructions (optional)"
              maxlength="1000"
              :disabled="isSubmitting"
            ></textarea>
            <div class="form-text">
              {{ form.instructions.length }}/1000 characters
            </div>
          </div>

          <!-- Negative Marking -->
          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="negativeMarking"
                v-model="form.negativeMarking"
                :disabled="isSubmitting"
              />
              <label class="form-check-label fw-semibold" for="negativeMarking">
                Enable Negative Marking
              </label>
            </div>
            <div v-if="form.negativeMarking" class="mt-2">
              <label for="negativeMarkingValue" class="form-label">Negative Marks per Wrong Answer</label>
              <input
                type="number"
                class="form-control"
                id="negativeMarkingValue"
                v-model.number="form.negativeMarkingValue"
                placeholder="Enter negative marks (e.g., 0.25)"
                min="0"
                max="10"
                step="0.25"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <!-- Question Randomization -->
          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="randomizeQuestions"
                v-model="form.randomizeQuestions"
                :disabled="isSubmitting"
              />
              <label class="form-check-label fw-semibold" for="randomizeQuestions">
                Randomize Question Order
              </label>
            </div>
          </div>

          <!-- Option Randomization -->
          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                id="randomizeOptions"
                v-model="form.randomizeOptions"
                :disabled="isSubmitting"
              />
              <label class="form-check-label fw-semibold" for="randomizeOptions">
                Randomize Option Order
              </label>
            </div>
          </div>

          <!-- Questions Preview Section -->
          <div v-if="questionsDistribution && questionsDistribution.sectionAllocations" class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-semibold mb-0">Questions Preview</h6>
              <div class="d-flex gap-2">
                <button 
                  type="button" 
                  class="btn btn-outline-primary btn-sm"
                  @click="changeAllQuestions"
                  :disabled="isChangingQuestions"
                >
                  <span v-if="isChangingQuestions" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  <i v-else class="bi bi-arrow-clockwise me-1"></i>
                  New Set
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm"
                  @click="shuffleQuestions"
                  :disabled="isShuffling"
                >
                  <span v-if="isShuffling" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  <i v-else class="bi bi-shuffle me-1"></i>
                  Shuffle
                </button>
              </div>
            </div>
            
            <div class="questions-container">
              <div 
                v-for="(question, questionIndex) in getAllQuestions()" 
                :key="question.question.id"
                class="question-item"
              >
                <div class="question-wrapper">
                  <div class="d-flex w-100">
                    <!-- Question Content -->
                    <div class="question-content">
                      <div class="question-text">
                        {{ questionIndex + 1 }}. {{ question.question.question_texts[0]?.question_text || 'No question text available' }}
                        <span v-if="question.chapterName" class="chapter-badge">
                          {{ question.chapterName }}
                        </span>
                      </div>
                      
                      <!-- MCQ Options -->
                      <div v-if="question.question.question_texts[0]?.mcq_options" class="options-container">
                        <div class="options-column">
                          <div 
                            v-for="(option, optionIndex) in question.question.question_texts[0].mcq_options" 
                            :key="option.id"
                            class="option-item-column"
                            :class="{ 'correct-option': option.is_correct }"
                          >
                            <div class="option-prefix">
                              <i v-if="option.is_correct" class="bi bi-check-circle-fill correct-tick"></i>
                              <span v-else class="tick-placeholder"></span>
                            </div>
                            <span class="option-label">{{ getOptionLabel(optionIndex) }})</span>
                            <span class="option-text">{{ option.option_text }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div v-else class="text-muted">
                        <i class="bi bi-info-circle me-1"></i>
                        No options available for this question
                      </div>
                    </div>
                    
                    <!-- Marks and Change Button -->
                    <div class="question-marks">
                      <div class="marks-row">
                        <span class="marks fw-bold me-2">{{ question.marks || 1 }}</span>
                        <button 
                          type="button"
                          class="btn btn-sm btn-custom shuffle-button" 
                          @click.prevent="changeQuestion(questionIndex)"
                          :disabled="isChangingQuestions"
                        >
                          <span class="d-inline-flex align-items-center">
                            <i class="bi bi-arrow-clockwise me-md-1"></i>
                            <span class="d-none d-sm-inline">Change</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <hr class="question-divider" />
              </div>
              
              <div v-if="getAllQuestions().length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-question-circle me-2"></i>
                No questions available in the current allocation
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="goBack" :disabled="isSubmitting">
              <i class="bi bi-arrow-left me-1"></i>
              Back to Chapter Distribution
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-create-test"
              :disabled="isSubmitting || !isFormValid"
              :class="{ 'loading': isSubmitting }"
              @click="handleButtonClick"
            >
              <span v-if="isSubmitting" class="loading-content">
                <span class="spinner-border spinner-border-sm me-2" role="status">
                  <span class="visually-hidden">Loading...</span>
                </span>
                <span class="loading-text">Creating Test Paper...</span>
              </span>
              <span v-else class="normal-content">
                <i class="bi bi-plus-circle me-2"></i>
                Create Test Paper
              </span>
            </button>
          </div>

          <!-- Loading Overlay -->
          <div v-if="isSubmitting" class="form-loading-overlay" :class="{ 'success': isSuccess }">
            <div class="loading-spinner-container">
              <div v-if="!isSuccess" class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
              </div>
              <div v-else class="success-icon">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <h5 class="loading-title">{{ loadingMessage }}</h5>
              <p class="loading-message">{{ loadingSubMessage }}</p>
              <div class="loading-progress">
                <div class="progress-bar"></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Questions Distribution Section -->
    <!-- Removed Questions Distribution Preview section as requested by user -->
    <!--
    <div v-if="showDistribution && questionsDistribution" class="row p-2 justify-content-center mb-3">
      <div class="col-12 col-sm-10">
        <div class="questions-distribution-container">
          <h6 class="fw-semibold mb-3">Questions Distribution Preview</h6>
          
          <div class="row mb-4">
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="summary-card">
                <div class="summary-icon">
                  <i class="bi bi-list-ol"></i>
                </div>
                <div class="summary-content">
                  <h6>Total Questions</h6>
                  <span class="summary-value">{{ getTotalQuestions() }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="summary-card">
                <div class="summary-icon">
                  <i class="bi bi-award"></i>
                </div>
                <div class="summary-content">
                  <h6>Total Marks</h6>
                  <span class="summary-value">{{ questionsDistribution.totalMarks || questionsDistribution.absoluteMarks || totalMarksFromPrevious }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="summary-card">
                <div class="summary-icon">
                  <i class="bi bi-book"></i>
                </div>
                <div class="summary-content">
                  <h6>Chapters</h6>
                  <span class="summary-value">{{ questionsDistribution.chapterMarks?.length || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="summary-card">
                <div class="summary-icon">
                  <i class="bi bi-grid-3x3-gap"></i>
                </div>
                <div class="summary-content">
                  <h6>Sections</h6>
                  <span class="summary-value">{{ questionsDistribution.sectionAllocations?.length || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="questionsDistribution.chapterMarks" class="mb-4">
            <h6 class="fw-semibold mb-3">Chapter-wise Distribution</h6>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-dark">
                  <tr>
                    <th>Chapter</th>
                    <th class="text-center">Questions</th>
                    <th class="text-center">Marks</th>
                    <th class="text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="chapter in questionsDistribution.chapterMarks" :key="chapter.chapterId">
                    <td>
                      <strong>{{ chapter.chapterName }}</strong>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-primary">{{ chapter.questionCount || 0 }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-success">{{ chapter.absoluteMarks || 0 }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-info">{{ chapter.percentage || 0 }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="questionsDistribution.sectionAllocations" class="mb-4">
            <h6 class="fw-semibold mb-3">Section-wise Distribution</h6>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-dark">
                  <tr>
                    <th>Section</th>
                    <th class="text-center">Question Types</th>
                    <th class="text-center">Questions</th>
                    <th class="text-center">Marks per Question</th>
                    <th class="text-center">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="section in questionsDistribution.sectionAllocations" :key="section.sectionId">
                    <td>
                      <strong>Q.{{ section.section_number }}</strong>
                      {{ section.subSection ? section.subSection + ')' : '' }}
                      {{ section.sectionName }}
                    </td>
                    <td class="text-center">
                      <div v-if="section.subsectionAllocations" class="d-flex flex-wrap gap-1 justify-content-center">
                        <span 
                          v-for="subsection in section.subsectionAllocations" 
                          :key="subsection.subsectionQuestionTypeId"
                          class="badge bg-secondary"
                        >
                          {{ subsection.questionTypeName }}
                        </span>
                      </div>
                      <span v-else class="badge bg-secondary">-</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-primary">{{ section.mandotory_questions || section.totalQuestions || 0 }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-warning text-dark">{{ section.marks_per_question || 0 }}</span>
                    </td>
                    <td class="text-center">
                      <span class="badge bg-success">{{ section.absoluteMarks || section.totalMarks || 0 }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-for="section in questionsDistribution.sectionAllocations" :key="'details-' + section.sectionId" class="mt-4">
              <div v-if="section.subsectionAllocations && section.subsectionAllocations.length > 0">
                <h6 class="fw-semibold text-primary">
                  Section {{ section.section_number }}{{ section.subSection ? section.subSection : '' }} - Question Type Details
                </h6>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Question Type</th>
                        <th class="text-center">Allocated Chapters</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="subsection in section.subsectionAllocations" :key="subsection.subsectionQuestionTypeId">
                        <td>
                          <strong>{{ subsection.questionTypeName }}</strong>
                        </td>
                        <td class="text-center">
                          <div v-if="subsection.allocatedChapters" class="d-flex flex-wrap gap-1 justify-content-center">
                            <span 
                              v-for="chapter in subsection.allocatedChapters" 
                              :key="chapter.chapterId"
                              class="badge bg-info"
                            >
                              {{ chapter.chapterName }}
                            </span>
                          </div>
                          <span v-else class="text-muted">-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <details>
              <summary class="fw-semibold text-muted" style="cursor: pointer;">
                <i class="bi bi-code-square me-1"></i>
                View Raw Data (Debug)
              </summary>
              <pre class="bg-light p-3 mt-2 rounded"><code>{{ JSON.stringify(questionsDistribution, null, 2) }}</code></pre>
            </details>
          </div>
        </div>
      </div>
    </div>
    -->

    <!-- Toast Notification -->
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import ToastNotification from '@/components/common/ToastNotification.vue'
import { useToastStore } from '@/stores/toast'

// Define component name
defineOptions({
  name: 'PreviewTestPaper'
})

// Router and route setup
const router = useRouter()
const route = useRoute()

// Form data interface
interface TestPaperForm {
  testPaperName: string
  duration: number
  instructions: string
  negativeMarking: boolean
  negativeMarkingValue: number
  randomizeQuestions: boolean
  randomizeOptions: boolean
}

// State variables
const form = ref<TestPaperForm>({
  testPaperName: '',
  duration: 60,
  instructions: '',
  negativeMarking: false,
  negativeMarkingValue: 0.25,
  randomizeQuestions: false,
  randomizeOptions: false
})

const isSubmitting = ref(false)
const loadingMessage = ref('Creating Your Test Paper')
const loadingSubMessage = ref('Please wait while we process your test paper...')
const isSuccess = ref(false)
const isPageLeaving = ref(false)

// Questions distribution data
const questionsDistribution = ref<any>(null)
const showDistribution = ref(false)

// Questions changing state
const isChangingQuestions = ref(false)
const isShuffling = ref(false)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Get route parameters
const patternId = route.query.patternId as string
const mediumId = route.query.mediumId as string
const patternName = route.query.patternName as string || 'Unknown Pattern'
const boardName = route.query.board as string || 'Unknown Board'
const mediumName = route.query.medium as string || 'Unknown Medium'
const standardName = route.query.standard as string || 'Unknown Standard'
const subjectName = route.query.subject as string || 'Unknown Subject'
const totalMarksFromPrevious = route.query.totalMarks as string || '0'

// Computed properties
const isFormValid = computed(() => {
  return form.value.testPaperName.trim().length > 0 &&
         form.value.duration > 0 &&
         form.value.duration <= 300 &&
         (!form.value.negativeMarking || form.value.negativeMarkingValue >= 0)
})

// Handle button click with immediate feedback
const handleButtonClick = (event: Event) => {
  event.preventDefault()
  
  // Prevent double clicks
  if (isSubmitting.value) {
    return
  }
  
  // Add a small visual feedback delay
  const button = event.target as HTMLButtonElement
  button.style.transform = 'scale(0.95)'
  
  setTimeout(() => {
    button.style.transform = ''
    handleFormSubmit()
  }, 150)
}

// Handle form submission (using API from createTestPaperDetail.vue)
const handleFormSubmit = async () => {
  if (!isFormValid.value) {
    showErrorToast('Please fill in all required fields correctly')
    return
  }

  try {
    // Set loading state immediately when button is clicked
    isSubmitting.value = true
    loadingMessage.value = 'Preparing Test Paper'
    loadingSubMessage.value = 'Setting up your test configuration...'
    
    // Add a small delay to ensure the loading UI is visible
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Prepare the questions data from the distribution
    const questionsData = prepareQuestionsData()
    
    // Update loading message
    loadingMessage.value = 'Creating Test Paper'
    loadingSubMessage.value = 'Processing questions and generating test paper...'
    
    // Prepare the test paper data
    const testPaperData = {
      name: form.value.testPaperName.trim(),
      pattern_id: parseInt(patternId),
      duration_minutes: form.value.duration,
      instructions: form.value.instructions.trim() || null,
      negative_marking: form.value.negativeMarking,
      negative_marks_per_question: form.value.negativeMarking ? form.value.negativeMarkingValue : 0,
      randomize_questions: form.value.randomizeQuestions,
      randomize_options: form.value.randomizeOptions,
      // Add other query parameters for context
      board_id: route.query.boardId ? parseInt(route.query.boardId as string) : null,
      medium_ids: route.query.mediumId,
      standard_id: route.query.standardId ? parseInt(route.query.standardId as string) : null,
      subject_id: route.query.subjectId ? parseInt(route.query.subjectId as string) : null,
      chapters: parseChaptersFromQuery(),
      question_source: route.query.questionSource || 'both',
      questions_data: questionsData
    }

    console.log('Creating online test paper with data:', testPaperData)

    // Create the test paper using the new online endpoint
    const response = await axiosInstance.post('/create-test-paper/online', testPaperData)
    
    if (response.data?.message || response.status === 201) {
      // Update loading message to indicate success
      loadingMessage.value = 'Test Paper Created Successfully!'
      loadingSubMessage.value = 'Redirecting to dashboard...'
      isSuccess.value = true
      
      showSuccessToast('Online test paper created successfully!')
      
      // Trigger smooth page transition
      setTimeout(() => {
        isPageLeaving.value = true
        
        // Navigate after transition starts
        setTimeout(() => {
          router.push({ 
            name: 'assignOnlineTest',
            query: { created: 'true' }
          })
        }, 150)
      }, 200)
    } else {
      console.error('Unexpected API response:', response.data)
      showErrorToast('Failed to create test paper. Please try again.')
      isSubmitting.value = false
      // Reset loading messages
      loadingMessage.value = 'Creating Your Test Paper'
      loadingSubMessage.value = 'Please wait while we process your test paper...'
      isSuccess.value = false
      isPageLeaving.value = false
    }
  } catch (error: any) {
    console.error('Error creating test paper:', error)
    
    // Handle specific error messages
    if (error.response?.data?.message) {
      showErrorToast(error.response.data.message)
    } else if (error.response?.status === 400) {
      showErrorToast('Invalid test paper data. Please check your inputs.')
    } else if (error.response?.status === 401) {
      showErrorToast('You are not authorized to create test papers.')
    } else {
      showErrorToast('Failed to create test paper. Please try again.')
    }
    
    // Reset loading state on error
    isSubmitting.value = false
    // Reset loading messages
    loadingMessage.value = 'Creating Your Test Paper'
    loadingSubMessage.value = 'Please wait while we process your test paper...'
    isSuccess.value = false
    isPageLeaving.value = false
  }
  // Note: Don't reset isSubmitting.value on success since we're navigating away
}

// New function to prepare questions data from the distribution
const prepareQuestionsData = () => {
  if (!questionsDistribution.value || !questionsDistribution.value.sectionAllocations) {
    return []
  }

  const questionsData: any[] = []
  
  questionsDistribution.value.sectionAllocations.forEach((section: any) => {
    const sectionData = {
      section_id: section.sectionId,
      subsections: [] as any[]
    }
    
    section.subsectionAllocations.forEach((subsection: any) => {
      const subsectionData = {
        subsection_question_type_id: subsection.subsectionQuestionTypeId,
        questions: [] as any[]
      }
      
      let questionOrder = 1
      subsection.allocatedChapters.forEach((chapter: any) => {
        if (chapter.question) {
          const questionData = {
            question_id: chapter.question.id,
            question_text_id: chapter.question.question_texts?.[0]?.id,
            chapter_id: chapter.chapterId,
            marks: section.marks_per_question || chapter.marks || 1,
            question_order: questionOrder++
          }
          subsectionData.questions.push(questionData)
        }
      })
      
      if (subsectionData.questions.length > 0) {
        sectionData.subsections.push(subsectionData)
      }
    })
    
    if (sectionData.subsections.length > 0) {
      questionsData.push(sectionData)
    }
  })
  
  console.log('Prepared questions data:', questionsData)
  return questionsData
}

// Navigation functions
const goBack = () => {
  // Clear the questions distribution data from localStorage
  localStorage.removeItem('finalQuestionsDistribution')
  router.back()
}

// Cleanup function
const cleanup = () => {
  localStorage.removeItem('finalQuestionsDistribution')
}

// Toast notification functions
const showSuccessToast = (message: string) => {
  toastTitle.value = 'Success'
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
}

const showErrorToast = (message: string) => {
  toastTitle.value = 'Error'
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
}

const closeToast = () => {
  showToast.value = false
}

// Initialize component
onMounted(() => {
  // Generate a default test paper name
  if (!form.value.testPaperName) {
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    form.value.testPaperName = `${decodeURIComponent(subjectName)} Test - ${currentDate}`
  }
  
  // Load questions distribution data if available
  if (route.query.hasFinalDistribution === 'true') {
    const distributionData = localStorage.getItem('finalQuestionsDistribution')
    if (distributionData) {
      try {
        questionsDistribution.value = JSON.parse(distributionData)
        showDistribution.value = true
        console.log('Loaded questions distribution:', questionsDistribution.value)
      } catch (error) {
        console.error('Error parsing questions distribution data:', error)
      }
    }
  }
})

// Cleanup on component unmount
onUnmounted(() => {
  cleanup()
})

// Helper function to get total questions
const getTotalQuestions = () => {
  if (questionsDistribution.value && questionsDistribution.value.totalQuestions) {
    return questionsDistribution.value.totalQuestions
  } else if (questionsDistribution.value && questionsDistribution.value.questionCount) {
    return questionsDistribution.value.questionCount
  } else if (questionsDistribution.value && questionsDistribution.value.sectionAllocations) {
    // Calculate total questions from section allocations
    return questionsDistribution.value.sectionAllocations.reduce((total: number, section: any) => {
      return total + (section.mandotory_questions || section.totalQuestions || 0)
    }, 0)
  } else {
    return 0
  }
}

// New function to get all questions
const getAllQuestions = () => {
  if (!questionsDistribution.value || !questionsDistribution.value.sectionAllocations) {
    return []
  }
  
  const allQuestions: any[] = []
  
  questionsDistribution.value.sectionAllocations.forEach((section: any) => {
    section.subsectionAllocations.forEach((subsection: any) => {
      subsection.allocatedChapters.forEach((chapter: any) => {
        allQuestions.push({
          chapterName: chapter.chapterName,
          question: chapter.question
        })
      })
    })
  })
  
  return allQuestions
}

// New function to change a question
const toastStore = useToastStore()

const changeQuestion = async (index: number) => {
  console.log(`=== CHANGE QUESTION FUNCTION CALLED ===`)
  console.log(`Changing question at index: ${index}`)
  console.log('Function: changeQuestion, NOT handleFormSubmit')
  
  isChangingQuestions.value = true
  
  try {
    const allQuestions = getAllQuestions()
    if (!allQuestions[index]) {
      throw new Error('Question not found at the specified index')
    }
    
    const questionData = allQuestions[index]
    const question = questionData.question
    
    console.log('Question data:', questionData)
    console.log('Question object:', question)
    
    // Get the question text ID from the current question
    const questionTextId = question.question_texts?.[0]?.id
    if (!questionTextId) {
      throw new Error('No question text ID available')
    }
    
    // Get question type ID
    const questionTypeId = question.question_type_id
    if (!questionTypeId) {
      throw new Error('No question type ID available')
    }
    
    // Get chapter ID - try multiple sources
    let chapterId = questionData.chapterId
    console.log('Initial chapterId from questionData:', chapterId)
    
    if (!chapterId && question.question_topics?.[0]) {
      chapterId = question.question_topics[0].topic?.chapter_id
      console.log('ChapterId from question_topics[0].topic.chapter_id:', chapterId)
    }
    
    if (!chapterId && question.question_texts?.[0]?.question_text_topics?.[0]) {
      const questionTextTopic = question.question_texts[0].question_text_topics[0]
      console.log('Question text topic:', questionTextTopic)
      
      // Try different paths for chapter ID
      chapterId = questionTextTopic.question_topic?.topic?.chapter_id ||
                  questionTextTopic.question_topic?.chapter_id ||
                  questionTextTopic.chapter_id
      console.log('ChapterId from question_text_topics:', chapterId)
    }
    
    // Try to get chapter ID from the questionsDistribution structure
    if (!chapterId && questionsDistribution.value?.sectionAllocations) {
      console.log('Trying to find chapter ID from questionsDistribution structure...')
      let currentIndex = 0
      
      for (const section of questionsDistribution.value.sectionAllocations) {
        for (const subsection of section.subsectionAllocations) {
          for (const chapter of subsection.allocatedChapters) {
            if (currentIndex === index) {
              chapterId = chapter.chapterId
              console.log('Found chapterId from questionsDistribution:', chapterId)
              break
            }
            currentIndex++
          }
          if (chapterId) break
        }
        if (chapterId) break
      }
    }
    
    console.log('Final chapterId:', chapterId)
    
    if (!chapterId) {
      // As a fallback, try to use any chapter ID from the current distribution
      if (questionsDistribution.value?.chapterMarks?.[0]?.chapterId) {
        chapterId = questionsDistribution.value.chapterMarks[0].chapterId
        console.log('Using fallback chapterId from first chapter in distribution:', chapterId)
      } else {
        throw new Error('Chapter ID not available for this question. Please check the question data structure.')
      }
    }
    
    // *** KEY CHANGE: Collect all question text IDs from same chapter and question type ***
    const questionTextIds = collectQuestionTextIds(questionTextId, questionTypeId, chapterId)
    console.log('Collected question text IDs to exclude:', questionTextIds)
    
    // Prepare query parameters
    const queryParams = new URLSearchParams()
    
    // Add all question text IDs (this prevents getting duplicate questions)
    questionTextIds.forEach(id => {
      queryParams.append('questionTextIds', id.toString())
    })
    
    queryParams.append('chapterId', chapterId.toString())
    queryParams.append('questionOrigin', 'both')
    
    // Add medium IDs
    if (mediumId) {
      queryParams.append('mediumIds', mediumId)
    }
    
    console.log('=== ABOUT TO CALL CHANGE QUESTION API ===')
    console.log('Endpoint: /chapter-marks-distribution/change-question')
    console.log('Change question parameters:', {
      questionTextIds,
      chapterId,
      mediumId,
      questionOrigin: 'both'
    })
    console.log('Full URL:', `/chapter-marks-distribution/change-question?${queryParams.toString()}`)
    
    // Make the API call
    const response = await axiosInstance.get(`/chapter-marks-distribution/change-question?${queryParams.toString()}`)
    
    console.log('=== CHANGE QUESTION API RESPONSE ===')
    console.log('Response:', response.data)
    
    if (!response.data?.question) {
      console.error('Unexpected API response format:', response.data)
      throw new Error('Failed to get replacement question')
    }
    
    const newQuestion = response.data.question
    
    // Update the question in questionsDistribution
    if (questionsDistribution.value?.sectionAllocations) {
      let currentIndex = 0
      let found = false
      
      // Find and replace the question in the nested structure
      for (const section of questionsDistribution.value.sectionAllocations) {
        for (const subsection of section.subsectionAllocations) {
          for (const chapter of subsection.allocatedChapters) {
            if (currentIndex === index) {
              chapter.question = newQuestion
              found = true
              break
            }
            currentIndex++
          }
          if (found) break
        }
        if (found) break
      }
      
      // Update localStorage with the new data
      localStorage.setItem('finalQuestionsDistribution', JSON.stringify(questionsDistribution.value))
    }

    console.log('Question successfully changed!')
    
  } catch (error) {
    console.error('Error changing question:', error)
    const err: any = error
    const status = err?.response?.status
    const errorMessage = err?.response?.data?.message || err?.message || ''
    
    console.log('Change question error details:', { status, errorMessage, fullError: err?.response?.data })
    
    // Check if it's a "no questions found" error (can be 404, 500, or specific message patterns)
    if (status === 404 || 
        status === 500 || 
        errorMessage.toLowerCase().includes('no replacement questions found') ||
        errorMessage.toLowerCase().includes('no questions found') ||
        errorMessage.toLowerCase().includes('not found')) {
      toastStore.showToast({ title: 'No Extra Questions', message: "No extra question for replacement", type: 'warning' })
    } else {
      const msg = errorMessage || 'Failed to change question. Please try again later.'
      toastStore.showToast({ title: 'Error', message: msg, type: 'error' })
    }
  } finally {
    isChangingQuestions.value = false
  }
}

// Shuffle questions within sections and MCQ options
const shuffleQuestions = async () => {
  isShuffling.value = true
  try {
    console.log('Shuffling questions...')
    
    if (!questionsDistribution.value?.sectionAllocations) {
      throw new Error('No questions available to shuffle')
    }
    
    // Shuffle questions within each section
    questionsDistribution.value.sectionAllocations.forEach(section => {
      section.subsectionAllocations.forEach(subsection => {
        if (subsection.allocatedChapters && subsection.allocatedChapters.length > 1) {
          // Shuffle the allocated chapters array (which contains the questions)
          subsection.allocatedChapters = shuffleArray([...subsection.allocatedChapters])
          
          // Shuffle MCQ options for each question
          subsection.allocatedChapters.forEach(chapter => {
            if (chapter.question?.question_texts?.[0]?.mcq_options) {
              chapter.question.question_texts[0].mcq_options = shuffleArray([...chapter.question.question_texts[0].mcq_options])
            }
          })
        }
      })
    })
    
    // Update localStorage with shuffled data
    localStorage.setItem('finalQuestionsDistribution', JSON.stringify(questionsDistribution.value))
    
    console.log('Questions and options shuffled successfully!')
    toastStore.showToast({ title: 'Shuffled', message: 'Questions and options have been shuffled', type: 'success' })
  } catch (error) {
    console.error('Error shuffling questions:', error)
    toastStore.showToast({ title: 'Error', message: 'Failed to shuffle questions. Please try again.', type: 'error' })
  } finally {
    isShuffling.value = false
  }
}

// Helper function to shuffle an array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// *** NEW FUNCTION: Collect all question text IDs from same chapter and question type ***
const collectQuestionTextIds = (
  currentQuestionTextId: number,
  questionTypeId: number,
  chapterId: number
): number[] => {
  const questionTextIds: number[] = [currentQuestionTextId]
  
  console.log('Collecting question text IDs for:', {
    currentQuestionTextId,
    questionTypeId,
    chapterId
  })
  
  if (!questionsDistribution.value?.sectionAllocations) {
    console.log('No section allocations available')
    return questionTextIds
  }
  
  // Loop through all questions in the distribution
  for (const section of questionsDistribution.value.sectionAllocations) {
    for (const subsection of section.subsectionAllocations) {
      for (const chapter of subsection.allocatedChapters) {
        const question = chapter.question
        
        // Skip if no question or no question texts
        if (!question || !question.question_texts || question.question_texts.length === 0) {
          continue
        }
        
        // Skip the current question
        const questionTextId = question.question_texts[0].id
        if (questionTextId === currentQuestionTextId) {
          continue
        }
        
        // Only consider questions with the same question type
        if (question.question_type_id !== questionTypeId) {
          continue
        }
        
        // Get the chapter ID for this question
        let questionChapterId = chapter.chapterId
        
        // Try to get chapter ID from question if not available in chapter
        if (!questionChapterId && question.question_topics?.[0]) {
          questionChapterId = question.question_topics[0].topic?.chapter_id
        }
        
        if (!questionChapterId && question.question_texts?.[0]?.question_text_topics?.[0]) {
          const questionTextTopic = question.question_texts[0].question_text_topics[0]
          questionChapterId = questionTextTopic.question_topic?.topic?.chapter_id ||
                             questionTextTopic.question_topic?.chapter_id ||
                             questionTextTopic.chapter_id
        }
        
        // Only include questions from the same chapter
        if (questionChapterId === chapterId) {
          questionTextIds.push(questionTextId)
          console.log(`Added question text ID ${questionTextId} from same chapter ${chapterId}`)
        }
      }
    }
  }
  
  console.log(`Total question text IDs collected: ${questionTextIds.length}`)
  return questionTextIds
}

// New function to change all questions
const changeAllQuestions = async () => {
  console.log('Changing all questions')
  isChangingQuestions.value = true
  
  try {
    // Get the stored final questions distribution data
    const storedData = localStorage.getItem('finalQuestionsDistribution')
    if (!storedData) {
      throw new Error('No questions distribution data available')
    }
    
    const requestData = JSON.parse(storedData)
    console.log('Using stored data for new questions:', requestData)
    
    // Call the final questions distribution API again with the same data
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', requestData)
    
    if (response.data) {
      console.log('New questions received from API')
      
      // Update the stored data with new questions
      localStorage.setItem('finalQuestionsDistribution', JSON.stringify(response.data))
      
      // Update the local questionsDistribution
      questionsDistribution.value = response.data
      
      showSuccessToast('All questions changed successfully!')
    } else {
      throw new Error('No data received from API')
    }
  } catch (error: any) {
    console.error('Error changing all questions:', error)
    showErrorToast(error.message || 'Failed to change all questions. Please try again.')
  } finally {
    isChangingQuestions.value = false
  }
}

// New function to get option label
const getOptionLabel = (index: number) => {
  return String.fromCharCode(65 + index) // Returns A, B, C, D, etc.
}

// New function to parse chapters from query
const parseChaptersFromQuery = () => {
  if (!route.query.chapters) {
    return ''
  }
  
  try {
    // Decode the URL-encoded JSON string
    const decodedChapters = decodeURIComponent(route.query.chapters as string)
    const chaptersArray = JSON.parse(decodedChapters)
    
    // Extract chapter IDs and join them as comma-separated string
    const chapterIds = chaptersArray.map((chapter: any) => chapter.id).join(',')
    console.log('Parsed chapters:', chapterIds)
    return chapterIds
  } catch (error) {
    console.error('Error parsing chapters from query:', error)
    // Fallback: assume it's already a comma-separated string
    return route.query.chapters as string
  }
}
</script>

<style scoped>
/* Form styling */
.test-paper-form {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.form-label {
  color: #212529;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border-radius: 6px;
  border: 1px solid #ced4da;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  outline: 0;
}

.form-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Switch styling */
.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Button styling */
.btn {
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5c636a;
  border-color: #565e64;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Header styling */
.text-muted {
  color: #6c757d !important;
}

h4, h5 {
  font-weight: 600;
  color: #212529;
}

h5 {
  color: #0d6efd !important;
}

/* Close button styling */
.btn-close {
  transition: all 0.2s ease;
}

.btn-close:hover {
  transform: rotate(90deg);
}

/* Optional info styling */
.optional-info-marks-heading {
  background-color: rgba(0,0,0,0.1);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .test-paper-form {
    padding: 1.5rem;
  }
  
  h4 {
    font-size: 1.4rem;
  }
  
  .fs-5 {
    font-size: 1rem !important;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.justify-content-between .btn {
    width: 100%;
  }
}

@media (max-width: 576px) {
  h4 {
    font-size: 1.2rem;
  }
  
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .test-paper-form {
    padding: 1rem;
  }
}

/* Loading states */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Form validation styling */
.form-control:invalid {
  border-color: #dc3545;
}

.form-control:valid {
  border-color: #198754;
}

/* Disabled form controls during loading */
.form-control:disabled,
.form-check-input:disabled {
  background-color: #f8f9fa;
  opacity: 0.7;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.form-check-input:disabled + .form-check-label {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Animation for form elements */
.form-control, .form-select, .btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus ring improvements */
.form-control:focus,
.form-select:focus,
.form-check-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

/* Questions Distribution Styling */
.questions-distribution-container {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  margin-top: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.summary-card:nth-child(2) .summary-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-card:nth-child(3) .summary-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.summary-card:nth-child(4) .summary-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.summary-icon {
  font-size: 2rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.summary-content h6 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  display: block;
}

/* Table styling for distribution */
.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.02);
}

.table th {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge {
  font-size: 0.8rem;
  padding: 0.5em 0.75em;
}

/* Debug section styling */
details summary {
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

details[open] summary {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

pre code {
  font-size: 0.8rem;
  line-height: 1.4;
  max-height: 400px;
  overflow-y: auto;
}

/* Questions Preview Section Styling */
.questions-container {
  max-height: 625px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.75rem;
  background-color: #fafafa;
}

.question-item {
  background-color: transparent;
  border-radius: 0;
  border: none;
  box-shadow: none;
  transition: none;
  margin: 0;
  padding: 0;
}

.question-item:hover {
  box-shadow: none;
  transform: none;
}

.question-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin: 0;
  padding: 0;
  width: 100%;
}

.question-content {
  flex: 1;
}

.question-text {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
  line-height: 1.4;
  margin-bottom: 0.15rem;
}

.chapter-badge {
  background-color: #6c757d;
  color: white;
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
  white-space: nowrap;
  display: inline-block;
}

.options-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.options-column {
  flex: 1;
}

.option-item-column {
  display: flex;
  align-items: center;
  border-radius: 0;
  border: none;
  background: none;
  transition: background-color 0.3s ease;
}

.option-item-column:hover {
  background-color: transparent;
}

.option-item-column.correct-option {
  background-color: transparent !important;
  color: #1e7e34;
}

.option-item-column.correct-option:hover {
  background-color: transparent !important;
}

.option-item-column.correct-option .option-label,
.option-item-column.correct-option .option-text {
  color: #1e7e34;
  font-weight: 600;
}

.option-prefix {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.correct-tick {
  color: #1e7e34;
  font-size: 0.9rem;
}

.tick-placeholder {
  width: 16px;
  height: 16px;
  display: inline-block;
}

.option-label {
  font-weight: 600;
  margin-right: 0.5rem;
  min-width: 20px;
  color: #495057;
  font-size: 0.9rem;
}

.option-text {
  flex: 1;
  color: #212529;
  font-size: 0.9rem;
}

.question-marks {
  text-align: right;
}

.marks-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.marks {
  font-size: 0.9rem;
  font-weight: 500;
}

.shuffle-button {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.shuffle-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
  transform: translateY(-1px);
}

.shuffle-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.shuffle-button .bi {
  font-size: 0.875rem;
}

.question-divider {
  color: inherit;
  border: 0;
  border-top: var(--bs-border-width) solid;
  opacity: .25;
}

/* Responsive adjustments for questions */
@media (max-width: 768px) {
  .question-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .question-text {
    font-size: 0.9rem;
  }
  
  .questions-container {
    max-height: 400px;
    padding: 0.75rem;
  }
}

/* ===== ENHANCED LOADING DESIGN ===== */

/* Create Test Paper Button Loading States */
.btn-create-test {
  position: relative;
  min-width: 200px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.btn-create-test:active:not(:disabled) {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

.btn-create-test.loading {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7, #0d6efd);
  background-size: 200% 200%;
  animation: gradientShift 2s ease-in-out infinite;
  cursor: not-allowed;
  transform: none !important;
}

.btn-create-test .loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-create-test .loading-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.btn-create-test .normal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Form Loading Overlay */
.form-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInOverlay 0.2s ease-out;
  transition: opacity 0.3s ease-out;
}

.form-loading-overlay.success {
  background: rgba(240, 253, 244, 0.95);
  backdrop-filter: blur(12px);
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

/* Loading Spinner Container */
.loading-spinner-container {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(13, 110, 253, 0.1);
  animation: slideInUp 0.4s ease-out, subtlePulse 3s ease-in-out infinite 0.5s;
  transition: all 0.3s ease-out;
}

.form-loading-overlay.success .loading-spinner-container {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-color: rgba(25, 135, 84, 0.2);
  box-shadow: 0 20px 60px rgba(25, 135, 84, 0.15);
  animation: slideInUp 0.4s ease-out, successPulse 1s ease-in-out;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 20px 60px rgba(25, 135, 84, 0.15);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 25px 70px rgba(25, 135, 84, 0.25);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 20px 60px rgba(25, 135, 84, 0.15);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes subtlePulse {
  0%, 100% {
    transform: translateY(0) scale(1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
  }
}

/* Custom Loading Spinner */
.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #0d6efd;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #6610f2;
  animation-delay: 0.3s;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #20c997;
  animation-delay: 0.6s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(4) {
  border-left-color: #fd7e14;
  animation-delay: 0.9s;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Success Icon */
.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: successIconAppear 0.5s ease-out;
}

.success-icon i {
  font-size: 4rem;
  color: #198754;
  animation: successIconScale 0.6s ease-out;
}

@keyframes successIconAppear {
  from {
    opacity: 0;
    transform: scale(0.3) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes successIconScale {
  0% {
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Loading Text */
.loading-title {
  color: #212529;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  transition: color 0.3s ease-out;
}

.loading-message {
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
  transition: color 0.3s ease-out;
}

.form-loading-overlay.success .loading-title {
  color: #198754;
}

.form-loading-overlay.success .loading-message {
  color: #146c43;
}

/* Loading Progress Bar */
.loading-progress {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  transition: opacity 0.3s ease-out;
}

.form-loading-overlay.success .loading-progress {
  opacity: 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0d6efd, #6610f2, #20c997, #fd7e14);
  background-size: 200% 100%;
  border-radius: 3px;
  animation: progressMove 2s ease-in-out infinite;
}

@keyframes progressMove {
  0% {
    width: 0%;
    background-position: 0% 50%;
  }
  25% {
    width: 30%;
    background-position: 50% 50%;
  }
  50% {
    width: 60%;
    background-position: 100% 50%;
  }
  75% {
    width: 85%;
    background-position: 50% 50%;
  }
  100% {
    width: 100%;
    background-position: 0% 50%;
  }
}

/* Mobile Responsive Loading Design */
@media (max-width: 768px) {
  .loading-spinner-container {
    margin: 1rem;
    padding: 1.5rem;
    max-width: calc(100vw - 2rem);
  }
  
  .loading-spinner {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }
  
  .loading-title {
    font-size: 1.1rem;
  }
  
  .loading-message {
    font-size: 0.9rem;
  }
  
  .btn-create-test {
    min-width: 180px;
  }
  
  .btn-create-test .loading-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .loading-spinner {
    width: 50px;
    height: 50px;
  }
  
  .loading-title {
    font-size: 1rem;
  }
  
  .btn-create-test {
    min-width: 160px;
    padding: 0.6rem 1rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.justify-content-between .btn {
    width: 100%;
  }
}

/* Loading Animation for Button Text */
.loading-text {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Enhanced Focus States During Loading */
.btn-create-test:focus:not(:disabled) {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-create-test.loading:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.4);
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner,
  .spinner-ring,
  .progress-bar,
  .btn-create-test.loading,
  .loading-text {
    animation: none;
  }
  
  .form-loading-overlay {
    animation: none;
  }
  
  .loading-spinner-container {
    animation: none;
  }
}

/* Page transition animations */
.container {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.container.page-leaving {
  opacity: 0;
  transform: translateY(-10px);
}

/* Enhanced loading overlay with faster transitions */
.form-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInOverlay 0.2s ease-out;
  transition: opacity 0.3s ease-out;
}

.form-loading-overlay.success {
  background: rgba(240, 253, 244, 0.95);
  backdrop-filter: blur(12px);
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}
</style> 