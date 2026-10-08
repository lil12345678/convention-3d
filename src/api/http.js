import axios from 'axios'
import {
  clearAuthStorage,
  getAccessToken,
} from '@/utils/conventionAuth'

const http = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

function isEnvelope(body) {
  return (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    'code' in body &&
    'msg' in body &&
    'data' in body
  )
}

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const body = response.data
    // 统一信封：成功只把 data 交给业务层，页面不用改解析逻辑
    if (isEnvelope(body)) {
      if (body.code !== 0) {
        const err = new Error(body.msg || '请求失败')
        err.response = {
          status: response.status,
          data: body,
        }
        err.config = response.config
        return Promise.reject(err)
      }
      return body.data
    }
    return body
  },
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const isLoginRequest = String(url).includes('/auth/login')
    const body = error?.response?.data

    if (isEnvelope(body) && body.msg) {
      error.message = body.msg
    } else if (typeof body?.detail === 'string') {
      error.message = body.detail
    }

    if (status === 401 && !isLoginRequest) {
      clearAuthStorage()
      window.dispatchEvent(
        new CustomEvent('convention:unauthorized', {
          detail: { message: error.message || '登录已过期，请重新登录' },
        }),
      )
    }

    return Promise.reject(error)
  },
)

export default http
