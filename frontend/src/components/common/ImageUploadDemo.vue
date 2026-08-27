<template>
  <div class="image-upload-demo">
    <div class="container mt-4">
      <h2>Enhanced Image Upload Editor Demo</h2>
      <p class="text-muted">Test the improved image upload editor with question context and intuitive controls</p>
      
      <div class="demo-controls mb-4">
        <div class="row">
          <div class="col-md-6">
            <label class="form-label" for="demoQuestionText">Question Text:</label>
            <textarea 
              id="demoQuestionText"
              v-model="questionText" 
              class="form-control" 
              rows="3"
              placeholder="Enter your question text here..."
            ></textarea>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="demoQuestionNumber">Question Number:</label>
            <input 
              id="demoQuestionNumber"
              v-model.number="questionNumber" 
              type="number" 
              class="form-control" 
              min="1"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label" for="demoImageType">Image Type:</label>
            <select id="demoImageType" v-model="imageType" class="form-select">
              <option value="question">Question Image</option>
              <option value="option">Option Image</option>
            </select>
          </div>
        </div>
      </div>

      <div class="demo-buttons mb-4">
        <button 
          class="btn btn-primary me-2" 
          @click="openImageEditor"
        >
          <i class="bi bi-image"></i> Upload {{ imageType === 'question' ? 'Question' : 'Option' }} Image
        </button>
        
        <button 
          v-if="uploadedImage" 
          class="btn btn-outline-secondary" 
          @click="clearImage"
        >
          <i class="bi bi-trash"></i> Clear Image
        </button>
      </div>

      <!-- Uploaded Image Display -->
      <div v-if="uploadedImage" class="uploaded-image-section">
        <h4>Uploaded Image:</h4>
        <div class="image-result">
          <img :src="uploadedImage.url" alt="Uploaded preview" class="uploaded-image" />
          <div class="image-details">
            <p><strong>Dimensions:</strong> {{ uploadedImage.metadata.width }} × {{ uploadedImage.metadata.height }}px</p>
            <p><strong>File Size:</strong> {{ formatFileSize(uploadedImage.metadata.size) }}</p>
            <p><strong>Type:</strong> {{ uploadedImage.metadata.type }}</p>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
        {{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = ''"></button>
      </div>
      
      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
        {{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = ''"></button>
      </div>

      <!-- Features List -->
      <div class="features-section mt-5">
        <h4>New Features:</h4>
        <div class="row">
          <div class="col-md-6">
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <i class="bi bi-file-text text-primary"></i>
                <strong>Real Test Paper Preview:</strong> See your question text with image in actual A4 layout
              </li>
              <li class="list-group-item">
                <i class="bi bi-sliders text-success"></i>
                <strong>Flexible Size Range:</strong> Adjust image size from 10% to 100% with intuitive slider
              </li>
              <li class="list-group-item">
                <i class="bi bi-aspect-ratio text-info"></i>
                <strong>Proportional Scaling:</strong> Images scale with the A4 preview (50% scale)
              </li>
            </ul>
          </div>
          <div class="col-md-6">
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <i class="bi bi-cloud-arrow-up text-warning"></i>
                <strong>Local Storage First:</strong> Images stored locally until question is saved
              </li>
              <li class="list-group-item">
                <i class="bi bi-printer text-secondary"></i>
                <strong>Custom Dimensions:</strong> User-adjusted sizes preserved for final upload
              </li>
              <li class="list-group-item">
                <i class="bi bi-phone text-dark"></i>
                <strong>Mobile Friendly:</strong> Responsive design for all devices
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Upload Editor -->
    <ImageUploadEditor
      :isVisible="showImageEditor"
      :imageType="imageType"
      :questionText="questionText"
      :questionNumber="questionNumber"
      @close="closeImageEditor"
      @imageUploaded="handleImageUploaded"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageUploadEditor from './ImageUploadEditor.vue'
import { useImageUploadStore } from '@/stores/imageUpload'

// Demo state
const showImageEditor = ref(false)
const questionText = ref('Study the diagram below showing the water cycle process. The diagram illustrates how water moves through different stages including evaporation, condensation, precipitation, and collection. Based on this diagram, answer the following question about the natural water cycle.')
const questionNumber = ref(1)
const imageType = ref<'question' | 'option'>('question')
const uploadedImage = ref<any>(null)
const successMessage = ref('')
const errorMessage = ref('')

// Use the image upload store
const imageUploadStore = useImageUploadStore()

// Methods
const openImageEditor = () => {
  showImageEditor.value = true
}

const closeImageEditor = () => {
  showImageEditor.value = false
}

const handleImageUploaded = (imageData: any) => {
  uploadedImage.value = imageData
  
  // Store in Pinia store based on image type
  if (imageType.value === 'question') {
    imageUploadStore.setQuestionImage(imageData.file, imageData.metadata)
  } else {
    // For demo, use option index 0
    imageUploadStore.setOptionImage(0, imageData.file, imageData.metadata)
  }
  
  successMessage.value = `${imageType.value === 'question' ? 'Question' : 'Option'} image stored locally! It will be uploaded when you save the question.`
  errorMessage.value = ''
  
  // Clear success message after 5 seconds
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const handleError = (error: string) => {
  errorMessage.value = error
  successMessage.value = ''
}

const clearImage = () => {
  if (uploadedImage.value) {
    // Revoke blob URL to prevent memory leaks
    URL.revokeObjectURL(uploadedImage.value.url)
  }
  
  uploadedImage.value = null
  successMessage.value = ''
  errorMessage.value = ''
  
  // Clear from store
  if (imageType.value === 'question') {
    imageUploadStore.removeQuestionImage()
  } else {
    imageUploadStore.removeOptionImage(0)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.image-upload-demo {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
}

.demo-controls {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.demo-buttons {
  text-align: center;
}

.uploaded-image-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.image-result {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.uploaded-image {
  max-width: 300px;
  max-height: 200px;
  object-fit: contain;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.image-details {
  flex: 1;
}

.features-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.list-group-item {
  border: none;
  padding: 12px 0;
}

.list-group-item i {
  margin-right: 8px;
  width: 20px;
}

@media (max-width: 768px) {
  .image-result {
    flex-direction: column;
  }
  
  .uploaded-image {
    max-width: 100%;
  }
}
</style> 