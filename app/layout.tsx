import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/components/notification-provider"
import { SessionProvider } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "SmartDry - Smart Clothes Dryer System",
  description: "An AI-based integrated system with Internet of Things and cloud computing capabilities",
    generator: 'dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider defaultTheme="light" storageKey="smartdry-theme">
            <NotificationProvider>{children}</NotificationProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
