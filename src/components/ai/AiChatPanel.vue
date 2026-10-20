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
          :class="item.role"
        >
          {{ item.content }}
        </div>
        <div v-if="loading" class="bubble assistant loading">正在回复…</div>
      </div>

      <p v-if="errorText" class="ai-chat-error" role="alert">{{ errorText }}</p>

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
import { nextTick, ref, watch } from 'vue'
import { postChat } from '@/api/convention'
import { executeAiCommands } from '@/ai/aiCommandBus'
import { useAuthStore } from '@/store/modules/auth'

const auth = useAuthStore()
const open = ref(false)
const draft = ref('')
const loading = ref(false)
const errorText = ref('')
const messages = ref([])
const listEl = ref(null)
let seq = 0

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

async function ask() {
  errorText.value = ''
  loading.value = true
  await scrollToEnd()
  try {
    const data = await postChat(historyPayload())
    const reply = String(data?.reply || '').trim() || '（没有回复）'
    pushMessage('assistant', reply)
    const commands = Array.isArray(data?.commands) ? data.commands : []
    if (commands.length) {
      const scene = await executeAiCommands(
        commands.map((item) => ({ action: item.action, params: item.params || {} })),
      )
      if (!scene.ok) {
        const failed = scene.results?.find((item) => !item.ok)
        errorText.value = failed?.message || '画面指令执行失败'
      }
    }
  } catch (error) {
    errorText.value = errorMessage(error)
  } finally {
    loading.value = false
    await scrollToEnd()
  }
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
  await ask()
}

watch(
  () => auth.isAuthenticated,
  (loggedIn) => {
    if (loggedIn) return
    messages.value = []
    draft.value = ''
    errorText.value = ''
    loading.value = false
  },
)
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

.ai-chat-error {
  margin: 8px 0 0;
  color: #ffb4a8;
  line-height: 1.4;
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
