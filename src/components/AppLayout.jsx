import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppProvider } from '../context/AppContext'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading-screen">Cargando...</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <AppProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </AppProvider>
  )
}
