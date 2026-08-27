<template>
  <div class="container-fluid school-form-container">
    <div class="row">
      <div class="col">
        <SchoolFormComponent :is-edit-mode="false" @submit="handleSchoolSubmit" />
      </div>
    </div>
    <LoadingSpinner :show="isSubmitting" :showOverlay="true" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SchoolFormComponent from '@/components/forms/SchoolFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { SchoolFormData } from '@/models/School'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'
import { formatContactNumberForAPI } from '@/utils/validationConstants'
import { logContainerDimensions } from '@/utils/debugLayout'
import { onMounted, onUnmounted, ref } from 'vue'

const router = useRouter()
const toastStore = useToastStore()
const isSubmitting = ref(false)

const logDimensions = () => logContainerDimensions('.school-form-container', 'AddSchool')

onMounted(() => {
  console.log('AddSchool component mounted - ready to receive submit events')
  logDimensions()
  globalThis.addEventListener('resize', logDimensions)
})

onUnmounted(() => {
  globalThis.removeEventListener('resize', logDimensions)
})

const handleSchoolSubmit = async (schoolData: SchoolFormData) => {
  console.log('handleSchoolSubmit received data:', schoolData)
  try {
    isSubmitting.value = true // Show loading spinner

    // Use the new unified upsert API endpoint
    const upsertPayload = {
      name: schoolData.name,
      board_id: schoolData.board_id,
      address: {
        street: schoolData.address.street,
        postal_code: schoolData.address.postal_code,
        city_id: schoolData.address.city_id,
      },
      principal_name: schoolData.principal_name,
      email: schoolData.email,
      contact_number: formatContactNumberForAPI(schoolData.contact_number),
      alternate_contact_number: schoolData.alternate_contact_number ? formatContactNumberForAPI(schoolData.alternate_contact_number) : null,
      instruction_medium_ids: schoolData.mediums,
      standard_ids: schoolData.standards,
    }

    const { data: createdSchool } = await axiosInstance.post('/schools/upsert', upsertPayload)
    console.log('School created successfully:', createdSchool)

    toastStore.showToast({
      title: 'Success',
      message: `School "${schoolData.name}" has been created successfully.`,
      type: 'success',
    })
    router.push('/admin/school')
  } catch (error) {
    console.error('Error creating school:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to create school. Please try again.',
      type: 'error',
    })
  } finally {
    isSubmitting.value = false // Hide loading spinner
  }
}
</script>

<style scoped>
.school-form-container {
  min-height: 100vh;
  height: 100%;
  overflow-y: scroll;
  padding-bottom: 2rem; /* Add padding at bottom */
  -webkit-overflow-scrolling: touch;
}

/* Add styles for mobile devices */
@media screen and (max-width: 768px) {
  .school-form-container {
    position: relative;
    overflow-y: scroll !important;
  }
}
</style>
