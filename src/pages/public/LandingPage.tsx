import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  CalendarDays,
  Handshake,
  Star,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  MapPin,
  Package,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listingsApi } from '../../api/listings'
import { ListingSummary, CATEGORIES } from '../../types/listing'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import CategoryIcon, { categoryColors } from '../../components/common/CategoryIcon'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [recentListings, setRecentListings] = useState<ListingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const listings = await listingsApi.getRecentListings(8)
        setRecentListings(listings)
      } catch (error) {
        console.error('Failed to fetch recent listings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecentListings()
  }, [])

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-accent-200 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Rent Anything,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
                Anywhere
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Save money renting what you need. Make money sharing what you have.
              Join our peer-to-peer rental community today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/listings">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Items
                </Button>
              </Link>
              <Link to={isAuthenticated ? "/listings/new" : "/register"}>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  List Your Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.value}
                to={`/listings?category=${category.value}`}
                className="group"
              >
                <div className={`${categoryColors[category.value]?.split(' ')[0] || 'bg-gray-100'} rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-2`}>
                  <div className="mb-3 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    <CategoryIcon category={category.value} size={48} className={categoryColors[category.value]?.split(' ')[1] || 'text-gray-600'} />
                  </div>
                  <span className="font-semibold text-gray-900">{category.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              Recently Added
            </h2>
            <Link to="/listings" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              View all
              <ChevronRight size={20} />
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="group"
                >
                  <div className="card-hover">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {listing.primaryImage ? (
                        <img
                          src={listing.primaryImage}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={64} />
                        </div>
                      )}
                      {/* Price badge */}
                      <div className="absolute top-3 right-3 glass rounded-full px-3 py-1.5 shadow-lg">
                        <span className="font-bold text-primary-600">{formatPrice(listing.pricePerDay)}</span>
                        <span className="text-gray-500 text-sm">/day</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate mt-1 flex items-center gap-1">
                        <MapPin size={16} />
                        {listing.pickupLocation}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mb-4 flex justify-center text-gray-300">
                <Package size={80} />
              </div>
              <p className="text-gray-500 text-lg">No listings yet. Be the first to list an item!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Find Items', description: 'Browse items available for rent in your area', Icon: Search },
              { step: 2, title: 'Request', description: 'Send a booking request for the dates you need', Icon: CalendarDays },
              { step: 3, title: 'Pick Up', description: 'Meet the owner and arrange payment directly', Icon: Handshake },
              { step: 4, title: 'Enjoy & Return', description: 'Use the item, return it, and leave a review', Icon: Star },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <item.Icon size={36} />
                </div>
                <div className="text-sm font-bold text-primary-600 mb-2">Step {item.step}</div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Rent with Confidence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We take trust and safety seriously. Here&apos;s how we protect our community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'ID Verification',
                description: 'All owners verify their identity before listing items',
                Icon: ShieldCheck,
                color: 'from-violet-500 to-purple-600',
              },
              {
                title: 'Direct Communication',
                description: 'Message owners directly to arrange pickup and payment',
                Icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Reviews & Ratings',
                description: 'Make informed decisions with community feedback',
                Icon: Star,
                color: 'from-amber-500 to-orange-500',
              },
            ].map((item) => (
              <div key={item.title} className="card p-8 text-center hover:shadow-soft-lg transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg`}>
                  <item.Icon size={32} />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            {isAuthenticated ? "Ready to list your first item?" : "Ready to start sharing?"}
          </h2>
          <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg">
            {isAuthenticated
              ? "Start earning by listing items you're not using. It only takes a few minutes."
              : "Join our community. List your items and start earning, or find what you need for your next project."}
          </p>
          <Link to={isAuthenticated ? "/listings/new" : "/register"}>
            <Button variant="accent" size="lg">
              {isAuthenticated ? "Create a Listing" : "Create Your Account"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
