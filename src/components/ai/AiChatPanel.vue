<template>
  <section class="ai-chat" :class="{ open }">
    <button class="ai-chat-toggle" type="button" @click="open = !open">
      会展助手
    </button>

    <div v-show="open" class="ai-chat-panel">
      <header class="ai-chat-head">
        <span>会展助手</span>
        <button class="text-btn" type="button" @click="open = false">收起</button>
      </header>

      <div ref="listEl" class="ai-chat-list" role="log" aria-live="polite">
        <p v-if="!messages.length" class="hint">可以问告警、用电，或说「切到5号馆」。</p>
        <div
          v-for="item in messages"
          :key="item.id"
          class="bubble"
          :class="[item.role, { caret: loading && item.id === streamingId }]"
        >
          {{ item.content }}
        </div>
        <div v-if="loading && streamingId === 0" class="bubble assistant loading">
          {{ statusText || '正在回复…' }}
        </div>
      </div>

      <p v-if="errorText" class="ai-chat-error" role="alert">{{ errorText }}</p>

      <div class="ai-chat-chips">
        <button
          v-for="item in quickQuestions"
          :key="item"
          class="chip"
          type="button"
          :disabled="loading"
          @click="askQuick(item)"
        >
          {{ item }}
        </button>
      </div>

      <form class="ai-chat-form" @submit.prevent="send">
        <textarea
          v-model="draft"
          rows="2"
          maxlength="2000"
          placeholder="输入问题，Enter 发送"
          :disabled="loading"
          @keydown.enter.exact.prevent="send"
        />
        <button class="send" type="submit" :disabled="loading || !draft.trim()">
          {{ loading ? '发送中' : '发送' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
// import { postChat } from '@/api/convention'
// -非流式写法
import { fetchChatSession, streamChat } from '@/api/convention'
import { executeAiCommands } from '@/ai/aiCommandBus'
import { useAuthStore } from '@/store/modules/auth'

const auth = useAuthStore()
const quickQuestions = ['看看告警', '今天的告警', '看看用电', '切到5号馆']
const open = ref(false)
const draft = ref('')
const loading = ref(false)
const statusText = ref('')
const streamingId = ref(0)
const errorText = ref('')
const messages = ref([])
const listEl = ref(null)
let seq = 0
let streamAbort = null

function pushMessage(role, content) {
  messages.value.push({ id: ++seq, role, content })
}

async function scrollToEnd() {
  await nextTick()
  const el = listEl.value
  if (el) el.scrollTop = el.scrollHeight
}

function historyPayload() {
  return messages.value
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .slice(-20)
    .map((item) => ({ role: item.role, content: item.content }))
}

function errorMessage(error) {
  if (error?.code === 'ECONNABORTED') return '对话超时，请重试'
  const message = error?.message || ''
  if (!message || message === 'Network Error') return '无法连接后端，请确认服务已启动'
  if (/^Request failed with status code \d+$/.test(message)) return '对话服务暂时不可用，请重试'
  return message
}

// async function ask() {
//   errorText.value = ''
//   loading.value = true
//   await scrollToEnd()
//   try {
//     const data = await postChat(historyPayload())
//     const reply = String(data?.reply || '').trim() || '（没有回复）'
//     pushMessage('assistant', reply)
//     const commands = Array.isArray(data?.commands) ? data.commands : []
//     if (commands.length) {
//       const scene = await executeAiCommands(
//         commands.map((item) => ({ action: item.action, params: item.params || {} })),
//       )
//       if (!scene.ok) {
//         const failed = scene.results?.find((item) => !item.ok)
//         errorText.value = failed?.message || '画面指令执行失败'
//       }
//     }
//   } catch (error) {
//     errorText.value = errorMessage(error)
//   } finally {
//     loading.value = false
//     await scrollToEnd()
//   }
// }
// -非流式写法

async function runStreamCommands(commands) {
  if (!Array.isArray(commands) || !commands.length) return
  const scene = await executeAiCommands(
    commands.map((item) => ({ action: item.action, params: item.params || {} })),
  )
  if (!scene.ok) {
    const failed = scene.results?.find((item) => !item.ok)
    errorText.value = failed?.message || '画面指令执行失败'
  }
}

const STREAM_STATUS = {
  query_alarms: '正在查询告警',
  query_energy: '正在查询能耗',
  query_devices: '正在查询设备',
  query_hall: '正在查询场馆',
  navigate: '正在准备切换页面',
  selectBuilding: '正在准备切换场馆',
  selectFloor: '正在准备切换楼层',
  toggleHeatmap: '正在准备热力图',
  openDeviceCategory: '正在准备设备分类',
  showDevice: '正在准备设备标签',
  overview: '正在准备总览',
  showVenueLabels: '正在准备场馆标签',
}

async function askStream() {
  const history = historyPayload()
  errorText.value = ''
  statusText.value = '正在理解问题…'
  streamingId.value = 0
  loading.value = true
  streamAbort = new AbortController()
  await scrollToEnd()
  let assistant = null
  try {
    await streamChat(history, async ({ event, data }) => {
      if (event === 'tool') {
        statusText.value = STREAM_STATUS[data?.name] || '正在查询'
        await scrollToEnd()
        return
      }
      if (event === 'delta') {
        if (!assistant) {
          messages.value.push({ id: ++seq, role: 'assistant', content: '' })
          assistant = messages.value[messages.value.length - 1]
          streamingId.value = assistant.id
        }
        assistant.content += data?.text || ''
        await scrollToEnd()
        return
      }
      if (event === 'commands') {
        await runStreamCommands(data?.commands)
        return
      }
      if (event === 'error') {
        throw new Error(data?.message || '对话失败，请重试')
      }
      if (event === 'done' && assistant && !assistant.content.trim()) {
        assistant.content = String(data?.reply || '').trim() || '（没有回复）'
      }
    }, streamAbort.signal)
    if (assistant && !assistant.content.trim()) assistant.content = '（没有回复）'
  } catch (error) {
    if (error?.name === 'AbortError') return
    if (assistant && !assistant.content.trim()) {
      messages.value = messages.value.filter((item) => item.id !== assistant.id)
    }
    errorText.value = errorMessage(error)
  } finally {
    loading.value = false
    statusText.value = ''
    streamingId.value = 0
    streamAbort = null
    await scrollToEnd()
  }
}

async function loadSession() {
  if (!auth.isAuthenticated || loading.value) return
  try {
    const data = await fetchChatSession()
    const saved = Array.isArray(data?.messages) ? data.messages : []
    messages.value = saved.map((item) => ({
      id: item.id,
      role: item.role,
      content: item.content,
    }))
    seq = saved.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
    await scrollToEnd()
  } catch (error) {
    errorText.value = errorMessage(error)
  }
}

function askQuick(text) {
  if (loading.value) return
  draft.value = text
  send()
}

async function send() {
  const text = draft.value.trim()
  if (!text || loading.value) return
  if (!auth.isAuthenticated) {
    errorText.value = '请先登录'
    return
  }
  draft.value = ''
  pushMessage('user', text)
  await askStream()
}

watch(
  () => auth.isAuthenticated,
  (loggedIn) => {
    if (!loggedIn) {
      streamAbort?.abort()
      messages.value = []
      draft.value = ''
      errorText.value = ''
      statusText.value = ''
      streamingId.value = 0
      loading.value = false
      return
    }
    loadSession()
  },
)

onMounted(() => {
  if (auth.isAuthenticated) loadSession()
})
</script>

<style lang="scss" scoped>
.ai-chat {
  position: absolute;
  right: 990px;
  bottom: 24px;
  z-index: 30;
  width: 560px;
  color: #fff;
  font-size: 16px;
}

.ai-chat button,
.ai-chat textarea {
  font-size: 16px;
  font-family: inherit;
}

.ai-chat-toggle {
  margin-left: auto;
  display: block;
  border: 1px solid rgba(64, 158, 255, 0.7);
  background: rgba(9, 104, 170, 0.85);
  color: #fff;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
}

.ai-chat.open .ai-chat-toggle {
  display: none;
}

.ai-chat-panel {
  background: rgba(6, 24, 48, 0.88);
  border: 1px solid rgba(64, 158, 255, 0.45);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  padding: 12px;
}

.ai-chat-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 18px;
}

.text-btn,
.send {
  border: 1px solid rgba(64, 158, 255, 0.5);
  background: transparent;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.text-btn {
  padding: 4px 10px;
}

.ai-chat-list {
  height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
}

.bubble {
  max-width: 86%;
  padding: 8px 12px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.bubble.user {
  align-self: flex-end;
  background: rgba(64, 158, 255, 0.35);
}

.bubble.assistant {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.08);
}

.bubble.loading {
  color: rgba(255, 255, 255, 0.75);
}

.bubble.caret::after {
  content: '▍';
  margin-left: 2px;
  animation: caret-blink 1s step-end infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

.ai-chat-error {
  margin: 8px 0 0;
  color: #ffb4a8;
  line-height: 1.4;
}

.ai-chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.chip {
  border: 1px solid rgba(64, 158, 255, 0.5);
  background: rgba(64, 158, 255, 0.16);
  color: #fff;
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
}

.chip:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ai-chat-form {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

textarea {
  flex: 1;
  resize: none;
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.35);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  padding: 8px;
  font: inherit;
}

.send {
  padding: 0 16px;
  background: rgba(64, 158, 255, 0.35);
}

.send:disabled,
textarea:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
