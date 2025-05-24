import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific drying cycle
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dryingCycleId = Number.parseInt(params.id)

    const dryingCycle = await prisma.dryingCycle.findFirst({
      where: {
        id: dryingCycleId,
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

    return NextResponse.json({
      data: dryingCycle,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching drying cycle:", error)
    return NextResponse.json({ error: "Failed to fetch drying cycle" }, { status: 500 })
  }
}

// Update a drying cycle (e.g., to mark it as complete)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dryingCycleId = Number.parseInt(params.id)
    const body = await request.json()
    const { status, endTime, duration, energyUsed } = body

    // Check if drying cycle exists and belongs to the user
    const existingDryingCycle = await prisma.dryingCycle.findFirst({
      where: {
        id: dryingCycleId,
        device: {
          userId: Number.parseInt(session.user.id),
        },
      },
    })

    if (!existingDryingCycle) {
      return NextResponse.json({ error: "Drying cycle not found" }, { status: 404 })
    }

    // Update the drying cycle
    const dryingCycle = await prisma.dryingCycle.update({
      where: { id: dryingCycleId },
      data: {
        status: status || existingDryingCycle.status,
        endTime: endTime ? new Date(endTime) : existingDryingCycle.endTime,
        duration: duration || existingDryingCycle.duration,
        energyUsed: energyUsed || existingDryingCycle.energyUsed,
      },
    })

    return NextResponse.json({
      data: dryingCycle,
      success: true,
    })
  } catch (error) {
    console.error("Error updating drying cycle:", error)
    return NextResponse.json({ error: "Failed to update drying cycle" }, { status: 500 })
  }
}
