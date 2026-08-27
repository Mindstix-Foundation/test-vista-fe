import { defineStore } from 'pinia'

interface Board {
  id: number
  name: string
  abbreviation: string
  standards: Array<{
    id: number
    name: string
  }>
  subjects: Array<{
    id: number
    name: string
  }>
}

interface StandardSubject {
  id: number
  name: string
}

interface PatternFormData {
  patternName: string
  selectedBoard: Board | null
  selectedStandard: StandardSubject | null
  selectedSubject: StandardSubject | null
  totalMarks: number
}

interface SectionData {
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

export const usePatternStore = defineStore('pattern', {
  state: () => ({
    formData: {
      patternName: '',
      selectedBoard: null,
      selectedStandard: null,
      selectedSubject: null,
      totalMarks: 0,
    } as PatternFormData,
    sections: [] as SectionData[],
  }),

  getters: {
    totalSectionMarks(): number {
      console.log('PatternStore - Computing totalSectionMarks');
      return this.sections.reduce(
        (total, section) => total + section.requiredQuestions * section.marksPerQuestion,
        0,
      )
    },
    remainingMarks(): number {
      console.log('PatternStore - Computing remainingMarks');
      return this.formData.totalMarks - this.totalSectionMarks
    },
    canAddMoreSections(): boolean {
      console.log('PatternStore - Computing canAddMoreSections');
      return this.remainingMarks > 0
    },
  },

  actions: {
    setFormData(data: PatternFormData) {
      this.formData = data;
    },

    addSection(sectionData: SectionData) {
      console.log('PatternStore - Adding new section');

      // Find the highest sequence number from existing sections
      const highestSequenceNumber = this.sections.reduce((max, section) => {
        return Math.max(section.seqencial_section_number, max)
      }, 0);

      // Use provided sequence number or calculate the next one
      const seqencial_section_number = sectionData.seqencial_section_number || (highestSequenceNumber + 1);

      console.log('PatternStore - Sequence number calculation:', {
        highestExistingSequence: highestSequenceNumber,
        newSectionSequence: seqencial_section_number
      });

      // Ensure the section is marked as new
      const newSection = {
        ...sectionData,
        seqencial_section_number,
        isNew: true,
        isModified: false
      };

      this.sections.push(newSection);

      // Calculate new total section marks
      const totalSectionMarks = this.sections.reduce(
        (total, section) => total + section.requiredQuestions * section.marksPerQuestion,
        0
      );

      console.log('PatternStore - Added new section:', {
        sectionName: newSection.sectionName,
        questionType: newSection.questionType,
        requiredQuestions: newSection.requiredQuestions,
        marksPerQuestion: newSection.marksPerQuestion,
        sequenceNumber: newSection.seqencial_section_number,
        totalMarks: newSection.requiredQuestions * newSection.marksPerQuestion,
        totalSectionMarks,
        remainingMarks: this.formData.totalMarks - totalSectionMarks
      });
    },

    updateSection(index: number, sectionData: SectionData) {
      console.log('PatternStore - Updating section at index:', index);

      if (index < 0 || index >= this.sections.length) {
        console.error('PatternStore - Invalid section index:', index);
        return;
      }

      // Get existing section data
      const existingSection = this.sections[index];

      // Log the marks change for debugging
      const oldMarks = existingSection.requiredQuestions * existingSection.marksPerQuestion;
      const newMarks = sectionData.requiredQuestions * sectionData.marksPerQuestion;
      console.log('PatternStore - Section marks change:', {
        oldMarks,
        newMarks,
        difference: newMarks - oldMarks,
        totalMarks: this.formData.totalMarks,
        totalSectionMarksBeforeUpdate: this.totalSectionMarks
      });

      // Preserve the ID and sequence number if they exist
      const updatedSection = {
        ...existingSection,
        ...sectionData,
        id: sectionData.id ?? existingSection.id,
        seqencial_section_number: sectionData.seqencial_section_number ?? existingSection.seqencial_section_number,
        isModified: true, // Mark as modified
        isNew: sectionData.isNew ?? existingSection.isNew ?? false
      };

      // Update the section at the specified index
      this.sections[index] = updatedSection;

      console.log('PatternStore - Section marked as modified');

      // Calculate new total section marks
      const newTotalSectionMarks = this.sections.reduce(
        (total, section) => total + section.requiredQuestions * section.marksPerQuestion,
        0
      );

      console.log('PatternStore - Total section marks after update:', {
        newTotalSectionMarks,
        remainingMarks: this.formData.totalMarks - newTotalSectionMarks
      });

      // Log the updated section for debugging
      console.log('PatternStore - Updated section data:', {
        id: updatedSection.id,
        questionNumber: updatedSection.questionNumber,
        sectionName: updatedSection.sectionName,
        questionType: updatedSection.questionType,
        requiredQuestions: updatedSection.requiredQuestions,
        marksPerQuestion: updatedSection.marksPerQuestion,
        totalMarks: updatedSection.requiredQuestions * updatedSection.marksPerQuestion,
        isModified: updatedSection.isModified
      });
    },

    removeSection(index: number) {
      console.log('PatternStore - Removing section at index:', index);

      if (index < 0 || index >= this.sections.length) {
        console.error('PatternStore - Invalid section index:', index);
        return;
      }

      const removedSection = this.sections[index];
      console.log('PatternStore - Removing section:', {
        id: removedSection.id,
        sectionName: removedSection.sectionName,
        sequenceNumber: removedSection.seqencial_section_number
      });

      // Remove the section
      this.sections.splice(index, 1);

      // Log remaining sections and their sequence numbers
      console.log('PatternStore - Remaining sections after removal:',
        this.sections.map(s => ({
          id: s.id,
          sectionName: s.sectionName,
          sequenceNumber: s.seqencial_section_number
        }))
      );

      // Calculate new total section marks
      const totalSectionMarks = this.sections.reduce(
        (total, section) => total + section.requiredQuestions * section.marksPerQuestion,
        0
      );

      console.log('PatternStore - Total section marks after removal:', {
        totalSectionMarks,
        remainingMarks: this.formData.totalMarks - totalSectionMarks
      });
    },

    clearFormData() {
      this.formData = {
        patternName: '',
        selectedBoard: null,
        selectedStandard: null,
        selectedSubject: null,
        totalMarks: 0,
      }
      this.sections = []
    },
  },
})
