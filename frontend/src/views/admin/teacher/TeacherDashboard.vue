<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center g-2 align-items-center mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">TEACHER MANAGEMENT</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <router-link to="/admin/teacher/add" class="btn btn-success" id="addButton"
            >Add Teacher</router-link
          >
        </div>
      </div>
      <hr />
    </div>

    <!-- Search Section -->
    <div class="row p-2 justify-content-center mb-2">
      <div class="col-12 col-sm-10 col-md-10">
        <div class="row g-2">
          <!-- Teacher Search (Full Width) -->
          <div class="col-12">
            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="form-control search-input"
                id="searchTeacherInput"
                placeholder="Search for Teacher"
                v-model="teacherSearch"
                autocomplete="off"
                @input="handleTeacherSearchInput"
                ref="teacherSearchInputRef"
              />
              <i v-if="isSearchingTeacher" class="bi bi-arrow-repeat search-loading-icon"></i>
              <i v-else-if="teacherSearch" class="bi bi-x-circle clear-search-icon" @click="clearSearch('teacher')"></i>
            </div>
          </div>

          <!-- Second Row with School Search and Sort Dropdown -->
          <div class="col-12 col-md-6">
            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="form-control search-input"
                id="searchSchoolInput"
                placeholder="Search for School"
                v-model="schoolSearch"
                autocomplete="off"
                @input="handleSchoolSearchInput"
                ref="schoolSearchInputRef"
              />
              <i v-if="isSearchingSchool" class="bi bi-arrow-repeat search-loading-icon"></i>
              <i v-else-if="schoolSearch" class="bi bi-x-circle clear-search-icon" @click="clearSearch('school')"></i>
            </div>
          </div>

          <!-- Sort Dropdown (Half Width) -->
          <div class="col-12 col-md-6">
            <div class="sort-wrapper">
              <select class="form-select sort-select" id="sortSelect" v-model="sortOption" @change="handleSortChange">
                <option value="name_asc">Sort by Teacher Name (A-Z)</option>
                <option value="name_desc">Sort by Teacher Name (Z-A)</option>
                <option value="created_at_desc">Sort by Created At (Newest)</option>
                <option value="created_at_asc">Sort by Created At (Oldest)</option>
                <option value="updated_at_desc">Sort by Updated At (Newest)</option>
                <option value="updated_at_asc">Sort by Updated At (Oldest)</option>
              </select>
              <i class="bi bi-funnel sort-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div id="table-container" class="row p-2 mt-4 justify-content-center">
      <div class="col-12 col-sm-10 col-md-10">
        <div class="table-responsive position-relative">
          <!-- Loading overlay for search -->
          <div v-if="isSearchingTeacher || isSearchingSchool" class="search-loading-overlay">
            <output
              class="spinner-border spinner-border-sm text-primary"
            >
              <span class="visually-hidden">Searching...</span>
            </output>
          </div>

          <table
            class="table table-sm table-striped table-hover table-bordered"
            style="width: 100%"
            :class="{ 'table-searching': isSearchingTeacher || isSearchingSchool }"
          >
            <caption>List of teachers with their associated schools and access status</caption>
            <colgroup>
              <col style="width: 20px" />
              <col style="width: 35%" />
              <col style="width: 65%" />
              <col style="width: 95px" />
              <col style="width: 70px" />
            </colgroup>
            <thead class="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Teacher</th>
                <th scope="col">School</th>
                <th scope="col" class="text-nowrap justify-content-center">
                  <span @click="toggleFilter">
                    Access &nbsp;<i class="bi bi-funnel text-white"></i>
                  </span>
                  <div v-show="showFilter" class="mt-2">
                    <div class="btn-group">
                      <button
                        v-for="status in ['All', 'Grant', 'Revoke']"
                        :key="status"
                        class="btn btn-sm"
                        :class="{ 'btn-light': selectedStatus === status }"
                        @click="filterByStatus(status)"
                      >
                        {{ status }}
                      </button>
                    </div>
                  </div>
                </th>
                <th scope="col" class="text-end">Manage</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-if="loading && !isSearchingTeacher && !isSearchingSchool">
                <td colspan="5" class="text-center">
                  <output class="spinner-border">
                    <span class="visually-hidden">Loading...</span>
                  </output>
                </td>
              </tr>
              <template v-else>
                <tr v-for="(teacher, index) in filteredAndHighlightedTeachers" :key="teacher.id">
                  <th scope="row">{{ (currentPage - 1) * pageSize + index + 1 }}</th>
                  <td v-html="teacher.highlightedName"></td>
                  <td v-html="teacher.highlightedSchoolName"></td>
                  <td>{{ teacher.status ? 'Granted' : 'Revoked' }}</td>
                  <td class="text-center">
                    <i
                      class="bi bi-three-dots"
                      @click="openViewModal(teacher)"
                      style="cursor: pointer"
                    ></i>
                  </td>
                </tr>
                <tr v-if="filteredTeachers.length === 0">
                  <td colspan="5" class="text-center">No matching results found.</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="row mt-3 p-2 justify-content-center">
      <div class="col-12 col-sm-10">
        <div class="d-flex justify-content-between align-items-center">
          <!-- Pagination Info -->
          <div class="text-muted">
            Showing {{ teachers.length ? (currentPage - 1) * pageSize + 1 : 0 }} to
            {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} entries
          </div>

          <!-- Pagination Buttons -->
          <nav aria-label="Teacher pagination">
            <ul class="pagination mb-0">
              <!-- Previous Page Button -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>

              <!-- Page Numbers -->
              <li v-for="page in visiblePageNumbers" :key="page" class="page-item"
                  :class="{ active: page === currentPage, disabled: page === '...' }">
                <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(Number(page))">{{ page }}</a>
                <span v-else class="page-link">...</span>
              </li>

              <!-- Next Page Button -->
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- View Teacher Modal -->
    <div
      class="modal fade"
      id="viewTeacherModal"
      tabindex="-1"
      aria-labelledby="viewTeacherModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" v-if="selectedTeacher">
          <div class="modal-header">
            <h3 class="modal-title">Teacher Information</h3>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="container">
              <div class="row mt-4">
                <div class="col-12">
                  <form>
                    <div class="row g-3">
                      <!-- Basic Information Section -->
                      <div class="col-12 mb-3">
                        <h5 class="border-bottom pb-2">Basic Information</h5>
                      </div>

                      <div class="row">
                        <label class="col-12 col-lg-3 col-form-label fw-bold" for="teacherName">
                          Teacher Name:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="teacherName"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.name"
                          />
                        </div>
                      </div>

                      <div class="row">
                        <label class="col-12 col-lg-3 col-form-label fw-bold" for="schoolName">
                          School Name:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="schoolName"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.school?.name"
                          />
                        </div>
                      </div>

                      <div class="row">
                        <div class="col-12 col-lg-6">
                          <div class="row">
                            <label
                              class="col-12 col-lg-6 col-form-label fw-bold"
                              for="contactNumber"
                            >
                              Contact Number:
                            </label>
                            <div class="col-12 col-lg-6">
                              <input
                                type="text"
                                id="contactNumber"
                                readonly
                                class="form-control-plaintext"
                                :value="selectedTeacher.contactNumber"
                              />
                            </div>
                          </div>
                        </div>
                        <div class="col-12 col-lg-6">
                          <div class="row">
                            <label
                              class="col-12 col-lg-6 col-form-label fw-bold"
                              for="alternateContactNumber"
                            >
                              Alternate Number:
                            </label>
                            <div class="col-12 col-lg-6">
                              <input
                                type="text"
                                id="alternateContactNumber"
                                readonly
                                class="form-control-plaintext"
                                :value="selectedTeacher.alternateContactNumber ?? 'Not provided'"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="row">
                        <label class="col-12 col-lg-3 col-form-label fw-bold" for="emailId">
                          Email Id:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="emailId"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.emailId"
                          />
                        </div>
                      </div>

                      <div class="row">
                        <label
                          class="col-12 col-lg-3 col-form-label fw-bold"
                          for="highestQualification"
                        >
                          Highest Qualification:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="highestQualification"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.highestQualification"
                          />
                        </div>
                      </div>

                      <div class="row">
                        <label class="col-12 col-lg-3 col-form-label fw-bold" for="status">
                          Access Status:
                        </label>
                        <div class="col-12 col-lg-9">
                          <div class="form-control-plaintext">
                            <span
                              class="badge"
                              :class="selectedTeacher.status ? 'bg-success' : 'bg-danger'"
                            >
                              {{ selectedTeacher.status ? 'Granted' : 'Revoked' }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Teaching Assignments Section -->
                      <div class="col-12 mt-4">
                        <h5 class="border-bottom pb-2">Teaching Assignments</h5>
                      </div>

                      <div id="classSubjectList" v-if="selectedTeacher.teacherSubjects.length > 0" class="col-12">
                        <ul class="list-group">
                          <li
                            v-for="(standardGroup, standardName) in groupedTeacherSubjects"
                            :key="standardName"
                            class="mb-2"
                          >
                            <div class="list-group-item">
                              <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold">Standard {{ standardName }}</span>
                              </div>
                              <div class="ps-3 d-flex flex-wrap gap-2">
                                <span
                                  v-for="subject in standardGroup"
                                  :key="subject.id"
                                  class="subject-badge"
                                >
                                  <i class="bi bi-book me-1"></i>
                                  {{ subject.mediumStandardSubject.subject.name }}
                                </span>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div v-else class="col-12 text-center text-muted">No subjects assigned</div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-light"
              style="border: 1px solid gray"
              @click="toggleTeacherStatus"
            >
              <span
                class="status-indicator"
                :style="{ backgroundColor: selectedTeacher.status ? '#28a745' : '#dc3545' }"
              ></span>
              <span class="status-text">{{ selectedTeacher.status ? 'Granted' : 'Revoked' }}</span>
            </button>
            <router-link
              :to="{ name: 'editTeacher', params: { id: selectedTeacher.id } }"
              class="btn btn-dark"
              @click="closeViewModal"
            >
              Edit
            </router-link>
            <button type="button" class="btn btn-custom" @click="showDeleteConfirmation">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Teacher</h5>
            <button
              type="button"
              class="btn-close"
              @click="handleDeleteCancel"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">
              Are you sure you want to delete this teacher? This action cannot be undone.
            </p>
            <div class="form-group">
              <label for="confirmText" class="form-label">Type "sure" to confirm deletion:</label>
              <input
                type="text"
                class="form-control"
                id="confirmText"
                v-model="confirmationText"
                placeholder="Type 'sure' here"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" @click="handleDeleteCancel">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteTeacher"
              :disabled="confirmationText !== 'sure'"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Status Confirmation Modals -->
    <div
      class="modal fade"
      id="accessConfirmationModal"
      tabindex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" :class="confirmationModalStyle">
            <h5 class="modal-title text-white">{{ confirmationModalTitle }}</h5>
          </div>
          <div class="modal-body">
            {{ confirmationModalMessage }}
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              style="border: 1px solid gray"
              @click="handleAccessCancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn"
              :class="confirmationModalStyle"
              @click="updateTeacherStatus"
            >
              {{ selectedTeacher?.status ? 'Revoke' : 'Grant' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Modal } from 'bootstrap'
import type { Teacher } from '@/models/Teacher'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'
import { formatContactNumberForAPI } from '@/utils/validationConstants'

// Extend the Teacher interface to include the new properties
interface ExtendedTeacher extends Teacher {
  teachingAssignments?: TeachingAssignment[]
}

// Remove the unused UserResponse interface completely
// interface UserResponse {
//   id: number
//   name: string
//   email_id: string
//   contact_number: string
//   alternate_contact_number?: string
//   highest_qualification: string
//   status: boolean
//   created_at: string
//   updated_at: string
// }

// Define a type for the API response data
interface TeacherApiResponse {
  id: number
  name: string
  email_id: string
  contact_number: string
  alternate_contact_number?: string
  highest_qualification: string
  status: boolean
  created_at: string
  updated_at: string
  schools?: string[] // Array of school names
}

// Define a type for the pagination metadata
interface PaginationMeta {
  total?: number;
  total_pages?: number;
  page_size?: number;
}

// Define a type for the overall API response from /users endpoint
interface UsersListApiResponse {
  data?: TeacherApiResponse[];
  meta?: PaginationMeta;
}

// Add interface for teaching assignment
interface TeachingAssignment {
  id: number
  standard: {
    id: number
    name: string
    sequence_number: number
  }
  subject: {
    id: number
    name: string
  }
  medium?: {
    id: number
    name: string
  }
}

const route = useRoute()
const teachers = ref<Teacher[]>([])
const loading = ref(true)
const teacherSearch = ref('')
const schoolSearch = ref('')
const teacherSearchInputRef = ref<HTMLInputElement | null>(null)
const schoolSearchInputRef = ref<HTMLInputElement | null>(null)
const selectedTeacher = ref<ExtendedTeacher | null>(null)
const showFilter = ref(false)
const selectedStatus = ref('All')
const toastStore = useToastStore()
const confirmationText = ref('')
const isSearchingTeacher = ref(false)
const isSearchingSchool = ref(false)
const teacherSearchTimeout = ref<number | null>(null)
const schoolSearchTimeout = ref<number | null>(null)
const teacherRoleId = ref<number | null>(null)

// Pagination state
const currentPage = ref(1)
const pageSize = 15 // Fixed page size
const totalItems = ref(0)
const totalPages = ref(0)
const sortOption = ref('name_asc')

// Computed properties for sorting
const sortBy = computed(() => {
  const parts = sortOption.value.split('_')
  if (parts.length >= 2) {
    // For options like created_at_asc, we need to return "created_at"
    if (parts[0] === 'created' || parts[0] === 'updated') {
      return `${parts[0]}_${parts[1]}`
    }
    // For options like name_asc, we return "name"
    return parts[0]
  }
  return 'name' // Default fallback
})

const sortOrder = computed(() => {
  const parts = sortOption.value.split('_')
  if (parts.length >= 2) {
    // For options like created_at_asc, we need to return "asc"
    if (parts[0] === 'created' || parts[0] === 'updated') {
      return parts[2]
    }
    // For options like name_asc, we return "asc"
    return parts[1]
  }
  return 'asc' // Default fallback
})

// Computed property to determine which page numbers to show
const visiblePageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are few pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate start and end of visible pages
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if we're near the beginning
    if (currentPage.value <= 3) {
      endPage = Math.min(totalPages.value - 1, 4)
    }

    // Adjust if we're near the end
    if (currentPage.value >= totalPages.value - 2) {
      startPage = Math.max(2, totalPages.value - 3)
    }

    // Add ellipsis if needed before visible pages
    if (startPage > 2) {
      pages.push('...')
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed after visible pages
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
})

// Function to fetch teacher role ID
const fetchTeacherRoleId = async () => {
  try {
    const response = await axiosInstance.get('/roles')
    const teacherRole = response.data.find((role: { role_name: string }) => role.role_name === 'TEACHER')
    if (teacherRole) {
      teacherRoleId.value = teacherRole.id
    } else {
      console.error('Teacher role not found')
      toastStore.showToast({
        title: 'Error',
        message: 'Failed to find teacher role. Please try again.',
        type: 'error',
      })
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to fetch roles. Please try again.',
      type: 'error',
    })
  }
}

// Initialize from route query if present
onMounted(async () => {
  // First fetch the teacher role ID
  await fetchTeacherRoleId()

  const schoolName = route.query.school as string
  if (schoolName) {
    schoolSearch.value = schoolName
  }

  // Initialize sort parameters from query params if present
  if (route.query.sort_by && route.query.sort_order) {
    const sortByParam = route.query.sort_by as string
    const sortOrderParam = route.query.sort_order as string
    sortOption.value = `${sortByParam}_${sortOrderParam}`
  }

  // Initialize page from query params if present
  if (route.query.page) {
    const page = Number.parseInt(route.query.page as string)
    if (!Number.isNaN(page) && page > 0) {
      currentPage.value = page
    }
  }

  await fetchTeachers()
})

// Helper functions for fetchTeachers
const buildApiParams = () => {
  const params: Record<string, string | number> = {
    page: currentPage.value,
    page_size: pageSize,
    sort_by: sortBy.value,
    sort_order: sortOrder.value,
    roleId: teacherRoleId.value
  }

  if (teacherSearch.value) {
    params.search = teacherSearch.value
  }

  if (schoolSearch.value) {
    params.schoolSearch = schoolSearch.value
  }

  if (selectedStatus.value !== 'All') {
    params.status = selectedStatus.value === 'Grant' ? 'true' : 'false'
  }

  return params
}

const resetTeachersList = () => {
  teachers.value = []
  totalItems.value = 0
  totalPages.value = 0
}

const processResponseData = (responseData: UsersListApiResponse) => {
  if (!responseData?.data || !Array.isArray(responseData.data)) {
    console.error('Unexpected response format:', responseData)
    resetTeachersList()
    return
  }

  // Map the API response to our teacher interface
  teachers.value = responseData.data.map((user: TeacherApiResponse) => ({
    id: user.id,
    name: user.name,
    emailId: user.email_id ?? '',
    contactNumber: user.contact_number ?? '',
    alternateContactNumber: user.alternate_contact_number ?? '',
    highestQualification: user.highest_qualification ?? '',
    status: user.status,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    school: user.schools && user.schools.length > 0
      ? { id: 0, name: user.schools[0] }
      : { id: 0, name: '' },
    teacherSubjects: [],
  }))

  updatePaginationInfo(responseData)
}

const updatePaginationInfo = (responseData: UsersListApiResponse) => {
  if (responseData.meta) {
    totalItems.value = responseData.meta.total ?? 0
    totalPages.value = responseData.meta.total_pages ?? 1

    console.log('Pagination data from meta:', {
      totalItems: totalItems.value,
      totalPages: totalPages.value,
      currentPage: currentPage.value,
      pageSize: responseData.meta.page_size,
      teachersLength: teachers.value.length
    })
  } else {
    // Fallback if meta is missing
    totalItems.value = teachers.value.length
    totalPages.value = Math.ceil(totalItems.value / pageSize)
  }

  console.log('Final teachers data:', teachers.value)
}

const fetchTeachers = async () => {
  try {
    if (!teacherRoleId.value) {
      console.error('Teacher role ID not available')
      return
    }

    if (!isSearchingTeacher.value && !isSearchingSchool.value) {
      loading.value = true
    }
    
    console.log('Starting teacher data fetch process...')
    const params = buildApiParams()
    
    console.log('Fetching teachers with params:', params)
    const response = await axiosInstance.get('/users', { params })
    console.log('API Response:', response.data)

    if (response.data && typeof response.data === 'object') {
      processResponseData(response.data)
    } else {
      resetTeachersList()
    }
  } catch (error) {
    console.error('Error in fetchTeachers:', error)
    resetTeachersList()
  } finally {
    loading.value = false
    isSearchingTeacher.value = false
    isSearchingSchool.value = false
  }
}

// Function to change page
function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchTeachers()
}

// Function to handle sort change
function handleSortChange() {
  currentPage.value = 1 // Reset to first page when changing sort
  fetchTeachers()
}

// Update clearSearch function to reset pagination and maintain focus
function clearSearch(type: 'teacher' | 'school') {
  if (type === 'teacher') {
    teacherSearch.value = '';
    isSearchingTeacher.value = true;
    // Maintain focus on the teacher search input after clearing
    if (teacherSearchInputRef.value) {
      teacherSearchInputRef.value.focus();
    }
  } else {
    schoolSearch.value = '';
    isSearchingSchool.value = true;
    // Maintain focus on the school search input after clearing
    if (schoolSearchInputRef.value) {
      schoolSearchInputRef.value.focus();
    }
  }

  // Reset to first page when filters change
  currentPage.value = 1;

  // Fetch teachers with updated filters
  fetchTeachers();
}

// Update the filteredTeachers computed property to use the API-filtered data
const filteredTeachers = computed(() => {
  // Since we're using server-side filtering, we just return the teachers array
  // The filtering is handled by the API based on the query parameters
  return teachers.value
})

// Create a computed property that adds highlighting to the filtered teachers
const filteredAndHighlightedTeachers = computed(() => {
  return teachers.value.map((teacher) => ({
    ...teacher,
    highlightedName: highlightText(teacher.name, teacherSearch.value),
    highlightedSchoolName: highlightText(teacher.school.name, schoolSearch.value)
  }))
})

// Toggle filter visibility
function toggleFilter() {
  showFilter.value = !showFilter.value
}

// Filter by status
function filterByStatus(status: string) {
  selectedStatus.value = status
  showFilter.value = false

  // Reset to first page when changing filter
  currentPage.value = 1

  // Fetch teachers with the new status filter
  fetchTeachers()
}

// View modal functions
async function openViewModal(teacher: Teacher) {
  try {
    loading.value = true
    console.log('Fetching detailed information for teacher:', teacher.id)

    // Set initial teacher data first so modal can open
    selectedTeacher.value = {
      ...teacher,
      teacherSubjects: [],
    } as ExtendedTeacher

    // Show the modal first
    const modal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
    modal.show()

    // Fetch comprehensive teacher data using the new API endpoint
    const { data: teacherData } = await axiosInstance.get(`/users/${teacher.id}`)
    console.log('Fetched teacher data:', teacherData)

    // Update the teacher data with fetched information
    const updatedTeacher: ExtendedTeacher = {
      id: teacherData.id,
      name: teacherData.name,
      emailId: teacherData.email_id,
      contactNumber: teacherData.contact_number,
      alternateContactNumber: teacherData.alternate_contact_number ?? '',
      highestQualification: teacherData.highest_qualification,
      status: teacherData.status,
      createdAt: teacherData.created_at,
      updatedAt: teacherData.updated_at,
      school: teacherData.schools && teacherData.schools.length > 0
        ? {
            id: teacherData.schools[0].id || 0,
            name: teacherData.schools[0].name ?? ''
          }
        : { id: 0, name: '' },
      // Map teaching assignments to teacherSubjects format for compatibility
      teacherSubjects: teacherData.teaching_assignments ? teacherData.teaching_assignments.map((assignment: TeachingAssignment) => ({
        id: assignment.id,
        schoolStandardId: assignment.standard.id,
        mediumStandardSubjectId: assignment.id,
        mediumStandardSubject: {
          id: assignment.id,
          instructionMedium: {
            id: assignment.medium?.id ?? 0,
            instruction_medium: assignment.medium?.name ?? 'Default'
          },
          standard: {
            id: assignment.standard.id,
            name: assignment.standard.name,
            sequence_number: assignment.standard.sequence_number
          },
          subject: {
            id: assignment.subject.id,
            name: assignment.subject.name
          }
        }
      })) : [],
    }

    selectedTeacher.value = updatedTeacher
  } catch (error) {
    console.error('Error in openViewModal:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load teacher details. Please try again.',
      type: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Toggle teacher status
function toggleTeacherStatus() {
  if (!selectedTeacher.value) return

  // Close the view modal first
  const viewModal = Modal.getInstance(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal?.hide()

  // Show the confirmation modal
  const confirmModal = new Modal(document.getElementById('accessConfirmationModal') as HTMLElement)
  confirmModal.show()
}

// Update teacher status
async function updateTeacherStatus() {
  if (!selectedTeacher.value) return

  try {
    const newStatus = !selectedTeacher.value.status
    const alternateContactFormatted = selectedTeacher.value.alternateContactNumber 
      ? formatContactNumberForAPI(String(selectedTeacher.value.alternateContactNumber))
      : null

    await axiosInstance.put(`/users/${selectedTeacher.value.id}`, {
      status: newStatus,
      name: selectedTeacher.value.name,
      email_id: selectedTeacher.value.emailId,
      contact_number: formatContactNumberForAPI(selectedTeacher.value.contactNumber),
      alternate_contact_number: alternateContactFormatted,
      highest_qualification: selectedTeacher.value.highestQualification,
    })

    selectedTeacher.value.status = newStatus
    await fetchTeachers()

    // Hide confirmation modal
    const confirmModal = Modal.getInstance(
      document.getElementById('accessConfirmationModal') as HTMLElement,
    )
    confirmModal?.hide()

    // Reopen the view modal
    const viewModal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
    viewModal.show()
  } catch (error) {
    console.error('Error updating teacher status:', error)
  }
}

// Add function to handle cancel button in confirmation modal
function handleAccessCancel() {
  // Hide confirmation modal
  const confirmModal = Modal.getInstance(
    document.getElementById('accessConfirmationModal') as HTMLElement,
  )
  confirmModal?.hide()

  // Reopen the view modal
  const viewModal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal.show()
}

// Show delete confirmation
function showDeleteConfirmation() {
  // Close the view modal first
  const viewModal = Modal.getInstance(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal?.hide()

  // Show the delete confirmation modal
  const deleteModal = new Modal(document.getElementById('deleteConfirmationModal') as HTMLElement)
  deleteModal.show()
}

// Delete teacher
async function deleteTeacher() {
  if (!selectedTeacher.value) return

  try {
    // Check for confirmation text
    if (confirmationText.value !== 'sure') {
      return
    }

    await axiosInstance.delete(`/users/${selectedTeacher.value.id}`)

    await fetchTeachers()

    // Close the delete confirmation modal
    const deleteModal = Modal.getInstance(
      document.getElementById('deleteConfirmationModal') as HTMLElement,
    )
    deleteModal?.hide()

    // Show success toast
    toastStore.showToast({
      title: 'Success',
      message: `Teacher "${selectedTeacher.value.name}" has been deleted successfully.`,
      type: 'success',
    })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    // Show error toast
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to delete teacher. Please try again.',
      type: 'error',
    })
  }
}

// Add function to handle cancel button in delete confirmation modal
function handleDeleteCancel() {
  // Reset confirmation text
  confirmationText.value = ''

  // Hide delete confirmation modal
  const deleteModal = Modal.getInstance(
    document.getElementById('deleteConfirmationModal') as HTMLElement,
  )
  deleteModal?.hide()

  // Reopen the view modal
  const viewModal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal.show()
}

// Computed properties for confirmation modal
const confirmationModalStyle = computed(() => {
  return {
    'bg-danger': selectedTeacher.value?.status,
    'bg-success': !selectedTeacher.value?.status,
  }
})

const confirmationModalTitle = computed(() => {
  return selectedTeacher.value?.status ? 'Revoke Teacher Access' : 'Grant Teacher Access'
})

const confirmationModalMessage = computed(() => {
  return selectedTeacher.value?.status
    ? "Are you sure you want to revoke this teacher's access?"
    : 'Are you sure you want to grant access to this teacher?'
})

// Handle teacher search input with debounce
const handleTeacherSearchInput = () => {
  // Immediately set searching state for visual feedback
  isSearchingTeacher.value = true;

  // Clear any existing timeout
  if (teacherSearchTimeout.value) {
    clearTimeout(teacherSearchTimeout.value);
  }

  // Set a new timeout
  teacherSearchTimeout.value = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when search changes
    fetchTeachers();
  }, 500) as unknown as number; // Increased debounce time for better UX
}

// Handle school search input with debounce
const handleSchoolSearchInput = () => {
  // Immediately set searching state for visual feedback
  isSearchingSchool.value = true;

  // Clear any existing timeout
  if (schoolSearchTimeout.value) {
    clearTimeout(schoolSearchTimeout.value);
  }

  // Set a new timeout
  schoolSearchTimeout.value = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when search changes
    fetchTeachers();
  }, 500) as unknown as number; // Increased debounce time for better UX
}

// Add this new function to handle modal cleanup
function closeViewModal() {
  const modal = Modal.getInstance(document.getElementById('viewTeacherModal') as HTMLElement)
  modal?.hide()
  // Remove backdrop manually
  const backdrop = document.querySelector('.modal-backdrop')
  backdrop?.remove()
  // Remove modal-open class from body
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('padding-right')
}

// Add watchers to maintain focus after data updates
watch([isSearchingTeacher], (newVal) => {
  // If we were searching teachers and now we're done, restore focus to teacher search input
  if (!newVal && teacherSearchInputRef.value) {
    teacherSearchInputRef.value.focus();
  }
});

watch([isSearchingSchool], (newVal) => {
  // If we were searching schools and now we're done, restore focus to school search input
  if (!newVal && schoolSearchInputRef.value) {
    schoolSearchInputRef.value.focus();
  }
});

// Update the groupedTeacherSubjects computed property to sort by standard sequence number
const groupedTeacherSubjects = computed(() => {
  if (!selectedTeacher.value?.teacherSubjects) return {}

  interface TeacherSubjectGroup {
    id: number
    schoolStandardId: number
    mediumStandardSubjectId: number
    mediumStandardSubject: {
      id: number
      instructionMedium: {
        id: number
        instruction_medium: string
      }
      standard: {
        id: number
        name: string
        sequence_number?: number
      }
      subject: {
        id: number
        name: string
      }
    }
  }

  // First group by standard name
  const groupedByStandard = selectedTeacher.value.teacherSubjects.reduce(
    (groups: { [key: string]: TeacherSubjectGroup[] }, subject) => {
      const standardName = subject.mediumStandardSubject.standard.name
      if (!groups[standardName]) {
        groups[standardName] = []
      }
      groups[standardName].push(subject)
      return groups
    },
    {},
  )

  // Sort subjects alphabetically within each standard
  for (const standardName of Object.keys(groupedByStandard)) {
    groupedByStandard[standardName].sort((a, b) =>
      a.mediumStandardSubject.subject.name.localeCompare(b.mediumStandardSubject.subject.name)
    )
  }

  return groupedByStandard
})

// Function to highlight search text
function highlightText(text: string, search: string): string {
  if (!search) return text
  const regex = new RegExp(`(${search})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}
</script>

<style scoped>
/* Mobile styles */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  #addButton {
    width: 100% !important;
  }

  .btn-custom {
    background-color: #dc3545 !important;
    color: white !important;
  }
}

/* Desktop styles */
@media (min-width: 577px) {
  .dynamic-style {
    position: static;
  }

  .btn-custom {
    border: 1px solid gray !important;
    background-color: #f8f9fa;
    color: black;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  .btn-custom:hover {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545 !important;
    color: white !important;
  }
}

/* Teacher modal styles */
.form-control-plaintext {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}

.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}

.fw-medium {
  font-weight: 500;
}

.list-group-item {
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

#navTeacher {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navTeacher {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.clear-icon {
  cursor: pointer;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Toggle Button Styling */
.btn-toggle {
  display: grid !important;
  align-items: center;
  justify-content: center;
  width: 100px;
  border-radius: 30px;
  background-color: #f5f5f5;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid gray !important;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.btn-toggle .status-indicator {
  position: absolute;
  align-self: center;
  left: 10px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #28a745;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-toggle[data-status='revoke'] {
  background-color: #ffe6e6;
  color: #b22222;
}

.btn-toggle[data-status='revoke'] .status-indicator {
  background-color: #dc3545;
}

.btn-toggle .status-text {
  margin-left: 20px;
  transition: color 0.3s ease;
}

/* Status Indicator Styling */
.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-text {
  font-weight: 500;
}

/* Remove the old toggle button styles */

.btn-group .btn {
  color: #fff;
  background-color: #343a40;
  border-color: #6c757d;
}

.btn-group .btn:hover {
  background-color: #fff;
  color: #343a40;
}

.btn-group .btn.btn-light {
  background-color: #fff;
  color: #343a40;
  border-color: #fff;
}

.btn-group .btn.btn-light:hover {
  background-color: #e9ecef;
}

/* Pagination styling */
.pagination .page-item.active .page-link {
  background-color: #212529 !important;
  border-color: #212529 !important;
  color: white !important;
}

.pagination .page-link {
  color: #212529;
}

.pagination .page-link:focus {
  box-shadow: none;
  outline: none;
}

/* Modern search styling */
.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-input {
  padding-left: 40px;
  padding-right: 40px;
  height: 48px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
  z-index: 100; /* Higher z-index to ensure it stays on top */
}

.clear-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 10;
}

.clear-search-icon:hover {
  color: #212529;
}

/* Sort dropdown styling */
.sort-wrapper {
  position: relative;
}

.sort-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 6px;
  appearance: none;
  background-image: none;
  transition: all 0.3s ease;
}

.sort-select:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
}

.sort-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

/* Search loading overlay */
.search-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  backdrop-filter: blur(2px);
}

.table-searching {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* Improved spinner animation */
@keyframes spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

.search-loading-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  animation: spin 1s linear infinite;
}

/* Ensure search icons stay visible */
.search-icon, .clear-search-icon, .search-loading-icon {
  z-index: 101; /* Higher than the input focus z-index */
}

/* Subject badge styling */
.subject-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin: 0.25rem;
  border-radius: 2rem;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.subject-badge:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.subject-badge i {
  margin-right: 0.5rem;
  color: #6c757d;
}

/* Highlight style for search results */
:deep(.highlight) {
  background-color: #fff3cd;
  padding: 2px;
  border-radius: 2px;
  font-weight: bold;
}
</style>
