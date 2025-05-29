import { sql } from "@/lib/neon"

export interface Device {
  id: number
  device_id: string
  name: string
  model: string
  status: string
  user_id: number
  created_at: Date
  updated_at: Date
}

export interface CreateDeviceData {
  device_id: string
  name: string
  model: string
  user_id: number
}

export interface UpdateDeviceData {
  name?: string
  model?: string
  status?: string
}

export async function getDevicesByUserId(userId: number): Promise<Device[]> {
  try {
    const result = await sql`
      SELECT id, device_id, name, model, status, user_id, created_at, updated_at
      FROM devices
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return result
  } catch (error) {
    console.error("Error getting devices by user ID:", error)
    return []
  }
}

export async function getDeviceById(id: number): Promise<Device | null> {
  try {
    const result = await sql`
      SELECT id, device_id, name, model, status, user_id, created_at, updated_at
      FROM devices
      WHERE id = ${id}
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting device by ID:", error)
    return null
  }
}

export async function getDeviceByDeviceId(deviceId: string): Promise<Device | null> {
  try {
    const result = await sql`
      SELECT id, device_id, name, model, status, user_id, created_at, updated_at
      FROM devices
      WHERE device_id = ${deviceId}
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting device by device ID:", error)
    return null
  }
}

export async function createDevice(deviceData: CreateDeviceData): Promise<Device | null> {
  try {
    const result = await sql`
      INSERT INTO devices (device_id, name, model, status, user_id, created_at, updated_at)
      VALUES (${deviceData.device_id}, ${deviceData.name}, ${deviceData.model}, 'offline', ${deviceData.user_id}, NOW(), NOW())
      RETURNING id, device_id, name, model, status, user_id, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error creating device:", error)
    return null
  }
}

export async function updateDevice(id: number, deviceData: UpdateDeviceData): Promise<Device | null> {
  try {
    const updates = []
    const values = []

    if (deviceData.name !== undefined) {
      updates.push("name = $" + (values.length + 2))
      values.push(deviceData.name)
    }

    if (deviceData.model !== undefined) {
      updates.push("model = $" + (values.length + 2))
      values.push(deviceData.model)
    }

    if (deviceData.status !== undefined) {
      updates.push("status = $" + (values.length + 2))
      values.push(deviceData.status)
    }

    if (updates.length === 0) {
      return getDeviceById(id)
    }

    updates.push("updated_at = NOW()")

    const result = await sql`
      UPDATE devices 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${id}
      RETURNING id, device_id, name, model, status, user_id, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error updating device:", error)
    return null
  }
}

export async function updateDeviceStatus(deviceId: string, status: string): Promise<Device | null> {
  try {
    const result = await sql`
      UPDATE devices 
      SET status = ${status}, updated_at = NOW()
      WHERE device_id = ${deviceId}
      RETURNING id, device_id, name, model, status, user_id, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error updating device status:", error)
    return null
  }
}

export async function deleteDevice(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM devices
      WHERE id = ${id}
    `

    return result.count > 0
  } catch (error) {
    console.error("Error deleting device:", error)
    return false
  }
}
