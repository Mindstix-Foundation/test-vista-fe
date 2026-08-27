<template>
  <LoginNavBar />

  <div class="register-page">
    <div class="container py-3 py-md-4 py-lg-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8 col-xl-7">
          <h5 class="fw-bolder text-uppercase mb-2">Create account</h5>
          <p class="text-muted small mb-4">
            Register as a student, teacher, or exam aspirant. You can optionally request to join a
            school or coaching center during signup.
          </p>

          <div class="mode-toggle mb-2" role="tablist" aria-label="Account type">
            <button
              type="button"
              :class="{ active: accountType === 'student' }"
              :aria-selected="accountType === 'student'"
              @click="setAccountType('student')"
            >
              <i class="bi bi-person-badge me-1 d-none d-sm-inline" aria-hidden="true"></i>
              Student
            </button>
            <button
              type="button"
              :class="{ active: accountType === 'teacher' }"
              :aria-selected="accountType === 'teacher'"
              @click="setAccountType('teacher')"
            >
              <i class="bi bi-easel me-1 d-none d-sm-inline" aria-hidden="true"></i>
              Teacher
            </button>
            <button
              type="button"
              :class="{ active: accountType === 'aspirant' }"
              :aria-selected="accountType === 'aspirant'"
              @click="setAccountType('aspirant')"
            >
              <i class="bi bi-award me-1 d-none d-sm-inline" aria-hidden="true"></i>
              Aspirant
            </button>
          </div>
          <p class="text-muted small mb-4">{{ accountTypeHint }}</p>

          <form @submit.prevent="handleSubmit" novalidate>
            <h6 class="section-label">Account details</h6>
            <div class="row g-3 mb-4">
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': touched && !isNameValid }"
                    id="regName"
                    v-model="form.name"
                    placeholder="Full Name"
                    autocomplete="name"
                    @input="formatNameInput"
                    required
                  />
                  <label for="regName">Full Name <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-if="touched && !isNameValid">
                    Please enter a valid full name (at least 2 characters)
                  </div>
                </div>
              </div>

              <div v-if="accountType === 'student'" class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': touched && !form.rollNo }"
                    id="regRollNo"
                    v-model="form.rollNo"
                    placeholder="Roll Number"
                    @input="formatRollNoInput"
                    required
                  />
                  <label for="regRollNo">Roll Number <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-if="touched && !form.rollNo">
                    Please enter your roll number
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': touched && !isContactValid }"
                    id="regContact"
                    v-model="form.contactNumber"
                    placeholder="Contact"
                    autocomplete="tel"
                    inputmode="numeric"
                    @input="formatContactInput"
                    required
                  />
                  <label for="regContact">Contact number <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-if="touched && !isContactValid">
                    Enter a 10-digit mobile number
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': touched && !isEmailValid }"
                    id="regEmail"
                    v-model="form.email"
                    placeholder="Email"
                    autocomplete="email"
                    required
                  />
                  <label for="regEmail">Email <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-if="touched && !isEmailValid">
                    Please enter a valid email
                  </div>
                </div>
              </div>

              <div v-if="accountType === 'aspirant'" class="col-12">
                <SearchableDropdown
                  id="regExamProgram"
                  label="Exam program"
                  required
                  placeholder="Select exam program"
                  :items="programItems"
                  :model-value="selectedProgram"
                  @update:model-value="handleProgramChange"
                >
                  <template #item="{ item }">{{ item.name }}</template>
                </SearchableDropdown>
                <div class="invalid-feedback d-block" v-if="touched && !form.examProgramId">
                  Please select an exam program
                </div>
              </div>

              <div v-if="accountType === 'teacher'" class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    id="regQualification"
                    v-model="form.highestQualification"
                    placeholder="Highest Qualification"
                  />
                  <label for="regQualification">
                    Highest Qualification <span class="text-muted">(optional)</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="accountType === 'teacher'" class="mb-4">
              <TeacherCurriculumFields
                ref="curriculumRef"
                :touched="touched"
                @update="onCurriculumUpdate"
              />
            </div>

            <h6 class="section-label">Security</h6>
            <div class="row g-3 mb-2">
              <div class="col-12 col-md-6">
                <div class="form-floating password-field">
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': touched && !isPasswordValid }"
                    id="regPassword"
                    v-model="form.password"
                    placeholder="Password"
                    autocomplete="new-password"
                    required
                  />
                  <label for="regPassword">Password <span class="text-danger">*</span></label>
                  <button
                    type="button"
                    class="password-toggle btn btn-link p-0"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    @click="togglePassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                  </button>
                  <div class="invalid-feedback" v-if="touched && !isPasswordValid">
                    Password must be at least 8 characters
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="form-floating password-field">
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': touched && !isConfirmPasswordValid }"
                    id="regConfirmPassword"
                    v-model="form.confirmPassword"
                    placeholder="Confirm Password"
                    autocomplete="new-password"
                    required
                  />
                  <label for="regConfirmPassword">
                    Confirm Password <span class="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    class="password-toggle btn btn-link p-0"
                    :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                    @click="toggleConfirmPassword"
                  >
                    <i
                      :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                      aria-hidden="true"
                    ></i>
                  </button>
                  <div class="invalid-feedback" v-if="touched && !isConfirmPasswordValid">
                    Passwords do not match
                  </div>
                </div>
              </div>
            </div>
            <p class="password-hint mb-4">
              <i class="bi bi-info-circle me-1" aria-hidden="true"></i>
              Password must be at least 8 characters long
            </p>

            <h6 class="section-label">Organization</h6>
            <p class="text-muted small mb-3">
              Optional. Request membership now; an organization admin must approve before you join.
            </p>
            <OrgJoinFields ref="orgJoinRef" :role="accountType" @update="onOrgJoinUpdate" />

            <div v-if="errorMessage" class="alert alert-danger py-2 small" role="alert">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success py-2 small" role="alert">
              {{ successMessage }}
            </div>

            <div class="d-grid gap-2 mt-2">
              <button type="submit" class="btn btn-dark btn-lg" :disabled="isSubmitting">
                <output
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                ></output>
                Create account
              </button>
              <router-link :to="{ name: 'login' }" class="btn btn-outline-dark">
                Already have an account? Log in
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import type { Item } from '@/components/common/SearchableDropdown.vue'
import OrgJoinFields from '@/components/login/OrgJoinFields.vue'
import type { OrgJoinPayload } from '@/components/login/OrgJoinFields.vue'
import TeacherCurriculumFields from '@/components/login/TeacherCurriculumFields.vue'
import type { CurriculumScopePayload } from '@/components/login/TeacherCurriculumFields.vue'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/config/axios'
import { examCatalogService } from '@/services/examCatalogService'
import type { ExamProgram } from '@/types/exam'
import type { AxiosError } from 'axios'
import { validateEmail } from '@/utils/validationConstants'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

type AccountType = 'student' | 'teacher' | 'aspirant'
const accountType = ref<AccountType>(
  (() => {
    if (route.query.type === 'aspirant') return 'aspirant'
    if (route.query.type === 'teacher') return 'teacher'
    return 'student'
  })(),
)

const touched = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const setInputType = (inputId: string, visible: boolean) => {
  const input = document.getElementById(inputId) as HTMLInputElement | null
  if (input) {
    input.type = visible ? 'text' : 'password'
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
  setInputType('regPassword', showPassword.value)
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
  setInputType('regConfirmPassword', showConfirmPassword.value)
}

const orgJoinRef = ref<InstanceType<typeof OrgJoinFields> | null>(null)
const curriculumRef = ref<InstanceType<typeof TeacherCurriculumFields> | null>(null)
const orgJoin = ref<OrgJoinPayload>({ enabled: false })
const curriculum = ref<CurriculumScopePayload | null>(null)

const form = reactive({
  name: '',
  rollNo: '',
  email: '',
  contactNumber: '',
  password: '',
  confirmPassword: '',
  highestQualification: '',
  examProgramId: 0,
})

const setAccountType = (type: AccountType) => {
  accountType.value = type
  touched.value = false
  errorMessage.value = ''
  successMessage.value = ''
}

const accountTypeHint = computed(() => {
  if (accountType.value === 'student') {
    return 'Email + password required. Optionally request to join a school during signup.'
  }
  if (accountType.value === 'teacher') {
    return 'Optionally request to join a School / Coaching Center during signup. Assigning tests needs an organization.'
  }
  return 'For competitive / entrance exams. Optionally request to join a coaching center now.'
})

const formatNameInput = () => {
  form.name = form.name
    .replaceAll(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const formatRollNoInput = () => {
  let formatted = form.rollNo.replaceAll(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (/^\d+$/.test(formatted)) {
    formatted = formatted.replace(/^0+/, '') || '0'
  }
  form.rollNo = formatted
}

const formatContactInput = () => {
  form.contactNumber = form.contactNumber.replaceAll(/\D/g, '').slice(0, 10)
}

const isNameValid = computed(() => form.name.trim().length >= 2)
const isEmailValid = computed(() => validateEmail(form.email))
const isContactValid = computed(() => /^\d{10}$/.test(form.contactNumber.trim()))
const isPasswordValid = computed(() => form.password.length >= 8)
const isConfirmPasswordValid = computed(
  () => form.confirmPassword.length > 0 && form.confirmPassword === form.password,
)

const isFormValid = computed(() => {
  if (!isNameValid.value || !isEmailValid.value || !isContactValid.value) return false
  if (!isPasswordValid.value || !isConfirmPasswordValid.value) return false
  if (accountType.value === 'student' && !form.rollNo.trim()) return false
  if (accountType.value === 'aspirant' && form.examProgramId <= 0) return false
  if (accountType.value === 'teacher' && !curriculum.value) return false
  return true
})

const onCurriculumUpdate = (payload: CurriculumScopePayload | null) => {
  curriculum.value = payload
}
const programs = ref<ExamProgram[]>([])
const selectedProgram = ref<Item | null>(null)
const programItems = computed<Item[]>(() =>
  programs.value.map((program) => ({
    id: program.id,
    name: `${program.exam_body?.abbreviation ?? ''} — ${program.name}`,
  })),
)

const handleProgramChange = (item: Item | null) => {
  selectedProgram.value = item
  form.examProgramId = (item?.id as number) ?? 0
}

const onOrgJoinUpdate = (payload: OrgJoinPayload) => {
  orgJoin.value = payload
}

onMounted(async () => {
  try {
    programs.value = await examCatalogService.getPrograms()
  } catch {
    programs.value = []
  }
})

const axiosMsg = (err: unknown) => {
  const axiosErr = err as AxiosError<{ message?: string | string[] }>
  const msg = axiosErr.response?.data?.message
  return Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed'
}

const registerStudent = async () => {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    email_id: form.email.trim().toLowerCase(),
    password: form.password,
    contact_number: form.contactNumber.replaceAll(/\D/g, ''),
    student_id: form.rollNo.trim(),
  }
  if (orgJoin.value.enabled) {
    if (orgJoin.value.org_code) payload.org_code = orgJoin.value.org_code
    if (orgJoin.value.institution_id) payload.institution_id = orgJoin.value.institution_id
    if (orgJoin.value.school_standard_id) {
      payload.school_standard_id = orgJoin.value.school_standard_id
    }
    if (orgJoin.value.request_message) payload.request_message = orgJoin.value.request_message
  }

  const { data } = await axiosInstance.post('/users/register/student', payload)
  if (!data?.access_token || !data?.user) throw new Error('Registration failed')
  successMessage.value = data.message || 'Registration successful!'
  authStore.setAuth(data.access_token, 'STUDENT', data.user.id)
  router.push({ name: 'studentExam' })
}

const registerTeacher = async () => {
  if (!curriculum.value) throw new Error('Teaching scope is required')
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    email_id: form.email.trim().toLowerCase(),
    password: form.password,
    contact_number: form.contactNumber.replaceAll(/\D/g, ''),
    board_id: curriculum.value.board_id,
    scopes: curriculum.value.scopes,
  }
  if (form.highestQualification.trim()) {
    payload.highest_qualification = form.highestQualification.trim()
  }
  if (orgJoin.value.enabled) {
    if (orgJoin.value.org_code) payload.org_code = orgJoin.value.org_code
    if (orgJoin.value.institution_id) payload.institution_id = orgJoin.value.institution_id
    if (orgJoin.value.request_message) payload.request_message = orgJoin.value.request_message
  }

  const { data } = await axiosInstance.post('/users/register/teacher', payload)
  if (!data?.access_token || !data?.user) throw new Error('Registration failed')
  successMessage.value = data.message || 'Registration successful!'
  authStore.setAuth(data.access_token, 'TEACHER', data.user.id)
  router.push({ name: 'teacherHome' })
}

const registerAspirant = async () => {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    contact_number: form.contactNumber.replaceAll(/\D/g, ''),
    exam_program_id: form.examProgramId,
  }
  if (orgJoin.value.enabled) {
    if (orgJoin.value.org_code) payload.org_code = orgJoin.value.org_code
    if (orgJoin.value.institution_id) payload.institution_id = orgJoin.value.institution_id
    if (orgJoin.value.school_standard_id) {
      payload.school_standard_id = orgJoin.value.school_standard_id
    }
    if (orgJoin.value.request_message) payload.request_message = orgJoin.value.request_message
  }

  const result = await examCatalogService.registerAspirant(payload as any)
  if (result.access_token && result.user) {
    successMessage.value = (result as any).message || 'Registration successful!'
    authStore.setAuth(result.access_token, 'STUDENT', result.user.id)
    router.push('/student/exam')
  } else {
    router.push({ name: 'login' })
  }
}

const handleSubmit = async () => {
  touched.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = 'Please fill all required fields correctly'
    return
  }

  const orgErr = orgJoinRef.value?.validate?.() ?? null
  if (orgErr) {
    errorMessage.value = orgErr
    return
  }

  if (accountType.value === 'teacher') {
    const currErr = curriculumRef.value
      ? curriculumRef.value.validate()
      : 'Please complete teaching scope'
    if (currErr) {
      errorMessage.value = currErr
      return
    }
  }

  isSubmitting.value = true
  try {
    if (accountType.value === 'student') await registerStudent()
    else if (accountType.value === 'teacher') await registerTeacher()
    else await registerAspirant()
  } catch (err) {
    errorMessage.value = axiosMsg(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 100px);
  background: #fff;
}

.section-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #212529;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #dee2e6;
}

.mode-toggle {
  display: flex;
  gap: 4px;
  background-color: #f1f3f5;
  border-radius: 10px;
  padding: 4px;
}

.mode-toggle button {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.55rem 0.35rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #6c757d;
}

.mode-toggle button.active {
  background-color: #111;
  color: #fff;
}

.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.85rem;
  top: 1.15rem;
  color: #6c757d;
  z-index: 5;
  line-height: 1;
  text-decoration: none;
}

.password-toggle:hover,
.password-toggle:focus {
  color: #212529;
}

.password-hint {
  font-size: 0.8rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .register-page {
    min-height: calc(100vh - 80px);
  }

  .mode-toggle button {
    font-size: 0.8rem;
    padding: 0.5rem 0.25rem;
  }
}

@media (max-width: 576px) {
  .register-page {
    min-height: calc(100vh - 70px);
  }
}
</style>
