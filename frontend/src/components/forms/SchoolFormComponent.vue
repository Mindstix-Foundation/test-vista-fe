<template>
  <BaseFormLayout 
    :title="isEditMode ? 'Edit School' : 'Add New School'" 
    :is-submitting="isSubmitting"
    @submit="onSubmit"
    @close="goBack"
  >
    <!-- School Details Section -->
    <div class="col-12 col-sm-10 col-md-8 mb-3">
      <div class="row g-3">
        <div class="col-12">
          <FormInput
            id="schoolName"
            label="School Name"
            type="text"
            :model-value="form.name"
            :is-valid="validationStates.name.valid"
            :is-touched="validationStates.name.touched"
            :required="true"
            :error-message="VALIDATION_MESSAGES.NAME.REQUIRED"
            next-field-id="boardName"
            :format-value="capitalizeWords"
            @update:model-value="(value) => { form.name = value }"
            @input="(e) => { 
              validationStates.name.valid = (e.target as HTMLInputElement).value.trim().length > 0;
              validationStates.name.touched = true;
            }"
          />
        </div>
        <div class="col-12">
          <SearchableDropdown
            id="boardName"
            label="Board"
            placeholder="Search Board"
            :items="boards"
            v-model="selectedBoard"
            :disabled="isEditMode"
            required
            nextFieldId="country"
            :class="{
              'is-invalid': !validationStates.board.valid && validationStates.board.touched,
              'is-valid': validationStates.board.valid,
            }"
            @change="handleBoardChange"
          />
          <div class="invalid-feedback" v-if="!validationStates.board.valid && validationStates.board.touched">
            {{ VALIDATION_MESSAGES.BOARD.REQUIRED }}
          </div>
        </div>
      </div>
    </div>

    <!-- Address Section -->
    <AddressFieldset
      title="School"
      v-model="form.address"
      v-model:validationStates="addressValidationStates"
      @country-change="onCountryChange"
      @state-change="onStateChange"
      @city-change="onCityChange"
      class="mb-3"
    />

    <!-- Principal's Information -->
    <fieldset class="border p-3 rounded col-12 col-sm-10 col-md-8 mb-3">
      <legend class="float-none w-auto px-2">Principal's Information</legend>
      <div class="row g-3">
        <div class="col-12">
          <FormInput
            id="principalName"
            label="Principal's Name"
            type="text"
            :model-value="form.principal_name"
            :is-valid="validationStates.principalName.valid"
            :is-touched="validationStates.principalName.touched"
            :required="true"
            :error-message="VALIDATION_MESSAGES.NAME.INVALID"
            next-field-id="contactNo1"
            :format-value="capitalizeWords"
            @update:model-value="(value) => { form.principal_name = value }"
            @input="(e) => { 
              validationStates.principalName.valid = validatePrincipalName((e.target as HTMLInputElement).value);
              validationStates.principalName.touched = true;
            }"
          />
        </div>

        <div class="col-12">
          <FormInput
            id="contactNo1"
            label="Contact Number"
            type="tel"
            :model-value="form.contact_number"
            :is-valid="validationStates.contactNumber.valid"
            :is-touched="validationStates.contactNumber.touched"
            :required="true"
            :error-message="VALIDATION_MESSAGES.CONTACT.INVALID"
            next-field-id="contactNo2"
            :format-value="formatContactNumber"
            @update:model-value="(value) => { form.contact_number = value }"
            @input="(e) => {
              const value = (e.target as HTMLInputElement).value;
              validationStates.contactNumber.valid = validateContactNumber(value);
              validationStates.contactNumber.touched = true;
              // Also validate alternate contact if needed
              if (form.alternate_contact_number) {
                const isSameAsPrimary = form.alternate_contact_number === value && value !== '';
                validationStates.alternateContactNumber.valid = validateContactNumber(form.alternate_contact_number) && !isSameAsPrimary;
              }
            }"
          />
        </div>

        <div class="col-12">
          <FormInput
            id="contactNo2"
            label="Alternate Contact Number (Optional)"
            type="tel"
            :model-value="form.alternate_contact_number"
            :is-valid="validationStates.alternateContactNumber.valid"
            :is-touched="validationStates.alternateContactNumber.touched"
            :required="false"
            :error-message="VALIDATION_MESSAGES.CONTACT.DIFFERENT"
            next-field-id="email"
            :format-value="formatContactNumber"
            @update:model-value="(value) => { form.alternate_contact_number = value }"
            @input="(e) => {
              const value = (e.target as HTMLInputElement).value;
              if (value) {
                // Check if alternate contact number is the same as primary contact number
                const isSameAsPrimary = value === form.contact_number && value !== '';
                validationStates.alternateContactNumber.valid = validateContactNumber(value) && !isSameAsPrimary;
              } else {
                validationStates.alternateContactNumber.valid = true; // Empty is valid for alternate
              }
              validationStates.alternateContactNumber.touched = true;
            }"
          />
        </div>

        <div class="col-12">
          <FormInput
            id="email"
            label="Email"
            type="email"
            :model-value="form.email"
            :is-valid="validationStates.email.valid"
            :is-touched="validationStates.email.touched"
            :required="true"
            :error-message="VALIDATION_MESSAGES.EMAIL.INVALID"
            next-field-id="medium0"
            @update:model-value="(value) => { form.email = value }"
            @input="(e) => {
              validationStates.email.valid = validateEmail((e.target as HTMLInputElement).value);
              validationStates.email.touched = true;
            }"
          />
        </div>
      </div>
    </fieldset>

    <!-- Mediums and Standards -->
    <div class="col-12 col-sm-10 col-md-8 mb-3">
      <div class="row g-3">
        <!-- Mediums -->
        <div class="col-12 col-md-6">
          <fieldset class="border p-3 rounded h-100">
            <legend class="float-none w-auto px-2">
              Mediums Offered <span class="text-danger">*</span>
            </legend>
            <div
              class="form-check"
              :class="{
                'is-invalid':
                  !validationStates.mediums.valid && validationStates.mediums.touched,
              }"
              v-for="medium in availableMediums"
              :key="medium.id"
            >
              <input
                type="checkbox"
                class="form-check-input"
                :id="'medium' + medium.id"
                v-model="form.mediums"
                :value="medium.id"
                @change="
                  () => {
                    validationStates.mediums.touched = true
                    validationStates.mediums.valid = form.mediums.length > 0
                  }
                "
                @keydown="(e) => handleCheckboxKeydown(e, 'medium', medium.id)"
                tabindex="0"
              />
              <label class="form-check-label" :for="'medium' + medium.id">
                {{ medium.name }}
              </label>
            </div>
            <div v-if="availableMediums.length === 0" class="text-muted">
              Please select a board to view available mediums
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="!validationStates.mediums.valid && validationStates.mediums.touched"
            >
              {{ VALIDATION_MESSAGES.MEDIUM.REQUIRED }}
            </div>
          </fieldset>
        </div>

        <!-- Standards -->
        <div class="col-12 col-md-6">
          <fieldset class="border p-3 rounded h-100">
            <legend class="float-none w-auto px-2">
              Standards Offered <span class="text-danger">*</span>
            </legend>
            <div
              class="form-check"
              :class="{
                'is-invalid':
                  !validationStates.standards.valid && validationStates.standards.touched,
              }"
              v-for="standard in availableStandards"
              :key="standard.id"
            >
              <input
                type="checkbox"
                class="form-check-input"
                :id="'standard' + standard.id"
                v-model="form.standards"
                :value="standard.id"
                @change="
                  () => {
                    validationStates.standards.touched = true
                    validationStates.standards.valid = form.standards.length > 0
                  }
                "
                @keydown="(e) => handleCheckboxKeydown(e, 'standard', standard.id)"
                tabindex="0"
              />
              <label class="form-check-label" :for="'standard' + standard.id">
                {{ standard.name }}
              </label>
            </div>
            <div v-if="availableStandards.length === 0" class="text-muted">
              Please select a board to view available standards
            </div>
            <div
              class="invalid-feedback d-block"
              v-if="!validationStates.standards.valid && validationStates.standards.touched"
            >
              {{ VALIDATION_MESSAGES.STANDARD.REQUIRED }}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </BaseFormLayout>

  <!-- Save Confirmation Modal -->
  <div
    class="modal fade"
    id="saveConfirmationModal"
    tabindex="-1"
    aria-labelledby="saveConfirmationModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="saveConfirmationModalLabel">Confirm Changes</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to save the following changes?</p>

          <div v-if="changes.length === 0" class="text-muted">No changes detected.</div>

          <div v-else>
            <ul class="list-group">
              <li
                v-for="(change, index) in changes"
                :key="index"
                class="list-group-item"
                :class="{
                  'list-group-item-danger': change.type === 'delete',
                  'list-group-item-warning': change.type === 'modify',
                  'list-group-item-success': change.type === 'add',
                }"
              >
                <i
                  :class="{
                    'bi bi-trash': change.type === 'delete',
                    'bi bi-pencil': change.type === 'modify',
                    'bi bi-plus-circle': change.type === 'add',
                  }"
                  class="me-2"
                ></i>
                {{ change.message }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button
            type="button"
            class="btn btn-dark"
            @click="confirmAndSubmit"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import necessary dependencies and types
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SchoolFormData, SchoolValidationStates } from '@/models/School'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import AddressFieldset from '@/components/common/AddressFieldset.vue'
import FormInput from '@/components/common/FormInput.vue'
import BaseFormLayout from '@/components/common/BaseFormLayout.vue'
import { validateContactNumber, formatContactNumber, validateEmail, formatContactNumberForAPI, VALIDATION_MESSAGES } from '@/utils/validationConstants'

// Update interfaces based on Prisma schema
interface Country {
  id: number
  name: string
}

interface State {
  id: number
  country_id: number
  name: string
}

interface City {
  id: number
  state_id: number
  name: string
}

interface Board {
  id: number
  name: string
  abbreviation: string
  address_id: number
}

// Add interfaces for the API responses
interface SchoolMediumResponse {
  id?: number
  instruction_medium_id?: number
  instruction_medium?: {
    id: number
    name: string
  }
  name?: string
}

interface SchoolStandardResponse {
  id?: number
  standard_id?: number
  standard?: {
    id: number
    name: string
  }
  name?: string
}

// Define props
const props = defineProps<{
  isEditMode: boolean
  schoolId?: string
  initialData?: SchoolFormData | null
  isLoading?: boolean
}>()

const router = useRouter()
const isSubmitting = ref(false)
const availableMediums = ref<{ id: number; name: string }[]>([])
const availableStandards = ref<{ id: number; name: string; sequence_number: number }[]>([])
const boards = ref<Board[]>([])

// Update capitalizeFirstLetter to handle multiple words
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Update validation states initialization
const validationStates = ref<SchoolValidationStates>({
  name: { valid: false, touched: false },
  board: { valid: false, touched: false },
  country: { valid: false, touched: false },
  state: { valid: false, touched: false },
  city: { valid: false, touched: false },
  address: { valid: false, touched: false },
  postalCode: { valid: false, touched: false },
  principalName: { valid: false, touched: false },
  email: { valid: false, touched: false },
  contactNumber: { valid: false, touched: false },
  alternateContactNumber: { valid: true, touched: false },
  mediums: { valid: false, touched: false },
  standards: { valid: false, touched: false },
})

// Update form data handling
const form = ref<SchoolFormData>({
  name: '',
  board_id: 0,
  address_id: 0,
  principal_name: '',
  email: '',
  contact_number: '',
  alternate_contact_number: '',
  address: {
    street: '',
    postal_code: '',
    city_id: 0,
    state_id: 0,
    country_id: 0,
  },
  mediums: [],
  standards: [],
})

// Add refs for selected items and data
const selectedBoard = ref<Board | null>(null)
const selectedCountry = ref<Country | null>(null)
const selectedState = ref<State | null>(null)
const selectedCity = ref<City | null>(null)

// Add refs for tracking previous selections
const previousSelections = ref(
  new Map<
    number,
    {
      mediums: number[]
      standards: number[]
    }
  >(),
)

// Add ref for tracking the previous board ID
const previousBoardId = ref<number | null>(null)

// Add a separate validation object for address fields
const addressValidationStates = ref({
  country: { valid: false, touched: false },
  state: { valid: false, touched: false },
  city: { valid: false, touched: false },
  address: { valid: false, touched: false },
  postalCode: { valid: false, touched: false },
})

// Update event handlers to handle SearchableDropdown component
const handleBoardChange = async (board: Board | null) => {
  if (!board) {
    form.value.board_id = 0
    // Clear mediums and standards when board is cleared
    availableMediums.value = []
    availableStandards.value = []
    form.value.mediums = []
    form.value.standards = []
    validationStates.value.board.valid = false
    return
  }

  console.log('Selected board:', board)

  // Store current selections if we have a previous board
  if (form.value.board_id && form.value.board_id !== board.id) {
    previousSelections.value.set(form.value.board_id, {
      mediums: [...form.value.mediums],
      standards: [...form.value.standards],
    })
  }

  // Store the previous board ID
  previousBoardId.value = form.value.board_id

  // Update board selection
  form.value.board_id = board.id
  validationStates.value.board.valid = true
  validationStates.value.board.touched = true

  try {
    console.log('Fetching board data for ID:', board.id)
    // Fetch board's available mediums and standards using the board endpoints
    const [{ data: mediums }, { data: standards }] = await Promise.all([
      axiosInstance.get(`/instruction-mediums/board/${board.id}`),
      axiosInstance.get(`/standards/board/${board.id}`),
    ])
    console.log('Fetched mediums:', mediums)
    console.log('Fetched standards:', standards)

    // Map the data to the required format
    availableMediums.value = mediums.map((m: { id: number; instruction_medium: string }) => ({
      id: m.id,
      name: m.instruction_medium,
    }))
    availableStandards.value = standards
      .map((s: { id: number; name: string; sequence_number: number }) => ({
        id: s.id,
        name: s.name,
        sequence_number: s.sequence_number
      }))
      .sort((a: { sequence_number: number }, b: { sequence_number: number }) => a.sequence_number - b.sequence_number)

    // Check if we're returning to a previous board
    const previousSelection = previousSelections.value.get(board.id)
    if (previousSelection) {
      // Restore previous selections
      form.value.mediums = previousSelection.mediums
      form.value.standards = previousSelection.standards
    } else {
      // Reset selections for new board
      form.value.mediums = []
      form.value.standards = []
    }

    validationStates.value.mediums.touched = false
    validationStates.value.standards.touched = false
  } catch (error) {
    console.error('Error in handleBoardChange:', error)
  }
}

// Add functions to fetch school mediums and standards
const fetchSchoolMediums = async (schoolId: number): Promise<SchoolMediumResponse[]> => {
  try {
    const url = `/school-instruction-mediums/school/${schoolId}`
    console.log('Fetching mediums from URL:', url)
    const { data } = await axiosInstance.get(url)
    console.log('Raw mediums data:', data)
    
    // Map the data to the required format
    const mappedData = data.map((m: { instruction_medium: { id: number; name: string } }) => ({
      id: m.instruction_medium.id,
      name: m.instruction_medium.name,
    }))
    console.log('Mapped mediums data:', mappedData)
    return mappedData
  } catch (error) {
    console.error('Error fetching school mediums:', error)
    return []
  }
}

const fetchSchoolStandards = async (schoolId: number): Promise<SchoolStandardResponse[]> => {
  try {
    const url = `/school-standards/school/${schoolId}`
    console.log('Fetching standards from URL:', url)
    const { data } = await axiosInstance.get(url)
    console.log('Raw standards data:', data)
    
    // Map the data to the required format
    const mappedData = data.map((s: { standard: { id: number; name: string; sequence_number: number } }) => ({
      id: s.standard.id,
      name: s.standard.name,
      sequence_number: s.standard.sequence_number
    }))
    .sort((a: { sequence_number: number }, b: { sequence_number: number }) => a.sequence_number - b.sequence_number)
    console.log('Mapped standards data:', mappedData)
    return mappedData
  } catch (error) {
    console.error('Error fetching school standards:', error)
    return []
  }
}

// Validation functions are now imported from @/utils/validationConstants

// Add principal name validation function
const validatePrincipalName = (name: string): boolean => {
  // Principal name should be at least 3 characters and contain only letters and spaces
  return /^[a-zA-Z\s]{3,}$/.test(name)
}

// Update isFormValid computed
const isFormValid = computed(() => {
  console.log('🔍 isFormValid - Checking form validity...')
  console.log('Form values:', {
    name: form.value.name,
    board_id: form.value.board_id,
    address: form.value.address,
    principal_name: form.value.principal_name,
    contact_number: form.value.contact_number,
    email: form.value.email,
    mediums: form.value.mediums,
    standards: form.value.standards,
  })

  // 🛡️ FIX: Use the main validationStates instead of separate addressValidationStates
  const addressValid =
    validationStates.value.country.valid &&
    validationStates.value.state.valid &&
    validationStates.value.city.valid &&
    validationStates.value.address.valid &&
    validationStates.value.postalCode.valid

  const contactValid = validateContactNumber(form.value.contact_number)

  // Check if alternate contact is valid and not the same as primary contact
  const alternateContactValid = !form.value.alternate_contact_number ||
    (validateContactNumber(form.value.alternate_contact_number) &&
     form.value.alternate_contact_number !== form.value.contact_number)

  // Individual validation checks with debugging
  const checks = {
    name: form.value.name.trim() !== '',
    board_id: form.value.board_id !== 0,
    addressValid,
    principalName: validatePrincipalName(form.value.principal_name),
    contactValid,
    alternateContactValid,
    email: validateEmail(form.value.email),
    mediums: form.value.mediums.length > 0,
    standards: form.value.standards.length > 0
  }

  console.log('🔍 Individual validation checks:', checks)
  console.log('🔍 Contact validation details:', {
    primaryContact: form.value.contact_number,
    alternateContact: form.value.alternate_contact_number,
    contactValid: contactValid,
    alternateContactValid: alternateContactValid,
    alternateContactValidation: form.value.alternate_contact_number ? validateContactNumber(form.value.alternate_contact_number) : 'N/A',
    contactsAreDifferent: form.value.alternate_contact_number !== form.value.contact_number
  })
  console.log('🔍 Address validation breakdown:', {
    country: validationStates.value.country.valid,
    state: validationStates.value.state.valid,
    city: validationStates.value.city.valid,
    address: validationStates.value.address.valid,
    postalCode: validationStates.value.postalCode.valid,
    addressValid
  })

  const isValid = Object.values(checks).every(check => check === true)

  console.log('🔍 Form validity result:', isValid)
  console.log('🔍 Failed checks:', Object.entries(checks).filter(([key, value]) => !value))
  
  return isValid
})

// Watch for initialData changes and update form
watch(
  () => props.initialData,
  async (newData) => {
    console.log('Received initial data:', newData)
    if (newData) {
      // Update form with initial data
      form.value = {
        name: newData.name,
        board_id: newData.board_id,
        address_id: newData.address_id,
        principal_name: newData.principal_name,
        email: newData.email,
        contact_number: newData.contact_number,
        alternate_contact_number: newData.alternate_contact_number,
        mediums: newData.mediums,
        standards: newData.standards,
        address: {
          street: newData.address.street,
          postal_code: newData.address.postal_code,
          city_id: newData.address.city_id,
          state_id: newData.address.state_id,
          country_id: newData.address.country_id,
        },
      }

      // Update validation states
      for (const key of Object.keys(validationStates.value)) {
        const field = key as keyof SchoolValidationStates
        validationStates.value[field].valid = true
        validationStates.value[field].touched = true
      }

      // Fetch board details and update board search
      if (form.value.board_id) {
        try {
          const { data: board } = await axiosInstance.get(`/boards/${form.value.board_id}`)
          selectedBoard.value = board
          
          // Fetch available mediums and standards for the selected board
          const [{ data: mediums }, { data: standards }] = await Promise.all([
            axiosInstance.get(`/instruction-mediums/board/${form.value.board_id}`),
            axiosInstance.get(`/standards/board/${form.value.board_id}`),
          ])
          
          // Map the data to the required format
          availableMediums.value = mediums.map((m: { id: number; instruction_medium: string }) => ({
            id: m.id,
            name: m.instruction_medium,
          }))
          
          availableStandards.value = standards
            .map((s: { id: number; name: string; sequence_number: number }) => ({
              id: s.id,
              name: s.name,
              sequence_number: s.sequence_number
            }))
            .sort((a: { sequence_number: number }, b: { sequence_number: number }) => 
              a.sequence_number - b.sequence_number
            )
            
          console.log('Loaded available mediums:', availableMediums.value)
          console.log('Loaded available standards:', availableStandards.value)
        } catch (error) {
          console.error('Error fetching board details or mediums/standards:', error)
        }
      }

      // Update location selections
      await updateLocationSelections()
    }
  },
  { immediate: true, deep: true },
)

// Define emits with proper types
const emit = defineEmits({
  submit: (data) => {
    console.log('Default submit handler called with:', data)
    return true
  }
})

// Update interface for change tracking
interface Change {
  type: 'delete' | 'modify' | 'add'
  message: string
  entity: 'medium' | 'standard' | 'school' | 'separator'
  data: {
    id?: number
    name?: string
    old?: { id: number; name: string }
    new?: { id?: number; name: string }
  }
}

// Add ref for tracking changes
const changes = ref<Change[]>([])

// Helper functions for change tracking
const addChange = (change: Change) => {
  changes.value.push(change)
}

const handleNormalChanges = (
  currentMediums: SchoolMediumResponse[],
  currentStandards: SchoolStandardResponse[],
) => {
  const formMediums = form.value.mediums.filter((id) => id > 0)
  const formStandards = form.value.standards.filter((id) => id > 0)

  handleMediumChanges(currentMediums, formMediums)
  handleStandardChanges(currentStandards, formStandards)
}

const handleMediumChanges = (currentMediums: SchoolMediumResponse[], formMediums: number[]) => {
  // Handle deleted mediums
  for (const medium of currentMediums) {
    const mediumId = medium.instruction_medium_id ?? medium.id
    if (mediumId && !formMediums.includes(mediumId)) {
      // Find the medium name from availableMediums
      const mediumInfo = availableMediums.value.find((m) => m.id === mediumId)
      const mediumName = mediumInfo?.name ?? 'Unknown Medium'
      addChange({
        type: 'delete',
        message: `Remove medium: ${mediumName}`,
        entity: 'medium',
        data: { id: mediumId, name: mediumName },
      })
    }
  }

  // Handle added mediums
  for (const mediumId of formMediums) {
    const exists = currentMediums.some((m) => {
      const existingId = m.instruction_medium_id ?? m.id
      return existingId === mediumId
    })

    if (!exists) {
      const medium = availableMediums.value.find((m) => m.id === mediumId)
      if (medium) {
        addChange({
          type: 'add',
          message: `Add medium: ${medium.name}`,
          entity: 'medium',
          data: { id: medium.id, name: medium.name },
        })
      }
    }
  }
}

const handleStandardChanges = (
  currentStandards: SchoolStandardResponse[],
  formStandards: number[],
) => {
  // Handle deleted standards
  for (const standard of currentStandards) {
    const standardId = standard.standard_id ?? standard.id
    if (standardId && !formStandards.includes(standardId)) {
      const standardName = standard.standard?.name ?? standard.name
      addChange({
        type: 'delete',
        message: `Remove standard: ${standardName}`,
        entity: 'standard',
        data: { id: standardId, name: standardName },
      })
    }
  }

  // Handle added standards
  for (const standardId of formStandards) {
    const exists = currentStandards.some((s) => {
      const existingId = s.standard_id ?? s.id
      return existingId === standardId
    })

    if (!exists) {
      const standard = availableStandards.value.find((s) => s.id === standardId)
      if (standard) {
        addChange({
          type: 'add',
          message: `Add standard: ${standard.name}`,
          entity: 'standard',
          data: { id: standard.id, name: standard.name },
        })
      }
    }
  }
}

const handleBasicInfoChanges = (schoolId: number) => {
  if (!props.initialData) return

  if (form.value.name !== props.initialData.name) {
    addChange({
      type: 'modify',
      message: `Modify school name: ${props.initialData.name} → ${form.value.name}`,
      entity: 'school',
      data: {
        old: { id: schoolId, name: props.initialData.name },
        new: { name: form.value.name },
      },
    })
  }

  // Add other basic info changes here...
}

// Add function to handle board change in calculateChanges
const handleBoardChangeInEdit = (
  oldBoardId: number,
  newBoardId: number,
  currentMediums: SchoolMediumResponse[],
  currentStandards: SchoolStandardResponse[]
) => {
  // Find the board names
  const oldBoard = boards.value.find(b => b.id === oldBoardId)
  const newBoard = boards.value.find(b => b.id === newBoardId)
  
  if (oldBoard && newBoard) {
    addChange({
      type: 'modify',
      message: `Change board: ${oldBoard.name} → ${newBoard.name}`,
      entity: 'school',
      data: {
        old: { id: oldBoardId, name: oldBoard.name },
        new: { id: newBoardId, name: newBoard.name },
      },
    })
  }
  
  // When changing boards, all current mediums and standards will be removed
  for (const medium of currentMediums) {
    const mediumId = medium.instruction_medium_id ?? medium.id
    const mediumName = medium.instruction_medium?.name ?? medium.name ?? 'Unknown Medium'
    if (mediumId) {
      addChange({
        type: 'delete',
        message: `Remove medium: ${mediumName}`,
        entity: 'medium',
        data: { id: mediumId, name: mediumName },
      })
    }
  }
  
  for (const standard of currentStandards) {
    const standardId = standard.standard_id ?? standard.id
    const standardName = standard.standard?.name ?? standard.name ?? 'Unknown Standard'
    if (standardId) {
      addChange({
        type: 'delete',
        message: `Remove standard: ${standardName}`,
        entity: 'standard',
        data: { id: standardId, name: standardName },
      })
    }
  }
  
  // Add all new mediums
  for (const mediumId of form.value.mediums) {
    const medium = availableMediums.value.find(m => m.id === mediumId)
    if (medium) {
      addChange({
        type: 'add',
        message: `Add medium: ${medium.name}`,
        entity: 'medium',
        data: { id: medium.id, name: medium.name },
      })
    }
  }
  
  // Add all new standards
  for (const standardId of form.value.standards) {
    const standard = availableStandards.value.find(s => s.id === standardId)
    if (standard) {
      addChange({
        type: 'add',
        message: `Add standard: ${standard.name}`,
        entity: 'standard',
        data: { id: standard.id, name: standard.name },
      })
    }
  }
}

// Main calculateChanges function
const calculateChanges = async () => {
  changes.value = []

  if (!props.isEditMode || !props.schoolId) return

  const schoolId = Number.parseInt(props.schoolId, 10)
  const [currentMediums, currentStandards] = await Promise.all([
    fetchSchoolMediums(schoolId),
    fetchSchoolStandards(schoolId),
  ])

  if (props.initialData && form.value.board_id !== props.initialData.board_id) {
    // Handle board change
    handleBoardChangeInEdit(
      props.initialData.board_id,
      form.value.board_id,
      currentMediums,
      currentStandards,
    )
  } else {
    // Handle normal changes
    handleNormalChanges(currentMediums, currentStandards)
  }

  // Handle basic info changes
  handleBasicInfoChanges(schoolId)
}

// Update confirmAndSubmit to format contact numbers for API
const confirmAndSubmit = async () => {
  try {
    console.log('🔍 confirmAndSubmit called - starting submission process')
    isSubmitting.value = true

    if (props.isEditMode) {
      // Close the confirmation modal if in edit mode
      const modalElement = document.getElementById('saveConfirmationModal') as HTMLElement
      const modal = Modal.getInstance(modalElement)
      modal?.hide()

      // Remove backdrop manually
      for (const backdrop of document.querySelectorAll('.modal-backdrop')) backdrop.remove()

      // Remove modal-open class and inline styles from body
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('padding-right')
    }

    // Format contact numbers for API submission
    const formDataForAPI = {
      ...form.value,
      contact_number: formatContactNumberForAPI(form.value.contact_number),
      alternate_contact_number: form.value.alternate_contact_number 
        ? formatContactNumberForAPI(form.value.alternate_contact_number)
        : ''
    }

    console.log('🔍 About to emit submit event with data:', formDataForAPI)
    console.log('🔍 Changes detected:', changes.value)

    // Emit the formatted form data to the parent component
    emit('submit', formDataForAPI)
    
    console.log('🔍 Submit event emitted successfully')
  } catch (error) {
    console.error('❌ Error in confirmAndSubmit:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Navigation
const goBack = () => {
  resetForm()
  router.push('/admin/school')
}

// Add fetchBoards function
const fetchBoards = async () => {
  try {
    const { data } = await axiosInstance.get('/boards')
    // Handle both paginated and non-paginated response formats
    boards.value = data.data ?? data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

// Add onMounted hook to fetch boards when component mounts
onMounted(async () => {
  console.log('Component mounted')
  // Fetch initial data
  await fetchBoards()

  // Initialize addressValidationStates with values from validationStates
  addressValidationStates.value = {
    country: { ...validationStates.value.country },
    state: { ...validationStates.value.state },
    city: { ...validationStates.value.city },
    address: { ...validationStates.value.address },
    postalCode: { ...validationStates.value.postalCode },
  }

  // If in edit mode and we have initial data, load the locations
  if (props.isEditMode && props.initialData) {
    await updateLocationSelections()
  }
})

// Update function to initialize addressValidationStates
const updateLocationSelections = async () => {
  try {
    // Update validation states based on the form data
    addressValidationStates.value = {
      country: { 
        valid: form.value.address.country_id > 0, 
        touched: form.value.address.country_id > 0 
      },
      state: { 
        valid: form.value.address.state_id > 0, 
        touched: form.value.address.state_id > 0 
      },
      city: { 
        valid: form.value.address.city_id > 0, 
        touched: form.value.address.city_id > 0 
      },
      address: { 
        valid: form.value.address.street.trim().length >= 10, 
        touched: form.value.address.street.trim().length > 0 
      },
      postalCode: { 
        valid: form.value.address.postal_code.trim().length > 0, 
        touched: form.value.address.postal_code.trim().length > 0 
      },
    }
    
    // The AddressFieldset component will handle fetching and displaying countries, states, and cities
  } catch (error) {
    console.error('Error updating location selections:', error)
  }
}

const resetForm = () => {
  // Reset form fields
  form.value.name = ''
  form.value.board_id = 0
  form.value.address.street = ''
  form.value.address.postal_code = ''
  form.value.address.city_id = 0
  form.value.address.state_id = 0
  form.value.address.country_id = 0
  form.value.principal_name = ''
  form.value.email = ''
  form.value.contact_number = ''
  form.value.alternate_contact_number = ''
  form.value.mediums = []
  form.value.standards = []

  // Reset validation states
  validationStates.value.name.touched = false
  validationStates.value.board.touched = false
  validationStates.value.country.touched = false
  validationStates.value.state.touched = false
  validationStates.value.city.touched = false
  validationStates.value.address.touched = false
  validationStates.value.postalCode.touched = false
  validationStates.value.principalName.touched = false
  validationStates.value.email.touched = false
  validationStates.value.contactNumber.touched = false
  validationStates.value.mediums.touched = false
  validationStates.value.standards.touched = false

  // Reset address validation states
  addressValidationStates.value = {
    country: { valid: false, touched: false },
    state: { valid: false, touched: false },
    city: { valid: false, touched: false },
    address: { valid: false, touched: false },
    postalCode: { valid: false, touched: false },
  }

  // Reset selected items for dropdowns
  selectedBoard.value = null
  selectedCountry.value = null
  selectedState.value = null
  selectedCity.value = null

  // Reset board mediums and standards
  availableMediums.value = []
  availableStandards.value = []
}

const handleCheckboxKeydown = (event: KeyboardEvent, type: 'medium' | 'standard', id: number) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (type === 'medium') {
      const index = form.value.mediums.indexOf(id)
      if (index === -1) {
        form.value.mediums.push(id)
      } else {
        form.value.mediums.splice(index, 1)
      }
      validationStates.value.mediums.touched = true
      validationStates.value.mediums.valid = form.value.mediums.length > 0
    } else {
      const index = form.value.standards.indexOf(id)
      if (index === -1) {
        form.value.standards.push(id)
      } else {
        form.value.standards.splice(index, 1)
      }
      validationStates.value.standards.touched = true
      validationStates.value.standards.valid = form.value.standards.length > 0
    }
  }
}

// Rename handleSubmit to onSubmit for clarity
const onSubmit = async () => {
  console.log('🔍 onSubmit called - Form submission started')
  console.log('🔍 isEditMode:', props.isEditMode)
  console.log('🔍 Form data:', form.value)

  // Mark all fields as touched to trigger validation display
  for (const key of Object.keys(validationStates.value)) {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  }

  // Update validation states for mediums and standards
  validationStates.value.mediums.valid = form.value.mediums.length > 0
  validationStates.value.standards.valid = form.value.standards.length > 0

  console.log('🔍 Form validation states:', validationStates.value)
  console.log('🔍 isFormValid:', isFormValid.value)

  // Check if form is valid
  if (!isFormValid.value) {
    console.log('❌ Form validation failed', validationStates.value)
    const firstInvalidField = document.querySelector('.is-invalid') as HTMLElement
    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstInvalidField.focus()
    }
    return
  }

  console.log('✅ Form is valid, proceeding with submission')

  try {
    isSubmitting.value = true

    if (props.isEditMode) {
      console.log('🔍 Edit mode - calculating changes and showing modal')
      // Calculate changes and show confirmation modal only in edit mode
      await calculateChanges()
      console.log('🔍 Changes calculated:', changes.value)
      const modal = new Modal(document.getElementById('saveConfirmationModal') as HTMLElement)
      modal.show()
      console.log('🔍 Modal shown')
    } else {
      // In add mode, format contact numbers and submit the form
      const formDataForAPI = {
        ...form.value,
        contact_number: formatContactNumberForAPI(form.value.contact_number),
        alternate_contact_number: form.value.alternate_contact_number 
          ? formatContactNumberForAPI(form.value.alternate_contact_number)
          : ''
      }
      console.log('🔍 Add mode - submitting formatted form data:', formDataForAPI)
      emit('submit', formDataForAPI)
      console.log('🔍 Submit event emitted in add mode')
    }
  } catch (error) {
    console.error('❌ Error in form submission:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Handlers for AddressFieldset component events
const onCountryChange = (country: { id: number; name: string } | null) => {
  console.log('Country changed:', country)
  if (country) {
    selectedCountry.value = country
  } else {
    selectedCountry.value = null
  }
}

const onStateChange = (state: { id: number; name: string } | null) => {
  console.log('State changed:', state)
  if (state) {
    selectedState.value = state
  } else {
    selectedState.value = null
  }
}

const onCityChange = (city: { id: number; name: string } | null) => {
  console.log('City changed:', city)
  if (city) {
    selectedCity.value = city
  } else {
    selectedCity.value = null
  }
}

// Watch for changes in addressValidationStates to sync with main validationStates
watch(
  addressValidationStates,
  (newVal) => {
    console.log('🔄 Syncing addressValidationStates to validationStates:', newVal)
    validationStates.value.country = newVal.country
    validationStates.value.state = newVal.state
    validationStates.value.city = newVal.city
    validationStates.value.address = newVal.address
    validationStates.value.postalCode = newVal.postalCode
    console.log('✅ Synced validationStates:', {
      country: validationStates.value.country,
      state: validationStates.value.state,
      city: validationStates.value.city,
      address: validationStates.value.address,
      postalCode: validationStates.value.postalCode
    })
  },
  { deep: true }
)
</script>

<style scoped>
/* Main container styles */
.container-fluid {
  min-height: 100%;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  padding: 1rem;
}

/* Form styles */
form {
  min-height: min-content;
  height: auto;
}

/* Ensure content is properly spaced */
.row {
  margin-bottom: 1rem;
}

/* Ensure dropdowns don't cause horizontal scrolling */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  width: 100%;
}

.dropdown-menu.show {
  display: block !important;
}

.dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: block;
  color: #212529;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #212529;
}

.dropdown-item.active {
  background-color: #212529;
  color: white;
}

/* Form select styles */
.form-select {
  appearance: auto;
  background-image: none;
  padding-right: 2rem;
}

.form-select option {
  padding: 8px;
}

.form-floating > .form-select {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}

/* Scrollbar styles for dropdowns */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Specific dropdown styles */
#country + .dropdown-menu .dropdown-item.active,
#state + .dropdown-menu .dropdown-item.active,
#city + .dropdown-menu .dropdown-item.active,
#boardName + .dropdown-menu .dropdown-item.active {
  background-color: #212529;
  color: white;
}

#country + .dropdown-menu .dropdown-item:hover,
#state + .dropdown-menu .dropdown-item.hover,
#city + .dropdown-menu .dropdown-item:hover,
#boardName + .dropdown-menu .dropdown-item:hover {
  background-color: #f8f9fa;
  color: #212529;
}

/* Custom breakpoint for when text might overflow */
@media (max-width: 1200px) {
  .col-12 {
    margin-bottom: 0.5rem;
  }

  .col-12:last-child {
    margin-bottom: 0;
  }

  .row + .row {
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .form-floating > .form-control,
  .form-floating > .form-select {
    height: calc(3rem + 2px);
    font-size: 0.9rem;
  }

  .form-floating > label {
    font-size: 0.9rem;
  }
}
</style>
