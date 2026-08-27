<template>
  <!-- Main Container -->
  <div class="container mt-4 mb-5">
    <div class="row p-2 g-2 mb-1">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10 col-md-10">
          <h5 class="text-left m-0 fw-bolder text-uppercase">QUESTION BANK MANAGEMENT</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Scope: school board vs competitive/entrance -->
    <div class="row p-2 justify-content-center mb-3">
      <div class="col-12 col-sm-10 col-md-8">
        <ul class="nav nav-tabs category-tabs">
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: questionScope === 'board' }"
              @click="questionScope = 'board'"
            >
              School Board
            </button>
          </li>
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: questionScope === 'exam' }"
              @click="questionScope = 'exam'"
            >
              Competitive / Entrance
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="row gy-2 g-3 justify-content-center">
      <form v-if="questionScope === 'board'" id="viewQuestionForm" @submit.prevent="viewQuestions">
        <div class="row gy-2 justify-content-center">
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Board Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterBoard"
                label="Board"
                placeholder="Search for Board"
                :items="boards"
                v-model="selectedBoard"
                :search-keys="['name', 'abbreviation']"
                required
                @change="handleBoardChange"
                next-field-id="filterMedium"
              >
                <template #label>Board <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Medium Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterMedium"
                label="Medium"
                placeholder="Search for Medium"
                :items="mediums"
                v-model="selectedMedium"
                :search-keys="['instruction_medium']"
                :disabled="!selectedBoard"
                required
                @change="handleMediumChange"
                next-field-id="filterClass"
                label-key="instruction_medium"
              >
                <template #label>Medium <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Class Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterClass"
                label="Standard"
                placeholder="Search for Standard"
                :items="standards"
                v-model="selectedStandard"
                :search-keys="['name']"
                :disabled="!selectedMedium"
                required
                @change="handleStandardChange"
                next-field-id="filterSubject"
              >
                <template #label>Standard <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Subject Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterSubject"
                label="Subject"
                placeholder="Search for Subject"
                :items="subjects"
                v-model="selectedSubject"
                :search-keys="['name', 'subject_name', 'subject']"
                :disabled="!selectedBoard"
                required
                @change="handleSubjectChange"
                next-field-id="filterChapter"
                label-key="name"
                item-key="id"
              >
                <template #label>Subject <span class="text-danger">*</span></template>
                <template #item="{ item }">
                  {{ item.name || item.subject_name || item.subject }}
                </template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Chapter Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterChapter"
                label="Chapter"
                placeholder="Search for Chapter"
                :items="chapters"
                v-model="selectedChapter"
                :search-keys="['name']"
                :disabled="!selectedSubject || !selectedStandard"
                required
                label-key="name"
              >
                <template #label>Chapter <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <!-- View Questions Button -->
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewQuestionBtn"
              :disabled="!isFormValid"
            >
              View Questions
            </button>
          </div>
        </div>
      </form>

      <form v-else id="viewExamQuestionForm" @submit.prevent="viewExamQuestions">
        <div class="row gy-2 justify-content-center">
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterExamProgram"
                label="Exam"
                placeholder="Search for exam (UPSC, JEE, NEET...)"
                :items="examPrograms"
                v-model="selectedExamProgram"
                :search-keys="['name', 'label']"
                label-key="label"
                required
                @change="handleExamProgramChange"
              >
                <template #label>Exam Program <span class="text-danger">*</span></template>
                <template #item="{ item }">{{ item.label }}</template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterExamLanguage"
                label="Language"
                placeholder="Select language (English, Hindi, Marathi…)"
                :items="examLanguages"
                v-model="selectedExamLanguage"
                :search-keys="['name', 'code']"
                label-key="name"
                required
              >
                <template #label>Language <span class="text-danger">*</span></template>
                <template #item="{ item }">{{ item.name }}</template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterExamStage"
                label="Stage"
                placeholder="Select exam stage"
                :items="examStages"
                v-model="selectedExamStage"
                :search-keys="['name']"
                label-key="name"
                :disabled="!selectedExamProgram || loadingExamSyllabus"
                :required="examStages.length > 0"
                @change="handleExamStageChange"
              >
                <template #label>Stage <span v-if="examStages.length" class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterExamSubject"
                label="Subject"
                placeholder="Select subject"
                :items="examSubjects"
                v-model="selectedExamSubject"
                :search-keys="['name']"
                label-key="name"
                :disabled="!selectedExamProgram || loadingExamSyllabus || (examStages.length > 0 && !selectedExamStage)"
                required
                @change="handleExamSubjectChange"
              >
                <template #label>Subject <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterExamChapter"
                label="Chapter"
                placeholder="Select chapter"
                :items="examChapters"
                v-model="selectedExamChapter"
                :search-keys="['name']"
                label-key="name"
                :disabled="!selectedExamSubject || loadingExamSyllabus"
                required
                @change="handleExamChapterChange"
              >
                <template #label>Chapter <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterExamTopic"
                label="Topic"
                placeholder="All topics in chapter (optional)"
                :items="examTopics"
                v-model="selectedExamTopic"
                :search-keys="['name']"
                label-key="name"
                :disabled="!selectedExamChapter || loadingExamSyllabus || examTopics.length === 0"
              >
                <template #label>
                  Topic
                  <span v-if="examTopics.length" class="text-muted small">(optional)</span>
                </template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <button
              type="submit"
              class="btn btn-dark mt-3"
              :disabled="!isExamFormValid || loadingExamSyllabus"
            >
              View Questions
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import { examCatalogService } from '@/services/examCatalogService'
import type { ExamProgram, ExamStage, ExamSyllabusItem, Language } from '@/types/exam'
import { collectStageSubjects, getChildItems } from '@/utils/examSyllabus'

// Component name (for linter)
defineOptions({
  name: 'QuestionBank'
})

// Define interfaces for data structures
interface Board {
  id: number
  name: string
  abbreviation: string
  standards: Standard[]
  instruction_mediums: Medium[]
  subjects?: Subject[]
}

interface Standard {
  id: number
  board_id: number
  name: string
}

interface Subject {
  id: number
  board_id: number
  name: string
  mediumStandardSubjectId?: number
}

interface Medium {
  id: number
  board_id: number
  instruction_medium: string
}

interface Chapter {
  id: number
  name: string
  description?: string
}

const router = useRouter()
const route = useRoute()

const questionScope = ref<'board' | 'exam'>('board')
const examPrograms = ref<Array<ExamProgram & { label: string }>>([])
const selectedExamProgram = ref<(ExamProgram & { label: string }) | null>(null)
const examStages = ref<ExamStage[]>([])
const selectedExamStage = ref<ExamStage | null>(null)
const examSubjects = ref<ExamSyllabusItem[]>([])
const selectedExamSubject = ref<ExamSyllabusItem | null>(null)
const examChapters = ref<ExamSyllabusItem[]>([])
const selectedExamChapter = ref<ExamSyllabusItem | null>(null)
const examTopics = ref<ExamSyllabusItem[]>([])
const selectedExamTopic = ref<ExamSyllabusItem | null>(null)
const examSyllabusTree = ref<ExamSyllabusItem[]>([])
const loadingExamSyllabus = ref(false)
const examLanguages = ref<Language[]>([])
const selectedExamLanguage = ref<Language | null>(null)

// Data
const boards = ref<Board[]>([])
const standards = ref<Standard[]>([])
const subjects = ref<Subject[]>([])
const mediums = ref<Medium[]>([])
const chapters = ref<Chapter[]>([])

// Selected items (objects instead of IDs)
const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)
const selectedChapter = ref<Chapter | null>(null)

const isFormValid = computed(() => {
  return (
    selectedBoard.value !== null &&
    selectedMedium.value !== null &&
    selectedStandard.value !== null &&
    selectedSubject.value !== null &&
    selectedChapter.value !== null
  )
})

const isExamFormValid = computed(() => {
  const stageOk = examStages.value.length === 0 || selectedExamStage.value !== null
  return (
    selectedExamProgram.value !== null &&
    selectedExamSubject.value !== null &&
    selectedExamChapter.value !== null &&
    selectedExamLanguage.value !== null &&
    !!selectedExamLanguage.value.instruction_medium_id &&
    stageOk
  )
})

async function loadExamLanguages() {
  try {
    examLanguages.value = await examCatalogService.getLanguages()
  } catch (error) {
    console.error('Error fetching exam languages:', error)
    examLanguages.value = []
  }
}

function refreshExamSubjects() {
  if (!selectedExamProgram.value) {
    examSubjects.value = []
    return
  }
  examSubjects.value = collectStageSubjects(examSyllabusTree.value, selectedExamStage.value?.id ?? null)
}

function refreshExamChapters() {
  if (!selectedExamSubject.value) {
    examChapters.value = []
    return
  }
  examChapters.value = getChildItems(examSyllabusTree.value, selectedExamSubject.value.id, 'CHAPTER')
}

function refreshExamTopics() {
  if (!selectedExamChapter.value) {
    examTopics.value = []
    return
  }
  examTopics.value = getChildItems(examSyllabusTree.value, selectedExamChapter.value.id, 'TOPIC')
}

async function handleExamProgramChange() {
  selectedExamStage.value = null
  selectedExamSubject.value = null
  selectedExamChapter.value = null
  selectedExamTopic.value = null
  examStages.value = []
  examSubjects.value = []
  examChapters.value = []
  examTopics.value = []
  examSyllabusTree.value = []
  if (!selectedExamProgram.value) return

  loadingExamSyllabus.value = true
  try {
    const [stages, tree] = await Promise.all([
      examCatalogService.getStages(selectedExamProgram.value.id),
      examCatalogService.getSyllabusTree(selectedExamProgram.value.id),
    ])
    examStages.value = stages
    examSyllabusTree.value = tree
    if (stages.length === 1) {
      selectedExamStage.value = stages[0]
    }
    refreshExamSubjects()
  } catch (error) {
    console.error('Error loading exam syllabus:', error)
    examStages.value = []
    examSyllabusTree.value = []
  } finally {
    loadingExamSyllabus.value = false
  }
}

function handleExamStageChange() {
  selectedExamSubject.value = null
  selectedExamChapter.value = null
  selectedExamTopic.value = null
  examChapters.value = []
  examTopics.value = []
  refreshExamSubjects()
}

function handleExamSubjectChange() {
  selectedExamChapter.value = null
  selectedExamTopic.value = null
  examTopics.value = []
  refreshExamChapters()
}

function handleExamChapterChange() {
  selectedExamTopic.value = null
  refreshExamTopics()
}

function applyExamLanguageFromQuery(languageId: unknown, mediumId: unknown) {
  if (!examLanguages.value.length) return
  if (languageId) {
    selectedExamLanguage.value =
      examLanguages.value.find((l) => String(l.id) === String(languageId)) ?? null
    return
  }
  if (!mediumId) return
  selectedExamLanguage.value =
    examLanguages.value.find((l) => String(l.instruction_medium_id) === String(mediumId)) ??
    examLanguages.value.find(
      (l) => l.name.toLowerCase() === String(route.query.mediumName ?? '').toLowerCase(),
    ) ??
    null
}

function applyExamHierarchyFromQuery(stageId: unknown, subjectId: unknown, chapterId: unknown, topicId: unknown) {
  if (stageId && examStages.value.length) {
    selectedExamStage.value = examStages.value.find((s) => String(s.id) === String(stageId)) ?? null
    refreshExamSubjects()
  }
  if (subjectId) {
    selectedExamSubject.value =
      examSubjects.value.find((s) => String(s.id) === String(subjectId)) ?? null
    refreshExamChapters()
  }
  if (chapterId) {
    selectedExamChapter.value =
      examChapters.value.find((c) => String(c.id) === String(chapterId)) ?? null
    refreshExamTopics()
  }
  if (topicId) {
    selectedExamTopic.value =
      examTopics.value.find((t) => String(t.id) === String(topicId)) ?? null
  }
}

function applyStoredExamLanguage(parsed: Record<string, any>) {
  if (selectedExamLanguage.value || !examLanguages.value.length) return
  if (parsed.languageId) {
    selectedExamLanguage.value =
      examLanguages.value.find((l) => String(l.id) === String(parsed.languageId)) ?? null
    return
  }
  if (!parsed.mediumId) return
  selectedExamLanguage.value =
    examLanguages.value.find(
      (l) => String(l.instruction_medium_id) === String(parsed.mediumId),
    ) ??
    examLanguages.value.find(
      (l) => l.name.toLowerCase() === String(parsed.mediumName ?? '').toLowerCase(),
    ) ??
    null
}

function applyStoredExamHierarchy(parsed: Record<string, any>) {
  if (!selectedExamStage.value && parsed.stageId && examStages.value.length) {
    selectedExamStage.value =
      examStages.value.find((s) => String(s.id) === String(parsed.stageId)) ?? null
    refreshExamSubjects()
  }
  if (!selectedExamSubject.value && parsed.subjectId) {
    selectedExamSubject.value =
      examSubjects.value.find((s) => String(s.id) === String(parsed.subjectId)) ?? null
    refreshExamChapters()
  }
  if (!selectedExamChapter.value && (parsed.chapterId || parsed.nodeId)) {
    const cid = parsed.chapterId ?? parsed.nodeId
    selectedExamChapter.value =
      examChapters.value.find((c) => String(c.id) === String(cid)) ?? null
    refreshExamTopics()
  }
  if (!selectedExamTopic.value && parsed.topicId) {
    selectedExamTopic.value =
      examTopics.value.find((t) => String(t.id) === String(parsed.topicId)) ?? null
  }
}

function applyStoredExamSelections() {
  const storedData = localStorage.getItem('questionBank')
  if (!storedData) return
  try {
    const parsed = JSON.parse(storedData)
    applyStoredExamLanguage(parsed)
    applyStoredExamHierarchy(parsed)
  } catch {
    // ignore invalid localStorage
  }
}

async function preselectExamFromQuery() {
  const scope = route.query.scope
  const programId = route.query.programId
  const chapterId = route.query.chapterId ?? route.query.nodeId
  const topicId = route.query.topicId
  const stageId = route.query.stageId
  const subjectId = route.query.subjectId
  const languageId = route.query.languageId
  const mediumId = route.query.mediumId
  if (scope !== 'exam' || !programId) return

  questionScope.value = 'exam'
  const match = examPrograms.value.find((p) => String(p.id) === String(programId))
  if (!match) return

  selectedExamProgram.value = match
  await handleExamProgramChange()
  applyExamLanguageFromQuery(languageId, mediumId)
  applyExamHierarchyFromQuery(stageId, subjectId, chapterId, topicId)
  applyStoredExamSelections()
}

async function loadExamPrograms() {
  try {
    const [entrance, competitive] = await Promise.all([
      examCatalogService.getPrograms({ category: 'ENTRANCE' }),
      examCatalogService.getPrograms({ category: 'COMPETITIVE' }),
    ])
    examPrograms.value = [...entrance, ...competitive].map((program) => ({
      ...program,
      label: `${program.exam_body?.abbreviation ?? ''} — ${program.name}`.trim(),
    }))
  } catch (error) {
    console.error('Error fetching exam programs:', error)
    examPrograms.value = []
  }
}

// Methods
const fetchBoards = async () => {
  try {
    const response = await axiosInstance.get('/boards')
    boards.value = response.data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

const handleBoardChange = async () => {
  if (!selectedBoard.value) {
    resetForm()
    return
  }

  // Reset dependent fields
  selectedMedium.value = null
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  subjects.value = []
  mediums.value = []

  try {
    // Fetch board details using the specific API endpoint that returns all data in one call
    const response = await axiosInstance.get(`/boards/${selectedBoard.value.id}`)

    // Extract data from the response
    const boardDetails = response.data

    // Update the selected board with the full details
    selectedBoard.value = boardDetails

    // Set mediums and standards from the API response
    mediums.value = boardDetails.instruction_mediums || []
    standards.value = boardDetails.standards || []

    console.log('Board details fetched successfully:', boardDetails)
    console.log('Mediums:', mediums.value)
    console.log('Standards:', standards.value)
  } catch (error) {
    console.error('Error fetching board details:', error)
    resetForm()
  }
}

const handleMediumChange = () => {
  // Reset dependent fields
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  subjects.value = [] // Clear subjects as they depend on both medium and standard
}

const handleStandardChange = async () => {
  // Reset dependent fields
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  
  // Fetch subjects for this specific combination
  if (selectedStandard.value && selectedMedium.value && selectedBoard.value) {
    await fetchSubjects()
  }
}

const handleSubjectChange = async () => {
  // Reset chapter selection
  selectedChapter.value = null
  chapters.value = []

  // If we have a standard, subject, and medium, fetch chapters
  if (selectedStandard.value && selectedSubject.value && selectedMedium.value) {
    await fetchChapters()
  }
}

const fetchChapters = async () => {
  try {
    if (!selectedStandard.value || !selectedSubject.value || !selectedMedium.value) return

    console.log('Fetching chapters with standardId:', selectedStandard.value.id,
                'subjectId:', selectedSubject.value.id,
                'and mediumId:', selectedMedium.value.id)

    const response = await axiosInstance.get('/chapters', {
      params: {
        standardId: selectedStandard.value.id,
        subjectId: selectedSubject.value.id,
        mediumId: selectedMedium.value.id
      }
    })

    console.log('Raw chapter response:', response.data)

    // Make sure chapters have the expected structure
    if (Array.isArray(response.data)) {
      chapters.value = response.data
    } else if (response.data && Array.isArray(response.data.chapters)) {
      chapters.value = response.data.chapters
    } else {
      console.error('Unexpected chapter data structure:', response.data)
      chapters.value = []
    }

    console.log('Processed chapters:', chapters.value)
    console.log('Sample chapter:', chapters.value.length > 0 ? chapters.value[0] : 'No chapters')
  } catch (error) {
    console.error('Error fetching chapters:', error)
    chapters.value = []
  }
}

const fetchSubjects = async () => {
  try {
    if (!selectedBoard.value || !selectedMedium.value || !selectedStandard.value) {
      subjects.value = []
      return
    }

    console.log('Fetching subjects with boardId:', selectedBoard.value.id,
                'mediumId:', selectedMedium.value.id,
                'and standardId:', selectedStandard.value.id)

    // Use the medium-standard-subjects API endpoint with query parameters
    const response = await axiosInstance.get(
      `/medium-standard-subjects?boardId=${selectedBoard.value.id}&instruction_medium_id=${selectedMedium.value.id}&standard_id=${selectedStandard.value.id}`
    )

    console.log('Raw subjects response:', response.data)

    // Map the response data to our subjects array
    subjects.value = response.data.map((item: any) => ({
      id: item.subject.id,
      name: item.subject.name,
      board_id: selectedBoard.value!.id,
      mediumStandardSubjectId: item.id
    }))

    console.log('Processed subjects:', subjects.value)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    subjects.value = []
  }
}

const resetForm = () => {
  selectedMedium.value = null
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  standards.value = []
  subjects.value = []
  mediums.value = []
  chapters.value = []
}

const viewQuestions = () => {
  if (!isFormValid.value) return

  // Store selected values in localStorage or state management
  localStorage.setItem('questionBank', JSON.stringify({
    scope: 'board',
    boardId: selectedBoard.value?.id,
    boardName: selectedBoard.value?.name ?? '',
    mediumId: selectedMedium.value?.id,
    mediumName: selectedMedium.value?.instruction_medium ?? '',
    standardId: selectedStandard.value?.id,
    standardName: selectedStandard.value?.name ?? '',
    subjectId: selectedSubject.value?.id,
    subjectName: selectedSubject.value?.name ?? '',
    chapterId: selectedChapter.value?.id,
    chapterName: selectedChapter.value?.name ?? '',
    mediumStandardSubjectId: selectedSubject.value?.mediumStandardSubjectId ?? null
  }))

  // Navigate to question dashboard page
  router.push({ name: 'questionDashboard' })
}

const viewExamQuestions = () => {
  if (
    !isExamFormValid.value ||
    !selectedExamProgram.value ||
    !selectedExamChapter.value ||
    !selectedExamLanguage.value?.instruction_medium_id
  ) {
    return
  }

  const leafNode = selectedExamTopic.value ?? selectedExamChapter.value
  const language = selectedExamLanguage.value

  localStorage.setItem(
    'questionBank',
    JSON.stringify({
      scope: 'exam',
      programId: selectedExamProgram.value.id,
      programLabel: selectedExamProgram.value.label,
      stageId: selectedExamStage.value?.id ?? null,
      stageName: selectedExamStage.value?.name ?? '',
      subjectId: selectedExamSubject.value?.id,
      subjectName: selectedExamSubject.value?.name ?? '',
      chapterId: selectedExamChapter.value.id,
      chapterName: selectedExamChapter.value.name,
      topicId: selectedExamTopic.value?.id ?? null,
      topicName: selectedExamTopic.value?.name ?? '',
      nodeId: leafNode.id,
      nodeName: leafNode.name,
      languageId: language.id,
      languageCode: language.code,
      languageName: language.name,
      // Canonical medium for existing translation / QTTM APIs
      mediumId: language.instruction_medium_id,
      mediumName: language.name,
    }),
  )

  const query: Record<string, string> = {
    scope: 'exam',
    programId: String(selectedExamProgram.value.id),
    chapterId: String(selectedExamChapter.value.id),
    languageId: String(language.id),
    mediumId: String(language.instruction_medium_id),
    mediumName: language.name,
  }
  if (selectedExamStage.value) query.stageId = String(selectedExamStage.value.id)
  if (selectedExamSubject.value) query.subjectId = String(selectedExamSubject.value.id)
  if (selectedExamTopic.value) query.topicId = String(selectedExamTopic.value.id)

  router.push({ name: 'questionDashboard', query })
}

function syncScopeQuery() {
  const query = { ...route.query }
  if (questionScope.value === 'exam') {
    query.scope = 'exam'
  } else {
    delete query.scope
    delete query.programId
    delete query.nodeId
    delete query.chapterId
    delete query.topicId
    delete query.stageId
    delete query.subjectId
    delete query.mediumId
    delete query.mediumName
    delete query.languageId
  }
  router.replace({ query }).catch(() => {})
}

watch(questionScope, () => {
  syncScopeQuery()
})

// Lifecycle hooks
onMounted(async () => {
  if (route.query.scope === 'exam') {
    questionScope.value = 'exam'
  }

  fetchBoards()
  await loadExamPrograms()
  await loadExamLanguages()
  await preselectExamFromQuery()
})
</script>

<style scoped>
.category-tabs {
  border-bottom: 2px solid #dee2e6;
}

.category-tabs .nav-link {
  color: #495057;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.5rem 1rem;
  font-weight: 500;
  background: transparent;
}

.category-tabs .nav-link:hover {
  color: #212529;
  border-bottom-color: #adb5bd;
}

.category-tabs .nav-link.active {
  color: #212529;
  font-weight: 600;
  border-bottom-color: #212529;
  background: transparent;
}

/* Styles for nav link */
#navQuestion {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navQuestion {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

/* Form styles */
.form-floating > label {
  left: 0.5rem;
}

/* Button styles */
.btn-dark {
  min-width: 150px;
}

.btn-dark:hover:not(:disabled):not(.disabled) {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled,
.btn-dark.disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}
</style>
