import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Package } from 'lucide-react'
import { bookingsApi } from '../../api/bookings'
import { Booking, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../types/booking'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'REQUESTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
]

export default function BookingRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const statusFilter = searchParams.get('status') || ''

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await bookingsApi.getBookingRequests(statusFilter || undefined)
      setBookings(response.data || [])
    } catch (error) {
      console.error('Failed to fetch booking requests:', error)
      toast.error('Failed to load booking requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (status: string) => {
    if (status) {
      searchParams.set('status', status)
    } else {
      searchParams.delete('status')
    }
    setSearchParams(searchParams)
  }

  const handleApprove = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await bookingsApi.approveBooking(bookingId)
      toast.success('Booking approved')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to approve booking')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking?')) return

    setActionLoading(bookingId)
    try {
      await bookingsApi.rejectBooking(bookingId)
      toast.success('Booking rejected')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to reject booking')
    } finally {
      setActionLoading(null)
    }
  }

  const handleStart = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await bookingsApi.startBooking(bookingId)
      toast.success('Rental started')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to start rental')
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await bookingsApi.completeBooking(bookingId)
      toast.success('Rental completed')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to complete rental')
    } finally {
      setActionLoading(null)
    }
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking Requests</h1>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleStatusChange(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No booking requests</h2>
          <p className="text-gray-600 mb-6">
            When renters request to book your items, they'll appear here
          </p>
          <Link to="/my-listings">
            <Button variant="secondary">View My Listings</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-4">
              <div className="flex gap-4">
                {/* Listing Image */}
                <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {booking.listing.primaryImage ? (
                    <img
                      src={booking.listing.primaryImage}
                      alt={booking.listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={32} />
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/listings/${booking.listing.id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {booking.listing.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        <span className="mx-2">·</span>
                        {booking.totalDays} days
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                          {booking.renter.avatarUrl ? (
                            <img
                              src={booking.renter.avatarUrl}
                              alt={booking.renter.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-primary-600">
                              {booking.renter.firstName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {booking.renter.firstName} {booking.renter.lastName}
                          {booking.renter.idVerified && (
                            <span className="ml-1 text-green-600">(Verified)</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-xs px-2 py-1 rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                      <p className="font-semibold text-gray-900 mt-2">
                        {formatPrice(booking.totalPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Renter Message */}
                  {booking.renterMessage && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">"{booking.renterMessage}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link to={`/bookings/${booking.id}`}>
                      <Button size="sm" variant="secondary">View Details</Button>
                    </Link>

                    {booking.status === 'REQUESTED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking.id)}
                          isLoading={actionLoading === booking.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(booking.id)}
                          isLoading={actionLoading === booking.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {booking.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        onClick={() => handleStart(booking.id)}
                        isLoading={actionLoading === booking.id}
                      >
                        Mark as Picked Up
                      </Button>
                    )}

                    {booking.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        onClick={() => handleComplete(booking.id)}
                        isLoading={actionLoading === booking.id}
                      >
                        Mark as Returned
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
