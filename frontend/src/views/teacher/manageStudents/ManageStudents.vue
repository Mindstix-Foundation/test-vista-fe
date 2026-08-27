<template>
  <div class="container-fluid my-4">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-11">
        <!-- Page Header -->
        <div class="row p-2 g-2 mb-1 mt-2">
          <div class="row g-2 justify-content-center align-items-center mb-4">
            <div class="col-12 col-sm-10">
              <h5 class="text-left fw-bolder text-uppercase m-0">Manage Students</h5>
            </div>
          </div>
          <hr />
        </div>



        <!-- Selection Cards -->
        <div v-if="!selectedStandard || !selectedSubject" class="selection-container">
          
          <!-- Step 1: Standard Selection -->
          <div class="row justify-content-center mb-4">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="card shadow-sm">
                <div class="card-body p-3 p-md-4">
                  <div class="row g-2 justify-content-center align-items-center mb-3">
                    <div class="col-12">
                      <h5 class="text-left fw-bolder text-uppercase m-0">Select Standard</h5>
                    </div>
                  </div>
                  <hr class="mb-4" />
                  
                  <div v-if="loadingStandards" class="text-center py-4">
                    <output class="spinner-border text-primary">
                      <span class="visually-hidden">Loading...</span>
                    </output>
                    <p class="mt-3 text-muted mb-0">Loading standards...</p>
                  </div>
                  
                  <div v-else-if="availableStandards.length === 0" class="text-center py-4">
                    <div class="alert alert-info" role="alert">
                      No standards assigned to you yet.
                    </div>
                  </div>
                  
                  <div v-else>
                    <div class="row g-2">
                      <div 
                        v-for="standard in availableStandards" 
                        :key="standard.id"
                        class="col-6 col-sm-4 col-md-3 col-lg-2"
                      >
                        <div 
                          class="standard-option"
                          :class="{ 'selected': selectedStandard?.id === standard.id }"
                          @click="selectStandard(standard)"
                        >
                          <div class="fw-bold mb-1">{{ standard.name }}</div>
                          <div class="text-muted small">
                            {{ standard.subjectCount }} subject{{ standard.subjectCount !== 1 ? 's' : '' }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Subject Selection -->
          <div v-if="selectedStandard" class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="card shadow-sm">
                <div class="card-body p-3 p-md-4">
                  <div class="row g-2 justify-content-center align-items-center mb-3">
                    <div class="col-12">
                      <h5 class="text-left fw-bolder text-uppercase m-0">Select Subject</h5>
                    </div>
                  </div>
                  <hr class="mb-4" />
                  
                  <div class="row mb-3">
                    <label class="col-12 col-form-label fw-bold" for="ms-standard-name">Standard:</label>
                    <div class="col-12">
                      <input
                        id="ms-standard-name"
                        type="text"
                        class="form-control-plaintext"
                        :value="selectedStandard.name"
                        readonly
                      />
                    </div>
                  </div>
                  
                  <div v-if="availableSubjects.length === 0" class="text-center py-4">
                    <div class="alert alert-info" role="alert">
                      No subjects found for {{ selectedStandard.name }}.
                    </div>
                  </div>
                  
                  <div v-else>
                    <div class="row g-3">
                      <div 
                        v-for="subject in availableSubjects" 
                        :key="subject.id"
                        class="col-12"
                      >
                        <div 
                          class="subject-option"
                          :class="{ 'selected': selectedSubject?.id === subject.id }"
                          @click="selectSubject(subject)"
                        >
                          <div class="row mb-2">
                            <div class="col-12 col-lg-6 col-form-label fw-bold">{{ subject.name }}</div>
                            <div class="col-12 col-lg-6">
                              <div class="d-flex justify-content-lg-end gap-3">
                                <div class="subject-stat">
                                  <span class="stat-number pending">{{ subject.stats.pending }}</span>
                                  <span class="stat-label">Pending</span>
                                </div>
                                <div class="subject-stat">
                                  <span class="stat-number active">{{ subject.stats.active }}</span>
                                  <span class="stat-label">Active</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div v-if="selectedSubject?.id === subject.id" class="selected-indicator">
                            <i class="bi bi-check-circle-fill"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  

                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-if="selectedStandard && selectedSubject" class="dashboard-container">
          
          <!-- Current Selection Info -->
          <div class="row justify-content-center mb-4">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="card shadow-sm">
                <div class="card-body p-3 p-md-4">
                  <div class="row g-2 justify-content-between align-items-center mb-3">
                    <div class="col-12 col-sm-8 col-md-6">
                      <h5 class="text-left fw-bolder text-uppercase m-0">
                        <i class="bi bi-book me-2"></i>{{ selectedSubject.name }}
                      </h5>
                    </div>
                    <div class="col-12 col-sm-4 col-md-6">
                      <div class="d-flex gap-2 justify-content-sm-end">
                        <button 
                          class="btn btn-outline-primary btn-sm"
                          @click="() => refreshData()"
                          :disabled="loading"
                        >
                          <i class="bi bi-arrow-clockwise me-1"></i>
                          Refresh
                        </button>
                        <button 
                          class="btn btn-outline-secondary btn-sm"
                          @click="resetSelection"
                        >
                          <i class="bi bi-arrow-left me-1"></i>
                          Change Selection
                        </button>
                      </div>
                    </div>
                  </div>
                  <hr class="mb-3" />
                  
                  <div class="row mb-2">
                    <label class="col-12 col-lg-3 col-form-label fw-bold" for="ms-detail-standard">Standard:</label>
                    <div class="col-12 col-lg-9">
                      <input
                        id="ms-detail-standard"
                        type="text"
                        class="form-control-plaintext"
                        :value="selectedStandard.name"
                        readonly
                      />
                    </div>
                  </div>
                  
                  <div class="row mb-2">
                    <label class="col-12 col-lg-3 col-form-label fw-bold" for="ms-detail-year">Academic Year:</label>
                    <div class="col-12 col-lg-9">
                      <input
                        id="ms-detail-year"
                        type="text"
                        class="form-control-plaintext"
                        :value="currentAcademicYear"
                        readonly
                      />
                    </div>
                  </div>
                  
                  <div class="row mb-2">
                    <div class="col-12 col-lg-6">
                      <div class="row">
                        <div class="col-12 col-lg-6 col-form-label fw-bold">Pending:</div>
                        <div class="col-12 col-lg-6">
                          <span class="form-control-plaintext stat-number pending">{{ subjectStats.pending }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 col-lg-6">
                      <div class="row">
                        <div class="col-12 col-lg-6 col-form-label fw-bold">Active:</div>
                        <div class="col-12 col-lg-6">
                          <span class="form-control-plaintext stat-number active">{{ subjectStats.active }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Toggle Section -->
          <div class="row justify-content-center mb-4">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="card shadow-sm">
                <div class="card-body p-3 p-md-4">
                  <div class="row g-2 justify-content-center align-items-center">
                    <div class="col-12">
                      <div class="btn-group w-100">
                        <input 
                          type="radio" 
                          class="btn-check" 
                          name="viewToggle" 
                          id="activeStudentsToggle" 
                          autocomplete="off" 
                          :checked="currentView === 'active'"
                          @change="currentView = 'active'"
                        >
                        <label 
                          class="btn btn-outline-dark" 
                          for="activeStudentsToggle"
                        >
                          <i class="bi bi-people-fill me-2"></i>
                          Active Students
                          <span class="badge bg-success ms-2">{{ subjectStats.active }}</span>
                        </label>

                        <input 
                          type="radio" 
                          class="btn-check" 
                          name="viewToggle" 
                          id="pendingRequestsToggle" 
                          autocomplete="off" 
                          :checked="currentView === 'pending'"
                          @change="currentView = 'pending'"
                        >
                        <label 
                          class="btn btn-outline-dark" 
                          for="pendingRequestsToggle"
                        >
                          <i class="bi bi-clock-history me-2"></i>
                          Pending Requests
                          <span class="badge bg-warning ms-2">{{ subjectStats.pending }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Content Section -->
          <div class="row justify-content-center mb-4">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="card shadow-sm">
                <div class="card-body p-3 p-md-4">
                  <div class="row g-2 justify-content-center align-items-center mb-3">
                    <div class="col-12">
                      <h5 class="text-left fw-bolder text-uppercase m-0">
                        <i :class="currentView === 'active' ? 'bi bi-people-fill me-2' : 'bi bi-clock-history me-2'"></i>
                        {{ currentView === 'active' ? 'Active Students' : 'Pending Requests' }}
                      </h5>
                    </div>
                  </div>
                  <hr class="mb-3" />
                  
                  <!-- Active Students Content -->
                  <div v-if="currentView === 'active'">
                    <EnrolledStudentsList 
                      :selectedStandard="selectedStandard"
                      :selectedSubject="selectedSubject"
                      :loading="loading"
                      @student-updated="handleStudentUpdate"
                    />
                  </div>
                  
                  <!-- Pending Requests Content -->
                  <div v-if="currentView === 'pending'">
                    <PendingRequestsList 
                      :requests="pendingRequests" 
                      :loading="loading"
                      @request-updated="handleRequestUpdate"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notifications -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div 
      id="notificationToast" 
      class="toast" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div class="toast-header">
        <i :class="toastIcon" class="me-2"></i>
        <strong class="me-auto">{{ toastTitle }}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import PendingRequestsList from './components/PendingRequestsList.vue'
import EnrolledStudentsList from './components/EnrolledStudentsList.vue'
import axiosInstance from '@/config/axios'
import { useAuthStore } from '@/stores/auth'

// Get auth store for user ID
const authStore = useAuthStore()

// Types
interface Standard {
  id: number
  name: string
  subjectCount: number
  subjects: Subject[] // Add subjects array to standard
}

interface Subject {
  id: number
  name: string
  teacherSubjectId: number
  stats: {
    pending: number
    approved: number
    active: number
    total: number
  }
}

interface EnrollmentRequest {
  id: number
  status: string
  request_message?: string
  teacher_response?: string
  academic_year: string
  requested_at: string
  responded_at?: string
  enrollment_date?: string
  student: {
    id: number
    user: {
      id: number
      name: string
      email_id: string
    }
  }
  teacher_subject: {
    id: number
    subject: {
      id: number
      name: string
    }
    school_standard: {
      id: number
      standard: {
        id: number
        name: string
      }
    }
  }
}

// Reactive data
const loadingStandards = ref(false)
const loading = ref(false)

const availableStandards = ref<Standard[]>([])
const availableSubjects = ref<Subject[]>([])
const allRequests = ref<EnrollmentRequest[]>([])

const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)
const currentView = ref<'active' | 'pending'>('active')

const filters = reactive({
  status: '',
  academic_year: ''
})

// Toast notification
const toastTitle = ref('')
const toastMessage = ref('')
const toastIcon = ref('')

// Computed properties
const currentAcademicYear = computed(() => {
  const currentYear = new Date().getFullYear()
  return `${currentYear}-${currentYear + 1}`
})

const pendingRequests = computed(() => {
  return allRequests.value.filter(request => request.status === 'pending')
})

const approvedRequests = computed(() => {
  return allRequests.value.filter(request => request.status === 'approved')
})

const activeStudents = computed(() => {
  return allRequests.value.filter(request => 
    request.status === 'approved' || 
    request.status === 'active'
  )
})

const subjectStats = computed(() => {
  const pending = allRequests.value.filter(r => r.status === 'pending').length
  const approved = allRequests.value.filter(r => r.status === 'approved').length
  const active = allRequests.value.filter(r => r.status === 'active' || r.status === 'approved').length
  const total = allRequests.value.length

  return { pending, approved, active, total }
})

const academicYears = computed(() => {
  const years = [...new Set(allRequests.value.map(r => r.academic_year))]
  return years.sort().reverse()
})

// Methods
const fetchTeacherStandardsAndSubjects = async () => {
  loadingStandards.value = true
  try {
    // Use the new efficient API that gets all subjects with stats in one call
    const response = await axiosInstance.get('/student-subject-enrollments/teacher/subjects-summary')
    const standards = response.data
    
    // The API already returns the data in the format we need
    availableStandards.value = standards.sort((a: any, b: any) => a.name.localeCompare(b.name))

  } catch (error) {
    console.error('Error fetching teacher standards and subjects:', error)
    showToast('Error', 'Failed to load your assigned standards and subjects', 'bi-exclamation-triangle text-danger')
  } finally {
    loadingStandards.value = false
  }
}

const fetchSubjectRequests = async (silent = false) => {
  if (!selectedSubject.value) return
  
  if (!silent) {
    loading.value = true
  }
  try {
    const params = new URLSearchParams()
    params.append('teacher_subject_id', selectedSubject.value.teacherSubjectId.toString())
    if (filters.status) params.append('status', filters.status)
    if (filters.academic_year) params.append('academic_year', filters.academic_year)
    
    const response = await axiosInstance.get(`/student-subject-enrollments/teacher/my-requests?${params}`)
    allRequests.value = response.data
  } catch (error) {
    console.error('Error fetching subject requests:', error)
    if (!silent) {
      showToast('Error', 'Failed to load enrollment requests', 'bi-exclamation-triangle text-danger')
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
  }
}

const selectStandard = (standard: Standard) => {
  // If the same standard is clicked, toggle it (close subject selection)
  if (selectedStandard.value && selectedStandard.value.id === standard.id) {
    selectedStandard.value = null
    selectedSubject.value = null
    availableSubjects.value = []
    allRequests.value = []
  } else {
    // Different standard clicked, show its subjects
    selectedStandard.value = standard
    selectedSubject.value = null
    allRequests.value = []
    // Set available subjects from the standard's subjects (already loaded)
    availableSubjects.value = standard.subjects
  }
}

const selectSubject = async (subject: Subject) => {
  selectedSubject.value = subject
  await fetchSubjectRequests()
}

const resetSelection = () => {
  selectedStandard.value = null
  selectedSubject.value = null
  availableSubjects.value = []
  allRequests.value = []
}

const resetToStandardSelection = () => {
  selectedSubject.value = null
  allRequests.value = []
  // Reset available subjects to the selected standard's subjects
  if (selectedStandard.value) {
    availableSubjects.value = selectedStandard.value.subjects
  }
}

const syncSelectedStandardAndSubject = () => {
  if (!selectedStandard.value) return
  const updatedStandard = availableStandards.value.find(s => s.id === selectedStandard.value!.id)
  if (!updatedStandard) return
  selectedStandard.value = updatedStandard
  availableSubjects.value = updatedStandard.subjects
  if (!selectedSubject.value) return
  const updatedSubject = updatedStandard.subjects.find(s => s.id === selectedSubject.value!.id)
  if (updatedSubject) {
    selectedSubject.value = updatedSubject
  }
}

const refreshData = async (silent = false) => {
  if (!selectedSubject.value) return
  await fetchSubjectRequests(silent)
  if (silent) return
  await fetchTeacherStandardsAndSubjects()
  syncSelectedStandardAndSubject()
  showToast('Success', 'Data refreshed successfully', 'bi-check-circle text-success')
}

const handleRequestUpdate = async () => {
  await refreshData(true) // Silent refresh for auto-refresh
}

const handleStudentUpdate = async () => {
  await refreshData()
}

const showToast = (title: string, message: string, icon: string) => {
  toastTitle.value = title
  toastMessage.value = message
  toastIcon.value = icon
  
  const toast = new (globalThis as any).bootstrap.Toast(document.getElementById('notificationToast'))
  toast.show()
}

// Lifecycle
onMounted(() => {
  fetchTeacherStandardsAndSubjects()
})
</script>

<style scoped>
/* Card styling matching profile page */
.card {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-body {
  padding: 1.5rem;
  overflow-y: visible;
}

.card-header {
  border-radius: 0.75rem 0.75rem 0 0 !important;
  border-bottom: 1px solid rgba(0,0,0,.125);
}

/* Form styling matching profile page */
.form-control-plaintext {
  font-weight: normal;
  padding: 0.375rem 0;
  margin-bottom: 0;
}

.col-form-label {
  font-weight: 600;
}

/* Selection options styling */
.standard-option {
  position: relative;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.subject-option {
  position: relative;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.standard-option:hover,
.subject-option:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.standard-option.selected,
.subject-option.selected {
  background-color: #f8f9fa;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Selected indicator */
.selected-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: #0d6efd;
  font-size: 1.125rem;
}

/* Subject stats styling */
.subject-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 1rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-number.pending {
  color: #ffc107;
}

.stat-number.active {
  color: #28a745;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* Dashboard Styles */
.bg-gradient {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-weight: 500;
  border-radius: 0.5rem 0.5rem 0 0;
  margin-right: 0.25rem;
  position: relative;
}

.nav-tabs .nav-link.active {
  background-color: transparent;
  border: 1px solid #dee2e6;
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: 600;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  border-bottom-color: #007bff;
  color: #007bff;
}

.toast-container {
  z-index: 1060;
}

.badge {
  font-size: 0.6rem;
}

.bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}

/* Stats cards hover effect */
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.selection-container {
  min-height: 400px;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Button styling matching profile page */
.btn-outline-secondary {
  border-color: #dee2e6;
  border-width: 2px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
}

/* Responsive adjustments matching profile page */
@media (max-width: 576px) {
  .form-control-plaintext {
    padding-left: 0;
  }
  
  .col-form-label {
    padding-bottom: 0;
    margin-bottom: -0.5rem;
  }
  
  .standard-option {
    padding: 0.5rem;
    min-height: 70px;
    font-size: 0.9rem;
  }
  
  .subject-option {
    padding: 0.75rem;
  }
  
  .selected-indicator {
    top: 0.25rem;
    right: 0.25rem;
    font-size: 0.9rem;
  }
  
  .subject-stat {
    margin-bottom: 0.5rem;
  }
  
  .stat-number {
    font-size: 1.125rem;
  }
  
  .d-flex.justify-content-lg-end {
    justify-content: flex-start !important;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) {
  .d-flex.justify-content-start {
    justify-content: flex-start;
  }
}

@media (min-width: 992px) {
  .subject-stat {
    min-width: 60px;
  }
}

.selection-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.selection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-color: #007bff;
}

.selection-card.selected {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.selection-option {
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
}

.selection-option:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.selection-option.selected {
  background-color: #e3f2fd;
  border-color: #007bff;
  color: #0056b3;
}

.btn-outline-primary {
  border-width: 2px;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 10px;
  }
  
  .selection-card {
    margin-bottom: 15px;
  }
}
</style> 