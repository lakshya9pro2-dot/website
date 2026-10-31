import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shows', label: 'Shows' },
  { to: '/movies', label: 'Movies' },
  { to: '/new', label: 'New & Popular' },
  { to: '/my-list', label: 'My List' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <div className="navbar__left">
          <Link to="/" className="navbar__logo" aria-label="Veloura home">
            VELOURA
          </Link>
          <nav className="navbar__links navbar__links--desktop">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button className="navbar__menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            Browse ⌄
          </button>
        </div>

        <div className="navbar__right">
          <form className={`navbar__search ${searchOpen ? 'is-open' : ''}`} onSubmit={submitSearch}>
            <button
              type="button"
              className="navbar__icon-btn"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              ⌕
            </button>
            {searchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Titles, people, genres"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
              />
            )}
          </form>
          <button className="navbar__icon-btn" aria-label="Notifications">
            🔔<span className="navbar__badge">1</span>
          </button>
          <div className="navbar__profile">
            <span className="navbar__avatar">K</span>
            <span className="navbar__profile-name">Kids</span>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="navbar__links navbar__links--mobile container">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
