import http from './http'

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
/** 非流式对话。模型可能连续查库，超时要比普通接口长。 */
export const postChat = (messages) => http.post('/chat', { messages }, { timeout: 70000 })
