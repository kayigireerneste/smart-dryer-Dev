import { sql } from "@/lib/neon"

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: string
  read: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateNotificationData {
  user_id: number
  title: string
  message: string
  type: string
}

export async function getNotificationsByUserId(userId: number): Promise<Notification[]> {
  try {
    const result = await sql`
      SELECT id, user_id, title, message, type, read, created_at, updated_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return result
  } catch (error) {
    console.error("Error getting notifications by user ID:", error)
    return []
  }
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId} AND read = false
    `

    return result[0]?.count || 0
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    return 0
  }
}

export async function getNotificationById(id: number): Promise<Notification | null> {
  try {
    const result = await sql`
      SELECT id, user_id, title, message, type, read, created_at, updated_at
      FROM notifications
      WHERE id = ${id}
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting notification by ID:", error)
    return null
  }
}

export async function createNotification(notificationData: CreateNotificationData): Promise<Notification | null> {
  try {
    const result = await sql`
      INSERT INTO notifications (user_id, title, message, type, read, created_at, updated_at)
      VALUES (${notificationData.user_id}, ${notificationData.title}, ${notificationData.message}, ${notificationData.type}, false, NOW(), NOW())
      RETURNING id, user_id, title, message, type, read, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

export async function markNotificationAsRead(id: number): Promise<Notification | null> {
  try {
    const result = await sql`
      UPDATE notifications 
      SET read = true, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, user_id, title, message, type, read, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return null
  }
}

export async function markAllNotificationsAsRead(userId: number): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE notifications 
      SET read = true, updated_at = NOW()
      WHERE user_id = ${userId} AND read = false
    `

    return result.count > 0
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }
}

export async function deleteNotification(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${id}
    `

    return result.count > 0
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}
