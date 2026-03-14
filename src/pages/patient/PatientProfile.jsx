import { useState, useEffect } from 'react'
import { patientApi } from '../../services/api'
import { LoadingCenter, Alert, Spinner, PageHeader } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function PatientProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({})

  useEffect(() => {
    patientApi.getProfile().then(r => {
      const p = r.data.data
      setProfile(p)
      setForm({
        fullName: p.fullName || '',
        phone: p.phone || '',
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toString().slice(0, 10) : '',
        gender: p.gender || '',
        bloodGroup: p.bloodGroup || '',
        address: p.address || '',
        emergencyContact: p.emergencyContact || '',
        medicalHistory: p.medicalHistory || '',
      })
    }).catch(() => setError('Failed to load profile.')).finally(() => setLoading(false))
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await patientApi.updateProfile({
        fullName: form.fullName,
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
        address: form.address || undefined,
        emergencyContact: form.emergencyContact || undefined,
        medicalHistory: form.medicalHistory || undefined,
      })
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.')
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" subtitle="Manage your personal and medical information" />

      {loading ? <LoadingCenter /> : (
        <form onSubmit={handleSubmit}>
          {message && <Alert type="success">{message}</Alert>}
          {error && <Alert type="error">{error}</Alert>}

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={profile?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  <option value="">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Additional Information</h3>
            <div className="form-group">
              <label>Address</label>
              <textarea name="address" rows={2} value={form.address} onChange={handleChange} placeholder="Your address" />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Emergency phone number" />
            </div>
            <div className="form-group">
              <label>Medical History</label>
              <textarea name="medicalHistory" rows={3} value={form.medicalHistory} onChange={handleChange} placeholder="Any known conditions, allergies, previous surgeries…" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <><Spinner size={16} /> Saving…</> : 'Save Changes'}
          </button>
        </form>
      )}
    </DashboardLayout>
  )
}