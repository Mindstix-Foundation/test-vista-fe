<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading || localLoading" class="text-center py-4">
      <output class="spinner-border text-primary">
        <span class="visually-hidden">Loading...</span>
      </output>
      <p class="mt-2 text-muted">Loading enrolled students...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="enrolledStudents.length === 0" class="text-center py-5">
      <i class="bi bi-people display-1 text-muted mb-3"></i>
      <h5 class="text-muted">No Enrolled Students</h5>
      <p class="text-muted">No students are currently enrolled in this subject.</p>
    </div>

    <!-- Students List with Table Format -->
    <div v-else>
      <!-- Sort Controls -->
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-bold">
              <i class="bi bi-people-fill me-2"></i>
              Enrolled Students ({{ sortedStudents.length }})
            </h6>
            <div class="d-flex align-items-center gap-2">
              <!-- Auto Refresh Button -->
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
      </div>

      <!-- Students Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th class="border-0">#</th>
                  <th class="border-0">Roll Number</th>
                  <th class="border-0">Student Name</th>
                  <th class="border-0">Registration Date & Time</th>
                  <th class="border-0">Academic Year</th>
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
                    <span class="badge bg-dark">{{ student.student_roll_number || 'N/A' }}</span>
                  </td>
                  <td>
                    <div class="fw-semibold">{{ student.student_name }}</div>
                  </td>
                  <td>
                    <div>
                      <div class="fw-semibold">{{ formatDate(student.student_registration_date) }}</div>
                      <small class="text-muted">{{ formatTime(student.student_registration_date) }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-primary">{{ student.academic_year }}</span>
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

  <!-- Remove Student Confirmation Modal -->
  <div 
    class="modal fade" 
    id="removeEnrolledStudentModal" 
    tabindex="-1" 
    aria-labelledby="removeEnrolledStudentModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="removeEnrolledStudentModalLabel">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Remove Student
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
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
                   <div class="fw-semibold">{{ studentToRemove.student_name }}</div>
                   <small class="text-muted">Roll: {{ studentToRemove.student_roll_number || 'N/A' }}</small>
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
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
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
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'

// Props
interface EnrolledStudent {
  id: number
  student_id: number
  student_roll_number: string
  student_name: string
  student_email: string
  academic_year: string
  enrollment_date: string
  student_registration_date: string
  subject: {
    id: number
    name: string
  }
  standard: {
      id: number
      name: string
  }
  school: {
      id: number
      name: string
    }
  }

interface Subject {
  id: number
  name: string
  teacherSubjectId: number
}

interface Standard {
  id: number
  name: string
}

const props = defineProps<{
  selectedStandard: Standard | null
  selectedSubject: Subject | null
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  'student-updated': []
}>()

// Local state
const enrolledStudents = ref<EnrolledStudent[]>([])
const localLoading = ref(false)
const error = ref<string | null>(null)
const toastStore = useToastStore()

// Reactive state for sorting
const sortBy = ref('roll_no')
const sortOrder = ref('asc')

// State for remove functionality
const removing = ref(false)
const studentToRemove = ref<EnrolledStudent | null>(null)

// Auto-refresh state
const autoRefresh = ref(false)
const isRefreshing = ref(false)
let refreshInterval: number | null = null

// Computed property for sorted students
const sortedStudents = computed(() => {
  const sorted = [...enrolledStudents.value]
  
  if (sortBy.value === 'roll_no') {
    sorted.sort((a: EnrolledStudent, b: EnrolledStudent) => {
      const aRollNo = a.student_roll_number || '0'
      const bRollNo = b.student_roll_number || '0'
      return Number.parseInt(aRollNo) - Number.parseInt(bRollNo)
    })
  } else if (sortBy.value === 'name') {
    sorted.sort((a: EnrolledStudent, b: EnrolledStudent) => 
      a.student_name.localeCompare(b.student_name)
    )
  } else if (sortBy.value === 'registration_date') {
    sorted.sort((a: EnrolledStudent, b: EnrolledStudent) => {
      const aDate = new Date(a.student_registration_date)
      const bDate = new Date(b.student_registration_date)
      return aDate.getTime() - bDate.getTime()
    })
  }

  if (sortOrder.value === 'desc') {
    sorted.reverse()
  }

  return sorted
})

// Methods
const fetchEnrolledStudents = async (silent = false) => {
  if (!props.selectedStandard || !props.selectedSubject) {
    enrolledStudents.value = []
    return
  }

  if (!silent) {
    localLoading.value = true
  }
  error.value = null
  
  try {
    const params = new URLSearchParams()
    params.append('standard_id', props.selectedStandard.id.toString())
    params.append('subject_id', props.selectedSubject.id.toString())
    
    const response = await axiosInstance.get(`/student-subject-enrollments/teacher/enrolled-students?${params}`)
    enrolledStudents.value = response.data || []
  } catch (err) {
    console.error('Error fetching enrolled students:', err)
    if (!silent) {
      error.value = 'Failed to load enrolled students'
    }
    enrolledStudents.value = []
  } finally {
    if (!silent) {
      localLoading.value = false
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

/**
 * Confirm student removal
 */
const confirmRemoveStudent = (student: EnrolledStudent) => {
  studentToRemove.value = student
  
  // Use a more reliable way to show the modal
  const modalElement = document.getElementById('removeEnrolledStudentModal')
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
      backdrop.id = 'enrolled-modal-backdrop'
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
    await axiosInstance.delete(`/students/${studentToRemove.value.student_id}`)
    
    // Remove from local list
    enrolledStudents.value = enrolledStudents.value.filter(s => s.id !== studentToRemove.value!.id)
    
    // Close modal
    const modalElement = document.getElementById('removeEnrolledStudentModal')
    if (modalElement) {
      try {
        const modal = (globalThis as any).bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        } else {
          // Fallback: manually hide modal
          hideEnrolledModal()
        }
      } catch (error) {
        console.error('Error closing modal:', error)
        hideEnrolledModal()
      }
    }
    
    // Reset
    studentToRemove.value = null
    
    // Emit student updated event
    emit('student-updated')
    
    // Show success toast notification
    toastStore.showToast({
      title: 'Success',
      message: `Student "${studentToRemove.value!.student_name}" has been removed successfully.`,
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
 * Manually hide modal (fallback)
 */
const hideEnrolledModal = () => {
  const modalElement = document.getElementById('removeEnrolledStudentModal')
  if (modalElement) {
    modalElement.classList.remove('show')
    modalElement.style.display = 'none'
    document.body.classList.remove('modal-open')
    
    // Remove backdrop
    const backdrop = document.getElementById('enrolled-modal-backdrop')
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
    await fetchEnrolledStudents(true) // Silent refresh - no loading states
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

// Watch for changes in selected standard/subject
watch(
  () => [props.selectedStandard, props.selectedSubject],
  () => {
    fetchEnrolledStudents()
  },
  { immediate: true }
)

// Cleanup
onUnmounted(() => {
  stopAutoRefresh()
})

// Expose the fetch function to parent
defineExpose({
  fetchEnrolledStudents
})
</script>

<style scoped>
.student-row:hover {
  background-color: #f8f9fa;
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

/* Responsive Design */
@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .avatar-circle {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
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