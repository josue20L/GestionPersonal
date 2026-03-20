import { useEffect } from 'react'
import db from '../db/dexie.js'

function useSync() {
  useEffect(() => {
    const handler = async () => {
      const records = await db.sync_queue.where('synced').equals(0).toArray()
      for (const record of records) {
        const endpoint =
          record.table_name === 'tasks'
            ? '/api/tasks'
            : record.table_name === 'habits'
              ? '/api/habits'
              : null
        if (!endpoint) continue
        const method =
          record.action === 'create'
            ? 'POST'
            : record.action === 'update'
              ? 'PATCH'
              : record.action === 'delete'
                ? 'DELETE'
                : 'POST'
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
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    window.addEventListener('online', handler)
    return () => {
      window.removeEventListener('online', handler)
    }
  }, [])
}

export default useSync
