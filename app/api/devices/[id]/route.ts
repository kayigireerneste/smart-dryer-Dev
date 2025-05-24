import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

// Get a specific device
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deviceId = Number.parseInt(params.id)

    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId: Number.parseInt(session.user.id),
      },
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: device,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching device:", error)
    return NextResponse.json({ error: "Failed to fetch device" }, { status: 500 })
  }
}

// Update a device
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deviceId = Number.parseInt(params.id)
    const body = await request.json()
    const { name, model, status } = body

    // Check if device exists and belongs to the user
    const existingDevice = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId: Number.parseInt(session.user.id),
      },
    })

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Update the device
    const device = await prisma.device.update({
      where: { id: deviceId },
      data: {
        name: name || existingDevice.name,
        model: model || existingDevice.model,
        status: status || existingDevice.status,
      },
    })

    return NextResponse.json({
      data: device,
      success: true,
    })
  } catch (error) {
    console.error("Error updating device:", error)
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 })
  }
}

// Delete a device
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deviceId = Number.parseInt(params.id)

    // Check if device exists and belongs to the user
    const existingDevice = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId: Number.parseInt(session.user.id),
      },
    })

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Delete the device
    await prisma.device.delete({
      where: { id: deviceId },
    })

    return NextResponse.json({
      success: true,
      message: "Device deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting device:", error)
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 })
  }
}
