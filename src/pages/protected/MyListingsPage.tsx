import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listingsApi } from '../../api/listings'
import { ListingSummary } from '../../types/listing'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function MyListingsPage() {
  const [listings, setListings] = useState<ListingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setIsLoading(true)
    try {
      const response = await listingsApi.getMyListings()
      setListings(response.data || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      toast.error('Failed to load your listings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      await listingsApi.deleteListing(id)
      setListings(listings.filter(l => l.id !== id))
      toast.success('Listing deleted')
    } catch (error) {
      toast.error('Failed to delete listing')
    }
  }

  const handleToggleAvailability = async (listing: ListingSummary) => {
    try {
      await listingsApi.updateListing(listing.id, { available: !listing.available })
      setListings(listings.map(l =>
        l.id === listing.id ? { ...l, available: !l.available } : l
      ))
      toast.success(listing.available ? 'Listing marked as unavailable' : 'Listing is now available')
    } catch (error) {
      toast.error('Failed to update listing')
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link to="/listings/new">
          <Button>Create Listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h2>
          <p className="text-gray-600 mb-6">
            Start earning by listing your items for rent
          </p>
          <Link to="/listings/new">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="card p-4 flex gap-4">
              <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {listing.primaryImage ? (
                  <img
                    src={listing.primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/listings/${listing.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(listing.pricePerDay)}/day · {listing.pickupLocation}
                    </p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    listing.available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link to={`/listings/${listing.id}/edit`}>
                    <Button size="sm" variant="secondary">Edit</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggleAvailability(listing)}
                  >
                    {listing.available ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
