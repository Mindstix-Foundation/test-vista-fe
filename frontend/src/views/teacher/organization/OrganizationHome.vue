<template>
  <div class="container mt-4 mb-5">
    <!-- Header (admin hub pattern) -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-start m-0 fw-bolder text-uppercase">Organization</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <template v-if="!loading && !activeOrg && !pendingMembership">
            <router-link
              :to="{ name: 'teacherCreateOrg' }"
              class="btn btn-success me-2"
              id="addButton"
            >
              Create Organization
            </router-link>
            <router-link :to="{ name: 'teacherJoinOrg' }" class="btn btn-outline-dark">
              Join
            </router-link>
          </template>
          <template v-else-if="activeOrg?.member_role === 'ADMIN'">
            <router-link :to="{ name: 'teacherOrgRequests' }" class="btn btn-dark">
              Join Requests
              <span v-if="pendingCount" class="badge text-bg-danger ms-1">{{ pendingCount }}</span>
            </router-link>
          </template>
        </div>
      </div>
      <hr />
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-10">
        <p class="text-muted small mb-4">
          Organization is for assigning online tests to learners. You can create test papers anytime
          from your Profile teaching scope — no organization required.
        </p>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>

        <div v-if="loading" class="text-center my-5">
          <output class="spinner-border text-primary">
            <span class="visually-hidden">Loading...</span>
          </output>
        </div>

        <template v-else>
          <!-- Empty: no org -->
          <div v-if="!activeOrg && !pendingMembership" class="row g-3">
            <div class="col-12">
              <div class="card empty-state-card text-center py-4">
                <div class="card-body">
                  <i class="bi bi-building empty-state-icon" aria-hidden="true"></i>
                  <h6 class="fw-bold text-uppercase mt-3 mb-2">No organization yet</h6>
                  <p class="text-muted small mb-0 mx-auto" style="max-width: 28rem">
                    Create or join a School / Coaching Center to assign online tests. Creating papers
                    does not require an organization.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="card action-card h-100">
                <div class="card-body d-flex flex-column">
                  <div class="action-card-icon mb-3">
                    <i class="bi bi-building-add" aria-hidden="true"></i>
                  </div>
                  <h6 class="fw-bold text-uppercase mb-2">Create organization</h6>
                  <p class="card-text small text-muted flex-grow-1 mb-3">
                    Start a School or Coaching Center. You become the admin and can invite teachers
                    and learners.
                  </p>
                  <router-link :to="{ name: 'teacherCreateOrg' }" class="btn btn-dark align-self-start">
                    Create Organization
                  </router-link>
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="card action-card h-100">
                <div class="card-body d-flex flex-column">
                  <div class="action-card-icon mb-3">
                    <i class="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                  </div>
                  <h6 class="fw-bold text-uppercase mb-2">Join organization</h6>
                  <p class="card-text small text-muted flex-grow-1 mb-3">
                    Join with an org code, or browse public Schools and Coaching Centers.
                  </p>
                  <router-link
                    :to="{ name: 'teacherJoinOrg' }"
                    class="btn btn-outline-dark align-self-start"
                  >
                    Join Organization
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending join -->
          <div v-else-if="pendingMembership" class="card">
            <div class="card-body">
              <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
                <div>
                  <span class="badge bg-warning text-dark mb-2">Pending</span>
                  <h6 class="fw-bold text-uppercase mb-1">Join request pending</h6>
                  <p class="text-muted small mb-0">
                    Waiting for an admin of
                    <strong class="text-dark">{{ pendingMembership.institution?.name }}</strong>
                    to accept your request.
                  </p>
                </div>
                <router-link :to="{ name: 'teacherJoinOrg' }" class="btn btn-outline-dark btn-sm">
                  View / Cancel
                </router-link>
              </div>
            </div>
          </div>

          <!-- Active org hub -->
          <template v-else-if="activeOrg">
            <!-- Org summary -->
            <div class="card mb-4 org-summary-card">
              <div class="card-header org-summary-header">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <span class="text-uppercase small fw-semibold mb-0">Current organization</span>
                  <span class="badge bg-light text-dark border">{{ activeOrg.member_role }}</span>
                </div>
              </div>
              <div class="card-body">
                <div class="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div class="flex-grow-1">
                    <h5 class="fw-bold mb-2">{{ activeOrg.name }}</h5>
                    <div class="d-flex flex-wrap gap-2 mb-2">
                      <span class="badge bg-light text-dark border">
                        {{ formatType(activeOrg.institution_type) }}
                      </span>
                      <span class="badge bg-light text-dark border text-uppercase">
                        {{ activeOrg.visibility || '—' }}
                      </span>
                      <span
                        v-if="activeOrg.org_code"
                        class="org-code-badge badge bg-dark d-inline-flex align-items-center gap-1"
                      >
                        Code: {{ activeOrg.org_code }}
                        <button
                          type="button"
                          class="org-code-copy btn btn-link p-0 border-0 text-white lh-1"
                          :title="codeCopied ? 'Copied' : 'Copy org code'"
                          :aria-label="codeCopied ? 'Copied' : 'Copy org code'"
                          @click.stop="copyOrgCode"
                        >
                          <i
                            :class="codeCopied ? 'bi bi-check2' : 'bi bi-clipboard'"
                            aria-hidden="true"
                          ></i>
                        </button>
                      </span>
                    </div>
                    <p class="text-muted small mb-0">
                      Use this organization to assign online tests. Papers are created from your
                      teaching scope.
                    </p>
                  </div>

                  <div
                    v-if="activeOrg.member_role === 'ADMIN'"
                    class="visibility-control align-self-stretch align-self-md-start"
                  >
                    <div class="small text-uppercase fw-semibold text-muted mb-2">Visibility</div>
                    <div class="mode-toggle" aria-label="Organization visibility">
                      <button
                        type="button"
                        :class="{ active: (activeOrg.visibility || 'PRIVATE') === 'PRIVATE' }"
                        :disabled="visibilityBusy"
                        @click="setVisibility('PRIVATE')"
                      >
                        Private
                      </button>
                      <button
                        type="button"
                        :class="{ active: activeOrg.visibility === 'PUBLIC' }"
                        :disabled="visibilityBusy"
                        @click="setVisibility('PUBLIC')"
                      >
                        Public
                      </button>
                    </div>
                    <p class="visibility-hint text-muted small mb-0 mt-2">
                      <template v-if="(activeOrg.visibility || 'PRIVATE') === 'PRIVATE'">
                        Join only with org code.
                      </template>
                      <template v-else>
                        Listed in browse; join still needs approval.
                      </template>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick actions -->
            <h6 class="section-label mb-3">Manage</h6>
            <div class="row g-3 mb-4">
              <div v-if="activeOrg.member_role === 'ADMIN'" class="col-12 col-md-4">
                <router-link
                  :to="{ name: 'teacherOrgRequests' }"
                  class="card action-card action-card-link h-100 text-decoration-none"
                >
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="action-card-icon">
                        <i class="bi bi-person-plus" aria-hidden="true"></i>
                      </div>
                      <span v-if="pendingCount" class="badge text-bg-danger">{{ pendingCount }}</span>
                    </div>
                    <h6 class="fw-bold text-dark mt-3 mb-1">Join requests</h6>
                    <p class="small text-muted mb-0">Approve or reject teacher and learner requests.</p>
                  </div>
                </router-link>
              </div>

              <div v-if="activeOrg.member_role === 'ADMIN'" class="col-12 col-md-4">
                <router-link
                  :to="{ name: 'teacherOrgInviteCsv' }"
                  class="card action-card action-card-link h-100 text-decoration-none"
                >
                  <div class="card-body">
                    <div class="action-card-icon">
                      <i class="bi bi-filetype-csv" aria-hidden="true"></i>
                    </div>
                    <h6 class="fw-bold text-dark mt-3 mb-1">Invite members (CSV)</h6>
                    <p class="small text-muted mb-0">
                      Bulk-create teachers and learners as pending join requests.
                    </p>
                  </div>
                </router-link>
              </div>

              <div class="col-12 col-md-4">
                <router-link
                  :to="{ name: 'teacherOrgCohorts' }"
                  class="card action-card action-card-link h-100 text-decoration-none"
                >
                  <div class="card-body">
                    <div class="action-card-icon">
                      <i class="bi bi-collection" aria-hidden="true"></i>
                    </div>
                    <h6 class="fw-bold text-dark mt-3 mb-1">Cohorts</h6>
                    <p class="small text-muted mb-0">View and manage teaching cohorts.</p>
                  </div>
                </router-link>
              </div>

              <div class="col-12 col-md-4">
                <router-link
                  :to="{ name: 'teacherOrgGroups' }"
                  class="card action-card action-card-link h-100 text-decoration-none"
                >
                  <div class="card-body">
                    <div class="action-card-icon">
                      <i class="bi bi-people" aria-hidden="true"></i>
                    </div>
                    <h6 class="fw-bold text-dark mt-3 mb-1">Groups</h6>
                    <p class="small text-muted mb-0">Named batches for assign-in-one-click (multi-membership).</p>
                  </div>
                </router-link>
              </div>

              <div v-if="activeOrg.member_role === 'ADMIN'" class="col-12 col-md-4">
                <button
                  type="button"
                  class="card action-card action-card-link h-100 w-100 text-start border"
                  :disabled="busy"
                  @click="showPromote = !showPromote"
                >
                  <div class="card-body">
                    <div class="action-card-icon">
                      <i class="bi bi-shield-check" aria-hidden="true"></i>
                    </div>
                    <h6 class="fw-bold text-dark mt-3 mb-1">
                      {{ showPromote ? 'Hide promote' : 'Promote admin' }}
                    </h6>
                    <p class="small text-muted mb-0">Appoint another teacher as organization admin.</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Promote members table -->
            <div v-if="showPromote && activeOrg.member_role === 'ADMIN'" class="mb-4">
              <h6 class="section-label mb-3">Promote teacher to admin</h6>
              <div class="table-responsive">
                <table class="table table-sm table-hover table-striped table-bordered mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Teacher</th>
                      <th scope="col">Role</th>
                      <th scope="col" class="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="table-group-divider">
                    <tr v-for="(m, index) in promotableMembers" :key="m.id">
                      <th scope="row">{{ index + 1 }}</th>
                      <td>
                        <div class="fw-semibold">{{ m.user?.name }}</div>
                        <div class="small text-muted">{{ m.user?.email_id }}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">{{ m.member_role }}</span>
                      </td>
                      <td class="text-center">
                        <button
                          type="button"
                          class="btn btn-dark btn-sm"
                          :disabled="busy || m.member_role === 'ADMIN'"
                          @click="promote(m.id)"
                        >
                          {{ m.member_role === 'ADMIN' ? 'Admin' : 'Make admin' }}
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!promotableMembers.length">
                      <td colspan="4" class="text-center text-muted py-3">
                        No other active teachers.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Danger zone -->
            <h6 class="section-label text-danger mb-3">Danger zone</h6>
            <div class="card border-danger-subtle mb-2">
              <div class="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <div class="fw-semibold">Leave organization</div>
                  <p class="small text-muted mb-0">
                    You can join or create another organization later to assign tests.
                  </p>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm align-self-start"
                  :disabled="busy"
                  data-bs-toggle="modal"
                  data-bs-target="#leaveOrgModal"
                >
                  Leave
                </button>
              </div>
            </div>
            <div
              v-if="activeOrg.member_role === 'ADMIN'"
              class="card border-danger-subtle"
            >
              <div class="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <div class="fw-semibold">Soft-close organization</div>
                  <p class="small text-muted mb-0">
                    Releases all members and notifies them. Papers and completed results are kept.
                  </p>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm align-self-start"
                  :disabled="busy"
                  data-bs-toggle="modal"
                  data-bs-target="#softCloseOrgModal"
                >
                  Soft-close
                </button>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>

    <!-- Leave confirmation modal -->
    <div
      class="modal fade"
      id="leaveOrgModal"
      tabindex="-1"
      aria-labelledby="leaveOrgModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="leaveOrgModalLabel">Leave organization</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            Leave this organization? You will need to join or create another to assign tests.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" :disabled="busy" @click="leaveOrg">
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Soft-close confirmation modal -->
    <div
      class="modal fade"
      id="softCloseOrgModal"
      tabindex="-1"
      aria-labelledby="softCloseOrgModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="softCloseOrgModalLabel">Soft-close organization</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            Soft-close <strong>{{ activeOrg?.name }}</strong>? All members will be released and
            notified. Papers and completed results are kept.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" :disabled="busy" @click="softClose">
              Soft-close
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'

interface OrgInfo {
  id: number
  name: string
  org_code?: string
  institution_type?: string
  visibility?: string
  member_role?: string
  school_id?: number | null
}

const loading = ref(true)
const busy = ref(false)
const visibilityBusy = ref(false)
const codeCopied = ref(false)
const activeOrg = ref<OrgInfo | null>(null)
const pendingMembership = ref<any>(null)
const pendingCount = ref(0)
const showPromote = ref(false)
const members = ref<any[]>([])
const errorMessage = ref('')
const successMessage = ref('')

const promotableMembers = computed(() =>
  members.value.filter((m) => m.institution?.id === activeOrg.value?.id),
)

const apiError = (e: unknown) =>
  ((e as AxiosError).response?.data as any)?.message || 'Request failed'

const formatType = (type?: string) => {
  if (type === 'SCHOOL') return 'School'
  if (type === 'COACHING_CENTER') return 'Coaching Center'
  return type || 'Organization'
}

const clearModalArtifacts = () => {
  for (const el of document.querySelectorAll('.modal-backdrop')) el.remove();
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
}

const hideModal = (id: string) => {
  const el = document.getElementById(id)
  if (!el) {
    clearModalArtifacts()
    return
  }
  const instance = Modal.getInstance(el) || Modal.getOrCreateInstance(el)
  const onHidden = () => {
    clearModalArtifacts()
  }
  el.addEventListener('hidden.bs.modal', onHidden, { once: true })
  instance.hide()
  // Fallback if Bootstrap never fires hidden (stuck backdrop after repeated use)
  globalThis.setTimeout(() => {
    if (document.querySelector('.modal-backdrop') && !document.querySelector('.modal.show')) {
      clearModalArtifacts()
    }
  }, 400)
}

const reload = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [{ data: profile }, { data: membership }] = await Promise.all([
      axiosInstance.get('/auth/profile'),
      axiosInstance.get('/institutions/me/membership'),
    ])

    pendingMembership.value = null
    activeOrg.value = null

    if (membership?.status === 'pending') {
      pendingMembership.value = membership
    } else if (membership?.status === 'active' && membership.institution) {
      activeOrg.value = {
        ...membership.institution,
        member_role: membership.member_role,
      }
    } else {
      const institutions = profile?.institutions || []
      activeOrg.value = institutions[0] || null
    }

    if (activeOrg.value?.member_role === 'ADMIN') {
      const [{ data: teacherReqs }, { data: learnerReqs }, { data: orgMembers }] = await Promise.all([
        axiosInstance.get('/institutions/me/pending-requests'),
        axiosInstance.get('/institutions/me/pending-learner-requests'),
        axiosInstance.get('/institutions/me/org-members'),
      ])
      pendingCount.value = (teacherReqs || []).length + (learnerReqs || []).length
      members.value = orgMembers || []
    } else {
      pendingCount.value = 0
      members.value = []
    }
  } catch (e) {
    console.error(e)
    errorMessage.value = apiError(e)
  } finally {
    loading.value = false
  }
}

const leaveOrg = async () => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.delete('/institutions/me/membership')
    successMessage.value = data.message
    showPromote.value = false
    hideModal('leaveOrgModal')
    await reload()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const softClose = async () => {
  if (!activeOrg.value) return
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.post(`/institutions/${activeOrg.value.id}/soft-close`)
    successMessage.value = data.message
    showPromote.value = false
    hideModal('softCloseOrgModal')
    await reload()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const setVisibility = async (visibility: 'PUBLIC' | 'PRIVATE') => {
  if (!activeOrg.value || visibilityBusy.value) return
  const previous = (activeOrg.value.visibility || 'PRIVATE') as 'PUBLIC' | 'PRIVATE'
  if (previous === visibility) return

  // Optimistic: update only the badge/toggle — no page reload or success banner
  activeOrg.value.visibility = visibility
  visibilityBusy.value = true
  errorMessage.value = ''
  try {
    const { data } = await axiosInstance.put(`/institutions/${activeOrg.value.id}/visibility`, {
      visibility,
    })
    activeOrg.value.visibility = data.institution?.visibility || visibility
  } catch (e) {
    activeOrg.value.visibility = previous
    errorMessage.value = apiError(e)
  } finally {
    visibilityBusy.value = false
  }
}

const copyOrgCode = async () => {
  const code = activeOrg.value?.org_code
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    codeCopied.value = true
    globalThis.setTimeout(() => {
      codeCopied.value = false
    }, 1600)
  } catch {
    errorMessage.value = 'Could not copy org code'
  }
}

const promote = async (membershipId: number) => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.put(`/institutions/memberships/${membershipId}/promote`)
    successMessage.value = data.message
    await reload()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

onMounted(reload)
</script>

<style scoped>
.section-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #212529;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #dee2e6;
}

.empty-state-card {
  border: 1px dashed #dee2e6;
  background: #f8f9fa;
}

.empty-state-icon {
  font-size: 2.5rem;
  color: #6c757d;
}

.action-card {
  border: 1px solid #dee2e6;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.action-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #adb5bd;
}

.action-card-link {
  background: #fff;
  color: inherit;
  cursor: pointer;
}

.action-card-link:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.action-card-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background: #212529;
  color: #fff;
  font-size: 1.15rem;
}

.org-summary-header {
  background: #212529;
  color: #fff;
  border-bottom: 0;
}

.org-code-copy {
  font-size: 0.8rem;
  opacity: 0.85;
  text-decoration: none !important;
  vertical-align: middle;
}

.org-code-copy:hover,
.org-code-copy:focus-visible {
  opacity: 1;
}

.visibility-control {
  width: 15.5rem;
  flex: 0 0 15.5rem;
}

.mode-toggle {
  display: flex;
  gap: 4px;
  width: 100%;
  background-color: #f1f3f5;
  border-radius: 10px;
  padding: 4px;
  box-sizing: border-box;
}

.mode-toggle button {
  flex: 1 1 0;
  width: 0;
  border: none;
  background: transparent;
  padding: 0.5rem 0.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25;
  color: #6c757d;
  white-space: nowrap;
}

.mode-toggle button.active {
  background-color: #111;
  color: #fff;
}

.mode-toggle button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.visibility-hint {
  min-height: 2.5rem;
}

@media (max-width: 576px) {
  .dynamic-style {
    text-align: start !important;
  }

  .dynamic-style .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .dynamic-style .btn.me-2 {
    margin-right: 0 !important;
  }
}
</style>
