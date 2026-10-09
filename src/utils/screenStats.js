import {
  fetchAlarms,
  fetchCrowd,
  fetchDeviceCount,
  fetchDevices,
  fetchEmergency,
  fetchEnergy,
  fetchExhibitionEvents,
  fetchExhibitions,
  fetchHalls,
  fetchParking,
  fetchWorkOrders,
} from '@/api/convention'

export function formatInt(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '--'
  return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function percent(part, total) {
  if (!total) return 0
  return Math.round((Number(part) / Number(total)) * 100)
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function monthKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

function changeRate(current, previous) {
  if (!previous) return { value: '--', up: false, down: false }
  const value = Math.round(((current - previous) / previous) * 100)
  return { value, up: value >= 0, down: value < 0 }
}

function sumBy(list, pick) {
  return list.reduce((total, item) => total + Number(pick(item) || 0), 0)
}

export function applyChart(chart, labels, dataList) {
  if (!chart) return
  chart.setOption({
    xAxis: { data: labels },
    yAxis: { max: null, min: 0 },
    series: dataList.map((data) => ({ data })),
  })
}

export function timeBuckets(mode) {
  const labels = []
  const keys = []
  const now = new Date()
  if (mode === '年') {
    const year = now.getFullYear()
    for (let offset = 2; offset >= 0; offset -= 1) {
      const value = String(year - offset)
      labels.push(value)
      keys.push(value)
    }
  } else if (mode === '日') {
    for (let offset = 8; offset >= 0; offset -= 1) {
      const date = new Date(now)
      date.setDate(now.getDate() - offset)
      const key = dateKey(date)
      labels.push(key.slice(5))
      keys.push(key)
    }
  } else {
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      labels.push(`${date.getMonth() + 1}月`)
      keys.push(monthKey(date))
    }
  }
  return { labels, keys }
}

export function countBuckets(items, timeField, mode, predicate = () => true) {
  const { labels, keys } = timeBuckets(mode)
  const values = keys.map((key) =>
    items.filter((item) => predicate(item) && String(item[timeField] || '').startsWith(key)).length,
  )
  return { labels, values }
}

function levelShare(items, field, names) {
  const total = items.length
  return names.map((name) => {
    const count = items.filter((item) => item[field] === name).length
    return { name, count, percentage: percent(count, total) }
  })
}

export async function getHallOverview() {
  const [halls, exhibitions] = await Promise.all([fetchHalls(), fetchExhibitions()])
  const now = new Date()
  const year = now.getFullYear()
  const lastYear = year - 1
  const exhibitHalls = halls.filter((item) => item.hall_type === '展馆')
  const loginHalls = halls.filter((item) => item.hall_type === '登录厅')
  const exhibitArea = sumBy(exhibitHalls, (item) => item.area_sqm)
  const loginArea = sumBy(loginHalls, (item) => item.area_sqm)
  const thisYear = exhibitions.filter((item) => item.year === year)
  const prevYear = exhibitions.filter((item) => item.year === lastYear)
  const thisVisitors = sumBy(thisYear, (item) => item.visitors)
  const prevVisitors = sumBy(prevYear, (item) => item.visitors)
  return {
    areaRate: percent(exhibitArea, exhibitArea + loginArea),
    exhibitText: `${exhibitHalls.length} / ${formatInt(exhibitArea)}㎡`,
    loginText: `${loginHalls.length} / ${formatInt(loginArea)}㎡`,
    ongoing: exhibitions.filter((item) => item.status === '进行中').length,
    finished: exhibitions.filter((item) => item.status === '已结束').length,
    upcoming: exhibitions.filter((item) => item.status === '未开始').length,
    meetingRate: percent(
      exhibitions.filter((item) => item.status === '进行中').length,
      exhibitions.length,
    ),
    totalCount: formatInt(exhibitions.length),
    yearCount: formatInt(thisYear.length),
    totalVisitors: formatInt(sumBy(exhibitions, (item) => item.visitors)),
    yearVisitors: formatInt(thisVisitors),
    countRate: changeRate(thisYear.length, prevYear.length),
    visitorRate: changeRate(thisVisitors, prevVisitors),
  }
}

export async function getExhibitions() {
  return fetchExhibitions()
}

export async function getExhibitionEvents() {
  return fetchExhibitionEvents()
}

export async function getParking() {
  return fetchParking()
}

export async function getCrowd() {
  return fetchCrowd()
}

export async function getHalls() {
  return fetchHalls()
}

export async function getDevices() {
  return fetchDevices()
}

export function summarizeDevices(devices, leafType) {
  const rows = devices.filter((item) => item.leaf_type === leafType)
  const count = (status) => rows.filter((item) => item.status === status).length
  return {
    total: rows.length,
    online: count('在线'),
    offline: count('离线'),
    fault: count('故障'),
    halls: [...new Set(rows.map((item) => item.hall_name))],
  }
}

function energyOf(readings, kind) {
  const now = new Date()
  const year = String(now.getFullYear())
  const currentMonth = monthKey(now)
  const previousMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const lastYearMonth = `${now.getFullYear() - 1}-${pad(now.getMonth() + 1)}`
  const today = dateKey(now)
  const yesterdayDate = new Date(now)
  yesterdayDate.setDate(now.getDate() - 1)
  const yesterday = dateKey(yesterdayDate)
  const months = readings
    .filter((item) => item.kind === kind && item.period === '月')
    .slice()
    .sort((a, b) => a.period_key.localeCompare(b.period_key))
  const days = readings
    .filter((item) => item.kind === kind && item.period === '日')
    .slice()
    .sort((a, b) => a.period_key.localeCompare(b.period_key))
  const pick = (rows, key) => rows.find((item) => item.period_key === key)?.value || 0
  const monthSum = pick(months, currentMonth)
  const todayRow = days.find((item) => item.period_key === today)
  const latestDay = days[days.length - 1]
  const previousDay = days[days.length - 2]
  const daySum = todayRow ? todayRow.value : latestDay?.value || 0
  const yearSum = months
    .filter((item) => item.period_key.startsWith(year))
    .reduce((total, item) => total + item.value, 0)
  return {
    unit: months[0]?.unit || days[0]?.unit || '',
    yearSum,
    monthSum,
    daySum,
    yearText: formatInt(yearSum),
    monthText: formatInt(monthSum),
    dayText: formatInt(daySum),
    yoy: changeRate(monthSum, pick(months, lastYearMonth)),
    mom: changeRate(monthSum, pick(months, previousMonth)),
    dayMom: todayRow
      ? changeRate(daySum, pick(days, yesterday))
      : changeRate(latestDay?.value || 0, previousDay?.value || 0),
    monthLabels: months.map((item) => `${Number(item.period_key.slice(5))}月`),
    monthValues: months.map((item) => item.value),
    dayLabels: days.map((item) => item.period_key.slice(5)),
    dayValues: days.map((item) => item.value),
    months,
  }
}

export async function getEnergyMap() {
  const readings = await fetchEnergy()
  return {
    电: energyOf(readings, '电'),
    水: energyOf(readings, '水'),
    readings,
  }
}

export async function getAlarmView() {
  const alarms = await fetchAlarms()
  const levels = levelShare(alarms, 'alarm_level', ['一般', '重要', '严重'])
  const statuses = levelShare(alarms, 'alarm_status', ['未处理', '处理中', '已处理'])
  const typeCount = {}
  alarms.forEach((item) => {
    typeCount[item.alarm_type] = (typeCount[item.alarm_type] || 0) + 1
  })
  const byType = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage: percent(count, alarms.length),
    }))
  return {
    alarms,
    total: alarms.length,
    totalText: formatInt(alarms.length),
    levels,
    statuses,
    handledRate: percent(statuses.find((item) => item.name === '已处理')?.count || 0, alarms.length),
    byType,
    day: countBuckets(alarms, 'alarm_time', '日'),
    month: countBuckets(alarms, 'alarm_time', '月'),
    year: countBuckets(alarms, 'alarm_time', '年'),
    pending: statuses.find((item) => item.name === '未处理')?.count || 0,
  }
}

export async function getWorkOrderView() {
  const orders = await fetchWorkOrders()
  const today = dateKey(new Date())
  const statuses = levelShare(orders, 'status', ['待处理', '处理中', '已处理'])
  const types = levelShare(orders, 'order_type', ['维修工单', '报事工单', '投诉工单'])
  const overdue = orders.filter((item) => item.overdue)
  return {
    orders,
    total: orders.length,
    totalText: formatInt(orders.length),
    today: orders.filter((item) => String(item.created_at).startsWith(today)).length,
    todayText: formatInt(orders.filter((item) => String(item.created_at).startsWith(today)).length),
    overdue: overdue.length,
    statuses,
    types,
    completion: percent(statuses.find((item) => item.name === '已处理')?.count || 0, orders.length),
    day: countBuckets(orders, 'created_at', '日'),
    month: countBuckets(orders, 'created_at', '月'),
    typeDay: ['维修工单', '报事工单', '投诉工单'].map((type) =>
      countBuckets(orders, 'created_at', '日', (item) => item.order_type === type),
    ),
    typeMonth: ['维修工单', '报事工单', '投诉工单'].map((type) =>
      countBuckets(orders, 'created_at', '月', (item) => item.order_type === type),
    ),
    overdueTop: overdue.slice(0, 5).map((item, index) => ({
      num: index + 1,
      name: item.level,
      value: item.order_type,
      time: item.created_at,
      status: item.status,
      color: ['#DD1D4E', '#FFAF28', '#00D0FF', '#AFFFCC', '#fff'][index],
    })),
  }
}

const GROUP_ORDER = ['弱电设备', '暖通设备', '消防设备', '电气设备', '给排水设备']
const STATUS_META = [
  { label: '在线', color: '#17fcff', type: 'one' },
  { label: '离线', color: '#807E6F', type: 'two' },
  { label: '故障', color: '#feb817', type: 'three' },
]

export async function getDeviceView() {
  const [devices, counts] = await Promise.all([fetchDevices(), fetchDeviceCount()])
  const total = devices.length
  const groups = GROUP_ORDER.map((label) => ({
    label,
    num: devices.filter((item) => item.group_name === label).length,
  }))
  const status = STATUS_META.map((item) => {
    const count = counts[item.label] || 0
    return { ...item, count, percentage: percent(count, total) }
  })
  const security = devices.filter((item) => item.category === 'security')
  const securityStatus = STATUS_META.map((item) => {
    const count = security.filter((device) => device.status === item.label).length
    return {
      label: item.label,
      color: item.color,
      type: item.label === '在线' ? 'normal' : item.label === '离线' ? 'warning' : 'danger',
      count,
      percentage: percent(count, security.length),
    }
  })
  return { devices, total, totalText: formatInt(total), groups, status, security, securityStatus }
}

export async function getEmergencyView() {
  const records = await fetchEmergency()
  const overview = {}
  records
    .filter((item) => item.record_type === '概况')
    .forEach((item) => {
      overview[item.name] = item.value
    })
  const names = ['公共卫生', '自然灾害', '社会安全', '事故灾害', '其它']
  const months = timeBuckets('月')
  const series = names.map((name) =>
    months.keys.map(
      (key) =>
        records.find(
          (item) => item.record_type === '事件' && item.name === name && item.period_key === key,
        )?.value || 0,
    ),
  )
  return { overview, labels: months.labels, series }
}

export async function getEnergyAlarmView() {
  const [devices, alarms] = await Promise.all([fetchDevices(), fetchAlarms()])
  const meters = devices.filter((item) => item.category === 'energy')
  const electricIds = new Set(meters.filter((item) => item.leaf_type === '电表').map((item) => item.id))
  const waterIds = new Set(meters.filter((item) => item.leaf_type === '水表').map((item) => item.id))
  const electric = alarms.filter((item) => electricIds.has(item.device_id))
  const water = alarms.filter((item) => waterIds.has(item.device_id))
  const total = electric.length + water.length
  return {
    electric: electric.length,
    water: water.length,
    levels: levelShare([...electric, ...water], 'alarm_level', ['一般', '重要', '严重']).map((item, index) => ({
      name: item.name,
      percentage: total ? item.percentage : 0,
      color: ['#00B4FF', '#FFB800', '#FF4D4F'][index],
    })),
    day: countBuckets([...electric, ...water], 'alarm_time', '日'),
    month: countBuckets([...electric, ...water], 'alarm_time', '月'),
  }
}

export function filterBySource(orders, source) {
  return orders.filter((item) => item.source === source)
}

export function exhibitionByMonth(exhibitions) {
  const buckets = timeBuckets('月')
  const counts = buckets.keys.map(
    (key) => exhibitions.filter((item) => `${item.year}-${pad(item.month)}` === key).length,
  )
  const visitors = buckets.keys.map((key) =>
    sumBy(
      exhibitions.filter((item) => `${item.year}-${pad(item.month)}` === key),
      (item) => item.visitors,
    ),
  )
  return { labels: buckets.labels, counts, visitors }
}
