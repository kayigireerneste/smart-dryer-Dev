"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: string
  read?: boolean
}

export function RealTimeNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async (): Promise<Notification[]> => {
    const response = await fetch("/api/notifications/real-time")
    if (!response.ok) {
      throw new Error("Failed to fetch notifications")
    }
    const data = await response.json()
    return data.data || []
  }

  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useRealTimeData<Notification[]>(
    fetchNotifications,
    [],
    10000, // Update every 10 seconds
  )

  useEffect(() => {
    // Count unread notifications
    const count = notifications.filter((n) => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      })

      refetch()
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative dark:text-gray-300">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white dark:bg-red-600 dark:text-white"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between p-2 border-b dark:border-gray-700">
          <h3 className="font-medium dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-8 dark:text-gray-300">
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading notifications...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error loading notifications</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <DropdownMenuItem
                key={index}
                className={`flex flex-col items-start p-3 cursor-default ${!notification.read ? "bg-gray-50 dark:bg-gray-700" : ""}`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-2 h-2 mr-2 rounded-full ${!notification.read ? "bg-blue-500" : "bg-transparent"}`}
                    ></span>
                    <span className="font-medium dark:text-white">{notification.title}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 ml-4">{notification.message}</p>
                <div className="ml-4 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeStyles(notification.type)}`}>
                    {notification.type}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
