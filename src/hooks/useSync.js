import { useEffect, useCallback } from 'react'
import db from '../db/dexie.js'

function useSync() {
  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      console.log('Sync skipped: offline')
      return
    }

    const records = await db.sync_queue.where('synced').equals(0).toArray()
    if (records.length === 0) return

    console.log(`Starting sync for ${records.length} records...`)

    for (const record of records) {
      const endpoints = {
        tasks: '/api/tasks',
        habits: '/api/habits',
        projects: '/api/projects',
        habit_logs: '/api/habit-logs',
      }

      const endpoint = endpoints[record.table_name]
      if (!endpoint) {
        console.warn(`No endpoint found for table: ${record.table_name}`)
        continue
      }

      const methods = {
        create: 'POST',
        update: 'PATCH',
        delete: 'DELETE',
      }

      const method = methods[record.action] || 'POST'
      
      console.log(`Syncing ${record.table_name} (${record.action}) - ID: ${record.id}`)

      try {
        const body =
          method === 'DELETE'
            ? JSON.stringify({ id: record.payload?.id })
            : JSON.stringify(record.payload)

        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body,
        })

        if (res.ok) {
          await db.sync_queue.update(record.id, { synced: 1 })
          console.log(`Successfully synced: ${record.id}`)
        } else {
          const errorData = await res.json().catch(() => ({}))
          console.error(`Failed to sync ${record.id}:`, res.status, errorData)
        }
      } catch (e) {
        console.error(`Network error syncing ${record.id}:`, e)
      }
    }
    console.log('Sync process finished.')
  }, [])

  useEffect(() => {
    window.addEventListener('online', syncNow)
    // Intentar sincronizar al cargar si hay conexión
    if (navigator.onLine) {
      syncNow()
    }
    return () => {
      window.removeEventListener('online', syncNow)
    }
  }, [syncNow])

  return { syncNow }
}

export default useSync
