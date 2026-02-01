export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}
