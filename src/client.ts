import type {
  InferBody,
  InferPath,
  Schema,
  Body,
  Callback,
  InferReturnType,
  ClientResponse,
  ValidationTypes,
} from './types'
import { mergePath } from './utils'

const METHODS = ['get', 'post', 'put', 'delete'] as const

class ClientRequest<T extends Schema, M extends string, P extends string> {
  private url: URL
  private method: string
  private requestBody: BodyInit

  constructor(url: URL, method: M) {
    this.url = url
    this.method = method
    this.requestBody = {} as BodyInit
  }

  query<B extends InferBody<T, M, P>>(
    body: B extends Body ? B['query'] : ValidationTypes['query']
  ) {
    for (const [k, v] of Object.entries(body!)) {
      this.url.searchParams.set(k, v)
    }
    return this.send()
  }

  queries<B extends InferBody<T, M, P>>(
    body: B extends Body ? B['queries'] : ValidationTypes['queries']
  ) {
    for (const [k, v] of Object.entries(body!)) {
      for (const v2 of v) {
        this.url.searchParams.append(k, v2)
      }
    }
    return this.send()
  }

  json<B extends InferBody<T, M, P>>(body: B extends Body ? B['json'] : ValidationTypes['json']) {
    this.requestBody = JSON.stringify(body)
    return this.send()
  }

  form<B extends InferBody<T, M, P>>(body: B extends Body ? B['form'] : ValidationTypes['form']) {
    const form = new FormData()
    for (const [k, v] of Object.entries(body!)) {
      form.append(k, v)
    }
    this.requestBody = form
    return this.send()
  }

  send(callback?: Callback): Promise<ClientResponse<InferReturnType<T, M, P>>>
  send<B extends InferBody<T, M, P>>(
    body?: B,
    callback?: Callback
  ): Promise<ClientResponse<InferReturnType<T, M, P>>>
  send<B extends InferBody<T, M, P>>(
    body?: B,
    callback?: Callback
  ): Promise<ClientResponse<InferReturnType<T, M, P>>> {
    if (body?.query) {
      this.query(body.query as any)
    }

    if (body?.queries) {
      this.queries(body.queries as any)
    }

    if (body?.form) {
      this.form(body.form as any)
    }
    if (body?.json) {
      this.json(body.json as any)
    }

    const methodUpperCase = this.method.toUpperCase()
    const setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD')

    let request = new Request(this.url, {
      body: setBody ? this.requestBody : undefined,
      method: methodUpperCase,
    })
    request = callback ? callback(request) ?? request : request

    return fetch(request)
  }

  get responseType(): InferReturnType<T, M, P> {
    return {} as InferReturnType<T, M, P>
  }
}

function defineDynamicClass(): {
  new <T extends Schema>(): {
    [M in typeof METHODS[number]]: <P extends InferPath<T, M>>(
      path: P,
      realPath?: string
    ) => ClientRequest<T, M, P>
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[method] = (path: string, realPath: string) => this.on(method, path, realPath)
    })
  }

  on<M extends string, P extends string>(method: M, path: P, realPath?: string) {
    const urlString = mergePath(this.baseURL, realPath ?? path)
    const url = new URL(urlString)
    const clientRequest = new ClientRequest<T, M, P>(url, method)
    return clientRequest
  }
}
