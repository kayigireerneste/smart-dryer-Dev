"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  InfoIcon,
  PlayIcon,
  MonitorStopIcon as StopIcon,
  RefreshCw,
  AlertCircle,
  Thermometer,
  Droplets,
  Weight,
} from "lucide-react"
import {
  randomBetween,
  randomNormal,
  roundTo,
  generateDeviceId,
  generateDeviceName,
  generateDeviceModel,
  generateDryingMode,
  calculateEstimatedTime,
  calculateEnergyUsage,
} from "@/lib/simulator-utils"
import Image from "next/image"

interface SensorData {
  temperature: number
  humidity: number
  moisture: number
  weight: number
}

interface DryingCycle {
  id: number | null
  mode: string
  temperature: number
  fanSpeed: number
  aiEnabled: boolean
  ecoMode: boolean
  startTime: Date | null
  progress: number
  estimatedTimeRemaining: number
  status: "idle" | "in_progress" | "completed" | "error"
}

export default function DeviceSimulator() {
  // Device state
  const [deviceId, setDeviceId] = useState<string>("")
  const [deviceName, setDeviceName] = useState<string>("")
  const [deviceModel, setDeviceModel] = useState<string>("")
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [authToken, setAuthToken] = useState<string>("")

  // Sensor data state
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 25,
    humidity: 50,
    moisture: 80,
    weight: 3.5,
  })

  // Drying cycle state
  const [dryingCycle, setDryingCycle] = useState<DryingCycle>({
    id: null,
    mode: "Normal",
    temperature: 55,
    fanSpeed: 70,
    aiEnabled: true,
    ecoMode: false,
    startTime: null,
    progress: 0,
    estimatedTimeRemaining: 0,
    status: "idle",
  })

  // Simulation state
  const [isSendingData, setIsSendingData] = useState<boolean>(false)
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastApiResponse, setLastApiResponse] = useState<any>(null)

  // Refs for intervals
  const sensorIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dryingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Generate random device data
  const generateRandomDevice = () => {
    setDeviceId(generateDeviceId())
    setDeviceName(generateDeviceName())
    setDeviceModel(generateDeviceModel())
    addLog("Generated random device information")
  }

  // Add a log message
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prevLogs) => [...prevLogs, `[${timestamp}] ${message}`])
  }

  // Clear logs
  const clearLogs = () => {
    setLogs([])
  }

  // Scroll logs to bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  // Login to get auth token
  const login = async () => {
    try {
      setError(null)
      addLog("Attempting to login...")

      const response = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "john.doe@example.com", // Default test user
          password: "password123", // Default test password
          redirect: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      setAuthToken(data.token || "mock-auth-token")
      addLog("Login successful, auth token received")
      return true
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Using mock token for simulation.")
      setAuthToken("mock-auth-token")
      addLog("Login failed, using mock token for simulation")
      return true // Continue with mock token
    }
  }

  // Register device with the system
  const registerDevice = async () => {
    if (!deviceId || !deviceName) {
      setError("Device ID and name are required")
      return
    }

    try {
      setError(null)
      addLog(`Registering device ${deviceId} (${deviceName})...`)

      // First ensure we have an auth token
      const loggedIn = await login()
      if (!loggedIn) return

      const response = await fetch("/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          deviceId,
          name: deviceName,
          model: deviceModel,
        }),
      })

      const data = await response.json()
      setLastApiResponse(data)

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes("already exists")) {
          addLog("Device already registered, continuing...")
          setIsRegistered(true)
          return
        }
        throw new Error(data.error || "Failed to register device")
      }

      addLog(`Device registered successfully: ${deviceId}`)
      setIsRegistered(true)
    } catch (error) {
      console.error("Registration error:", error)
      setError(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      addLog(`Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`)

      // For simulation purposes, we'll pretend it worked anyway
      setIsRegistered(true)
      addLog("Continuing with simulation mode...")
    }
  }

  // Connect device to the system
  const connectDevice = async () => {
    if (!isRegistered) {
      await registerDevice()
    }

    try {
      setError(null)
      addLog(`Connecting device ${deviceId}...`)

      // In a real device, this would establish a connection to the server
      // For simulation, we'll just set the state
      setIsConnected(true)
      addLog("Device connected successfully")
    } catch (error) {
      console.error("Connection error:", error)
      setError(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      addLog(`Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Disconnect device
  const disconnectDevice = () => {
    // Stop any ongoing simulations
    stopSimulation()

    setIsConnected(false)
    addLog("Device disconnected")
  }

  // Update sensor data with realistic changes
  const updateSensorData = () => {
    setSensorData((prev) => {
      // If a drying cycle is in progress, simulate drying
      if (dryingCycle.status === "in_progress") {
        // Temperature increases at the beginning, then stabilizes
        const tempChange = dryingCycle.progress < 30 ? randomNormal(0.2, 0.1) : randomNormal(-0.05, 0.1)
        // Humidity decreases as clothes dry
        const humidityChange = randomNormal(-0.3, 0.1)
        // Moisture decreases more rapidly
        const moistureChange = randomNormal(-0.5, 0.2)
        // Weight decreases as moisture is removed
        const weightChange = randomNormal(-0.01, 0.005)

        return {
          temperature: roundTo(Math.min(80, Math.max(20, prev.temperature + tempChange))),
          humidity: roundTo(Math.min(100, Math.max(10, prev.humidity + humidityChange))),
          moisture: roundTo(Math.min(100, Math.max(0, prev.moisture + moistureChange))),
          weight: roundTo(Math.max(0.5, prev.weight + weightChange), 3),
        }
      } else {
        // If no drying cycle, simulate ambient changes
        return {
          temperature: roundTo(prev.temperature + randomNormal(0, 0.1)),
          humidity: roundTo(prev.humidity + randomNormal(0, 0.2)),
          moisture: roundTo(prev.moisture + randomNormal(0, 0.1)),
          weight: roundTo(prev.weight, 3),
        }
      }
    })
  }

  // Send sensor data to the API
  const sendSensorData = async () => {
    if (!isConnected) return

    try {
      addLog("Sending sensor data...")

      const response = await fetch("/api/sensor-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          deviceId,
          ...sensorData,
        }),
      })

      const data = await response.json()
      setLastApiResponse(data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to send sensor data")
      }

      addLog("Sensor data sent successfully")
    } catch (error) {
      console.error("Sensor data error:", error)
      addLog(`Failed to send sensor data: ${error instanceof Error ? error.message : "Unknown error"}`)
      // Continue simulation even if API call fails
    }
  }

  // Start a new drying cycle
  const startDryingCycle = async () => {
    if (!isConnected) {
      setError("Device must be connected first")
      return
    }

    try {
      setError(null)
      addLog(`Starting new drying cycle (${dryingCycle.mode} mode)...`)

      const response = await fetch("/api/drying-cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          deviceId,
          mode: dryingCycle.mode,
          temperature: dryingCycle.temperature,
          fanSpeed: dryingCycle.fanSpeed,
          aiEnabled: dryingCycle.aiEnabled,
          ecoMode: dryingCycle.ecoMode,
        }),
      })

      const data = await response.json()
      setLastApiResponse(data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to start drying cycle")
      }

      // Update drying cycle with data from API
      const cycleId = data.data?.id || Math.floor(Math.random() * 10000) // Fallback to random ID if API doesn't return one
      const estimatedTime = calculateEstimatedTime(dryingCycle.mode, dryingCycle.aiEnabled, dryingCycle.ecoMode)

      setDryingCycle((prev) => ({
        ...prev,
        id: cycleId,
        startTime: new Date(),
        progress: 0,
        estimatedTimeRemaining: estimatedTime,
        status: "in_progress",
      }))

      addLog(`Drying cycle started with ID: ${cycleId}`)
      addLog(`Estimated drying time: ${estimatedTime} minutes`)

      // Start the drying progress simulation
      startDryingSimulation()
    } catch (error) {
      console.error("Drying cycle error:", error)
      setError(`Failed to start drying cycle: ${error instanceof Error ? error.message : "Unknown error"}`)
      addLog(`Failed to start drying cycle: ${error instanceof Error ? error.message : "Unknown error"}`)

      // For simulation purposes, start anyway
      const cycleId = Math.floor(Math.random() * 10000)
      const estimatedTime = calculateEstimatedTime(dryingCycle.mode, dryingCycle.aiEnabled, dryingCycle.ecoMode)

      setDryingCycle((prev) => ({
        ...prev,
        id: cycleId,
        startTime: new Date(),
        progress: 0,
        estimatedTimeRemaining: estimatedTime,
        status: "in_progress",
      }))

      addLog("Continuing in simulation mode...")
      startDryingSimulation()
    }
  }

  // Update drying cycle progress
  const updateDryingProgress = async () => {
    if (dryingCycle.status !== "in_progress" || dryingCycle.id === null) return

    // Calculate progress based on elapsed time
    const elapsedMinutes = dryingCycle.startTime ? (Date.now() - dryingCycle.startTime.getTime()) / (60 * 1000) : 0
    const totalMinutes = calculateEstimatedTime(dryingCycle.mode, dryingCycle.aiEnabled, dryingCycle.ecoMode)
    const newProgress = Math.min(Math.round((elapsedMinutes / totalMinutes) * 100), 100)
    const newTimeRemaining = Math.max(0, Math.round(totalMinutes - elapsedMinutes))

    // Update local state
    setDryingCycle((prev) => ({
      ...prev,
      progress: newProgress,
      estimatedTimeRemaining: newTimeRemaining,
      status: newProgress >= 100 ? "completed" : "in_progress",
    }))

    // Send progress update to API
    try {
      if (dryingCycle.id) {
        addLog(`Updating drying cycle progress: ${newProgress}%`)

        const response = await fetch(`/api/drying-cycles/${dryingCycle.id}/progress`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            progress: newProgress,
            moisture: sensorData.moisture,
            temperature: sensorData.temperature,
            weight: sensorData.weight,
          }),
        })

        const data = await response.json()
        setLastApiResponse(data)

        if (!response.ok) {
          throw new Error(data.error || "Failed to update drying progress")
        }

        // If cycle is complete, stop the simulation
        if (newProgress >= 100) {
          addLog("Drying cycle completed")
          stopDryingSimulation()

          // Reset drying cycle after completion
          setDryingCycle((prev) => ({
            ...prev,
            id: null,
            startTime: null,
            progress: 0,
            estimatedTimeRemaining: 0,
            status: "idle",
          }))

          // Reset sensor data to simulate dry clothes
          setSensorData((prev) => ({
            ...prev,
            moisture: randomBetween(5, 10),
            humidity: randomBetween(30, 40),
          }))
        }
      }
    } catch (error) {
      console.error("Progress update error:", error)
      addLog(`Failed to update progress: ${error instanceof Error ? error.message : "Unknown error"}`)
      // Continue simulation even if API call fails
    }
  }

  // Start the sensor data simulation
  const startSensorSimulation = () => {
    if (sensorIntervalRef.current) {
      clearInterval(sensorIntervalRef.current)
    }

    // Update sensor data every 2 seconds (adjusted by simulation speed)
    const interval = Math.max(100, Math.round(2000 / simulationSpeed))
    sensorIntervalRef.current = setInterval(() => {
      updateSensorData()
      if (isSendingData) {
        sendSensorData()
      }
    }, interval)

    addLog(`Started sensor simulation (interval: ${interval}ms)`)
  }

  // Start the drying cycle simulation
  const startDryingSimulation = () => {
    if (dryingIntervalRef.current) {
      clearInterval(dryingIntervalRef.current)
    }

    // Update drying progress every 5 seconds (adjusted by simulation speed)
    const interval = Math.max(100, Math.round(5000 / simulationSpeed))
    dryingIntervalRef.current = setInterval(updateDryingProgress, interval)

    addLog(`Started drying cycle simulation (interval: ${interval}ms)`)
  }

  // Stop all simulations
  const stopSimulation = () => {
    if (sensorIntervalRef.current) {
      clearInterval(sensorIntervalRef.current)
      sensorIntervalRef.current = null
    }

    if (dryingIntervalRef.current) {
      clearInterval(dryingIntervalRef.current)
      dryingIntervalRef.current = null
    }

    setIsSendingData(false)
    addLog("Stopped all simulations")
  }

  // Stop just the drying simulation
  const stopDryingSimulation = () => {
    if (dryingIntervalRef.current) {
      clearInterval(dryingIntervalRef.current)
      dryingIntervalRef.current = null
    }

    addLog("Stopped drying cycle simulation")
  }

  // Toggle sending sensor data
  const toggleSendingData = () => {
    if (!isConnected) {
      setError("Device must be connected first")
      return
    }

    if (isSendingData) {
      setIsSendingData(false)
      addLog("Stopped sending sensor data")
    } else {
      setIsSendingData(true)
      addLog("Started sending sensor data")
      // Send initial data
      sendSensorData()
    }
  }

  // Update simulation speed
  const updateSimulationSpeed = (speed: number) => {
    setSimulationSpeed(speed)
    addLog(`Simulation speed set to ${speed}x`)

    // Restart simulations with new speed
    if (isSendingData) {
      startSensorSimulation()
    }
    if (dryingCycle.status === "in_progress") {
      startDryingSimulation()
    }
  }

  // Reset everything
  const resetSimulator = () => {
    stopSimulation()
    setDeviceId("")
    setDeviceName("")
    setDeviceModel("")
    setIsRegistered(false)
    setIsConnected(false)
    setAuthToken("")
    setSensorData({
      temperature: 25,
      humidity: 50,
      moisture: 80,
      weight: 3.5,
    })
    setDryingCycle({
      id: null,
      mode: "Normal",
      temperature: 55,
      fanSpeed: 70,
      aiEnabled: true,
      ecoMode: false,
      startTime: null,
      progress: 0,
      estimatedTimeRemaining: 0,
      status: "idle",
    })
    setError(null)
    setLastApiResponse(null)
    clearLogs()
    addLog("Simulator reset")
  }

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (sensorIntervalRef.current) {
        clearInterval(sensorIntervalRef.current)
      }
      if (dryingIntervalRef.current) {
        clearInterval(dryingIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Smart Clothes Dryer Simulator</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Simulate device data and drying cycles for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="device">
            <TabsList className="dark:bg-gray-800">
              <TabsTrigger
                value="device"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Device
              </TabsTrigger>
              <TabsTrigger
                value="sensors"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Sensors
              </TabsTrigger>
              <TabsTrigger
                value="drying"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Drying Cycle
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Logs
              </TabsTrigger>
            </TabsList>

            {/* Device Tab */}
            <TabsContent value="device" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="device-id" className="dark:text-gray-300">
                      Device ID
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="device-id"
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        placeholder="e.g., SD-1234"
                        disabled={isRegistered}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                      <Button
                        variant="outline"
                        onClick={generateRandomDevice}
                        disabled={isRegistered}
                        className="dark:border-gray-700 dark:text-gray-300"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="device-name" className="dark:text-gray-300">
                      Device Name
                    </Label>
                    <Input
                      id="device-name"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="e.g., Master Bedroom Dryer"
                      disabled={isRegistered}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="device-model" className="dark:text-gray-300">
                      Device Model
                    </Label>
                    <Input
                      id="device-model"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder="e.g., SmartDry Pro"
                      disabled={isRegistered}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border p-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-medium dark:text-white">Device Status</h3>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          {isConnected
                            ? "Connected and ready"
                            : isRegistered
                              ? "Registered but not connected"
                              : "Not registered"}
                        </p>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full ${isConnected ? "bg-green-500" : isRegistered ? "bg-yellow-500" : "bg-gray-500"}`}
                      ></div>
                    </div>
                  </div>

                  <div className="rounded-md border p-4 dark:border-gray-700 mt-4">
                    <div className="flex justify-center mb-2">
                      <Image
                        src="/images/device-simulator.png"
                        alt="Device Simulator"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground dark:text-gray-400">
                      {isConnected ? "Device connected and transmitting data" : "Connect device to start simulation"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={registerDevice}
                      disabled={isRegistered || !deviceId || !deviceName}
                      className="w-full dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                    >
                      Register Device
                    </Button>

                    <Button
                      onClick={isConnected ? disconnectDevice : connectDevice}
                      disabled={!deviceId || (!isRegistered && !isConnected)}
                      variant={isConnected ? "destructive" : "default"}
                      className="w-full"
                    >
                      {isConnected ? "Disconnect Device" : "Connect Device"}
                    </Button>

                    <Button
                      onClick={resetSimulator}
                      variant="outline"
                      className="w-full dark:border-gray-700 dark:text-gray-300"
                    >
                      Reset Simulator
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Simulation Speed</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[simulationSpeed]}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onValueChange={(value: number[]) => updateSimulationSpeed(value[0])}
                    className="flex-1 dark:bg-gray-800"
                  />
                  <span className="w-12 text-center dark:text-white">{simulationSpeed.toFixed(1)}x</span>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Adjust the speed of the simulation (0.1x to 10x)
                </p>
              </div>
            </TabsContent>

            {/* Sensors Tab */}
            <TabsContent value="sensors" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature" className="dark:text-gray-300">
                        Temperature: {sensorData.temperature}°C
                      </Label>
                      <Thermometer className="h-4 w-4 text-orange-500" />
                    </div>
                    <Slider
                      id="temperature"
                      value={[sensorData.temperature]}
                      min={10}
                      max={80}
                      step={0.1}
                      onValueChange={(value: number[]) => setSensorData((prev) => ({ ...prev, temperature: roundTo(value[0]) }))}
                      className="dark:bg-gray-800"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Normal range: 20-30°C, Drying range: 40-70°C
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="humidity" className="dark:text-gray-300">
                        Humidity: {sensorData.humidity}%
                      </Label>
                      <Droplets className="h-4 w-4 text-blue-500" />
                    </div>
                    <Slider
                      id="humidity"
                      value={[sensorData.humidity]}
                      min={0}
                      max={100}
                      step={0.1}
                      onValueChange={(value: number[]) => setSensorData((prev) => ({ ...prev, humidity: roundTo(value[0]) }))}
                      className="dark:bg-gray-800"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Ambient humidity in the dryer environment
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="moisture" className="dark:text-gray-300">
                        Moisture: {sensorData.moisture}%
                      </Label>
                      <Droplets className="h-4 w-4 text-green-500" />
                    </div>
                    <Slider
                      id="moisture"
                      value={[sensorData.moisture]}
                      min={0}
                      max={100}
                      step={0.1}
                      onValueChange={(value: number[]) => setSensorData((prev) => ({ ...prev, moisture: roundTo(value[0]) }))}
                      className="dark:bg-gray-800"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Moisture content of the clothes (0% = completely dry)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weight" className="dark:text-gray-300">
                        Weight: {sensorData.weight} kg
                      </Label>
                      <Weight className="h-4 w-4 text-gray-500" />
                    </div>
                    <Slider
                      id="weight"
                      value={[sensorData.weight]}
                      min={0.5}
                      max={10}
                      step={0.1}
                      onValueChange={(value: number[]) => setSensorData((prev) => ({ ...prev, weight: roundTo(value[0], 3) }))}
                      className="dark:bg-gray-800"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Weight of the clothes (decreases as they dry)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                <Button
                  onClick={toggleSendingData}
                  disabled={!isConnected}
                  variant={isSendingData ? "destructive" : "default"}
                  className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                >
                  {isSendingData ? "Stop Sending Data" : "Start Sending Data"}
                </Button>

                <Button
                  onClick={() => {
                    updateSensorData()
                    sendSensorData()
                  }}
                  disabled={!isConnected}
                  variant="outline"
                  className="dark:border-gray-700 dark:text-gray-300"
                >
                  Send Single Update
                </Button>
              </div>
            </TabsContent>

            {/* Drying Cycle Tab */}
            <TabsContent value="drying" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="drying-mode" className="dark:text-gray-300">
                      Drying Mode
                    </Label>
                    <Select
                      value={dryingCycle.mode}
                      onValueChange={(value: string) => setDryingCycle((prev) => ({ ...prev, mode: value }))}
                      disabled={dryingCycle.status === "in_progress"}
                    >
                      <SelectTrigger id="drying-mode" className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="Normal" className="dark:text-gray-300">
                          Normal
                        </SelectItem>
                        <SelectItem value="Quick" className="dark:text-gray-300">
                          Quick
                        </SelectItem>
                        <SelectItem value="Delicate" className="dark:text-gray-300">
                          Delicate
                        </SelectItem>
                        <SelectItem value="Heavy Duty" className="dark:text-gray-300">
                          Heavy Duty
                        </SelectItem>
                        <SelectItem value="Eco" className="dark:text-gray-300">
                          Eco
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="drying-temperature" className="dark:text-gray-300">
                        Temperature: {dryingCycle.temperature}°C
                      </Label>
                    </div>
                    <Slider
                      id="drying-temperature"
                      value={[dryingCycle.temperature]}
                      min={30}
                      max={80}
                      step={1}
                      onValueChange={(value: number[]) => setDryingCycle((prev) => ({ ...prev, temperature: value[0] }))}
                      disabled={dryingCycle.status === "in_progress"}
                      className="dark:bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fan-speed" className="dark:text-gray-300">
                        Fan Speed: {dryingCycle.fanSpeed}%
                      </Label>
                    </div>
                    <Slider
                      id="fan-speed"
                      value={[dryingCycle.fanSpeed]}
                      min={10}
                      max={100}
                      step={1}
                      onValueChange={(value: number[]) => setDryingCycle((prev) => ({ ...prev, fanSpeed: value[0] }))}
                      disabled={dryingCycle.status === "in_progress"}
                      className="dark:bg-gray-800"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="ai-optimization" className="dark:text-gray-300">
                        AI Optimization
                      </Label>
                    </div>
                    <Switch
                      id="ai-optimization"
                      checked={dryingCycle.aiEnabled}
                      onCheckedChange={(checked: boolean) => setDryingCycle((prev) => ({ ...prev, aiEnabled: checked }))}
                      disabled={dryingCycle.status === "in_progress"}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="eco-mode" className="dark:text-gray-300">
                        Eco Mode
                      </Label>
                    </div>
                    <Switch
                      id="eco-mode"
                      checked={dryingCycle.ecoMode}
                      onCheckedChange={(checked: boolean) => setDryingCycle((prev) => ({ ...prev, ecoMode: checked }))}
                      disabled={dryingCycle.status === "in_progress"}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border p-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium mb-2 dark:text-white">Drying Cycle Status</h3>
                    {dryingCycle.status === "in_progress" ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm dark:text-gray-300">
                            <span>Progress</span>
                            <span className="font-medium">{dryingCycle.progress}%</span>
                          </div>
                          <Progress value={dryingCycle.progress} className="dark:bg-gray-700" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium dark:text-gray-300">Time Remaining</p>
                            <p className="dark:text-gray-400">{dryingCycle.estimatedTimeRemaining} minutes</p>
                          </div>
                          <div>
                            <p className="font-medium dark:text-gray-300">Start Time</p>
                            <p className="dark:text-gray-400">{dryingCycle.startTime?.toLocaleTimeString() || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium dark:text-gray-300">Cycle ID</p>
                            <p className="dark:text-gray-400">{dryingCycle.id || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium dark:text-gray-300">Energy Usage</p>
                            <p className="dark:text-gray-400">
                              {calculateEnergyUsage(dryingCycle.mode, dryingCycle.aiEnabled, dryingCycle.ecoMode)} kWh
                              (est.)
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm dark:text-gray-400">No active drying cycle</p>
                    )}
                  </div>

                  <Button
                    onClick={dryingCycle.status === "in_progress" ? stopDryingSimulation : startDryingCycle}
                    disabled={!isConnected}
                    variant={dryingCycle.status === "in_progress" ? "destructive" : "default"}
                    className="w-full dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                  >
                    {dryingCycle.status === "in_progress" ? (
                      <>
                        <StopIcon className="mr-2 h-4 w-4" />
                        Stop Drying Cycle
                      </>
                    ) : (
                      <>
                        <PlayIcon className="mr-2 h-4 w-4" />
                        Start Drying Cycle
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      setDryingCycle({
                        id: null,
                        mode: generateDryingMode(),
                        temperature: Math.floor(randomBetween(45, 65)),
                        fanSpeed: Math.floor(randomBetween(60, 90)),
                        aiEnabled: Math.random() > 0.3, // 70% chance of being enabled
                        ecoMode: Math.random() > 0.5, // 50% chance of being enabled
                        startTime: null,
                        progress: 0,
                        estimatedTimeRemaining: 0,
                        status: "idle",
                      })
                      setSensorData({
                        temperature: roundTo(randomBetween(20, 30)),
                        humidity: roundTo(randomBetween(40, 60)),
                        moisture: roundTo(randomBetween(70, 90)),
                        weight: roundTo(randomBetween(2, 5), 3),
                      })
                      addLog("Generated random drying settings and sensor data")
                    }}
                    variant="outline"
                    disabled={dryingCycle.status === "in_progress"}
                    className="w-full dark:border-gray-700 dark:text-gray-300"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Random Settings
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium dark:text-white">Simulator Logs</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearLogs}
                  className="dark:border-gray-700 dark:text-gray-300"
                >
                  Clear Logs
                </Button>
              </div>

              <div className="h-[300px] overflow-y-auto rounded-md border p-4 dark:border-gray-700 dark:bg-gray-800">
                {logs.length > 0 ? (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <p key={index} className="text-sm font-mono dark:text-gray-300">
                        {log}
                      </p>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground dark:text-gray-400">No logs yet</p>
                )}
              </div>

              {lastApiResponse && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium dark:text-white">Last API Response</h3>
                  <pre className="text-xs overflow-auto p-4 rounded-md bg-gray-100 dark:bg-gray-800 dark:text-gray-300 max-h-[200px]">
                    {JSON.stringify(lastApiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground dark:text-gray-400 flex items-center">
            <InfoIcon className="h-4 w-4 mr-2" />
            {isConnected ? "Device connected and ready for simulation" : "Connect the device to start simulation"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const helpText = `
Device Simulator Help:

1. Device Tab: Register and connect your virtual device
2. Sensors Tab: Adjust sensor values and send data
3. Drying Cycle Tab: Start and monitor drying cycles
4. Logs Tab: View activity logs and API responses

Tips:
- Use "Generate" to create random device info
- Adjust simulation speed to speed up or slow down the process
- Start sending data before starting a drying cycle
- Check logs for detailed information about operations
              `
              addLog("Showing help information")
              alert(helpText)
            }}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            Help
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
