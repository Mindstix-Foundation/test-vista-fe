<template>
  <div class="container-fluid board-form-container">
    <BoardFormComponent :isEditMode="false" @submit="handleBoardSubmit" />
    <LoadingSpinner :show="isSubmitting" :showOverlay="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useToastStore } from '@/store/toast'
import axiosInstance from '@/config/axios'
import { logContainerDimensions } from '@/utils/debugLayout'

const router = useRouter()
const toastStore = useToastStore()
const isSubmitting = ref(false)

const logDimensions = () => logContainerDimensions('.board-form-container', 'AddBoard')

onMounted(() => {
  logDimensions()
  globalThis.addEventListener('resize', logDimensions)
})

onUnmounted(() => {
  globalThis.removeEventListener('resize', logDimensions)
})

interface ApiErrorResponse {
  message?: string | string[]
}

const handleApiError = (errorData: ApiErrorResponse | null, defaultMessage: string): string => {
  return Array.isArray(errorData?.message)
    ? errorData.message.join(', ')
    : errorData?.message ?? defaultMessage
}

const handleBoardSubmit = async (formData: any) => {
  isSubmitting.value = true;
  
  try {
    // Prepare data for the consolidated board-management endpoint
    const boardManagementData = {
      address: {
        street: formData.address.street,
        postal_code: formData.address.postal_code,
        city_id: formData.address.city_id
      },
      board: {
        name: formData.board.name,
        abbreviation: formData.board.abbreviation
      },
      instructionMediums: (formData.mediums || []).map((medium: any) => ({
        name: medium.name
      })),
      standards: (formData.standards || []).map((standard: any) => ({
        name: standard.name
      })),
      subjects: (formData.subjects || []).map((subject: any) => ({
        name: subject.name
      }))
    };

    // Make single API call to consolidated endpoint
    await axiosInstance.post('/board-management', boardManagementData);
    
    toastStore.showToast('Board created successfully!', 'success');
    router.push('/admin/board');
    
  } catch (error: any) {
    console.error('Error creating board:', error);
    
    if (error.response?.data?.message) {
      if (Array.isArray(error.response.data.message)) {
        for (const msg of error.response.data.message) {
          toastStore.showToast(msg, 'error');
        }
      } else {
        toastStore.showToast(error.response.data.message, 'error');
      }
    } else {
      toastStore.showToast('Failed to create board. Please try again.', 'error');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.board-form-container {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 2rem;
  -webkit-overflow-scrolling: touch;
}

/* Add styles for mobile devices */
@media screen and (max-width: 768px) {
  .board-form-container {
    height: 100%;
    overflow-y: scroll !important;
    position: relative;
    padding-bottom: 4rem; /* Increased padding for mobile */
  }
}
</style>
