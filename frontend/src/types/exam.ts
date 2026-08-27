/**
 * Option C exam platform types.
 * Central taxonomy: Category → Body → Program → Stage → Syllabus tree.
 */

export type ExamCategoryCode = 'BOARD' | 'ENTRANCE' | 'COMPETITIVE'
export type ExamBodyJurisdiction = 'NATIONAL' | 'STATE' | 'INSTITUTIONAL'
export type InstitutionType = 'SCHOOL' | 'COACHING_CENTER' | 'VIRTUAL'
export type ParticipantType = 'SCHOOL_STUDENT' | 'INSTITUTE_STUDENT' | 'ASPIRANT'
export type DeliveryMode = 'OFFLINE_PDF' | 'ONLINE_MCQ' | 'ONLINE_MIXED'
export type SyllabusNodeType = 'SECTION' | 'SUBJECT' | 'CHAPTER' | 'TOPIC'
export type AnswerFormat = 'MCQ' | 'NUMERIC' | 'TEXT' | 'MATCH_PAIR'

export interface Language {
  id: number
  code: string
  name: string
  is_active: boolean
  sequence_number: number
  instruction_medium_id: number | null
  instruction_medium?: {
    id: number
    instruction_medium: string
    board_id: number
  } | null
}

export interface ExamCategory {
  id: number
  code: ExamCategoryCode
  name: string
  description?: string
  _count?: { exam_bodies: number }
}

export interface ExamBody {
  id: number
  exam_category_id: number
  name: string
  abbreviation: string
  logo_url?: string
  is_active: boolean
  board_id?: number | null
  jurisdiction?: ExamBodyJurisdiction | null
  exam_category?: ExamCategory
  board?: { id: number; name: string; abbreviation: string } | null
  exam_programs?: ExamProgram[]
  _count?: { exam_programs: number }
}

export interface ExamProgram {
  id: number
  exam_body_id: number
  name: string
  code: string
  description?: string
  default_duration_minutes?: number
  has_negative_marking: boolean
  negative_marks_ratio?: number
  is_active: boolean
  exam_body?: ExamBody
  exam_stages?: ExamStage[]
  _count?: { paper_templates: number; syllabus_nodes: number }
}

export interface ExamStage {
  id: number
  exam_program_id: number
  name: string
  sequence_number: number
  is_qualifying: boolean
  qualifying_pct?: number
  standard_id?: number | null
  standard?: { id: number; name: string } | null
}

export interface SyllabusNode {
  id: number
  exam_program_id: number
  exam_stage_id?: number | null
  parent_id?: number | null
  node_type: SyllabusNodeType
  name: string
  sequence_number: number
  children?: SyllabusNode[]
  _count?: { question_links: number; children: number }
}

/** Board-style alias used in exam syllabus UI (subject / chapter / topic). */
export type ExamSyllabusItem = SyllabusNode

export interface TemplateSection {
  id: number
  paper_template_id: number
  name: string
  sequence_number: number
  total_questions: number
  mandatory_questions: number
  marks_per_question: number
  time_limit_minutes?: number | null
  qualifying_marks?: number | null
  negative_marks_per_question?: number | null
  answer_format: AnswerFormat
  syllabus_node?: { id: number; name: string; node_type: SyllabusNodeType } | null
  question_types?: { question_type: { id: number; type_name: string } }[]
}

export interface PaperTemplate {
  id: number
  exam_program_id: number
  exam_stage_id?: number | null
  name: string
  total_marks: number
  total_questions?: number
  duration_minutes?: number
  delivery_mode: DeliveryMode
  negative_marking: boolean
  negative_marks_ratio?: number
  nat_tolerance?: number
  is_active: boolean
  exam_program?: ExamProgram
  exam_stage?: ExamStage | null
  sections: TemplateSection[]
}

export interface Institution {
  id: number
  institution_type: InstitutionType
  name: string
  email?: string
  contact_number?: string
  principal_name?: string
  is_active: boolean
  school?: { id: number; name: string; board_id: number } | null
  institution_programs?: { exam_program: ExamProgram }[]
  _count?: { participants: number; exam_cohorts: number }
}

export interface ExamCohort {
  id: number
  exam_program_id: number
  institution_id?: number | null
  name: string
  academic_year?: string
  exam_program?: ExamProgram
  institution?: Pick<Institution, 'id' | 'name' | 'institution_type'> | null
  _count?: { participants: number }
}

export interface Participant {
  id: number
  user_id: number
  participant_type: ParticipantType
  institution_id?: number | null
  exam_cohort_id?: number | null
  registration_code?: string
  status: string
  user?: { id: number; name: string; email_id: string; contact_number?: string }
  institution?: Pick<Institution, 'id' | 'name' | 'institution_type'> | null
  exam_cohort?: Pick<ExamCohort, 'id' | 'name'> | null
  participant_programs?: { exam_program: ExamProgram }[]
}

export interface SectionScore {
  name: string
  obtained: number
  total: number
  attempted: number
  questions: number
  qualifying_marks: number | null
  qualified: boolean | null
}
