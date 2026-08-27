<template>
  <div class="container my-4">
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <router-link
          class="btn btn-close"
          :to="{
            name: 'syllabusStandard',
            query: {
              board: selectedBoard?.id,
              medium: selectedMedium?.id,
              standard: selectedStandard?.id,
            },
          }"
          aria-label="Close"
        />
      </div>
      <div class="row justify-content-center align-items-center my-1">
        <div class="col col-12 col-sm-5">
          <p class="text-muted text-start fs-5 m-0">
            <span class="col-12 col-md-auto">{{ selectedBoard?.name }} |</span>
            <span class="col-12 col-md-auto"> {{ selectedMedium?.instruction_medium }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0">
            Standard {{ selectedStandard?.name }}
            <span class="d-block text-start text-secondary"
              >{{ selectedSubject?.name }} Syllabus</span
            >
          </h4>
        </div>
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <div class="row justify-content-end g-2">
            <div class="col col-6 col-sm-auto text-end">
              <button
                id="quickEditButton"
                class="btn btn-outline-dark fw-bold stick-bottom"
                @click="toggleQuickEdit"
              >
                Quick Edit
              </button>
            </div>
            <div class="col col-6 col-sm-auto text-end">
              <button
                id="addChapterButton"
                class="btn btn-success fw-bold stick-bottom"
                @click="navigateToAddChapter"
              >
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </div>

    <div class="container mt-2 pt-3 mb-5 pb-3">
      <div class="row g-2 justify-content-center align-items-center">
        <div class="col col-12 col-sm-9 p-0 m-0">
          <!-- Loading Spinner -->
          <div v-if="isLoading" class="text-center py-5">
            <output
              class="spinner-border text-primary"
            >
              <span class="visually-hidden">Loading...</span>
            </output>
          </div>

          <!-- No Data Message -->
          <div v-else-if="chapters.length === 0" class="text-center py-5">
            <p class="fs-5 text-muted">No chapters added for this subject.</p>
          </div>

          <!-- Chapters List -->
          <ol v-else id="sortable-list" class="list-group list-group-numbered">
            <li
              v-for="chapter in chapters"
              :key="chapter.id"
              :data-chapter-id="chapter.id"
              class="list-group-item list-group-item-action d-flex justify-content-between draggable-item py-1 fs-4"
            >
              <i
                class="bi bi-grip-vertical text-secondary"
                :class="{ 'd-none': !isQuickEditMode }"
              ></i>
              <div class="container pe-0">
                <div class="row">
                  <span class="toggle-card pe-0" @click="toggleChapter(chapter.id)">
                    {{ chapter.sequential_chapter_number }}. {{ chapter.name }}
                    <i
                      class="bi bi-caret-down-fill fs-6 text-secondary toggle-icon"
                      :class="chapter.isExpanded ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"
                    ></i>
                  </span>
                </div>
                <div class="row">
                  <div
                    :id="'chapter-' + chapter.id"
                    class="collapse"
                    :class="{ show: chapter.isExpanded }"
                  >
                    <div class="card card-body border-0 p-0">
                      <!-- No Topics Message -->
                      <div v-if="chapter.topics.length === 0" class="text-center py-2">
                        <p class="text-muted mb-0">No topics added for this chapter.</p>
                      </div>

                      <ol v-else class="sortable-list list-group">
                        <li
                          v-for="topic in chapter.topics"
                          :key="topic.id"
                          :data-topic-id="topic.id"
                          class="list-group-item list-group-item-action d-flex justify-content-between draggable-item py-1 fs-5"
                        >
                          <div class="col-auto">
                            <i
                              class="bi bi-grip-vertical text-secondary"
                              :class="{ 'd-none': !isQuickEditMode }"
                            ></i>
                          </div>
                          <div class="col ms-3">
                            <span
                              >{{ chapter.sequential_chapter_number }}.{{
                                topic.sequential_topic_number
                              }}. {{ topic.name }}</span
                            >
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              <a
                href="#"
                class="text-decoration-none text-black"
                @click.prevent.stop="editChapter(chapter)"
              >
                <i class="bi bi-pencil-square" :class="{ 'd-none': !isQuickEditMode }"></i>
              </a>
              <i
                class="bi bi-trash3 ms-2"
                :class="{ 'd-none': !isQuickEditMode }"
                @click.stop="showDeleteConfirmation(chapter)"
              ></i>
            </li>
          </ol>
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
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Remove Chapter</h5>
          </div>
          <div class="modal-body">Are you sure you want to delete this Chapter from Syllabus?</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              style="border: 1px solid gray"
              id="cancelButton"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              id="deleteButton"
              @click="deleteChapter"
              data-bs-dismiss="modal"
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import Sortable from 'sortablejs'
import { useToastStore } from '@/store/toast'
import axiosInstance from '@/config/axios'
import { boardSyllabusQueryString } from '@/utils/boardSyllabus'

interface Board {
  id: number
  name: string
}

interface Medium {
  id: number
  instruction_medium: string
}

interface Standard {
  id: number
  name: string
}

interface Subject {
  id: number
  name: string
}

interface ChapterData {
  id: number
  name: string
  sequential_chapter_number: number
  isExpanded: boolean
  topics: TopicData[]
  medium_standard_subject: {
    id: number
    instruction_medium_id: number
    standard_id: number
    subject_id: number
  }
}

interface TopicData {
  id: number
  name: string
  sequential_topic_number: number
  chapter_id: number
}

interface MediumStandardSubject {
  id: number
  instruction_medium_id: number
  standard_id: number
  subject_id: number
}

// Define interface to extend HTMLElement with custom property
interface SortableElement extends HTMLElement {
  _sortable?: Sortable
}

// Define interface to extend Element with custom property
interface SortableListElement extends Element {
  _sortable?: Sortable
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)
const chapters = ref<ChapterData[]>([])
const isQuickEditMode = ref(false)
const selectedChapterForDelete = ref<ChapterData | null>(null)
const mediumStandardSubjectId = ref<number | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  await fetchData()
  initializeSortable()
})

const fetchData = async () => {
  isLoading.value = true
  try {
    // Fetch board, medium, standard, and subject details
    const boardId = route.query.board
    const mediumId = route.query.medium
    const standardId = route.query.standard
    const subjectId = route.params.id

    // Fetch board details
    const boardResponse = await axiosInstance.get(`/boards/${boardId}`)
    selectedBoard.value = boardResponse.data

    // Fetch medium details
    const mediumResponse = await axiosInstance.get(`/instruction-mediums/${mediumId}`)
    selectedMedium.value = mediumResponse.data

    // Fetch standard details
    const standardResponse = await axiosInstance.get(`/standards/${standardId}`)
    selectedStandard.value = standardResponse.data

    // Fetch subject details
    const subjectResponse = await axiosInstance.get(`/subjects/${subjectId}`)
    selectedSubject.value = subjectResponse.data

    // Get the medium_standard_subject_id using the API endpoint
    const mediumStandardSubjectResponse = await axiosInstance.get('/medium-standard-subjects', {
      params: {
        boardId: boardId,
        instruction_medium_id: mediumId,
        standard_id: standardId,
        subject_id: subjectId
      }
    })

    // Check if we got a valid response with at least one record
    if (!mediumStandardSubjectResponse.data || mediumStandardSubjectResponse.data.length === 0) {
      throw new Error('Could not find medium-standard-subject association')
    }

    const mediumStandardSubject: MediumStandardSubject = mediumStandardSubjectResponse.data[0]
    mediumStandardSubjectId.value = mediumStandardSubject.id

    // Fetch chapters using only subject ID and standard ID as per updated API
    const chaptersResponse = await axiosInstance.get('/chapters', {
      params: {
        subjectId: subjectId,
        standardId: standardId
      }
    })

    // Transform the response data to match our interface
    const chaptersData = chaptersResponse.data
    chapters.value = chaptersData
      .map((chapter: ChapterData) => ({
        id: chapter.id,
        name: chapter.name,
        sequential_chapter_number: chapter.sequential_chapter_number,
        isExpanded: false,
        medium_standard_subject: chapter.medium_standard_subject,
        topics: chapter.topics
          .map((topic: TopicData) => ({
            id: topic.id,
            name: topic.name,
            sequential_topic_number: topic.sequential_topic_number,
            chapter_id: topic.chapter_id,
          }))
          .sort(
            (a: TopicData, b: TopicData) => a.sequential_topic_number - b.sequential_topic_number,
          ),
      }))
      .sort(
        (a: ChapterData, b: ChapterData) =>
          a.sequential_chapter_number - b.sequential_chapter_number,
      )
  } catch (error) {
    console.error('Error fetching data:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load syllabus data',
      type: 'error',
    })
  } finally {
    isLoading.value = false

    if (selectedBoard.value && selectedMedium.value && selectedStandard.value && selectedSubject.value) {
      router.replace({
        query: boardSyllabusQueryString({
          board: selectedBoard.value.id,
          medium: selectedMedium.value.id,
          standard: selectedStandard.value.id,
          subject: selectedSubject.value.id,
          boardName: selectedBoard.value.name,
          mediumName: selectedMedium.value.instruction_medium,
          standardName: selectedStandard.value.name,
          subjectName: selectedSubject.value.name,
        }),
      })
    }
    
    // After data is loaded, reinitialize sortable
    // Using setTimeout to ensure DOM has updated
    setTimeout(() => {
      initializeSortable()
    }, 0)
  }
}

const initializeSortable = () => {
  // First, destroy any existing sortable instances
  const mainList = document.getElementById('sortable-list') as SortableElement
  mainList?._sortable?.destroy()
  
  for (const list of document.querySelectorAll('.sortable-list')) {
    const sortableList = list as SortableListElement
    sortableList._sortable?.destroy()
  }
  
  // Initialize main chapter list sortable
  if (mainList) {
    const chapterSortable = new Sortable(mainList, {
      animation: 150,
      handle: '.bi-grip-vertical',
      onEnd: (evt) => {
        void handleChapterReorder(evt); // Using void operator to ignore the promise
      },
    })
    
    // Store sortable instance reference on the DOM element
    mainList._sortable = chapterSortable
  }

  // Initialize topic lists sortable
  for (const list of document.querySelectorAll('.sortable-list')) {
    const sortableList = list as SortableListElement
    const topicSortable = new Sortable(list as HTMLElement, {
      animation: 150,
      handle: '.bi-grip-vertical',
      onEnd: (evt) => {
        void handleTopicReorder(evt); // Using void operator to ignore the promise
      },
    })
    
    // Store sortable instance reference on the DOM element
    sortableList._sortable = topicSortable
  }
}

const toggleQuickEdit = () => {
  isQuickEditMode.value = !isQuickEditMode.value
}

const toggleChapter = (chapterId: number) => {
  const chapter = chapters.value.find((c) => c.id === chapterId)
  if (chapter) {
    chapter.isExpanded = !chapter.isExpanded
  }
}

const navigateToAddChapter = () => {
  router.push({
    name: 'addChapter',
    query: boardSyllabusQueryString({
      board: selectedBoard.value?.id,
      medium: selectedMedium.value?.id,
      standard: selectedStandard.value?.id,
      subject: selectedSubject.value?.id,
      boardName: selectedBoard.value?.name,
      mediumName: selectedMedium.value?.instruction_medium,
      standardName: selectedStandard.value?.name,
      subjectName: selectedSubject.value?.name,
    }),
  })
}

const editChapter = (chapter: ChapterData) => {
  router.push({
    path: `/admin/syllabus/chapter/${chapter.id}/edit`,
    query: boardSyllabusQueryString({
      board: selectedBoard.value?.id,
      medium: selectedMedium.value?.id,
      standard: selectedStandard.value?.id,
      subject: selectedSubject.value?.id,
      boardName: selectedBoard.value?.name,
      mediumName: selectedMedium.value?.instruction_medium,
      standardName: selectedStandard.value?.name,
      subjectName: selectedSubject.value?.name,
    }),
  })
}

const showDeleteConfirmation = (chapter: ChapterData) => {
  selectedChapterForDelete.value = chapter
  const modal = new Modal(document.getElementById('deleteConfirmationModal')!)
  modal.show()
}

const deleteChapter = async () => {
  if (!selectedChapterForDelete.value) return

  try {
    await axiosInstance.delete(`/chapters/${selectedChapterForDelete.value.id}`)

    // Store the expanded states before fetching
    const expandedStates = new Map(
      chapters.value.map((chapter) => [chapter.id, chapter.isExpanded]),
    )

    // Fetch updated chapters to get the new sequential numbers
    await fetchData()

    // Restore the expanded states
    chapters.value = chapters.value.map((chapter) => ({
      ...chapter,
      isExpanded: expandedStates.get(chapter.id) ?? false,
    }))

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter deleted successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error deleting chapter:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to delete chapter',
      type: 'error',
    })
  }
}

const handleChapterReorder = async ({ item, newIndex }: Sortable.SortableEvent) => {
  try {
    if (newIndex === undefined) return

    // Get the chapter ID from the dragged item
    const chapterId = Number(item.dataset.chapterId ?? null)

    // Make API call to update only the dragged chapter's position
    await axiosInstance.put(`/chapters/reorder/${chapterId}`, {
      sequential_chapter_number: newIndex + 1
    })

    // Store the expanded states before fetching
    const expandedStates = new Map(
      chapters.value.map((chapter) => [chapter.id, chapter.isExpanded]),
    )

    // Fetch updated chapters to get the new order
    await fetchData()

    // Restore the expanded states
    chapters.value = chapters.value.map((chapter) => ({
      ...chapter,
      isExpanded: expandedStates.get(chapter.id) ?? false,
    }))

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter order updated successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error updating chapter order:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update chapter order',
      type: 'error',
    })
  }
}

const handleTopicReorder = async ({ item, newIndex }: Sortable.SortableEvent) => {
  try {
    if (newIndex === undefined) return

    // Get the parent chapter element and IDs
    const chapterElement = item.closest('.collapse')
    if (!chapterElement) return

    const chapterId = Number(chapterElement.id.replace('chapter-', ''))
    const topicId = Number(item.dataset.topicId ?? null)

    if (!topicId) {
      throw new Error('Failed to find topic ID')
    }

    // Make API call to update only the dragged topic's position
    await axiosInstance.put(`/topics/reorder/${topicId}/${chapterId}`, {
      sequential_topic_number: newIndex + 1
    })

    // Store the expanded states before fetching
    const expandedStates = new Map(
      chapters.value.map((chapter) => [chapter.id, chapter.isExpanded]),
    )

    // Fetch updated data to get the new order
    await fetchData()

    // Restore the expanded states
    chapters.value = chapters.value.map((chapter) => ({
      ...chapter,
      isExpanded: expandedStates.get(chapter.id) ?? false,
    }))

    toastStore.showToast({
      title: 'Success',
      message: 'Topic order updated successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error updating topic order:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update topic order',
      type: 'error',
    })
  }
}
</script>

<style scoped>
.draggable-item {
  cursor: grab;
}

.list-group-item {
  border: none;
  padding: 0;
}

.list-number {
  min-width: 3ch;
  text-align: right;
  margin-right: 1rem;
}

/* Remove the automatic list numbering styles */
ol.list-group {
  list-style: none;
  padding-left: 0;
  counter-reset: none;
}

ol.list-group > li::before {
  content: none;
}

ol.list-group ol > li::before {
  content: none;
}

/* Mobile styles */
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

  #quickEditButton,
  #addChapterButton {
    width: 100%;
  }
}

.toggle-card {
  cursor: pointer;
}

.toggle-icon {
  transition: transform 0.2s;
}

.bi-three-dots:hover,
.bi-pencil-square:hover,
.bi-trash3:hover {
  color: #0d6efd !important;
  cursor: pointer;
}
</style>
