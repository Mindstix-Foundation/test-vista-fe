<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <output class="spinner-border text-success">
        <span class="visually-hidden">Loading...</span>
      </output>
      <p class="mt-2 text-muted">Loading approved requests...</p>
    </div>

    <div v-else-if="requests.length === 0" class="text-center py-5">
      <i class="bi bi-check-circle display-4 text-success mb-3"></i>
      <h5 class="text-muted">No Approved Requests</h5>
      <p class="text-muted mb-0">No approved enrollment requests found.</p>
    </div>

    <div v-else>
      <!-- Approved Requests List -->
      <div class="row g-3">
        <div 
          v-for="request in requests" 
          :key="request.id"
          class="col-12"
        >
          <div class="card border-success border-opacity-25 hover-card">
            <div class="card-body">
              <div class="row align-items-center">
                <!-- Student Info -->
                <div class="col-md-4">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle bg-success bg-opacity-25 text-success me-3">
                      <i class="bi bi-person-check-fill"></i>
                    </div>
                    <div>
                      <h6 class="mb-1 fw-bold">{{ request.student.user.name }}</h6>
                      <small class="text-muted">{{ request.student.user.email_id }}</small>
                      <div class="mt-1">
                        <span class="badge bg-success">
                          <i class="bi bi-check-circle me-1"></i>
                          Approved
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Subject & Request Info -->
                <div class="col-md-5">
                  <div class="mb-2">
                    <strong class="text-primary">{{ request.teacher_subject.subject.name }}</strong>
                    <small class="text-muted d-block">{{ request.academic_year }}</small>
                  </div>
                  
                  <div v-if="request.request_message" class="mb-2">
                    <small class="text-muted d-block">Student Message:</small>
                    <p class="mb-0 text-sm bg-light p-2 rounded border-start border-primary border-3">
                      {{ request.request_message }}
                    </p>
                  </div>

                  <div v-if="request.teacher_response" class="mb-2">
                    <small class="text-muted d-block">Your Response:</small>
                    <p class="mb-0 text-sm bg-success bg-opacity-10 p-2 rounded border-start border-success border-3">
                      {{ request.teacher_response }}
                    </p>
                  </div>
                  
                  <div class="d-flex flex-wrap gap-2">
                    <small class="text-muted">
                      <i class="bi bi-calendar me-1"></i>
                      Requested: {{ formatDate(request.requested_at) }}
                    </small>
                    <small v-if="request.responded_at" class="text-muted">
                      <i class="bi bi-calendar-check me-1"></i>
                      Approved: {{ formatDate(request.responded_at) }}
                    </small>
                  </div>
                </div>

                <!-- Actions -->
                <div class="col-md-3 text-end">
                  <div class="d-flex flex-column gap-2">
                    <button 
                      class="btn btn-primary btn-sm"
                      @click="activateStudent(request)"
                      :disabled="processingRequestId === request.id"
                      title="Activate student enrollment"
                    >
                      <i class="bi bi-person-check me-1"></i>
                      Activate
                    </button>
                    <button 
                      class="btn btn-outline-warning btn-sm"
                      @click="openResponseModal(request)"
                      :disabled="processingRequestId === request.id"
                      title="Update response message"
                    >
                      <i class="bi bi-chat-dots me-1"></i>
                      Update Response
                    </button>
                    <button 
                      class="btn btn-outline-danger btn-sm"
                      @click="openRejectModal(request)"
                      :disabled="processingRequestId === request.id"
                      title="Reject this request"
                    >
                      <i class="bi bi-x-lg me-1"></i>
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              <!-- Processing indicator -->
              <div v-if="processingRequestId === request.id" class="mt-3">
                <div class="d-flex align-items-center text-muted">
                  <output class="spinner-border spinner-border-sm me-2"></output>
                  Processing request...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Response Update Modal -->
  <div 
    class="modal fade" 
    id="updateResponseModal" 
    tabindex="-1" 
    aria-labelledby="updateResponseModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateResponseModalLabel">
            <i class="bi bi-chat-dots me-2"></i>
            Update Response Message
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRequest" class="mb-4">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">Student: {{ selectedRequest.student.user.name }}</h6>
                <p class="card-text">
                  <strong>Subject:</strong> {{ selectedRequest.teacher_subject.subject.name }}<br>
                  <strong>Academic Year:</strong> {{ selectedRequest.academic_year }}
                </p>
                <div v-if="selectedRequest.request_message">
                  <strong>Student Message:</strong>
                  <p class="mt-1 p-2 bg-white rounded border-start border-primary border-3">
                    {{ selectedRequest.request_message }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="updateResponseMessage" class="form-label fw-bold">
              Response Message
            </label>
            <textarea 
              class="form-control" 
              id="updateResponseMessage" 
              rows="4"
              v-model="updateForm.teacher_response"
              placeholder="Update your response message for the student..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-success"
            @click="submitResponseUpdate"
            :disabled="processing || !updateForm.teacher_response.trim()"
          >
            <output v-if="processing" class="spinner-border spinner-border-sm me-2"></output>
            {{ processing ? 'Updating...' : 'Update Response' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Reject Confirmation Modal -->
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
            <i class="bi bi-exclamation-triangle me-2"></i>
            Reject Approved Request
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRequest">
            <p class="mb-3">
              Are you sure you want to reject the approved enrollment request for 
              <strong>{{ selectedRequest.student.user.name }}</strong> 
              in <strong>{{ selectedRequest.teacher_subject.subject.name }}</strong>?
            </p>
            
            <div class="mb-3">
              <label for="rejectReason" class="form-label fw-bold">
                Reason for Rejection <span class="text-danger">*</span>
              </label>
              <textarea 
                class="form-control" 
                id="rejectReason" 
                rows="3"
                v-model="rejectForm.teacher_response"
                placeholder="Please provide a reason for rejecting this approved request..."
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
            @click="submitRejection"
            :disabled="processing || !rejectForm.teacher_response.trim()"
          >
            <output v-if="processing" class="spinner-border spinner-border-sm me-2"></output>
            {{ processing ? 'Rejecting...' : 'Reject Request' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import axiosInstance from '@/config/axios'

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

// Props
const props = defineProps<{
  requests: EnrollmentRequest[]
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  requestUpdated: []
}>()

// Reactive data
const processing = ref(false)
const processingRequestId = ref<number | null>(null)
const selectedRequest = ref<EnrollmentRequest | null>(null)

const updateForm = reactive({
  teacher_response: ''
})

const rejectForm = reactive({
  teacher_response: ''
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const activateStudent = async (request: EnrollmentRequest) => {
  processingRequestId.value = request.id
  try {
    await axiosInstance.put(`/student-subject-enrollments/${request.id}/status`, {
      status: 'active',
      teacher_response: request.teacher_response || 'Student enrollment activated'
    })
    
    emit('requestUpdated')
    showToast('Success', 'Student enrollment activated successfully', 'success')
  } catch (error) {
    console.error('Error activating student:', error)
    showToast('Error', 'Failed to activate student enrollment', 'error')
  } finally {
    processingRequestId.value = null
  }
}

const openResponseModal = (request: EnrollmentRequest) => {
  selectedRequest.value = request
  updateForm.teacher_response = request.teacher_response || ''
  
  const modal = new (globalThis as any).bootstrap.Modal(document.getElementById('updateResponseModal'))
  modal.show()
}

const submitResponseUpdate = async () => {
  if (!selectedRequest.value) return
  
  processing.value = true
  try {
    await axiosInstance.put(`/student-subject-enrollments/${selectedRequest.value.id}/status`, {
      status: 'approved',
      teacher_response: updateForm.teacher_response
    })
    
    const modal = (globalThis as any).bootstrap.Modal.getInstance(document.getElementById('updateResponseModal'))
    modal?.hide()
    
    emit('requestUpdated')
    showToast('Success', 'Response updated successfully', 'success')
  } catch (error) {
    console.error('Error updating response:', error)
    showToast('Error', 'Failed to update response', 'error')
  } finally {
    processing.value = false
  }
}

const openRejectModal = (request: EnrollmentRequest) => {
  selectedRequest.value = request
  rejectForm.teacher_response = ''
  
  const modal = new (globalThis as any).bootstrap.Modal(document.getElementById('rejectModal'))
  modal.show()
}

const submitRejection = async () => {
  if (!selectedRequest.value) return
  
  processing.value = true
  try {
    await axiosInstance.put(`/student-subject-enrollments/${selectedRequest.value.id}/status`, {
      status: 'rejected',
      teacher_response: rejectForm.teacher_response
    })
    
    const modal = (globalThis as any).bootstrap.Modal.getInstance(document.getElementById('rejectModal'))
    modal?.hide()
    
    emit('requestUpdated')
    showToast('Success', 'Request rejected successfully', 'success')
  } catch (error) {
    console.error('Error rejecting request:', error)
    showToast('Error', 'Failed to reject request', 'error')
  } finally {
    processing.value = false
  }
}

const showToast = (title: string, message: string, type: 'success' | 'error') => {
  // You can implement toast notification here or emit an event to parent
  console.log(`${title}: ${message}`)
}
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.avatar-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.text-sm {
  font-size: 0.875rem;
}

.border-3 {
  border-width: 3px !important;
}

.bg-opacity-10 {
  --bs-bg-opacity: 0.1;
}

.bg-opacity-25 {
  --bs-bg-opacity: 0.25;
}
</style> 