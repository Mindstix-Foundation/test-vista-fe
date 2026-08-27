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
            <span class="d-inline-block">{{ boardName }}</span>
            <span class="d-inline-block ms-1">| {{ decodeURIComponent(mediumName) }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark mb-2">
            Standard {{ decodeURIComponent(standardName) }}
            <span class="d-block text-start text-secondary mt-1">
              {{ decodeURIComponent(subjectName) }}
              <span class="optional-info-marks-heading fs-5">{{ totalMarksFromPrevious }} Marks</span>
            </span>
          </h4>
          <h5 class="fw-bolder text-start text-primary mb-2">
            Pattern: {{ decodeURIComponent(patternName) }}
          </h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Chapter Marks Distribution Content -->
    <div class="row p-2 justify-content-center mb-3">
      <div class="col-12 col-sm-10">
        <div class="chapter-marks-container">
          <!-- Pattern Sections Display -->
          <div class="mb-4">
            <h6 class="fw-semibold mb-3">Chapter Marks Distribution</h6>

            <div v-if="isLoadingPattern" class="text-center py-3">
              <output class="spinner-border spinner-border-sm">
                <span class="visually-hidden">Loading pattern...</span>
              </output>
              <p class="mt-2 text-muted">Loading pattern data...</p>
            </div>
            
            <!-- Show Chapter Marks Table even if pattern is loading -->
            <div class="pattern-sections">
              <!-- Chapter Marks Distribution Table -->
              <div class="chapter-marks-section mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="fw-semibold mb-0">Chapter Marks Distribution</h6>
                  <div class="d-flex gap-2">
                    <button 
                      type="button" 
                      class="btn btn-outline-primary btn-sm"
                      @click="generateMarksDistribution"
                      :disabled="isGeneratingMarks || isGeneratingEqually || chapterMarksData.length === 0 || !isPerfectlyBalanced"
                      :title="!isPerfectlyBalanced ? 'Generate is only available when marks are perfectly balanced (Total = Assigned)' : 'Generate optimized marks distribution'"
                    >
                      <i class="bi bi-magic me-1"></i>
                      <output v-if="isGeneratingMarks" class="spinner-border spinner-border-sm me-1"></output>
                      Generate
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary btn-sm"
                      @click="generateEquallyMarksDistribution"
                      :disabled="isGeneratingEqually || isGeneratingMarks || chapterMarksData.length === 0"
                    >
                      <output v-if="isGeneratingEqually" class="spinner-border spinner-border-sm me-1"></output>
                      <i v-else class="bi bi-distribute-horizontal me-1"></i>
                      Generate Equally
                    </button>
                  </div>
                </div>

                <div v-if="chapterMarksData.length === 0" class="text-center py-4">
                  <p class="text-muted">No chapter data available. Please go back and select chapters.</p>
                  <button type="button" class="btn btn-outline-primary" @click="goBack">
                    <i class="bi bi-arrow-left me-1"></i>
                    Go Back to Chapter Selection
                  </button>
                </div>

                <div v-else class="chapter-marks-table-wrapper">
                  <div class="table-responsive">
                    <table class="table table-sm chapter-marks-table borderless">
                      <thead class="table-light">
                        <tr>
                          <th style="width: 50%;">Chapter Name</th>
                          <th style="width: 15%;" class="text-center">Percentage</th>
                          <th style="width: 35%;" class="text-center">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(chapter, index) in chapterMarksData" :key="chapter.chapterId">
                          <td>
                            <span class="fw-medium">
                              {{ getChapterDisplayNumber(chapter, index) }}. {{ chapter.chapterName }}
                            </span>
                          </td>
                          <td class="text-center">
                            <span class="badge bg-light text-dark">{{ chapter.percentage }}%</span>
                          </td>
                          <td class="text-center">
                            <div class="marks-control d-flex align-items-center justify-content-center gap-2">
                              <button 
                                type="button" 
                                class="btn btn-outline-secondary btn-sm marks-btn-rect"
                                @click="decrementMarks(index)"
                                :disabled="!canDecrement(chapter)"
                              >
                                <i class="bi bi-dash"></i>
                              </button>
                              <div class="marks-display">
                                <span 
                                  class="fw-bold marks-number" 
                                  :title="getValidMarksTooltip(chapter)"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                >{{ chapter.marks }}</span>
                                <small class="text-muted d-block">
                                  <span v-if="isLoadingRanges" class="marks-range-loading"></span>
                                  <span v-else>Marks</span>
                                </small>
                              </div>
                              <button 
                                type="button" 
                                class="btn btn-outline-secondary btn-sm marks-btn-rect"
                                @click="incrementMarks(index)"
                                :disabled="!canIncrement(chapter)"
                              >
                                <i class="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Summary Section -->
                  <div class="marks-summary border-top mt-3 pt-3">
                    <div class="d-flex flex-row justify-content-between align-items-center">
                      <div class="d-flex align-items-center">
                        <span class="me-1 text-muted">Total:</span>
                        <span class="fw-bold badge bg-secondary rounded-pill">{{ totalMarks }}</span>
                      </div>
                      <div class="d-flex align-items-center">
                        <span class="me-1 text-muted">Assigned:</span>
                        <span class="fw-bold badge rounded-pill" 
                          :class="{
                            'bg-success': assignedMarks === totalMarks,
                            'bg-warning text-dark': totalMarks && assignedMarks < totalMarks,
                            'bg-danger': totalMarks && assignedMarks > totalMarks
                          }">
                          {{ assignedMarks }}
                        </span>
                      </div>
                      <div class="d-flex align-items-center">
                        <span class="me-1 text-muted">{{ totalMarks && totalMarks - assignedMarks >= 0 ? 'Remaining:' : 'Excess:' }}</span>
                        <span class="fw-bold badge rounded-pill" 
                          :class="{
                            'bg-success': totalMarks && totalMarks - assignedMarks === 0,
                            'bg-warning text-dark': totalMarks && totalMarks - assignedMarks > 0,
                            'bg-danger': totalMarks && assignedMarks > totalMarks
                          }">
                          {{ totalMarks ? Math.abs(totalMarks - assignedMarks) : 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pattern Sections Table -->
              <div v-if="patternSections.length > 0" class="pattern-sections-table">
                <h6 class="fw-semibold mb-3">Pattern Sections</h6>
                <div class="table-responsive">
                  <table class="table table-bordered table-sm">
                    <thead class="table-dark">
                      <tr>
                        <th scope="col">Section</th>
                        <th scope="col">Questions Required</th>
                        <th scope="col">Total Available</th>
                        <th scope="col">Marks per Question</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="section in patternSections" :key="section.id">
                        <td>
                          <strong>Q.{{ section.section_number }}</strong>
                          {{ section.sub_section ? section.sub_section + ')' : '' }}
                          {{ section.section_name }}
                        </td>
                        <td class="text-center">{{ section.mandotory_questions }}</td>
                        <td class="text-center">{{ section.total_questions }}</td>
                        <td class="text-center">{{ section.marks_per_question }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light">
                      <tr>
                        <th scope="row" colspan="3" class="text-end">Total Marks:</th>
                        <th scope="row" class="text-center">{{ totalPatternMarks }}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div v-else-if="!isLoadingPattern" class="alert alert-warning">
                <strong>No pattern sections found.</strong> The pattern may not have sections configured.
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="goBack">
              <i class="bi bi-arrow-left me-1"></i>
              Back to Pattern Selection
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="navigateToPreview"
              :disabled="!canPreviewTestPaper || isGeneratingMarks || isGeneratingEqually"
              :title="(isGeneratingMarks || isGeneratingEqually) ? 'Generating questions distribution...' : (!latestAllocationData ? 'Please click Generate or Generate Equally first' : (hasManualChanges ? 'Please click Generate or Generate Equally to apply your changes before previewing' : (isFormValid ? 'Preview the test paper' : 'Please complete all required fields')))"
            >
              <output v-if="isGeneratingMarks || isGeneratingEqually" class="spinner-border spinner-border-sm me-2">
                <span class="visually-hidden">Loading...</span>
              </output>
              <i v-else class="bi bi-eye me-1"></i>
              {{ (isGeneratingMarks || isGeneratingEqually) ? 'Generating Preview...' : 'Preview Test Paper' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import ToastNotification from '@/components/common/ToastNotification.vue'

// Define component name
defineOptions({
  name: 'ChapterMarksDistribution'
})

// Router and route setup
const router = useRouter()
const route = useRoute()

// Remove the hardcoded API configuration - we'll use axiosInstance instead
// const apiBaseUrl = import.meta.env.PROD
//   ? import.meta.env.VITE_API_URL
//   : 'http://localhost:3000' // Development API URL

// Remove unused authToken - axiosInstance handles authentication automatically
// const authToken = localStorage.getItem('access_token')

// Pattern section interface
interface PatternSection {
  id: number
  pattern_id: number
  sequence_number: number
  section_number: number
  sub_section: string | null
  section_name: string
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  created_at: string
  updated_at: string
}

// Chapter marks interface
interface ChapterMarks {
  chapterId: number
  chapterName: string
  marks: number
  percentage: number
}

// New interface for chapter marks range API response
interface ChapterMarksRange {
  chapterId: number
  chapterName: string
  possibleMarks: number[]
  minMarks: number
  maxMarks: number
}

// Interface for user profile
interface UserProfile {
  id: number
  name: string
  email_id: string
  schools: {
    id: number
    name: string
    board?: {
      id: number
      name: string
      abbreviation: string
    }
  }[]
}

// State variables
const patternSections = ref<PatternSection[]>([])
const chapterMarksData = ref<ChapterMarks[]>([])
const chapterMarksRanges = ref<ChapterMarksRange[]>([])
const userProfile = ref<UserProfile | null>(null)
const isLoadingPattern = ref(false)
const isGeneratingMarks = ref(false)
const isGeneratingEqually = ref(false)
const isLoadingRanges = ref(false)
const hasManualChanges = ref(false)

// Store the latest API response for final questions distribution
const latestAllocationData = ref<any>(null)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Get route parameters
const patternId = route.query.patternId as string
const mediumId = route.query.mediumId as string
const patternName = route.query.patternName as string || 'Unknown Pattern'
const mediumName = route.query.medium as string || 'Unknown Medium'
const standardName = route.query.standard as string || 'Unknown Standard'
const subjectName = route.query.subject as string || 'Unknown Subject'
const totalMarksFromPrevious = route.query.totalMarks as string || '0'

// Get chapter data from route query parameters
const chaptersFromQuery = route.query.chapters 
  ? JSON.parse(decodeURIComponent(route.query.chapters as string))
  : []

console.log('Chapters received from previous pages:', chaptersFromQuery)
console.log('Route query parameters:', route.query)

// Computed properties
const totalPatternMarks = computed(() => {
  return patternSections.value.reduce((total, section) => {
    return total + (section.mandotory_questions * section.marks_per_question)
  }, 0)
})

const totalMarks = computed(() => {
  // Return pattern total marks if available, otherwise use fallback
  const patternMarks = totalPatternMarks.value
  return patternMarks > 0 ? patternMarks : 20 // Fallback to 20 marks
})

const assignedMarks = computed(() => {
  return chapterMarksData.value.reduce((total, chapter) => total + chapter.marks, 0)
})

const remainingMarks = computed(() => {
  return totalMarks.value - assignedMarks.value
})

const isFormValid = computed(() => {
  return assignedMarks.value === totalMarks.value // All marks must be distributed
})

// Check if marks are perfectly balanced (for Generate button)
const isPerfectlyBalanced = computed(() => {
  return assignedMarks.value === totalMarks.value
})

// Check if Preview Test Paper should be enabled
const canPreviewTestPaper = computed(() => {
  const isValid = isFormValid.value
  const noManualChanges = !hasManualChanges.value
  const hasAllocationData = latestAllocationData.value !== null
  const notGenerating = !isGeneratingMarks.value && !isGeneratingEqually.value
  
  console.log('Preview button state check:', {
    isFormValid: isValid,
    hasManualChanges: hasManualChanges.value,
    noManualChanges: noManualChanges,
    hasAllocationData: hasAllocationData,
    isGeneratingMarks: isGeneratingMarks.value,
    isGeneratingEqually: isGeneratingEqually.value,
    notGenerating: notGenerating,
    latestAllocationDataExists: !!latestAllocationData.value,
    canPreview: isValid && noManualChanges && hasAllocationData
  })
  
  return isValid && noManualChanges && hasAllocationData
})

// Computed board name - use from user profile if available, otherwise from route
const boardName = computed(() => {
  if (userProfile.value?.schools?.[0]?.board?.name) {
    return userProfile.value.schools[0].board.name
  }
  return route.query.board as string || 'Unknown Board'
})

// Fetch user profile to get the correct board name
const fetchUserProfile = async () => {
  try {
    console.log('Fetching user profile...')
    const response = await axiosInstance.get('/auth/profile')
    console.log('User profile response:', response.data)
    
    if (response.data?.data) {
      userProfile.value = response.data.data
      console.log('User profile set:', userProfile.value)
    } else {
      console.error('Unexpected API response format for user profile:', response.data)
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    // Don't show error toast as this is not critical for the page functionality
  }
}

// Fetch pattern details
const fetchPatternDetails = async () => {
  if (!patternId) {
    showErrorToast('Pattern ID is missing')
    return
  }

  try {
    isLoadingPattern.value = true
    console.log('Fetching pattern details for patternId:', patternId)
    const response = await axiosInstance.get(`/patterns/${patternId}`)
    
    console.log('Pattern API response:', response.data)
    
    if (response.data?.sections) {
      patternSections.value = response.data.sections
      console.log('Pattern sections loaded:', patternSections.value)
      initializeChapterMarksData() // Initialize chapter marks after fetching pattern
    } else {
      console.error('Unexpected API response format:', response.data)
      console.log('Expected structure: response.data.sections')
      showErrorToast('Failed to load pattern details - no sections found')
    }
  } catch (error) {
    console.error('Error fetching pattern details:', error)
    if (error.response) {
      console.error('Error response:', error.response.data)
      console.error('Error status:', error.response.status)
    }
    showErrorToast('Failed to load pattern details')
  } finally {
    isLoadingPattern.value = false
  }
}

// Initialize chapter marks data with actual chapters from previous pages
const initializeChapterMarksData = async () => {
  // Use actual chapters from the previous pages instead of hardcoded sample data
  if (chaptersFromQuery.length === 0) {
    console.error('No chapters data found from previous pages')
    showErrorToast('No chapters selected. Please go back and select chapters.')
    return
  }

  // Validate chapter data structure
  const invalidChapters = chaptersFromQuery.filter((chapter: any) => 
    !chapter.id || !chapter.name
  )
  
  if (invalidChapters.length > 0) {
    console.error('Invalid chapter data structure:', invalidChapters)
    showErrorToast('Invalid chapter data. Please go back and reselect chapters.')
    return
  }

  // Use pattern total marks if available, otherwise use the total marks from previous page
  const totalMarksToUse = totalPatternMarks.value > 0 ? totalPatternMarks.value : Number.parseInt(totalMarksFromPrevious)
  
  if (!totalMarksToUse || totalMarksToUse <= 0) {
    console.error('Invalid total marks:', totalMarksToUse)
    showErrorToast('Invalid total marks. Please go back and set the total marks.')
    return
  }

  // Initialize with actual chapter data, distributing marks equally as a starting point
  const marksPerChapter = Math.floor(totalMarksToUse / chaptersFromQuery.length)
  const remainingMarks = totalMarksToUse % chaptersFromQuery.length

  chapterMarksData.value = chaptersFromQuery.map((chapter: any, index: number) => ({
    chapterId: chapter.id,
    chapterName: chapter.name,
    // Distribute remaining marks to first few chapters
    marks: marksPerChapter + (index < remainingMarks ? 1 : 0),
    percentage: 0 // Will be calculated after
  }))

  // Calculate percentages after all marks are assigned
  updatePercentages()

  console.log('Initialized chapter marks data with actual chapters:', chapterMarksData.value)
  console.log('Total marks used:', totalMarksToUse)
  console.log('Marks per chapter:', marksPerChapter)
  console.log('Remaining marks distributed:', remainingMarks)
  
  // Fetch chapter marks ranges after initializing data
  await fetchChapterMarksRanges()
}

// Fetch chapter marks ranges from API
const fetchChapterMarksRanges = async () => {
  if (!patternId || chapterMarksData.value.length === 0) return
  
  try {
    isLoadingRanges.value = true
    
    // Get chapter IDs from the chapterMarksData
    const chapterIds = chapterMarksData.value.map(chapter => chapter.chapterId).join(',')
    
    // Get medium ID from route
    const mediumIdParam = route.query.mediumId ?? mediumId ?? '1'
    
    // Call the API endpoint
    const response = await axiosInstance.get('/test-paper/chapters/marks/range', {
      params: {
        patternId: patternId,
        chapterIds: chapterIds,
        mediumIds: mediumIdParam,
        questionOrigin: 'both'
      }
    })
    
    // Check if the response is valid
    if (Array.isArray(response.data)) {
      chapterMarksRanges.value = response.data
      console.log('Chapter marks ranges loaded successfully:', response.data)
      
      // Validate that current marks are within range
      validateCurrentMarksAgainstRanges()
    } else {
      console.error('Invalid response format for chapter marks ranges:', response.data)
      showErrorToast('Failed to load valid marks ranges. Please try again.')
    }
  } catch (error) {
    console.error('Error fetching chapter marks ranges:', error)
    showErrorToast('Failed to load valid marks ranges. Please try again.')
  } finally {
    isLoadingRanges.value = false
  }
}

// Validate that current marks are within range and adjust if needed
const validateCurrentMarksAgainstRanges = () => {
  for (const chapter of chapterMarksData.value) {
    const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.chapterId)
    if (range && !range.possibleMarks.includes(chapter.marks)) {
      console.log(`Chapter ${chapter.chapterId} marks (${chapter.marks}) not in valid range, adjusting...`)
      
      // Find closest valid mark
      const closestMark = range.possibleMarks.reduce((prev, curr) => {
        return Math.abs(curr - chapter.marks) < Math.abs(prev - chapter.marks) ? curr : prev
      }, range.possibleMarks[0])
      
      chapter.marks = closestMark
    }
  }
  updatePercentages()
}

// Method to get the next valid mark for a chapter (for increment)
const getNextValidMark = (chapter: ChapterMarks): number => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.chapterId)
  
  // If no range found, just increment by 1
  if (!range) return chapter.marks + 1
  
  // Find the next valid mark in the possibleMarks array
  const nextMark = range.possibleMarks.find(mark => mark > chapter.marks)
  
  // If no next mark found, return the current mark
  return nextMark ?? chapter.marks
}

// Method to get the previous valid mark for a chapter (for decrement)
const getPreviousValidMark = (chapter: ChapterMarks): number => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.chapterId)
  
  // If no range found, just decrement by 1 (but not below 0)
  if (!range) return Math.max(0, chapter.marks - 1)
  
  // Find all marks less than the current mark
  const previousMarks = range.possibleMarks.filter(mark => mark < chapter.marks)
  
  // Return the highest previous mark, or 0 if none found
  return previousMarks.length > 0 ? Math.max(...previousMarks) : 0
}

// Method to check if decrement is available for a chapter
const canDecrement = (chapter: ChapterMarks): boolean => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.chapterId)
  
  // If no range found, allow decrement if marks > 0
  if (!range) return chapter.marks > 0
  
  // Check if there are any valid marks less than the current mark
  return range.possibleMarks.some(mark => mark < chapter.marks)
}

// Method to check if increment is available for a chapter
const canIncrement = (chapter: ChapterMarks): boolean => {
  // Find the range for this chapter
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.chapterId)
  
  // If no range found, allow increment (no limit)
  if (!range) return true
  
  // Check if there are any valid marks greater than the current mark
  return range.possibleMarks.some(mark => mark > chapter.marks)
}

// Helper method to get the valid marks tooltip text
const getValidMarksTooltip = (chapter: ChapterMarks): string => {
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.chapterId)
  if (!range) return 'Any positive number'
  
  if (range.possibleMarks.length <= 10) {
    // Show all marks if there are 10 or fewer
    return range.possibleMarks.join(', ')
  } else {
    // Show first 5 and last 5 with ellipsis in between
    const first = range.possibleMarks.slice(0, 5).join(', ')
    const last = range.possibleMarks.slice(-5).join(', ')
    return `${first}, ... , ${last}`
  }
}

// Helper method to get the chapter marks range display text
const getChapterMarksRange = (chapter: ChapterMarks): string => {
  const range = chapterMarksRanges.value.find(r => r.chapterId === chapter.chapterId)
  if (!range) return ''
  
  return `${range.minMarks} - ${range.maxMarks}`
}

// Marks control methods (updated to use valid ranges)
const incrementMarks = (index: number) => {
  const chapter = chapterMarksData.value[index]
  if (canIncrement(chapter)) {
    const nextValidMark = getNextValidMark(chapter)
    // Allow increment even if it exceeds total marks (user can adjust other chapters)
    chapter.marks = nextValidMark
    hasManualChanges.value = true
    
    // Clear allocation data since marks changed manually
    latestAllocationData.value = null
    
    updatePercentages()
  }
}

const decrementMarks = (index: number) => {
  const chapter = chapterMarksData.value[index]
  if (canDecrement(chapter)) {
    const previousValidMark = getPreviousValidMark(chapter)
    chapter.marks = previousValidMark
    hasManualChanges.value = true
    
    // Clear allocation data since marks changed manually
    latestAllocationData.value = null
    
    updatePercentages()
  }
}

// Generate marks distribution using API
const applyDistributionResponse = (distributionData: any) => {
  latestAllocationData.value = distributionData
  console.log('latestAllocationData set to:', latestAllocationData.value)
  hasManualChanges.value = false

  if (distributionData?.chapterMarks) {
    for (const apiChapter of distributionData.chapterMarks) {
      const localChapter = chapterMarksData.value.find(c => c.chapterId === apiChapter.chapterId)
      if (localChapter) {
        localChapter.marks = apiChapter.absoluteMarks
      }
    }
    updatePercentages()
  }

  showSuccessToast('Marks distribution generated successfully!')
}

const generateMarksDistribution = async () => {
  if (!patternId) {
    showErrorToast('Pattern ID is missing')
    return
  }

  try {
    isGeneratingMarks.value = true
    
    const chapterIds = chapterMarksData.value.map(c => c.chapterId)
    const requestedMarks = chapterMarksData.value.map(c => c.marks)
    const mediumIds = route.query.mediumId ? [Number.parseInt(route.query.mediumId as string)] : [1]

    const params = new URLSearchParams({
      patternId: patternId,
      chapterIds: chapterIds.join(','),
      mediumIds: mediumIds.join(','),
      requestedMarks: requestedMarks.join(','),
      questionOrigin: 'both'
    })

    console.log('Calling Generate API:', `/chapter-marks-distribution/distribute?${params}`)
    const response = await axiosInstance.get(`/chapter-marks-distribution/distribute?${params}`)
    console.log('Generate API response:', response.data)
    
    if (response.data?.data) {
      applyDistributionResponse(response.data.data)
    } else if (response.data) {
      console.log('Response data structure different than expected, using response.data directly')
      applyDistributionResponse(response.data)
    } else {
      console.error('No data in response:', response.data)
      showErrorToast('Failed to generate marks distribution - no data received')
    }
  } catch (error: any) {
    console.error('Error generating marks distribution:', error)
    if (error.response) {
      console.error('Error response data:', error.response.data)
      console.error('Error response status:', error.response.status)
    }
    showErrorToast(error.response?.data?.message || 'Failed to generate marks distribution')
  } finally {
    isGeneratingMarks.value = false
  }
}

// Generate equally distribution function
const generateEquallyMarksDistribution = async () => {
  if (isGeneratingEqually.value || !totalMarks.value || chapterMarksData.value.length === 0) {
    return;
  }

  isGeneratingEqually.value = true;
  
  try {
    console.log('Calling Generate Equally API...')
    
    // Get the parameters from the current context
    const patternIdNum = Number.parseInt(patternId);
    const chapterIds = chapterMarksData.value.map(chapter => chapter.chapterId);
    const mediumIds = [Number.parseInt(mediumId)];
    
    // Call the test-paper allocation API
    const response = await axiosInstance.get('/create-test-paper/allocation', {
      params: {
        patternId: patternIdNum,
        chapterIds: chapterIds,
        mediumIds: mediumIds,
        questionOrigin: 'both'
      }
    })

    if (response.status !== 200) {
      console.error(`Auto allocation API request failed with status: ${response.status}`)
      return
    }

    const allocationData = response.data
    console.log('Generate Equally API response:', allocationData)
    
    // Update chapter marks from API response
    if (allocationData.chapterMarks && Array.isArray(allocationData.chapterMarks)) {
      // Store the latest allocation data for preview - CRITICAL FOR ENABLING PREVIEW BUTTON
      latestAllocationData.value = allocationData
      console.log('latestAllocationData set from Generate Equally:', latestAllocationData.value)
      
      for (const apiChapter of allocationData.chapterMarks) {
        const chapter = chapterMarksData.value.find(c => c.chapterId === apiChapter.chapterId);
        if (chapter) {
          chapter.marks = apiChapter.absoluteMarks;
          // Recalculate percentage
          chapter.percentage = calculatePercentage(apiChapter.absoluteMarks);
        }
      }

      console.log('Marks distributed from Generate Equally API:', 
        allocationData.chapterMarks.map(c => `${c.chapterName}: ${c.absoluteMarks}`));

      // Show success message
      showSuccessToast('Marks distributed equally from server!');
      hasManualChanges.value = false
    } else {
      console.error('Invalid Generate Equally API response format:', allocationData)
      throw new Error('Invalid API response format');
    }

  } catch (error) {
    console.error('Error in generateEquallyMarksDistribution:', error);
    showErrorToast('Failed to get marks distribution from server. Please try again.');
  } finally {
    isGeneratingEqually.value = false;
  }
};

// Navigation functions
const goBack = () => {
  router.back()
}

// Navigate to preview test paper page
const navigateToPreview = async () => {
  try {
    // Show loading state
    isGeneratingMarks.value = true
    
    // Check if we have the latest allocation data from Generate or Generate Equally
    if (!latestAllocationData.value) {
      showErrorToast('Please click "Generate" or "Generate Equally" first to create the allocation data.')
      return
    }
    
    console.log('Using stored allocation data for final-questions-distribution:', latestAllocationData.value)
    
    // Call the final questions distribution API with the stored allocation data
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', latestAllocationData.value)
    
    console.log('Final questions distribution response:', response.data)
    
    if (response.data) {
      // Store the response in localStorage for the preview page
      localStorage.setItem('finalQuestionsDistribution', JSON.stringify(response.data))
      
      // Navigate to preview page with the response data flag
      router.push({
        path: '/teacher/assign-test/preview-test-paper',
        query: {
          ...route.query, // Pass all current query parameters
          totalMarks: totalMarks.value.toString(),
          hasFinalDistribution: 'true' // Flag to indicate data is available
        }
      })
    } else {
      showErrorToast('No data received from questions distribution API')
    }
  } catch (error: any) {
    console.error('Error getting questions distribution:', error)
    showErrorToast(error.response?.data?.message || 'Failed to get questions distribution. Please try again.')
  } finally {
    isGeneratingMarks.value = false
  }
}

// Toast notification functions
const showSuccessToast = (message: string) => {
  toastTitle.value = 'Success'
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
}

const showErrorToast = (message: string) => {
  toastTitle.value = 'Error'
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
}

const closeToast = () => {
  showToast.value = false
}

// Calculate percentage for a given marks value (matches createTestPaperDetail.vue)
const calculatePercentage = (marks: number): number => {
  if (!totalMarks.value) return 0
  return Math.round((marks / totalMarks.value) * 100)
}

// Update percentages for all chapters based on their current marks
const updatePercentages = () => {
  for (const chapter of chapterMarksData.value) {
    chapter.percentage = calculatePercentage(chapter.marks)
  }
}

// Initialize component
onMounted(async () => {
  // Fetch user profile first to get correct board name
  await fetchUserProfile()
  
  // Check if we have chapter data from previous pages
  if (chaptersFromQuery.length === 0) {
    console.error('No chapters data found from previous pages')
    showErrorToast('No chapters selected. Please go back and select chapters.')
    return
  }
  
  // Initialize chapter marks data with actual chapters from previous pages
  await initializeChapterMarksData()
  
  // Then fetch pattern details and update if needed
  await fetchPatternDetails()
  
  // Fetch chapter marks ranges if not already loaded
  if (chapterMarksRanges.value.length === 0 && chapterMarksData.value.length > 0) {
    await fetchChapterMarksRanges()
  }
  
  // Auto-call the allocation API when page loads (only if we have valid data)
  if (chapterMarksData.value.length > 0) {
    await autoGenerateAllocation()
  }
})

// Auto-generate allocation when page loads
const autoGenerateAllocation = async () => {
  if (!patternId || chapterMarksData.value.length === 0) {
    console.log('Skipping auto allocation - missing patternId or chapter data')
    return
  }

  try {
    console.log('Auto-generating allocation on page load...')
    
    // Get the parameters from the current context
    const patternIdNum = Number.parseInt(patternId)
    const chapterIds = chapterMarksData.value.map(chapter => chapter.chapterId)
    const mediumIds = [Number.parseInt(mediumId)]
    
    // Call the test-paper allocation API
    const response = await axiosInstance.get('/create-test-paper/allocation', {
      params: {
        patternId: patternIdNum,
        chapterIds: chapterIds,
        mediumIds: mediumIds,
        questionOrigin: 'both'
      }
    })

    if (response.status !== 200) {
      console.error(`Auto allocation API request failed with status: ${response.status}`)
      return
    }

    const allocationData = response.data
    
    // Update chapter marks from API response
    if (allocationData.chapterMarks && Array.isArray(allocationData.chapterMarks)) {
      // Store the latest allocation data for preview - THIS IS KEY!
      latestAllocationData.value = allocationData
      
      for (const apiChapter of allocationData.chapterMarks) {
        const chapter = chapterMarksData.value.find(c => c.chapterId === apiChapter.chapterId)
        if (chapter) {
          chapter.marks = apiChapter.absoluteMarks
          // Recalculate percentage
          chapter.percentage = calculatePercentage(apiChapter.absoluteMarks)
        }
      }

      console.log('Auto allocation completed successfully:', 
        allocationData.chapterMarks.map(c => `${c.chapterName}: ${c.absoluteMarks}`))
      
      // Reset manual changes flag since we have fresh data
      hasManualChanges.value = false
    } else {
      console.error('Invalid auto allocation API response format:', allocationData)
    }

  } catch (error) {
    console.error('Error in auto allocation:', error)
    // Don't show error toast for auto allocation failure as it's background operation
  }
}

// Helper method to get the chapter display number
const getChapterDisplayNumber = (chapter: ChapterMarks, index: number): string => {
  // Find the original chapter data to get the sequential number
  const originalChapter = chaptersFromQuery.find((ch: any) => ch.id === chapter.chapterId)
  if (originalChapter && originalChapter.sequential_chapter_number) {
    return originalChapter.sequential_chapter_number.toString()
  }
  // Fallback to index + 1 if no sequential number is available
  return (index + 1).toString()
}
</script>

<style scoped>
/* Form styling */
.test-paper-form {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.form-label {
  color: #212529;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border-radius: 6px;
  border: 1px solid #ced4da;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  outline: 0;
}

.form-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Switch styling */
.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Button styling */
.btn {
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5c636a;
  border-color: #565e64;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Table styling */
.table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table th {
  background-color: #212529;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  border: none;
}

.table td {
  vertical-align: middle;
  border-color: #e9ecef;
}

.table-light th {
  background-color: #f8f9fa;
  color: #212529;
}

/* Pattern sections styling */
.pattern-sections {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

/* Header styling */
.text-muted {
  color: #6c757d !important;
}

h4, h5 {
  font-weight: 600;
  color: #212529;
}

h5 {
  color: #0d6efd !important;
}

/* Close button styling */
.btn-close {
  transition: all 0.2s ease;
}

.btn-close:hover {
  transform: rotate(90deg);
}

/* Optional info styling */
.optional-info-marks-heading {
  background-color: rgba(0,0,0,0.1);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .test-paper-form {
    padding: 1.5rem;
  }
  
  h4 {
    font-size: 1.4rem;
  }
  
  .fs-5 {
    font-size: 1rem !important;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.justify-content-between .btn {
    width: 100%;
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
  
  .test-paper-form {
    padding: 1rem;
  }
  
  .table-responsive {
    font-size: 0.85rem;
  }
}

/* Loading states */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Form validation styling */
.form-control:invalid {
  border-color: #dc3545;
}

.form-control:valid {
  border-color: #198754;
}

/* Animation for form elements */
.form-control, .form-select, .btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus ring improvements */
.form-control:focus,
.form-select:focus,
.form-check-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

/* Chapter Marks Distribution Styling */
.chapter-marks-container {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.chapter-marks-section {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  margin-bottom: 2rem;
}

.chapter-marks-table {
  margin-bottom: 0;
}

.chapter-marks-table.borderless,
.chapter-marks-table.borderless th,
.chapter-marks-table.borderless td {
  border: none !important;
}

.chapter-marks-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.chapter-marks-table td {
  vertical-align: middle;
}

.marks-control {
  gap: 0.5rem;
}

.marks-btn-rect {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2px solid #6c757d;
  transition: all 0.2s ease;
}

.marks-btn-rect:hover:not(:disabled) {
  background-color: #6c757d;
  color: white;
  transform: scale(1.05);
}

.marks-btn-rect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.marks-display {
  min-width: 60px;
  text-align: center;
}

.marks-number {
  font-size: 1.2rem;
  color: #495057;
  cursor: help;
  position: relative;
}

.marks-number:hover {
  color: #0d6efd;
}

/* Marks range display styling */
.marks-display small {
  font-size: 0.7rem;
  font-weight: 500;
  color: #6c757d;
  min-height: 1rem;
}

/* Loading indicator for ranges */
.marks-range-loading {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #6c757d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.summary-label {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

/* Pattern sections table styling */
.pattern-sections-table {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chapter-marks-container,
  .chapter-marks-section,
  .pattern-sections-table {
    padding: 1rem;
  }
  
  .marks-control {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .marks-btn-rect {
    width: 28px;
    height: 28px;
  }
  
  .marks-number {
    font-size: 1rem;
  }
  
  h4 {
    font-size: 1.4rem;
  }
  
  .fs-5 {
    font-size: 1rem !important;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.justify-content-between .btn {
    width: 100%;
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
  
  .chapter-marks-container {
    padding: 1rem;
  }
  
  .table-responsive {
    font-size: 0.85rem;
  }
}
</style> 