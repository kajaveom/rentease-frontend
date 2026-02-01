import apiClient from './client'
import { ApiResponse, PaginatedResponse } from '../types/api'
import { Booking, CreateBookingRequest, BookingActionRequest } from '../types/booking'

export const bookingsApi = {
  createBooking: async (listingId: string, data: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      `/listings/${listingId}/bookings`,
      data
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create booking')
    }
    return response.data.data
  },

  getBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch booking')
    }
    return response.data.data
  },

  getMyBookings: async (
    status?: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Booking>> => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('page', page.toString())
    params.set('size', size.toString())

    const response = await apiClient.get<PaginatedResponse<Booking>>(
      `/users/me/bookings?${params.toString()}`
    )
    return response.data
  },

  getBookingRequests: async (
    status?: string,
    page = 0,
    size = 20
  ): Promise<PaginatedResponse<Booking>> => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('page', page.toString())
    params.set('size', size.toString())

    const response = await apiClient.get<PaginatedResponse<Booking>>(
      `/users/me/booking-requests?${params.toString()}`
    )
    return response.data
  },

  approveBooking: async (id: string, data?: BookingActionRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      `/bookings/${id}/approve`,
      data || {}
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to approve booking')
    }
    return response.data.data
  },

  rejectBooking: async (id: string, data?: BookingActionRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      `/bookings/${id}/reject`,
      data || {}
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to reject booking')
    }
    return response.data.data
  },

  cancelBooking: async (id: string, data?: BookingActionRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      `/bookings/${id}/cancel`,
      data || {}
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to cancel booking')
    }
    return response.data.data
  },

  startBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/start`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to start booking')
    }
    return response.data.data
  },

  completeBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/complete`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to complete booking')
    }
    return response.data.data
  },
}
