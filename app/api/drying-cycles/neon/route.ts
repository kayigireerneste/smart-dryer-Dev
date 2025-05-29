import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDryingCyclesByUserId, createDryingCycle } from "@/lib/neon-queries/drying-cycles"
import { getDeviceByDeviceId } from "@/lib/neon-queries/devices"

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

    const cycles = await getDryingCyclesByUserId(Number.parseInt(userId, 10))

    return NextResponse.json({ data: cycles })
  } catch (error) {
    console.error("Error fetching drying cycles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { deviceId, cycleType } = await request.json()

    if (!deviceId || !cycleType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get device by device ID
    const device = await getDeviceByDeviceId(deviceId)

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Generate a unique cycle ID
    const cycleId = `cycle_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    const cycle = await createDryingCycle({
      cycle_id: cycleId,
      device_id: device.id,
      cycle_type: cycleType,
    })

    if (!cycle) {
      return NextResponse.json({ error: "Failed to create drying cycle" }, { status: 500 })
    }

    return NextResponse.json({ data: cycle })
  } catch (error) {
    console.error("Error creating drying cycle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
