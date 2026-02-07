import apiClient from './client'
import { ApiResponse, PaginatedResponse } from '../types/api'
import { Listing, ListingSummary, CreateListingRequest, UpdateListingRequest } from '../types/listing'
import { BookedDateRange } from '../types/booking'

export interface ListingsQueryParams {
  category?: string
  q?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'price_asc' | 'price_desc'
  page?: number
  size?: number
}

export const listingsApi = {
  getListings: async (params: ListingsQueryParams = {}): Promise<PaginatedResponse<ListingSummary>> => {
    const searchParams = new URLSearchParams()
    if (params.category) searchParams.set('category', params.category)
    if (params.q) searchParams.set('q', params.q)
    if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString())
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString())
    if (params.sort) searchParams.set('sort', params.sort)
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.size) searchParams.set('size', params.size.toString())

    const response = await apiClient.get<PaginatedResponse<ListingSummary>>(
      `/listings?${searchParams.toString()}`
    )
    return response.data
  },

  getListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}`)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch listing')
    }
    return response.data.data
  },

  createListing: async (data: CreateListingRequest): Promise<Listing> => {
    const response = await apiClient.post<ApiResponse<Listing>>('/listings', data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create listing')
    }
    return response.data.data
  },

  updateListing: async (id: string, data: UpdateListingRequest): Promise<Listing> => {
    const response = await apiClient.patch<ApiResponse<Listing>>(`/listings/${id}`, data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update listing')
    }
    return response.data.data
  },

  deleteListing: async (id: string): Promise<void> => {
    await apiClient.delete(`/listings/${id}`)
  },

  getMyListings: async (page = 0, size = 20): Promise<PaginatedResponse<ListingSummary>> => {
    const response = await apiClient.get<PaginatedResponse<ListingSummary>>(
      `/users/me/listings?page=${page}&size=${size}`
    )
    return response.data
  },

  addImage: async (listingId: string, imageUrl: string, publicId: string): Promise<Listing> => {
    const response = await apiClient.post<ApiResponse<Listing>>(
      `/listings/${listingId}/images`,
      null,
      { params: { imageUrl, publicId } }
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to add image')
    }
    return response.data.data
  },

  deleteImage: async (listingId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/listings/${listingId}/images/${imageId}`)
  },

  getBookedDates: async (listingId: string): Promise<BookedDateRange[]> => {
    const response = await apiClient.get<ApiResponse<BookedDateRange[]>>(
      `/listings/${listingId}/booked-dates`
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch booked dates')
    }
    return response.data.data
  },

  getRecentListings: async (limit = 8): Promise<ListingSummary[]> => {
    const response = await apiClient.get<ApiResponse<ListingSummary[]>>(
      `/listings/recent?limit=${limit}`
    )
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch recent listings')
    }
    return response.data.data
  },
}
