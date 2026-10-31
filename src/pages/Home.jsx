import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import Row from '../components/Row'
import { fetchHome } from '../data/catalog'

export default function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchHome().then(setData)
  }, [])

  if (!data) return <div style={{padding: '100px', textAlign: 'center'}}>Loading...</div>

  return (
    <>
      <Hero feature={data.heroFeature} />
      <div className="rows-wrap">
        {data.rows.map((row) => (
          <Row key={row.heading} heading={row.heading} items={row.items} numbered={row.numbered} />
        ))}
      </div>
    </>
  )
}
