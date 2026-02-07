import { useEffect, useRef, useCallback, useState } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { useAuth } from '../context/AuthContext'

const getWsUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    return apiUrl.replace('/api/v1', '') + '/ws'
  }
  return 'http://localhost:8080/ws'
}

const WS_URL = getWsUrl()

interface UseWebSocketOptions {
  conversationId?: string
  onMessage?: (message: any) => void
  onTyping?: (data: { userId: string; firstName: string }) => void
  onRead?: (data: { userId: string }) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { conversationId, onMessage, onTyping, onRead } = options
  const { token, isAuthenticated } = useAuth()
  const clientRef = useRef<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Use refs for callbacks to avoid reconnection on callback changes
  const onMessageRef = useRef(onMessage)
  const onTypingRef = useRef(onTyping)
  const onReadRef = useRef(onRead)

  // Keep refs updated
  useEffect(() => {
    onMessageRef.current = onMessage
    onTypingRef.current = onTyping
    onReadRef.current = onRead
  }, [onMessage, onTyping, onRead])

  // Connect to WebSocket
  useEffect(() => {
    if (!isAuthenticated || !token || !conversationId) {
      return
    }

    let client: Client | null = null
    let isCleanedUp = false

    const connect = () => {
      try {
        console.log('[WebSocket] Connecting to', WS_URL)

        client = new Client({
          webSocketFactory: () => new SockJS(WS_URL),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            if (import.meta.env.DEV) {
              console.log('[STOMP]', str)
            }
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        })

        client.onConnect = () => {
          if (isCleanedUp) return

          console.log('[WebSocket] Connected, subscribing to conversation:', conversationId)
          setIsConnected(true)

          // Subscribe to messages
          client?.subscribe(`/topic/conversation/${conversationId}`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body)
              console.log('[WebSocket] Message received:', data)
              onMessageRef.current?.(data)
            } catch (e) {
              console.error('[WebSocket] Failed to parse message:', e)
            }
          })

          // Subscribe to typing indicators
          client?.subscribe(`/topic/conversation/${conversationId}/typing`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body)
              onTypingRef.current?.(data)
            } catch (e) {
              console.error('[WebSocket] Failed to parse typing:', e)
            }
          })

          // Subscribe to read receipts
          client?.subscribe(`/topic/conversation/${conversationId}/read`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body)
              onReadRef.current?.(data)
            } catch (e) {
              console.error('[WebSocket] Failed to parse read:', e)
            }
          })
        }

        client.onDisconnect = () => {
          console.log('[WebSocket] Disconnected')
          if (!isCleanedUp) {
            setIsConnected(false)
          }
        }

        client.onStompError = (frame) => {
          console.error('[WebSocket] STOMP error:', frame.headers['message'])
          console.error('[WebSocket] Details:', frame.body)
          if (!isCleanedUp) {
            setIsConnected(false)
          }
        }

        client.onWebSocketError = (event) => {
          console.error('[WebSocket] WebSocket error:', event)
        }

        client.activate()
        clientRef.current = client
      } catch (error) {
        console.error('[WebSocket] Failed to initialize:', error)
      }
    }

    connect()

    return () => {
      isCleanedUp = true
      if (client) {
        console.log('[WebSocket] Cleaning up connection')
        client.deactivate()
      }
      clientRef.current = null
      setIsConnected(false)
    }
  }, [isAuthenticated, token, conversationId])

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!clientRef.current?.connected || !conversationId) return

    try {
      clientRef.current.publish({
        destination: `/app/typing/${conversationId}`,
        body: '',
      })
    } catch (e) {
      console.error('[WebSocket] Failed to send typing:', e)
    }
  }, [conversationId])

  // Mark messages as read
  const markRead = useCallback(() => {
    if (!clientRef.current?.connected || !conversationId) return

    try {
      clientRef.current.publish({
        destination: `/app/read/${conversationId}`,
        body: '',
      })
    } catch (e) {
      console.error('[WebSocket] Failed to mark read:', e)
    }
  }, [conversationId])

  return {
    isConnected,
    sendTyping,
    markRead,
  }
}
