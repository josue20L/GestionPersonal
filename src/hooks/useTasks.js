import { useState } from 'react'
import db from '../db/dexie.js'

export default function useTasks() {
  const [tasks, setTasks] = useState([])

  async function getTasks(date) {
    const rows = await db.tasks.where('date').equals(date).toArray()
    setTasks(rows)
    return rows
  }

  async function addTask(task) {
    const id = task.id || crypto.randomUUID()
    const row = {
      id,
      title: task.title,
      description: task.description ?? null,
      date: task.date,
      completed: task.completed ? 1 : 0,
      created_at: new Date().toISOString(),
    }
    await db.tasks.put(row)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'tasks',
      action: 'create',
      payload: row,
      synced: 0,
      created_at: new Date().toISOString(),
    })
    return id
  }

  async function updateTask(id, changes) {
    const normalized = { ...changes }
    if (typeof normalized.completed !== 'undefined') {
      normalized.completed = normalized.completed ? 1 : 0
    }
    await db.tasks.update(id, normalized)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'tasks',
      action: 'update',
      payload: { id, ...normalized },
      synced: 0,
      created_at: new Date().toISOString(),
    })
  }

  async function deleteTask(id) {
    await db.tasks.delete(id)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'tasks',
      action: 'delete',
      payload: { id },
      synced: 0,
      created_at: new Date().toISOString(),
    })
  }

  return { tasks, getTasks, addTask, updateTask, deleteTask }
}

