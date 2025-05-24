"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal } from "lucide-react"

export function SimulatorLink() {
  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <Terminal className="h-5 w-5" />
          Device Simulator
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Test your application with simulated device data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="dark:text-gray-300 mb-4">
          Use our device simulator to generate realistic sensor data and test drying cycles without physical hardware.
        </p>
        <Link href="/simulator">
          <Button className="w-full dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">Open Simulator</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
