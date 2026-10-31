import { useRef, useState } from 'react'
import PosterCard from './PosterCard'
import './Row.css'

export default function Row({ heading, items, numbered = false }) {
  const trackRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = () => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }

  const scrollBy = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
    setTimeout(updateEdges, 350)
  }

  return (
    <section className="row">
      <h2 className="row__heading container">{heading}</h2>
      <div className="row__viewport">
        {!atStart && (
          <button className="row__nav row__nav--prev" onClick={() => scrollBy(-1)} aria-label={`Scroll ${heading} left`}>
            ‹
          </button>
        )}
        <div className={`row__track container ${numbered ? 'row__track--numbered' : ''}`} ref={trackRef} onScroll={updateEdges}>
          {items.map((t, i) => (
            <PosterCard key={t.id} title={t} rank={numbered ? i + 1 : null} />
          ))}
        </div>
        {!atEnd && (
          <button className="row__nav row__nav--next" onClick={() => scrollBy(1)} aria-label={`Scroll ${heading} right`}>
            ›
          </button>
        )}
      </div>
    </section>
  )
}
