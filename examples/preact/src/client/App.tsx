import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Client } from '../../../../src/client'
import type { AppType } from '../api'

const App = () => {
  const client = new Client<AppType>('http://localhost:8787/api')

  const req = client.post('/posts')
  const type = req.responseType

  const [data, setData] = useState<typeof type>({} as typeof type)

  useEffect(() => {
    const fetchData = async () => {
      const res = await req.json({
        id: 123,
        title: 'Hello Hono!!',
        published: true,
      })
      const data = await res.json()
      setData(data)
    }
    fetchData()
  }, [])
  return (
    <div>
      <h2>Message from API</h2>
      <p>{data.message}</p>
      <h3>{`${data.post?.title} is ${data.post?.published ? 'published!' : 'not published!'}`}</h3>
    </div>
  )
}

export default App
