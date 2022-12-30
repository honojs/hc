import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'

const api = new Hono()

const schema = z.object({
  id: z.number(),
  title: z.string(),
  published: z.boolean(),
})

const route = api
  .post(
    '/posts',
    validator('json', (value, c) => {
      const result = schema.safeParse(value)
      if (!result.success) {
        return c.text('Invalid!', 400)
      }
      return result.data
    }),
    (c) => {
      const { title, published } = c.req.valid()
      return c.jsonT({
        success: true,
        message: `"${title}" is ${published ? 'published' : 'not published'}`,
      })
    }
  )
  .build()

export type AppType = typeof route

const app = new Hono()
app.route('/api', api)

export default app
