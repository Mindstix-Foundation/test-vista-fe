<template>
  <div class="container my-4">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title mb-0">Image Upload Editor Demo</h3>
            <p class="text-muted mb-0">Demonstration of the image upload and editing functionality</p>
          </div>
          
          <div class="card-body">
            <!-- Question Form Example -->
            <form @submit.prevent="handleSubmit">
              <div class="mb-4">
                <label for="questionText" class="form-label">Question Text</label>
                <textarea 
                  id="questionText" 
                  v-model="questionText" 
                  class="form-control" 
                  rows="4"
                  placeholder="Enter your question here..."
                  required
                ></textarea>
              </div>

              <!-- Question Image Section -->
              <fieldset class="mb-4 border-0 p-0">
                <legend class="form-label float-none w-auto">Question photo</legend>
                <div class="image-upload-section">
                  <div v-if="questionImage" class="current-image mb-3">
                    <div class="image-preview-card">
                      <img :src="questionImage.url" alt="Question preview" class="img-fluid" />
                      <div class="image-info">
                        <small class="text-muted">
                          {{ questionImage.metadata.width }} × {{ questionImage.metadata.height }}px | 
                          {{ formatFileSize(questionImage.metadata.size) }}
                        </small>
                      </div>
                      <div class="image-actions">
                        <button 
                          type="button" 
                          class="btn btn-outline-primary btn-sm"
                          @click="editQuestionImage"
                        >
                          <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-outline-danger btn-sm"
                          @click="removeQuestionImage"
                        >
                          <i class="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    v-else
                    type="button" 
                    class="btn btn-outline-primary"
                    @click="openImageUploader('question')"
                  >
                    <i class="bi bi-cloud-upload"></i> Upload Question Image
                  </button>
                </div>
              </fieldset>

              <!-- MCQ Options Example -->
              <fieldset class="mb-4 border-0 p-0">
                <legend class="form-label float-none w-auto">MCQ Options</legend>
                <div class="row g-3">
                  <div v-for="(option, index) in mcqOptions" :key="index" class="col-md-6">
                    <div class="option-container">
                      <div class="form-floating mb-2">
                        <input 
                          :id="`option${index}`"
                          v-model="option.text" 
                          type="text" 
                          class="form-control"
                          :placeholder="`Option ${String.fromCodePoint(65 + index)}`"
                        />
                        <label :for="`option${index}`">Option {{ String.fromCodePoint(65 + index) }}</label>
                      </div>
                      
                      <div class="form-check mb-2">
                        <input 
                          :id="`correct${index}`"
                          v-model="correctOption" 
                          :value="index"
                          type="radio" 
                          class="form-check-input"
                          name="correctOption"
                        />
                        <label :for="`correct${index}`" class="form-check-label">
                          Correct Answer
                        </label>
                      </div>

                      <!-- Option Image -->
                      <div class="option-image-section">
                        <div v-if="option.image" class="current-image mb-2">
                          <div class="image-preview-card small">
                            <img :src="option.image.url" alt="Option preview" class="img-fluid" />
                            <div class="image-actions">
                              <button 
                                type="button" 
                                class="btn btn-outline-primary btn-sm"
                                @click="editOptionImage(index)"
                              >
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button 
                                type="button" 
                                class="btn btn-outline-danger btn-sm"
                                @click="removeOptionImage(index)"
                              >
                                <i class="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          v-else
                          type="button" 
                          class="btn btn-outline-secondary btn-sm"
                          @click="openImageUploader('option', index)"
                        >
                          <i class="bi bi-image"></i> Add Image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>

              <!-- Submit Button -->
              <div class="text-center">
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                  <output v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></output>
                  {{ isSubmitting ? 'Saving...' : 'Save Question' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Uploaded Images Summary -->
        <div v-if="hasUploadedImages" class="card mt-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Uploaded Images Summary</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div v-if="questionImage" class="col-md-4">
                <div class="uploaded-image-card">
                  <img :src="questionImage.url" alt="Question" class="img-fluid" />
                  <div class="p-2">
                    <h6 class="mb-1">Question Image</h6>
                    <small class="text-muted">ID: {{ questionImage.id }}</small>
                  </div>
                </div>
              </div>
              
              <div 
                v-for="(option, index) in mcqOptions.filter(opt => opt.image)" 
                :key="`uploaded-${index}`" 
                class="col-md-4"
              >
                <div class="uploaded-image-card">
                  <img :src="option.image!.url" alt="Option" class="img-fluid" />
                  <div class="p-2">
                    <h6 class="mb-1">Option {{ String.fromCodePoint(65 + index) }}</h6>
                    <small class="text-muted">ID: {{ option.image!.id }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Upload Editor Modal -->
    <ImageUploadEditor
      :isVisible="showImageUploader"
      :existingImageUrl="editingImageUrl"
      :imageType="currentUploadContext?.type || 'question'"
      :questionText="questionText"
      :questionNumber="1"
      @close="closeImageUploader"
      @imageUploaded="handleImageUploaded"
      @error="handleImageError"
    />

    <!-- Size Constraints Info Card -->
    <div class="card mt-4">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="bi bi-info-circle text-info me-2"></i>
          Image Size Guidelines for Test Papers
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="guideline-card question-guideline">
              <div class="guideline-header">
                <i class="bi bi-file-text text-primary"></i>
                <h6>Question Images</h6>
              </div>
              <div class="guideline-content">
                <p><strong>Maximum Size:</strong> 186mm (700px)</p>
                <p class="text-muted small mb-0">
                  Suitable for diagrams, charts, and visual elements that accompany question text.
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="guideline-card option-guideline">
              <div class="guideline-header">
                <i class="bi bi-list-ul text-success"></i>
                <h6>Option Images</h6>
              </div>
              <div class="guideline-content">
                <p><strong>Maximum Size:</strong> 91mm (342px)</p>
                <p class="text-muted small mb-0">
                  Perfect for small icons, symbols, or compact visual options in MCQ questions.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3 p-3 bg-light rounded">
          <small class="text-muted">
            <i class="bi bi-lightbulb text-warning me-1"></i>
            <strong>Tip:</strong> These size limits ensure your images fit perfectly within the A4 test paper layout 
            while maintaining proper margins and readability.
          </small>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast show"
        role="alert"
      >
        <div class="toast-header">
          <i :class="getToastIcon(toast.type)" class="me-2"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button 
            type="button" 
            class="btn-close" 
            @click="removeToast(toast.id)"
          ></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ImageUploadEditor from '@/components/common/ImageUploadEditor.vue'

// Define component name
defineOptions({
  name: 'ImageUploadDemo'
})

// Types
interface UploadedImage {
  id: number
  url: string
  metadata: {
    width: number
    height: number
    size: number
    type: string
  }
}

interface MCQOption {
  text: string
  image?: UploadedImage
}

interface Toast {
  id: number
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

// Reactive data
const questionText = ref('Study the diagram below showing the water cycle process. The diagram illustrates how water moves through different stages including evaporation, condensation, precipitation, and collection. Based on this diagram, answer the following question about the natural water cycle.')
const questionImage = ref<UploadedImage | null>(null)
const mcqOptions = ref<MCQOption[]>([
  { text: '' },
  { text: '' },
  { text: '' },
  { text: '' }
])
const correctOption = ref<number | null>(null)
const isSubmitting = ref(false)

// Image uploader state
const showImageUploader = ref(false)
const currentUploadContext = ref<{ type: 'question' | 'option', index?: number } | null>(null)
const editingImageUrl = ref('')

// Toast notifications
const toasts = ref<Toast[]>([])
let toastIdCounter = 0

// Computed properties
const hasUploadedImages = computed(() => {
  return questionImage.value || mcqOptions.value.some(option => option.image)
})

// Methods
const openImageUploader = (type: 'question' | 'option', index?: number) => {
  currentUploadContext.value = { type, index }
  editingImageUrl.value = ''
  showImageUploader.value = true
}

const editQuestionImage = () => {
  currentUploadContext.value = { type: 'question' }
  editingImageUrl.value = questionImage.value?.url || ''
  showImageUploader.value = true
}

const editOptionImage = (index: number) => {
  currentUploadContext.value = { type: 'option', index }
  editingImageUrl.value = mcqOptions.value[index].image?.url || ''
  showImageUploader.value = true
}

const closeImageUploader = () => {
  showImageUploader.value = false
  currentUploadContext.value = null
  editingImageUrl.value = ''
}

const handleImageUploaded = (imageData: UploadedImage) => {
  if (!currentUploadContext.value) return

  const { type, index } = currentUploadContext.value

  if (type === 'question') {
    questionImage.value = imageData
    showToast('Success', 'Question image uploaded successfully!', 'success')
  } else if (type === 'option' && index !== undefined) {
    mcqOptions.value[index].image = imageData
    showToast('Success', `Option ${String.fromCodePoint(65 + index)} image uploaded successfully!`, 'success')
  }

  closeImageUploader()
}

const handleImageError = (message: string) => {
  showToast('Upload Error', message, 'error')
}

const removeQuestionImage = () => {
  questionImage.value = null
  showToast('Info', 'Question image removed', 'info')
}

const removeOptionImage = (index: number) => {
  mcqOptions.value[index].image = undefined
  showToast('Info', `Option ${String.fromCodePoint(65 + index)} image removed`, 'info')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create submission data
    const submissionData = {
      questionText: questionText.value,
      questionImageId: questionImage.value?.id,
      options: mcqOptions.value.map((option, index) => ({
        text: option.text,
        imageId: option.image?.id,
        isCorrect: correctOption.value === index
      }))
    }
    
    console.log('Submission data:', submissionData)
    showToast('Success', 'Question saved successfully!', 'success')
    
    // Reset form
    resetForm()
  } catch (error) {
    console.error(error)
    showToast('Error', 'Failed to save question. Please try again.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  questionText.value = ''
  questionImage.value = null
  mcqOptions.value = [
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' }
  ]
  correctOption.value = null
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Toast methods
const showToast = (title: string, message: string, type: Toast['type']) => {
  const toast: Toast = {
    id: ++toastIdCounter,
    title,
    message,
    type
  }
  
  toasts.value.push(toast)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 5000)
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const getToastIcon = (type: Toast['type']): string => {
  const icons = {
    success: 'bi bi-check-circle-fill text-success',
    error: 'bi bi-exclamation-triangle-fill text-danger',
    warning: 'bi bi-exclamation-triangle-fill text-warning',
    info: 'bi bi-info-circle-fill text-info'
  }
  return icons[type]
}
</script>

<style scoped>
.image-upload-section {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background-color: #f8f9fa;
}

.image-preview-card {
  position: relative;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.image-preview-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-preview-card.small img {
  height: 120px;
}

.image-info {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.option-container {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  background-color: #f8f9fa;
}

.option-image-section {
  margin-top: 12px;
}

.uploaded-image-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.uploaded-image-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.guideline-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  background: white;
  transition: box-shadow 0.2s ease;
}

.guideline-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.question-guideline {
  border-left: 4px solid #007bff;
}

.option-guideline {
  border-left: 4px solid #28a745;
}

.guideline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.guideline-header i {
  font-size: 1.2rem;
}

.guideline-header h6 {
  margin: 0;
  font-weight: 600;
}

.guideline-content p {
  margin-bottom: 8px;
}

.guideline-content p:last-child {
  margin-bottom: 0;
}

.toast-container .toast {
  margin-bottom: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .image-preview-card img {
    height: 150px;
  }
  
  .image-preview-card.small img {
    height: 100px;
  }
  
  .uploaded-image-card img {
    height: 120px;
  }
}
</style> 