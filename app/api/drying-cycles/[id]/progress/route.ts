import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { getActiveDryingCycle, setActiveDryingCycle, removeActiveDryingCycle, publishNotification } from "@/lib/redis"

// Get drying cycle progress
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cycleId = params.id

    // Try to get from Redis first (for active cycles)
    const activeCycle = await getActiveDryingCycle(cycleId)

    if (activeCycle) {
      // Calculate progress based on time elapsed
      const startedAt = new Date(activeCycle.startedAt).getTime()
      const now = Date.now()
      const totalDuration = activeCycle.estimatedTimeRemaining * 60 * 1000 // convert minutes to ms
      const elapsed = now - startedAt
      const progress = Math.min(Math.round((elapsed / totalDuration) * 100), 99) // cap at 99% until complete

      // Update the progress
      activeCycle.progress = progress
      activeCycle.estimatedTimeRemaining = Math.max(
        Math.round((totalDuration - elapsed) / (60 * 1000)), // remaining minutes
        1, // minimum 1 minute
      )

      // Save updated progress to Redis
      await setActiveDryingCycle(cycleId, activeCycle)

      return NextResponse.json({
        data: activeCycle,
        success: true,
      })
    }

    // If not in Redis, get from database
    const dryingCycle = await prisma.dryingCycle.findFirst({
      where: {
        id: Number.parseInt(cycleId),
        device: {
          userId: Number.parseInt(session.user.id),
        },
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

    if (!dryingCycle) {
      return NextResponse.json({ error: "Drying cycle not found" }, { status: 404 })
    }

    // For completed cycles, return 100% progress
    if (dryingCycle.status === "completed") {
      return NextResponse.json({
        data: {
          ...dryingCycle,
          progress: 100,
          estimatedTimeRemaining: 0,
        },
        success: true,
      })
    }

    return NextResponse.json({
      data: dryingCycle,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching drying cycle progress:", error)
    return NextResponse.json({ error: "Failed to fetch drying cycle progress" }, { status: 500 })
  }
}

// Update drying cycle progress (e.g., from IoT device)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const cycleId = params.id
    const body = await request.json()
    const { progress, moisture, temperature, weight } = body

    // Get the drying cycle from database
    const dryingCycle = await prisma.dryingCycle.findUnique({
      where: {
        id: Number.parseInt(cycleId),
      },
      include: {
        device: true,
      },
    })

    if (!dryingCycle) {
      return NextResponse.json({ error: "Drying cycle not found" }, { status: 404 })
    }

    // Get active cycle from Redis
    const activeCycle = await getActiveDryingCycle(cycleId)

    if (!activeCycle) {
      return NextResponse.json({ error: "Drying cycle is not active" }, { status: 400 })
    }

    // Update the progress
    const updatedCycle = {
      ...activeCycle,
      progress: progress || activeCycle.progress,
      currentMoisture: moisture,
      currentTemperature: temperature,
      currentWeight: weight,
      lastUpdated: new Date().toISOString(),
    }

    // If progress is 100%, complete the cycle
    if (progress === 100) {
      // Update in database
      await prisma.dryingCycle.update({
        where: {
          id: Number.parseInt(cycleId),
        },
        data: {
          status: "completed",
          endTime: new Date(),
          duration: Math.round((Date.now() - new Date(dryingCycle.startTime).getTime()) / (60 * 1000)), // duration in minutes
          energyUsed: calculateEnergyUsage(dryingCycle.mode, dryingCycle.aiEnabled, dryingCycle.ecoMode),
        },
      })

      // Remove from Redis active cycles
      await removeActiveDryingCycle(cycleId)

      // Create a notification
      const notification = {
        title: "Drying Cycle Completed",
        message: `Your clothes in ${dryingCycle.device.name} are dry and ready to be removed.`,
        type: "success",
        timestamp: new Date().toISOString(),
      }

      // Store notification in database
      await prisma.notification.create({
        data: {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          userId: dryingCycle.device.userId,
        },
      })

      // Publish notification to Redis for real-time updates
      await publishNotification(dryingCycle.device.userId.toString(), notification)

      return NextResponse.json({
        data: {
          ...updatedCycle,
          status: "completed",
        },
        success: true,
      })
    }

    // Save updated progress to Redis
    await setActiveDryingCycle(cycleId, updatedCycle)

    return NextResponse.json({
      data: updatedCycle,
      success: true,
    })
  } catch (error) {
    console.error("Error updating drying cycle progress:", error)
    return NextResponse.json({ error: "Failed to update drying cycle progress" }, { status: 500 })
  }
}

// Helper function to calculate energy usage
function calculateEnergyUsage(mode: string, aiEnabled = true, ecoMode = false): number {
  // Base energy in kWh
  let baseEnergy = 1.2

  switch (mode.toLowerCase()) {
    case "quick":
      baseEnergy = 0.8
      break
    case "delicate":
      baseEnergy = 0.7
      break
    case "normal":
      baseEnergy = 1.2
      break
    case "heavy duty":
      baseEnergy = 1.8
      break
    default:
      baseEnergy = 1.2
  }

  // AI optimization reduces energy by 10%
  if (aiEnabled) {
    baseEnergy = baseEnergy * 0.9
  }

  // Eco mode reduces energy by 15%
  if (ecoMode) {
    baseEnergy = baseEnergy * 0.85
  }

  return Number.parseFloat(baseEnergy.toFixed(2))
}
