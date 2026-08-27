<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">SCHOOL MANAGEMENT</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <button class="btn btn-success stick-bottom" id="addButton" @click="navigateToAddSchool">
            Add School
          </button>
        </div>
      </div>
      <hr />
    </div>

    <!-- Search Section -->
    <div class="row p-2 justify-content-center mb-2">
      <div class="col-12 col-sm-10 col-md-10">
        <div class="row g-2">
          <!-- School Search (Full Width) -->
          <div class="col-12">
            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="form-control search-input"
                id="schoolFilter"
                placeholder="Search for School"
                v-model="schoolSearch"
                autocomplete="off"
                @input="handleSchoolSearchInput"
                ref="schoolSearchInputRef"
              />
              <i v-if="isSearchingSchool" class="bi bi-arrow-repeat search-loading-icon"></i>
              <i v-else-if="schoolSearch" class="bi bi-x-circle clear-search-icon" @click="clearInput('school')"></i>
            </div>
          </div>

          <!-- Second Row with Board Search and Sort Dropdown -->
          <div class="col-12 col-md-6">
            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input
                type="text"
                class="form-control search-input"
                id="boardFilter"
                placeholder="Search for Board"
                v-model="boardSearch"
                autocomplete="off"
                @input="handleBoardSearchInput"
                ref="boardSearchInputRef"
              />
              <i v-if="isSearchingBoard" class="bi bi-arrow-repeat search-loading-icon"></i>
              <i v-else-if="boardSearch" class="bi bi-x-circle clear-search-icon" @click="clearInput('board')"></i>
            </div>
          </div>

          <!-- Sort Dropdown (Half Width) -->
          <div class="col-12 col-md-6">
            <div class="sort-wrapper">
              <select class="form-select sort-select" id="sortSelect" v-model="sortOption" @change="handleSortChange">
                <option value="name_asc">Sort by School Name (A-Z)</option>
                <option value="name_desc">Sort by School Name (Z-A)</option>
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

    <!-- Loading State -->
    <div v-if="isLoading && !isSearchingSchool && !isSearchingBoard" class="text-center my-5">
      <output
        class="spinner-border text-primary"
      >
        <span class="visually-hidden">Loading...</span>
      </output>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger my-3" role="alert">
      {{ error }}
    </div>

    <!-- Content when data is loaded -->
    <template v-else>
      <!-- Table Section -->
      <div id="table-container" class="row mt-4 p-2 justify-content-center">
        <div class="col col-12 col-sm-10 col-md-10">
          <div class="table-responsive position-relative">
            <!-- Loading overlay for search -->
            <div v-if="isSearchingSchool || isSearchingBoard" class="search-loading-overlay">
              <output
                class="spinner-border spinner-border-sm text-primary"
              >
                <span class="visually-hidden">Searching...</span>
              </output>
            </div>

            <table class="table table-sm table-hover table-striped table-bordered" :class="{ 'table-searching': isSearchingSchool || isSearchingBoard }">
              <caption>List of schools with their associated boards. Each school can be managed using the actions in the last column.</caption>
              <colgroup>
                <col style="width: 10px" />
                <col style="width: 35%" />
                <col style="width: 65%" />
                <col style="width: 20px" />
              </colgroup>
              <thead class="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">School</th>
                  <th scope="col">Board</th>
                  <th scope="col">Manage</th>
                </tr>
              </thead>
              <tbody class="table-group-divider" id="schoolTable">
                <tr
                  v-for="(school, index) in filteredAndHighlightedSchools"
                  :key="school.id"
                  :data-board="school.board_name"
                >
                  <th scope="row">{{ (currentPage - 1) * pageSize + index + 1 }}</th>
                  <td v-html="school.highlightedName"></td>
                  <td v-html="school.highlightedBoardName"></td>
                  <td class="text-center">
                    <i
                      class="bi bi-three-dots"
                      @click="openViewModal(school)"
                      style="cursor: pointer"
                    ></i>
                  </td>
                </tr>
                <tr v-if="filteredAndHighlightedSchools.length === 0">
                  <td colspan="4" class="text-center">No matching results found.</td>
                </tr>
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
              Showing {{ schools.length ? (currentPage - 1) * pageSize + 1 : 0 }} to
              {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} entries
            </div>

            <!-- Pagination Buttons -->
            <nav aria-label="School pagination">
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
    </template>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      aria-labelledby="deleteConfirmationModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Delete School</h5>
            <button
              type="button"
              class="btn-close"
              @click="handleCancelDelete"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="associatedTeachers.length > 0">
              <div class="alert alert-warning">
                <p class="mb-2">This school has the following associated teachers:</p>
                <ul class="list-unstyled ms-3">
                  <li v-for="teacher in associatedTeachers" :key="teacher.id">
                    - {{ teacher.name }}
                  </li>
                </ul>
              </div>
              <p class="mb-3">
                Deleting this school will also delete all associated teachers and other connected
                data.
              </p>
            </div>
            <p class="mb-3">
              Are you sure you want to delete this school? This action cannot be undone.
              <span v-if="associatedTeachers.length > 0" class="text-danger">
                All associated teachers and data will also be deleted!
              </span>
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
            <button type="button" class="btn btn-outline-dark" @click="handleCancelDelete">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteSchool"
              :disabled="confirmationText !== 'sure'"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View School Modal -->
    <div
      class="modal fade"
      id="viewSchoolModal"
      tabindex="-1"
      aria-labelledby="viewSchoolModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewSchoolModalLabel">School Information</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="container">
              <div id="form-container" class="row mt-4">
                <div class="col-12 p-3">
                  <form v-if="selectedSchool">
                    <div class="row g-3">
                      <div class="row">
                        <label for="schoolName" class="col-form-label col-12 col-lg-3 fw-bold"
                          >School Name:</label
                        >
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            readonly
                            class="form-control-plaintext"
                            id="schoolName"
                            :value="selectedSchool.name"
                          />
                        </div>
                      </div>

                      <div class="row">
                        <label for="boardName" class="col-form-label col-12 col-lg-3 fw-bold"
                          >Board:</label
                        >
                        <div class="col-12 col-lg-9">
                          <textarea
                            readonly
                            class="form-control-plaintext"
                            id="boardName"
                            style="white-space: pre-wrap"
                            v-model="selectedSchool.board.name"
                          ></textarea>
                        </div>
                      </div>

                      <!-- School Address -->
                      <fieldset class="border p-2 rounded col col-12">
                        <legend class="float-none w-auto fs-5">School Address</legend>
                        <div class="row">
                          <label for="address" class="col-form-label col-12 col-lg-3 fw-bold"
                            >Address:</label
                          >
                          <div class="col-12 col-lg-9">
                            <textarea
                              readonly
                              class="form-control-plaintext"
                              id="address"
                              style="white-space: pre-wrap"
                              :value="selectedSchool?.address.street"
                            ></textarea>
                          </div>
                        </div>

                        <div class="row">
                          <label for="postalCode" class="col-form-label col-12 col-lg-3 fw-bold"
                            >Postal Code:</label
                          >
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="postalCode"
                              :value="selectedSchool?.address.postal_code"
                            />
                          </div>
                        </div>

                        <div class="row">
                          <div class="col-12 col-lg-3">
                            <label for="country" class="col-form-label col-6 col-lg-6 fw-bold"
                              >Country:</label
                            >
                            <div class="col-12">
                              <input
                                type="text"
                                readonly
                                class="form-control-plaintext"
                                id="country"
                                :value="selectedSchool?.address.country?.name"
                              />
                            </div>
                          </div>

                          <div class="col-12 col-lg-3">
                            <label for="state" class="col-form-label col-6 col-lg-6 fw-bold"
                              >State:</label
                            >
                            <div class="col-12">
                              <input
                                type="text"
                                readonly
                                class="form-control-plaintext"
                                id="state"
                                :value="selectedSchool?.address.state?.name"
                              />
                            </div>
                          </div>

                          <div class="col-12 col-lg-3">
                            <label for="city" class="col-form-label col-6 col-lg-6 fw-bold"
                              >City/Town:</label
                            >
                            <div class="col-12">
                              <input
                                type="text"
                                readonly
                                class="form-control-plaintext"
                                id="city"
                                :value="selectedSchool?.address.city?.name"
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>

                      <!-- Principal's Information -->
                      <fieldset class="border p-2 rounded col col-12">
                        <legend class="float-none w-auto fs-5">Principal's Information</legend>
                        <div class="row">
                          <label for="principalName" class="col-form-label col-12 col-lg-3 fw-bold"
                            >Principal:</label
                          >
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="principalName"
                              :value="selectedSchool.principal_name"
                            />
                          </div>
                        </div>

                        <div class="row">
                          <div class="col-12 col-lg-6">
                            <div class="row">
                              <label
                                for="contactNumber"
                                class="col-12 col-lg-6 col-form-label fw-bold"
                                >Contact Number:</label
                              >
                              <div class="col-12 col-lg-6">
                                <input
                                  type="text"
                                  readonly
                                  class="form-control-plaintext"
                                  id="contactNumber"
                                  :value="selectedSchool.contact_number"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6">
                            <div class="row">
                              <label
                                for="alternateContactNumber"
                                class="col-12 col-lg-6 col-form-label fw-bold"
                                >Alternate Number:</label
                              >
                              <div class="col-12 col-lg-6">
                                <input
                                  type="text"
                                  readonly
                                  class="form-control-plaintext"
                                  id="alternateContactNumber"
                                  :value="selectedSchool.alternate_contact_number"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <label for="emailId" class="col-12 col-lg-3 col-form-label fw-bold"
                            >Email Id:</label
                          >
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="emailId"
                              :value="selectedSchool.email"
                            />
                          </div>
                        </div>
                      </fieldset>

                      <!-- Mediums and Standards -->
                      <div class="col col-12 text-center">
                        <div class="row justify-content-between">
                          <div class="col-12 col-lg-6 pe-sm-3">
                            <div class="row">
                              <label for="medium" class="col-form-label fw-bold"
                                >Mediums of Instruction:</label
                              >
                              <ul class="list-group p-1" id="medium">
                                <li
                                  v-for="medium in selectedSchool.mediums"
                                  :key="medium.id"
                                  class="list-group-item"
                                >
                                  {{ medium.name }}
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 ps-sm-3">
                            <div class="row">
                              <label for="standard" class="col-form-label fw-bold"
                                >Standards Offered:</label
                              >
                              <ul class="list-group p-1" id="standard">
                                <li
                                  v-for="standard in selectedSchool.standards"
                                  :key="standard.id"
                                  class="list-group-item"
                                >
                                  {{ standard.name }}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-dark"
              id="viewTeachers"
              @click="navigateToTeachers(selectedSchool?.name)"
            >
              <i class="bi bi-arrow-return-right"></i> Teachers
            </button>
            <button
              type="button"
              class="btn btn-dark"
              id="editSchoolButton"
              @click="navigateToEdit(selectedSchool?.id)"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn btn-custom"
              id="deleteSchoolButton"
              @click="showDeleteConfirmation"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'

// Types
interface Teacher {
  id: number
  name: string
  email_id: string
  contact_number: string
  alternate_contact_number?: string
  highest_qualification: string
  status: boolean
}

interface Board {
  id: number
  name: string
  abbreviation: string
  address_id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
}

// Basic school interface from API
interface SchoolListItem {
  id: number
  name: string
  board_name: string
  board_abbreviation: string
}

// Extended school interface for detailed view
interface SchoolDetail {
  id: number
  name: string
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number?: string
  board: {
    id: number
    name: string
    abbreviation: string
    address_id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  }
  address: {
      id: number
    city_id: number
    postal_code: string
    street: string
    created_by: number
    created_at: string
    updated_by: number
    updated_at: string
    city: { id: number; state_id: number; name: string }
    state: { id: number; country_id: number; name: string }
    country: { id: number; name: string }
  }
  mediums: Array<{ id: number; name: string }>
  standards: Array<{ id: number; name: string }>
}

// Update PaginatedResponse interface
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    sort_by?: string
    sort_order?: string
  }
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const schools = ref<SchoolListItem[]>([])
const boards = ref<Board[]>([])
const selectedSchool = ref<SchoolDetail | null>(null)
const schoolSearch = ref('')
const boardSearch = ref('')
const schoolSearchInputRef = ref<HTMLInputElement | null>(null)
const boardSearchInputRef = ref<HTMLInputElement | null>(null)
const associatedTeachers = ref<Teacher[]>([])
const confirmationText = ref('')

// Pagination variables
const currentPage = ref(1)
const pageSize = 15
const totalItems = ref(0)
const totalPages = ref(0)
const isLoading = ref(false)
const isSearchingSchool = ref(false)
const isSearchingBoard = ref(false)
const error = ref<string | null>(null)
const sortOption = ref('name_asc')
const schoolSearchTimeout = ref<number | null>(null)
const boardSearchTimeout = ref<number | null>(null)

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

// Initialize from route query if present
onMounted(() => {
  const boardName = route.query.board as string
  if (boardName) {
    boardSearch.value = boardName
  }

  // Initialize sort parameters from query params if present
  if (route.query.sort_by && route.query.sort_order) {
    const sortByParam = route.query.sort_by as string
    const sortOrderParam = route.query.sort_order as string
    sortOption.value = `${sortByParam}_${sortOrderParam}`
  }

  // Initialize page from query params if present
  if (route.query.page) {
    const page = Number.parseInt(route.query.page as string, 10)
    if (!Number.isNaN(page) && page > 0) {
      currentPage.value = page
    }
  }

  fetchSchools()
  fetchBoards()
})

const filteredAndHighlightedSchools = computed(() => {
  return schools.value.map((school) => ({
      ...school,
    highlightedName: highlightText(school.name, schoolSearch.value),
    highlightedBoardName: highlightText(school.board_name, boardSearch.value)
  }))
})

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
    fetchSchools();
  }, 500) as unknown as number; // Increased debounce time for better UX
}

// Handle board search input with debounce
const handleBoardSearchInput = () => {
  // Immediately set searching state for visual feedback
  isSearchingBoard.value = true;

  // Clear any existing timeout
  if (boardSearchTimeout.value) {
    clearTimeout(boardSearchTimeout.value);
  }

  // Set a new timeout
  boardSearchTimeout.value = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when search changes
    fetchSchools();
  }, 500) as unknown as number; // Increased debounce time for better UX
}

function highlightText(text: string, search: string): string {
  if (!search) return text
  const regex = new RegExp(`(${search})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

async function fetchSchools() {
  try {
    if (!schoolSearch.value && !boardSearch.value) {
      isLoading.value = true
    }
    error.value = null
    console.log('Starting fetchSchools...')

    // Add pagination and sorting parameters to the API request
    const response = await axiosInstance.get<PaginatedResponse<SchoolListItem>>('/schools', {
      params: {
        page: currentPage.value,
        page_size: pageSize,
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
        search: schoolSearch.value || undefined,
        boardSearch: boardSearch.value || undefined
      }
    })

    console.log('Schools API Response:', response.data)

    // Check if response has data property
    if (response.data?.data) {
      schools.value = response.data.data

      // Update pagination info
      // Since the new API doesn't provide total count, we'll use the current page size
      // and adjust when we get less than pageSize items
      totalItems.value = currentPage.value * pageSize
      if (response.data.data.length < pageSize) {
        totalItems.value = (currentPage.value - 1) * pageSize + response.data.data.length
      }
        totalPages.value = Math.ceil(totalItems.value / pageSize)

      console.log('Processed schools:', schools.value)
    } else {
      schools.value = []
      error.value = 'Failed to load schools. Please try again.'
    }
  } catch (err) {
    console.error('Error in fetchSchools:', err)
    if (err instanceof Error) {
      console.error('Error details:', err.message)
      console.error('Error stack:', err.stack)
    }
    schools.value = []
    error.value = 'Failed to load schools. Please try again.'
  } finally {
    isLoading.value = false
    isSearchingSchool.value = false
    isSearchingBoard.value = false
  }
}

async function fetchBoards() {
  try {
    const response = await axiosInstance.get('/boards')
    // Extract boards from the data wrapper
    boards.value = response.data.data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

// Computed property for visible page numbers
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

// Function to change page
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchSchools()
}

// Update clearInput function to reset pagination and maintain focus
function clearInput(type: 'school' | 'board') {
  if (type === 'school') {
    schoolSearch.value = '';
    isSearchingSchool.value = true;
    // Maintain focus on the school search input after clearing
    if (schoolSearchInputRef.value) {
      schoolSearchInputRef.value.focus();
    }
  } else {
    boardSearch.value = '';
    isSearchingBoard.value = true;
    // Maintain focus on the board search input after clearing
    if (boardSearchInputRef.value) {
      boardSearchInputRef.value.focus();
    }
  }

  // Reset to first page when filters change
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }

  // Fetch schools with updated filters
  fetchSchools();
}

function openViewModal(school: SchoolListItem) {
  console.log('Opening modal for school:', school)

  // Fetch the complete school details with the new API format
  axiosInstance.get(`/schools/${school.id}`)
    .then(response => {
      const schoolData = response.data;
      console.log('Fetched school details:', schoolData);

      // Map the API response to the expected format
      selectedSchool.value = {
        ...school,
        name: schoolData.name,
        principal_name: schoolData.principal_name,
        email: schoolData.email,
        contact_number: schoolData.contact_number,
        alternate_contact_number: schoolData.alternate_contact_number,
        board: {
          id: schoolData.board.id,
          name: schoolData.board.name,
          abbreviation: schoolData.board.abbreviation,
          address_id: 0, // Not needed for display
          created_by: 0, // Not needed for display
          created_at: '',
          updated_by: 0,
          updated_at: ''
        },
        address: {
          id: schoolData.address.id,
          city_id: schoolData.address.city.id,
          postal_code: schoolData.address.postal_code,
          street: schoolData.address.street,
          created_by: 0, // Not needed for display
          created_at: '',
          updated_by: 0,
          updated_at: '',
          city: schoolData.address.city,
          state: schoolData.address.city.state,
          country: schoolData.address.city.state.country
        },
        mediums: schoolData.instruction_mediums,
        standards: schoolData.standards
      };

      // Show the modal after data is loaded
      const modal = new Modal(document.getElementById('viewSchoolModal') as HTMLElement)
      modal.show()
    })
    .catch(error => {
      console.error('Error fetching school details:', error);
      toastStore.showToast({
        title: 'Error',
        message: 'Failed to load school details. Please try again.',
        type: 'error',
      });
    });
}

// Add this function to properly clean up modals
function cleanupModal(modalId: string) {
  const modal = Modal.getInstance(document.getElementById(modalId) as HTMLElement)
  modal?.hide()

  // Remove backdrop manually
  for (const backdrop of document.querySelectorAll('.modal-backdrop')) backdrop.remove();

  // Remove modal-open class and inline styles from body
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('padding-right')
}

const deleteSchool = async () => {
  if (!selectedSchool.value) return

  try {
    // Check for confirmation text
    if (confirmationText.value !== 'sure') {
      return
    }

    // Delete school
    await axiosInstance.delete(`/schools/${selectedSchool.value.id}`)

    // Refresh the schools list
    fetchSchools()

    // Close and clean up the delete confirmation modal
    cleanupModal('deleteConfirmationModal')

    // Reset confirmation text
    confirmationText.value = ''

    // Show success toast
    toastStore.showToast({
      title: 'Success',
      message: 'School deleted successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error deleting school:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to delete school. Please try again.',
      type: 'error',
    })
  }
}

function navigateToAddSchool() {
  router.push('/admin/school/add')
}

function navigateToEdit(schoolId?: number) {
  if (!schoolId) return

  // Close the view modal first
  const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
  viewModal?.hide()

  router.push({
    name: 'editSchool',
    params: { id: schoolId.toString() },
  })
}

async function showDeleteConfirmation() {
  if (!selectedSchool.value) return

  try {
    // Close the view modal first
    const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
    viewModal?.hide()

    // Fetch associated teachers
    const { data: teachers } = await axiosInstance.get(`/users?schoolId=${selectedSchool.value.id}`)
    associatedTeachers.value = teachers

    // Show the confirmation modal
    const modal = new Modal(document.getElementById('deleteConfirmationModal') as HTMLElement)
    modal.show()
  } catch (error) {
    console.error('Error fetching associated teachers:', error)
    alert('Failed to check associated teachers. Please try again.')
  }
}

const handleCancelDelete = () => {
  confirmationText.value = ''
  const modal = Modal.getInstance(document.getElementById('deleteConfirmationModal')!)
  modal?.hide()
}

function navigateToTeachers(schoolName?: string) {
  // Close the view modal first
  cleanupModals()

  // Navigate to teachers page with the school name as a query parameter
  router.push({
    name: 'TeacherDashboard',
    query: { school: schoolName },
  })
}

function cleanupModals() {
  const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
  viewModal?.hide()
}

function handleSortChange() {
  currentPage.value = 1 // Reset to first page when changing sort
  fetchSchools()
}

// Add watchers to maintain focus after data updates
watch([schools, isSearchingSchool], () => {
  // If we were searching schools and now we're done, restore focus to school search input
  if (!isSearchingSchool.value && schoolSearchInputRef.value &&
      document.activeElement !== schoolSearchInputRef.value &&
      document.activeElement !== boardSearchInputRef.value) {
    schoolSearchInputRef.value.focus();
  }
});

watch([schools, isSearchingBoard], () => {
  // If we were searching boards and now we're done, restore focus to board search input
  if (!isSearchingBoard.value && boardSearchInputRef.value &&
      document.activeElement !== boardSearchInputRef.value &&
      document.activeElement !== schoolSearchInputRef.value) {
    boardSearchInputRef.value.focus();
  }
});
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

  /* Add padding to the bottom of the container to prevent overlap with fixed button */
  .container.mt-4.mb-5 {
    padding-bottom: 80px !important;
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

@media (max-width: 768px) {
  #navSchool {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.clear-icon {
  cursor: pointer;
}

:deep(.highlight) {
  background-color: #fff3cd;
  padding: 2px;
  border-radius: 2px;
  font-weight: bold;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
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
  box-shadow: 0 0 0 0.25rem rgba(33, 37, 41, 0.25);
}

/* Modern search styling */
.search-wrapper {
  position: relative;
  z-index: 10;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 101;
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
  animation: spin 1s linear infinite; /* Ensure this animation is here */
}

/* Ensure search icons stay visible */
.search-icon, .clear-search-icon, .search-loading-icon {
  z-index: 101; /* Higher than the input focus z-index */
}
</style>
