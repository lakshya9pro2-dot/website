import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PosterCard from '../components/PosterCard'
import { searchCatalog } from '../data/catalog'
import './Search.css'

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (q) {
      setLoading(true)
      searchCatalog(q).then(res => {
        setResults(res)
        setLoading(false)
      })
    } else {
      setResults([])
    }
  }, [q])

  return (
    <div className="search-page container">
      {q && (
        <p className="search-page__count">
          {loading ? 'Searching...' : (results.length ? `Results for "${q}"` : `No matches found for "${q}"`)}
        </p>
      )}
      <div className="search-page__grid">
        {results.map((t) => (
          <PosterCard key={t.id} title={t} />
        ))}
      </div>
    </div>
  )
}
