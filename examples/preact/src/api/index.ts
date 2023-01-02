import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
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
    zValidator('json', schema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            message: 'Invalid!',
          },
          400
        )
      }
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
