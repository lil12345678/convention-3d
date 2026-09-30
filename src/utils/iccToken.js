import { getPublicKey, getICCToken } from '@/api/icc.js'
import { ElMessage } from 'element-plus'
import '@/api/jsencrypt.min.js'

let refreshTimer = null
const STORAGE_EXPIRES_KEY = 'ICC_TOKEN_EXPIRES'

// 初始化ICC Token逻辑
export const initICCToken = () => {
  const token = localStorage.getItem('ICC_TOKEN')
  const storedExpires = localStorage.getItem(STORAGE_EXPIRES_KEY)

  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }

  if (!token) {
    // 无token时清除残留过期时间并重新获取
    localStorage.removeItem(STORAGE_EXPIRES_KEY)
    _fetchPublicKey() // 直接触发公钥获取流程
  } else {
    const now = Date.now()
    const expires = Number(storedExpires)
    if (now >= expires) {
      // 过期时清除本地存储并重新获取
      localStorage.removeItem('ICC_TOKEN')
      localStorage.removeItem(STORAGE_EXPIRES_KEY)
      _fetchPublicKey() // 重新从公钥获取开始
    } else {
      const remaining = expires - now
      console.log(`ICC_TOKEN有效，剩余${Math.ceil(remaining / 1000)}秒后刷新`)
      // 定时器触发时清除旧数据并重新获取
      refreshTimer = setTimeout(() => {
        localStorage.removeItem('ICC_TOKEN')
        localStorage.removeItem(STORAGE_EXPIRES_KEY)
        _fetchPublicKey() // 重新从公钥获取开始
      }, remaining)
    }
  }
}

// 独立获取公钥的方法
async function _fetchPublicKey() {
  try {
    const res = await getPublicKey()
    if (!res.success) {
      throw new Error(`获取公钥失败: ${res.errMsg || '未知错误'}`)
    }
    console.log('获取公钥成功')
    _fetchTokenWithPublicKey(res.data.publicKey) // 公钥获取成功后触发token获取
  } catch (error) {
    console.error('获取公钥失败:', error.message)
    ElMessage.error('获取公钥失败，即将重试...')
    // 公钥获取失败时，5分钟后重新开始整个流程
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      localStorage.removeItem('ICC_TOKEN')
      localStorage.removeItem(STORAGE_EXPIRES_KEY)
      _fetchPublicKey() // 重新获取公钥
    }, 5 * 60 * 1000)
  }
}

// 使用已获取的公钥获取token的方法
async function _fetchTokenWithPublicKey(publicKey) {
  try {
    const password = 'OGR28u6_cc'
    const encryptor = new window.JSEncrypt()
    encryptor.setPublicKey(publicKey)
    const passwordText = encryptor.encrypt(password)
    const resToken = await getICCToken({
      grant_type: 'password',
      username: 'TEST',
      password: passwordText,
      client_id: 'web_client',
      client_secret: 'web_client',
      public_key: publicKey,
    })

    // const resToken = await getICCToken({
    //   grant_type: 'password',
    //   username: 'TEST',
    //   password: 'OGR28u6_cc',
    //   client_id: 'CompanyName',
    //   client_secret: '42bec152-8f04-476a-9aec-e7d616ff3cb3',
    //   public_key: publicKey,
    // })

    if (!resToken.success) {
      throw new Error(`获取Token失败: ${resToken.errMsg || '未知错误'}`)
    }

    // 存储新token和过期时间
    const token = `${resToken.data.token_type} ${resToken.data.access_token}`
    const expiresIn = resToken.data.expires_in // 秒数
    const expiresTime = Date.now() + expiresIn * 1000

    console.log(`获取新ICC_TOKEN成功，有效期至：${new Date(expiresTime).toLocaleString()}`)
    localStorage.setItem('ICC_TOKEN', token)
    localStorage.setItem(STORAGE_EXPIRES_KEY, expiresTime.toString())

    // 设置新的定时器（触发时清除旧数据并重新获取）
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      localStorage.removeItem('ICC_TOKEN')
      localStorage.removeItem(STORAGE_EXPIRES_KEY)
      _fetchPublicKey() // 到期后重新从公钥获取开始
    }, expiresIn * 1000)
  } catch (error) {
    console.log('获取Token失败:', error.message)
    ElMessage.error('获取Token失败，即将重试...')
    // Token获取失败时，仅重试token获取（保留已获取的公钥）
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      _fetchTokenWithPublicKey(publicKey) // 复用之前获取的公钥重新获取token
    }, 1 * 60 * 1000) // 1分钟后重试
  }
}
