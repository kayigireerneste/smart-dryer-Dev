"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Power } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DryerControlPanel() {
  const [isPowerOn, setIsPowerOn] = useState(true)
  const [dryingMode, setDryingMode] = useState("auto")
  const [temperature, setTemperature] = useState(50)
  const [fanSpeed, setFanSpeed] = useState(70)
  const [isAiEnabled, setIsAiEnabled] = useState(true)
  const [isEcoMode, setIsEcoMode] = useState(false)
  const [isStarted, setIsStarted] = useState(false)

  const handleStart = () => {
    if (!isPowerOn) return
    setIsStarted(!isStarted)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Dryer Controls</CardTitle>
          <CardDescription>Adjust settings and control your smart dryer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Power className={`h-5 w-5 ${isPowerOn ? "text-green-500" : "text-gray-400"}`} />
              <Label htmlFor="power">Power</Label>
            </div>
            <Switch id="power" checked={isPowerOn} onCheckedChange={setIsPowerOn} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drying-mode">Drying Mode</Label>
            <Select disabled={!isPowerOn} value={dryingMode} onValueChange={setDryingMode}>
              <SelectTrigger id="drying-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (AI Optimized)</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="delicate">Delicate</SelectItem>
                <SelectItem value="quick">Quick Dry</SelectItem>
                <SelectItem value="heavy">Heavy Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature: {temperature}°C</Label>
            </div>
            <Slider
              id="temperature"
              disabled={!isPowerOn || dryingMode === "auto"}
              min={30}
              max={80}
              step={1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fan-speed">Fan Speed: {fanSpeed}%</Label>
            </div>
            <Slider
              id="fan-speed"
              disabled={!isPowerOn || dryingMode === "auto"}
              min={10}
              max={100}
              step={1}
              value={[fanSpeed]}
              onValueChange={(value) => setFanSpeed(value[0])}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="ai-optimization">AI Optimization</Label>
            </div>
            <Switch id="ai-optimization" disabled={!isPowerOn} checked={isAiEnabled} onCheckedChange={setIsAiEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="eco-mode">Eco Mode</Label>
            </div>
            <Switch id="eco-mode" disabled={!isPowerOn} checked={isEcoMode} onCheckedChange={setIsEcoMode} />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!isPowerOn}
            variant={isStarted ? "destructive" : "default"}
            onClick={handleStart}
          >
            {isStarted ? "Stop Drying" : "Start Drying"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Smart suggestions based on your clothes and conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Optimal Settings Detected</AlertTitle>
            <AlertDescription>
              Based on the current load (2.4kg) and fabric types, we recommend using the Auto mode with AI optimization
              enabled.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Recommended Temperature</h4>
              <p className="text-sm">50°C - Best for mixed fabrics in current load</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Estimated Drying Time</h4>
              <p className="text-sm">45 minutes (35 minutes with AI optimization)</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Energy Saving Tip</h4>
              <p className="text-sm">Enable Eco Mode to reduce energy consumption by up to 15%</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Weather Conditions</h4>
              <p className="text-sm">Current humidity: 45% (favorable for efficient drying)</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            disabled={!isPowerOn}
            onClick={() => {
              setDryingMode("auto")
              setTemperature(50)
              setFanSpeed(70)
              setIsAiEnabled(true)
              setIsEcoMode(true)
            }}
          >
            Apply Recommended Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
