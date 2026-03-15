import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api'
import { LoadingCenter, Alert, Spinner, PageHeader, EmptyState, Modal } from '../../components/UI'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deactivating, setDeactivating] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [viewPatient, setViewPatient] = useState(null)
  const [fetchError, setFetchError] = useState('')

  const fetchPatients = useCallback(async (q = '') => {
    setLoading(true)
    setFetchError('')
    try {
      const res = await adminApi.getPatients(q || undefined)
      // Handle different response shapes
      const data = res.data?.data ?? res.data ?? []
      setPatients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch patients error:', err)
      setFetchError(err.response?.data?.message || err.message || 'Failed to load patients.')
      setPatients([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const handleSearch = e => {
    e.preventDefault()
    fetchPatients(search)
  }

  const handleDeactivate = async (userId, fullName) => {
    if (!window.confirm(`Deactivate ${fullName}? Their future appointments will be cancelled.`)) return
    setDeactivating(userId)
    try {
      await adminApi.deactivateUser(userId)
      setMessage({ text: `${fullName} has been deactivated.`, type: 'success' })
      fetchPatients(search)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed.', type: 'error' })
    } finally { setDeactivating(null) }
  }

  const handleViewDetail = async (patientId) => {
    try {
      const res = await adminApi.getPatient(patientId)
      setViewPatient(res.data?.data ?? res.data)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Could not load patient details.', type: 'error' })
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Patients" subtitle="View and manage patient accounts" />

      {message.text && <Alert type={message.type}>{message.text}</Alert>}
      {fetchError && <Alert type="error">⚠ {fetchError}</Alert>}

      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        {search && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); fetchPatients() }}>
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <LoadingCenter />
      ) : fetchError ? null : patients.length === 0 ? (
        <EmptyState
          icon="🧑‍⚕️"
          message={search ? `No patients found for "${search}"` : 'No patients registered yet.'}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Blood</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.patientId}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{p.patientId}</td>
                  <td style={{ fontWeight: 600 }}>{p.fullName}</td>
                  <td>{p.email}</td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.gender || '—'}</td>
                  <td>{p.bloodGroup || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleViewDetail(p.patientId)}>
                        View
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeactivate(p.userId, p.fullName)}
                        disabled={deactivating === p.userId}
                      >
                        {deactivating === p.userId ? <Spinner size={14} /> : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewPatient && (
        <Modal title={`Patient: ${viewPatient.fullName}`} onClose={() => setViewPatient(null)}>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
            {[
              ['Email', viewPatient.email],
              ['Phone', viewPatient.phone || '—'],
              ['Date of Birth', viewPatient.dateOfBirth?.toString() || '—'],
              ['Gender', viewPatient.gender || '—'],
              ['Blood Group', viewPatient.bloodGroup || '—'],
              ['Emergency Contact', viewPatient.emergencyContact || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            {viewPatient.address && (
              <div style={{ gridColumn: '1 / -1' }}>
                <dt style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Address</dt>
                <dd>{viewPatient.address}</dd>
              </div>
            )}
            {viewPatient.medicalHistory && (
              <div style={{ gridColumn: '1 / -1' }}>
                <dt style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Medical History</dt>
                <dd style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{viewPatient.medicalHistory}</dd>
              </div>
            )}
          </dl>
        </Modal>
      )}
    </DashboardLayout>
  )
}
