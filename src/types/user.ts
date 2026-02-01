export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  bio?: string
  location?: string
  idVerified: boolean
  emailVerified: boolean
  averageRating?: number
  totalReviews?: number
  createdAt: string
}

export interface PublicUser {
  id: string
  firstName: string
  lastName: string
  avatarUrl?: string
  bio?: string
  location?: string
  idVerified: boolean
  averageRating?: number
  totalReviews?: number
  createdAt: string
}

export interface PublicProfile {
  id: string
  firstName: string
  lastInitial?: string
  avatarUrl?: string
  bio?: string
  location?: string
  idVerified: boolean
  averageRating?: number
  totalReviews?: number
  memberSince: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  avatarUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export type IdVerificationStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'

export interface IdVerificationResponse {
  status: IdVerificationStatus
  idVerified: boolean
  submittedAt?: string
  rejectionReason?: string
}

export interface IdVerificationRequest {
  documentUrl: string
  documentType?: string
}
