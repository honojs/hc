import type { MockAgent } from 'undici'
import { Client } from '../src/index'

declare global {
  function getMiniflareFetchMock(): MockAgent
}

const fetchMock = getMiniflareFetchMock()
fetchMock.disableNetConnect()

type AppType = {
  get: {
    '/hello': {
      input: {
        json: {
          name: string
          age: number
        }
      }
      output: {
        json: {
          success: boolean
          message: string
        }
      }
    }
  }
}

describe('Basic', () => {
  const origin = fetchMock.get('http://localhost')
  origin
    .intercept({ method: 'GET', path: '/api/hello' })
    .reply(200, JSON.stringify({ success: true, message: 'Hello!' }), {
      headers: {
        'content-type': 'application/json',
      },
    })

  const client = new Client<AppType>('http://localhost/api')

  it('Should return 200 response', async () => {
    const res = await client.get('/hello', {
      json: {
        name: 'young man',
        age: 20,
      },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe('Hello!')
  })
})
