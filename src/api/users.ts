import apiClient from './client'
import { ApiResponse, PaginatedResponse } from '../types/api'
import {
  User,
  PublicProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  IdVerificationResponse,
  IdVerificationRequest
} from '../types/user'
import { ListingSummary } from '../types/listing'
import { Review } from '../types/review'

export const usersApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me')
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch user')
    }
    return response.data.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update profile')
    }
    return response.data.data
  },

  getPublicProfile: async (userId: string): Promise<PublicProfile> => {
    const response = await apiClient.get<ApiResponse<PublicProfile>>(`/users/${userId}`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch profile')
    }
    return response.data.data
  },

  getUserListings: async (
    userId: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<ListingSummary>> => {
    const response = await apiClient.get<PaginatedResponse<ListingSummary>>(
      `/users/${userId}/listings?page=${page}&size=${size}`
    )
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

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>('/users/me/change-password', data)
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to change password')
    }
  },

  deleteAccount: async (): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>('/users/me')
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete account')
    }
  },

  getVerificationStatus: async (): Promise<IdVerificationResponse> => {
    const response = await apiClient.get<ApiResponse<IdVerificationResponse>>('/users/me/verification')
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get verification status')
    }
    return response.data.data
  },

  submitVerification: async (data: IdVerificationRequest): Promise<IdVerificationResponse> => {
    const response = await apiClient.post<ApiResponse<IdVerificationResponse>>('/users/me/verification', data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to submit verification')
    }
    return response.data.data
  },

  cancelVerification: async (): Promise<IdVerificationResponse> => {
    const response = await apiClient.delete<ApiResponse<IdVerificationResponse>>('/users/me/verification')
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to cancel verification')
    }
    return response.data.data
  },
}
