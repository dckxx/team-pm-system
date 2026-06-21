<template>
  <div class="team-page space-y-6">
    <!-- ── Page Header ── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-headline text-gray-800 m-0 flex items-center gap-3">
        <i class="fas fa-users text-primary-500" />
        团队管理
      </h1>
      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索成员姓名..."
            class="w-56 rounded border border-gray-300 bg-white pl-9 pr-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all ease-standard focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
          />
        </div>
        <!-- Role Filter -->
        <AppSelect
          v-model="roleFilter"
          :options="roleOptions"
          placeholder="全部角色"
        />
      </div>
    </div>

    <!-- ── Loading State ── -->
    <div
      v-if="store.loading && store.users.length === 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="bg-white rounded-lg shadow-sm p-5 animate-pulse"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 rounded-full bg-gray-200" />
          <div class="h-4 w-24 bg-gray-200 rounded" />
          <div class="h-3 w-32 bg-gray-200 rounded" />
          <div class="h-5 w-16 bg-gray-200 rounded-full" />
          <div class="flex gap-2">
            <div class="h-4 w-10 bg-gray-200 rounded-sm" />
            <div class="h-4 w-10 bg-gray-200 rounded-sm" />
          </div>
          <div class="h-3 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>

    <!-- ── Empty State ── -->
    <div
      v-else-if="filteredUsers.length === 0"
      class="flex flex-col items-center justify-center py-20 text-gray-400"
    >
      <i class="fas fa-users text-5xl mb-4 text-gray-300" />
      <p class="text-body">
        {{ store.users.length === 0 ? '暂无团队成员' : '没有匹配的成员' }}
      </p>
    </div>

    <!-- ── User Card Grid ── -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <AppCard
        v-for="user in filteredUsers"
        :key="user.id"
        class="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
        @click="openDetail(user)"
      >
        <div class="flex flex-col items-center text-center gap-2.5 py-1">
          <!-- Avatar -->
          <AppAvatar
            :name="user.name"
            :src="user.avatarUrl"
            size="lg"
          />

          <!-- Name -->
          <h3 class="text-title text-gray-800 m-0 leading-tight truncate max-w-full">
            {{ user.name }}
          </h3>

          <!-- Email -->
          <p class="text-body text-gray-400 m-0 truncate max-w-full">
            {{ user.email }}
          </p>

          <!-- Role Badge -->
          <AppTag :type="`role-${user.role}`" />

          <!-- Dev Roles Tags -->
          <div
            v-if="user.devRoles && user.devRoles.length > 0"
            class="flex flex-wrap gap-1.5 justify-center"
          >
            <AppTag
              v-for="role in user.devRoles"
              :key="role"
              :type="`role-${role}`"
            />
          </div>
          <span
            v-else
            class="text-label text-gray-300"
          >-</span>

          <!-- Active Status -->
          <div class="flex items-center gap-1.5">
            <span
              class="inline-block w-2 h-2 rounded-full"
              :class="user.isActive ? 'bg-success-500' : 'bg-gray-300'"
            />
            <span
              class="text-label"
              :class="user.isActive ? 'text-success-600' : 'text-gray-400'"
            >
              {{ user.isActive ? '在职' : '离职' }}
            </span>
          </div>

          <!-- Requirement Count -->
          <div class="flex items-center gap-1.5 mt-1">
            <i class="fas fa-tasks text-gray-300 text-xs" />
            <span class="text-label text-gray-400">
              {{ (user as UserWithCount).requirementCount }} 个需求
            </span>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- ── Detail Modal ── -->
    <AppModal
      :visible="showDetailModal"
      :title="`${selectedUser?.name ?? ''} 的详情`"
      width="480px"
      @update:visible="showDetailModal = $event"
    >
      <div v-if="selectedUser" class="flex flex-col gap-5 py-1">
        <!-- Avatar + Name + Role -->
        <div class="flex flex-col items-center text-center gap-3">
          <AppAvatar
            :name="selectedUser.name"
            :src="selectedUser.avatarUrl"
            size="lg"
            class="!w-16 !h-16"
          />
          <div>
            <h2 class="text-headline text-gray-800 m-0">{{ selectedUser.name }}</h2>
            <div class="flex items-center justify-center gap-2 mt-2">
              <AppTag :type="`role-${selectedUser.role}`" />
              <span
                class="inline-flex items-center gap-1 text-label"
                :class="selectedUser.isActive ? 'text-success-600' : 'text-gray-400'"
              >
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  :class="selectedUser.isActive ? 'bg-success-500' : 'bg-gray-300'"
                />
                {{ selectedUser.isActive ? '在职' : '离职' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Detail Info -->
        <div class="border-t border-gray-100 pt-4 space-y-3">
          <div class="flex items-center gap-3 text-body">
            <i class="fas fa-envelope w-4 text-center text-gray-400" />
            <span class="text-gray-600">{{ selectedUser.email }}</span>
          </div>
          <div class="flex items-center gap-3 text-body">
            <i class="fas fa-tasks w-4 text-center text-gray-400" />
            <span class="text-gray-600">
              负责 {{ (selectedUser as UserWithCount).requirementCount }} 个需求
            </span>
          </div>
          <div class="flex items-center gap-3 text-body">
            <i class="fas fa-calendar-alt w-4 text-center text-gray-400" />
            <span class="text-gray-600">创建于 {{ formatDate(selectedUser.createdAt) }}</span>
          </div>
          <div
            v-if="selectedUser.devRoles && selectedUser.devRoles.length > 0"
            class="flex items-start gap-3 text-body"
          >
            <i class="fas fa-laptop-code w-4 text-center text-gray-400 mt-0.5" />
            <div class="flex flex-wrap gap-1.5">
              <AppTag
                v-for="role in selectedUser.devRoles"
                :key="role"
                :type="`role-${role}`"
              />
            </div>
          </div>
        </div>

        <!-- ── Assigned Requirements ── -->
        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-tasks text-primary-400 text-sm" />
            <h4 class="text-title text-gray-700 m-0">负责需求</h4>
          </div>
          <div
            v-if="loadingRequirements"
            class="flex items-center justify-center py-6 text-gray-400 text-body"
          >
            <i class="fas fa-spinner fa-spin mr-2" />
            加载中...
          </div>
          <div
            v-else-if="userRequirements.length === 0"
            class="text-body text-gray-400 py-4 text-center"
          >
            暂无负责的需求
          </div>
          <div
            v-else
            class="space-y-2 max-h-64 overflow-y-auto"
          >
            <div
              v-for="req in userRequirements"
              :key="req.id"
              class="flex items-center justify-between gap-3 p-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-label font-mono text-primary-500 shrink-0">{{ req.code }}</span>
                <span class="text-body text-gray-700 truncate">{{ req.title }}</span>
              </div>
              <AppTag :type="`status-${req.status}`" />
            </div>
          </div>
        </div>

        <!-- ── PM-Only Actions ── -->
        <template v-if="isPM && selectedUser.id !== currentUserId">
          <div class="border-t border-gray-100 pt-4 space-y-4">
            <h4 class="text-title text-gray-700 m-0">管理操作</h4>

            <!-- Toggle Active -->
            <div class="flex items-center justify-between">
              <span class="text-body text-gray-700">账号状态</span>
              <AppButton
                :variant="selectedUser.isActive ? 'danger' : 'primary'"
                size="sm"
                :loading="togglingActive"
                @click="handleToggleActive"
              >
                <i
                  class="fas"
                  :class="selectedUser.isActive ? 'fa-ban' : 'fa-check'"
                />
                {{ selectedUser.isActive ? '停用' : '启用' }}
              </AppButton>
            </div>

            <!-- Edit Role -->
            <div class="flex items-center justify-between">
              <span class="text-body text-gray-700">角色</span>
              <AppSelect
                :model-value="editingRole"
                :options="roleEditOptions"
                placeholder="选择角色"
                class="w-36"
                @update:model-value="handleRoleChange"
              />
            </div>

            <!-- Edit Dev Roles -->
            <div>
              <span class="text-body text-gray-700 block mb-2">开发方向</span>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="dr in devRoleOptions"
                  :key="dr.value"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-colors select-none"
                  :class="editingDevRoles.includes(dr.value)
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <input
                    type="checkbox"
                    :value="dr.value"
                    :checked="editingDevRoles.includes(dr.value)"
                    class="sr-only"
                    @change="handleDevRoleToggle(dr.value)"
                  />
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="editingDevRoles.includes(dr.value) ? 'bg-primary-500' : 'bg-gray-300'"
                  />
                  <span class="text-label text-gray-700">{{ dr.label }}</span>
                </label>
              </div>
              <div class="flex justify-end mt-3">
                <AppButton
                  variant="primary"
                  size="sm"
                  :loading="savingDevRoles"
                  @click="handleSaveDevRoles"
                >
                  <i class="fas fa-save mr-1" />
                  保存开发方向
                </AppButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useRequirementsStore } from '@/stores/requirements'
import type { User, UserRole, DevRole, Requirement } from '@pm-system/shared'
import { ROLE_LABELS, DEV_ROLE_LABELS } from '@pm-system/shared'

// Backend API returns requirementCount on every User response
type UserWithCount = User & { requirementCount: number }

// ── Stores ──
const store = useUsersStore()
const authStore = useAuthStore()
const reqStore = useRequirementsStore()

// ── Search / Filter ──
const searchQuery = ref('')
const roleFilter = ref<string>('')

const roleOptions = computed(() => [
  { label: '全部角色', value: '' },
  { label: ROLE_LABELS['pm' as UserRole], value: 'pm' },
  { label: ROLE_LABELS['dev' as UserRole], value: 'dev' },
])

const filteredUsers = computed(() => {
  let list = store.users

  if (roleFilter.value) {
    list = list.filter((u) => u.role === roleFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((u) => u.name.toLowerCase().includes(q))
  }

  return list
})

// ── Auth ──
const isPM = computed(() => authStore.user?.role === 'pm')
const currentUserId = computed(() => authStore.user?.id ?? '')

// ── Detail Modal ──
const showDetailModal = ref(false)
const selectedUser = ref<User | null>(null)
const userRequirements = ref<Requirement[]>([])
const loadingRequirements = ref(false)

function openDetail(user: User) {
  selectedUser.value = user
  // Init editing state from the selected user
  editingRole.value = user.role
  editingDevRoles.value = [...(user.devRoles || [])]
  showDetailModal.value = true
  // Fetch assigned requirements from kanban data
  fetchUserRequirements(user.id)
}

async function fetchUserRequirements(userId: string) {
  loadingRequirements.value = true
  userRequirements.value = []
  try {
    const kanban = await reqStore.fetchKanbanData()
    const devEntry = kanban.byDeveloper.find((d) => d.userId === userId)
    if (devEntry) {
      userRequirements.value = devEntry.items
    }
  } catch (err) {
    console.error('Failed to fetch user requirements:', err)
  } finally {
    loadingRequirements.value = false
  }
}

function closeDetail() {
  showDetailModal.value = false
  selectedUser.value = null
}

// ── PM: Toggle Active ──
const togglingActive = ref(false)

async function handleToggleActive() {
  if (!selectedUser.value) return
  togglingActive.value = true
  try {
    const updated = await store.updateUser(selectedUser.value.id, {
      isActive: !selectedUser.value.isActive,
    })
    selectedUser.value = updated
  } catch (err) {
    console.error('Failed to toggle active status:', err)
  } finally {
    togglingActive.value = false
  }
}

// ── PM: Edit Role ──
const editingRole = ref<UserRole>(selectedUser.value?.role ?? 'dev' as UserRole)

const roleEditOptions = computed(() => [
  { label: ROLE_LABELS['pm' as UserRole], value: 'pm' },
  { label: ROLE_LABELS['dev' as UserRole], value: 'dev' },
])

async function handleRoleChange(val: string | number) {
  if (!selectedUser.value || val === editingRole.value) return
  const newRole = val as UserRole
  editingRole.value = newRole
  try {
    const updated = await store.updateUser(selectedUser.value.id, {
      role: newRole,
    })
    selectedUser.value = updated
  } catch (err) {
    console.error('Failed to update role:', err)
    // Revert on error
    editingRole.value = selectedUser.value.role
  }
}

// ── PM: Edit Dev Roles ──
const editingDevRoles = ref<DevRole[]>([])
const savingDevRoles = ref(false)

const devRoleOptions = computed(() =>
  (['frontend', 'backend', 'data'] as DevRole[]).map((r) => ({
    label: DEV_ROLE_LABELS[r],
    value: r,
  }))
)

function handleDevRoleToggle(role: DevRole) {
  const idx = editingDevRoles.value.indexOf(role)
  if (idx === -1) {
    editingDevRoles.value.push(role)
  } else {
    editingDevRoles.value.splice(idx, 1)
  }
}

async function handleSaveDevRoles() {
  if (!selectedUser.value) return
  savingDevRoles.value = true
  try {
    const updated = await store.updateUser(selectedUser.value.id, {
      devRoles: editingDevRoles.value,
    })
    selectedUser.value = updated
  } catch (err) {
    console.error('Failed to update dev roles:', err)
  } finally {
    savingDevRoles.value = false
  }
}

// ── Helpers ──
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ── Lifecycle ──
onMounted(() => {
  store.fetchUsers()
})
</script>
