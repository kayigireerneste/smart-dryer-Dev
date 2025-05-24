import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { getRecentNotifications } from "@/lib/redis"

// Get real-time notifications from Redis
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const count = Number.parseInt(searchParams.get("count") || "5")

    // Get recent notifications from Redis
    const notifications = await getRecentNotifications(session.user.id, count)

    return NextResponse.json({
      data: notifications,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching real-time notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
