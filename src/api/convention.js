import http from './http'
import { getAccessToken } from '@/utils/conventionAuth'

const cache = new Map()

function once(key, request) {
  if (!cache.has(key)) {
    cache.set(
      key,
      request().catch((error) => {
        cache.delete(key)
        throw error
      }),
    )
  }
  return cache.get(key)
}

export function clearConventionCache() {
  cache.clear()
}

/** POST /api/auth/login -> 信封解包后 { access_token, token_type, username? } */
export const login = (data) => http.post('/auth/login', data)

export const fetchHalls = () => once('halls', () => http.get('/halls'))
export const fetchDevices = () => once('devices', () => http.get('/devices'))
export const fetchDeviceCount = () => once('device-count', () => http.get('/devices/count'))
export const fetchExhibitions = () => once('exhibitions', () => http.get('/exhibitions'))
export const fetchExhibitionEvents = () => once('exhibition-events', () => http.get('/exhibition-events'))
export const fetchAlarms = () => once('alarms', () => http.get('/alarms'))
export const fetchWorkOrders = () => once('work-orders', () => http.get('/work-orders'))
export const fetchEnergy = () => once('energy', () => http.get('/energy'))
export const fetchParking = () => once('parking', () => http.get('/parking'))
export const fetchCrowd = () => once('crowd', () => http.get('/crowd'))
export const fetchEmergency = () => once('emergency', () => http.get('/emergency'))
export const fetchHeatmap = (hall) => http.get('/heatmap', { params: { hall } })
export const fetchDeviceBySceneNode = (node) =>
  once(`device-scene:${node}`, () => http.get(`/devices/scene/${encodeURIComponent(node)}`))
export const fetchExhibitorServices = (limit = 20) =>
  once(`exhibitor-services:${limit}`, () => http.get('/exhibitor-services', { params: { limit } }))
export const fetchExhibitorProvinces = () => once('exhibitor-provinces', () => http.get('/exhibitors/province-stats'))
export const fetchCameras = () => once('cameras', () => http.get('/cameras'))
export const fetchWeather = () => http.get('/weather')
/** 交给后端白名单校验。画面指令只回声，查询指令带上数据。 */
export const postSceneCommand = (command) => http.post('/scene/command', command)
// /** 非流式对话。模型可能连续查库，超时要比普通接口长。 */
// export const postChat = (messages) => http.post('/chat', { messages }, { timeout: 70000 })
// -非流式写法

/** 当前用户最近一段会话。刷新页面用它把聊过的话填回来。 */
export const fetchChatSession = () => http.get('/chat/session')

function parseSseBlock(block) {
  let event = 'message'
  const dataLines = []
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
  }
  if (!dataLines.length) return null
  return { event, data: JSON.parse(dataLines.join('')) }
}

/**
 * POST /api/chat/stream。EventSource 只能发 GET，所以用 fetch 读 SSE。
 * onEvent 收到 { event, data }：delta / tool / commands / done / error。
 */
export async function streamChat(messages, onEvent, signal) {
  const token = getAccessToken()
  let response
  try {
    response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ messages }),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    const failed = new Error('无法连接后端，请确认服务已启动')
    failed.cause = error
    throw failed
  }

  if (!response.ok) {
    let message = '对话失败，请重试'
    try {
      const body = await response.json()
      if (typeof body?.msg === 'string' && body.msg) message = body.msg
    } catch {
      message = response.status >= 500 ? '对话服务暂时不可用，请重试' : message
    }
    if (response.status === 401) {
      window.dispatchEvent(
        new CustomEvent('convention:unauthorized', { detail: { message } }),
      )
    }
    throw new Error(message)
  }
  if (!response.body) throw new Error('浏览器不支持流式响应')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''
    for (const block of blocks) {
      const parsed = parseSseBlock(block)
      if (parsed) await onEvent(parsed)
    }
  }
}
