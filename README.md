# Hono Client

[![Version](https://img.shields.io/npm/v/@hono/client.svg)](https://npmjs.com/package/@hono/client)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@hono/client)](https://bundlephobia.com/result?p=@hono/client)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@hono/client)](https://bundlephobia.com/result?p=@hono/client)

Hono Client is HTTP Client based on Fetch API.
It's Type-Safe.
You can access to the Hono application ultra-easily.

```ts
import { Client } from '@hono/client'
import type { AppType } from './server'

const client = new Client<AppType>('http://localhost:8787/api')

const res = await client.post('/posts').json({
  id: 123,
  title: 'Hello Hono!',
  published: true,
})

const data = await res.json()
console.log(`${data.message}`)
```

## Features

- Small about 1.5kb
- TypeSafe
- Compatible with Fetch API
- Optimized for Hono v3.x

## Demo

![Demo](https://user-images.githubusercontent.com/10682/210117450-7ec4652f-ef7d-41a8-887c-427e33ab1963.gif)

## Install

```
npm i @hono/client
```

Or

```
yarn add @hono/client
```

## Examples

Server-side with [Zod](https://zod.dev).

```ts
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
```

## Author

Yusuke Wada <https://github.com/yusukebe>

## License

MIT
