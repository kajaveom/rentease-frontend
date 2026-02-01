export interface ReviewListing {
  id: string
  title: string
  primaryImage?: string
}

export interface ReviewUser {
  id: string
  firstName: string
  lastName?: string
  avatarUrl?: string
}

export interface Review {
  id: string
  bookingId: string
  listing: ReviewListing
  reviewer: ReviewUser
  rating: number
  comment?: string
  ownerResponse?: string
  ownerResponseAt?: string
  createdAt: string
}

export interface CreateReviewRequest {
  rating: number
  comment?: string
}

export interface ReviewResponseRequest {
  response: string
}

export interface ReviewStats {
  averageRating: number | null
  totalReviews: number
  ratingDistribution: Record<number, number>
}
