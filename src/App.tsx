import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import MarketingPage from './pages/marketing/MarketingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

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
