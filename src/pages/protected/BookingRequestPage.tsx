import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import { eachDayOfInterval, parseISO, isWithinInterval, format } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import { Package } from 'lucide-react'
import { listingsApi } from '../../api/listings'
import { bookingsApi } from '../../api/bookings'
import { Listing } from '../../types/listing'
import { CreateBookingRequest, BookedDateRange } from '../../types/booking'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function BookingRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const [listingData, bookedRanges] = await Promise.all([
          listingsApi.getListing(id),
          listingsApi.getBookedDates(id),
        ])
        setListing(listingData)

        // Convert booked ranges to array of individual dates
        const allBookedDates: Date[] = []
        bookedRanges.forEach((range: BookedDateRange) => {
          const start = parseISO(range.startDate)
          const end = parseISO(range.endDate)
          const dates = eachDayOfInterval({ start, end })
          allBookedDates.push(...dates)
        })
        setBookedDates(allBookedDates)
      } catch (error) {
        console.error('Failed to fetch listing:', error)
        toast.error('Failed to load listing')
        navigate('/listings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 0 ? diffDays : 0
  }

  const totalDays = calculateTotalDays()
  const totalPrice = listing ? (listing.pricePerDay * totalDays) / 100 : 0

  // Check if a date range overlaps with booked dates
  const hasOverlapWithBookedDates = (start: Date, end: Date): boolean => {
    return bookedDates.some((bookedDate) =>
      isWithinInterval(bookedDate, { start, end })
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    } else if (startDate < today) {
      newErrors.startDate = 'Start date must be in the future'
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required'
    } else if (startDate && endDate < startDate) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (startDate && endDate && hasOverlapWithBookedDates(startDate, endDate)) {
      newErrors.dates = 'Selected dates overlap with existing bookings'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !id || !startDate || !endDate) return

    const formData: CreateBookingRequest = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      message: message || undefined,
    }

    setIsSubmitting(true)
    try {
      const booking = await bookingsApi.createBooking(id, formData)
      toast.success('Booking request sent!')
      navigate(`/bookings/${booking.id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

  // Filter out booked dates from the datepicker
  const isDateBooked = (date: Date): boolean => {
    return bookedDates.some(
      (bookedDate) =>
        bookedDate.getFullYear() === date.getFullYear() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getDate() === date.getDate()
    )
  }

  const filterDate = (date: Date): boolean => {
    return !isDateBooked(date)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Listing not found</p>
        <Link to="/listings" className="btn-primary">
          Browse Listings
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to={`/listings/${id}`} className="text-primary-600 hover:text-primary-700">
          &larr; Back to listing
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Request to Book</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Dates</h2>

              {bookedDates.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Some dates are unavailable due to existing bookings. Unavailable dates are grayed out.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    filterDate={filterDate}
                    placeholderText="Select start date"
                    className={`input w-full ${errors.startDate ? 'input-error' : ''}`}
                    dateFormat="MMM d, yyyy"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="label">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    filterDate={filterDate}
                    placeholderText="Select end date"
                    className={`input w-full ${errors.endDate ? 'input-error' : ''}`}
                    dateFormat="MMM d, yyyy"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {errors.dates && (
                <p className="mt-3 text-sm text-red-600">{errors.dates}</p>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Message to Owner</h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="input"
                placeholder="Introduce yourself and share why you'd like to rent this item..."
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {message.length}/500 characters
              </p>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Send Booking Request
            </Button>
          </form>
        </div>

        {/* Listing Summary & Pricing */}
        <div className="md:col-span-1">
          <div className="card p-4 sticky top-4">
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {listing.images[0] ? (
                  <img
                    src={listing.images[0].imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={32} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                <p className="text-sm text-gray-600">{listing.pickupLocation}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily rate</span>
                <span className="text-gray-900">{formatPrice(listing.pricePerDay)}/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration</span>
                <span className="text-gray-900">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Payment is arranged directly with the owner during pickup
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
