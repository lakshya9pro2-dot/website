# Veloura

A streaming-platform front end built in React + Vite. It follows the layout
and interaction patterns from the reference screenshots you shared (top nav,
autoplay-style hero, horizontal "Top 10" and genre carousels, a title detail
overlay with episode list and "More Like This," a Movies page with a genre
filter, and live search) — under original branding, with generated
placeholder poster art instead of copyrighted images.

## Why not an exact Netflix clone

Netflix's name/logo are trademarked and the show artwork in your screenshots
is copyrighted, so this rebuilds the **structure and functionality** you
showed rather than the branding and imagery. Swap in your own branding,
license real poster images, and point `src/data/catalog.js` at a real API and
it'll behave the same way.

## Run locally

```bash
npm install
cp .env.example .env        # put your TMDB key in TMDB_API_KEY
npx netlify-cli dev         # serves the app + the /api edge function together
```

`npm run dev` alone only starts Vite — `/api/*` needs `netlify dev` to work locally.

## Deploy to Netlify (no backend)

1. Push the project to GitHub and import it in Netlify (build settings come from `netlify.toml`).
2. Site settings → Environment variables → add `TMDB_API_KEY`.
3. Deploy.

The old Express server is gone. `netlify/edge-functions/api.js` is a worker that
proxies TMDB (`/api/home`, `/movies`, `/shows`, `/new`, `/search`, `/details`,
`/season`, `/logo`) and keeps the key server-side.

## Project structure

```
src/
  components/   Navbar, Hero, Row (carousel), PosterCard, DetailModal, Footer
  pages/        Home, Movies, Shows, NewAndPopular, MyList, Search
  context/      AppContext — My List + which title's detail modal is open
  data/         catalog.js — mock data; replace with a real fetch/API later
  styles/       global.css — design tokens (color, type)
```

## What's implemented

- Sticky nav that turns solid on scroll, with a live search field that
  navigates to `/search?q=...` and filters the catalog as you type/submit.
- Hero banner with Play / More Info, More Info opens the detail modal.
- Horizontally-scrollable rows, including a numbered "Top 10" style row
  with large outlined rank numerals.
- Title detail modal: banner, Play, Add-to-My-List (persists to state),
  Like, cast/genre metadata, and an episode list for series.
- Movies / Shows pages with a genre filter dropdown (filtering logic is
  ready to wire to `genre` state once real per-title genre data exists).
- My List page reflecting whatever you've added via the + button.
- Responsive down to ~360px: nav collapses to a "Browse" menu, poster
  cards and grids reflow, hero and modal scale down.

## Swapping in real data

Everything reads from `src/data/catalog.js`. Replace its exports with a
`fetch()` against your API (same shape: `{ id, name, type, year, runtime,
rating, tags, badge, synopsis, cast, genres, episodes, palette }`) and the
rest of the app — rows, modal, search, My List — keeps working unchanged.
`palette` (two hex colors) drives the generated placeholder art; once you
have real poster images, swap `PosterCard`'s gradient `<div>` for an
`<img>`.
