import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  adminRegister: (data) => api.post('/auth/admin/register', data),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers:           ()        => api.get('/admin/users'),
  getUserResults:     (id)      => api.get(`/admin/users/${id}/results`),
  createAssessment:   (data)    => api.post('/admin/assessments', data),
  getAssessments:     ()        => api.get('/admin/assessments'),
  getAssessment:      (id)      => api.get(`/admin/assessments/${id}`),
  assignAssessment:   (id, ids) => api.put(`/admin/assessments/${id}/assign`, ids),
  updateMinScores:    (id, data)=> api.put(`/admin/assessments/${id}/min-scores`, data),
  deleteAssessment:   (id)      => api.delete(`/admin/assessments/${id}`),
  getAllResults:       ()        => api.get('/admin/results'),
  regenerateQuestions:(id)      => api.post(`/admin/regenerate-questions/${id}`),
}

// ── User ──────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:      () => api.get('/user/me'),
  getMyAssessments:() => api.get('/user/assessments'),
  getMyResults:    () => api.get('/user/results'),
  getResultDetail: (id) => api.get(`/user/results/${id}`),
  getDashboard:    () => api.get('/user/dashboard'),
}

// ── Assessment ────────────────────────────────────────────────────────────────
export const assessmentAPI = {
  start:       (id)           => api.get(`/assessment/${id}/start`),
  getQuestions:(id, round)    => api.get(`/assessment/${id}/round/${round}/questions`),
  submitRound: (id, round, d) => api.post(`/assessment/${id}/round/${round}/submit`, d),
}
