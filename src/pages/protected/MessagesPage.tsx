import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { messagesApi } from '../../api/messages'
import { Conversation } from '../../types/message'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  // Poll for new conversations/updates every 20 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchConversationsQuietly()
    }, 20000)

    return () => clearInterval(pollInterval)
  }, [])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const response = await messagesApi.getConversations()
      setConversations(response.data || [])
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConversationsQuietly = async () => {
    try {
      const response = await messagesApi.getConversations()
      setConversations(response.data || [])
    } catch (error) {
      console.error('Poll failed:', error)
    }
  }

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h2>
          <p className="text-gray-600 mb-6">
            When you message owners or receive inquiries, they'll appear here
          </p>
          <Link to="/listings" className="btn-primary">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="card divide-y">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className="flex gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {conversation.otherParticipant.avatarUrl ? (
                    <img
                      src={conversation.otherParticipant.avatarUrl}
                      alt={conversation.otherParticipant.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-primary-600">
                      {conversation.otherParticipant.firstName.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${
                      conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {conversation.otherParticipant.firstName}{' '}
                      {conversation.otherParticipant.lastName}
                      {conversation.otherParticipant.idVerified && (
                        <span className="ml-1 text-green-600 text-sm">✓</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.listing.title}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2 text-right">
                    <p className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessageAt)}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 mt-1 text-xs font-medium text-white bg-primary-600 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <p className={`text-sm mt-1 truncate ${
                  conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {conversation.lastMessagePreview || 'No messages yet'}
                </p>
              </div>

              {/* Listing Thumbnail */}
              <div className="flex-shrink-0 hidden sm:block">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  {conversation.listing.primaryImage ? (
                    <img
                      src={conversation.listing.primaryImage}
                      alt={conversation.listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={24} />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
