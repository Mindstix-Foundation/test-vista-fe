<template>
  <div class="iti-students-list">
    <div class="container mt-4 mb-5">
      <!-- Header Section -->
      <div class="row mb-4">
        <div class="col-12">
          <!-- Mobile Header Layout -->
          <div class="d-block d-lg-none">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="flex-grow-1">
                <h5 class="fw-bolder text-uppercase m-0 mb-2">ITI Students List</h5>
                <div class="d-flex flex-column gap-1">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-mortarboard text-primary me-2"></i>
                    <span class="fw-bold small">{{ route.query.standardName }}</span>
                  </div>
                  <div class="text-muted small">{{ route.query.schoolName }}</div>
                  <div class="text-muted small">{{ route.query.boardName }}</div>
                </div>
              </div>
              <div class="d-flex flex-column gap-2">
                <button 
                  v-if="students.length > 0"
                  class="btn btn-danger btn-sm" 
                  @click="confirmRemoveAllStudents"
                  :disabled="removing"
                  title="Remove All Students"
                >
                  <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="goBack">
                  <i class="bi bi-arrow-left"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Desktop Header Layout -->
          <div class="d-none d-lg-block">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="text-left fw-bolder text-uppercase m-0">ITI Students List</h5>
                <div class="d-flex flex-wrap align-items-center gap-2 mb-4">
                  <i class="bi bi-mortarboard text-primary me-2"></i>
                  <span class="fw-bold">{{ route.query.standardName }}</span>
                  <span class="text-muted">•</span>
                  <span class="text-muted">{{ route.query.schoolName }}</span>
                  <span class="text-muted">•</span>
                  <span class="text-muted">{{ route.query.boardName }}</span>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button 
                  v-if="students.length > 0"
                  class="btn btn-danger" 
                  @click="confirmRemoveAllStudents"
                  :disabled="removing"
                  title="Remove All Students"
                >
                  <i class="bi bi-trash me-1"></i>
                  <span class="d-none d-md-inline">Remove All</span>
                </button>
                <button class="btn btn-outline-secondary" @click="goBack">
                  <i class="bi bi-arrow-left"></i> 
                  <span class="d-none d-sm-inline">Back</span>
                </button>
              </div>
            </div>
          </div>
          <hr />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="row justify-content-center my-5">
        <div class="col-12 text-center">
          <output class="spinner-border text-primary">
            <span class="visually-hidden">Loading...</span>
          </output>
          <p class="mt-2 text-muted">Loading ITI students...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="row justify-content-center my-4">
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Students List -->
      <div v-else class="row">
        <div class="col-12">
          <!-- Summary Card -->
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body">
              <!-- Mobile Summary Layout -->
              <div class="d-block d-md-none">
                <div class="row g-3">
                  <div class="col-12">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="icon-circle bg-primary bg-opacity-10 me-3">
                        <i class="bi bi-people-fill text-primary"></i>
                      </div>
                      <div class="text-center">
                        <h4 class="mb-0 fw-bold text-primary">{{ students.length }}</h4>
                        <small class="text-muted">Total Students</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mobile-summary-item">
                      <div class="icon-circle bg-success bg-opacity-10 mb-2">
                        <i class="bi bi-mortarboard-fill text-success"></i>
                      </div>
                      <div class="fw-bold small text-truncate" title="{{ route.query.standardName }}">{{ route.query.standardName }}</div>
                      <small class="text-muted">Standard</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mobile-summary-item">
                      <div class="icon-circle bg-info bg-opacity-10 mb-2">
                        <i class="bi bi-building text-info"></i>
                      </div>
                      <div class="fw-bold small text-truncate" title="{{ route.query.schoolName }}">{{ route.query.schoolName }}</div>
                      <small class="text-muted">College</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Desktop Summary Layout -->
              <div class="d-none d-md-block">
                <div class="row text-center">
                  <div class="col-md-4">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="icon-circle bg-primary bg-opacity-10 me-3">
                        <i class="bi bi-people-fill text-primary"></i>
                      </div>
                      <div>
                        <h4 class="mb-0 fw-bold text-primary">{{ students.length }}</h4>
                        <small class="text-muted">Total Students</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="icon-circle bg-success bg-opacity-10 me-3">
                        <i class="bi bi-mortarboard-fill text-success"></i>
                      </div>
                      <div>
                        <h5 class="mb-0 fw-bold">{{ route.query.standardName }}</h5>
                        <small class="text-muted">Standard</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="icon-circle bg-info bg-opacity-10 me-3">
                        <i class="bi bi-building text-info"></i>
                      </div>
                      <div>
                        <h6 class="mb-0 fw-bold">{{ route.query.schoolName }}</h6>
                        <small class="text-muted">College</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Students Table -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom">
              <!-- Mobile Controls -->
              <div class="d-block d-lg-none">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0 fw-bold">
                    <i class="bi bi-list-ul me-2"></i>
                    Students ({{ sortedStudents.length }})
                  </h6>
                  <button 
                    type="button"
                    class="btn btn-sm position-relative"
                    :class="autoRefresh ? 'btn-success' : 'btn-outline-secondary'"
                    @click="toggleAutoRefresh"
                    :title="autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'"
                  >
                    <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': autoRefresh && isRefreshing }"></i>
                    <span v-if="autoRefresh" class="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
                      <span class="visually-hidden">Live updates</span>
                    </span>
                  </button>
                </div>
                <div class="d-flex gap-2">
                  <select 
                    v-model="sortBy" 
                    @change="sortStudents"
                    class="form-select form-select-sm flex-grow-1"
                  >
                    <option value="roll_no">Sort by Roll No.</option>
                    <option value="name">Sort by Name</option>
                    <option value="registration_date">Sort by Registration Date</option>
                  </select>
                  <button 
                    class="btn btn-outline-secondary btn-sm"
                    @click="toggleSortOrder"
                    :title="sortOrder === 'desc' ? 'Descending' : 'Ascending'"
                  >
                    <i class="bi" :class="sortOrder === 'desc' ? 'bi-sort-down' : 'bi-sort-up'"></i>
                  </button>
                </div>
              </div>
              
              <!-- Desktop Controls -->
              <div class="d-none d-lg-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">
                  <i class="bi bi-list-ul me-2"></i>
                  Registered Students ({{ sortedStudents.length }})
                </h6>
                <div class="d-flex align-items-center gap-2">
                  <button 
                    type="button"
                    class="btn btn-sm position-relative"
                    :class="autoRefresh ? 'btn-success' : 'btn-outline-secondary'"
                    @click="toggleAutoRefresh"
                    :title="autoRefresh ? 'Auto-refresh ON (every 1 second)' : 'Auto-refresh OFF'"
                  >
                    <i class="bi bi-arrow-clockwise me-1" :class="{ 'spin-animation': autoRefresh && isRefreshing }"></i>
                    {{ autoRefresh ? 'Live' : 'Refresh' }}
                    <span v-if="autoRefresh" class="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
                      <span class="visually-hidden">Live updates</span>
                    </span>
                  </button>
                  
                  <select 
                    v-model="sortBy" 
                    @change="sortStudents"
                    class="form-select form-select-sm"
                    style="width: auto;"
                  >
                    <option value="roll_no">Sort by Roll No.</option>
                    <option value="name">Sort by Name</option>
                    <option value="registration_date">Sort by Registration Date</option>
                  </select>
                  <button 
                    class="btn btn-outline-secondary btn-sm"
                    @click="toggleSortOrder"
                    :title="sortOrder === 'desc' ? 'Descending' : 'Ascending'"
                  >
                    <i class="bi" :class="sortOrder === 'desc' ? 'bi-sort-down' : 'bi-sort-up'"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body p-0">
              <!-- No students message -->
              <div v-if="students.length === 0" class="text-center py-5">
                <i class="bi bi-person-x display-1 text-muted mb-3"></i>
                <h5 class="text-muted">No ITI Students Found</h5>
                <p class="text-muted">No students have registered for this standard yet.</p>
              </div>
              
              <!-- Mobile Students Cards -->
              <div v-if="students.length > 0" class="d-block d-lg-none">
                <div 
                  v-for="(student, index) in sortedStudents" 
                  :key="student.id"
                  class="student-card border-bottom p-3"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-primary me-2">#{{ index + 1 }}</span>
                        <span class="badge bg-dark">{{ student.student_id }}</span>
                      </div>
                      <h6 class="fw-semibold mb-1">{{ student.user.name }}</h6>
                      <div class="text-muted small">
                        <div>{{ formatDate(student.created_at) }}</div>
                        <div>{{ formatTime(student.created_at) }}</div>
                      </div>
                    </div>
                    <button 
                      class="btn btn-danger btn-sm"
                      @click.stop="confirmRemoveStudent(student)"
                      :disabled="removing"
                      title="Remove Student"
                      type="button"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Desktop Students Table -->
              <div v-if="students.length > 0" class="d-none d-lg-block table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="border-0">#</th>
                      <th class="border-0">Roll Number</th>
                      <th class="border-0">Student Name</th>
                      <th class="border-0">Registration Date & Time</th>
                      <th class="border-0 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(student, index) in sortedStudents" 
                      :key="student.id"
                      class="student-row"
                    >
                      <td class="fw-bold text-muted">{{ index + 1 }}</td>
                      <td>
                        <span class="badge bg-dark">{{ student.student_id }}</span>
                      </td>
                      <td>
                        <div class="fw-semibold">{{ student.user.name }}</div>
                      </td>
                      <td>
                        <div>
                          <div class="fw-semibold">{{ formatDate(student.created_at) }}</div>
                          <small class="text-muted">{{ formatTime(student.created_at) }}</small>
                        </div>
                      </td>
                      <td class="text-center">
                        <button 
                          class="btn btn-danger btn-sm"
                          @click.stop="confirmRemoveStudent(student)"
                          :disabled="removing"
                          title="Remove Student"
                          type="button"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Remove Student Confirmation Modal -->
  <div 
    class="modal fade" 
    id="removeStudentModal" 
    tabindex="-1" 
    aria-labelledby="removeStudentModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="removeStudentModalLabel">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Remove Student
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cancelRemoveStudent"></button>
        </div>
        <div class="modal-body">
          <div v-if="studentToRemove">
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> This action cannot be undone!
            </div>
            
            <p><strong>Are you sure you want to remove this student?</strong></p>
            
            <div class="card">
              <div class="card-body">
                <div>
                  <div class="fw-semibold">{{ studentToRemove.user.name }}</div>
                  <small class="text-muted">Roll: {{ studentToRemove.student_id }}</small>
                </div>
              </div>
            </div>
            
            <div class="mt-3">
              <h6 class="text-danger">This will:</h6>
              <ul class="text-danger">
                <li>Permanently delete the student from the system</li>
                <li>Remove all their enrollment records</li>
                <li>Delete all their test attempts and results</li>
                <li>Log them out immediately if currently logged in</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelRemoveStudent">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            @click="removeStudent"
            :disabled="removing"
          >
            <output v-if="removing" class="spinner-border spinner-border-sm me-2"></output>
            {{ removing ? 'Removing...' : 'Remove Student' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Remove All Students Confirmation Modal -->
  <div 
    class="modal fade" 
    id="removeAllStudentsModal" 
    tabindex="-1" 
    aria-labelledby="removeAllStudentsModalLabel" 
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="removeAllStudentsModalLabel">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Remove All Students
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cancelRemoveAllStudents"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Warning:</strong> This action cannot be undone!
          </div>
          
          <p class="mb-3">
            <strong>Are you sure you want to remove ALL {{ students.length }} students?</strong>
          </p>
          
          <div class="mb-3">
            <h6 class="text-danger">This will:</h6>
            <ul class="text-danger">
              <li>Permanently delete all {{ students.length }} students from the system</li>
              <li>Remove all their enrollment records</li>
              <li>Delete all their test attempts and results</li>
              <li>Log them out immediately if currently logged in</li>
              <li>Clear the entire student list for this standard</li>
            </ul>
          </div>
          
          <div class="form-group">
            <label for="confirmAllText" class="form-label">Type "sure" to confirm deletion of all students:</label>
            <input
              type="text"
              class="form-control"
              id="confirmAllText"
              v-model="confirmationText"
              placeholder="Type 'sure' here"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelRemoveAllStudents">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            @click="removeAllStudents"
            :disabled="confirmationText !== 'sure' || removingAll"
          >
            <output v-if="removingAll" class="spinner-border spinner-border-sm me-2"></output>
            {{ removingAll ? 'Removing All...' : 'Remove All Students' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

// Define interfaces
interface User {
  id: number
  name: string
  email_id: string
}

interface ItiStudent {
  id: number
  student_id: string
  enrollment_date: string
  created_at: string
  status: boolean
  user: User
}

// Component state
const students = ref<ItiStudent[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sortBy = ref('roll_no')
const sortOrder = ref('asc')
const removing = ref(false)
const studentToRemove = ref<ItiStudent | null>(null)
const confirmationText = ref('')
const removingAll = ref(false)

// Auto-refresh state
const autoRefresh = ref(true)
const isRefreshing = ref(false)
let refreshInterval: number | null = null

// Computed property for sorted students
const sortedStudents = computed(() => {
  const sorted = [...students.value]
  
  if (sortBy.value === 'roll_no') {
    sorted.sort((a: ItiStudent, b: ItiStudent) => 
      Number.parseInt(a.student_id) - Number.parseInt(b.student_id)
    )
  } else if (sortBy.value === 'name') {
    sorted.sort((a: ItiStudent, b: ItiStudent) => 
      a.user.name.localeCompare(b.user.name)
    )
  } else if (sortBy.value === 'registration_date') {
    sorted.sort((a: ItiStudent, b: ItiStudent) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  if (sortOrder.value === 'desc') {
    sorted.reverse()
  }

  return sorted
})

/**
 * Fetch ITI students for the given standard and school
 */
const fetchItiStudents = async (silent = false) => {
  try {
    if (!silent) {
      loading.value = true
    }
    error.value = null

    const standardId = route.params.standardId
    const schoolId = route.params.schoolId

    if (!standardId || !schoolId) {
      throw new Error('Standard ID and School ID are required')
    }

    const response = await axiosInstance.get('/iti-mocktest/students', {
      params: {
        schoolId: schoolId,
        standardId: standardId
      }
    })

    if (response.data && response.data.statusCode === 200) {
      students.value = response.data.data
    } else {
      throw new Error('Failed to fetch ITI students')
    }
  } catch (err) {
    console.error('Error fetching ITI students:', err)
    if (!silent) {
      error.value = 'Failed to load ITI students. Please try again later.'
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
  }
}

/**
 * Get initials from full name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error(error)
    return 'Invalid date'
  }
}

/**
 * Format time for display
 */
const formatTime = (dateString: string): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error(error)
    return 'Invalid time'
  }
}

/**
 * Sort students (triggers computed property update)
 */
const sortStudents = () => {
  // This function triggers reactivity by changing sortBy value
  // The actual sorting is handled by the computed property
}

/**
 * Toggle sort order
 */
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

/**
 * Confirm student removal
 */
const confirmRemoveStudent = (student: ItiStudent) => {
  studentToRemove.value = student
  
  // Use a more reliable way to show the modal
  const modalElement = document.getElementById('removeStudentModal')
  if (modalElement) {
    // Try to use Bootstrap's Modal class
    try {
      const modal = new (globalThis as any).bootstrap.Modal(modalElement)
      modal.show()
    } catch (error) {
      console.error('Bootstrap Modal error:', error)
      // Fallback: manually add show class
      modalElement.classList.add('show')
      modalElement.style.display = 'block'
      document.body.classList.add('modal-open')
      
      // Add backdrop
      const backdrop = document.createElement('div')
      backdrop.className = 'modal-backdrop fade show'
      backdrop.id = 'modal-backdrop'
      document.body.appendChild(backdrop)
    }
  }
}

/**
 * Confirm removal of all students
 */
const confirmRemoveAllStudents = () => {
  confirmationText.value = ''
  
  const modalElement = document.getElementById('removeAllStudentsModal')
  if (modalElement) {
    try {
      const modal = new (globalThis as any).bootstrap.Modal(modalElement)
      modal.show()
    } catch (error) {
      console.error('Bootstrap Modal error:', error)
      // Fallback: manually add show class
      modalElement.classList.add('show')
      modalElement.style.display = 'block'
      document.body.classList.add('modal-open')
      
      // Add backdrop
      const backdrop = document.createElement('div')
      backdrop.className = 'modal-backdrop fade show'
      backdrop.id = 'modal-backdrop-all'
      document.body.appendChild(backdrop)
    }
  }
}

/**
 * Remove student from system
 */
const removeStudent = async () => {
  if (!studentToRemove.value) return
  
  removing.value = true
  
  try {
    await axiosInstance.delete(`/students/${studentToRemove.value.id}`)
    
    // Remove from local list
    students.value = students.value.filter(s => s.id !== studentToRemove.value!.id)
    
    // Close modal
    const modalElement = document.getElementById('removeStudentModal')
    if (modalElement) {
      try {
        const modal = (globalThis as any).bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        } else {
          // Fallback: manually hide modal
          hideModal('removeStudentModal', 'modal-backdrop')
        }
      } catch (error) {
        console.error('Error closing modal:', error)
        hideModal('removeStudentModal', 'modal-backdrop')
      }
    }
    
    const studentName = studentToRemove.value.user.name
    // Reset
    studentToRemove.value = null
    
    // Show success toast notification
    toastStore.showToast({
      title: 'Success',
      message: `Student "${studentName}" has been removed successfully.`,
      type: 'success'
    })
  } catch (error) {
    console.error('Error removing student:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to remove student. Please try again.',
      type: 'error'
    })
  } finally {
    removing.value = false
  }
}

/**
 * Remove all students from system
 */
const removeAllStudents = async () => {
  if (confirmationText.value !== 'sure') return
  
  removingAll.value = true
  
  try {
    const standardId = route.params.standardId
    const schoolId = route.params.schoolId
    
    // Call API to remove all students for this standard and school
    await axiosInstance.delete('/iti-mocktest/students/all', {
      params: {
        schoolId: schoolId,
        standardId: standardId
      }
    })
    
    const studentCount = students.value.length
    
    // Clear local list
    students.value = []
    
    // Close modal
    const modalElement = document.getElementById('removeAllStudentsModal')
    if (modalElement) {
      try {
        const modal = (globalThis as any).bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        } else {
          hideModal('removeAllStudentsModal', 'modal-backdrop-all')
        }
      } catch (error) {
        console.error('Error closing modal:', error)
        hideModal('removeAllStudentsModal', 'modal-backdrop-all')
      }
    }
    
    // Reset confirmation text
    confirmationText.value = ''
    
    // Show success toast notification
    toastStore.showToast({
      title: 'Success',
      message: `All ${studentCount} students have been removed successfully.`,
      type: 'success'
    })
  } catch (error) {
    console.error('Error removing all students:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to remove all students. Please try again.',
      type: 'error'
    })
  } finally {
    removingAll.value = false
  }
}

/**
 * Cancel remove student modal
 */
const cancelRemoveStudent = () => {
  // Reset student to remove
  studentToRemove.value = null
  
  // Close modal
  const modalElement = document.getElementById('removeStudentModal')
  if (modalElement) {
    try {
      const modal = (globalThis as any).bootstrap.Modal.getInstance(modalElement)
      if (modal) {
        modal.hide()
      } else {
        hideModal('removeStudentModal', 'modal-backdrop')
      }
    } catch (error) {
      console.error('Error closing modal:', error)
      hideModal('removeStudentModal', 'modal-backdrop')
    }
  }
}

/**
 * Cancel remove all students modal
 */
const cancelRemoveAllStudents = () => {
  // Reset confirmation text
  confirmationText.value = ''
  
  // Close modal
  const modalElement = document.getElementById('removeAllStudentsModal')
  if (modalElement) {
    try {
      const modal = (globalThis as any).bootstrap.Modal.getInstance(modalElement)
      if (modal) {
        modal.hide()
      } else {
        hideModal('removeAllStudentsModal', 'modal-backdrop-all')
      }
    } catch (error) {
      console.error('Error closing modal:', error)
      hideModal('removeAllStudentsModal', 'modal-backdrop-all')
    }
  }
}

/**
 * Manually hide modal (fallback)
 */
const hideModal = (modalId: string, backdropId: string) => {
  const modalElement = document.getElementById(modalId)
  if (modalElement) {
    modalElement.classList.remove('show')
    modalElement.style.display = 'none'
    document.body.classList.remove('modal-open')
    
    // Remove backdrop
    const backdrop = document.getElementById(backdropId)
    if (backdrop) {
      backdrop.remove()
    }
  }
}

/**
 * Toggle auto-refresh functionality
 */
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

/**
 * Start auto-refresh interval
 */
const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  refreshInterval = setInterval(async () => {
    isRefreshing.value = true
    await fetchItiStudents(true) // Silent refresh - no loading states
    isRefreshing.value = false
  }, 1000) // Refresh every 1 second
}

/**
 * Stop auto-refresh interval
 */
const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  isRefreshing.value = false
}

/**
 * Go back to manage ITI students page
 */
const goBack = () => {
  router.push({ name: 'manageItiStudents' })
}

// Initialize
onMounted(() => {
  fetchItiStudents()
  
  // Start auto-refresh by default
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

// Cleanup
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.iti-students-list {
  background-color: #f8f9fa;
  min-height: calc(100vh - var(--topbar-height, 56px));
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.student-row:hover {
  background-color: #f8f9fa;
}

.card {
  border-radius: 12px;
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Mobile Student Cards */
.student-card {
  transition: background-color 0.2s ease;
}

.student-card:hover {
  background-color: #f8f9fa;
}

.student-card:last-child {
  border-bottom: none !important;
}

/* Mobile Summary Cards Alignment */
.mobile-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 100px;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .iti-students-list {
    padding-top: 1rem;
  }
  
  .icon-circle {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
  
  .card-body .row > div {
    margin-bottom: 1rem;
  }
}

@media (max-width: 767.98px) {
  .iti-students-list {
    background-color: #f8f9fa;
    min-height: calc(100vh - 60px);
  }
  
  .icon-circle {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .avatar-circle {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }
  
  .card {
    margin-bottom: 1rem;
    border-radius: 8px;
  }
  
  .card-header {
    padding: 0.75rem;
  }
  
  .student-card {
    padding: 1rem !important;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
  
  /* Mobile header improvements */
  .fw-bolder {
    font-size: 1.1rem;
  }
  
  .small {
    font-size: 0.8rem;
  }
}

@media (max-width: 575.98px) {
  .mt-4 {
    margin-top: 1rem !important;
  }
  
  .mb-5 {
    margin-bottom: 2rem !important;
  }
  
  .icon-circle {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .card-body {
    padding: 0.75rem;
  }
  
  .student-card {
    padding: 0.75rem !important;
  }
  
  .fw-bolder {
    font-size: 1rem;
  }
  
  .btn-sm {
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }
  
  .form-select-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
  
  /* Improve text truncation on very small screens */
  .text-truncate {
    max-width: 100px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .btn-sm {
    min-height: 38px;
    min-width: 38px;
  }
  
  .student-card {
    padding: 1.25rem !important;
  }
  
  .form-select {
    min-height: 44px;
  }
  
  .form-select-sm {
    min-height: 38px;
  }
}

/* Landscape mobile improvements */
@media (max-width: 767.98px) and (orientation: landscape) {
  .iti-students-list {
    min-height: calc(100vh - 40px);
  }
  
  .mt-4 {
    margin-top: 0.5rem !important;
  }
  
  .mb-5 {
    margin-bottom: 1rem !important;
  }
}

/* Auto-refresh animation */
.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 