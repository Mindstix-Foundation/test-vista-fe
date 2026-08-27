<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/pattern" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Create New Pattern</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <PatternFormComponent
        @submit="handleSubmit"
        @addSection="handleAddSection"
        @editSection="editSection"
        @deleteSection="deleteSection"
        :initial-data="patternStore.formData"
        :sections="patternStore.sections"
        ref="formComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PatternFormComponent from '@/components/forms/PatternFormComponent.vue'
import type { FormData } from '@/components/forms/PatternFormComponent.vue'
import axiosInstance from '@/config/axios'
import { usePatternStore } from '@/stores/pattern'
import { useToastStore } from '@/store/toast'

interface QuestionType {
  id: number
  type_name: string
  subsection_question_types: Array<never>
}

const router = useRouter()
const patternStore = usePatternStore()
const toastStore = useToastStore()
const formComponent = ref<InstanceType<typeof PatternFormComponent> | null>(null)
const questionTypes = ref<QuestionType[]>([])

// Fetch question types
const fetchQuestionTypes = async () => {
  try {
    const { data } = await axiosInstance.get('/question-types')
    questionTypes.value = data
  } catch (error) {
    console.error('Error fetching question types:', error)
  }
}

onMounted(() => {
  fetchQuestionTypes()
})

const handleSubmit = async (formData: FormData) => {
  try {
    // First create the pattern
    const { data: pattern } = await axiosInstance.post('/patterns', {
      pattern_name: formData.patternName,
      board_id: formData.selectedBoard?.id,
      standard_id: formData.selectedStandard?.id,
      subject_id: formData.selectedSubject?.id,
      total_marks: formData.totalMarks,
    })

    // Now create all sections for this pattern in sequence
    for (const section of patternStore.sections) {
      console.log('Creating section with sequential number:', section.seqencial_section_number)

      // Create section
      const { data: createdSection } = await axiosInstance.post('/sections', {
        pattern_id: pattern.id,
        sequence_number: section.seqencial_section_number,
        section_number: Number.parseInt(section.questionNumber, 10),
        sub_section: section.subQuestion,
        section_name: section.sectionName,
        total_questions: section.totalQuestions,
        mandotory_questions: section.requiredQuestions,
        marks_per_question: section.marksPerQuestion,
      })

      // Create subsection question types
      if (section.sameType) {
        // If same type for all questions, create single entry with sequential number 0
        const questionType = questionTypes.value.find((qt) => qt.type_name === section.questionType)
        if (questionType) {
          await createSubsectionQuestionType(createdSection.id, 0, questionType.id)
        }
      } else {
        // Create entries for different question types
        for (let i = 0; i < section.questionTypes.length; i++) {
          const questionType = questionTypes.value.find(
            (qt) => qt.type_name === section.questionTypes[i],
          )
          if (questionType) {
            await createSubsectionQuestionType(createdSection.id, i + 1, questionType.id)
          }
        }
      }
    }

    // Show success toast
    toastStore.showToast({
      type: 'success',
      title: 'Success',
      message: 'Pattern created successfully!',
    })

    patternStore.clearFormData()
    router.push('/admin/pattern')
  } catch (error) {
    console.error('Error creating pattern:', error)
    // Show error toast
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to create pattern. Please try again.',
    })
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
  patternStore.setFormData(formData)

  // Find the highest Q number (section_number) from existing sections
  const highestSectionNumber = patternStore.sections.reduce((max, section) => {
    const currentNumber = Number.parseInt(section.questionNumber, 10) || 0
    return Math.max(currentNumber, max)
  }, 0)
  const nextSectionNumber = highestSectionNumber + 1
  const nextSequenceNumber = patternStore.sections.length + 1

  router.push({
    name: 'addSection',
    query: {
      remainingMarks: formData.remainingMarks?.toString() || formData.totalMarks.toString(),
      nextSequenceNumber: nextSequenceNumber.toString(),
      nextSectionNumber: nextSectionNumber.toString(),
    },
  })
}

const editSection = (index: number) => {
  // Get the current section data
  const sectionToEdit = patternStore.sections[index]
  console.log('AddPattern - Editing section:', sectionToEdit)

  // Calculate remaining marks excluding current section's marks
  const currentSectionMarks = sectionToEdit.requiredQuestions * sectionToEdit.marksPerQuestion
  const remainingMarksExcludingCurrent = formComponent.value?.remainingMarks ?? 0
  const totalRemainingMarks = remainingMarksExcludingCurrent + currentSectionMarks

  console.log('AddPattern - Navigation params:', {
    sectionIndex: index,
    currentSectionMarks,
    remainingMarksExcludingCurrent,
    totalRemainingMarks,
    totalMarks: patternStore.formData.totalMarks,
  })

  router.push({
    name: 'editSection',
    query: {
      sectionIndex: index.toString(),
      remainingMarks: totalRemainingMarks.toString(),
      totalMarks: patternStore.formData.totalMarks.toString(),
      sequenceNumber: sectionToEdit.seqencial_section_number?.toString(),
      sectionNumber: sectionToEdit.questionNumber?.toString(),
    },
  })
}

const deleteSection = (index: number) => {
  patternStore.removeSection(index)
}

// Clear form data when component is destroyed, unless we're going to the add section page
onBeforeUnmount(() => {
  const nextRoute = router.currentRoute.value.name
  if (nextRoute !== 'addSection' && nextRoute !== 'editSection') {
    console.log('Clearing form data - navigating to:', nextRoute)
    patternStore.clearFormData()
  } else {
    console.log('Preserving form data for:', nextRoute)
  }
})
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

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
