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
  const [selectedAppt, setSelectedAppt] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { statusId: statusFilter } : {}
      const res = await patientApi.getAppointments(params)
      setAppointments(res.data.data || [])
    } catch { setAppointments([]) }
    setLoading(false)
  }

  useEffect(() => { fetch() }, [statusFilter])

  const handleCancel = async () => {
    if (!cancelReason.trim()) return
    setCancelLoading(true)
    try {
      await patientApi.cancelAppointment(cancelModal, { cancellationReason: cancelReason })
      setMessage('Appointment cancelled.')
      setCancelModal(null)
      setCancelReason('')
      fetch()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Cancellation failed.')
    } finally { setCancelLoading(false) }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.toString().split('-')
    return `${parts[2]} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(parts[1])-1]} ${parts[0]}`
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="My Appointments"
        action={<Link to="/patient/book" className="btn btn-primary btn-sm">+ Book New</Link>}
      />

      {message && <Alert type={message.includes('cancelled') ? 'success' : 'error'}>{message}</Alert>}

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
        const parts = appt.appointmentDate?.toString().split('-') || []
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return (
          <div key={appt.appointmentId} className="appointment-card">
            <div className="appt-date-block">
              <div className="appt-date-day">{parts[2]}</div>
              <div className="appt-date-month">{months[parseInt(parts[1])-1]}</div>
            </div>
            <div className="appt-info">
              <div className="appt-doctor"> {appt.doctorName}</div>
              <div className="appt-spec">{appt.specialization}</div>
              <div className="appt-time">🕐 {appt.appointmentTime}</div>
              {appt.reasonForVisit && <div className="appt-reason">"{appt.reasonForVisit}"</div>}
              {appt.cancellationReason && (
                <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                  Cancelled: {appt.cancellationReason}
                </div>
              )}
              {appt.prescription && (
                <div className="prescription-block">
                  <h4>Prescription</h4>
                  <dl>
                    {appt.prescription.diagnosis && <><dt>Diagnosis</dt><dd>{appt.prescription.diagnosis}</dd></>}
                    {appt.prescription.medications && <><dt>Medications</dt><dd>{appt.prescription.medications}</dd></>}
                    {appt.prescription.instructions && <><dt>Instructions</dt><dd>{appt.prescription.instructions}</dd></>}
                    {appt.prescription.followUpDate && <><dt>Follow-up</dt><dd>{formatDate(appt.prescription.followUpDate)}</dd></>}
                  </dl>
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
                onClick={() => setSelectedAppt(selectedAppt?.appointmentId === appt.appointmentId ? null : appt)}
              >
                Details
              </button>
            </div>
          </div>
        )
      })}

      {/* Cancel modal */}
      {cancelModal && (
        <Modal
          title="Cancel Appointment"
          onClose={() => setCancelModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setCancelModal(null)}>Back</button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelLoading || !cancelReason.trim()}>
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