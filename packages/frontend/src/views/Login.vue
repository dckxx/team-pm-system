<template>
  <div class="login-page min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-primary-50/40 to-gray-100">
    <Transition name="fade-slide" appear>
      <div class="w-full max-w-md">
        <AppCard class="shadow-dropdown">
          <!-- Logo / App Branding -->
          <div class="text-center mb-8">
            <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
              <i class="fas fa-tasks text-white text-xl" />
            </div>
            <h1 class="text-headline text-gray-800 m-0">团队项目管理系统</h1>
            <p class="text-body text-gray-400 mt-1.5">请登录以继续</p>
          </div>

          <!-- API Error Alert -->
          <Transition name="fade">
            <div
              v-if="error"
              class="flex items-start gap-2.5 px-4 py-3 mb-6 rounded bg-danger-50 border border-danger-200 text-danger-600 text-body"
            >
              <i class="fas fa-exclamation-circle mt-0.5 shrink-0" />
              <span>{{ error }}</span>
            </div>
          </Transition>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">
            <!-- Email -->
            <div>
              <label
                for="login-email"
                class="block text-body text-gray-700 mb-1.5 font-medium"
              >邮箱</label>
              <AppInput
                id="login-email"
                v-model="email"
                type="email"
                placeholder="请输入邮箱"
                :error="errors.email"
                :disabled="submitting"
              />
            </div>

            <!-- Password -->
            <div>
              <label
                for="login-password"
                class="block text-body text-gray-700 mb-1.5 font-medium"
              >密码</label>
              <div class="relative">
                <AppInput
                  id="login-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  :error="errors.password"
                  :disabled="submitting"
                />
                <button
                  type="button"
                  class="absolute right-3 inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none z-10"
                  style="top: 10px;"
                  @click="showPassword = !showPassword"
                  :tabindex="-1"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-base" />
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <AppButton
              variant="primary"
              size="lg"
              :loading="submitting"
              class="w-full"
            >
              登 录
            </AppButton>
          </form>
        </AppCard>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ---------------------------------------------------------------
// If already logged in (e.g. token hydrates before mount), send
// them straight to the dashboard.
// ---------------------------------------------------------------
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace('/dashboard')
  }
})

// ---------------------------------------------------------------
// Form state
// ---------------------------------------------------------------
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const errors = ref<{ email?: string; password?: string }>({})

// ---------------------------------------------------------------
// Validation
// ---------------------------------------------------------------
function clearErrors() {
  errors.value = {}
}

function validate(): boolean {
  clearErrors()
  error.value = null
  let valid = true

  if (!email.value.trim()) {
    errors.value.email = '请输入邮箱地址'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errors.value.email = '邮箱格式不正确'
    valid = false
  }

  if (!password.value) {
    errors.value.password = '请输入密码'
    valid = false
  } else if (password.value.length < 6) {
    errors.value.password = '密码至少需要 6 个字符'
    valid = false
  }

  return valid
}

// ---------------------------------------------------------------
// Submit handler
// ---------------------------------------------------------------
async function handleLogin() {
  if (!validate()) return

  submitting.value = true
  error.value = null

  try {
    await authStore.login(email.value.trim(), password.value)
    await router.push('/dashboard')
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || '登录失败，请检查邮箱和密码'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* --------------------------------------------------------
 * Card mount animation: fade in + slide up
 * -------------------------------------------------------- */
.fade-slide-enter-active {
  animation: fadeSlideIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) both;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --------------------------------------------------------
 * Error alert enter / leave
 * -------------------------------------------------------- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
