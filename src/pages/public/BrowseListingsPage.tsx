import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listingsApi } from '../../api/listings'
import { ListingSummary, CATEGORIES } from '../../types/listing'
import Spinner from '../../components/common/Spinner'

export default function BrowseListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState<ListingSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalElements, setTotalElements] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')

  const category = searchParams.get('category') || ''
  const search = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  // Sync inputs with URL params on mount
  useEffect(() => {
    setSearchInput(search)
    setMinPriceInput(minPrice ? String(parseInt(minPrice) / 100) : '')
    setMaxPriceInput(maxPrice ? String(parseInt(maxPrice) / 100) : '')
  }, [])

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const response = await listingsApi.getListings({
          category: category || undefined,
          q: search || undefined,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          sort: sort as 'newest' | 'price_asc' | 'price_desc',
        })
        setListings(response.data || [])
        setTotalElements(response.pagination?.totalElements || 0)
      } catch (error) {
        console.error('Failed to fetch listings:', error)
        setListings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [category, search, sort, minPrice, maxPrice])

  const handleCategoryChange = (value: string) => {
    if (value) {
      searchParams.set('category', value)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  const handleSortChange = (value: string) => {
    searchParams.set('sort', value)
    setSearchParams(searchParams)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      searchParams.set('q', searchInput.trim())
    } else {
      searchParams.delete('q')
    }
    setSearchParams(searchParams)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    searchParams.delete('q')
    setSearchParams(searchParams)
  }

  const handlePriceFilter = () => {
    if (minPriceInput) {
      searchParams.set('minPrice', String(Math.round(parseFloat(minPriceInput) * 100)))
    } else {
      searchParams.delete('minPrice')
    }
    if (maxPriceInput) {
      searchParams.set('maxPrice', String(Math.round(parseFloat(maxPriceInput) * 100)))
    } else {
      searchParams.delete('maxPrice')
    }
    setSearchParams(searchParams)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setSearchParams(new URLSearchParams())
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value
  }

  const hasActiveFilters = category || search || minPrice || maxPrice

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for cameras, lenses, audio gear..."
              className="input pl-10 w-full"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
        {search && (
          <p className="text-sm text-gray-600 mt-2">
            Showing results for "<span className="font-medium">{search}</span>"
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="label">Price Range ($/day)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder="Min"
                  className="input w-full"
                  min="0"
                  step="1"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder="Max"
                  className="input w-full"
                  min="0"
                  step="1"
                />
              </div>
              <button
                type="button"
                onClick={handlePriceFilter}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Apply price filter
              </button>
            </div>

            <div className="mb-4">
              <label className="label">Sort By</label>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {category ? getCategoryLabel(category) : 'All Items'}
            </h1>
            <span className="text-gray-600">
              {totalElements} {totalElements === 1 ? 'listing' : 'listings'}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 mb-4">No listings found</p>
              <Link to="/listings/new" className="btn-primary">
                Be the first to list an item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative">
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
                    {!listing.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {listing.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {listing.pickupLocation}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-primary-600">
                        {formatPrice(listing.pricePerDay)}/day
                      </span>
                      <div className="flex items-center gap-2">
                        {listing.owner.idVerified && (
                          <span className="text-xs text-green-600">Verified</span>
                        )}
                        {listing.owner.averageRating && (
                          <span className="text-sm text-gray-600">
                            {listing.owner.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
