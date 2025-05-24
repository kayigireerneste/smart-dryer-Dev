"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { formatDistanceToNow } from "date-fns"

interface DryingCycleProgress {
  id: number
  progress: number
  estimatedTimeRemaining: number
  mode: string
  temperature: number
  fanSpeed: number
  aiEnabled: boolean
  ecoMode: boolean
  device: {
    deviceId: string
    name: string
  }
  startedAt: string
  currentMoisture?: number
  currentTemperature?: number
  currentWeight?: number
  lastUpdated?: string
}

interface RealTimeDryingProgressProps {
  cycleId: string
}

export function RealTimeDryingProgress({ cycleId }: RealTimeDryingProgressProps) {
  const fetchDryingProgress = async (): Promise<DryingCycleProgress> => {
    const response = await fetch(`/api/drying-cycles/${cycleId}/progress`)
    if (!response.ok) {
      throw new Error("Failed to fetch drying progress")
    }
    const data = await response.json()
    return data.data
  }

  const {
    data: progressData,
    isLoading,
    error,
    lastUpdated,
    refetch,
  } = useRealTimeData<DryingCycleProgress>(
    fetchDryingProgress,
    {} as DryingCycleProgress,
    3000, // Update every 3 seconds
  )

  const handleStop = async () => {
    try {
      const response = await fetch(`/api/drying-cycles/${cycleId}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress: 100 }),
      })

      if (!response.ok) {
        throw new Error("Failed to stop drying cycle")
      }

      refetch()
    } catch (error) {
      console.error("Error stopping drying cycle:", error)
    }
  }

  if (isLoading && !progressData.id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p>Loading drying cycle data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-red-500">Error loading drying cycle: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progressData.id) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <p>No active drying cycle found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Drying Cycle</CardTitle>
        <CardDescription>
          {progressData.device?.name || "Device"} - {progressData.mode} Mode
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{progressData.progress}%</span>
          </div>
          <Progress value={progressData.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Time Remaining</p>
            <p className="text-sm">{progressData.estimatedTimeRemaining} minutes</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Started</p>
            <p className="text-sm">
              {progressData.startedAt
                ? formatDistanceToNow(new Date(progressData.startedAt), { addSuffix: true })
                : "Unknown"}
            </p>
          </div>

          {progressData.currentTemperature && (
            <div>
              <p className="text-sm font-medium mb-1">Current Temperature</p>
              <p className="text-sm">{progressData.currentTemperature}°C</p>
            </div>
          )}

          {progressData.currentMoisture && (
            <div>
              <p className="text-sm font-medium mb-1">Current Moisture</p>
              <p className="text-sm">{progressData.currentMoisture}%</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" className="w-full" onClick={handleStop} disabled={progressData.progress >= 100}>
          {progressData.progress >= 100 ? "Drying Complete" : "Stop Drying"}
        </Button>
      </CardFooter>
    </Card>
  )
}
