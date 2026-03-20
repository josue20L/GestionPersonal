import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tareas from './pages/Tareas'
import Habitos from './pages/Habitos'
import Proyectos from './pages/Proyectos'
import Stats from './pages/Stats'
import { initDB } from './db/turso'
import useSync from './hooks/useSync'

function App() {
  useSync()

  useEffect(() => {
    initDB()
      .then(() => console.log('DB conectada'))
      .catch((err) => console.error('Error DB:', err))
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/habitos" element={<Habitos />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
