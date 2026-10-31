import { useApp } from '../context/AppContext'
import './Hero.css'

export default function Hero({ feature }) {
  const { setActiveTitle } = useApp()
  if (!feature) return null;

  const bannerStyle = feature.heroBackdrop 
    ? { backgroundImage: `url(${feature.heroBackdrop})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: '#333' };

  return (
    <section className="hero" style={bannerStyle}>
      <div className="hero__scrim" />
      <div className="hero__content container">
        <p className="hero__eyebrow">{feature.type} {feature.year ? `· ${feature.year}` : ''}</p>
        {feature.logo ? (
          <img src={feature.logo} alt={feature.name} className="hero__logo" style={{ maxWidth: '400px', maxHeight: '160px', marginBottom: '24px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }} />
        ) : (
          <h1 className="hero__title">{feature.name}</h1>
        )}
        <p className="hero__synopsis">{feature.synopsis}</p>
        <div className="hero__actions">
          <button className="btn btn--primary">▶ Play</button>
          <button className="btn btn--secondary" onClick={() => setActiveTitle(feature)}>
            ⓘ More Info
          </button>
        </div>
      </div>
    </section>
  )
}
