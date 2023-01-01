import type {
  InferBody,
  InferBodyPart,
  InferPath,
  Schema,
  InferReturnType,
  ClientResponse,
  ParamKeys,
  ValidationTypes,
} from './types'
import { mergePath, replaceUrlParam } from './utils'

class Option<P extends string> {
  readonly headers: Headers
  readonly params: Record<string, string> = {}

  constructor({ headers = new Headers() }: { headers: Headers }) {
    this.headers = headers
  }

  param(key: ParamKeys<P>, value: string) {
    this.params[key] = value
  }
}

type Callback<P extends string> = (option: Option<P>) => void | undefined

class ClientRequestImpl<P extends string> {
  private url: URL
  private method: string
  private rBody: BodyInit
  private cType: string | undefined = undefined

  constructor(url: URL, method: string) {
    this.url = url
    this.method = method
    this.rBody = {} as BodyInit
  }

  query(body?: ValidationTypes['query'], callback?: Callback<P>) {
    if (body) {
      for (const [k, v] of Object.entries(body)) {
        this.url.searchParams.set(k, v)
      }
    }
    return this.send(callback)
  }

  queries(body?: ValidationTypes['queries'], callback?: Callback<P>) {
    if (body) {
      for (const [k, v] of Object.entries(body)) {
        for (const v2 of v) {
          this.url.searchParams.append(k, v2)
        }
      }
    }
    return this.send(callback)
  }

  json(body?: ValidationTypes['json'], callback?: Callback<P>) {
    if (body) {
      this.rBody = JSON.stringify(body)
    }
    this.cType = 'application/json'
    return this.send(callback)
  }

  form(body?: ValidationTypes['form'], callback?: Callback<P>) {
    if (body) {
      const form = new FormData()
      for (const [k, v] of Object.entries(body)) {
        form.append(k, v)
      }
      this.rBody = form
    }
    return this.send(callback)
  }

  send(callback?: Callback<P>): Promise<ClientResponse<{}>> {
    let methodUpperCase = this.method.toUpperCase()
    let setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD')
    const headerValues = this.cType ? { 'Content-Type': this.cType } : undefined

    const headers = new Headers(headerValues ?? undefined)
    let requestUrl = this.url.toString()

    if (callback) {
      const option = new Option<P>({ headers: headers })
      callback(option)
      requestUrl = replaceUrlParam(requestUrl, option.params)
    }

    methodUpperCase = this.method.toUpperCase()
    setBody = !(methodUpperCase === 'GET' || methodUpperCase === 'HEAD')

    // Pass URL string to 1st arg for testing with MSW and node-fetch
    return fetch(requestUrl, {
      body: setBody ? this.rBody : undefined,
      method: methodUpperCase,
      headers: headers,
    })
  }

  get responseType() {
    return {}
  }
}

type ClientRequest<S extends Schema, M extends string, P extends string> = {
  [K in keyof InferBody<S, M, P>]: K extends keyof ValidationTypes
    ? (
        body: InferBodyPart<InferBody<S, M, P>, K>,
        callback?: Callback<P>
      ) => Promise<ClientResponse<InferReturnType<S, M, P>>>
    : never
} & {
  responseType: InferReturnType<S, M, P>
  send: (callback?: Callback<P>) => Promise<ClientResponse<InferReturnType<S, M, P>>>
}

class ClientImpl {
  on<M extends string, P extends string>(baseUrl: string, method: M) {
    return (path: P, realPath?: string) => {
      const urlString = mergePath(baseUrl, realPath ?? path)
      const url = new URL(urlString)
      return new ClientRequestImpl<P>(url, method)
    }
  }
}

type Client<S extends Schema> = {} & {
  [M in keyof S]: M extends string
    ? <P extends InferPath<S, M>>(path: P, realPath?: string) => ClientRequest<S, M, P>
    : never
}

export const hc = <T extends Schema>(baseUrl: string) => {
  return new Proxy(new ClientImpl(), {
    get(target, prop) {
      if (prop !== 'on') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const on = target['on'] as any
        return on(baseUrl, prop)
      }
    },
  }) as Client<T>
}
