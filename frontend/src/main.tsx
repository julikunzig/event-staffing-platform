import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import './lib/debug'

createRoot(document.getElementById('root')!).render(
  <App />
)