import apiClient from './client'
import { ApiResponse, PaginatedResponse } from '../types/api'
import { Review, CreateReviewRequest, ReviewResponseRequest, ReviewStats } from '../types/review'

export const reviewsApi = {
  createReview: async (bookingId: string, data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<ApiResponse<Review>>(
      `/bookings/${bookingId}/reviews`,
      data
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create review')
    }
    return response.data.data
  },

  getReview: async (id: string): Promise<Review> => {
    const response = await apiClient.get<ApiResponse<Review>>(`/reviews/${id}`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch review')
    }
    return response.data.data
  },

  getListingReviews: async (
    listingId: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      `/listings/${listingId}/reviews?page=${page}&size=${size}`
    )
    return response.data
  },

  getListingReviewStats: async (listingId: string): Promise<ReviewStats> => {
    const response = await apiClient.get<ReviewStats>(`/listings/${listingId}/reviews/stats`)
    return response.data
  },

  getUserReviews: async (
    userId: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      `/users/${userId}/reviews?page=${page}&size=${size}`
    )
    return response.data
  },

  getMyReviews: async (page = 0, size = 10): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      `/users/me/reviews?page=${page}&size=${size}`
    )
    return response.data
  },

  addOwnerResponse: async (reviewId: string, response: string): Promise<Review> => {
    const apiResponse = await apiClient.post<ApiResponse<Review>>(
      `/reviews/${reviewId}/response`,
      { response }
    )
    if (!apiResponse.data.success || !apiResponse.data.data) {
      throw new Error(apiResponse.data.error?.message || 'Failed to add response')
    }
    return apiResponse.data.data
  },

  canReviewBooking: async (bookingId: string): Promise<boolean> => {
    const response = await apiClient.get<{ canReview: boolean }>(
      `/bookings/${bookingId}/can-review`
    )
    return response.data.canReview
  },
}
