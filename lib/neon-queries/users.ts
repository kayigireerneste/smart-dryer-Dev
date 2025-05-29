import { sql } from "@/lib/neon"

export interface User {
  id: number
  email: string
  name: string
  password?: string
  created_at: Date
  updated_at: Date
}

export interface CreateUserData {
  email: string
  name: string
  password: string
}

export interface UpdateUserData {
  name?: string
  password?: string
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, password, created_at, updated_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, password, created_at, updated_at
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function createUser(userData: CreateUserData): Promise<User | null> {
  try {
    const result = await sql`
      INSERT INTO users (email, name, password, created_at, updated_at)
      VALUES (${userData.email}, ${userData.name}, ${userData.password}, NOW(), NOW())
      RETURNING id, email, name, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
  try {
    const updates = []
    const values = []

    if (userData.name !== undefined) {
      updates.push("name = $" + (values.length + 2))
      values.push(userData.name)
    }

    if (userData.password !== undefined) {
      updates.push("password = $" + (values.length + 2))
      values.push(userData.password)
    }

    if (updates.length === 0) {
      return getUserById(id)
    }

    updates.push("updated_at = NOW()")

    const result = await sql`
      UPDATE users 
      SET ${sql.unsafe(updates.join(", "))}
      WHERE id = ${id}
      RETURNING id, email, name, created_at, updated_at
    `

    return result[0] || null
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}
    `

    return result.count > 0
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}
