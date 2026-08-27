<template>
  <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
    <div class="row g-3 justify-content-center">
      <!-- Teacher Name -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="nameInput"
            type="text"
            class="form-control"
            :class="{
              'is-invalid': !validationStates.name.valid && validationStates.name.touched,
              'is-valid': validationStates.name.valid,
            }"
            id="teacherName"
            v-model="formData.name"
            placeholder="Enter Teacher Name"
            @input="handleNameInput"
            @keydown="handleKeyDown($event, 'board')"
            required
          />
          <label for="teacherName">Teacher Name <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-if="!validationStates.name.valid && validationStates.name.touched"
          >
            {{ v$.name.$errors[0]?.$message ?? VALIDATION_MESSAGES.NAME.INVALID }}
          </div>
        </div>
      </div>

      <!-- Board Selection -->
      <div class="col col-12 col-sm-10 col-md-8">
        <SearchableDropdown
          id="board"
          label="Board"
          required
          placeholder="Search Board"
          :items="boards"
          :model-value="selectedBoard"
          :class="{
            'is-invalid':
              !validationStates.boardId.valid &&
              validationStates.boardId.touched,
            'is-valid': validationStates.boardId.valid && validationStates.boardId.touched,
          }"
          :disabled="false"
          next-field-id="school"
          @update:model-value="handleBoardChange"
          @change="handleBoardChange"
        />
        <div
          class="invalid-feedback"
          v-show="
            !validationStates.boardId.valid &&
            validationStates.boardId.touched
          "
        >
          {{ VALIDATION_MESSAGES.BOARD.REQUIRED }}
        </div>
      </div>

      <!-- School Selection -->
      <div class="col col-12 col-sm-10 col-md-8">
        <SearchableDropdown
          id="school"
          label="School"
          required
          placeholder="Search School"
          :items="schools"
          :model-value="selectedSchool"
          :class="{
            'is-invalid':
              !validationStates.schoolId.valid &&
              validationStates.schoolId.touched,
            'is-valid': validationStates.schoolId.valid && validationStates.schoolId.touched,
          }"
          :disabled="!formData.boardId"
          next-field-id="emailId"
          @update:model-value="handleSchoolChange"
          @change="handleSchoolChange"
        >
          <template #item="{ item }">
            {{ item.name }}
          </template>
        </SearchableDropdown>
        <div
          class="invalid-feedback"
          v-show="
            !validationStates.schoolId.valid &&
            validationStates.schoolId.touched
          "
        >
          {{
            !formData.boardId
              ? VALIDATION_MESSAGES.SCHOOL.SELECT_BOARD_FIRST
              : formData.boardId && schools.length === 0
                ? VALIDATION_MESSAGES.SCHOOL.NO_SCHOOLS
                : VALIDATION_MESSAGES.SCHOOL.REQUIRED
          }}
        </div>
      </div>

      <!-- Email -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="emailInput"
            type="email"
            class="form-control"
            :class="{
              'is-valid': validationStates.emailId.valid && validationStates.emailId.touched,
              'is-invalid': !validationStates.emailId.valid && validationStates.emailId.touched,
            }"
            id="emailId"
            v-model="formData.emailId"
            placeholder="Enter Email"
            @input="handleEmailInput"
            @blur="handleEmailBlur"
            @keydown="handleKeyDown($event, 'contactNumber')"
            required
          />
          <label for="emailId">Email <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-if="!validationStates.emailId.valid && validationStates.emailId.touched"
          >
            {{ emailErrorMessage }}
          </div>
        </div>
      </div>

      <!-- Contact Number -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="contactInput"
            type="tel"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.contactNumber.valid && validationStates.contactNumber.touched,
              'is-valid':
                validationStates.contactNumber.valid && formData.contactNumber.trim().length > 0,
            }"
            id="contactNumber"
            v-model="formData.contactNumber"
            placeholder="Contact Number"
            @input="handleContactInput"
            @keydown="handleKeyDown($event, 'alternateContactNumber')"
            required
          />
          <label for="contactNumber">Contact Number <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-if="!validationStates.contactNumber.valid && validationStates.contactNumber.touched"
          >
            {{ VALIDATION_MESSAGES.CONTACT.INVALID }}
          </div>
        </div>
      </div>

      <!-- Alternate Contact Number -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="alternateContactInput"
            type="tel"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.alternateContactNumber.valid &&
                validationStates.alternateContactNumber.touched &&
                (formData.alternateContactNumber?.trim().length ?? 0) > 0,
              'is-valid':
                validationStates.alternateContactNumber.valid &&
                (formData.alternateContactNumber?.trim().length ?? 0) > 0,
            }"
            id="alternateContactNumber"
            v-model="formData.alternateContactNumber"
            placeholder="Alternate Contact Number"
            @input="handleAlternateContactInput"
            @keydown="handleKeyDown($event, 'highestQualification')"
          />
          <label for="alternateContactNumber">Alternate Contact Number (Optional)</label>
          <div
            class="invalid-feedback"
            v-if="
              !validationStates.alternateContactNumber.valid &&
              validationStates.alternateContactNumber.touched
            "
          >
            {{ VALIDATION_MESSAGES.CONTACT.INVALID }}
          </div>
        </div>
      </div>

      <!-- Highest Qualification -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="qualificationInput"
            type="text"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.highestQualification.valid &&
                validationStates.highestQualification.touched,
              'is-valid':
                validationStates.highestQualification.valid &&
                validationStates.highestQualification.touched,
            }"
            id="highestQualification"
            v-model="formData.highestQualification"
            placeholder="Highest Qualification"
            @input="handleQualificationInput"
            @keydown="handleKeyDown($event, 'standardSelect')"
            required
          />
          <label for="highestQualification"
            >Highest Qualification <span class="text-danger">*</span></label
          >
          <div
            class="invalid-feedback"
            v-if="
              !validationStates.highestQualification.valid &&
              validationStates.highestQualification.touched
            "
          >
            {{ VALIDATION_MESSAGES.QUALIFICATION.MIN_LENGTH }}
          </div>
        </div>
      </div>

      <!-- Standard Selection -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <select
            ref="standardSelect"
            class="form-select"
            id="standardSelect"
            v-model="selectedStandard"
            @change="handleStandardSelect"
            :disabled="!formData.schoolId"
          >
            <option value="">
              {{ !formData.schoolId ? 'Select school first' : 'Select Standard' }}
            </option>
            <option v-for="standard in standards" :key="standard.id" :value="standard">
              {{ standard.name }}
            </option>
          </select>
          <label for="standardSelect">Standard</label>
        </div>
      </div>

      <!-- Standards & Subjects List -->
      <div
        v-if="formData.groupedSubjects && formData.groupedSubjects.length > 0"
        class="col col-12 col-sm-10 col-md-8 mt-4"
      >
        <h5 class="mb-3">Standards & Subjects</h5>
        <ul class="list-group">
          <li
            v-for="standard in formData.groupedSubjects"
            :key="standard.standardId"
            class="list-group-item mb-2"
          >
            <div class="d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold">Standard {{ standard.standardName }}</span>
                <button
                  type="button"
                  class="btn btn-custom"
                  @click="removeStandardSubjects(standard.standardId)"
                >
                  Remove
                </button>
              </div>
              <div class="ps-3 d-flex flex-wrap gap-2">
                <span
                  v-for="subject in standard.subjects"
                  :key="subject.id"
                  class="subject-badge"
                >
                  <i class="bi bi-book me-1"></i>
                  {{ subject.name }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Subject Selection Modal -->
      <div
        class="modal fade"
        id="subjectSelectModal"
        tabindex="-1"
        aria-labelledby="subjectSelectModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title" id="subjectSelectModalLabel">
                Select Subjects for Standard {{ selectedStandard?.name ?? '' }}
              </h4>
            </div>
            <div class="modal-body">
              <div id="subjectSelectContainer" class="p-3 border rounded">
                <div v-if="availableSubjects.length === 0" class="text-center text-muted py-3">
                  This standard doesn't have any subjects
                </div>
                <div
                  v-else
                  v-for="subject in availableSubjects"
                  :key="subject.id"
                  class="form-check mb-2"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'subject' + subject.id"
                    :value="subject.id"
                    v-model="selectedSubjects"
                    @keydown.enter.prevent="toggleSubject(subject.id)"
                    @keydown.space.prevent="toggleSubject(subject.id)"
                  />
                  <label class="form-check-label fs-5" :for="'subject' + subject.id">
                    {{ subject.name }}
                  </label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-light"
                style="border: 1px solid gray"
                @click="closeSubjectModal"
              >
                Close
              </button>
              <button
                type="button"
                class="btn btn-success"
                @click="addSubjects"
                :disabled="availableSubjects.length === 0"
              >
                Add Subjects
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" class="btn btn-dark" @click="handleConfirm" :disabled="false">
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="text-center mt-3">
        <button type="submit" class="btn btn-dark" :disabled="isSubmitting">
          <output v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></output>
          {{ isSubmitting ? 'Submitting...' : isEditMode ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email, helpers } from '@vuelidate/validators'
import type { TeacherFormData } from '@/models/Teacher'
import axiosInstance from '@/config/axios'
import { Modal } from 'bootstrap'
import { useRoute } from 'vue-router'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import { validateContactNumber, formatContactNumber, formatContactNumberForAPI, VALIDATION_MESSAGES } from '@/utils/validationConstants'

// Props and Emits
const props = defineProps<{
  initialData?: TeacherFormData
}>()

// Define emits with proper types
const emit = defineEmits<(
  event: 'submit',
  data: {
    formData: TeacherFormData
    changes: Array<{
      type: string
      message: string
    }>
  }
) => void>()

// Add route import and setup
const route = useRoute()
const isEditMode = computed(() => route.name === 'editTeacher')

// Utility functions
const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Validation States
const validationStates = reactive({
  name: { touched: false, valid: false },
  boardId: { touched: false, valid: false },
  emailId: { touched: false, valid: false },
  contactNumber: { touched: false, valid: false },
  alternateContactNumber: { touched: false, valid: false },
  highestQualification: { touched: false, valid: false },
  schoolId: { touched: false, valid: false },
  teacherSubjects: { touched: false, valid: false },
})

// State
const schools = ref<Array<{ id: number; name: string }>>([])
const selectedSchool = ref<{ id: number; name: string } | null>(null)
const selectedStandard = ref<{ id: number; name: string } | null>(null)
const selectedSubjects = ref<number[]>([])
const standards = ref<
  Array<{
    id: number
    name: string
    standard: {
      id: number
      name: string
    }
  }>
>([])
const availableSubjects = ref<
  Array<{
    id: number
    name: string
    schoolStandardId: number
  }>
>([])
const isSubmitting = ref(false)
const selectedSchoolBoard = ref<{ id: number; name: string } | null>(null)
const schoolStandards = ref<
  Array<{
    id: number // This is the school_standard_id
    standard_id: number
    school_id: number
    standard: {
      id: number
      name: string
    }
  }>
>([])
const subjectModal = ref<Modal | null>(null)
const saveConfirmationModal = ref<Modal | null>(null)

// Add after the FormDataType interface
interface Change {
  type: 'add' | 'modify' | 'delete'
  message: string
}

// Add after other refs
const changes = ref<Change[]>([])

// Add this with other refs
const initialSchoolId = ref<number | null>(null)

// Form Data with proper types for validation
interface FormDataType {
  name: string
  boardId: number
  schoolId: number
  emailId: string
  contactNumber: string
  alternateContactNumber: string
  highestQualification: string
  teacherSubjects: TeacherSubject[]
  userId?: number
  groupedSubjects?: Array<{
    standardId: number
    standardName: string
    subjects: Array<{
      id: number
      name: string
    }>
  }>
  schoolStandards?: Array<{
    id: number
    name: string
    standard: {
      id: number
      name: string
    }
  }>
}

// Form Data
const formData = reactive<FormDataType>({
  name: '',
  boardId: 0,
  schoolId: 0,
  emailId: '',
  contactNumber: '',
  alternateContactNumber: '',
  highestQualification: '',
  teacherSubjects: [],
})

// Validation Rules
const rules = {
  name: {
    required: helpers.withMessage(VALIDATION_MESSAGES.NAME.REQUIRED, required),
    minLength: helpers.withMessage(
      VALIDATION_MESSAGES.NAME.MIN_LENGTH,
      (value: string) => value.length >= 3,
    ),
    validName: helpers.withMessage(VALIDATION_MESSAGES.NAME.INVALID_CHARS, (value: string) =>
      /^[a-zA-Z\s]*$/.test(value),
    ),
  },
  boardId: {
    required: helpers.withMessage(VALIDATION_MESSAGES.BOARD.REQUIRED, required),
    validBoard: helpers.withMessage(VALIDATION_MESSAGES.BOARD.INVALID, (value: number) => {
      return value !== 0 && value !== undefined && value !== null;
    }),
  },
  schoolId: {
    required: helpers.withMessage(VALIDATION_MESSAGES.SCHOOL.REQUIRED, required),
    validSchool: helpers.withMessage(
      VALIDATION_MESSAGES.SCHOOL.INVALID,
      (value: number) => value !== 0,
    ),
  },
  emailId: {
    required: helpers.withMessage(VALIDATION_MESSAGES.EMAIL.REQUIRED, required),
    email: helpers.withMessage(VALIDATION_MESSAGES.EMAIL.INVALID, email),
    validEmail: helpers.withMessage(VALIDATION_MESSAGES.EMAIL.INVALID, (value: string) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    ),
  },
  contactNumber: {
    required: helpers.withMessage(VALIDATION_MESSAGES.CONTACT.REQUIRED, required),
    valid: helpers.withMessage(VALIDATION_MESSAGES.CONTACT.INVALID, (value: string) =>
      validateContactNumber(value),
    ),
  },
  alternateContactNumber: {
    valid: helpers.withMessage(
      VALIDATION_MESSAGES.CONTACT.INVALID,
      (value: string) => !value || validateContactNumber(value),
    ),
    notSame: helpers.withMessage(
      VALIDATION_MESSAGES.CONTACT.DUPLICATE,
      (value: string) => !value || value !== formData.contactNumber,
    ),
  },
  highestQualification: {
    required: helpers.withMessage(VALIDATION_MESSAGES.QUALIFICATION.REQUIRED, required),
    minLength: helpers.withMessage(
      VALIDATION_MESSAGES.QUALIFICATION.MIN_LENGTH,
      (value: string) => value.length >= 2,
    ),
  },
  teacherSubjects: {
    required: helpers.withMessage(
      VALIDATION_MESSAGES.TEACHER_SUBJECTS.REQUIRED,
      (value: TeacherSubject[]) => value.length > 0,
    ),
  },
}

const v$ = useVuelidate(rules, formData)

// Add these refs for input elements
const nameInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)
const contactInput = ref<HTMLInputElement | null>(null)
const alternateContactInput = ref<HTMLInputElement | null>(null)
const qualificationInput = ref<HTMLInputElement | null>(null)
const standardSelect = ref<HTMLSelectElement | null>(null)

// Add keyboard navigation function
const handleKeyDown = (event: KeyboardEvent, nextField: string) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const nextElement = document.getElementById(nextField)
    if (nextElement) {
      nextElement.focus()
      if (nextElement instanceof HTMLInputElement) {
        nextElement.select()
      }
    }
  }
}

// Watch for initialData changes
watch(
  () => props.initialData,
  async (newData) => {
    if (newData) {
      // Store the initial school ID
      initialSchoolId.value = newData.schoolId

      // First fetch school details to get board information
      if (newData.schoolId) {
        try {
          const { data: schoolData } = await axiosInstance.get(`/schools/${newData.schoolId}`)

          // Update form data first, but preserve the board ID we're about to set
          const boardId = schoolData.board.id
          Object.assign(formData, newData)
          formData.boardId = boardId // Ensure boardId is set correctly

          // Fetch boards and set board object
          await fetchBoards()
          const board = boards.value.find((b) => b.id === boardId)
          if (board) {
            selectedBoard.value = board
            validationStates.boardId.valid = true
            validationStates.boardId.touched = true
          }

          // Set school
          selectedSchool.value = {
            id: schoolData.id,
            name: schoolData.name
          }
          validationStates.schoolId.valid = true
          validationStates.schoolId.touched = true

          // Store board info for later use
          selectedSchoolBoard.value = { id: boardId, name: schoolData.board.name }

          // Fetch schools for this board
          await fetchSchools()

          // Fetch standards for this school
          const { data: schoolStandardsData } = await axiosInstance.get(
            `/school-standards/school/${newData.schoolId}`,
          )

          // Store the complete school standards data
          schoolStandards.value = schoolStandardsData.map((item: { 
            id: number; 
            school_id: number; 
            standard: { 
              id: number; 
              name: string; 
            } 
          }) => ({
            id: item.id,
            standard_id: item.standard.id,
            school_id: item.school_id,
            standard: item.standard
          }))

          // Map the response to get standard details for display
          standards.value = schoolStandardsData.map(
            (item: { id: number; school_id: number; standard: { id: number; name: string } }) => ({
              id: item.standard.id, // Use standard.id as the id
              name: item.standard.name,
              standard: item.standard,
            }),
          )
        } catch {
          // Error handling
        }
      } else {
        // If no schoolId, just update form data
        Object.assign(formData, newData)
      }

      // First mark all fields as touched
      for (const key of Object.keys(validationStates)) {
        validationStates[key as keyof typeof validationStates].touched = true
      }

      // Then validate each field and store results
      const nameValid = newData.name.length >= 3 && /^[a-zA-Z\s]*$/.test(newData.name)
      const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newData.emailId)
      const contactValid = validateContactNumber(newData.contactNumber)
      const alternateContactValid =
        !newData.alternateContactNumber ||
        (validateContactNumber(newData.alternateContactNumber) &&
          newData.alternateContactNumber !== newData.contactNumber)
      const qualificationValid = newData.highestQualification.length >= 2
      const schoolValid = newData.schoolId !== 0
      const boardValid = formData.boardId !== 0

      // Update all validation states at once
      validationStates.name.valid = nameValid
      validationStates.emailId.valid = emailValid
      validationStates.contactNumber.valid = contactValid
      validationStates.alternateContactNumber.valid = alternateContactValid
      validationStates.highestQualification.valid = qualificationValid
      validationStates.schoolId.valid = schoolValid
      validationStates.boardId.valid = boardValid

      // Trigger vuelidate validation
      v$.value.$touch()
    }
  },
  { immediate: true },
)

// Add watch for form data changes
watch(
  formData,
  (newData) => {
    // Update validation states based on current values
    validationStates.name.valid = newData.name.length >= 3 && /^[a-zA-Z\s]*$/.test(newData.name)
    validationStates.emailId.valid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      newData.emailId,
    )
    validationStates.contactNumber.valid = validateContactNumber(newData.contactNumber)
    validationStates.alternateContactNumber.valid =
      !newData.alternateContactNumber ||
      (validateContactNumber(newData.alternateContactNumber) &&
        newData.alternateContactNumber !== newData.contactNumber)
    validationStates.highestQualification.valid = newData.highestQualification.length >= 2
    validationStates.schoolId.valid = newData.schoolId !== 0
  },
  { deep: true },
)

// API calls
async function fetchSchools() {
  try {
    if (!formData.boardId) {
      schools.value = []
      return
    }

    const response = await axiosInstance.get(`/schools?boardId=${formData.boardId}`)
    // Extract schools from the data wrapper if it exists
    schools.value = response.data.data || response.data

    // If we have initial data, set the selected school after schools are loaded
    if (props.initialData?.schoolId) {
      const school = schools.value.find((s) => s.id === props.initialData?.schoolId)
      if (school) {
        selectedSchool.value = school
        validationStates.schoolId.valid = true
        validationStates.schoolId.touched = true
      }
    }
  } catch {
    // Error handling for fetching schools
  }
}

// Form submission
// Helper functions for form submission process
const updateBoardValidation = async () => {
  if (!selectedBoard.value) return
  
  formData.boardId = selectedBoard.value.id
  validationStates.boardId.valid = true
  validationStates.boardId.touched = true
  v$.value.boardId.$model = selectedBoard.value.id
  v$.value.boardId.$touch()

  // If we have a selected board but no school selected, fetch schools
  if (!formData.schoolId) {
    await fetchSchools()
  }
}

const validateTeacherSubjects = () => {
  if (formData.teacherSubjects.length === 0) {
    validationStates.teacherSubjects.valid = false
    const standardSelect = document.getElementById('standardSelect')
    if (standardSelect) {
      standardSelect.scrollIntoView({ behavior: 'smooth', block: 'center' })
      standardSelect.focus()
    }
    return false
  }
  return true
}

const updateSchoolBoardValidation = () => {
  if (!selectedSchoolBoard.value) return
  
  formData.boardId = selectedSchoolBoard.value.id
  validationStates.boardId.valid = true
  v$.value.boardId.$model = selectedSchoolBoard.value.id
}

const tryFixingBoardValidation = async () => {
  if (!v$.value.boardId.$error || !selectedBoard.value) return false
  
  // Force update the model and validation state
  formData.boardId = selectedBoard.value.id
  v$.value.boardId.$model = selectedBoard.value.id
  v$.value.boardId.$touch()
  
  // Try validation again
  return await v$.value.$validate()
}

const handleValidationSuccess = async () => {
  if (isEditMode.value) {
    await calculateChanges()
    saveConfirmationModal.value?.show()
  } else {
    // Format contact numbers for API submission
    const formDataForAPI = {
      name: formData.name,
      emailId: formData.emailId,
      contactNumber: formatContactNumberForAPI(formData.contactNumber),
      alternateContactNumber: formData.alternateContactNumber 
        ? formatContactNumberForAPI(formData.alternateContactNumber)
        : '',
      highestQualification: formData.highestQualification,
      schoolId: formData.schoolId,
      boardId: formData.boardId,
      teacherSubjects: formData.teacherSubjects,
      groupedSubjects: formData.groupedSubjects,
    }

    emit('submit', {
      formData: formDataForAPI,
      changes: [],
    })
  }
}

const handleValidationFailure = () => {
  // Define the order of fields to check (matching the actual input IDs)
  const fieldOrder = [
    { id: 'teacherName', key: 'name' },
    { id: 'board', key: 'boardId' },
    { id: 'school', key: 'schoolId' },
    { id: 'emailId', key: 'emailId' },
    { id: 'contactNumber', key: 'contactNumber' },
    { id: 'highestQualification', key: 'highestQualification' },
  ]

  // Find the first invalid field based on our preferred order
  const firstInvalidField = fieldOrder.find((field) => {
    const validationField = v$.value[field.key]
    return validationField?.$error
  })

  // Focus the first invalid field
  if (firstInvalidField) {
    const element = document.getElementById(firstInvalidField.id)
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

const handleSubmit = async () => {
  // Update board validation state
  await updateBoardValidation()

  // Mark all fields as touched to show validation errors
  for (const key of Object.keys(validationStates)) {
    validationStates[key as keyof typeof validationStates].touched = true
  }

  // Validate teacher subjects
  if (!validateTeacherSubjects()) return

  // Update school board validation
  updateSchoolBoardValidation()

  // Trigger validation
  const isValid = await v$.value.$validate()

  if (!isValid) {
    // Try to fix board validation issues
    const retryValid = await tryFixingBoardValidation()
    
    if (retryValid) {
      await handleValidationSuccess()
      return
    }
    
    handleValidationFailure()
    return
  }

  // Handle successful validation
  await handleValidationSuccess()
}

// Add new functions for change tracking
const calculateChanges = async () => {
  changes.value = []

  if (!props.initialData) {
    handleNewTeacherSubjects()
    return
  }

  checkBasicInfoChanges()
  checkSchoolChange()
  checkStandardChanges()
}

// Helper function to track new teacher subjects
const handleNewTeacherSubjects = () => {
  for (const standard of formData.groupedSubjects ?? []) {
    for (const subject of standard.subjects) {
      changes.value.push({
        type: 'add',
        message: `Added "${subject.name}" to Standard ${standard.standardName}`,
      })
    }
  }
}

// Helper function to check for changes in basic teacher information
const checkBasicInfoChanges = () => {
  // Check name change
  if (formData.name !== props.initialData!.name) {
    changes.value.push({
      type: 'modify',
      message: `Name: ${props.initialData!.name} → ${formData.name}`,
    })
  }

  // Check email change
  if (formData.emailId !== props.initialData!.emailId) {
    changes.value.push({
      type: 'modify',
      message: `Email: ${props.initialData!.emailId} → ${formData.emailId}`,
    })
  }

  // Check contact number change
  if (formData.contactNumber !== props.initialData!.contactNumber) {
    changes.value.push({
      type: 'modify',
      message: `Contact Number: ${props.initialData!.contactNumber} → ${formData.contactNumber}`,
    })
  }

  // Check alternate contact number change
  if (formData.alternateContactNumber !== props.initialData!.alternateContactNumber) {
    changes.value.push({
      type: 'modify',
      message: `Alternate Contact: ${props.initialData!.alternateContactNumber ?? 'None'} → ${
        formData.alternateContactNumber ?? 'None'
      }`,
    })
  }

  // Check qualification change
  if (formData.highestQualification !== props.initialData!.highestQualification) {
    changes.value.push({
      type: 'modify',
      message: `Qualification: ${props.initialData!.highestQualification} → ${formData.highestQualification}`,
    })
  }
}

// Helper function to check for school change
const checkSchoolChange = () => {
  if (formData.schoolId !== props.initialData!.schoolId) {
    const oldSchool = schools.value.find((s) => s.id === props.initialData?.schoolId)
    const newSchool = schools.value.find((s) => s.id === formData.schoolId)
    changes.value.push({
      type: 'modify',
      message: `School: ${oldSchool?.name ?? ''} → ${newSchool?.name ?? ''}`,
    })
  }
}

// Helper function to check for standard and subject changes
const checkStandardChanges = () => {
  const initialStandards = props.initialData!.groupedSubjects ?? []
  const currentStandards = formData.groupedSubjects ?? []

  checkRemovedStandards(initialStandards, currentStandards)
  checkNewStandards(initialStandards, currentStandards)
  checkModifiedStandards(initialStandards, currentStandards)
}

// Define proper interfaces for standards and subjects
interface Standard {
  standardId: number
  standardName: string
  subjects: Subject[]
}

interface Subject {
  id: number
  name: string
}

// Helper function to check for completely removed standards
const checkRemovedStandards = (initialStandards: Standard[], currentStandards: Standard[]) => {
  for (const standard of initialStandards) {
    const standardExists = currentStandards.some((s) => s.standardId === standard.standardId)
    
    if (!standardExists) {
      for (const subject of standard.subjects) {
        changes.value.push({
          type: 'delete',
          message: `Removed "${subject.name}" from Standard ${standard.standardName}`,
        })
      }
    }
  }
}

// Helper function to check for completely new standards
const checkNewStandards = (initialStandards: Standard[], currentStandards: Standard[]) => {
  for (const standard of currentStandards) {
    const standardIsNew = !initialStandards.some((s) => s.standardId === standard.standardId)
    
    if (standardIsNew) {
      for (const subject of standard.subjects) {
        changes.value.push({
          type: 'add',
          message: `Added "${subject.name}" to Standard ${standard.standardName}`,
        })
      }
    }
  }
}

// Helper function to check for modified standards (added/removed subjects)
const checkModifiedStandards = (initialStandards: Standard[], currentStandards: Standard[]) => {
  for (const currentStandard of currentStandards) {
    const initialStandard = initialStandards.find(
      (s) => s.standardId === currentStandard.standardId
    )
    
    if (initialStandard) {
      checkAddedSubjects(currentStandard, initialStandard)
      checkRemovedSubjects(currentStandard, initialStandard)
    }
  }
}

// Helper function to check for added subjects within a standard
const checkAddedSubjects = (currentStandard: Standard, initialStandard: Standard) => {
  for (const subject of currentStandard.subjects) {
    const subjectExists = initialStandard.subjects.some((s: Subject) => s.id === subject.id)
    
    if (!subjectExists) {
      changes.value.push({
        type: 'add',
        message: `Added "${subject.name}" to Standard ${currentStandard.standardName}`,
      })
    }
  }
}

// Helper function to check for removed subjects within a standard
const checkRemovedSubjects = (currentStandard: Standard, initialStandard: Standard) => {
  for (const subject of initialStandard.subjects) {
    const subjectStillExists = currentStandard.subjects.some((s: Subject) => s.id === subject.id)
    
    if (!subjectStillExists) {
      changes.value.push({
        type: 'delete',
        message: `Removed "${subject.name}" from Standard ${currentStandard.standardName}`,
      })
    }
  }
}

const handleConfirm = async () => {
  try {
    isSubmitting.value = true

    // Get the updated teacher data from the form with formatted contact numbers
    const teacherData = {
      name: formData.name,
      emailId: formData.emailId,
      contactNumber: formatContactNumberForAPI(formData.contactNumber),
      alternateContactNumber: formData.alternateContactNumber 
        ? formatContactNumberForAPI(formData.alternateContactNumber)
        : '',
      highestQualification: formData.highestQualification,
      schoolId: formData.schoolId,
      boardId: formData.boardId,
      teacherSubjects: formData.teacherSubjects,
      userId: formData.userId,
    }

    // Emit the form data
    emit('submit', {
      formData: {
        ...teacherData,
        groupedSubjects: formData.groupedSubjects,
      },
      changes: changes.value,
    })

    // Close modal
    saveConfirmationModal.value?.hide()
  } catch {
    // Error handling
    alert('Failed to update teacher information. Please try again.')
  }
}

// Handle standard selection
const handleStandardSelect = async () => {
  if (!selectedStandard.value || !formData.schoolId) {
    return
  }

  try {
    const standard = selectedStandard.value

    // Find the corresponding school standard
    const schoolStandard = schoolStandards.value.find((ss) => {
      return ss.standard_id === standard.id
    })

    if (!schoolStandard) {
      throw new Error('School standard not found')
    }

    const schoolStandardId = schoolStandard.id

    // Fetch subjects using the API endpoint
    const { data: subjects } = await axiosInstance.get(
      `/subjects/school-standard?school_id=${formData.schoolId}&standard_id=${standard.id}`,
    )

    // Create unique list of subjects
    const uniqueSubjects = new Map()
    for (const subject of subjects as { id: number; name: string }[]) {
      if (!uniqueSubjects.has(subject.id)) {
        uniqueSubjects.set(subject.id, {
          id: subject.id,
          name: subject.name,
          schoolStandardId: schoolStandardId,
          standardName: standard.name,
          subjectId: subject.id, // The subject.id is now directly the subject ID
        })
      }
    }

    availableSubjects.value = Array.from(uniqueSubjects.values())

    // Reset selected subjects
    selectedSubjects.value = []

    // Pre-select already selected subjects for this standard
    if (formData.groupedSubjects) {
      const existingStandardSubjects = formData.groupedSubjects.find(
        (gs) => gs.standardId === standard.id,
      )
      if (existingStandardSubjects) {
        // Pre-select subjects that are already selected
        selectedSubjects.value = existingStandardSubjects.subjects.map((s) => s.id)
      }
    }

    // Show modal even if there are no subjects
    subjectModal.value?.show()
    // Focus the first checkbox after modal is shown (if there are subjects)
    setTimeout(() => {
      const firstCheckbox = document.querySelector(
        '#subjectSelectContainer .form-check-input',
      ) as HTMLElement
      if (firstCheckbox) {
        firstCheckbox.focus()
      }
    }, 500)
  } catch {
    // Error handling for fetching subjects
  }
}

// Close modal and reset selections
const closeSubjectModal = () => {
  subjectModal.value?.hide()
  selectedSubjects.value = []
}

// Add subjects to teacher subjects
const addSubjects = () => {
  if (!selectedStandard.value) {
    return
  }

  const schoolStandard = schoolStandards.value.find(
    (ss) => ss.standard_id === selectedStandard.value?.id,
  )

  if (!schoolStandard) {
    return
  }

  const schoolStandardId = schoolStandard.id

  // Keep existing pairs for other standards
  const otherStandardsPairs = formData.teacherSubjects.filter(
    (subject) => subject.schoolStandardId !== schoolStandardId,
  )

  // Create new pairs for selected subjects using the subject ID directly
  const newPairs = selectedSubjects.value.map((selectedId) => {
    return {
      schoolStandardId,
      mediumStandardSubjectId: selectedId, // This is now the actual subject ID from the API
    }
  })

  // Update form data with combined pairs
  formData.teacherSubjects = [...otherStandardsPairs, ...newPairs]

  // Get selected subjects with their full information
  const selectedSubjectsInfo = selectedSubjects.value.map((subjectId) => {
    const subject = availableSubjects.value.find((s) => s.id === subjectId)
    return {
      id: subjectId, // Use the subject ID directly
      name: subject?.name ?? 'Unknown Subject',
    }
  })

  // Remove existing standard from groupedSubjects if it exists
  const otherStandards = (formData.groupedSubjects ?? []).filter(
    (group) => group.standardId !== selectedStandard.value?.standard.id,
  )

  // Add new standard with selected subjects only if there are subjects selected
  if (selectedSubjectsInfo.length > 0) {
    const newGroupedSubjects = [
      ...otherStandards,
      {
        standardId: selectedStandard.value.standard.id,
        standardName: selectedStandard.value.name,
        subjects: selectedSubjectsInfo,
      },
    ]
    formData.groupedSubjects = newGroupedSubjects
  } else {
    formData.groupedSubjects = otherStandards
  }

  // After updating formData.teacherSubjects and formData.groupedSubjects
  // Update validation state
  validationStates.teacherSubjects.touched = true
  validationStates.teacherSubjects.valid = formData.teacherSubjects.length > 0
  v$.value.teacherSubjects.$touch()

  closeSubjectModal()
  
  // Reset the selected standard to prepare for next selection
  selectedStandard.value = null
}

interface TeacherSubject {
  id?: number // Make id optional since new assignments won't have an id yet
  schoolStandardId: number
  mediumStandardSubjectId: number
}

const removeStandardSubjects = (standardId: number) => {
  if (!formData.teacherSubjects || !formData.groupedSubjects) return

  // Find the standard info before removing
  const standardInfo = formData.groupedSubjects.find((group) => group.standardId === standardId)

  if (standardInfo) {
    // Remove from teacherSubjects
    formData.teacherSubjects = formData.teacherSubjects.filter((subject: TeacherSubject) => {
      const schoolStandard = schoolStandards.value.find((ss) => ss.standard.id === standardId)
      return subject.schoolStandardId !== schoolStandard?.id
    })

    // Remove from groupedSubjects
    formData.groupedSubjects = formData.groupedSubjects.filter(
      (group) => group.standardId !== standardId,
    )
  }

  // After removing subjects, update validation state
  validationStates.teacherSubjects.touched = true
  validationStates.teacherSubjects.valid = formData.teacherSubjects.length > 0
  v$.value.teacherSubjects.$touch()
}

// Update input handlers to only set touched state and trigger validation
const handleInput = (field: keyof typeof validationStates, value: string) => {
  if (
    field === 'name' ||
    field === 'emailId' ||
    field === 'contactNumber' ||
    field === 'alternateContactNumber' ||
    field === 'highestQualification'
  ) {
    formData[field] = value
  }
  validationStates[field].touched = true
  v$.value[field].$touch()
}

const handleNameInput = (e: Event) => {
  const value = capitalizeWords((e.target as HTMLInputElement).value)
  handleInput('name', value)

  // Trigger validation immediately
  validationStates.name.touched = true
  validationStates.name.valid = value.length >= 3 && /^[a-zA-Z\s]*$/.test(value)
  v$.value.name.$touch()
}

// Add this with other reactive variables
const emailErrorMessage = ref('')

const handleEmailInput = async (e: Event) => {
  const value = (e.target as HTMLInputElement).value.trim()
  handleInput('emailId', value)

  // Basic email format validation
  validationStates.emailId.touched = true
  const isValidFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)

  if (isValidFormat && value) {
    try {
      // Skip uniqueness check if we're in edit mode and the email hasn't changed
      if (isEditMode.value && props.initialData?.emailId === value) {
        validationStates.emailId.valid = true
        emailErrorMessage.value = ''
        return
      }

      // Use the dedicated API endpoint to check email availability
      const { data } = await axiosInstance.get(`/users/check-email/${encodeURIComponent(value)}`)
      
      // The response structure is: { email, available, message }
      const isAvailable = data.available === true
      
      validationStates.emailId.valid = isAvailable
      emailErrorMessage.value = isAvailable ? '' : data.message ?? 'This email is already in use'
    } catch {
      // Error handling for email check
      // If there's an error checking, we'll just validate the format
      validationStates.emailId.valid = isValidFormat
      emailErrorMessage.value = ''
    }
  } else {
    validationStates.emailId.valid = false
    emailErrorMessage.value = VALIDATION_MESSAGES.EMAIL.REQUIRED
    v$.value.emailId.$touch()
    return
  }

  v$.value.emailId.$touch()
}

// Handle email validation when user leaves the email field
const handleEmailBlur = async () => {
  const value = formData.emailId.trim()
  validationStates.emailId.touched = true
  
  if (!value) {
    validationStates.emailId.valid = false
    emailErrorMessage.value = VALIDATION_MESSAGES.EMAIL.REQUIRED
    v$.value.emailId.$touch()
    return
  }
  
  const isValidFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
  
  if (!isValidFormat) {
    validationStates.emailId.valid = false
    emailErrorMessage.value = VALIDATION_MESSAGES.EMAIL.INVALID
    v$.value.emailId.$touch()
    return
  }
  
  try {
    // Skip uniqueness check if we're in edit mode and the email hasn't changed
    if (isEditMode.value && props.initialData?.emailId === value) {
      validationStates.emailId.valid = true
      emailErrorMessage.value = ''
      return
    }

    // Use the dedicated API endpoint to check email availability
    const { data } = await axiosInstance.get(`/users/check-email/${encodeURIComponent(value)}`)
    
    // The response structure is: { email, available, message }
    const isAvailable = data.available === true
    
    validationStates.emailId.valid = isAvailable
    emailErrorMessage.value = isAvailable ? '' : data.message ?? 'This email is already in use'
  } catch {
    // Error handling for email availability check
    // If there's an error checking, we'll just validate the format
    validationStates.emailId.valid = isValidFormat
    emailErrorMessage.value = ''
  }
  
  v$.value.emailId.$touch()
}

const handleContactInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  const formattedValue = formatContactNumber(value)
  if (formattedValue.length <= 16) {
    // +91 + 10 digits = 13, allow up to 16 for other formats
    formData.contactNumber = formattedValue
    validationStates.contactNumber.touched = true
    validationStates.contactNumber.valid = validateContactNumber(formattedValue)
    v$.value.contactNumber.$touch()
  }
}

const handleAlternateContactInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  const formattedValue = formatContactNumber(value)
  if (formattedValue.length <= 16) {
    formData.alternateContactNumber = formattedValue
    validationStates.alternateContactNumber.touched = true
    validationStates.alternateContactNumber.valid =
      !formattedValue ||
      (validateContactNumber(formattedValue) && formattedValue !== formData.contactNumber)
    v$.value.alternateContactNumber.$touch()
  }
}

const handleQualificationInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  formData.highestQualification = target.value
  v$.value.highestQualification.$touch()
}

// Add these functions in the script section
const toggleSubject = (subjectId: number) => {
  const index = selectedSubjects.value.indexOf(subjectId)
  if (index === -1) {
    selectedSubjects.value.push(subjectId)
  } else {
    selectedSubjects.value.splice(index, 1)
  }
}

// Change these board-related state variables
const boards = ref<Array<{ id: number; name: string }>>([])
const selectedBoard = ref<{ id: number; name: string } | null>(null)

// Initialize modal on mount
onMounted(() => {
  fetchBoards()
    .then(() => {
      if (formData.boardId) {
        return fetchSchools()
      }
    })
    .catch(() => {
      // Error handling for initial data fetch
    })

  const modalElement = document.getElementById('subjectSelectModal')
  if (modalElement) {
    subjectModal.value = new Modal(modalElement)
  } else {
    // Modal element not found
  }

  // Initialize save confirmation modal
  const saveModalElement = document.getElementById('saveConfirmationModal')
  if (saveModalElement) {
    saveConfirmationModal.value = new Modal(saveModalElement)
  } else {
    // Save modal element not found
  }

  // Initialize validation states
  for (const key of Object.keys(validationStates)) {
    validationStates[key as keyof typeof validationStates].touched = false
    validationStates[key as keyof typeof validationStates].valid = false
  }
})

// Modify fetchBoards to set selectedBoard when loading initial data
async function fetchBoards() {
  try {
    const response = await axiosInstance.get('/boards')
    // Extract boards from the data wrapper
    boards.value = response.data.data

    // If we have initial data, set the selected board after boards are loaded
    if (props.initialData?.boardId) {
      const board = boards.value.find((b) => b.id === props.initialData?.boardId)
      if (board) {
        selectedBoard.value = board
        validationStates.boardId.valid = true
        validationStates.boardId.touched = true
      }
    }
  } catch {
    // Error handling for fetching boards
  }
}

// Replace selectSchool with handleSchoolChange
const handleSchoolChange = async (school: { id: number; name: string } | null) => {
  if (!school) {
    // Handle school deselection
    formData.schoolId = 0
    validationStates.schoolId.valid = false
    v$.value.schoolId.$model = 0
    
    // Reset standards
    standards.value = []
    selectedStandard.value = null
    formData.teacherSubjects = []
    
    // Update validation
    v$.value.schoolId.$touch()
    v$.value.$touch()
    return
  }

  // Store selected school
  selectedSchool.value = school
  
  // Update formData with selected school ID
  formData.schoolId = school.id
  v$.value.schoolId.$model = school.id

  // Reset standards
  selectedStandard.value = null

  // Validate school selection
  validationStates.schoolId.touched = true
  validationStates.schoolId.valid = true

  // Force validation update
  v$.value.schoolId.$touch()
  v$.value.$touch()

  // Fetch standards for this school
  try {
    const { data: schoolStandardsData } = await axiosInstance.get(
      `/school-standards/school/${school.id}`,
    )

    // Store the complete school standards data
    schoolStandards.value = schoolStandardsData.map((item: {
      id: number;
      school_id: number;
      standard: {
        id: number;
        name: string;
      }
    }) => ({
      id: item.id,
      standard_id: item.standard.id,
      school_id: item.school_id,
      standard: item.standard
    }))

    // Map the response to get standard details for display
    standards.value = schoolStandardsData.map(
      (item: { id: number; school_id: number; standard: { id: number; name: string } }) => ({
        id: item.standard.id, // Use standard.id as the id
        name: item.standard.name,
        standard: item.standard,
      }),
    )
  } catch {
    // Error handling for fetching school standards
    standards.value = []
  }
}

// Replace selectBoard with handleBoardChange
const handleBoardChange = async (board: { id: number; name: string } | null) => {
  if (!board) {
    // Handle board deselection
    formData.boardId = 0
    validationStates.boardId.valid = false
    v$.value.boardId.$model = 0
    
    // Reset school and standard related fields
    formData.schoolId = 0
    schools.value = []
    validationStates.schoolId.valid = false
    validationStates.schoolId.touched = false

    // Reset standard selection
    selectedStandard.value = null
    standards.value = []
    
    // Update validation
    v$.value.boardId.$touch()
    v$.value.$touch()
    return
  }

  // Store selected board
  selectedBoard.value = board
  
  // Update formData with selected board ID
  formData.boardId = board.id
  v$.value.boardId.$model = board.id

  // Reset school and standard related fields
  formData.schoolId = 0
  schools.value = []
  validationStates.schoolId.valid = false
  validationStates.schoolId.touched = false

  // Reset standard selection
  selectedStandard.value = null
  standards.value = []

  // Validate board selection
  validationStates.boardId.touched = true
  validationStates.boardId.valid = true

  // Force validation update
  v$.value.boardId.$touch()
  v$.value.$touch()

  // Fetch schools for selected board
  await fetchSchools()

  // Focus school field after selection
  const schoolInputElement = document.getElementById('school')
  if (schoolInputElement) {
    schoolInputElement.focus()
  }
}
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

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}

.btn-outline-danger {
  border: 1px solid #dc3545;
  background-color: transparent;
  color: #dc3545;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

@media (max-width: 576px) {
  .btn-outline-danger {
    background-color: #dc3545;
    color: white;
  }
}

/* Desktop styles */
@media (min-width: 577px) {
  .btn-custom {
    border: 1px solid gray !important;
    background-color: #f8f9fa;
    color: black;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn-custom:hover {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545 !important;
    color: white !important;
  }
}

/* Mobile styles */
@media (max-width: 576px) {
  .btn-custom {
    background-color: #dc3545 !important;
    color: white !important;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
}

.list-group-item {
  border-radius: 0.375rem;
  border: 1px solid rgba(0, 0, 0, 0.175);
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item .btn-custom {
  min-width: 80px;
}

/* Add style for disabled Add Subjects button */
.btn-success:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Replace with enhanced styling */
.subject-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin: 0.25rem;
  border-radius: 2rem;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.subject-badge:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.subject-badge i {
  margin-right: 0.5rem;
  color: #6c757d;
}
</style>
