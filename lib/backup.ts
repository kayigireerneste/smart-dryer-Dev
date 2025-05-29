import { sql } from "@/lib/neon"

export interface BackupOptions {
  includeData?: boolean
  includeDDL?: boolean
  tables?: string[]
}

export interface BackupResult {
  schema?: string
  data?: string
  timestamp: Date
}

export interface RestoreOptions {
  backupFile: string
  dropExisting?: boolean
}

export async function backupDatabase(options: BackupOptions = {}): Promise<BackupResult> {
  const { includeData = true, includeDDL = true, tables } = options

  try {
    let schema = ""
    let data = ""

    // Get list of tables to backup
    const tablesToBackup = tables || (await getAllTables())

    if (includeDDL) {
      schema = await backupSchema(tablesToBackup)
    }

    if (includeData) {
      data = await backupData(tablesToBackup)
    }

    return {
      schema,
      data,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("Error creating backup:", error)
    throw error
  }
}

export async function restoreDatabase(options: RestoreOptions): Promise<boolean> {
  const { backupFile, dropExisting = false } = options

  try {
    if (dropExisting) {
      await dropAllTables()
    }

    // Execute the backup SQL
    await sql.unsafe(backupFile)

    console.log("Database restored successfully")
    return true
  } catch (error) {
    console.error("Error restoring database:", error)
    return false
  }
}

async function getAllTables(): Promise<string[]> {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `

    return result.map((row: any) => row.table_name)
  } catch (error) {
    console.error("Error getting table list:", error)
    return []
  }
}

async function backupSchema(tables: string[]): Promise<string> {
  let schema = ""

  try {
    for (const table of tables) {
      // Get table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = ${table}
        ORDER BY ordinal_position
      `

      if (columns.length > 0) {
        schema += `-- Table: ${table}\n`
        schema += `CREATE TABLE IF NOT EXISTS ${table} (\n`

        const columnDefs = columns.map((col: any) => {
          let def = `  ${col.column_name} ${col.data_type}`
          if (col.is_nullable === "NO") {
            def += " NOT NULL"
          }
          if (col.column_default) {
            def += ` DEFAULT ${col.column_default}`
          }
          return def
        })

        schema += columnDefs.join(",\n")
        schema += "\n);\n\n"
      }
    }

    return schema
  } catch (error) {
    console.error("Error backing up schema:", error)
    return ""
  }
}

async function backupData(tables: string[]): Promise<string> {
  let data = ""

  try {
    for (const table of tables) {
      const rows: any[] = await sql`SELECT * FROM ${sql.unsafe(table)}`

      if (rows.length > 0) {
        data += `-- Data for table: ${table}\n`

        // Get column names
        const columns = Object.keys(rows[0])

        for (const row of rows) {
          const values = columns.map((col) => {
            const value = row[col]
            if (value === null) return "NULL"
            if (typeof value === "string") return `'${value.replace(/'/g, "''")}'`
            if (value instanceof Date) return `'${value.toISOString()}'`
            return value
          })

          data += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`
        }

        data += "\n"
      }
    }

    return data
  } catch (error) {
    console.error("Error backing up data:", error)
    return ""
  }
}

async function dropAllTables(): Promise<void> {
  try {
    const tables = await getAllTables()

    // Drop tables in reverse order to handle dependencies
    for (const table of tables.reverse()) {
      await sql.unsafe(`DROP TABLE IF EXISTS ${table} CASCADE`)
    }

    console.log("All tables dropped")
  } catch (error) {
    console.error("Error dropping tables:", error)
    throw error
  }
}

export async function scheduleBackup(intervalHours = 24): Promise<void> {
  const intervalMs = intervalHours * 60 * 60 * 1000

  const performBackup = async () => {
    try {
      console.log("Starting scheduled backup...")
      const backup = await backupDatabase()

      // In a real application, you would save this to a file or cloud storage
      console.log("Scheduled backup completed successfully")
      console.log(`Backup size: ${backup.data?.length || 0} characters`)
    } catch (error) {
      console.error("Scheduled backup failed:", error)
    }
  }

  // Perform initial backup
  await performBackup()

  // Schedule recurring backups
  setInterval(performBackup, intervalMs)

  console.log(`Backup scheduled every ${intervalHours} hours`)
}
