import { useEffect, useState } from 'react'

// Same-origin: served by the Netlify Edge Function (netlify/edge-functions/api.js)
const API = '/api';

export async function fetchHome() {
  const r = await fetch(`${API}/home`);
  return r.json();
}

export async function fetchMovies() {
  const r = await fetch(`${API}/movies`);
  return r.json();
}

export async function fetchShows() {
  const r = await fetch(`${API}/shows`);
  return r.json();
}

export async function fetchNew() {
  const r = await fetch(`${API}/new`);
  return r.json();
}

export async function searchCatalog(query) {
  const r = await fetch(`${API}/search?q=${encodeURIComponent(query)}`);
  const data = await r.json();
  return data.results;
}

export async function fetchDetails(id, type) {
  const r = await fetch(`${API}/details?id=${id}&type=${type}`);
  return r.json();
}

export async function fetchSeason(id, seasonNumber) {
  const r = await fetch(`${API}/season?id=${id}&season_number=${seasonNumber}`);
  return r.json();
}

// Row cards load their logo lazily so one request never fans out into dozens of TMDB calls.
const logoCache = new Map()

export function useLogo(title) {
  const key = `${title.media_type || (title.type === 'Series' ? 'tv' : 'movie')}-${title.id}`
  const [logo, setLogo] = useState(title.logo !== undefined ? title.logo : logoCache.get(key))

  useEffect(() => {
    if (title.logo !== undefined) return setLogo(title.logo)
    if (logoCache.has(key)) return setLogo(logoCache.get(key))
    let live = true
    const type = key.split('-')[0]
    fetch(`${API}/logo?id=${title.id}&type=${type}`)
      .then((r) => r.json())
      .then((d) => {
        logoCache.set(key, d.logo || null)
        if (live) setLogo(d.logo || null)
      })
      .catch(() => logoCache.set(key, null))
    return () => { live = false }
  }, [key, title.logo])

  return logo
}
