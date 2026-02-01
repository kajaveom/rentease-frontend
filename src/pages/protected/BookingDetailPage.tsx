import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { bookingsApi } from '../../api/bookings'
import { reviewsApi } from '../../api/reviews'
import { Booking, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../types/booking'
import { Review } from '../../types/review'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import ReviewForm from '../../components/review/ReviewForm'
import ReviewCard from '../../components/review/ReviewCard'
import toast from 'react-hot-toast'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)

  const isOwner = user?.id === booking?.owner.id
  const isRenter = user?.id === booking?.renter.id

  useEffect(() => {
    fetchBooking()
  }, [id])

  useEffect(() => {
    if (booking?.status === 'COMPLETED' && isRenter && id) {
      checkCanReview()
    }
  }, [booking?.status, isRenter, id])

  const fetchBooking = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const data = await bookingsApi.getBooking(id)
      setBooking(data)
    } catch (error) {
      console.error('Failed to fetch booking:', error)
      toast.error('Failed to load booking')
      navigate('/my-bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const checkCanReview = async () => {
    if (!id) return
    try {
      const canReviewResult = await reviewsApi.canReviewBooking(id)
      setCanReview(canReviewResult)
    } catch (error) {
      console.error('Failed to check review status:', error)
    }
  }

  const handleReviewCreated = (review: Review) => {
    setExistingReview(review)
    setCanReview(false)
    setShowReviewForm(false)
  }

  const handleApprove = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await bookingsApi.approveBooking(id)
      toast.success('Booking approved')
      fetchBooking()
    } catch (error) {
      toast.error('Failed to approve booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!id || !confirm('Are you sure you want to reject this booking?')) return
    setActionLoading(true)
    try {
      await bookingsApi.rejectBooking(id)
      toast.success('Booking rejected')
      fetchBooking()
    } catch (error) {
      toast.error('Failed to reject booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!id || !confirm('Are you sure you want to cancel this booking?')) return
    setActionLoading(true)
    try {
      await bookingsApi.cancelBooking(id)
      toast.success('Booking cancelled')
      fetchBooking()
    } catch (error) {
      toast.error('Failed to cancel booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStart = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await bookingsApi.startBooking(id)
      toast.success('Rental started')
      fetchBooking()
    } catch (error) {
      toast.error('Failed to start rental')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await bookingsApi.completeBooking(id)
      toast.success('Rental completed')
      fetchBooking()
    } catch (error) {
      toast.error('Failed to complete rental')
    } finally {
      setActionLoading(false)
    }
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Booking not found</p>
        <Link to="/my-bookings" className="btn-primary">
          View My Bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to={isOwner ? '/booking-requests' : '/my-bookings'}
          className="text-primary-600 hover:text-primary-700"
        >
          &larr; Back to {isOwner ? 'booking requests' : 'my bookings'}
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-1">
            Requested on {formatDateTime(booking.createdAt)}
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Listing Info */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Item</h2>
            <Link to={`/listings/${booking.listing.id}`} className="flex gap-4 group">
              <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {booking.listing.primaryImage ? (
                  <img
                    src={booking.listing.primaryImage}
                    alt={booking.listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                  {booking.listing.title}
                </h3>
                <p className="text-sm text-gray-600">{booking.listing.pickupLocation}</p>
              </div>
            </Link>
          </div>

          {/* Dates */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Rental Period</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Pick up</p>
                <p className="font-medium text-gray-900">{formatDate(booking.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Return</p>
                <p className="font-medium text-gray-900">{formatDate(booking.endDate)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Total: {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
            </p>
          </div>

          {/* People */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {isOwner ? 'Renter' : 'Owner'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {(isOwner ? booking.renter : booking.owner).avatarUrl ? (
                  <img
                    src={(isOwner ? booking.renter : booking.owner).avatarUrl}
                    alt={(isOwner ? booking.renter : booking.owner).firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-primary-600">
                    {(isOwner ? booking.renter : booking.owner).firstName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {(isOwner ? booking.renter : booking.owner).firstName}{' '}
                  {(isOwner ? booking.renter : booking.owner).lastName}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {(isOwner ? booking.renter : booking.owner).idVerified && (
                    <span className="text-green-600">Verified</span>
                  )}
                  {(isOwner ? booking.renter : booking.owner).averageRating && (
                    <span>
                      {(isOwner ? booking.renter : booking.owner).averageRating?.toFixed(1)} (
                      {(isOwner ? booking.renter : booking.owner).totalReviews} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {(booking.renterMessage || booking.ownerResponse) && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Messages</h2>
              <div className="space-y-4">
                {booking.renterMessage && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {booking.renter.firstName}:
                    </p>
                    <p className="text-gray-600">{booking.renterMessage}</p>
                  </div>
                )}
                {booking.ownerResponse && (
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {booking.owner.firstName}:
                    </p>
                    <p className="text-gray-600">{booking.ownerResponse}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Info */}
          {booking.status === 'CANCELLED' && booking.cancellationReason && (
            <div className="card p-6 border-red-200 bg-red-50">
              <h2 className="font-semibold text-red-900 mb-2">Cancellation Reason</h2>
              <p className="text-red-700">{booking.cancellationReason}</p>
              {booking.cancelledAt && (
                <p className="text-sm text-red-600 mt-2">
                  Cancelled on {formatDateTime(booking.cancelledAt)}
                </p>
              )}
            </div>
          )}

          {/* Review Section - For completed bookings */}
          {booking.status === 'COMPLETED' && isRenter && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Your Review</h2>
              {existingReview ? (
                <ReviewCard review={existingReview} />
              ) : showReviewForm ? (
                <ReviewForm
                  bookingId={booking.id}
                  onReviewCreated={handleReviewCreated}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : canReview ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    How was your experience renting this item?
                  </p>
                  <Button onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  You've already reviewed this booking
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Pricing & Actions */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-4">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatPrice(booking.dailyRate)} x {booking.totalDays} days
                </span>
                <span className="text-gray-900">{formatPrice(booking.totalPrice)}</span>
              </div>
              {booking.serviceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee</span>
                  <span className="text-gray-900">{formatPrice(booking.serviceFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Security deposit</span>
                <span className="text-gray-900">{formatPrice(booking.depositAmount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(booking.totalPrice + (booking.serviceFee || 0))}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {/* Owner Actions */}
              {isOwner && booking.status === 'REQUESTED' && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleApprove}
                    isLoading={actionLoading}
                  >
                    Approve Booking
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={handleReject}
                    isLoading={actionLoading}
                  >
                    Reject Booking
                  </Button>
                </>
              )}

              {isOwner && booking.status === 'PAID' && (
                <Button
                  className="w-full"
                  onClick={handleStart}
                  isLoading={actionLoading}
                >
                  Mark as Picked Up
                </Button>
              )}

              {isOwner && booking.status === 'ACTIVE' && (
                <Button
                  className="w-full"
                  onClick={handleComplete}
                  isLoading={actionLoading}
                >
                  Mark as Returned
                </Button>
              )}

              {/* Renter Actions */}
              {isRenter && booking.status === 'APPROVED' && (
                <Button className="w-full">Pay Now</Button>
              )}

              {/* Cancel (available to both) */}
              {['REQUESTED', 'APPROVED'].includes(booking.status) && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleCancel}
                  isLoading={actionLoading}
                >
                  Cancel Booking
                </Button>
              )}

              {/* Message Link */}
              <Link to="/messages" className="block">
                <Button variant="secondary" className="w-full">
                  Send Message
                </Button>
              </Link>
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested</span>
                  <span className="text-gray-900">{formatDateTime(booking.createdAt)}</span>
                </div>
                {booking.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved</span>
                    <span className="text-gray-900">{formatDateTime(booking.approvedAt)}</span>
                  </div>
                )}
                {booking.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid</span>
                    <span className="text-gray-900">{formatDateTime(booking.paidAt)}</span>
                  </div>
                )}
                {booking.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-gray-900">{formatDateTime(booking.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
