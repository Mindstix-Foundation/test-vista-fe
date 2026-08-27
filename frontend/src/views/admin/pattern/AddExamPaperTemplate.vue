<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="backLink" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Create Paper Pattern</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <ExamPatternFormComponent
        @submit="handleSubmit"
        @addSection="handleAddSection"
        @editSection="editSection"
        @deleteSection="deleteSection"
        @form-change="handleFormChange"
        :initial-data="examPatternStore.formData"
        :sections="examPatternStore.sections"
        :exam-program-label="examPatternStore.examProgramLabel"
        ref="formComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamPatternFormComponent from '@/components/forms/ExamPatternFormComponent.vue'
import type { FormData } from '@/components/forms/ExamPatternFormComponent.vue'
import { useExamPatternStore } from '@/stores/examPattern'
import { useToastStore } from '@/store/toast'
import { examCatalogService } from '@/services/examCatalogService'
import { sectionToApiPayload } from '@/utils/examPatternSection'
import axiosInstance from '@/config/axios'

interface QuestionType {
  id: number
  type_name: string
}

const route = useRoute()
const router = useRouter()
const examPatternStore = useExamPatternStore()
const toastStore = useToastStore()
const formComponent = ref<InstanceType<typeof ExamPatternFormComponent> | null>(null)
const questionTypes = ref<QuestionType[]>([])

const examProgramId = computed(() => Number(route.query.examProgramId))
const examStageId = computed(() => {
  const id = route.query.examStageId
  return id ? Number(id) : undefined
})

const backLink = computed(() => ({
  name: 'patternDashboard',
  query: {
    scope: 'exam',
    examProgramId: String(examProgramId.value),
    ...(examStageId.value ? { examStageId: String(examStageId.value) } : {}),
  },
}))

const fetchQuestionTypes = async () => {
  try {
    const { data } = await axiosInstance.get('/question-types')
    questionTypes.value = data
  } catch (error) {
    console.error('Error fetching question types:', error)
  }
}

onMounted(async () => {
  if (!examProgramId.value) {
    router.push({ name: 'patternDashboard' })
    return
  }

  if (!examPatternStore.formData.examProgramId) {
    examPatternStore.setFormData({
      patternName: '',
      examProgramId: examProgramId.value,
      examStageId: examStageId.value ?? null,
      totalMarks: 100,
      totalQuestions: 100,
      durationMinutes: 120,
      deliveryMode: 'ONLINE_MCQ',
      negativeMarking: true,
      negativeMarksRatio: 0.33,
    })
  }

  examPatternStore.normalizeSectionsForDeliveryMode()

  try {
    const program = await examCatalogService.getProgram(examProgramId.value)
    examPatternStore.setExamProgramLabel(
      `${program.exam_body?.abbreviation ?? ''} — ${program.name}`.trim(),
    )
  } catch {
    examPatternStore.setExamProgramLabel('')
  }

  await fetchQuestionTypes()
})

const handleSubmit = async (formData: FormData) => {
  try {
    const sections = examPatternStore.sections.map((section, index) =>
      sectionToApiPayload(section, questionTypes.value, index),
    )

    const payload: Record<string, unknown> = {
      exam_program_id: examProgramId.value,
      name: formData.patternName.trim(),
      total_marks: formData.totalMarks,
      total_questions: formData.totalQuestions ?? undefined,
      duration_minutes: formData.durationMinutes ?? undefined,
      delivery_mode: formData.deliveryMode,
      negative_marking: formData.negativeMarking,
      negative_marks_ratio: formData.negativeMarking ? formData.negativeMarksRatio : undefined,
      sections,
    }
    if (examStageId.value) {
      payload.exam_stage_id = examStageId.value
    }

    await examCatalogService.createTemplate(payload)
    toastStore.showToast({
      title: 'Success',
      message: 'Paper pattern created successfully',
      type: 'success',
    })
    examPatternStore.clearFormData()
    router.push(backLink.value)
  } catch (error: any) {
    toastStore.showToast({
      title: 'Error',
      message: error?.response?.data?.message ?? 'Failed to create paper pattern',
      type: 'error',
    })
  }
}

const handleFormChange = (formData: FormData) => {
  examPatternStore.setFormData(formData)
}

const examSectionQuery = (extra: Record<string, string> = {}) => ({
  scope: 'exam',
  deliveryMode: examPatternStore.formData.deliveryMode,
  examProgramId: String(examProgramId.value),
  ...(examStageId.value ? { examStageId: String(examStageId.value) } : {}),
  ...extra,
})

const handleAddSection = (formData: FormData) => {
  examPatternStore.setFormData(formData)

  const highestSectionNumber = examPatternStore.sections.reduce((max, section) => {
    const currentNumber = Number.parseInt(section.questionNumber, 10) || 0
    return Math.max(currentNumber, max)
  }, 0)

  router.push({
    name: 'addSection',
    query: examSectionQuery({
      remainingMarks: String(examPatternStore.remainingMarks),
      nextSequenceNumber: String(examPatternStore.sections.length + 1),
      nextSectionNumber: String(highestSectionNumber + 1),
    }),
  })
}

const editSection = (index: number) => {
  const sectionToEdit = examPatternStore.sections[index]
  const currentSectionMarks = sectionToEdit.requiredQuestions * sectionToEdit.marksPerQuestion
  const remainingMarksExcludingCurrent = examPatternStore.remainingMarks + currentSectionMarks

  router.push({
    name: 'editSection',
    query: examSectionQuery({
      sectionIndex: String(index),
      remainingMarks: String(remainingMarksExcludingCurrent),
      totalMarks: String(examPatternStore.formData.totalMarks),
      sequenceNumber: sectionToEdit.seqencial_section_number?.toString(),
      sectionNumber: sectionToEdit.questionNumber?.toString(),
    }),
  })
}

const deleteSection = (index: number) => {
  examPatternStore.removeSection(index)
}

onBeforeUnmount(() => {
  const nextRoute = router.currentRoute.value.name
  if (nextRoute !== 'addSection' && nextRoute !== 'editSection') {
    examPatternStore.clearFormData()
  }
})
</script>
