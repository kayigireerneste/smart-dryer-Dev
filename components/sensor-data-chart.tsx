"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import Image from "next/image"

// Generate mock sensor data
const generateMockData = () => {
  const data = []
  const now = new Date()

  for (let i = 60; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000) // 1 minute intervals
    const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Generate realistic sensor data with some variation
    const baseTemp = 28 + Math.sin(i / 10) * 2
    const baseHumidity = 45 - Math.cos(i / 15) * 5
    const baseMoisture = Math.max(0, 30 - i / 2 + Math.sin(i / 8) * 3)

    data.push({
      time: timeStr,
      temperature: Number.parseFloat(baseTemp.toFixed(1)),
      humidity: Number.parseFloat(baseHumidity.toFixed(1)),
      moisture: Number.parseFloat(baseMoisture.toFixed(1)),
    })
  }

  return data
}

type SensorData = {
  time: string
  temperature: number
  humidity: number
  moisture: number
}

export default function SensorDataChart() {
  const [data, setData] = useState<SensorData[]>([])

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      setData(generateMockData())

      // Update data every minute in a real app
      const interval = setInterval(() => {
        setData((prevData) => {
          if (!prevData || prevData.length === 0) return generateMockData()

          const newData = [...prevData.slice(1)]
          const lastTime = new Date()
          const timeStr = lastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

          // Add new data point with safe access to previous data
          const lastPoint = prevData[prevData.length - 1] || { temperature: 28, humidity: 45, moisture: 15 }

          newData.push({
            time: timeStr,
            temperature: Number.parseFloat((lastPoint.temperature + (Math.random() * 0.6 - 0.3)).toFixed(1)),
            humidity: Number.parseFloat((lastPoint.humidity + (Math.random() * 1.4 - 0.7)).toFixed(1)),
            moisture: Number.parseFloat(Math.max(0, lastPoint.moisture - 0.3 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
          })

          return newData
        })
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [])

  // Return early if no data or not in browser
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex flex-col items-center justify-center">
        <p className="mb-4">Loading chart data...</p>
        <Image
          src="/images/temperature-chart.png"
          alt="Temperature Chart"
          width={400}
          height={200}
          className="rounded-lg border dark:border-gray-700"
        />
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => value || ""}
            minTickGap={30}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={10} domain={[0, "dataMax + 10"]} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Time</span>
                        <span className="font-bold text-xs">{label}</span>
                      </div>
                      {payload.map((item) => (
                        <div key={item.dataKey} className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">{item.dataKey}</span>
                          <span className="font-bold text-xs">
                            {item.value}
                            {item.dataKey === "temperature"
                              ? "°C"
                              : item.dataKey === "humidity" || item.dataKey === "moisture"
                                ? "%"
                                : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="moisture" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#f97316]" />
          <span>Temperature (°C)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
          <span>Humidity (%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#10b981]" />
          <span>Moisture (%)</span>
        </div>
      </div>
    </div>
  )
}
