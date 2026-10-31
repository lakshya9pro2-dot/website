import { useEffect, useState } from 'react'
import Row from '../components/Row'
import { fetchNew } from '../data/catalog'
import './ListPage.css'

export default function NewAndPopular() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchNew().then(setData)
  }, [])

  if (!data) return <div style={{padding: '100px', textAlign: 'center'}}>Loading...</div>

  return (
    <div className="list-page">
      <div className="container list-page__header list-page__header--top">
        <h1 className="list-page__title">New &amp; Popular</h1>
      </div>
      <div className="rows-wrap">
        {data.rows.map((row) => (
          <Row key={row.heading} heading={row.heading} items={row.items} numbered={row.numbered} />
        ))}
      </div>
    </div>
  )
}
