import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { notificationsApi } from '../../api/notifications'
import { Notification, NOTIFICATION_TYPE_ICONS } from '../../types/notification'
import Spinner from '../../components/common/Spinner'
import Button from '../../components/common/Button'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const response = await notificationsApi.getNotifications(0, 20)
        setNotifications(response.data)
        setHasMore(response.pagination.page < response.pagination.totalPages - 1)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = await notificationsApi.getNotifications(nextPage, 20)
      setNotifications((prev) => [...prev, ...response.data])
      setPage(nextPage)
      setHasMore(response.pagination.page < response.pagination.totalPages - 1)
    } catch (error) {
      console.error('Failed to load more notifications:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await notificationsApi.markAsRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }

    // Navigate to action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No notifications yet
          </h2>
          <p className="text-gray-600">
            When you receive booking requests, approvals, or other updates,
            they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full card p-4 text-left flex gap-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-primary-50 border-primary-200' : ''
              }`}
            >
              <div className="flex-shrink-0 text-2xl">
                {NOTIFICATION_TYPE_ICONS[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-medium ${
                      notification.read ? 'text-gray-900' : 'text-primary-900'
                    }`}
                  >
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </button>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="secondary"
                onClick={loadMore}
                isLoading={isLoadingMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
