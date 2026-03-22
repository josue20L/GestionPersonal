import { createClient } from '@libsql/client'

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
  const client = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  })
  try {
    if (req.method === 'GET') {
      const result = await client.execute({
        sql: 'SELECT id, name, description, frequency, created_at FROM habits',
      })
      return json(res, 200, { data: result.rows })
    }
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      const body = await readBody(req)
      if (req.method === 'POST') {
        const { id, name, description, frequency } = body
        if (!id || !name) return json(res, 400, { error: 'id y name requeridos' })
        const createdAt = new Date().toISOString()
        await client.execute({
          sql: 'INSERT INTO habits (id, name, description, frequency, created_at) VALUES (?, ?, ?, ?, ?)',
          args: [id, name, description ?? null, frequency ?? 'daily', createdAt],
        })
        return json(res, 201, { ok: true })
      }
      if (req.method === 'PATCH') {
        const { id, name, description, frequency } = body
        if (!id) return json(res, 400, { error: 'id requerido' })
        const fields = []
        const args = []
        if (typeof name !== 'undefined') {
          fields.push('name = ?')
          args.push(name)
        }
        if (typeof description !== 'undefined') {
          fields.push('description = ?')
          args.push(description)
        }
        if (typeof frequency !== 'undefined') {
          fields.push('frequency = ?')
          args.push(frequency)
        }
        if (!fields.length) return json(res, 400, { error: 'sin campos a actualizar' })
        args.push(id)
        await client.execute({
          sql: `UPDATE habits SET ${fields.join(', ')} WHERE id = ?`,
          args,
        })
        return json(res, 200, { ok: true })
      }
      if (req.method === 'DELETE') {
        const { id } = body
        if (!id) return json(res, 400, { error: 'id requerido' })
        await client.execute({ sql: 'DELETE FROM habits WHERE id = ?', args: [id] })
        return json(res, 200, { ok: true })
      }
    }
    return json(res, 405, { error: 'método no permitido' })
  } catch (e) {
    return json(res, 500, { error: String(e && e.message ? e.message : e) })
  }
}
