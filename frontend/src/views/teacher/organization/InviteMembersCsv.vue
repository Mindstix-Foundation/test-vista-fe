<template>
  <div class="container mt-4 mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bolder text-uppercase m-0">Invite members (CSV)</h5>
          <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-secondary btn-sm">
            Back
          </router-link>
        </div>
        <p class="text-muted small mb-3">
          Upload a CSV to create users (if needed) and pending join requests. Approve them under
          Join requests. New accounts use temp password
          <code>Mind@123</code> (shown in the result for local QA).
        </p>

        <div class="alert alert-light border small mb-3">
          <div class="fw-semibold mb-1">CSV columns</div>
          <code>name,email,role</code> — role is <code>TEACHER</code> or <code>LEARNER</code>.
          Optional: <code>exam_program_id</code> for learners (defaults to Civil Services / UPSC).
          <div class="mt-2">
            <button type="button" class="btn btn-outline-dark btn-sm" @click="downloadTemplate">
              Download template
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

        <div class="mb-3">
          <label class="form-label fw-semibold" for="invite-csv-file">CSV file</label>
          <input
            id="invite-csv-file"
            type="file"
            class="form-control"
            accept=".csv,text/csv"
            @change="onFile"
          />
        </div>

        <div v-if="previewRows.length" class="mb-3">
          <div class="fw-semibold small mb-2">Preview ({{ previewRows.length }} rows)</div>
          <div class="table-responsive" style="max-height: 240px; overflow: auto">
            <table class="table table-sm table-bordered mb-0">
              <thead class="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Program</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in previewRows.slice(0, 50)" :key="i">
                  <td>{{ r.name }}</td>
                  <td>{{ r.email }}</td>
                  <td>{{ r.role }}</td>
                  <td>{{ r.exam_program_id || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-dark"
          :disabled="!previewRows.length || busy"
          @click="submit"
        >
          <output v-if="busy" class="spinner-border spinner-border-sm me-2"></output>
          Send invites
        </button>

        <div v-if="results.length" class="mt-4">
          <h6 class="fw-bold text-uppercase">Results</h6>
          <div class="table-responsive">
            <table class="table table-sm table-striped table-bordered">
              <thead class="table-dark">
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Temp password</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in results" :key="i">
                  <td>{{ r.email }}</td>
                  <td>{{ r.role }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-success': r.status === 'invited',
                        'bg-secondary': r.status === 'skipped',
                        'bg-danger': r.status === 'error',
                      }"
                    >
                      {{ r.status }}
                    </span>
                  </td>
                  <td><code v-if="r.temp_password">{{ r.temp_password }}</code><span v-else>—</span></td>
                  <td class="small">{{ r.message || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <router-link :to="{ name: 'teacherOrgRequests' }" class="btn btn-outline-dark btn-sm">
            Review join requests
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axiosInstance from '@/config/axios'

type InviteRow = {
  name: string
  email: string
  role: 'TEACHER' | 'LEARNER'
  exam_program_id?: number
}

type InviteResult = {
  email: string
  role: string
  status: string
  temp_password?: string
  message?: string
}

const previewRows = ref<InviteRow[]>([])
const results = ref<InviteResult[]>([])
const busy = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const downloadTemplate = () => {
  const csv =
    'name,email,role,exam_program_id\n' +
    'Demo Teacher,demo.teacher@example.com,TEACHER,\n' +
    'Demo Learner,demo.learner@example.com,LEARNER,1\n'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'org-invite-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const parseInviteRow = (
  cols: string[],
  nameIdx: number,
  emailIdx: number,
  roleIdx: number,
  progIdx: number,
): InviteRow | null => {
  const roleRaw = (cols[roleIdx] || '').toUpperCase()
  if (roleRaw !== 'TEACHER' && roleRaw !== 'LEARNER') return null
  const row: InviteRow = {
    name: cols[nameIdx] || '',
    email: cols[emailIdx] || '',
    role: roleRaw,
  }
  if (progIdx >= 0 && cols[progIdx]) {
    const n = Number(cols[progIdx])
    if (Number.isFinite(n) && n > 0) row.exam_program_id = n
  }
  if (row.name && row.email) return row
  return null
}

const parseCsv = (text: string): InviteRow[] => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const nameIdx = header.indexOf('name')
  const emailIdx = header.indexOf('email')
  const roleIdx = header.indexOf('role')
  const progIdx = header.indexOf('exam_program_id')
  if (nameIdx < 0 || emailIdx < 0 || roleIdx < 0) {
    throw new Error('CSV must include name, email, role columns')
  }
  const rows: InviteRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const row = parseInviteRow(
      lines[i].split(',').map((c) => c.trim()),
      nameIdx,
      emailIdx,
      roleIdx,
      progIdx,
    )
    if (row) rows.push(row)
  }
  return rows
}

const onFile = async (e: Event) => {
  errorMessage.value = ''
  successMessage.value = ''
  results.value = []
  previewRows.value = []
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    previewRows.value = parseCsv(text)
    if (!previewRows.value.length) {
      errorMessage.value = 'No valid rows found in CSV'
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Failed to parse CSV'
  }
}

const submit = async () => {
  if (!previewRows.value.length) return
  busy.value = true
  errorMessage.value = ''
  successMessage.value = ''
  results.value = []
  try {
    const { data } = await axiosInstance.post('/institutions/me/invites/csv', {
      rows: previewRows.value,
    })
    results.value = data?.results || []
    successMessage.value = data?.message || 'Invites processed'
  } catch (err: any) {
    errorMessage.value =
      err?.response?.data?.message || err?.message || 'Invite request failed'
  } finally {
    busy.value = false
  }
}
</script>
