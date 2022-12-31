export type ValidationTypes = {
  json: object
  form: Record<string, any>
  query: Record<string, any>
  queries: Record<string, any[]>
}

export interface ClientResponse<T> extends Response {
  json(): Promise<T>
}

export type Callback = (req: Request) => Request | void

export type Body = { [K in keyof ValidationTypes]?: ValidationTypes[K] }

type Route = { [Path: string]: { input?: Body; output?: { json?: object } } }
export type Schema = { [Method: string]: Route }

export type InferPath<S extends Schema, M extends string> = S extends { [K in M]: infer R }
  ? keyof R
  : string

export type InferBody<S extends Schema, M extends string, P extends string> = S extends {
  [K in M]: infer R
}
  ? R extends Route
    ? R[P]['input'] extends undefined
      ? never
      : R[P]['input']
    : never
  : Body

export type InferBodyPart<
  B extends Body,
  T extends keyof ValidationTypes
> = B[T] extends ValidationTypes[T] ? B[T] : never

export type InferReturnType<S extends Schema, M extends string, P extends string> = S extends {
  [K in M]: infer R
}
  ? R extends Route
    ? R[P]['output'] extends object
      ? R[P]['output']['json']
      : undefined
    : unknown
  : never
