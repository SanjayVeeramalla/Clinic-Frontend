import { useState } from 'react'
import { adminApi } from '../../services/api'
import { Alert, Spinner, PageHeader, EmptyState } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('appointments')
  const [form, setForm] = useState({
    fromDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apptReport, setApptReport] = useState(null)
  const [workloadReport, setWorkloadReport] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleRun = async () => {
    setLoading(true)
    setError('')
    try {
      if (activeTab === 'appointments') {
        const res = await adminApi.appointmentReport({ fromDate: form.fromDate, toDate: form.toDate })
        setApptReport(res.data.data || [])
        setWorkloadReport(null)
      } else {
        const res = await adminApi.doctorWorkloadReport({ fromDate: form.fromDate, toDate: form.toDate })
        setWorkloadReport(res.data.data || [])
        setApptReport(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report.')
    } finally { setLoading(false) }
  }

  const total = apptReport?.reduce((s, r) => s + r.count, 0) || 0

  return (
    <DashboardLayout>
      <PageHeader title="Reports" subtitle="Analyse appointment and doctor data by date range" />

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="tabs" style={{ marginBottom: '1.25rem' }}>
          <button className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            Appointment Summary
          </button>
          <button className={`tab-btn ${activeTab === 'workload' ? 'active' : ''}`} onClick={() => setActiveTab('workload')}>
            Doctor Workload
          </button>
        </div>

        <div className="filter-bar">
          <div>
            <label>From Date</label>
            <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} style={{ width: 170 }} />
          </div>
          <div>
            <label>To Date</label>
            <input type="date" name="toDate" value={form.toDate} onChange={handleChange} style={{ width: 170 }} />
          </div>
          <button className="btn btn-primary" onClick={handleRun} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? <><Spinner size={16} /> Running…</> : 'Run Report'}
          </button>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Appointment Summary Report */}
      {apptReport && (
        apptReport.length === 0 ? (
          <EmptyState icon="📊" message="No appointments found in this date range." />
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Appointment Summary</h3>
              <span className="text-sm text-muted">{form.fromDate} → {form.toDate}</span>
            </div>

            {/* Visual bar chart */}
            <div style={{ marginBottom: '1.5rem' }}>
              {apptReport.map(row => (
                <div key={row.status} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600 }}>{row.status}</span>
                    <span className="text-muted">{row.count} ({parseFloat(row.percentage).toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${row.percentage}%`,
                      background: row.status === 'Completed' ? 'var(--accent)' : row.status === 'Cancelled' ? '#ccc' : row.status === 'Pending' ? 'var(--warning)' : 'var(--info)',
                      borderRadius: 999,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Status</th><th>Count</th><th>% of Total</th></tr>
                </thead>
                <tbody>
                  {apptReport.map(row => (
                    <tr key={row.status}>
                      <td><span className={`badge badge-${row.status.toLowerCase()}`}>{row.status}</span></td>
                      <td style={{ fontWeight: 600 }}>{row.count}</td>
                      <td>{parseFloat(row.percentage).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--surface-2)', fontWeight: 700 }}>
                    <td>Total</td>
                    <td>{total}</td>
                    <td>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Doctor Workload Report */}
      {workloadReport && (
        workloadReport.length === 0 ? (
          <EmptyState icon="🩺" message="No data found in this date range." />
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Doctor Workload</h3>
              <span className="text-sm text-muted">{form.fromDate} → {form.toDate}</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Total</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {workloadReport.map(row => (
                    <tr key={row.doctorId}>
                      <td style={{ fontWeight: 600 }}> {row.doctorName}</td>
                      <td>{row.specialization}</td>
                      <td style={{ fontWeight: 700 }}>{row.totalAppointments}</td>
                      <td style={{ color: 'var(--accent)' }}>{row.completed}</td>
                      <td style={{ color: 'var(--warning)' }}>{row.pending}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{row.cancelled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </DashboardLayout>
  )
}