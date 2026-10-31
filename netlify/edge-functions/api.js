// Netlify Edge Function (worker) — replaces the old Express server.
// Runs at the edge on every /api/* request. No backend needed.
// Set TMDB_API_KEY in Netlify → Site settings → Environment variables.

const TMDB = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p/original'
const POSTER = 'https://image.tmdb.org/t/p/w500'

const json = (data, status = 200, cache = 'public, max-age=300, s-maxage=3600') =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? cache : 'no-store',
      'access-control-allow-origin': '*',
    },
  })

function makeTmdb(key) {
  return async (path, params = {}) => {
    const url = new URL(TMDB + path)
    url.searchParams.set('api_key', key)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    const r = await fetch(url)
    if (!r.ok) throw new Error(`TMDB ${r.status} on ${path}`)
    return r.json()
  }
}

const formatItem = (item, typeOverride = null) => {
  if (!item) return null
  const type = typeOverride || (item.media_type === 'tv' ? 'Series' : 'Movie')
  return {
    id: item.id,
    name: item.title || item.name,
    type,
    poster: item.poster_path ? `${POSTER}${item.poster_path}` : null,
    backdrops: item.backdrop_path ? `${POSTER}${item.backdrop_path}` : null,
    heroBackdrop: item.backdrop_path ? `${IMG}${item.backdrop_path}` : null,
    year: (item.release_date || item.first_air_date || '').substring(0, 4),
    synopsis: item.overview,
    media_type: item.media_type || (type === 'Series' ? 'tv' : 'movie'),
  }
}

const pickLogo = (logos) => {
  if (!logos || !logos.length) return null
  const en = logos.find((l) => l.iso_639_1 === 'en')
  return `${IMG}${(en || logos[0]).file_path}`
}

async function getLogo(tmdb, id, mediaType) {
  try {
    const d = await tmdb(`/${mediaType}/${id}/images`, { include_image_language: 'en,null' })
    return pickLogo(d.logos)
  } catch {
    return null
  }
}

// Only the hero gets its logo server-side (1 call). Row cards load theirs lazily
// via /api/logo so a single request never fans out into 70+ TMDB calls.
const withHeroLogo = async (tmdb, hero) => {
  if (hero) hero.logo = await getLogo(tmdb, hero.id, hero.media_type)
  return hero
}

const mapEpisodes = (eps = []) =>
  eps.map((ep) => ({
    n: ep.episode_number,
    title: ep.name,
    runtime: ep.runtime ? `${ep.runtime}m` : '45m',
    synopsis: ep.overview,
    image: ep.still_path ? `${POSTER}${ep.still_path}` : null,
  }))

const routes = {
  async home(tmdb) {
    const [trending, topRated, originals, action, comedy] = await Promise.all([
      tmdb('/trending/all/week'),
      tmdb('/movie/top_rated'),
      tmdb('/discover/tv', { with_networks: 213 }),
      tmdb('/discover/movie', { with_genres: 28 }),
      tmdb('/discover/movie', { with_genres: 35 }),
    ])
    const hero = await withHeroLogo(tmdb, formatItem(trending.results[0]))
    return {
      heroFeature: hero,
      rows: [
        { heading: 'Trending Now', items: trending.results.slice(1, 15).map((i) => formatItem(i)) },
        { heading: 'Top 10 in Your Region Today', numbered: true, items: topRated.results.slice(0, 10).map((i) => formatItem(i, 'Movie')) },
        { heading: 'Originals', items: originals.results.slice(0, 15).map((i) => formatItem(i, 'Series')) },
        { heading: 'Action & Adventure', items: action.results.slice(0, 15).map((i) => formatItem(i, 'Movie')) },
        { heading: 'Comedies', items: comedy.results.slice(0, 15).map((i) => formatItem(i, 'Movie')) },
      ],
    }
  },

  async movies(tmdb) {
    const [popular, topRated, action, horror, romance] = await Promise.all([
      tmdb('/movie/popular'),
      tmdb('/movie/top_rated'),
      tmdb('/discover/movie', { with_genres: 28 }),
      tmdb('/discover/movie', { with_genres: 27 }),
      tmdb('/discover/movie', { with_genres: 10749 }),
    ])
    const hero = await withHeroLogo(tmdb, formatItem(popular.results[0], 'Movie'))
    return {
      heroFeature: hero,
      rows: [
        { heading: 'Popular Movies', items: popular.results.slice(1, 15).map((i) => formatItem(i, 'Movie')) },
        { heading: 'Top Rated', numbered: true, items: topRated.results.slice(0, 10).map((i) => formatItem(i, 'Movie')) },
        { heading: 'Action', items: action.results.slice(0, 15).map((i) => formatItem(i, 'Movie')) },
        { heading: 'Horror', items: horror.results.slice(0, 15).map((i) => formatItem(i, 'Movie')) },
        { heading: 'Romance', items: romance.results.slice(0, 15).map((i) => formatItem(i, 'Movie')) },
      ],
    }
  },

  async shows(tmdb) {
    const [popular, topRated, comedy, drama, sciFi] = await Promise.all([
      tmdb('/tv/popular'),
      tmdb('/tv/top_rated'),
      tmdb('/discover/tv', { with_genres: 35 }),
      tmdb('/discover/tv', { with_genres: 18 }),
      tmdb('/discover/tv', { with_genres: 10765 }),
    ])
    const hero = await withHeroLogo(tmdb, formatItem(popular.results[0], 'Series'))
    return {
      heroFeature: hero,
      rows: [
        { heading: 'Popular Shows', items: popular.results.slice(1, 15).map((i) => formatItem(i, 'Series')) },
        { heading: 'Top Rated Shows', numbered: true, items: topRated.results.slice(0, 10).map((i) => formatItem(i, 'Series')) },
        { heading: 'Comedy', items: comedy.results.slice(0, 15).map((i) => formatItem(i, 'Series')) },
        { heading: 'Drama', items: drama.results.slice(0, 15).map((i) => formatItem(i, 'Series')) },
        { heading: 'Sci-Fi & Fantasy', items: sciFi.results.slice(0, 15).map((i) => formatItem(i, 'Series')) },
      ],
    }
  },

  async new(tmdb) {
    const [upcoming, topTV] = await Promise.all([tmdb('/movie/upcoming'), tmdb('/tv/top_rated')])
    return {
      rows: [
        { heading: 'New Movies', items: upcoming.results.slice(0, 15).map((i) => formatItem(i, 'Movie')) },
        { heading: 'Popular TV', items: topTV.results.slice(0, 15).map((i) => formatItem(i, 'Series')) },
      ],
    }
  },

  async search(tmdb, q) {
    const query = q.get('q')
    if (!query) return { results: [] }
    const d = await tmdb('/search/multi', { query })
    const results = d.results
      .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && (r.poster_path || r.backdrop_path))
      .slice(0, 20)
      .map((r) => formatItem(r))
    return { results }
  },

  async logo(tmdb, q) {
    const id = q.get('id')
    const mt = q.get('type') === 'tv' ? 'tv' : 'movie'
    if (!/^\d+$/.test(id || '')) throw new Error('bad id')
    return { logo: await getLogo(tmdb, id, mt) }
  },

  async details(tmdb, q) {
    const id = q.get('id')
    const type = q.get('type')
    if (!/^\d+$/.test(id || '')) throw new Error('bad id')
    const mt = type === 'Series' ? 'tv' : 'movie'
    const d = await tmdb(`/${mt}/${id}`, {
      append_to_response: 'credits,content_ratings,release_dates,images,videos',
      include_image_language: 'en,null',
    })

    let rating = 'U/A'
    if (mt === 'movie' && d.release_dates) {
      const us = d.release_dates.results.find((r) => r.iso_3166_1 === 'US')
      if (us && us.release_dates.length) rating = us.release_dates[0].certification || rating
    } else if (mt === 'tv' && d.content_ratings) {
      const us = d.content_ratings.results.find((r) => r.iso_3166_1 === 'US')
      if (us) rating = us.rating
    }

    const cast = d.credits?.cast ? d.credits.cast.slice(0, 5).map((c) => c.name) : []
    let director = []
    if (mt === 'movie' && d.credits?.crew) director = d.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name)
    else if (mt === 'tv' && d.created_by) director = d.created_by.map((c) => c.name)

    const runtime =
      mt === 'movie'
        ? d.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}m` : ''
        : d.number_of_seasons ? `${d.number_of_seasons} Season${d.number_of_seasons > 1 ? 's' : ''}` : ''

    const genres = d.genres ? d.genres.map((g) => g.name) : []

    let seasons = []
    let episodes = null
    if (mt === 'tv' && d.seasons?.length) {
      seasons = d.seasons.filter((s) => s.season_number > 0).map((s) => ({ season_number: s.season_number, name: s.name }))
      if (seasons.length) {
        try {
          const s = await tmdb(`/tv/${id}/season/${seasons[0].season_number}`)
          episodes = mapEpisodes(s.episodes)
        } catch {}
      }
    }

    const vids = d.videos?.results || []
    const video = (vids.find((v) => v.site === 'YouTube' && v.type === 'Trailer') || vids.find((v) => v.site === 'YouTube'))?.key || null

    return {
      ...formatItem(d, type),
      video,
      rating,
      runtime,
      tags: genres.slice(0, 2),
      genres,
      cast,
      director: director.join(', '),
      seasons,
      episodes,
      logo: pickLogo(d.images?.logos),
      mood: 'Exciting',
    }
  },

  async season(tmdb, q) {
    const id = q.get('id')
    const n = q.get('season_number')
    if (!/^\d+$/.test(id || '') || !/^\d+$/.test(n || '')) throw new Error('bad params')
    const s = await tmdb(`/tv/${id}/season/${n}`)
    return { episodes: mapEpisodes(s.episodes) }
  },
}

export default async (request) => {
  if (request.method === 'OPTIONS') return json({}, 204)
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405)

  const key = Netlify.env.get('TMDB_API_KEY')
  if (!key) return json({ error: 'TMDB_API_KEY is not set' }, 500)

  const url = new URL(request.url)
  const name = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '')
  const handler = routes[name]
  if (!handler) return json({ error: 'Not found' }, 404)

  try {
    return json(await handler(makeTmdb(key), url.searchParams))
  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

export const config = { path: '/api/*' }
