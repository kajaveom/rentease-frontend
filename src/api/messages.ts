import apiClient from './client'
import { ApiResponse, PaginatedResponse } from '../types/api'
import { Conversation, Message, SendMessageRequest } from '../types/message'

export const messagesApi = {
  getConversations: async (page = 0, size = 20): Promise<PaginatedResponse<Conversation>> => {
    const response = await apiClient.get<PaginatedResponse<Conversation>>(
      `/conversations?page=${page}&size=${size}`
    )
    return response.data
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<ApiResponse<Conversation>>(`/conversations/${id}`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch conversation')
    }
    return response.data.data
  },

  getMessages: async (
    conversationId: string,
    page = 0,
    size = 50
  ): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>(
      `/conversations/${conversationId}/messages?page=${page}&size=${size}`
    )
    return response.data
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/conversations/${conversationId}/messages`,
      { content }
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to send message')
    }
    return response.data.data
  },

  startConversation: async (
    recipientId: string,
    listingId: string,
    content: string
  ): Promise<Conversation> => {
    const response = await apiClient.post<ApiResponse<Conversation>>(
      `/users/${recipientId}/conversations`,
      { content, listingId }
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to start conversation')
    }
    return response.data.data
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/read`)
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/messages/unread-count')
    return response.data.count
  },
}
