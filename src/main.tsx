import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './components/ui'
import App from './App'
import './styles/globals.css'
import './styles/auth.css'
import './styles/pages.css'
import './styles/operations.css'
import './styles/calendar-settings.css'
import './styles/access.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
