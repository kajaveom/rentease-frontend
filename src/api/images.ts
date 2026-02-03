import apiClient from './client'
import { ApiResponse } from '../types/api'

export const imagesApi = {
  uploadListingImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<string>>(
      '/images/listings',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to upload image')
    }

    return response.data.data
  },

  uploadMultipleListingImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await apiClient.post<ApiResponse<string[]>>(
      '/images/listings/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to upload images')
    }

    return response.data.data
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<string>>(
      '/images/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to upload avatar')
    }

    return response.data.data
  },

  uploadIdDocument: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<string>>(
      '/images/id-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to upload document')
    }

    return response.data.data
  },

  deleteImage: async (url: string): Promise<void> => {
    await apiClient.delete('/images', { params: { url } })
  },
}
