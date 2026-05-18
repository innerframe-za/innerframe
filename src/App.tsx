import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import MarketingPage from './pages/marketing/MarketingPage'
import DashboardPage from './pages/portal/DashboardPage'
import ResidentsPage from './pages/portal/ResidentsPage'
import ResidentDetailPage from './pages/portal/ResidentDetailPage'
import PillarPage from './pages/portal/PillarPage'
import SearchPage from './pages/portal/SearchPage'
import SettingsPage from './pages/portal/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingPage />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pillar/:slug" element={<PillarPage />} />
        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/residents/:id" element={<ResidentDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
