<template>
  <div class="container my-4">
    <!-- Header Section -->
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <div class="col-auto">
          <button type="button" class="btn-close" aria-label="Close" @click="exitPage"></button>
        </div>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col-12 col-sm-10">
          <p class="text-muted text-start fs-5 mb-1">
            <span class="d-inline-block">{{ boardName }}</span>
            <span class="d-inline-block ms-1">| {{ mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark mb-2">
            Standard {{ standardName }}
            <span class="d-block text-start text-secondary mt-1">{{ subjectName }} Syllabus</span>
          </h4>
        </div>
      </div>
      <hr />
    </div>

    <!-- Main Content -->
    <div class="container">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="text-center my-5">
        <output class="spinner-border text-primary">
          <span class="visually-hidden">Loading...</span>
        </output>
        <p class="mt-2">Loading syllabus chapters...</p>
      </div>

      <!-- Error message -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <p>{{ error }}</p>
        <button class="btn btn-outline-primary mt-2" @click="retryFetchChapters">
          <i class="bi bi-arrow-clockwise me-1"></i> Retry
        </button>
      </div>

      <!-- No chapters found message -->
      <div v-else-if="syllabusChapters.length === 0" class="alert alert-info" role="alert">
        <p>No chapters found for this syllabus.</p>
        <p class="small text-muted">If you believe this is an error, please contact your administrator.</p>
      </div>

      <!-- Chapters display -->
      <div v-else class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8">
          <ol id="chapters-list" class="list-group borderless">
            <li
              v-for="chapter in syllabusChapters"
              :key="chapter.id"
              :data-chapter-id="chapter.id"
              class="list-group-item list-group-item-action d-flex justify-content-between py-1 fs-4 chapter-item"
            >
              <div class="container pe-0">
                <div class="row">
                  <span class="toggle-card pe-0" @click="toggleChapter(chapter)">
                    <span class="chapter-title">
                      {{ chapter.sequential_chapter_number }}. {{ chapter.name }}
                      <i
                        class="bi fs-6 text-secondary toggle-icon ms-2"
                        :class="chapter.isExpanded ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"
                      ></i>
                    </span>
                  </span>
                </div>
                <div class="row">
                  <div
                    :id="'chapter-' + chapter.id"
                    class="collapse"
                    :class="{ show: chapter.isExpanded }"
                  >
                    <!-- No Topics Message -->
                    <div v-if="!chapter.topics || chapter.topics.length === 0" class="text-center py-2">
                      <p class="text-muted mb-0">No topics available for this chapter.</p>
                    </div>

                    <ol v-else class="list-group borderless topic-list">
                      <li
                        v-for="(topic, index) in sortTopics(chapter.topics)"
                        :key="topic.id"
                        :data-topic-id="topic.id"
                        class="list-group-item list-group-item-action py-2 fs-5 topic-item"
                        :class="{ 'topic-visible': topic.isVisible }"
                      >
                        <div class="ms-0">
                          <span>{{ chapter.sequential_chapter_number }}.{{ topic.sequential_topic_number }}. {{ topic.name }}</span>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
    
    <button id="backToTop" class="btn btn-dark rounded-circle" @click="scrollToTop">
      <i class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosInstance from '@/config/axios';

const route = useRoute();
const router = useRouter();

// Get parameters from route query
const boardName = ref(decodeURIComponent(route.query.board as string || 'Maharashtra State Board'));
const mediumName = ref(decodeURIComponent(route.query.medium as string || 'English Medium'));
const standardName = ref(decodeURIComponent(route.query.standard as string || '10'));
const subjectName = ref(decodeURIComponent(route.query.subject as string || 'Mathematics-1'));

// Get IDs from route query for API calls
const boardId = ref(route.query.boardId as string || '');
const mediumId = ref(route.query.mediumId as string || '');
const standardId = ref(route.query.standardId as string || '');
const subjectId = ref(route.query.subjectId as string || '');

// State variables
const syllabusChapters = ref<Chapter[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Define interfaces for data types
interface Topic {
  id: number;
  chapter_id: number;
  sequential_topic_number: number;
  name: string;
  created_at: string;
  updated_at: string;
  isVisible?: boolean;
}

interface Chapter {
  id: number;
  subject_id: number;
  standard_id: number;
  sequential_chapter_number: number;
  name: string;
  created_at: string;
  updated_at: string;
  isExpanded?: boolean;
  subject: {
    id: number;
    board_id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  standard: {
    id: number;
    board_id: number;
    name: string;
    sequence_number: number;
    created_at: string;
    updated_at: string;
  };
  topics: Topic[];
}

// Sort topics by sequential_topic_number
const sortTopics = (topics: Topic[]): Topic[] => {
  if (!topics || topics.length === 0) {
    return [];
  }
  
  return [...topics].sort((a, b) => a.sequential_topic_number - b.sequential_topic_number);
};

// Toggle chapter expansion with animation handling
const toggleChapter = async (chapter: Chapter) => {
  if (chapter.isExpanded) {
    // If chapter is currently expanded, animate topics out before collapsing
    const sortedTopics = sortTopics(chapter.topics);
    
    // Animate topics out in reverse order (last to first)
    for (let i = sortedTopics.length - 1; i >= 0; i--) {
      sortedTopics[i].isVisible = false;
      await new Promise(resolve => setTimeout(resolve, 40)); // Shorter delay for closing
    }
    
    // Wait for animations to finish
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Finally collapse the chapter
    chapter.isExpanded = false;
  } else {
    // Expand the chapter first
    chapter.isExpanded = true;
    
    // Reset animation state of all topics
    for (const topic of chapter.topics) {
      topic.isVisible = false;
    }
    
    // Wait for DOM update
    await nextTick();
    
    // Animate each topic with staggered timing
    const sortedTopics = sortTopics(chapter.topics);
    for (let i = 0; i < sortedTopics.length; i++) {
      setTimeout(() => {
        sortedTopics[i].isVisible = true;
      }, i * 80);
    }
  }
};

// Handle exiting the page
const exitPage = () => {
  router.back();
};

// Function to retry fetching chapters
const retryFetchChapters = () => {
  const { subjectId, standardId, mediumId } = getEntityIds();
  if (subjectId && standardId) {
    fetchChapters(subjectId, standardId, mediumId);
  }
};

// Fetch chapters from API
const fetchChapters = async (subjectId: number, standardId: number, mediumId?: number) => {
  if (!subjectId || !standardId) {
    error.value = 'Missing required parameters to load syllabus.';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    let url = `/chapters?subjectId=${subjectId}&standardId=${standardId}`;
    if (mediumId) {
      url += `&mediumId=${mediumId}`;
    }

    const response = await axiosInstance.get(url);
    
    if (response.data && Array.isArray(response.data)) {
      // Add isExpanded property to each chapter and isVisible to topics
      syllabusChapters.value = response.data.map((chapter: Chapter) => ({
        ...chapter,
        isExpanded: false,
        topics: chapter.topics.map(topic => ({
          ...topic,
          isVisible: false
        }))
      }));
      
      if (syllabusChapters.value.length === 0) {
        console.log('No chapters found for this syllabus');
      }
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (err: any) {
    console.error('Error fetching chapters:', err);
    error.value = err.response?.data?.message || 
                 'Failed to load syllabus chapters. Please try again later.';
    syllabusChapters.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Scroll to top functionality
const scrollToTop = () => {
  globalThis.scrollTo({ top: 0, behavior: 'smooth' });
};

// Show/hide back to top button based on scroll position
const handleScroll = () => {
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }
  }
};

// Get entity IDs from query parameters
const getEntityIds = () => {
  // Use the IDs from the query parameters
  return { 
    subjectId: Number.parseInt(subjectId.value) || 0, 
    standardId: Number.parseInt(standardId.value) || 0,
    mediumId: Number.parseInt(mediumId.value) || undefined
  };
};

// Setup and cleanup scroll event listener
onMounted(() => {
  globalThis.addEventListener('scroll', handleScroll);
  // Hide button initially
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    backToTopButton.style.display = "none";
  }
  
  // Fetch chapters when component mounts
  const { subjectId, standardId, mediumId } = getEntityIds();
  
  if (subjectId && standardId) {
    fetchChapters(subjectId, standardId, mediumId);
  } else {
    error.value = 'Missing required parameters to load syllabus. Please go back and try again.';
  }
});

onUnmounted(() => {
  globalThis.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Button styling - matching SyllabusDashboard */
.btn-dark {
  transition: all 0.3s ease;
}

.btn-dark:hover {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Custom borderless list-group */
.borderless {
  border: none !important;
}

.borderless .list-group-item {
  border: none !important;
  border-radius: 0 !important;
  margin-bottom: 0 !important;
}

/* List styling */
.list-group-item {
  border: none;
  padding: 0;
  background-color: transparent;
  transition: all 0.2s ease;
  margin-bottom: 0;
}

/* Hover effects for list items */
.list-group-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.list-group {
  border-radius: 0;
  box-shadow: none;
  list-style: none;
  padding-left: 0;
  counter-reset: none;
}

/* Remove automatic list numbering styles */
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

/* Toggle chapter styling */
.toggle-card {
  cursor: pointer;
  width: 100%;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.toggle-card:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.toggle-icon {
  transition: transform 0.3s;
  display: inline-block;
  vertical-align: middle;
}

/* Topic animation styling */
.topic-list {
  margin-top: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid rgba(0,0,0,.1);
}

/* Topic item styling with font sizes similar to TeacherProfile.vue */
.topic-item {
  transform-origin: top center;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  pointer-events: none;
  padding: 0.5rem 0 !important;
  margin-bottom: 0;
}

.topic-item.topic-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Override Bootstrap collapse behavior for smoother transitions */
.collapse {
  transition: height 0.5s cubic-bezier(0.19, 1, 0.22, 1) !important;
  display: block !important; 
  overflow: hidden !important;
  will-change: height;
}

.collapse:not(.show) {
  height: 0 !important;
}

/* Topic item hover effect */
.list-group-item.list-group-item-action.py-2.fs-5:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Back to top button */
#backToTop {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: none;
  z-index: 1000;
  width: 40px;
  height: 40px;
  padding: 8px;
  background-color: #343a40;
  border-color: #343a40;
  transition: all 0.3s ease;
}

#backToTop:hover {
  background-color: #23272b;
  border-color: #23272b;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Additional style to reduce spacing between chapters */
#chapters-list > li {
  margin-bottom: 0 !important;
  padding: 0 !important;
}

/* Responsive styles for better compatibility across screen sizes */
@media (max-width: 768px) {
  /* Font size adjustments to match TeacherProfile.vue */
  .fs-4 {
    font-size: 1rem !important;
  }
  
  .fs-5 {
    font-size: 0.9rem !important;
  }
  
  h4 {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
  }
  
  /* Improve header spacing */
  .container.mb-3 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  p.text-muted {
    font-size: 0.95rem !important;
  }
  
  /* Adjust chapter and topic spacing */
  .toggle-card {
    padding: 0.4rem 0;
  }
  
  /* Maintain topic item visibility */
  .topic-item {
    padding: 0.4rem 0 !important;
    margin-bottom: 0;
  }
  
  /* Better back-to-top button positioning */
  #backToTop {
    bottom: 30px;
    right: 15px;
  }
}

@media (max-width: 576px) {
  /* Phone-specific adjustments to match TeacherProfile.vue */
  .fs-4 {
    font-size: 1.15rem !important;
  }
  
  .fs-5 {
    font-size: 1.05rem !important;
  }
  
  h4 {
    font-size: 1.25rem !important;
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }
  
  p.text-muted {
    font-size: 0.95rem !important;
  }
  
  /* Improve spacing and readability */
  .container.mb-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  /* Reduce chapter item padding for better space utilization */
  .toggle-card {
    padding: 0.35rem 0;
    font-size: 1.1rem !important;
  }
  
  /* Adjust topic list indentation */
  .topic-list {
    margin-top: 0.35rem;
    
  }
  
  /* Ensure topic text is readable on mobile */
  .topic-item {
    font-size: 1.05rem !important;
    /* padding-left removed as requested */
    line-height: 1.4 !important;
    padding: 0.35rem 0 !important;
    margin-bottom: 0;
  }
  
  /* Make sure expanded items are clearly visible */
  .topic-item.topic-visible {
    transform: translateY(0);
  }
  
  /* Smaller back to top button */
  #backToTop {
    width: 35px;
    height: 35px;
    padding: 6px;
    bottom: 20px;
    right: 12px;
  }
}

/* Chapter specific styling */
.chapter-item {
  transition: background-color 0.15s ease-in-out;
}

.chapter-title {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.4;
}
</style> 