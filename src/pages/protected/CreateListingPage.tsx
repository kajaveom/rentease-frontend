import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { listingsApi } from '../../api/listings'
import { CreateListingRequest, CATEGORIES, CONDITIONS } from '../../types/listing'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import ImageUpload from '../../components/common/ImageUpload'
import toast from 'react-hot-toast'

export default function CreateListingPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateListingRequest>({
    title: '',
    description: '',
    category: 'CAMERA_BODY',
    pricePerDay: 0,
    depositAmount: 0,
    condition: 'GOOD',
    brand: '',
    model: '',
    pickupLocation: '',
    imageUrls: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    // Convert dollars to cents
    const cents = Math.round(parseFloat(value || '0') * 100)
    setFormData((prev) => ({ ...prev, [name]: cents }))
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.description.length > 2000) newErrors.description = 'Description must be less than 2000 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (formData.pricePerDay < 100) newErrors.pricePerDay = 'Price must be at least $1.00'
    if (formData.depositAmount < 0) newErrors.depositAmount = 'Deposit cannot be negative'
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
    else if (step === 3 && validateStep3()) setStep(4)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const listing = await listingsApi.createListing(formData)
      toast.success('Listing created successfully!')
      navigate(`/listings/${listing.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create listing'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCentsToDisplay = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">List Your Item</h1>
        <p className="text-gray-600 mt-1">Step {step} of 4</p>
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

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
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="e.g., Canon EOS R5 with 24-70mm"
              maxLength={100}
            />

            <div>
              <label className="label">Brand (optional)</label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Canon, Sony, Nikon"
                maxLength={50}
              />
            </div>

            <div>
              <label className="label">Model (optional)</label>
              <Input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., EOS R5"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
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
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleNext}>
                Next: Pricing
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Pricing, Condition & Location</h2>

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
              <p className="mt-1 text-sm text-gray-500">
                Payment is arranged directly with renter
              </p>
            </div>

            <div>
              <label className="label">Suggested Deposit ($) - Optional</label>
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
              <p className="mt-1 text-sm text-gray-500">
                Deposit you'll collect directly from renter at pickup
              </p>
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

            <div>
              <label className="label">Pickup Location</label>
              <Input
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                error={errors.pickupLocation}
                placeholder="e.g., Mission District, San Francisco"
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your neighborhood or area. Your exact address stays private.
              </p>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={handleNext}>
                Next: Photos
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Photos</h2>

            <div>
              <label className="label">Add Photos</label>
              <p className="text-sm text-gray-500 mb-3">
                Add up to 5 photos. The first photo will be your primary image.
              </p>
              <ImageUpload
                images={formData.imageUrls || []}
                onChange={(images) => setFormData((prev) => ({ ...prev, imageUrls: images }))}
                maxImages={5}
                type="listing"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Photo tips:</h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Use good lighting to show the item clearly</li>
                <li>Include photos from multiple angles</li>
                <li>Show any included accessories</li>
                <li>Highlight any wear or damage for transparency</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={handleNext}>
                Next: Preview
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Preview & Publish</h2>
            <p className="text-gray-600">Review your listing before publishing.</p>

            {/* Preview Card */}
            <div className="border rounded-lg overflow-hidden">
              {/* Image */}
              <div className="aspect-[16/9] bg-gray-100 relative">
                {formData.imageUrls && formData.imageUrls.length > 0 ? (
                  <img
                    src={formData.imageUrls[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Camera size={80} />
                  </div>
                )}
                {formData.imageUrls && formData.imageUrls.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    +{formData.imageUrls.length - 1} more
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-500 uppercase">
                      {CATEGORIES.find(c => c.value === formData.category)?.label}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">
                      {formData.title || 'Your Item Title'}
                    </h3>
                    {(formData.brand || formData.model) && (
                      <p className="text-gray-600">
                        {formData.brand} {formData.model}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      ${(formData.pricePerDay / 100).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-500">per day</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {CONDITIONS.find(c => c.value === formData.condition)?.label}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {formData.pickupLocation}
                  </span>
                  {formData.depositAmount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ${(formData.depositAmount / 100).toFixed(0)} deposit
                    </span>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {formData.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Publish Listing
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
