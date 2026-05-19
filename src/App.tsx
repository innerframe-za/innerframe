import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleGuard } from './components/RoleGuard'
import { SuperAdminShell } from './components/superadmin/SuperAdminShell'
import MarketingPage from './pages/marketing/MarketingPage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/portal/DashboardPage'
import ResidentsPage from './pages/portal/ResidentsPage'
import ResidentDetailPage from './pages/portal/ResidentDetailPage'
import PillarPage from './pages/portal/PillarPage'
import SearchPage from './pages/portal/SearchPage'
import SettingsPage from './pages/portal/SettingsPage'
import OrgViewerPage from './pages/portal/OrgViewerPage'
import FacilitiesPage from './pages/superadmin/FacilitiesPage'
import FacilityDetailPage from './pages/superadmin/FacilityDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />

      {/* Super admin portal — separate shell, separate routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/superadmin"
          element={
            <RoleGuard allowedRoles={['super_admin']} fallback="/dashboard">
              <SuperAdminShell><FacilitiesPage /></SuperAdminShell>
            </RoleGuard>
          }
        />
        <Route
          path="/superadmin/facility/:orgId"
          element={
            <RoleGuard allowedRoles={['super_admin']} fallback="/dashboard">
              <SuperAdminShell><FacilityDetailPage /></SuperAdminShell>
            </RoleGuard>
          }
        />
      </Route>

      {/* Facility portal — home_admin and staff */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pillar/:slug" element={<PillarPage />} />
        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/residents/:id" element={<ResidentDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin/orgs/:orgId" element={<OrgViewerPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
