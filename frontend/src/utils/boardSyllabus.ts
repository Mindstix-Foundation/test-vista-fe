/** ID-like query param accepted as number, string, or null. */
export type IdParam = number | string | null

export interface BoardSyllabusQuery {
  board?: IdParam
  medium?: IdParam
  standard?: IdParam
  subject?: IdParam
  boardName?: string | null
  mediumName?: string | null
  standardName?: string | null
  subjectName?: string | null
}

export function boardSyllabusQueryString(ctx: BoardSyllabusQuery): Record<string, string> {
  const query: Record<string, string> = { scope: 'board' }
  if (ctx.board) query.board = String(ctx.board)
  if (ctx.medium) query.medium = String(ctx.medium)
  if (ctx.standard) query.standard = String(ctx.standard)
  if (ctx.subject) query.subject = String(ctx.subject)
  if (ctx.boardName) query.boardName = ctx.boardName
  if (ctx.mediumName) query.mediumName = ctx.mediumName
  if (ctx.standardName) query.standardName = ctx.standardName
  if (ctx.subjectName) query.subjectName = ctx.subjectName
  return query
}
