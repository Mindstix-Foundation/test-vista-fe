<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="backRoute" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-5">
          <p v-if="program" class="text-muted text-start fs-5 m-0">{{ programLabel(program) }}</p>
          <h4 class="fw-bolder text-start text-dark m-0">{{ subject?.name }} Syllabus</h4>
        </div>
        <div class="col col-12 col-sm-5 text-end align-self-end">
          <h3 class="text-left fw-bolder text-uppercase mb-2">Add New Chapter</h3>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <ChapterFormComponent @submit="saveChapter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import ChapterFormComponent from '@/components/forms/ChapterFormComponent.vue'
import { examCatalogService } from '@/services/examCatalogService'
import { examSyllabusService } from '@/services/examSyllabusService'
import type { ExamProgram, ExamSyllabusItem } from '@/types/exam'
import { examSyllabusQueryString, parseExamSyllabusQuery, programLabel } from '@/utils/examSyllabus'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const ctx = parseExamSyllabusQuery(route)
const subjectId = Number(route.params.subjectId)

const program = ref<ExamProgram | null>(null)
const subject = ref<ExamSyllabusItem | null>(null)

function breadcrumbQuery() {
  const scope = ctx.scope ?? (program.value?.exam_body?.exam_category?.code === 'ENTRANCE' ? 'ENTRANCE' : 'COMPETITIVE')
  return examSyllabusQueryString({
    programId: ctx.programId,
    scope,
    programName: program.value ? programLabel(program.value) : ctx.programName,
    stageId: ctx.stageId,
    stageName: ctx.stageName,
    subjectName: subject.value?.name ?? ctx.subjectName,
  })
}

const backRoute = computed(() => ({
  name: 'examSyllabusChapters',
  params: { programId: String(ctx.programId), subjectId: String(subjectId) },
  query: breadcrumbQuery(),
}))

onMounted(async () => {
  try {
    program.value = await examCatalogService.getProgram(ctx.programId)
    subject.value = await examSyllabusService.getSubject(subjectId)
    router.replace({ query: breadcrumbQuery() })
  } catch {
    toastStore.showToast({ type: 'error', title: 'Error', message: 'Failed to load subject.' })
  }
})

async function saveChapter(formData: { chapterName: string; topics: string[] }) {
  try {
    const chapter = await examSyllabusService.createChapter({
      exam_program_id: ctx.programId,
      exam_stage_id: ctx.stageId ?? undefined,
      parent_id: subjectId,
      name: formData.chapterName.trim(),
    })

    const topicNames = formData.topics.map((t) => t.trim()).filter(Boolean)
    if (topicNames.length) {
      await Promise.all(
        topicNames.map((name, index) =>
          examSyllabusService.createTopic({
            exam_program_id: ctx.programId,
            exam_stage_id: ctx.stageId ?? undefined,
            parent_id: chapter.id,
            name,
            sequence_number: index + 1,
          }),
        ),
      )
    }

    toastStore.showToast({ type: 'success', title: 'Success', message: 'Chapter saved.' })
    router.push(backRoute.value)
  } catch (error: any) {
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: error?.response?.data?.message ?? 'Failed to add chapter',
    })
  }
}
</script>

<style scoped>
@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
