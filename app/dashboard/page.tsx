"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart, Droplets, History, Home, LogOut, Menu, Settings, Thermometer, Weight } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import DryerControlPanel from "@/components/dryer-control-panel"
import SensorDataChart from "@/components/sensor-data-chart"
import DryingHistoryTable from "@/components/drying-history-table"
import Link from "next/link"
import { NotificationBell } from "@/components/notification-provider"
import { AddNotificationDemo } from "@/components/add-notification-demo"
import { SimulatorLink } from "@/components/simulator-link"
import Image from "next/image"
import { SmartDryLogo } from "@/components/logo"

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)

    // Check if user is authenticated
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <div className="flex min-h-screen flex-col dark:bg-gray-950">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden dark:border-gray-700 dark:text-gray-300">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 dark:bg-gray-950 dark:border-gray-800">
              <nav className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2 px-2">
                  <SmartDryLogo className="h-6 w-6" color="#3b82f6" />
                  <span className="text-xl font-bold dark:text-white">SmartDry</span>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  <History className="h-5 w-5" />
                  History
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <Button
                  variant="ghost"
                  className="justify-start gap-2 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 ml-4 lg:ml-0">
            <SmartDryLogo className="h-6 w-6" color="#3b82f6" />
            <span className="text-xl font-bold hidden md:inline-block dark:text-white">SmartDry</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 lg:gap-6">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="dark:text-gray-300">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-16 flex flex-1">
        <aside className="hidden w-64 fixed top-16 bottom-0 left-0 border-r bg-gray-50 lg:block dark:bg-gray-950 dark:border-gray-800 overflow-y-auto">
          <nav className="flex flex-col gap-4 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
            >
              <History className="h-5 w-5" />
              History
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <Button
              variant="ghost"
              className="justify-start gap-2 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 lg:ml-64 dark:bg-gray-950">
          <Tabs defaultValue="overview">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
              <TabsList className="dark:bg-gray-800">
                <TabsTrigger
                  value="overview"
                  className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="control"
                  className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
                >
                  Control
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
                >
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium dark:text-white">Temperature</CardTitle>
                    <Thermometer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">28°C</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Optimal range: 25-30°C</p>
                  </CardContent>
                </Card>
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium dark:text-white">Humidity</CardTitle>
                    <Droplets className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">45%</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Optimal range: 40-60%</p>
                  </CardContent>
                </Card>
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium dark:text-white">Moisture Level</CardTitle>
                    <Droplets className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">18%</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target: &lt;5%</p>
                  </CardContent>
                </Card>
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium dark:text-white">Weight</CardTitle>
                    <Weight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">2.4 kg</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Initial: 3.1 kg</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Current Drying Status</CardTitle>
                  <CardDescription className="dark:text-gray-400">Estimated completion in 35 minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm dark:text-gray-300">
                        <span>Progress</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <Progress value={65} className="dark:bg-gray-700" />
                    </div>
                    <div className="flex justify-center my-4">
                      <Image
                        src="/images/dryer-status.png"
                        alt="Dryer Status Visualization"
                        width={300}
                        height={200}
                        className="rounded-lg border dark:border-gray-700"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium mb-1 dark:text-gray-300">Drying Mode</div>
                        <div className="text-sm dark:text-gray-400">Normal (AI Optimized)</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1 dark:text-gray-300">Energy Usage</div>
                        <div className="text-sm dark:text-gray-400">0.8 kWh (Estimated)</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1 dark:text-gray-300">Start Time</div>
                        <div className="text-sm dark:text-gray-400">Today, 14:30</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1 dark:text-gray-300">Expected End Time</div>
                        <div className="text-sm dark:text-gray-400">Today, 15:45</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="dark:text-white">Sensor Data Trends</CardTitle>
                    <CardDescription className="dark:text-gray-400">Last 60 minutes of sensor readings</CardDescription>
                  </div>
                  <BarChart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <SensorDataChart />
                </CardContent>
              </Card>
              <AddNotificationDemo />
              <SimulatorLink />
            </TabsContent>

            <TabsContent value="control">
              <DryerControlPanel />
            </TabsContent>

            <TabsContent value="history">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Drying History</CardTitle>
                  <CardDescription className="dark:text-gray-400">View your recent drying sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <DryingHistoryTable />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
