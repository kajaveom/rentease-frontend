import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Listings</h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage your item listings
          </p>
          <Link to="/my-listings">
            <Button variant="secondary" size="sm">View Listings</Button>
          </Link>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h3>
          <p className="text-gray-600 text-sm mb-4">
            Track your rentals
          </p>
          <Link to="/my-bookings">
            <Button variant="secondary" size="sm">View Bookings</Button>
          </Link>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
          <p className="text-gray-600 text-sm mb-4">
            Chat with renters and owners
          </p>
          <Link to="/messages">
            <Button variant="secondary" size="sm">View Messages</Button>
          </Link>
        </div>
      </div>

      {!user?.idVerified && (
        <div className="card p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Verify Your Identity
          </h3>
          <p className="text-yellow-700 text-sm mb-4">
            To list items for rent, you need to verify your identity first.
            This helps build trust in our community.
          </p>
          <Link to="/verify-id">
            <Button size="sm">Verify Now</Button>
          </Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/listings/new">
            <Button>List New Item</Button>
          </Link>
          <Link to="/listings">
            <Button variant="secondary">Browse Items</Button>
          </Link>
          <Link to="/profile">
            <Button variant="secondary">Edit Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
