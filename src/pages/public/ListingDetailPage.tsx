import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { listingsApi } from '../../api/listings'
import { messagesApi } from '../../api/messages'
import { favoritesApi } from '../../api/favorites'
import { Listing, CONDITIONS } from '../../types/listing'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import FavoriteButton from '../../components/common/FavoriteButton'
import ReviewList from '../../components/review/ReviewList'
import toast from 'react-hot-toast'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [hasInitializedMessage, setHasInitializedMessage] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await listingsApi.getListing(id)
        setListing(data)
      } catch (error) {
        console.error('Failed to fetch listing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id])

  useEffect(() => {
    const checkFavorite = async () => {
      if (!id || !isAuthenticated) return
      try {
        const favorited = await favoritesApi.checkFavorite(id)
        setIsFavorited(favorited)
      } catch (error) {
        // Ignore errors - not critical
      }
    }
    checkFavorite()
  }, [id, isAuthenticated])

  const handleContactOwner = async () => {
    if (!listing || !contactMessage.trim()) return

    setIsSendingMessage(true)
    try {
      const conversation = await messagesApi.startConversation(
        listing.owner.id,
        listing.id,
        contactMessage.trim()
      )
      toast.success('Message sent!')
      setShowContactModal(false)
      setContactMessage('')
      navigate(`/messages/${conversation.id}`)
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const getConditionLabel = (value: string) => {
    return CONDITIONS.find(c => c.value === value)?.label || value
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
        <div className="text-6xl mb-4">404</div>
        <p className="text-gray-600 mb-4">Listing not found</p>
        <Link to="/listings" className="btn-primary">
          Browse Listings
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === listing.owner.id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link to="/listings" className="text-primary-600 hover:text-primary-700">
          &larr; Back to listings
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            {listing.images.length > 0 ? (
              <img
                src={listing.images[selectedImage]?.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={80} />
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {listing.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                initialFavorited={isFavorited}
                size="lg"
                onToggle={setIsFavorited}
              />
            )}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-600">{listing.pickupLocation}</span>
            <span className="text-sm px-2 py-1 bg-gray-100 rounded">
              {getConditionLabel(listing.condition)}
            </span>
          </div>

          {/* Pricing Card */}
          <div className="card p-6 mt-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(listing.pricePerDay)}
              </span>
              <span className="text-gray-600">/ day</span>
            </div>

            <div className="text-sm text-gray-600 mt-2">
              Security deposit: {formatPrice(listing.depositAmount)}
            </div>

            {!isOwner && (
              <div className="mt-6 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to={`/listings/${listing.id}/book`}>
                      <Button className="w-full" disabled={!listing.available}>
                        {listing.available ? 'Request to Book' : 'Currently Unavailable'}
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        if (!hasInitializedMessage && listing) {
                          setContactMessage(
                            `Hi ${listing.owner.firstName}! I'm interested in renting your "${listing.title}" (${formatPrice(listing.pricePerDay)}/day). Is it available?`
                          )
                          setHasInitializedMessage(true)
                        }
                        setShowContactModal(true)
                      }}
                    >
                      Contact Owner
                    </Button>
                  </>
                ) : (
                  <Link to="/login" state={{ from: { pathname: `/listings/${listing.id}` } }}>
                    <Button className="w-full">Log in to Book</Button>
                  </Link>
                )}
              </div>
            )}

            {isOwner && (
              <div className="mt-6 space-y-2">
                <Link to={`/listings/${listing.id}/edit`}>
                  <Button variant="secondary" className="w-full">Edit Listing</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Details */}
          {(listing.brand || listing.model) && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-2">Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                {listing.brand && (
                  <div>
                    <dt className="text-sm text-gray-500">Brand</dt>
                    <dd className="text-gray-900">{listing.brand}</dd>
                  </div>
                )}
                {listing.model && (
                  <div>
                    <dt className="text-sm text-gray-500">Model</dt>
                    <dd className="text-gray-900">{listing.model}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Owner */}
          <div className="mt-8 pt-8 border-t">
            <h2 className="font-semibold text-gray-900 mb-4">About the Owner</h2>
            <Link to={`/users/${listing.owner.id}`} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {listing.owner.avatarUrl ? (
                  <img
                    src={listing.owner.avatarUrl}
                    alt={listing.owner.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-medium text-primary-600">
                    {listing.owner.firstName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {listing.owner.firstName} {listing.owner.lastName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {listing.owner.idVerified && (
                    <span className="text-green-600">Verified</span>
                  )}
                  {listing.owner.averageRating && (
                    <span>{listing.owner.averageRating.toFixed(1)} ({listing.owner.totalReviews} reviews)</span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
        <ReviewList listingId={listing.id} isOwner={isOwner} />
      </div>

      {/* Contact Owner Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Owner</h2>
            <p className="text-sm text-gray-600 mb-4">
              Send a message to {listing.owner.firstName} about "{listing.title}"
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className="input w-full mb-4"
              maxLength={500}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowContactModal(false)
                  setContactMessage('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContactOwner}
                disabled={!contactMessage.trim()}
                isLoading={isSendingMessage}
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
