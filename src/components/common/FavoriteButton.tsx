import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { favoritesApi } from '../../api/favorites'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  listingId: string
  initialFavorited?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onToggle?: (isFavorited: boolean) => void
}

export default function FavoriteButton({
  listingId,
  initialFavorited = false,
  size = 'md',
  className = '',
  onToggle,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsFavorited(initialFavorited)
  }, [initialFavorited])

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please log in to save favorites')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      if (isFavorited) {
        await favoritesApi.removeFavorite(listingId)
        setIsFavorited(false)
        toast.success('Removed from favorites')
        onToggle?.(false)
      } else {
        await favoritesApi.addFavorite(listingId)
        setIsFavorited(true)
        toast.success('Added to favorites')
        onToggle?.(true)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
        isFavorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white'
      } shadow-md hover:shadow-lg disabled:opacity-50 ${className}`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={iconSizes[size]}
        className={`transition-transform duration-200 ${isLoading ? 'animate-pulse' : ''}`}
        fill={isFavorited ? 'currentColor' : 'none'}
      />
    </button>
  )
}
