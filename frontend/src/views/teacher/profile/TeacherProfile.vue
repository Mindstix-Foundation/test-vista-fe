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
          Failed to load profile data. Please try again later.
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
                    :value="profile.schools && profile.schools.length > 0 ? profile.schools[0].name : 'Not assigned'"
                  />
                </div>
              </div>

              <!-- Contact Numbers -->
              <div class="row mb-2">
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

              <!-- Email -->
              <div class="row mb-2">
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

              <!-- Qualification -->
              <div class="row mb-2">
                <label for="qualification" class="col-12 col-lg-3 col-form-label fw-bold"
                  >Highest Qualification:</label
                >
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="qualification"
                    :value="profile.highest_qualification || 'Not provided'"
                  />
                </div>
              </div>
            </form>

            <!-- Curriculum scope (create papers) -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <h6 class="fw-bold mb-0">Teaching scope (create papers)</h6>
                  <button
                    type="button"
                    class="btn btn-outline-dark btn-sm"
                    @click="editingScope = !editingScope"
                  >
                    {{ editingScope ? 'Cancel' : 'Edit scope' }}
                  </button>
                </div>
                <p class="text-muted small mb-2">
                  Used to create test papers. Organization is only required to assign online tests.
                </p>

                <div v-if="!editingScope">
                  <div v-if="profile.curriculum_scope?.board" class="small">
                    <div class="mb-1">
                      <strong>Board:</strong> {{ profile.curriculum_scope.board.name }}
                    </div>
                    <ul class="mb-0 ps-3">
                      <li
                        v-for="std in profile.curriculum_scope.standards"
                        :key="std.id"
                      >
                        <strong>{{ std.name }}:</strong>
                        {{ (std.subjects || []).map((s) => s.name).join(', ') }}
                      </li>
                    </ul>
                  </div>
                  <div v-else class="text-muted small">No teaching scope set yet.</div>
                </div>

                <div v-else class="border rounded p-3 bg-light">
                  <TeacherCurriculumFields
                    :key="scopeFormKey"
                    id-prefix="profileCurr"
                    :touched="scopeTouched"
                    :initial="profile.curriculum_scope"
                    @update="onScopeUpdate"
                  />
                  <div v-if="scopeError" class="alert alert-danger py-2 small mt-2">{{ scopeError }}</div>
                  <div v-if="scopeSuccess" class="alert alert-success py-2 small mt-2">{{ scopeSuccess }}</div>
                  <button
                    type="button"
                    class="btn btn-dark btn-sm mt-2"
                    :disabled="scopeSaving"
                    @click="saveCurriculumScope"
                  >
                    <output
                      v-if="scopeSaving"
                      class="spinner-border spinner-border-sm me-1"
                    ></output>
                    Save teaching scope
                  </button>
                </div>
              </div>
            </div>

            <!-- Teaching Subjects - Full Width (org assign mapping) -->
            <div class="row mt-3" v-if="profile.teaching_subjects && profile.teaching_subjects.length > 0">
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold mb-0">Org teaching subjects (assign)</h6>
                  <a 
                    href="#" 
                    class="toggle-link d-flex align-items-center"
                    @click.prevent="toggleSubjects"
                    :class="{ 'expanded': isSubjectsExpanded }"
                    aria-controls="teachingSubjectsCollapse">
                    <span class="toggle-text">{{ isSubjectsExpanded ? 'Hide' : 'Show' }}</span>
                    <span class="toggle-icon-container">
                      <i class="bi bi-chevron-down toggle-icon"></i>
                    </span>
                  </a>
                </div>
                <div 
                  class="collapse border-top pt-3 " 
                  id="teachingSubjectsCollapse"
                  ref="subjectsCollapseRef">
                  <div id="classSubjectList">
                    <ul class="list-group">
                      <li
                        v-for="(standardGroup, standardName) in groupedSubjects"
                        :key="standardName"
                        class="mb-2"
                      >
                        <div class="list-group-item">
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-bold">Standard {{ standardName }}</span>
                          </div>
                          <div class="ps-3 d-flex flex-wrap gap-2">
                            <span
                              v-for="subject in standardGroup"
                              :key="subject.id"
                              class="subject-badge"
                            >
                              <i class="bi bi-book me-1"></i>
                              {{ subject.subject.name }}
                            </span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="d-flex justify-content-end gap-2 flex-wrap">
                  <button
                    type="button"
                    class="btn btn-dark"
                    style="border: 1px solid #dee2e6;"
                    @click="goToChangePassword"
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
          <div class="modal-header border-danger-subtle">
            <h5 class="modal-title text-danger" id="deleteAccountModalLabel">Delete account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="deleteStatusLoading" class="text-center py-3">
              <output class="spinner-border spinner-border-sm text-danger"></output>
            </div>
            <template v-else>
              <p class="small mb-3">
                This permanently deletes your account. Enter your password to confirm.
              </p>

              <div v-if="deleteStatus?.org && deleteStatus.requires?.modes?.includes('transfer_admin')" class="mb-3">
                <div class="form-label fw-semibold small">You are the sole admin of
                  <strong>{{ deleteStatus.org.name }}</strong>. Choose how to proceed:</div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="modeTransfer"
                    value="transfer_admin"
                    v-model="deleteMode"
                  />
                  <label class="form-check-label" for="modeTransfer">
                    Appoint another teacher as admin, then delete my account (org stays)
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="modeDeleteOrg"
                    value="delete_org"
                    v-model="deleteMode"
                  />
                  <label class="form-check-label" for="modeDeleteOrg">
                    Permanently delete the organization and my account
                  </label>
                </div>
              </div>

              <div
                v-else-if="deleteStatus?.requires?.mode === 'delete_org'"
                class="alert alert-warning small py-2"
              >
                You are the last teacher in
                <strong>{{ deleteStatus.org?.name }}</strong>.
                Deleting your account will permanently delete this organization.
                Connected teachers, students, and aspirants will be notified.
              </div>

              <div v-if="deleteMode === 'transfer_admin'" class="mb-3">
                <label class="form-label small" for="promoteTeacher">New organization admin</label>
                <select id="promoteTeacher" class="form-select form-select-sm" v-model="promoteMembershipId">
                  <option :value="null" disabled>Select a teacher</option>
                  <option
                    v-for="t in deleteStatus?.org?.other_teachers || []"
                    :key="t.membership_id"
                    :value="t.membership_id"
                  >
                    {{ t.name }} ({{ t.email_id }})
                  </option>
                </select>
              </div>

              <div v-if="deleteMode === 'delete_org'" class="form-check mb-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="confirmDeleteOrg"
                  v-model="confirmDeleteOrg"
                />
                <label class="form-check-label small" for="confirmDeleteOrg">
                  I understand the organization will be permanently deleted. Papers stay with their
                  creators; members keep their accounts.
                </label>
              </div>

              <div class="mb-2">
                <label class="form-label small" for="deletePassword">Password</label>
                <input
                  id="deletePassword"
                  type="password"
                  class="form-control"
                  v-model="deletePassword"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                />
              </div>
              <div v-if="deleteError" class="alert alert-danger py-2 small mb-0">{{ deleteError }}</div>
            </template>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              :disabled="deleteStatusLoading || deleteSubmitting || !canSubmitDelete"
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { Modal, Collapse } from 'bootstrap'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import TeacherCurriculumFields from '@/components/login/TeacherCurriculumFields.vue'
import type { CurriculumScopePayload } from '@/components/login/TeacherCurriculumFields.vue'

const authStore = useAuthStore()
const router = useRouter()

// Define profile interface based on API response
interface TeachingSubject {
  id: number
  standard: {
    id: number
    name: string
    sequence_number: number
  }
  subject: {
    id: number
    name: string
  }
  medium?: {
    id: number
    name: string
  }
}

interface School {
  id: number
  name: string
}

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
  highest_qualification?: string
  status: boolean
  created_at: string
  updated_at: string
  roles: Role[]
  schools: School[]
  teaching_subjects: TeachingSubject[]
  curriculum_scope?: {
    board: { id: number; name: string; abbreviation?: string }
    standards: {
      id: number
      name: string
      sequence_number: number
      subjects: { id: number; name: string }[]
    }[]
  } | null
}

// State variables
const profile = ref<Profile>({} as Profile)
const loading = ref(true)
const error = ref(false)
const logoutModal = ref<Modal | null>(null)
const deleteAccountModal = ref<Modal | null>(null)
const subjectsCollapseRef = ref<HTMLElement | null>(null)
const subjectsCollapse = ref<Collapse | null>(null)
const isSubjectsExpanded = ref(false)
const editingScope = ref(false)
const scopeTouched = ref(false)
const scopeSaving = ref(false)
const scopeError = ref('')
const scopeSuccess = ref('')
const scopePayload = ref<CurriculumScopePayload | null>(null)
const scopeFormKey = ref(0)

interface DeleteAccountOtherTeacher {
  membership_id: number
  user_id: number
  name: string
  email_id: string
  member_role: string
}

interface DeleteAccountStatus {
  allowed: boolean
  reason?: string
  roles?: string[]
  org: {
    institution_id: number
    name: string
    is_sole_admin: boolean
    is_last_teacher: boolean
    other_teachers: DeleteAccountOtherTeacher[]
  } | null
  requires?: { mode: string; modes?: string[] }
}

const deleteStatus = ref<DeleteAccountStatus | null>(null)
const deleteStatusLoading = ref(false)
const deleteSubmitting = ref(false)
const deletePassword = ref('')
const deleteError = ref('')
const deleteMode = ref<'simple' | 'transfer_admin' | 'delete_org'>('simple')
const promoteMembershipId = ref<number | null>(null)
const confirmDeleteOrg = ref(false)

const canSubmitDelete = computed(() => {
  if (!deletePassword.value) return false
  if (deleteMode.value === 'transfer_admin' && !promoteMembershipId.value) return false
  if (deleteMode.value === 'delete_org' && !confirmDeleteOrg.value) return false
  return true
})

const onScopeUpdate = (payload: CurriculumScopePayload | null) => {
  scopePayload.value = payload
}

const saveCurriculumScope = async () => {
  scopeTouched.value = true
  scopeError.value = ''
  scopeSuccess.value = ''
  if (!scopePayload.value) {
    scopeError.value = 'Select board, standards, and subjects'
    return
  }
  scopeSaving.value = true
  try {
    const { data } = await axiosInstance.put('/users/me/curriculum-scope', scopePayload.value)
    scopeSuccess.value = data?.message || 'Curriculum scope updated'
    editingScope.value = false
    await fetchProfileData()
    scopeFormKey.value += 1
  } catch (e: any) {
    scopeError.value =
      e?.response?.data?.message || 'Failed to update teaching scope'
  } finally {
    scopeSaving.value = false
  }
}

// Computed property to group subjects by standard
const groupedSubjects = computed(() => {
  const grouped: Record<string, TeachingSubject[]> = {};
  
  if (profile.value?.teaching_subjects) {
    for (const subject of profile.value.teaching_subjects) {
      const standardName = subject.standard.name;
      if (!grouped[standardName]) {
        grouped[standardName] = [];
      }
      grouped[standardName].push(subject);
    }
  }
  
  return grouped;
});

// Fetch profile data from API
const fetchProfileData = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await axiosInstance.get('/auth/profile')
    if (response.data && response.data.statusCode === 200) {
      profile.value = response.data.data
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Error fetching profile data:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

/**
 * Toggle the visibility of teaching subjects section
 */
const toggleSubjects = () => {
  if (subjectsCollapse.value) {
    // Toggle the collapse state
    if (isSubjectsExpanded.value) {
      subjectsCollapse.value.hide()
    } else {
      subjectsCollapse.value.show()
    }
    
    // Update the expanded state (with slight delay to ensure Bootstrap's animation completes)
    setTimeout(() => {
      isSubjectsExpanded.value = !isSubjectsExpanded.value
    }, 50)
  }
}

/**
 * Show the logout confirmation modal
 */
const showLogoutModal = () => {
  logoutModal.value?.show()
}

const resetDeleteForm = () => {
  deletePassword.value = ''
  deleteError.value = ''
  promoteMembershipId.value = null
  confirmDeleteOrg.value = false
  deleteMode.value = 'simple'
}

const openDeleteAccountModal = async () => {
  resetDeleteForm()
  deleteStatusLoading.value = true
  deleteAccountModal.value?.show()
  try {
    const { data } = await axiosInstance.get('/users/me/delete-account-status')
    deleteStatus.value = data
    if (data?.requires?.mode === 'delete_org') {
      deleteMode.value = 'delete_org'
    } else if (data?.requires?.modes?.includes('transfer_admin')) {
      deleteMode.value = 'transfer_admin'
    } else {
      deleteMode.value = 'simple'
    }
  } catch (e: any) {
    deleteError.value =
      e?.response?.data?.message || 'Failed to load account deletion options'
  } finally {
    deleteStatusLoading.value = false
  }
}

const confirmDeleteAccount = async () => {
  deleteError.value = ''
  if (!canSubmitDelete.value) return
  deleteSubmitting.value = true
  try {
    const body: Record<string, unknown> = {
      password: deletePassword.value,
      mode: deleteMode.value,
    }
    if (deleteMode.value === 'transfer_admin') {
      body.promote_membership_id = promoteMembershipId.value
    }
    if (deleteMode.value === 'delete_org') {
      body.confirm_delete_org = true
    }
    await axiosInstance.delete('/users/me', { data: body })
    deleteAccountModal.value?.hide()
    authStore.clearAuth()
    localStorage.clear()
    await router.push('/login')
  } catch (e: any) {
    const msg = e?.response?.data?.message
    deleteError.value = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to delete account'
  } finally {
    deleteSubmitting.value = false
  }
}

/**
 * Navigate to the change password page
 */
const goToChangePassword = () => {
  router.push({ name: 'changePassword' })
}

/**
 * Handle user logout
 */
const logout = async () => {
  try {
    logoutModal.value?.hide()
    await authStore.logout()
  } catch (error) {
    console.error('Error during logout:', error)
    await router.push('/login')
  }
}

onMounted(async () => {
  const modalElement = document.getElementById('logoutModal')
  if (modalElement) {
    logoutModal.value = new Modal(modalElement)
  }
  const deleteModalEl = document.getElementById('deleteAccountModal')
  if (deleteModalEl) {
    deleteAccountModal.value = new Modal(deleteModalEl)
  }

  await fetchProfileData()

  await nextTick(() => {
    if (subjectsCollapseRef.value) {
      subjectsCollapse.value = new Collapse(subjectsCollapseRef.value, {
        toggle: false,
      })
      subjectsCollapseRef.value.addEventListener('shown.bs.collapse', () => {
        isSubjectsExpanded.value = true
      })
      subjectsCollapseRef.value.addEventListener('hidden.bs.collapse', () => {
        isSubjectsExpanded.value = false
      })
    }
  })
})
</script>

<style scoped>
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

.subject-separator {
  display: inline-block;
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

/* Custom styling for teaching subjects */
.subject-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #495057;
  transition: all 0.2s ease-in-out;
  cursor: default;
}

.subject-badge:hover {
  background-color: #e9ecef;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.subject-badge i {
  color: #6c757d;
}

/* Custom styling for teaching subjects list */
#classSubjectList .list-group {
  --bs-list-group-color: var(--bs-body-color);
  --bs-list-group-bg: var(--bs-body-bg);
  --bs-list-group-border-color: var(--bs-border-color);
  --bs-list-group-border-width: var(--bs-border-width);
  --bs-list-group-border-radius: var(--bs-border-radius);
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

#classSubjectList ul {
  list-style: none;
  padding-left: 0;
}

#classSubjectList li {
  list-style: none;
}

#classSubjectList .list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  background-color: var(--bs-list-group-bg);
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

#classSubjectList .list-group-item:hover {
  background-color: #f8f9fa;
}

/* Make sure teaching subjects section is responsive */
@media (max-width: 576px) {
  .subject-badge {
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  #classSubjectList .list-group-item {
    padding: 0.5rem 0.75rem;
  }
  
  #classSubjectList .ps-3 {
    padding-left: 0.5rem !important;
  }
}

@media (min-width: 576px) and (max-width: 991.98px) {
  #classSubjectList .ps-3 {
    padding-left: 1rem !important;
  }
}

/* Toggle link styling */
.toggle-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.8125rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
  min-width: 85px;
  display: inline-flex;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.toggle-link:hover {
  color: #495057;
}

.toggle-link:active, .toggle-link:focus {
  color: #495057;
  background-color: transparent;
  outline: none;
}

.toggle-text {
  margin-right: 6px;
  width: 38px; /* Wider fixed width to prevent wrapping */
  text-align: right;
  white-space: nowrap;
  display: inline-block; /* Ensures the text stays on one line */
}

.toggle-icon-container {
  display: inline-flex;
  width: 16px;
  justify-content: center;
  align-items: center;
}

.toggle-icon {
  transition: transform 0.3s ease;
  font-size: 0.8125rem;
}

.toggle-link.expanded .toggle-icon {
  transform: rotate(180deg);
}

/* Responsive adjustments for the toggle link */
@media (max-width: 576px) {
  .toggle-link {
    font-size: 0.75rem;
    min-width: 80px;
    padding: 0.3rem 0.5rem;
  }
  
  .toggle-text {
    width: 34px;
  }
  
  .toggle-icon {
    font-size: 0.75rem;
  }
}

/* Remove old button styling */
.btn-outline-secondary {
  border-color: #dee2e6;
  color: #6c757d;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
  color: #495057;
}

/* Responsive adjustments for the collapse button */
@media (max-width: 576px) {
  .btn-sm {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
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
