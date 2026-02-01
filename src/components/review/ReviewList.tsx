import { useEffect, useState } from 'react'
import { reviewsApi } from '../../api/reviews'
import { Review, ReviewStats } from '../../types/review'
import ReviewCard from './ReviewCard'
import Spinner from '../common/Spinner'
import Button from '../common/Button'

interface ReviewListProps {
  listingId: string
  isOwner?: boolean
}

export default function ReviewList({ listingId, isOwner = false }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchReviews(0)
  }, [listingId])

  const fetchStats = async () => {
    try {
      const data = await reviewsApi.getListingReviewStats(listingId)
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch review stats:', error)
    }
  }

  const fetchReviews = async (pageNum: number) => {
    if (pageNum === 0) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const response = await reviewsApi.getListingReviews(listingId, pageNum)
      if (pageNum === 0) {
        setReviews(response.data || [])
      } else {
        setReviews((prev) => [...prev, ...(response.data || [])])
      }
      setPage(pageNum)
      setHasMore(response.pagination.page < response.pagination.totalPages - 1)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    fetchReviews(page + 1)
  }

  const handleResponseAdded = (updatedReview: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      {/* Stats Summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {renderStars(Math.round(stats.averageRating || 0))}
            <span className="text-xl font-bold text-gray-900">
              {stats.averageRating?.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Rating Distribution */}
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0
              const percentage = stats.totalReviews > 0
                ? (count / stats.totalReviews) * 100
                : 0

              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-gray-600">{rating}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet</p>
      ) : (
        <div className="divide-y">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={isOwner}
              onResponseAdded={handleResponseAdded}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}
