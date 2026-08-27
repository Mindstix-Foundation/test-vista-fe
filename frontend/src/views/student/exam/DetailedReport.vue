<template>
  <div class="detailed-report-page">
    <AppBreadcrumb />
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="container">
        <div class="text-center">
          <output class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading detailed report...</span>
          </output>
          <p class="loading-text mt-3">Loading your detailed exam report...</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="container">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Error Loading Report</h4>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="retryLoadReport">
            <i class="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2><i class="bi bi-file-text"></i> Detailed Report</h2>
              <p class="mb-0">{{ detailedReport.result?.title || 'Exam' }} - Question-by-question analysis</p>
            </div>
            <button class="back-button" @click="goBack">
              <i class="bi bi-arrow-left"></i> Back to Results
            </button>
          </div>
        </div>

        <!-- Summary Statistics -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number stat-total">{{ detailedReport.result?.total_questions || 0 }}</div>
            <div class="text-muted">Total Questions</div>
          </div>
          <div class="stat-card">
            <div class="stat-number stat-correct">{{ detailedReport.result?.correct_answers || 0 }}</div>
            <div class="text-muted">Correct</div>
          </div>
          <div class="stat-card">
            <div class="stat-number stat-incorrect">{{ detailedReport.result?.wrong_answers || 0 }}</div>
            <div class="text-muted">Incorrect</div>
          </div>
          <div class="stat-card">
            <div class="stat-number stat-unanswered">{{ skippedQuestions }}</div>
            <div class="text-muted">Unanswered</div>
          </div>
        </div>

        <!-- Summary Card -->
        <div class="summary-card">
          <h4 class="mb-3"><i class="bi bi-graph-up"></i> Performance Summary</h4>
          <div class="row">
            <div class="col-md-2 col-6 text-center">
              <h3 class="text-primary">{{ detailedReport.result?.percentage || 0 }}%</h3>
              <small class="text-muted">Final Score</small>
            </div>
            <div class="col-md-2 col-6 text-center">
              <h3 class="text-info">{{ detailedReport.result?.obtained_marks || 0 }}/{{ detailedReport.result?.total_marks || 0 }}</h3>
              <small class="text-muted">Marks Obtained</small>
            </div>
            <div class="col-md-2 col-6 text-center">
              <h3 class="text-warning">{{ formatTime(detailedReport.result?.time_taken_seconds || 0) }}</h3>
              <small class="text-muted">Total Time</small>
            </div>
            <div class="col-md-2 col-6 text-center">
              <h3 class="text-success">{{ calculatedAccuracy }}%</h3>
              <small class="text-muted">Accuracy</small>
            </div>
            <div class="col-md-2 col-6 text-center">
              <h3 class="text-secondary">{{ formatTime(averageTimePerQuestion) }}</h3>
              <small class="text-muted">Avg per Question</small>
            </div>
            <div class="col-md-2 col-6 text-center">
              <h3 class="text-dark">{{ detailedReport.result?.attempted_questions || 0 }}/{{ detailedReport.result?.total_questions || 0 }}</h3>
              <small class="text-muted">Attempted</small>
            </div>
          </div>
        </div>

        <!-- Questions List -->
        <div class="row">
          <div class="col-12">
            <h4 class="mb-3"><i class="bi bi-list-ol"></i> Question Analysis</h4>
            <div id="questionsList">
              <div 
                v-for="(question, index) in detailedReport.questions || []" 
                :key="question.question_id"
                class="question-card"
                :class="getQuestionCardClass(question)"
              >
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="question-number">{{ index + 1 }}</div>
                  <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-clock text-info"></i>
                      <span class="fw-bold text-info">{{ formatTime(question.time_spent_seconds || 0) }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <i :class="getStatusIcon(question)"></i>
                      <span class="fw-bold">{{ getStatusText(question) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="question-text" v-html="question.question_text"></div>
                
                <!-- Question Image -->
                <div v-if="question.question_image" class="question-image mt-2 mb-3">
                  <img :src="question.question_image" :alt="'Question ' + (index + 1)" class="img-fluid">
                </div>

                <!-- Options -->
                <div class="options-container">
                  <div 
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    class="option-item"
                    :class="getOptionClass(question, optionIndex)"
                  >
                    <div class="d-flex align-items-start">
                      <div class="option-label me-2">
                        {{ String.fromCharCode(65 + optionIndex) }}.
                      </div>
                      <div class="option-content flex-grow-1">
                        <span v-html="option"></span>
                        <img v-if="question.option_images && question.option_images[optionIndex]" :src="question.option_images[optionIndex]" :alt="'Option ' + String.fromCharCode(65 + optionIndex)" class="option-image mt-1">
                      </div>
                      <div class="result-icon ms-2" v-html="getOptionIcon(question, optionIndex)"></div>
                    </div>
                  </div>
                </div>

                <!-- Unanswered Alert -->
                <div v-if="!question.selected_option" class="alert alert-warning mt-3 mb-0">
                  <i class="bi bi-exclamation-triangle"></i> This question was not answered.
                </div>

                <!-- Explanation (if available) -->
                <div v-if="question.explanation" class="explanation mt-3">
                  <h6 class="text-info">
                    <i class="bi bi-lightbulb"></i> Explanation:
                  </h6>
                  <p class="text-muted" v-html="question.explanation"></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center mt-4 mb-5">
          <button class="btn btn-outline-secondary btn-lg" @click="goBack">
            <i class="bi bi-arrow-left"></i> Back to Results
          </button>
        </div>
      </div>
    </div>

    <!-- Leave Confirmation Modal -->
    <div class="modal" :class="{ show: showLeaveConfirmation }" tabindex="-1" style="display: block;" v-if="showLeaveConfirmation">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle"></i> Confirm Navigation
            </h5>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to leave the detailed report?</p>
            <p class="text-muted">You can always view this report later from the exam history.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cancelLeave">
              <i class="bi bi-x-circle"></i> Cancel
            </button>
            <button class="btn btn-warning" @click="confirmLeave">
              <i class="bi bi-check-circle"></i> Yes, Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import testAssignmentService from '@/services/testAssignmentService'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import { useExamSessionGuard } from '@/composables/useExamSessionGuard'

// Types
interface Question {
  question_id: number
  question_text: string
  question_image?: string
  options: string[]
  option_images?: string[]
  correct_option: number
  selected_option?: string
  selected_option_index?: number
  is_correct: boolean
  time_spent_seconds: number
  explanation?: string
}

interface ExamResult {
  title: string
  total_questions: number
  correct_answers: number
  wrong_answers: number
  attempted_questions: number
  total_marks: number
  obtained_marks: number
  percentage: number
  time_taken_seconds: number
}

interface DetailedReport {
  result: ExamResult
  questions: Question[]
}


const route = useRoute()
const router = useRouter()

// Reactive data
const isLoading = ref(true)
const error = ref('')
const detailedReport = ref<DetailedReport>({} as DetailedReport)

const {
  isIOSDevice,
  showLeaveConfirmation,
  detectDevice,
  exitFullscreen,
  blockBackNavigation,
} = useExamSessionGuard()

// Computed properties
const calculatedAccuracy = computed(() => {
  const attempted = detailedReport.value.result?.attempted_questions || 0
  const correct = detailedReport.value.result?.correct_answers || 0
  if (attempted === 0) return 0
  return Math.round((correct / attempted) * 100)
})

const averageTimePerQuestion = computed(() => {
  const totalTime = detailedReport.value.result?.time_taken_seconds || 0
  const totalQuestions = detailedReport.value.result?.total_questions || 1
  return Math.round(totalTime / totalQuestions)
})

const skippedQuestions = computed(() => {
  const total = detailedReport.value.result?.total_questions || 0
  const attempted = detailedReport.value.result?.attempted_questions || 0
  return total - attempted
})

// Methods
const loadDetailedReport = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const attemptId = route.query.attemptId
    console.log('Loading detailed report for attemptId:', attemptId)
    
    if (!attemptId) {
      throw new Error('Attempt ID is required')
    }

    const report = await testAssignmentService.getDetailedReport(attemptId)
    console.log('Detailed Report API Response:', report)
    
    detailedReport.value = report
    console.log('Detailed report data mapped:', detailedReport.value)
    
  } catch (err: unknown) {
    console.error('Error loading detailed report:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to load detailed report'
    const axiosError = err as { response?: { data?: { message?: string } } }
    error.value = axiosError.response?.data?.message ?? errorMessage
  } finally {
    isLoading.value = false
  }
}

const retryLoadReport = () => {
  loadDetailedReport()
}

const formatTime = (seconds: number): string => {
  if (!seconds) return '0s'
  
  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

const getQuestionCardClass = (question: Question): string => {
  if (!question.selected_option) return 'unanswered'
  return question.is_correct ? 'correct' : 'incorrect'
}

const getStatusIcon = (question: Question): string => {
  if (!question.selected_option) return 'bi bi-dash-circle text-warning'
  return question.is_correct ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'
}

const getStatusText = (question: Question): string => {
  if (!question.selected_option) return 'Not Answered'
  return question.is_correct ? 'Correct' : 'Incorrect'
}

const getSelectedOptionIndex = (question: Question): number => {
  // Use the selected_option_index from the API response if available
  if (question.selected_option_index !== undefined && question.selected_option_index !== -1) {
    return question.selected_option_index;
  }
  
  // Fallback: if selected_option_index is not available, return -1 (not answered)
  return -1;
}

const getOptionClass = (question: Question, optionIndex: number): string => {
  const correctOptionIndex = question.correct_option
  const selectedOptionIndex = getSelectedOptionIndex(question)
  
  if (optionIndex === correctOptionIndex) {
    return 'option-correct'
  } else if (question.selected_option && optionIndex === selectedOptionIndex && !question.is_correct) {
    return 'option-user-incorrect'
  }
  return ''
}

const getOptionIcon = (question: Question, optionIndex: number): string => {
  const correctOptionIndex = question.correct_option
  const selectedOptionIndex = getSelectedOptionIndex(question)
  
  if (optionIndex === correctOptionIndex) {
    return '<i class="bi bi-check-circle text-success"></i>'
  } else if (question.selected_option && optionIndex === selectedOptionIndex && !question.is_correct) {
    return '<i class="bi bi-x-circle text-danger"></i>'
  }
  return ''
}

const goBack = () => {
  router.push({
    path: '/student/exam/result',
    query: { attemptId: route.query.attemptId }
  })
}

const confirmLeave = () => {
  showLeaveConfirmation.value = false
  router.push('/student/exam')
}

const cancelLeave = () => {
  showLeaveConfirmation.value = false
}

// Lifecycle hooks
onMounted(() => {
  loadDetailedReport()
  detectDevice()
  exitFullscreen()
  blockBackNavigation()
})

onUnmounted(() => {
  // Clean up event listeners if needed
})
</script>

<style scoped>
/* Bootstrap Icons */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css');

.detailed-report-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px 0;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 30px;
  margin: 30px 0;
}

.back-button {
  background: linear-gradient(45deg, #6c757d, #495057);
  border: none;
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: linear-gradient(45deg, #5a6268, #3d4142);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
}

.stat-correct { color: #28a745; }
.stat-incorrect { color: #dc3545; }
.stat-unanswered { color: #ffc107; }
.stat-total { color: #007bff; }

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #dee2e6;
}

.question-card.correct {
  border-left-color: #28a745;
  background: linear-gradient(90deg, rgba(40, 167, 69, 0.05), white);
}

.question-card.incorrect {
  border-left-color: #dc3545;
  background: linear-gradient(90deg, rgba(220, 53, 69, 0.05), white);
}

.question-card.unanswered {
  border-left-color: #ffc107;
  background: linear-gradient(90deg, rgba(255, 193, 7, 0.05), white);
}

.question-number {
  background: #007bff;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 15px;
}

.question-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.option-item {
  padding: 12px 15px;
  margin: 8px 0;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-correct {
  background-color: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.option-user-incorrect {
  background-color: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.option-label {
  font-weight: bold;
  min-width: 25px;
}

.result-icon {
  font-size: 1.5rem;
  margin-left: auto;
}

.flex-grow-1 {
  flex-grow: 1;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  max-width: 500px;
  width: 90%;
}

.modal-content {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-footer .btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
    margin: 20px 0;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .summary-card .row .col-md-2 {
    margin-bottom: 15px;
  }
  
  .question-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .summary-card {
    padding: 20px;
  }
  
  .summary-card .row .col-6 {
    margin-bottom: 20px;
  }
  
  .question-card {
    padding: 15px;
  }
  
  .question-number {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
}
</style> 