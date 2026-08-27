<template>
  <div class="org-join-fields mb-3">
    <div class="form-check mb-3">
      <input
        class="form-check-input"
        type="checkbox"
        id="joinOrgOpt"
        v-model="enabled"
        @change="onEnabledChange"
      />
      <label class="form-check-label" for="joinOrgOpt">
        Request to join an organization
        <span class="text-muted">(optional)</span>
      </label>
    </div>

    <div v-if="enabled" class="org-join-panel">
      <div class="form-check mb-3">
        <input
          class="form-check-input"
          type="checkbox"
          id="privateOrgCode"
          v-model="usePrivateCode"
          @change="onPrivateToggle"
        />
        <label class="form-check-label" for="privateOrgCode">
          I have a private organization code
        </label>
      </div>

      <!-- Private org code -->
      <template v-if="usePrivateCode">
        <div class="row g-2 align-items-stretch mb-2">
          <div class="col-12 col-sm">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                id="orgCodeInput"
                v-model="orgCode"
                placeholder="TV-S-XXXX or TV-C-XXXX"
                @input="orgCode = orgCode.toUpperCase()"
              />
              <label for="orgCodeInput">Organization code</label>
            </div>
          </div>
          <div class="col-12 col-sm-auto d-grid">
            <button
              type="button"
              class="btn btn-outline-dark h-100 px-4"
              :disabled="!orgCode.trim() || loadingCode"
              @click="loadByCode"
            >
              <output v-if="loadingCode" class="spinner-border spinner-border-sm"></output>
              <span v-else>Load</span>
            </button>
          </div>
        </div>
        <p v-if="resolvedOrg" class="small text-success mb-2">
          Found: <strong>{{ resolvedOrg.name }}</strong>
          ({{ resolvedOrg.institution_type }})
        </p>
      </template>

      <!-- Geo cascade for public orgs -->
      <template v-else>
        <div class="row g-2 mb-2">
          <div class="col-12 col-md-6">
            <SearchableDropdown
              id="regCountry"
              label="Country"
              required
              placeholder="Select country"
              :items="countries"
              :model-value="selectedCountry"
              @update:model-value="onCountry"
            >
              <template #item="{ item }">{{ item.name }}</template>
            </SearchableDropdown>
          </div>
          <div class="col-12 col-md-6">
            <SearchableDropdown
              id="regState"
              label="State"
              required
              placeholder="Select state"
              :items="states"
              :model-value="selectedState"
              :disabled="!selectedCountry"
              @update:model-value="onState"
            >
              <template #item="{ item }">{{ item.name }}</template>
            </SearchableDropdown>
          </div>
          <div class="col-12 col-md-6">
            <SearchableDropdown
              id="regCity"
              label="City"
              required
              placeholder="Select city"
              :items="cities"
              :model-value="selectedCity"
              :disabled="!selectedState"
              @update:model-value="onCity"
            >
              <template #item="{ item }">{{ item.name }}</template>
            </SearchableDropdown>
          </div>
          <div class="col-12 col-md-6">
            <SearchableDropdown
              id="regOrg"
              label="Organization"
              required
              placeholder="Select organization"
              :items="orgItems"
              :model-value="selectedOrg"
              :disabled="!selectedCity || loadingOrgs"
              @update:model-value="onOrg"
            >
              <template #item="{ item }">{{ item.name }}</template>
            </SearchableDropdown>
            <p
              v-if="selectedCity && !loadingOrgs && orgItems.length === 0"
              class="small text-muted mt-1 mb-0"
            >
              No public organizations in this city.
            </p>
          </div>
        </div>
      </template>

      <!-- Standard required for learners -->
      <div v-if="needsStandard && resolvedOrg" class="mb-2">
        <SearchableDropdown
          id="regOrgStandard"
          label="Standard / Class"
          required
          placeholder="Select standard"
          :items="standardItems"
          :model-value="selectedStandard"
          :disabled="loadingStandards || standardItems.length === 0"
          @update:model-value="onStandard"
        >
          <template #item="{ item }">{{ item.name }}</template>
        </SearchableDropdown>
      </div>

      <div class="form-floating mb-0">
        <input
          type="text"
          class="form-control"
          id="orgRequestMsg"
          v-model="requestMessage"
          placeholder="Optional message"
          maxlength="500"
        />
        <label for="orgRequestMsg">Message to admin <span class="text-muted">(optional)</span></label>
      </div>

      <p v-if="error" class="small text-danger mt-2 mb-0">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import type { Item } from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'

export type AccountRole = 'student' | 'teacher' | 'aspirant'

export type OrgJoinPayload = {
  enabled: boolean
  institution_id?: number
  org_code?: string
  school_standard_id?: number
  request_message?: string
}

const props = defineProps<{
  role: AccountRole
}>()

const emit = defineEmits<(e: 'update', payload: OrgJoinPayload) => void>()

const enabled = ref(false)
const usePrivateCode = ref(false)
const orgCode = ref('')
const requestMessage = ref('')
const error = ref('')
const loadingCode = ref(false)
const loadingOrgs = ref(false)
const loadingStandards = ref(false)

const countries = ref<Item[]>([])
const states = ref<Item[]>([])
const cities = ref<Item[]>([])
const orgItems = ref<Item[]>([])
const standardItems = ref<Item[]>([])

const selectedCountry = ref<Item | null>(null)
const selectedState = ref<Item | null>(null)
const selectedCity = ref<Item | null>(null)
const selectedOrg = ref<Item | null>(null)
const selectedStandard = ref<Item | null>(null)

type ResolvedOrg = {
  id: number
  name: string
  org_code: string
  institution_type: string
  visibility?: string
}
const resolvedOrg = ref<ResolvedOrg | null>(null)

const needsStandard = computed(() => props.role === 'student' || props.role === 'aspirant')

const preferredType = computed(() => {
  if (props.role === 'student') return 'SCHOOL'
  if (props.role === 'aspirant') return 'COACHING_CENTER'
  return undefined
})

const emitUpdate = () => {
  if (!enabled.value) {
    emit('update', { enabled: false })
    return
  }
  emit('update', {
    enabled: true,
    institution_id: usePrivateCode.value ? undefined : resolvedOrg.value?.id,
    org_code: usePrivateCode.value ? orgCode.value.trim() || undefined : undefined,
    school_standard_id: needsStandard.value
      ? (selectedStandard.value?.id as number | undefined)
      : undefined,
    request_message: requestMessage.value.trim() || undefined,
  })
}

watch(
  [enabled, usePrivateCode, orgCode, resolvedOrg, selectedStandard, requestMessage],
  () => emitUpdate(),
  { deep: true },
)

watch(
  () => props.role,
  () => {
    if (enabled.value && !usePrivateCode.value && selectedCity.value) {
      void loadOrgs(selectedCity.value.id as number)
    }
    selectedStandard.value = null
    standardItems.value = []
    if (resolvedOrg.value) void loadStandards(resolvedOrg.value.id)
  },
)

onMounted(async () => {
  try {
    const { data } = await axiosInstance.get('/countries')
    countries.value = (data || []).map((c: { id: number; name: string }) => ({
      id: c.id,
      name: c.name,
    }))
  } catch {
    countries.value = []
  }
})

const resetGeo = () => {
  selectedCountry.value = null
  selectedState.value = null
  selectedCity.value = null
  selectedOrg.value = null
  states.value = []
  cities.value = []
  orgItems.value = []
}

const clearResolved = () => {
  resolvedOrg.value = null
  selectedStandard.value = null
  standardItems.value = []
}

const onEnabledChange = () => {
  error.value = ''
  if (!enabled.value) {
    usePrivateCode.value = false
    orgCode.value = ''
    resetGeo()
    clearResolved()
  }
  emitUpdate()
}

const onPrivateToggle = () => {
  error.value = ''
  orgCode.value = ''
  resetGeo()
  clearResolved()
  emitUpdate()
}

const loadByCode = async () => {
  error.value = ''
  clearResolved()
  loadingCode.value = true
  try {
    const code = orgCode.value.trim()
    const { data } = await axiosInstance.get(`/institutions/by-code/${encodeURIComponent(code)}`)
    const inst = data?.institution || data
    if (!inst?.id) {
      error.value = 'Organization not found for that code'
      return
    }
    if (props.role === 'aspirant' && inst.institution_type !== 'COACHING_CENTER') {
      error.value = 'Aspirants can only join Coaching Centers'
      return
    }
    resolvedOrg.value = {
      id: inst.id,
      name: inst.name,
      org_code: inst.org_code,
      institution_type: inst.institution_type,
      visibility: inst.visibility,
    }
    if (needsStandard.value) await loadStandardsByCode(code)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Could not load organization'
  } finally {
    loadingCode.value = false
  }
}

const onCountry = async (item: Item | null) => {
  selectedCountry.value = item
  selectedState.value = null
  selectedCity.value = null
  selectedOrg.value = null
  clearResolved()
  states.value = []
  cities.value = []
  orgItems.value = []
  if (!item) return
  const { data } = await axiosInstance.get('/states', { params: { countryId: item.id } })
  states.value = (data || []).map((s: { id: number; name: string }) => ({
    id: s.id,
    name: s.name,
  }))
}

const onState = async (item: Item | null) => {
  selectedState.value = item
  selectedCity.value = null
  selectedOrg.value = null
  clearResolved()
  cities.value = []
  orgItems.value = []
  if (!item) return
  const { data } = await axiosInstance.get('/cities', { params: { stateId: item.id } })
  cities.value = (data || []).map((c: { id: number; name: string }) => ({
    id: c.id,
    name: c.name,
  }))
}

const onCity = async (item: Item | null) => {
  selectedCity.value = item
  selectedOrg.value = null
  clearResolved()
  orgItems.value = []
  if (!item) return
  await loadOrgs(item.id as number)
}

const loadOrgs = async (cityId: number) => {
  loadingOrgs.value = true
  try {
    const { data } = await axiosInstance.get('/institutions/discover', {
      params: {
        city_id: cityId,
        ...(preferredType.value ? { institution_type: preferredType.value } : {}),
      },
    })
    orgItems.value = (data || []).map(
      (o: { id: number; name: string; institution_type: string; org_code: string }) => ({
        id: o.id,
        name: `${o.name} (${o.institution_type === 'SCHOOL' ? 'School' : 'Coaching'})`,
        institution_type: o.institution_type,
        org_code: o.org_code,
      }),
    )
  } catch {
    orgItems.value = []
  } finally {
    loadingOrgs.value = false
  }
}

const onOrg = async (item: Item | null) => {
  selectedOrg.value = item
  selectedStandard.value = null
  standardItems.value = []
  if (!item) {
    resolvedOrg.value = null
    return
  }
  resolvedOrg.value = {
    id: item.id as number,
    name: String(item.name),
    org_code: (item as any).org_code || '',
    institution_type: (item as any).institution_type || '',
  }
  if (needsStandard.value) await loadStandards(item.id as number)
}

const loadStandards = async (institutionId: number) => {
  loadingStandards.value = true
  try {
    const { data } = await axiosInstance.get(`/institutions/${institutionId}/join-standards`)
    standardItems.value = (data?.standards || []).map(
      (s: { school_standard_id: number; name: string }) => ({
        id: s.school_standard_id,
        name: s.name,
      }),
    )
  } catch (e: any) {
    standardItems.value = []
    error.value = e?.response?.data?.message || 'Could not load standards'
  } finally {
    loadingStandards.value = false
  }
}

const loadStandardsByCode = async (code: string) => {
  loadingStandards.value = true
  try {
    const { data } = await axiosInstance.get(
      `/institutions/by-code/${encodeURIComponent(code)}/join-standards`,
    )
    standardItems.value = (data?.standards || []).map(
      (s: { school_standard_id: number; name: string }) => ({
        id: s.school_standard_id,
        name: s.name,
      }),
    )
  } catch (e: any) {
    standardItems.value = []
    error.value = e?.response?.data?.message || 'Could not load standards'
  } finally {
    loadingStandards.value = false
  }
}

const onStandard = (item: Item | null) => {
  selectedStandard.value = item
}

/** Used by parent form validation */
defineExpose({
  validate(): string | null {
    if (!enabled.value) return null
    if (usePrivateCode.value) {
      if (!orgCode.value.trim()) return 'Enter an organization code'
      if (!resolvedOrg.value) return 'Load the organization code first'
    } else if (!resolvedOrg.value) {
      return 'Select country, state, city, and organization'
    }
    if (needsStandard.value && !selectedStandard.value) {
      return 'Select a standard / class for this organization'
    }
    return null
  },
})
</script>

<style scoped>
.org-join-panel {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
}
</style>
