<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-start m-0 fw-bolder text-uppercase">School Board Management</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <button
            class="btn btn-success"
            id="addButton"
            @click="router.push('/admin/board/add')"
          >
            Add Board
          </button>
        </div>
      </div>
      <hr />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !isSearching" class="text-center my-5">
      <output class="spinner-border text-primary d-block">
        <span class="visually-hidden">Loading...</span>
      </output>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger my-3" role="alert">
      {{ error }}
    </div>

    <!-- Content when data is loaded -->
    <template v-else>
      <!-- Search and Sort Section -->
      <div class="row p-2 justify-content-center mb-2">
        <div class="col-12 col-sm-10 col-md-10">
          <div class="row g-2">
            <div class="col-12 col-md-8">
              <div class="search-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  id="boardFilter"
                  placeholder="Search boards by name..."
                  v-model="searchQuery"
                  autocomplete="off"
                  @input="handleSearchInput"
                  ref="searchInputRef"
                />
                <i v-if="isSearching" class="bi bi-arrow-repeat search-loading-icon"></i>
                <i v-else-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="sort-wrapper">
                <select class="form-select sort-select" id="sortSelect" v-model="sortOption" @change="handleSortChange">
                  <option value="name_asc">Sort by Name (A-Z)</option>
                  <option value="name_desc">Sort by Name (Z-A)</option>
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

      <!-- Table Section with Loading Overlay -->
      <div id="table-container" class="row p-2 justify-content-center">
        <div class="col col-12 col-sm-10 col-md-10">
          <div class="table-responsive position-relative">
            <!-- Loading overlay for search -->
            <div v-if="isSearching" class="search-loading-overlay">
              <output class="spinner-border spinner-border-sm text-primary">
                <span class="visually-hidden">Searching...</span>
              </output>
            </div>

            <table class="table table-sm table-hover table-striped table-bordered" :class="{ 'table-searching': isSearching }">
              <caption class="visually-hidden">List of boards with their names and management options</caption>
              <colgroup>
                <col style="width: 10px" />
                <col style="width: 100%" />
                <col style="width: 20px" />
              </colgroup>
              <thead class="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Board</th>
                  <th scope="col">Manage</th>
                </tr>
              </thead>
              <tbody class="table-group-divider" id="boardTable">
                <tr v-for="(board, index) in filteredBoards" :key="board.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td v-html="getHighlightedText(board)"></td>
                  <td class="text-center">
                    <i
                      class="bi bi-three-dots"
                      @click="showBoardInfo(board)"
                      data-bs-toggle="modal"
                      data-bs-target="#boardInfoModal"
                    ></i>
                  </td>
                </tr>
                <tr v-if="filteredBoards.length === 0">
                  <td colspan="3" class="text-center">No matching results found.</td>
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
              Showing {{ boards.length ? (currentPage - 1) * pageSize + 1 : 0 }} to
              {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} entries
            </div>

            <!-- Pagination Buttons -->
            <nav aria-label="Board pagination">
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
              <h5 class="modal-title" id="deleteConfirmationModalLabel">Delete Board</h5>
              <button
                type="button"
                class="btn-close"
                @click="cleanupModals"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <template v-if="associatedSchools.length > 0">
                <div class="alert alert-warning">
                  <template v-if="associatedSchools.some((s) => s.id !== -1)">
                    <p class="mb-2">The following schools are associated with this board:</p>
                    <ul class="list-unstyled ms-3">
                      <li
                        v-for="school in associatedSchools.filter((s) => s.id !== -1)"
                        :key="school.id"
                      >
                        - {{ school.name }}
                      </li>
                    </ul>
                  </template>
                  <template v-if="associatedSchools.some((s) => s.id === -1)">
                    <p class="mb-0">{{ associatedSchools.find((s) => s.id === -1)?.name }}</p>
                  </template>
                </div>
              </template>
              <p class="mb-3">
                Are you sure you want to delete this board? This action cannot be undone.
                <span v-if="associatedSchools.length > 0" class="text-danger">
                  All associated schools and data will also be deleted!
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
              <button type="button" class="btn btn-outline-dark" @click="cleanupModals">Cancel</button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteBoard"
                :disabled="confirmationText !== 'sure'"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Board Info Modal -->
      <div
        class="modal fade"
        id="boardInfoModal"
        tabindex="-1"
        aria-labelledby="boardInfoModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="boardInfoModalLabel">Board Information</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="cleanupModals"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="container">
                <div class="row mt-4">
                  <div class="col-12 p-3">
                    <form autocomplete="on">
                      <div class="row g-3">
                        <div class="row">
                          <label class="col-form-label col-12 col-lg-3 fw-bold" for="boardName">
                            Board Name:
                          </label>
                          <div class="col-12 col-lg-9">
                            <textarea
                              id="boardName"
                              readonly
                              class="form-control-plaintext"
                              style="white-space: pre-wrap"
                              :value="selectedBoard?.name"
                            ></textarea>
                          </div>
                        </div>

                        <div class="row">
                          <label
                            class="col-form-label col-12 col-lg-3 fw-bold"
                            for="boardAbbreviation"
                          >
                            Board Abbreviation:
                          </label>
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              class="form-control-plaintext"
                              id="boardAbbreviation"
                              :value="selectedBoard?.abbreviation"
                              readonly
                            />
                          </div>
                        </div>

                        <!-- Board Address -->
                        <fieldset class="border p-2 rounded col col-12">
                          <legend class="float-none w-auto fs-5">Board Address</legend>
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
                                :value="selectedBoard?.address?.street"
                              ></textarea>
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
                                  :value="selectedBoard?.address?.country?.name"
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
                                  :value="selectedBoard?.address?.state?.name"
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
                                  :value="selectedBoard?.address?.city?.name"
                                />
                              </div>
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
                                :value="selectedBoard?.address?.postal_code"
                              />
                            </div>
                          </div>
                        </fieldset>

                        <!-- Mediums of Instruction -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold" for="mediumOfInstruction">
                            Mediums of Instruction:
                          </label>
                          <ul class="list-group">
                            <li
                              v-for="medium in selectedBoard?.mediums"
                              :key="medium.id"
                              class="list-group-item"
                            >
                              {{ medium.instruction_medium }}
                            </li>
                            <li v-if="!selectedBoard?.mediums?.length" class="list-group-item">
                              No mediums specified
                            </li>
                          </ul>
                        </div>

                        <!-- Standards -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold" for="standards">Standards:</label>
                          <ul id="standardsList" class="list-group">
                            <li
                              v-for="standard in selectedBoard?.standards"
                              :key="standard.id"
                              class="list-group-item"
                            >
                              {{ standard.name }}
                            </li>
                            <li v-if="!selectedBoard?.standards?.length" class="list-group-item">
                              No standards available.
                            </li>
                          </ul>
                        </div>

                        <!-- Subjects -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold" for="subjects">Subjects:</label>
                          <ul class="list-group">
                            <li
                              v-for="subject in selectedBoard?.subjects"
                              :key="subject.id"
                              class="list-group-item"
                            >
                              {{ subject.name }}
                            </li>
                            <li v-if="!selectedBoard?.subjects?.length" class="list-group-item">
                              No subjects specified
                            </li>
                          </ul>
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
                @click="navigateToSchools(selectedBoard?.name)"
              >
                <i class="bi bi-arrow-return-right"></i> Schools
              </button>
              <button
                type="button"
                class="btn btn-dark"
                @click="navigateToEdit"
              >
                Edit
              </button>
              <button
                type="button"
                class="btn btn-custom"
                id="deleteSchoolButton"
                data-bs-toggle="modal"
                data-bs-target="#deleteConfirmationModal"
                @click="showDeleteConfirmation"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'
import type { Board, BoardDetails } from '@/types/board.ts'
import * as bootstrap from 'bootstrap'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const boards = ref<Board[]>([])
const selectedBoard = ref<BoardDetails | null>(null)
const isLoading = ref(true)
const isSearching = ref(false)
const error = ref<string | null>(null)
const associatedSchools = ref<Array<{ id: number; name: string }>>([])
const confirmationText = ref('')
const deleteModal = ref<Modal | null>(null)
const searchTimeout = ref<number | null>(null)

// Pagination state
const currentPage = ref(1)
const pageSize = 15 // Fixed page size
const totalItems = ref(0)
const totalPages = ref(1)
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
  const totalVisible = 5 // Number of page buttons to show
  const pages: (number | string)[] = []

  if (totalPages.value <= totalVisible) {
    // If we have fewer pages than the visible count, show all pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always include first page
    pages.push(1)

    // Calculate start and end of visible pages around current page
    let start = Math.max(2, currentPage.value - Math.floor(totalVisible / 2))
    const end = Math.min(totalPages.value - 1, start + totalVisible - 3)

    // Adjust start if end is too close to totalPages
    start = Math.max(2, Math.min(start, totalPages.value - totalVisible + 2))

    // Add ellipsis if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed
    if (end < totalPages.value - 1) {
      pages.push('...')
    }

    // Always include last page
    pages.push(totalPages.value)
  }

  return pages
})

const fetchBoardDetails = async (boardId: number): Promise<BoardDetails> => {
  try {
    console.log('Fetching board details for ID:', boardId)
    const response = await axiosInstance.get(`/board-management/${boardId}`)
    const boardData = response.data
    console.log('Board data received:', boardData)

    // Transform the data to match our interface
    const boardDetails: BoardDetails = {
      id: boardData.board.id,
      name: boardData.board.name,
      abbreviation: boardData.board.abbreviation,
      address_id: boardData.board.address_id,
      address: {
        ...boardData.address,
        city: boardData.address.city,
        state: boardData.address.city.state,
        country: boardData.address.city.state.country,
      },
      mediums: boardData.instruction_mediums,
      standards: boardData.standards,
      subjects: boardData.subjects,
    }

    return boardDetails
  } catch (error) {
    console.error('Error in fetchBoardDetails:', error)
    throw new Error('Failed to fetch board')
  }
}

const fetchBoards = async () => {
  try {
    setLoadingState();
    error.value = null;

    const response = await fetchBoardsFromApi();
    processApiResponse(response);
  } 
  catch (err) {
    handleFetchError(err);
  } finally {
    clearLoadingState();
  }
}

// Helper function to set the loading state based on search query
const setLoadingState = () => {
  if (searchQuery.value) {
    isSearching.value = true;
  } else {
    isLoading.value = true;
  }
}

// Helper function to clear loading states
const clearLoadingState = () => {
  isLoading.value = false;
  isSearching.value = false;
}

// Helper function to fetch boards from API
const fetchBoardsFromApi = async () => {
  return await axiosInstance.get('/boards', {
    params: {
      page: currentPage.value,
      page_size: pageSize,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
      search: searchQuery.value || undefined
    }
  });
}

// Helper function to handle fetch errors
const handleFetchError = (err) => {
  console.error('Error fetching boards:', err);
  error.value = 'Failed to load boards. Please try again.';
  boards.value = [];
}

// Helper function to process API response data
const processApiResponse = (response) => {
  console.log('API Response:', response.data);
  
  if (!response.data || typeof response.data !== 'object') {
    boards.value = [];
    error.value = 'Failed to load boards. Please try again.';
    return;
  }

  if (response.data.data && Array.isArray(response.data.data)) {
    handlePaginatedResponse(response.data);
  } else if (Array.isArray(response.data)) {
    handleArrayResponse(response.data);
  } else {
    handleInvalidResponse(response.data);
  }
}

// Helper function to handle paginated response format
const handlePaginatedResponse = (data) => {
  boards.value = data.data;
  
  if (data.meta) {
    totalItems.value = data.meta.total || 0;
    totalPages.value = data.meta.total_pages || 1;
  } else {
    // Fallback if meta is missing
    totalItems.value = boards.value.length;
    totalPages.value = Math.ceil(totalItems.value / pageSize);
  }
}

// Helper function to handle array response format
const handleArrayResponse = (data) => {
  boards.value = data;
  totalItems.value = data.length;
  totalPages.value = Math.ceil(data.length / pageSize);
}

// Helper function to handle invalid response format
const handleInvalidResponse = (data) => {
  console.error('Unexpected response format:', data);
  boards.value = [];
  error.value = 'Received invalid data format from server';
}

// Use the boards directly since filtering is now done on the server
const filteredBoards = computed(() => boards.value)

// Improved debounce function for search input
const handleSearchInput = () => {
  // Immediately set searching state for visual feedback
  isSearching.value = true;

  // Clear any existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Set a new timeout
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when search changes
    fetchBoards();

    // Update URL with search query for bookmarking/sharing
    updateUrlParams();
  }, 500) as unknown as number; // Increased debounce time for better UX
}

// Clear search function that maintains focus
const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;

  // Set searching state for visual feedback
  isSearching.value = true;

  fetchBoards();

  // Update URL to remove search parameter
  updateUrlParams();

  // Maintain focus on the search input after clearing
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
}

// Function to update URL parameters without reloading the page
const updateUrlParams = () => {
  const query: Record<string, string> = {}

  if (searchQuery.value) {
    query.search = searchQuery.value
  }

  if (currentPage.value > 1) {
    query.page = currentPage.value.toString()
  }

  if (sortOption.value !== 'name_asc') {
    query.sort = sortOption.value
  }

  // Update URL without reloading the page
  router.replace({ query }).catch(() => {
    // Ignore navigation errors
  })
}

const getHighlightedText = (board: Board) => {
  const query = searchQuery.value
  const abbreviation = board.abbreviation ?? ''
  if (!query) return `${board.name} (${abbreviation})`

  const highlightedName = highlightText(board.name, query)
  const highlightedAbbr = highlightText(abbreviation, query)

  return `${highlightedName} (${highlightedAbbr})`
}

const highlightText = (text: string, query: string): string => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

const showBoardInfo = async (board: Board) => {
  try {
    selectedBoard.value = null // Reset selected board first
    const boardDetails = await fetchBoardDetails(board.id)
    selectedBoard.value = boardDetails
    
    // Show the modal using Bootstrap's Modal API
    const modal = new Modal(document.getElementById('boardInfoModal') as HTMLElement)
    modal.show()
  } catch (error) {
    console.error('Error fetching board details:', error)
  }
}

const checkAssociatedSchools = async (boardId: number) => {
  try {
    let hasSyllabus = false

    // First check for associated schools
    const schoolsResponse = await axiosInstance.get(`/schools?boardId=${boardId}`)
    const schools = schoolsResponse.data

    // Check for syllabus assignments - only need to check mediums
    const mediumsResponse = await axiosInstance.get(`/instruction-mediums/board/${boardId}`)
    const mediums = mediumsResponse.data

    // Check if any medium has syllabus data
    for (const medium of mediums) {
      const syllabusResponse = await axiosInstance.get(
        `/medium-standard-subjects?instruction_medium_id=${medium.id}`,
      )
      const syllabusData = syllabusResponse.data
      if (syllabusData && syllabusData.length > 0) {
        hasSyllabus = true
        break // Exit loop as soon as we find any syllabus data
      }
    }

    // Set the appropriate message based on conditions
    if (schools.length > 0 && hasSyllabus) {
      associatedSchools.value = [
        ...schools,
        {
          id: -1,
          name: 'This board also has syllabus data assigned to it. Please delete the syllabus first.',
        },
      ]
    } else if (schools.length > 0) {
      associatedSchools.value = schools
    } else if (hasSyllabus) {
      associatedSchools.value = [
        {
          id: -1,
          name: 'This board has syllabus data assigned to it. Please delete the syllabus first.',
        },
      ]
    } else {
      associatedSchools.value = []
    }
  } catch (error) {
    console.error('Error checking associations:', error)
    associatedSchools.value = []
  }
}

const deleteBoard = async () => {
  if (!selectedBoard.value) return

  try {
    // Proceed with board deletion if user has typed "sure"
    if (confirmationText.value !== 'sure') {
      return
    }

    // ✅ Use the board-management delete endpoint for consistency
    await axiosInstance.delete(`/board-management/${selectedBoard.value.id}`)

    // Update the local boards list
    boards.value = boards.value.filter((board: Board) => board.id !== selectedBoard.value?.id)

    // Show success toast
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'success',
      title: 'Success',
      message: `Board "${selectedBoard.value.name}" has been deleted successfully.`,
    })

    selectedBoard.value = null
    cleanupModals()
  } catch (error) {
    console.error('Error deleting board:', error)
    // Show error toast instead of alert
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to delete board. Please try again.',
    })
  }
}

const cleanupModals = () => {
  confirmationText.value = ''

  // Get all modal elements
  const deleteModal = document.getElementById('deleteConfirmationModal')
  const viewModal = document.getElementById('boardInfoModal')

  // Hide and cleanup delete modal if it exists
  if (deleteModal) {
    const deleteModalInstance = bootstrap.Modal.getInstance(deleteModal)
    deleteModalInstance?.hide()
  }

  // Hide and cleanup view modal if it exists
  if (viewModal) {
    const viewModalInstance = bootstrap.Modal.getInstance(viewModal)
    viewModalInstance?.hide()
  }

  // Remove any remaining backdrops
  const backdrops = document.getElementsByClassName('modal-backdrop')
  while (backdrops.length > 0) {
    backdrops[0].remove()
  }

  // Remove modal-open class from body
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('padding-right')
  document.body.style.removeProperty('overflow')
}

const navigateToSchools = (boardName?: string) => {
  // Close the board info modal first
  cleanupModals()

  // Navigate to schools page with the board name as a query parameter
  router.push({
    path: '/admin/school',
    query: { board: boardName },
  })
}

// Add this function to handle the delete button click
const showDeleteConfirmation = async () => {
  if (selectedBoard.value) {
    await checkAssociatedSchools(selectedBoard.value.id)
  }
}

// Add watcher for route changes
watch(
  () => route.path,
  () => {
    // Refresh board data when returning to dashboard
    if (route.path === '/admin/board') {
      fetchBoards()
    }
  },
)

// Add this to ensure focus is maintained after data updates
watch([boards, isSearching], () => {
  // If we were searching and now we're done, restore focus to search input
  if (!isSearching.value && searchInputRef.value && document.activeElement !== searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

// Lifecycle hooks
onMounted(() => {
  // Initialize delete modal
  const modalElement = document.getElementById('deleteConfirmationModal')
  if (modalElement) {
    deleteModal.value = new Modal(modalElement)
  }

  // Initialize from route query if present
  if (route.query.search) {
    searchQuery.value = route.query.search as string
  }

  if (route.query.page) {
    const pageNum = Number.parseInt(route.query.page as string, 10)
    if (!Number.isNaN(pageNum) && pageNum > 0) {
      currentPage.value = pageNum
    }
  }

  if (route.query.sort) {
    sortOption.value = route.query.sort as string
  }

  fetchBoards()
})

// Function to change page
const changePage = (page: number | string) => {
  if (typeof page === 'number') {
    currentPage.value = page
    fetchBoards()
    updateUrlParams()
  }
}

// Function to handle sort change
const handleSortChange = () => {
  currentPage.value = 1 // Reset to first page when changing sort
  fetchBoards()
  updateUrlParams()
}

const navigateToEdit = () => {
  // Close the board info modal first
  cleanupModals()

  // Navigate to edit page with the board ID as a query parameter
  router.push({
    path: `/admin/board/${selectedBoard.value?.id}/edit`,
  })
}
</script>

<!-- Global styles for modal backdrop -->
<style>
.modal-backdrop {
  opacity: 0.5 !important;
  background-color: rgba(0, 0, 0, 0.25) !important;
}
</style>

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
    padding-bottom: 30px !important;
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

/* Adjust modal backdrop opacity to match School Dashboard modals */
:deep(.modal-backdrop),
:global(.modal-backdrop) {
  background-color: rgba(0, 0, 0, 0.25) !important;
  opacity: 0.5 !important;
}

#navBoard {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navBoard {
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

/* Custom pagination styling */
.pagination .page-item.active .page-link {
  background-color: #212529;
  border-color: #212529;
  color: white;
}

.pagination .page-link {
  color: #212529;
}

.pagination .page-link:hover {
  background-color: #e9ecef;
  color: #000;
}

/* Modern search and sort styling */
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
  z-index: 101; /* Higher than the input focus z-index */
}

.clear-search-icon:hover {
  color: #212529;
}

.search-loading-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

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
}

@media (max-width: 768px) {
  .search-input, .sort-select {
    height: 42px;
  }
}

.opacity-50 {
  opacity: 0.5;
  transition: opacity 0.3s ease;
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

/* Ensure search icons stay visible */
.search-icon, .clear-search-icon, .search-loading-icon {
  z-index: 101; /* Higher than the input focus z-index */
}

.category-tabs {
  border-bottom: 2px solid #dee2e6;
}

.category-tabs .nav-link {
  color: #495057;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 0.5rem 1rem;
  font-weight: 500;
  background: transparent;
}

.category-tabs .nav-link:hover {
  color: #212529;
  border-bottom-color: #adb5bd;
}

.category-tabs .nav-link.active {
  color: #212529;
  font-weight: 600;
  border-bottom-color: #212529;
  background: transparent;
}
</style>
