import { mergePath, createBaseURLString } from '../src/utils'

describe('mergePath', () => {
  it('Should merge paths correctly', () => {
    expect(mergePath('http://localhost', '/api')).toBe('http://localhost/api')
    expect(mergePath('http://localhost/', '/api')).toBe('http://localhost/api')
    expect(mergePath('http://localhost', 'api')).toBe('http://localhost/api')
    expect(mergePath('http://localhost/', 'api')).toBe('http://localhost/api')
  })
})

describe('createBaseURLString', () => {
  it('Should return the base URL', () => {
    expect(createBaseURLString('http://localhost')).toBe('http://localhost')
    expect(createBaseURLString('/api')).toBe('http://localhost/api')
  })
})
