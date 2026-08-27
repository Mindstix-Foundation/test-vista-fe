<template>
  <div class="result-page">
    <AppBreadcrumb />
    <!-- Loading Spinner -->
    <LoadingSpinner :show="isLoading" :showOverlay="true" />

    <!-- Error State -->
    <div v-if="!isLoading && error" class="error-container">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error Loading Results</h4>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="retryLoadResults">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    </div>

    <!-- Main Results -->
    <div v-if="!isLoading && !error" class="container mt-4 mb-5">
      <div class="result-container">
        <!-- Congratulations Header -->
        <div class="text-center mb-4">
          <h2 class="fw-bold text-success">
            <i class="bi bi-trophy-fill"></i> Exam Completed!
          </h2>
          <p class="text-muted">Here are your detailed results</p>
        </div>

        <!-- Score Card -->
        <div class="score-card">
          <div class="score-header">
            <h3 class="exam-title">{{ result.title }}</h3>
            <p class="performance-text">{{ getPerformanceText(displayPercentage) }}</p>
          </div>
          
          <div class="score-metrics">
            <div class="metric-card marks-card" ref="scoreCircle">
              <div class="metric-icon">
                <i class="bi bi-award-fill"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value">
                  <span class="obtained-marks">{{ displayObtainedMarks }}</span>
                  <span class="total-marks">/{{ result.total_marks }}</span>
                </div>
                <div class="metric-label">Marks Obtained</div>
              </div>
            </div>
            
            <div class="metric-card percentage-card">
              <div class="metric-icon">
                <i class="bi bi-percent"></i>
              </div>
              <div class="metric-content">
                <div class="metric-value percentage-value">{{ displayPercentage }}%</div>
                <div class="metric-label">Score Percentage</div>
              </div>
                         </div>
           </div>
           
          <div class="row stats-row">
            <div class="col-lg col-md-4 col-6 mb-3">
              <i class="bi bi-list-ul d-block mb-2"></i>
              <strong class="stat-number">{{ result.total_questions }}</strong>
              <small class="d-block stat-label">Total Questions</small>
            </div>
            <div class="col-lg col-md-4 col-6 mb-3">
              <i class="bi bi-pencil-fill d-block mb-2"></i>
              <strong class="stat-number">{{ result.attempted_questions }}</strong>
              <small class="d-block stat-label">Attempted Questions</small>
            </div>
            <div class="col-lg col-md-4 col-6 mb-3">
              <i class="bi bi-check-circle-fill d-block mb-2"></i>
              <strong class="stat-number">{{ result.correct_answers }}</strong>
              <small class="d-block stat-label">Correct</small>
            </div>
            <div class="col-lg col-md-4 col-6 mb-3">
              <i class="bi bi-x-circle-fill d-block mb-2"></i>
              <strong class="stat-number">{{ result.wrong_answers }}</strong>
              <small class="d-block stat-label">Wrong</small>
            </div>
            <div class="col-lg col-md-4 col-6 mb-3">
              <i class="bi bi-bullseye d-block mb-2"></i>
              <strong class="stat-number">{{ displayAccuracy }}%</strong>
              <small class="d-block stat-label">Accuracy</small>
            </div>
            <div class="col-lg col-md-4 col-6 mb-3">
              <i class="bi bi-award-fill d-block mb-2"></i>
              <strong class="stat-number">{{ displayPercentage }}%</strong>
              <small class="d-block stat-label">Score Percentage</small>
            </div>
            <div class="col-lg col-md-4 col-12 mb-3">
              <i class="bi bi-clock-fill d-block mb-2"></i>
              <strong class="stat-number">{{ formatTime(result.time_taken_seconds) }}</strong>
              <small class="d-block stat-label">Time Taken</small>
            </div>
          </div>

          <!-- Rank / Percentile / Qualification (competitive & entrance mocks) -->
          <div v-if="result.rank || result.percentile != null || (result.overall_qualified !== null && result.overall_qualified !== undefined)" class="rank-strip">
            <div v-if="result.rank" class="rank-item">
              <i class="bi bi-bar-chart-steps me-2"></i>
              <span>Rank <strong>{{ result.rank }}</strong> of {{ result.total_participants }}</span>
            </div>
            <div v-if="result.percentile !== undefined && result.percentile !== null" class="rank-item">
              <i class="bi bi-graph-up-arrow me-2"></i>
              <span><strong>{{ result.percentile }}</strong> percentile</span>
            </div>
            <div v-if="result.overall_qualified !== null && result.overall_qualified !== undefined" class="rank-item">
              <i :class="result.overall_qualified ? 'bi bi-patch-check-fill text-success' : 'bi bi-x-octagon-fill text-danger'" class="me-2"></i>
              <span :class="result.overall_qualified ? 'text-success' : 'text-danger'">
                <strong>{{ result.overall_qualified ? 'Qualified' : 'Not Qualified' }}</strong> (cutoff)
              </span>
            </div>
          </div>
        </div>

        <!-- Section-wise Performance (competitive & entrance mocks) -->
        <div v-if="result.section_wise_scores && result.section_wise_scores.length > 0" class="chapter-analysis-section">
          <div class="section-header">
            <h4 class="section-title">
              <i class="bi bi-layout-three-columns"></i> Section-wise Performance
            </h4>
          </div>
          <div class="chapter-table-container">
            <table class="table chapter-table">
              <thead>
                <tr>
                  <th scope="col">Section</th>
                  <th scope="col" class="text-center">Questions</th>
                  <th scope="col" class="text-center">Attempted</th>
                  <th scope="col" class="text-center">Score</th>
                  <th scope="col" class="text-center">Cutoff</th>
                  <th scope="col" class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="section in result.section_wise_scores" :key="section.name" class="chapter-row">
                  <td class="chapter-name-cell"><strong>{{ section.name }}</strong></td>
                  <td class="text-center"><span class="stat-number">{{ section.questions }}</span></td>
                  <td class="text-center"><span class="stat-number">{{ section.attempted }}</span></td>
                  <td class="text-center">
                    <span class="stat-number">{{ section.obtained }}</span>
                    <small class="text-muted">/{{ section.total }}</small>
                  </td>
                  <td class="text-center">
                    <span class="stat-number">{{ section.qualifying_marks ?? '—' }}</span>
                  </td>
                  <td class="text-center">
                    <span v-if="section.qualified === null" class="text-muted">—</span>
                    <span v-else class="performance-badge" :class="section.qualified ? 'badge-excellent' : 'badge-poor'">
                      {{ section.qualified ? 'Cleared' : 'Below Cutoff' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Chapter-wise Performance Analysis -->
        <div v-if="result.chapter_wise_analysis && result.chapter_wise_analysis.length > 0" class="chapter-analysis-section">
          <div class="section-header">
            <h4 class="section-title">
              <i class="bi bi-bar-chart-fill"></i> Chapter-wise Performance
            </h4>
            
            <!-- Sorting Controls -->
            <div class="sorting-controls">
              <div class="sort-label">
                <i class="bi bi-funnel me-2"></i>
                <span>Sort by:</span>
              </div>
              <div class="sort-options">
                <button 
                  class="sort-option"
                  :class="{ active: sortBy === 'sequence' }"
                  @click="sortChapters('sequence')"
                >
                  <i class="bi bi-list-ol me-2"></i>
                  <span>Chapter Order</span>
                </button>
                <button 
                  class="sort-option"
                  :class="{ active: sortBy === 'score' }"
                  @click="sortChapters('score')"
                >
                  <i class="bi bi-trophy me-2"></i>
                  <span>Performance</span>
                </button>
              </div>
            </div>
          </div>

          <div class="chapter-table-container">
            <table class="table chapter-table">
              <thead>
                <tr>
                  <th scope="col">Chapter</th>
                  <th scope="col">Total Questions</th>
                  <th scope="col">Attempted</th>
                  <th scope="col">Correct</th>
                  <th scope="col">Wrong</th>
                  <th scope="col">Performance</th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="chapter in sortedChapters" 
                  :key="chapter.chapterName"
                  class="chapter-row"
                  :class="getChapterRowClass(chapter.performanceLevel)"
                >
                  <td class="chapter-name-cell">
                    <strong>{{ chapter.chapterName }}</strong>
                  </td>
                  <td class="text-center">
                    <span class="stat-number">{{ chapter.total }}</span>
                  </td>
                  <td class="text-center">
                    <span class="stat-number">{{ chapter.total - chapter.skipped }}</span>
                  </td>
                  <td class="text-center">
                    <span class="stat-number correct-count">{{ chapter.correct }}</span>
                  </td>
                  <td class="text-center">
                    <span class="stat-number wrong-count">{{ chapter.wrong }}</span>
                  </td>
                  <td class="text-center">
                    <span class="performance-badge" :class="getPerformanceBadgeClass(chapter.performanceLevel)">
                      {{ chapter.performanceLevel }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="score-cell">
                      <span class="percentage">{{ chapter.percentage }}%</span>
                      <div class="progress-bar-small">
                        <div 
                          class="progress-fill-small" 
                          :style="{ width: chapter.percentage + '%' }"
                          :class="getProgressBarClass(chapter.performanceLevel)"
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Strengths and Weaknesses -->
        <div v-if="result.strengths || result.weaknesses" class="strengths-weaknesses-section">
          <div v-if="result.strengths && result.strengths.length > 0" class="strength-card">
            <h5 class="card-title">
              <i class="bi bi-star-fill"></i> Your Strengths
            </h5>
            <ul class="strength-list">
              <li v-for="strength in result.strengths" :key="strength">
                <i class="bi bi-check-circle-fill text-success"></i>
                {{ strength }}
              </li>
            </ul>
          </div>
          <div v-if="result.weaknesses && result.weaknesses.length > 0" class="weakness-card">
            <h5 class="card-title">
              <i class="bi bi-exclamation-triangle-fill"></i> Areas for Improvement
            </h5>
            <ul class="weakness-list">
              <li v-for="weakness in result.weaknesses" :key="weakness">
                <i class="bi bi-x-circle-fill text-danger"></i>
                {{ weakness }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="result.recommendations && result.recommendations.length > 0" class="recommendations-section">
          <h4 class="section-title">
            <i class="bi bi-lightbulb-fill"></i> Personalized Recommendations
          </h4>
          <div class="recommendations-grid">
            <div v-for="recommendation in result.recommendations" :key="recommendation" class="recommendation-item" :class="getRecommendationClass(recommendation)">
              <div class="recommendation-body">
                <h5 class="recommendation-title">{{ getRecommendationType(recommendation) }}</h5>
                <div class="recommendation-chapters">
                  <strong>{{ getRecommendationChapters(recommendation) }}</strong>
                </div>
                <p class="recommendation-text">{{ getRecommendationMessage(recommendation) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning for missing detailed report -->
        <div v-if="result && !detailedReport" class="detailed-analysis-section">
          <div class="alert alert-warning" role="alert">
            <h5 class="alert-heading">
              <i class="bi bi-exclamation-triangle-fill"></i> Detailed Analysis 
              <span v-if="isLoadingDetailedReport">Loading...</span>
              <span v-else>Unavailable</span>
            </h5>
            <p class="mb-2" v-if="isLoadingDetailedReport">
              Your exam results are ready! The detailed question-by-question analysis is being loaded...
            </p>
            <p class="mb-2" v-else>
              Your exam results are ready, but the detailed question-by-question analysis is still being processed.
            </p>
            <button 
              class="btn btn-warning btn-sm" 
              @click="retryLoadResults"
              :disabled="isLoadingDetailedReport"
            >
              <output v-if="isLoadingDetailedReport" class="spinner-border spinner-border-sm me-2"></output>
              <i class="bi bi-arrow-clockwise" v-else></i> 
              {{ isLoadingDetailedReport ? 'Loading...' : 'Load Detailed Analysis' }}
            </button>
          </div>
        </div>

        <!-- Detailed Question Analysis -->
        <div v-if="detailedReport && detailedReport.questions" class="detailed-analysis-section">
          <h4 class="section-title">
            <i class="bi bi-list-check"></i> Question-wise Analysis
          </h4>
          <div class="questions-container">
            <div 
              v-for="(question, index) in detailedReport.questions" 
              :key="question.question_id"
              class="question-card"
              :class="getQuestionCardClass(question)"
            >
              <div class="question-header">
                <span class="question-number">Q{{ index + 1 }}</span>
                <span class="question-status" :class="getQuestionStatusClass(question)">
                  <i :class="getQuestionStatusIcon(question)"></i>
                  {{ getQuestionStatusText(question) }}
                </span>
                <div class="question-info">
                  <span class="question-marks">{{ question.marks_obtained }} marks</span>
                  <span class="question-time" v-if="question.time_spent_seconds !== undefined && question.time_spent_seconds !== null">
                    <i class="bi bi-clock"></i> {{ formatTime(question.time_spent_seconds) }}
                  </span>
                </div>
              </div>
              <div class="question-content">
                <div v-if="question.passage_text" class="passage-panel mb-3">
                  <div class="passage-label">
                    Passage
                    <span v-if="question.group_order" class="text-muted">
                      (Part {{ question.group_order }})
                    </span>
                  </div>
                  <p class="passage-text">{{ question.passage_text }}</p>
                </div>
                <p class="question-text">{{ question.question_text }}</p>
                <div v-if="question.question_image" class="question-image">
                  <img :src="question.question_image" alt="Question" class="img-fluid">
                </div>
              </div>
              <div class="options-container">
                <div v-if="!isQuestionAttempted(question)" class="not-attempted-message">
                  <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                  <span>This question was not attempted</span>
                </div>
                <template v-if="question.answer_format === 'NUMERIC'">
                  <div class="option-item" :class="question.is_correct === true ? 'option-correct' : (isQuestionAttempted(question) ? 'option-wrong' : '')">
                    <span class="option-label">Your answer:</span>
                    <span class="option-text">{{ isQuestionAttempted(question) ? question.numeric_answer : '—' }}</span>
                  </div>
                  <div class="option-item option-correct">
                    <span class="option-label">Correct:</span>
                    <span class="option-text">{{ question.correct_numeric ?? '—' }}</span>
                    <span class="correct-indicator">
                      <i class="bi bi-check-circle-fill text-success"></i>
                    </span>
                  </div>
                </template>
                <template v-else>
                  <div 
                    v-for="(option, optionIndex) in question.options" 
                    :key="optionIndex"
                    class="option-item"
                    :class="getOptionClass(optionIndex, question.correct_option, question.selected_option_index)"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                    <span class="option-text">{{ option }}</span>
                    <span v-if="optionIndex === question.correct_option" class="correct-indicator">
                      <i class="bi bi-check-circle-fill text-success"></i>
                    </span>
                    <span v-if="optionIndex === question.selected_option_index && optionIndex !== question.correct_option && question.selected_option_index !== -1" class="wrong-indicator">
                      <i class="bi bi-x-circle-fill text-danger"></i>
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center mt-5">
          <button class="btn btn-primary btn-lg" @click="backToExams">
            <i class="bi bi-house"></i> Back to Home
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
            <p>Are you sure you want to leave the results page?</p>
            <p class="text-muted">You can always view your results later from the exam history.</p>
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
import { testAssignmentService, type ExamResult, type DetailedReport } from '@/services/testAssignmentService'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import {
  getRecommendationType,
  getRecommendationChapters,
  getRecommendationMessage,
  getRecommendationClass,
} from '@/utils/recommendationParsing'
import { useExamSessionGuard } from '@/composables/useExamSessionGuard'

// Component name
defineOptions({
  name: 'ExamResult'
})

// Types
interface Question {
  question_id: number
  question_text: string
  question_image?: string
  options: string[]
  correct_option: number
  selected_option: string | null
  selected_option_index: number
  is_correct: boolean
  marks_obtained: number
  time_spent_seconds?: number
  answer_format?: 'MCQ' | 'NUMERIC'
  numeric_answer?: number | null
  correct_numeric?: number | null
  question_group_id?: number | null
  group_order?: number | null
  passage_text?: string | null
}


interface HttpError extends Error {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

const route = useRoute()
const router = useRouter()

// Reactive data
const isLoading = ref(true)
const error = ref('')
const result = ref<ExamResult>({} as ExamResult)
const detailedReport = ref<DetailedReport | null>(null)
const scoreCircle = ref<HTMLElement>()
const isLoadingDetailedReport = ref(false)
const sortBy = ref('sequence')

const {
  isIOSDevice,
  showLeaveConfirmation,
  detectDevice,
  exitFullscreen,
  blockBackNavigation,
} = useExamSessionGuard()

// Computed properties for display
const displayObtainedMarks = computed(() => {
  return result.value.obtained_marks
})

const displayPercentage = computed(() => {
  return Number.parseFloat(result.value.percentage || 0).toFixed(2)
})

const displayAccuracy = computed(() => {
  if (result.value.attempted_questions && result.value.attempted_questions > 0) {
    return ((result.value.correct_answers / result.value.attempted_questions) * 100).toFixed(2)
  }
  return '0.00'
})

const sortedChapters = computed(() => {
  if (!result.value.chapter_wise_analysis || !Array.isArray(result.value.chapter_wise_analysis)) {
    return []
  }
  
  const chapters = [...result.value.chapter_wise_analysis]
  
  if (sortBy.value === 'sequence') {
    // Sort by sequence number (syllabus order)
    return chapters.sort((a, b) => (a.sequenceNumber || 999) - (b.sequenceNumber || 999))
  } else if (sortBy.value === 'score') {
    // Sort by percentage (highest first)
    return chapters.sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
  }
  
  return chapters
})

// Methods
const loadExamResult = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const attemptId = route.query.attemptId
    console.log('Loading exam result for attemptId:', attemptId)
    
    if (!attemptId) {
      throw new Error('Attempt ID is required')
    }
    
    // Convert attemptId to number, handling both string and array cases
    const attemptIdNumber = Array.isArray(attemptId) ? Number(attemptId[0]) : Number(attemptId)
    
    // Load basic result first
    const examResult = await testAssignmentService.getExamResult(attemptIdNumber)
    console.log('API Response - Result:', examResult)
    result.value = examResult
    
    // Animate score after basic result is loaded
    setTimeout(() => {
      animateScore()
    }, 100)
    
    // Load detailed report separately with retry mechanism
    await loadDetailedReportWithRetry(attemptIdNumber)
    
  } catch (err: unknown) {
    console.error('Error loading exam result:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to load exam results'
    error.value = errorMessage
  } finally {
    isLoading.value = false
  }
}

const loadDetailedReportWithRetry = async (attemptId: number, retryCount = 0) => {
  const maxRetries = 3
  const retryDelay = 1000 // 1 second
  
  if (retryCount === 0) {
    isLoadingDetailedReport.value = true
  }
  
  try {
    const detailedReportData = await testAssignmentService.getDetailedReport(attemptId)
    console.log('API Response - Detailed Report:', detailedReportData)
    detailedReport.value = detailedReportData
    isLoadingDetailedReport.value = false
  } catch (err: unknown) {
    console.error(`Error loading detailed report (attempt ${retryCount + 1}):`, err)
    
    // If we haven't reached max retries and it's a 400 error (likely processing delay), retry
    if (retryCount < maxRetries && err instanceof Error && 'response' in err) {
      const response = (err as HttpError).response
      if (response?.status === 400 || response?.status === 404) {
      console.log(`Retrying detailed report in ${retryDelay}ms...`)
      setTimeout(() => {
        loadDetailedReportWithRetry(attemptId, retryCount + 1)
      }, retryDelay)
        return
      }
    }
    
      console.warn('Failed to load detailed report after retries, continuing without it')
      isLoadingDetailedReport.value = false
      // Don't throw error here, just log it - the basic result is already loaded
  }
}

const retryLoadResults = () => {
  // If basic result is already loaded, just retry the detailed report
  if (result.value && !detailedReport.value) {
    const attemptId = route.query.attemptId
    const attemptIdNumber = Array.isArray(attemptId) ? Number(attemptId[0]) : Number(attemptId)
    loadDetailedReportWithRetry(attemptIdNumber)
  } else {
    // Otherwise, reload everything
    loadExamResult()
  }
}

const backToExams = () => {
  router.push('/student/exam')
}

const sortChapters = (sortType: 'sequence' | 'score') => {
  console.log('Sorting chapters by:', sortType)
  sortBy.value = sortType
}

const getAttemptedCount = (analysis: any) => {
  // Calculate attempted as total - skipped
  return (analysis.total || 0) - (analysis.skipped || 0)
}

const formatTime = (seconds: number): string => {
  if (!seconds) return '0m 0s'
  
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  return `${minutes}m ${secs}s`
}

const getPerformanceText = (percentage: number): string => {
  if (percentage >= 70) return 'Excellent Performance!'
  if (percentage >= 50) return 'Good Performance!'
  if (percentage >= 30) return 'Average Performance'
  return 'Needs Improvement'
}

const getChapterRowClass = (performanceLevel: string): string => {
  switch (performanceLevel) {
    case 'excellent': return 'chapter-excellent'
    case 'good': return 'chapter-good'
    case 'average': return 'chapter-average'
    default: return 'chapter-poor'
  }
}

const getPerformanceBadgeClass = (performanceLevel: string): string => {
  switch (performanceLevel) {
    case 'excellent': return 'badge-excellent'
    case 'good': return 'badge-good'
    case 'average': return 'badge-average'
    default: return 'badge-poor'
  }
}

const getProgressBarClass = (performanceLevel: string): string => {
  switch (performanceLevel) {
    case 'excellent': return 'progress-excellent'
    case 'good': return 'progress-good'
    case 'average': return 'progress-average'
    default: return 'progress-poor'
  }
}

const isQuestionAttempted = (question: Question): boolean => {
  if (question.answer_format === 'NUMERIC') {
    return question.numeric_answer !== null && question.numeric_answer !== undefined
  }
  return question.selected_option !== null && question.selected_option !== undefined
}

const getQuestionCardClass = (question: Question): string => {
  if (!isQuestionAttempted(question)) return 'question-skipped'
  if (question.is_correct === true) return 'question-correct'
  if (question.is_correct === false) return 'question-wrong'
  return 'question-skipped'
}

const getQuestionStatusClass = (question: Question): string => {
  if (!isQuestionAttempted(question)) return 'status-skipped'
  if (question.is_correct === true) return 'status-correct'
  if (question.is_correct === false) return 'status-wrong'
  return 'status-skipped'
}

const getQuestionStatusIcon = (question: Question): string => {
  if (!isQuestionAttempted(question)) return 'bi bi-dash-circle-fill'
  if (question.is_correct === true) return 'bi bi-check-circle-fill'
  if (question.is_correct === false) return 'bi bi-x-circle-fill'
  return 'bi bi-dash-circle-fill'
}

const getQuestionStatusText = (question: Question): string => {
  if (!isQuestionAttempted(question)) return 'Not Attempted'
  if (question.is_correct === true) return 'Correct'
  if (question.is_correct === false) return 'Wrong'
  return 'Not Attempted'
}

const getOptionClass = (optionIndex: number, correctOption: number, selectedOption: number): string => {
  if (optionIndex === correctOption) return 'option-correct'
  if (selectedOption !== -1 && optionIndex === selectedOption && optionIndex !== correctOption) return 'option-wrong'
  if (selectedOption !== -1 && optionIndex === selectedOption) return 'option-selected'
  return ''
}

const animateScore = () => {
  if (!scoreCircle.value) return
  
  let currentMarks = 0
  let currentPercentage = 0
  const targetMarks = displayObtainedMarks.value || 0
  const targetPercentage = Number.parseFloat(displayPercentage.value) || 0
  const marksIncrement = targetMarks / 50
  const percentageIncrement = targetPercentage / 50
  
  const timer = setInterval(() => {
    currentMarks += marksIncrement
    currentPercentage += percentageIncrement
    
    if (currentMarks >= targetMarks) {
      currentMarks = targetMarks
      currentPercentage = targetPercentage
      clearInterval(timer)
    }
    
    // Update the marks display
    const obtainedMarksEl = document.querySelector('.obtained-marks')
    const percentageValueEl = document.querySelector('.percentage-value')
    
    if (obtainedMarksEl) {
      obtainedMarksEl.textContent = Math.round(currentMarks).toString()
    }
    if (percentageValueEl) {
      percentageValueEl.textContent = Math.round(currentPercentage * 100) / 100 + '%'
    }
  }, 30)
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
  loadExamResult()
  exitFullscreen()
  blockBackNavigation()
  detectDevice()
})

onUnmounted(() => {
  // Clean up event listeners if needed
})
</script>

<style scoped>
/* Bootstrap Icons */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css');

.result-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px 0;
}

.error-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-container {
  max-width: 1200px;
  margin: 0 auto;
}

.score-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.score-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f8f9fa;
}

.exam-title {
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 8px;
  line-height: 1.3;
}

.performance-text {
  color: #6c757d;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.score-metrics {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.metric-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 320px;
  border: 3px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.marks-card:hover {
  border-color: #007bff;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2);
}

.percentage-card:hover {
  border-color: #28a745;
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.2);
}

.marks-card::before {
  background: linear-gradient(90deg, #007bff, #17a2b8);
}

.percentage-card::before {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #007bff, #17a2b8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.3);
}

.percentage-card .metric-icon {
  background: linear-gradient(135deg, #28a745, #20c997);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.25);
}

.metric-icon i {
  font-size: 1.5rem;
  color: white;
}

.metric-content {
  flex: 1;
  text-align: left;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 4px;
}

.obtained-marks {
  font-size: 3.2rem;
  font-weight: 900;
  color: #1a365d;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-marks {
  font-size: 2.2rem;
  font-weight: 700;
  color: #4a5568;
}

.percentage-value {
  font-size: 3.2rem;
  font-weight: 900;
  color: #1a365d;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Stats Row Styling */
.stats-row {
  justify-content: center;
  align-items: stretch;
  padding-top: 24px;
  border-top: 2px solid #f8f9fa;
  background: transparent !important;
}

/* Rank / percentile / qualified strip (competitive mocks) */
.rank-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem 2.5rem;
  padding: 14px 10px;
  margin-top: 8px;
  border-top: 2px solid #f8f9fa;
}

.rank-item {
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.stats-row .col-lg {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}

.stats-row i {
  font-size: 1.8rem !important;
  margin-bottom: 8px !important;
  color: #6c757d !important;
}

.stats-row .stat-number {
  font-size: 1.6rem !important;
  font-weight: 700 !important;
  margin-bottom: 4px !important;
  color: #2c3e50 !important;
  line-height: 1.2;
  display: block !important;
}

.stats-row .stat-label {
  font-size: 1rem !important;
  color: #6c757d !important;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block !important;
}

.stat-number {
  font-size: 1.6rem !important;
  font-weight: 700 !important;
  margin-bottom: 4px !important;
  color: white !important;
  line-height: 1.2;
}

/* Override stat-number color for table cells */
.chapter-table .stat-number {
  color: #333 !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
}

.chapter-table .correct-count {
  color: #28a745 !important;
}

.chapter-table .wrong-count {
  color: #dc3545 !important;
}

/* Fix stats row visibility - ensure proper colors */
.score-card .stats-row i {
  color: #6c757d !important;
}

.score-card .stat-number {
  color: #2c3e50 !important;
}

.score-card .stat-label {
  color: #6c757d !important;
}

.stat-label {
  font-size: 1rem !important;
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Chapter Analysis Section */
.chapter-analysis-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

/* Sorting Controls - Clean Design */
.sorting-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 0;
}

.sort-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-option {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  color: #495057;
  font-weight: 500;
  outline: none;
}

.sort-option:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sort-option.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.sort-option.active:hover {
  background: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
}

.sort-option i {
  font-size: 0.9rem;
}

.chapter-table-container {
  overflow-x: auto;
}

.chapter-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.95rem;
  color: #333;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chapter-table th,
.chapter-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.chapter-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

.chapter-table tbody tr:last-child td {
  border-bottom: none;
}

.chapter-row {
  transition: background-color 0.2s ease;
}

.chapter-row:hover {
  background-color: #f9f9f9;
}

.chapter-row.chapter-excellent {
  border-left: 4px solid #28a745;
}

.chapter-row.chapter-good {
  border-left: 4px solid #17a2b8;
}

.chapter-row.chapter-average {
  border-left: 4px solid #ffc107;
}

.chapter-row.chapter-poor {
  border-left: 4px solid #dc3545;
}

.chapter-name-cell {
  font-weight: 600;
  color: #333;
  min-width: 200px;
}

.correct-count {
  color: #28a745;
}

.wrong-count {
  color: #dc3545;
}

.performance-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-excellent {
  background-color: #d4edda;
  color: #155724;
}

.badge-good {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-average {
  background-color: #fff3cd;
  color: #856404;
}

.badge-poor {
  background-color: #f8d7da;
  color: #721c24;
}

.score-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.percentage {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.progress-bar-small {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill-small {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-excellent {
  background-color: #28a745;
}

.progress-good {
  background-color: #17a2b8;
}

.progress-average {
  background-color: #ffc107;
}

.progress-poor {
  background-color: #dc3545;
}

/* Strengths and Weaknesses Section */
.strengths-weaknesses-section {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.strength-card,
.weakness-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 200px;
  width: 100%;
  transition: all 0.3s ease;
}

.strength-card:hover,
.weakness-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.strength-card {
  border-left: 5px solid #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.strength-card:hover {
  box-shadow: 0 4px 20px rgba(40, 167, 69, 0.15);
}

.weakness-card {
  border-left: 5px solid #dc3545;
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
}

.weakness-card:hover {
  box-shadow: 0 4px 20px rgba(220, 53, 69, 0.15);
}

.card-title {
  color: #333;
  font-weight: 700;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.strength-list,
.weakness-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.strength-list li,
.weakness-list li {
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.05rem;
  line-height: 1.5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.strength-list li:last-child,
.weakness-list li:last-child {
  border-bottom: none;
}

/* Recommendations Section */
.recommendations-section {
  margin-bottom: 40px;
}

.recommendations-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.recommendation-item {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
}

.recommendation-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* Critical Focus Areas - Red Theme */
.recommendation-critical {
  border-left-color: #dc3545;
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
}

.recommendation-critical:hover {
  box-shadow: 0 4px 20px rgba(220, 53, 69, 0.15);
}

/* Areas for Enhancement - Yellow Theme */
.recommendation-enhancement {
  border-left-color: #ffc107;
  background: linear-gradient(135deg, #fffef8 0%, #ffffff 100%);
}

.recommendation-enhancement:hover {
  box-shadow: 0 4px 20px rgba(255, 193, 7, 0.15);
}

/* Strong Performance - Green Theme */
.recommendation-strong {
  border-left-color: #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.recommendation-strong:hover {
  box-shadow: 0 4px 20px rgba(40, 167, 69, 0.15);
}

/* Default Theme */
.recommendation-default {
  border-left-color: #17a2b8;
  background: linear-gradient(135deg, #f8fdff 0%, #ffffff 100%);
}

.recommendation-default:hover {
  box-shadow: 0 4px 20px rgba(23, 162, 184, 0.15);
}

.recommendation-body {
  width: 100%;
}

.recommendation-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 15px;
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recommendation-chapters {
  font-size: 1.05rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 15px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  display: block;
  word-wrap: break-word;
  line-height: 1.4;
}

.recommendation-critical .recommendation-chapters {
  background: rgba(220, 53, 69, 0.1);
  color: #721c24;
}

.recommendation-enhancement .recommendation-chapters {
  background: rgba(255, 193, 7, 0.1);
  color: #856404;
}

.recommendation-strong .recommendation-chapters {
  background: rgba(40, 167, 69, 0.1);
  color: #155724;
}

.recommendation-default .recommendation-chapters {
  background: rgba(23, 162, 184, 0.1);
  color: #0c5460;
}

.recommendation-text {
  font-size: 1.05rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

/* Detailed Analysis Section */
.detailed-analysis-section {
  margin-bottom: 30px;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #dee2e6;
}

.question-correct {
  border-left-color: #28a745;
}

.question-wrong {
  border-left-color: #dc3545;
}

.question-skipped {
  border-left-color: #ffc107;
  background: linear-gradient(90deg, rgba(255, 193, 7, 0.05), white);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.question-number {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.question-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.question-marks {
  font-weight: 600;
  color: #333;
}

.question-time {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.question-time i {
  font-size: 0.8rem;
}

.question-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-correct {
  background-color: #d4edda;
  color: #155724;
}

.status-wrong {
  background-color: #f8d7da;
  color: #721c24;
}

.status-skipped {
  background-color: #fff3cd;
  color: #856404;
}

.question-content {
  margin-bottom: 15px;
}

.passage-panel {
  background: #f4f7fb;
  border: 1px solid #d7e3f4;
  border-left: 4px solid #0d6efd;
  border-radius: 8px;
  padding: 12px 14px;
}

.passage-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #0d6efd;
  margin-bottom: 6px;
}

.passage-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.question-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 10px;
}

.question-image {
  margin-bottom: 10px;
}

.question-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.option-correct {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.option-wrong {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.option-selected {
  background-color: #e2e3e5;
  border-color: #d6d8db;
}

.not-attempted-message {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #856404;
}

.option-label {
  font-weight: 600;
  color: #333;
  min-width: 20px;
}

.option-text {
  flex: 1;
  color: #333;
}

.correct-indicator,
.wrong-indicator {
  margin-left: auto;
}

/* Action Buttons */
.text-center .btn {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.text-center .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.text-center .btn-lg {
  font-size: 1.1rem;
  padding: 15px 30px;
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
  .result-page {
    padding: 10px 0;
  }
  
  .result-container {
    padding: 0 10px;
  }
  
  /* Mobile Score Card */
  .score-card {
    padding: 24px 16px;
    margin-bottom: 24px;
    border-radius: 12px;
  }
  
  .score-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }
  
  .exam-title {
    font-size: 1.5rem;
    margin-bottom: 6px;
  }
  
  .performance-text {
    font-size: 1rem;
  }
  
  .score-metrics {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .metric-card {
    min-width: auto;
    padding: 20px;
    gap: 12px;
  }
  
  .metric-icon {
    width: 48px;
    height: 48px;
  }
  
  .metric-icon i {
    font-size: 1.3rem;
  }
  
  .obtained-marks {
    font-size: 2.6rem;
  }
  
  .total-marks {
    font-size: 1.8rem;
  }
  
  .percentage-value {
    font-size: 2.6rem;
  }
  
  .metric-label {
    font-size: 0.8rem;
  }
  
  /* Mobile Stats Row */
  .stats-row {
    padding-top: 20px;
  }
  
  .stats-row .col-lg {
    margin-bottom: 20px;
  }
  
  .stats-row i {
    font-size: 1.4rem !important;
    margin-bottom: 6px !important;
  }
  
  .stat-number {
    font-size: 1.3rem !important;
    margin-bottom: 3px !important;
  }
  
  .stat-label {
    font-size: 0.85rem !important;
    letter-spacing: 0.3px;
  }

  /* Mobile Section Titles */
  .section-header {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    text-align: center;
  }
  
  .section-title {
    font-size: 1.2rem;
    margin-bottom: 0;
    padding-bottom: 0;
    text-align: center;
  }

  /* Mobile Sorting Controls */
  .sorting-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .sort-label {
    font-size: 0.85rem;
  }
  
  .sort-options {
    flex-direction: row;
    gap: 6px;
    width: 100%;
  }
  
  .sort-option {
    flex: 1;
    padding: 6px 12px;
    font-size: 0.8rem;
    text-align: center;
    justify-content: center;
  }
  
  .sort-option i {
    font-size: 0.85rem;
  }

  /* Mobile Chapter Cards */
  .chapter-table-container {
    overflow-x: auto;
  }

  .chapter-table {
    width: 100%;
    font-size: 0.9rem;
  }

  .chapter-table th,
  .chapter-table td {
    padding: 10px 12px;
  }

  .chapter-table th {
    font-size: 0.85rem;
  }

  .chapter-table tbody tr:last-child td {
    border-bottom: none;
  }

  .chapter-row {
    transition: background-color 0.2s ease;
  }

  .chapter-row:hover {
    background-color: #f9f9f9;
  }

  .chapter-name-cell {
    font-weight: 600;
    color: #333;
  }

  .performance-badge {
    padding: 3px 10px;
    font-size: 0.75rem;
  }
  
  .score-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  
  .percentage {
    font-size: 1rem;
    font-weight: 700;
    color: #333;
  }
  
  .progress-bar-small {
    width: 100%;
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill-small {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .progress-excellent {
    background-color: #28a745;
  }
  
  .progress-good {
    background-color: #17a2b8;
  }
  
  .progress-average {
    background-color: #ffc107;
  }
  
  .progress-poor {
    background-color: #dc3545;
  }
  
  /* Mobile Strengths and Weaknesses */
  .strengths-weaknesses-section {
    gap: 20px;
  }
  
  .strength-card,
  .weakness-card {
    padding: 20px;
    border-radius: 10px;
    min-height: 150px;
  }
  
  .card-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
  
  .strength-list,
  .weakness-list {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .strength-list li,
  .weakness-list li {
    padding: 10px 0;
    font-size: 1rem;
    line-height: 1.4;
  }
  
  /* Mobile Recommendations */
  .recommendations-section {
    margin-bottom: 25px;
  }
  
  .recommendations-grid {
    gap: 20px;
  }

  .recommendation-item {
    padding: 20px;
    border-radius: 10px;
  }
  
  .recommendation-title {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
  
  .recommendation-chapters {
    font-size: 1rem;
    padding: 8px 12px;
    margin-bottom: 12px;
    line-height: 1.5;
  }
  
  .recommendation-text {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  /* Mobile Question Cards */
  .questions-container {
    gap: 15px;
  }
  
  .question-card {
    padding: 15px;
    border-radius: 10px;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .question-number {
    font-size: 1rem;
  }
  
  .question-status {
    padding: 3px 10px;
    font-size: 0.75rem;
    align-self: flex-start;
  }
  
  .question-info {
    align-items: flex-start;
    align-self: flex-start;
    gap: 2px;
  }
  
  .question-marks {
    font-size: 0.9rem;
  }
  
  .question-time {
    font-size: 0.8rem;
  }
  
  .question-text {
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  
  .question-image {
    margin-bottom: 8px;
  }
  
  .options-container {
    gap: 8px;
  }
  
  .option-item {
    padding: 10px;
    border-radius: 6px;
    gap: 8px;
  }
  
  .option-label {
    min-width: 18px;
    font-size: 0.9rem;
  }
  
  .option-text {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .not-attempted-message {
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    margin-bottom: 12px;
  }
  
  /* Mobile Action Buttons */
  .text-center {
    margin-top: 30px;
  }
  
  .text-center .btn-lg {
    font-size: 1rem;
    padding: 12px 20px;
    width: 100%;
    max-width: 300px;
  }
  
  /* Mobile Modal */
  .modal-dialog {
    margin: 15px;
    width: calc(100% - 30px);
  }
  
  .modal-content {
    border-radius: 10px;
  }
  
  .modal-header,
  .modal-body {
    padding: 15px;
  }
  
  .modal-footer {
    padding: 10px 15px;
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Extra small devices (phones, 480px and down) */
@media (max-width: 480px) {
  .result-page {
    padding: 5px 0;
  }
  
  .result-container {
    padding: 0 8px;
  }
  
  /* Extra small score card */
  .score-card {
    padding: 20px 12px;
    margin-bottom: 20px;
  }
  
  .score-header {
    margin-bottom: 20px;
    padding-bottom: 12px;
  }
  
  .exam-title {
    font-size: 1.3rem;
    margin-bottom: 4px;
  }
  
  .performance-text {
    font-size: 0.95rem;
  }
  
  .score-metrics {
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .metric-card {
    padding: 16px;
    gap: 10px;
  }
  
  .metric-icon {
    width: 40px;
    height: 40px;
  }
  
  .metric-icon i {
    font-size: 1.1rem;
  }
  
  .obtained-marks {
    font-size: 2.2rem;
  }
  
  .total-marks {
    font-size: 1.6rem;
  }
  
  .percentage-value {
    font-size: 2.2rem;
  }
  
  .metric-label {
    font-size: 0.75rem;
  }
  
  /* Extra Small Stats Row */
  .stats-row {
    padding-top: 16px;
  }
  
  .stats-row .col-lg {
    margin-bottom: 15px;
  }
  
  .stats-row i {
    font-size: 1.2rem !important;
    margin-bottom: 5px !important;
  }
  
  .stat-number {
    font-size: 1.1rem !important;
    margin-bottom: 2px !important;
  }
  
  .stat-label {
    font-size: 0.75rem !important;
    letter-spacing: 0.2px;
  }

  /* Extra small section titles */
  .section-header {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    text-align: center;
  }
  
  .section-title {
    font-size: 1.1rem;
    margin-bottom: 0;
    padding-bottom: 0;
    text-align: center;
  }
  
  /* Extra Small Sorting Controls */
  .sorting-controls {
    margin-bottom: 0;
  }
  
  .sort-selector {
    padding: 4px 8px;
    border-radius: 12px;
  }
  
  .sort-label {
    font-size: 0.7rem;
    margin-bottom: 4px;
    padding: 0 4px;
  }
  
  .sort-options {
    flex-direction: column;
    gap: 2px;
  }
  
  .sort-option {
    padding: 6px 8px;
    min-width: auto;
    border-radius: 8px;
    gap: 5px;
  }
  
  .option-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }
  
  .option-icon i {
    font-size: 0.8rem;
  }
  
  .option-title {
    font-size: 0.7rem;
  }

  /* Extra small cards */
  .chapter-table-container {
    overflow-x: auto;
  }

  .chapter-table {
    width: 100%;
    font-size: 0.9rem;
  }

  .chapter-table th,
  .chapter-table td {
    padding: 10px 12px;
  }

  .chapter-table th {
    font-size: 0.85rem;
  }

  .chapter-table tbody tr:last-child td {
    border-bottom: none;
  }

  .chapter-row {
    transition: background-color 0.2s ease;
  }

  .chapter-row:hover {
    background-color: #f9f9f9;
  }

  .chapter-name-cell {
    font-weight: 600;
    color: #333;
  }

  .performance-badge {
    padding: 3px 10px;
    font-size: 0.75rem;
  }
  
  .score-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  
  .percentage {
    font-size: 1rem;
    font-weight: 700;
    color: #333;
  }
  
  .progress-bar-small {
    width: 100%;
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill-small {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .progress-excellent {
    background-color: #28a745;
  }
  
  .progress-good {
    background-color: #17a2b8;
  }
  
  .progress-average {
    background-color: #ffc107;
  }
  
  .progress-poor {
    background-color: #dc3545;
  }
  
  /* Extra small Strengths and Weaknesses */
  .strengths-weaknesses-section {
    gap: 15px;
  }
  
  .strength-card,
  .weakness-card {
    padding: 18px;
    border-radius: 10px;
    min-height: 140px;
  }
  
  .card-title {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
  
  .strength-list,
  .weakness-list {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .strength-list li,
  .weakness-list li {
    font-size: 0.95rem;
    padding: 8px 0;
  }
  
  /* Extra small Recommendations */
  .recommendations-section {
    margin-bottom: 20px;
  }
  
  .recommendations-grid {
    gap: 15px;
  }

  .recommendation-item {
    padding: 18px;
    border-radius: 8px;
  }
  
  .recommendation-title {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  
  .recommendation-chapters {
    font-size: 0.95rem;
    padding: 6px 10px;
    margin-bottom: 10px;
    line-height: 1.4;
  }
  
  .recommendation-text {
    font-size: 0.95rem;
    line-height: 1.4;
  }
  
  .question-text {
    font-size: 0.9rem;
  }
  
  .option-item {
    padding: 8px;
    gap: 6px;
  }
  
  .option-label {
    min-width: 16px;
    font-size: 0.85rem;
  }
  
  .option-text {
    font-size: 0.85rem;
  }
  
  .not-attempted-message {
    padding: 8px 10px;
    font-size: 0.8rem;
  }
  
  /* Extra small action buttons */
  .text-center .btn-lg {
    font-size: 0.95rem;
    padding: 10px 16px;
  }
}
</style> 