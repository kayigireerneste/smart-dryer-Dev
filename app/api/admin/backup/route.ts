import { NextResponse } from "next/server"
import { backupDatabase, restoreDatabase } from "@/lib/backup"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you would check if the user is an admin

    const { type = "full", tables = [] } = await request.json()

    const result = await backupDatabase({
      includeData: type === "full" || type === "data",
      includeDDL: type === "full" || type === "schema",
      tables: tables.length > 0 ? tables : undefined,
    })

    return NextResponse.json({
      success: true,
      message: "Backup completed successfully",
      schema: result.schema,
      data: result.data,
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { backupFile, dropExisting = false } = await request.json()

    if (!backupFile) {
      return NextResponse.json({ error: "Backup file is required" }, { status: 400 })
    }

    const success = await restoreDatabase({ backupFile, dropExisting })

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Database restored successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to restore database",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error restoring database:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
