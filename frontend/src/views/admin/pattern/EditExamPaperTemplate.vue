<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="backLink" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Paper Pattern</h4>
        </div>
      </div>
      <hr />
    </div>

    <div v-if="loading" class="row justify-content-center mt-5">
      <output class="spinner-border text-primary">
        <span class="visually-hidden">Loading...</span>
      </output>
    </div>
    <div v-else-if="error" class="row justify-content-center mt-5">
      <div class="alert alert-danger col-12 col-sm-10" role="alert">{{ error }}</div>
    </div>
    <div v-else id="form-container" class="row mt-4 justify-content-center">
      <ExamPatternFormComponent
        @submit="handleSubmit"
        @addSection="handleAddSection"
        @editSection="editSection"
        @deleteSection="deleteSection"
        @form-change="handleFormChange"
        @totalMarksChanged="handleTotalMarksChange"
        :initial-data="examPatternStore.formData"
        :sections="examPatternStore.sections"
        :exam-program-label="examPatternStore.examProgramLabel"
        :is-edit-mode="true"
        ref="formComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'EditExamPaperTemplate' })

import { ref, computed, onBeforeUnmount, onMounted, onActivated, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamPatternFormComponent from '@/components/forms/ExamPatternFormComponent.vue'
import type { FormData } from '@/components/forms/ExamPatternFormComponent.vue'
import { useExamPatternStore } from '@/stores/examPattern'
import { useToastStore } from '@/store/toast'
import { examCatalogService } from '@/services/examCatalogService'
import { apiSectionToStore, sectionToApiPayload } from '@/utils/examPatternSection'
import axiosInstance from '@/config/axios'
import type { PaperTemplate } from '@/types/exam'

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
const loading = ref(true)
const error = ref('')
const template = ref<PaperTemplate | null>(null)
const loadedForId = ref<number | null>(null)

const templateId = computed(() => Number(route.params.id))

const backLink = computed(() => ({
  name: 'patternDashboard',
  query: {
    scope: 'exam',
    examProgramId: String(template.value?.exam_program_id ?? route.query.examProgramId ?? ''),
    ...(template.value?.exam_stage_id || route.query.examStageId
      ? { examStageId: String(template.value?.exam_stage_id ?? route.query.examStageId) }
      : {}),
  },
}))

const isReturningFromSection = () => route.query.from === 'editSection'

const hasStoreDataForTemplate = () =>
  loadedForId.value === templateId.value &&
  Boolean(examPatternStore.formData.patternName) &&
  examPatternStore.formData.examProgramId != null

const fetchQuestionTypes = async () => {
  try {
    const { data } = await axiosInstance.get('/question-types')
    questionTypes.value = data
  } catch (err) {
    console.error('Error fetching question types:', err)
  }
}

const loadTemplate = async () => {
  if (!Number.isFinite(templateId.value) || templateId.value <= 0) {
    error.value = 'Invalid paper pattern ID'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  try {
    const data = await examCatalogService.getTemplate(templateId.value)
    template.value = data

    examPatternStore.setFormData({
      patternName: data.name,
      examProgramId: data.exam_program_id,
      examStageId: data.exam_stage_id ?? null,
      totalMarks: data.total_marks,
      totalQuestions: data.total_questions ?? null,
      durationMinutes: data.duration_minutes ?? null,
      deliveryMode: data.delivery_mode ?? 'ONLINE_MCQ',
      negativeMarking: data.negative_marking ?? false,
      negativeMarksRatio: data.negative_marks_ratio ?? 0.33,
    })

    examPatternStore.sections = (data.sections ?? []).map((section, index) =>
      apiSectionToStore(section as Parameters<typeof apiSectionToStore>[0], index),
    )
    examPatternStore.normalizeSectionsForDeliveryMode()

    const program = data.exam_program
    examPatternStore.setExamProgramLabel(
      `${program?.exam_body?.abbreviation ?? ''} — ${program?.name ?? ''}`.trim(),
    )
    loadedForId.value = templateId.value
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
    error.value =
      axiosErr?.response?.data?.message ??
      (err instanceof Error ? err.message : 'Failed to load paper pattern')
  } finally {
    loading.value = false
  }
}

const bootstrap = async () => {
  if (isReturningFromSection() && hasStoreDataForTemplate()) {
    loading.value = false
    error.value = ''
    return
  }

  if (hasStoreDataForTemplate() && !isReturningFromSection()) {
    loading.value = false
    error.value = ''
    return
  }

  if (loadedForId.value !== null && loadedForId.value !== templateId.value) {
    examPatternStore.clearFormData()
    template.value = null
  }

  await fetchQuestionTypes()
  await loadTemplate()
}

onMounted(() => {
  bootstrap()
})

onActivated(() => {
  bootstrap()
})

watch(templateId, (newId, oldId) => {
  if (oldId != null && newId !== oldId) {
    examPatternStore.clearFormData()
    template.value = null
    loadedForId.value = null
    bootstrap()
  }
})

const handleSubmit = async (formData: FormData) => {
  try {
    const sections = examPatternStore.sections.map((section, index) =>
      sectionToApiPayload(section, questionTypes.value, index),
    )

    await examCatalogService.updateTemplate(templateId.value, {
      name: formData.patternName.trim(),
      total_marks: formData.totalMarks,
      total_questions: formData.totalQuestions ?? undefined,
      duration_minutes: formData.durationMinutes ?? undefined,
      delivery_mode: formData.deliveryMode,
      negative_marking: formData.negativeMarking,
      negative_marks_ratio: formData.negativeMarking ? formData.negativeMarksRatio : undefined,
      sections,
    })

    toastStore.showToast({
      title: 'Success',
      message: 'Paper pattern updated successfully',
      type: 'success',
    })
    examPatternStore.clearFormData()
    loadedForId.value = null
    router.push(backLink.value)
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    toastStore.showToast({
      title: 'Error',
      message: axiosErr?.response?.data?.message ?? 'Failed to update paper pattern',
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
  examProgramId: String(template.value?.exam_program_id ?? ''),
  ...(template.value?.exam_stage_id
    ? { examStageId: String(template.value.exam_stage_id) }
    : {}),
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
      fromEdit: 'true',
      templateId: String(templateId.value),
      storeOnly: 'true',
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
      fromEdit: 'true',
      templateId: String(templateId.value),
      storeOnly: 'true',
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

const handleTotalMarksChange = (totalMarks: number) => {
  examPatternStore.formData.totalMarks = totalMarks
}

onBeforeUnmount(() => {
  const nextRoute = router.currentRoute.value.name
  if (nextRoute !== 'addSection' && nextRoute !== 'editSection') {
    examPatternStore.clearFormData()
    loadedForId.value = null
  }
})
</script>
