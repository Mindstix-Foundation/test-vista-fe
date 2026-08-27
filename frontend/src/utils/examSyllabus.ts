import type { SyllabusNode, SyllabusNodeType, ExamSyllabusItem } from '@/types/exam'

/** Board-style syllabus item (subject, chapter, topic) for an exam program. */
export type { ExamSyllabusItem } from '@/types/exam'

export interface ExamSyllabusQuery {
  programId: number
  scope?: 'ENTRANCE' | 'COMPETITIVE' | null
  programName?: string | null
  stageId?: number | null
  stageName?: string | null
  subjectName?: string | null
}

export function parseExamSyllabusQuery(route: {
  params: Record<string, string | string[]>
  query: Record<string, string | string[] | null | undefined>
}): ExamSyllabusQuery {
  const programId = Number(route.params.programId)
  const scope =
    route.query.scope === 'ENTRANCE' || route.query.scope === 'COMPETITIVE'
      ? route.query.scope
      : null
  const programName = route.query.programName ? String(route.query.programName) : null
  const stageId = route.query.stageId ? Number(route.query.stageId) : null
  const stageName = route.query.stageName ? String(route.query.stageName) : null
  const subjectName = route.query.subjectName ? String(route.query.subjectName) : null
  return { programId, scope, programName, stageId, stageName, subjectName }
}

export function examSyllabusQueryString(
  ctx: Partial<ExamSyllabusQuery> & Pick<ExamSyllabusQuery, 'programId'>,
): Record<string, string> {
  const query: Record<string, string> = {}
  if (ctx.scope) query.scope = ctx.scope
  if (ctx.programName) query.programName = ctx.programName
  if (ctx.stageId) query.stageId = String(ctx.stageId)
  if (ctx.stageName) query.stageName = ctx.stageName
  if (ctx.subjectName) query.subjectName = ctx.subjectName
  return query
}

/** Subjects under a stage (includes legacy SECTION rows stored before simplification). */
export function collectStageSubjects(tree: SyllabusNode[], stageId?: number | null): ExamSyllabusItem[] {
  return tree
    .filter((node) => {
      if (node.parent_id) return false
      if (stageId && node.exam_stage_id !== stageId) return false
      return node.node_type === 'SUBJECT' || node.node_type === 'SECTION'
    })
    .sort((a, b) => a.sequence_number - b.sequence_number)
}

export function collectItemsByType(nodes: SyllabusNode[], type: SyllabusNodeType): ExamSyllabusItem[] {
  const result: ExamSyllabusItem[] = []
  const walk = (list: SyllabusNode[]) => {
    for (const node of list) {
      if (node.node_type === type) result.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result.sort((a, b) => a.sequence_number - b.sequence_number)
}

export function getChildItems(
  nodes: SyllabusNode[],
  parentId: number,
  type?: SyllabusNodeType,
): ExamSyllabusItem[] {
  const parent = findItemInTree(nodes, parentId)
  if (!parent?.children) return []
  return parent.children
    .filter((child) => (type ? child.node_type === type : true))
    .sort((a, b) => a.sequence_number - b.sequence_number)
}

export function findItemInTree(nodes: SyllabusNode[], id: number): ExamSyllabusItem | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findItemInTree(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function findChapterName(tree: SyllabusNode[], chapterId: number): string | null {
  return findItemInTree(tree, chapterId)?.name ?? null
}

export function programLabel(program: { exam_body?: { abbreviation?: string }; name: string }) {
  return `${program.exam_body?.abbreviation ?? ''} — ${program.name}`.trim()
}

/** Chapter or topic node id for question bank (prefers topicId, then chapterId, then nodeId). */
export type SyllabusNodeId = string | number | null

export function resolveExamChapterId(data: {
  topicId?: SyllabusNodeId
  chapterId?: SyllabusNodeId
  nodeId?: SyllabusNodeId
}): number | null {
  const raw = data.topicId ?? data.chapterId ?? data.nodeId
  if (raw === '' || raw == null) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** Alias: leaf syllabus node used for tagging / listing. */
export const resolveExamNodeId = resolveExamChapterId

// Legacy aliases (internal / gradual migration)
export const collectNodesByType = collectItemsByType
export const getChildNodes = getChildItems
export const findNodeInTree = findItemInTree
