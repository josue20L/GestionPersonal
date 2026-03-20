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
        sql: 'SELECT id, title, description, date, completed, created_at FROM tasks WHERE date = ?',
        args: [date],
      })
      return json(res, 200, { data: result.rows })
    }
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      const body = await readBody(req)
      if (req.method === 'POST') {
        const { id, title, description, date } = body
        if (!id || !title || !date) return json(res, 400, { error: 'id, title y date requeridos' })
        const createdAt = new Date().toISOString()
        await client.execute({
          sql: 'INSERT INTO tasks (id, title, description, date, completed, created_at) VALUES (?, ?, ?, ?, 0, ?)',
          args: [id, title, description ?? null, date, createdAt],
        })
        return json(res, 201, { ok: true })
      }
      if (req.method === 'PATCH') {
        const { id, completed, title } = body
        if (!id) return json(res, 400, { error: 'id requerido' })
        const fields = []
        const args = []
        if (typeof completed !== 'undefined') {
          fields.push('completed = ?')
          args.push(completed ? 1 : 0)
        }
        if (typeof title !== 'undefined') {
          fields.push('title = ?')
          args.push(title)
        }
        if (!fields.length) return json(res, 400, { error: 'sin campos a actualizar' })
        args.push(id)
        await client.execute({
          sql: `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
          args,
        })
        return json(res, 200, { ok: true })
      }
      if (req.method === 'DELETE') {
        const { id } = body
        if (!id) return json(res, 400, { error: 'id requerido' })
        await client.execute({ sql: 'DELETE FROM tasks WHERE id = ?', args: [id] })
        return json(res, 200, { ok: true })
      }
    }
    return json(res, 405, { error: 'método no permitido' })
  } catch (e) {
    return json(res, 500, { error: String(e && e.message ? e.message : e) })
  }
}
