<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <div class="row g-3 justify-content-center">
      <div v-if="disabled" class="col-12 col-sm-10 col-md-8">
        <div class="alert alert-warning">
          Cannot add more sections as it would exceed the total pattern marks.
        </div>
      </div>
      <!-- Section Header -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div
          class="input-group"
          :class="{ 'is-invalid': showSectionHeaderError, 'is-valid': isSectionHeaderValid }"
        >
          <!-- Question Number -->
          <div class="form-floating" style="width: 10%">
            <input
              ref="questionNumberInput"
              type="number"
              class="form-control"
              :class="{
                'is-invalid': validationStates.sectionHeader.allTouched && !isQuestionNumberValid,
                'is-valid': isQuestionNumberValid && validationStates.sectionHeader.allTouched,
              }"
              id="floatingQueNum"
              placeholder="Question Number"
              v-model="formData.questionNumber"
              @input="handleSectionHeaderInput"
              @blur="handleSectionHeaderBlur"
              min="1"
              step="1"
              required
            />
            <label for="floatingQueNum">Q.</label>
            <div class="invalid-feedback">{{ VALIDATION_MESSAGES.SECTION.QUESTION_NUMBER }}</div>
          </div>

          <!-- Sub Question -->
          <div class="form-floating" style="width: 10%">
            <input
              ref="subQuestionInput"
              type="text"
              class="form-control"
              :class="{
                'is-invalid': validationStates.sectionHeader.allTouched && !isSubQuestionValid,
                'is-valid': isSubQuestionValid && validationStates.sectionHeader.allTouched,
              }"
              id="floatingSubQue"
              placeholder="Sub Question"
              v-model="formData.subQuestion"
              @input="handleSectionHeaderInput"
              @blur="handleSectionHeaderBlur"
            />
            <label for="floatingSubQue">Sub Q.</label>
            <div class="invalid-feedback">{{ VALIDATION_MESSAGES.SECTION.SUB_QUESTION }}</div>
          </div>

          <!-- Section Name -->
          <div class="form-floating" style="width: 80%">
            <input
              ref="sectionNameInput"
              type="text"
              class="form-control"
              :class="{
                'is-invalid': validationStates.sectionHeader.allTouched && !isSectionNameValid,
                'is-valid': isSectionNameValid && validationStates.sectionHeader.allTouched,
              }"
              id="floatingSection"
              placeholder="Section Name"
              v-model="formData.sectionName"
              @input="handleSectionNameInput"
              @blur="handleSectionHeaderBlur"
              required
            />
            <label for="floatingSection">Section Name / Main Question</label>
            <div class="invalid-feedback">{{ VALIDATION_MESSAGES.SECTION.NAME }}</div>
          </div>
          <div class="invalid-feedback">{{ VALIDATION_MESSAGES.SECTION.HEADER_FIELDS }}</div>
        </div>
      </div>

      <!-- Question Details -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="d-flex flex-column flex-sm-row gap-3">
          <!-- Total Questions -->
          <div class="flex-grow-1">
            <div class="form-floating">
              <input
                ref="totalQuestionsInput"
                type="number"
                class="form-control"
                :class="{
                  'is-invalid':
                    validationStates.totalQuestions.touched &&
                    !validationStates.totalQuestions.valid,
                }"
                id="totalQuestion"
                placeholder="Total Number of Question"
                v-model="formData.totalQuestions"
                @input="handleTotalQuestionsInput"
                min="0"
                required
              />
              <label for="totalQuestion">Total Questions</label>
              <div class="invalid-feedback">{{ VALIDATION_MESSAGES.SECTION.TOTAL_QUESTIONS }}</div>
            </div>
          </div>

          <!-- Required Questions -->
          <div class="flex-grow-1">
            <div class="form-floating">
              <input
                ref="requiredQuestionsInput"
                type="number"
                class="form-control"
                :class="{
                  'is-invalid':
                    validationStates.requiredQuestions.touched &&
                    !validationStates.requiredQuestions.valid,
                }"
                id="requiredQuestion"
                placeholder="Required Question"
                v-model="formData.requiredQuestions"
                @input="handleRequiredQuestionsInput"
                min="0"
                required
              />
              <label for="requiredQuestion">Mandatory Question</label>
              <div class="invalid-feedback">{{ VALIDATION_MESSAGES.SECTION.REQUIRED_QUESTIONS }}</div>
            </div>
          </div>

          <!-- Marks per Question -->
          <div class="flex-grow-1">
            <div class="form-floating">
              <input
                ref="marksPerQuestionInput"
                type="number"
                class="form-control"
                :class="{
                  'is-invalid':
                    validationStates.marksPerQuestion.touched &&
                    !validationStates.marksPerQuestion.valid,
                }"
                id="marksPerQuestion"
                placeholder="Marks per Question"
                v-model="formData.marksPerQuestion"
                @input="handleMarksPerQuestionInput"
                min="0"
                required
              />
              <label for="marksPerQuestion">Marks per Question</label>
              <div class="invalid-feedback">
                {{
                  formData.marksPerQuestion === ''
                    ? VALIDATION_MESSAGES.SECTION.MARKS_PER_QUESTION
                    : Number(formData.marksPerQuestion) <= 0
                      ? VALIDATION_MESSAGES.SECTION.MARKS_GREATER_THAN_ZERO
                      : `Total section marks (${Number(formData.requiredQuestions) * Number(formData.marksPerQuestion)}) exceeds the available marks (${availableMarks}). Please enter a smaller value.`
                }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Marks Display -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="d-flex justify-content-center align-items-center">
          <div class="d-flex align-items-center gap-4">
            <div class="d-flex align-items-center">
              <label for="sectionMarks" class="me-2 mb-0">Section Marks:</label>
              <input
                type="text"
                readonly
                class="form-control-plaintext text-center fs-5"
                id="sectionMarks"
                :value="sectionMarks"
                style="width: 40px"
              />
            </div>
            <div class="d-flex align-items-center">
              <label for="remainingMarks" class="me-2 mb-0">Remaining Marks:</label>
              <input
                type="text"
                readonly
                class="form-control-plaintext text-center fs-5"
                :class="{ 'text-danger': currentRemainingMarks < 0 }"
                id="remainingMarks"
                :value="currentRemainingMarks"
                style="width: 40px"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Question Type Selection -->
      <fieldset class="border p-2 rounded col col-12 col-sm-10 col-md-8" :disabled="disabled">
        <legend class="float-none w-auto">Select Question Type &nbsp;</legend>

        <div class="row g-2 justify-content-center">
          <!-- Same Type Checkbox (board patterns only) -->
          <div v-if="!forceExamSameType" class="col col-12 mb-3 ms-5">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="sameType"
                v-model="formData.sameType"
              />
              <label class="form-check-label" for="sameType">
                All questions are of the same type.
              </label>
            </div>
          </div>

          <!-- Locked MCQ for Online MCQ exam patterns -->
          <div v-if="questionTypeLocked" class="col col-12">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control bg-light"
                id="lockedQuestionType"
                :value="MCQ_TYPE_NAME"
                readonly
                tabindex="-1"
              />
              <label for="lockedQuestionType">Question Type</label>
            </div>
          </div>

          <!-- Single Question Type Input (when sameType is true) -->
          <div class="col col-12" v-else-if="formData.sameType">
            <div class="input-group mb-3">
              <span class="input-group-text">#</span>
              <SearchableDropdown
                id="questionType"
                label="Question Type"
                placeholder="Search for Question Type"
                :items="availableQuestionTypes"
                v-model="selectedQuestionType"
                :search-keys="['type_name']"
                label-key="type_name"
                :next-field-id="'saveButton'"
                :class="{
                  'is-invalid':
                    !validationStates.questionType.valid && validationStates.questionType.touched,
                  'is-valid':
                    validationStates.questionType.valid && validationStates.questionType.touched,
                }"
                required
                @update:modelValue="handleQuestionTypeInput"
              />
              <div class="invalid-feedback">Please select a question type</div>
            </div>
          </div>

          <!-- Multiple Question Type Inputs (when sameType is false) -->
          <div class="col col-12" v-else>
            <div v-for="(_, index) in formData.questionTypes" :key="index" class="input-group mb-3">
              <span class="input-group-text">#{{ index + 1 }}</span>
              <SearchableDropdown
                :id="'questionType' + index"
                :label="'Question Type ' + (index + 1)"
                placeholder="Search for Question Type"
                :items="availableQuestionTypes"
                v-model="selectedQuestionTypes[index]"
                :search-keys="['type_name']"
                label-key="type_name"
                :next-field-id="getNextFieldId(index)"
                :class="{
                  'is-invalid': !isQuestionTypeValid(index) && questionTypeTouched[index],
                  'is-valid': isQuestionTypeValid(index) && questionTypeTouched[index]
                }"
                required
                @update:modelValue="(value) => handleIndividualQuestionTypeInput(value, index)"
              />
              <div class="invalid-feedback">Please select a question type</div>
            </div>
          </div>
        </div>
      </fieldset>

      <!-- Submit Button -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="text-center">
          <button id="saveButton" type="submit" class="btn btn-dark">Save</button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'
import { VALIDATION_MESSAGES } from '@/utils/validationConstants'
import {
  MCQ_TYPE_NAME,
  type ExamDeliveryMode,
  getAllowedExamQuestionTypeNames,
  isExamQuestionTypeLocked,
  shouldForceSameQuestionTypePerSection,
} from '@/utils/examPatternSection'

export interface SectionFormData {
  questionNumber: string
  subQuestion: string
  sectionName: string
  totalQuestions: string
  requiredQuestions: string
  marksPerQuestion: string
  sameType: boolean
  questionType: string
  questionTypes: string[]
}

interface QuestionType {
  id: number
  type_name: string
  subsection_question_types: Array<never>
}

interface Props {
  totalPatternMarks: number
  disabled?: boolean
  remainingMarks?: number
  /** When set (exam pattern flow), filters and presets question types by delivery mode. */
  examDeliveryMode?: ExamDeliveryMode | null
  initialSectionData?: {
    questionNumber: string
    subQuestion: string
    sectionName: string
    totalQuestions: string
    requiredQuestions: string
    marksPerQuestion: string
    sameType: boolean
    questionType: string
    questionTypes: string[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  remainingMarks: 0,
  examDeliveryMode: null,
})

const questionTypeLocked = computed(() => isExamQuestionTypeLocked(props.examDeliveryMode))
const forceExamSameType = computed(() =>
  shouldForceSameQuestionTypePerSection(props.examDeliveryMode),
)

const availableQuestionTypes = computed(() => {
  const allowed = getAllowedExamQuestionTypeNames(props.examDeliveryMode)
  if (!allowed) return questionTypes.value
  return questionTypes.value.filter((qt) => allowed.includes(qt.type_name))
})

// Emits
const emit = defineEmits<(e: 'submit', data: SectionFormData) => void>()

// Form data
const formData = ref<SectionFormData>({
  questionNumber: '',
  subQuestion: '',
  sectionName: '',
  totalQuestions: '',
  requiredQuestions: '',
  marksPerQuestion: '',
  sameType: false,
  questionType: '',
  questionTypes: [],
})

// Add interface for validation states
interface ValidationState {
  valid: boolean
  touched: boolean
}

interface SectionHeaderValidation {
  valid: boolean
  allTouched: boolean
}

interface ValidationStates {
  sectionHeader: SectionHeaderValidation
  totalQuestions: ValidationState
  requiredQuestions: ValidationState
  marksPerQuestion: ValidationState
  questionType: ValidationState
}

// Update validation states with proper typing
const validationStates = ref<ValidationStates>({
  sectionHeader: { valid: false, allTouched: false },
  totalQuestions: { valid: false, touched: false },
  requiredQuestions: { valid: false, touched: false },
  marksPerQuestion: { valid: false, touched: false },
  questionType: { valid: false, touched: false },
})

// Question types state
const questionTypes = ref<QuestionType[]>([])
const selectedQuestionType = ref<QuestionType | null>(null)
const selectedQuestionTypes = ref<(QuestionType | null)[]>([])

// Add questionTypeTouched array to track touched state for individual question types
const questionTypeTouched = ref<boolean[]>([])

const selectQuestionTypeByName = (typeName: string) => {
  const match = availableQuestionTypes.value.find((qt) => qt.type_name === typeName)
  if (!match) return
  selectedQuestionType.value = match
  formData.value.questionType = match.type_name
  validationStates.value.questionType.valid = true
  validationStates.value.questionType.touched = true
}

const applyExamQuestionTypeDefaults = () => {
  if (!props.examDeliveryMode) return

  if (forceExamSameType.value) {
    formData.value.sameType = true
  }

  if (questionTypeLocked.value) {
    selectQuestionTypeByName(MCQ_TYPE_NAME)
  } else if (
    props.examDeliveryMode === 'ONLINE_MIXED' &&
    !props.initialSectionData?.questionType &&
    !formData.value.questionType
  ) {
    validationStates.value.questionType.valid = false
    validationStates.value.questionType.touched = false
  }
}

// Fetch question types
const fetchQuestionTypes = async () => {
  try {
    console.log('Fetching question types...')
    const response = await axiosInstance.get('/question-types')
    console.log('Question types fetched successfully:', response.data)
    questionTypes.value = response.data
    console.log('Question types set in component:', questionTypes.value)
  } catch (error) {
    console.error('Error fetching question types:', error)
  }
}

onMounted(async () => {
  console.log('Component mounted, initial data:', props.initialSectionData)
  console.log('Initial form data state:', formData.value)

  // First fetch question types
  await fetchQuestionTypes()
  console.log('After fetch - Question types state:', questionTypes.value)

  // Only proceed with initialization if we have initial data
  if (props.initialSectionData) {
    console.log('Initializing form with data:', props.initialSectionData)
    console.log('Initial question type from data:', props.initialSectionData.questionType)
    console.log('Initial sameType value:', props.initialSectionData.sameType)

    // Initialize form data
    formData.value = {
      questionNumber: props.initialSectionData.questionNumber,
      subQuestion: props.initialSectionData.subQuestion,
      sectionName: props.initialSectionData.sectionName,
      totalQuestions: props.initialSectionData.totalQuestions,
      requiredQuestions: props.initialSectionData.requiredQuestions,
      marksPerQuestion: props.initialSectionData.marksPerQuestion,
      sameType: props.initialSectionData.sameType,
      questionType: props.initialSectionData.questionType,
      questionTypes: [...props.initialSectionData.questionTypes],
    }
    console.log('Form data after initialization:', formData.value)

    // Set validation states
    validationStates.value.sectionHeader.valid = true
    validationStates.value.sectionHeader.allTouched = true
    validationStates.value.totalQuestions.valid = true
    validationStates.value.totalQuestions.touched = true
    validationStates.value.requiredQuestions.valid = true
    validationStates.value.requiredQuestions.touched = true
    validationStates.value.marksPerQuestion.valid = true
    validationStates.value.marksPerQuestion.touched = true
    validationStates.value.questionType.valid = true
    validationStates.value.questionType.touched = true
    
    // Initialize touched state for individual question types if not using same type
    if (!formData.value.sameType) {
      questionTypeTouched.value = new Array(props.initialSectionData.questionTypes.length).fill(true)
    }

    // Now that question types are loaded, set the selected type
    if (props.initialSectionData.sameType) {
      console.log('Setting same type question:', props.initialSectionData.questionType)
      console.log(
        'Available question types:',
        questionTypes.value.map((qt) => qt.type_name),
      )
      const matchingType = questionTypes.value.find(
        (qt) => qt.type_name === props.initialSectionData?.questionType,
      )
      console.log('Found matching type:', matchingType)
      if (matchingType) {
        console.log('Setting selectedQuestionType to:', matchingType)
        selectedQuestionType.value = matchingType
        formData.value.questionType = matchingType.type_name
        formData.value.questionTypes = new Array(Number(formData.value.totalQuestions)).fill(
          matchingType.type_name,
        )
        console.log('Updated form data after setting question type:', formData.value)
      } else {
        console.warn('No matching question type found for:', props.initialSectionData.questionType)
      }
    } else {
      console.log('Setting different question types:', props.initialSectionData.questionTypes)
      selectedQuestionTypes.value = props.initialSectionData.questionTypes.map((type) => {
        const found = questionTypes.value.find((qt) => qt.type_name === type)
        console.log(`Finding match for type ${type}:`, found)
        return found ?? null
      })
      console.log('Set selectedQuestionTypes to:', selectedQuestionTypes.value)
    }
  }

  applyExamQuestionTypeDefaults()
})

// Watch for question type selection changes
watch(selectedQuestionType, (newValue) => {
  console.log('Watch - Selected question type changed:', newValue)
  if (formData.value.sameType) {
    console.log('Updating form data with new question type:', newValue?.type_name)
    formData.value.questionType = newValue?.type_name ?? ''
    formData.value.questionTypes = new Array(Number(formData.value.totalQuestions)).fill(
      newValue?.type_name ?? '',
    )
    console.log('Updated form data:', formData.value)
  }
  handleQuestionTypeInput()
})

// Watch for total questions changes to update question types array
watch(
  () => formData.value.totalQuestions,
  (newValue) => {
    const numValue = Number(newValue)
    if (numValue > 0) {
      if (formData.value.sameType) {
        formData.value.questionTypes = new Array(numValue).fill(formData.value.questionType)
      } else {
        const currentTypes = [...formData.value.questionTypes]
        formData.value.questionTypes = new Array(numValue)
          .fill('')
          .map((_, i) => currentTypes[i] ?? '')
        selectedQuestionTypes.value = new Array(numValue)
          .fill(null)
          .map((_, i) => selectedQuestionTypes.value[i] ?? null)
        // Initialize touched state for each question type
        questionTypeTouched.value = new Array(numValue)
          .fill(false)
          .map((_, i) => questionTypeTouched.value[i] || false)
      }
    } else {
      formData.value.questionTypes = []
      selectedQuestionTypes.value = []
      questionTypeTouched.value = []
    }
  },
)

// Watch for sameType changes
watch(
  () => formData.value.sameType,
  (newValue) => {
    const numTotalQuestions = Number(formData.value.totalQuestions)
    if (newValue) {
      formData.value.questionTypes = new Array(numTotalQuestions).fill(formData.value.questionType)
      selectedQuestionTypes.value = new Array(numTotalQuestions).fill(selectedQuestionType.value)
      // Reset individual touchedState since we're using same type for all
      questionTypeTouched.value = []
    } else {
      formData.value.questionTypes = new Array(numTotalQuestions).fill('')
      selectedQuestionTypes.value = new Array(numTotalQuestions).fill(null)
      // Initialize touched state for each question type
      questionTypeTouched.value = new Array(numTotalQuestions).fill(false)
      // Reset validation state when unchecking same type
      validationStates.value.questionType.valid = false
      selectedQuestionType.value = null
      formData.value.questionType = ''
    }
  },
)

// Computed values
const sectionMarks = computed(() => {
  const requiredQuestions = Number(formData.value.requiredQuestions) || 0
  const marksPerQuestion = Number(formData.value.marksPerQuestion) || 0
  return requiredQuestions * marksPerQuestion
})

const availableMarks = computed(() => {
  // Always use the remainingMarks prop as the base
  return props.remainingMarks
})

const currentRemainingMarks = computed(() => {
  // When editing a section, the remainingMarks already includes the current section's marks
  // So we just need to subtract the current section marks from the available marks
  return availableMarks.value - sectionMarks.value
})

const isQuestionNumberValid = computed(() => {
  const num = Number(formData.value.questionNumber)
  return !Number.isNaN(num) && num > 0 && Number.isInteger(num)
})

const isSubQuestionValid = computed(() => {
  // Sub question is now optional, so it's always valid (can be empty or have content)
  return true
})

const isSectionNameValid = computed(() => {
  return formData.value.sectionName.trim() !== ''
})

const isSectionHeaderValid = computed(() => {
  return isQuestionNumberValid.value && isSectionNameValid.value
})

const showSectionHeaderError = computed(() => {
  return validationStates.value.sectionHeader.allTouched && !isSectionHeaderValid.value
})

const isFormValid = computed(() => {
  let questionTypesValid = formData.value.questionTypes.length === Number(formData.value.totalQuestions) &&
    formData.value.questionTypes.every((type) => type.trim() !== '')
  if (questionTypeLocked.value) {
    questionTypesValid = true
  } else if (formData.value.sameType) {
    questionTypesValid = selectedQuestionType.value !== null
  }

  return (
    isSectionHeaderValid.value &&
    validationStates.value.totalQuestions.valid &&
    validationStates.value.requiredQuestions.valid &&
    validationStates.value.marksPerQuestion.valid &&
    questionTypesValid &&
    sectionMarks.value <= props.totalPatternMarks
  )
})

// Add refs for input fields
const questionNumberInput = ref<HTMLInputElement | null>(null)
const subQuestionInput = ref<HTMLInputElement | null>(null)
const sectionNameInput = ref<HTMLInputElement | null>(null)
const totalQuestionsInput = ref<HTMLInputElement | null>(null)
const requiredQuestionsInput = ref<HTMLInputElement | null>(null)
const marksPerQuestionInput = ref<HTMLInputElement | null>(null)
const questionTypeInput = ref<HTMLElement | null>(null)

// Input handlers
const handleSectionHeaderInput = () => {
  if (validationStates.value.sectionHeader.allTouched) {
    validationStates.value.sectionHeader.valid = isSectionHeaderValid.value
  }
}

// New function to handle section name input specifically
const handleSectionNameInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const value = input.value

  // Capitalize the first letter if there's any text
  if (value.length > 0) {
    formData.value.sectionName = value.charAt(0).toUpperCase() + value.slice(1)
  }

  // Call the general section header input handler
  handleSectionHeaderInput()
}

const handleSectionHeaderBlur = () => {
  validationStates.value.sectionHeader.allTouched = true
  validationStates.value.sectionHeader.valid = isSectionHeaderValid.value
}

const handleTotalQuestionsInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  validationStates.value.totalQuestions.touched = true
  validationStates.value.totalQuestions.valid = value !== '' && Number(value) > 0

  // Also validate required questions since it depends on total questions
  if (formData.value.requiredQuestions) {
    const mockEvent = new Event('input')
    Object.defineProperty(mockEvent, 'target', {
      value: { value: formData.value.requiredQuestions },
    })
    handleRequiredQuestionsInput(mockEvent)
  }
}

const handleRequiredQuestionsInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  validationStates.value.requiredQuestions.touched = true
  validationStates.value.requiredQuestions.valid =
    value !== '' && Number(value) > 0 && Number(value) <= Number(formData.value.totalQuestions)

  // Also validate marks per question since it depends on required questions
  if (formData.value.marksPerQuestion) {
    const mockEvent = new Event('input')
    Object.defineProperty(mockEvent, 'target', {
      value: { value: formData.value.marksPerQuestion },
    })
    handleMarksPerQuestionInput(mockEvent)
  }
}

const handleMarksPerQuestionInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  validationStates.value.marksPerQuestion.touched = true

  // Basic validation
  const isBasicValid = value !== '' && Number(value) > 0

  // Check if total section marks would exceed remaining marks
  const totalSectionMarks = Number(formData.value.requiredQuestions) * Number(value)

  // When editing, the remainingMarks already includes the current section's original marks
  const isWithinLimit = totalSectionMarks <= availableMarks.value

  validationStates.value.marksPerQuestion.valid = isBasicValid && isWithinLimit

  // Log for debugging
  console.log('SectionForm - Marks calculation:', {
    requiredQuestions: Number(formData.value.requiredQuestions),
    marksPerQuestion: Number(value),
    totalSectionMarks,
    availableMarks: availableMarks.value,
    isWithinLimit,
    currentRemainingMarks: availableMarks.value - totalSectionMarks,
    totalPatternMarks: props.totalPatternMarks
  });
}

// Helper function to check if an individual question type is valid
const isQuestionTypeValid = (index: number) => {
  return formData.value.questionTypes[index]?.trim() !== ''
}

// Helper function to get the next field ID for keyboard navigation
const getNextFieldId = (index: number): string => {
  // If this is the last question type, go to the save button
  if (index === formData.value.questionTypes.length - 1) {
    return 'saveButton'
  }
  // Otherwise, go to the next question type
  return 'questionType' + (index + 1)
}

const handleIndividualQuestionTypeInput = (value: unknown, index: number) => {
  // Mark this specific question type as touched
  if (questionTypeTouched.value.length <= index) {
    questionTypeTouched.value = new Array(formData.value.questionTypes.length).fill(false)
  }
  questionTypeTouched.value[index] = true
  
  // Update the question type value
  const questionType = value as QuestionType | null
  formData.value.questionTypes[index] = questionType?.type_name ?? ''
  
  // Check if all question types are valid
  const allTypesValid = formData.value.questionTypes.every((type) => type.trim() !== '')
  
  // Only update overall validation status if all types are valid or this is the only type
  if (formData.value.sameType) {
    validationStates.value.questionType.valid = selectedQuestionType.value !== null
  } else {
    validationStates.value.questionType.valid = allTypesValid
  }
  
  validationStates.value.questionType.touched = true
}

const handleQuestionTypeInput = () => {
  console.log('handleQuestionTypeInput called')
  console.log('Current selectedQuestionType:', selectedQuestionType.value)
  console.log('Current form data:', formData.value)

  validationStates.value.questionType.touched = true
  if (formData.value.sameType) {
    validationStates.value.questionType.valid = selectedQuestionType.value !== null
  } else {
    validationStates.value.questionType.valid = formData.value.questionTypes.every(
      (type) => type.trim() !== '',
    )
  }
  console.log('Question type validation state:', validationStates.value.questionType)
}

const focusIfInvalid = (isValid: boolean, input: { focus?: () => void } | null | undefined): boolean => {
  if (isValid) return false
  input?.focus()
  return true
}

const focusQuestionTypeIfInvalid = (): boolean => {
  if (validationStates.value.questionType.valid || questionTypeLocked.value) return false
  if (formData.value.sameType) {
    questionTypeInput.value?.focus()
  } else {
    const emptyIndex = formData.value.questionTypes.findIndex((type) => !type)
    if (emptyIndex !== -1) {
      document.getElementById(`questionType${emptyIndex}`)?.focus()
    }
  }
  return true
}

const applyQuestionTypeSelections = () => {
  if (questionTypeLocked.value) {
    formData.value.sameType = true
    formData.value.questionType = MCQ_TYPE_NAME
    formData.value.questionTypes = new Array(Number(formData.value.totalQuestions)).fill(MCQ_TYPE_NAME)
    return
  }
  if (formData.value.sameType) {
    formData.value.questionType =
      selectedQuestionType.value?.type_name ?? formData.value.questionType
    if (formData.value.questionType) {
      formData.value.questionTypes = new Array(Number(formData.value.totalQuestions)).fill(
        formData.value.questionType,
      )
    }
    return
  }
  formData.value.questionTypes = formData.value.questionTypes.map(
    (_, index) =>
      selectedQuestionTypes.value[index]?.type_name ?? formData.value.questionTypes[index] ?? '',
  )
}

// Methods
const handleSubmit = () => {
  // Mark all fields as touched to trigger validation messages
  validationStates.value.sectionHeader.allTouched = true
  validationStates.value.totalQuestions.touched = true
  validationStates.value.requiredQuestions.touched = true
  validationStates.value.marksPerQuestion.touched = true
  validationStates.value.questionType.touched = true

  if (focusIfInvalid(isQuestionNumberValid.value, questionNumberInput.value)) return
  if (focusIfInvalid(isSubQuestionValid.value, subQuestionInput.value)) return
  if (focusIfInvalid(isSectionNameValid.value, sectionNameInput.value)) return
  if (focusIfInvalid(validationStates.value.totalQuestions.valid, totalQuestionsInput.value)) return
  if (focusIfInvalid(validationStates.value.requiredQuestions.valid, requiredQuestionsInput.value)) return
  if (focusIfInvalid(validationStates.value.marksPerQuestion.valid, marksPerQuestionInput.value)) return
  if (focusQuestionTypeIfInvalid()) return

  if (sectionMarks.value > availableMarks.value) {
    console.error('SectionForm - Section marks exceed available marks:', {
      sectionMarks: sectionMarks.value,
      availableMarks: availableMarks.value,
      difference: sectionMarks.value - availableMarks.value
    });
    marksPerQuestionInput.value?.focus()
    return
  }

  applyQuestionTypeSelections()
  emit('submit', formData.value)
}

// Expose some values that parent might need
defineExpose({
  sectionMarks,
  remainingMarks: currentRemainingMarks,
  isFormValid,
})
</script>

<style scoped>
.form-control-plaintext {
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0;
  margin: 0;
  min-height: unset;
  line-height: 1;
}

/* Button styles */
.btn-dark {
  min-width: 120px;
  font-size: 0.9rem;
}

.btn-dark:hover:not(:disabled) {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Spacing utilities */
.g-3 {
  gap: 0.5rem !important;
}

.mb-4 {
  margin-bottom: 1rem !important;
}

/* Label styles */
.fw-bold {
  font-weight: 500 !important;
}

/* Form check styles */
.form-check {
  padding-left: 1.5rem;
}

.form-check-input {
  margin-top: 0.25rem;
}

.form-check-label {
  font-size: 0.9rem;
  color: #212529;
}

/* Fieldset styles */
fieldset {
  border-color: #dee2e6;
}

legend {
  font-size: 1rem;
  margin-bottom: 0;
  color: #6c757d;
}

/* Mobile responsive styles */
@media (max-width: 575.98px) {
  .d-flex.flex-column.flex-sm-row {
    gap: 1rem !important;
  }

  .d-flex.flex-column.flex-sm-row.justify-content-center {
    gap: 2rem !important;
  }
}
</style>
