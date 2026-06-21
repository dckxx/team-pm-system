<template>
  <div class="kanban-page h-full flex flex-col">
    <!-- ── Header ── -->
    <div class="kanban-header flex-shrink-0 flex items-center justify-between px-6 py-4">
      <h1 class="text-heading text-gray-900 m-0 flex items-center gap-3">
        <i class="fas fa-columns text-primary-500"></i>
        看板视图
      </h1>
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="view-toggle flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
            :class="viewMode === 'status'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            @click="viewMode = 'status'"
          >
            <i class="fas fa-list mr-1.5"></i>
            按状态
          </button>
          <button
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
            :class="viewMode === 'developer'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            @click="viewMode = 'developer'"
          >
            <i class="fas fa-user mr-1.5"></i>
            按负责人
          </button>
        </div>
        <AppButton size="sm" variant="ghost" @click="refresh" :loading="loading">
          <i class="fas fa-sync-alt mr-1.5" :class="{ 'fa-spin': loading }"></i>
          刷新
        </AppButton>
      </div>
    </div>

    <!-- ── Initial Loading State ── -->
    <div
      v-if="loading && !store.requirements.length"
      class="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400"
    >
      <i class="fas fa-spinner fa-spin text-3xl text-primary-400"></i>
      <p class="text-body">加载看板数据...</p>
    </div>

    <!-- ── Empty State ── -->
    <div
      v-else-if="!store.requirements.length"
      class="flex-1 flex flex-col items-center justify-center gap-3"
    >
      <i class="fas fa-clipboard-list text-5xl text-gray-200"></i>
      <p class="text-body text-gray-400">暂无需求</p>
      <p class="text-caption text-gray-300">创建需求后将在此显示</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- ── MOBILE: BY STATUS LIST VIEW (<768px) ── -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div v-else-if="isMobile && viewMode === 'status'" class="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
      <div v-for="col in localColumns" :key="col.status">
        <div class="flex items-center gap-2 px-1 py-3">
          <span class="w-2.5 h-2.5 rounded-full" :class="statusStyles[col.status].dotColor"></span>
          <span class="text-label font-medium" :class="statusStyles[col.status].headerText">
            {{ STATUS_LABELS[col.status] }}
          </span>
          <span class="text-caption text-gray-300">({{ col.items.length }})</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="req in col.items"
            :key="req.id"
            class="bg-white rounded-lg border border-gray-100 p-3 cursor-pointer hover:shadow-sm transition-shadow"
            @click="handleCardClick(req, col.status)"
          >
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <AppTag :type="`priority-${req.priority}`" />
                  <span class="text-caption text-gray-400 font-mono">{{ req.code }}</span>
                </div>
                <h4 class="text-body font-medium text-gray-800 leading-snug line-clamp-2 mb-1">{{ req.title }}</h4>
                <div v-if="req.plannedLaunch" class="flex items-center gap-1.5 text-caption text-gray-400">
                  <i class="fas fa-calendar-alt text-gray-300 text-xs"></i>
                  <span>{{ formatDate(req.plannedLaunch) }}</span>
                </div>
              </div>
              <i class="fas fa-chevron-right text-gray-300 mt-2 shrink-0"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- ── DESKTOP: BY STATUS VIEW (with vuedraggable) ── -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div v-else-if="viewMode === 'status'" class="kanban-board flex-1 overflow-x-auto px-6 pb-6">
      <div class="flex gap-5 h-full min-h-0">
        <div
          v-for="(col, colIndex) in localColumns"
          :key="col.status"
          class="kanban-column flex flex-col flex-shrink-0 w-72 rounded-lg overflow-hidden shadow-sm"
        >
          <!-- Column Header -->
          <div class="flex-shrink-0" :class="statusStyles[col.status].headerBg">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-label font-medium" :class="statusStyles[col.status].headerText">
                <i class="fas fa-circle text-[8px] mr-2 opacity-60" :class="statusStyles[col.status].textColor"></i>
                {{ STATUS_LABELS[col.status] }}
              </span>
              <AppBadge :count="col.items.length" :color="statusStyles[col.status].badgeColor" />
            </div>
          </div>

          <!-- Column Body (scrollable, with vuedraggable) -->
          <div
            class="column-body flex-1 overflow-y-auto p-3 transition-colors duration-150"
            :class="statusStyles[col.status].bodyBg"
          >
            <draggable
              v-model="localColumns[colIndex].items"
              group="status"
              item-key="id"
              :sort="false"
              ghost-class="kanban-ghost"
              @start="onDragStart($event, col.status)"
              @change="onDragChange($event, col.status)"
              @end="onDragEnd"
            >
              <template #item="{ element: req }">
                <div
                  class="kanban-card bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200 ease-standard mb-3"
                  :class="{
                    'cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5': canDrag(req),
                    'cursor-pointer': !canDrag(req),
                  }"
                  @click="handleCardClick(req, col.status)"
                >
                  <div class="relative pl-3" :style="{ borderLeft: `4px solid ${priorityBorderColors[req.priority]}` }">
                    <div class="px-3 pt-3 pb-3">
                      <!-- Top row: priority + code -->
                      <div class="flex items-center gap-2 mb-2">
                        <AppTag :type="`priority-${req.priority}`" />
                        <span class="text-caption text-gray-400 font-mono">{{ req.code }}</span>
                      </div>

                      <!-- Title -->
                      <h4 class="text-title font-medium text-gray-800 mb-2 leading-snug line-clamp-2">
                        {{ req.title }}
                      </h4>

                      <!-- Developer avatars (max 3 shown) -->
                      <div v-if="req.developers?.length" class="flex items-center gap-1 mb-1.5">
                        <div class="flex -space-x-1.5">
                          <AppAvatar
                            v-for="dev in req.developers.slice(0, 3)"
                            :key="dev.id"
                            :name="dev.userName"
                            size="sm"
                            class="border-2 border-white rounded-full"
                          />
                        </div>
                        <span v-if="req.developers.length > 3" class="text-caption text-gray-400 ml-1">
                          +{{ req.developers.length - 3 }}
                        </span>
                      </div>

                      <!-- Planned launch date -->
                      <div v-if="req.plannedLaunch" class="flex items-center gap-1.5 text-caption text-gray-500">
                        <i class="fas fa-calendar-alt text-gray-400 text-xs"></i>
                        <span>{{ formatDate(req.plannedLaunch) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template #footer>
                <!-- Column empty state (inside draggable footer) -->
                <div
                  v-if="localColumns[colIndex].items.length === 0"
                  class="flex flex-col items-center justify-center py-8 text-gray-300 select-none"
                >
                  <i class="fas fa-inbox text-2xl mb-2"></i>
                  <span class="text-caption">拖拽需求到此列</span>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- ── MOBILE: BY DEVELOPER LIST VIEW (<768px) ── -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div v-else-if="isMobile" class="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
      <div v-for="col in developerColumns" :key="col.userId">
        <div class="flex items-center gap-3 px-1 py-2">
          <AppAvatar :name="col.userName" size="sm" />
          <span class="text-body font-semibold text-gray-700">{{ col.userName }}</span>
          <span class="text-caption text-gray-400">({{ col.items.length }})</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="req in col.items"
            :key="req.id"
            class="bg-white rounded-lg border border-gray-100 p-3 cursor-pointer hover:shadow-sm transition-shadow"
            @click="handleCardClick(req, req.status)"
          >
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <AppTag :type="`priority-${req.priority}`" />
                  <AppTag :type="`status-${req.status}`" />
                  <span class="text-caption text-gray-400 font-mono">{{ req.code }}</span>
                </div>
                <h4 class="text-body font-medium text-gray-800 leading-snug line-clamp-2">{{ req.title }}</h4>
              </div>
              <i class="fas fa-chevron-right text-gray-300 mt-2 shrink-0"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- ── DESKTOP: BY DEVELOPER VIEW ── -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div v-else class="kanban-board flex-1 overflow-x-auto px-6 pb-6">
      <div class="flex gap-5 h-full min-h-0">
        <div
          v-for="col in developerColumns"
          :key="col.userId"
          class="kanban-column flex flex-col flex-shrink-0 w-72 rounded-lg overflow-hidden shadow-sm border border-gray-200"
        >
          <!-- Developer Column Header -->
          <div class="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3">
            <div class="flex items-center gap-3">
              <AppAvatar :name="col.userName" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-label font-medium text-gray-700 truncate m-0">{{ col.userName }}</p>
              </div>
              <AppBadge :count="col.items.length" color="gray-500" />
            </div>
          </div>

          <!-- Column Body -->
          <div class="column-body flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/60">
            <template v-for="statusGroup in col.statusGroups" :key="statusGroup.status">
              <div v-if="statusGroup.items.length" class="space-y-2">
                <div class="flex items-center gap-2 px-1 pt-1">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="statusStyles[statusGroup.status].dotColor"
                  ></span>
                  <span class="text-caption text-gray-400 font-medium">
                    {{ STATUS_LABELS[statusGroup.status] }}
                  </span>
                  <span class="text-caption text-gray-300">({{ statusGroup.items.length }})</span>
                </div>
                <div
                  v-for="req in statusGroup.items"
                  :key="req.id"
                  class="kanban-card bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200 ease-standard cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                  @click="handleCardClick(req, req.status)"
                >
                  <div
                    class="relative pl-3"
                    :style="{ borderLeft: `4px solid ${priorityBorderColors[req.priority]}` }"
                  >
                    <div class="px-3 pt-3 pb-3">
                      <!-- Top row: priority + code -->
                      <div class="flex items-center gap-2 mb-2">
                        <AppTag :type="`priority-${req.priority}`" />
                        <span class="text-caption text-gray-400 font-mono">{{ req.code }}</span>
                      </div>
                      <!-- Title -->
                      <h4 class="text-title font-medium text-gray-800 mb-2 leading-snug line-clamp-2">
                        {{ req.title }}
                      </h4>
                      <!-- Planned launch date -->
                      <div
                        v-if="req.plannedLaunch"
                        class="flex items-center gap-1.5 text-caption text-gray-500"
                      >
                        <i class="fas fa-calendar-alt text-gray-400 text-xs"></i>
                        <span>{{ formatDate(req.plannedLaunch) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Empty state -->
            <div
              v-if="!col.items.length"
              class="flex flex-col items-center justify-center py-8 text-gray-300"
            >
              <i class="fas fa-inbox text-2xl mb-2"></i>
              <span class="text-caption">暂无</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- ── TRANSITION CONFIRMATION MODAL (AppModal) ── -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <AppModal
      :visible="showTransitionModal"
      title="确认状态变更"
      @update:visible="closeTransitionModal"
    >
      <div class="space-y-4">
        <p class="text-body text-gray-700 leading-relaxed m-0">
          确认将需求
          <span class="font-semibold text-gray-900">「{{ transitionReq?.title }}」</span>
        </p>
        <div class="flex items-center gap-2">
          <AppTag v-if="transitionReq" :type="`status-${transitionReq.status}`" />
          <i class="fas fa-arrow-right text-sm text-gray-400"></i>
          <AppTag
            v-if="transitionTargetStatus"
            :type="`status-${transitionTargetStatus}`"
          />
        </div>

        <!-- RBAC/validation notice -->
        <div
          v-if="validationError"
          class="flex items-start gap-2.5 p-3 rounded-lg bg-danger-50 text-danger-600 text-sm"
        >
          <i class="fas fa-shield-alt mt-0.5"></i>
          <span>{{ validationError }}</span>
        </div>

        <!-- Version (optimistic locking) -->
        <div class="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-caption text-gray-500">
          <i class="fas fa-tag"></i>
          <span>当前版本:</span>
          <code class="font-mono font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded">
            {{ transitionReq?.version }}
          </code>
        </div>

        <!-- Comment -->
        <div>
          <label class="text-label text-gray-600 mb-1.5 block">备注 (选填)</label>
          <textarea
            v-model="transitionComment"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-body resize-none outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10"
            rows="3"
            placeholder="请输入备注信息..."
            :disabled="transitionSubmitting"
          ></textarea>
        </div>

        <!-- Error message from API -->
        <p v-if="transitionError" class="text-sm text-danger-500 m-0 flex items-center gap-1.5">
          <i class="fas fa-exclamation-circle"></i>
          {{ transitionError }}
        </p>
      </div>

      <template #footer>
        <AppButton variant="secondary" @click="closeTransitionModal" :disabled="transitionSubmitting">
          取消
        </AppButton>
        <AppButton variant="primary" @click="confirmTransition" :loading="transitionSubmitting">
          确认变更
        </AppButton>
      </template>
    </AppModal>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- ── MOBILE STATUS SELECTOR ── -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <AppModal
      :visible="showMobileSelector"
      title="变更状态"
      @update:visible="showMobileSelector = false"
    >
      <div class="space-y-3">
        <p class="text-body text-gray-700 m-0">
          为「{{ mobileReq?.title }}」选择目标状态
        </p>
        <div class="space-y-2">
          <button
            v-for="t in mobileTransitions"
            :key="t.toStatus"
            class="w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left"
            :class="selectedMobileTarget === t.toStatus
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
            @click="selectedMobileTarget = t.toStatus"
          >
            <AppTag :type="`status-${t.toStatus}`" />
            <span class="text-body text-gray-600">{{ t.label }}</span>
          </button>
        </div>
        <p
          v-if="mobileTransitions.length === 0"
          class="text-body text-gray-400 text-center py-4"
        >
          当前状态无可用的状态变更
        </p>
      </div>

      <template #footer>
        <AppButton variant="secondary" @click="showMobileSelector = false">取消</AppButton>
        <AppButton
          variant="primary"
          @click="proceedMobileTransition"
          :disabled="!selectedMobileTarget"
        >
          下一步
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'
import { useRequirementsStore } from '@/stores/requirements'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import {
  RequirementStatus,
  Priority,
  UserRole,
  STATUS_LABELS,
  STATUS_FLOW,
} from '@pm-system/shared'
import type {
  Requirement,
  StatusFlowItem,
} from '@pm-system/shared'

// ─── Stores ─────────────────────────────────────────────────
const store = useRequirementsStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

/* ─────────────── STATE ─────────────── */

/** Current view mode */
const viewMode = ref<'status' | 'developer'>('status')

/** Whether the viewport is below 768px (mobile breakpoint) */
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

/* ── vuedraggable state ── */

/** Local column data synced from store for vuedraggable v-model binding */
interface ColumnData {
  status: RequirementStatus
  items: Requirement[]
}
const localColumns = ref<ColumnData[]>([])

/** Tracks the element being dragged and its source column (set in @start) */
const dragContext = ref<{ element: Requirement; fromStatus: RequirementStatus } | null>(null)

/** Pending move awaiting user confirmation */
const pendingMove = ref<{
  element: Requirement
  fromStatus: RequirementStatus
  toStatus: RequirementStatus
} | null>(null)

/**
 * Sync local columns from the store's requirements.
 * Called on init, after store changes, and on cancel/revert.
 */
function syncLocalColumns() {
  const order: RequirementStatus[] = [
    RequirementStatus.PENDING_REVIEW,
    RequirementStatus.DEVELOPING,
    RequirementStatus.TESTING,
    RequirementStatus.LAUNCHED,
  ]
  localColumns.value = order.map((status) => ({
    status,
    items: [...store.requirements.filter((r) => r.status === status)],
  }))
}

/* Transition modal state */
const showTransitionModal = ref(false)
const transitionReq = ref<Requirement | null>(null)
const transitionTargetStatus = ref<RequirementStatus | null>(null)
const transitionComment = ref('')
const transitionSubmitting = ref(false)
const transitionError = ref('')
const validationError = ref('')

/* Mobile selector state */
const showMobileSelector = ref(false)
const mobileReq = ref<Requirement | null>(null)
const selectedMobileTarget = ref<string | null>(null)

/* ─────────────── COMPUTED ─────────────── */

const loading = computed(() => store.loading)

/**
 * Keep local columns in sync with store requirements.
 * This ensures that after API mutations (create/update/transition) the
 * kanban board reflects the latest server state.
 */
watch(
  () => store.requirements,
  () => {
    // Only auto-sync when the modal is NOT open — while the modal is open
    // the user is deciding, and we must not revert their local placement.
    if (!showTransitionModal.value) {
      syncLocalColumns()
    }
  },
  { deep: true },
)

/**
 * Columns grouped by developer.
 * Each requirement may appear in multiple columns (one per assigned developer).
 * Unassigned requirements go to an "Unassigned" column.
 * Within each column, items are sub-grouped by status.
 */
interface DeveloperColumn {
  userId: string
  userName: string
  items: Requirement[]
  statusGroups: { status: RequirementStatus; items: Requirement[] }[]
}

const developerColumns = computed<DeveloperColumn[]>(() => {
  // Collect all unique developers
  const devMap = new Map<string, { userName: string; items: Requirement[] }>()

  // Track unassigned items
  const unassignedItems: Requirement[] = []

  for (const req of store.requirements) {
    if (req.developers && req.developers.length > 0) {
      // Deduplicate developer entries (same requirement assigned to same dev multiple times)
      const seen = new Set<string>()
      for (const dev of req.developers) {
        if (seen.has(dev.userId)) continue
        seen.add(dev.userId)
        if (!devMap.has(dev.userId)) {
          devMap.set(dev.userId, { userName: dev.userName, items: [] })
        }
        devMap.get(dev.userId)!.items.push(req)
      }
    } else {
      unassignedItems.push(req)
    }
  }

  const columns: DeveloperColumn[] = []

  // Build each developer column with status sub-groups
  const statusOrder: RequirementStatus[] = [
    RequirementStatus.PENDING_REVIEW,
    RequirementStatus.DEVELOPING,
    RequirementStatus.TESTING,
    RequirementStatus.LAUNCHED,
  ]

  for (const [userId, { userName, items }] of devMap) {
    const statusGroups = statusOrder.map((s) => ({
      status: s,
      items: items.filter((r) => r.status === s),
    }))
    columns.push({ userId, userName, items, statusGroups })
  }

  // Sort columns by name
  columns.sort((a, b) => a.userName.localeCompare(b.userName, 'zh-CN'))

  // Add "Unassigned" column at the end
  if (unassignedItems.length > 0) {
    const statusGroups = statusOrder.map((s) => ({
      status: s,
      items: unassignedItems.filter((r) => r.status === s),
    }))
    columns.push({
      userId: '__unassigned__',
      userName: '未分配',
      items: unassignedItems,
      statusGroups,
    })
  }

  return columns
})

/**
 * Available transitions for the mobile-selected requirement.
 */
const mobileTransitions = computed<StatusFlowItem[]>(() => {
  if (!mobileReq.value) return []
  return getValidTransitions(mobileReq.value)
})

/* ─────────────── STYLE MAPS ─────────────── */

interface StatusStyle {
  headerBg: string
  headerText: string
  bodyBg: string
  textColor: string
  badgeColor: string
  dotColor: string
}

const statusStyles: Record<string, StatusStyle> = {
  [RequirementStatus.PENDING_REVIEW]: {
    headerBg: 'bg-amber-50',
    headerText: 'text-amber-700',
    bodyBg: 'bg-amber-50/40',
    textColor: 'text-amber-500',
    badgeColor: 'warning-500',
    dotColor: 'bg-amber-500',
  },
  [RequirementStatus.DEVELOPING]: {
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-700',
    bodyBg: 'bg-blue-50/40',
    textColor: 'text-blue-500',
    badgeColor: 'primary-500',
    dotColor: 'bg-blue-500',
  },
  [RequirementStatus.TESTING]: {
    headerBg: 'bg-yellow-50',
    headerText: 'text-yellow-700',
    bodyBg: 'bg-yellow-50/40',
    textColor: 'text-yellow-500',
    badgeColor: 'warning-500',
    dotColor: 'bg-yellow-500',
  },
  [RequirementStatus.LAUNCHED]: {
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-700',
    bodyBg: 'bg-emerald-50/40',
    textColor: 'text-emerald-500',
    badgeColor: 'success-500',
    dotColor: 'bg-emerald-500',
  },
}

/** Priority → left-border color */
const priorityBorderColors: Record<string, string> = {
  [Priority.P0]: '#ef4444',
  [Priority.P1]: '#f97316',
  [Priority.P2]: '#3b82f6',
  [Priority.P3]: '#9ca3af',
}

/* ─────────────── DRAG & DROP (vuedraggable) ─────────────── */

/**
 * vuedraggable @start — record which element is being dragged and from which column.
 */
function onDragStart(evt: any, sourceStatus: RequirementStatus) {
  if (evt.oldIndex === undefined) return
  const col = localColumns.value.find((c) => c.status === sourceStatus)
  if (!col) return
  const element = col.items[evt.oldIndex]
  if (element) {
    dragContext.value = { element, fromStatus: sourceStatus }
  }
}

/**
 * vuedraggable @change — called after the array has already been mutated.
 * - `added`: item was inserted into this column (cross-column drag)
 * - `removed`: item was removed from this column (we ignore this — source handled by vuedraggable)
 * - `moved`: reorder within same column (should not fire because :sort="false")
 *
 * Flow:
 * 1. vuedraggable updates localColumns → card moves visually (immediate feedback)
 * 2. We validate the transition + RBAC
 * 3. If invalid: revert (syncLocalColumns) + toast
 * 4. If valid: show confirmation modal
 * 5. On cancel: revert (syncLocalColumns)
 * 6. On confirm: call API → on success syncLocalColumns, on failure revert
 */
function onDragChange(evt: any, targetStatus: RequirementStatus) {
  if (evt.added) {
    const element = evt.added.element as Requirement
    if (!dragContext.value || dragContext.value.element.id !== element.id) return

    const fromStatus = dragContext.value.fromStatus

    // Same column drop (shouldn't happen with :sort="false") — revert silently
    if (fromStatus === targetStatus) {
      syncLocalColumns()
      dragContext.value = null
      return
    }

    const req = element

    // Validate transition via STATUS_FLOW
    const flowItem = getValidTransitions(req).find(
      (t) => t.toStatus === targetStatus,
    )
    if (!flowItem) {
      uiStore.showToast(
        'error',
        `不允许从「${STATUS_LABELS[fromStatus]}」到「${STATUS_LABELS[targetStatus]}」的状态变更`,
      )
      syncLocalColumns()
      dragContext.value = null
      return
    }

    // RBAC check
    if (!checkRBAC(flowItem, req)) {
      uiStore.showToast('error', '您没有执行此操作的权限')
      syncLocalColumns()
      dragContext.value = null
      return
    }

    // Everything valid → record pending move and show confirmation modal
    pendingMove.value = { element: req, fromStatus, toStatus: targetStatus }
    transitionReq.value = req
    transitionTargetStatus.value = targetStatus
    transitionComment.value = ''
    transitionError.value = ''
    validationError.value = ''
    showTransitionModal.value = true
    dragContext.value = null
  }
}

/**
 * vuedraggable @end — cleanup drag context.
 */
function onDragEnd() {
  dragContext.value = null
}

/* ─────────────── RBAC / VALIDATION ─────────────── */

/**
 * Check whether the current user has permission for a given transition.
 */
function checkRBAC(flowItem: StatusFlowItem, req: Requirement): boolean {
  const userRole = authStore.user?.role

  // Check required role
  if (flowItem.requiredRole === UserRole.PM && userRole !== UserRole.PM) {
    return false
  }
  if (flowItem.requiredRole === UserRole.DEV && userRole !== UserRole.DEV && userRole !== UserRole.PM) {
    // PMs can also perform dev actions (PMs are admins)
    return false
  }

  // If transition requires the user to be a developer on this requirement
  if (flowItem.requireDeveloper && userRole === UserRole.DEV) {
    const currentUserId = authStore.user?.id
    const isAssigned = req.developers?.some((d) => d.userId === currentUserId)
    if (!isAssigned) return false
  }

  return true
}

/**
 * Get the validation/RBAC error message for a given transition.
 */
function getTransitionRBACError(flowItem: StatusFlowItem, req: Requirement): string | null {
  const userRole = authStore.user?.role

  if (flowItem.requiredRole === UserRole.PM && userRole !== UserRole.PM) {
    return '此状态变更需要项目经理权限'
  }
  if (flowItem.requiredRole === UserRole.DEV && userRole !== UserRole.DEV && userRole !== UserRole.PM) {
    return '此状态变更需要开发人员权限'
  }
  if (flowItem.requireDeveloper && userRole === UserRole.DEV) {
    const currentUserId = authStore.user?.id
    const isAssigned = req.developers?.some((d) => d.userId === currentUserId)
    if (!isAssigned) return '您不是该需求的开发人员，无法执行此操作'
  }

  return null
}

/**
 * Whether the current user can drag this card.
 * A card is not draggable when its status has no valid outgoing transitions
 * (e.g., LAUNCHED is terminal).
 */
function canDrag(req: Requirement): boolean {
  const transitions = getValidTransitions(req)
  if (transitions.length === 0) return false
  // Check if user has permission for at least one transition
  return transitions.some((t) => checkRBAC(t, req))
}

/* ─────────────── CARD CLICK (MOBILE / FALLBACK) ─────────────── */

function handleCardClick(req: Requirement, _colStatus: string) {
  const transitions = getValidTransitions(req)
  if (transitions.length === 0) return

  // Filter transitions user has permission for
  const allowed = transitions.filter((t) => checkRBAC(t, req))
  if (allowed.length === 0) {
    uiStore.showToast('error', '您没有可用的状态变更操作')
    return
  }

  // Show mobile selector
  mobileReq.value = req
  selectedMobileTarget.value = null
  showMobileSelector.value = true
}

function proceedMobileTransition() {
  if (!mobileReq.value || !selectedMobileTarget.value) return

  const flowItem = getValidTransitions(mobileReq.value).find(
    (t) => t.toStatus === selectedMobileTarget.value,
  )
  if (!flowItem) return

  // Validate RBAC for the selected transition
  const rbacError = getTransitionRBACError(flowItem, mobileReq.value)
  if (rbacError) {
    uiStore.showToast('error', rbacError)
    showMobileSelector.value = false
    mobileReq.value = null
    selectedMobileTarget.value = null
    return
  }

  // Show confirmation modal
  transitionReq.value = mobileReq.value
  transitionTargetStatus.value = selectedMobileTarget.value as RequirementStatus
  transitionComment.value = ''
  transitionError.value = ''
  validationError.value = ''
  showTransitionModal.value = true

  // Close mobile selector
  showMobileSelector.value = false
  mobileReq.value = null
  selectedMobileTarget.value = null
}

/* ─────────────── TRANSITION MODAL ─────────────── */

function getValidTransitions(req: Requirement): StatusFlowItem[] {
  return STATUS_FLOW[req.status as RequirementStatus] || []
}

function closeTransitionModal() {
  showTransitionModal.value = false
  // Revert local columns — card snaps back to original position
  syncLocalColumns()
  transitionReq.value = null
  transitionTargetStatus.value = null
  transitionComment.value = ''
  transitionSubmitting.value = false
  transitionError.value = ''
  validationError.value = ''
  pendingMove.value = null
}

async function confirmTransition() {
  if (!transitionReq.value || !transitionTargetStatus.value) return

  // Re-validate RBAC before submitting
  const req = transitionReq.value
  const flowItem = getValidTransitions(req).find(
    (t) => t.toStatus === transitionTargetStatus.value,
  )
  if (!flowItem) {
    validationError.value = '此状态变更不被允许'
    return
  }

  const rbacErr = getTransitionRBACError(flowItem, req)
  if (rbacErr) {
    validationError.value = rbacErr
    return
  }

  transitionSubmitting.value = true
  transitionError.value = ''
  validationError.value = ''

  try {
    await store.transitionStatus(req.id, {
      toStatus: transitionTargetStatus.value,
      comment: transitionComment.value.trim() || undefined,
    })
    closeTransitionModal()
    // Resync local columns to match updated store
    syncLocalColumns()
    uiStore.showToast('success', '状态变更成功')
  } catch (err: any) {
    const message = err?.message || '状态变更失败，请重试'
    // Detect 409 version conflict
    if (message.includes('版本') || message.includes('409') || message.includes('conflict') || message.includes('version')) {
      transitionError.value = '版本冲突：该需求已被其他人修改，请刷新后重试'
    } else {
      transitionError.value = message
    }
    // Revert local columns to store state on failure
    syncLocalColumns()
  } finally {
    transitionSubmitting.value = false
  }
}

/* ─────────────── REFRESH ─────────────── */

async function refresh() {
  try {
    await store.fetchRequirements()
  } catch {
    uiStore.showToast('error', '刷新失败，请重试')
  }
}

/* ─────────────── HELPERS ─────────────── */

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/* ─────────────── LIFECYCLE ─────────────── */

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  syncLocalColumns()
  try {
    await store.fetchRequirements()
    syncLocalColumns()
  } catch {
    // fetchRequirements handles its own error state
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* ── Custom scrollbar for column body ── */
.column-body::-webkit-scrollbar {
  width: 4px;
}
.column-body::-webkit-scrollbar-track {
  background: transparent;
}
.column-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
}
.column-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* ── Kanban board horizontal scroll ── */
.kanban-board {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
}
.kanban-board::-webkit-scrollbar {
  height: 6px;
}
.kanban-board::-webkit-scrollbar-track {
  background: transparent;
}
.kanban-board::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}
.kanban-board::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* ── Line clamp for title ── */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── vuedraggable ghost class (placeholder while dragging) ── */
.kanban-ghost {
  opacity: 0.4;
  background: #f0f5ff !important;
  border: 2px dashed #165dff !important;
  border-radius: 8px;
  box-shadow: none !important;
  transform: scale(0.98);
  transition: all 0.15s ease;
}

/* ── Prevent text selection during drag ── */
.kanban-page {
  user-select: none;
}
</style>
