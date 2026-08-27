<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bolder text-uppercase m-0">Join requests</h5>
      <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-secondary btn-sm">Back</router-link>
    </div>
    <p class="text-muted small">Approve or reject people who want to join your School / Coaching Center.</p>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{ active: tab === 'teachers' }"
          @click="tab = 'teachers'"
        >
          Teachers
          <span v-if="teacherRequests.length" class="badge text-bg-danger ms-1">{{ teacherRequests.length }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          type="button"
          class="nav-link"
          :class="{ active: tab === 'students' }"
          @click="tab = 'students'"
        >
          Students
          <span v-if="studentRequests.length" class="badge text-bg-danger ms-1">{{ studentRequests.length }}</span>
        </button>
      </li>
    </ul>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="loading" class="text-muted">Loading…</div>

    <template v-else-if="tab === 'teachers'">
      <div v-if="!teacherRequests.length" class="alert alert-info">No pending teacher join requests.</div>
      <div v-else class="list-group">
        <div
          v-for="req in teacherRequests"
          :key="'t-' + req.id"
          class="list-group-item d-flex flex-column flex-md-row justify-content-between gap-3"
        >
          <div>
            <div class="fw-semibold">{{ req.user?.name }}</div>
            <div class="small text-muted">
              {{ req.user?.email_id }} · {{ req.user?.contact_number }}
              <span v-if="req.user?.highest_qualification">
                · {{ req.user.highest_qualification }}
              </span>
            </div>
            <div class="small mt-1">
              Org: <strong>{{ req.institution?.name }}</strong>
              <span v-if="req.request_message" class="d-block text-muted">“{{ req.request_message }}”</span>
            </div>
            <div class="small text-muted">Requested: {{ formatDate(req.requested_at) }}</div>
          </div>
          <div class="d-flex gap-2 align-items-start">
            <button class="btn btn-success btn-sm" :disabled="busyId === req.id" @click="respondTeacher(req.id, 'active')">
              Accept
            </button>
            <button class="btn btn-outline-danger btn-sm" :disabled="busyId === req.id" @click="respondTeacher(req.id, 'rejected')">
              Reject
            </button>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="!studentRequests.length" class="alert alert-info">No pending student join requests.</div>
      <div v-else class="list-group">
        <div
          v-for="req in studentRequests"
          :key="'s-' + req.id"
          class="list-group-item d-flex flex-column flex-md-row justify-content-between gap-3"
        >
          <div>
            <div class="fw-semibold">{{ req.user?.name }}</div>
            <div class="small text-muted">
              {{ req.user?.email_id }}
              <span v-if="req.participant?.participant_type === 'ASPIRANT'" class="badge text-bg-info ms-1">
                Aspirant
              </span>
              <span v-if="req.student?.student_id"> · Roll: {{ req.student.student_id }}</span>
              <span v-if="req.school_standard?.standard?.name || req.student?.school_standard?.standard?.name">
                · {{ req.school_standard?.standard?.name || req.student?.school_standard?.standard?.name }}
              </span>
            </div>
            <div class="small mt-1">
              Org: <strong>{{ req.institution?.name }}</strong>
              <span v-if="req.request_message" class="d-block text-muted">“{{ req.request_message }}”</span>
            </div>
            <div class="small text-muted">Requested: {{ formatDate(req.requested_at) }}</div>
          </div>
          <div class="d-flex gap-2 align-items-start">
            <button class="btn btn-success btn-sm" :disabled="busyId === req.id" @click="respondStudent(req.id, 'active')">
              Accept
            </button>
            <button class="btn btn-outline-danger btn-sm" :disabled="busyId === req.id" @click="respondStudent(req.id, 'rejected')">
              Reject
            </button>
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
const tab = ref<'teachers' | 'students'>('teachers')
const teacherRequests = ref<any[]>([])
const studentRequests = ref<any[]>([])
const errorMessage = ref('')
const successMessage = ref('')
const busyId = ref<number | null>(null)

const formatDate = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

const load = async () => {
  loading.value = true
  try {
    const [teachers, students] = await Promise.all([
      axiosInstance.get('/institutions/me/pending-requests'),
      axiosInstance.get('/institutions/me/pending-learner-requests'),
    ])
    teacherRequests.value = teachers.data || []
    studentRequests.value = students.data || []
    if (!teacherRequests.value.length && studentRequests.value.length) {
      tab.value = 'students'
    }
  } catch (e) {
    errorMessage.value = ((e as AxiosError).response?.data as any)?.message || 'Failed to load requests'
  } finally {
    loading.value = false
  }
}

const respondTeacher = async (membershipId: number, status: 'active' | 'rejected') => {
  busyId.value = membershipId
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.put(`/institutions/memberships/${membershipId}/status`, {
      status,
    })
    successMessage.value = data.message
    await load()
  } catch (e) {
    errorMessage.value = ((e as AxiosError).response?.data as any)?.message || 'Action failed'
  } finally {
    busyId.value = null
  }
}

const respondStudent = async (membershipId: number, status: 'active' | 'rejected') => {
  busyId.value = membershipId
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await axiosInstance.put(
      `/institutions/learner-memberships/${membershipId}/status`,
      { status },
    )
    successMessage.value = data.message
    await load()
  } catch (e) {
    errorMessage.value = ((e as AxiosError).response?.data as any)?.message || 'Action failed'
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>
