import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/migrations"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you would check if the user is an admin
    // For now, we'll just proceed

    const migrationsDir = path.join(process.cwd(), "migrations")
    const success = await runMigrations(migrationsDir)

    if (success) {
      return NextResponse.json({ success: true, message: "Migrations completed successfully" })
    } else {
      return NextResponse.json({ success: false, error: "Migration failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error running migrations:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
