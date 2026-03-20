import { useState } from 'react'
import db from '../db/dexie'

export default function useProjects() {
  const [projects, setProjects] = useState([])

  async function getProjects() {
    const rows = await db.projects.toArray()
    setProjects(rows)
    return rows
  }

  async function addProject(project) {
    const id = project.id || crypto.randomUUID()
    const row = {
      id,
      title: project.title,
      description: project.description || '',
      due_date: project.due_date,
      completed: 0,
      completed_at: null,
      created_at: new Date().toISOString()
    }
    await db.projects.put(row)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'projects',
      action: 'create',
      payload: row,
      synced: 0,
      created_at: new Date().toISOString()
    })
    return row
  }

  async function updateProject(id, changes) {
    await db.projects.update(id, changes)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'projects',
      action: 'update',
      payload: { id, ...changes },
      synced: 0,
      created_at: new Date().toISOString()
    })
  }

  async function deleteProject(id) {
    await db.projects.delete(id)
    await db.sync_queue.put({
      id: crypto.randomUUID(),
      table_name: 'projects',
      action: 'delete',
      payload: { id },
      synced: 0,
      created_at: new Date().toISOString()
    })
  }

  async function completeProject(id) {
    const completed_at = new Date().toISOString()
    await updateProject(id, { completed: 1, completed_at })
  }

  return { projects, getProjects, addProject, updateProject, deleteProject, completeProject }
}
