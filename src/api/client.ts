import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiResponse } from '../types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

// Cold start handling for Render free tier
const COLD_START_TIMEOUT = 60000 // 60 seconds for cold start
const NORMAL_TIMEOUT = 15000 // 15 seconds for normal requests
const MAX_RETRIES = 2

// Track if backend might be cold
let isBackendCold = true
let lastSuccessfulRequest = 0

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: COLD_START_TIMEOUT, // Start with cold timeout
})

// Helper to check if error is a timeout/network error (likely cold start)
const isColdStartError = (error: AxiosError): boolean => {
  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    error.message.includes('timeout') ||
    error.message.includes('Network Error')
  )
}

// Update cold start status based on successful requests
const markBackendWarm = () => {
  isBackendCold = false
  lastSuccessfulRequest = Date.now()
  apiClient.defaults.timeout = NORMAL_TIMEOUT
}

// Check if backend might have gone cold (no requests in 15 minutes)
const checkIfBackendCold = () => {
  const fifteenMinutes = 15 * 60 * 1000
  if (Date.now() - lastSuccessfulRequest > fifteenMinutes) {
    isBackendCold = true
    apiClient.defaults.timeout = COLD_START_TIMEOUT
  }
}

// Export for components to show loading states
export const getBackendStatus = () => ({
  isCold: isBackendCold,
  timeout: isBackendCold ? COLD_START_TIMEOUT : NORMAL_TIMEOUT,
})

// Request interceptor to add auth token and check cold status
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if backend might have gone cold
    checkIfBackendCold()

    // Set appropriate timeout
    if (isBackendCold) {
      config.timeout = COLD_START_TIMEOUT
    }

    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh and cold starts
apiClient.interceptors.response.use(
  (response) => {
    // Backend responded successfully - mark as warm
    markBackendWarm()
    return response
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _coldStartRetry?: number
    }

    // Handle cold start timeouts with retry
    if (isColdStartError(error) && (!originalRequest._coldStartRetry || originalRequest._coldStartRetry < MAX_RETRIES)) {
      originalRequest._coldStartRetry = (originalRequest._coldStartRetry || 0) + 1
      console.log(`Backend may be cold starting... Retry ${originalRequest._coldStartRetry}/${MAX_RETRIES}`)

      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 2000))

      return apiClient(originalRequest)
    }

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { timeout: COLD_START_TIMEOUT }
          )

          if (response.data.success && response.data.data) {
            localStorage.setItem('accessToken', response.data.data.accessToken)
            localStorage.setItem('refreshToken', response.data.data.refreshToken)

            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
