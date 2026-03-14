import { useState, useEffect } from 'react'
import { doctorApi } from '../../services/api'
import { Alert, Spinner, PageHeader, LoadingCenter } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function DoctorSchedule() {
  const [doctorId, setDoctorId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [form, setForm] = useState({
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: '30',
  })

  // For display: fetch available slots for today to show current schedule indirectly
  const [scheduleByDay, setScheduleByDay] = useState({})

  useEffect(() => {
    doctorApi.getProfile().then(r => {
      setDoctorId(r.data.data.doctorId)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!doctorId) return
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      await doctorApi.setSchedule(doctorId, {
        dayOfWeek: parseInt(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        slotDurationMinutes: parseInt(form.slotDurationMinutes),
      })
      setMessage({ text: `Schedule saved for ${DAYS[parseInt(form.dayOfWeek)]}.`, type: 'success' })
      // Update local display
      setScheduleByDay(prev => ({
        ...prev,
        [form.dayOfWeek]: { startTime: form.startTime, endTime: form.endTime, slotDurationMinutes: parseInt(form.slotDurationMinutes) }
      }))
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save.', type: 'error' })
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <PageHeader title="My Schedule" subtitle="Set your working hours for each day of the week" />

      {loading ? <LoadingCenter /> : (
        <>
          {/* Visual day overview */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Weekly Overview</h3>
            <div className="schedule-grid">
              {SHORT_DAYS.map((day, i) => (
                <div key={i} className={`day-cell ${scheduleByDay[i] ? 'has-schedule' : ''}`}>
                  <div className="day-name">{day}</div>
                  {scheduleByDay[i] ? (
                    <div className="day-time" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {scheduleByDay[i].startTime}–{scheduleByDay[i].endTime}
                      <div style={{ marginTop: '0.2rem', color: 'var(--accent)' }}>
                        {scheduleByDay[i].slotDurationMinutes}m slots
                      </div>
                    </div>
                  ) : (
                    <div className="day-time" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Off
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted" style={{ marginTop: '0.75rem' }}>
              * Overview only shows schedules set in this session. Use the form below to add/update.
            </p>
          </div>

          {/* Schedule form */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Set Working Hours</h3>

            {message.text && <Alert type={message.type}>{message.text}</Alert>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Day of Week</label>
                  <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange}>
                    {DAYS.map((day, i) => (
                      <option key={i} value={i}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Slot Duration</label>
                  <select name="slotDurationMinutes" value={form.slotDurationMinutes} onChange={handleChange}>
                    <option value="15">15 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input name="startTime" type="time" value={form.startTime} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input name="endTime" type="time" value={form.endTime} onChange={handleChange} required />
                </div>
              </div>

              <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                ℹ Existing booked appointments will not be affected when you update the schedule.
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><Spinner size={16} /> Saving…</> : `Save ${DAYS[parseInt(form.dayOfWeek)]} Schedule`}
              </button>
            </form>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}