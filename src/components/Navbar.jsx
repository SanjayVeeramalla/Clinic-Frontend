import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    if (user.role === 'Admin') return '/admin'
    if (user.role === 'Doctor') return '/doctor'
    return '/patient'
  }

  return (
    <nav className="navbar">
      <NavLink to={getDashboardPath()} className="navbar-brand">
        ✚ <span>Clinic</span>MS
      </NavLink>

      <ul className="navbar-nav">
        {!user ? (
          <>
            <li><NavLink to="/doctors">Find Doctors</NavLink></li>
            <li><NavLink to="/login">Sign In</NavLink></li>
            <li>
              <NavLink to="/register">
                <span className="btn btn-primary btn-sm">Register</span>
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li className="navbar-user">
              <span>{user.fullName}</span>
              <span className="role-badge">{user.role}</span>
            </li>
            <li>
              <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Sign Out
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}