import Dexie from 'dexie'

export const db = new Dexie('HabitTrackerDB')

db.version(1).stores({
  tasks: 'id, title, description, date, completed, created_at',
  habits: 'id, name, description, frequency, created_at',
  habit_logs: 'id, habit_id, date, completed',
  sync_queue: 'id, table_name, action, synced, created_at',
})

db.version(2).stores({
  projects: 'id, title, description, due_date, completed, completed_at, created_at',
})

export default db
