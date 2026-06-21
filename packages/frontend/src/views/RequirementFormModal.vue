<template>
  <AppModal
    :visible="visible"
    :title="mode === 'create' ? '创建需求' : '编辑需求'"
    width="640px"
    @update:visible="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- ── Title ── -->
      <AppInput
        v-model="form.title"
        label="标题"
        placeholder="请输入需求标题"
        required
        :error="errors.title"
      />

      <!-- ── Description ── -->
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">描述</label>
        <textarea
          v-model="form.description"
          class="w-full rounded border bg-white px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all ease-standard focus:outline-none min-h-[80px] resize-vertical"
          :class="descriptionClasses"
          placeholder="请输入需求描述（选填）"
          rows="3"
        ></textarea>
        <p v-if="errors.description" class="text-xs text-danger-500 mt-1">{{ errors.description }}</p>
      </div>

      <!-- ── Project / Priority ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AppSelect
            v-model="form.projectId"
            label="项目"
            :options="projectOptions"
            placeholder="请选择项目"
          />
          <p v-if="errors.projectId" class="text-xs text-danger-500 mt-1">{{ errors.projectId }}</p>
        </div>
        <div>
          <AppSelect
            v-model="form.priority"
            label="优先级"
            :options="priorityOptions"
            placeholder="请选择优先级"
          />
          <p v-if="errors.priority" class="text-xs text-danger-500 mt-1">{{ errors.priority }}</p>
        </div>
      </div>

      <!-- ── Developer Assignment ── -->
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">开发人员</label>
        <div class="flex items-end gap-2 mb-2">
          <div class="flex-1">
            <AppSelect
              v-model="selectedDevUserId"
              :options="devUserOptions"
              placeholder="选择用户"
            />
          </div>
          <div class="w-[120px] shrink-0">
            <AppSelect
              v-model="selectedDevRole"
              :options="devRoleOptions"
              placeholder="角色"
            />
          </div>
          <AppButton
            variant="primary"
            size="sm"
            type="button"
            class="mb-[1px]"
            :disabled="!selectedDevUserId || !selectedDevRole"
            @click="addDeveloper"
          >
            <i class="fas fa-plus mr-1"></i>
            添加
          </AppButton>
        </div>
        <div v-if="form.developerIds.length > 0" class="space-y-1.5">
          <div
            v-for="(dev, di) in form.developerIds"
            :key="di"
            class="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
          >
            <div class="flex items-center gap-2 min-w-0">
              <i class="fas fa-user-circle text-gray-400 shrink-0"></i>
              <span class="text-body text-gray-700 truncate">{{ getUserName(dev.userId) }}</span>
              <AppTag color="blue">{{ getDevRoleLabel(dev.role) }}</AppTag>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-danger-500 transition-colors shrink-0 ml-2"
              title="移除"
              @click="removeDeveloper(di)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 italic">尚未添加开发人员</p>
      </div>

      <!-- ── Date Row ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">计划提测日</label>
          <input
            v-model="form.plannedLaunch"
            type="date"
            class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-body text-gray-800 transition-all ease-standard focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">计划上线日</label>
          <input
            v-model="form.plannedOnline"
            type="date"
            class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-body text-gray-800 transition-all ease-standard focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <!-- ── Tags ── -->
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">标签</label>
        <input
          v-model="tagsInput"
          class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all ease-standard focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="多个标签用逗号分隔，如：前端, 性能优化"
          @blur="parseTags"
        />
        <div v-if="form.tags.length > 0" class="flex flex-wrap gap-1.5 mt-2">
          <AppTag
            v-for="(tag, ti) in form.tags"
            :key="ti"
            color="default"
            class="!bg-gray-100 !text-gray-600"
          >
            {{ tag }}
          </AppTag>
        </div>
      </div>

      <!-- ── Form Error ── -->
      <p v-if="errors.form" class="text-sm text-danger-500 flex items-center gap-1.5">
        <i class="fas fa-exclamation-circle"></i>
        {{ errors.form }}
      </p>

      <!-- ── Footer ── -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <AppButton variant="secondary" type="button" @click="handleClose">取消</AppButton>
        <AppButton variant="primary" :loading="submitting" type="submit">
          {{ mode === 'create' ? '创建' : '保存' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Priority,
  DevRole,
  PRIORITY_LABELS,
  DEV_ROLE_LABELS,
  createRequirementSchema,
} from '@pm-system/shared'
import type {
  Requirement,
  Project,
  User,
  DeveloperAssignment,
  CreateRequirementDto,
  UpdateRequirementDto,
} from '@pm-system/shared'
import { useRequirementsStore } from '@/stores/requirements'
import { useUiStore } from '@/stores/ui'

// ── Props ──
const props = withDefaults(defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  requirement?: Requirement | null
  projects: Project[]
  users: User[]
}>(), {
  requirement: null,
})

// ── Emits ──
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'saved'): void
}>()

// ── Stores ──
const requirementsStore = useRequirementsStore()
const uiStore = useUiStore()

// ── Form State ──
interface FormData {
  title: string
  description: string
  projectId: string
  priority: string
  plannedLaunch: string
  plannedOnline: string
  tags: string[]
  developerIds: DeveloperAssignment[]
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
    developerIds: [],
  }
}

const form = ref<FormData>(emptyForm())
const tagsInput = ref('')
const selectedDevUserId = ref('')
const selectedDevRole = ref('')
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

// Reset form whenever the modal opens / mode changes
watch(
  () => props.visible,
  (val) => {
    if (val) initForm()
  },
)

function initForm() {
  selectedDevUserId.value = ''
  selectedDevRole.value = ''
  errors.value = {}

  if (props.mode === 'edit' && props.requirement) {
    const req = props.requirement
    form.value = {
      title: req.title,
      description: req.description || '',
      projectId: req.projectId,
      priority: req.priority,
      plannedLaunch: req.plannedLaunch ? req.plannedLaunch.slice(0, 10) : '',
      plannedOnline: req.plannedOnline ? req.plannedOnline.slice(0, 10) : '',
      tags: [...req.tags],
      developerIds: req.developers
        ? req.developers.map((d) => ({ userId: d.userId, role: d.role as DevRole }))
        : [],
    }
    tagsInput.value = req.tags.join(', ')
  } else {
    form.value = emptyForm()
    tagsInput.value = ''
  }
}

// ── Computed ──
const projectOptions = computed(() =>
  props.projects.map((p) => ({ label: p.name, value: p.id })),
)

const priorityOptions = computed(() =>
  Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ label, value })),
)

const devRoleOptions = computed(() =>
  Object.entries(DEV_ROLE_LABELS).map(([value, label]) => ({ label, value })),
)

const devUserOptions = computed(() =>
  props.users
    .filter((u) => !form.value.developerIds.some((d) => d.userId === u.id))
    .map((u) => ({ label: `${u.name} (${u.email})`, value: u.id })),
)

const descriptionClasses = computed(() =>
  errors.value.description
    ? 'border-danger-500 focus:border-danger-500 focus:ring-1 focus:ring-danger-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
)

// ── Helpers ──
function getUserName(userId: string): string {
  return props.users.find((u) => u.id === userId)?.name || userId
}

function getDevRoleLabel(role: string): string {
  return DEV_ROLE_LABELS[role as DevRole] || role
}

// ── Developer Assignment ──
function addDeveloper() {
  if (!selectedDevUserId.value || !selectedDevRole.value) return
  form.value.developerIds.push({
    userId: selectedDevUserId.value,
    role: selectedDevRole.value as DevRole,
  })
  selectedDevUserId.value = ''
  selectedDevRole.value = ''
}

function removeDeveloper(index: number) {
  form.value.developerIds.splice(index, 1)
}

// ── Tags ──
function parseTags() {
  if (tagsInput.value.trim()) {
    form.value.tags = tagsInput.value
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean)
  } else {
    form.value.tags = []
  }
}

// ── Validation ──
function validate(): boolean {
  parseTags()

  const data = {
    title: form.value.title.trim() || undefined,
    projectId: form.value.projectId || undefined,
    priority: form.value.priority || undefined,
    description: form.value.description.trim() || undefined,
    plannedLaunch: form.value.plannedLaunch || undefined,
    plannedOnline: form.value.plannedOnline || undefined,
    tags: form.value.tags.length > 0 ? form.value.tags : undefined,
    developerIds: form.value.developerIds.length > 0 ? form.value.developerIds : undefined,
  }

  const result = createRequirementSchema.safeParse(data)

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = String(issue.path[0])
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    errors.value = fieldErrors
    return false
  }

  errors.value = {}
  return true
}

// ── Submit ──
async function handleSubmit() {
  if (!validate()) return

  const payload = {
    title: form.value.title.trim(),
    description: form.value.description.trim() || undefined,
    projectId: form.value.projectId,
    priority: form.value.priority as Priority,
    plannedLaunch: form.value.plannedLaunch || undefined,
    plannedOnline: form.value.plannedOnline || undefined,
    tags: form.value.tags.length > 0 ? form.value.tags : undefined,
    developerIds: form.value.developerIds.length > 0 ? form.value.developerIds : undefined,
  }

  submitting.value = true
  try {
    if (props.mode === 'create') {
      await requirementsStore.createRequirement(payload as CreateRequirementDto)
      uiStore.showToast('success', '需求创建成功')
    } else if (props.requirement) {
      await requirementsStore.updateRequirement(props.requirement.id, {
        ...payload,
        version: props.requirement.version,
      } as UpdateRequirementDto)
      uiStore.showToast('success', '需求更新成功')
    }
    emit('saved')
    emit('update:visible', false)
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || '操作失败，请重试'
    errors.value.form = msg
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  emit('update:visible', false)
}
</script>
