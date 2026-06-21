<template>
  <div class="dashboard space-y-6">
    <!-- ── Header: Greeting + Cycle Time Badge ── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-headline text-gray-800 m-0">{{ greeting }}，{{ userName }}</h1>
        <p class="text-body text-gray-400 mt-1">项目管理概览</p>
      </div>
      <div v-if="stats?.avgCycleTime != null" class="flex items-center gap-2 shrink-0">
        <AppBadge color="primary-500" :count="stats.avgCycleTime">
          <span class="flex items-center gap-1.5 text-body text-gray-600">
            <i class="fas fa-clock text-primary-500"></i>
            平均开发周期
          </span>
        </AppBadge>
        <span class="text-label text-gray-400">天</span>
      </div>
    </div>

    <!-- ── 4 Stat Cards ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="rounded-lg px-5 py-6 flex flex-col items-center text-center transition-shadow duration-300 ease-standard hover:shadow-card-hover"
        :class="card.bg"
      >
        <!-- Loading skeleton -->
        <template v-if="loading">
          <div class="w-10 h-10 rounded-full bg-white/60 animate-pulse mb-3"></div>
          <div class="w-20 h-8 bg-white/60 animate-pulse rounded mb-2"></div>
          <div class="w-14 h-4 bg-white/60 animate-pulse rounded"></div>
        </template>
        <!-- Data -->
        <template v-else>
          <div
            class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3"
          >
            <i class="fas text-base" :class="[card.icon, card.iconColor]"></i>
          </div>
          <span class="text-display text-gray-800 leading-none mb-1">{{ card.count }}</span>
          <span class="text-body font-medium" :class="card.labelColor">{{ card.label }}</span>
        </template>
      </div>
    </div>

    <!-- ── Main Content: My Tasks + Upcoming Sidebar ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- ─── My Tasks (2/3) ─── -->
      <div class="lg:col-span-2">
        <AppCard>
          <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-title text-gray-700 m-0 flex items-center gap-2">
                <i class="fas fa-tasks text-primary-500"></i>
                我的任务
              </h3>
              <span v-if="myTasks.length > 0" class="text-label text-gray-400">
                <AppBadge :count="myTasks.length" color="primary-500" dot />
                共 {{ myTasks.length }} 项
              </span>
            </div>
          </template>

          <!-- Loading -->
          <div v-if="tasksLoading" class="space-y-3 py-1">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4 animate-pulse">
              <div class="w-16 h-5 bg-gray-200 rounded shrink-0"></div>
              <div class="w-20 h-4 bg-gray-200 rounded shrink-0"></div>
              <div class="flex-1 h-4 bg-gray-200 rounded"></div>
              <div class="w-20 h-5 bg-gray-200 rounded shrink-0"></div>
              <div class="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="myTasks.length === 0" class="py-12 text-center">
            <i class="fas fa-inbox text-4xl text-gray-200 mb-3"></i>
            <p class="text-body text-gray-400">暂无分配给你的任务</p>
          </div>

          <!-- Error -->
          <div v-else-if="tasksError" class="py-12 text-center">
            <i class="fas fa-exclamation-triangle text-3xl text-danger-400 mb-3"></i>
            <p class="text-body text-danger-500">{{ tasksError }}</p>
          </div>

          <!-- Task List -->
          <div v-else class="divide-y divide-gray-100 -mt-1">
            <div
              v-for="task in myTasks"
              :key="task.id"
              class="flex items-center gap-4 py-3 transition-colors duration-200 ease-standard rounded hover:bg-gray-50"
            >
              <!-- Priority tag -->
              <AppTag :type="`priority-${task.priority}`" />

              <!-- Code -->
              <span
                class="text-label text-gray-400 font-mono min-w-[80px] whitespace-nowrap shrink-0"
              >
                {{ task.code }}
              </span>

              <!-- Title -->
              <span
                class="flex-1 text-body text-gray-700 truncate min-w-0"
                :title="task.title"
              >
                {{ task.title }}
              </span>

              <!-- Status tag -->
              <AppTag :type="`status-${task.status}`" />

              <!-- Developer avatars -->
              <div class="flex items-center -space-x-1.5 shrink-0">
                <AppAvatar
                  v-for="dev in task.developers"
                  :key="dev.userId"
                  :name="dev.userName"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- ─── Upcoming Launches (1/3 sidebar) ─── -->
      <div class="lg:col-span-1">
        <AppCard>
          <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-title text-gray-700 m-0 flex items-center gap-2">
                <i class="fas fa-rocket text-primary-500"></i>
                即将上线
              </h3>
              <span v-if="upcoming.length > 0" class="text-label text-gray-400">
                {{ upcoming.length }} 项
              </span>
            </div>
          </template>

          <!-- Loading -->
          <div v-if="upcomingLoading" class="space-y-3 py-1">
            <div v-for="i in 3" :key="i" class="flex items-start gap-3 animate-pulse">
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="upcoming.length === 0" class="py-12 text-center">
            <i class="fas fa-calendar-check text-4xl text-gray-200 mb-3"></i>
            <p class="text-body text-gray-400">暂无即将上线项目</p>
          </div>

          <!-- Error -->
          <div v-else-if="upcomingError" class="py-12 text-center">
            <i class="fas fa-exclamation-triangle text-3xl text-danger-400 mb-3"></i>
            <p class="text-body text-danger-500">{{ upcomingError }}</p>
          </div>

          <!-- Upcoming List -->
          <div v-else class="divide-y divide-gray-100 -mt-1">
            <div
              v-for="item in sortedUpcoming"
              :key="item.id"
              class="py-3 transition-colors duration-200 ease-standard"
              :class="[
                item.overdue
                  ? 'bg-danger-50 px-3 -mx-3 rounded'
                  : 'hover:bg-gray-50 px-3 -mx-3 rounded',
              ]"
            >
              <!-- Title row -->
              <div class="flex items-center gap-2 mb-1.5">
                <span class="font-mono text-label text-gray-400 shrink-0">{{ item.code }}</span>
                <span
                  class="text-body text-gray-700 truncate min-w-0"
                  :title="item.title"
                >
                  {{ item.title }}
                </span>
              </div>

              <!-- Meta row -->
              <div class="flex items-center justify-between">
                <AppTag :type="`status-${item.status}`" />
                <span
                  class="text-label whitespace-nowrap flex items-center gap-1"
                  :class="item.overdue ? 'text-danger-500 font-medium' : 'text-gray-400'"
                >
                  <i class="fas fa-calendar-alt text-xs"></i>
                  {{ formatDate(item.plannedLaunch) }}
                </span>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRequirementsStore } from '@/stores/requirements'
import { getDashboardStats } from '@/api/dashboard'
import { getRequirements } from '@/api/requirements'
import type { DashboardStats, Requirement } from '@pm-system/shared'

// ── Stores ──
const authStore = useAuthStore()
const requirementsStore = useRequirementsStore()

// ── State ──
const loading = ref(true)
const stats = ref<DashboardStats | null>(null)
const myTasks = ref<Requirement[]>([])
const tasksLoading = ref(false)
const tasksError = ref('')
const upcomingLoading = ref(true)
const upcomingError = ref('')

// ── Computed: upcoming from store ──
const upcoming = computed(() => requirementsStore.upcoming)

// ── Stat Card Config ──
interface StatCardConfig {
  key: keyof DashboardStats
  label: string
  icon: string
  bg: string
  iconColor: string
  labelColor: string
  count: number
}

const statCards = computed<StatCardConfig[]>(() => {
  const s = stats.value
  return [
    {
      key: 'totalRequirements',
      label: '总需求数',
      icon: 'fa-tachometer-alt',
      bg: 'bg-primary-50',
      iconColor: 'text-primary-500',
      labelColor: 'text-primary-600',
      count: s?.totalRequirements ?? 0,
    },
    {
      key: 'pendingReview',
      label: '待评审',
      icon: 'fa-tasks',
      bg: 'bg-warning-50',
      iconColor: 'text-warning-500',
      labelColor: 'text-warning-600',
      count: s?.pendingReview ?? 0,
    },
    {
      key: 'developing',
      label: '开发中',
      icon: 'fa-spinner',
      bg: 'bg-primary-50',
      iconColor: 'text-primary-500',
      labelColor: 'text-primary-600',
      count: s?.developing ?? 0,
    },
    {
      key: 'launched',
      label: '已上线',
      icon: 'fa-check-circle',
      bg: 'bg-success-50',
      iconColor: 'text-success-500',
      labelColor: 'text-success-600',
      count: s?.launched ?? 0,
    },
  ]
})

// ── Computed ──
const userName = computed(() => authStore.user?.name ?? '用户')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const sortedUpcoming = computed(() => {
  return [...upcoming.value].sort((a, b) => {
    // Overdue items first, then sort by planned launch date ascending
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
    return (
      new Date(a.plannedLaunch).getTime() -
      new Date(b.plannedLaunch).getTime()
    )
  })
})

// Priority weight: lower = higher priority
const PRIORITY_WEIGHT: Record<string, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
}

// ── Helpers ──
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function isUserAssigned(req: Requirement): boolean {
  if (!authStore.user) return false
  return req.developers.some((d) => d.userId === authStore.user!.id)
}

// ── Data Fetching ──
async function fetchStats() {
  loading.value = true
  try {
    stats.value = await getDashboardStats()
  } catch (err: any) {
    console.error('Failed to fetch dashboard stats:', err)
    stats.value = null
  } finally {
    loading.value = false
  }
}

async function fetchUpcomingData() {
  upcomingLoading.value = true
  upcomingError.value = ''
  try {
    await requirementsStore.fetchUpcoming()
  } catch (err: any) {
    console.error('Failed to fetch upcoming:', err)
    upcomingError.value = err?.message || '加载即将上线数据失败'
  } finally {
    upcomingLoading.value = false
  }
}

async function fetchMyTasks() {
  tasksLoading.value = true
  tasksError.value = ''
  try {
    const allRequirements = await getRequirements()
    // Filter: only requirements where current user is assigned as a developer
    const filtered = allRequirements.filter(isUserAssigned)
    // Sort by priority (P0 first)
    filtered.sort(
      (a, b) =>
        (PRIORITY_WEIGHT[a.priority] ?? 99) -
        (PRIORITY_WEIGHT[b.priority] ?? 99),
    )
    myTasks.value = filtered
  } catch (err: any) {
    console.error('Failed to fetch my tasks:', err)
    tasksError.value = err?.message || '加载任务失败'
    myTasks.value = []
  } finally {
    tasksLoading.value = false
  }
}

// ── Lifecycle ──
onMounted(async () => {
  await Promise.all([fetchStats(), fetchUpcomingData(), fetchMyTasks()])
})
</script>
