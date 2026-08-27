<template>
  <div class="container mt-4 mb-5">
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-6">
          <h5 class="text-start m-0 fw-bolder text-uppercase">SYLLABUS — SUBJECTS</h5>
          <p v-if="program" class="text-muted m-0 small">{{ programLabel(program) }}</p>
        </div>
        <div class="col-12 col-sm-4 text-end d-flex gap-2 justify-content-end flex-wrap">
          <router-link
            class="btn btn-success"
            :to="{ name: 'examAddSubject', params: { programId: String(ctx.programId) }, query: syllabusQuery() }"
          >
            Add Subject
          </router-link>
          <button class="btn btn-outline-dark" @click="goBack">
            <i class="bi bi-arrow-left me-1"></i>Back
          </button>
        </div>
      </div>
      <hr />
    </div>

    <div v-if="stages.length" class="row p-2 justify-content-center mb-2">
      <div class="col-12 col-sm-10">
        <div class="d-flex align-items-center gap-2">
          <label class="form-label m-0 fw-bold" for="stageFilter">Stage:</label>
          <select id="stageFilter" v-model="selectedStage" class="form-select w-auto" @change="onStageChange">
            <option :value="null" disabled>Select stage</option>
            <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center my-5">
      <output class="spinner-border text-primary d-block">
        <span class="visually-hidden">Loading...</span>
      </output>
    </div>

    <div v-else class="row p-2 justify-content-center">
      <div class="col-12 col-sm-10">
        <div class="table-responsive">
          <table class="table table-sm table-hover table-striped table-bordered">
            <thead class="table-dark">
              <tr>
                <th scope="col" style="width: 40px">#</th>
                <th scope="col">Subject</th>
                <th scope="col" class="text-center" style="width: 100px">Chapters</th>
                <th scope="col" class="text-center" style="width: 80px">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(subject, index) in subjects" :key="subject.id">
                <th scope="row">{{ index + 1 }}</th>
                <td>{{ subject.name }}</td>
                <td class="text-center">{{ subject._count?.children ?? 0 }}</td>
                <td class="text-center">
                  <i class="bi bi-three-dots manage-icon" @click="goToChapters(subject)"></i>
                </td>
              </tr>
              <tr v-if="subjects.length === 0">
                <td colspan="4" class="text-center text-muted">
                  No subjects yet for this stage. Click Add Subject to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ToastNotification :show="showToast" :title="toastTitle" :message="toastMessage" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { examCatalogService } from '@/services/examCatalogService'
import { examSyllabusService } from '@/services/examSyllabusService'
import type { ExamProgram, ExamStage, ExamSyllabusItem } from '@/types/exam'
import {
  collectStageSubjects,
  examSyllabusQueryString,
  parseExamSyllabusQuery,
  programLabel,
} from '@/utils/examSyllabus'
import ToastNotification from '@/components/common/ToastNotification.vue'

const route = useRoute()
const router = useRouter()
const ctx = parseExamSyllabusQuery(route)

const program = ref<ExamProgram | null>(null)
const stages = ref<ExamStage[]>([])
const subjects = ref<ExamSyllabusItem[]>([])
const selectedStage = ref<number | null>(ctx.stageId ?? null)
const loading = ref(false)

const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('info')

function notify(type: 'success' | 'error', message: string) {
  toastTitle.value = type === 'success' ? 'Success' : 'Error'
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

function examScope(): 'ENTRANCE' | 'COMPETITIVE' {
  const code = program.value?.exam_body?.exam_category?.code
  return code === 'ENTRANCE' ? 'ENTRANCE' : 'COMPETITIVE'
}

function syllabusQuery() {
  const stage = stages.value.find((s) => s.id === selectedStage.value)
  return examSyllabusQueryString({
    programId: ctx.programId,
    scope: examScope(),
    programName: program.value ? programLabel(program.value) : ctx.programName,
    stageId: selectedStage.value,
    stageName: stage?.name ?? ctx.stageName,
  })
}

function syncBreadcrumbQuery() {
  router.replace({ query: syllabusQuery() })
}

function goBack() {
  const scope = examScope()
  router.push({
    name: 'SyllabusDashboard',
    query: { scope, programId: String(ctx.programId), ...syllabusQuery() },
  })
}

function goToChapters(subject: ExamSyllabusItem) {
  router.push({
    name: 'examSyllabusChapters',
    params: { programId: String(ctx.programId), subjectId: String(subject.id) },
    query: examSyllabusQueryString({
      programId: ctx.programId,
      scope: examScope(),
      programName: program.value ? programLabel(program.value) : ctx.programName,
      stageId: selectedStage.value,
      stageName: stages.value.find((s) => s.id === selectedStage.value)?.name ?? ctx.stageName,
      subjectName: subject.name,
    }),
  })
}

function onStageChange() {
  syncBreadcrumbQuery()
  loadSubjects()
}

async function loadSubjects() {
  if (!selectedStage.value) {
    subjects.value = []
    return
  }
  loading.value = true
  try {
    const tree = await examSyllabusService.getTree(ctx.programId, selectedStage.value)
    subjects.value = collectStageSubjects(tree, selectedStage.value)
  } catch {
    notify('error', 'Failed to load subjects')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const [prog, stageList] = await Promise.all([
      examCatalogService.getProgram(ctx.programId),
      examCatalogService.getStages(ctx.programId),
    ])
    program.value = prog
    stages.value = stageList

    if (!selectedStage.value && stageList.length === 1) {
      selectedStage.value = stageList[0].id
    }

    syncBreadcrumbQuery()

    if (!selectedStage.value && stageList.length > 1) {
      notify('error', 'Please select a stage to view subjects.')
      return
    }

    await loadSubjects()
  } catch {
    notify('error', 'Failed to load exam')
  }
})
</script>

<style scoped>
.manage-icon { cursor: pointer; }
</style>
