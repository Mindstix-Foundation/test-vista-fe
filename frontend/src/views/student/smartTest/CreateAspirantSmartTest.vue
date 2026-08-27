<template>
  <div class="container mt-2 mt-md-4 mb-5 px-3 px-md-4">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 class="fw-bolder text-uppercase mb-1">Create Exam Smart Test</h5>
            <p class="text-muted small mb-0">
              Choose exam, syllabus sections, pattern and weightage. Questions are selected
              automatically — no preview.
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

        <div v-if="loading" class="text-center py-4">
          <output class="spinner-border text-dark"></output>
        </div>

        <template v-else>
          <div v-if="selectedProgram" class="alert alert-light border small mb-3">
            <strong>{{ selectedProgram.name }}</strong>
            <span v-if="selectedStage"> · {{ selectedStage.name }}</span>
            <span v-if="selectedTemplateDetail">
              · {{ selectedTemplateDetail.name }} ({{ selectedTemplateDetail.total_questions }} questions,
              {{ selectedTemplateDetail.total_marks }} marks)
            </span>
          </div>

          <!-- STEP 1: Exam + syllabus sections -->
          <div v-show="step === 1">
            <div class="mb-3">
              <SearchableDropdown
                id="smartProgram"
                label="Exam Program"
                required
                placeholder="Select enrolled exam"
                :items="programItems"
                :model-value="selectedProgram"
                @update:model-value="onProgramChange"
                @change="onProgramChange"
              >
                <template #item="{ item }">{{ item.name }}</template>
              </SearchableDropdown>
            </div>

            <div class="mb-3" v-if="stageItems.length">
              <SearchableDropdown
                id="smartStage"
                label="Stage / Paper"
                placeholder="Select stage / paper"
                :items="stageItems"
                :model-value="selectedStage"
                required
                @update:model-value="onStageChange"
                @change="onStageChange"
              >
                <template #item="{ item }">{{ item.name }}</template>
              </SearchableDropdown>
            </div>

            <div class="card mb-3">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span class="fw-semibold">Syllabus sections *</span>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-dark"
                  @click="toggleAllSyllabus"
                  :disabled="!syllabusSections.length || loadingSyllabus"
                >
                  {{ allSyllabusSelected ? 'Deselect all' : 'Select all' }}
                </button>
              </div>
              <div class="card-body" style="max-height: 280px; overflow: auto">
                <div v-if="loadingSyllabus" class="text-center py-3">
                  <output class="spinner-border spinner-border-sm text-dark"></output>
                  <p class="text-muted small mt-2 mb-0">Loading syllabus...</p>
                </div>
                <div v-else-if="!selectedProgram" class="text-muted small">
                  Select an exam program to load syllabus.
                </div>
                <div v-else-if="!syllabusSections.length" class="text-muted small">
                  No syllabus sections found for this exam{{ selectedStage ? ' / stage' : '' }}.
                </div>
                <div v-else>
                  <div v-for="section in syllabusSections" :key="section.id" class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="`syl-section-${section.id}`"
                      v-model="section.selected"
                      @change="onSyllabusChange"
                    />
                    <label class="form-check-label" :for="`syl-section-${section.id}`">
                      {{ section.name }}
                    </label>
                  </div>
                </div>
              </div>
              <div v-if="selectedSyllabusIds.length" class="card-footer small text-muted py-2">
                {{ selectedSyllabusIds.length }} section(s) selected
              </div>
            </div>
          </div>

          <!-- STEP 2: Pattern -->
          <div v-show="step === 2">
            <p class="text-muted small">
              Select a paper pattern. Only patterns with enough questions in your selected sections
              are shown.
            </p>
            <div v-if="loadingTemplates" class="text-center py-4">
              <output class="spinner-border spinner-border-sm text-dark"></output>
              <p class="text-muted small mt-2 mb-0">Checking patterns against available questions...</p>
            </div>
            <div v-else-if="!templateItems.length" class="alert alert-warning small">
              No paper pattern has enough questions for the selected sections. Go back and select
              different sections.
            </div>
            <div v-else class="list-group mb-3">
              <button
                v-for="tpl in templateItems"
                :key="tpl.id"
                type="button"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                :class="{ active: selectedTemplate?.id === tpl.id }"
                @click="selectTemplate(tpl)"
              >
                <span>{{ tpl.original?.name }}</span>
                <span class="badge" :class="selectedTemplate?.id === tpl.id ? 'bg-light text-dark' : 'bg-dark'">
                  {{ tpl.original?.total_questions }} questions · {{ tpl.original?.total_marks }} marks
                </span>
              </button>
            </div>
          </div>

          <!-- STEP 3: Section weightage -->
          <div v-show="step === 3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-semibold mb-0">Section Weightage</h6>
              <button
                type="button"
                class="btn btn-sm btn-outline-dark"
                @click="distributeEqually"
                :disabled="loadingWeightage || !weightageRows.length"
              >
                Distribute Equally
              </button>
            </div>
            <p class="text-muted small">
              Decide how many questions come from each section. The total must equal
              {{ totalQuestionsNeeded }} questions.
            </p>

            <div v-if="loadingWeightage" class="text-center py-4">
              <output class="spinner-border spinner-border-sm text-dark"></output>
              <p class="text-muted small mt-2 mb-0">Checking question availability...</p>
            </div>

            <div v-else class="table-responsive mb-2">
              <table class="table table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 50%">Section</th>
                    <th class="text-center" style="width: 12%">Share</th>
                    <th class="text-center" style="width: 26%">Questions</th>
                    <th class="text-center" style="width: 12%">Available</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in weightageRows" :key="row.syllabusNodeId">
                    <td class="small fw-medium">{{ row.name }}</td>
                    <td class="text-center">
                      <span class="badge bg-light text-dark">{{ shareOf(row.questions) }}%</span>
                    </td>
                    <td class="text-center">
                      <div class="d-inline-flex align-items-center gap-2">
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm px-2"
                          @click="decrementQuestions(index)"
                          :disabled="row.questions <= 0"
                        >
                          <i class="bi bi-dash"></i>
                        </button>
                        <span class="fw-bold" style="min-width: 2rem">{{ row.questions }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm px-2"
                          @click="incrementQuestions(index)"
                          :disabled="row.questions >= row.available"
                        >
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td class="text-center text-muted small">{{ row.available }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-between align-items-center border-top pt-2 mb-3 small">
              <div>
                <span class="text-muted me-1">Total:</span>
                <span class="badge bg-secondary rounded-pill">{{ totalQuestionsNeeded }}</span>
              </div>
              <div>
                <span class="text-muted me-1">Assigned:</span>
                <span
                  class="badge rounded-pill"
                  :class="assignedQuestions === totalQuestionsNeeded ? 'bg-success' : assignedQuestions > totalQuestionsNeeded ? 'bg-danger' : 'bg-warning text-dark'"
                >
                  {{ assignedQuestions }}
                </span>
              </div>
              <div>
                <span class="text-muted me-1">{{ totalQuestionsNeeded - assignedQuestions >= 0 ? 'Remaining:' : 'Excess:' }}</span>
                <span
                  class="badge rounded-pill"
                  :class="totalQuestionsNeeded - assignedQuestions === 0 ? 'bg-success' : assignedQuestions > totalQuestionsNeeded ? 'bg-danger' : 'bg-warning text-dark'"
                >
                  {{ Math.abs(totalQuestionsNeeded - assignedQuestions) }}
                </span>
              </div>
            </div>
          </div>

          <!-- STEP 4: Settings -->
          <div v-show="step === 4">
            <div class="form-floating mb-3">
              <input id="mockName" class="form-control" v-model="name" maxlength="100" placeholder="Test name" required />
              <label for="mockName">Test name *</label>
            </div>

            <div class="form-floating mb-3">
              <textarea
                id="mockInstructions"
                class="form-control"
                style="height: 90px"
                v-model="instructions"
                maxlength="1000"
                placeholder="Instructions"
              ></textarea>
              <label for="mockInstructions">Instructions (optional)</label>
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
              Questions will be generated automatically from your section weightage. You will not
              see them before the test starts.
            </div>
          </div>

          <div v-if="errorMessage" class="alert alert-danger py-2 small">{{ errorMessage }}</div>

          <!-- Navigation -->
          <div class="d-flex justify-content-between gap-2 mt-3">
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
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SearchableDropdown, { type Item } from '@/components/common/SearchableDropdown.vue'
import { examCatalogService } from '@/services/examCatalogService'
import { smartTestService, type SmartTestContext } from '@/services/smartTestService'
import { collectStageSubjects } from '@/utils/examSyllabus'
import type { ExamStage, PaperTemplate } from '@/types/exam'

interface SelectableSection {
  id: number
  name: string
  selected: boolean
}

interface WeightageRow {
  syllabusNodeId: number
  name: string
  questions: number
  available: number
}

const stepLabels = ['Syllabus', 'Pattern', 'Weightage', 'Settings']

const router = useRouter()
const loading = ref(true)
const loadingSyllabus = ref(false)
const loadingTemplates = ref(false)
const loadingWeightage = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const context = ref<SmartTestContext | null>(null)
const step = ref(1)

const programItems = ref<Item[]>([])
const stageItems = ref<Item[]>([])
const templateItems = ref<(Item & { original?: PaperTemplate })[]>([])
const selectedProgram = ref<Item | null>(null)
const selectedStage = ref<Item | null>(null)
const selectedTemplate = ref<(Item & { original?: PaperTemplate }) | null>(null)
const selectedTemplateDetail = ref<PaperTemplate | null>(null)
const stages = ref<ExamStage[]>([])
const syllabusSections = ref<SelectableSection[]>([])
const weightageRows = ref<WeightageRow[]>([])
const totalQuestionsNeeded = ref(0)
let templateRequestId = 0

const name = ref('')
const instructions = ref('')
const randomizeQuestions = ref(true)
const randomizeOptions = ref(true)

const selectedSyllabusIds = computed(() =>
  syllabusSections.value.filter((s) => s.selected).map((s) => s.id),
)

const allSyllabusSelected = computed(
  () => syllabusSections.value.length > 0 && syllabusSections.value.every((s) => s.selected),
)

const assignedQuestions = computed(() =>
  weightageRows.value.reduce((sum, r) => sum + r.questions, 0),
)

const weightageBalanced = computed(
  () => totalQuestionsNeeded.value > 0 && assignedQuestions.value === totalQuestionsNeeded.value,
)

const canGoNext = computed(() => {
  if (step.value === 1) {
    const hasRequiredStage = !stageItems.value.length || !!selectedStage.value
    return !!selectedProgram.value && hasRequiredStage && selectedSyllabusIds.value.length > 0
  }
  if (step.value === 2) return !!selectedTemplate.value
  if (step.value === 3) return weightageBalanced.value && !loadingWeightage.value
  return true
})

const canSubmit = computed(
  () => !!name.value.trim() && !!selectedTemplate.value && weightageBalanced.value,
)

const goBack = () => router.push({ name: 'smartTest' })

const resetSyllabus = () => {
  syllabusSections.value = []
  templateRequestId += 1
  loadingTemplates.value = false
  resetPatternAndWeightage()
}

const resetPatternAndWeightage = () => {
  templateItems.value = []
  selectedTemplate.value = null
  selectedTemplateDetail.value = null
  weightageRows.value = []
  totalQuestionsNeeded.value = 0
}

const loadSyllabus = async (programId: number, stageId?: number) => {
  loadingSyllabus.value = true
  resetSyllabus()
  try {
    const tree = await examCatalogService.getSyllabusTree(programId, stageId)
    const roots = collectStageSubjects(tree, stageId)
    const source = roots.length ? roots : tree.filter((n) => !n.parent_id)
    syllabusSections.value = source.map((root) => ({
      id: root.id,
      name: root.name,
      selected: false,
    }))
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Failed to load syllabus sections'
  } finally {
    loadingSyllabus.value = false
  }
}

const toggleAllSyllabus = () => {
  const next = !allSyllabusSelected.value
  for (const s of syllabusSections.value) (s.selected = next);
  onSyllabusChange()
}

const onSyllabusChange = () => {
  resetPatternAndWeightage()
}

const onProgramChange = async (item: Item | null) => {
  selectedProgram.value = item
  selectedStage.value = null
  stageItems.value = []
  resetSyllabus()
  if (!item) return

  try {
    const programStages = await examCatalogService.getStages(item.id as number)
    stages.value = programStages
    stageItems.value = programStages.map((s) => ({ id: s.id, name: s.name }))
    if (stageItems.value.length) return
    await loadSyllabus(item.id as number)
  } catch (error) {
    console.error(error)
  }
}

const onStageChange = async (item: Item | null) => {
  selectedStage.value = item
  if (!selectedProgram.value) return
  await loadSyllabus(selectedProgram.value.id as number, item?.id as number | undefined)
}

// --- Step 2: compatible patterns ---
const loadTemplates = async () => {
  if (!selectedProgram.value || !selectedSyllabusIds.value.length) return
  const requestId = ++templateRequestId
  loadingTemplates.value = true
  try {
    const templates = await smartTestService.getTemplates(
      selectedProgram.value.id as number,
      selectedStage.value?.id as number | undefined,
      selectedSyllabusIds.value,
    )
    if (requestId !== templateRequestId) return
    templateItems.value = templates.map((t: any) => ({
      id: t.id,
      name: `${t.name} (${t.total_marks} marks)`,
      original: t,
    }))
  } catch (error) {
    if (requestId !== templateRequestId) return
    console.error(error)
    errorMessage.value = 'Failed to load compatible paper patterns'
  } finally {
    if (requestId === templateRequestId) loadingTemplates.value = false
  }
}

const selectTemplate = (item: Item & { original?: PaperTemplate }) => {
  selectedTemplate.value = item
  selectedTemplateDetail.value = item.original ?? null
  weightageRows.value = []
  totalQuestionsNeeded.value = 0
  if (item.original) {
    name.value = `${item.original.name} — Smart Test`
  }
}

// --- Step 3: weightage ---
const initWeightage = async () => {
  if (!selectedTemplate.value) return
  loadingWeightage.value = true
  errorMessage.value = ''
  try {
    const availability = await smartTestService.getAspirantAvailability(
      selectedTemplate.value.id as number,
      selectedSyllabusIds.value,
    )
    totalQuestionsNeeded.value = availability.total_questions
    weightageRows.value = availability.sections.map((s) => ({
      syllabusNodeId: s.syllabus_node_id,
      name: s.name,
      questions: 0,
      available: s.available_questions,
    }))
    equalizeWeightage()
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message || 'Failed to check question availability'
  } finally {
    loadingWeightage.value = false
  }
}

/** Spread the required total across sections, respecting per-section availability. */
const equalizeWeightage = () => {
  const rows = weightageRows.value
  if (!rows.length || !totalQuestionsNeeded.value) return

  for (const r of rows) (r.questions = 0);
  let remaining = totalQuestionsNeeded.value
  const base = Math.floor(remaining / rows.length)
  for (const row of rows) {
    row.questions = Math.min(base, row.available)
  }
  remaining -= rows.reduce((sum, r) => sum + r.questions, 0)
  // Distribute the remainder to sections that still have headroom
  while (remaining > 0) {
    const candidate = rows.find((r) => r.questions < r.available)
    if (!candidate) break
    candidate.questions += 1
    remaining -= 1
  }
}

const distributeEqually = () => equalizeWeightage()

const shareOf = (questions: number) =>
  totalQuestionsNeeded.value ? Math.round((questions / totalQuestionsNeeded.value) * 100) : 0

const incrementQuestions = (index: number) => {
  const row = weightageRows.value[index]
  if (row.questions < row.available) row.questions += 1
}

const decrementQuestions = (index: number) => {
  const row = weightageRows.value[index]
  if (row.questions > 0) row.questions -= 1
}

// --- Navigation ---
const nextStep = async () => {
  errorMessage.value = ''
  if (step.value === 1) {
    step.value = 2
    if (!templateItems.value.length) await loadTemplates()
  } else if (step.value === 2) {
    step.value = 3
    if (!weightageRows.value.length) await initWeightage()
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
  if (!canSubmit.value || !selectedTemplate.value) {
    errorMessage.value = 'Please fill all required fields'
    return
  }

  submitting.value = true
  try {
    // Only sections applicable to the chosen pattern (as returned by the
    // availability check) are submitted, so weightage and selection match.
    const result = await smartTestService.createAspirant({
      name: name.value.trim(),
      paper_template_id: selectedTemplate.value.id as number,
      syllabus_node_ids: weightageRows.value.map((r) => r.syllabusNodeId),
      syllabus_weightage: weightageRows.value.map((r) => ({
        syllabus_node_id: r.syllabusNodeId,
        questions: r.questions,
      })),
      instructions: instructions.value.trim() || undefined,
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
    programItems.value = (context.value.enrolled_programs || []).map((p) => ({
      id: p.id,
      name: `${p.abbreviation ? p.abbreviation + ' — ' : ''}${p.name}`,
    }))
    if (!programItems.value.length) {
      errorMessage.value = 'You are not enrolled in any exam program.'
    }
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to load Smart Test options'
  } finally {
    loading.value = false
  }
})
</script>
