import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { listingsApi } from '../../api/listings'
import { Listing, UpdateListingRequest, Category, Condition, CATEGORIES, CONDITIONS } from '../../types/listing'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [listing, setListing] = useState<Listing | null>(null)
  const [formData, setFormData] = useState<UpdateListingRequest>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await listingsApi.getListing(id)
        setListing(data)
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          pricePerDay: data.pricePerDay,
          depositAmount: data.depositAmount,
          condition: data.condition,
          brand: data.brand || '',
          model: data.model || '',
          pickupLocation: data.pickupLocation,
          available: data.available,
        })
      } catch (error) {
        console.error('Failed to fetch listing:', error)
        toast.error('Failed to load listing')
        navigate('/my-listings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id, navigate])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const cents = Math.round(parseFloat(value || '0') * 100)
    setFormData((prev) => ({ ...prev, [name]: cents }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title?.trim()) newErrors.title = 'Title is required'
    if (!formData.description?.trim()) newErrors.description = 'Description is required'
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
    }
    if (formData.pricePerDay !== undefined && formData.pricePerDay < 100) {
      newErrors.pricePerDay = 'Price must be at least $1.00'
    }
    if (formData.depositAmount !== undefined && formData.depositAmount < 0) {
      newErrors.depositAmount = 'Deposit cannot be negative'
    }
    if (!formData.pickupLocation?.trim()) newErrors.pickupLocation = 'Pickup location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !id) return

    setIsSaving(true)
    try {
      await listingsApi.updateListing(id, formData)
      toast.success('Listing updated successfully!')
      navigate(`/listings/${id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update listing'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const formatCentsToDisplay = (cents: number | undefined) => {
    if (cents === undefined) return '0.00'
    return (cents / 100).toFixed(2)
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
        <Link to="/my-listings" className="btn-primary">
          Back to My Listings
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/my-listings" className="text-primary-600 hover:text-primary-700">
          &larr; Back to My Listings
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-600 mt-1">Update your listing details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

          <div className="space-y-6">
            <div>
              <label className="label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              error={errors.title}
              placeholder="e.g., Canon EOS R5 with 24-70mm"
              maxLength={100}
            />

            <div>
              <label className="label">Brand (optional)</label>
              <Input
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
                placeholder="e.g., Canon, Sony, Nikon"
                maxLength={50}
              />
            </div>

            <div>
              <label className="label">Model (optional)</label>
              <Input
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                placeholder="e.g., EOS R5"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={5}
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe your item, its condition, what's included..."
                maxLength={2000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {(formData.description || '').length}/2000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Pricing & Condition */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Condition</h2>

          <div className="space-y-6">
            <div>
              <label className="label">Price per Day ($)</label>
              <Input
                type="number"
                name="pricePerDay"
                value={formatCentsToDisplay(formData.pricePerDay)}
                onChange={handlePriceChange}
                error={errors.pricePerDay}
                placeholder="0.00"
                min="1"
                step="0.01"
              />
            </div>

            <div>
              <label className="label">Security Deposit ($)</label>
              <Input
                type="number"
                name="depositAmount"
                value={formatCentsToDisplay(formData.depositAmount)}
                onChange={handlePriceChange}
                error={errors.depositAmount}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="label">Condition</label>
              <div className="space-y-3">
                {CONDITIONS.map((cond) => (
                  <label
                    key={cond.value}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.condition === cond.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={cond.value}
                      checked={formData.condition === cond.value}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{cond.label}</div>
                      <div className="text-sm text-gray-500">{cond.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Availability */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Location & Availability</h2>

          <div className="space-y-6">
            <div>
              <label className="label">Pickup Location</label>
              <Input
                name="pickupLocation"
                value={formData.pickupLocation || ''}
                onChange={handleChange}
                error={errors.pickupLocation}
                placeholder="e.g., Mission District, San Francisco"
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your neighborhood or area. Your exact address stays private.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available ?? true}
                  onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900">Available for rent</span>
              </label>
              <p className="mt-1 text-sm text-gray-500 ml-8">
                Uncheck this to temporarily hide your listing from search results
              </p>
            </div>
          </div>
        </div>

        {/* Images Section */}
        {listing.images.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Images</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {listing.images.map((image) => (
                <div
                  key={image.id}
                  className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={image.imageUrl}
                    alt="Listing"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Image management coming soon
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <Link to="/my-listings">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
