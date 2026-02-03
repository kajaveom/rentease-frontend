import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface GoogleSignInButtonProps {
  onSuccess?: () => void
}

export default function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error('Google sign-in failed')
      return
    }

    try {
      await googleLogin(response.credential)
      onSuccess?.()
      navigate('/dashboard')
    } catch (error) {
      console.error('Google login error:', error)
      toast.error(error instanceof Error ? error.message : 'Google sign-in failed')
    }
  }

  const handleError = () => {
    toast.error('Google sign-in failed')
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
      />
    </div>
  )
}
