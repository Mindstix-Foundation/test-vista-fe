import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ImageData {
  id: string // temporary local ID
  file: File
  url: string // blob URL for preview
  metadata: {
    width: number
    height: number
    size: number
    type: string
  }
  uploadedId?: number // AWS uploaded ID (set after successful upload)
}

export interface QuestionImageData {
  questionImage?: ImageData
  optionImages: Map<number, ImageData> // optionIndex -> ImageData
}

export const useImageUploadStore = defineStore('imageUpload', () => {
  // Store images for current question being created/edited
  const currentQuestionImages = ref<QuestionImageData>({
    questionImage: undefined,
    optionImages: new Map()
  })

  // Generate temporary ID for local storage
  const generateTempId = (): string => {
    return `temp_${Date.now()}_${crypto.randomUUID()}`
  }

  // Set question image
  const setQuestionImage = (file: File, metadata: { width: number; height: number; size: number; type: string }) => {
    const imageData: ImageData = {
      id: generateTempId(),
      file,
      url: URL.createObjectURL(file),
      metadata,
      uploadedId: undefined
    }
    currentQuestionImages.value.questionImage = imageData
  }

  // Set option image
  const setOptionImage = (optionIndex: number, file: File, metadata: { width: number; height: number; size: number; type: string }) => {
    const imageData: ImageData = {
      id: generateTempId(),
      file,
      url: URL.createObjectURL(file),
      metadata,
      uploadedId: undefined
    }
    currentQuestionImages.value.optionImages.set(optionIndex, imageData)
  }

  // Remove question image
  const removeQuestionImage = () => {
    if (currentQuestionImages.value.questionImage) {
      URL.revokeObjectURL(currentQuestionImages.value.questionImage.url)
      currentQuestionImages.value.questionImage = undefined
    }
  }

  // Remove option image
  const removeOptionImage = (optionIndex: number) => {
    const imageData = currentQuestionImages.value.optionImages.get(optionIndex)
    if (imageData) {
      URL.revokeObjectURL(imageData.url)
      currentQuestionImages.value.optionImages.delete(optionIndex)
    }
  }

  // Get question image
  const getQuestionImage = (): ImageData | undefined => {
    return currentQuestionImages.value.questionImage
  }

  // Get option image
  const getOptionImage = (optionIndex: number): ImageData | undefined => {
    return currentQuestionImages.value.optionImages.get(optionIndex)
  }

  // Get all option images as array
  const getAllOptionImages = (): (File | null)[] => {
    const optionImages: (File | null)[] = []
    // Assuming max 10 options (0-9)
    for (let i = 0; i < 10; i++) {
      const imageData = currentQuestionImages.value.optionImages.get(i)
      optionImages.push(imageData ? imageData.file : null)
    }
    return optionImages
  }

  // Update uploaded ID after successful AWS upload
  const updateUploadedId = (tempId: string, uploadedId: number) => {
    // Update question image
    if (currentQuestionImages.value.questionImage?.id === tempId) {
      currentQuestionImages.value.questionImage.uploadedId = uploadedId
    }

    // Update option images
    for (const imageData of currentQuestionImages.value.optionImages.values()) {
      if (imageData.id === tempId) {
        imageData.uploadedId = uploadedId
        break
      }
    }
  }

  // Clear all images (call after successful question save or cancel)
  const clearAllImages = () => {
    // Revoke blob URLs to prevent memory leaks
    if (currentQuestionImages.value.questionImage) {
      URL.revokeObjectURL(currentQuestionImages.value.questionImage.url)
    }
    
    for (const imageData of currentQuestionImages.value.optionImages.values()) {
      URL.revokeObjectURL(imageData.url)
    }

    // Reset state
    currentQuestionImages.value = {
      questionImage: undefined,
      optionImages: new Map()
    }
  }

  // Check if there are any images to upload
  const hasImages = (): boolean => {
    return !!(currentQuestionImages.value.questionImage || currentQuestionImages.value.optionImages.size > 0)
  }

  return {
    currentQuestionImages,
    setQuestionImage,
    setOptionImage,
    removeQuestionImage,
    removeOptionImage,
    getQuestionImage,
    getOptionImage,
    getAllOptionImages,
    updateUploadedId,
    clearAllImages,
    hasImages
  }
}) 