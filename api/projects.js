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
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => { resolve(data ? JSON.parse(data) : {}) })
  })
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await client.execute('SELECT * FROM projects ORDER BY due_date ASC')
      return json(res, 200, result.rows)
    }

    const body = await readBody(req)

    if (req.method === 'POST') {
      const { id, title, description, due_date } = body
      if (!id || !title || !due_date) return json(res, 400, { error: 'Campos obligatorios faltantes' })
      
      await client.execute({
        sql: 'INSERT INTO projects (id, title, description, due_date, completed, created_at) VALUES (?, ?, ?, ?, 0, ?)',
        args: [id, title, description || '', due_date, new Date().toISOString()]
      })
      return json(res, 201, { ok: true })
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = body
      if (!id) return json(res, 400, { error: 'id requerido' })
      
      const fields = []
      const args = []
      for (const [key, val] of Object.entries(updates)) {
        fields.push(`${key} = ?`)
        args.push(val)
      }
      args.push(id)
      
      await client.execute({
        sql: `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
        args
      })
      return json(res, 200, { ok: true })
    }

    if (req.method === 'DELETE') {
      const { id } = body
      if (!id) return json(res, 400, { error: 'id requerido' })
      await client.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id] })
      return json(res, 200, { ok: true })
    }

    return json(res, 405, { error: 'Método no permitido' })
  } catch (e) {
    return json(res, 500, { error: e.message })
  }
}
