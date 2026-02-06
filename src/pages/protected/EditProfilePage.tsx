import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { imagesApi } from '../../api/images'
import { User, UpdateProfileRequest } from '../../types/user'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    avatarUrl: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    setIsLoading(true)
    try {
      const userData = await usersApi.getCurrentUser()
      setUser(userData)
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio || '',
        location: userData.location || '',
        avatarUrl: userData.avatarUrl || '',
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
      toast.error('Failed to load profile')
      navigate('/profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const url = await imagesApi.uploadAvatar(file)
      setFormData({ ...formData, avatarUrl: url })
      toast.success('Avatar uploaded')
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      await usersApi.updateProfile(formData)
      toast.success('Profile updated')
      refreshUser?.()
      navigate('/profile')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
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
        <Link to="/profile" className="text-primary-600 hover:text-primary-700">
          &larr; Back to Profile
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-medium text-primary-600">
                    {formData.firstName?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="btn-primary inline-block cursor-pointer"
              >
                {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </label>
              <p className="mt-2 text-sm text-gray-500">
                JPG, PNG, WebP or GIF. Max 10MB.
              </p>
              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={errors.firstName}
                maxLength={100}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={errors.lastName}
                maxLength={100}
              />
            </div>

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, State"
              maxLength={100}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About You</h2>
          <div>
            <label className="label">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className={`input ${errors.bio ? 'input-error' : ''}`}
              placeholder="Tell others a bit about yourself..."
              maxLength={500}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.bio || '').length}/500 characters
            </p>
          </div>
        </div>

        {/* Account Info (read-only) */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Email</label>
              <p className="text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                {user?.emailVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Not verified</span>
                )}
              </p>
            </div>
            <div>
              <label className="label">ID Verification</label>
              <p className="text-gray-900">
                {user?.idVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <Link to="/verify-id" className="text-primary-600 hover:text-primary-700">
                    Get verified
                  </Link>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <Link to="/profile">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
