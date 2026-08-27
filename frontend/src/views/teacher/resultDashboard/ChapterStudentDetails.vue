<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row justify-content-between align-items-center mb-4">
      <div class="col-12 col-sm-8">
        <h5 class="m-0 fw-bolder text-uppercase">Chapter Performance Details</h5>
        <p class="text-muted mb-0 mt-1">{{ chapterName }} - Individual Student Performance</p>
      </div>
      <div class="col-12 col-sm-4 text-end">
        <router-link :to="`/teacher/result-dashboard/${testPaperId}`" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
        </router-link>
      </div>
    </div>
    <hr class="mb-4">

    <!-- Test Paper Info -->
    <div class="row justify-content-center mb-4" v-if="testPaperInfo">
      <div class="col-md-10">
        <div class="card test-info-card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="card-title text-primary mb-3">{{ testPaperInfo.name }}</h6>
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
                <div class="chapter-info">
                  <h6 class="text-success mb-2">
                    <i class="bi bi-bookmark-fill me-2"></i>{{ chapterName }}
                  </h6>
                  <div class="info-item">
                    <i class="bi bi-people text-dark me-2"></i>
                    <span class="fw-medium">Total Students: <span class="fw-bold">{{ studentDetails.length }}</span></span>
                  </div>
                  <div class="info-item">
                    <i class="bi bi-check-circle text-dark me-2"></i>
                    <span class="fw-medium">Completed: <span class="fw-bold">{{ completedCount }}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter Performance Summary -->
    <div class="row justify-content-center mb-4" v-if="chapterSummary">
      <div class="col-md-10">
        <div class="card statistics-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0 text-muted">
                <i class="bi bi-bar-chart me-2"></i>Chapter Performance Summary
              </h6>
              <div class="d-flex gap-4">
                <div class="stat-item-small">
                  <span class="stat-number-small text-success">{{ formatDecimal(chapterSummary.averageCorrect) }}</span>
                  <span class="stat-label-small">Avg Correct</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-danger">{{ formatDecimal(chapterSummary.averageWrong) }}</span>
                  <span class="stat-label-small">Avg Wrong</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-warning">{{ formatDecimal(chapterSummary.averageSkipped) }}</span>
                  <span class="stat-label-small">Avg Skipped</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-info">{{ formatDecimal(chapterSummary.averagePercentage) }}%</span>
                  <span class="stat-label-small">Avg Performance</span>
                </div>
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
          <div class="col-12 col-lg-6 mb-3 mb-lg-0">
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
          <div class="col-12 col-lg-3 mb-3 mb-lg-0">
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

          <!-- Performance Filter -->
          <div class="col-12 col-lg-3">
            <div class="filter-field">
              <select 
                v-model="performanceFilter" 
                class="form-select filter-select" 
                @change="filterResults"
              >
                <option value="all">All Performance</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
              <i class="bi bi-trophy filter-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Details Table -->
    <div class="row justify-content-center">
      <div class="col-md-10">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center my-5">
          <output class="spinner-border">
            <span class="visually-hidden">Loading...</span>
          </output>
          <p class="mt-3">Loading chapter details...</p>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="text-center my-5">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
        </div>

        <!-- Student Details Table -->
        <div v-else-if="filteredStudents.length > 0" class="table-container">
          <div class="table-responsive">
            <table class="table table-hover student-details-table">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Roll Number</th>
                  <th scope="col">Student Name</th>
                  <th scope="col">Total Questions</th>
                  <th scope="col">Attempted</th>
                  <th scope="col">Correct</th>
                  <th scope="col">Wrong</th>
                  <th scope="col">Performance</th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in filteredStudents" :key="student.studentId" class="student-row">
                  <td class="text-muted">{{ student.rollNumber }}</td>
                  <td class="student-name">
                    <strong>{{ student.name }}</strong>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number">{{ student.totalQuestions }}</span>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number">{{ student.attempted }}</span>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number correct-count">{{ student.correct }}</span>
                  </td>
                  <td class="number-cell">
                    <span class="stat-number wrong-count">{{ student.wrong }}</span>
                  </td>
                  <td class="badge-cell">
                    <span class="performance-badge" :class="getPerformanceBadgeClass(student.status === 'pending' ? 'pending' : student.performanceLevel)">
                      {{ student.status === 'pending' ? 'Pending' : student.performanceLevel }}
                    </span>
                  </td>
                  <td class="score-cell">
                    <div class="score-content">
                      <span class="percentage">{{ formatDecimal(student.percentage) }}%</span>
                      <div class="progress-bar-small">
                        <div 
                          class="progress-fill-small" 
                          :style="{ width: student.percentage + '%' }"
                          :class="getProgressBarClass(student.performanceLevel)"
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No results message -->
        <div v-else-if="!isLoading && filteredStudents.length === 0" class="text-center mt-4">
          <div class="empty-state">
            <i class="bi bi-person-x display-1 text-muted"></i>
            <p class="mt-3 text-muted">No student data found for this chapter.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'

const route = useRoute()

// Route parameters
const testPaperId = route.params.testPaperId as string
const chapterName = route.params.chapterName as string

// Define interfaces
interface StudentChapterDetail {
  studentId: number
  name: string
  rollNumber: string
  totalQuestions: number
  attempted: number
  correct: number
  wrong: number
  skipped: number
  percentage: number
  performanceLevel: string
  status: 'completed' | 'pending'
}

interface TestPaperInfo {
  id: number
  name: string
  subject: string
  standard: string
  totalMarks: number
  duration: number
}

interface ChapterSummary {
  averageCorrect: number
  averageWrong: number
  averageSkipped: number
  averagePercentage: number
}

// Reactive variables
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const performanceFilter = ref('all')

// Data
const testPaperInfo = ref<TestPaperInfo | null>(null)
const studentDetails = ref<StudentChapterDetail[]>([])
const chapterSummary = ref<ChapterSummary | null>(null)

// Computed properties
const completedCount = computed(() => {
  return studentDetails.value.filter(student => student.status === 'completed').length
})

const filteredStudents = computed(() => {
  let filtered = studentDetails.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.rollNumber.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(student => {
      if (statusFilter.value === 'completed') return student.status === 'completed'
      if (statusFilter.value === 'pending') return student.status === 'pending'
      return true
    })
  }

  // Apply performance filter
  if (performanceFilter.value !== 'all') {
    filtered = filtered.filter(student => student.performanceLevel === performanceFilter.value)
  }

  // Sort by performance (percentage) descending, then by name
  filtered = [...filtered].sort((a, b) => {
    if (a.percentage !== b.percentage) {
      return b.percentage - a.percentage
    }
    return a.name.localeCompare(b.name)
  })

  return filtered
})

// Methods
const fetchChapterDetails = async () => {
  try {
    const response = await axiosInstance.get(
      `/test-assignments/test-paper/${testPaperId}/chapter/${encodeURIComponent(chapterName)}/students`
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

    // Set student details
    studentDetails.value = data.students || []

    // Calculate chapter summary
    const completedStudents = studentDetails.value.filter(s => s.status === 'completed')
    if (completedStudents.length > 0) {
      chapterSummary.value = {
        averageCorrect: completedStudents.reduce((sum, s) => sum + s.correct, 0) / completedStudents.length,
        averageWrong: completedStudents.reduce((sum, s) => sum + s.wrong, 0) / completedStudents.length,
        averageSkipped: completedStudents.reduce((sum, s) => sum + s.skipped, 0) / completedStudents.length,
        averagePercentage: completedStudents.reduce((sum, s) => sum + s.percentage, 0) / completedStudents.length
      }
    }

  } catch (err) {
    console.error('Error fetching chapter details:', err)
    error.value = 'Failed to load chapter details. Please try again.'
  }
}

const filterResults = () => {
  // Filter logic is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const getPerformanceBadgeClass = (performanceLevel: string) => {
  switch (performanceLevel) {
    case 'pending': return 'badge-pending'
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

const formatDecimal = (value: number) => {
  const rounded = Math.round(value * 100) / 100
  if (rounded === Math.floor(rounded)) {
    return Math.floor(rounded).toString()
  }
  return rounded.toString()
}

// Lifecycle
onMounted(async () => {
  try {
    isLoading.value = true
    await fetchChapterDetails()
  } catch (err) {
    console.error('Error loading chapter details:', err)
  } finally {
    isLoading.value = false
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

.chapter-info {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Table Styling */
.table-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.student-details-table {
  margin-bottom: 0;
}

.student-details-table thead th {
  border: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.student-details-table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.student-row:hover {
  background-color: #f8f9fa;
}

.student-name {
  font-weight: 500;
}

.number-cell {
  text-align: center;
}

.stat-number {
  font-weight: 600;
  font-size: 1.1rem;
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

.badge-pending {
  background-color: #e2e3e5;
  color: #6c757d;
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

.badge-cell {
  text-align: center;
}

.score-cell {
  text-align: center;
}

.score-content {
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
  max-width: 80px;
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
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .student-details-table th,
  .student-details-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style> 