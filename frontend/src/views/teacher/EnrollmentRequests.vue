<template>
  <div class="container my-4">
      <div class="row justify-content-center">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-gradient-primary text-white">
              <div class="d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                  <i class="bi bi-person-check me-2"></i>
                  Student Enrollment Requests
                </h4>
                <button 
                  class="btn btn-light btn-sm"
                  @click="refreshData"
                  :disabled="loading"
                >
                  <output v-if="loading" class="spinner-border spinner-border-sm me-2"></output>
                  <i v-else class="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
              </div>
            </div>

            <div class="card-body p-0">
              <!-- Filters -->
              <div class="p-4 border-bottom bg-light">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label" for="enrollment-status-filter">Status Filter:</label>
                    <select id="enrollment-status-filter" class="form-select" v-model="filters.status" @change="fetchEnrollmentRequests">
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label" for="enrollment-year-filter">Academic Year:</label>
                    <select id="enrollment-year-filter" class="form-select" v-model="filters.academic_year" @change="fetchEnrollmentRequests">
                      <option value="">All Years</option>
                      <option v-for="year in academicYears" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label" for="enrollment-subject-filter">Subject:</label>
                    <select id="enrollment-subject-filter" class="form-select" v-model="filters.subject" @change="fetchEnrollmentRequests">
                      <option value="">All Subjects</option>
                      <option v-for="subject in subjects" :key="subject" :value="subject">
                        {{ subject }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Statistics Cards -->
              <div class="p-4 border-bottom">
                <div class="row text-center">
                  <div class="col-6 col-md-3">
                    <div class="stat-card">
                      <h3 class="text-warning mb-1">{{ stats.pending }}</h3>
                      <p class="text-muted mb-0">Pending</p>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="stat-card">
                      <h3 class="text-success mb-1">{{ stats.approved }}</h3>
                      <p class="text-muted mb-0">Approved</p>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="stat-card">
                      <h3 class="text-primary mb-1">{{ stats.active }}</h3>
                      <p class="text-muted mb-0">Active</p>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="stat-card">
                      <h3 class="text-info mb-1">{{ stats.total }}</h3>
                      <p class="text-muted mb-0">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Requests List -->
              <div class="p-4">
                <!-- Loading State -->
                <div v-if="loading" class="text-center py-4">
                  <output class="spinner-border text-primary">
                    <span class="visually-hidden">Loading...</span>
                  </output>
                  <p class="mt-2 text-muted">Loading enrollment requests...</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="enrollmentRequests.length === 0" class="text-center py-5">
                  <i class="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h5 class="text-muted">No Enrollment Requests</h5>
                  <p class="text-muted">No enrollment requests match your current filters.</p>
                </div>

                <!-- Requests Grid -->
                <div v-else>
                  <div class="row g-3">
                    <div 
                      v-for="request in enrollmentRequests" 
                      :key="request.id"
                      class="col-12"
                    >
                      <div class="card border-0 shadow-sm">
                        <div class="card-body">
                          <div class="row align-items-center">
                            <div class="col-md-8">
                              <div class="d-flex align-items-start">
                                <div class="flex-grow-1">
                                  <h5 class="card-title mb-1">
                                    {{ request.student.user.name }}
                                    <small class="text-muted">- {{ request.teacher_subject.subject.name }}</small>
                                  </h5>
                                  
                                  <p class="text-muted mb-1">
                                    <i class="bi bi-envelope me-1"></i>
                                    {{ request.student.user.email_id }}
                                  </p>
                                  
                                  <p class="text-muted mb-1">
                                    <i class="bi bi-calendar me-1"></i>
                                    Requested: {{ formatDate(request.requested_at) }}
                                    <span class="ms-2 badge bg-light text-dark">
                                      {{ request.academic_year }}
                                    </span>
                                  </p>

                                  <div v-if="request.request_message" class="mt-2">
                                    <small class="text-muted">Student Message:</small>
                                    <p class="mb-0 p-2 bg-light rounded">
                                      "{{ request.request_message }}"
                                    </p>
                                  </div>

                                  <div v-if="request.teacher_response" class="mt-2">
                                    <small class="text-muted">Your Response:</small>
                                    <p class="mb-0 p-2 bg-light rounded">
                                      {{ request.teacher_response }}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="col-md-4 text-end">
                              <div class="mb-2">
                                <span 
                                  class="badge fs-6 px-3 py-2"
                                  :class="getStatusBadgeClass(request.status)"
                                >
                                  {{ getStatusText(request.status) }}
                                </span>
                              </div>

                              <!-- Action Buttons -->
                              <div v-if="request.status === 'pending'" class="btn-group-vertical d-grid gap-2">
                                <button 
                                  class="btn btn-success btn-sm"
                                  @click="openResponseModal(request, 'approved')"
                                  :disabled="processing"
                                >
                                  <i class="bi bi-check-lg me-1"></i>
                                  Approve
                                </button>
                                <button 
                                  class="btn btn-danger btn-sm"
                                  @click="openResponseModal(request, 'rejected')"
                                  :disabled="processing"
                                >
                                  <i class="bi bi-x-lg me-1"></i>
                                  Reject
                                </button>
                              </div>

                              <div v-else-if="request.status === 'approved'" class="d-grid">
                                <button 
                                  class="btn btn-primary btn-sm"
                                  @click="updateStatus(request, 'active')"
                                  :disabled="processing"
                                >
                                  <i class="bi bi-play-fill me-1"></i>
                                  Activate
                                </button>
                              </div>

                              <div v-else class="text-muted">
                                <small>{{ formatDate(request.responded_at || request.requested_at) }}</small>
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
          </div>
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <div class="modal fade" id="responseModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="getActionIcon(selectedAction)" class="me-2"></i>
              {{ getActionTitle(selectedAction) }} Enrollment Request
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedRequest">
              <div class="mb-3">
                <div class="form-label fw-bold">Student:</div>
                <p class="mb-1">{{ selectedRequest.student.user.name }}</p>
                <small class="text-muted">{{ selectedRequest.student.user.email_id }}</small>
              </div>
              
              <div class="mb-3">
                <div class="form-label fw-bold">Subject:</div>
                <p class="mb-1">{{ selectedRequest.teacher_subject.subject.name }}</p>
              </div>

              <div v-if="selectedRequest.request_message" class="mb-3">
                <div class="form-label fw-bold">Student Message:</div>
                <p class="p-2 bg-light rounded mb-1">{{ selectedRequest.request_message }}</p>
              </div>

              <div class="mb-3">
                <label for="teacherResponse" class="form-label">
                  Your Response 
                  <span v-if="selectedAction === 'rejected'" class="text-danger">(Required for rejection)</span>:
                </label>
                <textarea 
                  id="teacherResponse"
                  class="form-control" 
                  rows="3"
                  v-model="responseForm.teacher_response"
                  :placeholder="getResponsePlaceholder(selectedAction)"
                  :required="selectedAction === 'rejected'"
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
              :class="`btn ${selectedAction === 'approved' ? 'btn-success' : 'btn-danger'}`"
              @click="submitResponse"
              :disabled="!canSubmitResponse"
            >
              <output v-if="processing" class="spinner-border spinner-border-sm me-2"></output>
              {{ getActionTitle(selectedAction) }}
            </button>
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
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'

// Types
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
  }
}

// Reactive data
const enrollmentRequests = ref<EnrollmentRequest[]>([])
const loading = ref(false)
const processing = ref(false)
const selectedRequest = ref<EnrollmentRequest | null>(null)
const selectedAction = ref<'approved' | 'rejected'>('approved')

const filters = reactive({
  status: '',
  academic_year: '',
  subject: ''
})

const responseForm = reactive({
  status: 'approved',
  teacher_response: ''
})

// Toast notification
const toastTitle = ref('')
const toastMessage = ref('')
const toastIcon = ref('')

// Computed properties
const academicYears = computed(() => {
  const years = [...new Set(enrollmentRequests.value.map(r => r.academic_year))]
  return years.sort().reverse()
})

const subjects = computed(() => {
  const subjectNames = [...new Set(enrollmentRequests.value.map(r => r.teacher_subject.subject.name))]
  return subjectNames.sort()
})

const stats = computed(() => {
  const pending = enrollmentRequests.value.filter(r => r.status === 'pending').length
  const approved = enrollmentRequests.value.filter(r => r.status === 'approved').length
  const active = enrollmentRequests.value.filter(r => r.status === 'active' || r.status === 'approved').length
  const total = enrollmentRequests.value.length

  return { pending, approved, active, total }
})

const canSubmitResponse = computed(() => {
  if (selectedAction.value === 'rejected') {
    return responseForm.teacher_response.trim().length > 0
  }
  return true
})

// Methods
const fetchEnrollmentRequests = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.academic_year) params.append('academic_year', filters.academic_year)
    if (filters.subject) params.append('subject', filters.subject)
    
    const response = await axiosInstance.get(`/student-subject-enrollments/teacher/my-requests?${params}`)
    enrollmentRequests.value = response.data
  } catch (error) {
    console.error('Error fetching enrollment requests:', error)
    showToast('Error', 'Failed to load enrollment requests', 'bi-exclamation-triangle text-danger')
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await fetchEnrollmentRequests()
  showToast('Success', 'Data refreshed successfully', 'bi-check-circle text-success')
}

const openResponseModal = (request: EnrollmentRequest, action: 'approved' | 'rejected') => {
  selectedRequest.value = request
  selectedAction.value = action
  responseForm.status = action
  responseForm.teacher_response = ''
  
  const modal = new (globalThis as any).bootstrap.Modal(document.getElementById('responseModal'))
  modal.show()
}

const submitResponse = async () => {
  if (!selectedRequest.value) return
  
  if (selectedAction.value === 'rejected' && !responseForm.teacher_response.trim()) {
    showToast('Validation Error', 'Response message is required for rejection', 'bi-exclamation-triangle text-warning')
    return
  }

  processing.value = true
  try {
    await axiosInstance.put(`/student-subject-enrollments/${selectedRequest.value.id}/status`, responseForm)
    
    // Close modal
    const modal = (globalThis as any).bootstrap.Modal.getInstance(document.getElementById('responseModal'))
    modal.hide()
    
    // Refresh data
    await fetchEnrollmentRequests()
    
    const actionText = getActionTitle(selectedAction.value).toLowerCase()
    showToast('Success', `Enrollment request ${actionText} successfully!`, 'bi-check-circle text-success')
  } catch (error) {
    console.error('Error updating enrollment status:', error)
    const axiosError = error as AxiosError<{ message: string }>
    const errorMessage = axiosError.response?.data?.message || 'Failed to update enrollment status'
    showToast('Error', errorMessage, 'bi-exclamation-triangle text-danger')
  } finally {
    processing.value = false
  }
}

const updateStatus = async (request: EnrollmentRequest, status: string) => {
  processing.value = true
  try {
    await axiosInstance.put(`/student-subject-enrollments/${request.id}/status`, {
      status,
      teacher_response: `Status updated to ${status} by teacher`
    })
    
    await fetchEnrollmentRequests()
    showToast('Success', `Enrollment ${status} successfully!`, 'bi-check-circle text-success')
  } catch (error) {
    console.error('Error updating status:', error)
    showToast('Error', 'Failed to update enrollment status', 'bi-exclamation-triangle text-danger')
  } finally {
    processing.value = false
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-warning text-dark'
    case 'approved': return 'bg-success'
    case 'rejected': return 'bg-danger'
    case 'active': return 'bg-primary'
    case 'inactive': return 'bg-secondary'
    case 'completed': return 'bg-info'
    default: return 'bg-secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending'
    case 'approved': return 'Approved'
    case 'rejected': return 'Rejected'
    case 'active': return 'Active'
    case 'inactive': return 'Inactive'
    case 'completed': return 'Completed'
    default: return status
  }
}

const getActionIcon = (action: string) => {
  return action === 'approved' ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'
}

const getActionTitle = (action: string) => {
  return action === 'approved' ? 'Approve' : 'Reject'
}

const getResponsePlaceholder = (action: string) => {
  return action === 'approved' 
    ? 'Optional message to the student...'
    : 'Please provide a reason for rejection...'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  fetchEnrollmentRequests()
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
}

.stat-card {
  padding: 1rem;
}

.stat-card h3 {
  font-weight: 700;
  font-size: 2rem;
}

.card {
  border: none;
  border-radius: 0.75rem;
}

.card-header {
  border-radius: 0.75rem 0.75rem 0 0 !important;
}

.btn-group-vertical .btn + .btn {
  margin-top: 0.25rem;
}

.toast-container {
  z-index: 9999;
}
</style> 