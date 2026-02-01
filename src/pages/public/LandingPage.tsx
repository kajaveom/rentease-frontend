import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'

const categories = [
  { name: 'Cameras', value: 'CAMERA_BODY', icon: '📷' },
  { name: 'Lenses', value: 'LENS', icon: '🔭' },
  { name: 'Lighting', value: 'LIGHTING', icon: '💡' },
  { name: 'Audio', value: 'AUDIO', icon: '🎤' },
  { name: 'Drones', value: 'DRONE', icon: '🚁' },
  { name: 'Accessories', value: 'ACCESSORY', icon: '🎒' },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Rent Anything From{' '}
              <span className="text-primary-600">People Nearby</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Save money renting what you need. Make money sharing what you have.
              Join our peer-to-peer rental community today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/listings">
                <Button size="lg">Browse Items</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg">List Your Items</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.value}
                to={`/listings?category=${category.value}`}
                className="card p-6 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-4xl mb-2 block">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Find Items', description: 'Browse items available for rent in your area' },
              { step: 2, title: 'Book & Pay', description: 'Request dates and pay securely through our platform' },
              { step: 3, title: 'Pick Up', description: 'Meet the owner and collect your rental' },
              { step: 4, title: 'Enjoy & Return', description: 'Use the item, return it, and leave a review' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Rent with Confidence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We take trust and safety seriously. Here&apos;s how we protect our community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'ID Verification',
                description: 'All owners verify their identity before listing items',
                icon: '🔐',
              },
              {
                title: 'Secure Payments',
                description: 'Pay through our platform with deposit protection',
                icon: '💳',
              },
              {
                title: 'Reviews & Ratings',
                description: 'Make informed decisions with community feedback',
                icon: '⭐',
              },
            ].map((item) => (
              <div key={item.title} className="card p-6 text-center">
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to start sharing?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our community. List your items and start earning, or find what you need for your next project.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
