import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initDB } from './db/turso.js'

initDB()
  .then(() => {
    console.log('DB conectada')
  })
  .catch((err) => {
    console.error(err)
  })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
