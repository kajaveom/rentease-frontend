import { ListingSummary } from './listing'

export type BookingStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export interface BookingUser {
  id: string
  firstName: string
  lastName?: string
  avatarUrl?: string
  idVerified: boolean
  averageRating?: number
  totalReviews?: number
}

export interface Booking {
  id: string
  listing: ListingSummary
  renter: BookingUser
  owner: BookingUser
  startDate: string
  endDate: string
  totalDays: number
  dailyRate: number
  totalPrice: number
  status: BookingStatus
  renterMessage?: string
  ownerResponse?: string
  cancellationReason?: string
  createdAt: string
  approvedAt?: string
  completedAt?: string
  cancelledAt?: string
}

export interface CreateBookingRequest {
  startDate: string
  endDate: string
  message?: string
}

export interface BookedDateRange {
  startDate: string
  endDate: string
}

export interface BookingActionRequest {
  response?: string
  cancellationReason?: string
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: 'Pending Approval',
  APPROVED: 'Approved - Ready for Pickup',
  ACTIVE: 'Active Rental',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
}
