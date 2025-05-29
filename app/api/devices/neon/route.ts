import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDevicesByUserId, createDevice } from "@/lib/neon-queries/devices"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const devices = await getDevicesByUserId(Number.parseInt(userId, 10))

    return NextResponse.json({ data: devices })
  } catch (error) {
    console.error("Error fetching devices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { deviceId, name, model, userId } = await request.json()

    if (!deviceId || !name || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const device = await createDevice({
      device_id: deviceId,
      name,
      model,
      user_id: Number.parseInt(userId, 10),
    })

    if (!device) {
      return NextResponse.json({ error: "Failed to create device" }, { status: 500 })
    }

    return NextResponse.json({ data: device })
  } catch (error) {
    console.error("Error creating device:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
