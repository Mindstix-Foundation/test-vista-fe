<template>
  <div class="save-container">
    <!-- Main content container -->
    <div class="container">
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-center my-5">
        <output class="spinner-border">
          <span class="visually-hidden">Loading...</span>
        </output>
        <p class="mt-3">Loading test paper details...</p>
      </div>

      <!-- School and Test Information -->
      <div v-else>
        <!-- Save Status Alert -->
        <div v-if="saveRequested" class="alert mb-3 no-print" :class="{
          'alert-info': saveInProgress,
          'alert-success': saveComplete,
          'alert-danger': saveError
        }">
          <div v-if="saveInProgress" class="d-flex align-items-center">
            <output class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>
            <strong>{{ saveStageLabel }}</strong>
            <span class="ms-1">Please wait while we process your test paper.</span>
          </div>
          <div v-else-if="saveComplete">
            <i class="bi bi-check-circle me-2"></i>
            <strong>Test paper saved successfully!</strong> You can now print or go back.
          </div>
          <div v-else-if="saveError">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Error saving test paper:</strong> {{ saveError }}
          </div>
        </div>
        
        <!-- Header with title and action button -->
        <div class="row mb-3 no-print">
          <div class="row justify-content-center align-items-center g-2 mb-4">
            <div class="col-12 col-sm-4">
              <h5 class="text-start m-0 fw-bolder">TEST PAPER</h5>
            </div>
            <div class="col-12 col-sm-8 dynamic-style text-end">
              <div class="d-flex flex-wrap justify-content-end align-items-center gap-2">
                <div class="d-flex gap-2">
                  <!-- Medium Dropdown Button (Desktop) -->
                  <button 
                    class="btn btn-custom dropdown-toggle"
                    @click="toggleMediumDropdown"
                    ref="mediumButtonRef"
                  >
                    <i class="bi bi-translate me-1"></i> {{ currentMediumName }}
                  </button>

                  <!-- Medium Dropdown Menu (Desktop) -->
                  <div 
                    v-if="showMediumDropdown" 
                    class="medium-dropdown" 
                    ref="mediumDropdownRef"
                  >
                    <div class="medium-dropdown-header">Select Medium</div>
                    <div class="medium-dropdown-items">
                      <div 
                        v-for="medium in availableMediums" 
                        :key="medium.id"
                        class="medium-dropdown-item"
                        :class="{ 'active': medium.id === currentMediumId }"
                        @click="changeMedium(medium.id)"
                      >
                        {{ medium.name }}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    class="btn btn-dark"
                    @click="printPage"
                    :disabled="saveInProgress"
                  >
                    <span v-if="saveInProgress">
                      <output class="spinner-border spinner-border-sm me-1" aria-hidden="true"></output>
                      Saving...
                    </span>
                    <span v-else>
                      <i class="bi bi-printer me-1"></i> Print
                    </span>
                  </button>
                  <button 
                    class="btn btn-secondary" 
                    @click="goBack"
                    :disabled="saveInProgress"
                  >
                    <i class="bi bi-arrow-left me-1"></i> Back
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr class="mt-2" />
        </div>

        <!-- New View Mode Toggle for Mobile -->
        <div class="row mb-3 d-md-none no-print">
          <div class="col-12 d-flex justify-content-center">
            <div class="view-mode-toggle-container">
              <div class="form-check form-switch form-check-inline">
                <input class="form-check-input" type="checkbox" id="viewModeToggle" v-model="mobileViewMode">
                <label class="form-check-label" for="viewModeToggle">
                  <span v-if="mobileViewMode"><i class="bi bi-phone me-1"></i> Mobile View</span>
                  <span v-else><i class="bi bi-file-earmark-text me-1"></i> A4 Preview</span>
                </label>
              </div>
              <!-- New zoom slider for A4 view on mobile -->
              <div v-if="!mobileViewMode" class="zoom-control-container mt-2">
                <div class="zoom-label d-flex align-items-center justify-content-center">
                  <i class="bi bi-zoom-out me-2"></i>
                  <input 
                    type="range" 
                    class="form-range zoom-slider" 
                    min="50" 
                    max="100" 
                    step="5" 
                    v-model="zoomLevel"
                    @input="updateZoom"
                  >
                  <i class="bi bi-zoom-in ms-2"></i>
                </div>
                <div class="zoom-value">{{ zoomLevel }}%</div>
              </div>
              <div v-if="!mobileViewMode" class="scroll-hint d-md-none">
                <small><i class="bi bi-arrows-expand-horizontal"></i> Scroll horizontally to view full page</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Editable paper name (before save) -->
        <div class="mb-3 p-3 border rounded bg-light">
          <label class="form-label fw-semibold mb-1" for="paperTitleInput">Test paper name</label>
          <input
            id="paperTitleInput"
            v-model="paperTitle"
            type="text"
            class="form-control"
            maxlength="200"
            placeholder="e.g. T1 Math Quick Test Aug5"
          />
          <div class="form-text">Shown on the paper and in Assign Online Test lists.</div>
        </div>

        <!-- A4 Paper Wrapper -->
        <div class="a4-paper-container" :class="{'mobile-view': mobileViewMode}">
          <div class="a4-paper-card" :style="a4PaperStyle" id="printSection">
            <div class="text-center document-header">
              <h5 class="school-name">{{ schoolName }}</h5>
              <h3 class="paper-title">{{ paperTitle }}</h3>
              <p style="margin-bottom: 5px;"><strong>Standard:</strong> {{ standardName }} | <strong>Subject:</strong> {{ subjectName }}</p>
              <p style="margin-top: 5px;">
                <strong>Time:</strong> {{ testDuration }} | <strong>Total Marks:</strong> {{ totalMarks }}
              </p>
              
              <!-- Exam Instructions Section - Only shown if instructions exist -->
              <div class="exam-instructions-container mt-4" v-if="examInstructions.length > 0">
                <h5 class="m-0 mb-2">Exam Instructions</h5>
                <div class="instructions-display">
                  <ul class="text-start instruction-list">
                    <li v-for="(instruction, index) in examInstructions" :key="index">
                      {{ instruction }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <hr>

            <!-- Questions Section - MS Office A4 style layout -->
            <div class="a4-paper-section mb-4" 
              v-for="(section, sectionIndex) in testPaperSections" 
              :key="sectionIndex"
            >
              <!-- Section Header -->
              <div class="section-header">
                <div class="section-title"><strong>{{ section.sectionNumberDisplay ||  section.sectionNumber }} ) {{ section.sectionName }}</strong> <span v-if="section.mandotory_questions && section.questions && section.mandotory_questions < section.questions.length" class="nowrap">[ Any {{ section.mandotory_questions }} ]</span></div>
              
                <div class="section-marks">
                  <strong>
                    <span class="nowrap">
                      {{ section.totalMarks }} <span class="d-none d-sm-inline">Marks</span><span class="d-inline d-sm-none">M</span>
                    </span>
                  </strong>
                </div>
              </div>
              
              <!-- Questions List - Plain A4 style -->
              <div class="section-content">
                <div class="question-list">
                  <div v-for="(question, questionIndex) in section.questions" :key="questionIndex" class="question-item">
                    <div class="question-wrapper" :id="`question-${sectionIndex}-${questionIndex}`">
                      <div class="d-flex w-100">
                        <!-- Question Content -->
                        <div class="question-content">
                          <div class="question-text">
                            {{ question.questionNumber }}. {{ question.questionText }}
                          </div>
                          
                          <!-- MCQ Options -->
                          <div v-if="question.options && question.options.length > 0" class="options-container">
                            <!-- Row layout (all options in one row) -->
                            <div v-if="getOptionLayout(sectionIndex, questionIndex) === 'row'" class="options-row">
                              <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item-row">
                                <span class="option-label">{{ option.label }})</span>
                                <span class="option-text">{{ option.text }}</span>
                              </div>
                            </div>
                            
                            <!-- Grid layout (2x2) -->
                            <div v-else-if="getOptionLayout(sectionIndex, questionIndex) === 'grid'" class="options-grid">
                              <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item-grid">
                                <span class="option-label">{{ option.label }})</span>
                                <span class="option-text">{{ option.text }}</span>
                              </div>
                            </div>
                            
                            <!-- Column layout (all options in one column) -->
                            <div v-else-if="getOptionLayout(sectionIndex, questionIndex) === 'column'" class="options-column">
                              <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item-column">
                                <span class="option-label">{{ option.label }})</span>
                                <span class="option-text">{{ option.text }}</span>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Match Pairs -->
                          <div v-if="question.matchPairs && question.matchPairs.length > 0" class="match-pairs-container">
                            <div class="row">
                              <div class="col-6">
                                <div v-for="(pair, pairIndex) in question.matchPairs" :key="`left-${pairIndex}`" class="match-pair-item">
                                  {{ pairIndex + 1 }}. {{ pair.leftText }}
                                </div>
                              </div>
                              <div class="col-6">
                                <div v-for="(pair, pairIndex) in question.matchPairs" :key="`right-${pairIndex}`" class="match-pair-item">
                                  {{ pair.rightText }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Marks -->
                        <div class="question-marks">
                          <div class="marks-row">
                            <span class="marks fw-bold">{{ question.marks }}</span>
                          </div>
                        </div>
                      </div>
                      <hr class="question-divider" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Back to top button -->
      <div id="backToTop" class="d-flex no-print" @click="scrollToTop" style="display: none !important;">
        <i class="bi bi-arrow-up"></i>
      </div>

      <!-- Fixed back button for mobile only -->
      <div class="d-block d-sm-none mobile-back-button no-print" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </div>
      
      <!-- Fixed bottom bar with print button for mobile -->
      <div class="d-sm-none mobile-action-buttons no-print">
        <div class="d-flex justify-content-center align-items-center w-100">
          <!-- Mobile Medium Button -->
          <button 
            class="btn btn-custom flex-grow-1 me-2 dropdown-toggle"
            @click="toggleMediumDropdown"
            ref="mediumButtonMobileRef"
          >
            <i class="bi bi-translate me-1"></i> {{ currentMediumName }}
          </button>
          
          <button class="btn btn-dark flex-grow-1" @click="printPage" :disabled="saveInProgress">
            <span v-if="saveInProgress">
              <output class="spinner-border spinner-border-sm me-1" aria-hidden="true"></output>
              Saving...
            </span>
            <span v-else>
              <i class="bi bi-printer me-1"></i> Print
            </span>
          </button>
        </div>
        
        <!-- Mobile Medium Dropdown -->
        <div 
          v-if="showMediumDropdown" 
          class="medium-dropdown-mobile"
          ref="mediumDropdownMobileRef"
        >
          <div class="medium-dropdown-header">Select Medium</div>
          <div class="medium-dropdown-items">
            <div 
              v-for="medium in availableMediums" 
              :key="medium.id"
              class="medium-dropdown-item"
              :class="{ 'active': medium.id === currentMediumId }"
              @click="changeMedium(medium.id)"
            >
              {{ medium.name }}
            </div>
          </div>
          <div class="text-center mt-2">
            <button class="btn btn-sm btn-outline-secondary" @click="toggleMediumDropdown">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { DisplayQuestion, DisplaySection, McqOption, MatchPair, QuestionText } from '@/types/types';
// Add explicit imports for PDF generation libraries with type annotations
import axiosInstance from '@/config/axios';
// These will be dynamically imported when needed
// import html2canvas from 'html2canvas';
// import { jsPDF } from 'jspdf';

// Define component name (for linter)
defineOptions({
  name: 'SaveTestPaper'
})

// Setup router and route
const router = useRouter()
const route = useRoute()

// Loading state
const isLoading = ref(true)

// For options layout management
const DEFAULT_OPTION_LAYOUT = 'grid' // Default layout as grid
const optionsLayouts = ref<{[key: string]: string}>({})

// Get option layout for a specific question
const getOptionLayout = (sectionIndex: number, questionIndex: number) => {
  const key = `${sectionIndex}-${questionIndex}`
  return optionsLayouts.value[key] || DEFAULT_OPTION_LAYOUT // Default to grid layout
}

// Load option layouts from localStorage
const loadOptionLayouts = () => {
  try {
    const savedLayouts = localStorage.getItem('optionsLayouts')
    if (savedLayouts) {
      optionsLayouts.value = JSON.parse(savedLayouts)
      console.log('Loaded option layouts from localStorage:', optionsLayouts.value)
    } else {
      console.log('No saved option layouts found in localStorage')
    }
  } catch (error) {
    console.error('Error loading option layouts from localStorage:', error)
  }
}

// User profile for school name
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

// School information
const userProfile = ref<UserProfile | null>(null)
const schoolName = ref('')

// Exam instructions loaded from localStorage
const examInstructions = ref<string[]>([])

// Helper function to safely decode URL components (handles multiple levels of encoding)
const safeDecodeURIComponent = (value: string | undefined): string => {
  if (!value) return 'Not Selected';
  
  try {
    let decoded = value;
    let previousDecoded = '';
    let attempts = 0;
    const maxAttempts = 3; // Prevent infinite loops
    
    // Keep decoding until no more % characters or we've tried enough times
    while (decoded.includes('%') && decoded !== previousDecoded && attempts < maxAttempts) {
      previousDecoded = decoded;
      decoded = decodeURIComponent(decoded);
      attempts++;
    }
    
    return decoded;
  } catch (error) {
    console.warn('Failed to decode URL component:', value, error);
    return value; // Return original if decoding fails
  }
};

// Get test details from query parameters or use defaults
const paperTitle = ref(safeDecodeURIComponent(route.query.paperTitle as string || 'Test Paper'))
const testDuration = ref(safeDecodeURIComponent(route.query.testDuration as string || '1 Hour'))
const standardName = computed(() => safeDecodeURIComponent(route.query.standard as string))
const subjectName = computed(() => safeDecodeURIComponent(route.query.subject as string))
const totalMarks = computed(() => route.query.totalMarks as string || '40')

// Define interface for image data
interface ImageData {
  id: number;
  presigned_url?: string;
  alt?: string;
}

// Display interfaces for transformed API data
interface DisplayQuestion {
  questionNumber: number;
  questionText: string;
  marks: number;
  questionType: string;
  options?: {
    label: string;
    text: string;
    isCorrect?: boolean;
  }[];
  matchPairs?: {
    leftText: string;
    rightText: string;
  }[];
  originalQuestion?: Question; // Changed from any to Question
  topicId?: number;
  chapterId?: number;
}

// Define interfaces for API data types
interface Question {
  id: number;
  question_type_id: number;
  question_type: {
    id: number;
    type_name: string;
  };
  question_texts: QuestionText[];
}

interface QuestionText {
  id: number;
  question_id: number;
  question_text: string;
  image_id: number | null;
  image: ImageData | null;
  mcq_options: McqOption[];
  match_pairs: MatchPair[];
  topic?: {
    id: number;
  };
  question_text_topics?: {
    id: number;
    question_text_id: number;
    question_topic_id: number;
    instruction_medium_id: number;
  }[];
}

interface McqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  is_correct: boolean;
  image_id: number | null;
  image: ImageData | null;
}

interface MatchPair {
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
  left_image: ImageData | null;
  right_image: ImageData | null;
}

interface ApiResponse {
  patternId: number;
  patternName?: string;
  totalMarks: number;
  absoluteMarks: number;
  sectionAllocations: {
    sectionId: number;
    pattern_id?: number;
    sectionName: string;
    sequentialNumber?: number;
    section_number?: number;
    subSection?: string;
    totalQuestions: number;
    mandotory_questions?: number;
    marks_per_question?: number;
    absoluteMarks: number;
    totalMarks: number;
    subsectionAllocations: {
      subsectionQuestionTypeId: number;
      section_id?: number;
      questionTypeName: string;
      sequentialNumber?: number;
      question_type_id?: number;
      question_type?: {
        id: number;
        type_name: string;
      };
      allocatedChapters: {
        chapterId: number;
        chapterName: string;
        question?: Question;
      }[];
    }[];
  }[];
  chapterMarks: {
    chapterId: number;
    chapterName: string;
    absoluteMarks: number;
  }[];
  mediums?: {
    id: number;
    instruction_medium: string;
  }[];
}

interface DisplaySection {
  sectionNumber: number;
  sectionName: string;
  totalMarks: number;
  questions: DisplayQuestion[];
  subSection?: string;
  sectionNumberDisplay?: string;
  mandotory_questions?: number;
}

// Test paper sections
const testPaperSections = ref<DisplaySection[]>([])

// Store raw API data for debugging
const apiData = ref<ApiResponse | null>(null)

// Check if this page should save the test paper to the API
const saveRequested = ref(route.query.saveRequested === 'true')
const saveInProgress = ref(false)
const saveComplete = ref(false)
const saveError = ref<string | null>(null)
const saveStage = ref<'idle' | 'validating' | 'generating' | 'saving' | 'finishing'>('idle')
const saveStageLabel = computed(() => {
  switch (saveStage.value) {
    case 'validating':
      return 'Validating…'
    case 'generating':
      return 'Generating PDFs…'
    case 'saving':
      return 'Saving questions…'
    case 'finishing':
      return 'Finishing…'
    default:
      return 'Saving test paper...'
  }
})

// Define interface for medium data
interface Medium {
  id: number;
  name: string;
}

// Available instruction mediums
const availableMediums = ref<Medium[]>([])
const currentMediumId = ref<number>(1) // Default medium ID
const showMediumDropdown = ref(false)
const mediumButtonRef = ref<HTMLElement | null>(null)
const mediumDropdownRef = ref<HTMLElement | null>(null)
const mediumButtonMobileRef = ref<HTMLElement | null>(null)
const mediumDropdownMobileRef = ref<HTMLElement | null>(null)

// Computed property for current medium name
const currentMediumName = computed(() => {
  const medium = availableMediums.value.find(m => m.id === currentMediumId.value);
  return medium ? medium.name : 'Medium';
});

// Function to toggle medium dropdown
const toggleMediumDropdown = (event: MouseEvent) => {
  event.stopPropagation();
  showMediumDropdown.value = !showMediumDropdown.value;
  
  if (showMediumDropdown.value) {
    nextTick(() => {
      // Desktop positioning
      if (globalThis.innerWidth >= 576 && mediumButtonRef.value && mediumDropdownRef.value) {
        const buttonRect = mediumButtonRef.value.getBoundingClientRect();
        mediumDropdownRef.value.style.position = 'fixed';
        mediumDropdownRef.value.style.top = `${buttonRect.bottom + 5}px`;
        mediumDropdownRef.value.style.left = `${buttonRect.left}px`;
        
        // Make sure it doesn't go off-screen
        const rect = mediumDropdownRef.value.getBoundingClientRect();
        if (rect.right > globalThis.innerWidth - 10) {
          mediumDropdownRef.value.style.left = `${globalThis.innerWidth - mediumDropdownRef.value.offsetWidth - 10}px`;
        }
      }
      
      // Mobile positioning
      if (globalThis.innerWidth < 576 && mediumDropdownMobileRef.value) {
        mediumDropdownMobileRef.value.style.position = 'fixed';
        mediumDropdownMobileRef.value.style.top = '50%';
        mediumDropdownMobileRef.value.style.left = '50%';
        mediumDropdownMobileRef.value.style.transform = 'translate(-50%, -50%)';
      }
      
      // Add click outside listener
      document.addEventListener('click', handleMediumDropdownClickOutside);
    });
  } else {
    document.removeEventListener('click', handleMediumDropdownClickOutside);
  }
};

// Handle click outside medium dropdown
const handleMediumDropdownClickOutside = (event: MouseEvent) => {
  const desktopDropdown = mediumDropdownRef.value;
  const mobileDropdown = mediumDropdownMobileRef.value;
  
  // Check if click is outside both desktop and mobile dropdowns
  if ((desktopDropdown && !desktopDropdown.contains(event.target as Node)) && 
      (mobileDropdown && !mobileDropdown.contains(event.target as Node))) {
    showMediumDropdown.value = false;
    document.removeEventListener('click', handleMediumDropdownClickOutside);
  }
};

// Change the current medium
const changeMedium = async (mediumId: number) => {
  if (currentMediumId.value === mediumId) {
    // If same medium, just close the dropdown
    showMediumDropdown.value = false;
    return;
  }
  
  try {
    // Switch to the selected medium
    await switchToMedium(mediumId);
    showMediumDropdown.value = false;
    
    // Show feedback message (could add toast notification here)
    console.log(`Changed to medium: ${availableMediums.value.find(m => m.id === mediumId)?.name}`);
  } catch (error) {
    console.error('Error changing medium:', error);
  }
};

// Function to switch to a specific medium and update the displayed content
const switchToMedium = async (mediumId: number): Promise<void> => {
  console.log(`Switching to medium ID: ${mediumId}`);
  
  if (currentMediumId.value === mediumId) {
    console.log('Already on this medium, no need to switch');
    return;
  }
  
  try {
    // Update current medium ID
    const previousMediumId = currentMediumId.value;
    currentMediumId.value = mediumId;
    
    // If we have API data, transform it again with the new medium
    if (apiData.value) {
      console.log(`Transforming data for medium ID: ${mediumId}`);
      transformApiDataToDisplayFormat(apiData.value);
      await nextTick(); // Wait for UI to update
    } else {
      console.warn('No API data available for medium switch');
      // Revert to previous medium
      currentMediumId.value = previousMediumId;
      throw new Error('No data available to switch medium');
    }
  } catch (error) {
    console.error(`Error switching to medium ${mediumId}:`, error);
    throw error;
  }
};

const resolveGeneratedPdfBlob = (
  blob: Blob,
  mediumId: number,
  resolve: (blob: Blob) => void,
  reject: (reason: Error) => void,
  label?: string,
) => {
  const suffix = label ? ` (${label})` : '';
  console.log(`PDF for medium ${mediumId} generated successfully${suffix}, blob size:`, blob.size);
  if (blob.size === 0) {
    console.error(`Generated PDF has zero size for medium ${mediumId}`);
    reject(new Error(`Generated PDF has zero size for medium ${mediumId}`));
    return;
  }
  resolve(blob);
};

const fallbackHtml2PdfToBlob = (
  html2pdf: any,
  opt: any,
  element: HTMLElement,
  mediumId: number,
  resolve: (blob: Blob) => void,
  reject: (reason: Error) => void,
  label?: string,
) => {
  html2pdf().set(opt)
    .from(element)
    .outputPdf('blob')
    .then((blob: Blob) => resolveGeneratedPdfBlob(blob, mediumId, resolve, reject, label))
    .catch((error: Error) => {
      console.error(`Error generating PDF for medium ${mediumId}:`, error);
      reject(error);
    });
};

// Function to generate PDF for a specific medium
const generatePDFForMedium = async (element: HTMLElement, mediumId: number, html2pdf: () => {
    set: (options: {
      margin: number;
      filename: string;
      image: { type: string; quality: number };
      html2canvas: { scale: number; logging: boolean; useCORS: boolean };
      jsPDF: { unit: string; format: string; orientation: string };
    }) => {
      from: (element: HTMLElement) => {
        outputPdf: (type: string) => Promise<Blob>;
      };
    };
  }
): Promise<File> => {
  console.log(`Generating PDF for medium ID: ${mediumId} (${availableMediums.value.find(m => m.id === mediumId)?.name ?? 'Unknown'})`);
  
  try {
    // Switch to this medium to update the UI with correct language content
    await switchToMedium(mediumId);
    
    // Wait for the UI to fully update
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay for more reliable rendering
    
    // Apply print-specific styling before generating PDF
    document.body.classList.add('printing-test-paper');
    
    // Find and modify elements to match print styling
    const a4PaperCard = element.querySelector('.a4-paper-card') as HTMLElement;
    if (a4PaperCard) {
      // Apply print-specific styling
      a4PaperCard.style.border = 'none';
      a4PaperCard.style.boxShadow = 'none';
      a4PaperCard.style.padding = '20mm'; // Use consistent padding as in print media query
      a4PaperCard.style.transform = 'none';
    }
    
    // Hide elements that should be hidden in print
    const elementsToHide = element.querySelectorAll('.no-print, .view-mode-toggle-container, .zoom-control-container');
    const hiddenElements: Array<{element: HTMLElement, display: string}> = [];
    
    for (const el of elementsToHide) {
      const htmlEl = el as HTMLElement;
      // Save original display style
      hiddenElements.push({
        element: htmlEl,
        display: htmlEl.style.display
      });
      // Hide the element
      htmlEl.style.display = 'none';
    }
    
    // Generate PDF with the updated content
    const pdfBlob = await new Promise<Blob>((resolve, reject) => {
      const opt = {
        margin: 0, // Remove margins as we're already handling padding in the element
        filename: `test-paper-medium-${mediumId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 4, // Increased scale for higher resolution
          logging: true, 
          useCORS: true, // Allow cross-origin images
          backgroundColor: '#FFFFFF',
          letterRendering: true, // Improve text rendering
          removeContainer: false, // Keep the container to maintain layout
          dpi: 300, // Higher DPI for better quality
          onclone: (clonedDoc) => {
            // Apply additional print styles to the cloned document
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              body { font-family: 'Times New Roman', Times, serif; }
              * { font-family: inherit !important; }
              .a4-paper-card { padding: 20mm !important; }
              
              /* Ensure all text has good contrast */
              p, span, div, h1, h2, h3, h4, h5, h6, li {
                color: #000000 !important;
                font-size: 12pt !important;
                line-height: 1.5 !important;
                text-rendering: geometricPrecision !important;
              }
              
              /* Optimize fonts for PDF */
              @media print {
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `;
            clonedDoc.head.appendChild(style);
            
            // Process text nodes to improve quality
            const textElements = clonedDoc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
            for (const el of textElements) {
              // Add data attribute to ensure text is recognized properly
              el.dataset.html2canvasRenderText = 'true';
              el.dataset.html2canvasRenderNode = 'true';
            }
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: false, // Disable compression for better text quality
          putOnlyUsedFonts: true, // Only embed used fonts
          floatPrecision: 16, // Higher precision for better text positioning
        },
        fontFaces: [
          // Add standard fonts to ensure they're embedded
          { family: 'Times New Roman', weight: 'normal' },
          { family: 'Times New Roman', weight: 'bold' },
          { family: 'Arial', weight: 'normal' },
          { family: 'Arial', weight: 'bold' }
        ],
        enableLinks: true, // Enable hyperlinks in the PDF
      };
      
      // Apply special text handling to improve quality
      const specialPageRendering = async (html2canvas, jsPDF) => {
        try {
          // Create a new jsPDF document with text rendering options
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: false, // Disable compression for better text quality
            putOnlyUsedFonts: true,
            floatPrecision: 16,
            textRenderingMode: 'fill',
            hotfixes: ['px_scaling'], // Apply hotfixes for better text rendering
          });

          // Get content and dimensions
          const contentElement = element.cloneNode(true) as HTMLElement;
          const width = element.offsetWidth;
          const height = element.offsetHeight;

          // Save original styles
          const originalDisplay = contentElement.style.display;
          const originalPosition = contentElement.style.position;
          const originalWidth = contentElement.style.width;
          const originalHeight = contentElement.style.height;
          
          // Apply special text handling
          const textElements = contentElement.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
          for (const el of textElements) {
            (el as HTMLElement).dataset.textContent = el.textContent || '';
          }

          // Create the canvas at high resolution for clear rendering
          const canvas = await html2canvas(element, {
            scale: 4, // Higher scale for better quality
            useCORS: true,
            logging: true,
            letterRendering: true,
            backgroundColor: '#FFFFFF',
            allowTaint: true
          });

          // Try a different approach: Use PDF.js text extraction capabilities
          // First add the image as background
          const imgData = canvas.toDataURL('image/jpeg', 1);
          const pdfWidth = 210; // A4 width in mm
          const pdfHeight = 297; // A4 height in mm
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add the high-quality image as background
          doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          
          // Now add a hidden text layer over the image for searchable text
          doc.setTextColor(0, 0, 0, 0); // Transparent text (still selectable)
          doc.setFontSize(12);
          
          // Extract text and position from elements
          for (const el of textElements) {
            try {
              const rect = (el as HTMLElement).getBoundingClientRect();
              const elementText = (el as HTMLElement).dataset.textContent || '';
              if (elementText && elementText.trim()) {
                // Convert coordinates to PDF space
                const pdfX = (rect.left / width) * pdfWidth;
                const pdfY = (rect.top / height) * pdfHeight;
                
                // Add invisible but selectable text
                doc.text(elementText, pdfX, pdfY, { 
                  renderingMode: 'invisible',
                  baseline: 'top'
                });
              }
            } catch (err) {
              console.log('Error processing text element:', err);
            }
          }
          
          // Generate PDF with selectable text
          const blob = doc.output('blob');
          
          // Restore original styles
          contentElement.style.display = originalDisplay;
          contentElement.style.position = originalPosition;
          contentElement.style.width = originalWidth;
          contentElement.style.height = originalHeight;
          
          resolve(blob);
        } catch (error) {
          console.error('Error in specialized PDF rendering:', error);
          fallbackHtml2PdfToBlob(html2pdf, opt, element, mediumId, resolve, reject);
        }
      };
      
      // Import additional libraries for special handling
      import('html2canvas').then(html2canvasModule => {
        const html2canvas = html2canvasModule.default;
        import('jspdf').then(jsPDFModule => {
          const jsPDF = jsPDFModule.default;
          specialPageRendering(html2canvas, jsPDF);
        }).catch(error => {
          console.error('Error importing jsPDF:', error);
          fallbackHtml2PdfToBlob(html2pdf, opt, element, mediumId, resolve, reject, 'jsPDF fallback');
        });
      }).catch(error => {
        console.error('Error importing html2canvas:', error);
        fallbackHtml2PdfToBlob(html2pdf, opt, element, mediumId, resolve, reject, 'html2canvas fallback');
      });
    });
    
    // Restore original styles
    if (a4PaperCard) {
      a4PaperCard.style.border = '';
      a4PaperCard.style.boxShadow = '';
      a4PaperCard.style.padding = '';
      a4PaperCard.style.transform = '';
    }
    
    // Restore display for hidden elements
    for (const item of hiddenElements) {
      item.element.style.display = item.display;
    }
    
    // Remove print class from body
    document.body.classList.remove('printing-test-paper');
    
    // Log PDF blob details for debugging
    console.log(`PDF blob for medium ${mediumId}:`, {
      type: pdfBlob.type,
      size: pdfBlob.size,
      lastModified: new Date().toISOString()
    });
    
    // Create a file from the blob with a consistent naming pattern for the API
    const sanitizedTitle = paperTitle.value.replaceAll(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const fileName = `test_paper_${sanitizedTitle}_medium_${mediumId}.pdf`;
    
    // Create File object with explicit MIME type
    const pdfFile = new File(
      [pdfBlob], 
      fileName, 
      { type: 'application/pdf' }
    );
    
    // Verify file was created properly
    console.log(`Created File object for medium ${mediumId}:`, {
      name: pdfFile.name,
      type: pdfFile.type,
      size: pdfFile.size
    });
    
    return pdfFile;
  } catch (error) {
    console.error(`Failed to generate PDF for medium ${mediumId}:`, error);
    // Ensure print class is removed from body even if an error occurs
    document.body.classList.remove('printing-test-paper');
    throw error;
  }
};

// Function to save the test paper as PDF and call the API
const saveTestPaperToDB = async () => {
  // Check save conditions
  if (!canSaveTestPaper()) {
    return;
  }
  
  console.log('Starting save process for test paper...');
  saveInProgress.value = true;
  saveError.value = null;
  saveStage.value = 'validating';
  
  // Store original medium ID to restore later
  const originalMediumId = currentMediumId.value;
  
  try {
    // Wait for rendering and get required data
    await waitForRendering();
    const { userId, schoolId, chapters, weightages, patternId } = await getRequiredData();
    
    // Get the print element and HTML2PDF library
    const element = getAndValidatePrintElement();
    console.log('Print element found:', element.id, 'Content length:', element.innerHTML.length);
    
    // Make sure element is visible and has content
    if (element.innerHTML.length < 100) {
      throw new Error('Print element has insufficient content to generate PDF');
    }
    
    const html2pdf = await loadHtml2PdfLibrary();
    console.log('HTML2PDF library loaded successfully');
    
    saveStage.value = 'generating';
    // Generate PDF files for all mediums
    const pdfFiles = await generatePDFFilesForAllMediums(element, html2pdf);
    
    // Verify files were created and have data
    if (!pdfFiles || pdfFiles.length === 0) {
      throw new Error('No PDF files were generated');
    }
    
    console.log(`Generated ${pdfFiles.length} PDF files:`, pdfFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    // Verify each file has valid data
    const invalidFiles = pdfFiles.filter(file => !file || file.size === 0);
    if (invalidFiles.length > 0) {
      console.error('Some PDF files are invalid:', invalidFiles.map(f => f ? f.name : 'undefined'));
      throw new Error(`${invalidFiles.length} PDF files are invalid or empty`);
    }
    
    saveStage.value = 'saving';
    // Submit data to API
    await submitTestPaperData(userId, schoolId, chapters, weightages, patternId, pdfFiles);
    
    saveStage.value = 'finishing';
    saveComplete.value = true;
  } catch (error) {
    handleSaveError(error);
  } finally {
    saveInProgress.value = false;
    saveStage.value = 'idle';
    await restoreOriginalMedium(originalMediumId);
  }
};

// Check if we can save the test paper
const canSaveTestPaper = () => {
  if (!saveRequested.value || saveInProgress.value || saveComplete.value) {
    console.log('Save conditions not met:', { 
      saveRequested: saveRequested.value, 
      saveInProgress: saveInProgress.value, 
      saveComplete: saveComplete.value 
    });
    return false;
  }
  return true;
};

// Wait for the page to fully render
const waitForRendering = async () => {
  await nextTick();
  // Extra delay to ensure DOM is ready
  await new Promise(resolve => setTimeout(resolve, 500));
};

// Get and validate all required data for saving
const getRequiredData = async () => {
  // Extract data from route parameters
  const userId = route.query.userId;
  const schoolId = route.query.schoolId;
  
  console.log('Raw route query params:', { 
    userId, 
    schoolId, 
    chapters: route.query.chapters, 
    weightages: route.query.weightages 
  });
  
  // Parse chapters array - ensure it's in the format the API needs
  let chapters = [];
  if (route.query.chapters) {
    try {
      const parsedChapters = JSON.parse(decodeURIComponent(route.query.chapters as string));
      // Ensure chapters are in correct format for the API
      chapters = Array.isArray(parsedChapters) ? parsedChapters : [];
      // Log the actual structure for debugging
      console.log('Parsed chapters structure:', JSON.stringify(chapters));
    } catch (error) {
      console.error('Error parsing chapters:', error);
      throw new Error('Invalid chapters data format');
    }
  }
  
  // Parse weightages
  let weightages = [];
  if (route.query.weightages) {
    try {
      weightages = JSON.parse(decodeURIComponent(route.query.weightages as string));
      // Ensure weightages is an array (can be nested)
      if (!Array.isArray(weightages)) {
        console.error('Invalid weightages format - not an array:', weightages);
        throw new Error('Invalid weightages data format');
      }
      console.log('Parsed weightages structure:', JSON.stringify(weightages));
    } catch (error) {
      console.error('Error parsing weightages:', error);
      throw new Error('Invalid weightages data format');
    }
  }
  
  console.log('Parsed data for API call:', { userId, schoolId, chapters, weightages });
  
  // Validate required data (we'll validate the flattened arrays later)
  if (!userId || !schoolId || chapters.length === 0 || weightages.length === 0) {
    console.error('Validation failed:', {
      hasUserId: !!userId,
      hasSchoolId: !!schoolId,
      chaptersLength: chapters.length,
      weightagesLength: weightages.length
    });
    throw new Error('Missing required data for saving test paper');
  }
  
  // Get pattern ID from various sources
  const patternId = determinePatternId();
  
  return { userId, schoolId, chapters, weightages, patternId };
};

// Determine pattern ID from available sources
const determinePatternId = () => {
  let patternId = '1'; // Default fallback
  
  if (apiData.value?.patternId) {
    // Get pattern ID from the loaded API data
    patternId = apiData.value.patternId.toString();
    console.log(`Using pattern ID ${patternId} from API data`);
  } else if (route.query.patternId) {
    // Get pattern ID from route query
    patternId = route.query.patternId as string;
    console.log(`Using pattern ID ${patternId} from route query`);
  } else {
    console.warn('No pattern ID found in data or route, using default: 1');
  }
  
  return patternId;
};

// Get and validate the print element
const getAndValidatePrintElement = () => {
  const element = document.getElementById('printSection');
  
  if (!element) {
    console.error('Print section element not found!');
    console.log('Available elements with IDs:', 
      Array.from(document.querySelectorAll('[id]')).map(el => ({ id: el.id, tagName: el.tagName }))
    );
    throw new Error('Print section not found');
  }
  
  console.log('Found printSection element:', element);
  return element;
};

// Load the HTML2PDF library
const loadHtml2PdfLibrary = async () => {
  console.log('Importing html2pdf library...');
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    console.log('html2pdf library loaded successfully');
    return html2pdf;
  } catch (importError) {
    console.error('Failed to import html2pdf library:', importError);
    throw new Error('Failed to load PDF generation library');
  }
};

// Generate PDF files for all available mediums
const generatePDFFilesForAllMediums = async (element: HTMLElement, html2pdf: () => {
  set: (options: {
    margin: number;
    filename: string;
    image: { type: string; quality: number };
    html2canvas: { scale: number; logging: boolean; useCORS: boolean };
    jsPDF: { unit: string; format: string; orientation: string };
  }) => {
    from: (element: HTMLElement) => {
      outputPdf: (type: string) => Promise<Blob>;
    };
  };
}) => {
  // Get available instruction mediums
  const instructionMediums = getInstructionMediums();
  console.log('Instruction mediums for PDF generation:', instructionMediums);
  
  if (instructionMediums.length === 0) {
    console.warn('No instruction mediums found, using default medium (1)');
    instructionMediums.push(1); // Ensure we have at least one medium
  }
  
  // Generate PDF for each medium
  const pdfFiles: File[] = [];
  
  // First try generating a test PDF to see if html2pdf is working
  try {
    console.log('Testing PDF generation with current medium...');
    const testOptions = {
      margin: 0,
      filename: 'test.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 4, 
        logging: true, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        letterRendering: true,
        dpi: 300,
        removeContainer: false,
        onclone: (clonedDoc) => {
          // Apply additional text handling styles
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { font-family: 'Times New Roman', Times, serif !important; }
            p, span, div, h1, h2, h3, h4, h5, h6, li, td, th {
              font-family: inherit !important;
              color: #000000 !important;
              font-size: 12pt !important;
              line-height: 1.5 !important;
              text-rendering: geometricPrecision !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Mark all text elements for special handling
          const textElements = clonedDoc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
          for (const el of textElements) {
            el.dataset.html2canvasRenderText = 'true';
            el.dataset.html2canvasRenderNode = 'true';
            el.dataset.html2canvasSelectableText = 'true';
          }
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: false,
        putOnlyUsedFonts: true,
        floatPrecision: 16,
        hotfixes: ['px_scaling'], // Improve text rendering
      },
      enableLinks: true,
      useAdvancedTextHandling: true, // Custom flag for our implementation
    };
    
    const testBlob = await html2pdf()
      .set(testOptions)
      .from(element)
      .outputPdf('blob');
    
    console.log('Test PDF generation successful, blob size:', testBlob.size);
    
    if (testBlob.size === 0) {
      throw new Error('Test PDF has zero size, check HTML content and rendering');
    }
  } catch (error) {
    console.error('Test PDF generation failed:', error);
    throw new Error(`PDF generation test failed: ${error.message}`);
  }
  
  // Now generate PDFs for each medium
  for (const mediumId of instructionMediums) {
    try {
      console.log(`Generating PDF for medium ${mediumId}...`);
      const file = await generatePDFForMedium(element, mediumId, html2pdf);
      
      if (!file || file.size === 0) {
        console.error(`Generated PDF for medium ${mediumId} is invalid or empty`);
        throw new Error(`Invalid PDF for medium ${mediumId}`);
      }
      
      pdfFiles.push(file);
      console.log(`Added PDF for medium ${mediumId} to files array, size: ${file.size} bytes`);
    } catch (error) {
      console.error(`Error generating PDF for medium ${mediumId}:`, error);
      
      // If this is the only medium or the first one, rethrow the error
      if (instructionMediums.length === 1 || mediumId === instructionMediums[0]) {
        throw new Error(`Failed to generate PDF for medium ${mediumId}: ${error.message}`);
      }
      
      // Otherwise continue with other mediums
      console.warn(`Skipping medium ${mediumId} due to error, continuing with others`);
    }
  }
  
  // Verify we have at least one valid PDF
  if (pdfFiles.length === 0) {
    throw new Error('Failed to generate any valid PDF files');
  }
  
  return pdfFiles;
};

// Get the list of instruction mediums to use
const getInstructionMediums = () => {
  console.log('Available mediums:', availableMediums.value);
  
  // If no instruction mediums are available, default to English (ID 1)
  if (!availableMediums.value || availableMediums.value.length === 0) {
    console.warn('No available mediums found, using default English medium (ID 1)');
    return [1];
  }
  
  // Get all medium IDs
  const mediumIds = availableMediums.value.map(medium => medium.id);
  
  // Filter out any invalid or zero IDs
  const validMediumIds = mediumIds.filter(id => id && id > 0);
  
  // If we have valid IDs, return them, otherwise return default
  if (validMediumIds.length > 0) {
    console.log('Using valid medium IDs:', validMediumIds);
    return validMediumIds;
  }
  
  console.warn('No valid medium IDs found, using default English medium (ID 1)');
  return [1]; // Default to English medium (ID 1)
};

// Helper function to flatten deeply nested arrays
const flattenArray = (arr: any[]): any[] => {
  const result: any[] = [];
  
  const flatten = (item: any) => {
    if (Array.isArray(item)) {
      for (const el of item) flatten(el);
    } else {
      result.push(item);
    }
  };
  
  flatten(arr);
  return result;
};

// Helper function to extract chapter ID from various formats
const extractChapterId = (chapter: { id?: number; chapterId?: number } | number | string): number | null => {
  // Check if chapter is already a simple number
  if (typeof chapter === 'number') {
    return chapter;
  }
  
  // Check if chapter is a string that can be converted to number
  if (typeof chapter === 'string') {
    const parsed = Number.parseInt(chapter, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  
  // For object types, check for id or chapterId properties
  if (chapter && typeof chapter === 'object') {
    if ('id' in chapter) return chapter.id;
    if ('chapterId' in chapter) return chapter.chapterId;
  }
  
  // If we can't determine the ID, log an error and return null
  console.error('Unable to extract ID from chapter:', chapter);
  return null;
};

// Helper function to safely append values to FormData
const appendPdfFiles = (formData: FormData, pdfFiles: File[]) => {
  for (const file of pdfFiles) {
    if (file && file.size > 0) {
      console.log(`Adding file to FormData: ${file.name}, size: ${file.size}, type: ${file.type}`);
      formData.append('files', file);
    } else {
      console.error('Skipping invalid file:', file);
    }
  }
};

const logFormDataEntries = (formData: FormData) => {
  console.log('FormData entries:');
  for (const pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).size} bytes)`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
};

const logTestPaperSubmitError = (
  error: any,
  context: {
    chaptersArray: number[]
    weightagesArray: number[]
    mediumIds: number[]
    pdfFiles: File[]
    formData: FormData
    userId: string | number
    schoolId: string | number
  },
) => {
  const { chaptersArray, weightagesArray, mediumIds, pdfFiles, formData, userId, schoolId } = context
  console.error('API error:', error);
  if (error.response) {
    console.error('Error response details:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      headers: error.response.headers,
      config: {
        url: error.response.config?.url,
        method: error.response.config?.method,
        headers: error.response.config?.headers
      }
    });
    if (error.response.status === 400) {
      console.error('400 Bad Request - Validation failed. Check the following:');
      console.error('1. Data format:', {
        chapters: chaptersArray,
        weightages: weightagesArray,
        instruction_mediums: mediumIds,
        filesCount: pdfFiles.length
      });
      console.error('2. Query parameters:', { userId, schoolId });
      console.error('3. Form data keys:', Array.from(formData.keys()));
    }
    return;
  }
  if (error.request) {
    console.error('No response received:', error.request);
    return;
  }
  console.error('Error setting up request:', error.message);
};

// Submit test paper data to the API
const submitTestPaperData = async (
  userId: string | number,
  schoolId: string | number,
  chapters: Array<{ id?: number; chapterId?: number } | number>,
  weightages: number[],
  patternId: string,
  pdfFiles: File[]
) => {
  const formData = new FormData();
  
  // Add test paper metadata
  formData.append('name', paperTitle.value);
  formData.append('exam_time', testDuration.value);
  formData.append('pattern_id', patternId);
  formData.append('test_paper_origin_type', 'board');
  
  // Extract and process chapter IDs
  console.log('Raw chapters data:', chapters);
  console.log('Raw weightages data:', weightages);
  
  // Flatten the nested arrays first
  const flattenedChapters = flattenArray(chapters);
  const flattenedWeightages = flattenArray(weightages);
  
  console.log('Flattened chapters:', flattenedChapters);
  console.log('Flattened weightages:', flattenedWeightages);
  
  const chapterIds = flattenedChapters.map(extractChapterId).filter(Boolean);
  const processedWeightages = flattenedWeightages.map(w => typeof w === 'string' ? Number.parseInt(w, 10) : w).filter(w => !Number.isNaN(w));
  
  console.log('Extracted chapter IDs:', chapterIds);
  console.log('Processed weightages:', processedWeightages);
  
  // Validate that we have the same number of chapters and weightages
  if (chapterIds.length !== processedWeightages.length) {
    throw new Error(`Mismatch between chapters (${chapterIds.length}) and weightages (${processedWeightages.length})`);
  }
  
  if (chapterIds.length === 0) {
    throw new Error('No valid chapter IDs found after processing');
  }
  
  // Add chapters as JSON array (API expects array format)
  const chaptersArray = chapterIds.map(Number).filter(id => !Number.isNaN(id));
  formData.append('chapters', JSON.stringify(chaptersArray));
  
  // Add weightages as JSON array (API expects array format)  
  const weightagesArray = processedWeightages.map(Number).filter(w => !Number.isNaN(w));
  formData.append('weightages', JSON.stringify(weightagesArray));
  
  // Add instruction mediums as JSON array
  const mediumIds = availableMediums.value.map(medium => Number(medium.id)).filter(id => !Number.isNaN(id));
  formData.append('instruction_mediums', JSON.stringify(mediumIds));
  
  // Final validation
  console.log('Final data being sent to API:', {
    chapters: chaptersArray,
    weightages: weightagesArray,
    instruction_mediums: mediumIds,
    name: paperTitle.value,
    exam_time: testDuration.value,
    pattern_id: patternId,
    test_paper_origin_type: 'board',
    filesCount: pdfFiles.length
  });
  
  // Validate arrays have same length
  if (chaptersArray.length !== weightagesArray.length) {
    throw new Error(`Final validation failed: chapters (${chaptersArray.length}) and weightages (${weightagesArray.length}) arrays must have the same length`);
  }
  
  // Validate that we have files for each medium
  if (pdfFiles.length !== mediumIds.length) {
    throw new Error(`Mismatch between PDF files (${pdfFiles.length}) and instruction mediums (${mediumIds.length})`);
  }
  
  // Add files - make sure they're in the same order as instruction_mediums
  console.log('Adding files to form data:', pdfFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
  appendPdfFiles(formData, pdfFiles);
  logFormDataEntries(formData);

  // Log the summary of what we're submitting
  console.log('Submitting test paper with the following data:', {
    userId, schoolId, name: paperTitle.value, examTime: testDuration.value,
    patternId, chapters: chapterIds, weightages: processedWeightages, mediums: mediumIds,
    files: pdfFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
  });
  
  try {
    const url = `/test-paper-html/create?userId=${userId}&schoolId=${schoolId}`;
    console.log('Making API call to:', url);
    console.log('Request headers will include:', {
      'Content-Type': 'multipart/form-data'
    });
    
    const response = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    console.log('API response:', response.data);
    return response;
  } catch (error) {
    logTestPaperSubmitError(error, { chaptersArray, weightagesArray, mediumIds, pdfFiles, formData, userId, schoolId });
    throw error;
  }
};

// Handle errors during the save process
const handleSaveError = (error: unknown) => {
  console.error('Error saving test paper:', error);
  saveError.value = error instanceof Error ? error.message : 'Unknown error occurred';
};

// Restore the original medium after save attempt
const restoreOriginalMedium = async (originalMediumId: number) => {
  if (currentMediumId.value !== originalMediumId) {
    try {
      await switchToMedium(originalMediumId);
    } catch (error) {
      console.error('Error restoring original medium:', error);
    }
  }
};

// Fetch user profile to get school name
const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/profile')
    if (response.data?.data) {
      userProfile.value = response.data.data
      
      // Get school name from user profile
      if (userProfile.value?.schools?.length > 0) {
        schoolName.value = userProfile.value.schools[0].name
      }
    } else {
      console.error('Unexpected API response format for user profile:', response.data)
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
}

// Load data from localStorage
const loadStoredData = () => {
  try {
    // Check if lastUsedEndpoint is in the route query
    const endpointFromRoute = route.query.lastUsedEndpoint as string;
    const endpoint = endpointFromRoute || localStorage.getItem('lastUsedEndpoint') as string;
    
    // Load appropriate data
    if (endpoint === 'distribute') {
      const storedData = localStorage.getItem('distributeData');
      return storedData ? JSON.parse(storedData) : null;
    } else {
      const storedData = localStorage.getItem('allocationData');
      return storedData ? JSON.parse(storedData) : null;
    }
  } catch (e) {
    console.error('Error loading stored data:', e);
    return null;
  }
}

// Fetch test paper questions from API
const fetchTestPaperQuestions = async (storedData?: ApiResponse) => {
  try {
    console.log('Fetching test paper questions from localStorage or route params');
    
    // If storedData was provided as parameter, use that
    if (storedData) {
      console.log('Using stored data passed as parameter');
      apiData.value = storedData;
      
      // Extract available mediums before transforming data
      extractAvailableMediums(storedData);
      
      // Transform data for display
      transformApiDataToDisplayFormat(storedData);
      return;
    }
    
    // First check if finalQuestionsDistribution exists in localStorage
    const finalDistributionData = localStorage.getItem('finalQuestionsDistribution');
    if (finalDistributionData) {
      try {
        const parsedData = JSON.parse(finalDistributionData);
        console.log('Using finalQuestionsDistribution from localStorage');
        apiData.value = parsedData;
        
        // Extract available mediums before transforming data
        extractAvailableMediums(parsedData);
        
        // Transform data for display
        transformApiDataToDisplayFormat(parsedData);
        return;
      } catch (e) {
        console.error('Error parsing final questions distribution data:', e);
      }
    }
    
    console.error('No test paper data available');
    
  } catch (error) {
    console.error('Error fetching test paper questions:', error);
  }
}

// Extract available mediums from API data
const extractAvailableMediums = (data: ApiResponse) => {
  try {
    if (data?.mediums?.length > 0) {
      availableMediums.value = data.mediums.map((medium: { id: number; instruction_medium: string }) => ({
        id: medium.id,
        name: medium.instruction_medium
      }));
      console.log('Extracted available mediums:', availableMediums.value);
      
      // Set current medium ID to the first available medium if not already set
      if (availableMediums.value.length > 0 && currentMediumId.value === 1) {
        currentMediumId.value = availableMediums.value[0].id;
      }
    } else {
      // If no mediums in API data, use default
      availableMediums.value = [{ id: 1, name: 'English' }];
      console.log('No mediums found in API data, using default English medium');
    }
  } catch (error) {
    console.error('Error extracting available mediums:for (const chapter of ', error);
    // Add default medium as fallback
    availableMediums.value = [{ id: 1, name: 'English' }];
  }
};

// Transform API data to display format (same as in testPaperPreview.vue)
const transformApiDataToDisplayFormat = (data: ApiResponse) => {
  if (!data?.sectionAllocations) {
    return;
  }

  // Process sections and convert to display format
  const displaySections = processAllSections(data.sectionAllocations);
  
  // Update the reactive reference with processed sections
  testPaperSections.value = displaySections;
};

// Process all sections into display format
const processAllSections = (sectionAllocations: ApiResponse['sectionAllocations']): DisplaySection[] => {
  let sectionNumberCounter = 1;
  
  // Sort sections by sequentialNumber or sectionId for consistent ordering
  const sortedSections = sortSectionsBySequence(sectionAllocations);
  
  // Process each section and return the array of display sections
  return sortedSections.map(section => {
    const displaySection = createDisplaySection(section, sectionNumberCounter);
    
    // Update counter if we used a counter-based section number
    if (!section.section_number) {
      sectionNumberCounter++;
    }
    
    // Process subsections and questions
    processSubsections(section, displaySection);
    
    return displaySection;
  });
};

// Sort sections by sequentialNumber or sectionId
const sortSectionsBySequence = (sections: ApiResponse['sectionAllocations']) => {
  return [...sections].sort((a, b) => {
    // First try to sort by sequentialNumber if available
    if (a.sequentialNumber !== undefined && b.sequentialNumber !== undefined) {
      return a.sequentialNumber - b.sequentialNumber;
    }
    // Fall back to sectionId
    return a.sectionId - b.sectionId;
  });
};

// Create a display section object from API section data
const createDisplaySection = (
  section: ApiResponse['sectionAllocations'][0], 
  counter: number
): DisplaySection => {
  // Create formatted section number display (e.g., "1.A")
  const sectionNum = section.section_number ?? counter;
  const subSection = section.subSection ?? '';
  const sectionNumberDisplay = subSection ? `${sectionNum}.${subSection}` : `${sectionNum}`;
  
  return {
    sectionNumber: section.section_number ?? counter,
    sectionName: section.sectionName,
    totalMarks: section.totalMarks,
    questions: [],
    subSection: section.subSection,
    sectionNumberDisplay: sectionNumberDisplay,
    mandotory_questions: section.mandotory_questions
  };
};

// Process subsections and questions for a section
const processSubsections = (
  section: ApiResponse['sectionAllocations'][0],
  displaySection: DisplaySection
) => {
  let questionNumberCounter = 1;
  
  // Process each subsection within a section
  for (const subsection of section.subsectionAllocations) {
    // Process each chapter's questions within a subsection
    for (const chapter of subsection.allocatedChapters) {
      if (chapter.question) {
        const question = processQuestion(
          chapter,
          questionNumberCounter,
          section
        );
        
        if (question) {
          displaySection.questions.push(question);
          questionNumberCounter++;
        }
      }
    }
  }
};

// Process a question from chapter data
const processQuestion = (
  chapter: { chapterId: number; chapterName: string; question?: Question },
  questionNumber: number,
  section: ApiResponse['sectionAllocations'][0]
): DisplayQuestion | null => {
  const question = chapter.question;
  if (!question) return null;
  
  // Find appropriate question text for current medium
  const questionText = findQuestionTextForMedium(question);
  if (!questionText) return null;
  
  // Extract topic ID from questionText
  const topicId = getTopicIdFromQuestionText(questionText);
  
  // Create base display question
  const displayQuestion = createBaseDisplayQuestion(
    questionNumber,
    questionText.question_text,
    section,
    question.question_type.type_name,
    topicId,
    chapter.chapterId
  );
  
  // Add options and match pairs if they exist
  addOptionsToQuestion(displayQuestion, questionText);
  addMatchPairsToQuestion(displayQuestion, questionText);
  
  return displayQuestion;
};

// Find question text for current medium
const findQuestionTextForMedium = (question: Question): QuestionText | null => {
  if (!question.question_texts || question.question_texts.length === 0) {
    console.warn('Question has no question_texts array');
    return null;
  }
  
  // First try to find question text matching current medium ID
  const matchingText = question.question_texts.find(text => 
    text.question_text_topics && 
    text.question_text_topics.length > 0 && 
    text.question_text_topics[0].instruction_medium_id === currentMediumId.value
  );
  
  // If not found, fall back to the first question text
  return matchingText ?? question.question_texts[0];
};

// Extract topic ID from questionText
const getTopicIdFromQuestionText = (questionText: QuestionText): number | undefined => {
  if (questionText.topic) {
    return questionText.topic.id;
  } else if (questionText.question_text_topics && questionText.question_text_topics.length > 0) {
    return questionText.question_text_topics[0].question_topic_id;
  }
  return undefined;
};

// Create base display question object
const createBaseDisplayQuestion = (
  questionNumber: number,
  questionText: string,
  section: ApiResponse['sectionAllocations'][0],
  questionType: string,
  topicId?: number,
  chapterId?: number
): DisplayQuestion => {
  return {
    questionNumber: questionNumber,
    questionText: questionText,
    marks: section.marks_per_question ?? Math.ceil(section.totalMarks / section.totalQuestions),
    questionType: questionType,
    topicId: topicId,
    chapterId: chapterId // Store chapter ID for reference
  };
};

// Add options to question if they exist
const addOptionsToQuestion = (displayQuestion: DisplayQuestion, questionText: QuestionText) => {
  if (questionText.mcq_options && questionText.mcq_options.length > 0) {
    displayQuestion.options = questionText.mcq_options.map((option: McqOption, index: number) => ({
      label: String.fromCodePoint(65 + index), // A, B, C, D...
      text: option.option_text,
      isCorrect: option.is_correct
    }));
  }
};

// Add match pairs to question if they exist
const addMatchPairsToQuestion = (displayQuestion: DisplayQuestion, questionText: QuestionText) => {
  if (questionText.match_pairs && questionText.match_pairs.length > 0) {
    displayQuestion.matchPairs = questionText.match_pairs.map((pair: MatchPair) => ({
      leftText: pair.left_text,
      rightText: pair.right_text
    }));
  }
};

// Print page functionality
const printPage = async () => {
  console.log('🖨️ Print button clicked - starting print process...');
  
  try {
    console.log('Starting print process...');
    
    // Get the print element
    const element = document.getElementById('printSection');
    if (!element) {
      console.error('Print section not found');
      alert('Print section not found. Please refresh the page and try again.');
      return;
    }
    
    // Check if the element has content
    const hasContent = element.innerHTML.trim().length > 0;
    const hasVisibleContent = element.offsetHeight > 0 && element.offsetWidth > 0;
    
    console.log('Print section found, preparing for print...', {
      hasContent,
      hasVisibleContent,
      innerHTML: element.innerHTML.length,
      offsetHeight: element.offsetHeight,
      offsetWidth: element.offsetWidth
    });
    
    if (!hasContent) {
      console.error('Print section is empty');
      alert('No content to print. Please make sure the test paper has loaded completely.');
      return;
    }
    
    console.log('Print section found, preparing for print...');
    
    // Show loading indicator
    document.body.classList.add('printing-test-paper');
    
    // Hide the app header or navigation before printing
    const appHeader = document.querySelector('header');
    const appNav = document.querySelector('nav');
    
    if (appHeader) appHeader.classList.add('no-print-important');
    if (appNav) appNav.classList.add('no-print-important');
    
    // Apply styling to ensure proper print appearance
    const a4PaperCard = element.querySelector('.a4-paper-card') as HTMLElement;
    if (a4PaperCard) {
      a4PaperCard.style.border = 'none';
      a4PaperCard.style.boxShadow = 'none';
      a4PaperCard.style.padding = '20mm';
      a4PaperCard.style.transform = 'none';
    }
    
    // Hide elements that should be hidden in print
    const elementsToHide = document.querySelectorAll('.no-print');
    const originalDisplays: string[] = [];
    for (const [index, el] of elementsToHide.entries()) {
      const htmlEl = el as HTMLElement;
      originalDisplays[index] = htmlEl.style.display;
      htmlEl.style.display = 'none';
    }
    
    console.log('Styles applied, calling globalThis.print()...');
    
    // Add a small delay to ensure styles are applied
    setTimeout(() => {
      // Use the browser's native print dialog
      globalThis.print();
      console.log('Print dialog opened successfully');
    }, 100);
    
    // Restore styles after a short delay
    setTimeout(() => {
      console.log('Restoring original styles...');
      
      document.body.classList.remove('printing-test-paper');
      
      if (appHeader) appHeader.classList.remove('no-print-important');
      if (appNav) appNav.classList.remove('no-print-important');
      
      if (a4PaperCard) {
        a4PaperCard.style.border = '';
        a4PaperCard.style.boxShadow = '';
        a4PaperCard.style.padding = '';
        a4PaperCard.style.transform = '';
      }
      
      // Restore original display values
      for (const [index, el] of elementsToHide.entries()) {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = originalDisplays[index] || '';
      }
      
      console.log('Styles restored successfully');
    }, 1000);
    
  } catch (error) {
    console.error('Error in print process:', error);
    alert('Print failed. Please try again or use your browser\'s print function (Ctrl+P).');
    
    // Clean up in case of error
    document.body.classList.remove('printing-test-paper');
    const appHeader = document.querySelector('header');
    const appNav = document.querySelector('nav');
    if (appHeader) appHeader.classList.remove('no-print-important');
    if (appNav) appNav.classList.remove('no-print-important');
  }
};

// Go back button handler
const goBack = () => {
  router.back();
}

// Scroll to top functionality
const scrollToTop = () => {
  globalThis.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize component data
const initializeComponent = async () => {
  isLoading.value = true;
  try {
    // Load user profile and school name
    await fetchUserProfile();
    
    // Load option layouts from localStorage
    loadOptionLayouts();
    
    // Load exam instructions from localStorage if they exist
    const savedInstructions = localStorage.getItem('examInstructions');
    if (savedInstructions) {
      try {
        examInstructions.value = JSON.parse(savedInstructions);
      } catch (e) {
        console.error('Error parsing saved instructions:', e);
      }
    }
    
    // Try to load data from localStorage
    const finalDistributionData = localStorage.getItem('finalQuestionsDistribution');
    if (finalDistributionData) {
      try {
        const parsedData = JSON.parse(finalDistributionData);
        console.log('Fetching test paper using data from localStorage');
        await fetchTestPaperQuestions(parsedData);
      } catch (e) {
        console.error('Error parsing final questions distribution data:', e);
      }
    } else {
      // Fallback to loadStoredData
      const storedData = loadStoredData();
      if (storedData) {
        console.log('Fetching test paper using fallback data from localStorage');
        await fetchTestPaperQuestions(storedData);
      } else {
        console.error('No data available to display test paper');
      }
    }
    
    console.log('Test paper initialized with data from localStorage');
  } catch (error) {
    console.error('Error initializing save test paper:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  // Initialize the component with data
  initializeComponent();
  
  // Add scroll event listener for back-to-top button visibility
  globalThis.addEventListener('scroll', handleScroll);
  
  // Call handleScroll initially to set the correct visibility
  handleScroll();
  
  // Add event listener to close dropdowns when clicking outside
  document.addEventListener('click', handleMediumDropdownClickOutside);
  
  // If save was requested, trigger the save operation after a short delay
  if (saveRequested.value) {
    setTimeout(() => {
      saveTestPaperToDB();
    }, 1000); // Give the page time to fully render
  }
});

onBeforeUnmount(() => {
  // Remove event listeners
  globalThis.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleMediumDropdownClickOutside);
});

// Show/hide back-to-top button based on scroll position
const handleScroll = () => {
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    if (globalThis.scrollY > 300) {
      backToTopBtn.style.cssText = 'display: flex !important;';
    } else {
      backToTopBtn.style.cssText = 'display: none !important;';
    }
  }
}

// Add mobile view mode and zoom script variables
// After the handleMediumDropdownClickOutside function

// Add mobileViewMode state and zoom level
const mobileViewMode = ref(false);
const zoomLevel = ref(100);

// Computed style for A4 paper based on zoom level
const a4PaperStyle = computed(() => {
  if (!mobileViewMode.value && zoomLevel.value < 100) {
    const scale = zoomLevel.value / 100;
    return {
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
      marginBottom: `${30 - (30 * scale)}px`
    };
  }
  return {};
});

// Update zoom function
const updateZoom = () => {
  // Update localStorage to remember user's preference
  localStorage.setItem('a4ZoomLevel', zoomLevel.value.toString());
};

// In the initializeComponent function, add after loading option layouts:
// Load saved zoom level from localStorage
const savedZoomLevel = localStorage.getItem('a4ZoomLevel');
if (savedZoomLevel) {
  zoomLevel.value = Number.parseInt(savedZoomLevel);
}
</script>

<style scoped>
/* Main styles */
.save-container {
  padding-top: 20px;
  padding-bottom: 50px;
  max-width: 210mm; /* A4 width */
  margin: 0 auto;
  background-color: white;
  box-shadow: none;
  font-family: 'Times New Roman', Times, serif; /* Typical document font */
}

/* Additional A4 Paper Styles */
.a4-paper-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 30px;
  overflow-x: auto; /* Add horizontal scrolling for small screens */
  -webkit-overflow-scrolling: touch; /* Smoother scrolling on iOS */
}

.a4-paper-card {
  width: 210mm; /* A4 width */
  background-color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 10mm; /* Standard A4 margins */
  border: 1px solid #ddd;
  margin: 0 auto;
  position: relative;
  overflow: visible;
  flex-shrink: 0; /* Prevent paper from shrinking */
  /* Add transition for smooth zoom effect */
  transition: transform 0.2s ease;
}

/* Mobile view mode styles */
.mobile-view {
  width: 100%;
  padding: 0;
  overflow-x: visible; /* Reset overflow behavior for mobile view */
}

.mobile-view .a4-paper-card {
  width: 100%; /* Allow full width for mobile view mode */
  min-width: auto; /* Allow to shrink in mobile view */
  max-width: 100%; /* Ensure it doesn't exceed screen width */
  min-height: auto;
  padding: 15px;
  box-shadow: none;
  border: none;
  margin: 0;
  overflow: visible;
  flex-shrink: 1; /* Allow shrinking in mobile view */
  transform: none !important; /* Reset any transform in mobile view */
}

/* For screens smaller than tablets, ensure A4 remains visible */
@media (max-width: 768px) {
  .a4-paper-container:not(.mobile-view) {
    justify-content: flex-start; /* Align to start for better scrolling UX */
    padding-bottom: 10px; /* Add space for scrollbar */
  }
  
  .a4-paper-container:not(.mobile-view)::after {
    content: '';
    display: block;
    width: 20px; /* Space after the A4 paper */
    flex-shrink: 0;
  }
}

/* For desktop screens, improve A4 display */
@media (min-width: 769px) {
  .a4-paper-container {
    max-width: 210mm; /* Limit to A4 width */
    margin-left: auto;
    margin-right: auto;
    overflow-x: visible; /* No horizontal scroll needed on desktop */
  }
  
  .a4-paper-card {
    max-width: 100%; /* Ensure it fits within container */
    box-shadow: 0 8px 24px rgba(0,0,0,0.12); /* Enhanced shadow for desktop */
  }
}

/* View Mode Toggle Styles */
.view-mode-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  background-color: rgba(255,255,255,0.9);
  padding: 5px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.form-check-input {
  margin-right: 10px;
}

/* Zoom control styles */
.zoom-control-container {
  width: 100%;
  max-width: 250px;
}

.zoom-label {
  display: flex;
  align-items: center;
  width: 100%;
  color: #6c757d;
}

.zoom-slider {
  flex: 1;
}

.zoom-value {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
  margin-top: 2px;
}

.scroll-hint {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 5px;
  text-align: center;
}

/* Print styles for A4 paper */
@media print {
  .a4-paper-card {
    width: 210mm;
    height: auto;
    padding: 0;
    box-shadow: none;
    border: none;
    margin: 0;
    transform: none !important; /* Reset any transform when printing */
  }
  
  /* Hide view mode toggle and zoom controls when printing */
  .view-mode-toggle-container,
  .zoom-control-container {
    display: none !important;
  }
  
  /* Always use A4 preview mode when printing */
  .mobile-view .a4-paper-card {
    width: 210mm;
    min-height: auto;
    padding: 20mm;
  }
}

/* Document header styles */
.document-header {
  margin-bottom: 20px;
}

.school-name {
  margin: 0;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 1.1rem;
}

.paper-title {
  margin: 10px 0;
  font-size: 1.5rem;
  font-weight: normal;
}

/* MS Office A4 style sections */
.a4-paper-section {
  margin-bottom: 20px;
  border: none;
  background-color: white;
  padding: 0 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #d6d6d6;
}

.section-title {
  font-weight: normal;
  font-size: 1rem;
}

.section-marks {
  font-weight: normal;
  font-size: 0.9rem;
}

.section-content {
  padding: 0;
}

/* Question list instead of table */
.question-list {
  width: 100%;
  padding-left: 30px; /* Add padding to align questions with section name */
}

/* Responsive question list padding */
@media (max-width: 768px) {
  .question-list {
    padding-left: 25px; /* Slightly less padding on medium screens */
  }
}

@media (max-width: 576px) {
  .question-list {
    padding-left: 15px; /* Less padding on small screens */
  }
}

.question-item {
  margin-bottom: 15px;
}

.question-wrapper {
  display: flex;
  width: 100%;
}

.question-content {
  flex: 1;
  padding-right: 15px;
}

.question-marks {
  width: 60px;
  text-align: right;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.question-divider {
  display: none; /* Hide the question dividers */
  margin-top: 15px;
  margin-bottom: 15px;
  border-top: 1px dotted #eaeaea;
  opacity: 0.5;
}

/* Question styling */
.question-text {
  font-weight: normal;
  line-height: 1.5;
}

.question-type-badge {
  font-size: 0.7rem;
  background-color: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-left: 8px;
  vertical-align: middle;
  font-weight: normal;
  white-space: nowrap;
}

/* Options styling */
.options-container {
  padding: 5px;
  page-break-inside: avoid; /* Keep options together */
}

.options-title {
  font-weight: normal;
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

/* Row layout (all options in one row) */
.options-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}

.option-item-row {
  flex: 1;
  padding: 5px;
  margin-right: 10px;
  background-color: transparent;
  border: none;
  white-space: normal;
}

.option-item-row:last-child {
  margin-right: 0;
}

/* Grid layout (2x2) */
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 10px;
  width: 100%;
  margin-bottom: 10px;
}

.option-item-grid {
  padding: 5px;
  background-color: transparent;
  border: none;
}

/* Column layout (all options in one column) */
.options-column {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px;
}

.option-item-column {
  width: 100%;
  padding: 5px;
  margin-bottom: 8px;
  background-color: transparent;
  border: none;
}

.option-item-column:last-child {
  margin-bottom: 0;
}

.option-item {
  padding: 5px;
  margin-bottom: 5px;
  background-color: transparent;
  border: none;
}

.option-label {
  font-weight: normal;
  margin-right: 10px;
}

.option-text {
  word-break: break-word;
}

/* Match pairs styling */
.match-pairs-container {
  margin-top: 10px;
  width: 100%;
  padding-left: 25px; /* Add left padding to align with question text */
  page-break-inside: avoid; /* Keep match pairs together */
}

.match-pair-item {
  padding: 5px;
  margin-bottom: 8px;
}

/* Marks styling */
.marks {
  font-weight: bold;
}

.marks-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

/* Define no-print class to hide elements when printing */
.no-print {
  display: inherit;
}

/* Print styles - optimize for A4 printing */
@media print {
  /* Hide elements not needed in print */
  .no-print {
    display: none !important;
  }
  
  /* Hide global header and navigation elements */
  header, nav, .navbar, .app-header, .site-header, .main-header, 
  .header-container, .header-wrapper, .global-header, .site-logo {
    display: none !important;
  }
  
  /* Target specific header logo (modify these selectors as needed based on your app structure) */
  img[src*="logo"], .logo, .brand-logo, .app-logo, .header-logo {
    display: none !important;
  }
  
  /* Remove any top margin that might be causing space for the header */
  body, html, #app, .app-container, main, .main-content {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  
  /* Ensure the print section is visible and properly positioned */
  #printSection {
    position: static !important;
    top: auto !important;
    left: auto !important;
    width: 100% !important;
    visibility: visible !important;
    display: block !important;
  }
  
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Ensure all content is visible */
  .save-container, .a4-paper-container, .a4-paper-card {
    position: static !important;
    visibility: visible !important;
    display: block !important;
    opacity: 1 !important;
  }
  
  .save-container {
    box-shadow: none;
    padding: 0;
    width: 210mm;
    max-width: none !important;
    margin: 0 !important;
  }
  
  #backToTop, 
  .mobile-back-button, 
  .mobile-action-buttons {
    display: none !important;
  }
  
  /* New page break rules for sections and questions */
  .a4-paper-section {
    /* Allow section content to flow across pages as needed */
    page-break-inside: auto;
    break-inside: auto;
  }
  
  .section-header {
    /* Keep section header with at least some content */
    page-break-after: avoid;
    break-after: avoid;
    /* Don't start section header at the bottom of a page */
    page-break-before: auto;
    break-before: auto;
    background-color: white !important;
  }
  
  /* Individual question handling */
  .question-item {
    /* Each question should not be split across pages */
    page-break-inside: avoid;
    break-inside: avoid;
    /* But questions should break between them if needed */
    page-break-after: auto;
    break-after: auto;
    /* Don't force a single question to a new page unless it won't fit */
    page-break-before: auto; 
    break-before: auto;
  }
  
  /* Ensure MCQ options stay together with their question */
  .options-container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* Match pairs should also stay together */
  .match-pairs-container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  .question-list {
    padding-left: 25px !important; /* Ensure padding is preserved when printing */
  }
  
  .question-divider {
    display: none !important; /* Ensure dividers are hidden when printing */
    border-color: #eee !important;
  }
  
  .question-type-badge {
    display: none;
  }
  
  /* Allow content to start from the top of the page */
  .paper-content {
    margin-top: 0 !important;
  }
  
  /* Remove any unnecessary margins/paddings */
  .container {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }
  
  /* Maintain option layouts on mobile but with adjusted sizes */
  /* Row layout - preserve row but with smaller items */
  .option-item-row {
    font-size: 0.9rem;
  }
  
  /* Grid layout - preserve 2x2 grid */
  .options-grid {
    gap: 5px;
  }
  
  .option-item-grid {
    margin-bottom: 5px;
  }
  
  /* Allow text to wrap in options */
  .option-text {
    word-break: break-word;
    hyphens: auto;
  }
}

/* Back to top button */
#backToTop {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: none !important; /* Ensure it's hidden by default */
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 999;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

#backToTop:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: translateY(-3px);
}

/* Mobile styles */
@media (max-width: 576px) {
  .container {
    padding-bottom: 100px !important; /* Increased to accommodate the action buttons */
  }
  
  /* Fixed mobile back button */
  .mobile-back-button {
    position: fixed;
    top: 15px;
    left: 15px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex !important;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 999;
    font-size: 1.2rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  /* Fixed bottom bar with action buttons */
  .mobile-action-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px -3px 10px rgba(0, 0, 0, 0.15);
    padding: 15px;
    z-index: 1001;
    display: flex;
    justify-content: space-between;
  }
  
  .mobile-action-buttons .btn {
    font-weight: normal;
    padding: 10px 15px;
    border-radius: 4px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: inherit;
    letter-spacing: normal;
  }
  
  .mobile-action-buttons .btn:active {
    transform: scale(0.98);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  /* Optimize document header for small screens */
  .document-header {
    padding: 0 10px;
  }
  
  .paper-title {
    font-size: 1.2rem;
    line-height: 1.3;
  }
  
  /* Responsive question wrapper */
  .question-wrapper {
    flex-wrap: wrap;
  }
  
  .question-content {
    flex: 1 0 75%;
    padding-right: 0;
  }
  
  .question-marks {
    flex: 1 0 25%;
    width: auto;
    padding-left: 5px;
    text-align: right;
  }
  
  /* Back to top button position for mobile */
  #backToTop {
    bottom: 120px;
    right: 15px;
  }
}

/* Prevent text from wrapping */
.nowrap {
  white-space: nowrap;
}

/* Exam Instructions styles */
.exam-instructions-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.exam-instructions-container h5 {
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
}

.instructions-display {
  margin-top: 10px;
  width: 100%;
}

.instruction-list {
  list-style-type: disc !important;
  padding-left: 20px !important;
  margin-bottom: 0;
  text-align: left;
  max-width: 100%;
}

.instruction-list li {
  margin-bottom: 5px;
  line-height: 1.5;
  position: relative;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  padding-right: 10px;
}

@media print {
  .exam-instructions-container {
    border: 1px solid #ddd;
    background-color: #fff !important;
    break-inside: avoid;
    width: 100%;
    margin: 15px 0;
    page-break-inside: avoid;
  }
  
  .instruction-list li {
    page-break-inside: avoid;
  }
}

/* Medium dropdown styles */
.medium-dropdown, .medium-dropdown-mobile {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1050;
  animation: fadeIn 0.2s ease-in-out;
  min-width: 180px;
}

.medium-dropdown-mobile {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 300px;
  padding: 15px;
}

.medium-dropdown-header {
  font-weight: bold;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.medium-dropdown-items {
  max-height: 250px;
  overflow-y: auto;
}

.medium-dropdown-item {
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.medium-dropdown-item:hover {
  background-color: #f5f5f5;
}

.medium-dropdown-item.active {
  background-color: #e9f5ff;
  color: #007bff;
  font-weight: 500;
}

/* Add mobile styles for the medium button */
@media (max-width: 576px) {
  .medium-dropdown-mobile {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  
  .medium-dropdown-item {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .medium-dropdown-item:last-child {
    border-bottom: none;
  }
}

/* Animation for dropdown */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Button styling */
.btn-custom {
  border: 1px solid gray !important;
  background-color: #f8f9fa;
  color: black;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.btn-custom:hover {
  border: 1px solid #343a40 !important;
  background-color: #343a40 !important;
  color: white !important;
}

@media (max-width: 576px) {
  .btn-custom {
    border: 1px solid #212529 !important;
    background-color: #212529 !important;
    color: white !important;
  }
}
</style>

<style>
/* Global styles that will affect elements outside of this component */
@media print {
  /* Hide header and navigation when printing */
  header, nav, .navbar, .app-header, .site-header, .main-header, 
  .header-container, .header-wrapper, .global-header {
    display: none !important;
    height: 0 !important;
    visibility: hidden !important;
    opacity: 0 !important;
    overflow: hidden !important;
  }
  
  /* Important style to fully hide elements when printing */
  .no-print-important {
    display: none !important;
    height: 0 !important;
    visibility: hidden !important;
    opacity: 0 !important;
    overflow: hidden !important;
  }
  
  /* When printing, ensure the body starts at the top of the page */
  body.printing-test-paper {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  
  /* Hide any possible logo elements */
  img[alt*="logo"], img[src*="logo"], .logo, .brand-logo, .app-logo {
    display: none !important;
  }
  
  /* Override any margins set by parent elements */
  #app, .app-container, main, .main-content {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
}
</style>
