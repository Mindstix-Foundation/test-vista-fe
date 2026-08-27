import axiosInstance from '@/config/axios'

export interface SmartTestContext {
  student_id: number
  is_aspirant: boolean
  school: {
    id: number
    name: string
    board_id: number
    board_name: string | null
  }
  standard: {
    id: number
    name: string
  }
  enrolled_programs: Array<{
    id: number
    name: string
    category: string | null
    abbreviation: string | null
  }>
}

export interface SmartTestListItem {
  assignment_id: number
  test_paper_id: number
  title: string
  duration_minutes: number | null
  total_questions: number
  total_marks: number
  subject: string | null
  standard: string | null
  exam_program: string | null
  exam_body: string | null
  exam_stage: string | null
  status: string
  available_from: string
  due_date: string
  max_attempts: number
  attempts_used: number
  in_progress_attempt_id: number | null
  latest_completed_attempt_id?: number | null
  can_start: boolean
  created_at: string
}

export type QuestionSource = 'board' | 'other' | 'both'

export interface CreateBoardSmartTestPayload {
  name: string
  medium_ids: number[]
  subject_id: number
  chapter_ids: number[]
  chapter_marks?: Array<{ chapter_id: number; marks: number }>
  question_source: QuestionSource
  pattern_id: number
  duration_minutes: number
  instructions?: string
  negative_marking?: boolean
  negative_marks_per_question?: number
  randomize_questions?: boolean
  randomize_options?: boolean
}

export interface ChapterMarksRange {
  chapterId: number
  chapterName: string
  possibleMarks: number[]
  minMarks: number
  maxMarks: number
}

export interface BoardAllocationPreview {
  patternId: number
  patternName: string
  totalMarks: number
  chapterMarks: Array<{ chapterId: number; chapterName: string; absoluteMarks: number }>
}

export interface CreateAspirantSmartTestPayload {
  name: string
  paper_template_id: number
  syllabus_node_ids?: number[]
  syllabus_weightage?: Array<{ syllabus_node_id: number; questions: number }>
  instructions?: string
  randomize_questions?: boolean
  randomize_options?: boolean
}

export interface AspirantSectionAvailability {
  paper_template_id: number
  total_questions: number
  total_marks: number
  sections: Array<{
    syllabus_node_id: number
    name: string
    available_questions: number
  }>
}

export interface SmartTestCreateResult {
  message: string
  assignment_id: number
  test_paper_id: number
  question_count: number
}

export const smartTestService = {
  async getContext(): Promise<SmartTestContext> {
    const { data } = await axiosInstance.get('/smart-tests/context')
    return data
  },

  async listMine(): Promise<SmartTestListItem[]> {
    const { data } = await axiosInstance.get('/smart-tests/mine')
    return data
  },

  async createBoard(payload: CreateBoardSmartTestPayload): Promise<SmartTestCreateResult> {
    const { data } = await axiosInstance.post('/smart-tests/board', payload)
    return data
  },

  async createAspirant(payload: CreateAspirantSmartTestPayload): Promise<SmartTestCreateResult> {
    const { data } = await axiosInstance.post('/smart-tests/aspirant', payload)
    return data
  },

  async getTemplates(
    examProgramId: number,
    examStageId?: number,
    syllabusNodeIds: number[] = [],
  ): Promise<any[]> {
    const { data } = await axiosInstance.get('/smart-tests/templates', {
      params: {
        exam_program_id: examProgramId,
        exam_stage_id: examStageId,
        syllabus_node_ids: syllabusNodeIds.join(','),
      },
    })
    return data
  },

  async getAspirantAvailability(
    paperTemplateId: number,
    syllabusNodeIds: number[],
  ): Promise<AspirantSectionAvailability> {
    const { data } = await axiosInstance.get('/smart-tests/aspirant/availability', {
      params: {
        paper_template_id: paperTemplateId,
        syllabus_node_ids: syllabusNodeIds.join(','),
      },
    })
    return data
  },

  async getBoardMediums(): Promise<Array<{ id: number; name: string }>> {
    const { data } = await axiosInstance.get('/smart-tests/board/mediums')
    return data
  },

  async getBoardSubjects(mediumIds: number[]): Promise<Array<{ id: number; name: string }>> {
    const { data } = await axiosInstance.get('/smart-tests/board/subjects', {
      params: { medium_ids: mediumIds.join(',') },
    })
    return data
  },

  async getBoardChapters(
    subjectId: number,
    mediumIds: number[],
  ): Promise<Array<{ id: number; name: string }>> {
    const { data } = await axiosInstance.get('/smart-tests/board/chapters', {
      params: {
        subject_id: subjectId,
        medium_ids: mediumIds.join(','),
      },
    })
    return data
  },

  async getBoardPatterns(
    chapterIds: number[],
    mediumIds: number[],
    questionOrigin: QuestionSource,
  ): Promise<{ validPatterns: Array<{ id: number; pattern_name: string; total_marks: number }> }> {
    const { data } = await axiosInstance.get('/smart-tests/board/patterns', {
      params: {
        chapter_ids: chapterIds.join(','),
        medium_ids: mediumIds.join(','),
        question_origin: questionOrigin,
      },
    })
    return data
  },

  async getBoardChapterMarksRanges(
    patternId: number,
    chapterIds: number[],
    mediumIds: number[],
    questionOrigin: QuestionSource,
  ): Promise<ChapterMarksRange[]> {
    const { data } = await axiosInstance.get('/smart-tests/board/chapter-marks-range', {
      params: {
        pattern_id: patternId,
        chapter_ids: chapterIds.join(','),
        medium_ids: mediumIds.join(','),
        question_origin: questionOrigin,
      },
    })
    return data
  },

  async getBoardAllocation(
    patternId: number,
    chapterIds: number[],
    mediumIds: number[],
    questionOrigin: QuestionSource,
  ): Promise<BoardAllocationPreview> {
    const { data } = await axiosInstance.get('/smart-tests/board/allocation', {
      params: {
        pattern_id: patternId,
        chapter_ids: chapterIds.join(','),
        medium_ids: mediumIds.join(','),
        question_origin: questionOrigin,
      },
    })
    return data
  },
}
