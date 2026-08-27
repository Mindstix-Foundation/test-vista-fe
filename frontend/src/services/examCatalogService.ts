import axiosInstance from '@/config/axios'
import type {
  ExamCategory,
  ExamCategoryCode,
  ExamBody,
  ExamProgram,
  ExamStage,
  SyllabusNode,
  PaperTemplate,
  Institution,
  ExamCohort,
  Participant,
  DeliveryMode,
  Language,
} from '@/types/exam'

export const examCatalogService = {
  // ---------- Languages (exam translation / paper language) ----------
  async getLanguages(): Promise<Language[]> {
    const { data } = await axiosInstance.get('/languages')
    return data
  },

  async getLanguage(id: number): Promise<Language> {
    const { data } = await axiosInstance.get(`/languages/${id}`)
    return data
  },

  // ---------- Categories ----------
  async getCategories(): Promise<ExamCategory[]> {
    const { data } = await axiosInstance.get('/exam-catalog/categories')
    return data
  },

  // ---------- Bodies ----------
  async getBodies(category?: ExamCategoryCode): Promise<ExamBody[]> {
    const { data } = await axiosInstance.get('/exam-catalog/bodies', {
      params: category ? { category } : {},
    })
    return data
  },

  async getBody(id: number): Promise<ExamBody> {
    const { data } = await axiosInstance.get(`/exam-catalog/bodies/${id}`)
    return data
  },

  async createBody(payload: Partial<ExamBody>): Promise<ExamBody> {
    const { data } = await axiosInstance.post('/exam-catalog/bodies', payload)
    return data
  },

  async updateBody(id: number, payload: Partial<ExamBody>): Promise<ExamBody> {
    const { data } = await axiosInstance.put(`/exam-catalog/bodies/${id}`, payload)
    return data
  },

  async deleteBody(id: number): Promise<void> {
    await axiosInstance.delete(`/exam-catalog/bodies/${id}`)
  },

  // ---------- Programs ----------
  async getPrograms(params?: { exam_body_id?: number; category?: ExamCategoryCode }): Promise<ExamProgram[]> {
    const { data } = await axiosInstance.get('/exam-catalog/programs', { params })
    return data
  },

  async getProgram(id: number): Promise<ExamProgram> {
    const { data } = await axiosInstance.get(`/exam-catalog/programs/${id}`)
    return data
  },

  async createProgram(payload: Partial<ExamProgram>): Promise<ExamProgram> {
    const { data } = await axiosInstance.post('/exam-catalog/programs', payload)
    return data
  },

  async updateProgram(id: number, payload: Partial<ExamProgram>): Promise<ExamProgram> {
    const { data } = await axiosInstance.put(`/exam-catalog/programs/${id}`, payload)
    return data
  },

  async deleteProgram(id: number): Promise<void> {
    await axiosInstance.delete(`/exam-catalog/programs/${id}`)
  },

  // ---------- Stages ----------
  async getStages(programId: number): Promise<ExamStage[]> {
    const { data } = await axiosInstance.get(`/exam-catalog/programs/${programId}/stages`)
    return data
  },

  async createStage(payload: Partial<ExamStage>): Promise<ExamStage> {
    const { data } = await axiosInstance.post('/exam-catalog/stages', payload)
    return data
  },

  async updateStage(id: number, payload: Partial<ExamStage>): Promise<ExamStage> {
    const { data } = await axiosInstance.put(`/exam-catalog/stages/${id}`, payload)
    return data
  },

  async deleteStage(id: number): Promise<void> {
    await axiosInstance.delete(`/exam-catalog/stages/${id}`)
  },

  // ---------- Syllabus ----------
  async getSyllabusTree(programId: number, stageId?: number): Promise<SyllabusNode[]> {
    const { data } = await axiosInstance.get(`/syllabus/tree/${programId}`, {
      params: stageId ? { exam_stage_id: stageId } : {},
    })
    return data
  },

  async getSyllabusNodes(params: {
    exam_program_id: number
    exam_stage_id?: number
    parent_id?: number
    node_type?: SyllabusNode['node_type']
  }): Promise<SyllabusNode[]> {
    const { data } = await axiosInstance.get('/syllabus/nodes', { params })
    return data
  },

  async getSyllabusNode(id: number): Promise<SyllabusNode> {
    const { data } = await axiosInstance.get(`/syllabus/nodes/${id}`)
    return data
  },

  async createSyllabusNode(payload: Partial<SyllabusNode>): Promise<SyllabusNode> {
    const { data } = await axiosInstance.post('/syllabus/nodes', payload)
    return data
  },

  async updateSyllabusNode(id: number, payload: Partial<SyllabusNode>): Promise<SyllabusNode> {
    const { data } = await axiosInstance.put(`/syllabus/nodes/${id}`, payload)
    return data
  },

  async deleteSyllabusNode(id: number): Promise<void> {
    await axiosInstance.delete(`/syllabus/nodes/${id}`)
  },

  async tagQuestion(questionId: number, nodeId: number): Promise<void> {
    await axiosInstance.post('/syllabus/tag-question', {
      question_id: questionId,
      syllabus_node_id: nodeId,
    })
  },

  async untagQuestion(questionId: number, nodeId: number): Promise<void> {
    await axiosInstance.delete(`/syllabus/tag-question/${questionId}/${nodeId}`)
  },

  async bulkTagQuestions(questionIds: number[], nodeId: number): Promise<{ tagged: number; skipped: number }> {
    const { data } = await axiosInstance.post('/syllabus/tag-questions/bulk', {
      question_ids: questionIds,
      syllabus_node_id: nodeId,
    })
    return data
  },

  async getNodeQuestions(nodeId: number, includeDescendants = true): Promise<any[]> {
    const { data } = await axiosInstance.get(`/syllabus/nodes/${nodeId}/questions`, {
      params: { include_descendants: includeDescendants },
    })
    return data
  },

  async getNodesByChapter(chapterId: number): Promise<SyllabusNode[]> {
    const { data } = await axiosInstance.get(`/syllabus/nodes/by-chapter/${chapterId}`)
    return data
  },

  async getNodesByTopic(topicId: number): Promise<SyllabusNode[]> {
    const { data } = await axiosInstance.get(`/syllabus/nodes/by-topic/${topicId}`)
    return data
  },

  async createSyllabusQuestion(payload: {
    syllabus_node_id: number
    question_format: 'MCQ' | 'NUMERIC'
    question_text: string
    options?: { text: string; is_correct: boolean }[]
    numeric_answer?: number
    is_pyq?: boolean
  }): Promise<any> {
    const { data } = await axiosInstance.post('/syllabus/questions', payload)
    return data
  },

  async createPassageGroup(payload: {
    syllabus_node_id: number
    passage_text: string
    external_key?: string
    is_pyq?: boolean
    children: {
      question_text: string
      options: { text: string; is_correct: boolean }[]
      group_order?: number
    }[]
  }): Promise<any> {
    const { data } = await axiosInstance.post('/syllabus/passage-groups', payload)
    return data
  },

  async createBoardPassageGroup(payload: {
    passage_text: string
    board_question: boolean
    question_topic_data?: { topic_id: number }
    question_text_topic_medium_data?: { instruction_medium_id: number }
    syllabus_node_id?: number
    children: {
      question_text: string
      mcq_options: { option_text: string; is_correct: boolean }[]
      group_order?: number
    }[]
  }): Promise<any> {
    const { data } = await axiosInstance.post('/questions/passage-groups', payload)
    return data
  },

  async getPassageGroup(id: number): Promise<any> {
    const { data } = await axiosInstance.get(`/questions/passage-groups/${id}`)
    return data
  },

  async updatePassageGroup(
    id: number,
    payload: {
      passage_text?: string
      children?: {
        question_text: string
        mcq_options: { option_text: string; is_correct: boolean }[]
        group_order?: number
      }[]
      board_question?: boolean
      syllabus_node_id?: number
      question_topic_data?: { topic_id: number }
    },
  ): Promise<any> {
    const { data } = await axiosInstance.put(`/questions/passage-groups/${id}`, payload)
    return data
  },

  // ---------- Paper templates ----------
  async filterTemplates(params: {
    exam_program_id?: number
    exam_stage_id?: number
    delivery_mode?: DeliveryMode
    total_marks?: number
    category?: ExamCategoryCode
  }): Promise<PaperTemplate[]> {
    const { data } = await axiosInstance.get('/paper-templates/filter', { params })
    return data
  },

  async getTemplateUniqueMarks(params: {
    exam_program_id?: number
    exam_stage_id?: number
    delivery_mode?: DeliveryMode
  }): Promise<number[]> {
    const { data } = await axiosInstance.get('/paper-templates/unique-marks', { params })
    return data
  },

  async getTemplate(id: number): Promise<PaperTemplate> {
    const { data } = await axiosInstance.get(`/paper-templates/${id}`)
    return data
  },

  async createTemplate(payload: Record<string, unknown>): Promise<PaperTemplate> {
    const { data } = await axiosInstance.post('/paper-templates', payload)
    return data
  },

  async updateTemplate(id: number, payload: Record<string, unknown>): Promise<PaperTemplate> {
    const { data } = await axiosInstance.put(`/paper-templates/${id}`, payload)
    return data
  },

  async deleteTemplate(id: number): Promise<void> {
    await axiosInstance.delete(`/paper-templates/${id}`)
  },

  // ---------- Institutions & cohorts ----------
  async getInstitutions(params?: { institution_type?: string; exam_program_id?: number }): Promise<Institution[]> {
    const { data } = await axiosInstance.get('/institutions', { params })
    return data
  },

  async createInstitution(payload: Partial<Institution> & { exam_program_ids?: number[] }): Promise<Institution> {
    const { data } = await axiosInstance.post('/institutions', payload)
    return data
  },

  async getCohorts(params?: { exam_program_id?: number; institution_id?: number }): Promise<ExamCohort[]> {
    const { data } = await axiosInstance.get('/institutions/cohorts', { params })
    return data
  },

  async createCohort(payload: Partial<ExamCohort>): Promise<ExamCohort> {
    const { data } = await axiosInstance.post('/institutions/cohorts', payload)
    return data
  },

  // ---------- Participants ----------
  async registerAspirant(payload: {
    name: string
    email: string
    password: string
    contact_number: string
    exam_program_id: number
    institution_id?: number
    org_code?: string
    school_standard_id?: number
    request_message?: string
    exam_cohort_id?: number
  }) {
    const { data } = await axiosInstance.post('/participants/register', payload)
    return data
  },

  async getMyParticipations(): Promise<Participant[]> {
    const { data } = await axiosInstance.get('/participants/me')
    return data
  },

  async getParticipants(params?: {
    participant_type?: string
    institution_id?: number
    exam_cohort_id?: number
    exam_program_id?: number
  }): Promise<Participant[]> {
    const { data } = await axiosInstance.get('/participants', { params })
    return data
  },
}

export default examCatalogService
