import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usersApi } from '../../api/users'
import { ChangePasswordRequest } from '../../types/user'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeSection, setActiveSection] = useState<'password' | 'delete'>('password')

  // Password change state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsChangingPassword(true)
    try {
      await usersApi.changePassword(passwordForm)
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setConfirmPassword('')
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setIsDeletingAccount(true)
    try {
      await usersApi.deleteAccount()
      toast.success('Account deleted successfully')
      logout()
      navigate('/')
    } catch (error) {
      console.error('Failed to delete account:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('password')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'password'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveSection('delete')}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'delete'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Delete Account
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'password' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <p className="text-sm text-gray-600 mb-6">
                Update your password to keep your account secure.
              </p>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="btn-primary"
                  >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'delete' && (
            <div className="card p-6 border-red-200">
              <h2 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">Warning: This action cannot be undone</h3>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Your profile information will be permanently removed</li>
                  <li>Your listings will be deactivated</li>
                  <li>You will lose access to your booking history</li>
                  <li>Your reviews will remain but will show as from a deleted user</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="input"
                    placeholder="Type DELETE here"
                  />
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmation !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
