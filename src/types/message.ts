export interface MessageSender {
  id: string
  firstName: string
  lastName?: string
  avatarUrl?: string
}

export interface Message {
  id: string
  conversationId: string
  sender: MessageSender
  content: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface ConversationListing {
  id: string
  title: string
  primaryImage?: string
}

export interface ConversationParticipant {
  id: string
  firstName: string
  lastName?: string
  avatarUrl?: string
  idVerified: boolean
}

export interface Conversation {
  id: string
  listing: ConversationListing
  otherParticipant: ConversationParticipant
  bookingId?: string
  lastMessagePreview?: string
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
}

export interface SendMessageRequest {
  content: string
  listingId?: string
}
