import { useApp } from '../context/AppContext'
import { useLogo } from '../data/catalog'
import './PosterCard.css'

export default function PosterCard({ title, rank, onOpen }) {
  const { setActiveTitle } = useApp()
  const image = title.backdrops || title.poster;
  const logo = useLogo(title)

  return (
    <button
      className="poster-card"
      onClick={() => {
        setActiveTitle(title)
        onOpen?.(title)
      }}
      aria-label={`Open details for ${title.name}`}
    >
      {rank && <span className="poster-card__rank" aria-hidden="true">{rank}</span>}
      <div 
        className="poster-card__art" 
        style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: 0 } : { background: '#333' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
        
        {logo ? (
          <img src={logo} alt={title.name} style={{ position: 'relative', maxWidth: '85%', maxHeight: '45%', objectFit: 'contain', margin: 'auto auto 10px auto', zIndex: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
        ) : (
          <span className="poster-card__title" style={{ position: 'relative', margin: 'auto 14px 14px 14px', zIndex: 2 }}>{title.name}</span>
        )}
        
        {title.badge && <span className="poster-card__badge" style={{ zIndex: 2 }}>{title.badge}</span>}
      </div>
    </button>
  )
}
