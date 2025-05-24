import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

// Get all devices for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const devices = await prisma.device.findMany({
      where: {
        userId: Number.parseInt(session.user.id),
      },
    })

    return NextResponse.json({
      data: devices,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching devices:", error)
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
  }
}

// Create a new device
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
      return NextResponse.json({ error: "Device with this ID already exists" }, { status: 400 })
    }

    // Create the device
    const device = await prisma.device.create({
      data: {
        deviceId,
        name,
        model,
        userId: Number.parseInt(session.user.id),
      },
    })

    return NextResponse.json(
      {
        data: device,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating device:", error)
    return NextResponse.json({ error: "Failed to create device" }, { status: 500 })
  }
}
