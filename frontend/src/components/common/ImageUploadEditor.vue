<template>
  <div class="image-upload-editor-overlay" v-if="isVisible" @click="closeModal">
    <div class="image-upload-editor-modal" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Image Upload & Editor</h3>
        <button class="btn-close" @click="closeModal" aria-label="Close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- File Upload Section -->
        <div v-if="!selectedImage" class="upload-section">
          <div class="upload-dropzone" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              class="file-input"
              id="imageUpload"
            />
            <label for="imageUpload" class="upload-label">
              <i class="bi bi-cloud-upload upload-icon"></i>
              <p class="upload-text">
                <strong>Click to upload</strong> or drag and drop<br />
                <small>PNG, JPG, JPEG, WebP (Max 5MB)</small>
              </p>
            </label>
          </div>
        </div>

        <!-- Image Editor Section -->
        <div v-else class="editor-section">
          <div class="editor-toolbar">
            <div class="toolbar-group size-controls">
              <label class="size-label" for="imageSizeSlider">
                <i class="bi bi-arrows-angle-expand"></i>
                Image Size: {{ imageScale }}%
              </label>
              <div class="size-slider-container">
                <input 
                  id="imageSizeSlider"
                  type="range" 
                  min="10" 
                  max="100" 
                  :value="imageScale" 
                  @input="onScaleChange"
                  :disabled="cropMode"
                  class="size-slider"
                />
                <div class="slider-labels">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div class="size-info">
                Print size: {{ actualPrintWidth }} × {{ actualPrintHeight }}px
              </div>
            </div>
            
            <div class="toolbar-group">
              <button class="btn btn-outline-primary btn-sm" @click="toggleCropMode" :class="{ active: cropMode }">
                <i class="bi bi-crop"></i> {{ cropMode ? 'Cancel Crop' : 'Crop' }}
              </button>
              <button v-if="cropMode" class="btn btn-success btn-sm" @click="applyCrop">
                <i class="bi bi-check"></i> Apply Crop
              </button>
              <button v-if="!cropMode" class="btn btn-outline-secondary btn-sm" @click="resetImage">
                <i class="bi bi-arrow-clockwise"></i> Reset
              </button>
            </div>

            <div class="toolbar-group">
              <button class="btn btn-outline-danger btn-sm" @click="removeImage">
                <i class="bi bi-trash"></i> Remove
              </button>
            </div>
          </div>

          <!-- Size Constraints Info -->
          <div class="size-constraints-info">
            <div class="constraint-item">
              <i class="bi bi-info-circle text-info"></i>
              <strong>{{ imageType === 'question' ? 'Question' : 'Option' }} Image:</strong> 
              Max {{ maxImageSizeMM }}mm for optimal test paper layout
            </div>
          </div>

          <!-- A4 Page Preview -->
          <div class="a4-page-container">
            <div class="a4-page" ref="a4Page">
              <!-- A4 Page margins visualization -->
              <div class="a4-margins">
                <div class="margin-indicator top-margin">10mm margin</div>
                <div class="margin-indicator left-margin">10mm</div>
                <div class="margin-indicator right-margin">10mm</div>
                <div class="margin-indicator bottom-margin">10mm margin</div>
              </div>
              
              <!-- Content area within margins -->
              <div class="a4-content-area">
                <!-- Test Paper Content Preview -->
                <div class="test-paper-content">
                  <!-- Question Text Display -->
                  <div v-if="questionText" class="question-text-display">
                    <span class="question-number">{{ questionNumber }}.</span>
                    <span class="question-content">{{ questionText }}</span>
                  </div>
                  
                  <!-- Image Container -->
                  <div class="image-container" :style="imageContainerStyle">
                    <img
                      v-if="!cropMode"
                      :src="imagePreview"
                      :style="imageStyle"
                      class="preview-image"
                      ref="previewImage"
                      alt="Question preview"
                      @load="onImageLoad"
                    />
                    <div v-else class="crop-container">
                      <img
                        :src="imagePreview"
                        ref="cropImage"
                        class="crop-image"
                        alt="Crop preview"
                      />
                    </div>
                  </div>
                  
                  <!-- MCQ Options for question images -->
                  <div v-if="imageType === 'question' && questionType === 'Multiple Choice Question (MCQ)' && options && options.length > 0" class="options-display">
                    <div v-for="(option, index) in options" :key="index" class="option-item" v-show="option.trim() !== ''">
                      {{ String.fromCharCode(65 + index) }}) {{ option }}
                    </div>
                  </div>
                  
                  <!-- Generic options for non-MCQ question types -->
                  <div v-else-if="imageType === 'question' && questionText && !['Fill in the Blanks', 'True or False', 'Match the Pairs'].includes(questionType)" class="options-placeholder">
                    <div class="option-text">{{ getQuestionTypeInstruction() }}</div>
                  </div>
                  
                  <!-- Option context for option images -->
                  <div v-if="imageType === 'option' && questionText" class="option-context">
                    <div class="option-label">{{ getOptionLabel() }}) {{ getOptionText() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Image Info -->
          <div class="image-info">
            <div class="info-item">
              <strong>Original:</strong> {{ imageInfo.width }} × {{ imageInfo.height }}px
            </div>
            <div class="info-item">
              <strong>Preview:</strong> {{ imageWidth }} × {{ imageHeight }}px (50% scale)
            </div>
            <div class="info-item">
              <strong>Print Size:</strong> {{ actualPrintWidth }} × {{ actualPrintHeight }}px
            </div>
            <div class="info-item">
              <strong>File Size:</strong> {{ formatFileSize(imageInfo.size) }}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        <button 
          v-if="selectedImage" 
          class="btn btn-primary" 
          @click="saveImage"
          :disabled="isUploading"
        >
          <output v-if="isUploading" class="spinner-border spinner-border-sm me-2"></output>
          {{ isUploading ? 'Processing...' : 'Save Image' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import Cropper from 'cropperjs'
import '@/assets/cropper.css'

// Props
interface Props {
  isVisible: boolean
  existingImageUrl?: string
  imageType?: 'question' | 'option' // Add image type to determine max size
  questionText?: string // Add question text to show context
  questionNumber?: number // Add question number for display
  questionType?: string // Add question type to determine display format
  options?: string[] // Add MCQ options for display
  optionIndex?: number // Add option index for option images
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  existingImageUrl: '',
  imageType: 'question',
  questionText: '',
  questionNumber: 1,
  questionType: '',
  options: () => [],
  optionIndex: -1
})

// Emits
const emit = defineEmits<{
  close: []
  cancelled: []
  imageUploaded: [imageData: {
    id: string
    file: File
    url: string
    metadata: {
      width: number
      height: number
      size: number
      type: string
    }
  }]
  error: [message: string]
}>()

// Reactive data
const fileInput = ref<HTMLInputElement>()
const previewImage = ref<HTMLImageElement>()
const cropImage = ref<HTMLImageElement>()
const a4Page = ref<HTMLDivElement>()
const selectedImage = ref<File | null>(null)
const imagePreview = ref<string>('')
const cropMode = ref(false)
const isUploading = ref(false)
const cropper = ref<Cropper | null>(null)

const imageInfo = ref({
  width: 0,
  height: 0,
  size: 0,
  type: ''
})

// A4 dimensions in pixels (at 96 DPI)
const A4_WIDTH = 794 // 210mm at 96 DPI
const A4_HEIGHT = 1123 // 297mm at 96 DPI

// Test paper layout constraints (in pixels at 96 DPI)
const QUESTION_MAX_SIZE = 700 // 186mm ≈ 700px at 96 DPI (190mm - 4mm margin)
const OPTION_MAX_SIZE = 342 // 91mm ≈ 342px at 96 DPI (((190-4)/2)-2)

// Image sizing state - now using percentage instead of pixels
const imageScale = ref(100) // Percentage scale (50% to 100%)
const aspectRatio = ref(1)

// Scale for A4 preview (50% of actual size)
const A4_PREVIEW_SCALE = 0.5

// Computed properties
const maxImageSize = computed(() => {
  return props.imageType === 'question' ? QUESTION_MAX_SIZE : OPTION_MAX_SIZE
})

const maxImageSizeMM = computed(() => {
  return props.imageType === 'question' ? 186 : 91
})

// Computed image dimensions based on scale and A4 preview
const imageWidth = computed(() => {
  if (!imageInfo.value.width) return 0
  const actualWidth = Math.min(imageInfo.value.width, maxImageSize.value)
  const scaledWidth = (actualWidth * imageScale.value) / 100
  return Math.round(scaledWidth * A4_PREVIEW_SCALE) // Scale down for A4 preview
})

const imageHeight = computed(() => {
  if (!imageInfo.value.height) return 0
  const actualHeight = Math.min(imageInfo.value.height, maxImageSize.value)
  const scaledHeight = (actualHeight * imageScale.value) / 100
  return Math.round(scaledHeight * A4_PREVIEW_SCALE) // Scale down for A4 preview
})

// Actual print dimensions (what will be printed)
const actualPrintWidth = computed(() => {
  if (!imageInfo.value.width) return 0
  const actualWidth = Math.min(imageInfo.value.width, maxImageSize.value)
  return Math.round((actualWidth * imageScale.value) / 100)
})

const actualPrintHeight = computed(() => {
  if (!imageInfo.value.height) return 0
  const actualHeight = Math.min(imageInfo.value.height, maxImageSize.value)
  return Math.round((actualHeight * imageScale.value) / 100)
})

const canIncreaseSize = computed(() => {
  return imageScale.value < 100
})

const canDecreaseSize = computed(() => {
  return imageScale.value > 10 // Minimum 10%
})

const imageStyle = computed(() => ({
  width: `${imageWidth.value}px`,
  height: `${imageHeight.value}px`,
  maxWidth: `${maxImageSize.value}px`,
  maxHeight: `${maxImageSize.value}px`,
  objectFit: 'contain' as const
}))

const imageContainerStyle = computed(() => ({
  width: '100%',
  height: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: props.imageType === 'option' ? 'flex-start' : 'center',
  overflow: 'hidden',
  margin: props.imageType === 'question' ? '12px 0' : '0'
}))

// Methods
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    processFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0])
  }
}

const processFile = (file: File) => {
  // Local file validation (moved from imageService)
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    emit('error', 'Invalid file type. Please select a PNG, JPG, JPEG, or WebP image.')
    return
  }
  
  if (file.size > maxSize) {
    emit('error', 'File size too large. Please select an image smaller than 5MB.')
    return
  }

  selectedImage.value = file
  imageInfo.value = {
    width: 0,
    height: 0,
    size: file.size,
    type: file.type
  }

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const onImageLoad = () => {
  if (previewImage.value) {
    const naturalWidth = previewImage.value.naturalWidth
    const naturalHeight = previewImage.value.naturalHeight
    
    imageInfo.value.width = naturalWidth
    imageInfo.value.height = naturalHeight
    
    // Calculate aspect ratio
    aspectRatio.value = naturalWidth / naturalHeight
    
    // Auto-scale to fit within max constraints
    const maxSize = maxImageSize.value
    
    // Calculate the scale needed to fit within max size
    const widthScale = maxSize / naturalWidth
    const heightScale = maxSize / naturalHeight
    const maxScale = Math.min(widthScale, heightScale, 1) // Don't scale up
    
    // Set initial scale (as percentage)
    imageScale.value = Math.round(maxScale * 100)
  }
}

const toggleCropMode = async () => {
  cropMode.value = !cropMode.value
  
  if (cropMode.value) {
    await nextTick()
    initCropper()
  } else {
    destroyCropper()
  }
}

const initCropper = () => {
  if (cropImage.value && !cropper.value) {
    cropper.value = new Cropper(cropImage.value, {
      aspectRatio: Number.NaN, // Free aspect ratio
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    })
  }
}

const destroyCropper = () => {
  if (cropper.value) {
    cropper.value.destroy()
    cropper.value = null
  }
}

const resetImage = () => {
  if (cropMode.value) {
    cropMode.value = false
    destroyCropper()
  }
  
  // Reset to auto-sized scale
  if (previewImage.value) {
    onImageLoad()
  }
}

const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  cropMode.value = false
  destroyCropper()
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const saveImage = async () => {
  if (!selectedImage.value) return

  isUploading.value = true

  try {
    let finalFile = selectedImage.value

    // If crop mode is active, get cropped image
    if (cropMode.value && cropper.value) {
      const canvas = cropper.value.getCroppedCanvas({
        maxWidth: 4000,
        maxHeight: 4000,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      })

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, selectedImage.value!.type, 0.9)
      })

      // Create new file from blob
      finalFile = new File([blob], selectedImage.value.name, {
        type: selectedImage.value.type
      })
    }

    // Generate temporary ID for local storage
    const tempId = `temp_${Date.now()}_${crypto.randomUUID()}`

    // Create blob URL for preview
    const blobUrl = URL.createObjectURL(finalFile)

    // Emit the image data with user-selected dimensions (no AWS upload)
    emit('imageUploaded', {
      id: tempId,
      file: finalFile,
      url: blobUrl,
      metadata: {
        width: actualPrintWidth.value,  // Use user-selected width
        height: actualPrintHeight.value, // Use user-selected height
        size: finalFile.size,
        type: finalFile.type
      }
    })

    closeModalSuccess() // Use success close instead of regular close
  } catch (error) {
    console.error('Error processing image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error processing image. Please try again.'
    emit('error', errorMessage)
  } finally {
    isUploading.value = false
  }
}

const closeModalSuccess = () => {
  // Clear selected image when modal is closed after successful save
  selectedImage.value = null
  imagePreview.value = ''
  cropMode.value = false
  destroyCropper()
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  // Only emit close event for successful completion (no cancelled event)
  emit('close')
}

const closeModal = () => {
  // Clear selected image when modal is cancelled
  selectedImage.value = null
  imagePreview.value = ''
  cropMode.value = false
  destroyCropper()
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  // Emit cancelled event to notify parent components
  emit('cancelled')
  emit('close')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const increaseImageSize = () => {
  if (!canIncreaseSize.value) return
  
  imageScale.value = Math.min(imageScale.value + 10, 100)
}

const decreaseImageSize = () => {
  if (!canDecreaseSize.value) return
  
  imageScale.value = Math.max(imageScale.value - 10, 10)
}

const applyCrop = async () => {
  if (cropMode.value && cropper.value) {
    const canvas = cropper.value.getCroppedCanvas({
      maxWidth: 4000,
      maxHeight: 4000,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, selectedImage.value!.type, 0.9)
    })

    // Create new file from blob
    const newFile = new File([blob], selectedImage.value!.name, {
      type: selectedImage.value!.type
    })

    // Update selectedImage and imagePreview
    selectedImage.value = newFile
    imagePreview.value = URL.createObjectURL(newFile)

    // Update image info
    imageInfo.value.size = newFile.size

    // Reset crop mode
    cropMode.value = false
    destroyCropper()

    // Wait for next tick and reload image to get new dimensions
    await nextTick()
    if (previewImage.value) {
      previewImage.value.onload = () => {
        onImageLoad()
      }
    }
  }
}

// New method for slider input
const onScaleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  imageScale.value = Number.parseInt(target.value, 10)
}

// Method to get option label for option images
const getOptionLabel = () => {
  const labels = ['A', 'B', 'C', 'D']
  if (props.optionIndex >= 0 && props.optionIndex < labels.length) {
    return labels[props.optionIndex]
  }
  return labels[0]
}

// Method to get option text for option images
const getOptionText = () => {
  if (props.options && props.options.length > 0 && props.optionIndex >= 0 && props.optionIndex < props.options.length) {
    return props.options[props.optionIndex] || 'Enter option text'
  }
  return 'Enter option text'
}

// Method to get question type instruction
const getQuestionTypeInstruction = () => {
  // Return empty string to remove unnecessary instruction text
  return ''
}

// Lifecycle
onMounted(() => {
  // Load existing image if provided
  if (props.existingImageUrl) {
    imagePreview.value = props.existingImageUrl
    // Note: For existing images, we might not have all metadata
  }
})

onUnmounted(() => {
  destroyCropper()
})
</script>

<style scoped>
.image-upload-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.image-upload-editor-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: #f8f9fa;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.upload-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.upload-dropzone {
  border: 2px dashed #007bff;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  background-color: #f8f9ff;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: 500px;
}

.upload-dropzone:hover {
  border-color: #0056b3;
  background-color: #e7f3ff;
}

.file-input {
  display: none;
}

.upload-label {
  cursor: pointer;
  margin: 0;
}

.upload-icon {
  font-size: 3rem;
  color: #007bff;
  margin-bottom: 16px;
  display: block;
}

.upload-text {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 300px;
}

.size-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.size-slider-container {
  flex: 1;
  max-width: 200px;
}

.size-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.size-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.size-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #6c757d;
}

.size-info {
  font-size: 0.85rem;
  color: #6c757d;
  white-space: nowrap;
}

.size-constraints-info {
  background-color: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.constraint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #0066cc;
}

.constraint-item i {
  font-size: 1rem;
}

.btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.a4-page-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: visible; /* Allow A4 page to show properly */
}

.a4-page {
  width: 400px !important; /* Scaled down A4 for preview */
  height: 566px !important; /* Scaled down A4 for preview */
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
  margin: 0 auto; /* Center the preview */
}

.a4-margins {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.margin-indicator {
  position: absolute;
  background-color: rgba(0, 123, 255, 0.1);
  border: 1px dashed rgba(0, 123, 255, 0.3);
  font-size: 8px;
  color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.top-margin {
  top: 0;
  left: 0;
  right: 0;
  height: 20px; /* 10mm proportionally scaled for 400px width */
}

.bottom-margin {
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px; /* 10mm proportionally scaled for 400px width */
}

.left-margin {
  top: 20px;
  bottom: 20px;
  left: 0;
  width: 20px; /* 10mm proportionally scaled for 400px width */
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.right-margin {
  top: 20px;
  bottom: 20px;
  right: 0;
  width: 20px; /* 10mm proportionally scaled for 400px width */
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.a4-content-area {
  position: absolute;
  top: 20px; /* 10mm margin proportionally scaled */
  left: 20px; /* 10mm margin proportionally scaled */
  right: 20px; /* 10mm margin proportionally scaled */
  bottom: 20px; /* 10mm margin proportionally scaled */
  background-color: rgba(248, 249, 250, 0.5);
  border: 1px dashed rgba(108, 117, 125, 0.3);
  overflow-y: auto;
}

.test-paper-content {
  padding: 12px;
  font-family: 'Times New Roman', serif;
  font-size: 11px;
  line-height: 1.4;
  color: #333;
  height: 100%;
}

.question-text-display {
  margin-bottom: 8px;
  text-align: justify;
}

.question-number {
  font-weight: bold;
  margin-right: 4px;
}

.question-content {
  font-weight: normal;
}

.options-display {
  margin-top: 12px;
}

.options-placeholder {
  margin-top: 12px;
}

.option-text {
  color: #666;
  font-style: italic;
  font-size: 0.9em;
}

.option-context {
  margin-top: 8px;
  font-weight: 500;
}

.option-item {
  color: #333;
  line-height: 1.4;
  margin: 4px 0;
  font-size: 0.95em;
}

.option-label {
  color: #333;
  font-weight: 500;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.crop-container {
  width: 100%;
  height: 100%;
}

.crop-image {
  max-width: 100%;
  max-height: 100%;
}

.image-info {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  color: #666;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #545b62;
  border-color: #545b62;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
  background-color: transparent;
}

.btn-outline-secondary:hover:not(:disabled) {
  background-color: #6c757d;
  color: white;
}

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
  background-color: transparent;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
  background-color: transparent;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .image-upload-editor-modal {
    margin: 10px;
    max-height: 95vh;
  }
  
  .a4-page {
    width: 300px;
    height: 424px;
  }
  
  .test-paper-content {
    padding: 8px;
    font-size: 9px;
  }
  
  .question-text-display {
    margin-bottom: 6px;
  }
  
  .option-item {
    font-size: 8px;
    margin: 2px 0;
  }
  
  .option-label {
    font-size: 9px;
  }
  
  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .toolbar-group {
    justify-content: center;
  }
  
  .size-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    min-width: auto;
  }
  
  .size-slider-container {
    max-width: none;
  }
  
  .size-label {
    text-align: center;
  }
  
  .size-info {
    text-align: center;
  }
  
  .image-info {
    flex-direction: column;
    text-align: center;
  }
  
  .margin-indicator {
    font-size: 6px;
  }
}
</style> 