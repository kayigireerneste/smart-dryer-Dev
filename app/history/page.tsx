"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Home, LogOut, Menu, Settings } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import DryingHistoryTable from "@/components/drying-history-table"
import { NotificationBell } from "@/components/notification-provider"
import { SmartDryLogo } from "@/components/logo"

export default function HistoryPage() {
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
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
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
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold dark:text-white">Drying History</h1>
          </div>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Drying History</CardTitle>
              <CardDescription className="dark:text-gray-400">
                View your recent drying sessions and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DryingHistoryTable />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
