<template>
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
          <h3 class="text-left fw-bolder text-uppercase mb-2">Add New Chapter</h3>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <ChapterFormComponent @submit="saveChapter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/store/toast'
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

interface Chapter {
  id: number
  subject_id: number
  standard_id: number
  sequential_chapter_number: number
  name: string
}

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)

onMounted(async () => {
  await fetchData()
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

const saveChapter = async (formData: { chapterName: string; topics: string[] }) => {
  try {
    // First, get all existing chapters for this subject and standard to determine the next sequential number
    const chaptersResponse = await axiosInstance.get('/chapters', {
      params: {
        subject_id: route.query.subject,
        standard_id: route.query.standard
      }
    })
    const existingChapters: Chapter[] = chaptersResponse.data

    console.log('Existing chapters before creation:', existingChapters)

    // Calculate next sequential number
    let nextChapterNumber = 1; // Default to 1 for the first chapter

    if (existingChapters.length > 0) {
      // Get all existing sequential numbers
      const existingSequentialNumbers = existingChapters.map(ch => ch.sequential_chapter_number).sort((a, b) => a - b);
      console.log('Existing sequential numbers (sorted):', existingSequentialNumbers);

      // Find the first gap in the sequence, or use max + 1 if no gaps
      let foundGap = false;
      for (let i = 0; i < existingSequentialNumbers.length; i++) {
        // Check if the expected number at this position matches the actual number
        const expectedNumber = i + 1;
        if (existingSequentialNumbers[i] !== expectedNumber) {
          // Found a gap, use this number
          nextChapterNumber = expectedNumber;
          foundGap = true;
          console.log(`Found gap at position ${i}, using sequential number ${nextChapterNumber}`);
          break;
        }
      }

      // If no gaps found, use max + 1
      if (!foundGap) {
        nextChapterNumber = Math.max(...existingSequentialNumbers) + 1;
        console.log(`No gaps found, using max + 1: ${nextChapterNumber}`);
      }
    } else {
      console.log('No existing chapters found, using sequential number 1');
    }

    console.log('Final calculated next chapter number:', nextChapterNumber);

    // Prepare chapter data with the new API structure
    const chapterData = {
      subject_id: Number(route.query.subject),
      standard_id: Number(route.query.standard),
      sequential_chapter_number: nextChapterNumber,
      name: formData.chapterName,
    }

    console.log('Chapter data being sent to API:', chapterData)

    // Save chapter
    const chapterResponse = await axiosInstance.post('/chapters', chapterData)
    const savedChapter = chapterResponse.data

    console.log('API response after creating chapter:', savedChapter)

    // Check if the API returned a different sequential chapter number
    if (savedChapter.sequential_chapter_number === nextChapterNumber) {
      console.log('API respected our sequential chapter number:', nextChapterNumber);
    } else {
      console.warn('WARNING: API returned a different sequential chapter number than what was sent!');
      console.warn(`Sent: ${nextChapterNumber}, Received: ${savedChapter.sequential_chapter_number}`);
      console.warn('This suggests the backend API is overriding the sequential number we sent.');

      // Show a toast notification to alert the user
      toastStore.showToast({
        title: 'Warning',
        message: 'The chapter was created but with an unexpected chapter number. Please contact the development team.',
        type: 'warning',
      });
    }

    // Save topics with sequential numbers
    await Promise.all(
      formData.topics.map(async (topicName, index) => {
        const topicData = {
          chapter_id: savedChapter.id,
          sequential_topic_number: index + 1,
          name: topicName.trim(),
        }

        await axiosInstance.post('/topics', topicData)
      }),
    )

    toastStore.showToast({
      title: 'Success',
      message: 'Chapter and topics saved successfully',
      type: 'success',
    })

    // Navigate back to subject syllabus
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

    // After creating the chapter, check again to see what chapters exist
    const chaptersAfterResponse = await axiosInstance.get('/chapters', {
      params: {
        subject_id: route.query.subject,
        standard_id: route.query.standard
      }
    })
    const chaptersAfter = chaptersAfterResponse.data

    console.log('Chapters after creation:', chaptersAfter)
  } catch (error) {
    console.error('Error saving chapter:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to save chapter and topics',
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
