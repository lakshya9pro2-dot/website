import PosterCard from '../components/PosterCard'
import { useApp } from '../context/AppContext'
import './ListPage.css'
import './MyList.css'

export default function MyList() {
  const { myList } = useApp()

  return (
    <div className="list-page">
      <div className="container list-page__header list-page__header--top">
        <h1 className="list-page__title">My List</h1>
      </div>

      {myList.length === 0 ? (
        <div className="container my-list__empty">
          <p>Nothing here yet. Tap the + on any title to save it for later.</p>
        </div>
      ) : (
        <div className="container my-list__grid">
          {myList.map((t) => (
            <PosterCard key={t.id} title={t} />
          ))}
        </div>
      )}
    </div>
  )
}
