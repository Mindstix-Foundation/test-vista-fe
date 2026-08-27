<template>
  <div class="container my-4">
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="backRoute" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-1">
        <div class="col col-12 col-sm-5">
          <p v-if="program" class="text-muted text-start fs-5 m-0">{{ programLabel(program) }}</p>
          <h4 class="fw-bolder text-start text-dark m-0">
            {{ subject?.name ?? 'Subject' }} Syllabus
          </h4>
        </div>
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <button id="addChapterButton" class="btn btn-success stick-bottom" @click="goToAddChapter">Add Chapter</button>
        </div>
      </div>
      <hr />
    </div>

    <div class="container mt-2 pt-3 mb-5 pb-3">
      <div v-if="loading" class="text-center py-5">
        <output class="spinner-border text-primary"><span class="visually-hidden">Loading...</span></output>
      </div>
      <div v-else-if="chapters.length === 0" class="text-center py-5 text-muted">
        No chapters added for this subject.
      </div>
      <div v-else class="row p-2 justify-content-center">
        <div class="col-12 col-sm-10">
          <div class="table-responsive">
            <table class="table table-sm table-hover table-striped table-bordered">
              <thead class="table-dark">
                <tr>
                  <th scope="col" style="width: 40px">#</th>
                  <th scope="col">Chapter</th>
                  <th scope="col" class="text-center" style="width: 100px">Topics</th>
                  <th scope="col" class="text-center" style="width: 80px">Manage</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(chapter, index) in chapters" :key="chapter.id">
                  <tr>
                    <th scope="row">{{ index + 1 }}</th>
                    <td>
                      <span class="chapter-link" @click="toggleChapter(chapter.id)">
                        {{ chapter.sequence_number }}. {{ chapter.name }}
                      </span>
                    </td>
                    <td class="text-center">{{ topicsFor(chapter).length }}</td>
                    <td class="text-center">
                      <i class="bi bi-pencil-square me-2 manage-icon" @click="editChapter(chapter)"></i>
                      <i class="bi bi-trash3 text-danger manage-icon" @click="confirmDelete(chapter)"></i>
                    </td>
                  </tr>
                  <tr v-if="expanded[chapter.id]">
                    <td colspan="4" class="bg-light">
                      <ul v-if="topicsFor(chapter).length" class="mb-0">
                        <li v-for="topic in topicsFor(chapter)" :key="topic.id">
                          {{ chapter.sequence_number }}.{{ topic.sequence_number }}. {{ topic.name }}
                        </li>
                      </ul>
                      <span v-else class="text-muted small">No topics yet.</span>
                    </td>
                  </tr>
                </template>
                <tr v-if="chapters.length === 0">
                  <td colspan="4" class="text-center text-muted">No chapters yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="chapterToDelete" class="modal d-block modal-overlay" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Chapter</h5>
            <button type="button" class="btn-close" @click="chapterToDelete = null"></button>
          </div>
          <div class="modal-body">Delete "{{ chapterToDelete.name }}" and all its topics?</div>
          <div class="modal-footer">
            <button class="btn btn-outline-dark" @click="chapterToDelete = null">Cancel</button>
            <button class="btn btn-danger" @click="deleteChapter">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <ToastNotification :show="showToast" :title="toastTitle" :message="toastMessage" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { examCatalogService } from '@/services/examCatalogService'
import { examSyllabusService } from '@/services/examSyllabusService'
import type { ExamProgram, ExamSyllabusItem } from '@/types/exam'
import { examSyllabusQueryString, getChildItems, parseExamSyllabusQuery, programLabel } from '@/utils/examSyllabus'
import ToastNotification from '@/components/common/ToastNotification.vue'

const route = useRoute()
const router = useRouter()
const ctx = parseExamSyllabusQuery(route)
const subjectId = Number(route.params.subjectId)

const program = ref<ExamProgram | null>(null)
const subject = ref<ExamSyllabusItem | null>(null)
const tree = ref<ExamSyllabusItem[]>([])
const chapters = ref<ExamSyllabusItem[]>([])
const loading = ref(false)
const expanded = reactive<Record<number, boolean>>({})
const chapterToDelete = ref<ExamSyllabusItem | null>(null)

const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('info')

function breadcrumbQuery() {
  const scope =
    ctx.scope ?? (program.value?.exam_body?.exam_category?.code === 'ENTRANCE' ? 'ENTRANCE' : 'COMPETITIVE')
  return examSyllabusQueryString({
    programId: ctx.programId,
    scope,
    programName: program.value ? programLabel(program.value) : ctx.programName,
    stageId: ctx.stageId,
    stageName: ctx.stageName,
    subjectName: subject.value?.name ?? ctx.subjectName,
  })
}

function syncBreadcrumbQuery() {
  router.replace({ query: breadcrumbQuery() })
}

const backRoute = computed(() => ({
  name: 'examSyllabusSubjects',
  params: { programId: String(ctx.programId) },
  query: breadcrumbQuery(),
}))

function notify(type: 'success' | 'error', message: string) {
  toastTitle.value = type === 'success' ? 'Success' : 'Error'
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

function topicsFor(chapter: ExamSyllabusItem) {
  return getChildItems(tree.value, chapter.id, 'TOPIC')
}

function toggleChapter(id: number) {
  expanded[id] = !expanded[id]
}

function goToAddChapter() {
  router.push({
    name: 'examAddChapter',
    params: { programId: String(ctx.programId), subjectId: String(subjectId) },
    query: breadcrumbQuery(),
  })
}

function editChapter(chapter: ExamSyllabusItem) {
  router.push({
    name: 'examEditChapter',
    params: {
      programId: String(ctx.programId),
      subjectId: String(subjectId),
      chapterId: String(chapter.id),
    },
    query: breadcrumbQuery(),
  })
}

function confirmDelete(chapter: ExamSyllabusItem) {
  chapterToDelete.value = chapter
}

async function deleteChapter() {
  if (!chapterToDelete.value) return
  try {
    await examSyllabusService.deleteChapter(chapterToDelete.value.id)
    chapterToDelete.value = null
    notify('success', 'Chapter deleted')
    await loadChapters()
  } catch (error: any) {
    notify('error', error?.response?.data?.message ?? 'Failed to delete chapter')
  }
}

async function loadChapters() {
  loading.value = true
  try {
    const [prog, subj, treeData] = await Promise.all([
      examCatalogService.getProgram(ctx.programId),
      examSyllabusService.getSubject(subjectId),
      examSyllabusService.getTree(ctx.programId, ctx.stageId ?? undefined),
    ])
    program.value = prog
    subject.value = subj
    tree.value = treeData
    chapters.value = getChildItems(treeData, subjectId, 'CHAPTER')
    syncBreadcrumbQuery()
  } catch {
    notify('error', 'Failed to load chapters')
  } finally {
    loading.value = false
  }
}

onMounted(loadChapters)
</script>

<style scoped>
.modal-overlay { background: rgba(0, 0, 0, 0.5); }
.manage-icon { cursor: pointer; }
.chapter-link { cursor: pointer; text-decoration: underline; }
@media (max-width: 576px) {
  .dynamic-style { position: fixed; bottom: 0; left: 0; width: 100%; background: white; padding: 1rem; z-index: 1000; }
  #addChapterButton { width: 100% !important; }
}
</style>
