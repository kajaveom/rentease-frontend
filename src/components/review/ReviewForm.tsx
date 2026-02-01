import { useState } from 'react'
import { reviewsApi } from '../../api/reviews'
import { Review, CreateReviewRequest } from '../../types/review'
import Button from '../common/Button'
import StarRating from './StarRating'
import toast from 'react-hot-toast'

interface ReviewFormProps {
  bookingId: string
  onReviewCreated: (review: Review) => void
  onCancel?: () => void
}

export default function ReviewForm({ bookingId, onReviewCreated, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const data: CreateReviewRequest = {
        rating,
        comment: comment.trim() || undefined,
      }
      const review = await reviewsApi.createReview(bookingId, data)
      toast.success('Review submitted!')
      onReviewCreated(review)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit review'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How was your experience?
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        {error && rating === 0 && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Share your experience (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your rental experience..."
          rows={4}
          className="input w-full"
          maxLength={1000}
        />
        <p className="mt-1 text-sm text-gray-500">{comment.length}/1000 characters</p>
      </div>

      {error && rating > 0 && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} disabled={rating === 0}>
          Submit Review
        </Button>
      </div>
    </form>
  )
}
