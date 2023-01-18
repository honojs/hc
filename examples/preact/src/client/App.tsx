import { useState, useEffect } from 'preact/hooks'
import { hc } from '../../../../src/client'
import type { AppType } from '../api'

// Client

const App = () => {
  const client = hc<AppType>('/api')

  const req = client.post('/posts')
  const type = req.responseType

  const [data, setData] = useState<typeof type>({} as typeof type)

  useEffect(() => {
    const fetchData = async () => {
      const res = await req.json({
        id: 123,
        title: 'Hello Hono!',
      })
      const data = await res.json()
      setData(data)
    }
    fetchData()
  }, [])
  return (
    <div>
      <p>Message from API</p>
      {data.success ? <h3>{data.post.title}</h3> : <h3>Invalid!</h3>}
    </div>
  )
}

export default App
