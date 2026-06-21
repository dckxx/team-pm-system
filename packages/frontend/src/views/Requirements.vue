<template>
  <div class="requirements-page space-y-6">
    <!-- ── Header ── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-heading text-gray-900 m-0">
        <i class="fas fa-clipboard-list text-primary-500 mr-3"></i>
        需求管理
      </h1>
      <div class="flex items-center gap-3">
        <AppButton
          variant="secondary"
          size="md"
          :loading="store.loading"
          @click="handleExportCSV"
        >
          <i class="fas fa-download mr-1.5"></i>
          导出CSV
        </AppButton>
        <AppButton variant="primary" size="md" @click="openCreateModal">
          <i class="fas fa-plus mr-1.5"></i>
          创建需求
        </AppButton>
      </div>
    </div>

    <!-- ── Filter Bar ── -->
    <AppCard>
      <template #title>
        <div class="flex items-center justify-between">
          <h3 class="text-title text-gray-700 m-0 flex items-center gap-2">
            <i class="fas fa-filter text-gray-400 text-sm"></i>
            筛选条件
          </h3>
          <button
            class="inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 transition-colors"
            type="button"
            @click="filterExpanded = !filterExpanded"
          >
            <i
              class="fas fa-chevron-down transition-transform duration-200"
              :class="{ 'rotate-180': filterExpanded }"
            ></i>
            {{ filterExpanded ? '收起' : '展开' }}
          </button>
        </div>
      </template>

      <Transition name="fade-slide">
        <div v-show="filterExpanded" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AppSelect
            label="项目"
            :model-value="filters.projectId ?? ''"
            @update:model-value="onFilterChange('projectId', $event || null)"
            :options="projectOptions"
            placeholder="全部项目"
          />
          <AppSelect
            label="状态"
            :model-value="filters.status ?? ''"
            @update:model-value="onFilterChange('status', $event || null)"
            :options="statusOptions"
            placeholder="全部状态"
          />
          <AppSelect
            label="优先级"
            :model-value="filters.priority ?? ''"
            @update:model-value="onFilterChange('priority', $event || null)"
            :options="priorityOptions"
            placeholder="全部优先级"
          />
          <div>
            <label class="block text-body text-gray-700 mb-1.5 font-medium">关键词</label>
            <AppInput
              v-model="searchText"
              placeholder="搜索标题 / 编号..."
            />
          </div>
          <div class="flex items-end">
            <AppButton variant="secondary" size="md" @click="resetFilters">
              <i class="fas fa-undo-alt mr-1"></i>
              重置
            </AppButton>
          </div>
        </div>
      </Transition>
    </AppCard>

    <!-- ── Table ── -->
    <AppCard>
      <AppTable
        :columns="tableColumns"
        :data="tableData"
        :loading="store.loading"
        empty-text="暂无匹配需求"
      >
        <template #cell-status="{ row }">
          <AppTag :color="statusColor(row.status)">{{ STATUS_LABELS[row.status as RequirementStatus] }}</AppTag>
        </template>
        <template #cell-priority="{ row }">
          <AppTag :color="priorityColor(row.priority)">{{ PRIORITY_LABELS[row.priority as Priority] }}</AppTag>
        </template>
        <template #cell-plannedLaunch="{ row }">
          <span class="text-gray-600">{{ row.plannedLaunch || '-' }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1 justify-center" @click.stop>
            <AppButton
              variant="ghost"
              size="sm"
              title="查看详情"
              @click="openDetail(row._raw)"
            >
              <i class="fas fa-eye"></i>
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              title="编辑"
              @click="openEditModal(row._raw)"
            >
              <i class="fas fa-edit"></i>
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              title="删除"
              @click="handleDelete(row._raw)"
            >
              <i class="fas fa-trash-alt text-danger-500"></i>
            </AppButton>
          </div>
        </template>
      </AppTable>

      <!-- ── Empty State (when no filters applied but no data) ── -->
      <div
        v-if="!store.loading && store.requirements.length === 0"
        class="py-12 text-center"
      >
        <i class="fas fa-inbox text-4xl text-gray-200 mb-3 block"></i>
        <p class="text-body text-gray-400">暂无匹配需求</p>
        <p class="text-sm text-gray-300 mt-1">点击上方「创建需求」按钮开始添加</p>
      </div>

      <!-- ── Pagination ── -->
      <div
        v-if="store.filteredRequirements.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-3"
      >
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>共 {{ store.filteredRequirements.length }} 条</span>
          <span class="text-gray-300">|</span>
          <span>每页</span>
          <AppSelect
            :model-value="String(filters.pageSize)"
            @update:model-value="onPageSizeChange"
            :options="pageSizeOptions"
            class="!w-20"
          />
          <span>条</span>
        </div>
        <div class="flex items-center gap-1">
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="filters.page <= 1"
            @click="changePage(filters.page - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </AppButton>
          <span class="px-3 text-body text-gray-600">
            {{ filters.page }} / {{ totalPages }}
          </span>
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="filters.page >= totalPages"
            @click="changePage(filters.page + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- ── Create / Edit Modal ── -->
    <RequirementFormModal
      v-model:visible="showFormModal"
      :mode="formMode"
      :requirement="editingRequirement"
      :projects="projectsStore.projects"
      :users="usersStore.users"
      @saved="onFormSaved"
    />

    <!-- ── Detail Modal (RequirementDetail component) ── -->
    <RequirementDetail
      v-if="showDetailModal && detailReqId"
      :visible="showDetailModal"
      :requirement-id="detailReqId"
      @update:visible="showDetailModal = $event"
      @updated="onDetailUpdated"
      @deleted="onDetailDeleted"
    />

    <!-- ── Delete Confirm Modal ── -->
    <AppModal
      :visible="showDeleteConfirm"
      title="确认删除"
      width="440px"
      @update:visible="showDeleteConfirm = $event"
    >
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-warning-50 flex items-center justify-center shrink-0">
          <i class="fas fa-exclamation-triangle text-warning-500"></i>
        </div>
        <div>
          <p class="text-body text-gray-700 m-0">
            确定要删除需求「{{ deletingReq?.code }} - {{ deletingReq?.title }}」吗？
          </p>
          <p class="text-sm text-gray-400 mt-1">删除后不可恢复。</p>
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showDeleteConfirm = false">取消</AppButton>
        <AppButton variant="danger" :loading="deleting" @click="confirmDelete">确认删除</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  RequirementStatus,
  Priority,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@pm-system/shared'
import type {
  Requirement,
} from '@pm-system/shared'
import { useRequirementsStore } from '@/stores/requirements'
import { useProjectsStore } from '@/stores/projects'
import { useUsersStore } from '@/stores/users'
import { exportCsv } from '@/api/requirements'
import type { SelectOption } from '@/components/AppSelect.vue'
import RequirementFormModal from '@/views/RequirementFormModal.vue'
import RequirementDetail from '@/views/RequirementDetail.vue'

// ── Stores ──
const store = useRequirementsStore()
const projectsStore = useProjectsStore()
const usersStore = useUsersStore()
const { filters } = storeToRefs(store)

// ── Filter State ──
const filterExpanded = ref(true)
const searchText = ref('')

// ── Modal State ──
const showFormModal = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingRequirement = ref<Requirement | null>(null)

const showDetailModal = ref(false)
const detailReqId = ref<string | null>(null)

const showDeleteConfirm = ref(false)
const deletingReq = ref<Requirement | null>(null)
const deleting = ref(false)

// ── Table Columns ──
interface FlatRow {
  id: string
  code: string
  title: string
  status: string
  priority: string
  projectName: string
  creatorName: string
  plannedLaunch: string
  _raw: Requirement
}

const tableColumns = [
  { key: 'code', label: '编号' },
  { key: 'title', label: '标题' },
  { key: 'status', label: '状态' },
  { key: 'priority', label: '优先级' },
  { key: 'projectName', label: '项目' },
  { key: 'creatorName', label: '创建人' },
  { key: 'plannedLaunch', label: '计划提测日' },
  { key: 'actions', label: '操作' },
]

// ── Pagination ──
const pageSizeOptions: SelectOption[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
]

const totalPages = computed(() =>
  Math.max(1, Math.ceil(store.filteredRequirements.length / filters.value.pageSize))
)

const paginatedRequirements = computed(() => {
  const data = store.filteredRequirements
  const start = (filters.value.page - 1) * filters.value.pageSize
  return data.slice(start, start + filters.value.pageSize)
})

const tableData = computed<FlatRow[]>(() =>
  paginatedRequirements.value.map((req) => ({
    id: req.id,
    code: req.code,
    title: req.title,
    status: req.status,
    priority: req.priority,
    projectName: getProjectName(req.projectId),
    creatorName: req.creatorName,
    plannedLaunch: req.plannedLaunch ? formatDate(req.plannedLaunch) : '',
    _raw: req,
  }))
)

// ── Dropdown Options ──
const projectOptions = computed<SelectOption[]>(() =>
  projectsStore.projects.map((p) => ({ label: p.name, value: p.id }))
)

const statusOptions = computed<SelectOption[]>(() =>
  Object.values(RequirementStatus).map((s) => ({
    label: STATUS_LABELS[s],
    value: s,
  }))
)

const priorityOptions = computed<SelectOption[]>(() =>
  Object.values(Priority).map((p) => ({
    label: PRIORITY_LABELS[p],
    value: p,
  }))
)

// ── Filter Handlers ──
function onFilterChange(key: string, value: string | null) {
  filters.value = { ...filters.value, [key]: value, page: 1 }
  store.fetchRequirements(filters.value)
}

function resetFilters() {
  filters.value = {
    projectId: null,
    status: null,
    priority: null,
    search: '',
    page: 1,
    pageSize: 20,
  }
  searchText.value = ''
  store.fetchRequirements(filters.value)
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  filters.value = { ...filters.value, page }
  store.fetchRequirements(filters.value)
}

function onPageSizeChange(val: string) {
  const size = parseInt(val, 10)
  if (isNaN(size)) return
  filters.value = { ...filters.value, pageSize: size, page: 1 }
  store.fetchRequirements(filters.value)
}

// ── Debounced Search ──
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchText, (val) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    filters.value.search = val || ''
    filters.value.page = 1
    store.fetchRequirements(filters.value)
  }, 300)
})

// ── CSV Export ──
async function handleExportCSV() {
  try {
    const blob = await exportCsv(filters.value)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `requirements-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch {
    // silently fail
  }
}

// ── Create / Edit ──
function openCreateModal() {
  formMode.value = 'create'
  editingRequirement.value = null
  showFormModal.value = true
}

function openEditModal(req: Requirement) {
  formMode.value = 'edit'
  editingRequirement.value = req
  showFormModal.value = true
}

function onFormSaved() {
  store.fetchRequirements()
}

// ── Detail ──
function openDetail(req: Requirement) {
  detailReqId.value = req.id
  showDetailModal.value = true
}

function onDetailUpdated() {
  store.fetchRequirements()
}

function onDetailDeleted() {
  showDetailModal.value = false
  detailReqId.value = null
  store.fetchRequirements()
}

// ── Delete ──
function handleDelete(req: Requirement) {
  deletingReq.value = req
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deletingReq.value) return
  deleting.value = true
  try {
    await store.deleteRequirement(deletingReq.value.id)
    showDeleteConfirm.value = false
    deletingReq.value = null
  } catch {
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}

// ── Color Maps for Tags ──
function statusColor(status: string): 'red' | 'orange' | 'blue' | 'green' | 'yellow' | 'default' {
  const map: Record<string, 'red' | 'orange' | 'blue' | 'green' | 'yellow' | 'default'> = {
    [RequirementStatus.PENDING_REVIEW]: 'yellow',
    [RequirementStatus.DEVELOPING]: 'blue',
    [RequirementStatus.TESTING]: 'orange',
    [RequirementStatus.LAUNCHED]: 'green',
  }
  return map[status] || 'default'
}

function priorityColor(priority: string): 'red' | 'orange' | 'blue' | 'green' | 'yellow' | 'default' {
  const map: Record<string, 'red' | 'orange' | 'blue' | 'green' | 'yellow' | 'default'> = {
    [Priority.P0]: 'red',
    [Priority.P1]: 'orange',
    [Priority.P2]: 'blue',
    [Priority.P3]: 'default',
  }
  return map[priority] || 'default'
}

// ── Helpers ──
function getProjectName(projectId: string): string {
  return projectsStore.projects.find((p) => p.id === projectId)?.name || '-'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

// ── Lifecycle ──
onMounted(async () => {
  await Promise.all([
    projectsStore.fetchProjects(),
    usersStore.fetchUsers(),
  ])
  await store.fetchRequirements()
})
</script>

<style scoped>
/* ── Filter slide transition ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, max-height 0.3s ease;
  overflow: hidden;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
