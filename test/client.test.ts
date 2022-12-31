/* eslint-disable @typescript-eslint/no-unused-vars */
import type { MockAgent } from 'undici'
import { Client } from '../src/index'
import type { Equal, Expect } from '../src/utils'

declare global {
  function getMiniflareFetchMock(): MockAgent
}

const fetchMock = getMiniflareFetchMock()
fetchMock.disableNetConnect()

type AppType = {
  post: {
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
          requestContentType: string
        }
      }
    }
  }
}

describe('Basic', () => {
  const origin = fetchMock.get('http://localhost')
  origin.intercept({ method: 'POST', path: '/api/hello' }).reply((req) => {
    return {
      statusCode: 200,
      data: {
        success: true,
        message: 'Hello!',
        requestContentType: req.headers[1],
      },
    }
  })

  const client = new Client<AppType>('http://localhost/api')
  const req = client.post('/hello')

  it('Should get 200 response', async () => {
    const payload = {
      name: 'young man',
      age: 20,
    }
    const res = await req.json(payload)

    expect(res.status).toBe(200)
    const data = await res.json()

    type Expected = {
      success: boolean
      message: string
      requestContentType: string
    }
    type verify = Expect<Equal<typeof data, Expected>>

    expect(data.success).toBe(true)
    expect(data.message).toBe('Hello!')
    expect(data.requestContentType).toBe('application/json')
  })
})
