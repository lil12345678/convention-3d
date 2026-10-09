import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginApi, clearConventionCache } from '@/api/convention'
import {
  clearAuthStorage,
  getAccessToken,
  getUsername,
  setAccessToken,
  setUsername,
} from '@/utils/conventionAuth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getAccessToken())
  const username = ref(getUsername())
  const loginVisible = ref(!getAccessToken())
  const loggingIn = ref(false)
  const loginError = ref('')
  // 每次登录成功 +1，用来让大屏子页面重新挂载、重新拉数据
  const sessionVersion = ref(0)

  const isAuthenticated = computed(() => Boolean(token.value))

  function applySession(accessToken, name) {
    token.value = accessToken || ''
    username.value = name || ''
    setAccessToken(token.value)
    setUsername(username.value)
    loginVisible.value = !token.value
    loginError.value = ''
    if (accessToken) sessionVersion.value += 1
  }

  async function login(form) {
    loggingIn.value = true
    loginError.value = ''
    try {
      const data = await loginApi({
        username: form.username.trim(),
        password: form.password,
      })
      const accessToken = data?.access_token
      if (!accessToken) {
        throw new Error('登录响应缺少 access_token')
      }
      clearConventionCache()
      applySession(accessToken, data.username || form.username.trim())
      return true
    } catch (error) {
      const body = error?.response?.data
      const detail =
        (typeof body?.msg === 'string' && body.msg) ||
        (typeof body?.detail === 'string' && body.detail) ||
        error?.message ||
        '登录失败，请检查账号密码或后端服务'
      loginError.value = typeof detail === 'string' ? detail : '登录失败'
      applySession('', '')
      return false
    } finally {
      loggingIn.value = false
    }
  }

  function logout(reason = '') {
    clearConventionCache()
    clearAuthStorage()
    token.value = ''
    username.value = ''
    loginVisible.value = true
    loginError.value = reason
  }

  function requireLogin(reason = '登录已过期，请重新登录') {
    logout(reason)
  }

  return {
    token,
    username,
    loginVisible,
    loggingIn,
    loginError,
    isAuthenticated,
    sessionVersion,
    login,
    logout,
    requireLogin,
  }
})
