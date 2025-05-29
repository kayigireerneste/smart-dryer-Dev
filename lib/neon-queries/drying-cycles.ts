import { sql } from "@/lib/neon"

export interface DryingCycle {
  id: number
  cycle_id: string
  device_id: number
  cycle_type: string
  status: string
  start_time: Date
  end_time?: Date
  temperature?: number
  humidity?: number
  progress: number
  created_at: Date
  updated_at: Date
}

export interface CreateDryingCycleData {
  cycle_id: string
  device_id: number
  cycle_type: string
}

export interface UpdateDryingCycleData {
  status?: string
  temperature?: number
  humidity?: number
  progress?: number
  end_time?: Date
}

export async function getDryingCyclesByDeviceId(deviceId: number): Promise<DryingCycle[]> {
  try {
    const result = await sql`
      SELECT id, cycle_id, device_id, cycle_type, status, start_time, end_time, 
             temperature, humidity, progress, created_at, updated_at
      FROM drying_cycles
      WHERE device_id = ${deviceId}
      ORDER BY created_at DESC
    `

    return result
  } catch (error) {
    console.error("Error getting drying cycles by device ID:", error)
    return []
  }
}

export async function getDryingCyclesByUserId(userId: number): Promise<DryingCycle[]> {
  try {
    const result = await sql`
      SELECT dc.id, dc.cycle_id, dc.device_id, dc.cycle_type, dc.status, 
             dc.start_time, dc.end_time, dc.temperature, dc.humidity, 
             dc.progress, dc.created_at, dc.updated_at
      FROM drying_cycles dc
      JOIN devices d ON dc.device_id = d.id
      WHERE d.user_id = ${userId}
      ORDER BY dc.created_at DESC
    `

    return result
  } catch (error) {
    console.error("Error getting drying cycles by user ID:", error)
    return []
  }
}

export async function getDryingCycleById(id: number): Promise<DryingCycle | null> {
  try {
    const result = await sql`
      SELECT id, cycle_id, device_id, cycle_type, status, start_time, end_time, 
             temperature, humidity, progress, created_at, updated_at
      FROM drying_cycles
      WHERE id = ${id}
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting drying cycle by ID:", error)
    return null
  }
}

export async function getDryingCycleByCycleId(cycleId: string): Promise<DryingCycle | null> {
  try {
    const result = await sql`
      SELECT id, cycle_id, device_id, cycle_type, status, start_time, end_time, 
             temperature, humidity, progress, created_at, updated_at
      FROM drying_cycles
      WHERE cycle_id = ${cycleId}
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting drying cycle by cycle ID:", error)
    return null
  }
}

export async function createDryingCycle(cycleData: CreateDryingCycleData): Promise<DryingCycle | null> {
  try {
    const result = await sql`
      INSERT INTO drying_cycles (cycle_id, device_id, cycle_type, status, start_time, progress, created_at, updated_at)
      VALUES (${cycleData.cycle_id}, ${cycleData.device_id}, ${cycleData.cycle_type}, 'running', NOW(), 0, NOW(), NOW())
      RETURNING id, cycle_id, device_id, cycle_type, status, start_time, end_time, 
                temperature, humidity, progress, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error creating drying cycle:", error)
    return null
  }
}

export async function updateDryingCycle(id: number, cycleData: UpdateDryingCycleData): Promise<DryingCycle | null> {
  try {
    const updates = []
    const values = []

    if (cycleData.status !== undefined) {
      updates.push("status = $" + (values.length + 2))
      values.push(cycleData.status)
    }

    if (cycleData.temperature !== undefined) {
      updates.push("temperature = $" + (values.length + 2))
      values.push(cycleData.temperature)
    }

    if (cycleData.humidity !== undefined) {
      updates.push("humidity = $" + (values.length + 2))
      values.push(cycleData.humidity)
    }

    if (cycleData.progress !== undefined) {
      updates.push("progress = $" + (values.length + 2))
      values.push(cycleData.progress)
    }

    if (cycleData.end_time !== undefined) {
      updates.push("end_time = $" + (values.length + 2))
      values.push(cycleData.end_time)
    }

    if (updates.length === 0) {
      return getDryingCycleById(id)
    }

    updates.push("updated_at = NOW()")

    const result = await sql`
      UPDATE drying_cycles 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${id}
      RETURNING id, cycle_id, device_id, cycle_type, status, start_time, end_time, 
                temperature, humidity, progress, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error updating drying cycle:", error)
    return null
  }
}

export async function completeDryingCycle(cycleId: string): Promise<DryingCycle | null> {
  try {
    const result = await sql`
      UPDATE drying_cycles 
      SET status = 'completed', progress = 100, end_time = NOW(), updated_at = NOW()
      WHERE cycle_id = ${cycleId}
      RETURNING id, cycle_id, device_id, cycle_type, status, start_time, end_time, 
                temperature, humidity, progress, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error completing drying cycle:", error)
    return null
  }
}

export async function getDryingCycleProgress(cycleId: string): Promise<number> {
  try {
    const result = await sql`
      SELECT progress
      FROM drying_cycles
      WHERE cycle_id = ${cycleId}
      LIMIT 1
    `

    return result[0]?.progress || 0
  } catch (error) {
    console.error("Error getting drying cycle progress:", error)
    return 0
  }
}
