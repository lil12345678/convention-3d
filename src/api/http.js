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

function requestUrl(config) {
  return String(config?.url || '')
}

function isLoginRequest(config) {
  return requestUrl(config).includes('/auth/login')
}

let loginRedirecting = false

/** 业务接口 401：清掉本地登录态，全屏登录层盖住页面 */
function forceLogin(config, message) {
  if (isLoginRequest(config) || loginRedirecting) return
  loginRedirecting = true
  clearAuthStorage()
  window.dispatchEvent(
    new CustomEvent('convention:unauthorized', {
      detail: { message: message || '登录已过期，请重新登录' },
    }),
  )
  window.setTimeout(() => {
    loginRedirecting = false
  }, 800)
}

http.interceptors.response.use(
  (response) => {
    const body = response.data
    // 统一信封：成功只把 data 交给业务层，页面不用改解析逻辑
    if (isEnvelope(body)) {
      if (body.code === 401) {
        forceLogin(response.config, body.msg)
      }
      if (body.code !== 0) {
        const err = new Error(body.msg || '请求失败')
        err.response = {
          status: body.code === 401 ? 401 : response.status,
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
    const body = error?.response?.data

    if (isEnvelope(body) && body.msg) {
      error.message = body.msg
    } else if (typeof body?.detail === 'string') {
      error.message = body.detail
    }

    if (status === 401 || body?.code === 401) {
      forceLogin(error.config, error.message)
    }

    return Promise.reject(error)
  },
)

export default http
