import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { setActiveDryingCycle, publishNotification } from "@/lib/redis"

// Get drying cycles
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Build the where clause
    const whereClause: any = {
      device: {
        userId: Number.parseInt(session.user.id),
      },
    }

    if (deviceId) {
      whereClause.device.deviceId = deviceId
    }

    if (status) {
      whereClause.status = status
    }

    // Get the drying cycles
    const dryingCycles = await prisma.dryingCycle.findMany({
      where: whereClause,
      orderBy: {
        startTime: "desc",
      },
      take: limit,
      include: {
        device: {
          select: {
            deviceId: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: dryingCycles,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching drying cycles:", error)
    return NextResponse.json({ error: "Failed to fetch drying cycles" }, { status: 500 })
  }
}

// Create a new drying cycle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { deviceId, mode, temperature, fanSpeed, aiEnabled, ecoMode } = body

    if (!deviceId || !mode || temperature === undefined || fanSpeed === undefined) {
      return NextResponse.json({ error: "Missing required drying cycle fields" }, { status: 400 })
    }

    // Find the device
    const device = await prisma.device.findFirst({
      where: {
        deviceId,
        userId: Number.parseInt(session.user.id),
      },
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Create a new drying cycle
    const newDryingCycle = await prisma.dryingCycle.create({
      data: {
        deviceId: device.id,
        startTime: new Date(),
        mode,
        temperature,
        fanSpeed,
        aiEnabled: aiEnabled !== undefined ? aiEnabled : true,
        ecoMode: ecoMode !== undefined ? ecoMode : false,
      },
      include: {
        device: {
          select: {
            deviceId: true,
            name: true,
          },
        },
      },
    })

    // Store active drying cycle in Redis for real-time access
    await setActiveDryingCycle(newDryingCycle.id.toString(), {
      ...newDryingCycle,
      progress: 0,
      estimatedTimeRemaining: calculateEstimatedTime(mode, aiEnabled, ecoMode),
      startedAt: new Date().toISOString(),
    })

    // Create a notification
    const notification = {
      title: "Drying Cycle Started",
      message: `A new drying cycle has started on ${device.name} using ${mode} mode.`,
      type: "info",
      timestamp: new Date().toISOString(),
    }

    // Store notification in database
    await prisma.notification.create({
      data: {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        userId: Number.parseInt(session.user.id),
      },
    })

    // Publish notification to Redis for real-time updates
    await publishNotification(session.user.id, notification)

    // Return the created drying cycle
    return NextResponse.json(
      {
        data: newDryingCycle,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating drying cycle:", error)
    return NextResponse.json({ error: "Failed to create drying cycle" }, { status: 500 })
  }
}

// Helper function to calculate estimated drying time
function calculateEstimatedTime(mode: string, aiEnabled = true, ecoMode = false): number {
  // Base time in minutes
  let baseTime = 60

  switch (mode.toLowerCase()) {
    case "quick":
      baseTime = 30
      break
    case "delicate":
      baseTime = 45
      break
    case "normal":
      baseTime = 60
      break
    case "heavy duty":
      baseTime = 90
      break
    default:
      baseTime = 60
  }

  // AI optimization reduces time by 15%
  if (aiEnabled) {
    baseTime = Math.round(baseTime * 0.85)
  }

  // Eco mode increases time by 10%
  if (ecoMode) {
    baseTime = Math.round(baseTime * 1.1)
  }

  return baseTime
}
