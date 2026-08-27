<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <output class="spinner-border text-warning">
        <span class="visually-hidden">Loading...</span>
      </output>
      <p class="mt-2 text-muted">Loading pending requests...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="requests.length === 0" class="text-center py-5">
      <i class="bi bi-check-circle display-4 text-success mb-3"></i>
      <h5 class="text-muted">No Pending Requests</h5>
      <p class="text-muted mb-0">All enrollment requests have been processed.</p>
    </div>

    <!-- Simplified Requests List -->
    <div v-else class="requests-container">
      <div 
        v-for="request in requests" 
        :key="request.id"
        class="request-card"
      >
        <!-- Student Info -->
        <div class="student-info">
          <h6 class="student-name">{{ request.student.user.name }}</h6>
          <p class="student-email">{{ request.student.user.email_id }}</p>
          <span class="request-time">{{ formatDate(request.requested_at) }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button 
            class="btn-confirm"
            @click="handleApproval(request)"
            :disabled="processingRequestId === request.id"
          >
            <span v-if="processingRequestId === request.id" class="spinner"></span>
            <span v-else>Confirm</span>
          </button>
          <button 
            class="btn-cancel"
            @click="handleReject(request)"
            :disabled="processingRequestId === request.id"
          >
            <span v-if="processingRequestId === request.id" class="spinner"></span>
            <span v-else>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axiosInstance from '@/config/axios'

// Props
interface EnrollmentRequest {
  id: number
  status: string
  request_message?: string
  teacher_response?: string
  academic_year: string
  requested_at: string
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

const props = defineProps<{
  requests: EnrollmentRequest[]
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  'request-updated': []
}>()

// Reactive data
const processingRequestId = ref<number | null>(null)

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleApproval = async (request: EnrollmentRequest) => {
  processingRequestId.value = request.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${request.id}/status`, {
      status: 'approved',
      teacher_response: 'Request approved'
    })
    
    emit('request-updated')
  } catch (error) {
    console.error('Error approving request:', error)
  } finally {
    processingRequestId.value = null
  }
}

const handleReject = async (request: EnrollmentRequest) => {
  processingRequestId.value = request.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${request.id}/status`, {
      status: 'rejected',
      teacher_response: 'Request rejected'
    })
    
    emit('request-updated')
  } catch (error) {
    console.error('Error rejecting request:', error)
  } finally {
    processingRequestId.value = null
  }
}
</script>

<style scoped>
.requests-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.request-card:hover {
  border-color: #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.student-info {
  flex: 1;
}

.student-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.student-email {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.request-time {
  font-size: 0.85rem;
  color: #adb5bd;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-confirm {
  background: #000000;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm:hover:not(:disabled) {
  background: #333333;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel:hover:not(:disabled) {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
  transform: translateY(-1px);
}

.btn-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .request-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
  
  .btn-confirm,
  .btn-cancel {
    min-width: 100px;
  }
}
</style> 