export type PortalId = 'admin' | 'teacher' | 'student'

export interface PortalNavItem {
  id: string
  label: string
  /** Required for leaf items; optional for parent groups with children */
  to?: string
  icon?: string
  /** Nested items (e.g. Organization → Create / Join) */
  children?: PortalNavItem[]
  /** When true, item is kept in config but not rendered */
  hidden?: boolean
  /**
   * How to mark the link active.
   * - exact: path === to
   * - prefix: path === to || path.startsWith(to + '/')
   * - function: custom matcher
   * Default: Vue Router's router-link-active (prefix of matched route)
   */
  activeMatch?: 'exact' | 'prefix' | ((path: string) => boolean)
}

export const portalHomeRoutes: Record<PortalId, string> = {
  admin: '/admin/board',
  teacher: '/teacher/home',
  student: '/student/exam',
}

export const portalNavMenus: Record<PortalId, PortalNavItem[]> = {
  admin: [
    { id: 'navBoard', label: 'School Boards', to: '/admin/board', icon: 'bi-building' },
    { id: 'navExams', label: 'Exams', to: '/admin/exams', icon: 'bi-journal-bookmark' },
    { id: 'navSyllabus', label: 'Syllabus', to: '/admin/syllabus', icon: 'bi-list-check' },
    { id: 'navPattern', label: 'Pattern', to: '/admin/pattern', icon: 'bi-grid-3x3-gap' },
    {
      id: 'navQuestionBank',
      label: 'Question Bank',
      to: '/admin/questionBank',
      icon: 'bi-question-circle',
    },
    { id: 'navSchool', label: 'School', to: '/admin/school', icon: 'bi-mortarboard' },
    { id: 'navTeacher', label: 'Teacher', to: '/admin/teacher', icon: 'bi-person-badge' },
    { id: 'navProfile', label: 'Profile', to: '/admin/profile', icon: 'bi-person-circle' },
  ],
  teacher: [
    { id: 'navHome', label: 'Home', to: '/teacher/home', icon: 'bi-house-fill' },
    {
      id: 'navOrg',
      label: 'Organization',
      to: '/teacher/organization',
      icon: 'bi-building',
      activeMatch: (path) =>
        path.startsWith('/teacher/organization') ||
        path.startsWith('/teacher/create-org') ||
        path.startsWith('/teacher/join-org') ||
        path.startsWith('/teacher/org-'),
    },
    {
      id: 'navCreateTestPaper',
      label: 'Create Test Paper (PDF / Offline)',
      to: '/teacher/create-test-paper',
      icon: 'bi-file-earmark-plus',
      activeMatch: 'prefix',
    },
    {
      id: 'navAssignTest',
      label: 'Assign Online Test',
      to: '/teacher/assign-test',
      icon: 'bi-send',
      activeMatch: 'prefix',
    },
    {
      id: 'navPreviousTestPaper',
      label: 'Previous Test Paper',
      to: '/teacher/previous-test-paper',
      icon: 'bi-clock-history',
      activeMatch: 'prefix',
    },
    {
      id: 'navSyllabus',
      label: 'Syllabus',
      to: '/teacher/syllabus',
      icon: 'bi-list-check',
      hidden: true,
    },
    {
      id: 'navManageStudents',
      label: 'Manage Students',
      to: '/teacher/manage-students',
      icon: 'bi-people',
      hidden: true,
    },
    {
      id: 'navManageItiStudents',
      label: 'Manage Students',
      to: '/teacher/manage-iti-students',
      icon: 'bi-people-fill',
      activeMatch: 'prefix',
    },
    { id: 'navProfile', label: 'Profile', to: '/teacher/profile', icon: 'bi-person-circle' },
  ],
  student: [
    { id: 'navHome', label: 'Home', to: '/student/home', icon: 'bi-house-fill' },
    {
      id: 'navEnroll',
      label: 'Enroll',
      to: '/student/enroll',
      icon: 'bi-book-half',
      hidden: true,
    },
    { id: 'navExam', label: 'Exam', to: '/student/exam', icon: 'bi-journal-text' },
    {
      id: 'navSmartTest',
      label: 'Smart Test',
      to: '/student/smart-test',
      icon: 'bi-lightning-charge-fill',
      activeMatch: 'prefix',
    },
    {
      id: 'navOrg',
      label: 'Organization',
      to: '/student/join-coaching',
      icon: 'bi-building',
    },
    {
      id: 'navResults',
      label: 'Results',
      to: '/student/results',
      icon: 'bi-clipboard-check',
      activeMatch: 'prefix',
    },
    { id: 'navProfile', label: 'Profile', to: '/student/profile', icon: 'bi-person-fill' },
  ],
}

export function getVisibleNavItems(portal: PortalId): PortalNavItem[] {
  return portalNavMenus[portal]
    .filter((item) => !item.hidden)
    .map((item) => {
      if (!item.children?.length) return item
      return {
        ...item,
        children: item.children.filter((child) => !child.hidden),
      }
    })
}

export function isNavItemActive(item: PortalNavItem, path: string): boolean {
  if (typeof item.activeMatch === 'function') {
    return item.activeMatch(path)
  }
  if (item.children?.length) {
    return item.children.some((child) => isNavItemActive(child, path))
  }
  if (!item.to) return false
  if (item.activeMatch === 'exact') {
    return path === item.to
  }
  if (item.activeMatch === 'prefix') {
    return path === item.to || path.startsWith(`${item.to}/`)
  }
  // Default: prefix match on the configured path
  return path === item.to || path.startsWith(`${item.to}/`)
}
