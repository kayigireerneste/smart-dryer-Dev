"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  History,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  Lock,
  BellIcon,
  Smartphone,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "@/components/theme-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationBell } from "@/components/notification-provider"
import { SmartDryLogo } from "@/components/logo"

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // User settings state
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [notifyDryingComplete, setNotifyDryingComplete] = useState(true)
  const [notifyErrors, setNotifyErrors] = useState(true)
  const [notifyUpdates, setNotifyUpdates] = useState(false)
  const [offlineMode, setOfflineMode] = useState(true)

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to a backend
    alert("Profile updated successfully!")
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to a backend
    alert("Password changed successfully!")
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
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                >
                  <History className="h-5 w-5" />
                  History
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
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
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
            >
              <History className="h-5 w-5" />
              History
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
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
            <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="dark:bg-gray-800">
              <TabsTrigger
                value="profile"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="app"
                className="dark:data-[state=active]:bg-gray-950 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                App Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="dark:text-gray-300">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="dark:text-gray-300">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <Button type="submit" className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="dark:text-gray-300">
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="dark:text-gray-300">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="dark:text-gray-300">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <Button type="submit" className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <BellIcon className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="drying-complete" className="dark:text-gray-300">
                        Drying Complete
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Receive notifications when your clothes are dry
                      </p>
                    </div>
                    <Switch
                      id="drying-complete"
                      checked={notifyDryingComplete}
                      onCheckedChange={setNotifyDryingComplete}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="errors" className="dark:text-gray-300">
                        System Errors
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Receive notifications about system errors or issues
                      </p>
                    </div>
                    <Switch id="errors" checked={notifyErrors} onCheckedChange={setNotifyErrors} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="updates" className="dark:text-gray-300">
                        App Updates
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Receive notifications about new features and updates
                      </p>
                    </div>
                    <Switch id="updates" checked={notifyUpdates} onCheckedChange={setNotifyUpdates} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="app">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Smartphone className="h-5 w-5" />
                    App Settings
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme-select" className="dark:text-gray-300">
                        Theme
                      </Label>
                      <div className="flex items-center space-x-4">
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="light" className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                <span>Light</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark" className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                <span>Dark</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="system" className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                <span>System</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTheme("light")}
                            className={`${theme === "light" ? "bg-blue-100 dark:bg-blue-900" : ""} dark:border-gray-700`}
                          >
                            <Sun className="h-5 w-5" />
                            <span className="sr-only">Light mode</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTheme("dark")}
                            className={`${theme === "dark" ? "bg-blue-100 dark:bg-blue-900" : ""} dark:border-gray-700`}
                          >
                            <Moon className="h-5 w-5" />
                            <span className="sr-only">Dark mode</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTheme("system")}
                            className={`${theme === "system" ? "bg-blue-100 dark:bg-blue-900" : ""} dark:border-gray-700`}
                          >
                            <Monitor className="h-5 w-5" />
                            <span className="sr-only">System mode</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                        Choose between light, dark, or system theme preferences.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="offline-mode" className="dark:text-gray-300">
                        Offline Mode
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Allow app to function with limited features when offline
                      </p>
                    </div>
                    <Switch id="offline-mode" checked={offlineMode} onCheckedChange={setOfflineMode} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
