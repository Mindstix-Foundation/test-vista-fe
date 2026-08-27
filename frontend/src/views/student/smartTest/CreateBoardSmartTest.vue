<template>
  <div class="container mt-2 mt-md-4 mb-5 px-3 px-md-4">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 class="fw-bolder text-uppercase mb-1">Create Board Smart Test</h5>
            <p class="text-muted small mb-0">
              Choose syllabus, pattern and chapter weightage. Questions are picked automatically —
              no preview or editing.
            </p>
          </div>
          <button class="btn btn-close" @click="goBack" aria-label="Close"></button>
        </div>

        <!-- Step indicator -->
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
          <template v-for="(label, idx) in stepLabels" :key="idx">
            <span
              class="badge rounded-pill"
              :class="step === idx + 1 ? 'bg-dark' : step > idx + 1 ? 'bg-success' : 'bg-secondary-subtle text-dark'"
            >
              {{ idx + 1 }}. {{ label }}
            </span>
            <i v-if="idx < stepLabels.length - 1" class="bi bi-chevron-right small text-muted"></i>
          </template>
        </div>
        <hr />

        <div v-if="loadingContext" class="text-center py-4">
          <output class="spinner-border text-dark"></output>
        </div>

        <template v-else>
          <div class="alert alert-light border small mb-3">
            <strong>{{ context?.school.name }}</strong>
            · {{ context?.standard.name }}
            <span v-if="context?.school.board_name"> · {{ context.school.board_name }}</span>
            <span v-if="selectedSubject"> · {{ selectedSubject.name }}</span>
            <span v-if="selectedPattern"> · {{ selectedPattern.name }} ({{ selectedPattern.total_marks }} marks)</span>
          </div>

          <div v-if="boardBlockedForAspirant" class="alert alert-warning small mb-3">
            <strong>Board Smart Tests are for school students.</strong>
            You are an aspirant on Open Learning — use
            <router-link :to="{ name: 'createAspirantSmartTest' }">Create Exam Smart Test</router-link>
            instead.
          </div>

          <div
            v-else-if="!mediums.length && !loadingContext"
            class="alert alert-info small mb-3"
          >
            No instruction mediums are configured for your school.
            Join an approved school with board curriculum, or ask your school admin to set up mediums.
          </div>

          <!-- STEP 1: Syllabus (medium, subject, chapters, source) -->
          <div v-show="step === 1 && !boardBlockedForAspirant">
            <div class="card mb-3">
              <div class="card-header bg-light fw-semibold">Instruction Medium *</div>
              <div class="card-body">
                <div v-for="medium in mediums" :key="medium.id" class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`medium-${medium.id}`"
                    v-model="medium.selected"
                    @change="onMediumChange"
                  />
                  <label class="form-check-label" :for="`medium-${medium.id}`">{{ medium.name }}</label>
                </div>
                <div v-if="!mediums.length" class="text-muted small">No mediums found for your school.</div>
              </div>
            </div>

            <div class="mb-3">
              <SearchableDropdown
                id="smartSubject"
                label="Subject"
                required
                placeholder="Select subject"
                :items="subjects"
                :model-value="selectedSubject"
                :disabled="!selectedMediumIds.length"
                @update:model-value="onSubjectChange"
                @change="onSubjectChange"
              >
                <template #item="{ item }">{{ item.name }}</template>
              </SearchableDropdown>
            </div>

            <div class="card mb-3">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span class="fw-semibold">Chapters *</span>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-dark"
                  @click="toggleAllChapters"
                  :disabled="!chapters.length"
                >
                  {{ allChaptersSelected ? 'Deselect all' : 'Select all' }}
                </button>
              </div>
              <div class="card-body" style="max-height: 220px; overflow: auto">
                <div v-for="chapter in chapters" :key="chapter.id" class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`ch-${chapter.id}`"
                    v-model="chapter.selected"
                    @change="onChapterChange"
                  />
                  <label class="form-check-label" :for="`ch-${chapter.id}`">{{ chapter.name }}</label>
                </div>
                <div v-if="!chapters.length" class="text-muted small">Select a subject to load chapters.</div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="board-question-source">Question source *</label>
              <select id="board-question-source" class="form-select" v-model="questionSource" @change="onQuestionSourceChange">
                <option value="both">Board and other questions</option>
                <option value="board">Board only</option>
                <option value="other">Other only</option>
              </select>
            </div>
          </div>

          <!-- STEP 2: Pattern -->
          <div v-show="step === 2">
            <p class="text-muted small">
              Select a paper pattern. The pattern decides total marks and the section structure of your test.
            </p>
            <div v-if="loadingPatterns" class="text-center py-4">
              <output class="spinner-border spinner-border-sm text-dark"></output>
              <p class="text-muted small mt-2 mb-0">Loading patterns...</p>
            </div>
            <div v-else-if="!patterns.length" class="alert alert-warning small">
              No patterns available for the selected chapters. Go back and adjust your selection.
            </div>
            <div v-else class="list-group mb-3">
              <button
                v-for="pattern in patterns"
                :key="pattern.id"
                type="button"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                :class="{ active: selectedPattern?.id === pattern.id }"
                @click="selectPattern(pattern)"
              >
                <span>{{ pattern.name }}</span>
                <span class="badge" :class="selectedPattern?.id === pattern.id ? 'bg-light text-dark' : 'bg-dark'">
                  {{ pattern.total_marks }} marks
                </span>
              </button>
            </div>
          </div>

          <!-- STEP 3: Chapter weightage / marks distribution -->
          <div v-show="step === 3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-semibold mb-0">Chapter Marks Distribution</h6>
              <button
                type="button"
                class="btn btn-sm btn-outline-dark"
                @click="distributeEqually"
                :disabled="loadingDistribution"
              >
                <output v-if="loadingDistribution" class="spinner-border spinner-border-sm me-1"></output>
                Distribute Equally
              </button>
            </div>
            <p class="text-muted small">
              Adjust how many marks each chapter contributes. The total must equal
              {{ selectedPattern?.total_marks ?? 0 }} marks.
            </p>

            <div v-if="loadingDistribution && !chapterMarks.length" class="text-center py-4">
              <output class="spinner-border spinner-border-sm text-dark"></output>
              <p class="text-muted small mt-2 mb-0">Preparing chapter distribution...</p>
            </div>

            <div v-else class="table-responsive mb-2">
              <table class="table table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 55%">Chapter</th>
                    <th class="text-center" style="width: 15%">Share</th>
                    <th class="text-center" style="width: 30%">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in chapterMarks" :key="row.chapterId">
                    <td class="small fw-medium">{{ row.chapterName }}</td>
                    <td class="text-center">
                      <span class="badge bg-light text-dark">{{ percentageOf(row.marks) }}%</span>
                    </td>
                    <td class="text-center">
                      <div class="d-inline-flex align-items-center gap-2">
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm px-2"
                          @click="decrementMarks(index)"
                          :disabled="!canDecrement(row)"
                        >
                          <i class="bi bi-dash"></i>
                        </button>
                        <span class="fw-bold" style="min-width: 2rem" :title="validMarksHint(row)">
                          {{ row.marks }}
                        </span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm px-2"
                          @click="incrementMarks(index)"
                          :disabled="!canIncrement(row)"
                        >
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center border-top pt-2 mb-3 small">
              <div>
                <span class="text-muted me-1">Total:</span>
                <span class="badge bg-secondary rounded-pill">{{ patternTotalMarks }}</span>
              </div>
              <div>
                <span class="text-muted me-1">Assigned:</span>
                <span
                  class="badge rounded-pill"
                  :class="assignedMarks === patternTotalMarks ? 'bg-success' : assignedMarks > patternTotalMarks ? 'bg-danger' : 'bg-warning text-dark'"
                >
                  {{ assignedMarks }}
                </span>
              </div>
              <div>
                <span class="text-muted me-1">{{ patternTotalMarks - assignedMarks >= 0 ? 'Remaining:' : 'Excess:' }}</span>
                <span
                  class="badge rounded-pill"
                  :class="patternTotalMarks - assignedMarks === 0 ? 'bg-success' : assignedMarks > patternTotalMarks ? 'bg-danger' : 'bg-warning text-dark'"
                >
                  {{ Math.abs(patternTotalMarks - assignedMarks) }}
                </span>
              </div>
            </div>
          </div>

          <!-- STEP 4: Test settings (no question preview) -->
          <div v-show="step === 4">
            <div class="form-floating mb-3">
              <input id="smartName" class="form-control" v-model="name" placeholder="Test name" maxlength="100" required />
              <label for="smartName">Test name *</label>
            </div>

            <div class="form-floating mb-3">
              <input id="smartDuration" type="number" min="1" max="300" class="form-control" v-model.number="durationMinutes" required />
              <label for="smartDuration">Duration (minutes) *</label>
            </div>

            <div class="form-floating mb-3">
              <textarea
                id="smartInstructions"
                class="form-control"
                style="height: 90px"
                v-model="instructions"
                placeholder="Instructions"
                maxlength="1000"
              ></textarea>
              <label for="smartInstructions">Instructions (optional)</label>
            </div>

            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="negMark" v-model="negativeMarking" />
              <label class="form-check-label" for="negMark">Negative marking</label>
            </div>
            <div class="form-floating mb-3" v-if="negativeMarking">
              <input id="negMarks" type="number" min="0" step="0.25" class="form-control" v-model.number="negativeMarks" />
              <label for="negMarks">Negative marks per wrong answer</label>
            </div>

            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="randQ" v-model="randomizeQuestions" />
              <label class="form-check-label" for="randQ">Randomize question order</label>
            </div>
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="randO" v-model="randomizeOptions" />
              <label class="form-check-label" for="randO">Randomize options</label>
            </div>

            <div class="alert alert-info small">
              <i class="bi bi-stars me-1"></i>
              Questions will be generated automatically from your chapter weightage. You will not see
              them before the test starts.
            </div>
          </div>

          <div v-if="errorMessage" class="alert alert-danger py-2 small">{{ errorMessage }}</div>

          <!-- Navigation buttons -->
          <div
            v-if="!boardBlockedForAspirant"
            class="d-flex justify-content-between gap-2 mt-3"
          >
            <button v-if="step > 1" type="button" class="btn btn-outline-dark" @click="prevStep" :disabled="submitting">
              <i class="bi bi-arrow-left me-1"></i> Back
            </button>
            <span v-else></span>

            <button v-if="step < 4" type="button" class="btn btn-dark" @click="nextStep" :disabled="!canGoNext">
              Next <i class="bi bi-arrow-right ms-1"></i>
            </button>
            <button v-else type="button" class="btn btn-dark" @click="submit" :disabled="submitting || !canSubmit">
              <output v-if="submitting" class="spinner-border spinner-border-sm me-2"></output>
              Generate &amp; Start Smart Test
            </button>
          </div>
          <div v-else class="mt-3">
            <router-link :to="{ name: 'createAspirantSmartTest' }" class="btn btn-dark">
              Create Exam Smart Test
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchableDropdown, { type Item } from '@/components/common/SearchableDropdown.vue'
import {
  smartTestService,
  type SmartTestContext,
  type ChapterMarksRange,
} from '@/services/smartTestService'

interface SelectableMedium { id: number; name: string; selected: boolean }
interface SelectableChapter { id: number; name: string; selected: boolean }
interface ChapterMarksRow { chapterId: number; chapterName: string; marks: number }

const stepLabels = ['Syllabus', 'Pattern', 'Weightage', 'Settings']

const router = useRouter()
const context = ref<SmartTestContext | null>(null)
const loadingContext = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const step = ref(1)

const mediums = ref<SelectableMedium[]>([])
const subjects = ref<Item[]>([])
const selectedSubject = ref<Item | null>(null)
const chapters = ref<SelectableChapter[]>([])
const questionSource = ref<'board' | 'other' | 'both'>('both')

const patterns = ref<(Item & { total_marks?: number })[]>([])
const selectedPattern = ref<(Item & { total_marks?: number }) | null>(null)
const loadingPatterns = ref(false)

const chapterMarks = ref<ChapterMarksRow[]>([])
const chapterMarksRanges = ref<ChapterMarksRange[]>([])
const loadingDistribution = ref(false)

const name = ref('')
const durationMinutes = ref(60)
const instructions = ref('')
const negativeMarking = ref(false)
const negativeMarks = ref(0.25)
const randomizeQuestions = ref(true)
const randomizeOptions = ref(true)

const selectedMediumIds = computed(() => mediums.value.filter((m) => m.selected).map((m) => m.id))
const selectedChapterIds = computed(() => chapters.value.filter((c) => c.selected).map((c) => c.id))
const allChaptersSelected = computed(
  () => chapters.value.length > 0 && chapters.value.every((c) => c.selected),
)

/** Aspirants on Open Learning must use Exam Smart Test, not Board. */
const boardBlockedForAspirant = computed(() => {
  if (!context.value?.is_aspirant) return false
  const schoolName = (context.value.school?.name || '').toLowerCase()
  const boardName = (context.value.school?.board_name || '').toLowerCase()
  return schoolName.includes('open learning') || boardName.includes('open learning')
})

const patternTotalMarks = computed(() => selectedPattern.value?.total_marks ?? 0)
const assignedMarks = computed(() => chapterMarks.value.reduce((sum, c) => sum + c.marks, 0))
const marksBalanced = computed(
  () => patternTotalMarks.value > 0 && assignedMarks.value === patternTotalMarks.value,
)

const canGoNext = computed(() => {
  if (step.value === 1) {
    return selectedMediumIds.value.length > 0 && !!selectedSubject.value && selectedChapterIds.value.length > 0
  }
  if (step.value === 2) return !!selectedPattern.value
  if (step.value === 3) return marksBalanced.value && !loadingDistribution.value
  return true
})

const canSubmit = computed(
  () => !!name.value.trim() && durationMinutes.value >= 1 && marksBalanced.value,
)

const goBack = () => router.push({ name: 'smartTest' })

// --- Step 1 handlers ---
const onMediumChange = async () => {
  selectedSubject.value = null
  subjects.value = []
  chapters.value = []
  resetPatternAndMarks()
  if (!selectedMediumIds.value.length) return
  try {
    const list = await smartTestService.getBoardSubjects(selectedMediumIds.value)
    subjects.value = list.map((s) => ({ id: s.id, name: s.name }))
  } catch (error) {
    console.error(error)
  }
}

const onSubjectChange = async (item: Item | null) => {
  selectedSubject.value = item
  chapters.value = []
  resetPatternAndMarks()
  if (!item) return
  try {
    const list = await smartTestService.getBoardChapters(item.id as number, selectedMediumIds.value)
    chapters.value = list.map((c) => ({ id: c.id, name: c.name, selected: false }))
    name.value = `${item.name} Smart Test - ${new Date().toLocaleDateString()}`
  } catch (error) {
    console.error(error)
  }
}

const onChapterChange = () => resetPatternAndMarks()

const onQuestionSourceChange = () => resetPatternAndMarks()

const toggleAllChapters = () => {
  const next = !allChaptersSelected.value
  for (const c of chapters.value) (c.selected = next);
  onChapterChange()
}

const resetPatternAndMarks = () => {
  patterns.value = []
  selectedPattern.value = null
  chapterMarks.value = []
  chapterMarksRanges.value = []
}

// --- Step 2: patterns ---
const loadPatterns = async () => {
  patterns.value = []
  selectedPattern.value = null
  if (!selectedChapterIds.value.length || !selectedMediumIds.value.length) return
  loadingPatterns.value = true
  try {
    const data = await smartTestService.getBoardPatterns(
      selectedChapterIds.value,
      selectedMediumIds.value,
      questionSource.value,
    )
    patterns.value = (data?.validPatterns || []).map((p) => ({
      id: p.id,
      name: p.pattern_name,
      total_marks: p.total_marks,
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loadingPatterns.value = false
  }
}

const selectPattern = (pattern: Item & { total_marks?: number }) => {
  selectedPattern.value = pattern
  chapterMarks.value = []
  chapterMarksRanges.value = []
}

// --- Step 3: chapter marks distribution ---
const initDistribution = async () => {
  if (!selectedPattern.value) return
  loadingDistribution.value = true
  errorMessage.value = ''
  try {
    const [allocation, ranges] = await Promise.all([
      smartTestService.getBoardAllocation(
        selectedPattern.value.id as number,
        selectedChapterIds.value,
        selectedMediumIds.value,
        questionSource.value,
      ),
      smartTestService.getBoardChapterMarksRanges(
        selectedPattern.value.id as number,
        selectedChapterIds.value,
        selectedMediumIds.value,
        questionSource.value,
      ),
    ])
    chapterMarksRanges.value = ranges
    const chapterNameById = new Map(chapters.value.map((c) => [c.id, c.name]))
    chapterMarks.value = (allocation.chapterMarks || []).map((c) => ({
      chapterId: c.chapterId,
      chapterName: c.chapterName || chapterNameById.get(c.chapterId) || `Chapter ${c.chapterId}`,
      marks: c.absoluteMarks,
    }))
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message || 'Failed to prepare chapter marks distribution'
  } finally {
    loadingDistribution.value = false
  }
}

const distributeEqually = () => initDistribution()

const percentageOf = (marks: number) =>
  patternTotalMarks.value ? Math.round((marks / patternTotalMarks.value) * 100) : 0

const rangeFor = (row: ChapterMarksRow) =>
  chapterMarksRanges.value.find((r) => r.chapterId === row.chapterId)

const canIncrement = (row: ChapterMarksRow) => {
  const range = rangeFor(row)
  if (!range) return true
  return range.possibleMarks.some((m) => m > row.marks)
}

const canDecrement = (row: ChapterMarksRow) => {
  const range = rangeFor(row)
  if (!range) return row.marks > 0
  return range.possibleMarks.some((m) => m < row.marks)
}

const incrementMarks = (index: number) => {
  const row = chapterMarks.value[index]
  const range = rangeFor(row)
  if (!range) {
    row.marks += 1
    return
  }
  const next = range.possibleMarks.find((m) => m > row.marks)
  if (next !== undefined) row.marks = next
}

const decrementMarks = (index: number) => {
  const row = chapterMarks.value[index]
  const range = rangeFor(row)
  if (!range) {
    row.marks = Math.max(0, row.marks - 1)
    return
  }
  const lower = range.possibleMarks.filter((m) => m < row.marks)
  row.marks = lower.length ? Math.max(...lower) : 0
}

const validMarksHint = (row: ChapterMarksRow) => {
  const range = rangeFor(row)
  if (!range) return ''
  return `Valid marks: ${range.minMarks} - ${range.maxMarks}`
}

// --- Navigation ---
const nextStep = async () => {
  errorMessage.value = ''
  if (step.value === 1) {
    step.value = 2
    if (!patterns.value.length) await loadPatterns()
  } else if (step.value === 2) {
    step.value = 3
    if (!chapterMarks.value.length) await initDistribution()
  } else if (step.value === 3) {
    step.value = 4
  }
}

const prevStep = () => {
  errorMessage.value = ''
  if (step.value > 1) step.value -= 1
}

// --- Submit ---
const submit = async () => {
  errorMessage.value = ''
  if (!canSubmit.value || !selectedSubject.value || !selectedPattern.value) {
    errorMessage.value = 'Please fill all required fields'
    return
  }

  submitting.value = true
  try {
    const result = await smartTestService.createBoard({
      name: name.value.trim(),
      medium_ids: selectedMediumIds.value,
      subject_id: selectedSubject.value.id as number,
      chapter_ids: selectedChapterIds.value,
      chapter_marks: chapterMarks.value.map((c) => ({ chapter_id: c.chapterId, marks: c.marks })),
      question_source: questionSource.value,
      pattern_id: selectedPattern.value.id as number,
      duration_minutes: durationMinutes.value,
      instructions: instructions.value.trim() || undefined,
      negative_marking: negativeMarking.value,
      negative_marks_per_question: negativeMarking.value ? negativeMarks.value : undefined,
      randomize_questions: randomizeQuestions.value,
      randomize_options: randomizeOptions.value,
    })

    router.push(`/student/exam/instructions?test=${result.assignment_id}&type=start`)
  } catch (error: any) {
    const apiMsg = error?.response?.data?.message
    errorMessage.value = Array.isArray(apiMsg) ? apiMsg.join(' ') : apiMsg || 'Failed to create Smart Test'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    context.value = await smartTestService.getContext()
    const list = await smartTestService.getBoardMediums()
    mediums.value = list.map((m) => ({ id: m.id, name: m.name, selected: false }))
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to load Smart Test options'
  } finally {
    loadingContext.value = false
  }
})
</script>
