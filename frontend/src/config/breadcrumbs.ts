import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  to?: RouteLocationRaw
}

export type BreadcrumbResolver =
  | BreadcrumbItem[]
  | ((route: RouteLocationNormalizedLoaded) => BreadcrumbItem[])

const adminHome: BreadcrumbItem = { label: 'Admin', to: { name: 'board' } }
const teacherHome: BreadcrumbItem = { label: 'Home', to: { name: 'teacherHome' } }
const studentHome: BreadcrumbItem = { label: 'Home', to: { name: 'studentHome' } }

type ExamScope = 'ENTRANCE' | 'COMPETITIVE'

type ExamSyllabusPage = 'subjects' | 'addSubject' | 'chapters' | 'addChapter' | 'editChapter'

type BoardSyllabusPage = 'subjects' | 'chapters' | 'addChapter' | 'editChapter'

function examScopeFromRoute(route: RouteLocationNormalizedLoaded): ExamScope {
  return route.query.scope === 'ENTRANCE' ? 'ENTRANCE' : 'COMPETITIVE'
}

function examScopeLabel(scope: ExamScope) {
  return scope === 'ENTRANCE' ? 'Entrance Exams' : 'Competitive Exams'
}

function examSyllabusNavQuery(route: RouteLocationNormalizedLoaded): Record<string, string> {
  const query: Record<string, string> = { scope: examScopeFromRoute(route) }
  if (route.query.programName) query.programName = String(route.query.programName)
  if (route.query.stageId) query.stageId = String(route.query.stageId)
  if (route.query.stageName) query.stageName = String(route.query.stageName)
  if (route.query.subjectName) query.subjectName = String(route.query.subjectName)
  return query
}

function buildExamSyllabusBase(route: RouteLocationNormalizedLoaded): BreadcrumbItem[] {
  const scope = examScopeFromRoute(route)
  const programId = route.params.programId ? String(route.params.programId) : ''
  const programName = route.query.programName ? String(route.query.programName) : ''
  const stageName = route.query.stageName ? String(route.query.stageName) : ''

  const items: BreadcrumbItem[] = [
    adminHome,
    { label: 'Syllabus Management', to: { name: 'SyllabusDashboard' } },
    {
      label: examScopeLabel(scope),
      to: { name: 'SyllabusDashboard', query: { scope } },
    },
  ]

  if (programId) {
    items.push({
      label: programName || 'Exam',
      to: {
        name: 'examSyllabusSubjects',
        params: { programId },
        query: examSyllabusNavQuery(route),
      },
    })
  }

  if (stageName && programId) {
    items.push({
      label: stageName,
      to: {
        name: 'examSyllabusSubjects',
        params: { programId },
        query: examSyllabusNavQuery(route),
      },
    })
  }

  return items
}

function examSubjectsCrumb(route: RouteLocationNormalizedLoaded): BreadcrumbItem {
  const programId = String(route.params.programId)
  return {
    label: 'Subjects',
    to: {
      name: 'examSyllabusSubjects',
      params: { programId },
      query: examSyllabusNavQuery(route),
    },
  }
}

function examSubjectCrumb(route: RouteLocationNormalizedLoaded): BreadcrumbItem {
  const programId = String(route.params.programId)
  const subjectId = String(route.params.subjectId)
  const subjectName = route.query.subjectName ? String(route.query.subjectName) : 'Subject'
  return {
    label: subjectName,
    to: {
      name: 'examSyllabusChapters',
      params: { programId, subjectId },
      query: examSyllabusNavQuery(route),
    },
  }
}

function examChaptersCrumb(route: RouteLocationNormalizedLoaded): BreadcrumbItem {
  const programId = String(route.params.programId)
  const subjectId = String(route.params.subjectId)
  return {
    label: 'Chapters',
    to: {
      name: 'examSyllabusChapters',
      params: { programId, subjectId },
      query: examSyllabusNavQuery(route),
    },
  }
}

function buildExamSyllabusTrail(route: RouteLocationNormalizedLoaded, page: ExamSyllabusPage): BreadcrumbItem[] {
  const base = buildExamSyllabusBase(route)

  switch (page) {
    case 'subjects':
      return [...base, { label: 'Subjects' }]
    case 'addSubject':
      return [...base, examSubjectsCrumb(route), { label: 'Add Subject' }]
    case 'chapters':
      return [...base, examSubjectCrumb(route), { label: 'Chapters' }]
    case 'addChapter':
      return [...base, examSubjectCrumb(route), examChaptersCrumb(route), { label: 'Add Chapter' }]
    case 'editChapter':
      return [...base, examSubjectCrumb(route), examChaptersCrumb(route), { label: 'Edit Chapter' }]
  }
}

function boardSyllabusNavQuery(route: RouteLocationNormalizedLoaded): Record<string, string> {
  const query: Record<string, string> = { scope: 'board' }
  if (route.query.board) query.board = String(route.query.board)
  if (route.query.medium) query.medium = String(route.query.medium)
  if (route.query.standard) query.standard = String(route.query.standard)
  if (route.query.subject) query.subject = String(route.query.subject)
  if (route.query.boardName) query.boardName = String(route.query.boardName)
  if (route.query.mediumName) query.mediumName = String(route.query.mediumName)
  if (route.query.standardName) query.standardName = String(route.query.standardName)
  if (route.query.subjectName) query.subjectName = String(route.query.subjectName)
  return query
}

function buildBoardSyllabusBase(route: RouteLocationNormalizedLoaded): BreadcrumbItem[] {
  const boardName = route.query.boardName ? String(route.query.boardName) : ''
  const mediumName = route.query.mediumName ? String(route.query.mediumName) : ''
  const standardName = route.query.standardName ? String(route.query.standardName) : ''
  const standardLabel = standardName ? `Standard ${standardName}` : 'Standard'

  const items: BreadcrumbItem[] = [
    adminHome,
    { label: 'Syllabus Management', to: { name: 'SyllabusDashboard' } },
    { label: 'School Board', to: { name: 'SyllabusDashboard', query: { scope: 'board' } } },
  ]

  if (boardName && mediumName) {
    items.push({
      label: `${boardName} | ${mediumName}`,
      to: route.query.standard
        ? { name: 'syllabusStandard', query: boardSyllabusNavQuery(route) }
        : undefined,
    })
  }

  if (standardName && route.query.board && route.query.medium && route.query.standard) {
    items.push({
      label: standardLabel,
      to: { name: 'syllabusStandard', query: boardSyllabusNavQuery(route) },
    })
  }

  return items
}

function boardSubjectsCrumb(route: RouteLocationNormalizedLoaded): BreadcrumbItem {
  return {
    label: 'Subjects',
    to: { name: 'syllabusStandard', query: boardSyllabusNavQuery(route) },
  }
}

function boardSubjectId(route: RouteLocationNormalizedLoaded): string {
  if (route.name === 'subjectSyllabus') {
    return String(route.params.id)
  }
  return String(route.query.subject ?? '')
}

function boardSubjectCrumb(route: RouteLocationNormalizedLoaded): BreadcrumbItem {
  const subjectId = boardSubjectId(route)
  const subjectName = route.query.subjectName ? String(route.query.subjectName) : 'Subject'
  return {
    label: subjectName,
    to: {
      name: 'subjectSyllabus',
      params: { id: subjectId },
      query: boardSyllabusNavQuery(route),
    },
  }
}

function boardChaptersCrumb(route: RouteLocationNormalizedLoaded): BreadcrumbItem {
  const subjectId = boardSubjectId(route)
  return {
    label: 'Chapters',
    to: {
      name: 'subjectSyllabus',
      params: { id: subjectId },
      query: boardSyllabusNavQuery(route),
    },
  }
}

function buildBoardSyllabusTrail(route: RouteLocationNormalizedLoaded, page: BoardSyllabusPage): BreadcrumbItem[] {
  const base = buildBoardSyllabusBase(route)

  switch (page) {
    case 'subjects':
      return [...base, { label: 'Subjects' }]
    case 'chapters':
      return [...base, boardSubjectCrumb(route), { label: 'Chapters' }]
    case 'addChapter':
      return [...base, boardSubjectCrumb(route), boardChaptersCrumb(route), { label: 'Add Chapter' }]
    case 'editChapter':
      return [...base, boardSubjectCrumb(route), boardChaptersCrumb(route), { label: 'Edit Chapter' }]
  }
}

export const breadcrumbTrails: Record<string, BreadcrumbResolver> = {
  // Public / auth
  login: [], // no breadcrumb on the login page
  register: [], // no breadcrumb on create account

  forgotPassword: [
    { label: 'Home', to: { name: 'login' } },
    { label: 'Forgot Password' },
  ],
  resetPassword: [
    { label: 'Home', to: { name: 'login' } },
    { label: 'Reset Password' },
  ],
  changePassword: [
    { label: 'Home', to: { name: 'login' } },
    { label: 'Change Password' },
  ],

  // Admin dashboards
  board: [adminHome, { label: 'School Board Management' }],
  examCatalog: (route) => {
    const tab = route.query.tab as string | undefined
    if (tab === 'ENTRANCE' || tab === 'COMPETITIVE') {
      const tabLabel = tab === 'ENTRANCE' ? 'Entrance Exams' : 'Competitive Exams'
      return [
        adminHome,
        { label: 'Exam Catalog', to: { name: 'examCatalog' } },
        { label: tabLabel },
      ]
    }
    return [adminHome, { label: 'Exam Catalog' }]
  },
  addExam: (route) => {
    const tab = route.query.tab as string | undefined
    const tabQuery = tab === 'ENTRANCE' || tab === 'COMPETITIVE' ? { tab } : undefined
    return [
      adminHome,
      { label: 'Exam Catalog', to: { name: 'examCatalog', query: tabQuery } },
      { label: 'Add Exam' },
    ]
  },
  editExam: (route) => [
    adminHome,
    { label: 'Exam Catalog', to: { name: 'examCatalog' } },
    { label: 'Edit Exam' },
  ],
  SchoolDashboard: [adminHome, { label: 'School Management' }],
  TeacherDashboard: [adminHome, { label: 'Teacher Management' }],
  SyllabusDashboard: (route) => {
    const scope = route.query.scope as string | undefined
    if (scope === 'ENTRANCE') {
      return [adminHome, { label: 'Syllabus Management', to: { name: 'SyllabusDashboard' } }, { label: 'Entrance Exams' }]
    }
    if (scope === 'COMPETITIVE' || scope === 'exam') {
      return [adminHome, { label: 'Syllabus Management', to: { name: 'SyllabusDashboard' } }, { label: 'Competitive Exams' }]
    }
    if (scope === 'board') {
      return [adminHome, { label: 'Syllabus Management', to: { name: 'SyllabusDashboard' } }, { label: 'School Board' }]
    }
    return [adminHome, { label: 'Syllabus Management' }]
  },
  syllabusStandard: (route) => buildBoardSyllabusTrail(route, 'subjects'),
  subjectSyllabus: (route) => buildBoardSyllabusTrail(route, 'chapters'),
  examProgramSyllabus: (route) => buildExamSyllabusTrail(route, 'subjects'),
  examSyllabusSubjects: (route) => buildExamSyllabusTrail(route, 'subjects'),
  examSyllabusChapters: (route) => buildExamSyllabusTrail(route, 'chapters'),
  examAddChapter: (route) => buildExamSyllabusTrail(route, 'addChapter'),
  examAddSubject: (route) => buildExamSyllabusTrail(route, 'addSubject'),
  examEditChapter: (route) => buildExamSyllabusTrail(route, 'editChapter'),
  patternDashboard: (route) => {
    if (route.query.scope === 'exam') {
      if (route.query.examProgramId) {
        return [
          adminHome,
          {
            label: 'Pattern Management',
            to: { name: 'patternDashboard', query: { scope: 'exam' } },
          },
          { label: 'Exam Paper Patterns' },
        ]
      }
      return [
        adminHome,
        { label: 'Pattern Management', to: { name: 'patternDashboard' } },
        { label: 'Competitive / Entrance' },
      ]
    }
    return [adminHome, { label: 'Pattern Management' }]
  },
  adminProfile: [adminHome, { label: 'Profile' }],
  questionBank: (route) => {
    if (route.query.scope === 'exam') {
      return [
        adminHome,
        { label: 'Question Bank', to: { name: 'questionBank' } },
        { label: 'Competitive / Entrance' },
      ]
    }
    return [adminHome, { label: 'Question Bank' }]
  },
  questionDashboard: (route) => {
    if (route.query.scope === 'exam') {
      return [
        adminHome,
        { label: 'Question Bank', to: { name: 'questionBank', query: { scope: 'exam' } } },
        { label: 'Exam Questions' },
      ]
    }
    return [
      adminHome,
      { label: 'Question Bank', to: { name: 'questionBank' } },
      { label: 'Questions' },
    ]
  },
  addQuestion: [
    adminHome,
    { label: 'Question Bank', to: { name: 'questionBank' } },
    { label: 'Add Question' },
  ],
  translationPending: [
    adminHome,
    { label: 'Question Bank', to: { name: 'questionBank' } },
    { label: 'Translation Pending' },
  ],
  imageUploadDemo: [
    adminHome,
    { label: 'Question Bank', to: { name: 'questionBank' } },
    { label: 'Image Upload Demo' },
  ],

  // Admin forms
  addBoard: [
    adminHome,
    { label: 'School Board Management', to: { name: 'board' } },
    { label: 'Add Board' },
  ],
  editBoard: [
    adminHome,
    { label: 'School Board Management', to: { name: 'board' } },
    { label: 'Edit Board' },
  ],
  addSchool: [
    adminHome,
    { label: 'School Management', to: { name: 'SchoolDashboard' } },
    { label: 'Add School' },
  ],
  editSchool: [
    adminHome,
    { label: 'School Management', to: { name: 'SchoolDashboard' } },
    { label: 'Edit School' },
  ],
  addTeacher: [
    adminHome,
    { label: 'Teacher Management', to: { name: 'TeacherDashboard' } },
    { label: 'Add Teacher' },
  ],
  editTeacher: [
    adminHome,
    { label: 'Teacher Management', to: { name: 'TeacherDashboard' } },
    { label: 'Edit Teacher' },
  ],
  addChapter: (route) => buildBoardSyllabusTrail(route, 'addChapter'),
  editChapter: (route) => buildBoardSyllabusTrail(route, 'editChapter'),
  createPattern: [
    adminHome,
    { label: 'Pattern Management', to: { name: 'patternDashboard' } },
    { label: 'Add Pattern' },
  ],
  createExamPattern: (route) => [
    adminHome,
    {
      label: 'Pattern Management',
      to: { name: 'patternDashboard', query: { scope: 'exam' } },
    },
    {
      label: 'Exam Paper Patterns',
      to: {
        name: 'patternDashboard',
        query: {
          scope: 'exam',
          examProgramId: String(route.query.examProgramId ?? ''),
          ...(route.query.examStageId
            ? { examStageId: String(route.query.examStageId) }
            : {}),
        },
      },
    },
    { label: 'Add Paper Pattern' },
  ],
  editExamPattern: (route) => [
    adminHome,
    {
      label: 'Pattern Management',
      to: { name: 'patternDashboard', query: { scope: 'exam' } },
    },
    {
      label: 'Exam Paper Patterns',
      to: {
        name: 'patternDashboard',
        query: {
          scope: 'exam',
          examProgramId: String(route.query.examProgramId ?? ''),
          ...(route.query.examStageId
            ? { examStageId: String(route.query.examStageId) }
            : {}),
        },
      },
    },
    { label: 'Edit Paper Pattern' },
  ],
  editPattern: [
    adminHome,
    { label: 'Pattern Management', to: { name: 'patternDashboard' } },
    { label: 'Edit Pattern' },
  ],
  addSection: [
    adminHome,
    { label: 'Pattern Management', to: { name: 'patternDashboard' } },
    { label: 'Add Section' },
  ],
  editSection: [
    adminHome,
    { label: 'Pattern Management', to: { name: 'patternDashboard' } },
    { label: 'Edit Section' },
  ],
  editQuestion: [
    adminHome,
    { label: 'Question Bank', to: { name: 'questionBank' } },
    { label: 'Edit Question' },
  ],
  addTranslation: [
    adminHome,
    { label: 'Question Bank', to: { name: 'questionBank' } },
    { label: 'Add Translation' },
  ],
  editTranslation: [
    adminHome,
    { label: 'Question Bank', to: { name: 'questionBank' } },
    { label: 'Edit Translation' },
  ],

  // Teacher
  teacherHome: [teacherHome, { label: 'Dashboard' }],
  teacherOrganization: [teacherHome, { label: 'Organization' }],
  teacherCreateOrg: [
    teacherHome,
    { label: 'Organization', to: { name: 'teacherOrganization' } },
    { label: 'Create' },
  ],
  teacherJoinOrg: [
    teacherHome,
    { label: 'Organization', to: { name: 'teacherOrganization' } },
    { label: 'Join' },
  ],
  teacherOrgRequests: [
    teacherHome,
    { label: 'Organization', to: { name: 'teacherOrganization' } },
    { label: 'Join requests' },
  ],
  teacherOrgCohorts: [
    teacherHome,
    { label: 'Organization', to: { name: 'teacherOrganization' } },
    { label: 'Cohorts' },
  ],
  teacherOrgGroups: [
    teacherHome,
    { label: 'Organization', to: { name: 'teacherOrganization' } },
    { label: 'Groups' },
  ],
  teacherOrgInviteCsv: [
    teacherHome,
    { label: 'Organization', to: { name: 'teacherOrganization' } },
    { label: 'Invite CSV' },
  ],
  assignOnlineTest: [
    teacherHome,
    { label: 'Assign Test' },
  ],
  assignToStudents: [
    teacherHome,
    { label: 'Assign Test', to: { name: 'assignOnlineTest' } },
    { label: 'Assign to Students' },
  ],
  createTestAssign: [
    teacherHome,
    { label: 'Assign Test', to: { name: 'assignOnlineTest' } },
    { label: 'Create Test' },
  ],
  createMockTest: [
    teacherHome,
    { label: 'Assign Test', to: { name: 'assignOnlineTest' } },
    { label: 'Create Mock Test' },
  ],
  selectTestPatternAssign: [
    teacherHome,
    { label: 'Assign Test', to: { name: 'assignOnlineTest' } },
    { label: 'Select Pattern' },
  ],
  createTestPaperDetailAssign: [
    teacherHome,
    { label: 'Assign Test', to: { name: 'assignOnlineTest' } },
    { label: 'Chapter Marks' },
  ],
  previewTestPaper: [
    teacherHome,
    { label: 'Assign Test', to: { name: 'assignOnlineTest' } },
    { label: 'Preview Test Paper' },
  ],
  teacherProfile: [teacherHome, { label: 'Profile' }],
  teacherSyllabus: [teacherHome, { label: 'Syllabus' }],
  viewSyllabusDetail: [
    teacherHome,
    { label: 'Syllabus', to: { name: 'teacherSyllabus' } },
    { label: 'View Syllabus' },
  ],
  manageStudents: [teacherHome, { label: 'Manage Students' }],
  manageItiStudents: [teacherHome, { label: 'Manage ITI Students' }],
  itiStudentsList: [
    teacherHome,
    { label: 'Manage ITI Students', to: { name: 'manageItiStudents' } },
    { label: 'Student List' },
  ],
  createTestPaper: [teacherHome, { label: 'Create Test Paper (PDF / Offline)' }],
  selectTestPattern: [
    teacherHome,
    { label: 'Create Test Paper', to: { name: 'createTestPaper' } },
    { label: 'Select Pattern' },
  ],
  previousTestPaper: [teacherHome, { label: 'Previous Test Papers' }],
  testPaperPdf: [
    teacherHome,
    { label: 'Previous Test Papers', to: { name: 'previousTestPaper' } },
    { label: 'PDF Viewer' },
  ],
  createTestPaperDetail: [
    teacherHome,
    { label: 'Create Test Paper', to: { name: 'createTestPaper' } },
    { label: 'Test Paper Detail' },
  ],
  testPaperPreview: [
    teacherHome,
    { label: 'Create Test Paper', to: { name: 'createTestPaper' } },
    { label: 'Preview' },
  ],
  saveTestPaper: [
    teacherHome,
    { label: 'Create Test Paper', to: { name: 'createTestPaper' } },
    { label: 'Save Test Paper' },
  ],
  testResultDashboard: [teacherHome, { label: 'Results' }],
  chapterStudentDetails: (route) => [
    teacherHome,
    {
      label: 'Results',
      to: {
        name: 'testResultDashboard',
        params: { testPaperId: String(route.params.testPaperId ?? '') },
      },
    },
    { label: 'Chapter Details' },
  ],

  // Student
  studentHome: [studentHome, { label: 'Dashboard' }],
  studentExam: [studentHome, { label: 'My Exams' }],
  studentResults: [studentHome, { label: 'Results' }],
  studentProfile: [studentHome, { label: 'Profile' }],
  examInstructions: [
    studentHome,
    { label: 'My Exams', to: { name: 'studentExam' } },
    { label: 'Instructions' },
  ],
  takeExam: [
    studentHome,
    { label: 'My Exams', to: { name: 'studentExam' } },
    { label: 'Take Exam' },
  ],
  examResult: [
    studentHome,
    { label: 'My Exams', to: { name: 'studentExam' } },
    { label: 'Result' },
  ],
  examDetailedReport: [
    studentHome,
    { label: 'My Exams', to: { name: 'studentExam' } },
    { label: 'Detailed Report' },
  ],
}

export function resolveBreadcrumbs(route: RouteLocationNormalizedLoaded): BreadcrumbItem[] {
  const routeName = route.name ? String(route.name) : ''
  const resolver = breadcrumbTrails[routeName]

  let items: BreadcrumbItem[] = []
  if (resolver) {
    items = typeof resolver === 'function' ? resolver(route) : [...resolver]
  } else if (routeName) {
    const label = routeName
      .replaceAll(/([A-Z])/g, ' $1')
      .replaceAll(/[-_]/g, ' ')
      .trim()
    items = [{ label: label.charAt(0).toUpperCase() + label.slice(1) }]
  }

  return normalizeBreadcrumbDepth(items)
}

/**
 * Navigation depth:
 * - 0 Home / portal root — never shown
 * - 1 Sidebar landing pages — never shown alone
 * - 2+ Nested pages — show from sidebar parent (level 1) onward
 */
function isPortalRootCrumb(item: BreadcrumbItem): boolean {
  if (!item.to || typeof item.to !== 'object' || !('name' in item.to) || !item.to.name) {
    return false
  }
  const name = String(item.to.name)
  return name === 'teacherHome' || name === 'studentHome' || name === 'board' || name === 'login'
}

function normalizeBreadcrumbDepth(items: BreadcrumbItem[]): BreadcrumbItem[] {
  const withoutRoot = items[0] && isPortalRootCrumb(items[0]) ? items.slice(1) : items
  // Only show crumbs once we are past a single sidebar-level page
  if (withoutRoot.length < 2) return []
  return withoutRoot
}
