import type {
  InferBody,
  InferPath,
  Schema,
  Body,
  Callback,
  InferReturnType,
  ClientResponse,
} from './types'
import { mergePath } from './utils'

const METHODS = ['get', 'post', 'put', 'delete'] as const

function defineDynamicClass(): {
  new <T extends Schema>(): {
    [M in typeof METHODS[number]]: <P extends InferPath<T, M>>(
      path: P,
      body?: InferBody<T, M, P>,
      callback?: Callback
    ) => Promise<ClientResponse<InferReturnType<T, M, P>>>
  }
} {
  return class {} as never
}

export class Client<T extends Schema> extends defineDynamicClass()<T> {
  private baseURL: string

  constructor(baseURL: string) {
    super()
    this.baseURL = baseURL
    ;[...METHODS].map((method) => {
      this[method] = (path: string, body?: Body, callback?: Callback) =>
        this.on(method, path, body, callback)
    })
  }

  on<M extends string, B extends Body, P extends string>(
    method: M,
    path: P,
    body?: B,
    callback?: Callback
  ) {
    const urlString = mergePath(this.baseURL, path)
    const url = new URL(urlString)

    if (body?.query) {
      for (const [k, v] of Object.entries(body.query)) {
        url.searchParams.set(k, v)
      }
    }

    if (body?.queries) {
      for (const [k, v] of Object.entries(body.queries)) {
        for (const v2 of v) {
          url.searchParams.append(k, v2)
        }
      }
    }

    let requestBody: BodyInit | undefined = undefined

    const methodUpperCase = method.toUpperCase()

    if (!(methodUpperCase === 'GET' || methodUpperCase === 'HEAD')) {
      if (body?.json) {
        requestBody = JSON.stringify(body.json)
      } else if (body?.form) {
        const form = new FormData()
        for (const [k, v] of Object.entries(body.form)) {
          form.append(k, v)
        }
        requestBody = form
      }
    }

    let request = new Request(url, { body: requestBody, method: methodUpperCase })

    request = callback ? callback(request) ?? request : request

    return fetch(request)
  }
}
