<template>
  <div>
    <AppBreadcrumb />
    <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link
          class="btn btn-close"
          :to="{
            name: 'subjectSyllabus',
            params: { id: route.query.subject as string },
            query: {
              board: route.query.board,
              medium: route.query.medium,
              standard: route.query.standard,
            },
          }"
          aria-label="Close"
        />
      </div>
      <div class="row justify-content-center align-items-center my-2">
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
        <div class="col col-12 col-sm-5 text-end align-self-end">
          <h3 class="text-left fw-bolder text-uppercase mb-2">Edit Chapter</h3>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <ChapterFormComponent
        v-if="chapterData"
        :initial-data="chapterData"
        @submit="updateChapter"
      />
      <div v-else class="text-center">
        <output
          class="spinner-border"
        >
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/store/toast'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'
import ChapterFormComponent from '@/components/forms/ChapterFormComponent.vue'
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
  chapterName: string
  topics: string[]
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)
const chapterData = ref<ChapterData | null>(null)

onMounted(async () => {
  await Promise.all([fetchData(), fetchChapterData()])
})

const fetchData = async () => {
  try {
    // Fetch board details
    const boardResponse = await axiosInstance.get(`/boards/${route.query.board}`)
    selectedBoard.value = boardResponse.data

    // Fetch medium details
    const mediumResponse = await axiosInstance.get(`/instruction-mediums/${route.query.medium}`)
    selectedMedium.value = mediumResponse.data

    // Fetch standard details
    const standardResponse = await axiosInstance.get(`/standards/${route.query.standard}`)
    selectedStandard.value = standardResponse.data

    // Fetch subject details
    const subjectResponse = await axiosInstance.get(`/subjects/${route.query.subject}`)
    selectedSubject.value = subjectResponse.data
    router.replace({
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
  } catch (error) {
    console.error('Error fetching data:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load data',
      type: 'error',
    })
  }
}

const fetchChapterData = async () => {
  try {
    const chapterId = route.params.id
    const response = await axiosInstance.get(`/chapters/${chapterId}`)
    const data = response.data

    // Transform the data to match the form component's expected format
    chapterData.value = {
      chapterName: data.name,
      topics: data.topics.map((topic: { name: string }) => topic.name),
    }
  } catch (error) {
    console.error('Error fetching chapter data:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load chapter data',
      type: 'error',
    })
    router.push({
      name: 'subjectSyllabus',
      params: { id: route.query.subject as string },
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
}

const updateChapter = async (formData: ChapterData) => {
  try {
    const chapterId = route.params.id

    // Update chapter name
    await axiosInstance.put(`/chapters/${chapterId}`, {
      name: formData.chapterName,
    })

    // Get existing topics to compare
    const existingTopicsResponse = await axiosInstance.get(`/topics?chapterId=${chapterId}`)
    const existingTopics = existingTopicsResponse.data

    // Update or create topics
    await Promise.all(
      formData.topics.map(async (topicName, index) => {
        const existingTopic = existingTopics[index]
        const topicData = {
          name: topicName.trim(),
          sequential_topic_number: index + 1,
        }

        if (existingTopic) {
          // Update existing topic
          await axiosInstance.put(`/topics/${existingTopic.id}`, topicData)
        } else {
          // Create new topic
          await axiosInstance.post('/topics', {
            ...topicData,
            chapter_id: Number.parseInt(chapterId as string, 10),
          })
        }
      }),
    )

    // Delete any extra existing topics
    if (existingTopics.length > formData.topics.length) {
      await Promise.all(
        existingTopics.slice(formData.topics.length).map(async (topic: { id: number }) => {
          await axiosInstance.delete(`/topics/${topic.id}`)
        }),
      )
    }

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter updated successfully',
      type: 'success',
    })

    router.push({
      name: 'subjectSyllabus',
      params: { id: route.query.subject as string },
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
  } catch (error) {
    console.error('Error updating chapter:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update chapter',
      type: 'error',
    })
  }
}
</script>

<style scoped>
@media (max-width: 576px) {
  .container {
    padding: 0 1rem;
  }
}
</style>
