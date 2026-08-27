import axiosInstance from '@/config/axios'

export interface StudentAssignedTest {
  id: number
  title: string
  status: 'upcoming' | 'active' | 'completed' | 'absent'
  dueDate: string
  availableDate: string
  duration: number
  questions: number
  maxScore: number
  progress: number
  remainingTime: string
  subject: string
  standard: string
  assignedBy: string
  test_attempt_id?: number
}

export interface StudentPastResult {
  result_id: number
  test_attempt_id: number
  assignment_id: number
  title: string
  source: 'SMART' | 'ASSIGNED'
  subject: string
  standard: string
  exam_program: string | null
  attempt_number: number
  total_questions: number
  correct_answers: number
  total_marks: number
  obtained_marks: number
  percentage: number
  performance_level: string
  time_taken_seconds: number
  submitted_at: string
}

export interface InstructionSection {
  id: number
  name: string
  sequence_number: number
  total_questions: number
  marks_per_question: number
  time_limit_minutes?: number | null
  qualifying_marks?: number | null
  answer_format: 'MCQ' | 'NUMERIC' | 'TEXT' | 'MATCH_PAIR'
}

export interface ExamInstructions {
  id: number
  title: string
  subject: string
  standard: string
  duration_minutes: number
  total_questions: number
  total_marks: number
  instructions?: string
  negative_marking: boolean
  negative_marks_per_question?: number
  max_attempts: number
  attempts_left: number
  available_from: Date
  due_date: Date
  status: string
  exam_program?: string | null
  exam_category?: string | null
  sections?: InstructionSection[]
}

export interface ExamQuestion {
  id: number
  question_id: number
  question_text_id: number
  question_text: string
  question_image?: string
  options: string[]
  option_ids: number[]
  option_images?: (string | null)[]
  section_id: number
  subsection_id: number
  question_order: number
  marks: number
  is_mandatory: boolean
  question_group_id?: number | null
  group_order?: number | null
  passage_text?: string | null
  passage_image?: string | null
}

export interface ExamTemplateSection {
  id: number
  name: string
  sequence_number: number
  total_questions: number
  marks_per_question: number
  time_limit_minutes?: number | null
  qualifying_marks?: number | null
  answer_format: 'MCQ' | 'NUMERIC' | 'TEXT' | 'MATCH_PAIR'
}

export interface ExamData {
  assignment_id: number
  test_paper_id: number
  title: string
  subject: string
  standard: string
  duration_minutes: number
  total_marks: number
  instructions?: string
  negative_marking: boolean
  negative_marks_per_question?: number
  sections?: ExamTemplateSection[]
  questions: ExamQuestion[]
  start_time: Date
  attempt_number: number
  attemptId: number
}

export interface TestAttemptStatus {
  test_attempt_id: number
  status: string
  current_question?: number
  time_remaining_seconds?: number
  questions_answered: number
  total_questions: number
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

/** Backend stores section scores as a map keyed by section id; normalize to an array for the UI. */
function normalizeSectionScores(raw: unknown): SectionScore[] | undefined {
  if (!raw) return undefined
  if (Array.isArray(raw)) return raw as SectionScore[]
  if (typeof raw === 'object') return Object.values(raw as Record<string, SectionScore>)
  return undefined
}

export interface ExamResult {
  id: number
  test_attempt_id: number
  title: string
  subject: string
  total_questions: number
  attempted_questions: number
  correct_answers: number
  wrong_answers: number
  skipped_questions: number
  total_marks: number
  obtained_marks: number
  percentage: number
  grade?: string
  rank_in_standard?: number
  time_taken_seconds: number
  performance_level: string
  chapter_wise_analysis?: any
  section_wise_scores?: SectionScore[]
  overall_qualified?: boolean | null
  rank?: number
  total_participants?: number
  percentile?: number
  strengths?: string[]
  weaknesses?: string[]
  recommendations?: string[]
  submitted_at: Date
}

export interface DetailedReport {
  result: ExamResult
  questions: {
    question_id: number
    question_text: string
    question_image?: string
    options: string[]
    option_images?: (string | null)[]
    option_ids: number[]
    correct_option: number
    selected_option?: number
    selected_option_index: number
    is_correct?: boolean
    marks_obtained: number
    time_spent_seconds?: number
    is_flagged: boolean
  }[]
}

class TestAssignmentService {
  async getStudentPastResults(): Promise<StudentPastResult[]> {
    const response = await axiosInstance.get('/test-assignments/student/my-results')
    return response.data
  }

  async getStudentAssignedTests(status?: string): Promise<StudentAssignedTest[]> {
    try {
      const params = status ? `?status=${status}` : ''
      const response = await axiosInstance.get(`/test-assignments/student/my-tests${params}`)
      return response.data
    } catch (error) {
      console.error('Error fetching assigned tests:', error)
      throw new Error('Failed to fetch assigned tests. Please try again.')
    }
  }

  async getExamInstructions(assignmentId: number): Promise<ExamInstructions> {
    try {
      const response = await axiosInstance.get(`/test-assignments/student/exam/${assignmentId}/instructions`)
      return response.data
    } catch (error) {
      console.error('Error fetching exam instructions:', error)
      throw new Error('Failed to fetch exam instructions. Please try again.')
    }
  }

  async startExam(assignmentId: number): Promise<ExamData> {
    try {
      const response = await axiosInstance.post('/test-assignments/student/exam/start', {
        assignment_id: assignmentId
      })
      return response.data
    } catch (error) {
      console.error('Error starting exam:', error)
      throw new Error('Failed to start exam. Please try again.')
    }
  }

  async getExamAttemptStatus(attemptId: number): Promise<TestAttemptStatus> {
    try {
      const response = await axiosInstance.get(`/test-assignments/student/exam/${attemptId}/status`)
      return response.data
    } catch (error) {
      console.error('Error fetching exam status:', error)
      throw new Error('Failed to fetch exam status. Please try again.')
    }
  }

  async submitAnswer(data: {
    test_attempt_id: number
    question_id: number
    question_text_id: number
    selected_option_id?: number
    numeric_answer?: number
    time_spent_seconds?: number
    is_flagged?: boolean
  }): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post('/test-assignments/student/exam/answer', data)
      return response.data
    } catch (error) {
      console.error('Error submitting answer:', error)
      throw new Error('Failed to submit answer. Please try again.')
    }
  }

  async submitExam(data: {
    test_attempt_id: number
  }): Promise<{ message: string; test_attempt_id: number; submitted_at: string }> {
    try {
      const response = await axiosInstance.post('/test-assignments/student/exam/submit', data)
      return response.data
    } catch (error) {
      console.error('Error submitting exam:', error)
      throw new Error('Failed to submit exam. Please try again.')
    }
  }

  async getExamResult(attemptId: number): Promise<ExamResult> {
    try {
      const response = await axiosInstance.get(`/test-assignments/student/exam/${attemptId}/result`)
      const data = response.data as ExamResult
      return {
        ...data,
        section_wise_scores: normalizeSectionScores(data.section_wise_scores),
      }
    } catch (error) {
      console.error('Error fetching exam result:', error)
      throw new Error('Failed to fetch exam result. Please try again.')
    }
  }

  async getDetailedReport(attemptId: number): Promise<DetailedReport> {
    try {
      const response = await axiosInstance.get(`/test-assignments/student/exam/${attemptId}/detailed-report`)
      return response.data
    } catch (error) {
      console.error('Error fetching detailed report:', error)
      throw new Error('Failed to fetch detailed report. Please try again.')
    }
  }

  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'Upcoming'
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      case 'absent':
        return 'Absent'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'bg-info'
      case 'active':
        return 'bg-success'
      case 'completed':
        return 'bg-primary'
      case 'absent':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  formatRemainingTime(remainingTime: string): string {
    if (!remainingTime || remainingTime === '0:00') {
      return 'Time expired'
    }
    return `${remainingTime} remaining`
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  formatTimeFromMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    } else {
      return `${mins} minutes`
    }
  }
}

export const testAssignmentService = new TestAssignmentService()
export default testAssignmentService 