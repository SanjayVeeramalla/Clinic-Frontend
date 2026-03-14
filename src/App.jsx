import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DoctorsPublicPage from './pages/DoctorsPublicPage'

import PatientDashboard from './pages/patient/PatientDashboard'
import PatientAppointments from './pages/patient/PatientAppointments'
import BookAppointment from './pages/patient/BookAppointment'
import PatientProfile from './pages/patient/PatientProfile'

import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import DoctorProfile from './pages/doctor/DoctorProfile'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminPatients from './pages/admin/AdminPatients'
import AdminReports from './pages/admin/AdminReports'

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: 'red' }}>Something went wrong</h2>
          <pre style={{ background: '#fee', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap', color: '#c00' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Home redirect based on role ───────────────────────────────────────────────
function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</div>
  if (!user) return <Navigate to="/doctors" replace />
  if (user.role === 'Admin') return <Navigate to="/admin" replace />
  if (user.role === 'Doctor') return <Navigate to="/doctor" replace />
  return <Navigate to="/patient" replace />
}

// ── All routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctors" element={<DoctorsPublicPage />} />

      <Route path="/patient" element={
        <ProtectedRoute roles={['Patient']}>
          <div className="page-wrapper"><Navbar /><PatientDashboard /></div>
        </ProtectedRoute>
      } />
      <Route path="/patient/appointments" element={
        <ProtectedRoute roles={['Patient']}>
          <div className="page-wrapper"><Navbar /><PatientAppointments /></div>
        </ProtectedRoute>
      } />
      <Route path="/patient/book" element={
        <ProtectedRoute roles={['Patient']}>
          <div className="page-wrapper"><Navbar /><BookAppointment /></div>
        </ProtectedRoute>
      } />
      <Route path="/patient/profile" element={
        <ProtectedRoute roles={['Patient']}>
          <div className="page-wrapper"><Navbar /><PatientProfile /></div>
        </ProtectedRoute>
      } />

      <Route path="/doctor" element={
        <ProtectedRoute roles={['Doctor']}>
          <div className="page-wrapper"><Navbar /><DoctorDashboard /></div>
        </ProtectedRoute>
      } />
      <Route path="/doctor/appointments" element={
        <ProtectedRoute roles={['Doctor']}>
          <div className="page-wrapper"><Navbar /><DoctorAppointments /></div>
        </ProtectedRoute>
      } />
      <Route path="/doctor/schedule" element={
        <ProtectedRoute roles={['Doctor']}>
          <div className="page-wrapper"><Navbar /><DoctorSchedule /></div>
        </ProtectedRoute>
      } />
      <Route path="/doctor/profile" element={
        <ProtectedRoute roles={['Doctor']}>
          <div className="page-wrapper"><Navbar /><DoctorProfile /></div>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute roles={['Admin']}>
          <div className="page-wrapper"><Navbar /><AdminDashboard /></div>
        </ProtectedRoute>
      } />
      <Route path="/admin/doctors" element={
        <ProtectedRoute roles={['Admin']}>
          <div className="page-wrapper"><Navbar /><AdminDoctors /></div>
        </ProtectedRoute>
      } />
      <Route path="/admin/patients" element={
        <ProtectedRoute roles={['Admin']}>
          <div className="page-wrapper"><Navbar /><AdminPatients /></div>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['Admin']}>
          <div className="page-wrapper"><Navbar /><AdminReports /></div>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}