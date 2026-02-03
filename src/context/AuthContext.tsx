import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types/user'
import { LoginRequest, RegisterRequest } from '../types/auth'
import { authApi } from '../api/auth'
import { usersApi } from '../api/users'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  googleLogin: (credential: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')

      if (accessToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data)
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    toast.success('Welcome back!')
  }

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    toast.success('Account created successfully!')
  }

  const googleLogin = async (credential: string) => {
    const response = await authApi.googleAuth(credential)
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    toast.success('Welcome!')
  }

  const logout = () => {
    authApi.logout()
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const refreshUser = async () => {
    try {
      const userData = await usersApi.getCurrentUser()
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
