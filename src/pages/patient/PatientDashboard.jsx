import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { patientApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { LoadingCenter, StatusBadge, EmptyState } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      patientApi.getAppointments(),
      patientApi.getProfile(),
    ]).then(([apptRes, profileRes]) => {
      setAppointments(apptRes.data.data || [])
      setProfile(profileRes.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a =>
    ['Pending', 'Confirmed'].includes(a.status)
  ).slice(0, 3)

  const recent = appointments.filter(a =>
    ['Completed', 'Cancelled', 'NoShow'].includes(a.status)
  ).slice(0, 3)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.toString().split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return { day: d, month: months[parseInt(m) - 1], year: y }
  }

  return (
    <DashboardLayout>
      {loading ? <LoadingCenter /> : (
        <>
          <div className="page-header">
            <h1 className="page-title">
              Good day, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="page-subtitle">Here's your health overview</p>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Upcoming</div>
              <div className="stat-value">{upcoming.length}</div>
              <div className="stat-desc">appointments scheduled</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{appointments.length}</div>
              <div className="stat-desc">all appointments</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{appointments.filter(a => a.status === 'Completed').length}</div>
              <div className="stat-desc">visits done</div>
            </div>
          </div>

          {/* Upcoming */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <h2 className="card-title">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="btn btn-ghost btn-sm">View all</Link>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState icon="📅" message="No upcoming appointments." action={
                <Link to="/patient/book" className="btn btn-primary btn-sm">Book Now</Link>
              } />
            ) : upcoming.map(appt => {
              const d = formatDate(appt.appointmentDate)
              return (
                <div key={appt.appointmentId} className="appointment-card">
                  <div className="appt-date-block">
                    <div className="appt-date-day">{d.day}</div>
                    <div className="appt-date-month">{d.month}</div>
                  </div>
                  <div className="appt-info">
                    <div className="appt-doctor"> {appt.doctorName}</div>
                    <div className="appt-spec">{appt.specialization}</div>
                    <div className="appt-time">🕐 {appt.appointmentTime}</div>
                    {appt.reasonForVisit && <div className="appt-reason">"{appt.reasonForVisit}"</div>}
                  </div>
                  <div className="appt-actions">
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Profile completeness */}
          {profile && !profile.dateOfBirth && (
            <div className="alert alert-warning">
              ⚠ Your profile is incomplete.{' '}
              <Link to="/patient/profile">Complete your profile</Link> for a better experience.
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}