<template>
  <div class="container my-4 mb-5">
    <!-- Header Section -->
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <div class="col-auto">
          <button type="button" class="btn-close" aria-label="Close" @click="goBack"></button>
        </div>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col-12 col-sm-10">
          <p class="text-muted text-start fs-5 mb-1">
            <span class="d-inline-block">{{ boardName }}</span>
            <span class="d-inline-block ms-1">| {{ mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark mb-2">
            Standard {{ standardName }}
            <span class="d-block text-start text-secondary mt-1">
              {{ subjectName }} <span class="optional-info-marks-heading fs-5" v-if="patternDetails">{{ patternDetails.total_marks }} Marks</span> 
              <span class="d-block text-start text-secondary mt-1" >{{ patternName }}</span>
            </span>
          </h4>
        </div>
      </div>
      <hr />
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <form id="createTestPaperForm" @submit.prevent="createTestPaper">
        <div class="row gy-2 justify-content-center">
          <!-- Chapter Marks Distribution Section -->
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Single Chapter Selection Notification -->
            <div class="alert alert-dark fw-bold" role="alert" v-if="chapters.length === 1 && absoluteMarks">
              <small>
                <i class="fas fa-info-circle me-1"></i>
                All {{ absoluteMarks }} marks will be assigned to 
                <span class="chapter-name">"{{ chapters[0].sequential_chapter_number }}. {{ chapters[0].name }}".</span>
              </small>
            </div>

            <!-- Chapter Weightage Section (Updated for Marks) -->
            <div class="card mb-3" v-if="chapters.length > 1">
              <div class="card-header bg-light">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Chapter Marks Distribution</h6>
                  <div class="d-flex gap-2">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-dark" 
                      @click="generate"
                      :disabled="isLoading || totalAssignedMarks !== absoluteMarks"
                      :title="totalAssignedMarks !== absoluteMarks ? 'Assigned marks must equal total marks' : 'Distributes marks based on the values you have set for each chapter'"
                    >
                      <i class="bi bi-sliders me-1" :class="{'spinner-border spinner-border-sm': isLoading}"></i>
                      Custom Distribution
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-dark" 
                      @click="refreshChapterMarksDistribution"
                      :disabled="isLoading"
                      :title="'Automatically distributes marks equally across all selected chapters'"
                    >
                      <i class="bi bi-distribute-horizontal me-1" :class="{'spinner-border spinner-border-sm': isLoading}"></i>
                      Equal Distribution
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="row gy-2">
                  <div 
                    v-for="chapter in chapters" 
                    :key="chapter.id" 
                    class="col-12"
                  >
                    <div class="d-flex flex-column flex-md-row align-items-md-center mb-0">
                      <label :for="`marks-${chapter.id}`" class="me-2 flex-grow-1 mb-0 mb-md-0">
                        {{ chapter.sequential_chapter_number }}. {{ chapter.name }}
                      </label>
                      <div class="d-flex align-items-center ms-auto chapter-marks-controls mb-2">
                        <small class="text-muted fw-bold me-3 percent-display">{{ formatPercentage(calculatePercentage(chapter.marks)) }} %</small>
                        <div class="input-group marks-input-group">
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary btn-sm border-0 btn-minus"
                            @click="decrementMarks(chapter)"
                            :disabled="!canDecrement(chapter)"
                            :title="canDecrement(chapter) 
                              ? `Decrease to ${getPreviousValidMark(chapter)} marks` 
                              : getChapterMinMarksTooltip(chapter)"
                          >
                            <i class="bi bi-dash-lg"></i>
                          </button>
                          <div 
                            class="form-control text-center d-flex flex-column align-items-center justify-content-center"
                            :class="{'is-invalid': chapter.marks === 0, 'no-spinner-sm': true}"
                            :title="`Valid marks: ${getValidMarksTooltip(chapter)}`"
                          >
                            <span class="marks-value">{{ chapter.marks }}</span>
                            <small class="marks-label">Marks</small>
                          </div>
                          <button 
                            type="button" 
                            class="btn btn-outline-secondary btn-sm border-0 btn-plus"
                            @click="incrementMarks(chapter)"
                            :disabled="!canIncrement(chapter)"
                            :title="canIncrement(chapter) 
                              ? `Increase to ${getNextValidMark(chapter)} marks` 
                              : getChapterMaxMarksTooltip(chapter)"
                          >
                            <i class="bi bi-plus-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="marks-range-info mt-1 mb-2">
                      <small v-if="isLoading && !getChapterMarksRange(chapter)" class="text-muted">
                        <i class="bi bi-arrow-repeat spinner"></i> Loading valid marks...
                      </small>
                    </div>
                  </div>
                </div>

                <!-- Marks Summary -->
                <div class="marks-summary border-top mt-3 pt-3">
                  <div class="d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <span class="me-1 text-muted">Total:</span>
                      <span class="fw-bold badge bg-secondary rounded-pill">{{ absoluteMarks }}</span>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="me-1 text-muted">Assigned:</span>
                      <span class="fw-bold badge rounded-pill" 
                        :class="{
                          'bg-success': totalAssignedMarks === absoluteMarks,
                          'bg-warning text-dark': absoluteMarks && totalAssignedMarks < absoluteMarks,
                          'bg-danger': absoluteMarks && totalAssignedMarks > absoluteMarks
                        }">
                        {{ totalAssignedMarks }}
                      </span>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="me-1 text-muted">{{ absoluteMarks && absoluteMarks - totalAssignedMarks >= 0 ? 'Remaining:' : 'Excess:' }}</span>
                      <span class="fw-bold badge rounded-pill" 
                        :class="{
                          'bg-success': absoluteMarks && absoluteMarks - totalAssignedMarks === 0,
                          'bg-warning text-dark': absoluteMarks && absoluteMarks - totalAssignedMarks > 0,
                          'bg-danger': absoluteMarks && totalAssignedMarks > absoluteMarks
                        }">
                        {{ absoluteMarks ? Math.abs(absoluteMarks - totalAssignedMarks) : 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pattern Details Section -->
          <div class="col-12 col-sm-10 col-md-8 mt-4" v-if="patternDetails && patternDetails.sections">
            <div class="card pattern-card">
              <div class="card-body p-0">
                <div class="container p-0">
                  
                  <!-- Pattern Header -->
                  <div class="row justify-content-between align-items-center">
                    <div class="col-12">
                      <h6 class="card-title text-uppercase fw-bold">{{ patternDetails.pattern_name }}</h6>
                    </div>
                  </div>
                  
                  <!-- Section Details Table with Integrated Question Types -->
                  <div class="section-preview mt-0">
                    <div class="table-responsive">
                      <table class="table table-sm compact-table borderless-table ">
                        <thead class="table-dark rounded-table-header">
                          <tr>
                            <th class="question-column">Questions</th>
                            <th class="marks-column">Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="section in patternDetails.sections" :key="section.id">
                            <!-- Section row -->
                            <tr class="section-row" @click="toggleQuestionTypes(section.id)">
                              <td class="question-cell">
                                <div class="d-flex align-items-start">
                                  <i :class="[isQuestionTypesVisible(section.id) ? 'bi bi-chevron-down' : 'bi bi-chevron-right', 'me-2 expand-icon']" 
                                    v-if="section.subsection_question_types && section.subsection_question_types.length > 0"></i>
                                  <div>
                                    <span class="question-text fw-bold">Q. {{ section.section_number }} {{ section.sub_section ? section.sub_section + ' ) ' : '' }}{{ section.section_name }}</span>
                                    <div class="small text-secondary mt-1 d-flex flex-sm-row align-items-center">
                                      <span class="optional-info me-sm-2 mb-1 mb-sm-0 d-inline-block"><strong>{{ section.mandotory_questions }}</strong> out of <strong>{{ section.total_questions }}</strong></span>
                                      <span class="optional-info mb-1 mb-sm-0 d-inline-block"><strong>{{ section.marks_per_question }}</strong> marks per question</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td class="text-center fw-bold marks-cell">{{ section.mandotory_questions * section.marks_per_question }}</td>
                            </tr>
                            
                            <!-- Question types rows -->
                            <tr v-if="isQuestionTypesVisible(section.id) && section.subsection_question_types && section.subsection_question_types.length > 0" 
                                class="question-types-row" :key="`question-types-${section.id}`">
                              <td colspan="2" class="p-0">
                                <div class="question-types-container bg-light">
                                  <table class="table table-sm mb-0 question-types-table">
                                    <thead>
                                      <tr>
                                        <th scope="col" class="px-4 py-2">Question Details</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <!-- When only one type of question in the section, show individually numbered questions -->
                                      <template v-if="hasOnlyOneQuestionType(section)">
                                        <tr class="question-type-header">
                                          <td colspan="2" class="px-4 py-2 small fw-bold text-secondary">
                                            <div class="ms-4">
                                              All {{ section.total_questions }} questions are of type: {{ section.subsection_question_types[0]?.question_type?.type_name ?? 'Unknown Type' }}
                                            </div>
                                          </td>
                                        </tr>
                                        <tr v-for="(item, index) in generateNumberedList(section)" 
                                            :key="`numbered-type-${section.id}-${index}`" 
                                            class="question-type-item"
                                            :class="{'active-edit': activeEditQuestion && activeEditQuestion.sectionId === section.id && activeEditQuestion.questionIndex === item.number}">
                                          
                                          <td class="px-4 py-2">
                                            <div class="ms-4 d-flex align-items-center justify-content-between flex-column flex-md-row">
                                              <span class="mb-2 mb-md-0 question-type-name">{{ item.number }}) {{ item.typeName }}</span>
                                              <div class="position-relative ms-md-auto">
                                                <span class="chapter-name-text">
                                                  {{ getAllocatedChapterName(section.id, item.number) }}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            <!-- Chapter selection UI -->
                                            <div v-if="activeEditQuestion && activeEditQuestion.sectionId === section.id && activeEditQuestion.questionIndex === item.number" class="chapter-selection-container mt-3">
                                              <div v-if="isLoadingQuestionTypes" class="text-center py-2">
                                                <output class="spinner-border spinner-border-sm text-primary">
                                                  <span class="visually-hidden">Loading...</span>
                                                </output>
                                                <p class="mt-2 small">Loading available chapters...</p>
                                              </div>
                                              
                                              <div v-else-if="questionTypeError" class="alert alert-danger small">
                                                {{ questionTypeError }}
                                              </div>
                                              
                                              <div v-else-if="questionTypesAvailability.length > 0" class="chapter-selection-content">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                  <h6 class="mb-0 small">Select chapter for this question:</h6>
                                                  <button type="button" class="btn-close btn-sm" @click="activeEditQuestion = null" aria-label="Close"></button>
                                                </div>
                                                
                                                <!-- Question Types Tabs - compact version -->
                                                <ul class="nav nav-pills nav-small mb-2">
                                                  <li class="nav-item" v-for="(qType, index) in questionTypesAvailability" :key="qType.type">
                                                    <button 
                                                      class="nav-link btn-sm" 
                                                      :class="{ active: index === 0 }" 
                                                      @click="activeQuestionTypeIndex = index"
                                                      type="button" 
                                                    >
                                                      {{ qType.name }}
                                                    </button>
                                                  </li>
                                                </ul>
                                                
                                                <!-- Selected Question Type Content -->
                                                <div class="tab-content border rounded p-2 bg-light">
                                                  <div v-if="questionTypesAvailability[activeQuestionTypeIndex]" class="chapter-list">
                                                    <div class="list-group list-group-sm">
                                                      <button 
                                                        v-for="chapter in questionTypesAvailability[activeQuestionTypeIndex].chapters" 
                                                        :key="chapter.id"
                                                        type="button" 
                                                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-1 px-2 small"
                                                        @click="selectChapterForQuestion(
                                                          questionTypesAvailability[activeQuestionTypeIndex].type, 
                                                          chapter.id, 
                                                          section.id, 
                                                          item.number
                                                        )"
                                                        :disabled="getSpecialCount(chapter.count, questionTypesAvailability[activeQuestionTypeIndex].type, chapter.id) <= 0"
                                                      >
                                                        {{ getFormattedChapterName(chapter, questionTypesAvailability[activeQuestionTypeIndex].type) }}
                                                        <span class="badge rounded-pill small"
                                                              :class="getSpecialCount(chapter.count, questionTypesAvailability[activeQuestionTypeIndex].type, chapter.id) > 0 ? 'bg-primary' : 'bg-secondary'">
                                                          {{ getSpecialCount(chapter.count, questionTypesAvailability[activeQuestionTypeIndex].type, chapter.id) }}
                                                        </span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              <div v-else class="alert alert-info small">
                                                No chapter data available for this question type.
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </template>
                                      <!-- Otherwise show as before with sequence numbers -->
                                      <template v-else>
                                        <tr v-for="qType in section.subsection_question_types" 
                                            :key="`qt-${qType.id}`" 
                                            class="question-type-item"
                                            :class="{'active-edit': activeEditQuestion && activeEditQuestion.sectionId === section.id && activeEditQuestion.questionIndex === qType.seqencial_subquestion_number}">
                                          
                                          <td class="px-4 py-2">
                                            <div class="ms-4 d-flex align-items-center justify-content-between flex-column flex-md-row">
                                              <span class="mb-2 mb-md-0 question-type-name">{{ qType.seqencial_subquestion_number || '-' }}) {{ qType.question_type?.type_name ?? 'Unknown Type' }}</span>
                                              <div class="position-relative ms-md-auto">
                                                <span class="chapter-name-text">
                                                  {{ getAllocatedChapterName(section.id, qType.seqencial_subquestion_number) }}
                                                </span>
                                              </div>
                                            </div>
                                            
                                            <!-- Chapter selection UI -->
                                            <div v-if="activeEditQuestion && activeEditQuestion.sectionId === section.id && activeEditQuestion.questionIndex === qType.seqencial_subquestion_number" class="chapter-selection-container mt-3">
                                              <div v-if="isLoadingQuestionTypes" class="text-center py-2">
                                                <output class="spinner-border spinner-border-sm text-primary">
                                                  <span class="visually-hidden">Loading...</span>
                                                </output>
                                                <p class="mt-2 small">Loading available chapters...</p>
                                              </div>
                                              
                                              <div v-else-if="questionTypeError" class="alert alert-danger small">
                                                {{ questionTypeError }}
                                              </div>
                                              
                                              <div v-else-if="questionTypesAvailability.length > 0" class="chapter-selection-content">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                  <h6 class="mb-0 small">Select chapter for this question:</h6>
                                                  <button type="button" class="btn-close btn-sm" @click="activeEditQuestion = null" aria-label="Close"></button>
                                                </div>
                                                
                                                <!-- Question Types Tabs - compact version -->
                                                <ul class="nav nav-pills nav-small mb-2">
                                                  <li class="nav-item" v-for="(qType, index) in questionTypesAvailability" :key="qType.type">
                                                    <button 
                                                      class="nav-link btn-sm" 
                                                      :class="{ active: index === 0 }" 
                                                      @click="activeQuestionTypeIndex = index"
                                                      type="button" 
                                                    >
                                                      {{ qType.name }}
                                                    </button>
                                                  </li>
                                                </ul>
                                                
                                                <!-- Selected Question Type Content -->
                                                <div class="tab-content border rounded p-2 bg-light">
                                                  <div v-if="questionTypesAvailability[activeQuestionTypeIndex]" class="chapter-list">
                                                    <div class="list-group list-group-sm">
                                                      <button 
                                                        v-for="chapter in questionTypesAvailability[activeQuestionTypeIndex].chapters" 
                                                        :key="chapter.id"
                                                        type="button" 
                                                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-1 px-2 small"
                                                        @click="selectChapterForQuestion(
                                                          questionTypesAvailability[activeQuestionTypeIndex].type, 
                                                          chapter.id, 
                                                          section.id, 
                                                          qType.seqencial_subquestion_number
                                                        )"
                                                        :disabled="getSpecialCount(chapter.count, questionTypesAvailability[activeQuestionTypeIndex].type, chapter.id) <= 0"
                                                      >
                                                        {{ getFormattedChapterName(chapter, questionTypesAvailability[activeQuestionTypeIndex].type) }}
                                                        <span class="badge rounded-pill small"
                                                              :class="getSpecialCount(chapter.count, questionTypesAvailability[activeQuestionTypeIndex].type, chapter.id) > 0 ? 'bg-primary' : 'bg-secondary'">
                                                          {{ getSpecialCount(chapter.count, questionTypesAvailability[activeQuestionTypeIndex].type, chapter.id) }}
                                                        </span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              <div v-else class="alert alert-info small">
                                                No chapter data available for this question type.
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </template>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                        <tfoot class="table-light">
                          <tr>
                            <td class="text-end fw-bold">Total Marks:</td>
                            <td class="fw-bold text-center">{{ patternDetails.total_marks }}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Create Test Paper Button (moved below pattern card) -->
            <div class="text-end mt-3 mb-5">
              <button
                type="submit"
                class="btn btn-dark"
                id="createTestPaperBtn"
                :disabled="!isMarksDistributionValid || !hasGeneratedDistribution"
                :title="getCreateButtonTooltip()"
              >
                <i class="bi bi-file-earmark-text me-2"></i>
                Generate Questions
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'

// Define component name (for linter)
defineOptions({
  name: 'CreateTestPaperDetail'
})

// Setup router and route
const router = useRouter()
const route = useRoute()

// User profile and school data interfaces
interface UserProfile {
  id: number;
  name: string;
  email_id: string;
  schools: {
    id: number;
    name: string;
  }[];
  teaching_subjects: {
    id: number;
    standard: {
      id: number;
      name: string;
      sequence_number: number;
    };
    subject: {
      id: number;
      name: string;
    };
    medium: {
      id: number;
      name: string;
    };
  }[];
}

// Pattern data interface
interface PatternSection {
  id: number;
  pattern_id: number;
  sequence_number: number;
  section_number: number;
  sub_section: string | null;
  section_name: string;
  total_questions: number;
  mandotory_questions: number;
  marks_per_question: number;
  created_at: string;
  updated_at: string;
  subsection_question_types?: {
    id: number;
    section_id: number;
    seqencial_subquestion_number: number;
    question_type_id: number;
    question_type?: {
      id: number;
      type_name: string;
    };
  }[];
}

interface Pattern {
  id: number;
  pattern_name: string;
  board_id: number;
  standard_id: number;
  subject_id: number;
  total_marks: number;
  created_at: string;
  updated_at: string;
  board?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  standard?: {
    id: number;
    name: string;
    sequence_number: number;
  };
  subject?: {
    id: number;
    name: string;
  };
  sections?: PatternSection[];
}

// State variables for profile data
const userProfile = ref<UserProfile | null>(null)
const patternDetails = ref<Pattern | null>(null)
const isLoading = ref(false)

// Get question source from query params
const questionSource = computed(() => route.query.questionSource as string ?? 'both')

// Replace placeholder chapters with state from API
const availableChapters = ref<AvailableChapter[]>([])
const isLoadingChapters = ref(false)
const currentQuestionTypeId = ref<number | null>(null)
const questionTypesData = ref<QuestionTypeData[]>([])
const chapterMarksRanges = ref<ChapterMarksRange[]>([])

// Store selected chapters for each question
const selectedChapters = ref<Record<string, number>>({})

// State for advanced selection
const isLoadingQuestionTypes = ref(false);
const questionTypeError = ref<string | null>(null);
const questionTypesAvailability = ref<QuestionTypeAvailability[]>([]);
const activeEditQuestion = ref<{sectionId: number, questionIndex: number} | null>(null);
const activeQuestionTypeIndex = ref(0);

// Store mappings of question type IDs to their special count limits
const specialQuestionTypeCounts = ref<Record<number, number>>({});

// Default special count for all question types
const defaultSpecialCount = ref(3);

// Add a debounce/batch update mechanism to avoid excessive API calls
const pendingAllocationUpdate = ref(false);
let allocationUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

// Add a flag to track manual marks changes
const marksManuallyChanged = ref(false);

// Add a new state variable to track if the user has generated distribution after changes
const hasGeneratedDistribution = ref(false);

// Used questions tracking
const usedQuestions = ref<Record<string, number>>({});

// State for chapters and total marks
const chapters = ref<ChapterWithMarks[]>([])
const totalMarks = ref<number>(0)

// New interface for available chapter data from API
interface AvailableChapter {
  chapterId: number;
  chapterName: string;
  questionCount: number;
  marks?: number;        // New property to store marks allocated to this chapter
  percentage?: number;   // New property to show percentage of total marks
}

// New interface for API response structure
interface QuestionTypeChapter {
  id: number;
  name: string;
  count: number;
}

interface QuestionTypeData {
  type: number;
  name: string;
  chapters: QuestionTypeChapter[];
}

// New interface for chapter marks range API response
interface ChapterMarksRange {
  chapterId: number;
  chapterName: string;
  possibleMarks: number[];
  minMarks: number;
  maxMarks: number;
}

// Define interfaces for API responses
interface AllocationChapter {
  chapterId: number;
  chapterName: string;
  absoluteMarks: number;
  requestedMarks?: number;
}

interface SubsectionAllocation {
  subsectionQuestionTypeId: number;
  section_id: number;
  questionTypeName: string;
  sequentialNumber: number;
  question_type_id: number;
  question_type: {
    id: number;
    type_name: string;
  };
  allocatedChapters: Array<{
    chapterId: number;
    chapterName: string;
  }>;
}

interface SectionAllocation {
  sectionId: number;
  pattern_id: number;
  sectionName: string;
  sequentialNumber: number;
  section_number: number;
  subSection: string;
  totalQuestions: number;
  mandotory_questions: number;
  marks_per_question: number;
  absoluteMarks: number;
  totalMarks: number;
  subsectionAllocations: SubsectionAllocation[];
}

interface TestPaperAllocation {
  patternId: number;
  patternName: string;
  totalMarks: number;
  absoluteMarks: number;
  questionOrigin: string;
  mediums: Array<{
    id: number;
    instruction_medium: string;
  }>;
  sectionAllocations: SectionAllocation[];
  chapterMarks: AllocationChapter[];
  insufficientQuestions?: boolean;
  allocationMessage?: string;
}

// Method to update selected chapter for a question
const updateSelectedChapter = (sectionId: number, questionIndex: number, chapterId: number) => {
  const key = `${sectionId}-${questionIndex}`;
  // Check if this is an actual change to avoid unnecessary updates
  const previousChapterId = selectedChapters.value[key];
  const isNewChapter = previousChapterId !== chapterId;
  
  // Update the selected chapter
  selectedChapters.value[key] = chapterId;
  console.log(`Selected chapter ${chapterId} for section ${sectionId}, question ${questionIndex}`);
  
  // Only trigger updates if this is a new chapter selection
  if (isNewChapter) {
    scheduleAllocationUpdate();
  }
  
  // Update available chapters data for this question type if needed
  updateQuestionTypeData(sectionId, questionIndex);
}

// Extract allocation update scheduling to reduce complexity
const scheduleAllocationUpdate = () => {
  console.log('Marking for marks distribution update');
  
  // Set flag to indicate pending update
  pendingAllocationUpdate.value = true;
  
  // Cancel any existing timeout to prevent multiple rapid calls
  if (allocationUpdateTimeout) {
    clearTimeout(allocationUpdateTimeout);
  }
  
  // Schedule allocation update after a short delay to batch multiple changes
  allocationUpdateTimeout = setTimeout(() => {
    if (pendingAllocationUpdate.value) {
      processAllocationUpdate();
    }
  }, 500); // Wait 500ms to batch multiple changes
}

// Extract allocation update processing to reduce complexity
const processAllocationUpdate = () => {
  console.log('Executing batched marks distribution update');
  // Only fetch allocation if we actually need to update
  fetchTestPaperAllocation().then(() => {
    if (testPaperAllocation.value?.chapterMarks) {
      console.log('Got test paper allocation, updating chapter marks');
      // Use the same function as Generate buttons to properly update pattern card
      updateChapterMarksFromDistribution(testPaperAllocation.value);
      // Update available chapters for current view if needed
      fetchAvailableChapters(currentQuestionTypeId.value ?? 0);
    } else {
      console.warn('No chapter marks found in test paper allocation');
    }
    // Reset the pending flag after update
    pendingAllocationUpdate.value = false;
  }).catch(error => {
    console.error('Error fetching test paper allocation:', error);
    pendingAllocationUpdate.value = false;
  });
}

// Extract question type data update to reduce complexity
const updateQuestionTypeData = (sectionId: number, questionIndex: number) => {
  const section = patternDetails.value?.sections?.find(s => s.id === sectionId);
  if (!section?.subsection_question_types || section.subsection_question_types.length === 0) {
    return;
  }
  
  const questionTypeId = getQuestionTypeId(section, questionIndex);
  
  // If we found a question type ID, fetch its data
  if (questionTypeId !== null && questionTypeId !== currentQuestionTypeId.value) {
    fetchQuestionTypeData(questionTypeId);
  }
}

// Extract question type ID determination to reduce complexity
const getQuestionTypeId = (section: PatternSection, questionIndex: number): number | null => {
  if (hasOnlyOneQuestionType(section)) {
    // If there's only one type, use that type for all questions
    return section.subsection_question_types?.[0]?.question_type_id ?? null;
  } else {
    // Otherwise, find the specific question type for this question index
    const questionType = section.subsection_question_types?.find(
      qt => qt.seqencial_subquestion_number === questionIndex
    );
    return questionType?.question_type_id ?? null;
  }
}

// Method to get selected chapter for a question
const getSelectedChapter = (sectionId: number, questionIndex: number): number | null => {
  const key = `${sectionId}-${questionIndex}`;
  return selectedChapters.value[key] ?? null;
}

// Fetch available chapters for a specific question type
const fetchAvailableChapters = async (questionTypeId: number) => {
  if (!questionTypeId) return;
  
  // This API will be implemented later
  console.log('fetchAvailableChapters will be implemented later');
  isLoadingChapters.value = false;
  
  // For now, just use chapters data as fallback
  if (chapters.value.length > 0) {
    availableChapters.value = chapters.value.map(chapter => ({
      chapterId: chapter.id,
      chapterName: `${chapter.sequential_chapter_number}. ${chapter.name}`,
      questionCount: 0,
      marks: chapter.marks,
      percentage: calculatePercentage(chapter.marks)
    }));
    
    // Sort fallback data by marks
    availableChapters.value.sort((a, b) => (b.marks ?? 0) - (a.marks ?? 0));
  }
};

// Computed property to get total marks assigned
const totalAssignedMarks = computed(() => {
  return chapters.value.reduce((total, chapter) => total + (chapter.marks ?? 0), 0)
})

// Add a computed property for absolute marks
const absoluteMarks = computed(() => {
  return testPaperAllocation.value?.absoluteMarks ?? totalMarks.value ?? 0;
});

// Update isMarksDistributionValid computed property to use absoluteMarks
const isMarksDistributionValid = computed(() => {
  if (chapters.value.length === 0 || !absoluteMarks.value) return true;
  return totalAssignedMarks.value === absoluteMarks.value;
})

// Check if any chapter has 0 marks
const hasZeroMarksChapters = computed(() => {
  return chapters.value.some(chapter => chapter.marks === 0)
})

// Get details from query parameters
const patternId = route.query.patternId as string
const boardName = computed(() => decodeURIComponent(route.query.board as string ?? 'Not Selected'))
const mediumName = computed(() => decodeURIComponent(route.query.medium as string ?? 'Not Selected'))
const standardName = computed(() => decodeURIComponent(route.query.standard as string ?? 'Not Selected'))
const subjectName = computed(() => decodeURIComponent(route.query.subject as string ?? 'Not Selected'))
const patternName = computed(() => decodeURIComponent(route.query.patternName as string ?? 'Not Selected'))

// Fetch pattern details
const fetchPatternDetails = async () => {
  if (!patternId) return;
  
  try {
    isLoading.value = true;
    const response = await axiosInstance.get(`/patterns/${patternId}`);
    patternDetails.value = response.data;
    
    // Update total marks from pattern if not already set
    if (!totalMarks.value && patternDetails.value?.total_marks) {
      totalMarks.value = patternDetails.value.total_marks;
      
      // If only one chapter, assign all marks to it
      if (chapters.value.length === 1) {
        chapters.value[0].marks = absoluteMarks.value;
      }
      // Otherwise, marks will need to be manually assigned by the user
    }
  } catch (error) {
    console.error('Error fetching pattern details:', error);
  } finally {
    isLoading.value = false;
  }
  
  // Initialize used question counts
  initializeUsedQuestionCounts();
}

// Calculate percentage for a given marks value
const calculatePercentage = (marks: number): number => {
  if (!totalMarks.value) return 0
  return Math.round((marks / totalMarks.value) * 100)
}

// Format percentage with leading zero for single digits
const formatPercentage = (percentage: number): string => {
  return percentage < 10 ? `0${percentage}` : `${percentage}`
}

// Parse and set chapters from query parameters
const parseChaptersFromQuery = () => {
  try {
    if (route.query.chapters && typeof route.query.chapters === 'string') {
      const chaptersData = JSON.parse(decodeURIComponent(route.query.chapters)) as ChapterQueryData[]
      chapters.value = chaptersData.map((chapter: ChapterQueryData) => ({
        ...chapter,
        marks: 0 // Initialize with 0 since ChapterQueryData doesn't have marks
      }))
    }
    
    // Set total marks from query params
    if (route.query.totalMarks && typeof route.query.totalMarks === 'string') {
      totalMarks.value = Number.parseInt(route.query.totalMarks, 10)
      
      // If only one chapter, assign all marks to it
      if (chapters.value.length === 1) {
        chapters.value[0].marks = absoluteMarks.value;
      }
      // Otherwise, marks will need to be manually assigned by the user
    }
  } catch (error) {
    console.error('Error parsing chapters data:', error)
  }
}

/**
 * Initialize chapter selections for all questions in each section
 * This is called after pattern details are loaded to pre-select chapters based on marks distribution
 */
const initializeChapterSelections = () => {
  console.log('Initializing chapter selections...');
  
  // Get chapters sorted by marks descending
  const sortedChapters = [...chapters.value].sort((a, b) => b.marks - a.marks);
  
  if (!validateChaptersAndSections(sortedChapters)) {
    return;
  }
  
  // For each section, initialize the question-chapter assignments
  const sections = patternDetails.value?.sections ?? [];
  for (const section of sections) {
    assignChaptersToSection(section, sortedChapters);
  }
  
  console.log('Finished initializing chapter selections');
  
  // Now fetch allocation once, after all selections have been made
  fetchAndProcessAllocation();
}

/**
 * Validates chapters and sections availability and sets initial state
 */
const validateChaptersAndSections = (sortedChapters: ChapterWithMarks[]) => {
  if (sortedChapters.length === 0) {
    console.warn('No chapters available to initialize selections');
    return false;
  }
  
  // If there's only one chapter, automatically set hasGeneratedDistribution to true
  if (sortedChapters.length === 1) {
    console.log('Only one chapter detected, automatically setting hasGeneratedDistribution to true');
    hasGeneratedDistribution.value = true;
  }
  
  // Get pattern sections
  const sections = patternDetails.value?.sections ?? [];
  if (sections.length === 0) {
    console.warn('No pattern sections available to initialize selections');
    return false;
  }
  
  console.log('Initializing selections for sections:', sections);
  return true;
}

/**
 * Assigns chapters to questions in a section
 */
const assignChaptersToSection = (section: PatternSection, sortedChapters: ChapterWithMarks[]) => {
  // For sections with only one question type
  if (hasOnlyOneQuestionType(section)) {
    assignChaptersToSingleTypeSection(section, sortedChapters);
  } 
  // For sections with multiple question types
  else if (section.subsection_question_types && section.subsection_question_types.length > 0) {
    assignChaptersToMultiTypeSection(section, sortedChapters);
  }
}

/**
 * Assigns chapters to a section with a single question type
 */
const assignChaptersToSingleTypeSection = (section: PatternSection, sortedChapters: ChapterWithMarks[]) => {
  // Assign each numbered question to a chapter, giving priority to chapters with more marks
  for (let i = 1; i <= section.total_questions; i++) {
    assignChapterToQuestion(section.id, i, sortedChapters);
  }
}

/**
 * Assigns chapters to a section with multiple question types
 */
const assignChaptersToMultiTypeSection = (section: PatternSection, sortedChapters: ChapterWithMarks[]) => {
  for (const qType of (section.subsection_question_types ?? [])) {
    if (qType.seqencial_subquestion_number) {
      assignChapterToQuestion(section.id, qType.seqencial_subquestion_number, sortedChapters);
    }
  }
}

/**
 * Assigns a chapter to a specific question
 */
const assignChapterToQuestion = (sectionId: number, questionIndex: number, sortedChapters: ChapterWithMarks[]) => {
  const key = `${sectionId}-${questionIndex}`;
  
  if (sortedChapters.length === 1) {
    // If there's only one chapter, assign all questions to it
    selectedChapters.value[key] = sortedChapters[0].id;
  } else {
    // Otherwise, distribute based on marks percentage
    const chapIndex = questionIndex % sortedChapters.length;
    selectedChapters.value[key] = sortedChapters[chapIndex].id;
  }
}

/**
 * Fetches allocation and processes the results
 */
const fetchAndProcessAllocation = () => {
  fetchTestPaperAllocation().then(() => {
    // Update chapter marks based on the initialization we just did
    if (testPaperAllocation.value?.chapterMarks) {
      // Use the same function as Generate buttons to properly update pattern card
      updateChapterMarksFromDistribution(testPaperAllocation.value);
      
      // Set hasGeneratedDistribution to true since we just loaded allocation data
      hasGeneratedDistribution.value = true;
      
      // Update the available chapters for current view
      if (currentQuestionTypeId.value) {
        fetchAvailableChapters(currentQuestionTypeId.value);
      }
    }
    // Reset the pending flag after update
    pendingAllocationUpdate.value = false;
  }).catch(error => {
    console.error('Error fetching test paper allocation after initialization:', error);
    pendingAllocationUpdate.value = false;
  });
}

// Raw API responses data storage
const testPaperAllocation = ref<TestPaperAllocation | null>(null);
const lastUsedEndpoint = ref<'allocation' | 'distribute' | null>(null);

// Helper function to resolve medium IDs from various sources
const resolveMediumIds = (): number[] => {
  let mediumIds: number[] = [];
  
  // Try to get from route parameters first
  if (route.query.mediumId) {
    const mediumIdParam = route.query.mediumId.toString();
    // Handle both single value and comma-separated values
    mediumIds = mediumIdParam.split(',')
                 .map(id => Number.parseInt(id.trim(), 10))
                 .filter(id => !Number.isNaN(id));
  }
  
  // If no valid medium IDs found in route parameters, try fallback options
  if (mediumIds.length === 0) {
    console.warn('No valid medium IDs found in route parameters, using fallback');
    
    // Try to get from user profile
    if (userProfile.value?.teaching_subjects?.[0]?.medium?.id) {
      const mediumIdFromProfile = Number.parseInt(userProfile.value.teaching_subjects[0].medium.id, 10);
      if (!Number.isNaN(mediumIdFromProfile)) {
        mediumIds.push(mediumIdFromProfile);
      }
    }
    
    // Last resort fallback - only if needed
    if (mediumIds.length === 0) {
      console.warn('Using default medium ID 1 as last resort');
      mediumIds.push(1);
    }
  }
  
  console.log('Using medium IDs for allocation:', mediumIds);
  return mediumIds;
}

// Add a method to fetch test paper allocation
const fetchTestPaperAllocation = async () => {
  try {
    isLoading.value = true;
    
    // Get chapter IDs
    const chapterIds = chapters.value.map(chapter => chapter.id).join(',');
    
    // Get medium IDs using the helper function
    const mediumIds = resolveMediumIds();
    
    // Call the API endpoint with the current selected chapters
    const response = await axiosInstance.get('/create-test-paper/allocation', {
      params: {
        patternId: patternId,
        chapterIds: chapterIds.split(',').map(Number),
        mediumIds: mediumIds,
        questionOrigin: questionSource.value ?? 'both'
      }
    });
    
    if (response.data) {
      console.log('Allocation API response:', response.data);
      testPaperAllocation.value = response.data;
      
      // Store the allocation data and update last used endpoint
      localStorage.setItem('allocationData', JSON.stringify(response.data));
      lastUsedEndpoint.value = 'allocation';
      localStorage.setItem('lastUsedEndpoint', 'allocation');
      
      // Update chapter marks based on the allocation
      if (testPaperAllocation.value?.chapterMarks) {
        // Use the same function as Generate buttons to properly update pattern card
        updateChapterMarksFromDistribution(response.data);
        return response.data; // Return data for promise chaining
      } else {
        console.warn('No chapter marks found in test paper allocation response');
      }
    } else {
      console.warn('Empty response from test paper allocation API');
    }
    
  } catch (error) {
    console.error('Error fetching test paper allocation:', error);
    throw error; // Rethrow to allow catch in the calling function
  } finally {
    isLoading.value = false;
  }
};

// Method to update chapter marks based on allocation
const updateChapterMarksFromAllocation = () => {
  if (!testPaperAllocation.value?.chapterMarks || chapters.value.length === 0) {
    console.warn('Cannot update chapter marks: No allocation data or no chapters available');
    return;
  }
  
  console.log('Updating chapter marks from allocation:', testPaperAllocation.value.chapterMarks);
  
  // For each chapter in our state, find the corresponding chapter in the allocation
  for (const chapter of chapters.value) {
    updateSingleChapterMarks(chapter);
  }
  
  // Verify total marks after update
  console.log(`Marks distribution after update: Total ${totalAssignedMarks.value}/${absoluteMarks.value}`);
};

// Helper function to update marks for a single chapter
const updateSingleChapterMarks = (chapter: ChapterWithMarks) => {
  const allocationChapter = findAllocationChapter(chapter.id);
  if (!allocationChapter) {
    console.warn(`No allocation found for chapter ${chapter.id} (${chapter.name})`);
    return;
  }
  
  const suggestedMarks = allocationChapter.absoluteMarks;
  const previousMarks = chapter.marks;
  
  // Update the chapter marks based on the suggested marks and available ranges
  chapter.marks = calculateAppropriateMarks(chapter.id, suggestedMarks);
  
  // Log changes if marks were updated
  if (previousMarks !== chapter.marks) {
    console.log(`Updated marks for chapter ${chapter.id} (${chapter.name}): ${previousMarks} → ${chapter.marks}`);
  }
};

// Helper function to find allocation chapter by ID
const findAllocationChapter = (chapterId: number): AllocationChapter | undefined => {
  return testPaperAllocation.value?.chapterMarks.find(
    (ch: AllocationChapter) => ch.chapterId === chapterId
  );
};

// Helper function to calculate appropriate marks based on available ranges
const calculateAppropriateMarks = (chapterId: number, suggestedMarks: number): number => {
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapterId);
  
  if (!range) {
    return suggestedMarks; // No range constraints, use suggested marks directly
  }
  
  // If the suggested marks are in the possible marks range, use them
  if (range.possibleMarks.includes(suggestedMarks)) {
    return suggestedMarks;
  }
  
  // Otherwise find the closest valid mark in the range
  return findClosestValidMark(range.possibleMarks, suggestedMarks);
};

// Helper function to find the closest valid mark to a suggested value
const findClosestValidMark = (possibleMarks: number[], targetValue: number): number => {
  return possibleMarks.reduce((prev, curr) => {
    return Math.abs(curr - targetValue) < Math.abs(prev - targetValue) ? curr : prev;
  }, possibleMarks[0]);
};

// Method to get the allocated chapter name for a specific section and question
const getAllocatedChapterName = (sectionId: number, questionIndex: number): string => {
  const chapterId = getSelectedChapter(sectionId, questionIndex);
  if (chapterId === null) {
    return 'Click to select chapter';
  }
  
  const chapter = chapters.value.find(c => c.id === chapterId);
  return chapter ? `${chapter.sequential_chapter_number}. ${chapter.name}` : 'Unknown chapter';
};

// Update the onMounted hook to optimize API calls
onMounted(async () => {
  console.log('Component mounted - starting initialization');
  
  // Set pending flag to prevent watch handlers from triggering additional API calls
  pendingAllocationUpdate.value = true;
  
  try {
    // Fetch user profile
    await fetchUserProfile();
    
    // Parse chapters from query parameters
    parseChaptersFromQuery();
    
    // Fetch pattern details
    await fetchPatternDetails();
    
    // Fetch chapter marks ranges
    await fetchChapterMarksRanges();
    
    // If there's only one chapter, automatically set hasGeneratedDistribution to true
    if (chapters.value.length === 1) {
      console.log('Only one chapter detected on mount, automatically setting hasGeneratedDistribution to true');
      hasGeneratedDistribution.value = true;
    }
    
    // Initialize chapter selections - this will make a single API call after assignments
    initializeChapterSelections();
    
    // Initialize used questions count after chapter selections
    updateUsedQuestionsCount();
    
    // Set initial state of hasGeneratedDistribution based on whether we have allocation data
    // Only override if we didn't already set it for a single chapter
    if (chapters.value.length > 1) {
    hasGeneratedDistribution.value = false;
    }
  } catch (error) {
    console.error('Error during component initialization:', error);
    // Reset the pending flag even if there was an error
    pendingAllocationUpdate.value = false;
  }
});

// Form submission handler
const createTestPaper = async () => {
  if (!isMarksDistributionValid.value) {
    if (totalAssignedMarks.value > absoluteMarks.value) {
      alert(`Total assigned marks (${totalAssignedMarks.value}) exceed the required ${absoluteMarks.value} marks. Please adjust the marks to create a test paper.`);
    } else {
      alert(`Total assigned marks must equal ${absoluteMarks.value} marks.`);
    }
    return;
  }
  
  if (hasZeroMarksChapters.value) {
    // Just show a warning but allow submission if user confirms
    if (!confirm('Some chapters have 0 marks. Are you sure you want to continue?')) {
      return
    }
  }
  
  // First make sure we have allocation data from either method
  if (!testPaperAllocation.value) {
    alert('No allocation data available. Please generate marks distribution first.');
    return;
  }
  
  try {
    isLoading.value = true;
    
    // Log data for debugging
    console.log('Creating test paper with allocation data:', testPaperAllocation.value);
    
    // Make the POST request to get the final questions distribution
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', testPaperAllocation.value);
    
    console.log('Final questions distribution response:', response.data);
    
    if (!response.data) {
      throw new Error('No data received from final questions distribution API');
    }
    
    // Save the final questions distribution response to localStorage for use in preview
    localStorage.setItem('finalQuestionsDistribution', JSON.stringify(response.data));
    
    // Prepare query parameters to pass to the test paper preview page
    const queryParams = {
      // Display names for UI
      board: encodeURIComponent(boardName.value),
      medium: encodeURIComponent(mediumName.value),
      standard: encodeURIComponent(standardName.value),
      subject: encodeURIComponent(subjectName.value),
      patternName: encodeURIComponent(patternName.value),
      
      // Other details
      totalMarks: route.query.totalMarks as string,
      // Add a flag indicating the questions distribution is available in localStorage
      hasFinalDistribution: 'true'
    }
    
    // Navigate to the test paper preview page
    router.push({
      name: 'testPaperPreview',
      query: queryParams
    });
    
  } catch (error) {
    console.error('Error creating test paper:', error);
    showErrorToast(error instanceof Error ? error.message : 'Failed to create test paper. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

// Fetch user profile to get school ID
const fetchUserProfile = async () => {
  if (route.query.board) {
    // If board is already provided in route, no need to fetch
    return
  }
  
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/auth/profile')
    if (response.data?.data) {
      userProfile.value = response.data.data
      // We can directly use board details from userProfile instead of fetching school details
      // No need to call fetchSchoolDetails() since board info is available in profile
    } else {
      console.error('Unexpected API response format for user profile:', response.data)
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  } finally {
    isLoading.value = false
  }
}

// Go back to previous page
const goBack = () => {
  router.back()
}

// State variable to track question types visibility
const questionTypesVisibility = ref<Record<number, boolean>>({})

// Method to toggle question types visibility
const toggleQuestionTypes = async (sectionId: number) => {
  // Toggle visibility first for immediate UI feedback
  questionTypesVisibility.value[sectionId] = !questionTypesVisibility.value[sectionId]
  
  // Only fetch chapters if we're expanding the section and we have question types
  if (questionTypesVisibility.value[sectionId]) {
    const section = patternDetails.value?.sections?.find(s => s.id === sectionId);
    if (section) {
      await selectQuestionTypeForSection(section);
    }
  }
}

// Method to fetch question type data for a specific question type ID
const fetchQuestionTypeData = async (questionTypeId: number) => {
  // If we already have this question type's data from a previous API call, use it
  const existingData = findExistingQuestionTypeData(questionTypeId);
  if (existingData) {
    updateAvailableChaptersFromExistingData(existingData);
    return;
  }
  
  // Otherwise fetch data from API
  await fetchAvailableChapters(questionTypeId);
};

// Helper function to find existing question type data
const findExistingQuestionTypeData = (questionTypeId: number) => {
  if (questionTypesData.value.length > 0) {
    return questionTypesData.value.find(qt => qt.type === questionTypeId);
  }
  return null;
};

// Helper function to update available chapters from existing data
const updateAvailableChaptersFromExistingData = (existingData: QuestionTypeData) => {
  // Update available chapters without making a new API call
  availableChapters.value = existingData.chapters.map(chapter => ({
    chapterId: chapter.id,
    chapterName: chapter.name,
    questionCount: chapter.count,
    marks: matchedChapter?.marks ?? 0,
    percentage: matchedChapter ? calculatePercentage(matchedChapter.marks) : 0
  }));
  
  // Sort chapters by marks then question count
  sortAvailableChaptersByMarks();
};

// Helper function to sort available chapters by marks and question count
const sortAvailableChaptersByMarks = () => {
  availableChapters.value.sort((a, b) => {
    const aMarks = a.marks ?? 0;
    const bMarks = b.marks ?? 0;
    
    if (bMarks !== aMarks) {
      return bMarks - aMarks;
    }
    return (b.questionCount ?? 0) - (a.questionCount ?? 0);
  });
};

// New method to select appropriate question type for a section
const selectQuestionTypeForSection = async (section: PatternSection) => {
  if (!section?.subsection_question_types?.length) {
    return;
  }
  
  // If there's only one type of question in this section, use that type
  if (hasOnlyOneQuestionType(section)) {
    const firstQuestionType = section.subsection_question_types[0];
    if (firstQuestionType?.question_type_id) {
      await fetchAvailableChapters(firstQuestionType.question_type_id);
    }
  } 
  // Otherwise use the first question type for now
  else if (section.subsection_question_types[0]?.question_type_id) {
    await fetchAvailableChapters(section.subsection_question_types[0].question_type_id);
  }
}

// Method to decrement marks for a chapter
const decrementMarks = (chapter: ChapterWithMarks) => {
  if (canDecrement(chapter)) {
    // Set the flag to prevent the watcher from triggering an update
    pendingAllocationUpdate.value = true;
    marksManuallyChanged.value = true;
    
    // Update the marks
    chapter.marks = getPreviousValidMark(chapter);
    
    // Reset the generated distribution flag since marks were changed manually
    hasGeneratedDistribution.value = false;
    
    // Reset the flags after a short delay to allow other changes
    // without triggering multiple API calls
    setTimeout(() => {
      pendingAllocationUpdate.value = false;
      marksManuallyChanged.value = false;
    }, 1000);
  }
}

// Method to increment marks for a chapter
const incrementMarks = (chapter: ChapterWithMarks) => {
  if (canIncrement(chapter)) {
    // Set the flag to prevent the watcher from triggering an update
    pendingAllocationUpdate.value = true;
    marksManuallyChanged.value = true;
    
    // Update the marks
    chapter.marks = getNextValidMark(chapter);
    
    // Reset the generated distribution flag since marks were changed manually
    hasGeneratedDistribution.value = false;
    
    // Reset the flags after a short delay to allow other changes
    // without triggering multiple API calls
    setTimeout(() => {
      pendingAllocationUpdate.value = false;
      marksManuallyChanged.value = false;
    }, 1000);
  }
}

// Method to check if question types are visible for a given section
const isQuestionTypesVisible = (sectionId: number): boolean => {
  return questionTypesVisibility.value[sectionId] ?? false
}

// New computed function to check if a section has only one question type
const hasOnlyOneQuestionType = (section: PatternSection): boolean => {
  if (!section.subsection_question_types || section.subsection_question_types.length === 0) {
    return false;
  }
  const questionTypeIds = new Set();
  for (const qType of section.subsection_question_types) {
    if (qType.question_type_id) {
      questionTypeIds.add(qType.question_type_id);
    }
  }
  return questionTypeIds.size === 1;
}

// New computed function to generate a numbered list of question types in a section
const generateNumberedList = (section: PatternSection): Array<{number: number; typeName: string}> => {
  if (!section.subsection_question_types || section.subsection_question_types.length === 0 || !section.total_questions) {
    return [];
  }
  
  // Get the type name from the first question (since all are same type)
  const typeName: string = section.subsection_question_types[0]?.question_type?.type_name ?? 'Unknown Type';
  
  // Generate a list of questions with numbers from 1 to total_questions
  const result: Array<{number: number; typeName: string}> = [];
  for (let i = 1; i <= section.total_questions; i++) {
    result.push({ number: i, typeName });
  }
  
  return result;
}

// Fetch chapter marks ranges from API
const fetchChapterMarksRanges = async () => {
  if (!patternId || chapters.value.length === 0) return;
  
  try {
    isLoading.value = true;
    
    // Get chapter IDs from the chapters state
    const chapterIds = chapters.value.map(chapter => chapter.id).join(',');
    
    // Get medium ID from route or profile
    const mediumId = route.query.mediumId ?? 
                    userProfile.value?.teaching_subjects?.[0]?.medium?.id ?? 
                    '1';
    
    // Call the API endpoint
    const response = await axiosInstance.get('/test-paper/chapters/marks/range', {
      params: {
        patternId: patternId,
        chapterIds: chapterIds,
        mediumIds: mediumId
      }
    });
    
    // Check if the response is valid
    if (Array.isArray(response.data)) {
      chapterMarksRanges.value = response.data;
      console.log('Chapter marks ranges loaded successfully.');
      
      // Validate that current marks are within range
      validateCurrentMarksAgainstRanges();
    } else {
      console.error('Invalid response format for chapter marks ranges:', response.data);
      // Show error notification instead of creating fallback ranges
      showErrorToast('Failed to load valid marks ranges. Please try again.');
    }
  } catch (error) {
    console.error('Error fetching chapter marks ranges:', error);
    // Show error notification instead of creating fallback ranges
    showErrorToast('Failed to load valid marks ranges. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Helper function to show success toast
const showSuccessToast = (message: string) => {
  const successToast = document.createElement('div');
  successToast.className = 'alert alert-success alert-dismissible fade show fixed-top mx-auto mt-3';
  successToast.style.width = '350px';
  successToast.style.zIndex = '9999';
  successToast.innerHTML = `
    <strong>Success!</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(successToast);
  
  // Remove the toast after 3 seconds
  setTimeout(() => {
    successToast.remove();
  }, 3000);
};

// Helper function to show error toast
const showErrorToast = (message: string) => {
  const errorToast = document.createElement('div');
  errorToast.className = 'alert alert-danger alert-dismissible fade show fixed-top mx-auto mt-3';
  errorToast.style.width = '350px';
  errorToast.style.zIndex = '9999';
  errorToast.innerHTML = `
    <strong>Error!</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(errorToast);
  
  // Remove the toast after 5 seconds
  setTimeout(() => {
    errorToast.remove();
  }, 5000);
};

// Validate that current marks are within range and adjust if needed
const validateCurrentMarksAgainstRanges = () => {
  for (const chapter of chapters.value) {
    const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
    if (range && !range.possibleMarks.includes(chapter.marks)) {
      console.log(`Chapter ${chapter.id} marks (${chapter.marks}) not in valid range, adjusting...`);
      
      // Find closest valid mark
      const closestMark = range.possibleMarks.reduce((prev, curr) => {
        return Math.abs(curr - chapter.marks) < Math.abs(prev - chapter.marks) ? curr : prev;
      }, range.possibleMarks[0]);
      
      chapter.marks = closestMark;
    }
  }
};

// Method to get the next valid mark for a chapter (for increment)
const getNextValidMark = (chapter: ChapterWithMarks): number => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  
  // If no range found, just increment by 1
  if (!range) return chapter.marks + 1;
  
  // Find the next valid mark in the possibleMarks array
  const nextMark = range.possibleMarks.find(mark => mark > chapter.marks);
  
  // If no next mark found, return the current mark
  return nextMark ?? chapter.marks;
};

// Method to get the previous valid mark for a chapter (for decrement)
const getPreviousValidMark = (chapter: ChapterWithMarks): number => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  
  // If no range found, just decrement by 1 (but not below 0)
  if (!range) return Math.max(0, chapter.marks - 1);
  
  // Find all marks less than the current mark
  const previousMarks = range.possibleMarks.filter(mark => mark < chapter.marks);
  
  // Return the highest previous mark, or 0 if none found
  return previousMarks.length > 0 ? Math.max(...previousMarks) : 0;
};

// Method to check if decrement is available for a chapter
const canDecrement = (chapter: ChapterWithMarks): boolean => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  
  // If no range found, allow decrement if marks > 0
  if (!range) return chapter.marks > 0;
  
  // If current mark is at or below minMarks, disable decrement
  if (chapter.marks <= range.minMarks) return false;
  
  // Check if there are any valid marks less than the current mark
  return range.possibleMarks.some(mark => mark < chapter.marks);
};

// Method to check if increment is available for a chapter
const canIncrement = (chapter: ChapterWithMarks): boolean => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  
  // If no range found, allow increment
  if (!range) return true;
  
  // If current mark is at or above maxMarks, disable increment
  if (chapter.marks >= range.maxMarks) return false;
  
  // Check if there are any valid marks greater than the current mark
  return range.possibleMarks.some(mark => mark > chapter.marks);
};

// Helper method to get the valid marks tooltip text
const getValidMarksTooltip = (chapter: ChapterWithMarks): string => {
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  if (!range) return 'Any positive number';
  
  if (range.possibleMarks.length <= 10) {
    // Show all marks if there are 10 or fewer
    return range.possibleMarks.join(', ');
  } else {
    // Show first 5 and last 5 with ellipsis in between
    const first = range.possibleMarks.slice(0, 5).join(', ');
    const last = range.possibleMarks.slice(-5).join(', ');
    return `${first}, ... , ${last}`;
  }
};

// Helper method to get the chapter marks range display text
const getChapterMarksRange = (chapter: ChapterWithMarks): string => {
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  if (!range) return '';
  
  return `${range.minMarks} - ${range.maxMarks}`;
};

// Helper method to get tooltip text for when minimum marks is reached
const getChapterMinMarksTooltip = (chapter: ChapterWithMarks): string => {
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  if (!range) return 'No lower mark available';
  
  return `Minimum marks (${range.minMarks}) reached`;
};

// Helper method to get tooltip text for when maximum marks is reached
const getChapterMaxMarksTooltip = (chapter: ChapterWithMarks): string => {
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.id);
  if (!range) return 'No higher mark available';
  
  return `Maximum marks (${range.maxMarks}) reached`;
};

// Method for handling chapter selection
const handleChapterSelection = async (section?: PatternSection, questionIndex?: number) => {
  // Set the active edit question
  if (section && questionIndex) {
    activeEditQuestion.value = {
      sectionId: section.id,
      questionIndex: questionIndex
    };
    
    // Fetch question types availability if not already loaded
    if (questionTypesAvailability.value.length === 0) {
      isLoadingQuestionTypes.value = true;
      await fetchQuestionTypesAvailability();
      isLoadingQuestionTypes.value = false;
    }
  } else {
    // If no section or question index, clear the active edit question
    activeEditQuestion.value = null;
  }
}

// Track used questions for each section-question
const updateUsedQuestionsCount = () => {
  // Reset counts
  usedQuestions.value = {};
  
  // Count used questions based on selected chapters
  for (const [, chapterId] of Object.entries(selectedChapters.value)) {
    if (!usedQuestions.value[`${chapterId}-any`]) {
      usedQuestions.value[`${chapterId}-any`] = 0;
    }
    usedQuestions.value[`${chapterId}-any`] += 1;
  }
};

// Method to fetch question types availability
const fetchQuestionTypesAvailability = async () => {
  if (!patternId || chapters.value.length === 0) {
    questionTypeError.value = "Pattern ID or chapters are missing";
    return;
  }
  
  try {
    isLoadingQuestionTypes.value = true;
    questionTypeError.value = null;
    
    // Get chapter IDs
    const chapterIds = chapters.value.map(chapter => chapter.id).join(',');
    
    // Get medium ID from route or profile
    const mediumId = route.query.mediumId ?? 
                    userProfile.value?.teaching_subjects?.[0]?.medium?.id ?? 
                    '1';
    
    // Call the API endpoint
    const response = await axiosInstance.get('/chapters/checkQuestionType', {
      params: {
        patternId: patternId,
        chapterIds: chapterIds,
        mediumIds: mediumId
      }
    });
    
    // Check if the response is valid
    if (response.data?.success && response.data?.data?.questionTypes) {
      questionTypesAvailability.value = response.data.data.questionTypes;
      console.log('Question types availability loaded successfully:', questionTypesAvailability.value);
      
      // Run debug to check usage counts
      debugChapterUsage();
    } else {
      console.error('Invalid response format for question types availability:', response.data);
      questionTypeError.value = "Failed to load question types availability. Invalid response format.";
    }
  } catch (error) {
    console.error('Error fetching question types availability:', error);
    questionTypeError.value = "Failed to load question types availability. Please try again.";
  } finally {
    isLoadingQuestionTypes.value = false;
  }
};

// Method to select a chapter for a specific question
const selectChapterForQuestion = (questionType: number, chapterId: number, sectionId?: number, questionIndex?: number) => {
  if (!sectionId || !questionIndex) return;
  
  console.log(`Selecting chapter ${chapterId} for section ${sectionId}, question ${questionIndex}, type ${questionType}`);
  
  // Check if there's any special count left for this chapter and question type
  const matchingChapter = getChaptersForQuestionType(questionType)
    .find(c => c.id === chapterId);
  
  if (matchingChapter) {
    // Check the special count
    const specialCount = getSpecialCount(matchingChapter.count, questionType, chapterId);
    if (specialCount <= 0) {
      console.warn(`Cannot select chapter ${chapterId} for question type ${questionType} - no special count remaining`);
      return;
    }
  }
  
  // Check if a different chapter was previously selected for this question
  const previousChapterId = getSelectedChapter(sectionId, questionIndex);
  if (previousChapterId !== null && previousChapterId !== chapterId) {
    // Decrement the count for the previous chapter-question type combination
    const prevKey = `${previousChapterId}-${questionType}`;
    if (usedQuestions.value[prevKey] && usedQuestions.value[prevKey] > 0) {
      usedQuestions.value[prevKey] -= 1;
      console.log(`Decremented count for previous chapter ${previousChapterId}, type ${questionType}`);
    }
  }
  
  // Update the used questions count
  const key = `${chapterId}-${questionType}`;
  if (!usedQuestions.value[key]) {
    usedQuestions.value[key] = 0;
  }
  usedQuestions.value[key] += 1;
  
  // Update selected chapter - this will handle updating marks distribution
  updateSelectedChapter(sectionId, questionIndex, chapterId);
  
  // Close the chapter selection UI
  handleChapterSelection();
}



// Calculate special count for each chapter
const getSpecialCount = (count: number, questionType: number, chapterId: number): number => {
  // Get the default special count for this question type, or use the default value
  const typeSpecialCount = specialQuestionTypeCounts.value[questionType] ?? defaultSpecialCount.value;
  
  // Get the used count for this chapter and question type
  const key = `${chapterId}-${questionType}`;
  const usedCount = usedQuestions.value[key] ?? 0;
  
  // Remaining count is the default minus used
  return Math.max(0, typeSpecialCount - usedCount);
}

// Method to get formatted chapter name with special count
const getFormattedChapterName = (chapter: QuestionTypeChapter, questionType: number): string => {
  const specialCount = getSpecialCount(chapter.count, questionType, chapter.id);
  return `${chapter.name} (${specialCount})`;
}



// Method to get chapters for a specific question type
const getChaptersForQuestionType = (questionTypeId: number | undefined): QuestionTypeChapter[] => {
  if (!questionTypeId) return [];
  
  // First check if we already have data loaded in questionTypesAvailability
  if (questionTypesAvailability.value.length > 0) {
    const questionType = questionTypesAvailability.value.find(qt => qt.type === questionTypeId);
    if (questionType) {
      return questionType.chapters;
    }
  }
  
  // If we don't have data in questionTypesAvailability, check questionTypesData
  const questionType = questionTypesData.value.find(qt => qt.type === questionTypeId);
  if (questionType) {
    return questionType.chapters;
  }
  
  // If we still don't have data, return an empty array
  return [];
}

// Initialize used questions counts from existing selections
const initializeUsedQuestionCounts = () => {
  // Reset the used questions count 
  usedQuestions.value = {};
  
  // Track which chapters are already used for each question type
  const chapterUsage = new Map<string, number>();
  
  // Process sections if available
  if (!patternDetails.value?.sections) {
    return;
  }
  
  // Count all used chapters and question types
  for (const section of patternDetails.value.sections) {
    processQuestionsForSection(section, chapterUsage);
  }
  
  // Ensure the display is updated with the latest marks distribution
  nextTick(() => {
    // Force re-compute of chapter marks percentages after changes
  });
};

/**
 * Process all questions in a section to count usage
 */
const processQuestionsForSection = (section: PatternSection, chapterUsage: Map<string, number>) => {
  // Process each question in this section
  for (let i = 1; i <= section.total_questions; i++) {
    const chapterId = getSelectedChapter(section.id, i);
    if (chapterId === null) {
      continue;
    }
    
    const questionTypeId = determineQuestionTypeId(section, i);
    if (questionTypeId === null) {
      continue;
    }
    
    updateUsageCounts(chapterId, questionTypeId, chapterUsage);
  }
};

/**
 * Determine the question type ID for a given question in a section
 */
const determineQuestionTypeId = (section: PatternSection, questionIndex: number): number | null => {
  // If section has only one question type, use that type
  if (hasOnlyOneQuestionType(section) && section.subsection_question_types?.[0]?.question_type_id) {
    return section.subsection_question_types[0]?.question_type_id;
  } 
  
  // Find the question type for this specific question
  if (section.subsection_question_types) {
    const questionType = section.subsection_question_types.find(
      qt => qt.seqencial_subquestion_number === questionIndex
    );
    return questionType?.question_type_id ?? null;
  }
  
  return null;
};

/**
 * Update the usage counts for a chapter and question type
 */
const updateUsageCounts = (chapterId: number, questionTypeId: number, chapterUsage: Map<string, number>) => {
  // Create key for this chapter-question type combination
  const key = `${chapterId}-${questionTypeId}`;
  
  // Increment count for this chapter-question type
  if (!usedQuestions.value[key]) {
    usedQuestions.value[key] = 0;
  }
  usedQuestions.value[key] += 1;
  
  // Update combined chapter usage tracker
  const chapterKey = `${chapterId}`;
  chapterUsage.set(chapterKey, (chapterUsage.get(chapterKey) ?? 0) + 1);
};

// Debug function to see current chapter usage for all question types
const debugChapterUsage = () => {
  if (!questionTypesAvailability.value.length) return;
  
  const usage: Record<string, Record<string, {usedCount: number, specialCount: number, originalCount: number}>> = {};
  
  for (const questionType of questionTypesAvailability.value) {
    for (const chapter of questionType.chapters) {
      const key = `${chapter.id}-${questionType.type}`;
      const usedCount = usedQuestions.value[key] ?? 0;
      const specialCount = getSpecialCount(chapter.count, questionType.type, chapter.id);
      
      if (!usage[questionType.name]) {
        usage[questionType.name] = {};
      }
      
      usage[questionType.name][chapter.name] = {
        usedCount,
        specialCount,
        originalCount: chapter.count
      };
    }
  }
  
  console.log('Chapter usage by question type:', usage);
}

// Watch for changes to chapters array - modify the watch function
watch(() => chapters.value, (newChapters) => {
  // Only trigger API calls if we're not already in the middle of an update
  // and if we actually have chapters to work with
  // and if marks were not manually changed by the user
  if (!pendingAllocationUpdate.value && !marksManuallyChanged.value && newChapters.length > 0) {
    console.log('Chapters array changed, scheduling marks distribution update');
    
    // Set flag to indicate pending update
    pendingAllocationUpdate.value = true;
    
    // Use the same debouncing approach as in updateSelectedChapter
    if (allocationUpdateTimeout) {
      clearTimeout(allocationUpdateTimeout);
    }
    
    // Schedule allocation update after a short delay
    allocationUpdateTimeout = setTimeout(() => {
      console.log('Processing chapters array change');
      fetchTestPaperAllocation().then(() => {
        pendingAllocationUpdate.value = false;
      }).catch(() => {
        pendingAllocationUpdate.value = false;
      });
    }, 500);
  }
}, { deep: true });

// Add a function to refresh the chapter marks distribution
const refreshChapterMarksDistribution = async () => {
  if (isLoading.value || !absoluteMarks.value || chapters.value.length === 0) {
    return;
  }

  // Set loading state
  isLoading.value = true;
  
  try {
    // Set flag to prevent allocation API triggering during update
    pendingAllocationUpdate.value = true;

    // Prepare API parameters
    const chapterIds = chapters.value.map(chapter => chapter.id);
    
    // Get medium ID from route or profile (same pattern as other functions)
    const mediumId = route.query.mediumId ?? 
                    userProfile.value?.teaching_subjects?.[0]?.medium?.id ?? 
                    '1';
    
    const mediumIds = [Number.parseInt(mediumId.toString())];
    const patternIdNum = Number.parseInt(patternId);
    
    console.log('refreshChapterMarksDistribution API call parameters:', {
      patternId: patternIdNum,
      chapterIds,
      mediumIds,
      questionOrigin: 'both'
    });
    
    // Call the test-paper allocation API using axiosInstance
    const response = await axiosInstance.get('/create-test-paper/allocation', {
      params: {
        patternId: patternIdNum,
        chapterIds: chapterIds,
        mediumIds: mediumIds,
        questionOrigin: 'both'
      }
    });

    const allocationData = response.data;
    
    console.log('refreshChapterMarksDistribution API response:', allocationData);
    
    // Update chapter marks from API response
    if (allocationData.chapterMarks && Array.isArray(allocationData.chapterMarks)) {
      // Store the allocation data
      testPaperAllocation.value = allocationData;
      
      // Use the same function as other Generate buttons to properly update pattern card
      updateChapterMarksFromDistribution(allocationData);

      // Set the generated distribution flag
      hasGeneratedDistribution.value = true;

      console.log('Marks distributed from API:', 
        allocationData.chapterMarks.map(c => `${c.chapterName}: ${c.absoluteMarks}`));

      // Show success message
      // showSuccessToast('Marks distributed successfully from server!');
    } else {
      throw new Error('Invalid API response format');
    }

  } catch (error) {
    console.error('Error in refreshChapterMarksDistribution:', error);
    showErrorToast('Failed to get marks distribution from server. Please try again.');
  } finally {
    // Reset loading state and pending flag after a short delay
    setTimeout(() => {
      isLoading.value = false;
      pendingAllocationUpdate.value = false;
    }, 100);
  }
};

// Function to generate marks distribution
const generate = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  
  try {
    // Get API request parameters
    const { chapterIds, mediumId, requestedMarks, origin } = prepareDistributionParams();
    
    console.log('Calling chapter marks distribution API with:', {
      patternId,
      chapterIds,
      mediumIds: [Number(mediumId)],
      requestedMarks,
      questionOrigin: origin
    });
    
    // Call the API endpoint with the required parameters
    const response = await axiosInstance.get('/chapter-marks-distribution/distribute', {
      params: {
        patternId,
        chapterIds,
        mediumIds: [Number(mediumId)],
        requestedMarks,
        questionOrigin: origin
      }
    });
    
    // Process response
    if (!response.data) {
      throw new Error('No data received from chapter marks distribute API');
    }
    
    handleSuccessResponse(response.data);
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
  }
};

// Helper function to prepare distribution parameters
const prepareDistributionParams = () => {
  // Get chapter IDs with marks
  const chapterIds = chapters.value.map(chapter => chapter.id);
  
  // Get medium ID from route or profile
  const mediumId = route.query.mediumId ?? 
                  userProfile.value?.teaching_subjects?.[0]?.medium?.id ?? 
                  '1';
  
  // Extract just the mark values as an array of numbers
  const requestedMarks = chapters.value.map(chapter => chapter.marks);
  
  // Get question origin
  const origin = questionSource.value ?? 'both';
  
  return { chapterIds, mediumId, requestedMarks, origin };
};

// Helper function to handle successful response
const handleSuccessResponse = (data: TestPaperAllocation) => {
  console.log('Chapter marks distribute API response:', data);
  
  // Update test paper allocation with response data
  testPaperAllocation.value = data;
  
  // Set flag to indicate user has generated distribution after changes
  hasGeneratedDistribution.value = true;
  
  // Store the distribute data and update last used endpoint
  localStorage.setItem('distributeData', JSON.stringify(data));
  lastUsedEndpoint.value = 'distribute';
  localStorage.setItem('lastUsedEndpoint', 'distribute');
  
  // Update chapter marks and selections
  updateChapterMarksFromDistribution(data);
  
  // Show warning if there are insufficient questions
  if (data.insufficientQuestions) {
    showWarningToast(data.allocationMessage ?? 
      'Some marks could not be allocated due to insufficient questions');
  }
};

// Helper function to update chapter marks from distribution data
const updateChapterMarksFromDistribution = (data: TestPaperAllocation) => {
  // Only set the flag if it's not already set by another function
  const shouldManageFlag = !pendingAllocationUpdate.value;
  
  if (shouldManageFlag) {
    // Temporarily set flag to prevent the chapters watcher from triggering allocation API
    pendingAllocationUpdate.value = true;
  }
  
  // Update chapter marks
  if (data.chapterMarks) {
    for (const chapter of chapters.value) {
      const chapterMark = data.chapterMarks.find(
        (cm: { chapterId: number; absoluteMarks: number; requestedMarks: number }) => 
          cm.chapterId === chapter.id
      );
      
      if (chapterMark) {
        chapter.marks = chapterMark.absoluteMarks;
      }
    }
  }
  
  // Update question selections based on the new allocation
  if (data.sectionAllocations) {
    updateSelectedChaptersFromAllocation();
  }
  
  // Only reset the flag if we set it in this function
  if (shouldManageFlag) {
    // Reset the pending flag after a short delay to allow other operations
    setTimeout(() => {
      pendingAllocationUpdate.value = false;
    }, 100);
  }
};

// Helper function to handle errors
const handleError = (error: unknown) => {
  console.error('Error in generate function:', error);
  showErrorToast(error instanceof Error 
    ? error.message 
    : 'Failed to generate marks distribution. Please try again.');
};

// Add warning toast function
const showWarningToast = (message: string) => {
  const warningToast = document.createElement('div');
  warningToast.className = 'alert alert-warning alert-dismissible fade show fixed-top mx-auto mt-3';
  warningToast.style.width = '350px';
  warningToast.style.zIndex = '9999';
  warningToast.innerHTML = `
    <strong>Warning!</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(warningToast);
  
  // Remove the toast after 5 seconds
  setTimeout(() => {
    warningToast.remove();
  }, 5000);
};

// Add a function to updateSelectedChaptersFromAllocation 
const applyAllocatedChaptersToSelection = (section: any, subsection: any) => {
  for (const [index, allocation] of subsection.allocatedChapters.entries()) {
    const questionIndex = subsection.sequentialNumber || (index + 1)
    const key = `${section.sectionId}-${questionIndex}`
    selectedChapters.value[key] = allocation.chapterId
    console.log(
      `Updated section ${section.sectionId}, question ${questionIndex} to chapter ${allocation.chapterId} (${allocation.chapterName})`,
    )
  }
}

const refreshExpandedSectionQuestionTypes = () => {
  const sections = patternDetails.value?.sections ?? []
  for (const section of sections) {
    if (questionTypesVisibility.value[section.id]) {
      selectQuestionTypeForSection(section)
    }
  }
}

const updateSelectedChaptersFromAllocation = () => {
  if (!testPaperAllocation.value?.sectionAllocations) {
    console.warn('Cannot update selected chapters: No section allocations available');
    return;
  }
  
  console.log('Updating selected chapters from allocation');
  
  for (const section of testPaperAllocation.value.sectionAllocations) {
    if (!section.subsectionAllocations) continue
    for (const subsection of section.subsectionAllocations) {
      if (!subsection.allocatedChapters) continue
      applyAllocatedChaptersToSelection(section, subsection)
    }
  }
  
  updateUsedQuestionsCount();
  
  setTimeout(() => {
    console.log('Pattern card UI refresh triggered');
    refreshExpandedSectionQuestionTypes()
  }, 100);
  
  console.log('Updated selected chapters from allocation');
};

// Watch for changes to marks and reset the generated flag
watch(
  () => chapters.value.map(chapter => chapter.marks),
  () => {
    if (!pendingAllocationUpdate.value && !isLoading.value) {
      console.log('Chapter marks changed by user, resetting hasGeneratedDistribution flag');
      hasGeneratedDistribution.value = false;
    }
  },
  { deep: true }
);

// Method to get tooltip text for Create Test Paper button
const getCreateButtonTooltip = (): string => {
  if (!isMarksDistributionValid.value) {
    if (totalAssignedMarks.value > absoluteMarks.value) {
      return `Total assigned marks (${totalAssignedMarks.value}) exceed the required ${absoluteMarks.value} marks`;
    } else {
      return `Total assigned marks must equal ${absoluteMarks.value} marks`;
    }
  } else if (hasZeroMarksChapters.value) {
    return 'Some chapters have 0 marks';
  } else if (!hasGeneratedDistribution.value) {
    return 'Click on Generate or Generate Equally after changing marks';
  }
  return 'Create test paper';
};

</script>

<style scoped>
/* Header styling */
.text-muted {
  color: #6c757d !important;
}

h4 {
  font-weight: 600;
  color: #212529;
}

.optional-info-marks-heading {
  background-color: rgba(0,0,0,0.1);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
}

/* Button styling */
.btn-close {
  transition: all 0.2s ease;
}

.btn-close:hover {
  transform: rotate(90deg);
}

/* Form element styling */
.form-label {
  font-size: 1rem;
  color: #343a40;
}

.form-check {
  padding-left: 1.8rem;
  margin-bottom: 0.5rem;
}

.form-check-input {
  width: 1.2rem;
  height: 1.2rem;
  margin-top: 0.2rem;
  margin-left: -1.8rem;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #212529;
  border-color: #212529;
}

.form-check-label {
  cursor: pointer;
  font-weight: 500;
  padding-top: 0.1rem;
}

/* Button styles */
.btn-dark {
  min-width: 150px;
  transition: all 0.3s ease;
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

/* Alert styling */
.alert {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}



.input-group .input-group-text {
  background-color: #f8f9fa;
}

/* Custom validation styling without exclamation mark */
.form-control.is-invalid {
  border-color: #dc3545;
  background-image: none;
}

/* Improved validation border for input group */
.form-control.is-invalid + .input-group-text {
  border-color: #dc3545;
  border-left: none;
}

/* Ensure text remains centered in invalid inputs */
.form-control.text-center.is-invalid {
  text-align: center !important;
}

/* Additional fix for centering numbers in inputs */
.marks-input-group input[type="number"] {
  text-align: center !important;
}

.marks-input-group input[type="number"].is-invalid {
  text-align: center !important;
  padding-right: 0.75rem !important; /* Override Bootstrap's padding for validation icon */
}

/* Mobile optimized marks input group */
.marks-input-group {
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  width: auto;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: none;
  /* Previously had duplicate align-items property */
}

/* Styling for the card */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

/* Pattern card styles from selectPattern.vue */
.pattern-card {
  border-radius: 10px;
  border: 1px solid #e9ecef;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: #ffffff;
}

.pattern-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

/* Pattern card title styling */
.pattern-card .card-title {
  color: #212529;
  line-height: 1.4;
  font-size: 1rem;
  font-weight: 500;
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  margin: 0;
  border-bottom: 1px solid #e9ecef;
}

/* Total marks badge styling */
.marks-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
}

/* Section preview styles - modified to remove margin-top */
.section-preview {
  margin-top: 0; /* Changed from 1rem to 0 */
  overflow-y: visible;
  overflow-x: hidden;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  background-color: #ffffff;
}

.section-preview:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

/* Table container styles */
.table-responsive {
  overflow-x: hidden;
  transition: all 0.3s ease;
}

.table-responsive:hover {
  overflow-x: auto;
}

/* Borderless table styling */
.borderless-table {
  margin: 0;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
  border: none;
  font-size: 0.85rem;
  margin-bottom: 0;
  border-collapse: collapse;
}

.borderless-table th, 
.borderless-table td {
  padding: 0.5rem 0.75rem;
  line-height: 1.3;
  overflow-wrap: break-word;
  word-wrap: break-word;
  border: none;
}

.borderless-table td {
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.borderless-table tr:last-child td {
  border-bottom: none;
}

/* Rounded table header */
.rounded-table-header tr th:first-child {
  border-top-left-radius: 8px;
}

.rounded-table-header tr th:last-child {
  border-top-right-radius: 8px;
}

/* Column width styles */
.marks-column {
  width: 80px;
  text-align: center;
}

.question-column {
  width: auto;
}

/* Question text styling */
.question-text {
  color: #000;
  white-space: normal;
  display: block;
  width: 100%;
  line-height: 1.3;
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
}

/* Make the marks cell more compact and consistent */
.marks-cell {
  padding: 0.35rem;
  text-align: center;
  white-space: nowrap;
}

/* Optional text styling */
.optional-info {
  background-color: rgba(0,0,0,0.03);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
  color: #6c757d;
  font-size: 0.75rem;
  white-space: nowrap;
}

/* Specific fix for small screens */
@media (max-width: 575.98px) {
  .small.text-secondary.d-flex {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 0.5rem;
  }
  
  /* Consistent font size for pattern card title on mobile */
  .pattern-card .card-title {
    font-size: 0.95rem;
  }
}

/* Responsive styling */
@media (max-width: 768px) {
  h4 {
    font-size: 1.4rem;
  }
  
  .fs-5 {
    font-size: 1rem !important;
  }
  
  /* Button sizing */
  .btn-dark {
    min-width: 140px;
  }
  
  /* Form layout adjustments */
  form .row {
    margin-left: 0;
    margin-right: 0;
  }
  
  /* Input sizing for small screens */
  .marks-input-group {
    width: 140px;
  }
  
  .marks-input-group .form-control,
  .marks-input-group .input-group-text {
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
  }
  
  /* Table responsive adjustments */
  .table-responsive {
    border-radius: 6px;
  }
  
  .table {
    font-size: 0.95rem;
  }
  
  .marks-column {
    width: 65px; /* Smaller width for sm screens */
  }
}

@media (max-width: 576px) {
  h4 {
    font-size: 1.2rem;
  }
  
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Button full width on mobile */
  .btn-dark {
    width: 100%;
    min-width: auto;
  }
  
  /* Form spacing */
  .mb-4 {
    margin-bottom: 1.5rem !important;
  }
  
  /* Radio option spacing */
  .form-check {
    margin-bottom: 0.5rem;
  }
  
  /* Make percentage and marks row full width on small screens */
  .chapter-marks-controls {
    width: 100%;
    margin-left: 0 !important;
    margin-top: 0.25rem;
    justify-content: space-evenly;
  }
  
  .chapter-marks-controls .percent-display {
    min-width: 50px;
    text-align: right;
  }
  
  /* Optimize marks summary for small screens */
  .marks-summary .text-muted {
    font-size: 0.9rem;
  }
  
  .marks-summary .badge {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }
  
  .marks-input-group .form-control,
  .marks-input-group .input-group-text {
    padding: 0.625rem 0.75rem;
    font-size: 1.1rem;
    height: auto;
  }
  
  /* Hide number input spinners on small screens */
  .no-spinner-sm::-webkit-inner-spin-button, 
  .no-spinner-sm::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  
  .no-spinner-sm {
    appearance: textfield;
    -moz-appearance: textfield;
  }
  
  /* Style for chapter name in single chapter alert */
  .alert-dark small .chapter-name {
    display: block;
    margin-top: 0.5rem;
    word-break: break-word;
  }
  
  
  .table {
    font-size: 0.85rem;
  }
  
  /* Maintain consistent card header font size */
  .pattern-card .card-title,
  .card-header h6 {
    font-size: 0.9rem;
  }
  
  .accordion-button {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }
}

/* Pattern details section styling */
.table-hover tbody tr:hover {
  background-color: rgba(0,0,0,0.02);
}

/* Accordion styling */
.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(0,0,0,.125);
}

.accordion-button:not(.collapsed) {
  background-color: rgba(0,0,0,0.05);
  color: #212529;
}

/* Add alternating row colors */
.section-preview tbody tr:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.01);
}

.section-preview tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Row animations - make the table rows animate in */
.section-preview tr {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeInRows 0.35s ease forwards;
}

.section-preview tr:nth-child(1) {
  animation-delay: 0.05s;
}

.section-preview tr:nth-child(2) {
  animation-delay: 0.1s;
}

.section-preview tr:nth-child(3) {
  animation-delay: 0.15s;
}

.section-preview tr:nth-child(n+4) {
  animation-delay: 0.2s;
}

@keyframes fadeInRows {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Question types integrated styling */
.section-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.section-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.expand-icon {
  transition: transform 0.3s ease;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.2rem;
}

.question-types-container {
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  animation: slideDown 0.3s ease-out forwards;
  border-top: 1px solid #f0f0f0;
  box-shadow: inset 0 3px 5px -3px rgba(0,0,0,0.1);
}

.question-types-header {
  background-color: rgba(0,0,0,0.03);
}

.question-types-table {
  margin-bottom: 0 !important;
  font-size: 0.8rem;
}

.question-type-item {
  animation: fadeIn 0.5s ease forwards;
  opacity: 0;
}

.question-type-header {
  background-color: rgba(0,0,0,0.04);
  font-size: 0.85rem;
}

.question-type-header td {
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.question-type-item:nth-child(1) { animation-delay: 0.05s; }
.question-type-item:nth-child(2) { animation-delay: 0.1s; }
.question-type-item:nth-child(3) { animation-delay: 0.15s; }
.question-type-item:nth-child(4) { animation-delay: 0.2s; }
.question-type-item:nth-child(5) { animation-delay: 0.25s; }
.question-type-item:nth-child(n+6) { animation-delay: 0.3s; }

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Media queries for responsive layout */
@media (min-width: 768px) {
  .question-type-name {
    max-width: 60%;
    padding-right: 1rem;
  }
  
  .chapter-select {
    min-width: 200px;
  }
}

@media (max-width: 767px) {
  .question-type-name {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .chapter-select {
    width: 100%;
    min-width: 100%;
  }
  
  /* Position the dropdown container to use full width */
  .position-relative.ms-md-auto {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .question-types-table {
    font-size: 0.75rem;
  }
  
  .question-types-table th,
  .question-types-table td {
    padding: 0.5rem 0.75rem !important;
  }
  
  /* Responsive styles for chapter select */
  .chapter-select {
    min-width: 100%;
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }
  
  /* Ensure full width container for dropdown on very small screens */
  .position-relative.ms-md-auto {
    width: 100%;
  
  }
}

/* Animation keyframes */
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chapter select dropdown styling */
.chapter-select {
  width: auto;
  min-width: 180px;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  background-color: #f8f9fa;
  border: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.chapter-select:focus {
  box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.15);
  border-color: transparent;
}

.chapter-spinner {
  top: 0.5rem;
  right: 1.75rem;
  z-index: 10;
}

.question-count {
  color: #6c757d;
  font-size: 0.75em;
}

.question-type-name {
  font-weight: 500;
  font-size: 0.85rem;
}
/* Styling for marks increment/decrement buttons - merged with previous .marks-input-group */

.marks-input-group .btn {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Combine styles from duplicate selector at line 2931 */
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 0.5rem !important;
  margin: 0 !important;
  line-height: 1 !important;
}

.marks-value {
  font-size: 14px !important;
  font-weight: 600;
  line-height: 1;
  margin: 0 !important;
  padding: 0 !important;
}

.marks-label {
  font-size: 10px !important;
  color: #6c757d;
  font-weight: 400;
  line-height: 1;
  margin: 1px 0 0 0 !important;
  padding: 0 !important;
}

.marks-input-group .form-control.is-invalid {
  background-color: #f8d7da;
  border: 1px solid #dc3545;
}

@media (max-width: 576px) {
  .marks-input-group .btn {
    width: 34px;
    height: 34px;
    min-height: 34px !important;
    max-height: 34px !important;
    min-width: 52px;
  }
  
  .marks-input-group .form-control {
    min-width: 52px;
    height: 34px !important;
    min-height: 34px !important;
    max-height: 34px !important;
  }
  
  /* Optimize marks summary for small screens */
  .marks-summary .text-muted {
    font-size: 0.9rem;
  }
}

.marks-input-group .btn-minus,
.marks-input-group .btn-plus {
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.marks-input-group .btn-minus i,
.marks-input-group .btn-plus i {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 16px !important;
  height: 16px !important;
  font-size: 16px !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
}

.marks-input-group .btn-minus {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.marks-input-group .btn-plus {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.marks-input-group .form-control {
  border-radius: 0 !important;
}

@media (max-width: 576px) {
  .marks-input-group .form-control {
    min-height: 34px !important;
    max-height: 34px !important;
    min-width: 52px;
  }
  
  /* Optimize marks summary for small screens */
  .marks-summary .text-muted {
    font-size: 0.9rem;
  }
}

.marks-container {
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  overflow: hidden !important;
}

@media (max-width: 576px) {
  .marks-container {
    height: 34px !important;
    min-height: 34px !important;
    max-height: 34px !important;
  }
}

/* Update chapter name text styling */
.chapter-name-text {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  color: #495057;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chapter-name-text:hover {
  background-color: #e9ecef;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chapter-name-text i {
  opacity: 0.6;
  font-size: 0.7rem;
}

.chapter-name-text:hover i {
  opacity: 1;
}

/* Inline chapter selection styles */
.chapter-selection-container {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  margin-left: 1rem;
  animation: fadeIn 0.3s ease-out;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.chapter-selection-content {
  font-size: 0.85rem;
}

.active-edit {
  background-color: rgba(0,123,255,0.05) !important;
}

.nav-pills.nav-small .nav-link {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.nav-pills.nav-small .nav-link.active {
  background-color: #007bff;
}

.list-group-sm .list-group-item {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.chapter-list {
  max-height: 200px;
  overflow-y: auto;
}

/* For mobile screens */
@media (max-width: 768px) {
  .chapter-selection-container {
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

/* Marks range info styling */
.marks-range-info {
  text-align: right;
  font-size: 0.75rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.marks-range-info:hover {
  opacity: 1;
}

@media (max-width: 576px) {
  .marks-range-info {
    text-align: center;
  }
}

/* Spinner animation for loading state */
.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dropdown styling */
.chapter-select-dropdown {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.chapter-select-dropdown:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

/* Style for disabled chapter options */
.list-group-item:disabled {
  opacity: 0.6;
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.chapter-select-dropdown option:disabled {
  opacity: 0.6;
  color: #6c757d;
}

@media (max-width: 576px) {
  /* Optimize marks summary for small screens */
  .marks-summary .text-muted {
    font-size: 0.9rem;
  }
}

/* Print styles - optimize for A4 printing */
@media print {
  .preview-container {
    box-shadow: none;
    padding: 0;
  }
  
  .btn, .form-control, .nav-tabs {
    display: none !important;
  }
  
  body {
    background: white;
  }
  
  .container {
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
}

</style> 