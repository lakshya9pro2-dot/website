import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DetailModal from './components/DetailModal'
import { AppProvider } from './context/AppContext'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Shows from './pages/Shows'
import NewAndPopular from './pages/NewAndPopular'
import MyList from './pages/MyList'
import Search from './pages/Search'

export default function App() {
  return (
    <AppProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/new" element={<NewAndPopular />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      <Footer />
      <DetailModal />
    </AppProvider>
  )
}
