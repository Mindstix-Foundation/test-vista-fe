<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bolder text-uppercase m-0">Join coaching center</h5>
      <router-link :to="{ name: 'smartTest' }" class="btn btn-outline-secondary btn-sm">Back</router-link>
    </div>
    <p class="text-muted small">
      Optional: join a Coaching Center to get teacher-assigned tests. Self-practice stays available.
    </p>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <div v-if="myMembership" class="alert alert-warning">
      <div class="fw-semibold">
        {{
          myMembership.status === 'pending'
            ? 'Pending join request'
            : 'Already in an organization'
        }}
      </div>
      <div>
        {{ myMembership.institution?.name }}
        <span class="text-muted">
          ({{ myMembership.status }}
          <span v-if="myMembership.institution?.institution_type">
            · {{ myMembership.institution.institution_type }}
          </span>
          <span v-if="myMembership.school_standard?.standard?.name">
            · {{ myMembership.school_standard.standard.name }}
          </span>)
        </span>
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
        @click="leaveCoaching"
      >
        {{
          myMembership.institution?.institution_type === 'SCHOOL'
            ? 'Leave school'
            : 'Leave coaching'
        }}
      </button>
    </div>

    <template v-else>
      <div class="card mb-4">
        <div class="card-body">
          <h6 class="fw-bold">Join with org code</h6>
          <p class="text-muted small">Works for Public and Private coaching centers.</p>
          <div class="row g-2 align-items-end">
            <div class="col-md-3">
              <label class="form-label" for="join-org-code">Org code</label>
              <input id="join-org-code" v-model="orgCode" class="form-control text-uppercase" placeholder="TV-C-XXXX-XXXX" />
            </div>
            <div class="col-md-3">
              <label class="form-label" for="join-code-standard">Standard</label>
              <select id="join-code-standard" v-model.number="codeStandardId" class="form-select" :disabled="!codeStandards.length">
                <option :value="0" disabled>Select…</option>
                <option v-for="s in codeStandards" :key="s.school_standard_id" :value="s.school_standard_id">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label" for="join-code-message">Message (optional)</label>
              <input id="join-code-message" v-model="codeMessage" class="form-control" placeholder="e.g. JEE aspirant" />
            </div>
            <div class="col-md-3 d-flex gap-2">
              <button class="btn btn-outline-dark flex-grow-1" :disabled="busy || !orgCode.trim()" @click="loadCodeStandards">
                Load
              </button>
              <button
                class="btn btn-dark flex-grow-1"
                :disabled="busy || !orgCode.trim() || !codeStandardId"
                @click="joinByCode"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 class="fw-bold mb-0">Public coaching centers</h6>
              <p class="text-muted small mb-0">Private centers are hidden — use the code above.</p>
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
          <div v-else-if="!orgs.length" class="text-muted">No public coaching centers found.</div>
          <div v-else class="list-group list-group-flush">
            <div
              v-for="org in orgs"
              :key="org.id"
              class="list-group-item"
            >
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div>
                  <div class="fw-semibold">{{ org.name }}</div>
                  <div class="small text-muted">
                    Coaching
                    <span v-if="org.school?.board?.name"> · {{ org.school.board.name }}</span>
                  </div>
                </div>
                <button class="btn btn-outline-dark btn-sm" :disabled="busy" @click="openJoinPublic(org)">
                  Request to join
                </button>
              </div>
              <div v-if="selectedOrgId === org.id" class="mt-3 border-top pt-3">
                <div class="row g-2 align-items-end">
                  <div class="col-md-4">
                    <label class="form-label" for="join-public-standard">Standard</label>
                    <select id="join-public-standard" v-model.number="publicStandardId" class="form-select">
                      <option :value="0" disabled>Select…</option>
                      <option
                        v-for="s in publicStandards"
                        :key="s.school_standard_id"
                        :value="s.school_standard_id"
                      >
                        {{ s.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-5">
                    <label class="form-label" for="join-public-message">Message (optional)</label>
                    <input id="join-public-message" v-model="publicMessage" class="form-control" />
                  </div>
                  <div class="col-md-3">
                    <button
                      class="btn btn-dark w-100"
                      :disabled="busy || !publicStandardId"
                      @click="joinPublic(org.id)"
                    >
                      Send request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
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
const codeStandardId = ref(0)
const codeStandards = ref<any[]>([])
const orgs = ref<any[]>([])
const myMembership = ref<any>(null)
const selectedOrgId = ref<number | null>(null)
const publicStandards = ref<any[]>([])
const publicStandardId = ref(0)
const publicMessage = ref('')

const apiError = (e: unknown) =>
  ((e as AxiosError).response?.data as any)?.message || 'Request failed'

const loadMembership = async () => {
  const { data } = await axiosInstance.get('/institutions/me/learner-membership')
  myMembership.value = data || null
}

const loadDiscover = async () => {
  loading.value = true
  try {
    const { data } = await axiosInstance.get('/institutions/discover', {
      params: {
        search: search.value || undefined,
        institution_type: 'COACHING_CENTER',
      },
    })
    orgs.value = data || []
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    loading.value = false
  }
}

const loadCodeStandards = async () => {
  errorMessage.value = ''
  busy.value = true
  try {
    const { data } = await axiosInstance.get(
      `/institutions/coaching/by-code/${encodeURIComponent(orgCode.value.trim())}/standards`,
    )
    codeStandards.value = data.standards || []
    codeStandardId.value = codeStandards.value[0]?.school_standard_id || 0
    if (!codeStandards.value.length) {
      errorMessage.value = 'This org has no standards configured'
    }
  } catch (e) {
    codeStandards.value = []
    codeStandardId.value = 0
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const joinByCode = async () => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.post('/institutions/coaching/join-by-code', {
      org_code: orgCode.value.trim(),
      school_standard_id: codeStandardId.value,
      request_message: codeMessage.value || undefined,
    })
    successMessage.value = data.message
    await loadMembership()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const openJoinPublic = async (org: any) => {
  selectedOrgId.value = org.id
  publicStandardId.value = 0
  publicMessage.value = ''
  errorMessage.value = ''
  try {
    const { data } = await axiosInstance.get(`/institutions/coaching/${org.id}/standards`)
    publicStandards.value = data.standards || []
    publicStandardId.value = publicStandards.value[0]?.school_standard_id || 0
  } catch (e) {
    publicStandards.value = []
    errorMessage.value = apiError(e)
  }
}

const joinPublic = async (orgId: number) => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.post(`/institutions/coaching/${orgId}/join`, {
      school_standard_id: publicStandardId.value,
      request_message: publicMessage.value || undefined,
    })
    successMessage.value = data.message
    await loadMembership()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const cancelPending = async () => {
  busy.value = true
  errorMessage.value = ''
  try {
    const { data } = await axiosInstance.delete('/institutions/me/pending-learner-request')
    successMessage.value = data.message
    myMembership.value = null
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const leaveCoaching = async () => {
  if (!confirm('Leave this coaching center? Teacher-assigned tests will stop; self-practice stays.')) return
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.delete('/institutions/me/learner-membership')
    successMessage.value = data.message
    myMembership.value = null
    await loadDiscover()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    await loadMembership()
  } catch {
    myMembership.value = null
  }
  await loadDiscover()
})
</script>
