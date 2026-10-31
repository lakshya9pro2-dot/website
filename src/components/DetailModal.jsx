import { useEffect, useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { fetchDetails, fetchSeason } from '../data/catalog'
import './DetailModal.css'

export default function DetailModal() {
  const { activeTitle, setActiveTitle, isInList, toggleMyList } = useApp()
  const [details, setDetails] = useState(null)
  const [episodes, setEpisodes] = useState(null)
  const [loadingSeason, setLoadingSeason] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  
  // Ref to hold the timer
  const videoTimer = useRef(null)

  useEffect(() => {
    if (!activeTitle) {
      setDetails(null)
      setEpisodes(null)
      setShowVideo(false)
      if (videoTimer.current) clearTimeout(videoTimer.current)
      return
    }
    const onKey = (e) => e.key === 'Escape' && setActiveTitle(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    
    fetchDetails(activeTitle.id, activeTitle.type).then(data => {
      setDetails(data)
      setEpisodes(data.episodes)
      if (data.video) {
        videoTimer.current = setTimeout(() => {
          setShowVideo(true)
        }, 2000)
      }
    })

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (videoTimer.current) clearTimeout(videoTimer.current)
    }
  }, [activeTitle, setActiveTitle])

  const handleSeasonChange = async (e) => {
    if (!details) return;
    const newSeason = e.target.value;
    setLoadingSeason(true);
    try {
      const res = await fetchSeason(details.id, newSeason);
      setEpisodes(res.episodes);
    } catch (err) {}
    setLoadingSeason(false);
  }

  if (!activeTitle) return null
  const t = details || activeTitle
  const inList = isInList(t.id)

  const bannerStyle = t.heroBackdrop || t.backdrops 
    ? { backgroundImage: `url(${t.heroBackdrop || t.backdrops})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: '#333' };

  return (
    <div className="modal-backdrop" onClick={() => setActiveTitle(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={() => setActiveTitle(null)} aria-label="Close">
          ✕
        </button>

        <div className="modal__banner" style={bannerStyle}>
          {showVideo && t.video && (
            <iframe
              className="modal__banner-video"
              src={`https://www.youtube.com/embed/${t.video}?autoplay=1&mute=1&controls=0&loop=1&playlist=${t.video}&playsinline=1&rel=0`}
              allow="autoplay; encrypted-media"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          )}
          <div className="modal__banner-scrim" />
          <div className="modal__banner-content-wrap">
            {t.logo ? (
              <img src={t.logo} alt={t.name} style={{ position: 'relative', maxWidth: '300px', maxHeight: '120px', objectFit: 'contain', marginBottom: '16px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }} />
            ) : (
              <h2 className="modal__banner-title">{t.name}</h2>
            )}
            <div className="modal__banner-actions">
              <button className="btn btn--primary">▶ Play</button>
              <button className="modal__icon-btn" onClick={() => toggleMyList(t)} aria-label={inList ? 'Remove from My List' : 'Add to My List'}>
                {inList ? '✓' : '+'}
              </button>
              <button className="modal__icon-btn" aria-label="Like">👍</button>
            </div>
          </div>
        </div>

        <div className="modal__body">
          <div className="modal__meta-col">
            <div className="modal__meta-line">
              <span>{t.year}</span>
              <span>{t.runtime}</span>
              {t.rating && <span className="modal__rating">{t.rating}</span>}
            </div>
            <p className="modal__synopsis">{t.synopsis || 'No synopsis available.'}</p>
          </div>
          <div className="modal__info-col">
            {t.cast && t.cast.length > 0 && <p><span className="modal__label">Cast:</span> {t.cast.join(', ')}</p>}
            {t.director && <p><span className="modal__label">Director:</span> {t.director}</p>}
            {t.genres && t.genres.length > 0 && <p><span className="modal__label">Genres:</span> {t.genres.join(', ')}</p>}
          </div>
        </div>

        {t.seasons && t.seasons.length > 0 && (
          <div className="modal__episodes">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Episodes</h3>
              <select 
                onChange={handleSeasonChange} 
                defaultValue={t.seasons[0].season_number}
                style={{ background: 'var(--bg-raised-2)', color: 'var(--ink)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}
              >
                {t.seasons.map(s => (
                  <option key={s.season_number} value={s.season_number}>{s.name}</option>
                ))}
              </select>
            </div>
            
            {loadingSeason ? (
              <p style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>Loading episodes...</p>
            ) : episodes && episodes.length > 0 ? (
              episodes.map((ep) => (
                <div className="episode-row" key={ep.n}>
                  <span className="episode-row__n">{ep.n}</span>
                  <div
                    className="episode-row__thumb"
                    style={ep.image ? { backgroundImage: `url(${ep.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#333' }}
                  />
                  <div className="episode-row__body">
                    <div className="episode-row__top">
                      <span className="episode-row__title">{ep.title}</span>
                      <span className="episode-row__runtime">{ep.runtime}</span>
                    </div>
                    <p className="episode-row__synopsis">{ep.synopsis}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--ink-muted)' }}>No episodes found for this season.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
