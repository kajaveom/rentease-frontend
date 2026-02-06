import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { imagesApi } from '../../api/images'
import { IdVerificationResponse, IdVerificationRequest } from '../../types/user'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

const documentTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID Card' },
]

export default function VerifyIdPage() {
  const { refreshUser } = useAuth()
  const [verification, setVerification] = useState<IdVerificationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState<IdVerificationRequest>({
    documentUrl: '',
    documentType: 'passport',
  })

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const status = await usersApi.getVerificationStatus()
      setVerification(status)
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
      toast.error('Failed to load verification status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be less than 10MB')
      return
    }

    setIsUploading(true)
    try {
      const url = await imagesApi.uploadIdDocument(file)
      setFormData({ ...formData, documentUrl: url })
      toast.success('Document uploaded')
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.documentUrl.trim()) {
      toast.error('Please provide a document URL')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await usersApi.submitVerification(formData)
      setVerification(response)
      toast.success('Verification submitted successfully')
      refreshUser()
    } catch (error) {
      console.error('Failed to submit verification:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit verification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      const response = await usersApi.cancelVerification()
      setVerification(response)
      toast.success('Verification request cancelled')
      refreshUser()
    } catch (error) {
      console.error('Failed to cancel verification:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel verification')
    } finally {
      setIsCancelling(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/profile/edit" className="text-primary-600 hover:text-primary-700">
          &larr; Back to Profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">ID Verification</h1>
      <p className="text-gray-600 mb-8">
        Verify your identity to build trust with other users and unlock additional features.
      </p>

      {/* Already Verified */}
      {verification?.idVerified && (
        <div className="card p-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-800">ID Verified</h2>
              <p className="text-green-700">
                Your identity has been verified. You now have access to all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Verification */}
      {verification?.status === 'PENDING' && (
        <div className="card p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-yellow-800">Verification Pending</h2>
              <p className="text-yellow-700 mb-2">
                Your verification is being reviewed. This usually takes 1-2 business days.
              </p>
              {verification.submittedAt && (
                <p className="text-sm text-yellow-600">
                  Submitted on {formatDate(verification.submittedAt)}
                </p>
              )}
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="mt-4 px-4 py-2 text-sm text-yellow-700 border border-yellow-400 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejected */}
      {verification?.status === 'REJECTED' && (
        <div className="card p-6 border-red-200 bg-red-50 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-800">Verification Rejected</h2>
              <p className="text-red-700">
                Your previous verification request was not approved.
              </p>
              {verification.rejectionReason && (
                <p className="mt-2 text-sm text-red-600">
                  <span className="font-medium">Reason:</span> {verification.rejectionReason}
                </p>
              )}
              <p className="mt-2 text-sm text-red-600">
                Please submit a new request with a valid document.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Form - Show only if not verified and not pending */}
      {!verification?.idVerified && verification?.status !== 'PENDING' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Verification</h2>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Benefits of verification:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified badge on your profile
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Increased trust from renters and owners
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Higher booking acceptance rates
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access to premium features
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                id="documentType"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="input"
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Photo
              </label>
              {formData.documentUrl ? (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={formData.documentUrl}
                      alt="ID Document Preview"
                      className="max-w-full max-h-48 rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, documentUrl: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Spinner size="md" />
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-10 w-10 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-primary-600">Click to upload</span> your ID photo
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG or WebP up to 10MB
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Photo guidelines:</h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Ensure all four corners of the document are visible</li>
                <li>Make sure the text is clearly readable</li>
                <li>Avoid glare or reflections on the document</li>
                <li>The document must not be expired</li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.documentUrl}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Your documents are securely stored and only used for verification purposes.
          We comply with all applicable privacy regulations.
        </p>
      </div>
    </div>
  )
}
