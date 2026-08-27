import axiosInstance from '@/config/axios'

export interface ImageUploadResponse {
  id: number
  image_url: string
  original_filename: string
  file_size: number
  file_type: string
  width: number
  height: number
  created_at: string
  updated_at: string
}

export interface ImageMetadata {
  width: number
  height: number
  size: number
  type: string
}

class ImageService {
  async uploadImage(file: File, customWidth?: number, customHeight?: number): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add custom dimensions if provided
      if (customWidth !== undefined) {
        formData.append('width', customWidth.toString())
      }
      if (customHeight !== undefined) {
        formData.append('height', customHeight.toString())
      }

      const response = await axiosInstance.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      console.error('Error uploading image:', error)
      throw new Error('Failed to upload image. Please try again.')
    }
  }

  async getImageById(id: number): Promise<ImageUploadResponse> {
    try {
      const response = await axiosInstance.get(`/images/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching image:', error)
      throw new Error('Failed to fetch image.')
    }
  }

  async getPresignedUrl(id: number, expiresIn?: number): Promise<{ presignedUrl: string }> {
    try {
      const params = expiresIn ? `?expiresIn=${expiresIn}` : ''
      const response = await axiosInstance.get(`/images/presigned/${id}${params}`)
      return response.data
    } catch (error) {
      console.error('Error getting presigned URL:', error)
      throw new Error('Failed to get image URL.')
    }
  }

  async deleteImage(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/images/${id}`)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw new Error('Failed to delete image.')
    }
  }

  // Utility method to validate image file
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    const minSize = 10 * 1024 // 10KB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please select a JPEG, PNG, or WebP image.'
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 5MB.'
      }
    }

    if (file.size < minSize) {
      return {
        isValid: false,
        error: 'File size too small. Minimum size is 10KB.'
      }
    }

    return { isValid: true }
  }

  // Utility method to get image dimensions
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  }

  // Utility method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const imageService = new ImageService()
export default imageService 