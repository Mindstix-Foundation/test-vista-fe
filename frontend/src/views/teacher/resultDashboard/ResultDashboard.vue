<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row justify-content-between align-items-center mb-4">
      <div class="col-12 col-sm-6">
        <h5 class="m-0 fw-bolder text-uppercase">Result Dashboard</h5>
      </div>
      <div class="col-12 col-sm-6 text-end">
        <div class="d-flex gap-2 justify-content-end">
          <button 
            v-if="completedCount > 0"
            @click="downloadPDF" 
            class="btn btn-primary"
            :disabled="isGeneratingPDF"
          >
            <output v-if="isGeneratingPDF" class="spinner-border spinner-border-sm me-2"></output>
            <i v-else class="bi bi-download me-2"></i>
            {{ isGeneratingPDF ? 'Generating...' : 'Save PDF' }}
          </button>
          <router-link to="/teacher/assign-test" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-2"></i>Back to Tests
          </router-link>
        </div>
      </div>
    </div>
    <hr class="mb-4">

    <!-- Test Paper Info -->
    <div class="row justify-content-center mb-4" v-if="testPaperInfo">
      <div class="col-md-10">
        <div class="card test-info-card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <h6 class="card-title text-primary mb-3">{{ testPaperInfo.name }}</h6>
                <div class="row">
                  <div class="col-md-6">
                    <div class="info-item">
                      <i class="bi bi-book text-dark me-2"></i>
                      <span class="fw-medium">Subject: <span class="fw-bold">{{ testPaperInfo.subject }}</span></span>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-mortarboard text-dark me-2"></i>
                      <span class="fw-medium">Standard: <span class="fw-bold">{{ testPaperInfo.standard }}</span></span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <i class="bi bi-award text-dark me-2"></i>
                      <span class="fw-medium">Total Marks: <span class="fw-bold">{{ testPaperInfo.totalMarks }}</span></span>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-clock text-dark me-2"></i>
                      <span class="fw-medium">Duration: <span class="fw-bold">{{ testPaperInfo.duration }} minutes</span></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 d-flex flex-column justify-content-center">
                <div class="stats-summary">
                  <div class="stat-item">
                    <span class="stat-value">{{ studentResults.length }}</span>
                    <span class="stat-label">Total Students</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ completedCount }}</span>
                    <span class="stat-label">Completed</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ pendingCount }}</span>
                    <span class="stat-label">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Summary -->
    <div class="row justify-content-center mb-4" v-if="completedCount > 0">
      <div class="col-md-10">
        <div class="card statistics-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0 text-muted">
                <i class="bi bi-bar-chart me-2"></i>Test Statistics
              </h6>
              <div class="d-flex gap-4">
                <div class="stat-item-small">
                  <span class="stat-number-small text-success">{{ calculatedStats.highest }}</span>
                  <span class="stat-label-small">Highest</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-primary">{{ calculatedStats.average }}</span>
                  <span class="stat-label-small">Average</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-warning">{{ calculatedStats.lowest }}</span>
                  <span class="stat-label-small">Lowest</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-info">{{ calculatedStats.passRate }}%</span>
                  <span class="stat-label-small">Pass Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section-wise Performance (competitive/entrance mocks) -->
    <div class="row justify-content-center mb-4" v-if="sectionWiseAnalysis.length > 0">
      <div class="col-md-10">
        <div class="chapter-analysis-section">
          <div class="section-header">
            <h4 class="section-title">
              <i class="bi bi-layout-three-columns"></i> Section-wise Class Performance
            </h4>
          </div>
          <div class="chapter-table-container">
            <table class="chapter-table">
              <thead>
                <tr>
                  <th scope="col">Section</th>
                  <th scope="col">Questions</th>
                  <th scope="col">Attempted</th>
                  <th scope="col">Avg Score</th>
                  <th scope="col">Cutoff</th>
                  <th scope="col">Cleared %</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="section in sectionWiseAnalysis" :key="section.sectionName" class="chapter-row">
                  <td class="chapter-name-cell"><strong>{{ section.sectionName }}</strong></td>
                  <td class="number-cell"><span class="stat-number">{{ formatDecimal(section.questions) }}</span></td>
                  <td class="number-cell"><span class="stat-number">{{ formatDecimal(section.attempted) }}</span></td>
                  <td class="score-cell">
                    <span class="percentage">{{ formatDecimal(section.percentage) }}%</span>
                    <small class="text-muted d-block">{{ formatDecimal(section.obtainedMarks) }}/{{ formatDecimal(section.totalMarks) }}</small>
                  </td>
                  <td class="number-cell"><span class="stat-number">{{ section.qualifyingMarks ?? '—' }}</span></td>
                  <td class="number-cell">
                    <span class="stat-number">{{ section.qualifiedRate !== null && section.qualifiedRate !== undefined ? formatDecimal(section.qualifiedRate) + '%' : '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter-wise Performance Analysis -->
    <div class="row justify-content-center mb-4" v-if="chapterWiseAnalysis.length > 0">
      <div class="col-md-10">
        <div class="chapter-analysis-section">
          <div class="section-header">
            <h4 class="section-title">
              <i class="bi bi-bar-chart-fill"></i> Chapter-wise Class Performance
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
            <table class="chapter-table">
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
                    <router-link 
                      :to="{ name: 'chapterStudentDetails', params: { testPaperId: testPaperInfo?.id, chapterName: chapter.chapterName } }"
                      class="chapter-link"
                    >
                      <strong>{{ chapter.chapterName }}</strong>
                      <i class="bi bi-arrow-right-circle ms-2"></i>
                    </router-link>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number">{{ formatDecimal(chapter.total) }}</span>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number">{{ formatDecimal(chapter.total - chapter.skipped) }}</span>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number correct-count">{{ formatDecimal(chapter.correct) }}</span>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number wrong-count">{{ formatDecimal(chapter.wrong) }}</span>
                  </td>
                  <td class="badge-cell">
                    <span class="performance-badge" :class="getPerformanceBadgeClass(chapter.performanceLevel)">
                      {{ chapter.performanceLevel }}
                    </span>
                  </td>
                  <td class="score-cell">
                    <div class="score-content">
                      <span class="percentage">{{ formatDecimal(chapter.percentage) }}%</span>
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
      </div>
    </div>

    <!-- Teaching Recommendations -->
    <div class="row justify-content-center mb-4" v-if="classRecommendations.length > 0">
      <div class="col-md-10">
        <div class="recommendations-section">
          <h4 class="section-title">
            <i class="bi bi-lightbulb-fill"></i> Teaching Recommendations
            <small class="text-muted ms-2">({{ classRecommendations.length }} recommendations)</small>
          </h4>
          
          <div class="recommendations-grid">
            <div v-for="recommendation in classRecommendations" :key="recommendation" class="recommendation-item" :class="getRecommendationClass(recommendation)">
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
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div class="row justify-content-center mb-4">
      <div class="col-md-10">
        <div class="row align-items-center">
          <!-- Search Container -->
          <div class="col-12 col-lg-5 mb-3 mb-lg-0">
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search by student name or roll number"
                @input="filterResults"
              >
              <i v-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
            </div>
          </div>

          <!-- Filter Select -->
          <div class="col-12 col-lg-4 mb-3 mb-lg-0">
            <div class="filter-field">
              <select 
                v-model="statusFilter" 
                class="form-select filter-select" 
                @change="filterResults"
              >
                <option value="all">All Students</option>
                <option value="completed">Completed Only</option>
                <option value="pending">Pending Only</option>
              </select>
              <i class="bi bi-funnel filter-icon"></i>
            </div>
          </div>

          <!-- Auto Refresh Button -->
          <div class="col-12 col-lg-3 text-lg-end">
            <button 
              @click="toggleAutoRefresh" 
              class="btn w-100 w-lg-auto"
              :class="autoRefresh ? 'btn-success' : 'btn-outline-secondary'"
              :title="autoRefresh ? 'Auto-refresh ON (every 2.5 sec)' : 'Auto-refresh OFF'"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              <span>{{ autoRefresh ? 'Live' : 'Refresh' }}</span>
              <output v-if="autoRefresh" class="spinner-border spinner-border-sm ms-2">
                <span class="visually-hidden">Loading...</span>
              </output>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="row justify-content-center">
      <div class="col-md-10">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center my-5">
          <output class="spinner-border">
            <span class="visually-hidden">Loading...</span>
          </output>
          <p class="mt-3">Loading student results...</p>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="text-center my-5">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
        </div>

        <!-- Results Table -->
        <div v-else-if="filteredResults.length > 0" class="table-container">
          <div class="table-responsive">
            <table class="table table-hover results-table">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Roll Number</th>
                  <th scope="col">Student Name</th>
                  <th scope="col">Marks Obtained</th>
                  <th scope="col">Time Taken</th>
                  <th scope="col">Status</th>
                  <th scope="col">Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in filteredResults" :key="result.id" class="result-row">
                  <td class="text-muted">{{ result.rollNumber }}</td>
                  <td class="student-name">
                    {{ result.name }}
                  </td>
                  <td>
                    <div class="marks-display">
                      <span class="marks-obtained fw-bold">{{ result.marksObtained || '-' }}</span>
                      <span class="marks-total text-muted">/ {{ testPaperInfo?.totalMarks }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="time-taken">{{ formatTime(result.timeTaken) }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(result.status)">
                      {{ result.status }}
                    </span>
                  </td>
                  <td>
                    <div class="rank-badge" :class="getRankClass(result.rank)">
                      {{ result.rank === 0 ? '-' : result.rank || '-' }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No results message -->
        <div v-else-if="!isLoading && filteredResults.length === 0" class="text-center mt-4">
          <div class="empty-state">
            <i class="bi bi-graph-up display-1 text-muted"></i>
            <p class="mt-3 text-muted">No student results found. Students haven't taken the test yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import {
  getRecommendationType,
  getRecommendationChapters,
  getRecommendationMessage,
  getRecommendationClass,
} from '@/utils/recommendationParsing'

const route = useRoute()
// const router = useRouter() // Commented out as it's not used

// Define interfaces
interface StudentResult {
  id: number
  name: string
  rollNumber: string
  marksObtained: number | null
  timeTaken: number | null // in seconds
  percentage: number | null
  rank: number | null
  status: 'completed' | 'pending'
  submittedAt: string | null
}

interface TestPaperInfo {
  id: number
  name: string
  subject: string
  standard: string
  totalMarks: number
  duration: number
}

interface ApiTestPaperResult {
  rank: number
  student_name: string
  roll_number: string
  marks_obtained: number
  total_marks: number
  time_taken_seconds: number
  percentage: number
  status: 'completed' | 'pending'
  submitted_at?: string
  student_id: number
  test_attempt_id?: number
}

interface ApiTestPaperResultsResponse {
  test_paper_id: number
  test_paper_name: string
  subject: string
  standard: string
  total_marks: number
  duration_minutes: number
  total_students: number
  completed_students: number
  pending_students: number
  highest_score: number
  average_score: number
  lowest_score: number
  pass_rate: number
  chapter_wise_analysis?: ChapterAnalysis[]
  section_wise_analysis?: SectionAnalysis[]
  class_strengths?: string[]
  class_weaknesses?: string[]
  class_average_areas?: string[]
  class_recommendations?: string[]
  results: ApiTestPaperResult[]
}

interface ChapterAnalysis {
  chapterName: string
  total: number
  correct: number
  wrong: number
  skipped: number
  percentage: number
  totalMarks: number
  obtainedMarks: number
  performanceLevel: string
  studentsCount: number
}

interface SectionAnalysis {
  sectionName: string
  questions: number
  attempted: number
  obtainedMarks: number
  totalMarks: number
  percentage: number
  qualifyingMarks: number | null
  qualifiedRate: number | null
  studentsCount: number
}

// Reactive variables
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const error = ref<string | null>(null)
const autoRefresh = ref(true)
const refreshInterval = ref<number | null>(null)
const isGeneratingPDF = ref(false)

// Test paper info
const testPaperInfo = ref<TestPaperInfo | null>(null)

// Student results
const studentResults = ref<StudentResult[]>([])

// Chapter-wise analysis
const chapterWiseAnalysis = ref<ChapterAnalysis[]>([])
const sectionWiseAnalysis = ref<SectionAnalysis[]>([])

// Class analysis from backend
const classStrengths = ref<string[]>([])
const classWeaknesses = ref<string[]>([])
const classAverageAreas = ref<string[]>([])
const classRecommendations = ref<string[]>([])

// Sorting state
const sortBy = ref<'sequence' | 'score'>('score')

// Computed properties
const filteredResults = computed(() => {
  let filtered = studentResults.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(result => 
      result.name.toLowerCase().includes(query) ||
      result.rollNumber.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(result => {
      if (statusFilter.value === 'completed') return result.status === 'completed'
      if (statusFilter.value === 'pending') return result.status === 'pending'
      return true
    })
  }

  // Sort by rank first, then by roll number
  filtered = [...filtered].sort((a, b) => {
    // Pending students (rank 0) come first
    if (a.rank === 0 && b.rank !== 0) return -1
    if (a.rank !== 0 && b.rank === 0) return 1
    
    // Both pending - sort by roll number
    if (a.rank === 0 && b.rank === 0) {
      return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })
    }
    
    // Both completed - sort by rank first, then by roll number
    if (a.rank !== b.rank) {
      return (a.rank || 999) - (b.rank || 999)
    }
    
    // Same rank - sort by roll number
    return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })
  })

  return filtered
})

const completedCount = computed(() => {
  return studentResults.value.filter(result => result.status === 'completed').length
})

const pendingCount = computed(() => {
  return studentResults.value.filter(result => result.status === 'pending').length
})

const calculatedStats = computed(() => {
  const completedResults = studentResults.value.filter(result => result.status === 'completed')
  
  if (completedResults.length === 0) {
    return {
      highest: 0,
      average: 0,
      lowest: 0,
      passRate: 0
    }
  }

  // Use marks for highest/lowest/average (not percentage)
  const marks = completedResults.map(result => result.marksObtained || 0)
  const percentages = completedResults.map(result => result.percentage || 0)
  
  const highest = Math.max(...marks)
  const lowest = Math.min(...marks)
  const average = Math.round(marks.reduce((sum, mark) => sum + mark, 0) / marks.length)
  
  // Pass rate based on percentage >= 40%
  const passRate = Math.round((percentages.filter(perc => perc >= 40).length / percentages.length) * 100)

  return {
    highest,
    average,
    lowest,
    passRate
  }
})



const sortedChapters = computed(() => {
  let sorted = chapterWiseAnalysis.value

  if (sortBy.value === 'sequence') {
    sorted = [...sorted].sort((a, b) => a.chapterName.localeCompare(b.chapterName))
  } else { // sortBy === 'score'
    sorted = [...sorted].sort((a, b) => {
      // Sort by percentage, then by chapter name
      if (a.percentage !== b.percentage) {
        return b.percentage - a.percentage
      }
      return a.chapterName.localeCompare(b.chapterName)
    })
  }

  return sorted
})

// Methods
const fetchTestPaperResults = async () => {
  try {
    const testPaperId = route.params.testPaperId
    if (!testPaperId) {
      throw new Error('Test paper ID not found')
    }

    const response = await axiosInstance.get<ApiTestPaperResultsResponse>(
      `/test-assignments/test-paper/${testPaperId}/results`
    )

    const data = response.data

    // Set test paper info
    testPaperInfo.value = {
      id: data.test_paper_id,
      name: data.test_paper_name,
      subject: data.subject,
      standard: data.standard,
      totalMarks: data.total_marks,
      duration: data.duration_minutes
    }

    // Transform API results to component format
    studentResults.value = data.results.map((result) => ({
      id: result.student_id,
      name: result.student_name,
      rollNumber: result.roll_number,
      marksObtained: result.marks_obtained,
      timeTaken: result.time_taken_seconds,
      percentage: result.percentage,
      rank: result.rank,
      status: result.status,
      submittedAt: result.submitted_at || null
    }))

    // Set chapter-wise analysis
    chapterWiseAnalysis.value = data.chapter_wise_analysis || []
    sectionWiseAnalysis.value = data.section_wise_analysis || []

    // Set class analysis from backend
    classStrengths.value = data.class_strengths || []
    classWeaknesses.value = data.class_weaknesses || []
    classAverageAreas.value = data.class_average_areas || []
    classRecommendations.value = data.class_recommendations || []

  } catch (err) {
    console.error('Error fetching test paper results:', err)
    error.value = 'Failed to load test results. Please try again.'
  }
}

const filterResults = () => {
  // Filter logic is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    // Start auto-refresh every 2.5 seconds
    refreshInterval.value = setInterval(async () => {
      try {
        await fetchTestPaperResults()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
        // Optionally disable auto-refresh on repeated failures
      }
    }, 2500)
  } else if (refreshInterval.value) {
    // Stop auto-refresh
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const sortChapters = (sortType: 'sequence' | 'score') => {
  sortBy.value = sortType
}

const getRankClass = (rank: number | null) => {
  if (!rank || rank === 0) return 'rank-pending'
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return 'rank-default'
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-success'
    case 'pending':
      return 'bg-warning'
    default:
      return 'bg-secondary'
  }
}

const formatTime = (seconds: number | null) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

const downloadPDF = () => {
  if (!testPaperInfo.value) return
  
  isGeneratingPDF.value = true
  
  try {
    // Create a new window with the printable content
    const printWindow = globalThis.open('', '_blank')
    if (!printWindow) {
      throw new Error('Unable to open print window')
    }
    
    // Generate HTML content for PDF
    const htmlContent = generatePDFContent()
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF. Please try again.')
  } finally {
    isGeneratingPDF.value = false
  }
}

const getPerformanceBadgeClass = (performanceLevel: string) => {
  switch (performanceLevel) {
    case 'excellent': return 'badge-excellent'
    case 'good': return 'badge-good'
    case 'average': return 'badge-average'
    default: return 'badge-poor'
  }
}

const getProgressBarClass = (performanceLevel: string) => {
  switch (performanceLevel) {
    case 'excellent': return 'progress-excellent'
    case 'good': return 'progress-good'
    case 'average': return 'progress-average'
    default: return 'progress-poor'
  }
}

const getChapterRowClass = (performanceLevel: string) => {
  switch (performanceLevel) {
    case 'excellent': return 'chapter-excellent'
    case 'good': return 'chapter-good'
    case 'average': return 'chapter-average'
    default: return 'chapter-poor'
  }
}

const formatDecimal = (value: number) => {
  // Round to 2 decimal places
  const rounded = Math.round(value * 100) / 100
  
  // If it's a whole number (like 1.0, 5.0), return without decimal
  if (rounded === Math.floor(rounded)) {
    return Math.floor(rounded).toString()
  }
  
  // Otherwise return with up to 2 decimal places, removing trailing zeros
  return rounded.toString()
}

const generatePDFContent = () => {
  if (!testPaperInfo.value) return ''
  
  const currentDate = new Date().toLocaleDateString('en-GB')
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  
  // Filter only completed results for PDF
  const completedResults = filteredResults.value.filter(result => result.status === 'completed')
  
  let tableRows = ''
  for (const [index, result] of completedResults.entries()) {
    tableRows += `
      <tr>
        <td>${index + 1}</td>
        <td>${result.rollNumber}</td>
        <td>${result.name}</td>
        <td>${result.marksObtained}/${testPaperInfo.value?.totalMarks}</td>
        <td>${result.percentage?.toFixed(1) || '0.0'}%</td>
        <td>${formatTime(result.timeTaken)}</td>
        <td>${result.rank === 0 ? '-' : result.rank}</td>
      </tr>
    `
  }

  // Generate chapter-wise analysis table (only if data exists)
  let chapterAnalysisSection = ''
  if (sortedChapters.value.length > 0) {
    let chapterAnalysisRows = ''
    for (const chapter of sortedChapters.value) {
      chapterAnalysisRows += `
        <tr>
          <td>${chapter.chapterName}</td>
          <td>${formatDecimal(chapter.total)}</td>
          <td>${formatDecimal(chapter.correct)}</td>
          <td>${formatDecimal(chapter.wrong)}</td>
          <td>${formatDecimal(chapter.percentage)}%</td>
        </tr>
      `
    }

    chapterAnalysisSection = `
      <div class="section">
        <h3>Chapter-wise Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Total Questions</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            ${chapterAnalysisRows}
          </tbody>
        </table>
      </div>
    `
  }

  // Generate key recommendations (only top 3)
  let recommendationsSection = ''
  if (classRecommendations.value.length > 0) {
    let recommendationsHtml = ''
    for (const recommendation of classRecommendations.value.slice(0, 3)) {
      const chapters = getRecommendationChapters(recommendation)
      const message = getRecommendationMessage(recommendation)
      
      recommendationsHtml += `
        <div class="recommendation">
          <strong>${chapters}</strong> - ${message}
        </div>
      `
    }

    recommendationsSection = `
      <div class="section">
        <h3>Key Recommendations</h3>
        ${recommendationsHtml}
      </div>
    `
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Results - ${testPaperInfo.value.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          color: #333;
          background: #fff;
          padding: 15px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 10px;
        }
        .header h1 {
          font-size: 22px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        .header h2 {
          font-size: 16px;
          color: #3498db;
          margin-bottom: 3px;
        }
        .header p {
          font-size: 12px;
          color: #7f8c8d;
        }
        .test-info {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .info-left, .info-right {
          flex: 1;
        }
        .info-item {
          margin-bottom: 4px;
          font-size: 13px;
        }
        .info-item strong {
          color: #2c3e50;
        }
        .stats {
          background: #ecf0f1;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-around;
          text-align: center;
        }
        .stat {
          flex: 1;
        }
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #3498db;
          display: block;
        }
        .stat-label {
          font-size: 11px;
          color: #7f8c8d;
          text-transform: uppercase;
        }
        .section {
          margin-bottom: 20px;
        }
        .section h3 {
          font-size: 16px;
          color: #2c3e50;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #bdc3c7;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-bottom: 10px;
        }
        th {
          background: #34495e;
          color: white;
          padding: 8px 6px;
          text-align: center;
          font-weight: 600;
          font-size: 12px;
        }
        td {
          padding: 6px;
          border-bottom: 1px solid #ecf0f1;
          text-align: center;
        }
        td:first-child, td:nth-child(3) {
          text-align: left;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        tr:hover {
          background: #e8f4f8;
        }
        .recommendation {
          background: #fff;
          border-left: 3px solid #3498db;
          padding: 8px 10px;
          margin-bottom: 6px;
          font-size: 13px;
          line-height: 1.3;
        }
        .recommendation strong {
          color: #2c3e50;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 12px;
          color: #7f8c8d;
        }
        @media print {
          body { 
            padding: 10px;
            font-size: 13px;
          }
          .section {
            page-break-inside: avoid;
            margin-bottom: 15px;
          }
          table {
            page-break-inside: avoid;
          }
          .header {
            margin-bottom: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Test Results Report</h1>
        <h2>${testPaperInfo.value.name}</h2>
        <p>Generated on ${currentDate} at ${currentTime}</p>
      </div>
      
      <div class="test-info">
        <div class="info-left">
          <div class="info-item"><strong>Subject:</strong> ${testPaperInfo.value.subject}</div>
          <div class="info-item"><strong>Standard:</strong> ${testPaperInfo.value.standard}</div>
        </div>
        <div class="info-right">
          <div class="info-item"><strong>Total Marks:</strong> ${testPaperInfo.value.totalMarks}</div>
          <div class="info-item"><strong>Duration:</strong> ${testPaperInfo.value.duration} minutes</div>
        </div>
      </div>
      
      <div class="stats">
        <div class="stat">
          <span class="stat-value">${completedResults.length}</span>
          <span class="stat-label">Completed</span>
        </div>
        <div class="stat">
          <span class="stat-value">${calculatedStats.value.highest}</span>
          <span class="stat-label">Highest</span>
        </div>
        <div class="stat">
          <span class="stat-value">${calculatedStats.value.average}</span>
          <span class="stat-label">Average</span>
        </div>
        <div class="stat">
          <span class="stat-value">${calculatedStats.value.passRate}%</span>
          <span class="stat-label">Pass Rate</span>
        </div>
      </div>

      ${chapterAnalysisSection}

      ${recommendationsSection}
      
      <div class="section">
        <h3>Student Results (${completedResults.length} students)</h3>
        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Roll No.</th>
              <th>Student Name</th>
              <th>Marks</th>
              <th>%</th>
              <th>Time</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p><strong>Vista Education System</strong> - Comprehensive Test Results Report</p>
      </div>
    </body>
    </html>
  `
}

// Lifecycle
onMounted(async () => {
  try {
    isLoading.value = true
    await fetchTestPaperResults()
    
    // Start auto-refresh by default
    if (autoRefresh.value) {
      refreshInterval.value = setInterval(async () => {
        try {
          await fetchTestPaperResults()
        } catch (error) {
          console.error('Auto-refresh failed:', error)
        }
      }, 2500)
    }
  } catch (err) {
    console.error('Error loading result dashboard:', err)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Clean up auto-refresh interval when component is unmounted
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})
</script>

<style scoped>
/* Search and Filter Styling */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
}

.clear-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
  cursor: pointer;
}

.clear-search-icon:hover {
  color: #212529;
}

input[type="text"] {
  padding-left: 35px;
  padding-right: 35px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  height: 48px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type="text"]:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.filter-field {
  position: relative;
}

.filter-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 8px;
  appearance: none;
  background-image: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.filter-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

/* Test Info Card */
.test-info-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
}

/* Table Styling */
.table-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.results-table {
  margin-bottom: 0;
}

.results-table thead th {
  border: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.results-table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.result-row:hover {
  background-color: #f8f9fa;
}

.student-name {
  font-weight: 500;
}

.marks-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.marks-obtained {
  font-size: 1.1rem;
}

.marks-total {
  font-size: 0.9rem;
}

.time-taken {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.85rem;
  min-width: 32px;
  min-height: 32px;
}

.rank-gold {
  background: #ffd700;
  color: #b45309;
  border: 2px solid #ffed4a;
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

.rank-silver {
  background: #c0c0c0;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(192, 192, 192, 0.3);
}

.rank-bronze {
  background: #cd7f32;
  color: white;
  border: 2px solid #d97706;
  box-shadow: 0 2px 4px rgba(205, 127, 50, 0.3);
}

.rank-default {
  background: #f1f3f4;
  color: #5f6368;
  border: 2px solid #e8eaed;
  box-shadow: 0 2px 4px rgba(241, 243, 244, 0.3);
}

.rank-pending {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 32px;
  height: 32px;
}

/* Statistics Card */
.statistics-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number-small {
  font-size: 1.25rem;
  font-weight: bold;
  display: block;
  line-height: 1;
}

.stat-label-small {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

/* Button Styling */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    width: 100%;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
  
  .d-flex.gap-4 {
    gap: 1rem !important;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-number-small {
    font-size: 1rem;
  }
  
  .stat-label-small {
    font-size: 0.7rem;
  }

  /* Mobile Section Header */
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

  /* Mobile Chapter Table */
  .chapter-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .chapter-table {
    width: 100%;
    font-size: 0.9rem;
    min-width: 700px;
  }

  .chapter-table th,
  .chapter-table td {
    padding: 10px 8px;
  }

  .chapter-table th {
    font-size: 0.75rem;
    padding: 8px 6px;
  }

  .chapter-table th:first-child {
    width: 30%;
  }

  .chapter-table th:nth-child(2),
  .chapter-table th:nth-child(3),
  .chapter-table th:nth-child(4),
  .chapter-table th:nth-child(5) {
    width: 10%;
  }

  .chapter-table th:nth-child(6) {
    width: 15%;
  }

  .chapter-table th:nth-child(7) {
    width: 15%;
  }

  .chapter-name-cell {
    font-weight: 600;
    color: #333;
    font-size: 0.85rem;
    padding-left: 8px;
  }

  .stat-number {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .correct-count {
    color: #28a745;
  }

  .wrong-count {
    color: #dc3545;
  }

  .performance-badge {
    padding: 2px 8px;
    font-size: 0.7rem;
    border-radius: 12px;
  }
  
  .score-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: 100%;
  }
  
  .percentage {
    font-size: 0.9rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 3px;
  }
  
  .progress-bar-small {
    width: 100%;
    height: 6px;
    background-color: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
    max-width: 60px;
    margin: 0 auto;
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
    line-height: 1.5;
  }
  
  .recommendation-text {
    font-size: 1rem;
    line-height: 1.5;
  }
}

@media (max-width: 992px) {
  .text-lg-end {
    text-align: center !important;
  }
  
  .w-lg-auto {
    width: 100% !important;
  }
}

@media (max-width: 576px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  .d-flex.gap-2 > * {
    width: 100%;
  }
}

/* Chapter Analysis Section */
.chapter-analysis-section {
  margin-bottom: 30px;
}

/* Section Header */
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
  margin: 0;
  padding: 0;
  border-bottom: none;
}

/* Sorting Controls - Clean Design */
.sorting-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 0;
}

.sort-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f3f4;
  border-radius: 8px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sort-selector:hover {
  background-color: #e5e7eb;
}

.sort-label {
  display: flex;
  align-items: center;
  gap: 5px;
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
  gap: 8px;
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
  color: #333;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sort-option.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
  font-weight: 600;
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

.option-icon {
  font-size: 1.1rem;
}

.option-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Chapter Table Container */
.chapter-table-container {
  overflow-x: auto;
}

.chapter-table {
  width: 100%;
  min-width: 800px; /* Ensure table is scrollable on smaller screens */
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.95rem;
  color: #333;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  table-layout: fixed;
  display: table !important;
}

.chapter-table thead {
  display: table-header-group !important;
}

.chapter-table tbody {
  display: table-row-group !important;
}

.chapter-table tr {
  display: table-row !important;
}

.chapter-table th,
.chapter-table td {
  display: table-cell !important;
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
}

.chapter-table td {
  font-size: 0.9rem;
  color: #555;
}

.chapter-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
  text-align: center;
}

.chapter-table th:first-child {
  text-align: left;
  width: 25%;
}

.chapter-table th:nth-child(2),
.chapter-table th:nth-child(3),
.chapter-table th:nth-child(4),
.chapter-table th:nth-child(5) {
  width: 12%;
}

.chapter-table th:nth-child(6) {
  width: 15%;
}

.chapter-table th:nth-child(7) {
  width: 20%;
}

.chapter-table tbody tr:last-child td {
  border-bottom: none;
}

.chapter-table .chapter-row {
  display: table-row !important;
  transition: background-color 0.2s ease;
}

.chapter-table .chapter-row:hover {
  background-color: #f9f9f9;
}

.chapter-table .chapter-row.chapter-excellent {
  border-left: 4px solid #28a745;
}

.chapter-table .chapter-row.chapter-good {
  border-left: 4px solid #17a2b8;
}

.chapter-table .chapter-row.chapter-average {
  border-left: 4px solid #ffc107;
}

.chapter-table .chapter-row.chapter-poor {
  border-left: 4px solid #dc3545;
}

.chapter-name-cell {
  font-weight: 600;
  color: #333;
  text-align: left !important;
  padding-left: 15px;
}

.chapter-link {
  color: #007bff;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.chapter-link:hover {
  color: #0056b3;
  text-decoration: none;
  transform: translateX(2px);
}

.chapter-link i {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.chapter-link:hover i {
  opacity: 1;
}

.stat-number {
  font-weight: 600;
  font-size: 1.1rem;
  display: block;
  color: #333;
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
  white-space: nowrap;
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

.number-cell {
  width: 12%;
  text-align: center !important;
  vertical-align: middle !important;
}

.badge-cell {
  width: 15%;
  text-align: center !important;
  vertical-align: middle !important;
}

.score-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 20%;
  text-align: center !important;
  vertical-align: middle !important;
}

.score-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
}

.percentage {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.progress-bar-small {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  max-width: 80px;
  margin: 0 auto;
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

/* Recommendations Section */
.recommendations-section {
  margin-bottom: 40px;
}

.recommendations-section .section-title {
  margin-bottom: 25px;
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

/* Custom scrollbar for table */
.table-responsive::-webkit-scrollbar {
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 