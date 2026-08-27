import { defineStore } from 'pinia'
import { enforceSectionQuestionTypeForDeliveryMode } from '@/utils/examPatternSection'

export interface ExamPatternFormData {
  patternName: string
  examProgramId: number | null
  examStageId: number | null
  totalMarks: number
  totalQuestions: number | null
  durationMinutes: number | null
  deliveryMode: 'ONLINE_MCQ' | 'ONLINE_MIXED' | 'OFFLINE_PDF'
  negativeMarking: boolean
  negativeMarksRatio: number
}

export interface ExamSectionData {
  id?: number
  questionNumber: string
  subQuestion: string
  sectionName: string
  totalQuestions: number
  requiredQuestions: number
  marksPerQuestion: number
  sameType: boolean
  questionType: string
  questionTypes: string[]
  seqencial_section_number: number
  isNew?: boolean
  isModified?: boolean
}

export const useExamPatternStore = defineStore('examPattern', {
  state: () => ({
    formData: {
      patternName: '',
      examProgramId: null,
      examStageId: null,
      totalMarks: 0,
      totalQuestions: null,
      durationMinutes: null,
      deliveryMode: 'ONLINE_MCQ' as const,
      negativeMarking: true,
      negativeMarksRatio: 0.33,
    } as ExamPatternFormData,
    sections: [] as ExamSectionData[],
    examProgramLabel: '',
  }),

  getters: {
    totalSectionMarks(): number {
      return this.sections.reduce(
        (total, section) => total + section.requiredQuestions * section.marksPerQuestion,
        0,
      )
    },
    remainingMarks(): number {
      return this.formData.totalMarks - this.totalSectionMarks
    },
    canAddMoreSections(): boolean {
      return this.remainingMarks > 0
    },
  },

  actions: {
    setFormData(data: ExamPatternFormData) {
      const prevMode = this.formData.deliveryMode
      this.formData = data
      if (data.deliveryMode !== prevMode) {
        this.normalizeSectionsForDeliveryMode()
      }
    },

    setExamProgramLabel(label: string) {
      this.examProgramLabel = label
    },

    normalizeSectionsForDeliveryMode() {
      this.sections = this.sections.map((section) =>
        enforceSectionQuestionTypeForDeliveryMode(section, this.formData.deliveryMode),
      )
    },

    addSection(sectionData: ExamSectionData) {
      const highestSequenceNumber = this.sections.reduce(
        (max, section) =>
          Math.max(section.seqencial_section_number, max),
        0,
      )
      const seqencial_section_number =
        sectionData.seqencial_section_number || highestSequenceNumber + 1

      const normalized = enforceSectionQuestionTypeForDeliveryMode(
        sectionData,
        this.formData.deliveryMode,
      )

      this.sections.push({
        ...normalized,
        seqencial_section_number,
        isNew: sectionData.isNew ?? true,
        isModified: sectionData.isModified ?? false,
      })
    },

    updateSection(index: number, sectionData: ExamSectionData) {
      if (index < 0 || index >= this.sections.length) return

      const normalized = enforceSectionQuestionTypeForDeliveryMode(
        sectionData,
        this.formData.deliveryMode,
      )

      const existingSection = this.sections[index]
      this.sections[index] = {
        ...existingSection,
        ...normalized,
        id: sectionData.id ?? existingSection.id,
        seqencial_section_number:
          sectionData.seqencial_section_number ?? existingSection.seqencial_section_number,
        isModified: true,
        isNew: sectionData.isNew ?? existingSection.isNew ?? false,
      }
    },

    removeSection(index: number) {
      if (index < 0 || index >= this.sections.length) return
      this.sections.splice(index, 1)
    },

    clearFormData() {
      this.formData = {
        patternName: '',
        examProgramId: null,
        examStageId: null,
        totalMarks: 0,
        totalQuestions: null,
        durationMinutes: null,
        deliveryMode: 'ONLINE_MCQ',
        negativeMarking: true,
        negativeMarksRatio: 0.33,
      }
      this.sections = []
      this.examProgramLabel = ''
    },
  },
})
