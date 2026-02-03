import apiClient from './client'
import { ApiResponse } from '../types/api'
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types/auth'

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Registration failed')
    }
    return response.data.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Login failed')
    }
    return response.data.data
  },

  refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Token refresh failed')
    }
    return response.data.data
  },

  logout: async (): Promise<void> => {
    // For now, just clear local storage (no server-side session to invalidate)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  googleAuth: async (credential: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/google', { credential })
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Google authentication failed')
    }
    return response.data.data
  },
}
