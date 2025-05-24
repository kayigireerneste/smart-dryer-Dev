import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

// Get notifications for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const read = searchParams.get("read")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Build the where clause
    const whereClause: any = {
      userId: Number.parseInt(session.user.id),
    }

    if (read !== null) {
      whereClause.read = read === "true"
    }

    // Get the notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    })

    return NextResponse.json({
      data: notifications,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// Create a new notification
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type } = body

    if (!title || !message || !type) {
      return NextResponse.json({ error: "Missing required notification fields" }, { status: 400 })
    }

    // Create a new notification
    const newNotification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: Number.parseInt(session.user.id),
      },
    })

    // Return the created notification
    return NextResponse.json(
      {
        data: newNotification,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
