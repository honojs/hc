import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'

const api = new Hono()

// Server

const schema = z.object({
  id: z.number(),
  title: z.string(),
})

const route = api
  .post(
    '/posts',
    validator('json', (value, c) => {
      const result = schema.safeParse(value)
      if (!result.success) {
        return c.json(
          {
            success: false,
            message: 'Invalid!',
          },
          400
        )
      }
      return result.data
    }),
    (c) => {
      const data = c.req.valid()

      return c.jsonT({
        success: true,
        message: 'Valid!',
        post: data,
      })
    }
  )
  .build()

export type AppType = typeof route

export default api
