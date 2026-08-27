<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="cancelRoute" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Add Exam</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <ExamFormComponent
        mode="create"
        :categories="categories"
        :bodies="bodies"
        :initial-category="initialCategory"
        :submitting="isSubmitting"
        @submit="handleSubmit"
      />
    </div>
    <LoadingSpinner :show="isSubmitting" :show-overlay="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamFormComponent from '@/components/forms/ExamFormComponent.vue'
import type { ExamFormData } from '@/components/forms/ExamFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { examCatalogService } from '@/services/examCatalogService'
import { useToastStore } from '@/stores/toast'
import type { ExamCategory, ExamBody } from '@/types/exam'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const initialCategory = computed(() => {
  const tab = route.query.tab as string
  return tab === 'ENTRANCE' || tab === 'COMPETITIVE' ? tab : 'COMPETITIVE'
})

const cancelRoute = computed(() => ({
  name: 'examCatalog',
  query: { tab: initialCategory.value },
}))

const categories = ref<ExamCategory[]>([])
const bodies = ref<ExamBody[]>([])
const isSubmitting = ref(false)

function generateCode(bodyAbbr: string, name: string) {
  const base = `${bodyAbbr}_${name}`.toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_').replaceAll(/(?:^_|_$)/g, '')
  return `${base}_${Date.now().toString().slice(-4)}`
}

async function handleSubmit(formData: ExamFormData) {
  isSubmitting.value = true
  try {
    let bodyId = formData.bodyId
    let bodyAbbr = bodies.value.find((b) => b.id === bodyId)?.abbreviation ?? ''

    if (bodyId === 0) {
      const category = categories.value.find((c) => c.code === formData.categoryCode)
      const newBody = await examCatalogService.createBody({
        exam_category_id: category?.id,
        name: formData.newBodyName.trim(),
        abbreviation: formData.newBodyAbbr.trim().toUpperCase(),
        jurisdiction: formData.jurisdiction,
      })
      bodyId = newBody.id
      bodyAbbr = newBody.abbreviation
    }

    await examCatalogService.createProgram({
      exam_body_id: bodyId,
      name: formData.name.trim(),
      code: generateCode(bodyAbbr, formData.name),
      default_duration_minutes: formData.duration || undefined,
      has_negative_marking: formData.hasNegative,
      negative_marks_ratio: formData.hasNegative ? formData.negativeRatio : undefined,
    })

    toastStore.showToast({
      type: 'success',
      title: 'Success',
      message: `Exam "${formData.name}" created successfully.`,
    })
    router.push(cancelRoute.value)
  } catch (error: any) {
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: error?.response?.data?.message ?? 'Failed to create exam.',
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const [cats, bodyList] = await Promise.all([
      examCatalogService.getCategories(),
      examCatalogService.getBodies(),
    ])
    categories.value = cats.filter((c) => c.code === 'ENTRANCE' || c.code === 'COMPETITIVE')
    bodies.value = bodyList
  } catch {
    toastStore.showToast({ type: 'error', title: 'Error', message: 'Failed to load form data.' })
  }
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
