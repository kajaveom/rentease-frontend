import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { messagesApi } from '../../api/messages'
import { Conversation, Message } from '../../types/message'
import { useAuth } from '../../context/AuthContext'
import { useWebSocket } from '../../hooks/useWebSocket'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Handle incoming WebSocket message
  const handleWebSocketMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
  }, [])

  // Handle typing indicator
  const handleTyping = useCallback((data: { userId: string; firstName: string }) => {
    if (data.userId !== user?.id) {
      setIsTyping(data.firstName)
      // Clear typing indicator after 3 seconds
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => setIsTyping(null), 3000)
    }
  }, [user?.id])

  // Handle read receipt
  const handleRead = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) => (m.sender.id === user?.id ? { ...m, isRead: true } : m))
    )
  }, [user?.id])

  // WebSocket connection for real-time updates
  const { isConnected, sendTyping, markRead } = useWebSocket({
    conversationId: id,
    onMessage: handleWebSocketMessage,
    onTyping: handleTyping,
    onRead: handleRead,
  })

  useEffect(() => {
    if (id) {
      fetchConversation()
      fetchMessages()
    }
  }, [id])

  // Fallback polling only if WebSocket is not connected
  useEffect(() => {
    if (!id || isConnected) return

    const pollInterval = setInterval(() => {
      fetchMessagesQuietly()
    }, 15000)

    return () => clearInterval(pollInterval)
  }, [id, isConnected])

  const fetchMessagesQuietly = async () => {
    if (!id) return
    try {
      const response = await messagesApi.getMessages(id)
      const newMessages = (response.data || []).reverse()
      // Use callback form to avoid stale closure issue
      setMessages((prev) => {
        if (newMessages.length > prev.length) {
          return newMessages
        }
        return prev
      })
    } catch (error) {
      console.error('Poll failed:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Mark as read when viewing
    if (id && conversation && conversation.unreadCount > 0) {
      if (isConnected) {
        markRead()
      } else {
        messagesApi.markAsRead(id).catch(console.error)
      }
    }
  }, [id, conversation, isConnected, markRead])

  const fetchConversation = async () => {
    if (!id) return
    try {
      const data = await messagesApi.getConversation(id)
      setConversation(data)
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
      toast.error('Failed to load conversation')
    }
  }

  const fetchMessages = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await messagesApi.getMessages(id)
      setMessages((response.data || []).reverse())
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[ConversationPage] handleSend triggered', { newMessage, id, isSending })

    if (!newMessage.trim() || !id || isSending) {
      console.log('[ConversationPage] Early return - validation failed')
      return
    }

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsSending(true)
    inputRef.current?.focus()

    try {
      console.log('[ConversationPage] Sending message via API...')
      const message = await messagesApi.sendMessage(id, messageContent)
      console.log('[ConversationPage] API response:', message)

      setMessages((prev) => {
        console.log('[ConversationPage] Previous messages count:', prev.length)
        // Avoid duplicates (WebSocket might have already added it)
        if (prev.some((m) => m.id === message.id)) {
          console.log('[ConversationPage] Message already exists, skipping')
          return prev
        }
        const updated = [...prev, message]
        console.log('[ConversationPage] Updated messages count:', updated.length)
        return updated
      })
    } catch (error) {
      console.error('[ConversationPage] Failed to send message:', error)
      toast.error('Failed to send message')
      setNewMessage(messageContent) // Restore message on failure
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e as any)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    // Send typing indicator (debounced via WebSocket)
    if (isConnected) {
      sendTyping()
    }
  }

  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Today'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Today'

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    }
  }

  const shouldShowDate = (index: number) => {
    if (index === 0) return true
    const currentDate = messages[index].createdAt
    const previousDate = messages[index - 1].createdAt
    if (!currentDate || !previousDate) return false
    const current = new Date(currentDate).toDateString()
    const previous = new Date(previousDate).toDateString()
    return current !== previous
  }

  if (isLoading && !conversation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Conversation not found</p>
        <Link to="/messages" className="btn-primary">
          Back to Messages
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/messages" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
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

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {conversation.otherParticipant.firstName}{' '}
              {conversation.otherParticipant.lastName}
              {conversation.otherParticipant.idVerified && (
                <span className="ml-1 text-green-600 text-sm">✓</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Link
                to={`/listings/${conversation.listing.id}`}
                className="text-sm text-primary-600 hover:text-primary-700 truncate"
              >
                {conversation.listing.title}
              </Link>
              {isConnected && (
                <span className="w-2 h-2 bg-green-500 rounded-full" title="Real-time connected" />
              )}
            </div>
          </div>

          {conversation.bookingId && (
            <Link to={`/bookings/${conversation.bookingId}`}>
              <Button size="sm" variant="secondary">View Booking</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender.id === user?.id
            return (
              <div key={message.id}>
                {shouldShowDate(index) && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                          {message.sender.avatarUrl ? (
                            <img
                              src={message.sender.avatarUrl}
                              alt={message.sender.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary-600">
                              {message.sender.firstName.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                        {formatTime(message.createdAt)}
                        {isOwn && message.isRead && (
                          <span className="ml-1">· Read</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
              <p className="text-sm text-gray-500">{isTyping} is typing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t bg-white px-4 py-3">
        <form onSubmit={handleSend} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="input flex-1 resize-none min-h-[44px] max-h-32"
            style={{ height: 'auto' }}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            isLoading={isSending}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
