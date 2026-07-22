// force_password_change is not supported in the new backend.
// This route is kept to avoid 404s from any existing bookmarks.
import { Navigate } from 'react-router-dom'

export default function ChangePasswordPage() {
  return <Navigate to="/dashboard" replace />
}
