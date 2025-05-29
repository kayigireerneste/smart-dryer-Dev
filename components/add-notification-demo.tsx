"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications, type NotificationType } from "@/components/notification-provider"

export function AddNotificationDemo() {
  const { addNotification } = useNotifications()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<NotificationType>("info")

  const handleAddNotification = () => {
    if (title && message) {
      addNotification({
        title,
        message,
        type,
      })
      setTitle("")
      setMessage("")
      setType("info")
    }
  }

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Test Notifications</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Create a test notification to see how the notification system works
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notification-title" className="dark:text-gray-300">
            Notification Title
          </Label>
          <Input
            id="notification-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notification-message" className="dark:text-gray-300">
            Notification Message
          </Label>
          <Input
            id="notification-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notification-type" className="dark:text-gray-300">
            Notification Type
          </Label>
          <Select value={type} onValueChange={(value: string) => setType(value as NotificationType)}>
            <SelectTrigger id="notification-type" className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="info" className="dark:text-gray-300">
                Info
              </SelectItem>
              <SelectItem value="success" className="dark:text-gray-300">
                Success
              </SelectItem>
              <SelectItem value="warning" className="dark:text-gray-300">
                Warning
              </SelectItem>
              <SelectItem value="error" className="dark:text-gray-300">
                Error
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAddNotification}
          disabled={!title || !message}
          className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
        >
          Send Test Notification
        </Button>
      </CardFooter>
    </Card>
  )
}
