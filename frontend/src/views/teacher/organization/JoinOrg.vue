<template>
  <div class="container mt-4 mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bolder text-uppercase m-0">Join organization</h5>
          <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-secondary btn-sm">
            Back
          </router-link>
        </div>
        <p class="text-muted small mb-4">
          Request to join a School or Coaching Center with an org code, or browse public
          organizations. An admin must approve before you become a member.
        </p>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

        <div v-if="myMembership" class="alert alert-warning">
          <div class="fw-semibold">
            {{ myMembership.status === 'pending' ? 'Pending join request' : 'Already in an organization' }}
          </div>
          <div>
            {{ myMembership.institution?.name }}
            <span class="text-muted">({{ myMembership.status }} · {{ myMembership.member_role }})</span>
          </div>
          <button
            v-if="myMembership.status === 'pending'"
            class="btn btn-outline-danger btn-sm mt-2"
            :disabled="busy"
            @click="cancelPending"
          >
            Cancel request
          </button>
          <button
            v-else-if="myMembership.status === 'active'"
            class="btn btn-outline-danger btn-sm mt-2"
            :disabled="busy"
            @click="leaveOrg"
          >
            Leave organization
          </button>
          <router-link v-else :to="{ name: 'teacherOrganization' }" class="btn btn-dark btn-sm mt-2">
            Back to organization
          </router-link>
        </div>

        <template v-else>
          <div class="card mb-4">
            <div class="card-body">
              <h6 class="fw-bold">Join with org code</h6>
              <p class="text-muted small">Works for Public and Private organizations.</p>
              <div class="row g-2 align-items-end">
                <div class="col-12 col-md-4">
                  <label class="form-label" for="teacher-join-org-code">Org code</label>
                  <input
                    id="teacher-join-org-code"
                    v-model="orgCode"
                    class="form-control text-uppercase"
                    placeholder="TV-S-XXXX or TV-C-XXXX"
                  />
                </div>
                <div class="col-12 col-md-5">
                  <label class="form-label" for="teacher-join-message">Message (optional)</label>
                  <input
                    id="teacher-join-message"
                    v-model="codeMessage"
                    class="form-control"
                    placeholder="e.g. Math teacher for Std 10"
                  />
                </div>
                <div class="col-12 col-md-3 d-grid">
                  <button
                    class="btn btn-dark"
                    :disabled="busy || !orgCode.trim()"
                    @click="joinByCode"
                  >
                    Request join
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div
                class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3"
              >
                <div>
                  <h6 class="fw-bold mb-0">Public organizations</h6>
                  <p class="text-muted small mb-0">Private orgs are hidden — use the code above.</p>
                </div>
                <input
                  v-model="search"
                  class="form-control form-control-sm"
                  style="max-width: 220px"
                  placeholder="Search name…"
                  @keyup.enter="loadDiscover"
                />
              </div>

              <div v-if="loading" class="text-muted">Loading…</div>
              <div v-else-if="!orgs.length" class="text-muted">No public organizations found.</div>
              <div v-else class="list-group list-group-flush">
                <div
                  v-for="org in orgs"
                  :key="org.id"
                  class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
                >
                  <div>
                    <div class="fw-semibold">{{ org.name }}</div>
                    <div class="small text-muted">
                      {{ org.institution_type }}
                      <span v-if="org.school?.board?.name"> · {{ org.school.board.name }}</span>
                      · {{ org._count?.memberships ?? 0 }} teachers
                    </div>
                  </div>
                  <button
                    class="btn btn-outline-dark btn-sm"
                    :disabled="busy"
                    @click="joinPublic(org.id)"
                  >
                    Request to join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'

const loading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const search = ref('')
const orgCode = ref('')
const codeMessage = ref('')
const orgs = ref<any[]>([])
const myMembership = ref<any>(null)

const loadMembership = async () => {
  const { data } = await axiosInstance.get('/institutions/me/membership')
  myMembership.value = data || null
}

const loadDiscover = async () => {
  loading.value = true
  try {
    const { data } = await axiosInstance.get('/institutions/discover', {
      params: search.value.trim() ? { search: search.value.trim() } : {},
    })
    orgs.value = data || []
  } finally {
    loading.value = false
  }
}

const joinPublic = async (id: number) => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.post(`/institutions/${id}/join`, {})
    successMessage.value = data.message
    await loadMembership()
  } catch (e) {
    errorMessage.value = ((e as AxiosError).response?.data as any)?.message || 'Join failed'
  } finally {
    busy.value = false
  }
}

const joinByCode = async () => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.post('/institutions/join-by-code', {
      org_code: orgCode.value.trim(),
      request_message: codeMessage.value.trim() || undefined,
    })
    successMessage.value = data.message
    await loadMembership()
  } catch (e) {
    errorMessage.value = ((e as AxiosError).response?.data as any)?.message || 'Join failed'
  } finally {
    busy.value = false
  }
}

const cancelPending = async () => {
  busy.value = true
  errorMessage.value = ''
  try {
    const { data } = await axiosInstance.delete('/institutions/me/pending-request')
    successMessage.value = data.message
    myMembership.value = null
    await loadDiscover()
  } catch (e) {
    errorMessage.value = ((e as AxiosError).response?.data as any)?.message || 'Cancel failed'
  } finally {
    busy.value = false
  }
}

const leaveOrg = async () => {
  if (!confirm('Leave this organization?')) return
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.delete('/institutions/me/membership')
    successMessage.value = data.message
    myMembership.value = null
    await loadDiscover()
  } catch (e) {
    errorMessage.value = ((e as AxiosError).response?.data as any)?.message || 'Leave failed'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    await loadMembership()
    if (!myMembership.value) await loadDiscover()
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Failed to load'
  } finally {
    loading.value = false
  }
})
</script>
