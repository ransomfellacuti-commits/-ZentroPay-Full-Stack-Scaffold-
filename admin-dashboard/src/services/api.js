import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
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

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
}

export const usersAPI = {
  getAll:        (params) => api.get('/users', { params }),
  getById:       (id)     => api.get(`/users/${id}`),
  getProfile:    ()       => api.get('/users/profile'),
  updateProfile: (data)   => api.put('/users/profile', data),
  setPin:        (data)   => api.post('/users/set-pin', data),
  toggleStatus:  (id)     => api.patch(`/users/${id}/toggle-status`),
}

export const transactionsAPI = {
  getAll:   (params) => api.get('/transactions', { params }),
  getById:  (id)     => api.get(`/transactions/${id}`),
  create:   (data)   => api.post('/transactions', data),
  getStats: ()       => api.get('/transactions/stats'),
}

export const walletsAPI = {
  getBalance: ()       => api.get('/wallets/balance'),
  transfer:   (data)   => api.post('/wallets/transfer', data),
  getAll:     (params) => api.get('/wallets', { params }),
}

export const transfersAPI = {
  getCountries: ()         => api.get('/transfers/countries'),
  getBanks:     (q, limit) => api.get('/transfers/banks', { params: { q, limit } }),
  getAll:       (params)   => api.get('/transfers', { params }),
  create:       (data)     => api.post('/transfers', data),
  getReceipt:   (id)       => api.get(`/transfers/${id}/receipt`),
}

export default api
