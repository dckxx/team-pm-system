<template>
  <div class="reports-page space-y-6">
    <!-- ── Header ── -->
    <div class="flex items-center justify-between">
      <h1 class="text-headline text-gray-800 m-0 flex items-center gap-3">
        <i class="fas fa-chart-pie text-primary-500"></i>
        统计报表
      </h1>
    </div>

    <!-- ── Loading State ── -->
    <template v-if="loading">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard>
          <div class="flex flex-col items-center gap-6 py-6">
            <div class="w-40 h-40 rounded-full bg-gray-100 animate-pulse"></div>
            <div class="w-full space-y-3">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-sm bg-gray-100 animate-pulse shrink-0"></div>
                <div class="h-4 bg-gray-100 rounded animate-pulse flex-1"></div>
                <div class="w-8 h-4 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </AppCard>
        <AppCard>
          <div class="flex flex-col items-center gap-6 py-6">
            <div class="w-40 h-40 rounded-full bg-gray-100 animate-pulse"></div>
            <div class="w-full space-y-3">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-sm bg-gray-100 animate-pulse shrink-0"></div>
                <div class="h-4 bg-gray-100 rounded animate-pulse flex-1"></div>
                <div class="w-8 h-4 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
      <AppCard>
        <div class="space-y-4 py-4">
          <div class="flex items-end gap-6 h-40">
            <div v-for="i in 7" :key="i" class="flex-1 flex flex-col items-center gap-2">
              <div
                class="w-full bg-gray-100 animate-pulse rounded-t"
                :style="{ height: `${20 + Math.random() * 60}px` }"
              ></div>
              <div class="w-12 h-3 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div class="flex justify-center gap-6">
            <div class="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
            <div class="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </AppCard>
    </template>

    <!-- ── Charts ── -->
    <template v-else>
      <!-- Row 1: Status + Priority Pie Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ═══ Status Distribution ═══ -->
        <AppCard>
          <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-title text-gray-700 m-0 flex items-center gap-2">
                <i class="fas fa-tag text-primary-400 text-sm"></i>
                需求状态分布
              </h3>
              <span class="text-label text-gray-400">
                总计 <span class="tabular-nums font-medium text-gray-500">{{ statusTotal }}</span>
              </span>
            </div>
          </template>

          <div v-if="statusDistribution.length === 0" class="py-12 text-center">
            <i class="fas fa-chart-pie text-4xl text-gray-200 mb-3"></i>
            <p class="text-body text-gray-400">暂无状态分布数据</p>
          </div>
          <div v-else ref="statusChartRef" class="w-full h-[300px]"></div>
        </AppCard>

        <!-- ═══ Priority Distribution ═══ -->
        <AppCard>
          <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-title text-gray-700 m-0 flex items-center gap-2">
                <i class="fas fa-flag text-warning-400 text-sm"></i>
                优先级分布
              </h3>
              <span class="text-label text-gray-400">
                总计 <span class="tabular-nums font-medium text-gray-500">{{ priorityTotal }}</span>
              </span>
            </div>
          </template>

          <div v-if="priorityDistribution.length === 0" class="py-12 text-center">
            <i class="fas fa-chart-pie text-4xl text-gray-200 mb-3"></i>
            <p class="text-body text-gray-400">暂无优先级分布数据</p>
          </div>
          <div v-else ref="priorityChartRef" class="w-full h-[300px]"></div>
        </AppCard>
      </div>

      <!-- ═══ Trend Line Chart ═══ -->
      <AppCard>
        <template #title>
          <div class="flex items-center justify-between">
            <h3 class="text-title text-gray-700 m-0 flex items-center gap-2">
              <i class="fas fa-chart-line text-success-400 text-sm"></i>
              新增与上线趋势
            </h3>
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1.5 text-label text-gray-400">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color:#165DFF"></span>
                创建数
              </span>
              <span class="flex items-center gap-1.5 text-label text-gray-400">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color:#00B42A"></span>
                上线数
              </span>
            </div>
          </div>
        </template>

        <div v-if="trend.length === 0" class="py-12 text-center">
          <i class="fas fa-chart-line text-4xl text-gray-200 mb-3"></i>
          <p class="text-body text-gray-400">暂无趋势数据</p>
        </div>
        <div v-else ref="trendChartRef" class="w-full h-[350px]"></div>
      </AppCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  getStatusDistribution,
  getPriorityDistribution,
  getTrend,
} from '@/api/reports'
import type { ChartDataItem, ChartTrendItem } from '@pm-system/shared'

// ── Label Maps ──
const STATUS_LABEL: Record<string, string> = {
  pending_review: '待评审',
  developing: '开发中',
  testing: '测试中',
  launched: '已上线',
}

const PRIORITY_LABEL: Record<string, string> = {
  P0: 'P0 · 紧急',
  P1: 'P1 · 高',
  P2: 'P2 · 中',
  P3: 'P3 · 低',
}

function statusLabel(name: string): string {
  return STATUS_LABEL[name] || name
}

function priorityLabel(name: string): string {
  return PRIORITY_LABEL[name] || name
}

// ── State ──
const loading = ref(true)
const statusDistribution = ref<ChartDataItem[]>([])
const priorityDistribution = ref<ChartDataItem[]>([])
const trend = ref<ChartTrendItem[]>([])

// ── Template refs for chart containers ──
const statusChartRef = ref<HTMLDivElement | null>(null)
const priorityChartRef = ref<HTMLDivElement | null>(null)
const trendChartRef = ref<HTMLDivElement | null>(null)

// ── ECharts instances ──
let statusChart: echarts.ECharts | null = null
let priorityChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// ── Totals ──
const statusTotal = computed(() =>
  statusDistribution.value.reduce((s, i) => s + i.value, 0)
)
const priorityTotal = computed(() =>
  priorityDistribution.value.reduce((s, i) => s + i.value, 0)
)

// ── Design Tokens ──
const COLORS = {
  primary: '#165DFF',
  success: '#00B42A',
  warning: '#FF7D00',
  danger: '#F53F3F',
  amber: '#F7BA1E',
  gray: '#86909C',
}

// ── Status color mapping (matches status tag colors from T25) ──
const STATUS_COLORS: Record<string, string> = {
  pending_review: COLORS.warning,
  developing: COLORS.primary,
  testing: COLORS.amber,
  launched: COLORS.success,
}

// ── Priority color mapping ──
const PRIORITY_COLORS: Record<string, string> = {
  P0: COLORS.danger,
  P1: COLORS.warning,
  P2: COLORS.primary,
  P3: COLORS.gray,
}

// ── Format date for trend x-axis ──
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  if (parts.length >= 2) {
    const month = parseInt(parts[1], 10)
    if (parts.length >= 3) {
      return `${month}/${parseInt(parts[2], 10)}`
    }
    return `${month}月`
  }
  return dateStr
}

// ── ECharts Initialization ──

function buildStatusOption(): echarts.EChartsOption {
  const items = statusDistribution.value
  const total = statusTotal.value

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return `${p.name}<br/>数量: <strong>${p.value}</strong> (${p.percent?.toFixed?.(1) ?? Math.round((p.value / total) * 100)}%)`
      },
    },
    color: items.map((i) => STATUS_COLORS[i.name] || i.color),
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
          },
        },
        data: items.map((i) => ({
          name: statusLabel(i.name),
          value: i.value,
        })),
      },
    ],
  }
}

function buildPriorityOption(): echarts.EChartsOption {
  const items = priorityDistribution.value
  const total = priorityTotal.value

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number; percent: number }
        return `${p.name}<br/>数量: <strong>${p.value}</strong> (${p.percent?.toFixed?.(1) ?? Math.round((p.value / total) * 100)}%)`
      },
    },
    color: items.map((i) => PRIORITY_COLORS[i.name] || i.color),
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
          },
        },
        data: items.map((i) => ({
          name: priorityLabel(i.name),
          value: i.value,
        })),
      },
    ],
  }
}

function buildTrendOption(): echarts.EChartsOption {
  const items = trend.value

  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['创建数', '上线数'],
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
        color: '#86909C',
      },
    },
    grid: {
      left: 45,
      right: 20,
      top: 10,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: items.map((i) => formatDate(i.date)),
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisTick: { alignWithLabel: true },
      axisLabel: {
        color: '#86909C',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#F2F3F5', type: 'dashed' as const } },
      axisLabel: {
        color: '#86909C',
        fontSize: 11,
      },
    },
    series: [
      {
        name: '创建数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 2.5, color: COLORS.primary },
        itemStyle: { color: COLORS.primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 93, 255, 0.15)' },
            { offset: 1, color: 'rgba(22, 93, 255, 0.02)' },
          ]),
        },
        data: items.map((i) => i.created),
      },
      {
        name: '上线数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 2.5, color: COLORS.success },
        itemStyle: { color: COLORS.success },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 180, 42, 0.12)' },
            { offset: 1, color: 'rgba(0, 180, 42, 0.02)' },
          ]),
        },
        data: items.map((i) => i.launched),
      },
    ],
  }
}

function initCharts() {
  // Dispose existing instances
  disposeCharts()

  // Status pie
  if (statusChartRef.value && statusDistribution.value.length > 0) {
    statusChart = echarts.init(statusChartRef.value)
    statusChart.setOption(buildStatusOption())
  }

  // Priority pie
  if (priorityChartRef.value && priorityDistribution.value.length > 0) {
    priorityChart = echarts.init(priorityChartRef.value)
    priorityChart.setOption(buildPriorityOption())
  }

  // Trend line
  if (trendChartRef.value && trend.value.length > 0) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption(buildTrendOption())
  }
}

function disposeCharts() {
  statusChart?.dispose()
  statusChart = null
  priorityChart?.dispose()
  priorityChart = null
  trendChart?.dispose()
  trendChart = null
}

function resizeCharts() {
  statusChart?.resize()
  priorityChart?.resize()
  trendChart?.resize()
}

// ── Data Fetching ──
async function fetchData() {
  loading.value = true
  try {
    const [status, priority, trendData] = await Promise.all([
      getStatusDistribution(),
      getPriorityDistribution(),
      getTrend(),
    ])
    statusDistribution.value = status
    priorityDistribution.value = priority
    trend.value = trendData
  } catch (err) {
    console.error('Failed to fetch report data:', err)
    statusDistribution.value = []
    priorityDistribution.value = []
    trend.value = []
  } finally {
    loading.value = false
  }
}

// ── Lifecycle ──
onMounted(async () => {
  await fetchData()
  // Charts need the v-else DOM to be rendered, so nextTick after loading=false
  await nextTick()
  initCharts()

  // Register resize handler
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  disposeCharts()
  window.removeEventListener('resize', resizeCharts)
})

</script>

<style scoped>
/* ── Loading skeleton animation ── */
:deep(.animate-pulse) {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
</style>
