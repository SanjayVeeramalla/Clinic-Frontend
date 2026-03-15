import { useState, useEffect } from 'react'
import { patientApi } from '../../services/api'
import { LoadingCenter, StatusBadge, EmptyState, Modal, Alert, PageHeader } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'
import { Link } from 'react-router-dom'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: '1' },
  { label: 'Confirmed', value: '2' },
  { label: 'Completed', value: '3' },
  { label: 'Cancelled', value: '4' },
]

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [detailModal, setDetailModal] = useState(null)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { statusId: statusFilter } : {}
      const res = await patientApi.getAppointments(params)
      setAppointments(res.data.data || [])
    } catch { setAppointments([]) }
    setLoading(false)
  }

  useEffect(() => { fetchAppointments() }, [statusFilter])

  const handleCancel = async () => {
    if (!cancelReason.trim()) return
    setCancelLoading(true)
    try {
      await patientApi.cancelAppointment(cancelModal, { cancellationReason: cancelReason })
      setMessage('Appointment cancelled successfully.')
      setCancelModal(null)
      setCancelReason('')
      fetchAppointments()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Cancellation failed.')
    } finally { setCancelLoading(false) }
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const parts = dateStr.toString().split('-')
    return `${parts[2]} ${months[parseInt(parts[1])-1]} ${parts[0]}`
  }

  const getDateParts = (dateStr) => {
    if (!dateStr) return { day: '?', month: '?' }
    const parts = dateStr.toString().split('-')
    return { day: parts[2], month: months[parseInt(parts[1])-1] }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="My Appointments"
        action={<Link to="/patient/book" className="btn btn-primary btn-sm">+ Book New</Link>}
      />

      {message && (
        <Alert type={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </Alert>
      )}

      <div className="tabs">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            className={`tab-btn ${statusFilter === f.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingCenter /> : appointments.length === 0 ? (
        <EmptyState icon="📅" message="No appointments found." action={
          <Link to="/patient/book" className="btn btn-primary btn-sm">Book Appointment</Link>
        } />
      ) : appointments.map(appt => {
        const { day, month } = getDateParts(appt.appointmentDate)
        return (
          <div key={appt.appointmentId} className="appointment-card">
            <div className="appt-date-block">
              <div className="appt-date-day">{day}</div>
              <div className="appt-date-month">{month}</div>
            </div>
            <div className="appt-info">
              <div className="appt-doctor"> {appt.doctorName}</div>
              <div className="appt-spec">{appt.specialization}</div>
              <div className="appt-time">🕐 {appt.appointmentTime}</div>
              {appt.reasonForVisit && (
                <div className="appt-reason">"{appt.reasonForVisit}"</div>
              )}
              {appt.cancellationReason && (
                <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                  ❌ {appt.cancellationReason}
                </div>
              )}
            </div>
            <div className="appt-actions">
              <StatusBadge status={appt.status} />
              {['Pending', 'Confirmed'].includes(appt.status) && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => { setCancelModal(appt.appointmentId); setMessage('') }}
                >
                  Cancel
                </button>
              )}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDetailModal(appt)}
              >
                Details
              </button>
            </div>
          </div>
        )
      })}

      {/* ── Details Modal ── */}
      {detailModal && (
        <Modal
          title="Appointment Details"
          onClose={() => setDetailModal(null)}
          footer={
            <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>Close</button>
          }
        >
          {/* Doctor & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Doctor</div>
              <div style={{ fontWeight: 600 }}> {detailModal.doctorName}</div>
              <div style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{detailModal.specialization}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date & Time</div>
              <div style={{ fontWeight: 600 }}>{formatDate(detailModal.appointmentDate)}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>🕐 {detailModal.appointmentTime}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
              <StatusBadge status={detailModal.status} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Appointment ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>#{detailModal.appointmentId}</div>
            </div>
          </div>

          {/* Reason */}
          {detailModal.reasonForVisit && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Reason for Visit</div>
              <div style={{ background: 'var(--surface-2)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.9rem' }}>
                {detailModal.reasonForVisit}
              </div>
            </div>
          )}

          {/* Doctor Notes */}
          {detailModal.notes && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Doctor's Notes</div>
              <div style={{ background: 'var(--surface-2)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.9rem' }}>
                {detailModal.notes}
              </div>
            </div>
          )}

          {/* Cancellation reason */}
          {detailModal.cancellationReason && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--danger)', marginBottom: '0.25rem' }}>Cancellation Reason</div>
              <div style={{ background: 'var(--danger-light)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: 'var(--danger)' }}>
                {detailModal.cancellationReason}
              </div>
            </div>
          )}

          {/* Prescription */}
          {detailModal.prescription ? (
            <div className="prescription-block">
              <h4>📋 Prescription</h4>
              <dl>
                {detailModal.prescription.diagnosis && (
                  <><dt>Diagnosis</dt><dd>{detailModal.prescription.diagnosis}</dd></>
                )}
                {detailModal.prescription.medications && (
                  <><dt>Medications</dt><dd>{detailModal.prescription.medications}</dd></>
                )}
                {detailModal.prescription.instructions && (
                  <><dt>Instructions</dt><dd>{detailModal.prescription.instructions}</dd></>
                )}
                {detailModal.prescription.followUpDate && (
                  <><dt>Follow-up</dt><dd>{formatDate(detailModal.prescription.followUpDate)}</dd></>
                )}
              </dl>
            </div>
          ) : detailModal.status === 'Completed' ? (
            <div className="alert alert-warning" style={{ marginTop: '0.5rem' }}>
              No prescription has been added for this appointment yet.
            </div>
          ) : null}
        </Modal>
      )}

      {/* ── Cancel Modal ── */}
      {cancelModal && (
        <Modal
          title="Cancel Appointment"
          onClose={() => setCancelModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setCancelModal(null)}>Back</button>
              <button
                className="btn btn-danger"
                onClick={handleCancel}
                disabled={cancelLoading || !cancelReason.trim()}
              >
                {cancelLoading ? 'Cancelling…' : 'Confirm Cancel'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Reason for cancellation</label>
            <textarea
              rows={3}
              placeholder="Please provide a reason…"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
