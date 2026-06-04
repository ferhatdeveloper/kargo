import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || '/api'

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('selected_account_id')
      if (!window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  },
)
