import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { getDeviceStatus } from "@/lib/redis"

// Get device status from Redis
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, check if the device belongs to the user
    const device = await prisma.device.findFirst({
      where: {
        deviceId: params.id,
        userId: Number.parseInt(session.user.id),
      },
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Get status from Redis
    const status = await getDeviceStatus(params.id)

    if (!status) {
      // If no Redis data, return basic status from database
      return NextResponse.json({
        data: {
          status: device.status,
          lastSeen: device.updatedAt,
        },
        success: true,
      })
    }

    return NextResponse.json({
      data: status,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching device status:", error)
    return NextResponse.json({ error: "Failed to fetch device status" }, { status: 500 })
  }
}
