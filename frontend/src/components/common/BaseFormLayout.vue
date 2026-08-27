<template>
  <div class="container mt-3">
    <div v-if="showHeader">
      <div class="row g-2 justify-content-end">
        <button class="btn btn-close" @click="onClose" aria-label="Close"></button>
      </div>
      <div class="row justify-content-center align-items-center my-3">
        <div class="col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase">
            {{ title }}
          </h4>
        </div>
      </div>
      <hr class="mb-3" />
    </div>

    <div id="form-container" class="row justify-content-center">
      <form 
        @submit.prevent="onSubmit" 
        @keydown.enter="handleEnterKey"
        novalidate
      >
        <div class="row g-3 justify-content-center">
          <!-- Form content goes here -->
          <slot></slot>
          
          <!-- Submit Button -->
          <div class="col-12 col-sm-10 col-md-8 mt-3">
            <div class="text-center">
              <button type="submit" class="btn btn-dark" :disabled="isSubmitting">
                <output v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></output>
                {{ submitButtonText }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  isSubmitting?: boolean
  submitButtonText?: string
  showHeader?: boolean
}>(), {
  isSubmitting: false,
  submitButtonText: 'Save',
  showHeader: true
})

const emit = defineEmits(['submit', 'close'])

const onSubmit = () => {
  console.log('BaseFormLayout: Form submitted, emitting submit event')
  emit('submit')
}

const onClose = () => {
  emit('close')
}

const handleEnterKey = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement
  
  // If Enter is pressed on the submit button, allow it to proceed
  if (target.type === 'submit') {
    return // Let the button handle the submit
  }
  
  // If Enter is pressed on any input or textarea, prevent form submission
  // to allow individual components to handle Enter key navigation
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    event.preventDefault()
    return
  }
  
  // For any other element, prevent default to avoid unwanted submissions
  event.preventDefault()
}
</script>

<style scoped>
/* Main container styles */
.container {
  min-height: 100%;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

/* Form styles */
form {
  width: 100%;
}

/* Button styles */
.btn-dark {
  min-width: 120px;
}

.btn-dark:hover:not(:disabled) {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Ensure consistent spacing */
hr {
  margin: 0;
  opacity: 0.15;
}

.row {
  --bs-gutter-x: 1.5rem;
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style> 