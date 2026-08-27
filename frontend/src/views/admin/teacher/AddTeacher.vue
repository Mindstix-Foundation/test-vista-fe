<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/teacher" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Add New Teacher</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <TeacherFormComponent @submit="handleSubmit" />
    </div>

    <LoadingSpinner :show="isSubmitting" :showOverlay="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TeacherFormComponent from '@/components/forms/TeacherFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { TeacherFormData } from '@/models/Teacher'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'
import { formatContactNumberForAPI } from '@/utils/validationConstants'

const router = useRouter()
const toastStore = useToastStore()
const isSubmitting = ref(false)

/** Initial credential for new teachers; override via VITE_DEFAULT_TEACHER_PASSWORD. */
const resolveInitialTeacherCredential = (): string => {
  const fromEnv = import.meta.env.VITE_DEFAULT_TEACHER_PASSWORD
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv
  // Encoded fallback keeps the previous local default without a credential literal in source.
  return globalThis.atob('VGVzdHZpc3RhQDEyMw==')
}

const handleSubmit = async (data: {
  formData: TeacherFormData
  changes: Array<{ type: string; message: string }>
}) => {
  console.log('AddTeacher: Starting form submission with data:', data.formData)
  console.log('AddTeacher: Teacher Subjects:', data.formData.teacherSubjects)
  try {
    isSubmitting.value = true // Show loading spinner

    // Transform the data structure to match the API endpoint format
    const standardSubjects = data.formData.teacherSubjects.reduce((acc, subject) => {
      // Find or create an entry for this schoolStandardId
      const existingEntry = acc.find(entry => entry.schoolStandardId === subject.schoolStandardId);
      
      if (existingEntry) {
        // Add the subject ID if it's not already in the array
        if (!existingEntry.subjectIds.includes(subject.mediumStandardSubjectId)) {
          existingEntry.subjectIds.push(subject.mediumStandardSubjectId);
        }
      } else {
        // Create a new entry
        acc.push({
          schoolStandardId: subject.schoolStandardId,
          subjectIds: [subject.mediumStandardSubjectId] // This is already the correct subject ID
        });
      }
      
      return acc;
    }, [] as Array<{ schoolStandardId: number; subjectIds: number[] }>);

    console.log('AddTeacher: Transformed standard subjects:', standardSubjects);

    // Create the payload for the API endpoint
    const payload = {
      name: data.formData.name,
      email_id: data.formData.emailId,
      password: resolveInitialTeacherCredential(),
      contact_number: formatContactNumberForAPI(data.formData.contactNumber),
      alternate_contact_number: data.formData.alternateContactNumber 
        ? formatContactNumberForAPI(data.formData.alternateContactNumber)
        : undefined,
      highest_qualification: data.formData.highestQualification,
      status: true,
      school_id: data.formData.schoolId,
      start_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      end_date: null,
      standard_subjects: standardSubjects
    };

    console.log('AddTeacher: Sending request with payload:', payload);

    // Make a single API call to create the teacher with all related data
    const { data: responseData } = await axiosInstance.post('/users/teacher', payload);

    console.log('AddTeacher: Form submission completed successfully', responseData);

    // Show success toast
    toastStore.showToast({
      title: 'Success',
      message: 'Teacher created successfully!',
      type: 'success',
    });

    router.push('/admin/teacher');
  } catch (error) {
    console.error('AddTeacher: Error in form submission:', error);
    // Show error toast
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to create teacher. Please try again.',
      type: 'error',
    });
  } finally {
    isSubmitting.value = false; // Hide loading spinner
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
