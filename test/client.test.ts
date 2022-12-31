/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import _fetch, { Request, Response } from 'node-fetch'
import { Client } from '../src/index'
import type { Equal, Expect } from '../src/utils'

// @ts-ignore
global.fetch = _fetch
// @ts-ignore
global.Request = Request

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
          requestBody: {
            name: string
            age: number
          }
        }
      }
    }
  }
}

describe('Basic', () => {
  const server = setupServer(
    rest.post('http://localhost/api/hello', async (req, res, ctx) => {
      const requestContentType = req.headers.get('content-type')
      const requestBody = await req.json()
      const payload = {
        message: 'Hello!',
        success: true,
        requestContentType,
        requestBody,
      }
      return res(ctx.status(200), ctx.json(payload))
    }),
    rest.post('http://localhost/api/hello-not-found', (_req, res, ctx) => {
      return res(ctx.status(404))
    })
  )

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  const client = new Client<AppType>('http://localhost/api')

  it('Should get 200 response', async () => {
    const req = client.post('/hello')
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
      requestBody: {
        name: string
        age: number
      }
    }
    type verify = Expect<Equal<typeof data, Expected>>

    expect(data.success).toBe(true)
    expect(data.message).toBe('Hello!')
    expect(data.requestContentType).toBe('application/json')
    expect(data.requestBody).toEqual(payload)
  })

  it('Should get 404 response', async () => {
    const res = await client.post('/hello', '/hello-not-found').send()
    expect(res.status).toBe(404)
  })
})
