<template>
  <div class="container my-4">
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
            <span class="d-inline-block">{{ decodeURIComponent(boardName) }}</span>
            <span class="d-inline-block ms-1">| {{ decodeURIComponent(mediumName) }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark mb-2">
            Standard {{ decodeURIComponent(standardName) }}
            <span class="d-block text-start text-secondary mt-1">
              {{ decodeURIComponent(subjectName) }}
              <span class="optional-info-marks-heading fs-5">{{ totalMarksFromPrevious }} Marks</span>
            </span>
          </h4>
        </div>
      </div>
      <hr />
    </div>

    <!-- Search and Filter Section -->
    <div class="row p-2 justify-content-center mb-3">
      <div class="col-12 col-sm-10">
        <!-- Search, Sort and Filter in One Row -->
        <div class="d-flex gap-2 mb-3">
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
            <select class="form-select sort-select" id="sortSelect" v-model="sortOption" @change="applyFilters">
              <option value="name_asc">Sort by Pattern Name (A-Z)</option>
              <option value="name_desc">Sort by Pattern Name (Z-A)</option>
            </select>
          </div>
        </div>
        
        <h6 class="mb-3 d-flex justify-content-between align-items-center">
          <span>Select MCQ Pattern</span>
          <span class="badge bg-secondary">{{ filteredPatterns.length }} found</span>
        </h6>
        
        <div v-if="isLoading" class="text-center py-5">
          <output class="spinner-border">
            <span class="visually-hidden">Loading...</span>
          </output>
          <p class="mt-2">Loading available patterns...</p>
        </div>
        
        <div v-if="!isLoading && filteredPatterns.length === 0" class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No patterns found for the selected criteria. Please try different filters or contact an administrator.
        </div>
        
        <div v-else-if="!isLoading">
          <div v-for="pattern in paginatedPatterns" :key="pattern.id" class="card pattern-card mb-3">
            <div class="card-body">
              <div class="container p-0">
                <!-- Total Marks Badge - Now at the top left -->
                <div class="mb-2">
                  <span class="badge bg-primary rounded-pill marks-badge">{{ pattern.total_marks }} Marks</span>
                </div>
                
                <!-- Pattern Header -->
                <div class="row justify-content-between align-items-center mb-3">
                  <div class="col-12">
                    <h5 class="card-title text-uppercase fw-bold mb-0">{{ pattern.pattern_name }}</h5>
                  </div>
                </div>
                
                <!-- Pattern Summary Info -->
                <div class="pattern-summary mb-3">
                  <div class="row g-3">
                    <div class="col-4">
                      <div class="summary-item text-center">
                        <div class="summary-number">{{ getTotalQuestions(pattern) }}</div>
                        <div class="summary-label small">Total Questions</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="summary-item text-center">
                        <div class="summary-number">{{ getMandatoryQuestions(pattern) }}</div>
                        <div class="summary-label small">Mandatory Questions</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="summary-item text-center">
                        <div class="summary-number">{{ getMarksPerQuestion(pattern) }}</div>
                        <div class="summary-label small">Marks per Question</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- View Details Button and Select Pattern Button -->
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <button 
                    class="btn btn-sm btn-light details-btn" 
                    @click.stop.prevent="togglePatternDetails(pattern)"
                  >
                    <i :class="pattern.isExpanded ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" class="me-1"></i>
                    {{ pattern.isExpanded ? 'Hide Details' : 'View Details' }}
                  </button>
                  <button 
                    class="btn btn-sm btn-dark select-btn"
                    @click.prevent="selectTestPattern(pattern)"
                  >
                    <i class="bi bi-check2 me-1"></i> Select Pattern
                  </button>
                </div>
                
                <!-- Section Details Table - with fixed column widths -->
                <transition 
                  name="slide-fade"
                  @before-enter="beforeEnter"
                  @enter="enter"
                  @before-leave="beforeLeave"
                  @leave="leave"
                >
                  <div v-if="pattern.isExpanded" class="section-preview mt-3" :key="pattern.id">
                    <div class="table-responsive">
                      <table class="table table-sm compact-table borderless-table">
                        <caption class="sr-only">Section details showing questions and their respective marks.</caption>
                        <thead class="table-dark rounded-table-header">
                          <tr>
                            <th class="question-column">Questions</th>
                            <th class="marks-column">Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="section in pattern.sections" :key="section.id">
                            <td class="question-cell">
                              <span class="question-text fw-bold">Q. {{ section.section_number }} {{ section.sub_section ? section.sub_section + ' ) ' : '' }}{{ section.section_name }}</span>
                              <div class="small text-secondary mt-1">
                                <span class="optional-info"><strong>{{ section.mandotory_questions }}</strong> out of <strong>{{ section.total_questions }}</strong></span>
                              </div>
                            </td>
                            <td class="text-center fw-bold marks-cell">{{ section.mandotory_questions * section.marks_per_question }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="row p-2 justify-content-center mb-4">
      <div class="col-12 col-sm-10">
        <div class="d-flex justify-content-between align-items-center">
          <!-- Pagination Info -->
          <div class="text-muted small">
            Showing {{ paginatedPatterns.length ? (currentPage - 1) * pageSize + 1 : 0 }} to
            {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} patterns
          </div>

          <!-- Pagination Buttons -->
          <nav aria-label="Pattern pagination">
            <ul class="pagination pagination-sm mb-0">
              <!-- Previous Page Button -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>

              <!-- Page Numbers -->
              <li 
                v-for="page in visiblePageNumbers" 
                :key="page" 
                class="page-item"
                :class="{ active: page === currentPage, disabled: page === '...' }"
              >
                <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(Number(page))">
                  {{ page }}
                </a>
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

    <!-- Toast Notification for status messages -->
    <ToastNotification
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import ToastNotification from '@/components/common/ToastNotification.vue'


// Define component name (for linter)
defineOptions({
  name: 'SelectMcqPattern'
})

// Setup router and route
const router = useRouter()
const route = useRoute()

// Pattern data type
interface Pattern {
  id: number;
  pattern_name: string;
  description?: string;
  board_id: number;
  standard_id: number;
  subject_id: number;
  total_marks: number;
  created_at: string;
  updated_at: string;
  board: {
    id: number;
    name: string;
    abbreviation: string;
  };
  standard: {
    id: number;
    name: string;
  };
  subject: {
    id: number;
    name: string;
  };
  sections: Array<{
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
  }>;
  isExpanded?: boolean;
}

// User profile and school data interfaces
interface UserProfile {
  id: number;
  name: string;
  email_id: string;
  schools: {
    id: number;
    name: string;
    board?: {
      id: number;
      name: string;
      abbreviation: string;
      address_id?: number;
      created_at?: string;
      updated_at?: string;
    };
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

// Defined but not directly used - kept for future reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface School {
  id: number;
  name: string;
  principal_name: string;
  email: string;
  contact_number: string;
  alternate_contact_number: string;
  created_at: string;
  updated_at: string;
  board: {
    id: number;
    name: string;
    abbreviation: string;
  };
  address: {
    id: number;
    postal_code: string;
    street: string;
    city: {
      id: number;
      name: string;
      state: {
        id: number;
        name: string;
        country: {
          id: number;
          name: string;
        }
      }
    }
  };
  instruction_mediums: Array<{
    id: number;
    name: string;
  }>;
  standards: Array<{
    id: number;
    name: string;
    sequence_number: number;
  }>;
}

// State variables
const patterns = ref<Pattern[]>([])
const isLoading = ref(false)
const isSearching = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchTimeout = ref<number | null>(null)
const sortOption = ref('name_asc')
// Get the total marks from the query parameters as a simple string
const totalMarksFromPrevious = (route.query.totalMarks as string) || ''

// User profile and school data
const userProfile = ref<UserProfile | null>(null)

// Animation methods
const beforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  // Start with zero height but maintain width
  htmlEl.style.height = '0';
  htmlEl.style.opacity = '0';
  htmlEl.style.overflow = 'hidden';
  htmlEl.style.display = 'block';
  htmlEl.style.marginTop = '0';
  htmlEl.style.transformOrigin = 'center top';
  // Hide any scrollbars during animation
  htmlEl.style.overflowX = 'hidden';
  htmlEl.style.overflowY = 'hidden';
}

const enter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement;
  
  // Force browser to recalculate styles before animation starts
  // This forces a reflow and is necessary for the animation
  // Use window getComputedStyle which is a function call with side effects
  globalThis.getComputedStyle(htmlEl).getPropertyValue('height');
  
  // Set target height for smooth animation
  const height = htmlEl.scrollHeight;
  
  // Faster transition with more immediate easing
  htmlEl.style.transition = 'all 0.3s cubic-bezier(0.17, 0.85, 0.44, 1)';
  
  // Quicker execution timing
  setTimeout(() => {
    htmlEl.style.height = `${height}px`;
    htmlEl.style.opacity = '1';
    htmlEl.style.marginTop = '1rem';
  }, 20);
  
  // Clean up after animation
  htmlEl.addEventListener('transitionend', (e) => {
    // Only proceed if it's the height property that finished transitioning
    if (e.propertyName === 'height') {
      htmlEl.style.height = 'auto';
      // Use visible for Y but hidden for X to prevent horizontal scrollbar
      htmlEl.style.overflowY = 'visible';
      htmlEl.style.overflowX = 'hidden';
      done();
    }
  }, { once: true });
}

const beforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement;
  // Set explicit height based on current size to enable animation
  htmlEl.style.height = `${htmlEl.scrollHeight}px`;
  htmlEl.style.overflow = 'hidden';
  
  // Change transform origin to bottom for closing effect
  htmlEl.style.transformOrigin = 'center bottom';
  
  // Force browser to acknowledge the height
  // This forces a reflow and is necessary for the animation
  // Use window getComputedStyle which is a function call with side effects
  globalThis.getComputedStyle(htmlEl).getPropertyValue('height');
}

const leave = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement;
  
  // Apply transition properties
  htmlEl.style.transition = 'all 0.5s cubic-bezier(0.3, 0, 0.2, 1)';
  
  // Give browser time to register before starting animation
  setTimeout(() => {
    htmlEl.style.height = '0';
    htmlEl.style.opacity = '0';
    htmlEl.style.marginTop = '0';
    htmlEl.style.transform = 'scaleY(0)';
  }, 10);
  
  // Clean up after animation
  htmlEl.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'transform' || e.propertyName === 'height') {
      done();
    }
  }, { once: true });
}

// State variables for pagination
const currentPage = ref(1)
const totalItems = ref(0)
const totalPages = ref(1)
const pageSize = ref(10)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Get IDs from query parameters
const boardId = route.query.boardId as string
const mediumId = route.query.mediumId as string
const questionSource = route.query.questionSource as string || 'both'

// Interface for chapter data from URL query
interface ChapterData {
  id: number;
  name: string;
  sequential_chapter_number: number;
}

const chaptersData = route.query.chapters 
  ? JSON.parse(decodeURIComponent(route.query.chapters as string)) as ChapterData[]
  : []

// Display names from query parameters - board name now comes from the user profile
const boardName = computed(() => {
  if (userProfile.value?.schools?.[0]?.board?.name) {
    return encodeURIComponent(userProfile.value.schools[0].board.name)
  }
  return route.query.board as string || 'Not Selected'
})
const mediumName = computed(() => route.query.medium as string || 'Not Selected')
const standardName = computed(() => route.query.standard as string || 'Not Selected')
const subjectName = computed(() => route.query.subject as string || 'Not Selected')

// Fetch user profile to get school ID and board name
const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/auth/profile')
    if (response.data?.data) {
      userProfile.value = response.data.data
      // Proceed to fetch patterns once we have the profile
      await fetchPatterns()
    } else {
      console.error('Unexpected API response format for user profile:', response.data)
      showErrorToast('Failed to load user profile data')
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    showErrorToast('Failed to load user profile. Please refresh the page and try again.')
  } finally {
    isLoading.value = false
  }
}

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
    isSearching.value = false;
    applyFilters();
  }, 300) as unknown as number;
}

// Clear search function
const clearSearch = () => {
  searchQuery.value = '';
  isSearching.value = false;
  applyFilters();

  // Maintain focus on the search input after clearing
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
}

// Computed property for filtered patterns
const filteredPatterns = computed(() => {
  let result = [...patterns.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(pattern => 
      pattern.pattern_name.toLowerCase().includes(query) ||
      (pattern.description && pattern.description.toLowerCase().includes(query))
    );
  }

  // Apply sorting
  result.sort((a, b) => {
    if (sortOption.value === 'name_asc') {
      return a.pattern_name.localeCompare(b.pattern_name);
    } else if (sortOption.value === 'name_desc') {
      return b.pattern_name.localeCompare(a.pattern_name);
    }
    return 0;
  });

  return result;
});

// Computed property for paginated patterns
const paginatedPatterns = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredPatterns.value.slice(start, end);
});

// Function to apply filters
const applyFilters = () => {
  // Update total items and pages based on filtered results
  totalItems.value = filteredPatterns.value.length
  totalPages.value = Math.ceil(totalItems.value / pageSize.value)
  
  // Reset to first page when filters change
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = 1
  }
}

// Fetch patterns on component mount
onMounted(async () => {
  // Fetch the user profile, which will then trigger fetching patterns
  await fetchUserProfile()
})

// Function to fetch patterns
const fetchPatterns = async () => {
  try {
    isLoading.value = true
    
    // Extract chapter IDs from chapters data
    const chapterIds = chaptersData.map((chapter: ChapterData) => chapter.id)
    
    // Get medium IDs from the query parameter
    const mediumIds = mediumId.split(',').map(Number)
    
    // Build query parameters
    const params = {
      mediumIds,
      chapterIds,
      questionOrigin: questionSource,
      marks: Number.parseInt(totalMarksFromPrevious)
    }
    
    console.log('Fetching patterns with params:', params)
    
    // Use the mcq-pattern-filter endpoint
    const response = await axiosInstance.get('/mcq-pattern-filter', { params })
    
    if (response.data) {
      // Process the response data
      if (response.data.validPatterns) {
        // Initialize the isExpanded property for each pattern
        patterns.value = response.data.validPatterns.map((pattern: Pattern) => ({
          ...pattern,
          isExpanded: false
        }))
        
        // Set total items and pages
        totalItems.value = response.data.totalPatterns || patterns.value.length
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
        
        // Log invalid patterns if any
        if (response.data.invalidPatterns && response.data.invalidPatterns.length > 0) {
          console.log('Invalid patterns:', response.data.invalidPatterns)
        }
      } else {
        patterns.value = []
      }
    } else {
      // Fallback in case of unexpected response format
      patterns.value = []
      console.error('Unexpected API response format:', response.data)
    }
    
    // Filter and sort the results client-side
    applyFilters()
  } catch (error) {
    console.error('Error fetching patterns:', error)
    showErrorToast('Failed to load patterns')
    patterns.value = []
  } finally {
    isLoading.value = false
  }
}

// Function to select a pattern
const selectTestPattern = (pattern: Pattern) => {
  try {
    // Get the board name from user profile
    const boardNameToPass = userProfile.value?.schools?.[0]?.board?.name 
      ? encodeURIComponent(userProfile.value.schools[0].board.name)
      : boardName.value;
    
    // Preserve the form state in localStorage before navigating
    const existingFormState = localStorage.getItem('testPaperDashboardStateAssign')
    if (existingFormState) {
      // We don't modify the form state here, just ensuring it persists
      // through the navigation to the detail page
    }
      
    // Navigate to the next step with the selected pattern
    router.push({ 
      name: 'createTestPaperDetailAssign', 
      query: {
        ...route.query,
        patternId: pattern.id.toString(),
        patternName: pattern.pattern_name,
        board: boardNameToPass,
        boardId: userProfile.value?.schools?.[0]?.board?.id?.toString() ?? boardId
      }
    })
    
    showSuccessToast(`Selected pattern: ${pattern.pattern_name}`)
  } catch (error) {
    showErrorToast('Failed to select pattern')
    console.error('Error selecting pattern:', error)
  }
}

// Go back to previous page
const goBack = () => {
  router.back()
}

// Toast notification functions
const showSuccessToast = (message: string): void => {
  toastTitle.value = 'Success'
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
}

const showErrorToast = (message: string): void => {
  toastTitle.value = 'Error'
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
}

const closeToast = (): void => {
  showToast.value = false
}

// Add watcher to maintain focus after search completes
watch(isSearching, (newVal) => {
  // If we were searching and now we're done, restore focus to search input
  if (!newVal && searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

// Used in the template for UI rendering
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isAnyFilterApplied = computed(() => {
  return searchQuery.value.trim() !== '' || sortOption.value !== 'name_asc';
});

// Used in the template for UI actions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const clearAllFilters = () => {
  searchQuery.value = '';
  sortOption.value = 'name_asc';
  isSearching.value = false;
  
  // Apply filters
  applyFilters();
  
  // Focus on the search input after clearing
  if (searchInputRef.value) {
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 0);
  }
};

// Used in the template for UI display
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateTotalQuestions = (pattern: Pattern): number => {
  return pattern.sections.reduce((total, section) => total + section.total_questions, 0);
}

// Helper functions for pattern summary display
const getTotalQuestions = (pattern: Pattern): number => {
  return pattern.sections.reduce((total, section) => total + section.total_questions, 0);
}

const getMandatoryQuestions = (pattern: Pattern): number => {
  return pattern.sections.reduce((total, section) => total + section.mandotory_questions, 0);
}

const getMarksPerQuestion = (pattern: Pattern): string => {
  // Get unique marks per question values from all sections
  const marksPerQuestionSet = new Set(pattern.sections.map(section => section.marks_per_question));
  const uniqueMarks = Array.from(marksPerQuestionSet);
  
  if (uniqueMarks.length === 1) {
    return uniqueMarks[0].toString();
  } else {
    // If different sections have different marks per question, show range
    const min = Math.min(...uniqueMarks);
    const max = Math.max(...uniqueMarks);
    return `${min}-${max}`;
  }
}

// Function to toggle pattern details
const togglePatternDetails = (pattern: Pattern) => {
  pattern.isExpanded = !pattern.isExpanded;
}

// Function to change page
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  // Client-side pagination, no need to fetch patterns again
}

// Computed property to determine which page numbers to show
const visiblePageNumbers = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are few pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    // Calculate start and end of visible pages
    let startPage = Math.max(2, currentPage.value - 1);
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1);

    // Adjust if we're near the beginning
    if (currentPage.value <= 3) {
      endPage = Math.min(totalPages.value - 1, 4);
    }

    // Adjust if we're near the end
    if (currentPage.value >= totalPages.value - 2) {
      startPage = Math.max(2, totalPages.value - 3);
    }

    // Add ellipsis if needed before visible pages
    if (startPage > 2) {
      pages.push('...');
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed after visible pages
    if (endPage < totalPages.value - 1) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages.value);
  }

  return pages;
});
</script>

<style scoped>
/* Card styling */
.filter-card {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.filter-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Pattern card styling */
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

.pattern-card .card-body {
  padding: 1.5rem;
}

.pattern-card .card-title {
  color: #212529;
  line-height: 1.4;
  font-size: 1.2rem;
}

/* Total marks badge styling */
.marks-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
}

.pattern-card .details-btn {
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.pattern-card .details-btn:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.pattern-card .select-btn {
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: #212529;
}

.pattern-card .select-btn:hover {
  background-color: #343a40;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.badge {
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

/* Header styling */
.text-muted {
  color: #6c757d !important;
}

h4 {
  font-weight: 600;
  color: #212529;
}

h6 {
  font-weight: 600;
}

/* Button styling */
.btn-close {
  transition: all 0.2s ease;
}

.btn-close:hover {
  transform: rotate(90deg);
}

/* Modern search styling */
.search-field {
  position: relative;
  z-index: 10;
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

/* Sort dropdown styling */
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

/* Clear button styling */
.clear-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 1rem;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

/* Filter section styling */
#filter {
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
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

/* Alert styling */
.alert {
  border-radius: 8px;
  display: flex;
  align-items: center;
}

/* Responsive styling */
@media (max-width: 768px) {
  h4 {
    font-size: 1.4rem;
  }
  
  .fs-5 {
    font-size: 1rem !important;
  }
  
  .search-input,
  .sort-select,
  .filter-btn,
  .clear-btn {
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
  
  .filter-field,
  .clear-field {
    flex: 0 0 auto;
  }
  
  .pattern-card .card-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .pattern-card .badge {
    margin-top: 0.5rem;
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
  
  .pattern-card .card-body {
    padding: 1rem;
  }
  
  .filter-card .card-body {
    padding: 1rem;
  }
}

/* Section table styling */
.section-preview {
  margin-top: 1rem;
  overflow-y: visible; /* Allow vertical content to be fully visible */
  overflow-x: hidden; /* Hide horizontal scrollbar always */
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
  overflow-x: hidden; /* Hide horizontal scrollbar by default */
  transition: all 0.3s ease;
}

/* Only show scrollbar when actually hovering over the table */
.table-responsive:hover {
  overflow-x: auto; /* Show scrollbar only on hover if needed */
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

/* Replace percentage-based columns with fixed width for marks - now responsive */
.marks-column {
  width: 80px; /* Default width for md and larger screens */
  text-align: center;
}

/* Question column takes remaining space */
.question-column {
  width: auto; /* Explicitly set to auto to fill remaining space */
}

@media (max-width: 767.98px) {
  .marks-column {
    width: 65px; /* Smaller width for sm screens */
  }
}

/* Make the marks cell more compact and consistent */
.marks-cell {
  padding: 0.35rem;
  text-align: center;
  white-space: nowrap;
}

/* TABLE HEADER STYLES - Added for better table headers*/
.section-preview thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
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

/* Add alternating row colors */
.section-preview tbody tr:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.01);
}

.section-preview tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Optional text styling - increase the contrast with question text */
.optional-info {
  background-color: rgba(0,0,0,0.03);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
  color: #6c757d;
  font-size: 0.75rem;
}
.optional-info-marks-heading {
  background-color: rgba(0,0,0,0.1);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
  color: #6c757d;
  
}
/* Row animations - make faster for quicker opening */
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

/* Button animation when expanded */
.pattern-card .details-btn:has(i.bi-chevron-up) {
  background-color: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Pagination styling */
.pagination .page-item.active .page-link {
  background-color: #212529 !important;
  border-color: #212529 !important;
  color: white !important;
}

.pagination .page-link {
  color: #212529;
  font-size: 0.85rem;
}

.pagination .page-link:focus {
  box-shadow: none;
  outline: none;
}

.pagination {
  margin-bottom: 0;
}

/* Animation styles for section details */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.17, 0.85, 0.44, 1);
  transform-origin: center top;
  overflow-x: hidden !important; /* Force no horizontal scrollbar during animation */
}

.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.3, 0, 0.2, 1);
  transform-origin: center bottom;
  overflow-x: hidden !important; /* Force no horizontal scrollbar during animation */
}

.slide-fade-enter-from {
  opacity: 0;
  max-height: 0;
  margin-top: 0 !important;
  transform: scaleY(0.8);
  overflow: hidden;
}

.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0 !important;
  transform: scaleY(0);
  overflow: hidden;
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

/* Ensure consistent spacing in the layout */
.row.g-2 {
  margin-bottom: 0;
}

/* Ensure search icons stay visible */
.search-icon, .clear-search-icon, .search-loading-icon {
  z-index: 101; /* Higher than the input focus z-index */
}

/* Ensure the search wrapper maintains its position - merged with existing .search-field */

/* Pattern summary styling */
.pattern-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.summary-item {
  padding: 0.5rem;
}

.summary-number {
  font-size: 1.25rem;
  line-height: 1.2;
  color: #212529;
  font-weight: 600;
}

.summary-label {
  font-weight: 500;
  margin-top: 0.25rem;
  line-height: 1.1;
  color: #6c757d;
}

/* Responsive summary styling */
@media (max-width: 576px) {
  .pattern-summary {
    padding: 0.75rem;
  }
  
  .summary-number {
    font-size: 1.1rem;
  }
  
  .summary-label {
    font-size: 0.8rem;
  }
}
</style> 