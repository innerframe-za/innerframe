import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleGuard } from './components/RoleGuard'
import { SuperAdminShell } from './components/superadmin/SuperAdminShell'

// Route-level code splitting: each page loads only when first visited
const MarketingPage = lazy(() => import('./pages/marketing/MarketingPage'))
const Landing2Page = lazy(() => import('./pages/marketing/Landing2Page'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const ChangePasswordPage = lazy(() => import('./pages/auth/ChangePasswordPage'))
const DashboardPage = lazy(() => import('./pages/portal/DashboardPage'))
const ResidentsPage = lazy(() => import('./pages/portal/ResidentsPage'))
const ResidentDetailPage = lazy(() => import('./pages/portal/ResidentDetailPage'))
const PillarPage = lazy(() => import('./pages/portal/PillarPage'))
const SearchPage = lazy(() => import('./pages/portal/SearchPage'))
const SettingsPage = lazy(() => import('./pages/portal/SettingsPage'))
const OrgViewerPage = lazy(() => import('./pages/portal/OrgViewerPage'))
const CompliancePage = lazy(() => import('./pages/portal/CompliancePage'))
const StaffFilesPage = lazy(() => import('./pages/portal/StaffFilesPage'))
const StaffPermissionsPage = lazy(() => import('./pages/portal/admin/StaffPermissionsPage'))
const FacilitiesPage = lazy(() => import('./pages/superadmin/FacilitiesPage'))
const FacilityDetailPage = lazy(() => import('./pages/superadmin/FacilityDetailPage'))

// Minimal neutral screen shown while a route chunk downloads (cached after first visit)
const PageFallback = <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8' }} />

export default function App() {
  return (
    <Suspense fallback={PageFallback}>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/landing2" element={<Landing2Page />} />
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
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pillar/:slug" element={<PillarPage />} />
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/residents/:id" element={<ResidentDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/settings"
            element={
              <RoleGuard allowedRoles={['admin', 'super_admin']} fallback="/dashboard">
                <SettingsPage />
              </RoleGuard>
            }
          />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/staff-files" element={<StaffFilesPage />} />
          <Route path="/admin/orgs/:orgId" element={<OrgViewerPage />} />
          <Route
            path="/admin/staff/:userId/permissions"
            element={
              <RoleGuard allowedRoles={['admin', 'super_admin']} fallback="/dashboard">
                <StaffPermissionsPage />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
