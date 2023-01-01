export type Expect<T extends true> = T
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false
export type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true

export const mergePath = (base: string, path: string) => {
  if (!/.+\/$/.test(base)) {
    base = base + '/'
  }
  if (/^\/.+/.test(path)) {
    path = path.slice(1)
  }
  return base + path
}

export const replaceUrlParam = (urlString: string, params: Record<string, string>) => {
  for (const [k, v] of Object.entries(params)) {
    const reg = new RegExp('/:' + k)
    urlString = urlString.replace(reg, `/${v}`)
  }
  return urlString
}
