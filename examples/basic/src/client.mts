import { Client } from '../../../src/client'
import type { AppType } from './server'

const client = new Client<AppType>('http://localhost:8787/api')

const res = await client.post('/posts').json({
  id: 123,
  title: 'Hello Hono!',
  published: true,
})

if (!res.ok) {
  throw new Error('Not OK!')
}

const data = await res.json()

console.log(`${data.message}`)
