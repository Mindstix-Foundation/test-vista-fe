<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">My Profile</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="row justify-content-center my-5">
      <div class="col-12 text-center">
        <output class="spinner-border text-primary">
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="row justify-content-center my-4">
      <div class="col-12 col-sm-10">
        <div class="alert alert-danger" role="alert">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Profile Card -->
    <div v-else class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="card shadow-sm">
          <div class="card-body p-3 p-md-4">
            <form>
              <!-- Name -->
              <div class="row mb-2">
                <label for="name" class="col-12 col-sm-3 col-form-label fw-bolder">Name:</label>
                <div class="col-12 col-sm-9">
                  <input
                    type="text"
                    class="form-control-plaintext"
                    id="name"
                    :value="profile.name"
                    readonly
                  />
                </div>
              </div>

              <!-- Email ID - Hidden -->
              <div class="row mb-2" v-if="false">
                <label for="emailId" class="col-12 col-lg-3 col-form-label fw-bold">Email Id:</label>
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="emailId"
                    :value="profile.email_id"
                  />
                </div>
              </div>

              <!-- Date of Birth - Hidden -->
              <div class="row mb-2" v-if="false">
                <label for="dateOfBirth" class="col-12 col-lg-3 col-form-label fw-bold">Date of Birth:</label>
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="dateOfBirth"
                    :value="formatDateOfBirth(profile.date_of_birth)"
                  />
                </div>
              </div>

              <!-- Contact Numbers - Hidden -->
              <div class="row mb-2" v-if="false">
                <div class="col-12 col-lg-6">
                  <div class="row">
                    <label for="contactNumber" class="col-12 col-lg-6 col-form-label fw-bold"
                      >Contact Number:</label
                    >
                    <div class="col-12 col-lg-6">
                      <input
                        type="text"
                        readonly
                        class="form-control-plaintext"
                        id="contactNumber"
                        :value="profile.contact_number"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="row">
                    <label for="alternateContactNumber" class="col-12 col-lg-6 col-form-label fw-bold"
                      >Alternate Number:</label
                    >
                    <div class="col-12 col-lg-6">
                      <input
                        type="text"
                        readonly
                        class="form-control-plaintext"
                        id="alternateContactNumber"
                        :value="profile.alternate_contact_number || 'Not provided'"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- School Name -->
              <div class="row mb-2">
                <label for="schoolName" class="col-12 col-lg-3 col-form-label fw-bold"
                  >School Name:</label
                >
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="schoolName"
                    :value="profile.school_name || 'Not assigned'"
                  />
                </div>
              </div>

              <!-- Standard -->
              <div class="row mb-2">
                <label for="standard" class="col-12 col-lg-3 col-form-label fw-bold"
                  >Standard:</label
                >
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="standard"
                    :value="profile.standard || 'Not assigned'"
                  />
                </div>
              </div>

              <!-- Student ID -->
              <div class="row mb-2">
                <label for="studentId" class="col-12 col-lg-3 col-form-label fw-bold"
                  >Student ID:</label
                >
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="studentId"
                    :value="profile.student_id || 'Not assigned'"
                  />
                </div>
              </div>
            </form>

            <!-- Action Buttons -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="d-flex justify-content-end gap-2 flex-wrap">
                  <button
                    type="button"
                    class="btn btn-dark"
                    style="border: 1px solid #dee2e6;"
                    @click="handleChangePassword"
                    title="Change your password"
                  >
                    Change Password
                  </button>
                  <button type="button" class="btn btn-custom" @click="showLogoutModal">
                    Logout <i class="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="row mt-4 pt-3 border-top">
              <div class="col-12">
                <h6 class="text-danger fw-bold mb-1">Danger zone</h6>
                <p class="text-muted small mb-2">
                  Permanently delete your account and personal data. This cannot be undone.
                </p>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="openDeleteAccountModal">
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div
      class="modal fade"
      id="logoutModal"
      tabindex="-1"
      aria-labelledby="logoutModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="logoutModalLabel">Confirm Logout</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">Are you sure you want to log out?</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="logout">Logout</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div
      class="modal fade"
      id="deleteAccountModal"
      tabindex="-1"
      aria-labelledby="deleteAccountModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger" id="deleteAccountModalLabel">Delete account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="small mb-3">
              This permanently deletes your account. Enter your password to confirm.
            </p>
            <div class="mb-2">
              <label class="form-label small" for="studentDeletePassword">Password</label>
              <input
                id="studentDeletePassword"
                type="password"
                class="form-control"
                v-model="deletePassword"
                autocomplete="current-password"
                placeholder="Enter your password"
              />
            </div>
            <div v-if="deleteError" class="alert alert-danger py-2 small mb-0">{{ deleteError }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              :disabled="deleteSubmitting || !deletePassword"
              @click="confirmDeleteAccount"
            >
              <output
                v-if="deleteSubmitting"
                class="spinner-border spinner-border-sm me-1"
              ></output>
              Delete permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/config/axios'

const router = useRouter()
const authStore = useAuthStore()
const logoutModal = ref<Modal | null>(null)
const deleteAccountModal = ref<Modal | null>(null)
const deletePassword = ref('')
const deleteError = ref('')
const deleteSubmitting = ref(false)

// Define interfaces based on API response
interface Role {
  id: number
  name: string
}

interface Profile {
  id: number
  name: string
  email_id: string
  contact_number: string
  alternate_contact_number?: string
  student_id?: string
  date_of_birth?: string
  school_name?: string
  standard?: string
  roles: Role[]
}

interface HttpError extends Error {
  response?: {
    status?: number
    data?: unknown
  }
}

// State variables
const profile = ref<Profile>({} as Profile)
const loading = ref(true)
const error = ref<string | null>(null)

/**
 * Format date of birth for display
 */
const formatDateOfBirth = (dateString?: string): string => {
  if (!dateString) return 'Not provided'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Fetch user profile data from API
 */
const fetchProfileData = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await axiosInstance.get('/auth/profile')
    
    if (response.data && response.data.statusCode === 200) {
      profile.value = response.data.data
    } else {
      throw new Error('Failed to fetch profile data')
    }
  } catch (err: unknown) {
    console.error('Error fetching profile data:', err)
    error.value = 'Failed to load profile data. Please try again later.'
    
    // If unauthorized, redirect to login
    if (err instanceof Error && 'response' in err) {
      const response = (err as HttpError).response
      if (response?.status === 401) {
      await authStore.logout()
      router.push('/login')
      }
    }
  } finally {
    loading.value = false
  }
}

/**
 * Show the logout confirmation modal
 */
const showLogoutModal = () => {
  logoutModal.value?.show()
}

const openDeleteAccountModal = () => {
  deletePassword.value = ''
  deleteError.value = ''
  deleteAccountModal.value?.show()
}

const confirmDeleteAccount = async () => {
  deleteError.value = ''
  if (!deletePassword.value) return
  deleteSubmitting.value = true
  try {
    await axiosInstance.delete('/users/me', {
      data: { password: deletePassword.value, mode: 'simple' },
    })
    deleteAccountModal.value?.hide()
    authStore.clearAuth()
    localStorage.clear()
    await router.push('/login')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string | string[] } } }
    const msg = err?.response?.data?.message
    deleteError.value = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to delete account'
  } finally {
    deleteSubmitting.value = false
  }
}

/**
 * Handle user logout
 */
const logout = async () => {
  try {
    // Simple modal cleanup
    if (logoutModal.value) {
      logoutModal.value.hide()
    }
    
    // Small delay to let modal hide
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Clean up only our specific modal
    cleanupSpecificModal()
    
    // Now perform logout
    await authStore.logout()
  } catch (error) {
    console.error('Error during logout:', error)
    
    // Simple cleanup on error
    cleanupSpecificModal()
    
    // Even if logout fails, redirect to login
    router.push('/login')
  }
}

/**
 * Clean up only the specific logout modal
 */
const cleanupSpecificModal = () => {
  try {
    // Dispose of modal instance if it exists
    if (logoutModal.value) {
      logoutModal.value.dispose()
      logoutModal.value = null
    }
    
    // Only clean up our specific modal backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop')
    for (const backdrop of backdrops) {
      // Check if this backdrop is related to our modal
      const modals = document.querySelectorAll('.modal.show')
      if (modals.length === 0) {
        backdrop.remove()
      }
    }
    
    // Only remove modal-open if no other modals are active
    const activeModals = document.querySelectorAll('.modal.show')
    if (activeModals.length === 0) {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  } catch (error) {
    console.error('Error during specific modal cleanup:', error)
  }
}

/**
 * Navigate to the change password page
 */
const handleChangePassword = () => {
  router.push({ name: 'changePassword' })
}

// Initialize modal and fetch profile data on mount
onMounted(() => {
  const modalElement = document.getElementById('logoutModal')
  if (modalElement) {
    logoutModal.value = new Modal(modalElement)
  }
  const deleteModalEl = document.getElementById('deleteAccountModal')
  if (deleteModalEl) {
    deleteAccountModal.value = new Modal(deleteModalEl)
  }

  fetchProfileData()
})

// Cleanup modal on component unmount
onBeforeUnmount(() => {
  cleanupSpecificModal()
})
</script>

<style scoped>
.student-profile {
  background-color: #f8f9fa;
  min-height: calc(100vh - var(--topbar-height, 56px));
}

.card {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-body {
  padding: 1.5rem;
}

.form-control-plaintext {
  font-weight: normal;
  padding: 0.375rem 0;
  margin-bottom: 0;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .form-control-plaintext {
    padding-left: 0;
  }
  
  .col-form-label {
    padding-bottom: 0;
    margin-bottom: -0.5rem;
  }
  
  /* Update button styles for mobile */
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  /* Make action buttons stack on mobile */
  .row .d-flex.justify-content-end {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) {
  /* Maintain right-alignment for buttons on tablet */
  .d-flex.justify-content-end {
    justify-content: flex-end;
  }
}

/* Button Styles */
.btn-custom {
  border: 1px solid gray !important;
  background-color: #f8f9fa;
  color: black;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.btn-custom:hover {
  border: 1px solid #dc3545 !important;
  background-color: #dc3545 !important;
  color: white !important;
}

@media (max-width: 576px) {
  .btn-custom {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545 !important;
    color: white !important;
  }
  
  /* Make action buttons stack on mobile */
  .d-flex.justify-content-end {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  /* Update button styles for mobile */
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style> 