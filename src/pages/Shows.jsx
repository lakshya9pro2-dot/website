import { useEffect, useState } from 'react'
import Row from '../components/Row'
import { fetchShows } from '../data/catalog'
import { useApp } from '../context/AppContext'
import './ListPage.css'

const genres = ['All Genres', 'Comedy', 'Drama', 'Sci-Fi & Fantasy', 'Crime']

export default function Shows() {
  const [genre, setGenre] = useState('All Genres')
  const { setActiveTitle } = useApp()
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchShows().then(setData)
  }, [])

  if (!data) return <div style={{padding: '100px', textAlign: 'center'}}>Loading...</div>

  const featureShow = data.heroFeature;
  const bannerStyle = featureShow?.heroBackdrop 
    ? { backgroundImage: `url(${featureShow.heroBackdrop})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: '#333' };

  return (
    <div className="list-page">
      <div className="container list-page__header list-page__header--top">
        <h1 className="list-page__title">Shows</h1>
        <select className="list-page__select" value={genre} onChange={(e) => setGenre(e.target.value)}>
          {genres.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="list-page__banner" style={bannerStyle}>
        <div className="list-page__scrim" />
        <div className="list-page__banner-content container">
          {featureShow && featureShow.logo ? (
            <img src={featureShow.logo} alt={featureShow.name} style={{ maxWidth: '400px', maxHeight: '160px', marginBottom: '24px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }} />
          ) : (
            featureShow && <h1>{featureShow.name}</h1>
          )}
          <div className="hero__actions">
            <button className="btn btn--primary">▶ Play</button>
            <button className="btn btn--secondary" onClick={() => setActiveTitle(featureShow)}>
              ⓘ More Info
            </button>
          </div>
        </div>
      </div>

      <div className="rows-wrap">
        {data.rows.map((row) => (
          <Row key={row.heading} heading={row.heading} items={row.items} numbered={row.numbered} />
        ))}
      </div>
    </div>
  )
}
