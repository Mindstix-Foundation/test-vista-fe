<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <output class="spinner-border text-primary">
        <span class="visually-hidden">Loading...</span>
      </output>
      <p class="mt-2 text-muted">Loading all requests...</p>
    </div>

    <div v-else-if="requests.length === 0" class="text-center py-5">
      <i class="bi bi-inbox display-4 text-muted mb-3"></i>
      <h5 class="text-muted">No Requests Found</h5>
      <p class="text-muted mb-0">No enrollment requests match your current filters.</p>
    </div>

    <div v-else>
      <!-- Search Bar -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search by student name or roll number..."
              v-model="searchQuery"
            >
          </div>
        </div>
        <div class="col-md-6 mt-2 mt-md-0">
          <div class="d-flex gap-2">
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
            
            <select class="form-select" v-model="sortBy" @change="sortRequests">
              <option value="requested_at">Sort by Request Date</option>
              <option value="student_name">Sort by Student Name</option>
              <option value="roll_no">Sort by Roll Number</option>
              <option value="subject_name">Sort by Subject</option>
              <option value="status">Sort by Status</option>
            </select>
            <button 
              class="btn btn-outline-secondary"
              @click="toggleSortOrder"
              :title="sortOrder === 'desc' ? 'Descending' : 'Ascending'"
            >
              <i class="bi" :class="sortOrder === 'desc' ? 'bi-sort-down' : 'bi-sort-up'"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Subject</th>
              <th scope="col">Status</th>
              <th scope="col">Request Date</th>
              <th scope="col">Response Date</th>
              <th scope="col" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="request in filteredRequests" 
              :key="request.id"
              class="align-middle"
            >
              <!-- Student Info -->
              <td>
                <div>
                  <div class="fw-semibold">{{ request.student.user.name }}</div>
                  <small class="text-muted">Roll: {{ request.student.student_id || 'N/A' }}</small>
                </div>
              </td>

              <!-- Subject -->
              <td>
                <div>
                  <div class="fw-semibold text-primary">{{ request.teacher_subject.subject.name }}</div>
                  <small class="text-muted">{{ request.academic_year }}</small>
                </div>
              </td>

              <!-- Status -->
              <td>
                <span class="badge" :class="getStatusClass(request.status)">
                  <i class="bi me-1" :class="getStatusIcon(request.status)"></i>
                  {{ getStatusLabel(request.status) }}
                </span>
              </td>

              <!-- Request Date -->
              <td>
                <div>
                  <div class="fw-semibold">{{ formatDate(request.requested_at) }}</div>
                  <small class="text-muted">{{ formatTime(request.requested_at) }}</small>
                </div>
              </td>

              <!-- Response Date -->
              <td>
                <div v-if="request.responded_at">
                  <div class="fw-semibold">{{ formatDate(request.responded_at) }}</div>
                  <small class="text-muted">{{ formatTime(request.responded_at) }}</small>
                </div>
                <small v-else class="text-muted">-</small>
              </td>

              <!-- Actions -->
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button 
                    v-if="request.status === 'pending'"
                    class="btn btn-success btn-sm"
                    @click="updateRequestStatus(request, 'approved')"
                    :disabled="processingRequestId === request.id"
                  >
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button 
                    v-if="request.status === 'pending'"
                    class="btn btn-danger btn-sm"
                    @click="openRejectModal(request)"
                    :disabled="processingRequestId === request.id"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                  <button 
                    v-if="request.status === 'approved'"
                    class="btn btn-primary btn-sm"
                    @click="updateRequestStatus(request, 'active')"
                    :disabled="processingRequestId === request.id"
                    title="Activate Student"
                  >
                    <i class="bi bi-person-check"></i>
                  </button>
                  <button 
                    v-if="request.status === 'active'"
                    class="btn btn-warning btn-sm"
                    @click="updateRequestStatus(request, 'inactive')"
                    :disabled="processingRequestId === request.id"
                    title="Deactivate Student"
                  >
                    <i class="bi bi-person-dash"></i>
                  </button>
                  <button 
                    v-if="request.status === 'active' || request.status === 'approved'"
                    class="btn btn-danger btn-sm"
                    @click.stop="confirmRemoveStudent(request)"
                    :disabled="processingRequestId === request.id"
                    title="Remove Student"
                    type="button"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                  <button 
                    class="btn btn-outline-secondary btn-sm"
                    @click="viewRequestDetails(request)"
                    title="View Details"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li 
              v-for="page in visiblePages" 
              :key="page"
              class="page-item" 
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>

  <!-- Request Details Modal -->
  <div 
    class="modal fade" 
    id="detailsModal" 
    tabindex="-1" 
    aria-labelledby="detailsModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="detailsModalLabel">
            <i class="bi bi-info-circle me-2"></i>
            Request Details
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRequest">
            <div class="row">
              <div class="col-md-6">
                <h6 class="fw-bold text-primary">Student Information</h6>
                <p><strong>Name:</strong> {{ selectedRequest.student.user.name }}</p>
                <p><strong>Roll Number:</strong> {{ selectedRequest.student.student_id || 'N/A' }}</p>
              </div>
              <div class="col-md-6">
                <h6 class="fw-bold text-primary">Request Information</h6>
                <p><strong>Subject:</strong> {{ selectedRequest.teacher_subject.subject.name }}</p>
                <p><strong>Academic Year:</strong> {{ selectedRequest.academic_year }}</p>
                <p><strong>Status:</strong> 
                  <span class="badge ms-1" :class="getStatusClass(selectedRequest.status)">
                    {{ getStatusLabel(selectedRequest.status) }}
                  </span>
                </p>
              </div>
            </div>

            <hr>

            <h6 class="fw-bold text-primary">Timeline</h6>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-marker bg-primary"></div>
                <div class="timeline-content">
                  <strong>Request Submitted</strong>
                  <small class="text-muted d-block">{{ formatDate(selectedRequest.requested_at) }}</small>
                </div>
              </div>
              <div v-if="selectedRequest.responded_at" class="timeline-item">
                <div class="timeline-marker" :class="selectedRequest.status === 'approved' ? 'bg-success' : 'bg-danger'"></div>
                <div class="timeline-content">
                  <strong>Request {{ getStatusLabel(selectedRequest.status) }}</strong>
                  <small class="text-muted d-block">{{ formatDate(selectedRequest.responded_at) }}</small>
                </div>
              </div>
              <div v-if="selectedRequest.enrollment_date" class="timeline-item">
                <div class="timeline-marker bg-info"></div>
                <div class="timeline-content">
                  <strong>Student Activated</strong>
                  <small class="text-muted d-block">{{ formatDate(selectedRequest.enrollment_date) }}</small>
                </div>
              </div>
            </div>

            <div v-if="selectedRequest.request_message" class="mt-4">
              <h6 class="fw-bold text-primary">Student Message</h6>
              <div class="p-3 bg-light rounded border-start border-primary border-3">
                {{ selectedRequest.request_message }}
              </div>
            </div>

            <div v-if="selectedRequest.teacher_response" class="mt-4">
              <h6 class="fw-bold text-primary">Teacher Response</h6>
              <div class="p-3 bg-light rounded border-start border-success border-3">
                {{ selectedRequest.teacher_response }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Reject Modal -->
  <div 
    class="modal fade" 
    id="rejectModal" 
    tabindex="-1" 
    aria-labelledby="rejectModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="rejectModalLabel">
            <i class="bi bi-x-circle me-2"></i>
            Reject Request
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRequest">
            <p><strong>Student:</strong> {{ selectedRequest.student.user.name }}</p>
            <p><strong>Subject:</strong> {{ selectedRequest.teacher_subject.subject.name }}</p>
            
            <div class="mb-3">
              <label for="rejectReason" class="form-label fw-bold text-danger">
                Reason for Rejection *
              </label>
              <textarea 
                class="form-control" 
                id="rejectReason" 
                rows="3"
                v-model="rejectReason"
                placeholder="Please provide a clear reason..."
                required
              ></textarea>
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
            @click="submitReject"
            :disabled="!rejectReason.trim()"
          >
            <i class="bi bi-x-lg me-1"></i>
            Reject Request
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Remove Student Confirmation Modal -->
  <div 
    class="modal fade" 
    id="removeRequestStudentModal" 
    tabindex="-1" 
    aria-labelledby="removeRequestStudentModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="removeRequestStudentModalLabel">
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
                  <div class="fw-semibold">{{ studentToRemove.student.user.name }}</div>
                  <small class="text-muted">Roll: {{ studentToRemove.student.student_id || 'N/A' }}</small>
                  <br>
                  <small class="text-muted">Subject: {{ studentToRemove.teacher_subject.subject.name }}</small>
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
import { ref, computed, watch, onUnmounted } from 'vue'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'

// Props & Emits
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
    student_id?: string
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
  }
}

const props = defineProps<{
  requests: EnrollmentRequest[]
  loading: boolean
}>()

const emit = defineEmits<{
  'request-updated': []
}>()

// Reactive data
const searchQuery = ref('')
const sortBy = ref('requested_at')
const sortOrder = ref('desc')
const currentPage = ref(1)
const itemsPerPage = 10
const processingRequestId = ref<number | null>(null)
const selectedRequest = ref<EnrollmentRequest | null>(null)
const rejectReason = ref('')
const toastStore = useToastStore()

// State for remove functionality
const removing = ref(false)
const studentToRemove = ref<EnrollmentRequest | null>(null)

// Auto-refresh state
const autoRefresh = ref(false)
const isRefreshing = ref(false)
let refreshInterval: number | null = null

// Computed properties
const filteredRequests = computed(() => {
  let filtered = [...props.requests]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(request => 
      request.student.user.name.toLowerCase().includes(query) ||
      (request.student.student_id && request.student.student_id.toLowerCase().includes(query)) ||
      request.teacher_subject.subject.name.toLowerCase().includes(query)
    )
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any
    let bValue: any
    
    switch (sortBy.value) {
      case 'student_name':
        aValue = a.student.user.name.toLowerCase()
        bValue = b.student.user.name.toLowerCase()
        break
      case 'roll_no':
        aValue = Number.parseInt(a.student.student_id || '0')
        bValue = Number.parseInt(b.student.student_id || '0')
        break
      case 'subject_name':
        aValue = a.teacher_subject.subject.name.toLowerCase()
        bValue = b.teacher_subject.subject.name.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      default:
        aValue = new Date(a.requested_at)
        bValue = new Date(b.requested_at)
    }
    
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  
  // Apply pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  let total = props.requests.length
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    total = props.requests.filter(request => 
      request.student.user.name.toLowerCase().includes(query) ||
      (request.student.student_id && request.student.student_id.toLowerCase().includes(query)) ||
      request.teacher_subject.subject.name.toLowerCase().includes(query)
    ).length
  }
  return Math.ceil(total / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
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

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-warning text-dark',
    approved: 'bg-success',
    rejected: 'bg-danger',
    active: 'bg-primary',
    inactive: 'bg-secondary',
    completed: 'bg-info'
  }
  return classes[status as keyof typeof classes] || 'bg-secondary'
}

const getStatusIcon = (status: string) => {
  const icons = {
    pending: 'bi-clock',
    approved: 'bi-check-circle',
    rejected: 'bi-x-circle',
    active: 'bi-person-check',
    inactive: 'bi-person-dash',
    completed: 'bi-trophy'
  }
  return icons[status as keyof typeof icons] || 'bi-circle'
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
    completed: 'Completed'
  }
  return labels[status as keyof typeof labels] || status
}

const getAvatarClass = (status: string) => {
  const classes = {
    pending: 'bg-warning bg-opacity-25 text-warning',
    approved: 'bg-success bg-opacity-25 text-success',
    rejected: 'bg-danger bg-opacity-25 text-danger',
    active: 'bg-primary bg-opacity-25 text-primary',
    inactive: 'bg-secondary bg-opacity-25 text-secondary',
    completed: 'bg-info bg-opacity-25 text-info'
  }
  return classes[status as keyof typeof classes] || 'bg-secondary bg-opacity-25 text-secondary'
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  sortRequests()
}

const sortRequests = () => {
  // Trigger reactivity
  currentPage.value = 1
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const updateRequestStatus = async (request: EnrollmentRequest, status: string) => {
  processingRequestId.value = request.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${request.id}/status`, {
      status,
      teacher_response: `Status updated to ${status}`
    })
    
    emit('request-updated')
  } catch (error) {
    console.error('Error updating request:', error)
  } finally {
    processingRequestId.value = null
  }
}

const viewRequestDetails = (request: EnrollmentRequest) => {
  selectedRequest.value = request
  const modal = new (globalThis as any).bootstrap.Modal(document.getElementById('detailsModal'))
  modal.show()
}

const openRejectModal = (request: EnrollmentRequest) => {
  selectedRequest.value = request
  rejectReason.value = ''
  const modal = new (globalThis as any).bootstrap.Modal(document.getElementById('rejectModal'))
  modal.show()
}

const submitReject = async () => {
  if (!selectedRequest.value || !rejectReason.value.trim()) return
  
  processingRequestId.value = selectedRequest.value.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${selectedRequest.value.id}/status`, {
      status: 'rejected',
      teacher_response: rejectReason.value
    })
    
    const modal = (globalThis as any).bootstrap.Modal.getInstance(document.getElementById('rejectModal'))
    modal.hide()
    
    emit('request-updated')
  } catch (error) {
    console.error('Error updating request:', error)
  } finally {
    processingRequestId.value = null
  }
}

/**
 * Confirm student removal
 */
const confirmRemoveStudent = (request: EnrollmentRequest) => {
  studentToRemove.value = request
  
  // Use a more reliable way to show the modal
  const modalElement = document.getElementById('removeRequestStudentModal')
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
      backdrop.id = 'request-modal-backdrop'
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
    await axiosInstance.delete(`/students/${studentToRemove.value.student.id}`)
    
    // Close modal
    const modalElement = document.getElementById('removeRequestStudentModal')
    if (modalElement) {
      try {
        const modal = (globalThis as any).bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        } else {
          // Fallback: manually hide modal
          hideRequestModal()
        }
      } catch (error) {
        console.error('Error closing modal:', error)
        hideRequestModal()
      }
    }
    
    // Reset
    studentToRemove.value = null
    
    // Emit request updated event to refresh the list
    emit('request-updated')
    
    // Show success toast notification
    toastStore.showToast({
      title: 'Success',
      message: `Student "${studentToRemove.value!.student.user.name}" has been removed successfully.`,
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
const hideRequestModal = () => {
  const modalElement = document.getElementById('removeRequestStudentModal')
  if (modalElement) {
    modalElement.classList.remove('show')
    modalElement.style.display = 'none'
    document.body.classList.remove('modal-open')
    
    // Remove backdrop
    const backdrop = document.getElementById('request-modal-backdrop')
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
    emit('request-updated') // This will trigger a silent refresh in the parent component
    // Add a small delay to show the spinning animation
    setTimeout(() => {
      isRefreshing.value = false
    }, 200)
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

// Cleanup
onUnmounted(() => {
  stopAutoRefresh()
})

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pagination .page-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: -36px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 3px currentColor;
}

.timeline-content {
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: -30px;
  top: 6px;
  bottom: -6px;
  width: 2px;
  background-color: #e9ecef;
}

.border-3 {
  border-width: 3px !important;
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