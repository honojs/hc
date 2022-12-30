type ValidationTypes = {
  json: object
  form: Record<string, string>
  query: Record<string, string>
  queries: Record<string, string[]>
}

export interface ClientResponse<T> extends Response {
  json(): Promise<T>
}

export type Callback = (req: Request) => Request | void

export type Body = { [K in keyof ValidationTypes]?: ValidationTypes[K] }

type Route = { [Path: string]: { input?: Body; output?: { json?: object } } }
export type Schema = { [Method: string]: Route }

export type InferPath<T extends Schema, M extends string> = T extends { [K in M]: infer R }
  ? keyof R
  : string

export type InferBody<T extends Schema, M extends string, P extends string> = T extends {
  [K in M]: infer R
}
  ? R extends Route
    ? R[P]['input']
    : unknown
  : Body

export type InferReturnType<T extends Schema, M extends string, P extends string> = T extends {
  [K in M]: infer R
}
  ? R extends Route
    ? R[P]['output'] extends object
      ? R[P]['output']['json']
      : undefined
    : unknown
  : never
