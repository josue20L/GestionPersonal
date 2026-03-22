import { useState } from 'react'
import db from '../db/dexie.js'
import useSync from './useSync'

export default function useHabits() {
  const [habits, setHabits] = useState([])
  const { syncNow } = useSync()

  async function getHabits() {
    const rows = await db.habits.toArray()
    setHabits(rows)
    return rows
  }

  async function addHabit(habit) {
    const id = habit.id || crypto.randomUUID()
    const row = {
      id,
      name: habit.name,
      description: habit.description ?? null,
      frequency: 'daily',
      created_at: new Date().toISOString(),
    }
    await db.habits.put(row)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'habits',
      action: 'create',
      payload: row,
      synced: 0,
      created_at: new Date().toISOString(),
    })
    syncNow()
    return id
  }

  async function updateHabit(id, changes) {
    await db.habits.update(id, { ...changes })
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'habits',
      action: 'update',
      payload: { id, ...changes },
      synced: 0,
      created_at: new Date().toISOString(),
    })
    syncNow()
  }

  async function deleteHabit(id) {
    await db.habits.delete(id)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'habits',
      action: 'delete',
      payload: { id },
      synced: 0,
      created_at: new Date().toISOString(),
    })
    syncNow()
  }

  async function toggleHabitLog(habitId, date) {
    const existing = await db.habit_logs
      .where({ habit_id: habitId, date })
      .first()
    
    let logId
    let payload

    if (existing) {
      const next = existing.completed ? 0 : 1
      await db.habit_logs.update(existing.id, { completed: next })
      logId = existing.id
      payload = { ...existing, completed: next }
    } else {
      const id = crypto.randomUUID()
      payload = {
        id,
        habit_id: habitId,
        date,
        completed: 1,
      }
      await db.habit_logs.put(payload)
      logId = id
    }

    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'habit_logs',
      action: 'create', // Usamos create para INSERT OR REPLACE en la API
      payload,
      synced: 0,
      created_at: new Date().toISOString(),
    })
    syncNow()
    
    return logId
  }

  async function getStreak(habitId) {
    const logs = await db.habit_logs
      .where('habit_id')
      .equals(habitId)
      .and((l) => l.completed === 1)
      .toArray()
    const dates = new Set(logs.map((l) => l.date))
    let streak = 0
    const today = new Date()
    for (;;) {
      const d = new Date(today)
      d.setDate(today.getDate() - streak)
      const iso = d.toISOString().slice(0, 10)
      if (dates.has(iso)) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  return { habits, getHabits, addHabit, updateHabit, deleteHabit, toggleHabitLog, getStreak }
}
