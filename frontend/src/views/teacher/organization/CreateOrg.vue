<template>
  <div class="container mt-4 mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bolder text-uppercase m-0">Create organization</h5>
          <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-outline-secondary btn-sm">
            Back
          </router-link>
        </div>
        <p class="text-muted small mb-4">
          Create a School or Coaching Center. You become the admin. Choose
          <strong>Private</strong> (org code only) or <strong>Public</strong> (appears in browse).
          You can create test papers anytime; assigning tests needs this organization.
        </p>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
          <div v-if="createdOrgCode" class="mt-2">
            Org code: <code class="fs-6">{{ createdOrgCode }}</code>
          </div>
        </div>

        <div v-if="existingOrg" class="alert alert-warning">
          <div class="fw-semibold mb-1">You already belong to an organization</div>
          <div>
            <strong>{{ existingOrg.name }}</strong>
            <span class="text-muted">
              ({{ existingOrg.institution_type }} · {{ existingOrg.member_role }} ·
              {{ existingOrg.visibility }})
            </span>
          </div>
          <div v-if="existingOrg.org_code" class="mt-1">
            Org code: <code>{{ existingOrg.org_code }}</code>
          </div>
          <p class="mb-2 mt-2 small">
            A teacher can only be in one School / Coaching Center. Leave from your
            <router-link :to="{ name: 'teacherOrganization' }">organization</router-link>
            (or soft-close if you are the sole admin) before creating another.
          </p>
          <router-link :to="{ name: 'teacherOrganization' }" class="btn btn-dark btn-sm">
            Back to organization
          </router-link>
        </div>

        <form v-else @submit.prevent="handleSubmit" novalidate>
          <div class="mode-toggle mb-4" role="tablist">
            <button
              type="button"
              :class="{ active: form.institution_type === 'SCHOOL' }"
              @click="form.institution_type = 'SCHOOL'"
            >
              School
            </button>
            <button
              type="button"
              :class="{ active: form.institution_type === 'COACHING_CENTER' }"
              @click="form.institution_type = 'COACHING_CENTER'"
            >
              Coaching Center
            </button>
          </div>

          <div class="form-floating mb-3">
            <input
              id="orgName"
              v-model="form.name"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': touched && !form.name.trim() }"
              placeholder="Organization name"
              required
            />
            <label for="orgName">
              {{ form.institution_type === 'SCHOOL' ? 'School' : 'Coaching Center' }} Name
              <span class="text-danger">*</span>
            </label>
          </div>

          <div class="mb-3">
            <SearchableDropdown
              id="orgBoard"
              label="Board"
              required
              placeholder="Select Board"
              :items="boards"
              :model-value="selectedBoard"
              @update:model-value="handleBoardChange"
              @change="handleBoardChange"
            >
              <template #item="{ item }">{{ item.name }}</template>
            </SearchableDropdown>
          </div>

          <div class="mb-3" v-if="standards.length">
            <div class="form-label fw-semibold">Standards <span class="text-danger">*</span></div>
            <div class="border rounded p-3 check-grid">
              <div v-for="s in standards" :key="s.id" class="form-check">
                <input
                  :id="`std-${s.id}`"
                  class="form-check-input"
                  type="checkbox"
                  :value="s.id"
                  v-model="form.standard_ids"
                />
                <label class="form-check-label" :for="`std-${s.id}`">{{ s.name }}</label>
              </div>
            </div>
          </div>

          <div class="mb-3" v-if="mediums.length">
            <div class="form-label fw-semibold">
              Instruction Mediums <span class="text-danger">*</span>
            </div>
            <div class="border rounded p-3 check-grid">
              <div v-for="m in mediums" :key="m.id" class="form-check">
                <input
                  :id="`med-${m.id}`"
                  class="form-check-input"
                  type="checkbox"
                  :value="m.id"
                  v-model="form.instruction_medium_ids"
                />
                <label class="form-check-label" :for="`med-${m.id}`">
                  {{ m.instruction_medium || m.name }}
                </label>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="showAddress = !showAddress"
            >
              {{ showAddress ? 'Hide address' : 'Add address' }}
            </button>
            <p v-if="!showAddress" class="text-muted small mb-0 mt-2">
              Address is required to create an organization — expand to fill (India is preselected).
            </p>
          </div>

          <AddressFieldset
            v-if="showAddress"
            :title="form.institution_type === 'SCHOOL' ? 'School' : 'Center'"
            v-model="form.address"
            v-model:validationStates="addressValidation"
            class="mb-3"
          />

          <div class="mb-3">
            <div class="form-label fw-semibold">Visibility</div>
            <div class="mode-toggle" role="tablist" aria-label="Organization visibility">
              <button
                type="button"
                :class="{ active: form.visibility === 'PRIVATE' }"
                @click="form.visibility = 'PRIVATE'"
              >
                Private
              </button>
              <button
                type="button"
                :class="{ active: form.visibility === 'PUBLIC' }"
                @click="form.visibility = 'PUBLIC'"
              >
                Public
              </button>
            </div>
            <p class="text-muted small mb-0 mt-2">
              <template v-if="form.visibility === 'PRIVATE'">
                Join only with the org code you share.
              </template>
              <template v-else>
                Listed when teachers and learners browse public organizations. They still need
                approval to join.
              </template>
            </p>
          </div>

          <div class="form-floating mb-3">
            <input
              id="orgPrincipal"
              v-model="form.principal_name"
              type="text"
              class="form-control"
              placeholder="Principal / Head name"
            />
            <label for="orgPrincipal">Principal / Head Name (optional — defaults to you)</label>
          </div>

          <div class="form-floating mb-3">
            <input
              id="orgEmail"
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="Email"
            />
            <label for="orgEmail">Org Email (optional — defaults to your email)</label>
          </div>

          <div class="form-floating mb-4">
            <input
              id="orgContact"
              v-model="form.contact_number"
              type="text"
              class="form-control"
              placeholder="Contact"
              @input="form.contact_number = form.contact_number.replace(/\D/g, '').slice(0, 10)"
            />
            <label for="orgContact">Contact (optional — defaults to your number)</label>
          </div>

          <button type="submit" class="btn btn-dark btn-lg w-100" :disabled="isSubmitting">
            <output v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></output>
            Create {{ form.institution_type === 'SCHOOL' ? 'School' : 'Coaching Center' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import type { Item } from '@/components/common/SearchableDropdown.vue'
import AddressFieldset from '@/components/common/AddressFieldset.vue'
import type { AxiosError } from 'axios'

const router = useRouter()
const touched = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const createdOrgCode = ref('')
const existingOrg = ref<{
  id: number
  name: string
  org_code?: string
  institution_type?: string
  visibility?: string
  member_role?: string
} | null>(null)

const boards = ref<Item[]>([])
const standards = ref<Array<{ id: number; name: string }>>([])
const mediums = ref<Array<{ id: number; name?: string; instruction_medium?: string }>>([])
const selectedBoard = ref<Item | null>(null)
const showAddress = ref(false)

const form = reactive({
  institution_type: 'SCHOOL' as 'SCHOOL' | 'COACHING_CENTER',
  name: '',
  board_id: null as number | null,
  standard_ids: [] as number[],
  instruction_medium_ids: [] as number[],
  address: {
    street: '',
    postal_code: '',
    city_id: 0,
    state_id: 0,
    country_id: 101, // India (preselected when Address expands)
  },
  visibility: 'PRIVATE' as 'PRIVATE' | 'PUBLIC',
  principal_name: '',
  email: '',
  contact_number: '',
})

const addressValidation = reactive({
  country: { valid: false, touched: false },
  state: { valid: false, touched: false },
  city: { valid: false, touched: false },
  address: { valid: false, touched: false },
  postalCode: { valid: false, touched: false },
})

const handleBoardChange = async (board: Item | null) => {
  selectedBoard.value = board
  form.board_id = (board?.id as number) ?? null
  form.standard_ids = []
  form.instruction_medium_ids = []
  standards.value = []
  mediums.value = []

  if (!board?.id) return
  try {
    const [stdRes, medRes] = await Promise.all([
      axiosInstance.get(`/standards/board/${board.id}`),
      axiosInstance.get(`/instruction-mediums/board/${board.id}`),
    ])
    standards.value = Array.isArray(stdRes.data) ? stdRes.data : stdRes.data?.data || []
    mediums.value = Array.isArray(medRes.data) ? medRes.data : medRes.data?.data || []
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Failed to load standards / mediums for this board'
  }
}

const handleSubmit = async () => {
  touched.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (
    !form.name.trim() ||
    !form.board_id ||
    !form.standard_ids.length ||
    !form.instruction_medium_ids.length ||
    !form.address.city_id ||
    !form.address.street.trim() ||
    !form.address.postal_code.trim()
  ) {
    if (!showAddress.value) showAddress.value = true
    errorMessage.value = 'Please fill all required fields (name, board, standards, mediums, address).'
    return
  }

  isSubmitting.value = true
  try {
    const payload: Record<string, unknown> = {
      institution_type: form.institution_type,
      name: form.name.trim(),
      board_id: form.board_id,
      standard_ids: form.standard_ids,
      instruction_medium_ids: form.instruction_medium_ids,
      address: {
        street: form.address.street.trim(),
        postal_code: form.address.postal_code.trim(),
        city_id: form.address.city_id,
      },
      visibility: form.visibility,
    }
    if (form.principal_name.trim()) payload.principal_name = form.principal_name.trim()
    if (form.email.trim()) payload.email = form.email.trim()
    if (form.contact_number.trim()) payload.contact_number = form.contact_number.trim()

    const { data } = await axiosInstance.post('/institutions/self', payload)
    createdOrgCode.value = data?.institution?.org_code || ''
    successMessage.value =
      data?.message || 'Organization created. You are the admin.'
    setTimeout(() => router.push({ name: 'teacherOrganization' }), 1800)
  } catch (error) {
    const axiosError = error as AxiosError
    const apiMessage = (axiosError.response?.data as any)?.message
    errorMessage.value = apiMessage || 'Failed to create organization'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const profile = await axiosInstance.get('/auth/profile')
    const institutions = profile.data?.institutions || []
    if (institutions.length) {
      existingOrg.value = institutions[0]
      return
    }
  } catch (e) {
    console.error(e)
  }

  try {
    const { data } = await axiosInstance.get('/boards')
    boards.value = Array.isArray(data) ? data : data?.data || []
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Failed to load boards'
  }
})
</script>

<style scoped>
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
  padding: 0.55rem 0.5rem;
  border-radius: 8px;
  font-weight: 600;
  color: #6c757d;
}
.mode-toggle button.active {
  background-color: #111;
  color: #fff;
}
.check-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.35rem 1rem;
  max-height: 220px;
  overflow: auto;
}
</style>
