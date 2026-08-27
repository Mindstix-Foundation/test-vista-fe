<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/pattern" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Pattern</h4>
        </div>
      </div>
      <hr />
    </div>
    <div v-if="loading" class="row justify-content-center mt-5">
      <output class="spinner-border text-primary">
        <span class="visually-hidden">Loading...</span>
      </output>
    </div>
    <div v-else-if="error" class="row justify-content-center mt-5">
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>
    <div v-else id="form-container" class="row mt-4 justify-content-center">
      <PatternFormComponent
        @updatePatternInfo="handlePatternUpdate"
        @addSection="handleAddSection"
        @editSection="editSection"
        @deleteSection="deleteSection"
        @totalMarksChanged="handleTotalMarksChange"
        :initial-data="formData"
        :sections="patternStore.sections"
        :is-edit-mode="true"
        ref="formComponent"
      />
    </div>
  </div>

  <!-- Delete Section Confirmation Modal -->
  <div
    class="modal fade"
    id="deleteSectionModal"
    tabindex="-1"
    aria-labelledby="deleteSectionModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="deleteSectionModalLabel">Delete Section</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Are you sure you want to delete this section?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmDeleteSection">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PatternFormComponent from '@/components/forms/PatternFormComponent.vue'
import type { FormData } from '@/components/forms/PatternFormComponent.vue'
import axiosInstance from '@/config/axios'
import { usePatternStore } from '@/stores/pattern'
import { Modal } from 'bootstrap'
import { useToastStore } from '@/store/toast'

interface QuestionType {
  id: number
  type_name: string
}

interface SectionQuestionType {
  id: number
  section_id: number
  seqencial_subquestion_number: number
  question_type_id: number
  question_type: QuestionType
}

interface Board {
  id: number
  name: string
  abbreviation: string
  address_id: number
  created_at: string
  updated_at: string
}

interface Standard {
  id: number
  board_id: number
  name: string
  created_at: string
  updated_at: string
}

interface Subject {
  id: number
  board_id: number
  name: string
  created_at: string
  updated_at: string
}

interface Section {
  id: number
  pattern_id: number
  section_number: number
  sequence_number: number
  sub_section: string | null
  sectionName: string
  questionType: string
  requiredQuestions: number
  marksPerQuestion: number
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  created_at: string
  updated_at: string
  isModified?: boolean
  isNew?: boolean
  questionTypes?: string[]
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
  board: Board
  standard: Standard
  subject: Subject
  sections: Section[]
}

interface PatternUpdateData {
  pattern_name: string
  board_id: number | undefined
  standard_id: number | undefined
  subject_id: number | undefined
  total_marks: number
}

const router = useRouter()
const route = useRoute()
const patternStore = usePatternStore()
const toastStore = useToastStore()
const formComponent = ref<InstanceType<typeof PatternFormComponent> | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const formData = ref<FormData>({
  patternName: '',
  selectedBoard: null,
  selectedStandard: null,
  selectedSubject: null,
  totalMarks: 0,
})

// Track sections to be deleted
const sectionsToDelete = ref<number[]>([])
const sectionToDeleteIndex = ref<number | null>(null)
let deleteSectionModal: Modal | null = null

// Add this near the top of the script section
const isFirstMount = ref(true);

// Add the total marks change handler
const handleTotalMarksChange = (totalMarks: number) => {
  console.log('EditPattern - Total marks changed:', totalMarks)
  
  // Update the local formData
  formData.value.totalMarks = totalMarks
  
  // Update the store
  patternStore.formData.totalMarks = totalMarks
  
  // Recalculate remaining marks in the store
  console.log('EditPattern - Updated total marks in store:', patternStore.formData.totalMarks)
  console.log('EditPattern - New remaining marks:', patternStore.remainingMarks)
}

// Fetch pattern data
const fetchPattern = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch pattern details
    const { data: pattern }: { data: Pattern } = await axiosInstance.get(
      `/patterns/${route.params.id}`,
    )

    // Set form data
    formData.value = {
      patternName: pattern.pattern_name,
      selectedBoard: {
        id: pattern.board.id,
        name: pattern.board.name,
        abbreviation: pattern.board.abbreviation,
        standards: [], // We'll need to fetch these separately
        subjects: [], // We'll need to fetch these separately
      },
      selectedStandard: {
        id: pattern.standard.id,
        name: pattern.standard.name,
      },
      selectedSubject: {
        id: pattern.subject.id,
        name: pattern.subject.name,
      },
      totalMarks: pattern.total_marks,
    }

    // Fetch board details to get standards and subjects
    const { data: board } = await axiosInstance.get(`/boards/${pattern.board_id}`)

    // Update board with standards and subjects
    if (formData.value.selectedBoard) {
      formData.value.selectedBoard.standards = board.standards
      formData.value.selectedBoard.subjects = board.subjects
    }

    // Set sections in store
    patternStore.sections = pattern.sections.map((section: Section) => ({
      id: section.id,
      questionNumber: section.section_number.toString(),
      subQuestion: section.sub_section,
      sectionName: section.section_name,
      totalQuestions: section.total_questions,
      requiredQuestions: section.mandotory_questions,
      marksPerQuestion: section.marks_per_question,
      sameType: true,
      questionType: '',
      questionTypes: [],
      seqencial_section_number: section.sequence_number,
      isNew: false, // Flag to track if this is a new section
      isModified: false, // Flag to track if this section has been modified
    }))

    // Fetch question types for each section
    for (const section of pattern.sections) {
      const { data: questionTypes } = await axiosInstance.get(
        `/subsection-question-types?sectionId=${section.id}`,
      )
      const sectionIndex = patternStore.sections.findIndex((s) => s.id === section.id)
      if (sectionIndex !== -1) {
        // Check if there's a single entry with sequential number 0
        const hasCommonType = questionTypes.some(
          (qt: SectionQuestionType) => qt.seqencial_subquestion_number === 0,
        )

        if (hasCommonType) {
          // If sequential number is 0, all questions have the same type
          const commonType = questionTypes.find(
            (qt: SectionQuestionType) => qt.seqencial_subquestion_number === 0,
          )
          patternStore.sections[sectionIndex].sameType = true
          patternStore.sections[sectionIndex].questionType =
            commonType?.question_type?.type_name || ''
          patternStore.sections[sectionIndex].questionTypes = [
            commonType?.question_type?.type_name || '',
          ]
        } else {
          // Multiple question types
          patternStore.sections[sectionIndex].sameType = false
          patternStore.sections[sectionIndex].questionType = ''
          patternStore.sections[sectionIndex].questionTypes = questionTypes
            .sort(
              (a: SectionQuestionType, b: SectionQuestionType) =>
                a.seqencial_subquestion_number - b.seqencial_subquestion_number,
            )
            .map((qt: SectionQuestionType) => qt.question_type.type_name)
        }
      }
    }

    // Store original pattern data for comparison
    patternStore.setFormData(formData.value)

    // Only clear tracked changes on first mount
    if (isFirstMount.value) {
      console.log('EditPattern - First mount, clearing sections to delete');
      sectionsToDelete.value = [];
    } else {
      console.log('EditPattern - Not first mount, preserving sections to delete:', sectionsToDelete.value);
    }
  } catch (err) {
    console.error('Error fetching pattern:', err)
    error.value = 'Failed to load pattern data. Please try again.'
  } finally {
    loading.value = false
  }
}

const handlePatternUpdate = async (updateData: PatternUpdateData) => {
  try {
    loading.value = true
    error.value = null
    
    // Update pattern basic details
    await updatePatternBasicDetails(updateData)
    
    // Process section changes
    await processSectionChanges()
    
    // Show success toast and navigate back
    handleSuccess()
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

// Helper function to update pattern basic details
const updatePatternBasicDetails = async (updateData: PatternUpdateData) => {
  await axiosInstance.put(`/patterns/${route.params.id}`, {
    pattern_name: updateData.pattern_name,
    board_id: updateData.board_id,
    standard_id: updateData.standard_id,
    subject_id: updateData.subject_id,
    total_marks: formData.value.totalMarks,
  })
  
  // Log debug info
  logDebugInfo()
}

// Helper function to log debug information
const logDebugInfo = () => {
  console.log('=== DEBUG: Sections to Delete ===')
  console.log('Current sectionsToDelete array:', sectionsToDelete.value)
  console.log('Current sections in store:', patternStore.sections.map(s => ({
    id: s.id,
    name: s.sectionName
  })))
  console.log('================================')
  
  // Log and check sequence numbers
  const sequenceNumbers = patternStore.sections.map(s => s.seqencial_section_number).sort((a, b) => a - b)
  console.log('Current sequence numbers (sorted):', sequenceNumbers)
  
  // Check for duplicate sequence numbers
  const uniqueSequenceNumbers = new Set(sequenceNumbers)
  if (uniqueSequenceNumbers.size !== sequenceNumbers.length) {
    handleDuplicateSequenceNumbers(sequenceNumbers)
  }
  
  console.log('Sections in store:', patternStore.sections.map(s => ({
    id: s.id,
    sectionName: s.sectionName,
    sequenceNumber: s.seqencial_section_number,
    isNew: s.isNew,
    isModified: s.isModified
  })))
}

// Helper function to handle duplicate sequence numbers
const handleDuplicateSequenceNumbers = (sequenceNumbers: number[]) => {
  console.warn('WARNING: Duplicate sequence numbers detected!')
  
  // Find duplicates
  const counts: Record<number, number> = {}
  const duplicates: number[] = []
  for (const num of sequenceNumbers) {
    counts[num] = (counts[num] || 0) + 1
    if (counts[num] > 1 && !duplicates.includes(num)) {
      duplicates.push(num)
    }
  }
  
  console.warn('Duplicate sequence numbers:', duplicates)
  
  // Auto-fix duplicate sequence numbers
  console.log('Auto-fixing duplicate sequence numbers...')
  
  // Sort sections
  const sortedSections = [...patternStore.sections].sort((a, b) => {
    if (a.seqencial_section_number !== b.seqencial_section_number) {
      return a.seqencial_section_number - b.seqencial_section_number
    }
    if (a.id && b.id) {
      return a.id - b.id
    }
    return 0
  })
  
  // Reassign sequence numbers
  for (const [index, section] of sortedSections.entries()) {
    const newSequenceNumber = index + 1
    if (section.seqencial_section_number !== newSequenceNumber) {
      console.log(`Changing sequence number for section "${section.sectionName}" from ${section.seqencial_section_number} to ${newSequenceNumber}`)
      section.seqencial_section_number = newSequenceNumber
      section.isModified = true
    }
  }
  
  // Log the fixed sequence numbers
  console.log('Fixed sequence numbers:', patternStore.sections.map(s => ({
    id: s.id,
    sectionName: s.sectionName,
    sequenceNumber: s.seqencial_section_number
  })))
}

// Helper function to process all section changes
const processSectionChanges = async () => {
  // Process in three steps:
  // 1. Delete sections marked for deletion
  await deleteSections()
  
  // 2. Update existing sections
  await updateExistingSections()
  
  // 3. Create new sections
  await createNewSections()
}

// Helper function to delete sections
const deleteSections = async () => {
  console.log('STEP 1: Deleting sections')
  console.log(`Found ${sectionsToDelete.value.length} sections to delete:`, sectionsToDelete.value)
  
  if (sectionsToDelete.value.length > 0) {
    console.log('Sections to delete are available, proceeding with deletion')
    const sectionsToDeleteCopy = [...sectionsToDelete.value]
    
    for (const sectionId of sectionsToDeleteCopy) {
      try {
        console.log(`Attempting to delete section with ID: ${sectionId}`)
        console.log(`DELETE API call: /sections/${sectionId}`)
        const response = await axiosInstance.delete(`/sections/${sectionId}`)
        console.log(`API response for deletion:`, response)
        console.log(`Successfully deleted section with ID: ${sectionId}`)
      } catch (error) {
        console.error(`Error deleting section with ID: ${sectionId}:`, error)
        throw new Error(`Failed to delete section with ID: ${sectionId}`)
      }
    }
    
    // Clear the sectionsToDelete array after successful deletion
    console.log('All sections deleted successfully, clearing sectionsToDelete array')
    sectionsToDelete.value = []
    
    // Clear localStorage
    try {
      localStorage.removeItem('sectionsToDelete')
      console.log('Cleared sectionsToDelete from localStorage')
    } catch (error) {
      console.error('Error clearing sectionsToDelete from localStorage:', error)
    }
  } else {
    console.log('No sections to delete, skipping deletion step')
  }
}

// Helper function to update existing sections
const updateExistingSections = async () => {
  console.log('STEP 2: Updating existing sections')
  const existingSections = patternStore.sections.filter(section => !section.isNew && section.isModified && section.id)
  console.log(`Found ${existingSections.length} existing sections to update`)
  
  for (const section of existingSections) {
    if (!section.id) continue
    
    console.log('Updating modified section:', {
      id: section.id,
      sectionName: section.sectionName,
      sequenceNumber: section.seqencial_section_number,
      questionNumber: section.questionNumber
    })
    
    // Update section data
    await axiosInstance.put(`/sections/${section.id}`, {
      sub_section: section.subQuestion,
      section_name: section.sectionName,
      total_questions: section.totalQuestions,
      mandotory_questions: section.requiredQuestions,
      marks_per_question: section.marksPerQuestion,
      sequence_number: section.seqencial_section_number,
      section_number: Number(section.questionNumber),
    })
    
    // Update question types
    await updateSectionQuestionTypes(section)
  }
}

// Helper function to update question types for a section
const updateSectionQuestionTypes = async (section: Section) => {
  try {
    // Delete existing question types
    const { data: currentQuestionTypes } = await axiosInstance.get(
      `/subsection-question-types?sectionId=${section.id}`,
    )

    for (const qt of currentQuestionTypes) {
      await axiosInstance.delete(`/subsection-question-types/${qt.id}`)
    }

    await createQuestionTypesForSection(section)
  } catch (error) {
    console.error('Error updating question types:', error)
  }
};

// Helper function to create question types for a section
const createQuestionTypesForSection = async (section: Section) => {
  try {
    if (section.questionType) {
      // Single question type
      console.log(`Creating question type for section: ${section.questionType}`)
      const questionType = await getQuestionTypeByName(section.questionType)
      if (questionType && section.id) {
        await createSubsectionQuestionType(section.id, 0, questionType.id)
      }
    } else if (section.questionTypes && section.questionTypes.length > 0) {
      // Multiple question types
      console.log(`Creating multiple question types for section: ${section.questionTypes.join(', ')}`)
      for (let i = 0; i < section.questionTypes.length; i++) {
        const questionType = await getQuestionTypeByName(section.questionTypes[i])
        if (questionType && section.id) {
          await createSubsectionQuestionType(section.id, i + 1, questionType.id)
        }
      }
    }
  } catch (error) {
    console.error('Error creating question types:', error)
  }
};

// Helper function to create new sections
const createNewSections = async () => {
  console.log('STEP 3: Creating new sections')
  const newSections = patternStore.sections.filter(section => section.isNew)
  console.log(`Found ${newSections.length} new sections to create`)
  
  for (const section of newSections) {
    console.log('Creating new section:', {
      sectionName: section.sectionName,
      sequenceNumber: section.seqencial_section_number,
      questionNumber: section.questionNumber
    })
    
    // Create section
    const { data: createdSection } = await axiosInstance.post('/sections', {
      pattern_id: Number(route.params.id),
      sequence_number: section.seqencial_section_number,
      section_number: Number(section.questionNumber),
      sub_section: section.subQuestion,
      section_name: section.sectionName,
      total_questions: section.totalQuestions,
      mandotory_questions: section.requiredQuestions,
      marks_per_question: section.marksPerQuestion,
    })
    
    console.log('Section created successfully:', {
      id: createdSection.id,
      sequenceNumber: createdSection.sequence_number
    })
    
    // Create question types for the new section
    await createQuestionTypesForSection({
      ...section,
      id: createdSection.id
    })
  }
}

// Helper function to handle success
const handleSuccess = () => {
  toastStore.showToast({
    type: 'success',
    title: 'Success',
    message: 'Pattern updated successfully!',
  })
  
  // Navigate back to pattern list
  router.push('/admin/pattern')
}

// Helper function to handle error
const handleError = (err: unknown) => {
  console.error('Error updating pattern:', err)
  error.value = 'Failed to update pattern. Please try again.'
  
  // Show error toast
  toastStore.showToast({
    type: 'error',
    title: 'Error',
    message: 'Failed to update pattern. Please try again.',
  })
}

const getQuestionTypeByName = async (typeName: string) => {
  try {
    const { data: types } = await axiosInstance.get('/question-types')
    return types.find((type: { type_name: string }) => type.type_name === typeName)
  } catch (error) {
    console.error('Error fetching question type:', error)
    return null
  }
}

const createSubsectionQuestionType = async (
  sectionId: number,
  sequentialNumber: number,
  questionTypeId: number,
) => {
  const { data } = await axiosInstance.post('/subsection-question-types', {
    section_id: sectionId,
    seqencial_subquestion_number: sequentialNumber,
    question_type_id: questionTypeId,
  })

  return data
}

const handleAddSection = (formData: FormData) => {
  console.log('EditPattern - Adding new section');

  // Save the current form data to the store
  patternStore.setFormData(formData)

  // Find the highest sequence number from existing sections
  const highestSequenceNumber = patternStore.sections.reduce((max, section) => {
    return Math.max(section.seqencial_section_number, max)
  }, 0)

  // Calculate next sequence number (always one more than the highest existing sequence number)
  const nextSequenceNumber = highestSequenceNumber + 1

  // Find the highest Q number (section_number) from existing sections
  const highestSectionNumber = patternStore.sections.reduce((max, section) => {
    const currentNumber = Number.parseInt(section.questionNumber, 10) || 0
    return Math.max(currentNumber, max)
  }, 0)
  const nextSectionNumber = highestSectionNumber + 1

  console.log('EditPattern - Navigation params for adding section:', {
    remainingMarks: formData.remainingMarks || formData.totalMarks,
    highestSequenceNumber,
    nextSequenceNumber,
    nextSectionNumber
  });

  router.push({
    name: 'addSection',
    query: {
      remainingMarks: formData.remainingMarks?.toString() || formData.totalMarks.toString(),
      fromEdit: 'true',
      patternId: route.params.id?.toString(),
      nextSequenceNumber: nextSequenceNumber.toString(), // This is for ordering (1,2,3,4,5)
      nextSectionNumber: nextSectionNumber.toString(), // This is for the Q number
      storeOnly: 'true', // Flag to indicate we want to store in state only
    },
  })
}

const editSection = (index: number) => {
  // Get the current section data
  const sectionToEdit = patternStore.sections[index]
  console.log('EditPattern - Editing section at index:', index);

  // Calculate remaining marks excluding current section's marks
  const currentSectionMarks = sectionToEdit.requiredQuestions * sectionToEdit.marksPerQuestion;

  // Calculate total section marks excluding the current section
  const totalSectionMarksExcludingCurrent = patternStore.sections.reduce((total, section, idx) => {
    if (idx === index) return total; // Skip the current section
    return total + section.requiredQuestions * section.marksPerQuestion;
  }, 0);

  // Calculate remaining marks by subtracting all other sections from total marks
  const totalRemainingMarks = formData.value.totalMarks - totalSectionMarksExcludingCurrent;

  console.log('EditPattern - Marks calculation for editing section:', {
    totalPatternMarks: formData.value.totalMarks,
    totalSectionMarks: patternStore.totalSectionMarks,
    currentSectionMarks,
    totalSectionMarksExcludingCurrent,
    totalRemainingMarks
  });

  router.push({
    name: 'editSection',
    query: {
      sectionIndex: index.toString(),
      remainingMarks: totalRemainingMarks.toString(),
      totalMarks: formData.value.totalMarks.toString(),
      fromEdit: 'true',
      patternId: route.params.id?.toString(),
      sectionId: patternStore.sections[index].id?.toString(),
      sequenceNumber: patternStore.sections[index].seqencial_section_number?.toString(),
      sectionNumber: patternStore.sections[index].questionNumber?.toString(), // This is the Q number
      storeOnly: 'true', // Flag to indicate we want to store in state only
    },
  });
}

const deleteSection = (index: number) => {
  console.log('Delete section called for index:', index)
  sectionToDeleteIndex.value = index
  if (deleteSectionModal) {
    deleteSectionModal.show()
  } else {
    console.error('Delete section modal not initialized')
  }
}

const confirmDeleteSection = () => {
  if (sectionToDeleteIndex.value === null) {
    console.log('No section index provided for deletion, aborting');
    return;
  }

  const sectionToDelete = patternStore.sections[sectionToDeleteIndex.value];
  console.log('Confirming deletion of section:', {
    index: sectionToDeleteIndex.value,
    id: sectionToDelete.id,
    name: sectionToDelete.sectionName,
    sequenceNumber: sectionToDelete.seqencial_section_number
  });

  // If the section has an ID (exists in the database), add it to the list to be deleted on save
  if (sectionToDelete.id) {
    console.log(`Adding section ID ${sectionToDelete.id} to deletion list - will be deleted when pattern is saved`);

    // Check if the ID is already in the array to avoid duplicates
    if (sectionsToDelete.value.includes(sectionToDelete.id)) {
      console.log(`Section ID ${sectionToDelete.id} already in deletion list, skipping`);
    } else {
      sectionsToDelete.value.push(sectionToDelete.id);
      console.log(`Section ID ${sectionToDelete.id} added to deletion list`);
    }

    console.log('Updated sections to delete:', sectionsToDelete.value);

    // Store the sectionsToDelete array in localStorage as a backup
    try {
      localStorage.setItem('sectionsToDelete', JSON.stringify(sectionsToDelete.value));
      console.log('Saved sectionsToDelete to localStorage');
    } catch (error) {
      console.error('Failed to save sectionsToDelete to localStorage:', error);
    }
  } else {
    console.log('Section does not have an ID (new section), removing from UI only');
  }

  // Remove from the store (removes from UI immediately)
  patternStore.removeSection(sectionToDeleteIndex.value);
  console.log('Section removed from store, remaining sections:', patternStore.sections.length);

  // Hide modal
  deleteSectionModal?.hide();
  sectionToDeleteIndex.value = null;
}

// Add a watch to monitor sections changes
watch(
  () => patternStore.sections,
  (newSections) => {
    // Only log when there are actual changes that matter
    if (newSections.some(section => section.isModified)) {
      console.log('EditPattern - Modified sections in store detected');
    }
  },
  { deep: true }
);

// Add a watch to monitor totalMarks changes from the local form
watch(
  () => formData.value.totalMarks,
  (newTotalMarks) => {
    console.log('EditPattern - Total marks changed in form, updating store:', newTotalMarks);
    patternStore.formData.totalMarks = newTotalMarks;
  }
);

// Add a watch to monitor totalMarks changes from the store
watch(
  () => patternStore.formData.totalMarks,
  (newTotalMarks) => {
    console.log('EditPattern - Total marks changed in store, updating form:', newTotalMarks);
    formData.value.totalMarks = newTotalMarks;
    
    // Force recalculation in the form component
    if (formComponent.value) {
      formComponent.value.recalculateRemainingMarks?.();
    }
  }
);

// Add a watch to monitor sectionsToDelete changes
watch(
  () => sectionsToDelete.value,
  (newSectionsToDelete) => {
    console.log('EditPattern - Sections to delete changed:', newSectionsToDelete);
  },
  { deep: true }
);

// Helper function to restore sections to delete from localStorage
const restoreSectionsToDeleteFromLocalStorage = () => {
  try {
    const savedSectionsToDelete = localStorage.getItem('sectionsToDelete');
    if (!savedSectionsToDelete) return;
    
    const parsedSectionsToDelete = JSON.parse(savedSectionsToDelete);
    
    if (Array.isArray(parsedSectionsToDelete) && parsedSectionsToDelete.length > 0) {
      console.log('Found saved sections to delete in localStorage:', parsedSectionsToDelete);
      
      // Only restore if sectionsToDelete is empty
      if (sectionsToDelete.value.length === 0) {
        sectionsToDelete.value = parsedSectionsToDelete;
        console.log('Restored sections to delete from localStorage');
      } else {
        console.log('sectionsToDelete already has values, not restoring from localStorage');
      }
    }
  } catch (error) {
    console.error('Error checking localStorage for sectionsToDelete:', error);
  }
};

// Helper functions to reduce complexity
const restoreFormDataFromPatternStore = () => {
  if (patternStore.formData) {
    formData.value = { ...patternStore.formData };
    console.log('EditPattern - Restored form data from pattern store:', formData.value);
  }
};

const logSectionChanges = (modifiedSections: Section[], newSections: Section[]) => {
  console.log('EditPattern - Found modified sections:',
    modifiedSections.map(s => ({
      id: s.id,
      name: s.sectionName,
      questionType: s.questionType,
      requiredQuestions: s.requiredQuestions,
      marksPerQuestion: s.marksPerQuestion,
      totalMarks: s.requiredQuestions * s.marksPerQuestion,
      isModified: s.isModified
    }))
  );

  console.log('EditPattern - Found new sections:',
    newSections.map(s => ({
      name: s.sectionName,
      questionType: s.questionType,
      requiredQuestions: s.requiredQuestions,
      marksPerQuestion: s.marksPerQuestion,
      totalMarks: s.requiredQuestions * s.marksPerQuestion,
      isNew: s.isNew
    }))
  );
};

const recalculateMarks = () => {
  // Force recalculation of remaining marks in the pattern store
  const totalSectionMarks = patternStore.sections.reduce((total, section) => {
    const sectionMarks = section.requiredQuestions * section.marksPerQuestion;
    console.log(`EditPattern - Section ${section.sectionName}: ${sectionMarks} marks`);
    return total + sectionMarks;
  }, 0);

  const newRemainingMarks = formData.value.totalMarks - totalSectionMarks;

  console.log('EditPattern - Recalculating remaining marks after section modification:', {
    totalPatternMarks: formData.value.totalMarks,
    totalSectionMarks,
    newRemainingMarks
  });

  return { totalSectionMarks, newRemainingMarks };
};

const updateFormComponentMarks = () => {
  if (formComponent.value) {
    // Force a recalculation in the component
    setTimeout(() => {
      if (formComponent.value) {
        console.log('EditPattern - Updating form component remaining marks');
        // Trigger a recalculation in the PatternFormComponent
        formComponent.value.recalculateRemainingMarks?.();
      }
    }, 0);
  }
};

const handleSectionChanges = () => {
  const modifiedSections = patternStore.sections.filter(section => section.isModified);
  const newSections = patternStore.sections.filter(section => section.isNew);
  
  if (modifiedSections.length > 0 || newSections.length > 0) {
    logSectionChanges(modifiedSections, newSections);
    recalculateMarks();
    updateFormComponentMarks();
  }
};

onMounted(() => {
  console.log('EditPattern - Component mounted, isFirstMount:', isFirstMount.value);
  console.log('EditPattern - Current sections to delete:', sectionsToDelete.value);

  // Check if there are any saved sections to delete in localStorage
  restoreSectionsToDeleteFromLocalStorage();

  // Check if we're returning from EditSection or AddSection
  const previousRoute = router.currentRoute.value.query.from;
  const hasModifiedSections = patternStore.sections.some(section => section.isModified);
  const hasNewSections = patternStore.sections.some(section => section.isNew);

  if (previousRoute === 'editSection' && (hasModifiedSections || hasNewSections)) {
    console.log('EditPattern - Returning from EditSection with modified or new data, skipping fetch');
    restoreFormDataFromPatternStore();
  } else if (isFirstMount.value) {
    console.log('EditPattern - First mount, fetching pattern data');
    fetchPattern();
    isFirstMount.value = false;
  } else {
    console.log('EditPattern - Remounted but not from EditSection, skipping fetch');
    restoreFormDataFromPatternStore();
  }

  // Initialize delete section modal
  deleteSectionModal = new Modal(document.getElementById('deleteSectionModal')!);
});

// Add a hook to log when the component is activated (when navigating back to it)
onActivated(() => {
  console.log('EditPattern - Component activated');
  console.log('EditPattern - Current sections to delete:', sectionsToDelete.value);

  // Check if we're returning from EditSection or AddSection
  const previousRoute = router.currentRoute.value.query.from;
  
  if (previousRoute === 'editSection') {
    console.log('EditPattern - Activated after returning from EditSection');
    restoreFormDataFromPatternStore();
    handleSectionChanges();
  }
});

// Watch route changes for section modifications
watch(
  () => route.name,
  (newRouteName: string | null, oldRouteName: string | null) => {
    const isReturningFromSectionEdit = (
      (oldRouteName === 'editSection' || oldRouteName === 'addSection') && 
      newRouteName === 'editPattern'
    );
    
    if (isReturningFromSectionEdit) {
      console.log('EditPattern - Navigated back from section editing');
      
      const hasModifiedSections = patternStore.sections.some(section => section.isModified);
      const hasNewSections = patternStore.sections.some(section => section.isNew);
      
      if (hasModifiedSections || hasNewSections) {
        console.log('EditPattern - Modified or new sections detected');
      }
    }
  }
);

onBeforeUnmount(() => {
  const nextRoute = router.currentRoute.value.name
  console.log('EditPattern - Before unmount, sections to delete:', sectionsToDelete.value);

  if (nextRoute !== 'addSection' && nextRoute !== 'editSection') {
    console.log('Clearing form data - navigating to:', nextRoute)
    patternStore.clearFormData()
  } else {
    console.log('Preserving form data for:', nextRoute)
  }
})
</script>

<style scoped>
fieldset {
  border-color: #dee2e6;
}

legend {
  font-size: 1rem;
  margin-bottom: 0;
  color: #6c757d;
}

.form-floating > label {
  left: 0.5rem;
}
</style>
