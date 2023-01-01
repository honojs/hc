/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import FormData from 'form-data'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import _fetch, { Request } from 'node-fetch'

// @ts-ignore
global.fetch = _fetch
// @ts-ignore
global.Request = Request
// @ts-ignore
global.FormData = FormData

import { hc } from '../src/index'
import type { Equal, Expect } from '../src/utils'

type post = {
  post: {
    '/posts': {
      input: {
        query: {
          page: string
        }
      } & {
        json: {
          id?: number
          title?: string
        }
      }
      output: {
        json: {
          success: boolean
          message: string
          post: {
            page: string
          } & {
            id?: number
            title?: string
          }
        }
      }
    }
  }
}

type AppType = {
  post: {
    '/hello': {
      input: {
        query: {
          page: string
        }
      } & {
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
          requestMessage: string
          requestBody: {
            name: string
            age: number
          }
        }
      }
    }
  }
  get: {
    '/search': {
      input: {
        query: {
          q: string
        }
      }
      output: {
        json: {
          entries: {
            title: string
          }
        }
      }
    }
    '/posts': {
      input: {
        queries: {
          tags: string[]
        }
      }
      output: {
        json: {
          tags: string[]
        }
      }
    }
  }
  put: {
    '/posts/:id': {
      input: {
        form: {
          title: string
        }
      }
      output: {
        json: {
          post: {
            title: string
          }
        }
      }
    }
  }
}

describe('Basic - json', () => {
  const server = setupServer(
    rest.post('http://localhost/api/hello', async (req, res, ctx) => {
      const requestContentType = req.headers.get('content-type')
      const requestMessage = req.headers.get('x-message')
      const requestBody = await req.json()
      const payload = {
        message: 'Hello!',
        success: true,
        requestContentType,
        requestMessage,
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

  const client = hc<AppType>('http://localhost/api')

  it('Should get 200 response', async () => {
    const req = client.post('/hello')
    const payload = {
      name: 'young man',
      age: 20,
    }
    const res = await req.json(payload, (opt) => {
      opt.headers.append('x-message', 'foobar')
    })

    expect(res.status).toBe(200)
    const data = await res.json()

    type Expected = {
      success: boolean
      message: string
      requestContentType: string
      requestMessage: string
      requestBody: {
        name: string
        age: number
      }
    }
    type verify = Expect<Equal<typeof data, Expected>>

    expect(data.success).toBe(true)
    expect(data.message).toBe('Hello!')
    expect(data.requestContentType).toBe('application/json')
    expect(data.requestMessage).toBe('foobar')
    expect(data.requestBody).toEqual(payload)
  })

  it('Should get 404 response', async () => {
    const res = await client.post('/hello', '/hello-not-found').json({
      name: '',
      age: 0,
    })
    expect(res.status).toBe(404)
  })
})

describe('Basic - query, send, queries, and form', () => {
  const server = setupServer(
    rest.get('http://localhost/api/search', (req, res, ctx) => {
      const url = new URL(req.url)
      const query = url.searchParams.get('q')
      return res(
        ctx.status(200),
        ctx.json({
          q: query,
        })
      )
    }),
    rest.get('http://localhost/api/posts', (req, res, ctx) => {
      const url = new URL(req.url)
      const tags = url.searchParams.getAll('tags')
      return res(
        ctx.status(200),
        ctx.json({
          tags: tags,
        })
      )
    }),
    rest.put('http://localhost/api/posts/123', async (req, res, ctx) => {
      const buffer = await req.arrayBuffer()
      const string = String.fromCharCode.apply('', new Uint8Array(buffer))
      return res(ctx.status(200), ctx.body(string))
    })
  )

  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  const client = hc<AppType>('http://localhost/api')

  it('Should get 200 response - query', async () => {
    const req = client.get('/search')
    const res = await req.query({
      q: 'foobar',
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      q: 'foobar',
    })
  })

  it('Should get 200 response - send', async () => {
    const req = client.get('/search')
    const res = await req.query({ q: 'foobar' })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      q: 'foobar',
    })
  })

  it('Should get 200 response - queries', async () => {
    const req = client.get('/posts')

    const res = await req.queries({
      tags: ['A', 'B', 'C'],
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      tags: ['A', 'B', 'C'],
    })
  })

  it('Should get 200 response - form', async () => {
    const req = client.put('/posts/:id')
    const res = await req.form({ title: 'Good Night' }, (opt) => {
      opt.param('id', '123')
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toMatch('Good Night')
  })
})
