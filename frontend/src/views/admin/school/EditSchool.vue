<!--
🚀 OPTIMIZED SCHOOL UPDATE:
This component now uses an optimized approach similar to EditBoard.vue:

1. Change Detection: Only sends data that has actually changed
2. Efficient API Usage: Uses the /schools/upsert endpoint with minimal payload
3. Comprehensive Debugging: Logs exactly what changes are being sent
4. No Redundant Updates: Skips API call if no changes detected

Benefits:
- Reduced network traffic
- Faster response times
- Better debugging capabilities
- Prevents unnecessary database operations
-->
<template>
  <div class="container-fluid">
    <SchoolFormComponent
      ref="schoolFormRef"
      :isEditMode="true"
      :schoolId="schoolId"
      :initialData="schoolData"
      :isLoading="isLoading"
      @submit="handleSchoolUpdate"
    />
  </div>

  <LoadingSpinner :show="isSubmitting" :showOverlay="true" />

  <!-- Operation Result Modal -->
  <div
    class="modal fade"
    id="operationResultModal"
    tabindex="-1"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Operation Results</h5>
        </div>
        <div class="modal-body">
          <ul class="list-group">
            <li
              v-for="(result, index) in operationResults"
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-start"
              :class="{
                'text-success': result.status === 'success',
                'text-danger': result.status === 'error',
              }"
            >
              <div class="ms-2 me-auto">
                <div>{{ result.operation }}</div>
                <div v-if="result.status === 'error'" class="text-danger small">
                  Error: {{ result.message }}
                </div>
              </div>
              <span
                class="badge rounded-pill"
                :class="{
                  'bg-success': result.status === 'success',
                  'bg-danger': result.status === 'error',
                }"
              >
                {{ result.status }}
              </span>
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-dark" @click="cleanupAndNavigate">
            Go to School List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SchoolFormComponent from '@/components/forms/SchoolFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import axiosInstance from '@/config/axios'
import type { SchoolFormData } from '@/models/School'
import { useToastStore } from '@/store/toast'
import { formatContactNumberForAPI } from '@/utils/validationConstants'
import * as bootstrap from 'bootstrap'

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

// Define additional types to replace 'any' usage
interface AddressData {
  street: string
  postal_code: string
  city_id: number
  state_id?: number
  country_id?: number
}

interface SchoolDetailsData {
  name: string
  board_id: number
  address_id: number
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number: string | null
  address?: AddressData
  mediums?: number[]
  standards?: number[]
}

interface Medium {
  id: number
  instruction_medium?: string
  name?: string
}

interface MediumMapping {
  id: number
  instruction_medium: {
    id: number
    instruction_medium?: string
  }
}

interface Standard {
  id: number
  name?: string
}

interface StandardMapping {
  id: number
  standard: {
    id: number
    name?: string
  }
}

interface School {
  id: number
  name: string
  board: { id: number; name: string }
  address: {
    id: number
    street: string
    postal_code: string
    city: { id: number; name: string; state: { id: number; country: { id: number } } }
  }
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number: string | null
  instruction_mediums: Medium[]
  standards: Standard[]
}

// Define the type for the form component instance
type SchoolFormComponentType = InstanceType<typeof SchoolFormComponent> & {
  availableMediums: { id: number; name: string }[]
  availableStandards: { id: number; name: string }[]
  boardSearch: string
  countrySearch: string
  stateSearch: string
  citySearch: string
  selectedCountry: { id: number; name: string } | null
  selectedState: { id: number; name: string; country_id: number } | null
  selectedCity: { id: number; name: string; state_id: number } | null
}

const router = useRouter()
const route = useRoute()
const schoolId = computed(() => route.params.id as string)
const isLoading = ref(false)
const isSubmitting = ref(false)
const schoolData = ref<SchoolFormData | null>(null)
const operationResults = ref<OperationResult[]>([])
let operationResultModal: bootstrap.Modal | null = null

// Update the ref type to use our custom type
const schoolFormRef = ref<SchoolFormComponentType | null>(null)

// Store current school data for change detection
const currentSchoolData = ref<School | null>(null)

// Enhanced interfaces for the school update endpoint
interface UpdateSchoolDto {
  id: number
  name?: string
  board_id?: number
  address?: AddressData
  principal_name?: string
  email?: string
  contact_number?: string
  alternate_contact_number?: string | null
  instruction_medium_ids?: number[]
  standard_ids?: number[]
}

const buildUpdatePayload = (
  formData: SchoolFormData,
  currentSchool: School
): UpdateSchoolDto => {
  const payload: UpdateSchoolDto = {
    id: Number.parseInt(schoolId.value, 10)
  }

  // Check if basic school details changed
  if (
    currentSchool.name !== formData.name ||
    currentSchool.board.id !== formData.board_id ||
    currentSchool.principal_name !== formData.principal_name ||
    currentSchool.email !== formData.email ||
    currentSchool.contact_number !== formData.contact_number ||
    currentSchool.alternate_contact_number !== (formData.alternate_contact_number || null)
  ) {
    payload.name = formData.name
    payload.board_id = formData.board_id
    payload.principal_name = formData.principal_name
    payload.email = formData.email
    payload.contact_number = formatContactNumberForAPI(formData.contact_number)
    payload.alternate_contact_number = formData.alternate_contact_number 
      ? formatContactNumberForAPI(formData.alternate_contact_number)
      : null
  }

  // Check if address changed
  const currentAddress = currentSchool.address
  if (
    currentAddress.street !== formData.address.street ||
    currentAddress.postal_code !== formData.address.postal_code ||
    currentAddress.city.id !== formData.address.city_id
  ) {
    payload.address = {
      street: formData.address.street,
      postal_code: formData.address.postal_code,
      city_id: formData.address.city_id
    }
  }

  // Check if mediums changed
  const currentMediumIds = currentSchool.instruction_mediums.map(m => m.id).sort()
  const formMediumIds = [...formData.mediums].sort()
  
  if (JSON.stringify(currentMediumIds) !== JSON.stringify(formMediumIds)) {
    payload.instruction_medium_ids = formData.mediums
  }

  // Check if standards changed
  const currentStandardIds = currentSchool.standards.map(s => s.id).sort()
  const formStandardIds = [...formData.standards].sort()
  
  if (JSON.stringify(currentStandardIds) !== JSON.stringify(formStandardIds)) {
    payload.standard_ids = formData.standards
  }

  return payload
}

// Debug function to log changes
const debugFormData = (formData: SchoolFormData, currentSchool: School) => {
  console.log('🧪 SCHOOL UPDATE DEBUG - CHANGE ANALYSIS:')
  
  // Debug basic details
  const basicDetailsChanged = 
    currentSchool.name !== formData.name ||
    currentSchool.board.id !== formData.board_id ||
    currentSchool.principal_name !== formData.principal_name ||
    currentSchool.email !== formData.email ||
    currentSchool.contact_number !== formData.contact_number ||
    currentSchool.alternate_contact_number !== (formData.alternate_contact_number || null)
    
  console.log('📝 Basic Details Changes:', {
    hasChanges: basicDetailsChanged,
    changes: {
      name: { current: currentSchool.name, form: formData.name, changed: currentSchool.name !== formData.name },
      board_id: { current: currentSchool.board.id, form: formData.board_id, changed: currentSchool.board.id !== formData.board_id },
      principal_name: { current: currentSchool.principal_name, form: formData.principal_name, changed: currentSchool.principal_name !== formData.principal_name },
      email: { current: currentSchool.email, form: formData.email, changed: currentSchool.email !== formData.email },
      contact_number: { current: currentSchool.contact_number, form: formData.contact_number, changed: currentSchool.contact_number !== formData.contact_number },
      alternate_contact_number: { current: currentSchool.alternate_contact_number, form: formData.alternate_contact_number, changed: currentSchool.alternate_contact_number !== (formData.alternate_contact_number || null) }
    }
  })
  
  // Debug address
  const addressChanged = 
    currentSchool.address.street !== formData.address.street ||
    currentSchool.address.postal_code !== formData.address.postal_code ||
    currentSchool.address.city.id !== formData.address.city_id
    
  console.log('🏠 Address Changes:', {
    hasChanges: addressChanged,
    changes: {
      street: { current: currentSchool.address.street, form: formData.address.street, changed: currentSchool.address.street !== formData.address.street },
      postal_code: { current: currentSchool.address.postal_code, form: formData.address.postal_code, changed: currentSchool.address.postal_code !== formData.address.postal_code },
      city_id: { current: currentSchool.address.city.id, form: formData.address.city_id, changed: currentSchool.address.city.id !== formData.address.city_id }
    }
  })
  
  // Debug mediums
  const currentMediumIds = currentSchool.instruction_mediums.map(m => m.id).sort()
  const formMediumIds = [...formData.mediums].sort()
  const mediumsChanged = JSON.stringify(currentMediumIds) !== JSON.stringify(formMediumIds)
  
  console.log('📚 Medium Changes:', {
    hasChanges: mediumsChanged,
    current: currentMediumIds,
    form: formMediumIds,
    added: formMediumIds.filter(id => !currentMediumIds.includes(id)),
    removed: currentMediumIds.filter(id => !formMediumIds.includes(id))
  })
  
  // Debug standards
  const currentStandardIds = currentSchool.standards.map(s => s.id).sort()
  const formStandardIds = [...formData.standards].sort()
  const standardsChanged = JSON.stringify(currentStandardIds) !== JSON.stringify(formStandardIds)
  
  console.log('📖 Standard Changes:', {
    hasChanges: standardsChanged,
    current: currentStandardIds,
    form: formStandardIds,
    added: formStandardIds.filter(id => !currentStandardIds.includes(id)),
    removed: currentStandardIds.filter(id => !formStandardIds.includes(id))
  })
  
  // Summary
  const hasAnyChanges = basicDetailsChanged || addressChanged || mediumsChanged || standardsChanged
  console.log('📊 Summary:', {
    hasAnyChanges,
    basicDetailsChanged,
    addressChanged,
    mediumsChanged,
    standardsChanged
  })
}

onMounted(() => {
  operationResultModal = new bootstrap.Modal(document.getElementById('operationResultModal')!)
})

const cleanupAndNavigate = () => {
  // Properly clean up the modal
  const modalElement = document.getElementById('operationResultModal')
  if (modalElement) {
    operationResultModal?.hide()

    // Remove backdrop manually
    for (const backdrop of document.querySelectorAll('.modal-backdrop')) backdrop.remove();

    // Remove modal-open class and inline styles from body
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  }

  router.push('/admin/school')
}

// Fetch school data when component mounts
onMounted(async () => {
  try {
    if (!schoolId.value) return

    isLoading.value = true
    const { data: school } = await axiosInstance.get(`/schools/${schoolId.value}`)

    // Make sure we're extracting the correct IDs from the nested response
    const cityId = school.address?.city?.id
    const stateId = school.address?.city?.state?.id
    const countryId = school.address?.city?.state?.country?.id

    // Get board mediums and standards
    const [
      { data: boardMediums },
      { data: boardStandards },
    ] = await Promise.all([
      axiosInstance.get(`/instruction-mediums/board/${school.board.id}`),
      axiosInstance.get(`/standards/board/${school.board.id}`),
    ])

    console.log("Fetched board mediums:", boardMediums);
    console.log("Fetched board standards:", boardStandards);

    // Map board mediums and standards to the format expected by the form
    const mappedBoardMediums = boardMediums.map(
      (m: { id: number; instruction_medium: string }) => ({
        id: m.id,
        name: m.instruction_medium,
      }),
    )
    const mappedBoardStandards = boardStandards.map((s: { id: number; name: string; sequence_number: number }) => ({
      id: s.id,
      name: s.name,
      sequence_number: s.sequence_number
    })).sort((a: { sequence_number: number }, b: { sequence_number: number }) => a.sequence_number - b.sequence_number)

    // Get the IDs of the school's selected mediums and standards
    const selectedMediumIds = school.instruction_mediums.map((m: { id: number }) => m.id)
    const selectedStandardIds = school.standards.map((s: { id: number }) => s.id)

    // Construct form data using the new API response format
    schoolData.value = {
      name: school.name,
      board_id: school.board.id,
      address_id: school.address.id,
      principal_name: school.principal_name,
      email: school.email,
      contact_number: school.contact_number,
      alternate_contact_number: school.alternate_contact_number ?? '',
      address: {
        street: school.address.street || '',
        postal_code: school.address.postal_code || '',
        city_id: cityId || 0,
        state_id: stateId || 0,
        country_id: countryId || 0,
      },
      mediums: selectedMediumIds,
      standards: selectedStandardIds,
    }

    // Set the available mediums and standards in the form component after a short delay
    // to ensure the form component has fully mounted and processed the initialData
    setTimeout(() => {
      if (schoolFormRef.value) {
        schoolFormRef.value.availableMediums = mappedBoardMediums
        schoolFormRef.value.availableStandards = mappedBoardStandards
        schoolFormRef.value.boardSearch = school.board.name
        console.log("Set form mediums and standards:", mappedBoardMediums, mappedBoardStandards);
      }
    }, 100);

    // Store current school data for change detection
    currentSchoolData.value = school
  } catch (error) {
    console.error('Error fetching school data:', error)
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to load school data. Please try again.',
    })
  } finally {
    isLoading.value = false
  }
})

// Removed old helper functions - now using optimized approach similar to EditBoard.vue

const handleSchoolUpdate = async (formData: SchoolFormData) => {
  try {
    console.log('🔍 handleSchoolUpdate called - received data:', formData)
    console.log('🔍 School ID:', schoolId.value)
    
    isSubmitting.value = true

    // Use cached school data for change detection
    if (!currentSchoolData.value) {
      throw new Error('School data not available. Please refresh the page.')
    }

    const currentSchool = currentSchoolData.value
    
    // Debug form data and changes
    debugFormData(formData, currentSchool)
    
    // Build optimized update payload
    const updatePayload = buildUpdatePayload(formData, currentSchool)

    console.log('🚀 Optimized update payload:', updatePayload)

    // Check if there are any changes
    const hasChanges = Object.keys(updatePayload).length > 1 // More than just the ID
    
    if (!hasChanges) {
      const toastStore = useToastStore()
      toastStore.showToast({
        type: 'info',
        title: 'No Changes',
        message: 'No changes detected. Redirecting to school list.'
      })
      router.push('/admin/school')
      return
    }

    // Use the new partial update endpoint for efficiency
    const { data: updatedSchool } = await axiosInstance.post('/schools/upsert-partial', updatePayload)
    console.log('✅ School updated successfully:', updatedSchool)

    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'success',
      title: 'Success',
      message: `School "${formData.name}" has been updated successfully.`
    })
    
    router.push('/admin/school')
  } catch (error) {
    console.error('❌ Error updating school:', error)
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to update school. Please try again.'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.list-group-item {
  transition: all 0.2s ease-in-out;
  border-left-width: 4px;
}

.list-group-item.text-success {
  border-left-color: #198754;
  color: #198754 !important;
}

.list-group-item.text-danger {
  border-left-color: #dc3545;
  color: #dc3545 !important;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}
</style>
