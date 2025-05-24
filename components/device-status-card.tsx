"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { formatDistanceToNow } from "date-fns"

interface DeviceStatus {
  status: string
  lastSeen: string
  lastReading: {
    temperature: number
    humidity: number
    moisture: number
    weight: number
  }
}

interface DeviceStatusCardProps {
  deviceId: string
  deviceName: string
}

export function DeviceStatusCard({ deviceId, deviceName }: DeviceStatusCardProps) {
  const fetchDeviceStatus = async (): Promise<DeviceStatus> => {
    const response = await fetch(`/api/devices/${deviceId}/status`)
    if (!response.ok) {
      throw new Error("Failed to fetch device status")
    }
    const data = await response.json()
    return data.data
  }

  const {
    data: statusData,
    isLoading,
    error,
    lastUpdated,
  } = useRealTimeData<DeviceStatus>(
    fetchDeviceStatus,
    {} as DeviceStatus,
    5000, // Update every 5 seconds
  )

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "offline":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{deviceName}</CardTitle>
          {statusData?.status && <Badge className={getStatusColor(statusData.status)}>{statusData.status}</Badge>}
        </div>
        <CardDescription>Device ID: {deviceId}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !statusData?.lastSeen ? (
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading device status...</p>
          </div>
        ) : error ? (
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-red-500">Error loading device status</p>
          </div>
        ) : statusData?.lastSeen ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Last Seen</p>
              <p className="text-sm">{formatDistanceToNow(new Date(statusData.lastSeen), { addSuffix: true })}</p>
            </div>

            {statusData.lastReading && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm font-medium mb-1">Temperature</p>
                  <p className="text-sm">{statusData.lastReading.temperature}°C</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Humidity</p>
                  <p className="text-sm">{statusData.lastReading.humidity}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Moisture</p>
                  <p className="text-sm">{statusData.lastReading.moisture}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Weight</p>
                  <p className="text-sm">{statusData.lastReading.weight} kg</p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <p className="text-sm text-gray-500">No status data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
