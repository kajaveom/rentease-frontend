import apiClient from './client'
import { ApiResponse, PaginatedResponse } from '../types/api'
import { Notification } from '../types/notification'

export const notificationsApi = {
  getNotifications: async (page = 0, size = 20): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      `/notifications?page=${page}&size=${size}`
    )
    return response.data
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications/unread')
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch notifications')
    }
    return response.data.data
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread/count')
    if (!response.data.success || !response.data.data) {
      return 0
    }
    return response.data.data.count
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`)
  },

  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.post<ApiResponse<{ markedAsRead: number }>>('/notifications/read-all')
    if (!response.data.success || !response.data.data) {
      return 0
    }
    return response.data.data.markedAsRead
  },
}
