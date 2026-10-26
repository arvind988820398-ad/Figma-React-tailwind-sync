import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/app.css'
import App from './App.tsx'
import { loadTheme, setTheme } from './lib/theme.ts'

const initial = loadTheme()
setTheme(initial.theme, initial.dark)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
