import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { LoadingCenter, PageHeader } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Admin Dashboard" subtitle="System overview" />

      {loading ? <LoadingCenter /> : stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Patients</div>
              <div className="stat-value">{stats.totalPatients}</div>
              <div className="stat-desc">registered patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Doctors</div>
              <div className="stat-value">{stats.totalDoctors}</div>
              <div className="stat-desc">active doctors</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Today</div>
              <div className="stat-value">{stats.todayAppointments}</div>
              <div className="stat-desc">appointments today</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Appointments</div>
              <div className="stat-value">{stats.totalAppointments}</div>
              <div className="stat-desc">all time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pendingAppointments}</div>
              <div className="stat-desc">awaiting confirmation</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.completedAppointments}</div>
              <div className="stat-desc">successfully done</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Links</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <a href="/admin/doctors" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>🩺 Manage Doctors</a>
                <a href="/admin/patients" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>🧑‍⚕️ View Patients</a>
                <a href="/admin/reports" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>📋 Run Reports</a>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">System Status</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div className="flex items-center gap-2">
                  <span>🟢</span>
                  <span>API is online</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🟢</span>
                  <span>Database connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: stats.pendingAppointments > 10 ? 'orange' : 'var(--accent)' }}>
                    {stats.pendingAppointments > 10 ? '🟡' : '🟢'}
                  </span>
                  <span>{stats.pendingAppointments} pending appointments</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}