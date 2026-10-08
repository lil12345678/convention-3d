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
