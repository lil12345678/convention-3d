<template>
  <div v-if="auth.loginVisible" class="login-gate">
    <div class="login-panel">
      <div class="brand">会展数字孪生平台</div>
      <div class="subtitle">请登录后继续访问</div>

      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>账号</span>
          <input
            v-model.trim="form.username"
            type="text"
            autocomplete="username"
            placeholder="请输入账号"
            :disabled="auth.loggingIn"
          />
        </label>

        <label class="field">
          <span>密码</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            :disabled="auth.loggingIn"
          />
        </label>

        <p v-if="auth.loginError" class="error">{{ auth.loginError }}</p>

        <button class="submit" type="submit" :disabled="auth.loggingIn || !canSubmit">
          {{ auth.loggingIn ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

const auth = useAuthStore()
const form = reactive({
  username: '',
  password: '',
})

const canSubmit = computed(() => form.username.length > 0 && form.password.length > 0)

async function onSubmit() {
  if (!canSubmit.value || auth.loggingIn) return
  await auth.login(form)
  if (auth.isAuthenticated) {
    form.password = ''
  }
}

function onUnauthorized(event) {
  auth.requireLogin(event?.detail?.message || '登录已过期，请重新登录')
}

onMounted(() => {
  window.addEventListener('convention:unauthorized', onUnauthorized)
})

onUnmounted(() => {
  window.removeEventListener('convention:unauthorized', onUnauthorized)
})
</script>

<style scoped lang="scss">
.login-gate {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(20, 70, 110, 0.45), transparent 55%),
    radial-gradient(ellipse at 70% 80%, rgba(10, 40, 70, 0.5), transparent 50%),
    rgba(4, 12, 24, 0.92);
  backdrop-filter: blur(6px);
}

.login-panel {
  width: min(420px, 90vw);
  padding: 36px 32px 28px;
  border: 1px solid rgba(120, 180, 220, 0.28);
  background: rgba(8, 22, 40, 0.92);
  color: #e8f3ff;
}

.brand {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.subtitle {
  margin-top: 8px;
  margin-bottom: 28px;
  color: rgba(200, 220, 240, 0.72);
  font-size: 13px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: rgba(210, 230, 245, 0.85);

  input {
    height: 40px;
    padding: 0 12px;
    border: 1px solid rgba(120, 180, 220, 0.35);
    background: rgba(3, 14, 28, 0.9);
    color: #f2f8ff;
    outline: none;

    &:focus {
      border-color: rgba(90, 190, 255, 0.75);
    }

    &:disabled {
      opacity: 0.6;
    }
  }
}

.error {
  margin: 0;
  color: #ff8f8f;
  font-size: 12px;
  line-height: 1.4;
}

.submit {
  margin-top: 8px;
  height: 42px;
  border: none;
  background: #1f8fd8;
  color: #fff;
  font-size: 14px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #2a9fe9;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}
</style>
