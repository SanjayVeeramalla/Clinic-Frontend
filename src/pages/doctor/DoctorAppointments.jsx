import { useState, useEffect } from 'react'
import { doctorApi } from '../../services/api'
import { LoadingCenter, StatusBadge, EmptyState, Modal, Alert, PageHeader } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

const STATUS_OPTIONS = ['Confirmed', 'Completed', 'NoShow', 'Cancelled']

export default function DoctorAppointments() {
  const [doctorId, setDoctorId] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusModal, setStatusModal] = useState(null)
  const [prescriptionModal, setPrescriptionModal] = useState(null)
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' })
  const [prescForm, setPrescForm] = useState({ diagnosis: '', medications: '', instructions: '', followUpDate: '' })
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchProfile = async () => {
    const r = await doctorApi.getProfile()
    return r.data.data.doctorId
  }

  const fetchAppointments = async (did) => {
    const params = {}
    if (filterDate) params.fromDate = filterDate
    const r = await doctorApi.getAppointments(did, params)
    return r.data.data || []
  }

  useEffect(() => {
    fetchProfile().then(did => {
      setDoctorId(did)
      return fetchAppointments(did)
    }).then(data => setAppointments(data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!doctorId) return
    fetchAppointments(doctorId).then(setAppointments).catch(() => {})
  }, [filterDate, filterStatus])

  const filtered = filterStatus
    ? appointments.filter(a => a.status === filterStatus)
    : appointments

  const handleUpdateStatus = async () => {
    if (!statusForm.status) return
    setActionLoading(true)
    try {
      await doctorApi.updateAppointmentStatus(statusModal, {
        status: statusForm.status,
        notes: statusForm.notes || undefined,
      })
      setMessage({ text: 'Status updated.', type: 'success' })
      setStatusModal(null)
      const data = await fetchAppointments(doctorId)
      setAppointments(data)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Update failed.', type: 'error' })
    } finally { setActionLoading(false) }
  }

  const handleAddPrescription = async () => {
    if (!prescForm.diagnosis || !prescForm.medications) return
    setActionLoading(true)
    try {
      await doctorApi.addPrescription(prescriptionModal, {
        diagnosis: prescForm.diagnosis,
        medications: prescForm.medications,
        instructions: prescForm.instructions || undefined,
        followUpDate: prescForm.followUpDate || undefined,
      })
      setMessage({ text: 'Prescription saved.', type: 'success' })
      setPrescriptionModal(null)
      setPrescForm({ diagnosis: '', medications: '', instructions: '', followUpDate: '' })
      const data = await fetchAppointments(doctorId)
      setAppointments(data)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save prescription.', type: 'error' })
    } finally { setActionLoading(false) }
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <DashboardLayout>
      <PageHeader title="Appointments" subtitle="Manage your patient visits" />

      {message.text && <Alert type={message.type}>{message.text}</Alert>}

      <div className="filter-bar">
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{ width: 170 }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
          <option value="">All Statuses</option>
          {['Pending','Confirmed','Completed','Cancelled','NoShow'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(filterDate || filterStatus) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterDate(''); setFilterStatus('') }}>
            Clear
          </button>
        )}
      </div>

      {loading ? <LoadingCenter /> : filtered.length === 0 ? (
        <EmptyState icon="📅" message="No appointments found." />
      ) : filtered.map(appt => {
        const parts = appt.appointmentDate?.toString().split('-') || []
        const canUpdate = ['Pending','Confirmed'].includes(appt.status)
        const canPrescribe = ['Confirmed','Completed'].includes(appt.status)

        return (
          <div key={appt.appointmentId} className="appointment-card">
            <div className="appt-date-block">
              <div className="appt-date-day">{parts[2]}</div>
              <div className="appt-date-month">{months[parseInt(parts[1])-1]}</div>
            </div>
            <div className="appt-info">
              <div className="appt-doctor">{appt.patientName}</div>
              {appt.patientPhone && <div className="appt-spec">📞 {appt.patientPhone}</div>}
              <div className="appt-time">🕐 {appt.appointmentTime}</div>
              {appt.reasonForVisit && <div className="appt-reason">"{appt.reasonForVisit}"</div>}
              {appt.notes && <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Notes: {appt.notes}</div>}
              {appt.prescription && (
                <div className="prescription-block">
                  <h4>Prescription</h4>
                  <dl>
                    {appt.prescription.diagnosis && <><dt>Diagnosis</dt><dd>{appt.prescription.diagnosis}</dd></>}
                    {appt.prescription.medications && <><dt>Medications</dt><dd>{appt.prescription.medications}</dd></>}
                  </dl>
                </div>
              )}
            </div>
            <div className="appt-actions">
              <StatusBadge status={appt.status} />
              {canUpdate && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setStatusModal(appt.appointmentId); setStatusForm({ status: '', notes: '' }); setMessage({text:'',type:''}) }}
                >
                  Update Status
                </button>
              )}
              {canPrescribe && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setPrescriptionModal(appt.appointmentId)
                    if (appt.prescription) {
                      setPrescForm({
                        diagnosis: appt.prescription.diagnosis || '',
                        medications: appt.prescription.medications || '',
                        instructions: appt.prescription.instructions || '',
                        followUpDate: appt.prescription.followUpDate?.toString().slice(0,10) || '',
                      })
                    } else {
                      setPrescForm({ diagnosis: '', medications: '', instructions: '', followUpDate: '' })
                    }
                    setMessage({text:'',type:''})
                  }}
                >
                  {appt.prescription ? 'Edit Rx' : '+ Prescription'}
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Update Status Modal */}
      {statusModal && (
        <Modal
          title="Update Appointment Status"
          onClose={() => setStatusModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setStatusModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={!statusForm.status || actionLoading}>
                {actionLoading ? 'Updating…' : 'Update'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>New Status</label>
            <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
              <option value="">Select status…</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows={2} value={statusForm.notes} onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </Modal>
      )}

      {/* Prescription Modal */}
      {prescriptionModal && (
        <Modal
          title="Write Prescription"
          onClose={() => setPrescriptionModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setPrescriptionModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddPrescription} disabled={!prescForm.diagnosis || !prescForm.medications || actionLoading}>
                {actionLoading ? 'Saving…' : 'Save Prescription'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Diagnosis *</label>
            <input placeholder="e.g. Viral fever" value={prescForm.diagnosis} onChange={e => setPrescForm(f => ({ ...f, diagnosis: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Medications *</label>
            <textarea rows={3} placeholder="List medications and dosages…" value={prescForm.medications} onChange={e => setPrescForm(f => ({ ...f, medications: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea rows={2} placeholder="Additional instructions for patient…" value={prescForm.instructions} onChange={e => setPrescForm(f => ({ ...f, instructions: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Follow-up Date</label>
            <input type="date" min={new Date().toISOString().split('T')[0]} value={prescForm.followUpDate} onChange={e => setPrescForm(f => ({ ...f, followUpDate: e.target.value }))} />
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}