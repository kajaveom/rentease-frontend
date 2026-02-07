export type NotificationType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_PAID'
  | 'BOOKING_STARTED'
  | 'BOOKING_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'NEW_MESSAGE'

export interface NotificationActor {
  id: string
  firstName: string
  avatarUrl?: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  read: boolean
  createdAt: string
  readAt?: string
  actor?: NotificationActor
  relatedBookingId?: string
  relatedListingId?: string
}

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  BOOKING_REQUESTED: '📬',
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BOOKING_CANCELLED: '🚫',
  BOOKING_PAID: '💳',
  BOOKING_STARTED: '🎉',
  BOOKING_COMPLETED: '🏁',
  REVIEW_RECEIVED: '⭐',
  NEW_MESSAGE: '💬',
}
