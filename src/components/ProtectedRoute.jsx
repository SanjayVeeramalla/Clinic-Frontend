import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    const redirect = user.role === 'Admin' ? '/admin'
      : user.role === 'Doctor' ? '/doctor'
      : '/patient'
    return <Navigate to={redirect} replace />
  }

  return children
}