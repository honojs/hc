import type {
  InferBody,
  InferBodyPart,
  InferPath,
  Schema,
  Callback,
  InferReturnType,
  ClientResponse,
} from './types'
import { mergePath } from './utils'

const METHODS = ['get', 'post', 'put', 'delete'] as const

class ClientRequest<S extends Schema, M extends string, P extends string> {
  private url: URL
  private method: string
  private requestBody: BodyInit
  private contentType: string | undefined = undefined
  private callback: Callback | undefined = undefined

  constructor(url: URL, method: M) {
    this.url = url
    this.method = method
    this.requestBody = {} as BodyInit
  }

  query<B extends InferBody<S, M, P>>(body?: InferBodyPart<B, 'query'>, callback?: Callback) {
    if (body) {
      for (const [k, v] of Object.entries(body)) {
        this.url.searchParams.set(k, v)
      }
    }
    this.callback ??= callback
    return this.finalize()
  }

  queries<B extends InferBody<S, M, P>>(body?: InferBodyPart<B, 'queries'>, callback?: Callback) {
    if (body) {
      for (const [k, v] of Object.entries(body)) {
        for (const v2 of v) {
          this.url.searchParams.append(k, v2)
        }
      }
    }
    this.callback ??= callback
    return this.finalize()
  }

  json<B extends InferBody<S, M, P>>(body?: InferBodyPart<B, 'json'>, callback?: Callback) {
    if (body) {
      this.requestBody = JSON.stringify(body)
    }
    this.contentType = 'application/json'
    this.callback ??= callback
    return this.finalize()
  }

  form<B extends InferBody<S, M, P>>(body?: InferBodyPart<B, 'form'>, callback?: Callback) {
    if (body) {
      const form = new FormData()
      for (const [k, v] of Object.entries(body)) {
        form.append(k, v)
      }
      this.requestBody = form
    }
    this.callback ??= callback
    return this.finalize()
  }

  send<B extends InferBody<S, M, P>>(
    body?: B,
    callback?: Callback
  ): Promise<ClientResponse<InferReturnType<S, M, P>>>
  send(callback?: Callback): Promise<ClientResponse<InferReturnType<S, M, P>>>
  send<B extends InferBody<S, M, P>>(arg1?: B, arg2?: Callback) {
    let body: B | undefined = undefined

    if (typeof arg1 === 'function') {
      this.callback ??= arg1
    } else {
      body = arg1
      this.callback ??= arg2
    }

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

    return this.finalize()
  }

  private finalize(): Promise<ClientResponse<InferReturnType<S, M, P>>> {
    const methodUpperCase = this.method.toUpperCase()
    const setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD')

    const headers = this.contentType ? { 'Content-Type': this.contentType } : undefined

    let request = new Request(this.url, {
      body: setBody ? this.requestBody : undefined,
      method: methodUpperCase,
      headers: headers ?? undefined,
    })

    if (this.callback) {
      const callbackRequest = this.callback(request)
      if (callbackRequest instanceof Request) {
        request = callbackRequest
      }
    }

    return fetch(request.url, request)
  }

  get responseType(): InferReturnType<S, M, P> {
    return {} as InferReturnType<S, M, P>
  }
}

function defineDynamicClass(): {
  new <S extends Schema>(): {
    [M in typeof METHODS[number]]: <P extends InferPath<S, M>>(
      path: P,
      realPath?: string
    ) => ClientRequest<S, M, P>
  }
} {
  return class {} as never
}

export class Client<S extends Schema> extends defineDynamicClass()<S> {
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
    const clientRequest = new ClientRequest<S, M, P>(url, method)
    return clientRequest
  }
}
