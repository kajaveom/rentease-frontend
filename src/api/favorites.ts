import apiClient from './client'
import { ApiResponse, PaginatedResponse } from '../types/api'
import { ListingSummary } from '../types/listing'

export const favoritesApi = {
  addFavorite: async (listingId: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(`/favorites/${listingId}`)
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to add favorite')
    }
  },

  removeFavorite: async (listingId: string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/favorites/${listingId}`)
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to remove favorite')
    }
  },

  getFavorites: async (page = 0, size = 20): Promise<PaginatedResponse<ListingSummary>> => {
    const response = await apiClient.get<PaginatedResponse<ListingSummary>>(
      `/favorites?page=${page}&size=${size}`
    )
    return response.data
  },

  getFavoritedIds: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/favorites/ids')
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to get favorites')
    }
    return response.data.data || []
  },

  checkFavorite: async (listingId: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<boolean>>(`/favorites/check/${listingId}`)
    if (!response.data.success) {
      return false
    }
    return response.data.data || false
  },
}
