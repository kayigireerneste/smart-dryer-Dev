import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

// Mark notifications as read
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ids, all } = body

    if (all) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: Number.parseInt(session.user.id),
          read: false,
        },
        data: {
          read: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      })
    } else if (ids && ids.length > 0) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: {
            in: ids.map((id: string) => Number.parseInt(id)),
          },
          userId: Number.parseInt(session.user.id),
        },
        data: {
          read: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Notifications marked as read",
      })
    } else {
      return NextResponse.json({ error: "No notifications specified" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
