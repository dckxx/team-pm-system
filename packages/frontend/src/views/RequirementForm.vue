<template>
  <AppModal
    :visible="visible"
    :title="isEdit ? '编辑需求' : '创建需求'"
    width="640px"
    @update:visible="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- ── Title ── -->
      <AppInput
        v-model="formData.title"
        label="标题"
        placeholder="请输入需求标题"
        :error="formErrors.title"
      />

      <!-- ── Description ── -->
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">描述</label>
        <textarea
          v-model="formData.description"
          class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[80px] resize-vertical"
          placeholder="请输入需求描述（选填）"
          rows="3"
        ></textarea>
      </div>

      <!-- ── Project / Priority row ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppSelect
          v-model="formData.projectId"
          label="项目"
          :options="projectOptions"
          placeholder="请选择项目"
        />
        <AppSelect
          v-model="formData.priority"
          label="优先级"
          :options="priorityOptions"
          placeholder="请选择优先级"
        />
      </div>

      <!-- ── Developers ── -->
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">开发人员</label>
        <div class="border border-gray-200 rounded max-h-[200px] overflow-y-auto divide-y divide-gray-100">
          <div
            v-for="user in allUsers"
            :key="user.id"
            class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              :checked="isDeveloperSelected(user.id)"
              :id="'dev-' + user.id"
              class="rounded border-gray-300 text-primary-500 focus:ring-primary-300 shrink-0"
              @change="toggleDeveloper(user.id)"
            />
            <AppAvatar :name="user.name" size="sm" />
            <label :for="'dev-' + user.id" class="flex-1 text-body text-gray-700 cursor-pointer select-none min-w-0">
              {{ user.name }}
            </label>
            <select
              v-if="isDeveloperSelected(user.id)"
              :value="getDeveloperRole(user.id)"
              class="text-sm rounded border border-gray-300 px-2 py-1 text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shrink-0"
              @change="setDeveloperRole(user.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="frontend">前端</option>
              <option value="backend">后端</option>
              <option value="data">数据</option>
            </select>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-1">勾选开发人员并选择其角色</p>
      </div>

      <!-- ── Date row ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">计划提测日</label>
          <input
            v-model="formData.plannedLaunch"
            type="date"
            class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">计划上线日</label>
          <input
            v-model="formData.plannedOnline"
            type="date"
            class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <!-- ── Tags ── -->
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">标签</label>
        <input
          v-model="tagsInput"
          class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="多个标签用逗号分隔，如：前端, 性能优化"
          @blur="parseTags"
        />
        <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-1.5 mt-2">
          <AppTag
            v-for="(tag, ti) in formData.tags"
            :key="ti"
            type="role-frontend"
            class="!bg-gray-100 !text-gray-600"
          >
            {{ tag }}
          </AppTag>
        </div>
      </div>

      <!-- ── Error Banner ── -->
      <div
        v-if="formErrors.form"
        class="flex items-center gap-2 bg-danger-50 border border-danger-200 rounded px-3 py-2"
      >
        <i class="fas fa-exclamation-circle text-danger-500 text-sm"></i>
        <span class="text-body text-danger-600">{{ formErrors.form }}</span>
      </div>

      <!-- ── Footer ── -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <AppButton variant="secondary" type="button" @click="handleClose">取消</AppButton>
        <AppButton variant="primary" :loading="submitting" type="submit">
          {{ isEdit ? '保存' : '创建' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Priority,
  DevRole,
  PRIORITY_LABELS,
} from '@pm-system/shared'
import type {
  Requirement,
  CreateRequirementDto,
  UpdateRequirementDto,
  DeveloperAssignment,
} from '@pm-system/shared'
import { useRequirementsStore } from '@/stores/requirements'
import { useProjectsStore } from '@/stores/projects'
import { useUsersStore } from '@/stores/users'
import type { SelectOption } from '@/components/AppSelect.vue'

// ── Props ──
const props = withDefaults(defineProps<{
  visible: boolean
  requirement?: Requirement | null
}>(), {
  visible: false,
  requirement: null,
})

// ── Emits ──
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'created', requirement: Requirement): void
  (e: 'updated', requirement: Requirement): void
}>()

// ── Stores ──
const requirementsStore = useRequirementsStore()
const projectsStore = useProjectsStore()
const usersStore = useUsersStore()

// ── Computed ──
const isEdit = computed(() => !!props.requirement)

const allUsers = computed(() => usersStore.users.filter((u) => u.isActive))

const projectOptions = computed<SelectOption[]>(() =>
  projectsStore.projects.map((p) => ({ label: p.name, value: p.id })),
)

const priorityOptions = computed<SelectOption[]>(() =>
  Object.values(Priority).map((p) => ({
    label: PRIORITY_LABELS[p],
    value: p,
  })),
)

// ── Form State ──
interface FormData {
  title: string
  description: string
  projectId: string
  priority: string
  plannedLaunch: string
  plannedOnline: string
  tags: string[]
  developers: { userId: string; role: string }[]
}

function emptyForm(): FormData {
  return {
    title: '',
    description: '',
    projectId: '',
    priority: '',
    plannedLaunch: '',
    plannedOnline: '',
    tags: [],
    developers: [],
  }
}

const formData = ref<FormData>(emptyForm())
const tagsInput = ref('')
const formErrors = ref<Record<string, string>>({})
const submitting = ref(false)

// ── Developer helpers ──
function isDeveloperSelected(userId: string): boolean {
  return formData.value.developers.some((d) => d.userId === userId)
}

function getDeveloperRole(userId: string): string {
  return formData.value.developers.find((d) => d.userId === userId)?.role || 'frontend'
}

function toggleDeveloper(userId: string) {
  const idx = formData.value.developers.findIndex((d) => d.userId === userId)
  if (idx !== -1) {
    formData.value.developers.splice(idx, 1)
  } else {
    formData.value.developers.push({ userId, role: 'frontend' })
  }
}

function setDeveloperRole(userId: string, role: string) {
  const dev = formData.value.developers.find((d) => d.userId === userId)
  if (dev) dev.role = role
}

// ── Tags ──
function parseTags() {
  if (tagsInput.value.trim()) {
    formData.value.tags = tagsInput.value
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean)
  } else {
    formData.value.tags = []
  }
}

// ── Validation ──
function validateForm(): boolean {
  const errors: Record<string, string> = {}
  if (!formData.value.title.trim()) errors.title = '标题不能为空'
  if (!formData.value.projectId) errors.projectId = '请选择项目'
  if (!formData.value.priority) errors.priority = '请选择优先级'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

// ── Submit ──
async function handleSubmit() {
  parseTags()
  if (!validateForm()) return

  const developerIds: DeveloperAssignment[] = formData.value.developers.map((d) => ({
    userId: d.userId,
    role: d.role as DevRole,
  }))

  const payload: CreateRequirementDto = {
    title: formData.value.title.trim(),
    description: formData.value.description.trim() || undefined,
    projectId: formData.value.projectId,
    priority: formData.value.priority as Priority,
    plannedLaunch: formData.value.plannedLaunch || undefined,
    plannedOnline: formData.value.plannedOnline || undefined,
    tags: formData.value.tags.length > 0 ? formData.value.tags : undefined,
    developerIds: developerIds.length > 0 ? developerIds : undefined,
  }

  submitting.value = true
  formErrors.value = {}
  try {
    if (isEdit.value && props.requirement) {
      const updatePayload: UpdateRequirementDto = payload
      const updated = await requirementsStore.updateRequirement(props.requirement.id, updatePayload)
      emit('updated', updated)
    } else {
      const created = await requirementsStore.createRequirement(payload)
      emit('created', created)
    }
    emit('update:visible', false)
  } catch (err: any) {
    formErrors.value.form = err?.message || '操作失败，请重试'
  } finally {
    submitting.value = false
  }
}

// ── Close ──
function handleClose() {
  emit('update:visible', false)
}

// ── Reset / Pre-fill ──
function resetForm() {
  if (props.requirement) {
    formData.value = {
      title: props.requirement.title,
      description: props.requirement.description || '',
      projectId: props.requirement.projectId,
      priority: props.requirement.priority,
      plannedLaunch: props.requirement.plannedLaunch
        ? props.requirement.plannedLaunch.slice(0, 10)
        : '',
      plannedOnline: props.requirement.plannedOnline
        ? props.requirement.plannedOnline.slice(0, 10)
        : '',
      tags: [...props.requirement.tags],
      developers: props.requirement.developers
        ? props.requirement.developers.map((d) => ({
            userId: d.userId,
            role: d.role,
          }))
        : [],
    }
    tagsInput.value = props.requirement.tags.join(', ')
  } else {
    formData.value = emptyForm()
    tagsInput.value = ''
  }
  formErrors.value = {}
}

// ── Watchers ──
watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetForm()
    }
  },
)

// ── Preload stores if not loaded ──
onMounted(() => {
  if (projectsStore.projects.length === 0) {
    projectsStore.fetchProjects()
  }
  if (usersStore.users.length === 0) {
    usersStore.fetchUsers()
  }
})
</script>
