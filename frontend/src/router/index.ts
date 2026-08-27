import { createRouter, createWebHistory } from 'vue-router'
import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import BoardDashboard from '@/views/admin/board/BoardDashboard.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import FormLayout from '@/layouts/FormLayout.vue'
import LoginLayout from '@/layouts/LoginLayout.vue'
import EditChapter from '@/views/admin/syllabus/subject/EditChapter.vue'
import LoginPage from '@/views/login/LoginPage.vue'
import RegistrationPage from '@/views/login/RegistrationPage.vue'
import ForgetPassword from '@/views/login/ForgetPassword.vue'
import ResetPassword from '@/views/login/ResetPassword.vue'
import ChangePassword from '@/views/login/ChangePassword.vue'
import AdminProfile from '@/views/admin/profile/AdminProfile.vue'
import TeacherProfile from '@/views/teacher/profile/TeacherProfile.vue'
import { useAuthStore } from '@/stores/auth'

// Define public routes that don't require authentication
const publicRoutes = new Set(['/login', '/register', '/forgot-password', '/reset-password'])

// Update the route meta type
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: RegistrationPage,
    meta: { requiresAuth: false },
  },
  // Legacy auth URLs → unified login / registration pages
  {
    path: '/teacher-admin-login',
    name: 'teacher-admin-login',
    redirect: { name: 'login' },
  },
  {
    path: '/iti-student-login',
    name: 'iti-student-login',
    redirect: { name: 'login' },
  },
  {
    path: '/student-registration',
    name: 'studentRegistration',
    redirect: { name: 'register' },
  },
  {
    path: '/iti-student-registration',
    name: 'iti-student-registration',
    redirect: { name: 'register' },
  },
  {
    path: '/aspirant-registration',
    name: 'aspirantRegistration',
    redirect: { name: 'register', query: { type: 'aspirant' } },
  },
  {
    path: '/forgot-password',
    name: 'forgotPassword',
    component: ForgetPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: ResetPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/browse-orgs',
    name: 'browseOrgs',
    component: () => import('@/views/public/BrowseOrgs.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/change-password',
    name: 'changePassword',
    component: ChangePassword,
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/login',
    meta: { requiresAuth: false },
  },
  // Dashboard routes with navbar
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'board',
        name: 'board',
        component: BoardDashboard,
        beforeEnter: (to) => {
          const tab = to.query.tab
          if (tab === 'ENTRANCE' || tab === 'COMPETITIVE') {
            return { name: 'examCatalog', query: { tab } }
          }
        },
      },
      {
        path: 'exams',
        name: 'examCatalog',
        component: () => import('@/views/admin/exams/ExamCatalogDashboard.vue'),
      },
      {
        path: 'school',
        name: 'SchoolDashboard',
        component: () => import('../views/admin/school/SchoolDashboard.vue'),
      },
      {
        path: 'teacher',
        name: 'TeacherDashboard',
        component: () => import('../views/admin/teacher/TeacherDashboard.vue'),
      },
      {
        path: 'syllabus',
        name: 'SyllabusDashboard',
        component: () => import('../views/admin/syllabus/SyllabusDashboard.vue'),
      },
      {
        path: 'syllabus/standard',
        name: 'syllabusStandard',
        component: () => import('@/views/admin/syllabus/Standard/StandardDashboard.vue'),
      },
      {
        path: 'syllabus/subject/:id',
        name: 'subjectSyllabus',
        component: () => import('@/views/admin/syllabus/subject/SubjectDashboard.vue'),
      },
      {
        path: 'syllabus/exam/:programId',
        name: 'examSyllabusSubjects',
        component: () => import('@/views/admin/syllabus/exam/ExamSubjectDashboard.vue'),
      },
      {
        path: 'syllabus/exam/:programId/subjects',
        redirect: (to) => ({
          name: 'examSyllabusSubjects',
          params: { programId: to.params.programId },
          query: to.query as Record<string, string>,
        }),
      },
      {
        path: 'syllabus/exam/:programId/sections',
        name: 'examSyllabusSections',
        redirect: (to) => ({
          name: 'examSyllabusSubjects',
          params: { programId: to.params.programId },
          query: to.query as Record<string, string>,
        }),
      },
      {
        path: 'syllabus/exam/:programId/subject/:subjectId',
        name: 'examSyllabusChapters',
        component: () => import('@/views/admin/syllabus/exam/ExamChapterDashboard.vue'),
      },
      {
        path: 'syllabus/program/:programId',
        redirect: (to) => ({
          name: 'examSyllabusSubjects',
          params: { programId: to.params.programId },
          query: to.query as Record<string, string>,
        }),
      },
      {
        path: 'pattern',
        name: 'patternDashboard',
        component: () => import('@/views/admin/pattern/PatternDashboard.vue'),
      },
      {
        path: 'profile',
        name: 'adminProfile',
        component: AdminProfile,
      },
      {
        path: 'questionBank',
        name: 'questionBank',
        component: () => import('@/views/admin/questionBank/Questionbank.vue'),
      },
      {
        path: 'questionBank/dashboard',
        name: 'questionDashboard',
        component: () => import('@/views/admin/questionBank/QuestionDashboard.vue'),
      },
      {
        path: 'questionBank/add',
        name: 'addQuestion',
        component: () => import('@/views/admin/questionBank/AddQuestion.vue'),
      },
      {
        path: 'questionBank/translation',
        name: 'translationPending',
        component: () => import('../views/admin/questionBank/TranslationPending.vue'),
      },
      {
        path: 'image-upload-demo',
        name: 'imageUploadDemo',
        component: () => import('@/views/admin/questionBank/ImageUploadDemo.vue'),
      },
      // Legacy exam-catalog URLs → dedicated exam catalog page
      {
        path: 'exam-catalog',
        redirect: { name: 'examCatalog' },
      },
      {
        path: 'exam-catalog/syllabus/:programId',
        redirect: (to) => ({
          name: 'examSyllabusSections',
          params: { programId: to.params.programId },
        }),
      },
    ],
  },
  // Form routes without navbar
  {
    path: '/admin',
    component: FormLayout,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'board/add',
        name: 'addBoard',
        component: () => import('@/views/admin/board/AddBoard.vue'),
      },
      {
        path: 'board/:id/edit',
        name: 'editBoard',
        component: () => import('@/views/admin/board/EditBoard.vue'),
      },
      {
        path: 'exams/add',
        name: 'addExam',
        component: () => import('@/views/admin/exams/AddExam.vue'),
      },
      {
        path: 'exams/:id/edit',
        name: 'editExam',
        component: () => import('@/views/admin/exams/EditExam.vue'),
      },
      {
        path: 'school/add',
        name: 'addSchool',
        component: () => import('@/views/admin/school/AddSchool.vue'),
      },
      {
        path: 'school/:id/edit',
        name: 'editSchool',
        component: () => import('@/views/admin/school/EditSchool.vue'),
      },
      {
        path: 'teacher/add',
        name: 'addTeacher',
        component: () => import('@/views/admin/teacher/AddTeacher.vue'),
      },
      {
        path: 'teacher/:id/edit',
        name: 'editTeacher',
        component: () => import('@/views/admin/teacher/EditTeacher.vue'),
      },
      {
        path: 'syllabus/subject/:id/add-chapter',
        name: 'addChapter',
        component: () => import('@/views/admin/syllabus/subject/AddChapter.vue'),
      },
      {
        path: 'syllabus/exam/:programId/subject/:subjectId/add-chapter',
        name: 'examAddChapter',
        component: () => import('@/views/admin/syllabus/exam/ExamAddChapter.vue'),
      },
      {
        path: 'syllabus/exam/:programId/subject/:subjectId/chapter/:chapterId/edit',
        name: 'examEditChapter',
        component: () => import('@/views/admin/syllabus/exam/ExamEditChapter.vue'),
      },
      {
        path: 'syllabus/exam/:programId/add-subject',
        name: 'examAddSubject',
        component: () => import('@/views/admin/syllabus/exam/AddExamSubject.vue'),
      },
      {
        path: 'questionBank/edit/:id',
        name: 'editQuestion',
        component: () => import('@/views/admin/questionBank/EditQuestion.vue'),
      },
      // Pattern routes
      {
        path: 'pattern/add',
        name: 'createPattern',
        component: () => import('@/views/admin/pattern/AddPattern.vue'),
      },
      {
        path: 'pattern/exam/add',
        name: 'createExamPattern',
        component: () => import('@/views/admin/pattern/AddExamPaperTemplate.vue'),
      },
      {
        path: 'pattern/exam/:id/edit',
        name: 'editExamPattern',
        component: () => import('@/views/admin/pattern/EditExamPaperTemplate.vue'),
      },
      {
        path: 'pattern/:id/edit',
        name: 'editPattern',
        component: () => import('@/views/admin/pattern/EditPattern.vue'),
      },
      {
        path: 'pattern/section/add',
        name: 'addSection',
        component: () => import('@/views/admin/pattern/AddSection.vue'),
      },
      {
        path: 'pattern/section/edit',
        name: 'editSection',
        component: () => import('@/views/admin/pattern/EditSection.vue'),
      },
      // Add Translation route
      {
        path: 'questionBank/translation/:id',
        name: 'addTranslation',
        component: () => import('@/views/admin/questionBank/AddTranslation.vue'),
      },
      // Edit Translation route
      {
        path: 'questionBank/translation/:id/edit',
        name: 'editTranslation',
        component: () => import('@/views/admin/questionBank/EditTranslation.vue'),
      },
    ],
  },
  {
    path: '/admin/syllabus/chapter/:id/edit',
    name: 'editChapter',
    component: EditChapter,
    meta: {
      requiresAuth: true,
      roles: ['ADMIN'],
    },
  },
  // Teacher routes
  {
    path: '/teacher',
    component: LoginLayout,
    meta: { requiresAuth: true, roles: ['TEACHER'] },
    children: [
      {
        path: '',
        redirect: { name: 'teacherHome' },
      },
      {
        path: 'home',
        name: 'teacherHome',
        component: () => import('@/views/teacher/home/TeacherHome.vue'),
      },
      {
        path: 'organization',
        name: 'teacherOrganization',
        component: () => import('@/views/teacher/organization/OrganizationHome.vue'),
      },
      {
        path: 'create-org',
        name: 'teacherCreateOrg',
        component: () => import('@/views/teacher/organization/CreateOrg.vue'),
      },
      {
        path: 'join-org',
        name: 'teacherJoinOrg',
        component: () => import('@/views/teacher/organization/JoinOrg.vue'),
      },
      {
        path: 'org-requests',
        name: 'teacherOrgRequests',
        component: () => import('@/views/teacher/organization/ManageJoinRequests.vue'),
      },
      {
        path: 'organization/join-requests',
        redirect: { name: 'teacherOrgRequests' },
      },
      {
        path: 'org-cohorts',
        name: 'teacherOrgCohorts',
        component: () => import('@/views/teacher/organization/ManageCohorts.vue'),
      },
      {
        path: 'org-groups',
        name: 'teacherOrgGroups',
        component: () => import('@/views/teacher/organization/ManageGroups.vue'),
      },
      {
        path: 'org-invite-csv',
        name: 'teacherOrgInviteCsv',
        component: () => import('@/views/teacher/organization/InviteMembersCsv.vue'),
      },
      {
        path: 'assign-test',
        name: 'assignOnlineTest',
        component: () => import('@/views/teacher/assignTest/assignTestDashboard.vue'),
      },
      {
        path: 'assign-online-test',
        redirect: { name: 'assignOnlineTest' },
      },
      {
        path: 'assign-test/:testPaperId/students',
        name: 'assignToStudents',
        component: () => import('@/views/teacher/assignTest/assignToStudents.vue'),
      },
      {
        path: 'assign-test/create',
        name: 'createTestAssign',
        component: () => import('@/views/teacher/assignTest/createTest.vue'),
      },
      {
        path: 'assign-test/create-mock',
        name: 'createMockTest',
        component: () => import('@/views/teacher/assignTest/createMockTest.vue'),
      },
      {
        path: 'assign-test/select-pattern',
        name: 'selectTestPatternAssign',
        component: () => import('@/views/teacher/assignTest/selectMcqPattern.vue'),
      },
      {
        path: 'assign-test/chapter-marks',
        name: 'createTestPaperDetailAssign',
        component: () => import('@/views/teacher/assignTest/chapterMarksDistribution.vue'),
      },
      {
        path: 'assign-test/preview-test-paper',
        name: 'previewTestPaper',
        component: () => import('@/views/teacher/assignTest/previewTestPaper.vue'),
      },
      {
        path: 'profile',
        name: 'teacherProfile',
        component: TeacherProfile,
      },
      {
        path: 'syllabus',
        name: 'teacherSyllabus',
        component: () => import('@/views/teacher/syllabus/ViewSyllabusDashboard.vue'),
      },
      {
        path: 'syllabus/view',
        name: 'viewSyllabusDetail',
        component: () => import('@/views/teacher/syllabus/ViewSyllabus.vue'),
      },
      {
        path: 'manage-students',
        name: 'manageStudents',
        component: () => import('@/views/teacher/manageStudents/ManageStudents.vue'),
      },
      {
        path: 'manage-iti-students',
        name: 'manageItiStudents',
        component: () => import('@/views/teacher/manageItiStudents/ManageItiStudents.vue'),
      },
      {
        path: 'iti-students/:standardId/:schoolId',
        name: 'itiStudentsList',
        component: () => import('@/views/teacher/manageItiStudents/ItiStudentsList.vue'),
      },
      {
        path: 'create-test-paper',
        name: 'createTestPaper',
        component: () => import('@/views/teacher/createTestPaper/createTestPaperDashboard.vue'),
      },
      // Option C: legacy paths — exam category selection now lives in the assign dashboard tabs
      {
        path: 'competitive-exams',
        redirect: { name: 'assignOnlineTest' },
      },
      {
        path: 'entrance-exams',
        redirect: { name: 'assignOnlineTest' },
      },
      {
        path: 'select-test-pattern',
        name: 'selectTestPattern',
        component: () => import('@/views/teacher/createTestPaper/selectPattern.vue'),
      },
      {
        path: 'previous-test-paper',
        name: 'previousTestPaper',
        component: () => import('@/views/teacher/previousTestPaper/previousTestPaperDashboard.vue'),
      },
      {
        path: 'test-paper-pdf/:id',
        name: 'testPaperPdf',
        component: () => import('@/views/teacher/previousTestPaper/testPaperPdfViewer.vue'),
      },
      {
        path: 'create-test-paper-detail',
        name: 'createTestPaperDetail',
        // This component would need to be created in a future task
        component: () => import('@/views/teacher/createTestPaper/createTestPaperDetail.vue'),
      },
      {
        path: 'test-paper-preview',
        name: 'testPaperPreview',
        component: () => import('@/views/teacher/createTestPaper/testPaperPreview.vue'),
      },
      {
        path: 'save-test-paper',
        name: 'saveTestPaper',
        component: () => import('@/views/teacher/createTestPaper/saveTestPaper.vue'),
      },
      {
        path: 'result-dashboard/:testPaperId',
        name: 'testResultDashboard',
        component: () => import('@/views/teacher/resultDashboard/ResultDashboard.vue'),
      },
      {
        path: 'result-dashboard/:testPaperId/chapter/:chapterName',
        name: 'chapterStudentDetails',
        component: () => import('@/views/teacher/resultDashboard/ChapterStudentDetails.vue'),
      },
    ],
  },
  // Student routes
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] },
    children: [
      {
        path: '',
        redirect: { name: 'studentExam' },
      },
      {
        path: 'home',
        name: 'studentHome',
        component: () => import('@/views/student/home/StudentHome.vue'),
      },
      {
        path: 'exam',
        name: 'studentExam',
        component: () => import('@/views/student/exam/AssignedTest.vue'),
      },
      {
        path: 'smart-test',
        name: 'smartTest',
        component: () => import('@/views/student/smartTest/SmartTestDashboard.vue'),
      },
      {
        path: 'smart-test/board/create',
        name: 'createBoardSmartTest',
        component: () => import('@/views/student/smartTest/CreateBoardSmartTest.vue'),
      },
      {
        path: 'smart-test/exam/create',
        name: 'createAspirantSmartTest',
        component: () => import('@/views/student/smartTest/CreateAspirantSmartTest.vue'),
      },
      {
        path: 'results',
        name: 'studentResults',
        component: () => import('@/views/student/results/StudentResults.vue'),
      },
      {
        path: 'profile',
        name: 'studentProfile',
        component: () => import('@/views/student/profile/StudentProfile.vue'),
      },
      {
        path: 'join-coaching',
        name: 'studentJoinCoaching',
        component: () => import('@/views/student/organization/JoinCoaching.vue'),
      },
      {
        path: 'exam/result',
        name: 'examResult',
        component: () => import('@/views/student/exam/Result.vue'),
      },
    ],
  },
  // Student Exam Flow Routes (without navbar)
  {
    path: '/student/exam/instructions',
    name: 'examInstructions',
    component: () => import('@/views/student/exam/Instructions.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] },
  },
  {
    path: '/student/exam/take',
    name: 'takeExam',
    component: () => import('@/views/student/exam/TakeExam.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] },
  },
  {
    path: '/student/exam/detailed-report',
    name: 'examDetailedReport',
    component: () => import('@/views/student/exam/DetailedReport.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // If there's a saved position (browser back/forward), use it
    if (savedPosition) {
      return savedPosition
    }
    
    // If navigating to a hash anchor, scroll to it
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // For all other navigation, scroll to top
    return { top: 0, behavior: 'smooth' }
  }
})

// Add a router.afterEach hook that does nothing for now
// We can re-enable logging when needed
router.afterEach(() => {
  // Logging disabled
});

function homePathForRole(userRole: string | null | undefined, fallback: string): string {
  if (userRole === 'ADMIN') return '/admin/board'
  if (userRole === 'TEACHER') return '/teacher/home'
  if (userRole === 'STUDENT') return '/student/exam'
  return fallback
}

function redirectAuthenticatedPublicRoute(
  to: RouteLocationNormalized,
  userRole: string | null | undefined,
  next: NavigationGuardNext,
) {
  if (to.path === '/register') {
    next({
      path: homePathForRole(userRole, '/teacher/home'),
      query: { notice: 'logout-to-register' },
    })
    return
  }
  next({ path: homePathForRole(userRole, '/admin/board') })
}

async function runAuthNavigationGuard(
  to: RouteLocationNormalized,
  authStore: ReturnType<typeof useAuthStore>,
  next: NavigationGuardNext,
) {
  const isAuthenticated = await authStore.checkAuth()
  const userRole = authStore.userRole

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    if (to.meta.roles && userRole && !to.meta.roles.includes(userRole)) {
      next({ name: 'login' })
      return
    }
    next()
    return
  }

  if (isAuthenticated && publicRoutes.has(to.path)) {
    redirectAuthenticatedPublicRoute(to, userRole, next)
    return
  }

  next()
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Prevent infinite loops by checking if we're already navigating to the same route
  if (to.path === from.path && to.query === from.query) {
    next()
    return
  }
  
  // Add a flag to prevent multiple simultaneous auth checks
  if ((globalThis as any).authCheckInProgress) {
    next()
    return
  }
  
  try {
    (globalThis as any).authCheckInProgress = true
    await runAuthNavigationGuard(to, authStore, next)
  } catch (error) {
    console.error('Navigation guard error:', error)
    authStore.clearAuth()
    if (to.path === '/login') {
      next()
    } else {
      next({ name: 'login' })
    }
  } finally {
    (globalThis as any).authCheckInProgress = false
  }
})

export default router
