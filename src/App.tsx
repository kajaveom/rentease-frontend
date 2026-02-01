import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProtectedRoute from './routes/ProtectedRoute'

// Public pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import BrowseListingsPage from './pages/public/BrowseListingsPage'
import ListingDetailPage from './pages/public/ListingDetailPage'
import PublicProfilePage from './pages/public/PublicProfilePage'

// Protected pages
import DashboardPage from './pages/protected/DashboardPage'
import CreateListingPage from './pages/protected/CreateListingPage'
import EditListingPage from './pages/protected/EditListingPage'
import MyListingsPage from './pages/protected/MyListingsPage'
import BookingRequestPage from './pages/protected/BookingRequestPage'
import MyBookingsPage from './pages/protected/MyBookingsPage'
import BookingRequestsPage from './pages/protected/BookingRequestsPage'
import BookingDetailPage from './pages/protected/BookingDetailPage'
import MessagesPage from './pages/protected/MessagesPage'
import ConversationPage from './pages/protected/ConversationPage'
import ProfilePage from './pages/protected/ProfilePage'
import EditProfilePage from './pages/protected/EditProfilePage'
import SettingsPage from './pages/protected/SettingsPage'
import VerifyIdPage from './pages/protected/VerifyIdPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings" element={<BrowseListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/new"
            element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              <ProtectedRoute>
                <EditListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/book"
            element={
              <ProtectedRoute>
                <BookingRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-requests"
            element={
              <ProtectedRoute>
                <BookingRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-id"
            element={
              <ProtectedRoute>
                <VerifyIdPage />
              </ProtectedRoute>
            }
          />

          {/* Public user profile */}
          <Route path="/users/:id" element={<PublicProfilePage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a href="/" className="btn-primary">
          Go Home
        </a>
      </div>
    </div>
  )
}

export default App
