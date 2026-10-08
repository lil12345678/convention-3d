import axios from 'axios'
import {
  clearAuthStorage,
  getAccessToken,
} from '@/utils/conventionAuth'

const http = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const isLoginRequest = String(url).includes('/auth/login')

    if (status === 401 && !isLoginRequest) {
      clearAuthStorage()
      window.dispatchEvent(
        new CustomEvent('convention:unauthorized', {
          detail: { message: '登录已过期，请重新登录' },
        }),
      )
    }

    return Promise.reject(error)
  },
)

export default http
