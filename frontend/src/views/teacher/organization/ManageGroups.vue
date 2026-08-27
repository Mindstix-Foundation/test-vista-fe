<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bolder text-uppercase m-0">Student groups</h5>
      <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-secondary btn-sm">Back</router-link>
    </div>
    <p class="text-muted small">
      Named batches for assign-in-one-click. One learner can belong to multiple groups.
    </p>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <div v-if="!orgId" class="alert alert-warning">
      Join or create an organization first to manage groups.
    </div>

    <template v-else>
      <div class="card mb-4">
        <div class="card-body">
          <h6 class="fw-bold">Create group</h6>
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label" for="group-name">Name</label>
              <input id="group-name" v-model="form.name" class="form-control" placeholder="Group A" />
            </div>
            <div class="col-md-5">
              <label class="form-label" for="group-description">Description (optional)</label>
              <input id="group-description" v-model="form.description" class="form-control" placeholder="Morning batch" />
            </div>
            <div class="col-md-3">
              <button class="btn btn-dark w-100" :disabled="busy || !form.name.trim()" @click="create">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Loading…</div>
      <div v-else-if="!groups.length" class="alert alert-info">No groups yet. Create Group A / B / C for batch assign.</div>

      <div v-else class="row g-3">
        <div v-for="g in groups" :key="g.id" class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                <div>
                  <div class="fw-semibold">{{ g.name }}</div>
                  <div class="small text-muted">
                    {{ g._count?.members ?? g.members?.length ?? 0 }} members
                    <span v-if="g.description"> · {{ g.description }}</span>
                  </div>
                </div>
                <button class="btn btn-outline-danger btn-sm align-self-start" :disabled="busy" @click="removeGroup(g.id)">
                  Delete
                </button>
              </div>

              <div class="row g-2 align-items-end mb-3">
                <div class="col-md-8">
                  <label class="form-label small" :for="`add-learners-${g.id}`">Add learners</label>
                  <select :id="`add-learners-${g.id}`" v-model="addMap[g.id]" class="form-select form-select-sm" multiple size="4">
                    <option v-for="p in availableFor(g)" :key="p.id" :value="p.id">
                      {{ p.user?.name || p.name }} ({{ p.user?.email_id || p.email }})
                    </option>
                  </select>
                  <div class="form-text">Hold Ctrl/Cmd to select multiple</div>
                </div>
                <div class="col-md-4">
                  <button
                    class="btn btn-dark btn-sm w-100"
                    :disabled="busy || !(addMap[g.id] && addMap[g.id].length)"
                    @click="addMembers(g.id)"
                  >
                    Add selected
                  </button>
                </div>
              </div>

              <ul class="list-group list-group-flush" v-if="g.members?.length">
                <li
                  v-for="m in g.members"
                  :key="m.id"
                  class="list-group-item d-flex justify-content-between align-items-center px-0"
                >
                  <span>
                    {{ m.participant?.user?.name }}
                    <span class="text-muted small"> · {{ m.participant?.user?.email_id }}</span>
                  </span>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="busy"
                    @click="removeMember(g.id, m.participant_id)"
                  >
                    Remove
                  </button>
                </li>
              </ul>
              <p v-else class="text-muted small mb-0">No members yet.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import axiosInstance from '@/config/axios'
import examCatalogService from '@/services/examCatalogService'
import type { AxiosError } from 'axios'

const loading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const orgId = ref<number | null>(null)
const groups = ref<any[]>([])
const participants = ref<any[]>([])
const form = reactive({ name: '', description: '' })
const addMap = reactive<Record<number, number[]>>({})

const apiError = (e: unknown) =>
  ((e as AxiosError).response?.data as any)?.message || 'Request failed'

const availableFor = (g: any) => {
  const inGroup = new Set((g.members || []).map((m: any) => m.participant_id))
  return participants.value.filter((p) => !inGroup.has(p.id))
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data: membership } = await axiosInstance.get('/institutions/me/membership')
    if (membership?.status === 'active' && membership.institution) {
      orgId.value = membership.institution.id
    } else {
      orgId.value = null
      return
    }

    const [{ data: groupRows }, participantRows] = await Promise.all([
      axiosInstance.get('/student-groups'),
      examCatalogService.getParticipants({ institution_id: orgId.value! }),
    ])
    groups.value = Array.isArray(groupRows) ? groupRows : []
    participants.value = Array.isArray(participantRows) ? participantRows : []
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    loading.value = false
  }
}

const create = async () => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await axiosInstance.post('/student-groups', {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    })
    successMessage.value = 'Group created'
    form.name = ''
    form.description = ''
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const removeGroup = async (id: number) => {
  if (!confirm('Delete this group? Members are unlinked but learners stay in the org.')) return
  busy.value = true
  try {
    await axiosInstance.delete(`/student-groups/${id}`)
    successMessage.value = 'Group deleted'
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const addMembers = async (groupId: number) => {
  const ids = addMap[groupId] || []
  if (!ids.length) return
  busy.value = true
  try {
    await axiosInstance.post(`/student-groups/${groupId}/members`, { participant_ids: ids })
    successMessage.value = 'Members added'
    addMap[groupId] = []
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const removeMember = async (groupId: number, participantId: number) => {
  busy.value = true
  try {
    await axiosInstance.delete(`/student-groups/${groupId}/members/${participantId}`)
    successMessage.value = 'Member removed'
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
