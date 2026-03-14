import { useState, useEffect } from 'react'
import { doctorApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { LoadingCenter, StatusBadge, EmptyState, PageHeader } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'
import { Link } from 'react-router-dom'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    doctorApi.getProfile().then(r => {
      const doc = r.data.data
      setProfile(doc)
      return doctorApi.getAppointments(doc.doctorId)
    }).then(r => {
      setAppointments(r.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointmentDate?.toString().slice(0,10) === today)
  const pending = appointments.filter(a => a.status === 'Pending')
  const confirmed = appointments.filter(a => a.status === 'Confirmed')

  return (
    <DashboardLayout>
      {loading ? <LoadingCenter /> : (
        <>
          <div className="page-header">
            <h1 className="page-title"> {user?.fullName?.split(' ')[0]}'s Dashboard 🩺</h1>
            <p className="page-subtitle">{profile?.specialization} · {profile?.isAvailable ? '🟢 Accepting patients' : '🔴 Unavailable'}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Today</div>
              <div className="stat-value">{todayAppts.length}</div>
              <div className="stat-desc">appointments</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{pending.length}</div>
              <div className="stat-desc">awaiting confirmation</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Confirmed</div>
              <div className="stat-value">{confirmed.length}</div>
              <div className="stat-desc">upcoming visits</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{appointments.filter(a=>a.status==='Completed').length}</div>
              <div className="stat-desc">total visits done</div>
            </div>
          </div>

          {/* Today's appointments */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <h2 className="card-title">Today's Appointments</h2>
              <Link to="/doctor/appointments" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {todayAppts.length === 0 ? (
              <EmptyState icon="☀️" message="No appointments scheduled for today." />
            ) : todayAppts.map(appt => (
              <div key={appt.appointmentId} className="appointment-card">
                <div className="appt-date-block">
                  <div style={{ fontSize: '1.25rem' }}>👤</div>
                </div>
                <div className="appt-info">
                  <div className="appt-doctor">{appt.patientName}</div>
                  <div className="appt-time">🕐 {appt.appointmentTime}</div>
                  {appt.reasonForVisit && <div className="appt-reason">"{appt.reasonForVisit}"</div>}
                </div>
                <div className="appt-actions">
                  <StatusBadge status={appt.status} />
                  <Link to="/doctor/appointments" className="btn btn-ghost btn-sm">Manage</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}