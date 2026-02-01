import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">RentEase</h3>
            <p className="text-sm text-gray-600">
              Rent anything from people nearby. Save money. Make money.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/listings?category=CAMERA_BODY" className="text-gray-600 hover:text-gray-900">Cameras</Link></li>
              <li><Link to="/listings?category=LENS" className="text-gray-600 hover:text-gray-900">Lenses</Link></li>
              <li><Link to="/listings?category=LIGHTING" className="text-gray-600 hover:text-gray-900">Lighting</Link></li>
              <li><Link to="/listings?category=AUDIO" className="text-gray-600 hover:text-gray-900">Audio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
              <li><Link to="/trust" className="text-gray-600 hover:text-gray-900">Trust & Safety</Link></li>
              <li><Link to="/help" className="text-gray-600 hover:text-gray-900">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} RentEase. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
