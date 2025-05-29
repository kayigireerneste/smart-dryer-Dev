import { Redis } from "@upstash/redis"

// Create Redis client from environment variables
// KV_URL and KV_REST_API_TOKEN are automatically added by Vercel
const redisUrl = process.env.KV_URL
const redisToken = process.env.KV_REST_API_READ_ONLY_TOKEN

if (!redisUrl || !redisToken) {
  throw new Error("Missing Redis environment variables: KV_URL or KV_REST_API_READ_ONLY_TOKEN")
}
export const redis = Redis.fromEnv()

// Key prefixes for better organization
export const KEYS = {
  DEVICE_STATUS: "device:status:",
  DEVICE_SENSORS: "device:sensors:",
  ACTIVE_DRYING: "drying:active:",
  USER_SESSIONS: "user:session:",
  NOTIFICATIONS: "notifications:",
  RATE_LIMIT: "ratelimit:",
}

// Helper functions for common Redis operations
export async function cacheDeviceStatus(deviceId: string, status: any) {
  await redis.set(`${KEYS.DEVICE_STATUS}${deviceId}`, JSON.stringify(status))
  // Set expiration to 1 hour
  await redis.expire(`${KEYS.DEVICE_STATUS}${deviceId}`, 60 * 60)
}

export async function getDeviceStatus(deviceId: string) {
  const status = await redis.get(`${KEYS.DEVICE_STATUS}${deviceId}`)
  return status ? JSON.parse(status as string) : null
}

export async function cacheDeviceSensors(deviceId: string, sensorData: any) {
  await redis.set(`${KEYS.DEVICE_SENSORS}${deviceId}`, JSON.stringify(sensorData))
  // Set expiration to 5 minutes
  await redis.expire(`${KEYS.DEVICE_SENSORS}${deviceId}`, 5 * 60)
}

export async function getDeviceSensors(deviceId: string) {
  const sensors = await redis.get(`${KEYS.DEVICE_SENSORS}${deviceId}`)
  return sensors ? JSON.parse(sensors as string) : null
}

export async function setActiveDryingCycle(cycleId: string, cycleData: any) {
  await redis.set(`${KEYS.ACTIVE_DRYING}${cycleId}`, JSON.stringify(cycleData))
}

export async function getActiveDryingCycle(cycleId: string) {
  const cycle = await redis.get(`${KEYS.ACTIVE_DRYING}${cycleId}`)
  return cycle ? JSON.parse(cycle as string) : null
}

export async function removeActiveDryingCycle(cycleId: string) {
  await redis.del(`${KEYS.ACTIVE_DRYING}${cycleId}`)
}

export async function publishNotification(userId: string, notification: any) {
  await redis.lpush(`${KEYS.NOTIFICATIONS}${userId}`, JSON.stringify(notification))
}

export async function getRecentNotifications(userId: string, count = 5) {
  const notifications = await redis.lrange(`${KEYS.NOTIFICATIONS}${userId}`, 0, count - 1)
  return notifications.map((n) => JSON.parse(n))
}
