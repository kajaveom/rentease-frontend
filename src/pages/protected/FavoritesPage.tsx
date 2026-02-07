import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Package } from 'lucide-react'
import { favoritesApi } from '../../api/favorites'
import { ListingSummary } from '../../types/listing'
import Spinner from '../../components/common/Spinner'
import FavoriteButton from '../../components/common/FavoriteButton'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const [listings, setListings] = useState<ListingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await favoritesApi.getFavorites()
      setListings(response.data || [])
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      toast.error('Failed to load favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId))
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">
            {listings.length} {listings.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4 flex justify-center text-gray-300">
            <Heart size={80} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6">
            Save items you love by clicking the heart icon
          </p>
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 btn-primary"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="relative group">
              <Link
                to={`/listings/${listing.id}`}
                className="card hover:shadow-md transition-shadow block"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {listing.primaryImage ? (
                    <img
                      src={listing.primaryImage}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={48} />
                    </div>
                  )}
                  {!listing.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {listing.pickupLocation}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-primary-600">
                      {formatPrice(listing.pricePerDay)}/day
                    </span>
                    {listing.owner.averageRating && (
                      <span className="text-sm text-gray-600">
                        {listing.owner.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="absolute top-3 right-3">
                <FavoriteButton
                  listingId={listing.id}
                  initialFavorited={true}
                  size="sm"
                  onToggle={(isFavorited) => {
                    if (!isFavorited) {
                      handleRemove(listing.id)
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
