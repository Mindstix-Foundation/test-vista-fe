import type { ExamSectionData } from '@/stores/examPattern'

export const MCQ_TYPE_NAME = 'Multiple Choice Question (MCQ)'
export const NAT_TYPE_NAME = 'Numerical Answer Type (NAT)'

export type ExamDeliveryMode = 'ONLINE_MCQ' | 'ONLINE_MIXED' | 'OFFLINE_PDF'

/** Question types allowed per exam delivery mode; null = all system types (offline PDF). */
export function getAllowedExamQuestionTypeNames(
  mode?: ExamDeliveryMode | null,
): string[] | null {
  if (mode === 'ONLINE_MCQ') return [MCQ_TYPE_NAME]
  if (mode === 'ONLINE_MIXED') return [MCQ_TYPE_NAME, NAT_TYPE_NAME]
  return null
}

export function isExamQuestionTypeLocked(mode?: ExamDeliveryMode | null): boolean {
  return mode === 'ONLINE_MCQ'
}

/** Competitive exam sections use one question type per section. */
export function shouldForceSameQuestionTypePerSection(mode?: ExamDeliveryMode | null): boolean {
  return mode === 'ONLINE_MCQ' || mode === 'ONLINE_MIXED'
}

/** Force section question type to comply with exam delivery mode rules. */
export function enforceSectionQuestionTypeForDeliveryMode(
  section: ExamSectionData,
  mode?: ExamDeliveryMode | null,
): ExamSectionData {
  if (!mode || mode === 'OFFLINE_PDF') return section

  if (mode === 'ONLINE_MCQ') {
    return {
      ...section,
      sameType: true,
      questionType: MCQ_TYPE_NAME,
      questionTypes: [MCQ_TYPE_NAME],
    }
  }

  // ONLINE_MIXED — only MCQ or NAT allowed
  const allowed = getAllowedExamQuestionTypeNames(mode) ?? []
  const current = section.questionType || section.questionTypes.find(Boolean) || ''
  const valid = allowed.includes(current) ? current : ''

  return {
    ...section,
    sameType: true,
    questionType: valid,
    questionTypes: valid ? [valid] : [],
  }
}

interface QuestionType {
  id: number
  type_name: string
}

export function answerFormatToTypeName(format?: string): string {
  if (format === 'NUMERIC') return NAT_TYPE_NAME
  if (format === 'MATCH_PAIR') return 'Match the Pairs'
  if (format === 'TEXT') return 'Short Answer Question'
  return MCQ_TYPE_NAME
}

export function resolveAnswerFormat(typeNames: string[]): 'MCQ' | 'NUMERIC' | 'TEXT' | 'MATCH_PAIR' {
  const filtered = typeNames.filter(Boolean)
  if (filtered.length === 1 && filtered[0] === NAT_TYPE_NAME) return 'NUMERIC'
  if (filtered.length > 0 && filtered.every((n) => n === NAT_TYPE_NAME)) return 'NUMERIC'
  return 'MCQ'
}

export function sectionToApiPayload(
  section: ExamSectionData,
  questionTypes: QuestionType[],
  index: number,
) {
  const typeNames = section.sameType
    ? [section.questionType || section.questionTypes.find(Boolean) || '']
    : section.questionTypes.filter(Boolean)

  const question_type_ids = typeNames
    .map((name) => questionTypes.find((qt) => qt.type_name === name)?.id)
    .filter((id): id is number => id !== undefined)

  return {
    name: section.sectionName,
    sequence_number: section.seqencial_section_number || index + 1,
    total_questions: section.totalQuestions,
    mandatory_questions: section.requiredQuestions,
    marks_per_question: section.marksPerQuestion,
    answer_format: resolveAnswerFormat(typeNames),
    question_type_ids,
  }
}

export function apiSectionToStore(
  section: {
    id: number
    name: string
    sequence_number: number
    total_questions: number
    mandatory_questions: number
    marks_per_question: number
    answer_format?: string
    question_types?: Array<{ question_type: { type_name: string } }>
  },
  index: number,
): ExamSectionData {
  const linkedTypes =
    section.question_types
      ?.map((qt) => qt.question_type?.type_name)
      .filter((name): name is string => name != null && name !== '') ?? []

  const qtypes =
    linkedTypes.length > 0 ? linkedTypes : [answerFormatToTypeName(section.answer_format)]

  const singleType = qtypes.length === 1 || new Set(qtypes).size === 1

  return {
    id: section.id,
    questionNumber: String(section.sequence_number ?? index + 1),
    subQuestion: '',
    sectionName: section.name,
    totalQuestions: section.total_questions,
    requiredQuestions: section.mandatory_questions,
    marksPerQuestion: section.marks_per_question,
    sameType: singleType,
    questionType: singleType ? qtypes[0] : '',
    questionTypes: singleType ? [qtypes[0]] : qtypes,
    seqencial_section_number: section.sequence_number,
  }
}

/** Resolve display labels for section question types in pattern forms. */
export function getSectionQuestionTypeLabels(section: ExamSectionData): string[] {
  if (section.sameType) {
    const type = section.questionType || section.questionTypes.find(Boolean)
    return type ? [type] : []
  }
  const types = section.questionTypes.filter(Boolean)
  if (types.length > 0) return types
  if (section.questionType) return [section.questionType]
  return []
}
