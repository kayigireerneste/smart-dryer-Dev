import { sql } from "@/lib/neon"
import fs from "fs"
import path from "path"

export interface Migration {
  id: number
  filename: string
  executed_at: Date
}

export async function createMigrationsTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `
  } catch (error) {
    console.error("Error creating migrations table:", error)
    throw error
  }
}

export async function getExecutedMigrations(): Promise<string[]> {
  try {
    await createMigrationsTable()

    const result = await sql`
      SELECT filename FROM migrations ORDER BY id ASC
    `

    return result.map((row: any) => row.filename)
  } catch (error) {
    console.error("Error getting executed migrations:", error)
    return []
  }
}

export async function executeMigration(filename: string, content: string): Promise<boolean> {
  try {
    // Execute the migration SQL
    await sql.unsafe(content)

    // Record the migration as executed
    await sql`
      INSERT INTO migrations (filename) VALUES (${filename})
    `

    console.log(`Migration ${filename} executed successfully`)
    return true
  } catch (error) {
    console.error(`Error executing migration ${filename}:`, error)
    return false
  }
}

export async function runMigrations(migrationsDir?: string): Promise<boolean> {
  try {
    const migrationPath = migrationsDir || path.join(process.cwd(), "migrations")

    // Check if migrations directory exists
    if (!fs.existsSync(migrationPath)) {
      console.log("No migrations directory found, skipping migrations")
      return true
    }

    // Get list of migration files
    const migrationFiles = fs
      .readdirSync(migrationPath)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    if (migrationFiles.length === 0) {
      console.log("No migration files found")
      return true
    }

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations()

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.includes(file))

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations")
      return true
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`)

    // Execute pending migrations
    for (const migrationFile of pendingMigrations) {
      const migrationContent = fs.readFileSync(path.join(migrationPath, migrationFile), "utf8")

      const success = await executeMigration(migrationFile, migrationContent)

      if (!success) {
        console.error(`Failed to execute migration: ${migrationFile}`)
        return false
      }
    }

    console.log("All migrations executed successfully")
    return true
  } catch (error) {
    console.error("Error running migrations:", error)
    return false
  }
}

export async function rollbackMigration(filename: string): Promise<boolean> {
  try {
    // Remove the migration record
    await sql`
      DELETE FROM migrations WHERE filename = ${filename}
    `

    console.log(`Migration ${filename} rolled back`)
    return true
  } catch (error) {
    console.error(`Error rolling back migration ${filename}:`, error)
    return false
  }
}
