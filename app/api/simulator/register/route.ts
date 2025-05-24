import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

// Register a simulated device
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { deviceId, name, model } = body

    if (!deviceId || !name) {
      return NextResponse.json({ error: "Missing required device fields" }, { status: 400 })
    }

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
      where: { deviceId },
    })

    if (existingDevice) {
      // If device exists but belongs to another user, return error
      if (existingDevice.userId !== Number.parseInt(session.user.id)) {
        return NextResponse.json({ error: "Device already registered to another user" }, { status: 400 })
      }

      // If device exists and belongs to this user, return success
      return NextResponse.json({
        data: existingDevice,
        success: true,
        message: "Device already registered",
      })
    }

    // Create the device
    const device = await prisma.device.create({
      data: {
        deviceId,
        name,
        model: model || "SmartDry Simulator",
        status: "online",
        userId: Number.parseInt(session.user.id),
      },
    })

    return NextResponse.json(
      {
        data: device,
        success: true,
        message: "Device registered successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Simulator device registration error:", error)
    return NextResponse.json({ error: "Failed to register simulated device" }, { status: 500 })
  }
}
