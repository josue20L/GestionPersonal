import { createClient } from '@libsql/client'

const client = createClient({
  url: globalThis.process?.env?.TURSO_URL,
  authToken: globalThis.process?.env?.TURSO_TOKEN,
})

function json(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`)
      const date = url.searchParams.get('date')
      if (!date) return json(res, 400, { error: 'date requerido' })
      const result = await client.execute({
        sql: 'SELECT id, habit_id, date, completed FROM habit_logs WHERE date = ?',
        args: [date],
      })
      return json(res, 200, { data: result.rows })
    }
    if (req.method === 'POST') {
      const body = await readBody(req)
      const { id, habit_id, date, completed } = body
      if (!id || !habit_id || !date) return json(res, 400, { error: 'id, habit_id y date requeridos' })
      await client.execute({
        sql: 'INSERT OR REPLACE INTO habit_logs (id, habit_id, date, completed) VALUES (?, ?, ?, ?)',
        args: [id, habit_id, date, typeof completed !== 'undefined' ? (completed ? 1 : 0) : 0],
      })
      return json(res, 201, { ok: true })
    }
    return json(res, 405, { error: 'método no permitido' })
  } catch (e) {
    return json(res, 500, { error: String(e && e.message ? e.message : e) })
  }
}
