import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'dayjs/locale/tr'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
