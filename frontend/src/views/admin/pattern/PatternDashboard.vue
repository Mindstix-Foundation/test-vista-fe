<template>
  <div class="container mt-4 mb-2">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">Pattern Management</h5>
          <p v-if="patternScope === 'exam' && examProgramLabel" class="text-muted small mb-0 mt-1">
            {{ examProgramLabel }}
          </p>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <router-link
            v-if="canAddPattern"
            class="btn btn-success stick-bottom"
            id="addButton"
            :to="addPatternLink"
          >
            Add Pattern
          </router-link>
          <button v-else class="btn btn-success stick-bottom" type="button" disabled>
            Add Pattern
          </button>
        </div>
      </div>
      <hr />
    </div>

    <!-- Scope: school board vs competitive/entrance -->
    <div class="row p-2 justify-content-center mb-3">
      <div class="col-12 col-sm-10 col-md-10">
        <ul class="nav nav-tabs category-tabs">
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: patternScope === 'board' }"
              @click="setPatternScope('board')"
            >
              School Board
            </button>
          </li>
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              :class="{ active: patternScope === 'exam' }"
              @click="setPatternScope('exam')"
            >
              Competitive / Entrance
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Exam patterns -->
    <template v-if="patternScope === 'exam'">
      <div class="row p-2 justify-content-center mb-3">
        <div class="col-12 col-sm-10 col-md-10">
          <div class="row g-2">
            <div class="col-12 col-md-6">
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
            <div class="col-12 col-md-6">
              <div class="position-relative">
                <SearchableDropdown
                  id="filterExamStage"
                  label="Stage"
                  :placeholder="stagePlaceholder"
                  :items="examStages"
                  v-model="selectedExamStage"
                  :search-keys="['name']"
                  label-key="name"
                  :disabled="!selectedExamProgram || loadingExamStages || examStages.length === 0"
                  :required="!!selectedExamProgram && examStages.length > 0"
                  @change="handleExamStageChange"
                >
                  <template #label>
                    Stage <span v-if="selectedExamProgram && examStages.length" class="text-danger">*</span>
                  </template>
                </SearchableDropdown>
                <div v-if="loadingExamStages" class="dropdown-loading-overlay">
                  <output class="spinner-border spinner-border-sm text-primary">
                    <span class="visually-hidden">Loading stages...</span>
                  </output>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row p-2 g-4 justify-content-center mb-5">
        <div v-if="!canLoadExamPatterns" class="col-12 col-sm-10 text-center">
          <div class="card">
            <div class="card-body py-5 text-muted">
              <i class="bi bi-ui-checks-grid fs-1 d-block mb-3"></i>
              <p class="mb-0">{{ examPatternsPlaceholder }}</p>
            </div>
          </div>
        </div>

        <template v-else>
          <div
            v-if="loadingExamTemplates && examTemplates.length === 0"
            class="col-12 col-sm-10 text-center py-5"
          >
            <output class="spinner-border text-primary">
              <span class="visually-hidden">Loading patterns...</span>
            </output>
          </div>

          <div
            v-else-if="!loadingExamTemplates && examTemplates.length === 0"
            class="col-12 col-sm-10 text-center"
          >
            <div class="card">
              <div class="card-body py-5">
                <i class="bi bi-clipboard2-x fs-1 text-secondary mb-3"></i>
                <h5 class="text-secondary mb-0">No paper patterns yet</h5>
                <p class="text-muted small mt-2 mb-0">Click <strong>Add Pattern</strong> to create one.</p>
              </div>
            </div>
          </div>

          <template v-else>
            <div
              v-for="tpl in examTemplates"
              :key="tpl.id"
              class="col-12 col-sm-10"
              :class="{ 'exam-pattern-loading': loadingExamTemplates }"
            >
              <div class="card">
                <div class="card-body">
                  <div class="container p-0">
                    <div class="row mb-2 justify-content-end">
                      <div class="col-12 col-sm-auto text-end">
                        <router-link
                          :to="editExamPatternLink(tpl)"
                          class="text-decoration-none text-black me-2 ms-3 fs-4"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </router-link>
                        <i
                          class="bi bi-trash3 ms-3 fs-4"
                          @click="showDeleteExamTemplateConfirmation(tpl)"
                          style="cursor: pointer"
                        ></i>
                      </div>
                    </div>

                    <div class="row mb-2 justify-content-between">
                      <div class="col-12 col-sm-6">
                        <strong class="text-uppercase fs-5">{{ tpl.name }}</strong>
                      </div>
                      <div class="col-12 col-sm-6">
                        <strong>Marks:</strong>
                        <span class="me-2">{{ tpl.total_marks }}</span>
                      </div>
                    </div>

                    <div class="row mb-3">
                      <span>{{ examProgramLabel }}</span>
                    </div>

                    <div class="row">
                      <div class="col-12 col-sm-4">
                        <strong>Questions:</strong>
                        <span>{{ tpl.total_questions ?? '—' }}</span>
                      </div>
                      <div class="col-12 col-sm-4">
                        <strong>Duration:</strong>
                        <span>{{ tpl.duration_minutes ?? '—' }} min</span>
                      </div>
                      <div class="col-12 col-sm-3">
                        <strong>Stage:</strong>
                        <span>{{ tpl.exam_stage?.name ?? selectedExamStage?.name ?? 'All stages' }}</span>
                      </div>
                      <div class="col-12 col-sm-1 text-end">
                        <button
                          class="btn chevron-btn"
                          type="button"
                          @click="toggleExamTemplate(tpl.id)"
                          :title="expandedExamTemplateIds.has(tpl.id) ? 'Hide details' : 'Show details'"
                        >
                          <i
                            class="bi bi-chevron-double-down fs-4"
                            :class="{ 'chevron-rotated': expandedExamTemplateIds.has(tpl.id) }"
                          ></i>
                        </button>
                      </div>
                    </div>

                    <transition name="slide-fade">
                      <div v-if="expandedExamTemplateIds.has(tpl.id)" class="row mt-3 pattern-details">
                        <table class="table table-sm table-striped table-bordered">
                          <caption>Pattern section details</caption>
                          <tbody>
                            <tr class="table-dark">
                              <th><strong>Section Name</strong></th>
                              <th><strong>Question Type</strong></th>
                              <th><strong>Number of Questions</strong></th>
                              <th><strong>Total Marks Allotted</strong></th>
                            </tr>
                            <tr v-for="section in tpl.sections" :key="section.id">
                              <td>{{ section.name }}</td>
                              <td>{{ examSectionTypeLabel(section) }}</td>
                              <td>{{ section.total_questions }}</td>
                              <td>{{ section.mandatory_questions * section.marks_per_question }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </template>

    <!-- Search and Filter Section -->
    <div v-if="patternScope === 'board'" class="row p-2 justify-content-center mb-2">
      <div class="col-12 col-sm-10 col-md-10">
        <!-- Search, Sort and Filter in One Row -->
        <div class="d-flex gap-2 mb-2">
          <!-- Search Bar -->
          <div class="search-field flex-grow-1">
            <i class="bi bi-search search-icon"></i>
            <input
              type="text"
              class="form-control search-input"
              id="patternFilter"
              placeholder="Search for Pattern"
              v-model="searchQuery"
              autocomplete="off"
              @input="handleSearchInput"
              ref="searchInputRef"
            />
            <i v-if="isSearching" class="bi bi-arrow-repeat search-loading-icon"></i>
            <i v-else-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
          </div>

          <!-- Sort Dropdown -->
          <div class="sort-field" style="min-width: 220px;">
            <select class="form-select sort-select" id="sortSelect" v-model="sortOption" @change="handleSortChange">
              <option value="pattern_name_asc">Sort by Pattern Name (A-Z)</option>
              <option value="pattern_name_desc">Sort by Pattern Name (Z-A)</option>
              <option value="created_at_desc">Sort by Created At (Newest)</option>
              <option value="created_at_asc">Sort by Created At (Oldest)</option>
              <option value="updated_at_desc">Sort by Updated At (Newest)</option>
              <option value="updated_at_asc">Sort by Updated At (Oldest)</option>
            </select>
          </div>

          <!-- Filter Button -->
          <div class="filter-field">
            <button
              class="btn filter-btn"
              @click="toggleFilterIcon"
              aria-expanded="false"
              aria-controls="filter"
            >
              <i class="bi bi-funnel"></i>
            </button>
          </div>
        </div>

        <!-- Filter Fields (Collapsible) -->
        <div class="collapse" id="filter">
          <div class="row g-2 mt-2">
            <!-- Board Filter -->
            <div class="col-12 col-md-6 mb-2">
              <SearchableDropdown
                id="filterBoard"
                label="Board"
                placeholder="Search for Board"
                :items="boards"
                v-model="selectedBoard"
                :search-keys="['name', 'abbreviation']"
              />
            </div>

            <!-- Total Marks Filter -->
            <div class="col-6 col-md-2 mb-2">
              <div class="form-floating">
                <input
                  type="number"
                  class="form-control"
                  id="totalMarks"
                  placeholder="Enter Total Marks"
                  v-model="totalMarks"
                />
                <label for="totalMarks" class="form-label">Total Marks</label>
              </div>
            </div>

            <!-- Standard Filter -->
            <div class="col-6 col-md-2 mb-2">
              <div class="position-relative">
                <SearchableDropdown
                  id="filterStandard"
                  label="Standard"
                  placeholder="Search for Standard"
                  :items="availableStandards"
                  v-model="selectedStandard"
                  :disabled="!selectedBoard || loadingStandards"
                  :search-keys="['name']"
                  :next-field-id="'filterSubject'"
                />
                <div v-if="loadingStandards" class="dropdown-loading-overlay">
                  <output class="spinner-border spinner-border-sm text-primary">
                    <span class="visually-hidden">Loading standards...</span>
                  </output>
                </div>
              </div>
            </div>

            <!-- Subject Filter -->
            <div class="col-12 col-md-2 mb-2">
              <div class="position-relative">
                <SearchableDropdown
                  id="filterSubject"
                  label="Subject"
                  placeholder="Search for Subject"
                  :items="availableSubjects"
                  v-model="selectedSubject"
                  :disabled="!selectedBoard || loadingSubjects"
                  :search-keys="['name']"
                />
                <div v-if="loadingSubjects" class="dropdown-loading-overlay">
                  <output class="spinner-border spinner-border-sm text-primary">
                    <span class="visually-hidden">Loading subjects...</span>
                  </output>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pattern Cards -->
    <div v-if="patternScope === 'board'" class="row p-2 g-4 justify-content-center mb-5">
      <!-- No Patterns Message -->
      <div v-if="!loading && !isSearching && patterns.length === 0" class="col col-12 col-sm-10 text-center">
        <div class="card">
          <div class="card-body py-5">
            <i class="bi bi-clipboard2-x fs-1 text-secondary mb-3"></i>
            <h5 class="text-secondary mb-3">No patterns found</h5>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-else-if="loading && !isSearching" class="col col-12 col-sm-10 text-center py-5">
        <output class="spinner-border text-primary">
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>

      <!-- Search Loading Overlay -->
      <div v-if="isSearching" class="col col-12 col-sm-10 position-relative">
        <div class="search-loading-overlay">
          <output class="spinner-border spinner-border-sm text-primary">
            <span class="visually-hidden">Searching...</span>
          </output>
        </div>
      </div>

      <!-- Pattern Cards List -->
      <div
        v-else
        v-for="pattern in filteredPatterns"
        :key="pattern.id"
        class="col col-12 col-sm-10"
        :class="{ 'pattern-searching': isSearching }"
      >
        <div
          class="card"
          :class="{ 'border-danger border-2': !isPatternMarksValid(pattern) }"
          :data-pattern-id="pattern.id"
        >
          <div class="card-body">
            <div class="container p-0">
              <!-- Card Header with Actions -->
              <div class="row mb-2 justify-content-end">
                <div class="col-12 col-sm-auto text-end">
                  <router-link
                    :to="{ name: 'editPattern', params: { id: pattern.id.toString() } }"
                    class="text-decoration-none text-black me-2 ms-3 fs-4"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </router-link>
                  <i
                    class="bi bi-trash3 ms-3 fs-4"
                    @click="showDeleteConfirmation(pattern)"
                    style="cursor: pointer"
                  ></i>
                </div>
              </div>

              <!-- Pattern Title and Marks -->
              <div class="row mb-2 justify-content-between">
                <div class="col-12 col-sm-6">
                  <strong class="text-uppercase fs-5">{{ pattern.pattern_name }}</strong>
                </div>
                <div class="col-12 col-sm-6">
                  <strong>Marks:</strong>
                  <span class="me-2">{{ pattern.total_marks }}</span>
                </div>
              </div>

              <!-- Board Name -->
              <div class="row mb-3">
                <span>{{ pattern.board.name }}</span>
              </div>

              <!-- Standard and Subject -->
              <div class="row">
                <div class="col-12 col-sm-6">
                  <strong>Standard:</strong>
                  <span>{{ pattern.standard.name }}</span>
                </div>
                <div class="col-12 col-sm-5">
                  <strong>Subject:</strong>
                  <span>{{ pattern.subject.name }}</span>
                </div>
                <div class="col-12 col-sm-1 text-end">
                  <button
                    class="btn chevron-btn"
                    @click="togglePattern(pattern.id)"
                    :title="pattern.isExpanded ? 'Hide details' : 'Show details'"
                  >
                    <i
                      class="bi bi-chevron-double-down fs-4"
                      :class="{ 'chevron-rotated': pattern.isExpanded }"
                    ></i>
                  </button>
                </div>
              </div>

              <!-- Pattern Details Table -->
              <transition name="slide-fade">
                <div class="row mt-3 pattern-details" v-if="pattern.isExpanded">
                  <table class="table table-sm table-striped table-bordered">
                    <caption>Pattern section details showing section names, question counts, and marks allocation</caption>
                    <tbody>
                      <tr class="table-dark">
                        <th><strong>Section Name</strong></th>
                        <th><strong>Number of Questions</strong></th>
                        <th><strong>Total Marks Allotted</strong></th>
                      </tr>
                      <tr v-for="section in pattern.sections" :key="section.id">
                        <td>{{ section.section_name }}</td>
                        <td>{{ section.total_questions }}</td>
                        <td>{{ section.mandotory_questions * section.marks_per_question }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="row mt-3 p-2 justify-content-center mb-5">
      <div class="col-12 col-sm-10">
        <div class="d-flex justify-content-between align-items-center">
          <!-- Pagination Info -->
          <div class="text-muted">
            Showing {{ patterns.length ? (currentPage - 1) * pageSize + 1 : 0 }} to
            {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} entries
          </div>

          <!-- Pagination Buttons -->
          <nav aria-label="Pattern pagination">
            <ul class="pagination mb-0">
              <!-- Previous Page Button -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>

              <!-- Page Numbers -->
              <li v-for="page in visiblePageNumbers" :key="page" class="page-item"
                  :class="{ active: page === currentPage, disabled: page === '...' }">
                <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(Number(page))">{{ page }}</a>
                <span v-else class="page-link">...</span>
              </li>

              <!-- Next Page Button -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      aria-labelledby="deleteConfirmationModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Remove Pattern</h5>
          </div>
          <div class="modal-body">Are you sure you want to delete this Pattern from system?</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              style="border: 1px solid gray"
              id="cancelButton"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              id="deleteButton"
              @click="deletePattern"
              data-bs-dismiss="modal"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Delete Exam Template Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteExamTemplateModal"
      tabindex="-1"
      aria-labelledby="deleteExamTemplateModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteExamTemplateModalLabel">Remove Paper Pattern</h5>
          </div>
          <div class="modal-body">
            Are you sure you want to delete this paper pattern from the system?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" style="border: 1px solid gray" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="deleteExamTemplate" data-bs-dismiss="modal">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Modal, Collapse } from 'bootstrap'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'
import { useRoute, useRouter } from 'vue-router'
import { examCatalogService } from '@/services/examCatalogService'
import { answerFormatToTypeName } from '@/utils/examPatternSection'
import { useToastStore } from '@/store/toast'
import type { ExamProgram, ExamStage, PaperTemplate } from '@/types/exam'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const patternScope = ref<'board' | 'exam'>('board')
const examPrograms = ref<Array<ExamProgram & { label: string }>>([])
const selectedExamProgram = ref<(ExamProgram & { label: string }) | null>(null)
const examStages = ref<ExamStage[]>([])
const selectedExamStage = ref<ExamStage | null>(null)
const loadingExamStages = ref(false)

const examProgramId = computed(() => {
  const id = route.query.examProgramId
  return id ? Number(id) : null
})

const canLoadExamPatterns = computed(() => {
  if (!selectedExamProgram.value || loadingExamStages.value) return false
  if (examStages.value.length > 0 && !selectedExamStage.value) return false
  return true
})

const examPatternsPlaceholder = computed(() => {
  if (!selectedExamProgram.value) {
    return 'Select exam and stage to view patterns.'
  }
  if (loadingExamStages.value) {
    return 'Loading stages...'
  }
  if (examStages.value.length > 0 && !selectedExamStage.value) {
    return 'Select a stage to view patterns.'
  }
  return 'Select exam and stage to view patterns.'
})

const stagePlaceholder = computed(() => {
  if (!selectedExamProgram.value) return 'Select exam first'
  if (loadingExamStages.value) return 'Loading stages...'
  if (examStages.value.length === 0) return 'No stages for this exam'
  return 'Select exam stage'
})

const canAddPattern = computed(
  () => patternScope.value === 'board' || (patternScope.value === 'exam' && canLoadExamPatterns.value),
)

const addPatternLink = computed(() => {
  if (patternScope.value === 'exam' && canLoadExamPatterns.value && selectedExamProgram.value) {
    return {
      name: 'createExamPattern',
      query: {
        scope: 'exam',
        examProgramId: String(selectedExamProgram.value.id),
        ...(selectedExamStage.value
          ? { examStageId: String(selectedExamStage.value.id) }
          : {}),
      },
    }
  }
  return { name: 'createPattern' }
})
const examProgramLabel = ref('')
const examTemplates = ref<PaperTemplate[]>([])
const loadingExamTemplates = ref(false)
const expandedExamTemplateIds = ref<Set<number>>(new Set())
const selectedExamTemplateForDelete = ref<PaperTemplate | null>(null)

const editExamPatternLink = (tpl: PaperTemplate) => ({
  name: 'editExamPattern',
  params: { id: String(tpl.id) },
  query: {
    examProgramId: String(selectedExamProgram.value?.id ?? tpl.exam_program_id),
    ...(selectedExamStage.value || tpl.exam_stage_id
      ? { examStageId: String(selectedExamStage.value?.id ?? tpl.exam_stage_id) }
      : {}),
  },
})

function examSectionTypeLabel(section: PaperTemplate['sections'][number]): string {
  const linked = (
    section.question_types
      ?.map((qt) => qt.question_type?.type_name)
      .filter(Boolean) ?? []
  ) as string[]
  if (linked.length > 0) return linked.join(', ')
  return answerFormatToTypeName(section.answer_format)
}

const showDeleteExamTemplateConfirmation = (tpl: PaperTemplate) => {
  selectedExamTemplateForDelete.value = tpl
  const modal = new Modal(document.getElementById('deleteExamTemplateModal')!)
  modal.show()
}

const deleteExamTemplate = async () => {
  if (!selectedExamTemplateForDelete.value) return
  try {
    await examCatalogService.deleteTemplate(selectedExamTemplateForDelete.value.id)
    toastStore.showToast({
      title: 'Success',
      message: 'Paper pattern deleted successfully',
      type: 'success',
    })
    await loadExamTemplates()
  } catch (error: any) {
    toastStore.showToast({
      title: 'Error',
      message: error?.response?.data?.message ?? 'Failed to delete paper pattern',
      type: 'error',
    })
  } finally {
    selectedExamTemplateForDelete.value = null
  }
}

function toggleExamTemplate(templateId: number) {
  const next = new Set(expandedExamTemplateIds.value)
  if (next.has(templateId)) next.delete(templateId)
  else next.add(templateId)
  expandedExamTemplateIds.value = next
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
    console.error('Error loading exam programs:', error)
    examPrograms.value = []
  }
}

async function handleExamProgramChange() {
  selectedExamStage.value = null
  examStages.value = []
  expandedExamTemplateIds.value = new Set()
  examProgramLabel.value = selectedExamProgram.value?.label ?? ''

  if (!selectedExamProgram.value) {
    examTemplates.value = []
    syncExamRouteQuery()
    return
  }

  loadingExamStages.value = true
  try {
    examStages.value = await examCatalogService.getStages(selectedExamProgram.value.id)
    if (examStages.value.length === 1) {
      selectedExamStage.value = examStages.value[0]
    }
  } catch (error) {
    console.error('Error loading exam stages:', error)
    examStages.value = []
  } finally {
    loadingExamStages.value = false
  }

  await refreshExamPatterns()
  syncExamRouteQuery()
}

async function handleExamStageChange() {
  await refreshExamPatterns()
  syncExamRouteQuery()
}

async function refreshExamPatterns() {
  if (patternScope.value !== 'exam') return
  if (!canLoadExamPatterns.value) {
    if (!loadingExamStages.value) {
      examTemplates.value = []
    }
    return
  }
  await loadExamTemplates()
}

function syncExamRouteQuery() {
  if (patternScope.value !== 'exam') return

  const params = new URLSearchParams()
  params.set('scope', 'exam')
  if (selectedExamProgram.value) {
    params.set('examProgramId', String(selectedExamProgram.value.id))
    if (selectedExamStage.value) {
      params.set('examStageId', String(selectedExamStage.value.id))
    }
  }

  const nextSearch = params.toString()
  const currentSearch = globalThis.location.search.replace(/^\?/, '')
  if (nextSearch === currentSearch) return

  const nextUrl = `${globalThis.location.pathname}?${nextSearch}`
  globalThis.history.replaceState(globalThis.history.state, '', nextUrl)
}

async function preselectExamFromQuery() {
  if (!examProgramId.value) return
  const match = examPrograms.value.find((p) => p.id === examProgramId.value)
  if (!match) return

  selectedExamProgram.value = match
  examProgramLabel.value = match.label
  loadingExamStages.value = true
  try {
    examStages.value = await examCatalogService.getStages(match.id)
  } catch (error) {
    console.error('Error loading exam stages:', error)
    examStages.value = []
  } finally {
    loadingExamStages.value = false
  }

  const stageId = route.query.examStageId
  if (stageId && examStages.value.length) {
    selectedExamStage.value =
      examStages.value.find((s) => String(s.id) === String(stageId)) ?? null
  } else if (examStages.value.length === 1) {
    selectedExamStage.value = examStages.value[0]
  }

  await refreshExamPatterns()
}

function setPatternScope(scope: 'board' | 'exam') {
  patternScope.value = scope
  if (scope === 'board') {
    router.replace({ name: 'patternDashboard' })
    if (!boards.value.length) fetchBoards()
    fetchPatterns()
    return
  }
  router.replace({ name: 'patternDashboard', query: { scope: 'exam' } })
}

async function loadExamTemplates() {
  if (!canLoadExamPatterns.value || !selectedExamProgram.value) return
  loadingExamTemplates.value = true
  try {
    const programId = selectedExamProgram.value.id
    const stageId = selectedExamStage.value?.id
    const [program, allTemplates] = await Promise.all([
      examCatalogService.getProgram(programId),
      examCatalogService.filterTemplates({ exam_program_id: programId }),
    ])
    examProgramLabel.value = `${program.exam_body?.abbreviation ?? ''} — ${program.name}`.trim()
    examTemplates.value = stageId
      ? allTemplates.filter(
          (t) => !t.exam_stage_id || t.exam_stage_id === stageId,
        )
      : allTemplates
    expandedExamTemplateIds.value = new Set()
  } catch (error) {
    console.error('Error loading exam templates:', error)
    examTemplates.value = []
  } finally {
    loadingExamTemplates.value = false
  }
}

interface Board {
  id: number
  name: string
  abbreviation: string
  address_id?: number
  created_at?: string
  updated_at?: string
  address?: {
    id: number
    postal_code: string
    street: string
    city_id: number
    city: {
      id: number
      name: string
      state_id: number
      state: {
        id: number
        name: string
        country_id: number
        country: {
          id: number
          name: string
        }
      }
    }
  }
  instruction_mediums?: Array<{
    id: number
    instruction_medium: string
    created_at: string
    updated_at: string
  }>
  standards?: Array<{
    id: number
    name: string
    sequence_number: number
    created_at?: string
    updated_at?: string
  }>
  subjects?: Array<{
    id: number
    name: string
    created_at?: string
    updated_at?: string
  }>
}

interface Pattern {
  id: number
  pattern_name: string
  board_id: number
  standard_id: number
  subject_id: number
  total_marks: number
  created_at: string
  updated_at: string
  board: {
    id: number
    name: string
    abbreviation: string
    address_id: number
    created_at: string
    updated_at: string
  }
  standard: {
    id: number
    name: string
  }
  subject: {
    id: number
    name: string
  }
  sections: Array<{
    id: number
    pattern_id: number
    seqencial_section_number: number
    sub_section: string | null
    section_name: string
    total_questions: number
    mandotory_questions: number
    marks_per_question: number
    created_at: string
    updated_at: string
  }>
  isExpanded?: boolean
}

interface Section {
  id: number
  pattern_id: number
  section_number: number
  sequence_number: number
  section_name: string
  sub_section: string | null
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  created_at: string
  updated_at: string
}

// Data
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchTimeout = ref<number | null>(null)
const isSearching = ref(false)
const selectedBoard = ref<Board | null>(null)
const totalMarks = ref('')
const selectedStandard = ref<{ id: number; name: string } | null>(null)
const selectedSubject = ref<{ id: number; name: string } | null>(null)
const patterns = ref<Pattern[]>([])
const boards = ref<Board[]>([])
const selectedPatternForDelete = ref<Pattern | null>(null)
const loading = ref(false)
const isFilterOpen = ref(false)

// Pagination state
const currentPage = ref(1)
const pageSize = 15 // Fixed page size
const totalItems = ref(0)
const totalPages = ref(0)
const sortOption = ref('pattern_name_asc')

// Add loading states for standards and subjects
const loadingStandards = ref(false)
const loadingSubjects = ref(false)

// Computed properties for sorting
const sortBy = computed(() => {
  const parts = sortOption.value.split('_')
  if (parts.length >= 2) {
    // For options like pattern_name_asc, we need to return "name"
    if (parts[0] === 'pattern' && parts[1] === 'name') {
      return 'name'
    }
    // For options like created_at_asc, we need to return "created_at"
    if (parts[0] === 'created' || parts[0] === 'updated') {
      return `${parts[0]}_${parts[1]}`
    }
  }
  return 'name' // Default fallback
})

const sortOrder = computed(() => {
  const parts = sortOption.value.split('_')
  if (parts.length >= 2) {
    // For options like pattern_name_asc, we need to return "asc"
    if (parts[0] === 'pattern' && parts[1] === 'name') {
      return parts[2]
    }
    // For options like created_at_asc, we need to return "asc"
    if (parts[0] === 'created' || parts[0] === 'updated') {
      return parts[2]
    }
  }
  return 'asc' // Default fallback
})

// Computed property to determine which page numbers to show
const visiblePageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are few pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate start and end of visible pages
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if we're near the beginning
    if (currentPage.value <= 3) {
      endPage = Math.min(totalPages.value - 1, 4)
    }

    // Adjust if we're near the end
    if (currentPage.value >= totalPages.value - 2) {
      startPage = Math.max(2, totalPages.value - 3)
    }

    // Add ellipsis if needed before visible pages
    if (startPage > 2) {
      pages.push('...')
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed after visible pages
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
})

// Computed properties for available standards and subjects
const availableStandards = computed(() => {
  return selectedBoard.value?.standards ?? []
})

const availableSubjects = computed(() => {
  return selectedBoard.value?.subjects ?? []
})

// Handle search input with debounce
const handleSearchInput = () => {
  // Immediately set searching state for visual feedback
  isSearching.value = true;

  // Clear any existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Set a new timeout
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when search changes
    fetchPatterns();
  }, 500) as unknown as number; // Increased debounce time for better UX
}

// Clear search function that maintains focus
const clearSearch = () => {
  searchQuery.value = '';
  isSearching.value = true;

  // Reset to first page when clearing search
  currentPage.value = 1;

  // Fetch patterns with cleared search
  fetchPatterns();

  // Maintain focus on the search input after clearing
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
}

// Methods
const clearFilters = () => {
  // Reset filter values
  selectedBoard.value = null
  selectedStandard.value = null
  selectedSubject.value = null
  totalMarks.value = ''
  // Reset sort to default
  sortOption.value = 'pattern_name_asc'
  // Reset to first page
  currentPage.value = 1
  // Fetch patterns with cleared filters
  fetchPatterns()
}

const toggleFilterIcon = () => {
  // Toggle the filter state
  isFilterOpen.value = !isFilterOpen.value
  console.log('Filter state toggled:', isFilterOpen.value)

  // Manually toggle the collapse using Bootstrap's Collapse class
  const filterElement = document.getElementById('filter')
  if (filterElement) {
    // Get or create a collapse instance
    let bsCollapse = Collapse.getInstance(filterElement)
    if (!bsCollapse) {
      bsCollapse = new Collapse(filterElement, {
        toggle: false
      })
    }

    // Toggle the collapse
    bsCollapse.toggle()

    // Toggle active class on the filter button
    const filterBtn = document.querySelector('.filter-btn')
    if (filterBtn) {
      if (isFilterOpen.value) {
        filterBtn.classList.add('active')
        console.log('Added active class to filter button')
      } else {
        filterBtn.classList.remove('active')
        console.log('Removed active class from filter button')
        // Clear all filters when closing
        clearFilters()
      }
    }
  }
}

const togglePattern = (patternId: number) => {
  // Find the pattern to toggle
  const pattern = patterns.value.find((p) => p.id === patternId)
  if (!pattern) return

  // Toggle the expanded state
  pattern.isExpanded = !pattern.isExpanded

  // If expanding, scroll to the pattern after a short delay to allow animation
  if (pattern.isExpanded) {
    setTimeout(() => {
      const element = document.querySelector(`[data-pattern-id="${patternId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
}

const showDeleteConfirmation = (pattern: Pattern) => {
  selectedPatternForDelete.value = pattern
  const modal = new Modal(document.getElementById('deleteConfirmationModal')!)
  modal.show()
}

const deletePattern = async () => {
  if (!selectedPatternForDelete.value) return
  try {
    await axiosInstance.delete(`/patterns/${selectedPatternForDelete.value.id}`)
    await fetchPatterns() // Refresh patterns after deletion
  } catch (error) {
    console.error('Error deleting pattern:', error)
  }
}

// Add this function before the fetchPatterns function
const isPatternMarksValid = (pattern: Pattern) => {
  const totalSectionMarks = pattern.sections.reduce(
    (total, section) => total + section.mandotory_questions * section.marks_per_question,
    0,
  )
  return pattern.total_marks === totalSectionMarks
}

// Fetch patterns from API
const fetchPatterns = async () => {
  try {
    if (!isSearching.value) {
      loading.value = true;
    }
    
    const queryParams = buildQueryParams();
    console.log('API request parameters:', queryParams.toString());
    
    const response = await axiosInstance.get(`/patterns?${queryParams.toString()}`);
    processApiResponse(response);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    resetPatternsData();
  } finally {
    loading.value = false
    isSearching.value = false
  }
}

// Helper function to build query parameters
const buildQueryParams = () => {
  const queryParams = new URLSearchParams();
  
  // Add pagination and sorting parameters
  queryParams.append('page', currentPage.value.toString());
  queryParams.append('page_size', pageSize.toString());
  queryParams.append('sort_by', sortBy.value);
  queryParams.append('sort_order', sortOrder.value);
  
  // Add search and filters
  addSearchAndFilters(queryParams);
  
  return queryParams;
}

// Helper function to add search and filter parameters
const addSearchAndFilters = (queryParams: URLSearchParams) => {
  if (searchQuery.value) {
    queryParams.append('search', searchQuery.value);
  }
  
  if (selectedBoard.value?.id) {
    queryParams.append('boardId', selectedBoard.value.id.toString());
  }
  
  if (selectedStandard.value?.id) {
    queryParams.append('standardId', selectedStandard.value.id.toString());
  }
  
  if (selectedSubject.value?.id) {
    queryParams.append('subjectId', selectedSubject.value.id.toString());
  }
  
  if (totalMarks.value) {
    queryParams.append('totalMarks', totalMarks.value);
  }
}

// Helper function to process API response
const processApiResponse = (response: any) => {
  if (!response.data || typeof response.data !== 'object') {
    resetPatternsData();
    return;
  }
  
  if (response.data.data && Array.isArray(response.data.data)) {
    handlePaginatedResponse(response.data);
  } else if (Array.isArray(response.data)) {
    handleArrayResponse(response.data);
  } else {
    console.error('Unexpected response format:', response.data);
    resetPatternsData();
  }
}

// Helper function to handle paginated response format
const handlePaginatedResponse = (data: any) => {
  patterns.value = data.data.map((pattern: Pattern) => ({
    ...pattern,
    isExpanded: false,
  }));
  
  if (data.meta) {
    totalItems.value = data.meta.total || 0;
    totalPages.value = data.meta.total_pages || 1;
    console.log('Pagination data from meta:', {
      totalItems: totalItems.value,
      totalPages: totalPages.value,
      currentPage: currentPage.value,
      pageSize: data.meta.page_size,
      patternsLength: patterns.value.length
    });
  } else {
    // Fallback if meta is missing
    totalItems.value = patterns.value.length;
    totalPages.value = Math.ceil(totalItems.value / pageSize);
  }
}

// Helper function to handle array response format
const handleArrayResponse = (data: any[]) => {
  patterns.value = data.map((pattern: Pattern) => ({
    ...pattern,
    isExpanded: false,
  }));
  totalItems.value = patterns.value.length;
  totalPages.value = Math.ceil(totalItems.value / pageSize);
}

// Helper function to reset patterns data
const resetPatternsData = () => {
  patterns.value = [];
  totalItems.value = 0;
  totalPages.value = 0;
}

// Fetch boards from API
const fetchBoards = async () => {
  try {
    const response = await axiosInstance.get('/boards')

    // The response now only contains basic board data without standards and subjects
    boards.value = response.data

    // If there was a previously selected board, we need to refetch its details
    if (selectedBoard.value?.id) {
      await fetchBoardDetails(selectedBoard.value.id)
    }
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

// Computed property for filtered patterns
const filteredPatterns = computed(() => {
  let result = patterns.value

  // Apply search filter locally if needed
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (pattern) =>
        pattern.pattern_name.toLowerCase().includes(query) ||
        pattern.board.name.toLowerCase().includes(query) ||
        pattern.subject.name.toLowerCase().includes(query),
    )
  }

  // Sort patterns - invalid patterns first
  result = [...result].sort((a, b) => {
    const aValid = isPatternMarksValid(a)
    const bValid = isPatternMarksValid(b)
    if (!aValid && bValid) return -1
    if (aValid && !bValid) return 1
    return 0
  })

  return result
})

// Function to change page
function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchPatterns()
}

// Function to handle sort change
function handleSortChange() {
  currentPage.value = 1 // Reset to first page when changing sort
  fetchPatterns()
}

// Lifecycle hooks
onMounted(async () => {
  await loadExamPrograms()

  if (route.query.scope === 'exam' || examProgramId.value) {
    patternScope.value = 'exam'
    if (examProgramId.value) {
      await preselectExamFromQuery()
    }
    return
  }

  initializeSortFromRoute(route)
  initializePageFromRoute(route)
  initializeFilterState()

  fetchBoards()
  fetchPatterns()
})

// Helper function to initialize sort parameters from route
const initializeSortFromRoute = (route: any) => {
  if (!route.query.sort_by || !route.query.sort_order) return
  
  const sortByParam = route.query.sort_by as string
  const sortOrderParam = route.query.sort_order as string
  
  // Map API sort parameters to our sort options
  sortOption.value = sortByParam === 'name' 
    ? `pattern_name_${sortOrderParam}` 
    : `${sortByParam}_${sortOrderParam}`
}

// Helper function to initialize page from route
const initializePageFromRoute = (route: any) => {
  if (!route.query.page) return
  
  const page = Number.parseInt(route.query.page as string, 10)
  if (!Number.isNaN(page) && page > 0) {
    currentPage.value = page
  }
}

// Helper function to initialize filter state
const initializeFilterState = () => {
  const filterElement = document.getElementById('filter')
  if (!filterElement) return
  
  // Check if the element has the 'show' class initially
  isFilterOpen.value = filterElement.classList.contains('show')
  
  if (isFilterOpen.value) {
    updateFilterButtonAppearance()
  }
}

// Helper function to update filter button appearance
const updateFilterButtonAppearance = () => {
  const filterBtn = document.querySelector('.filter-btn')
  if (filterBtn) {
    filterBtn.classList.add('active')
  }
}

// Add watcher to maintain focus after search completes
watch(isSearching, (newVal) => {
  // If we were searching and now we're done, restore focus to search input
  if (!newVal && searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

// Update the fetchBoardDetails function to include loading states
const fetchBoardDetails = async (boardId: number) => {
  try {
    // Set loading states
    loadingStandards.value = true
    loadingSubjects.value = true

    const response = await axiosInstance.get(`/boards/${boardId}`)

    // Update the selected board with the detailed data
    if (response.data) {
      // Keep the original board reference but update its properties
      if (selectedBoard.value) {
        selectedBoard.value.standards = response.data.standards ?? []
        selectedBoard.value.subjects = response.data.subjects ?? []
      }
    }
  } catch (error) {
    console.error('Error fetching board details:', error)
  } finally {
    // Clear loading states
    loadingStandards.value = false
    loadingSubjects.value = false
  }
}

// Update the watch for selectedBoard to fetch details when it changes
watch(selectedBoard, async (newBoard) => {
  // Reset dependent selections
  selectedStandard.value = null
  selectedSubject.value = null

  // Fetch board details if a board is selected
  if (newBoard?.id) {
    await fetchBoardDetails(newBoard.id)
  }

  // No need to call fetchPatterns here as it will be triggered by the other watcher
}, { immediate: false })

// Keep the existing watcher for filter changes
watch([selectedBoard, selectedStandard, selectedSubject, totalMarks], async () => {
  await fetchPatterns()
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

.exam-pattern-loading {
  opacity: 0.55;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

/* Styles for screens below 576px */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  #addButton {
    width: 100% !important;
  }
}

/* Mobile styles for nav link */
@media (max-width: 768px) {
  #navPattern {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.bi {
  cursor: pointer;
  transition: transform 0.2s;
}

.bi-chevron-double-up {
  transform: rotate(180deg);
}

.table th {
  background-color: #212529;
  color: white;
}

/* Transition styles for pattern details */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Smooth transition for chevron icon */
.bi-chevron-double-down {
  transition: transform 0.3s ease, color 0.2s ease;
  color: #6c757d;
}

/* Rotate the chevron when expanded */
.chevron-rotated {
  transform: rotate(180deg);
}

/* Styling for the chevron button */
.chevron-btn {
  background: transparent;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chevron-btn:hover {
  color: #0d6efd;
  transform: scale(1.1);
}

.chevron-btn:active {
  transform: scale(0.95);
}

.chevron-btn:focus {
  box-shadow: none;
  outline: none;
}

/* Add a subtle box shadow to the pattern card */
.card {
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Pagination styling */
.pagination .page-item.active .page-link {
  background-color: #212529 !important;
  border-color: #212529 !important;
  color: white !important;
}

.pagination .page-link {
  color: #212529;
}

.pagination .page-link:focus {
  box-shadow: none;
  outline: none;
}

/* Sort dropdown styling */
.sort-wrapper {
  position: relative;
  margin-bottom: 0;
}

.sort-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 6px;
  appearance: none;
  background-image: none;
  transition: all 0.3s ease;
}

.sort-select:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
}

.sort-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

/* Filter button styling */
.filter-btn {
  height: 48px;
  min-width: 48px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 0;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
}

.filter-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

.filter-btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25);
  outline: 0;
}

.filter-btn.active {
  background-color: #212529;
  color: white;
  border-color: #212529;
}

.filter-btn.active:hover {
  background-color: #343a40;
  color: white;
}

/* Modern search styling */
.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
  pointer-events: none;
}

.search-input {
  padding-left: 40px;
  padding-right: 40px;
  height: 48px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
  z-index: 100; /* Higher z-index to ensure it stays on top */
}

.clear-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 10;
}

.clear-search-icon:hover {
  color: #212529;
}

@media (max-width: 768px) {
  .search-input,
  .sort-select,
  .filter-btn {
    height: 42px;
  }

  /* Adjust flex layout for mobile */
  .d-flex.gap-2 {
    flex-wrap: wrap;
  }

  .search-field {
    flex: 1 0 100%;
    margin-bottom: 0.5rem;
  }

  .sort-field {
    flex: 1 1 auto;
    min-width: 0 !important;
  }
}

/* Filter section styling */
#filter {
  margin-top: 0.5rem;
}

/* Ensure consistent spacing in the layout */
.row.g-2 {
  margin-bottom: 0;
}

/* Search loading overlay */
.search-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  backdrop-filter: blur(2px);
  border-radius: 6px;
}

.pattern-searching {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* Improved spinner animation */
@keyframes spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

.search-loading-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  animation: spin 1s linear infinite;
}

/* Ensure search icons stay visible */
.search-icon, .clear-search-icon, .search-loading-icon {
  z-index: 101; /* Higher than the input focus z-index */
}

/* Dropdown loading overlay */
.position-relative {
  position: relative;
}

.dropdown-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  border-radius: 6px;
  pointer-events: none; /* Allow clicks to pass through */
}
</style>
