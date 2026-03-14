import { useState, useEffect } from 'react'
import { doctorApi, specializationApi } from '../../services/api'
import { LoadingCenter, Alert, Spinner, PageHeader } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null)
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [form, setForm] = useState({})

  useEffect(() => {
    Promise.all([doctorApi.getProfile(), specializationApi.getAll()])
      .then(([pRes, sRes]) => {
        const p = pRes.data.data
        setProfile(p)
        setSpecializations(sRes.data.data || [])
        setForm({
          specializationId: p.specializationId?.toString() || '',
          yearsOfExperience: p.yearsOfExperience?.toString() || '0',
          consultationFee: p.consultationFee?.toString() || '0',
          isAvailable: p.isAvailable,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      await doctorApi.update(profile.doctorId, {
        specializationId: parseInt(form.specializationId),
        yearsOfExperience: parseInt(form.yearsOfExperience),
        consultationFee: parseFloat(form.consultationFee),
        isAvailable: form.isAvailable,
      })
      setMessage({ text: 'Profile updated successfully.', type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Update failed.', type: 'error' })
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" subtitle="Update your professional information" />

      {loading ? <LoadingCenter /> : (
        <form onSubmit={handleSubmit}>
          {message.text && <Alert type={message.type}>{message.text}</Alert>}

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Account Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input value={profile?.fullName || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={profile?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input value={profile?.phone || '—'} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input value={profile?.licenseNumber || ''} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Professional Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Specialization</label>
                <select name="specializationId" value={form.specializationId} onChange={handleChange} required>
                  {specializations.map(s => (
                    <option key={s.specializationId} value={s.specializationId}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  max="60"
                  value={form.yearsOfExperience}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Consultation Fee (₹)</label>
                <input
                  name="consultationFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.consultationFee}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Availability Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0' }}>
                  <input
                    id="isAvailable"
                    name="isAvailable"
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="isAvailable" style={{ textTransform: 'none', margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {form.isAvailable ? '🟢 Accepting appointments' : '🔴 Not available'}
                  </label>
                </div>
              </div>
            </div>

            {!form.isAvailable && (
              <div className="alert alert-warning">
                ⚠ Marking yourself unavailable will cancel all pending and confirmed future appointments.
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><Spinner size={16} /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  )
}