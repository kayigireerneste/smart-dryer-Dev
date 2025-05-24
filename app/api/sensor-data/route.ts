import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { cacheDeviceSensors, getDeviceSensors, cacheDeviceStatus } from "@/lib/redis"

// Get sensor readings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const useCache = searchParams.get("cache") !== "false"

    // If deviceId is provided and caching is enabled, try to get from Redis first
    if (deviceId && useCache) {
      const cachedSensors = await getDeviceSensors(deviceId)
      if (cachedSensors) {
        return NextResponse.json({
          data: cachedSensors,
          success: true,
          cached: true,
        })
      }
    }

    // Get the most recent sensor readings from database
    const sensorReadings = await prisma.sensorReading.findMany({
      where: deviceId
        ? {
            device: {
              deviceId,
              userId: Number.parseInt(session.user.id),
            },
          }
        : {
            device: {
              userId: Number.parseInt(session.user.id),
            },
          },
      orderBy: {
        timestamp: "desc",
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

    // If deviceId is provided, cache the results
    if (deviceId) {
      await cacheDeviceSensors(deviceId, sensorReadings)
    }

    return NextResponse.json({
      data: sensorReadings,
      success: true,
      cached: false,
    })
  } catch (error) {
    console.error("Error fetching sensor data:", error)
    return NextResponse.json({ error: "Failed to fetch sensor data" }, { status: 500 })
  }
}

// Create a new sensor reading
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (
      !body.deviceId ||
      body.temperature === undefined ||
      body.humidity === undefined ||
      body.moisture === undefined ||
      body.weight === undefined
    ) {
      return NextResponse.json({ error: "Missing required sensor data fields" }, { status: 400 })
    }

    // Find the device
    const device = await prisma.device.findUnique({
      where: {
        deviceId: body.deviceId,
      },
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Create a new sensor reading
    const newReading = await prisma.sensorReading.create({
      data: {
        deviceId: device.id,
        temperature: body.temperature,
        humidity: body.humidity,
        moisture: body.moisture,
        weight: body.weight,
      },
    })

    // Update device status in Redis
    await cacheDeviceStatus(body.deviceId, {
      status: "online",
      lastSeen: new Date().toISOString(),
      lastReading: {
        temperature: body.temperature,
        humidity: body.humidity,
        moisture: body.moisture,
        weight: body.weight,
      },
    })

    // Cache the latest sensor reading
    await cacheDeviceSensors(body.deviceId, [
      {
        ...newReading,
        device: {
          deviceId: body.deviceId,
          name: device.name,
        },
      },
    ])

    // Return the created reading
    return NextResponse.json(
      {
        data: newReading,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error processing sensor data:", error)
    return NextResponse.json({ error: "Failed to process sensor data" }, { status: 500 })
  }
}
