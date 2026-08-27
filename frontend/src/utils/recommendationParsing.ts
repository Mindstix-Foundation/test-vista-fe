const CHAPTER_NAME_PATTERNS = [/: ([^-]+) -/, /: ([^-\n]+) - /, /: ([^-\n]+)$/]

const RECOMMENDATION_TYPE_INDICATORS = [
  '🔴 Critical Focus Areas',
  '🟡 Areas for Enhancement',
  '🟢 Strong Performance',
] as const

export function getRecommendationEmoji(recommendation: string): string {
  const match = /^(🔴|🟡|🟢)/.exec(recommendation)
  return match ? match[1] : '💡'
}

export function getRecommendationType(recommendation: string): string {
  if (recommendation.includes('🔴 Critical Focus Areas')) return 'Critical Focus Areas'
  if (recommendation.includes('🟡 Areas for Enhancement')) return 'Areas for Enhancement'
  if (recommendation.includes('🟢 Strong Performance')) return 'Strong Performance'
  return 'Recommendation'
}

export function formatChapterNames(chapters: string): string {
  if (!chapters || chapters.trim() === '') {
    return 'Multiple Chapters'
  }
  return chapters.trim()
}

function matchChapterFromPatterns(recommendation: string): string | null {
  for (const pattern of CHAPTER_NAME_PATTERNS) {
    const match = pattern.exec(recommendation)
    if (match?.[1]?.trim()) return formatChapterNames(match[1].trim())
  }
  return null
}

function matchChapterFromTypeIndicators(recommendation: string): string | null {
  for (const indicator of RECOMMENDATION_TYPE_INDICATORS) {
    if (!recommendation.includes(indicator)) continue
    const afterIndicator = recommendation.split(indicator)[1]
    if (!afterIndicator) continue
    const colonIdx = afterIndicator.indexOf(':')
    if (colonIdx < 0) continue
    let chapter = afterIndicator.slice(colonIdx + 1).trim()
    const dashIdx = chapter.indexOf(' -')
    if (dashIdx >= 0) chapter = chapter.slice(0, dashIdx).trim()
    if (chapter) return formatChapterNames(chapter)
  }
  return null
}

export function getRecommendationChapters(recommendation: string): string {
  return (
    matchChapterFromPatterns(recommendation) ??
    matchChapterFromTypeIndicators(recommendation) ??
    'Multiple Chapters'
  )
}

export function getRecommendationMessage(recommendation: string): string {
  const match = / - (.+)$/.exec(recommendation)
  return match ? match[1].trim() : recommendation
}

export function getRecommendationClass(recommendation: string): string {
  if (recommendation.includes('🔴 Critical Focus Areas')) return 'recommendation-critical'
  if (recommendation.includes('🟡 Areas for Enhancement')) return 'recommendation-enhancement'
  if (recommendation.includes('🟢 Strong Performance')) return 'recommendation-strong'
  return 'recommendation-default'
}
