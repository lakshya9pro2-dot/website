import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [myList, setMyList] = useState([])
  const [activeTitle, setActiveTitle] = useState(null)

  const isInList = useCallback((titleId) => myList.some((t) => t.id === titleId), [myList])

  const toggleMyList = useCallback((t) => {
    setMyList((prev) => (prev.some((x) => x.id === t.id) ? prev.filter((x) => x.id !== t.id) : [...prev, t]))
  }, [])

  const value = useMemo(
    () => ({ myList, isInList, toggleMyList, activeTitle, setActiveTitle }),
    [myList, isInList, toggleMyList, activeTitle]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
