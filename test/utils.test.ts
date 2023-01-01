import { mergePath, replaceUrlParam } from '../src/utils'

describe('mergePath', () => {
  it('Should merge paths correctly', () => {
    expect(mergePath('http://localhost', '/api')).toBe('http://localhost/api')
    expect(mergePath('http://localhost/', '/api')).toBe('http://localhost/api')
    expect(mergePath('http://localhost', 'api')).toBe('http://localhost/api')
    expect(mergePath('http://localhost/', 'api')).toBe('http://localhost/api')
  })
})

describe('replaceUrlParams', () => {
  it('Should replace correctly', () => {
    const url = 'http://localhost/posts/:postId/comments/:commentId'
    const params = {
      postId: '123',
      commentId: '456',
    }
    const replacedUrl = replaceUrlParam(url, params)
    expect(replacedUrl).toBe('http://localhost/posts/123/comments/456')
  })
})
