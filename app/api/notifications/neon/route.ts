import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  getNotificationsByUserId,
  createNotification,
  getUnreadNotificationCount,
} from "@/lib/neon-queries/notifications"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const countOnly = searchParams.get("countOnly") === "true"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (countOnly) {
      const count = await getUnreadNotificationCount(Number.parseInt(userId, 10))
      return NextResponse.json({ data: { count } })
    } else {
      const notifications = await getNotificationsByUserId(Number.parseInt(userId, 10))
      return NextResponse.json({ data: notifications })
    }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, title, message, type } = await request.json()

    if (!userId || !title || !message || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const notification = await createNotification({
      user_id: Number.parseInt(userId, 10),
      title,
      message,
      type,
    })

    if (!notification) {
      return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }

    return NextResponse.json({ data: notification })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
