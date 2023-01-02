import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

const api = new Hono()

const schema = z.object({
  id: z.number(),
  title: z.string(),
  published: z.boolean(),
})

const route = api
  .post('/posts', zValidator('json', schema), (c) => {
    const { title, published } = c.req.valid()
    return c.jsonT({
      success: true,
      message: `"${title}" is ${published ? 'published' : 'not published'}`,
    })
  })
  .build()

export type AppType = typeof route

const app = new Hono()
app.route('/api', api)

export default app
