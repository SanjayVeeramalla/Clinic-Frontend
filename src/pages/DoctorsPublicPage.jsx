import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doctorApi, specializationApi } from '../services/api'
import { LoadingCenter, EmptyState, PageHeader } from '../components/UI'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function DoctorsPublicPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ isAvailable: '', specializationId: '' })

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.isAvailable !== '') params.isAvailable = filters.isAvailable === 'true'
      if (filters.specializationId) params.specializationId = filters.specializationId
      const res = await doctorApi.getAll(params)
      setDoctors(res.data.data || [])
    } catch { setDoctors([]) }
    setLoading(false)
  }

  useEffect(() => {
    specializationApi.getAll().then(r => setSpecializations(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => { fetchDoctors() }, [filters])

  const handleBookClick = (doctorId) => {
    if (!user) navigate('/login')
    else navigate('/patient/book', { state: { doctorId } })
  }

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <PageHeader
          title="Find a Doctor"
          subtitle="Browse our qualified medical professionals"
        />

        <div className="filter-bar">
          <select
            value={filters.specializationId}
            onChange={e => setFilters(f => ({ ...f, specializationId: e.target.value }))}
          >
            <option value="">All Specializations</option>
            {specializations.map(s => (
              <option key={s.specializationId} value={s.specializationId}>{s.name}</option>
            ))}
          </select>

          <select
            value={filters.isAvailable}
            onChange={e => setFilters(f => ({ ...f, isAvailable: e.target.value }))}
          >
            <option value="">All Availability</option>
            <option value="true">Available Now</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        {loading ? <LoadingCenter /> : doctors.length === 0 ? (
          <EmptyState icon="🔍" message="No doctors found matching the filters." />
        ) : (
          <div className="doctors-grid">
            {doctors.map(doctor => (
              <div key={doctor.doctorId} className="doctor-card">
                <div className="doctor-avatar">{initials(doctor.fullName)}</div>
                <div className="doctor-name">Dr. {doctor.fullName}</div>
                <div className="doctor-spec">{doctor.specialization}</div>
                <div className="doctor-meta">
                  <span>🎓 {doctor.yearsOfExperience} yrs exp</span>
                  <span className="doctor-fee">₹{doctor.consultationFee}</span>
                </div>
                {!doctor.isAvailable && (
                  <div className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                    ⚠ Currently unavailable
                  </div>
                )}
                <div style={{ marginTop: '1rem' }}>
                  {doctor.isAvailable ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBookClick(doctor.doctorId)}
                      style={{ width: '100%' }}
                    >
                      Book Appointment
                    </button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled style={{ width: '100%' }}>
                      Not Accepting
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}