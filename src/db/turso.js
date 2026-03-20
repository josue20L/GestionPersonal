import { createClient } from '@libsql/client'

const url = import.meta.env.VITE_TURSO_URL
const authToken = import.meta.env.VITE_TURSO_TOKEN

export const client = createClient({ url, authToken })

const createTables = [
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    date TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    frequency TEXT DEFAULT 'daily',
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS habit_logs (
    id TEXT PRIMARY KEY,
    habit_id TEXT,
    date TEXT,
    completed INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    created_at TEXT
  )`
]

export async function initDB() {
  for (const sql of createTables) {
    await client.execute(sql)
  }
}
