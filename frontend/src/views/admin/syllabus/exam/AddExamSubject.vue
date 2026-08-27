<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="backRoute" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-5">
          <p v-if="program" class="text-muted text-start fs-5 m-0">{{ programLabel(program) }}</p>
          <p v-if="stageName" class="text-muted text-start mb-0">{{ stageName }}</p>
          <h4 class="fw-bolder text-start text-dark m-0">Subjects</h4>
        </div>
        <div class="col col-12 col-sm-5 text-end align-self-end">
          <h3 class="text-left fw-bolder text-uppercase mb-2">Add Subject</h3>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <ExamNameFormComponent label="Subject Name" :submitting="saving" @submit="saveSubject" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExamNameFormComponent from '@/components/forms/ExamNameFormComponent.vue'
import { examCatalogService } from '@/services/examCatalogService'
import { examSyllabusService } from '@/services/examSyllabusService'
import { useToastStore } from '@/stores/toast'
import type { ExamProgram } from '@/types/exam'
import { examSyllabusQueryString, parseExamSyllabusQuery, programLabel } from '@/utils/examSyllabus'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const ctx = parseExamSyllabusQuery(route)

const program = ref<ExamProgram | null>(null)
const stageName = ref('')
const saving = ref(false)

const backRoute = computed(() => ({
  name: 'examSyllabusSubjects',
  params: { programId: String(ctx.programId) },
  query: breadcrumbQuery(),
}))

function breadcrumbQuery() {
  const scope = ctx.scope ?? (program.value?.exam_body?.exam_category?.code === 'ENTRANCE' ? 'ENTRANCE' : 'COMPETITIVE')
  return examSyllabusQueryString({
    programId: ctx.programId,
    scope,
    programName: program.value ? programLabel(program.value) : ctx.programName,
    stageId: ctx.stageId,
    stageName: stageName.value || ctx.stageName,
  })
}

async function saveSubject(name: string) {
  if (!ctx.stageId) {
    toastStore.showToast({ type: 'error', title: 'Error', message: 'Select a stage before adding a subject.' })
    return
  }
  saving.value = true
  try {
    await examSyllabusService.createSubject({
      exam_program_id: ctx.programId,
      exam_stage_id: ctx.stageId,
      name,
    })
    toastStore.showToast({ type: 'success', title: 'Success', message: 'Subject added.' })
    router.push(backRoute.value)
  } catch (error: any) {
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: error?.response?.data?.message ?? 'Failed to add subject.',
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    program.value = await examCatalogService.getProgram(ctx.programId)
    if (ctx.stageId) {
      const stages = await examCatalogService.getStages(ctx.programId)
      stageName.value = stages.find((s) => s.id === ctx.stageId)?.name ?? ''
    }
    router.replace({ query: breadcrumbQuery() })
  } catch {
    toastStore.showToast({ type: 'error', title: 'Error', message: 'Failed to load exam.' })
  }
})
</script>

<style scoped>
@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
