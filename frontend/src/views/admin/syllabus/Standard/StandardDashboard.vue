<template>
  <div class="container my-4">
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/syllabus" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-1">
        <div class="col col-12 col-sm-5">
          <p class="text-muted text-start fs-5 m-0">
            <span class="col-12 col-md-auto">{{ selectedBoard?.name }} | </span>
            <span class="col-12 col-md-auto"> {{ selectedMedium?.instruction_medium }}</span>
          </p>
          <h3 class="fw-bolder text-start text-dark m-0">Standard {{ selectedStandard?.name }}</h3>
        </div>
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <div class="row justify-content-end align-items-end g-2">
            <div class="col col-7 col-sm-auto text-end">
              <button
                id="removeSubjectButton"
                class="btn btn-custom"
                @click="navigateToRemoveSubject"
              >
                Remove Subject
              </button>
            </div>
            <div class="col col-5 col-sm-auto text-end">
              <button
                id="addSubjectButton"
                class="btn btn-dark stick-bottom"
                @click="navigateToAddSubject"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </div>

    <div class="container mt-2 pt-3 mb-5 pb-3">
      <!-- Search Section -->
      <div class="row p-2 gy-2 justify-content-center">
        <div class="col-12 col-sm-10">
          <div class="input-group">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                id="subjectFilter"
                placeholder="Search for Subject"
                v-model="searchQuery"
                autocomplete="off"
              />
              <label for="subjectFilter">
                <i class="bi bi-search text-secondary"></i> Search for Subject
              </label>
            </div>
            <span class="input-group-text clear-icon" @click="clearSearch">
              <i class="bi bi-x-lg"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div id="table-container" class="row mt-4 p-2 justify-content-center">
        <div class="col col-12 col-sm-10 col-md-10">
          <div class="table-responsive">
            <table class="table table-sm table-hover table-striped table-bordered">
              <caption>List of subjects for the selected standard</caption>
              <colgroup>
                <col style="width: 10px" />
                <col style="width: 100%" />
                <col style="width: 20px" />
              </colgroup>
              <thead class="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Manage</th>
                </tr>
              </thead>
              <tbody class="table-group-divider" id="subjectTable">
                <tr v-for="(subject, index) in filteredSubjects" :key="subject.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>
                    {{ subject.name }}
                    <span v-if="subject.isNew" class="badge rounded-pill bg-dark">New</span>
                  </td>
                  <td class="text-center">
                    <i
                      class="bi bi-three-dots"
                      style="cursor: pointer"
                      @click="navigateToSubject(subject)"
                    ></i>
                  </td>
                </tr>
                <tr v-if="filteredSubjects.length === 0">
                  <td colspan="3" class="text-center">No subjects found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Subject Modal -->
    <div
      class="modal fade"
      id="addSubjectModal"
      tabindex="-1"
      aria-labelledby="addSubjectModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addSubjectModalLabel">Add New Subjects</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="container">
              <div class="row">
                <div class="col-12">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover table-striped table-bordered">
                      <caption>List of available subjects that can be added to the standard</caption>
                      <thead>
                        <tr>
                          <th scope="col" style="width: 50px"></th>
                          <th scope="col">Subject Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="availableSubjects.length === 0">
                          <td colspan="2" class="text-center">No additional subjects available to add</td>
                        </tr>
                        <tr
                          v-else
                          v-for="subject in filteredAvailableSubjects"
                          :key="subject.id"
                          class="cursor-pointer"
                        >
                          <td
                            @click.stop="toggleSubjectSelection(subject.id)"
                            style="cursor: pointer"
                          >
                            <div class="form-check d-flex justify-content-center">
                              <input
                                type="checkbox"
                                class="form-check-input"
                                :value="subject.id"
                                v-model="selectedSubjectIds"
                                @click.stop
                              />
                            </div>
                          </td>
                          <td
                            @click.stop="toggleSubjectSelection(subject.id)"
                            style="cursor: pointer"
                          >
                            {{ subject.name }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="container-fluid px-0">
              <div class="row align-items-center">
                <div class="col">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search subjects..."
                      v-model="modalSearchQuery"
                    />
                  </div>
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="btn btn-success"
                    @click="addSelectedSubjects"
                    :disabled="selectedSubjectIds.length === 0"
                  >
                    Add Selected ({{ selectedSubjectIds.length }})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove Subject Modal -->
    <div
      class="modal fade"
      id="removeSubjectModal"
      tabindex="-1"
      aria-labelledby="removeSubjectModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title" id="removeSubjectModalLabel">Remove Subjects</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="container">
              <div class="row">
                <div class="col-12">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover table-striped table-bordered">
                      <caption>List of subjects that can be removed from the standard</caption>
                      <thead>
                        <tr>
                          <th scope="col" style="width: 50px"></th>
                          <th scope="col">Subject Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="subjects.length === 0">
                          <td colspan="2" class="text-center">No subjects available to remove</td>
                        </tr>
                        <tr
                          v-else
                          v-for="subject in filteredRemovableSubjects"
                          :key="subject.id"
                          class="cursor-pointer"
                        >
                          <td
                            @click.stop="toggleRemoveSubjectSelection(subject.id)"
                            style="cursor: pointer"
                          >
                            <div class="form-check d-flex justify-content-center">
                              <input
                                type="checkbox"
                                class="form-check-input"
                                :value="subject.id"
                                v-model="selectedRemoveSubjectIds"
                                @click.stop
                              />
                            </div>
                          </td>
                          <td
                            @click.stop="toggleRemoveSubjectSelection(subject.id)"
                            style="cursor: pointer"
                          >
                            {{ subject.name }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="container-fluid px-0">
              <div class="row align-items-center">
                <div class="col">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search subjects..."
                      v-model="removeModalSearchQuery"
                    />
                  </div>
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger"
                    @click="removeSelectedSubjects"
                    :disabled="selectedRemoveSubjectIds.length === 0"
                  >
                    Remove Selected ({{ selectedRemoveSubjectIds.length }})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useToastStore } from '@/store/toast'
import axiosInstance from '@/config/axios'
import { boardSyllabusQueryString } from '@/utils/boardSyllabus'

interface Board {
  id: number
  name: string
  abbreviation: string
}

interface InstructionMedium {
  id: number
  board_id: number
  instruction_medium: string
}

interface Standard {
  id: number
  board_id: number
  name: string
}

interface Subject {
  id: number
  name: string
  isNew?: boolean
  mediumStandardSubjectId: number
}

interface BoardSubject {
  id: number
  name: string
  board_id: number
}

interface AvailableSubject {
  id: number
  name: string
}

interface MediumStandardSubjectResponse {
  id: number
  instruction_medium_id: number
  standard_id: number
  subject_id: number
  subject: {
    id: number
    name: string
  }
}

const route = useRoute()
const router = useRouter()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<InstructionMedium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const subjects = ref<Subject[]>([])
const searchQuery = ref('')
const modalSearchQuery = ref('')
const removeModalSearchQuery = ref('')
const selectedSubjectIds = ref<number[]>([])
const selectedRemoveSubjectIds = ref<number[]>([])
const availableSubjects = ref<AvailableSubject[]>([])
const toastStore = useToastStore()

// Fetch board, medium, and standard details
onMounted(async () => {
  const boardId = route.query.board
  const mediumId = route.query.medium
  const standardId = route.query.standard

  if (!boardId || !mediumId || !standardId) {
    router.push('/admin/syllabus')
    return
  }

  try {
    // Fetch board details
    const boardResponse = await axiosInstance.get(`/boards/${boardId}`)
    selectedBoard.value = boardResponse.data

    // Find selected medium
    selectedMedium.value = boardResponse.data.instruction_mediums.find(
      (medium: InstructionMedium) => medium.id === Number(mediumId),
    )

    // Find selected standard
    selectedStandard.value = boardResponse.data.standards.find(
      (standard: Standard) => standard.id === Number(standardId),
    )

    // Fetch subjects for this combination
    await fetchSubjects()
    router.replace({
      query: boardSyllabusQueryString({
        board: selectedBoard.value?.id,
        medium: selectedMedium.value?.id,
        standard: selectedStandard.value?.id,
        boardName: selectedBoard.value?.name,
        mediumName: selectedMedium.value?.instruction_medium,
        standardName: selectedStandard.value?.name,
      }),
    })
  } catch (error) {
    console.error('Error fetching details:', error)
  }
})

const fetchSubjects = async () => {
  try {
    // Use the new API endpoint with query parameters
    const response = await axiosInstance.get(
      `/medium-standard-subjects?boardId=${selectedBoard.value?.id}&instruction_medium_id=${selectedMedium.value?.id}&standard_id=${selectedStandard.value?.id}`
    )

    // Map the response data to our subjects array
    subjects.value = response.data.map((item: MediumStandardSubjectResponse) => ({
      id: item.subject.id,
      name: item.subject.name,
      isNew: false,
      mediumStandardSubjectId: item.id
    }))
  } catch (error) {
    console.error('Error fetching subjects:', error)
    subjects.value = []
  }
}

const filteredSubjects = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return subjects.value.filter((subject) => subject.name.toLowerCase().includes(query))
})

const filteredRemovableSubjects = computed(() => {
  const query = removeModalSearchQuery.value.toLowerCase()
  return subjects.value.filter((subject) => subject.name.toLowerCase().includes(query))
})

const clearSearch = () => {
  searchQuery.value = ''
}

const navigateToAddSubject = async () => {
  try {
    modalSearchQuery.value = ''

    // Fetch all subjects from the board
    const response = await axiosInstance.get(`/subjects/board/${selectedBoard.value?.id}`)
    const boardSubjects = response.data

    // Get the current mapped subject IDs from our subjects list
    const currentSubjectIds = new Set(subjects.value.map((subject) => subject.id))

    // Set all subjects as available BUT FILTER OUT already mapped subjects
    availableSubjects.value = boardSubjects
      .filter((subject: BoardSubject) => !currentSubjectIds.has(subject.id))
      .map((subject: BoardSubject) => ({
      id: subject.id,
      name: subject.name,
    }))

    // No need to pre-select subjects since we're only showing unmapped ones
    selectedSubjectIds.value = []

    // Show modal
    const modal = new Modal(document.getElementById('addSubjectModal') as HTMLElement)
    modal.show()
  } catch (error) {
    console.error('Error fetching board subjects:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load board subjects. Please try again.',
      type: 'error',
    })
  }
}

const navigateToSubject = (subject: Subject) => {
  router.push({
    name: subject.isNew ? 'newSubject' : 'subjectSyllabus',
    params: { id: subject.id.toString() },
    query: boardSyllabusQueryString({
      board: selectedBoard.value?.id,
      medium: selectedMedium.value?.id,
      standard: selectedStandard.value?.id,
      subject: subject.id,
      boardName: selectedBoard.value?.name,
      mediumName: selectedMedium.value?.instruction_medium,
      standardName: selectedStandard.value?.name,
      subjectName: subject.name,
    }),
  })
}

const filteredAvailableSubjects = computed(() => {
  const query = modalSearchQuery.value.toLowerCase()
  return availableSubjects.value.filter((subject) => subject.name.toLowerCase().includes(query))
})

const toggleSubjectSelection = (subjectId: number) => {
  const index = selectedSubjectIds.value.indexOf(subjectId)
  if (index === -1) {
    selectedSubjectIds.value.push(subjectId)
  } else {
    selectedSubjectIds.value.splice(index, 1)
  }
}

const addSelectedSubjects = async () => {
  try {
    // Now we only need to handle additions since we're only showing unmapped subjects
    // No removals needed

    // Handle additions
    for (const subjectId of selectedSubjectIds.value) {
      await axiosInstance.post('/medium-standard-subjects', {
        instruction_medium_id: selectedMedium.value?.id,
        standard_id: selectedStandard.value?.id,
        subject_id: subjectId,
      })
    }

    // Refresh subjects list
    await fetchSubjects()

    // Hide modal
    const modal = Modal.getInstance(document.getElementById('addSubjectModal') as HTMLElement)
    modal?.hide()

    // Show success toast
    toastStore.showToast({
      title: 'Success',
      message: 'Subjects added successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error adding subjects:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to add subjects. Please try again.',
      type: 'error',
    })
  }
}

const navigateToRemoveSubject = () => {
  try {
    removeModalSearchQuery.value = ''
    selectedRemoveSubjectIds.value = []
    
    // Show modal
    const modal = new Modal(document.getElementById('removeSubjectModal') as HTMLElement)
    modal.show()
  } catch (error) {
    console.error('Error preparing remove subjects modal:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to prepare remove subjects modal. Please try again.',
      type: 'error',
    })
  }
}

const toggleRemoveSubjectSelection = (subjectId: number) => {
  const index = selectedRemoveSubjectIds.value.indexOf(subjectId)
  if (index === -1) {
    selectedRemoveSubjectIds.value.push(subjectId)
  } else {
    selectedRemoveSubjectIds.value.splice(index, 1)
  }
}

// Helper function to clean up the modal
const cleanupModal = (modal: bootstrap.Modal, modalElement: HTMLElement) => {
  modal.hide()
  setTimeout(() => {
    modalElement.remove()
    for (const backdrop of document.querySelectorAll('.modal-backdrop')) backdrop.remove();
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  }, 300)
}

// Helper function to handle subject deletion
const removeSubject = async (subjectId: number): Promise<void> => {
  const subject = subjects.value.find(s => s.id === subjectId)
  if (!subject) return

  try {
    await axiosInstance.delete(`/medium-standard-subjects/${subject.mediumStandardSubjectId}`)
  } catch (error) {
    const axiosError = error as { response?: { status: number } }
    if (axiosError.response && axiosError.response.status === 409) {
      const subjectName = subjects.value.find(s => s.id === subjectId)?.name ?? 'Unknown'
      toastStore.showToast({
        title: 'Error',
        message: `Cannot remove subject "${subjectName}" as it has existing relationships.`,
        type: 'error',
      })
      return
    }
    throw new Error(`Failed to delete subject mapping`)
  }
}

const removeSelectedSubjects = async () => {
  try {
    // Hide the remove subject modal first
    const removeModal = Modal.getInstance(document.getElementById('removeSubjectModal') as HTMLElement)
    removeModal?.hide()

    // Create modal element
    const modalElement = document.createElement('div')
    modalElement.className = 'modal fade'
    modalElement.id = 'deleteConfirmationModal'
    modalElement.setAttribute('tabindex', '-1')
    modalElement.setAttribute('aria-labelledby', 'deleteConfirmationModalLabel')
    modalElement.setAttribute('aria-hidden', 'true')
    modalElement.dataset.bsBackdrop = 'static'

    modalElement.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Remove Subjects</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <p class="mb-0">Warning: Removing subjects will also delete all associated questions and data!</p>
            </div>
            <p class="mb-3">
              Are you sure you want to remove ${selectedRemoveSubjectIds.value.length} subject(s)? This action cannot be undone.
            </p>
            <div class="form-group">
              <label for="confirmText" class="form-label">Type "sure" to confirm removal:</label>
              <input
                type="text"
                class="form-control"
                id="confirmText"
                placeholder="Type 'sure' here"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              id="confirmButton"
              disabled
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modalElement)

    // Initialize and show modal
    const modal = new Modal(modalElement)
    modal.show()

    // Add event listener for the confirmation text input
    const confirmInput = modalElement.querySelector('#confirmText') as HTMLInputElement
    const confirmButton = modalElement.querySelector('#confirmButton') as HTMLButtonElement

    confirmInput?.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement
      confirmButton.disabled = input.value !== 'sure'
    })

    // Add event listeners
    modalElement.querySelector('.btn-secondary')?.addEventListener('click', () => {
      cleanupModal(modal, modalElement)
    })

    confirmButton?.addEventListener('click', () => {
      void (async () => {
        try {
          // Process removals using the mediumStandardSubjectId
          for (const subjectId of selectedRemoveSubjectIds.value) {
            await removeSubject(subjectId)
          }

          // Refresh subjects list
          await fetchSubjects()

          // Hide confirmation modal
          cleanupModal(modal, modalElement)

          // Show success toast
          toastStore.showToast({
            title: 'Success',
            message: 'Subjects removed successfully',
            type: 'success',
          })
        } catch (error) {
          console.error('Error removing subjects:', error)
          toastStore.showToast({
            title: 'Error',
            message: 'Failed to remove subjects. Please try again.',
            type: 'error',
          })
        }
      })()
    })
  } catch (error) {
    console.error('Error removing subjects:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to remove subjects. Please try again.',
      type: 'error',
    })
  }
}
</script>

<style scoped>
/* Mobile styles for nav link */
@media (max-width: 768px) {
  #navSyllabus {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

/* Styles for screens below 576px */
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

  #addSubjectButton,
  #removeSubjectButton {
    width: 100%;
  }
  
  /* Add margin between buttons on mobile */
  .col-7 {
    margin-top: 0.5rem;
  }

  .btn-custom {
    background-color: #dc3545 !important;
    color: white !important;
  }
}

/* Desktop styles */
@media (min-width: 577px) {
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

.clear-icon {
  cursor: pointer;
}

.bi-three-dots:hover {
  color: #0d6efd !important;
}

/* Modal styles */
.list-group-item {
  cursor: pointer;
  user-select: none;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.form-check-input {
  cursor: pointer;
}

.modal-dialog {
  max-width: 800px !important;
}

.modal-body {
  padding: 1rem;
  height: 400px;
  overflow-y: auto;
}

.table-responsive {
  height: 100%;
  overflow-y: auto;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.05);
}

.table thead {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.table th {
  background-color: white;
  border-bottom: 2px solid #dee2e6;
}

/* Ensure checkbox column width is consistent */
.table th:first-child,
.table td:first-child {
  width: 50px;
  text-align: center;
}

/* Style for the search input in modal footer */
.modal-footer .input-group {
  width: 300px;
}

@media (max-width: 768px) {
  .modal-footer .row {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .modal-footer .input-group {
    width: 100%;
  }

  .modal-footer .col-auto {
    width: 100%;
    display: flex;
    gap: 0.5rem;
  }

  .modal-footer .col-auto button {
    flex: 1;
  }
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table-dark {
  --bs-table-bg: #212529;
  --bs-table-color: #fff;
}

.table-dark th {
  background-color: #212529 !important;
  color: #fff !important;
  font-weight: bold !important;
  border-bottom: none !important;
}

.table > :not(caption) > * > * {
  padding: 0.3rem 0.75rem;
}

.table tbody tr td,
.table tbody tr th {
  vertical-align: middle;
  padding: 0.3rem 0.75rem;
  line-height: 1.2;
}

/* Loading State */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Search Input Styling */
.form-floating > .form-control {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}

.form-floating > label {
  padding: 1rem 0.75rem;
}

/* Modal Table Styles */
.modal .table thead {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal .table th {
  background-color: white;
  border-bottom: 2px solid #dee2e6;
}

.modal .table-dark {
  --bs-table-bg: white;
  --bs-table-color: #212529;
}

/* Ensure consistent spacing */
.container {
  max-width: 1200px;
}

/* Highlight text styling */
:deep(.highlight) {
  background-color: #fff3cd;
  padding: 2px;
  border-radius: 2px;
  font-weight: bold;
}

/* Update modal table cell padding as well */
.modal .table > :not(caption) > * > * {
  padding: 0.3rem 0.75rem;
}

.modal .table tbody tr td,
.modal .table tbody tr th {
  vertical-align: middle;
  padding: 0.3rem 0.75rem;
  line-height: 1.2;
}

.modal .table thead th {
  font-weight: bold !important;
}
</style>
