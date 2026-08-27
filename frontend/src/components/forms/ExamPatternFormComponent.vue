<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <div class="row gx-2 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 mb-2">
        <div class="row g-3">
          <div v-if="examProgramLabel" class="col-12">
            <p class="text-muted mb-0">{{ examProgramLabel }}</p>
          </div>

          <div class="col-12">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                :class="{
                  'is-invalid':
                    !validationStates.patternName.valid && validationStates.patternName.touched,
                  'is-valid': validationStates.patternName.valid,
                }"
                id="examPatternName"
                placeholder="Enter Pattern Name"
                v-model="formData.patternName"
                @input="handlePatternNameInput"
                @blur="handlePatternNameBlur"
                required
              />
              <label for="examPatternName">Pattern Name <span class="text-danger">*</span></label>
              <div class="invalid-feedback">Please enter a pattern name</div>
            </div>
          </div>

          <div class="col-12">
            <div class="form-floating">
              <input
                type="number"
                class="form-control"
                :class="{
                  'is-invalid':
                    !validationStates.totalMarks.valid && validationStates.totalMarks.touched,
                  'is-valid': validationStates.totalMarks.valid,
                }"
                id="examTotalMarks"
                placeholder="Enter Total Marks"
                v-model.number="formData.totalMarks"
                @input="handleTotalMarksInput"
                @blur="handleTotalMarksBlur"
                min="1"
                required
              />
              <label for="examTotalMarks">Total Marks <span class="text-danger">*</span></label>
              <div class="invalid-feedback">Please enter total marks greater than 0</div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-floating">
              <input
                type="number"
                class="form-control"
                id="examTotalQuestions"
                placeholder="Total Questions"
                v-model.number="formData.totalQuestions"
                min="1"
              />
              <label for="examTotalQuestions">Total Questions</label>
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-floating">
              <input
                type="number"
                class="form-control"
                id="examDuration"
                placeholder="Duration"
                v-model.number="formData.durationMinutes"
                min="1"
              />
              <label for="examDuration">Duration (min)</label>
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-floating">
              <select v-model="formData.deliveryMode" class="form-select" id="examDeliveryMode">
                <option value="ONLINE_MCQ">Online MCQ</option>
                <option value="ONLINE_MIXED">Online Mixed</option>
                <option value="OFFLINE_PDF">Offline PDF</option>
              </select>
              <label for="examDeliveryMode">Delivery Mode</label>
            </div>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input
                v-model="formData.negativeMarking"
                class="form-check-input"
                type="checkbox"
                id="examNegMarking"
              />
              <label class="form-check-label" for="examNegMarking">Negative marking</label>
            </div>
          </div>

          <div v-if="formData.negativeMarking" class="col-md-4">
            <div class="form-floating">
              <input
                type="number"
                class="form-control"
                id="examNegRatio"
                v-model.number="formData.negativeMarksRatio"
                step="0.01"
                min="0"
                max="1"
              />
              <label for="examNegRatio">Negative marks ratio</label>
            </div>
          </div>

          <div class="col-12">
            <div class="d-flex justify-content-end align-items-center">
              <span
                :class="{ 'text-danger': remainingMarks > 0, 'text-success': remainingMarks === 0 }"
              >
                Remaining Marks: {{ remainingMarks }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-10 col-md-8 mt-3">
        <div class="row g-3 justify-content-center mb-3">
          <div class="col-12">
            <div class="btn-group w-100">
              <button
                type="button"
                class="btn btn-light"
                style="border: 1px solid gray !important"
                @click="addSection"
                :disabled="remainingMarks <= 0"
                id="addExamSectionBtn"
              >
                Add Section
              </button>
            </div>
            <div
              v-if="validationStates.totalMarks.valid && remainingMarks <= 0 && sections.length > 0"
              class="alert alert-warning mt-2"
            >
              Cannot add more sections as all marks have been allocated.
            </div>
          </div>
        </div>
      </div>

      <div v-if="sections.length > 0" class="col-12 col-sm-10 col-md-8 mb-3">
        <h5 class="mb-3">Added Sections</h5>
        <div v-for="(section, index) in sections" :key="index" class="mb-3">
          <div class="card">
            <div class="card-body">
              <div class="container">
                <div class="row mb-2 justify-content-between">
                  <div class="col-12 col-sm-3 text-center">
                    <strong>Total Questions:</strong> <span>{{ section.totalQuestions }}</span>
                  </div>
                  <div class="col-12 col-sm-3 text-center">
                    <strong>Mandatory Questions:</strong>
                    <span>{{ section.requiredQuestions }}</span>
                  </div>
                  <div class="col-12 col-sm-3 text-center">
                    <strong>Section Marks:</strong>
                    <span>{{ section.requiredQuestions * section.marksPerQuestion }}</span>
                  </div>
                  <div class="col-12 col-sm-auto text-end">
                    <button
                      type="button"
                      class="btn btn-link text-decoration-none text-black me-2 fs-5"
                      @click="$emit('editSection', index)"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-link text-decoration-none text-black fs-5"
                      @click.prevent.stop="$emit('deleteSection', index)"
                    >
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
                <div class="row">
                  <div class="mt-2">
                    <span>
                      <strong class="me-3"
                        >Q{{ section.questionNumber
                        }}{{ section.subQuestion ? ' ' + section.subQuestion : '' }}</strong
                      >
                      {{ section.sectionName }}
                    </span>
                  </div>
                </div>
                <hr />
                <ul class="list-group list-group-flush">
                  <template v-if="getSectionQuestionTypeLabels(section).length === 1">
                    <li class="list-group-item">
                      Question Type: {{ getSectionQuestionTypeLabels(section)[0] }}
                    </li>
                  </template>
                  <template v-else-if="getSectionQuestionTypeLabels(section).length > 1">
                    <li
                      v-for="(type, idx) in getSectionQuestionTypeLabels(section)"
                      :key="idx"
                      class="list-group-item"
                    >
                      {{ toRomanNumeral(idx + 1) }} - {{ type }}
                    </li>
                  </template>
                  <li v-else class="list-group-item text-muted">Question Type: Not set</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col col-12 col-sm-10 col-md-8">
        <div class="text-center mt-2">
          <button
            type="submit"
            class="btn btn-dark"
            :disabled="!isFormValid || remainingMarks !== 0 || sections.length === 0"
          >
            <output v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></output>
            {{ isEditMode ? 'Update Pattern' : 'Create Pattern' }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { ExamPatternFormData, ExamSectionData } from '@/stores/examPattern'
import { getSectionQuestionTypeLabels } from '@/utils/examPatternSection'

export type { ExamPatternFormData as FormData } from '@/stores/examPattern'

interface Props {
  isEditMode?: boolean
  examProgramLabel?: string
  initialData?: ExamPatternFormData
  sections: ExamSectionData[]
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  examProgramLabel: '',
})

const emit = defineEmits<{
  (e: 'submit', data: ExamPatternFormData): void
  (e: 'addSection', data: ExamPatternFormData): void
  (e: 'editSection', index: number): void
  (e: 'deleteSection', index: number): void
  (e: 'totalMarksChanged', totalMarks: number): void
  (e: 'formChange', data: ExamPatternFormData): void
}>()

const formData = ref<ExamPatternFormData>({
  patternName: '',
  examProgramId: null,
  examStageId: null,
  totalMarks: 0,
  totalQuestions: null,
  durationMinutes: null,
  deliveryMode: 'ONLINE_MCQ',
  negativeMarking: true,
  negativeMarksRatio: 0.33,
})

const sections = props.sections || []
const remainingMarks = ref(0)
const isSubmitting = ref(false)

const validationStates = ref({
  patternName: { valid: false, touched: false },
  totalMarks: { valid: false, touched: false },
})

const isFormValid = computed(() => {
  return (
    validationStates.value.patternName.valid &&
    validationStates.value.totalMarks.valid &&
    remainingMarks.value === 0 &&
    props.sections.length > 0
  )
})

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const handlePatternNameInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  validationStates.value.patternName.touched = true
  validationStates.value.patternName.valid = value.trim().length > 0
  formData.value.patternName = capitalizeFirstLetter(value)
}

const handlePatternNameBlur = () => {
  validationStates.value.patternName.touched = true
}

const handleTotalMarksInput = () => {
  validationStates.value.totalMarks.touched = true
  validationStates.value.totalMarks.valid = formData.value.totalMarks > 0
  calculateRemainingMarks()
  emit('totalMarksChanged', formData.value.totalMarks)
}

const handleTotalMarksBlur = () => {
  validationStates.value.totalMarks.touched = true
}

const calculateRemainingMarks = () => {
  validationStates.value.totalMarks.valid = formData.value.totalMarks > 0
  const totalSectionMarks = props.sections.reduce(
    (total, section) => total + section.requiredQuestions * section.marksPerQuestion,
    0,
  )
  remainingMarks.value = formData.value.totalMarks - totalSectionMarks
}

watch(
  () => props.sections,
  () => calculateRemainingMarks(),
  { deep: true, immediate: true },
)

watch(
  () => formData.value.deliveryMode,
  () => {
    emit('formChange', { ...formData.value })
  },
)

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.value = { ...data }
      validationStates.value.patternName.valid = data.patternName.trim().length > 0
      validationStates.value.totalMarks.valid = data.totalMarks > 0
      calculateRemainingMarks()
    }
  },
  { immediate: true, deep: true },
)

const addSection = () => {
  emit('addSection', { ...formData.value, remainingMarks: remainingMarks.value } as ExamPatternFormData & {
    remainingMarks?: number
  })
}

const handleSubmit = async () => {
  for (const key of Object.keys(validationStates.value)) {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  }

  if (!isFormValid.value) return

  formData.value.patternName = capitalizeFirstLetter(formData.value.patternName)
  emit('submit', formData.value)
}

const toRomanNumeral = (num: number): string => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
  return romanNumerals[num - 1] || String(num)
}

onMounted(() => {
  if (props.initialData) {
    formData.value = { ...props.initialData }
    validationStates.value.patternName.valid = props.initialData.patternName.trim().length > 0
    validationStates.value.totalMarks.valid = props.initialData.totalMarks > 0
    calculateRemainingMarks()
  }
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
</style>
