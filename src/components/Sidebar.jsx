import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const patientLinks = [
  { to: '/patient', label: '🏠 Dashboard', end: true },
  { to: '/patient/appointments', label: '📅 My Appointments' },
  { to: '/patient/book', label: '➕ Book Appointment' },
  { to: '/patient/profile', label: '👤 My Profile' },
]

const doctorLinks = [
  { to: '/doctor', label: '🏠 Dashboard', end: true },
  { to: '/doctor/appointments', label: '📅 Appointments' },
  { to: '/doctor/schedule', label: '🕐 My Schedule' },
  { to: '/doctor/profile', label: '👤 My Profile' },
]

const adminLinks = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/doctors', label: '🩺 Doctors' },
  { to: '/admin/patients', label: '🧑‍⚕️ Patients' },
  { to: '/admin/reports', label: '📋 Reports' },
]

export default function Sidebar() {
  const { user } = useAuth()
  const links =
    user?.role === 'Admin' ? adminLinks :
    user?.role === 'Doctor' ? doctorLinks :
    patientLinks

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Menu</div>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  )
}