import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { initDB } from './db/turso.js'
import useSync from './hooks/useSync.js'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tareas from './pages/Tareas.jsx'
import Habitos from './pages/Habitos.jsx'
import Stats from './pages/Stats.jsx'

export default function App() {
  useEffect(() => {
    initDB()
      .then(() => {
        console.log('DB conectada')
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])
  useSync()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/habitos" element={<Habitos />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
