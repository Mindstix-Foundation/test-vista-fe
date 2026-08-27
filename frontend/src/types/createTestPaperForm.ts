export interface SchoolInstructionMedium {
  id: number
  instruction_medium_id: number
  school_id: number
  created_at: string
  updated_at: string
  instruction_medium: {
    id: number
    board_id: number
    instruction_medium: string
    created_at: string
    updated_at: string
  }
}

export interface InstructionMediumItem {
  id: number
  name: string
  original: SchoolInstructionMedium
  selected: boolean
}

export interface StandardItem {
  id: number
  board_id: number
  name: string
  sequence_number: number
  created_at: string
  updated_at: string
}

export interface SubjectItem {
  subject_id: number
  subject_name: string
}

export interface MarksItem {
  id: number
  name: string
}

export interface CreateTestUserProfile {
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
  teaching_subjects: {
    id: number
    standard: {
      id: number
      name: string
      sequence_number: number
    }
    subject: {
      id: number
      name: string
    }
  }[]
  curriculum_scope?: {
    board: { id: number; name: string; abbreviation?: string }
    standards: {
      id: number
      name: string
      sequence_number: number
      subjects: { id: number; name: string }[]
    }[]
  } | null
}

export interface ChapterItem {
  id: number
  subject_id: number
  standard_id: number
  sequential_chapter_number: number
  name: string
  created_at: string
  updated_at: string
  subject: {
    id: number
    board_id: number
    name: string
    created_at: string
    updated_at: string
  }
  standard: {
    id: number
    board_id: number
    name: string
    sequence_number: number
    created_at: string
    updated_at: string
  }
  topics: Array<{
    id: number
    chapter_id: number
    sequential_topic_number: number
    name: string
    created_at: string
    updated_at: string
  }>
  selected: boolean
  question_count?: number
}
