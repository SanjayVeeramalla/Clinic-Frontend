import { useState, useEffect } from 'react'
import { adminApi, specializationApi } from '../../services/api'
import { LoadingCenter, Alert, Spinner, Modal, PageHeader, EmptyState } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(null)
  const [deactivating, setDeactivating] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const emptyCreate = { fullName:'', email:'', password:'', phone:'', specializationId:'', licenseNumber:'', yearsOfExperience:'0', consultationFee:'0' }
  const [createForm, setCreateForm] = useState(emptyCreate)
  const [editForm, setEditForm] = useState({})

  const fetchDoctors = () => adminApi.getDoctors().then(r => setDoctors(r.data.data || []))

  useEffect(() => {
    Promise.all([fetchDoctors(), specializationApi.getAll().then(r => setSpecializations(r.data.data || []))])
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleCreate = async e => {
    e.preventDefault()
    setActionLoading(true)
    setMessage({ text: '', type: '' })
    try {
      await adminApi.createDoctor({
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone || undefined,
        specializationId: parseInt(createForm.specializationId),
        licenseNumber: createForm.licenseNumber,
        yearsOfExperience: parseInt(createForm.yearsOfExperience),
        consultationFee: parseFloat(createForm.consultationFee),
      })
      setMessage({ text: 'Doctor account created.', type: 'success' })
      setShowCreate(false)
      setCreateForm(emptyCreate)
      await fetchDoctors()
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create doctor.', type: 'error' })
    } finally { setActionLoading(false) }
  }

  const handleEdit = async e => {
    e.preventDefault()
    if (!showEdit) return
    setActionLoading(true)
    try {
      await adminApi.updateDoctor(showEdit.doctorId, {
        specializationId: parseInt(editForm.specializationId),
        yearsOfExperience: parseInt(editForm.yearsOfExperience),
        consultationFee: parseFloat(editForm.consultationFee),
        isAvailable: editForm.isAvailable,
      })
      setMessage({ text: 'Doctor updated.', type: 'success' })
      setShowEdit(null)
      await fetchDoctors()
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Update failed.', type: 'error' })
    } finally { setActionLoading(false) }
  }

  const handleDeactivate = async (userId) => {
    setDeactivating(userId)
    try {
      await adminApi.deactivateUser(userId)
      setMessage({ text: 'User deactivated.', type: 'success' })
      await fetchDoctors()
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Deactivation failed.', type: 'error' })
    } finally { setDeactivating(null) }
  }

  const openEdit = (doc) => {
    setShowEdit(doc)
    setEditForm({
      specializationId: doc.specializationId.toString(),
      yearsOfExperience: doc.yearsOfExperience.toString(),
      consultationFee: doc.consultationFee.toString(),
      isAvailable: doc.isAvailable,
    })
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Doctors"
        subtitle="Manage doctor accounts and profiles"
        action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Doctor</button>}
      />

      {message.text && <Alert type={message.type}>{message.text}</Alert>}

      {loading ? <LoadingCenter /> : doctors.length === 0 ? (
        <EmptyState icon="🩺" message="No doctors registered yet." action={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create First Doctor</button>
        } />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>License</th>
                <th>Exp.</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.doctorId}>
                  <td>
                    <div style={{ fontWeight: 600 }}> {doc.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.email}</div>
                  </td>
                  <td>{doc.specialization}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{doc.licenseNumber}</td>
                  <td>{doc.yearsOfExperience} yrs</td>
                  <td>₹{doc.consultationFee}</td>
                  <td>
                    <span className={`badge ${doc.isAvailable ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {doc.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(doc)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeactivate(doc.userId)}
                        disabled={deactivating === doc.userId}
                      >
                        {deactivating === doc.userId ? <Spinner size={14} /> : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Doctor Modal */}
      {showCreate && (
        <Modal title="Create Doctor Account" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input value={createForm.fullName} onChange={e => setCreateForm(f=>({...f,fullName:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={createForm.email} onChange={e => setCreateForm(f=>({...f,email:e.target.value}))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input type="password" minLength={6} value={createForm.password} onChange={e => setCreateForm(f=>({...f,password:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={createForm.phone} onChange={e => setCreateForm(f=>({...f,phone:e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Specialization *</label>
                <select value={createForm.specializationId} onChange={e => setCreateForm(f=>({...f,specializationId:e.target.value}))} required>
                  <option value="">Select…</option>
                  {specializations.map(s => <option key={s.specializationId} value={s.specializationId}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>License Number *</label>
                <input value={createForm.licenseNumber} onChange={e => setCreateForm(f=>({...f,licenseNumber:e.target.value}))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" min="0" value={createForm.yearsOfExperience} onChange={e => setCreateForm(f=>({...f,yearsOfExperience:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Consultation Fee (₹)</label>
                <input type="number" min="0" step="0.01" value={createForm.consultationFee} onChange={e => setCreateForm(f=>({...f,consultationFee:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? <><Spinner size={16}/> Creating…</> : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Doctor Modal */}
      {showEdit && (
        <Modal title={`Edit  ${showEdit.fullName}`} onClose={() => setShowEdit(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-row">
              <div className="form-group">
                <label>Specialization</label>
                <select value={editForm.specializationId} onChange={e => setEditForm(f=>({...f,specializationId:e.target.value}))}>
                  {specializations.map(s => <option key={s.specializationId} value={s.specializationId}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" min="0" value={editForm.yearsOfExperience} onChange={e => setEditForm(f=>({...f,yearsOfExperience:e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Consultation Fee (₹)</label>
                <input type="number" min="0" step="0.01" value={editForm.consultationFee} onChange={e => setEditForm(f=>({...f,consultationFee:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Available?</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0' }}>
                  <input id="ea" type="checkbox" checked={editForm.isAvailable} onChange={e => setEditForm(f=>({...f,isAvailable:e.target.checked}))} style={{ width:'auto' }} />
                  <label htmlFor="ea" style={{ margin:0, textTransform:'none', fontSize:'0.9375rem', color:'var(--text-primary)' }}>
                    Accepting Patients
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowEdit(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}