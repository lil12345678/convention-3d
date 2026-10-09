import router from '@/router'
import { isLoggedIn } from '@/utils/conventionAuth'

/**
 * AI 指令总线：只执行白名单内的 JSON 指令，把它们翻译成路由跳转或控制面板操作。
 *
 * 指令格式：{ "action": "selectBuilding", "params": { "building": "5号馆" } }
 * 支持单条或数组；数组按顺序执行，前一条失败则停止。
 */

const PAGES = {
  comSituation: { path: '/', title: '综合态势' },
  secSituation: { path: '/SecSituation', title: '安防态势' },
  device: { path: '/device', title: '设备运行' },
  energy: { path: '/energy', title: '能源管理' },
  convention: { path: '/convention', title: '会展信息' },
}

const PAGE_ALIASES = {
  综合态势: 'comSituation',
  首页: 'comSituation',
  安防: 'secSituation',
  安防态势: 'secSituation',
  设备: 'device',
  设备管理: 'device',
  设备运行: 'device',
  能源: 'energy',
  能耗: 'energy',
  能量管理: 'energy',
  能源管理: 'energy',
  会展: 'convention',
  会展信息: 'convention',
}

const BUILDINGS = [
  ...Array.from({ length: 16 }, (_, i) => `${i + 1}号馆`),
  '主登录厅',
  '次登录厅',
  '东登录厅',
]

const FLOORS = { '1F': '1', 恢复: '2', 全部展开: '3' }
const FLOOR_ALIASES = { 1: '1F', '1f': '1F', 一层: '1F', 收起: '恢复', 展开: '全部展开' }

const ROUTES = { route1: 'route1', route2: 'route2', 路线一: 'route1', 路线二: 'route2', 1: 'route1', 2: 'route2' }

/** 控制面板的切换按钮带 400ms 防抖，连续两步之间要等过防抖窗口，否则第二步会被吞掉 */
const STEP_GAP_MS = 450

let sceneController = null
let deviceController = null

/** controlPanel.vue 挂载时注册，卸载时传 null */
export function registerSceneController(controller) {
  sceneController = controller
}

/** devicePanel.vue 挂载时注册，卸载时传 null */
export function registerDeviceController(controller) {
  deviceController = controller
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

class AiCommandError extends Error {}

function fail(message) {
  throw new AiCommandError(message)
}

function pick(map, raw, label) {
  const key = String(raw ?? '').trim()
  const value = map[key] ?? map[key.toLowerCase()]
  if (!value) fail(`${label}不支持：${raw}`)
  return value
}

function normalizeBuilding(raw) {
  const text = String(raw ?? '').trim()
  if (BUILDINGS.includes(text)) return text
  const num = Number(text.replace(/号馆?$/, ''))
  if (Number.isInteger(num) && num >= 1 && num <= 16) return `${num}号馆`
  fail(`没有这个场馆：${raw}`)
}

function normalizeFloor(raw) {
  const text = String(raw ?? '').trim()
  const name = FLOORS[text] ? text : FLOOR_ALIASES[text] || FLOOR_ALIASES[text.toLowerCase()]
  if (!name) fail(`楼层操作不支持：${raw}`)
  return name
}

function requireScene() {
  if (!sceneController) fail('3D 场景还没加载完成，请稍后再试')
  return sceneController
}

function requireDevicePanel() {
  if (!deviceController) fail('设备面板还没加载完成，请稍后再试')
  if (!deviceController.listCategories().length) fail('设备数据还没加载，请稍后再试')
  return deviceController
}

const HANDLERS = {
  async navigate({ page }) {
    const key = PAGES[page] ? page : PAGE_ALIASES[String(page ?? '').trim()]
    if (!key) fail(`没有这个页面：${page}`)
    await router.push(PAGES[key].path)
    return `已切换到${PAGES[key].title}`
  },

  async overview() {
    requireScene().switchTab('总览')
    return '已回到总览视角'
  },

  async showVenueLabels() {
    requireScene().switchTab('场馆')
    return '已显示场馆标签'
  },

  async selectBuilding({ building }) {
    const name = normalizeBuilding(building)
    const scene = requireScene()
    scene.switchTab('分层')
    await sleep(STEP_GAP_MS)
    scene.selectBuilding(name)
    return `已定位到${name}`
  },

  async selectFloor({ floor }) {
    const name = normalizeFloor(floor)
    const scene = requireScene()
    if (!scene.getState().building) fail('请先选择一个场馆，再操作楼层')
    scene.selectFloor(FLOORS[name])
    return `楼层已切换：${name}`
  },

  async toggleHeatmap({ visible = true }) {
    requireScene().switchTab(visible ? '热力图' : '总览')
    return visible ? '已显示人流热力图' : '已关闭人流热力图'
  },

  async startRoam({ route = 'route1' }) {
    const value = pick(ROUTES, route, '漫游路线')
    const scene = requireScene()
    scene.switchTab('漫游')
    await sleep(STEP_GAP_MS)
    scene.selectRoute(value)
    await sleep(STEP_GAP_MS)
    scene.startRoam()
    return `已开始漫游${value === 'route1' ? '路线一' : '路线二'}`
  },

  async stopRoam() {
    requireScene().switchTab('总览')
    return '已停止漫游'
  },

  async openDeviceCategory({ category }) {
    const panel = requireDevicePanel()
    const name = String(category ?? '').trim()
    if (!panel.openCategory(name)) fail(`没有这个设备分类：${category}，可选：${panel.listCategories().join('、')}`)
    return `已打开${panel.getState().category}面板`
  },

  async showDevice({ device }) {
    const panel = requireDevicePanel()
    const name = String(device ?? '').trim()
    if (!panel.selectDevice(name)) fail(`没有这种设备：${device}，可选：${panel.listDevices().join('、')}`)
    return `已显示${name}`
  },
}

/** 给大模型的工具说明，后端拼 system prompt 时可直接复用 */
export const AI_ACTIONS = [
  { action: 'navigate', params: { page: Object.keys(PAGES) }, desc: '切换大屏页面' },
  { action: 'overview', params: {}, desc: '回到总览视角，清除热力图/漫游/分层' },
  { action: 'showVenueLabels', params: {}, desc: '显示所有场馆标签' },
  { action: 'selectBuilding', params: { building: BUILDINGS }, desc: '镜头定位到某个场馆' },
  { action: 'selectFloor', params: { floor: Object.keys(FLOORS) }, desc: '场馆楼层展开/收起，需先 selectBuilding' },
  { action: 'toggleHeatmap', params: { visible: [true, false] }, desc: '显示或关闭人流热力图' },
  { action: 'startRoam', params: { route: ['route1', 'route2'] }, desc: '开始自动漫游' },
  { action: 'stopRoam', params: {}, desc: '停止漫游并回到总览' },
  {
    action: 'openDeviceCategory',
    params: { category: ['监控设备', '安防设备', '楼宇自控', '能效设备'] },
    desc: '打开设备面板的某个分类（分类来自 /api/devices）',
  },
  {
    action: 'showDevice',
    params: { device: '设备类型，如 空调用电、入侵探测器、门禁、电表' },
    desc: '在设备面板选中某类设备，3D 场景显示对应标签',
  },
]

async function executeOne(command) {
  if (!command || typeof command !== 'object' || Array.isArray(command)) {
    fail('指令格式错误，应为 {"action": "...", "params": {...}}')
  }
  const { action, params = {} } = command
  const handler = Object.prototype.hasOwnProperty.call(HANDLERS, action) ? HANDLERS[action] : null
  if (!handler) fail(`不支持的操作：${action}`)
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    fail(`${action} 的 params 必须是对象`)
  }
  return handler(params)
}

/**
 * 执行一条或多条指令。
 * 返回 { ok, results: [{ action, ok, message }] }，不会抛异常，方便直接回显给用户。
 */
export async function executeAiCommands(input) {
  if (!isLoggedIn()) {
    return { ok: false, results: [{ action: null, ok: false, message: '请先登录' }] }
  }
  let commands = input
  if (typeof input === 'string') {
    try {
      commands = JSON.parse(input)
    } catch {
      return { ok: false, results: [{ action: null, ok: false, message: '指令不是合法 JSON' }] }
    }
  }
  const list = Array.isArray(commands) ? commands : [commands]
  const results = []

  for (let i = 0; i < list.length; i += 1) {
    const action = list[i]?.action ?? null
    try {
      const message = await executeOne(list[i])
      results.push({ action, ok: true, message })
    } catch (error) {
      const message = error instanceof AiCommandError ? error.message : `执行失败：${error?.message || error}`
      results.push({ action, ok: false, message })
      return { ok: false, results }
    }
    if (i < list.length - 1) await sleep(STEP_GAP_MS)
  }
  return { ok: true, results }
}

if (import.meta.env.DEV) {
  window.aiCommandBus = { execute: executeAiCommands, actions: AI_ACTIONS }
}
