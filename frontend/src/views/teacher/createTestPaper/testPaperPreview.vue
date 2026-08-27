<template>
  <div class="preview-container">
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
        <!-- Header with title and action button - using BoardDashboard pattern -->
        <div class="row mb-3">
                <div class="row justify-content-end">
                <button type="button" class="btn btn-close ms-2 align-self-center d-none d-sm-inline-block" aria-label="Close" @click="goBack"></button>
                </div>

          <div class="row justify-content-center align-items-center g-2 mb-4">
            <div class="col-12 col-sm-4">
              <!-- Mobile view title with medium button after -->
              <div class="d-flex align-items-center d-sm-none mb-2">
                <h5 class="text-start m-0 fw-bolder me-2 mobile-title">TEST PAPER PREVIEW</h5>
                <button 
                  class="btn btn-custom medium-button-mobile"
                  @click="toggleMediumDropdown"
                  ref="mediumButtonMobileRef"
                >
                  <i class="bi bi-translate"></i> {{ currentMediumName }}
                </button>
              </div>
              
              <!-- Desktop view title only -->
              <h5 class="text-start m-0 fw-bolder d-none d-sm-block">TEST PAPER PREVIEW</h5>
              
              <!-- Mobile view other action buttons -->
              <div class="d-sm-none mt-2">
                <div class="row g-2">
                  <div class="col-6">
                    <button 
                      class="btn btn-custom w-100 d-flex justify-content-center align-items-center"
                      id="changeAllButtonMobile" 
                      @click="changeAllQuestions"
                      :disabled="isChangingAllQuestions"
                      :title="isChangingAllQuestions ? 'Changing...' : 'New Set'"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                    >
                      <span v-if="isChangingAllQuestions" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <i v-else class="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                  <div class="col-6">
                    <button 
                      class="btn btn-custom w-100 d-flex justify-content-center align-items-center"
                      id="shuffleButtonMobile" 
                      @click="shuffleQuestions"
                      :disabled="isShuffling"
                      :title="isShuffling ? 'Shuffling...' : 'Shuffle'"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                    >
                      <span v-if="isShuffling" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <i v-else class="bi bi-shuffle"></i>
                    </button>
                  </div>
                  <div class="col-12">
                    <button 
                      class="btn btn-custom w-100 d-flex justify-content-center align-items-center"
                      id="changeAllLayoutButtonMobile" 
                      @click="(event) => showGlobalLayoutOptions(event)"
                    >
                      <i class="bi bi-grid me-1"></i> <span>Option Style</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Medium dropdown for mobile -->
             
            </div>
            <div class="col-12 col-sm-8 dynamic-style text-end">
              <div class="d-flex flex-wrap justify-content-end align-items-center gap-2">
                <!-- All buttons in one container for desktop/tablet screens -->
                <div class="d-none d-sm-flex align-items-center gap-2">
                  <button 
                    class="btn btn-custom dropdown-toggle"
                    @click="toggleMediumDropdown"
                  >
                    <i class="bi bi-translate me-1"></i> {{ currentMediumName }}
                  </button>
                  <button 
                    class="btn btn-custom" 
                    @click="changeAllQuestions"
                    :disabled="isChangingAllQuestions"
                    :title="isChangingAllQuestions ? 'Changing...' : 'New Set'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                  >
                    <span v-if="isChangingAllQuestions" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-arrow-clockwise"></i>
                  </button>
                  <button 
                    class="btn btn-custom" 
                    @click="shuffleQuestions"
                    :disabled="isShuffling"
                    :title="isShuffling ? 'Shuffling...' : 'Shuffle'"
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                  >
                    <span v-if="isShuffling" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-shuffle"></i>
                  </button>
                  <button 
                    class="btn btn-custom" 
                    @click="(event) => showGlobalLayoutOptions(event)"
                  >
                    <i class="bi bi-grid me-1"></i> Option Style
                  </button>
                  <button 
                    class="btn btn-dark" 
                    @click="savePage"
                  >
                    <i class="bi bi-save me-1"></i> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr class="mt-2" />
        </div>

        <!-- New View Mode Toggle for Mobile -->
        <div class="row mb-3 d-md-none">
          <div class="col-12 d-flex justify-content-center">
            <div class="view-mode-toggle-container">
              <div class="view-mode-selector">
                <button 
                  :class="['view-mode-btn', mobileViewMode ? 'active' : '']" 
                  @click="mobileViewMode = true"
                >
                  <i class="bi bi-phone me-1"></i> Mobile View
                </button>
                <button 
                  :class="['view-mode-btn', !mobileViewMode ? 'active' : '']" 
                  @click="mobileViewMode = false"
                >
                  <i class="bi bi-file-earmark-text me-1"></i> A4 Preview
                </button>
              </div>
              <!-- Zoom slider for A4 view on mobile -->
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

        <!-- A4 Paper Wrapper -->
        <div class="a4-paper-container" :class="{'mobile-view': mobileViewMode}">
          <div class="a4-paper-card" :style="a4PaperStyle">
            <div class="text-center document-header">
              <h5 class="school-name">{{ schoolName }}</h5>
              <!-- Editable Test Paper Title -->
              <div class="editable-title">
                <h3 v-if="!isEditingTitle" class="paper-title">
                  {{ paperTitle }}
                  <button class="edit-icon" @click="startEditingTitle" title="Edit title">
                    <i class="bi bi-pencil"></i>
                  </button>
                </h3>
                <div v-else class="edit-title-form">
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="paperTitle" 
                    ref="titleInput"
                    placeholder="Enter test paper title"
                    @keyup.enter="stopEditingTitle"
                  >
                  <div class="d-flex mt-2">
                    <button class="btn btn-sm btn-outline-secondary me-2" @click="cancelEditingTitle">Cancel</button>
                    <button class="btn btn-sm btn-primary" @click="stopEditingTitle">Save</button>
                  </div>
                </div>
              </div>
              <p style="margin-bottom: 5px;"><strong>Standard:</strong> {{ standardName }} | <strong>Subject:</strong> {{ subjectName }}</p>
              <p style="margin-top: 5px;">
                <strong>Time:</strong> 
                <span v-if="!isEditingTime" class="editable-field">
                  {{ testDuration }}
                  <button class="edit-icon" @click="startEditingTime" title="Edit time duration">
                    <i class="bi bi-pencil"></i>
                  </button>
                </span>
                <span v-else class="edit-time-form">
                  <div class="d-inline-flex align-items-center time-inputs-container">
                    <div class="d-flex align-items-center me-2">
                      <input 
                        type="number" 
                        class="form-control form-control-sm me-1" 
                        v-model="hours"
                        min="0"
                        max="12"
                        ref="hoursInput"
                        style="width: 60px;"
                      > 
                      <span>Hour(s)</span>
                    </div>
                    <div class="d-flex align-items-center me-2">
                      <input 
                        type="number" 
                        class="form-control form-control-sm me-1" 
                        v-model="minutes"
                        min="0"
                        max="59"
                        style="width: 60px;"
                      >
                      <span>Min(s)</span>
                    </div>
                    <div class="time-edit-buttons">
                      <button class="btn btn-sm btn-outline-secondary me-1" @click="cancelEditingTime">
                        <i class="bi bi-x"></i>
                      </button>
                      <button class="btn btn-sm btn-primary" @click="stopEditingTime">
                        <i class="bi bi-check"></i>
                      </button>
                    </div>
                  </div>
                </span>
                | <strong>Total Marks:</strong> {{ totalMarks }}
              </p>
              
              <!-- Exam Instructions Section -->
              <div class="exam-instructions-container mt-4">
                <div class="d-flex align-items-center justify-content-center mb-2">
                  <h5 class="m-0 me-2">Exam Instructions</h5>
                  <button class="edit-icon" @click="startEditingInstructions" title="Edit instructions">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
                
                <!-- Instructions Display View -->
                <div v-if="!isEditingInstructions" class="instructions-display">
                  <ul class="text-start instruction-list" v-if="examInstructions.length > 0">
                    <li v-for="(instruction, index) in examInstructions" :key="index">
                      {{ instruction }}
                    </li>
                  </ul>
                  <p v-else class="text-muted fst-italic">Click the pencil icon to add exam instructions</p>
                </div>
                
                <!-- Instructions Edit View -->
                <div v-else class="instructions-edit-form">
                  <div class="form-group">
                    <textarea 
                      class="form-control instruction-textarea" 
                      v-model="instructionsText"
                      placeholder="Enter instructions (press Enter for new line)"
                      ref="instructionsTextarea"
                    ></textarea>
                    <div class="text-muted small mt-1">Press Enter for a new line. Each line will appear as a bullet point.</div>
                  </div>
                  <div class="d-flex justify-content-center mt-2">
                    <button class="btn btn-sm btn-outline-secondary me-2" @click="cancelEditingInstructions">Cancel</button>
                    <button class="btn btn-sm btn-primary" @click="saveInstructions">Save</button>
                  </div>
                </div>
              </div>
            </div>
            <hr>

            <!-- Questions Section - MS Office A4 style layout -->
            <div class="a4-paper-section mb-4" 
              v-for="(section, sectionIndex) in testPaperSections" 
              :key="sectionIndex"
              :class="{ 'refreshing': isChangingAllQuestions }"
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
                          <span v-if="question.questionType" class="question-type-badge">
                            {{ question.questionType }}
                          </span>
                            <button v-if="question.options && question.options.length > 0" 
                                    class="edit-icon ms-2" 
                                    @click="(event) => showLayoutOptions(sectionIndex, questionIndex, event)" 
                                    title="Change options layout"
                                    style="vertical-align: middle; margin-top: -2px;">
                              <i class="bi bi-grid"></i>
                            </button>
                          </div>
                          
                          <!-- MCQ Options -->
                          <div v-if="question.options && question.options.length > 0" class="options-container">
                          <!-- Layout selector popup -->
                          <div v-if="activeLayoutSelector.sectionIndex === sectionIndex && activeLayoutSelector.questionIndex === questionIndex" 
                              class="layout-selector"
                              ref="layoutSelectorRef"
                              @click.stop>
                            <div class="layout-options">
                              <div class="layout-option-title">Select Options Layout</div>
                              <div class="layout-cards">
                                <div class="layout-option">
                                  <div 
                                    class="layout-card" 
                                    :class="{ 'active': getOptionLayout(sectionIndex, questionIndex) === 'row' }"
                                    @click="setOptionLayout(sectionIndex, questionIndex, 'row')"
                                  >
                                    <div class="layout-preview row-layout">
                                      <div>A</div><div>B</div><div>C</div><div>D</div>
                                    </div>
                                  </div>
                                  <div class="layout-label">Single Row</div>
                                </div>
                                
                                <div class="layout-option">
                                  <div 
                                    class="layout-card" 
                                    :class="{ 'active': getOptionLayout(sectionIndex, questionIndex) === 'grid' }"
                                    @click="setOptionLayout(sectionIndex, questionIndex, 'grid')"
                                  >
                                    <div class="layout-preview grid-layout">
                                      <div>A</div><div>B</div>
                                      <div>C</div><div>D</div>
                                    </div>
                                  </div>
                                  <div class="layout-label">2x2 Grid</div>
                                </div>
                                
                                <div class="layout-option">
                                  <div 
                                    class="layout-card" 
                                    :class="{ 'active': getOptionLayout(sectionIndex, questionIndex) === 'column' }"
                                    @click="setOptionLayout(sectionIndex, questionIndex, 'column')"
                                  >
                                    <div class="layout-preview column-layout">
                                      <div>A</div>
                                      <div>B</div>
                                      <div>C</div>
                                      <div>D</div>
                                    </div>
                                  </div>
                                  <div class="layout-label">Single Column</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
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
                      
                      <!-- Marks and Change Button -->
                      <div class="question-marks">
                        <div class="marks-row">
                          <span class="marks fw-bold me-2">{{ question.marks }}</span>
                            <button class="btn btn-sm btn-custom shuffle-button" @click="changeQuestion(sectionIndex, questionIndex)">
                            <span class="d-inline-flex align-items-center">
                                <i class="bi bi-arrow-clockwise me-md-1"></i><span class="d-none d-sm-inline">Change</span>
                            </span>
                          </button>
                          </div>
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

      <!-- Back to top button -->
      <div id="backToTop" class="d-flex" @click="scrollToTop" style="display: none !important;">
        <i class="bi bi-arrow-up"></i>
      </div>
      
      <!-- Fixed back button for mobile only -->
      <div class="d-block d-sm-none mobile-back-button" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </div>
      
      <!-- Fixed bottom bar with action buttons for mobile -->
      <div class="d-sm-none mobile-action-buttons">
        <div class="d-flex justify-content-between align-items-center w-100">
          <button class="btn btn-dark flex-grow-1" @click="savePage">
            <i class="bi bi-save me-1"></i> Save
          </button>
        </div>  
      </div>
      
      <!-- Global Layout Selector -->
      <div v-if="globalLayoutSelectorVisible" 
           class="global-layout-selector"
           ref="globalLayoutSelectorRef"
           @click.stop>
        <div class="layout-options">
          <div class="layout-option-title">Select Layout for All MCQ Options</div>
          <div class="layout-cards">
            <div class="layout-option">
              <div 
                class="layout-card" 
                :class="{ 'active': globalSelectedLayout === 'row' }"
                @click="applyGlobalLayout('row')"
              >
                <div class="layout-preview row-layout">
                  <div>A</div><div>B</div><div>C</div><div>D</div>
                </div>
              </div>
              <div class="layout-label">Single Row</div>
            </div>
            
            <div class="layout-option">
              <div 
                class="layout-card" 
                :class="{ 'active': globalSelectedLayout === 'grid' }"
                @click="applyGlobalLayout('grid')"
              >
                <div class="layout-preview grid-layout">
                  <div>A</div><div>B</div>
                  <div>C</div><div>D</div>
                </div>
              </div>
              <div class="layout-label">2x2 Grid</div>
            </div>
            
            <div class="layout-option">
              <div 
                class="layout-card" 
                :class="{ 'active': globalSelectedLayout === 'column' }"
                @click="applyGlobalLayout('column')"
              >
                <div class="layout-preview column-layout">
                  <div>A</div>
                  <div>B</div>
                  <div>C</div>
                  <div>D</div>
                </div>
              </div>
              <div class="layout-label">Single Column</div>
            </div>
          </div>
          <div class="text-center mt-3">
            <button class="btn btn-sm btn-outline-secondary" @click="hideGlobalLayoutOptions">
              Cancel
            </button>
          </div>
        </div>  
      </div>
      
      <!-- Medium Dropdown (single instance for both mobile and desktop) -->
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
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'

// Define component name (for linter)
defineOptions({
  name: 'TestPaperPreview'
})

// Setup router and route
const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

// Loading state
const isLoading = ref(true)

// For options layout management
const DEFAULT_OPTION_LAYOUT = 'grid' // Explicitly define default layout as grid
const optionsLayouts = ref<{[key: string]: string}>({})
const activeLayoutSelector = ref({
  sectionIndex: -1,
  questionIndex: -1
})

// Get option layout for a specific question
const getOptionLayout = (sectionIndex: number, questionIndex: number) => {
  const key = `${sectionIndex}-${questionIndex}`
  return optionsLayouts.value[key] || DEFAULT_OPTION_LAYOUT // Default to grid layout
}

// Set option layout for a specific question
const setOptionLayout = (sectionIndex: number, questionIndex: number, layout: string) => {
  const key = `${sectionIndex}-${questionIndex}`
  optionsLayouts.value[key] = layout
  
  // Save the updated layouts to localStorage
  saveOptionLayoutsToLocalStorage()
  
  // Auto-close the layout selector after making a selection
  hideLayoutOptions()
}

// Save option layouts to localStorage
const saveOptionLayoutsToLocalStorage = () => {
  try {
    localStorage.setItem('optionsLayouts', JSON.stringify(optionsLayouts.value))
    console.log('Saved option layouts to localStorage')
  } catch (error) {
    console.error('Error saving option layouts to localStorage:', error)
  }
}

// Load option layouts from localStorage
const loadOptionLayoutsFromLocalStorage = () => {
  try {
    const savedLayouts = localStorage.getItem('optionsLayouts')
    if (savedLayouts) {
      optionsLayouts.value = JSON.parse(savedLayouts)
      console.log('Loaded option layouts from localStorage')
    }
  } catch (error) {
    console.error('Error loading option layouts from localStorage:', error)
  }
}

// Show layout options for a specific question
const showLayoutOptions = (sectionIndex: number, questionIndex: number, event: Event) => {
  // Prevent event from bubbling up to document, which would immediately close the popup
  event.stopPropagation()
  
  // Set the active layout selector
  activeLayoutSelector.value = { sectionIndex, questionIndex }
  
  // Add click outside event listener after the DOM updates
  nextTick(() => {
    // Get the clicked element (pencil icon)
    const clickedIcon = event.target as HTMLElement;
    const iconButton = clickedIcon.closest('.edit-icon') as HTMLElement;
    
    // Get the layout selector element
    const layoutSelector = document.querySelector('.layout-selector') as HTMLElement;
    
    // If both elements exist, position the layout selector relative to the icon
    if (iconButton && layoutSelector) {
      const iconRect = iconButton.getBoundingClientRect();
      
      // Position the layout selector below the icon
      layoutSelector.style.position = 'fixed';
      layoutSelector.style.top = `${iconRect.bottom + 5}px`;
      layoutSelector.style.left = `${iconRect.left - layoutSelector.offsetWidth / 2 + iconRect.width / 2}px`;
      
      // Make sure it doesn't go off-screen on the right
      const rightEdge = layoutSelector.getBoundingClientRect().right;
      const windowWidth = globalThis.innerWidth;
      if (rightEdge > windowWidth - 10) {
        layoutSelector.style.left = `${windowWidth - layoutSelector.offsetWidth - 10}px`;
      }
      
      // Make sure it doesn't go off-screen on the left
      if (Number.parseFloat(layoutSelector.style.left) < 10) {
        layoutSelector.style.left = '10px';
      }
    }
    
    document.addEventListener('click', handleClickOutside)
  })
}

// Handle click outside of layout selector
const handleClickOutside = (event: MouseEvent) => {
  const layoutSelector = document.querySelector('.layout-selector')
  
  // Check if click target is an edit icon or inside an edit icon
  const clickedElement = event.target as HTMLElement
  const isEditIcon = clickedElement.closest('.edit-icon') !== null
  
  // Don't close the popup if clicking on the edit icon
  if (isEditIcon) {
    return
  }
  
  if (layoutSelector && !layoutSelector.contains(event.target as Node)) {
    hideLayoutOptions()
  }
}

// Hide layout options
const hideLayoutOptions = () => {
  activeLayoutSelector.value = { sectionIndex: -1, questionIndex: -1 }
  
  // Reset any inline styles on the layout selector
  const layoutSelector = document.querySelector('.layout-selector') as HTMLElement;
  if (layoutSelector) {
    layoutSelector.style.position = '';
    layoutSelector.style.top = '';
    layoutSelector.style.left = '';
  }
  
  // Remove the click outside event listener
  document.removeEventListener('click', handleClickOutside)
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

// Time duration values
const isEditingTime = ref(false)
const hours = ref(1)
const minutes = ref(0)
const testDuration = computed(() => {
  const hourText = hours.value === 1 ? 'Hour' : 'Hours'
  const minuteText = minutes.value > 0 ? ` ${minutes.value} Minutes` : ''
  return `${hours.value} ${hourText}${minuteText}`
})
const originalHours = ref(1)
const originalMinutes = ref(0)

// Function to start editing time
const startEditingTime = () => {
  originalHours.value = hours.value
  originalMinutes.value = minutes.value
  isEditingTime.value = true
  
  // Focus the hours input field after the DOM updates
  nextTick(() => {
    const hoursInputEl = document.querySelector('.edit-time-form input:first-child') as HTMLInputElement
    if (hoursInputEl) {
      hoursInputEl.focus()
    }
  })
}

// Function to stop editing and save time
const stopEditingTime = () => {
  isEditingTime.value = false
  // Could save to API here if needed
}

// Function to cancel editing and revert to original time
const cancelEditingTime = () => {
  hours.value = originalHours.value
  minutes.value = originalMinutes.value
  isEditingTime.value = false
}

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

// Get details from query parameters
const patternId = computed(() => route.query.patternId as string || '1')
const standardName = computed(() => safeDecodeURIComponent(route.query.standard as string))
const subjectName = computed(() => safeDecodeURIComponent(route.query.subject as string))
const patternName = computed(() => safeDecodeURIComponent(route.query.patternName as string || 'Mid Term Paper'))
const totalMarks = computed(() => route.query.totalMarks as string || '40')

// Editable title functionality
const defaultTitle = computed(() => `${patternName.value} - ${totalMarks.value} Marks`)
const paperTitle = ref('')
const isEditingTitle = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)
const originalTitle = ref('')

// Function to start editing title
const startEditingTitle = () => {
  originalTitle.value = paperTitle.value // Save original for cancel operation
  isEditingTitle.value = true
  
  // Focus the input field after the DOM updates
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus()
    }
  })
}

// Function to stop editing and save title
const stopEditingTitle = () => {
  isEditingTitle.value = false
  // Could save to API here if needed
}

// Function to cancel editing and revert to original title
const cancelEditingTitle = () => {
  paperTitle.value = originalTitle.value
  isEditingTitle.value = false
}

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

// API Data interfaces
interface ImageData {
  id?: number;
  url?: string;
  alt?: string;
}

interface McqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  image_id: number | null;
  is_correct: boolean;
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

interface QuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  image: ImageData | null;
  mcq_options: McqOption[];
  match_pairs: MatchPair[];
  topic?: {
    id: number;
    name: string;
    chapter_id: number;
  };
  question_text_topics?: {
    id: number;
    question_text_id: number;
    question_topic_id: number;
    instruction_medium_id: number;
  }[];
}

interface Question {
  id: number;
  question_type_id: number;
  board_question: boolean;
  question_type: {
    id: number;
    type_name: string;
  };
  question_texts: QuestionText[];
}

interface ChapterAllocation {
  chapterId: number;
  chapterName: string;
  question?: Question;
}

interface SubsectionAllocation {
  subsectionQuestionTypeId: number;
  section_id?: number;
  questionTypeName: string;
  sequentialNumber?: number;
  question_type_id?: number;
  question_type?: {
    id: number;
    type_name: string;
  };
  allocatedChapters: ChapterAllocation[];
}

interface SectionAllocation {
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
  subsectionAllocations: SubsectionAllocation[];
}

interface ChapterMark {
  chapterId: number;
  chapterName: string;
  absoluteMarks: number;
}

// Add interface for ApiResponse
interface ApiResponse {
  patternId: number;
  patternName?: string;
  totalMarks: number;
  absoluteMarks: number;
  sectionAllocations: SectionAllocation[];
  chapterMarks: ChapterMark[];
  mediums?: ApiMedium[];
  questionOrigin?: string;
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
  originalQuestion: Question;
  topicId?: number; // Add topic ID for future reference
  chapterId?: number; // Add chapter ID to maintain it across replacements
}

interface DisplaySection {
  sectionNumber: number;
  sectionName: string;
  totalMarks: number;
  questions: DisplayQuestion[];
  subSection?: string;
  sectionNumberDisplay?: string; // Added field for formatted section number display
  mandotory_questions?: number; // Added to support the mandotory_questions field in template
}

// Test paper sections after API transformation
const testPaperSections = ref<DisplaySection[]>([])

// Global layout selector state
const globalLayoutSelectorVisible = ref(false)
const globalLayoutSelectorRef = ref<HTMLElement | null>(null)
const globalSelectedLayout = ref(DEFAULT_OPTION_LAYOUT)

// Add state to track data from both endpoints and which was last used
const allocationData = ref<ApiResponse | null>(null)
const distributeData = ref<ApiResponse | null>(null)
const lastUsedEndpoint = ref<'allocation' | 'distribute' | null>(null)
// Store raw API data for debugging
const apiData = ref<ApiResponse | null>(null)

// Helper function to get the latest test paper data
const getLatestData = (): ApiResponse | null => {
  // First check if we have already loaded data in apiData
  if (apiData.value) {
    return apiData.value;
  }
  
  // If not, try to get data from localStorage
  try {
    const storedData = loadStoredData();
    return storedData;
  } catch (error) {
    console.error('Error getting latest test paper data:', error);
    return null;
  }
}

// Load data from localStorage based on lastUsedEndpoint
const loadStoredData = () => {
  try {
    // First check if we have finalQuestionsDistribution data from the final API call
    const finalDistributionData = localStorage.getItem('finalQuestionsDistribution');
    if (finalDistributionData && route.query.hasFinalDistribution === 'true') {
      try {
        const parsedData = JSON.parse(finalDistributionData);
        console.log('Loaded final questions distribution data from localStorage');
        apiData.value = parsedData;
        return parsedData;
      } catch (e) {
        console.error('Error parsing final questions distribution data:', e);
      }
    }
    
    // If no final distribution data, check lastUsedEndpoint
    const endpointFromRoute = route.query.lastUsedEndpoint as string;
    if (endpointFromRoute) {
      lastUsedEndpoint.value = endpointFromRoute as 'allocation' | 'distribute';
    } else {
      // If not in route, check localStorage
      const storedEndpoint = localStorage.getItem('lastUsedEndpoint');
      if (storedEndpoint) {
        lastUsedEndpoint.value = storedEndpoint as 'allocation' | 'distribute';
      }
    }
    
    // Load allocation data if it exists
    const storedAllocationData = localStorage.getItem('allocationData');
    if (storedAllocationData) {
      try {
        allocationData.value = JSON.parse(storedAllocationData);
        console.log('Loaded allocation data from localStorage');
      } catch (e) {
        console.error('Error parsing allocation data:', e);
      }
    }
    
    // Load distribute data if it exists
    const storedDistributeData = localStorage.getItem('distributeData');
    if (storedDistributeData) {
      try {
        distributeData.value = JSON.parse(storedDistributeData);
        console.log('Loaded distribute data from localStorage');
      } catch (e) {
        console.error('Error parsing distribute data:', e);
      }
    }
    
    console.log('Last used endpoint:', lastUsedEndpoint.value);
    return getLatestData();
  } catch (e) {
    console.error('Error loading stored data:', e);
    return null;
  }
};

// Fetch test paper questions from API
const fetchTestPaperQuestions = async (storedData?: ApiResponse) => {
  try {
    // First check if we already have final questions distribution data
    if (storedData && route.query.hasFinalDistribution === 'true') {
      useStoredDistributionData(storedData);
      return;
    }
    
    // Prepare request data
    const requestData = prepareRequestData(storedData);
    
    // Make API call and process response
    await fetchAndProcessQuestions(requestData);
  } catch (error) {
    console.error('Error fetching test paper questions:', error);
  }
};

// Use stored distribution data directly
const useStoredDistributionData = (data: ApiResponse) => {
  console.log('Using final questions distribution data');
  apiData.value = data;
  transformApiDataToDisplayFormat(data);
};

// Prepare request data from stored data or create fallback
const prepareRequestData = (storedData?: ApiResponse): ApiResponse => {
  if (storedData) {
    console.log('Using data from last used endpoint:', lastUsedEndpoint.value);
    return storedData;
  }
  
  // Get the latest data based on which endpoint was last used
  const latestData = getLatestData();
  
  if (latestData) {
    console.log('Using latest data from endpoint:', lastUsedEndpoint.value);
    return latestData;
  }
  
  // If no data is available, use the mock data as a fallback
  console.log('No data available from previous endpoints, using mock data');
  return createMockData();
};

// Create mock data as fallback
const createMockData = () => {
  return {
    patternId: Number.parseInt(patternId.value),
    patternName: patternName.value,
    totalMarks: Number.parseInt(totalMarks.value),
    absoluteMarks: 59,
    sectionAllocations: [
      {
        sectionId: 1,
        pattern_id: 1,
        sectionName: "Fill in blanks",
        sequentialNumber: 1,
        section_number: 1,
        subSection: "A",
        totalQuestions: 7,
        mandotory_questions: 5,
        marks_per_question: 1,
        absoluteMarks: 7,
        totalMarks: 5,
        subsectionAllocations: [
          {
            subsectionQuestionTypeId: 1,
            section_id: 1,
            questionTypeName: "Fill in the Blanks",
            sequentialNumber: 0,
            question_type_id: 6,
            question_type: {
              id: 6,
              type_name: "Fill in the Blanks"
            },
            allocatedChapters: [
              {
                chapterId: 1,
                chapterName: "Addition"
              },
              {
                chapterId: 3,
                chapterName: "Multiplication"
              }
            ]
          }
        ]
      },
      {
        sectionId: 2,
        pattern_id: 1,
        sectionName: "Answer the following question.",
        sequentialNumber: 2,
        section_number: 1,
        subSection: "B",
        totalQuestions: 7,
        mandotory_questions: 5,
        marks_per_question: 2,
        absoluteMarks: 14,
        totalMarks: 10,
        subsectionAllocations: [
          {
            subsectionQuestionTypeId: 2,
            section_id: 2,
            questionTypeName: "Multiple Choice Question (MCQ)",
            sequentialNumber: 1,
            question_type_id: 1,
            question_type: {
              id: 1,
              type_name: "Multiple Choice Question (MCQ)"
            },
            allocatedChapters: [
              {
                chapterId: 1,
                chapterName: "Addition"
              }
            ]
          }
        ]
      }
    ],
    chapterMarks: [
      {
        chapterId: 1,
        chapterName: "Addition",
        absoluteMarks: 8
      },
      {
        chapterId: 2,
        chapterName: "Subtraction",
        absoluteMarks: 7
      }
    ]
  };
};

// Fetch questions from API and process response
const fetchAndProcessQuestions = async (requestData: ApiResponse) => {
  // Make the API call to get final questions distribution
  const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', requestData);
  
  if (!response.data) {
    console.error('Unexpected API response format:', response);
    return;
  }
  
  // Set API data and log structure
  apiData.value = response.data;
  console.log('API Response Data Structure:', response.data);
  
  // Save the data to localStorage for future use
  localStorage.setItem('finalQuestionsDistribution', JSON.stringify(response.data));
  
  // Log first question structure if available
  logFirstQuestionStructure(response.data);
  
  // Transform API data to display format
  transformApiDataToDisplayFormat(response.data);
  console.log('Successfully fetched test paper questions using data from:', lastUsedEndpoint.value);
};

// Log first question structure for debugging
const logFirstQuestionStructure = (data: ApiResponse) => {
  const sections = data.sectionAllocations;
  if (!sections?.[0]) return;
  
  const firstSection = sections[0];
  if (!firstSection.subsectionAllocations?.[0]) return;
  
  const firstSubsection = firstSection.subsectionAllocations[0];
  if (!firstSubsection.allocatedChapters?.[0]) return;
  
  const firstChapter = firstSubsection.allocatedChapters[0];
  if (!firstChapter.question) return;
  
  const firstQuestion = firstChapter.question;
  if (firstQuestion.question_texts?.[0]) {
    console.log('First question text structure:', firstQuestion.question_texts[0]);
  }
};

// Transform API data to display format
const transformApiDataToDisplayFormat = (data: ApiResponse) => {
  if (!data?.sectionAllocations) {
    console.error('Invalid API data: missing sectionAllocations');
    return;
  }

  // Process the mediums and sections
  processAvailableMediums(data);
  testPaperSections.value = processAllSections(data.sectionAllocations);
};

// Process available mediums from API data
const processAvailableMediums = (data: ApiResponse) => {
  if (!data.mediums || data.mediums.length === 0) {
    console.warn('No mediums available in API response');
    return;
  }
  
  console.log('Mediums from API:', data.mediums);
  availableMediums.value = data.mediums.map((medium: ApiMedium) => ({
    id: medium.id,
    name: medium.instruction_medium
  }));
  
  // If current medium is not in the available list, reset to the first one
  if (!availableMediums.value.some(m => m.id === currentMediumId.value) && availableMediums.value.length > 0) {
    console.log('Current medium not in available list, resetting to:', availableMediums.value[0].name);
    currentMediumId.value = availableMediums.value[0].id;
  }
};

// Process all sections into display sections
const processAllSections = (sectionAllocations: ApiResponse['sectionAllocations']): DisplaySection[] => {
  let sectionNumberCounter = 1;
  const sortedSections = sortSectionsBySequence(sectionAllocations);
  
  return sortedSections.map(section => {
    const displaySection = createDisplaySection(section, sectionNumberCounter);
    
    // If we used a counter-based section number, increment the counter
    if (!section.section_number) {
      sectionNumberCounter++;
    }
    
    // Process subsections and questions for this section
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
        const displayQuestion = processQuestion(chapter, questionNumberCounter, section);
        
        if (displayQuestion) {
          displaySection.questions.push(displayQuestion);
          questionNumberCounter++;
        }
      }
    }
  }
};

// Process a question and return the display question object
const processQuestion = (
  chapter: { chapterId: number; chapterName: string; question?: Question },
  questionNumber: number,
  section: ApiResponse['sectionAllocations'][0]
): DisplayQuestion | null => {
  const question = chapter.question;
  if (!question) return null;
  
  // Find question text for the current medium
  const questionText = findQuestionTextForMedium(question);
  if (!questionText) return null;
  
  // Extract topic ID from questionText
  const topicId = getTopicIdFromQuestionText(questionText);
  
  // Create the display question
  const displayQuestion = createBaseDisplayQuestion(
    questionNumber,
    questionText.question_text,
    section,
    question,
    topicId,
    chapter.chapterId
  );
  
  // Process options and match pairs
  addOptionsToQuestion(displayQuestion, questionText);
  addMatchPairsToQuestion(displayQuestion, questionText);
  
  return displayQuestion;
};

// Find question text for current medium
const findQuestionTextForMedium = (question: Question): QuestionText | undefined => {
  if (!question.question_texts || question.question_texts.length === 0) {
    console.warn('Question has no question_texts array, skipping');
    return undefined;
  }
  
  // First try to find an exact match for the current medium
  const matchingText = question.question_texts.find(text => 
    text.question_text_topics && 
    text.question_text_topics.length > 0 && 
    text.question_text_topics[0].instruction_medium_id === currentMediumId.value
  );
  
  // If no match, use the first question text as a fallback
  if (!matchingText) {
    console.warn(`No question text found for medium ID ${currentMediumId.value}, using first available`);
    return question.question_texts[0];
  }
  
  return matchingText;
};

// Extract topic ID from question text
const getTopicIdFromQuestionText = (questionText: QuestionText): number | undefined => {
  if (questionText.topic) {
    return questionText.topic.id;
  } else if (questionText.question_text_topics && questionText.question_text_topics.length > 0) {
    return questionText.question_text_topics[0].question_topic_id;
  }
  return undefined;
};

// Create base display question with common properties
const createBaseDisplayQuestion = (
  questionNumber: number,
  questionText: string,
  section: ApiResponse['sectionAllocations'][0],
  originalQuestion: Question,
  topicId?: number,
  chapterId?: number
): DisplayQuestion => {
  return {
    questionNumber,
    questionText,
    marks: section.marks_per_question ?? Math.ceil(section.totalMarks / section.totalQuestions),
    questionType: originalQuestion.question_type.type_name,
    originalQuestion,
    topicId,
    chapterId
  };
};

// Add MCQ options to display question if they exist
const addOptionsToQuestion = (displayQuestion: DisplayQuestion, questionText: QuestionText) => {
  if (questionText.mcq_options && questionText.mcq_options.length > 0) {
    displayQuestion.options = questionText.mcq_options.map((option, index) => ({
      label: String.fromCodePoint(65 + index), // A, B, C, D...
      text: option.option_text,
      isCorrect: option.is_correct
    }));
  }
};

// Add match pairs to display question if they exist
const addMatchPairsToQuestion = (displayQuestion: DisplayQuestion, questionText: QuestionText) => {
  if (questionText.match_pairs && questionText.match_pairs.length > 0) {
    displayQuestion.matchPairs = questionText.match_pairs.map(pair => ({
      leftText: pair.left_text || '', // Handle null left_text
      rightText: pair.right_text || '' // Handle null right_text
    }));
  }
};

// Change a single question - calls the API to get a replacement
const changeQuestion = async (sectionIndex: number, questionIndex: number) => {
  try {
    updateButtonToLoadingState(sectionIndex, questionIndex);
    
    const { section, question, originalQuestion } = getQuestionContext(sectionIndex, questionIndex);
    const questionTextId = getQuestionTextId(originalQuestion);
    const mediumIds = getMediumIds();
    const chapterId = await findChapterId(question, originalQuestion);
    const questionTypeId = originalQuestion.question_type_id;
    
    // Get question text IDs to exclude from replacement
    const questionTextIds = collectQuestionTextIds(questionTextId, questionTypeId, chapterId);
    
    // Make API call to get replacement question
    const newQuestion = await fetchReplacementQuestion(questionTextIds, mediumIds, chapterId);
    
    // Process and replace question
    processAndReplaceQuestion(section, questionIndex, question, newQuestion, chapterId);
    
    // Update stored API data
    updateStoredApiDataWithNewQuestion(sectionIndex, questionIndex, newQuestion, chapterId);
    
    console.log('Question successfully changed');
  } catch (error) {
    handleChangeQuestionError(error);
  } finally {
    restoreButtonState(sectionIndex, questionIndex);
  }
};

// Update button to show loading state
const updateButtonToLoadingState = (sectionIndex: number, questionIndex: number) => {
  const button = document.querySelector(`#question-${sectionIndex}-${questionIndex} .shuffle-button`) as HTMLButtonElement;
  if (button) {
    button.innerHTML = `<output class="spinner-border spinner-border-sm me-2" aria-hidden="true"></output>Loading...`;
    button.disabled = true;
  }
};

// Get the context of the question to be changed
const getQuestionContext = (sectionIndex: number, questionIndex: number) => {
  const section = testPaperSections.value[sectionIndex];
  const question = section.questions[questionIndex];
  const originalQuestion = question.originalQuestion;
  
  return { section, question, originalQuestion };
};

// Get the question text ID from the original question
const getQuestionTextId = (originalQuestion: Question) => {
  const questionTextId = originalQuestion.question_texts && 
    originalQuestion.question_texts.length > 0 
      ? originalQuestion.question_texts[0].id 
      : null;
      
  if (!questionTextId) {
    throw new Error('Question text ID not found');
  }
  
  return questionTextId;
};

// Get all available medium IDs
const getMediumIds = () => {
  const mediumIds = availableMediums.value.map(medium => medium.id);
  
  // If no medium IDs available, use the current medium ID as fallback
  if (mediumIds.length === 0) {
    mediumIds.push(currentMediumId.value);
  }
  
  return mediumIds;
};

// Find chapter ID through multiple sources
const findChapterId = async (
  question: DisplayQuestion, 
  originalQuestion: Question
): Promise<number> => {
  let chapterId: number | undefined;
  
  // Try to get from question_topics
  chapterId = getChapterIdFromQuestionTopics(originalQuestion);
  
  // Try to get from question_text_topics
  if (!chapterId) {
    chapterId = getChapterIdFromQuestionTextTopics(originalQuestion);
  }
  
  // Check if stored in display question
  if (!chapterId && question.chapterId) {
    chapterId = question.chapterId;
  }
  
  // Try to find in API data
  if (!chapterId) {
    chapterId = findChapterIdInApiData(originalQuestion);
  }
  
  // Fall back to route params
  if (!chapterId) {
    chapterId = getChapterIdFromRouteParams();
  }
  
  return chapterId;
};

// Try to get chapter ID from question_topics
const getChapterIdFromQuestionTopics = (question: Question): number | undefined => {
  if (question.question_topics && question.question_topics.length > 0) {
    return question.question_topics[0].topic?.chapter?.id;
  }
  return undefined;
};

// Try to get chapter ID from question_text_topics
const getChapterIdFromQuestionTextTopics = (question: Question): number | undefined => {
  return question.question_texts?.[0]?.question_text_topics?.[0]?.question_topic?.topic?.chapter?.id;
};

// Try to find chapter ID in API data
const findChapterIdInApiData = (questionToFind: Question): number | undefined => {
  const apiDataValue = apiData.value;
  if (!apiDataValue?.sectionAllocations) return undefined;
  
  return findChapterIdInSections(apiDataValue.sectionAllocations, questionToFind.id);
};

// Helper function to search through sections for a question
const findChapterIdInSections = (sections: SectionAllocation[], questionId: number): number | undefined => {
  for (const section of sections) {
    const chapterId = findChapterIdInSubsections(section, questionId);
    if (chapterId) return chapterId;
  }
  return undefined;
};

// Helper function to search through subsections of a section
const findChapterIdInSubsections = (section: SectionAllocation, questionId: number): number | undefined => {
  if (!section.subsectionAllocations) return undefined;
  
  for (const subsection of section.subsectionAllocations) {
    const chapterId = findChapterIdInChapters(subsection, questionId);
    if (chapterId) return chapterId;
  }
  return undefined;
};

// Helper function to search through chapters of a subsection
const findChapterIdInChapters = (subsection: SubsectionAllocation, questionId: number): number | undefined => {
  if (!subsection.allocatedChapters) return undefined;
  
  for (const chapter of subsection.allocatedChapters) {
    if (chapter.question && chapter.question.id === questionId) {
      return chapter.chapterId;
    }
  }
  return undefined;
};

// Get chapter ID from route params as fallback
const getChapterIdFromRouteParams = (): number => {
  const chapters = route.query.chapters 
    ? JSON.parse(decodeURIComponent(route.query.chapters as string)) 
    : [];
  
  const chapterId = chapters.length > 0 ? chapters[0].id : 1;
  console.warn(`Chapter ID not found, using default from route: ${chapterId}`);
  
  return chapterId;
};

// Get chapter ID for a question (used for checking other questions)
const getQuestionChapterId = (q: Question): number | undefined => {
  // Try from question_topics first
  const fromTopics = getChapterIdFromQuestionTopics(q);
  if (fromTopics) return fromTopics;
  
  // Try from question_text_topics next
  const fromTextTopics = getChapterIdFromQuestionTextTopics(q);
  if (fromTextTopics) return fromTextTopics;
  
  // Look in API data as fallback
  return findChapterIdInApiData(q);
};

// Collect question text IDs from similar questions (same chapter, same type)
const collectQuestionTextIds = (
  currentQuestionTextId: number, 
  questionTypeId: number, 
  chapterId: number
): number[] => {
  const questionTextIds: number[] = [currentQuestionTextId];
  
  // Loop through test paper sections
  for (const section of testPaperSections.value) {
    collectSimilarQuestionsFromSection(section, questionTextIds, currentQuestionTextId, questionTypeId, chapterId);
  }
  
  return questionTextIds;
};

// Helper function to collect question text IDs from a section
const collectSimilarQuestionsFromSection = (
  section: DisplaySection,
  questionTextIds: number[],
  currentQuestionTextId: number,
  questionTypeId: number,
  chapterId: number
) => {
  for (const q of section.questions) {
    // Skip questions that don't match our criteria
    if (!isSimilarQuestion(q, currentQuestionTextId, questionTypeId, chapterId)) continue;
    
    // Add the question text ID if it exists
    addQuestionTextId(q, questionTextIds);
  }
};

// Check if a question matches our similarity criteria
const isSimilarQuestion = (
  question: DisplayQuestion,
  currentQuestionTextId: number,
  questionTypeId: number,
  chapterId: number
): boolean => {
  // Skip the current question
  if (question.originalQuestion.id === currentQuestionTextId) return false;
  
  // Only consider questions with the same question type
  if (question.originalQuestion.question_type_id !== questionTypeId) return false;
  
  // Get the chapter ID for this question
  const questionChapterId = question.chapterId ?? getQuestionChapterId(question.originalQuestion);
  
  // Only include questions from the same chapter
  return questionChapterId === chapterId;
};

// Add question text ID to the collection if it exists
const addQuestionTextId = (question: DisplayQuestion, questionTextIds: number[]) => {
  if (question.originalQuestion.question_texts && 
      question.originalQuestion.question_texts.length > 0) {
    questionTextIds.push(question.originalQuestion.question_texts[0].id);
  }
};

// Fetch replacement question from API
const fetchReplacementQuestion = async (
  questionTextIds: number[], 
  mediumIds: number[], 
  chapterId: number
): Promise<Question> => {
  // Build query params
  const queryParams = new URLSearchParams();
  
  // Add question text IDs
  questionTextIds.forEach(id => {
    queryParams.append('questionTextIds', id.toString());
  });
  
  // Add all medium IDs
  mediumIds.forEach(id => {
    queryParams.append('mediumIds', id.toString());
  });
  
  // Add chapter ID and question origin
  queryParams.append('chapterId', chapterId.toString());
  queryParams.append('questionOrigin', 'both');
  
  console.log('Change question parameters:', {
    questionTextIds,
    mediumIds,
    chapterId,
    questionOrigin: 'both'
  });
  
  // Make the API call
  const response = await axiosInstance.get(`/chapter-marks-distribution/change-question?${queryParams.toString()}`);
  
  if (!response.data?.question) {
    console.error('Unexpected API response format:', response.data);
    throw new Error('Failed to get replacement question');
  }
  
  return response.data.question;
};

// Process and replace the question
const processAndReplaceQuestion = (
  section: DisplaySection,
  questionIndex: number,
  oldQuestion: DisplayQuestion,
  newQuestion: Question,
  chapterId: number
) => {
  // Find question text for current medium
  const questionText = findQuestionTextForNewQuestion(newQuestion);
  
  // Extract topic ID
  const topicId = getTopicIdFromNewQuestion(newQuestion, questionText);
  
  // Create display question
  const displayQuestion = createReplacementDisplayQuestion(
    oldQuestion.questionNumber,
    questionText.question_text,
    oldQuestion.marks,
    newQuestion,
    topicId,
    chapterId
  );
  
  // Process options and match pairs
  addOptionsToQuestion(displayQuestion, questionText);
  addMatchPairsToQuestion(displayQuestion, questionText);
  
  // Replace the question in the section
  section.questions[questionIndex] = displayQuestion;
};

// Find question text for new question based on medium
const findQuestionTextForNewQuestion = (newQuestion: Question): QuestionText => {
  if (!newQuestion.question_texts || newQuestion.question_texts.length === 0) {
    throw new Error('No question texts available in the new question');
  }
  
  // First try to find an exact match for the current medium
  const matchingText = newQuestion.question_texts.find(text => 
    text.question_text_topics && 
    text.question_text_topics.length > 0 && 
    text.question_text_topics[0].instruction_medium_id === currentMediumId.value
  );
  
  // If no match, use the first question text as a fallback
  return matchingText ?? newQuestion.question_texts[0];
};

// Get topic ID from new question
const getTopicIdFromNewQuestion = (
  newQuestion: Question, 
  questionText: QuestionText
): number | undefined => {
  if (newQuestion.question_topics && newQuestion.question_topics.length > 0) {
    return newQuestion.question_topics[0].topic_id;
  } else if (questionText.question_text_topics && questionText.question_text_topics.length > 0) {
    return questionText.question_text_topics[0].question_topic_id;
  }
  return undefined;
};

// Create a display question object for the replacement
const createReplacementDisplayQuestion = (
  questionNumber: number,
  questionText: string,
  marks: number,
  originalQuestion: Question,
  topicId?: number,
  chapterId?: number
): DisplayQuestion => {
  return {
    questionNumber,  // Keep the same question number
    questionText,
    marks,  // Keep the same marks
    questionType: originalQuestion.question_type.type_name,
    originalQuestion,
    topicId,
    chapterId  // Store the chapter ID for future changes
  };
};

// Handle error in change question process
const handleChangeQuestionError = (error: unknown) => {
  console.error('Error changing question:', error);
    const err = error as any;
  const status = err?.response?.status;
  const errorMessage = err?.response?.data?.message || err?.message || '';
  
  console.log('Change question error details:', { status, errorMessage, fullError: err?.response?.data });
  
  // Check if it's a "no questions found" error (can be 404, 500, or specific message patterns)
  if (status === 404 || 
      status === 500 || 
      errorMessage.toLowerCase().includes('no replacement questions found') ||
      errorMessage.toLowerCase().includes('no questions found') ||
      errorMessage.toLowerCase().includes('not found')) {
    toastStore.showToast({
      title: 'No Extra Questions',
      message: "No extra question for replacement",
      type: 'warning'
    });
  } else {
    const msg = errorMessage || 'Failed to change question. Please try again later.';
    toastStore.showToast({ title: 'Error', message: msg, type: 'error' });
  }
};

// Restore button to original state
const restoreButtonState = (sectionIndex: number, questionIndex: number) => {
  const button = document.querySelector(`#question-${sectionIndex}-${questionIndex} .shuffle-button`) as HTMLButtonElement;
  if (button) {
    button.innerHTML = `<span class="d-inline-flex align-items-center">
      <i class="bi bi-arrow-clockwise me-1"></i><span class="d-none d-sm-inline">Change</span>
    </span>`;
    button.disabled = false;
  }
};

// New function to update the stored API data structure with a new question
const updateStoredApiDataWithNewQuestion = (sectionIndex: number, questionIndex: number, newQuestion: Question, chapterId: number) => {
  if (!apiData.value?.sectionAllocations) {
    console.warn('Cannot update stored API data: no apiData available');
    return;
  }
  
  try {
    // Find the corresponding section in API data
    const section = testPaperSections.value[sectionIndex];
    const apiSection = findCorrespondingApiSection(section);
    
    if (!apiSection) {
      console.warn(`Cannot find section in API data for section index ${sectionIndex}`);
      return;
    }
    
    // Find and update the question in API data
    const found = findAndUpdateQuestion(apiSection, questionIndex, newQuestion, chapterId, sectionIndex);
    
    if (!found) {
      console.warn(`Could not find question in API data for section ${sectionIndex}, question ${questionIndex}`);
    }
    
    // Save updated API data to localStorage
    saveUpdatedApiData();
  } catch (error) {
    console.error('Error updating stored API data with new question:', error);
  }
};

// Find the section in API data that matches the display section
const findCorrespondingApiSection = (displaySection: DisplaySection) => {
  return apiData.value!.sectionAllocations.find(s => 
    s.sectionName === displaySection.sectionName && 
    (s.section_number === displaySection.sectionNumber || s.sequentialNumber === displaySection.sectionNumber)
  );
};

// Find the question in API data and update it
const findAndUpdateQuestion = (
  apiSection: SectionAllocation,
  targetQuestionIndex: number,
  newQuestion: Question,
  chapterId: number,
  sectionIndex: number
): boolean => {
  // Get question position information
  const questionPositions = getQuestionPositions(apiSection);
  
  // Find the matching question position
  const matchingPosition = questionPositions.find(pos => pos.questionIndex === targetQuestionIndex);
  
  if (!matchingPosition) {
    return false;
  }
  
  // Update the question at the found position
  updateQuestionAtPosition(matchingPosition, newQuestion, chapterId, sectionIndex, targetQuestionIndex);
  
  return true;
};

// Create a map of all question positions in a section
const getQuestionPositions = (apiSection: SectionAllocation) => {
  const positions: {
    subsection: SubsectionAllocation;
    chapterIndex: number;
    chapter: ChapterAllocation;
    questionIndex: number;
  }[] = [];
  
  let questionIndex = 0;
  
  // Iterate through subsections
  for (const subsection of apiSection.subsectionAllocations) {
    // Iterate through chapters in each subsection
    for (let chapterIndex = 0; chapterIndex < subsection.allocatedChapters.length; chapterIndex++) {
      const chapter = subsection.allocatedChapters[chapterIndex];
      
      // If this chapter has a question, add its position
      if (chapter.question) {
        positions.push({
          subsection,
          chapterIndex,
          chapter,
          questionIndex: questionIndex++
        });
      }
    }
  }
  
  return positions;
};

// Update the question at the specified position
const updateQuestionAtPosition = (
  position: {
    subsection: SubsectionAllocation;
    chapterIndex: number;
    chapter: ChapterAllocation;
    questionIndex: number;
  },
  newQuestion: Question,
  chapterId: number,
  sectionIndex: number,
  questionIndex: number
) => {
  // Update the question
  position.chapter.question = newQuestion;
  
  // Update the chapter ID if it's different
  if (position.chapter.chapterId !== chapterId) {
    position.chapter.chapterId = chapterId;
  }
  
  console.log(`Updated question in API data at section ${sectionIndex}, question ${questionIndex}`);
};

// Save the updated API data to localStorage
const saveUpdatedApiData = () => {
  localStorage.setItem('finalQuestionsDistribution', JSON.stringify(apiData.value));
  console.log('Updated finalQuestionsDistribution in localStorage with new question');
};

// Save page functionality
const savePage = async () => {
  try {
    console.log('Saving test paper...');
    
    // Show loading indicator or disable button here
    const saveButton = document.querySelector('.btn-dark') as HTMLButtonElement;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Saving...';
    }
    
    // Ensure user profile is loaded
    if (!userProfile.value) {
      console.log('User profile not loaded, fetching...');
      await fetchUserProfile();
    }
    
    // Get the current test paper data
    const latestData = getLatestData();
    if (!latestData) {
      throw new Error('No test paper data available');
    }

    // Save the current data to localStorage for the saveTestPaper page to use
    localStorage.setItem('finalQuestionsDistribution', JSON.stringify(latestData));
    console.log('Saved test paper data to localStorage');

    // Extract the pattern ID from latest data
    const patternId = latestData.patternId ? latestData.patternId.toString() : route.query.patternId;
    console.log(`Using pattern ID: ${patternId}`);

    // Get chapters and weightages from the data
    const chapters: number[] = [];
    const weightages: number[] = [];

    if (latestData.chapterMarks && latestData.chapterMarks.length > 0) {
      latestData.chapterMarks.forEach(chapterMark => {
        chapters.push(chapterMark.chapterId);
        
        // Use absolute marks directly (actual marks, not percentage)
        weightages.push(chapterMark.absoluteMarks);
      });
    }
    
    // Get user ID and school ID from user profile or localStorage
    let userId = userProfile.value?.id;
    let schoolId = userProfile.value?.schools?.[0]?.id;
    
    // If not available from userProfile, try to get from localStorage or route
    if (!userId || !schoolId) {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          userId = userId || profile.id;
          schoolId = schoolId || (profile.schools?.[0]?.id);
        }
        
        // If still not available, try to get from route query
        userId = userId || (route.query.userId ? Number(route.query.userId) : undefined);
        schoolId = schoolId || (route.query.schoolId ? Number(route.query.schoolId) : undefined);
      } catch (error) {
        console.error('Error getting user profile from localStorage:', error);
      }
    }
      
    if (!userId || !schoolId) {
      throw new Error('User ID or School ID not available. Please ensure you are logged in properly.');
    }
    
    // Navigate to saveTestPaper page with all the necessary data
    router.push({
      name: 'saveTestPaper',
      query: {
        ...route.query, // Pass along current query params
        paperTitle: paperTitle.value,
        testDuration: testDuration.value, // Use the computed formatted value instead of raw format
        saveRequested: 'true', // Flag to indicate save should be performed
        userId: userId.toString(),
        schoolId: schoolId.toString(),
        chapters: JSON.stringify(chapters),
        weightages: JSON.stringify(weightages),
        patternId: patternId ? patternId.toString() : '1' // Ensure pattern ID is passed
      }
    });
    
  } catch (error) {
    console.error('Error saving test paper:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save test paper. Please try again.';
    toastStore.showToast({
      title: 'Save Failed',
      message: errorMessage,
      type: 'error'
    });
    
    // Reset save button
    const saveButton = document.querySelector('.btn-dark') as HTMLButtonElement;
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.innerHTML = '<i class="bi bi-save me-1"></i> Save';
    }
  }
}

// Go back button handler
const goBack = () => {
  router.back()
}

// Scroll to top functionality
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Initialize component data
const initializeComponent = async () => {
  isLoading.value = true
  try {
    // Set default title
    paperTitle.value = defaultTitle.value
    
    // Set default time values
    hours.value = 1
    minutes.value = 0
    
    // Load saved option layouts
    loadOptionLayoutsFromLocalStorage()
    
    // Load user profile and school name
    await fetchUserProfile()
    
    // Load data from localStorage
    const storedData = loadStoredData()
    
    // Fetch test paper questions
    await fetchTestPaperQuestions(storedData)
    
    // Extract available mediums from API data after questions are loaded
    fetchAvailableMediums()
    
    // Load saved zoom level from localStorage
    const savedZoomLevel = localStorage.getItem('a4ZoomLevel');
    if (savedZoomLevel) {
      zoomLevel.value = parseInt(savedZoomLevel);
    }
    
    console.log('Test paper initialized with data from API')
  } catch (error) {
    console.error('Error initializing test paper preview:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Immediately hide the back to top button
  const backToTopBtn = document.getElementById('backToTop')
  if (backToTopBtn) {
    backToTopBtn.style.cssText = 'display: none !important;'
  }
  
  // Initialize the component with data
  initializeComponent()
  
  // Add scroll event listener for back-to-top button visibility
  window.addEventListener('scroll', handleScroll)
  
  // Add scroll event listener to hide layout selectors when scrolling
  window.addEventListener('scroll', handleLayoutSelectorsOnScroll)
  
  // Initialize Bootstrap tooltips
  nextTick(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new (window as any).bootstrap.Tooltip(tooltipTriggerEl)
    })
  })
  
  // Call handleScroll initially to set the correct visibility
  handleScroll()
  
  // Load instructions from localStorage if they exist
  const savedInstructions = localStorage.getItem('examInstructions')
  if (savedInstructions) {
    try {
      examInstructions.value = JSON.parse(savedInstructions)
    } catch (e) {
      console.error('Error parsing saved instructions:', e)
    }
  }
})

onBeforeUnmount(() => {
  // Remove event listeners
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('scroll', handleLayoutSelectorsOnScroll)
  document.removeEventListener('click', handleGlobalLayoutClickOutside)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('click', handleMediumDropdownClickOutside)
})

// Show/hide back-to-top button based on scroll position
const handleScroll = () => {
  const backToTopBtn = document.getElementById('backToTop')
  if (backToTopBtn) {
    if (window.scrollY > 300) {
      backToTopBtn.style.cssText = 'display: flex !important;'
    } else {
      backToTopBtn.style.cssText = 'display: none !important;'
    }
  }
}

// Add a separate loading state for change all questions
const isChangingAllQuestions = ref(false)

// Add loading state for shuffle
const isShuffling = ref(false)

// Change all questions - calls the API again to refresh all questions
const changeAllQuestions = async () => {
  isChangingAllQuestions.value = true
  try {
    console.log('Changing all questions...')
    // Show feedback to the user
    const previousSections = testPaperSections.value
    
    // Call the same API again with the same request data
    const requestData = getLatestData();
    if (!requestData) {
      console.error('No request data available to change questions');
      throw new Error('Failed to get request data for changing questions');
    }
    
    // Use the original request data without modifying it
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', requestData);
    
    if (response.data) {
      console.log('New questions received from API');
      apiData.value = response.data;
      
      // Extract available mediums from the response
      if (response.data.mediums && response.data.mediums.length > 0) {
        availableMediums.value = response.data.mediums.map((medium: ApiMedium) => ({
          id: medium.id,
          name: medium.instruction_medium
        }));
        
        // If current medium is not in the available list, reset to the first one
        if (!availableMediums.value.some(m => m.id === currentMediumId.value) && availableMediums.value.length > 0) {
          currentMediumId.value = availableMediums.value[0].id;
        }
      }
      
      transformApiDataToDisplayFormat(response.data);
    } else {
      throw new Error('Unexpected API response format when changing questions');
    }
    
    // If the API call fails or returns empty data, restore the previous questions
    if (testPaperSections.value.length === 0) {
      console.warn('API returned no sections, restoring previous state');
      testPaperSections.value = previousSections;
    }
  } catch (error) {
    console.error('Error changing all questions:', error);
    const err = error as any;
    const status = err?.response?.status;
    const errorMessage = err?.response?.data?.message || err?.message || '';
    
    console.log('New set error details:', { status, errorMessage, fullError: err?.response?.data });
    
    // Check if it's a "no questions found" error (can be 404, 500, or specific message patterns)
    if (status === 404 || 
        status === 500 || 
        errorMessage.toLowerCase().includes('no replacement questions found') ||
        errorMessage.toLowerCase().includes('no questions found') ||
        errorMessage.toLowerCase().includes('not found')) {
      toastStore.showToast({
        title: 'No Extra Questions',
        message: "No extra questions for new set",
        type: 'warning'
      });
    } else {
      const msg = errorMessage || 'Failed to change questions. Please try again later.';
      toastStore.showToast({ title: 'Error', message: msg, type: 'error' });
    }
  } finally {
    isChangingAllQuestions.value = false;
  }
}

// Shuffle questions within sections and MCQ options
const shuffleQuestions = async () => {
  isShuffling.value = true;
  try {
    console.log('Shuffling questions...');
    
    // Shuffle questions within each section
    testPaperSections.value.forEach(section => {
      // Shuffle the questions array within the section
      section.questions = shuffleArray([...section.questions]);
      
      // Re-assign question numbers sequentially after shuffle
      section.questions.forEach((question, index) => {
        question.questionNumber = index + 1;
      });
      
      // Shuffle MCQ options for each question
      section.questions.forEach(question => {
        if (question.options && question.options.length > 0) {
          question.options = shuffleArray([...question.options]);
        }
      });
    });
    
    console.log('Questions and options shuffled successfully!');
    toastStore.showToast({
      title: 'Shuffled',
      message: 'Questions and options have been shuffled',
      type: 'success'
    });
  } catch (error) {
    console.error('Error shuffling questions:', error);
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to shuffle questions. Please try again.',
      type: 'error'
    });
  } finally {
    isShuffling.value = false;
  }
};

// Helper function to shuffle an array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Show global layout options
const showGlobalLayoutOptions = (event: Event) => {
  // Prevent propagation
  event.stopPropagation()
  
  // Set the global layout selector as visible
  globalLayoutSelectorVisible.value = true
  
  // Add click outside event listener after the DOM updates
  nextTick(() => {
    // Get the clicked button
    const clickedButton = event.target as HTMLElement;
    const button = clickedButton.closest('.btn') as HTMLElement;
    
    // Position the layout selector relative to the button
    if (button && globalLayoutSelectorRef.value) {
      // For desktop view, position based on the button
      if (window.innerWidth >= 576) {
        const buttonRect = button.getBoundingClientRect();
        globalLayoutSelectorRef.value.style.position = 'fixed';
        globalLayoutSelectorRef.value.style.top = `${buttonRect.bottom + 5}px`;
        globalLayoutSelectorRef.value.style.left = `${buttonRect.left - globalLayoutSelectorRef.value.offsetWidth / 2 + buttonRect.width / 2}px`;
        globalLayoutSelectorRef.value.style.transform = '';
        
        // Make sure it doesn't go off-screen
        const rect = globalLayoutSelectorRef.value.getBoundingClientRect();
        if (rect.right > window.innerWidth - 10) {
          globalLayoutSelectorRef.value.style.left = `${window.innerWidth - globalLayoutSelectorRef.value.offsetWidth - 10}px`;
        }
        if (rect.left < 10) {
          globalLayoutSelectorRef.value.style.left = '10px';
        }
      } else {
        // For mobile view, always center in the screen regardless of click position
        globalLayoutSelectorRef.value.style.position = 'fixed';
        globalLayoutSelectorRef.value.style.top = '50%';
        globalLayoutSelectorRef.value.style.left = '50%';
        globalLayoutSelectorRef.value.style.transform = 'translate(-50%, -50%)';
        // Clear any previous positioning
        globalLayoutSelectorRef.value.style.right = '';
        globalLayoutSelectorRef.value.style.bottom = '';
      }
    }
    
    // Add event listener for clicks outside
    document.addEventListener('click', handleGlobalLayoutClickOutside);
  });
}

// Hide global layout options
const hideGlobalLayoutOptions = () => {
  globalLayoutSelectorVisible.value = false;
  document.removeEventListener('click', handleGlobalLayoutClickOutside);
}

// Handle click outside of global layout selector
const handleGlobalLayoutClickOutside = (event: MouseEvent) => {
  if (globalLayoutSelectorRef.value && !globalLayoutSelectorRef.value.contains(event.target as Node)) {
    hideGlobalLayoutOptions();
  }
}

// Apply global layout to all MCQ questions
const applyGlobalLayout = (layout: string) => {
  // Set the selected global layout
  globalSelectedLayout.value = layout;
  
  // Apply this layout to all MCQ questions
  let mcqCount = 0;
  for (const [sectionIndex, section] of testPaperSections.value.entries()) {
    for (const [questionIndex, question] of section.questions.entries()) {
      // Only apply to questions that have options (MCQs)
      if (question.options && question.options.length > 0) {
        const key = `${sectionIndex}-${questionIndex}`;
        optionsLayouts.value[key] = layout;
        mcqCount++;
      }
    }
  }
  
  // Save the updated layouts to localStorage
  saveOptionLayoutsToLocalStorage()
  
  // Close the selector
  hideGlobalLayoutOptions();
}

// Clean up event listeners
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('click', handleGlobalLayoutClickOutside);
});

// Hide layout selectors when scrolling
const handleLayoutSelectorsOnScroll = () => {
  // Hide global layout selector if visible
  if (globalLayoutSelectorVisible.value) {
    globalLayoutSelectorVisible.value = false
    document.removeEventListener('click', handleGlobalLayoutClickOutside)
  }
  
  // Hide individual layout selector if visible
  if (activeLayoutSelector.value.sectionIndex !== -1) {
    hideLayoutOptions()
  }
  
  // Hide medium dropdown if visible
  if (showMediumDropdown.value) {
    showMediumDropdown.value = false
    document.removeEventListener('click', handleMediumDropdownClickOutside)
  }
}

// Exam Instructions functionality
const examInstructions = ref<string[]>([])
const isEditingInstructions = ref(false)
const instructionsText = ref('')
const instructionsTextarea = ref<HTMLTextAreaElement | null>(null)

// Function to start editing instructions
const startEditingInstructions = () => {
  isEditingInstructions.value = true
  instructionsText.value = examInstructions.value.join('\n')
  nextTick(() => {
    if (instructionsTextarea.value) {
      instructionsTextarea.value.focus()
    }
  })
}

// Function to cancel editing instructions
const cancelEditingInstructions = () => {
  isEditingInstructions.value = false
  instructionsText.value = ''
}

// Function to save instructions
const saveInstructions = () => {
  isEditingInstructions.value = false
  // Filter out empty lines
  examInstructions.value = instructionsText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  // Save to localStorage for persistence
  localStorage.setItem('examInstructions', JSON.stringify(examInstructions.value))
}

// Medium selection state and refs
interface Medium {
  id: number;
  name: string;
}

// Define interface for API Medium response
interface ApiMedium {
  id: number;
  instruction_medium: string;
}

const availableMediums = ref<Medium[]>([]);
const currentMediumId = ref<number>(1); // Default medium ID
const currentMediumName = computed(() => {
  const medium = availableMediums.value.find(m => m.id === currentMediumId.value);
  return medium ? medium.name : 'Medium';
});
const showMediumDropdown = ref(false);
const mediumButtonMobileRef = ref<HTMLElement | null>(null);
const mediumDropdownMobileRef = ref<HTMLElement | null>(null);

// Function to toggle medium dropdown
const toggleMediumDropdown = (event: MouseEvent) => {
  event.stopPropagation();
  showMediumDropdown.value = !showMediumDropdown.value;
  
  if (showMediumDropdown.value) {
    nextTick(() => {
      // Get the clicked button (could be mobile or desktop)
      const clickedElement = event.target as HTMLElement;
      const buttonElement = clickedElement.closest('button') as HTMLElement;
      
      if (buttonElement && mediumDropdownMobileRef.value) {
        const buttonRect = buttonElement.getBoundingClientRect();
        mediumDropdownMobileRef.value.style.position = 'fixed';
        mediumDropdownMobileRef.value.style.top = `${buttonRect.bottom + 5}px`;
        
        // Center horizontally relative to the button
        const dropdownWidth = mediumDropdownMobileRef.value.offsetWidth;
        const buttonCenterX = buttonRect.left + (buttonRect.width / 2);
        const leftPosition = buttonCenterX - (dropdownWidth / 2);
        
        // Ensure it doesn't go off-screen on the left
        const adjustedLeft = Math.max(10, leftPosition);
        
        // Ensure it doesn't go off-screen on the right
        const rightEdge = adjustedLeft + dropdownWidth;
        if (rightEdge > globalThis.innerWidth - 10) {
          mediumDropdownMobileRef.value.style.left = `${globalThis.innerWidth - dropdownWidth - 10}px`;
        } else {
          mediumDropdownMobileRef.value.style.left = `${adjustedLeft}px`;
        }
        
        // Remove centered transform
        mediumDropdownMobileRef.value.style.transform = 'none';
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
  const dropdown = mediumDropdownMobileRef.value;
  
  // Check if click is outside dropdown
  if (dropdown && !dropdown.contains(event.target as Node)) {
    showMediumDropdown.value = false;
    document.removeEventListener('click', handleMediumDropdownClickOutside);
  }
};

// Fetch available mediums
const fetchAvailableMediums = () => {
  try {
    // Extract mediums from the API response data
    if (apiData.value?.mediums?.length > 0) {
      availableMediums.value = apiData.value.mediums.map((medium: ApiMedium) => ({
        id: medium.id,
        name: medium.instruction_medium
      }));
      
      // If no current medium ID is set, set to the first available medium
      if (availableMediums.value.length > 0 && currentMediumId.value === 1) {
        currentMediumId.value = availableMediums.value[0].id;
      }
    } else {
      // If no mediums in API data, use default
      availableMediums.value = [{ id: 1, name: 'English' }];
    }
  } catch (error) {
    console.error('Error extracting available mediums:', error);
    // Add default medium as fallback
    availableMediums.value = [{ id: 1, name: 'English' }];
  }
};

// Change the current medium
const changeMedium = async (mediumId: number) => {
  if (currentMediumId.value === mediumId) {
    // If same medium, just close the dropdown
    showMediumDropdown.value = false;
    return;
  }
  
  // Store the previous medium for reference
  const previousMediumId = currentMediumId.value;
  
  // Update current medium ID
  currentMediumId.value = mediumId;
  showMediumDropdown.value = false;
  
  try {
    // For questions that have been individually changed, we need to check if they have
    // the correct language version and potentially fetch new ones
    
    // First transform the existing data for immediate display
    if (apiData.value) {
      transformApiDataToDisplayFormat(apiData.value);
    }
    
    // Then check each question to see if it needs to be updated
    const questionsToFetch = [];
    
    for (let sectionIndex = 0; sectionIndex < testPaperSections.value.length; sectionIndex++) {
      const section = testPaperSections.value[sectionIndex];
      
      for (let questionIndex = 0; questionIndex < section.questions.length; questionIndex++) {
        const question = section.questions[questionIndex];
        const originalQuestion = question.originalQuestion;
        
        // Check if this question has a text for the current medium
        const hasTextForCurrentMedium = originalQuestion.question_texts.some(text => 
          text.question_text_topics && 
          text.question_text_topics.length > 0 && 
          text.question_text_topics[0].instruction_medium_id === mediumId
        );
        
        // If no text for current medium, add to list of questions to fetch
        if (!hasTextForCurrentMedium && question.chapterId) {
          questionsToFetch.push({
            sectionIndex,
            questionIndex,
            questionTextId: originalQuestion.question_texts[0].id,
            chapterId: question.chapterId
          });
        }
      }
    }
    
    // If we found questions that need updating, fetch them one by one
    if (questionsToFetch.length > 0) {
      console.log(`Found ${questionsToFetch.length} questions that need updating for medium ${mediumId}`);
      
      // Show loading state
      isChangingAllQuestions.value = true;
      
      // Process each question that needs updating
      for (const questionInfo of questionsToFetch) {
        await fetchQuestionWithNewMedium(
          questionInfo.sectionIndex,
          questionInfo.questionIndex,
          questionInfo.questionTextId,
          questionInfo.chapterId,
          mediumId
        );
      }
      
      // Hide loading state
      isChangingAllQuestions.value = false;
    }
  } catch (error) {
    console.error('Error changing medium:', error);
    // In case of error, revert to previous medium
    currentMediumId.value = previousMediumId;
  }
};

// Helper function to fetch a specific question with new medium
const fetchQuestionWithNewMedium = async (
  sectionIndex: number,
  questionIndex: number,
  questionTextId: number,
  chapterId: number,
  mediumId: number
) => {
  try {
    // Make the API call to get a replacement question
    const queryParams = prepareQueryParams(questionTextId, chapterId, mediumId);
    const response = await axiosInstance.get(`/chapter-marks-distribution/change-question?${queryParams.toString()}`);
    
    if (!response.data?.question) {
      console.error('Unexpected API response format:', response.data);
      return;
    }
    
    // Process the response data
    processNewQuestion(sectionIndex, questionIndex, response.data.question, mediumId);
  } catch (error) {
    console.error('Error fetching question with new medium:', error);
  }
};

// Prepare query parameters for API call
const prepareQueryParams = (questionTextId: number, chapterId: number, mediumId: number): URLSearchParams => {
  // Get all medium IDs
  const mediumIds = availableMediums.value.map(medium => medium.id);
  
  // Make sure target medium is included
  if (!mediumIds.includes(mediumId)) {
    mediumIds.push(mediumId);
  }
  
  // Build and return query params
  const queryParams = new URLSearchParams();
  
  queryParams.append('questionTextIds', questionTextId.toString());
  
  for (const id of mediumIds) {
    queryParams.append('mediumIds', id.toString());
  }
  
  queryParams.append('chapterId', chapterId.toString());
  queryParams.append('questionOrigin', 'both');
  
  return queryParams;
};

// Process a new question received from the API
const processNewQuestion = (
  sectionIndex: number,
  questionIndex: number,
  newQuestion: Question,
  mediumId: number
) => {
  // Check if the new question has text for the requested medium
  const hasTextForMedium = newQuestion.question_texts.some(text => 
    text.question_text_topics && 
    text.question_text_topics.length > 0 && 
    text.question_text_topics[0].instruction_medium_id === mediumId
  );
  
  if (!hasTextForMedium) {
    console.warn(`New question does not have text for medium ${mediumId}`);
    return;
  }
  
  // Get the section and question
  const section = testPaperSections.value[sectionIndex];
  const question = section.questions[questionIndex];
  
  // Update the question with the new data
  updateQuestionData(question, newQuestion, mediumId);
  
  console.log(`Updated question ${sectionIndex}-${questionIndex} with medium ${mediumId}`);
};

// Update question data with new question information
const updateQuestionData = (question: DisplayQuestion, newQuestion: Question, mediumId: number) => {
  // Store the new question data
  question.originalQuestion = newQuestion;
  
  // Find the correct question text based on the medium
  const questionText = findQuestionTextForSpecificMedium(newQuestion, mediumId);
  
  // Update the question display
  question.questionText = questionText.question_text;
  
  // Update options and match pairs
  updateQuestionOptions(question, questionText);
  updateQuestionMatchPairs(question, questionText);
};

// Find the question text for the specified medium
const findQuestionTextForSpecificMedium = (question: Question, mediumId: number): QuestionText => {
  // Try to find text matching the medium
  const text = question.question_texts.find(text => 
    text.question_text_topics && 
    text.question_text_topics.length > 0 && 
    text.question_text_topics[0].instruction_medium_id === mediumId
  );
  
  // Return matching text or fall back to first one
  return text ?? question.question_texts[0];
};

// Update question options
const updateQuestionOptions = (question: DisplayQuestion, questionText: QuestionText) => {
  if (!questionText.mcq_options || questionText.mcq_options.length === 0) {
    return;
  }
  
  question.options = questionText.mcq_options.map((option, index) => ({
    label: String.fromCodePoint(65 + index), // A, B, C, D...
    text: option.option_text,
    isCorrect: option.is_correct
  }));
};

// Update question match pairs
const updateQuestionMatchPairs = (question: DisplayQuestion, questionText: QuestionText) => {
  if (!questionText.match_pairs || questionText.match_pairs.length === 0) {
    return;
  }
  
  question.matchPairs = questionText.match_pairs.map(pair => ({
    leftText: pair.left_text || '', // Handle null left_text
    rightText: pair.right_text || '' // Handle null right_text
  }));
};

// Add mobileViewMode state
const mobileViewMode = ref(true);

// Add zoom level state and computed style for A4 paper
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
}
</script>

<style scoped>
/* Main styles */
.preview-container {
  padding-top: 20px;
  padding-bottom: 50px;
  max-width: 210mm; /* A4 width */
  margin: 0 auto;
  background-color: white;
  box-shadow: none;
  font-family: 'Times New Roman', Times, serif; /* Typical document font */
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
  width: 100px;
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

/* Option layout selector */
.layout-selector {
  position: fixed;
  top: calc(100% + 5px);
  right: 0;
  z-index: 1050;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 300px;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.layout-options {
  padding: 15px;
}

.layout-option-title {
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 0.9rem;
  text-align: center;
  color: #333;
}

.layout-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
  margin-bottom: 10px;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.layout-card {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9f9f9;
  margin-bottom: 5px;
}

.layout-card:hover {
  background-color: #f0f0f0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.layout-card.active {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.08);
  box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.3);
}

.layout-preview {
  height: 50px;
  display: flex;
  font-size: 0.7rem;
  color: #666;
}

.layout-label {
  text-align: center;
  font-size: 0.8rem;
  color: #555;
  font-weight: 500;
  margin-top: 3px;
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

/* Mobile layout fixes */
@media (max-width: 576px) {
  /* Row layout - forced to be one row with scrolling if needed */
  .options-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
    width: 100% !important;
    overflow-x: auto !important;
    padding-bottom: 5px !important;
  }
  
  .option-item-row {
    flex: 1 0 auto !important;
    min-width: 70px !important;
    margin-right: 10px !important;
    white-space: normal !important;
  }
  
  /* Grid layout - exact 2x2 grid */
  .options-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    grid-template-rows: auto auto !important;
    gap: 8px !important;
    width: 100% !important;
  }
  
  /* Column layout - stacked vertically */
  .options-column {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }
  
  .option-item-column {
    width: 100% !important;
    margin-bottom: 8px !important;
  }
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

.shuffle-button {
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  width: auto;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: inline-block;
}

.shuffle-button span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Print styles - optimize for A4 printing */
@media print {
  .preview-container {
    box-shadow: none;
    padding: 0;
    width: 210mm;
  }
  
  .a4-paper-section {
    break-inside: avoid;
  }
  
 .section-header {
    background-color: white !important;
  }
  
  .question-list {
    padding-left: 25px !important; /* Ensure padding is preserved when printing */
  }
  
  .question-divider {
    display: none !important; /* Ensure dividers are hidden when printing */
    border-color: #eee !important;
  }
  
  .shuffle-button,
  .edit-icon {
    display: none !important;
  }
  
  /* Print-specific option layouts */
  .options-row {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .option-item-row {
    flex: 0 0 24%;
    min-width: auto;
  }
  .options-grid {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .option-item-grid {
    flex: 0 0 48%;
    min-width: auto;
  }
  
  .options-column {
    gap: 2px;
  }
  
  .option-item-column {
    margin-bottom: 2px;
  }
  
  .mobile-back-button,
  #backToTop {
    display: none !important;
  }
  
  .question-wrapper {
    display: flex !important;
    width: 100% !important;
    page-break-inside: avoid !important;
  }
  
  .question-content {
    flex: 1 !important;
  }
  
  .question-marks {
    width: 100px !important;
    text-align: right !important;
  }
  
  .option-item-row, .option-item-grid, .option-item-column {
    page-break-inside: avoid !important;
  }
  
  .shuffle-button {
    display: none !important; /* Hide change button in print */
  }
  
}
/* Mobile styles for fixed bottom buttons */
@media (max-width: 576px) {
  .container {
    padding-bottom: 100px !important; /* Further increased to accommodate the action buttons */
  }
  
  /* Mobile Change All Questions button */
  #changeAllButtonMobile {
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  /* Fixed bottom bar for action buttons */
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
    padding: 6px 12px;
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
  
  /* Required for layout - original dynamic-style positioning for mobile */
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: transparent;
    z-index: 1000;
  }
  
  /* Removing the old mobile-button-container */
  .mobile-button-container {
    display: none !important;
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
  
  /* Adjust back to top button position for mobile to make it visible above bottom buttons */
  #backToTop {
    bottom: 120px;
    background-color: rgba(0, 0, 0, 0.65);
    width: 45px;
    height: 45px;
    font-size: 1.6rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
  }
  
  /* Optimize document header for small screens */
  .document-header {
    padding: 0 10px;
  }
  
  .paper-title {
    font-size: 1.2rem;
    line-height: 1.3;
  }
  
  /* Optimize time editing form for small screens */
  .edit-time-form .d-inline-flex {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .time-inputs-container {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .time-edit-buttons {
    display: flex;
    justify-content: center;
    margin-top: 8px;
    width: 100%;
  }
  
  .edit-time-form input[type=number] {
    width: 50px !important;
  }
  
  .edit-time-form .me-2 {
    margin-right: 0.5rem !important;
    margin-bottom: 0.5rem;
  }
  
  /* Layout selector styling for mobile */
  .layout-selector {
    width: 90%;
    max-width: 270px;
    font-size: 0.9rem;
  }
  /* Grid layout - preserve 2x2 grid */
  .options-grid {
    gap: 5px;
  }
  
  .option-item-grid {
    margin-bottom: 5px;
  }
  
  /* Column layout - no changes needed, already stacks */
  
  /* Allow text to wrap in options */
  .option-text {
    word-break: break-word;
    hyphens: auto;
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

  /* Ensure marks and change button display properly on small screens */
  .marks-row {
    justify-content: flex-end;
  }

  .marks {
    font-size: 0.9rem;
  }

  .shuffle-button {
    min-width: auto;
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }

  /* Title editing form on mobile */
  .edit-title-form {
    min-width: auto;
    width: 100%;
    padding: 0 10px;
  }
}

/* Desktop styles */
@media (min-width: 577px) {
  .dynamic-style {
    position: static;
  }
  
  .dynamic-style .btn {
    margin-left: 8px;
  }
  
  #changeAllButton {
    min-width: 180px;
    transition: background-color 0.3s ease;
  }
  
  #changeAllButton:hover, .dynamic-style .btn:hover {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }
  
  /* Time editing form on desktop */
  .time-inputs-container {
    flex-wrap: nowrap !important;
  }
}

/* Editable title styles */
.editable-title {
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.editable-title h3 {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.edit-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0 5px;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-icon:hover {
  opacity: 1;
  color: #007bff;
}

.edit-title-form {
  min-width: 300px;
  margin: 0 auto;
}

/* Editable field styles */
.editable-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.edit-time-form {
  display: inline-block;
}

.edit-time-form input::-webkit-outer-spin-button,
.edit-time-form input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.edit-time-form input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
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

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    transform: scale(1);
  }
}

@media (max-width: 576px) {
  /* Adjust back to top button position for mobile to make it visible above bottom buttons */
  #backToTop {
    bottom: 120px;
    background-color: rgba(0, 0, 0, 0.65);
    width: 45px;
    height: 45px;
    font-size: 1.6rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
  }
}

/* Button styling */
#changeAllButton, #changeAllButtonMobile {
  transition: background-color 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.3px;
}

#changeAllButton:hover:not(:disabled), #changeAllButtonMobile:hover:not(:disabled) {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

#changeAllButton:disabled, #changeAllButtonMobile:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

/* New custom button style matching TeacherProfile.vue but with dark button colors */
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

/* When the test paper is refreshing with new questions */
.refreshing {
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* Layout previews for options */
.row-layout {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
}

.row-layout > div {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 22%;
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.grid-layout {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.grid-layout > div {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 45%;
  height: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.column-layout {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.column-layout > div {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 100%;
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Button hover effect */
.shuffle-button:hover {
  background-color: #212529; /* Dark background for hover state */
  color: white; /* White text for better visibility */
  border-color: #212529; /* Match border with background */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add subtle shadow for depth */
}

/* Global Layout Selector Styles */
.global-layout-selector {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 300px;
  padding: 15px;
  z-index: 1050;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Cancel button styling */
.cancel-button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  color: #333;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

/* Mobile action buttons at bottom */
.mobile-action-buttons {
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
  padding: 10px 15px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-action-buttons .btn {
  border-radius: 4px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-action-buttons .btn:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Prevent text from wrapping */
.nowrap {
  white-space: nowrap;
}

/* Mobile layout fixes */
@media (max-width: 576px) {
  /* Row layout */
  .options-row {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
    gap: 8px !important;
  }
  
  /* Grid layout */
  .options-grid {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: space-between !important;
    gap: 8px !important;
  }
  
  .option-item-grid {
    flex: 0 0 48% !important;
    width: 48% !important;
    max-width: 48% !important;
  }
  
  /* Column layout */
  .options-column {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }
  
  .option-item-column {
    width: 100% !important;
  }
  
  /* Global layout selector mobile positioning */
  .global-layout-selector {
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    position: fixed !important;
    margin: 0 !important;
  }
}

/* Exam Instructions styles */
.exam-instructions-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  max-width: 100%; /* Changed from 800px to 100% to fit A4 width */
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box; /* Ensure padding is included in width calculations */
}

.exam-instructions-container h5 {
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
}

.instructions-display, .instructions-edit-form {
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
  word-wrap: break-word; /* Ensure long words wrap */
  overflow-wrap: break-word; /* Modern alternative to word-wrap */
  width: 100%;
  padding-right: 10px; /* Add some padding to avoid text touching the edge */
}

.instructions-edit-form .instruction-textarea {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical; /* Allow vertical resizing only */
  white-space: pre-wrap; /* Preserve white space and wrap text */
  word-wrap: break-word; /* Break long words */
  overflow-wrap: break-word;
}

.instructions-edit-form button {
  margin-right: 10px;
}

/* Print-specific styles for instructions */
@media print {
  .exam-instructions-container {
    border: 1px solid #ddd;
    background-color: #fff !important;
    break-inside: avoid; /* Keep instructions together when printing */
    width: 100%;
    margin: 15px 0;
    page-break-inside: avoid;
  }
  
  .instruction-list li {
    page-break-inside: avoid;
  }
}

/* Mobile specific styles */
@media (max-width: 576px) {
  .exam-instructions-container {
    padding: 10px;
  }
  
  .instruction-list {
    padding-left: 15px !important;
  }
  
  .instructions-edit-form .instruction-textarea {
    min-height: 100px;
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
  width: 90%;
  max-width: 250px;
  padding: 10px;
  border-radius: 8px;
  animation: fadeInDropdown 0.2s ease-out;
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

/* Styles for mobile medium button that appears after the title */
.medium-button-mobile {
  padding: 6px 10px;
  font-size: 0.9rem;
  white-space: nowrap;
  min-width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-left: auto; /* Push to right side if there's space */
}

/* Extra responsive styles for very small mobile screens */
@media (max-width: 375px) {
  .medium-button-mobile,
  .mobile-action-btn {
    padding: 5px 8px;
    font-size: 0.85rem;
  }
  
  .d-flex h5.fw-bolder,
  .mobile-title {
    font-size: 1rem;
  }
}

/* Mobile title style */
.mobile-title {
  font-size: 1.1rem;
}

/* Consistent styling for mobile action buttons */
.mobile-action-btn {
  padding: 6px 10px;
  font-size: 0.9rem;
}

/* Animation for dropdown that appears from top */
@keyframes fadeInDropdown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* A4 paper container styles */
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
  .preview-container {
    padding-bottom: 60px;
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
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 300px;
}

.view-mode-selector {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}

.view-mode-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-mode-btn:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.view-mode-btn.active {
  background-color: #212529;
  color: white;
  border-color: #212529;
  font-weight: 500;
}

.zoom-control-container {
  width: 100%;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.zoom-value {
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

.scroll-hint {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 8px;
  text-align: center;
}
</style>
