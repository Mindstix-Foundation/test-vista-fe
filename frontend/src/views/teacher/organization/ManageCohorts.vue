<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bolder text-uppercase m-0">Exam cohorts</h5>
      <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-secondary btn-sm">Back</router-link>
    </div>
    <p class="text-muted small">
      Create coaching batches (cohorts), map teachers, and place learners into cohorts so exam mocks can be assigned.
    </p>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <div v-if="!orgId" class="alert alert-warning">
      Join or create an organization first to manage cohorts.
    </div>

    <template v-else>
      <div class="card mb-4">
        <div class="card-body">
          <h6 class="fw-bold">Create cohort</h6>
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label" for="cohort-exam-program">Exam program</label>
              <select id="cohort-exam-program" v-model.number="form.exam_program_id" class="form-select">
                <option :value="0" disabled>Select…</option>
                <option v-for="p in programs" :key="p.id" :value="p.id">
                  {{ p.exam_body?.name ? `${p.exam_body.name} · ` : '' }}{{ p.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label" for="cohort-name">Cohort name</label>
              <input id="cohort-name" v-model="form.name" class="form-control" placeholder="UPSC 2026 Batch A" />
            </div>
            <div class="col-md-2">
              <label class="form-label" for="cohort-academic-year">Academic year</label>
              <input id="cohort-academic-year" v-model="form.academic_year" class="form-control" placeholder="2026-27" />
            </div>
            <div class="col-md-3">
              <button class="btn btn-dark w-100" :disabled="busy || !canCreate" @click="create">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Loading…</div>
      <div v-else-if="!cohorts.length" class="alert alert-info">No cohorts yet for this organization.</div>
      <div v-else class="list-group">
        <div v-for="c in cohorts" :key="c.id" class="list-group-item">
          <div class="d-flex flex-column flex-md-row justify-content-between gap-2">
            <div>
              <div class="fw-semibold">{{ c.name }}</div>
              <div class="small text-muted">
                {{ c.exam_program?.exam_body?.name }} · {{ c.exam_program?.name }}
                <span v-if="c.academic_year"> · {{ c.academic_year }}</span>
                · {{ c._count?.participants ?? 0 }} learners
                · {{ c._count?.teacher_mappings ?? c.teacher_mappings?.length ?? 0 }} teachers
              </div>
              <div v-if="c.teacher_mappings?.length" class="small mt-1">
                Teachers:
                <span v-for="(m, i) in c.teacher_mappings" :key="m.id">
                  {{ m.user?.name }}<span v-if="i < c.teacher_mappings.length - 1">, </span>
                </span>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-2 align-items-start">
              <button
                class="btn btn-outline-dark btn-sm"
                :disabled="busy || isMapped(c)"
                @click="claim(c.id)"
              >
                {{ isMapped(c) ? 'Mapped to me' : 'Teach this cohort' }}
              </button>
              <div v-if="isAdmin" class="d-flex gap-1 align-items-center">
                <select
                  v-model.number="mapTeacherSelect[c.id]"
                  class="form-select form-select-sm"
                  style="min-width: 160px"
                >
                  <option :value="0" disabled>Map teacher…</option>
                  <option
                    v-for="t in teachersNotMapped(c)"
                    :key="t.user_id"
                    :value="t.user_id"
                  >
                    {{ t.name }}
                  </option>
                </select>
                <button
                  class="btn btn-dark btn-sm"
                  :disabled="busy || !mapTeacherSelect[c.id]"
                  @click="mapTeacher(c.id)"
                >
                  Map
                </button>
              </div>
              <button
                v-if="isAdmin"
                class="btn btn-outline-danger btn-sm"
                :disabled="busy"
                @click="remove(c.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="unplaced.length" class="card mt-4">
        <div class="card-body">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
            <div>
              <h6 class="fw-bold mb-1">Place learners into a cohort</h6>
              <p class="text-muted small mb-0">
                Approved org learners without a cohort cannot receive exam-mock assignments.
              </p>
            </div>
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <select v-model.number="bulkCohortId" class="form-select form-select-sm" style="min-width: 180px">
                <option :value="0" disabled>Bulk cohort…</option>
                <option v-for="c in cohorts" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <button
                class="btn btn-dark btn-sm"
                :disabled="busy || !bulkCohortId || !unplaced.length"
                @click="bulkPlace"
              >
                Place all ({{ unplaced.length }})
              </button>
            </div>
          </div>
          <div class="list-group list-group-flush">
            <div
              v-for="p in unplaced"
              :key="p.id"
              class="list-group-item d-flex flex-column flex-md-row justify-content-between gap-2 align-items-md-center px-0"
            >
              <div>
                <div class="fw-semibold">{{ p.user?.name || p.name }}</div>
                <div class="small text-muted">{{ p.user?.email_id || p.email }} · {{ p.participant_type }}</div>
              </div>
              <div class="d-flex gap-2">
                <select v-model.number="placeMap[p.id]" class="form-select form-select-sm" style="min-width: 180px">
                  <option :value="0" disabled>Select cohort…</option>
                  <option v-for="c in cohorts" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <button
                  class="btn btn-dark btn-sm"
                  :disabled="busy || !placeMap[p.id]"
                  @click="placeLearner(p.id)"
                >
                  Place
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import axiosInstance from '@/config/axios'
import examCatalogService from '@/services/examCatalogService'
import type { AxiosError } from 'axios'

const loading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const orgId = ref<number | null>(null)
const isAdmin = ref(false)
const myUserId = ref<number | null>(null)
const cohorts = ref<any[]>([])
const programs = ref<any[]>([])
const unplaced = ref<any[]>([])
const orgTeachers = ref<{ user_id: number; name: string; email?: string }[]>([])
const placeMap = reactive<Record<number, number>>({})
const mapTeacherSelect = reactive<Record<number, number>>({})
const bulkCohortId = ref(0)

const form = reactive({
  exam_program_id: 0,
  name: '',
  academic_year: '',
})

const canCreate = computed(
  () => !!form.exam_program_id && form.name.trim().length > 1,
)

const apiError = (e: unknown) =>
  ((e as AxiosError).response?.data as any)?.message || 'Request failed'

const isMapped = (c: any) =>
  (c.teacher_mappings || []).some((m: any) => m.user_id === myUserId.value)

const teachersNotMapped = (c: any) => {
  const mappedIds = new Set((c.teacher_mappings || []).map((m: any) => m.user_id))
  return orgTeachers.value.filter((t) => !mappedIds.has(t.user_id))
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [{ data: membership }, { data: profile }] = await Promise.all([
      axiosInstance.get('/institutions/me/membership'),
      axiosInstance.get('/auth/profile'),
    ])
    myUserId.value = profile?.id ?? null
    if (membership?.status === 'active' && membership.institution) {
      orgId.value = membership.institution.id
      isAdmin.value = membership.member_role === 'ADMIN'
    } else {
      orgId.value = null
      return
    }

    const [cohortRows, programRows, participantRows] = await Promise.all([
      examCatalogService.getCohorts({ institution_id: orgId.value! }),
      examCatalogService.getPrograms(),
      examCatalogService.getParticipants({ institution_id: orgId.value! }),
    ])
    cohorts.value = cohortRows || []
    programs.value = Array.isArray(programRows) ? programRows : []
    const all = Array.isArray(participantRows) ? participantRows : []
    unplaced.value = all.filter((p: any) => !p.exam_cohort_id)

    if (isAdmin.value) {
      try {
        const { data: members } = await axiosInstance.get('/institutions/me/org-members')
        const rows = Array.isArray(members) ? members : members?.members || []
        orgTeachers.value = rows
          .map((m: any) => ({
            user_id: m.user_id ?? m.user?.id,
            name: m.user?.name ?? m.name ?? 'Teacher',
            email: m.user?.email_id ?? m.email,
          }))
          .filter((t: any) => t.user_id)
      } catch {
        orgTeachers.value = []
      }
    }
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
    const { data } = await axiosInstance.post('/institutions/cohorts', {
      exam_program_id: form.exam_program_id,
      institution_id: orgId.value,
      name: form.name.trim(),
      academic_year: form.academic_year.trim() || undefined,
    })
    successMessage.value = data.message || 'Cohort created'
    form.name = ''
    form.academic_year = ''
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const claim = async (exam_cohort_id: number) => {
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.post('/institutions/teacher-cohorts', { exam_cohort_id })
    successMessage.value = data.message
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const mapTeacher = async (exam_cohort_id: number) => {
  const user_id = mapTeacherSelect[exam_cohort_id]
  if (!user_id) return
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.post('/institutions/teacher-cohorts', {
      exam_cohort_id,
      user_id,
    })
    successMessage.value = data.message || 'Teacher mapped'
    mapTeacherSelect[exam_cohort_id] = 0
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const remove = async (id: number) => {
  if (!confirm('Delete this cohort? Teacher mappings will be removed.')) return
  busy.value = true
  errorMessage.value = ''
  try {
    const { data } = await axiosInstance.delete(`/institutions/cohorts/${id}`)
    successMessage.value = data.message || 'Deleted'
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const placeLearner = async (participantId: number) => {
  const cohortId = placeMap[participantId]
  if (!cohortId) return
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await axiosInstance.post(`/participants/${participantId}/cohort/${cohortId}`)
    successMessage.value = 'Learner placed in cohort'
    delete placeMap[participantId]
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

const bulkPlace = async () => {
  if (!bulkCohortId.value || !unplaced.value.length) return
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  let ok = 0
  let fail = 0
  try {
    for (const p of unplaced.value) {
      try {
        await axiosInstance.post(`/participants/${p.id}/cohort/${bulkCohortId.value}`)
        ok++
      } catch {
        fail++
      }
    }
    successMessage.value =
      fail === 0
        ? `Placed ${ok} learners into cohort`
        : `Placed ${ok} learners; ${fail} failed`
    bulkCohortId.value = 0
    await load()
  } catch (e) {
    errorMessage.value = apiError(e)
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
