import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Review } from '../../types/review'
import { reviewsApi } from '../../api/reviews'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface ReviewCardProps {
  review: Review
  showListing?: boolean
  isOwner?: boolean
  onResponseAdded?: (review: Review) => void
}

export default function ReviewCard({
  review,
  showListing = false,
  isOwner = false,
  onResponseAdded,
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [response, setResponse] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitResponse = async () => {
    if (!response.trim()) return

    setIsSubmitting(true)
    try {
      const updated = await reviewsApi.addOwnerResponse(review.id, response.trim())
      toast.success('Response added')
      setShowResponseForm(false)
      setResponse('')
      onResponseAdded?.(updated)
    } catch (error) {
      toast.error('Failed to add response')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {review.reviewer.avatarUrl ? (
            <img
              src={review.reviewer.avatarUrl}
              alt={review.reviewer.firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-primary-600">
              {review.reviewer.firstName.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {review.reviewer.firstName} {review.reviewer.lastName}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <div className="mt-1">{renderStars(review.rating)}</div>
        </div>
      </div>

      {/* Listing Info */}
      {showListing && (
        <Link
          to={`/listings/${review.listing.id}`}
          className="flex items-center gap-2 mt-3 text-sm text-gray-600 hover:text-primary-600"
        >
          <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
            {review.listing.primaryImage ? (
              <img
                src={review.listing.primaryImage}
                alt={review.listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={16} />
              </div>
            )}
          </div>
          <span className="truncate">{review.listing.title}</span>
        </Link>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="mt-3 text-gray-700 whitespace-pre-wrap">{review.comment}</p>
      )}

      {/* Owner Response */}
      {review.ownerResponse && (
        <div className="mt-4 ml-6 p-3 bg-gray-50 rounded-lg border-l-2 border-primary-500">
          <p className="text-sm font-medium text-gray-900 mb-1">Owner's Response</p>
          <p className="text-sm text-gray-700">{review.ownerResponse}</p>
        </div>
      )}

      {/* Response Form for Owner */}
      {isOwner && !review.ownerResponse && (
        <div className="mt-4 ml-6">
          {showResponseForm ? (
            <div className="space-y-3">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your response..."
                rows={3}
                className="input w-full"
                maxLength={500}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitResponse}
                  disabled={!response.trim()}
                  isLoading={isSubmitting}
                >
                  Submit Response
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowResponseForm(false)
                    setResponse('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResponseForm(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Respond to this review
            </button>
          )}
        </div>
      )}
    </div>
  )
}
