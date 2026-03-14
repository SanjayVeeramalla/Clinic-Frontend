import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, try refresh token once
api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh-token', { refreshToken })
          if (res.data.success) {
            localStorage.setItem('accessToken', res.data.data.accessToken)
            localStorage.setItem('refreshToken', res.data.data.refreshToken)
            original.headers.Authorization = `Bearer ${res.data.data.accessToken}`
            return api(original)
          }
        } catch {
          // refresh failed — clear tokens
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
}

// ── Doctor (public) ───────────────────────────────────────────────────────────
export const doctorApi = {
  getAll: (params) => api.get('/doctor', { params }),
  getById: (id) => api.get(`/doctor/${id}`),
  getProfile: () => api.get('/doctor/profile'),
  update: (doctorId, data) => api.put(`/doctor/${doctorId}`, data),
  getAppointments: (doctorId, params) => api.get(`/doctor/${doctorId}/appointments`, { params }),
  getSlots: (doctorId, date) => api.get(`/doctor/${doctorId}/available-slots`, { params: { date } }),
  setSchedule: (doctorId, data) => api.post(`/doctor/${doctorId}/schedule`, data),
  updateAppointmentStatus: (appointmentId, data) => api.put(`/doctor/appointments/${appointmentId}/status`, data),
  addPrescription: (appointmentId, data) => api.post(`/doctor/appointments/${appointmentId}/prescription`, data),
}

// ── Patient ───────────────────────────────────────────────────────────────────
export const patientApi = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.put('/patient/profile', data),
  bookAppointment: (data) => api.post('/patient/appointments', data),
  getAppointments: (params) => api.get('/patient/appointments', { params }),
  getAppointmentById: (id) => api.get(`/patient/appointments/${id}`),
  cancelAppointment: (id, data) => api.delete(`/patient/appointments/${id}`, { data }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDoctors: () => api.get('/admin/doctors'),
  createDoctor: (data) => api.post('/admin/doctors/create-account', data),
  updateDoctor: (doctorId, data) => api.put(`/admin/doctors/${doctorId}`, data),
  getPatients: (search) => api.get('/admin/patients', { params: { search } }),
  getPatient: (id) => api.get(`/admin/patients/${id}`),
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
  appointmentReport: (data) => api.post('/admin/reports/appointments', data),
  doctorWorkloadReport: (data) => api.post('/admin/reports/doctor-workload', data),
}

// ── Specializations ───────────────────────────────────────────────────────────
export const specializationApi = {
  getAll: () => api.get('/specializations'),
}