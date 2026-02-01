import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { listingsApi } from '../../api/listings'
import { bookingsApi } from '../../api/bookings'
import { Listing } from '../../types/listing'
import { CreateBookingRequest } from '../../types/booking'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function BookingRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateBookingRequest>({
    startDate: '',
    endDate: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await listingsApi.getListing(id)
        setListing(data)
      } catch (error) {
        console.error('Failed to fetch listing:', error)
        toast.error('Failed to load listing')
        navigate('/listings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id, navigate])

  const calculateTotalDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 0 ? diffDays : 0
  }

  const totalDays = calculateTotalDays()
  const totalPrice = listing ? (listing.pricePerDay * totalDays) / 100 : 0
  const serviceFee = totalPrice * 0.1
  const grandTotal = totalPrice + serviceFee

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    } else if (new Date(formData.startDate) < today) {
      newErrors.startDate = 'Start date must be in the future'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !id) return

    setIsSubmitting(true)
    try {
      const booking = await bookingsApi.createBooking(id, formData)
      toast.success('Booking request sent!')
      navigate(`/bookings/${booking.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create booking'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`input ${errors.startDate ? 'input-error' : ''}`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={`input ${errors.endDate ? 'input-error' : ''}`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Message to Owner</h2>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="input"
                placeholder="Introduce yourself and share why you'd like to rent this item..."
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {(formData.message || '').length}/500 characters
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
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-2xl">📦</span>
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
                <span className="text-gray-600">
                  {formatPrice(listing.pricePerDay)} x {totalDays} days
                </span>
                <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service fee</span>
                <span className="text-gray-900">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Security deposit</span>
                <span className="text-gray-900">{formatPrice(listing.depositAmount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Deposit of {formatPrice(listing.depositAmount)} is refundable upon return
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
