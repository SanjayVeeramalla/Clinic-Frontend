import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { doctorApi, specializationApi, patientApi } from '../../services/api'
import { LoadingCenter, Alert, Spinner, PageHeader } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function BookAppointment() {
  const location = useLocation()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [specializations, setSpecializations] = useState([])
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState(null)
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [selectedSpec, setSelectedSpec] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [reason, setReason] = useState('')

  // Pre-select doctor from state (coming from DoctorsPublicPage)
  useEffect(() => {
    if (location.state?.doctorId) {
      doctorApi.getById(location.state.doctorId).then(r => {
        setSelectedDoctor(r.data.data)
        setStep(2)
      }).catch(() => {})
    }
  }, [location.state])

  useEffect(() => {
    specializationApi.getAll().then(r => setSpecializations(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedSpec || step === 1) {
      doctorApi.getAll(selectedSpec ? { specializationId: selectedSpec, isAvailable: true } : { isAvailable: true })
        .then(r => setDoctors(r.data.data || [])).catch(() => {})
    }
  }, [selectedSpec])

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setSlotsLoading(true)
      doctorApi.getSlots(selectedDoctor.doctorId, selectedDate)
        .then(r => setSlots(r.data.data))
        .catch(() => setSlots(null))
        .finally(() => setSlotsLoading(false))
    }
  }, [selectedDoctor, selectedDate])

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return
    setLoading(true)
    setError('')
    try {
      await patientApi.bookAppointment({
        doctorId: selectedDoctor.doctorId,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot + ':00',
        reasonForVisit: reason || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3rem' }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>
            Appointment Booked!
          </h2>
          <p className="text-muted">Your appointment has been scheduled successfully.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/patient/appointments')}>
              View Appointments
            </button>
            <button className="btn btn-ghost" onClick={() => { setSuccess(false); setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); setReason('') }}>
              Book Another
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader title="Book Appointment" subtitle="Schedule a visit with a doctor" />

      {error && <Alert type="error">{error}</Alert>}

      {/* Step 1 — Pick Doctor */}
      {step === 1 && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Select a Doctor</h3>

          <div className="form-group">
            <label>Filter by Specialization</label>
            <select value={selectedSpec} onChange={e => setSelectedSpec(e.target.value)}>
              <option value="">All Specializations</option>
              {specializations.map(s => (
                <option key={s.specializationId} value={s.specializationId}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="doctors-grid" style={{ marginTop: '1rem' }}>
            {doctors.map(doctor => (
              <div
                key={doctor.doctorId}
                className="doctor-card"
                style={{ cursor: 'pointer', border: selectedDoctor?.doctorId === doctor.doctorId ? '2px solid var(--accent)' : '' }}
                onClick={() => { setSelectedDoctor(doctor); setSelectedDate(''); setSelectedSlot(''); setStep(2) }}
              >
                <div className="doctor-avatar">
                  {doctor.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="doctor-name"> {doctor.fullName}</div>
                <div className="doctor-spec">{doctor.specialization}</div>
                <div className="doctor-meta">
                  <span>🎓 {doctor.yearsOfExperience} yrs</span>
                  <span className="doctor-fee">₹{doctor.consultationFee}</span>
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', width: '100%' }}>
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Pick Date & Slot */}
      {step === 2 && selectedDoctor && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>
            <div>
              <strong> {selectedDoctor.fullName}</strong>
              <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                {selectedDoctor.specialization} · ₹{selectedDoctor.consultationFee}
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Appointment Date</label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot('') }}
              />
            </div>

            <div className="form-group">
              <label>Reason for Visit (optional)</label>
              <input
                type="text"
                placeholder="e.g. Routine checkup"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>Available Time Slots</label>
              {slotsLoading ? <LoadingCenter /> : !slots ? (
                <Alert type="warning">No schedule found for this date.</Alert>
              ) : slots.availableSlots?.length === 0 ? (
                <Alert type="warning">All slots are booked for this date. Try another day.</Alert>
              ) : (
                <div className="slots-grid">
                  {slots.availableSlots?.map(slot => (
                    <button
                      key={slot}
                      className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                  {slots.bookedSlots?.map(slot => (
                    <button key={slot} className="slot-btn booked" disabled>{slot}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '1rem' }}
            disabled={!selectedDate || !selectedSlot || loading}
            onClick={handleSubmit}
          >
            {loading ? <><Spinner size={16} /> Booking…</> : 'Confirm Appointment'}
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
