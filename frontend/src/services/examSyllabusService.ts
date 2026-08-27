import examCatalogService from '@/services/examCatalogService'
import type { ExamSyllabusItem, SyllabusNode } from '@/types/exam'

/**
 * Exam syllabus API with board-style naming (subject / chapter / topic).
 * Backend still uses /syllabus/nodes — hidden from UI.
 */
export const examSyllabusService = {
  getTree(programId: number, stageId?: number) {
    return examCatalogService.getSyllabusTree(programId, stageId)
  },

  getSubject(id: number) {
    return examCatalogService.getSyllabusNode(id)
  },

  getChapter(id: number) {
    return examCatalogService.getSyllabusNode(id)
  },

  createSubject(payload: {
    exam_program_id: number
    exam_stage_id?: number
    name: string
  }): Promise<ExamSyllabusItem> {
    return examCatalogService.createSyllabusNode({
      ...payload,
      node_type: 'SUBJECT',
    })
  },

  createChapter(payload: {
    exam_program_id: number
    exam_stage_id?: number
    parent_id: number
    name: string
  }): Promise<ExamSyllabusItem> {
    return examCatalogService.createSyllabusNode({
      ...payload,
      node_type: 'CHAPTER',
    })
  },

  createTopic(payload: {
    exam_program_id: number
    exam_stage_id?: number
    parent_id: number
    name: string
    sequence_number?: number
  }): Promise<ExamSyllabusItem> {
    return examCatalogService.createSyllabusNode({
      ...payload,
      node_type: 'TOPIC',
    })
  },

  updateChapter(id: number, payload: Partial<SyllabusNode>) {
    return examCatalogService.updateSyllabusNode(id, payload)
  },

  updateTopic(id: number, payload: Partial<SyllabusNode>) {
    return examCatalogService.updateSyllabusNode(id, payload)
  },

  deleteChapter(id: number) {
    return examCatalogService.deleteSyllabusNode(id)
  },

  deleteTopic(id: number) {
    return examCatalogService.deleteSyllabusNode(id)
  },

  getChapterQuestions(chapterId: number, includeDescendants = true) {
    return examCatalogService.getNodeQuestions(chapterId, includeDescendants)
  },

  linkQuestionToChapter(questionId: number, chapterId: number) {
    return examCatalogService.tagQuestion(questionId, chapterId)
  },

  bulkLinkQuestionsToChapter(questionIds: number[], chapterId: number) {
    return examCatalogService.bulkTagQuestions(questionIds, chapterId)
  },
}

export default examSyllabusService
