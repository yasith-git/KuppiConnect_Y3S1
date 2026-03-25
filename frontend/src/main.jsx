import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './features/auth/AuthContext.jsx'
import { ClassesProvider } from './contexts/ClassesContext.jsx'
import { AnnouncementsProvider } from './contexts/AnnouncementsContext.jsx'
import { EnrollmentsProvider } from './contexts/EnrollmentsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ClassesProvider>
        <AnnouncementsProvider>
          <EnrollmentsProvider>
            <App />
          </EnrollmentsProvider>
        </AnnouncementsProvider>
      </ClassesProvider>
    </AuthProvider>
  </StrictMode>,
)
