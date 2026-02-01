import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { PublicProfile } from '../../types/user'
import { ListingSummary } from '../../types/listing'
import { Review } from '../../types/review'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/common/Spinner'
import ReviewCard from '../../components/review/ReviewCard'
import toast from 'react-hot-toast'

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [listings, setListings] = useState<ListingSummary[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')

  useEffect(() => {
    if (id) {
      fetchProfile()
    }
  }, [id])

  const fetchProfile = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const [profileData, listingsData, reviewsData] = await Promise.all([
        usersApi.getPublicProfile(id),
        usersApi.getUserListings(id),
        usersApi.getUserReviews(id),
      ])
      setProfile(profileData)
      setListings(listingsData.data || [])
      setReviews(reviewsData.data || [])
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">404</div>
        <p className="text-gray-600 mb-4">User not found</p>
        <Link to="/listings" className="btn-primary">
          Browse Listings
        </Link>
      </div>
    )
  }

  // Redirect to own profile page if viewing self
  if (currentUser?.id === profile.id) {
    window.location.href = '/profile'
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-medium text-primary-600">
                  {profile.firstName.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastInitial}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
              {profile.location && <span>{profile.location}</span>}
              <span>Member since {formatDate(profile.memberSince)}</span>
            </div>

            <div className="flex gap-4 mt-4">
              {profile.idVerified && (
                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ID Verified
                </span>
              )}
              {profile.averageRating && (
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {profile.averageRating.toFixed(1)} ({profile.totalReviews} reviews)
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'listings' && (
        <div>
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No listings available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-100">
                    {listing.primaryImage ? (
                      <img
                        src={listing.primaryImage}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{listing.pickupLocation}</p>
                    <p className="font-bold text-primary-600 mt-2">
                      {formatPrice(listing.pricePerDay)}/day
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showListing />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
