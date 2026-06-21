<template>
  <!-- ── Main Detail Modal ── -->
  <AppModal
    :visible="visible"
    :title="requirement ? `${requirement.code} - ${requirement.title}` : '需求详情'"
    width="720px"
    @update:visible="$emit('update:visible', $event)"
  >
    <!-- Loading State -->
    <div v-if="loading && !requirement" class="py-12 text-center">
      <i class="fas fa-spinner fa-spin text-lg text-primary-500"></i>
      <p class="text-body text-gray-400 mt-2">加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="py-12 text-center">
      <i class="fas fa-exclamation-triangle text-3xl text-danger-400 mb-3"></i>
      <p class="text-body text-danger-500">{{ loadError }}</p>
      <AppButton variant="secondary" size="sm" class="mt-3" @click="fetchData">
        <i class="fas fa-redo mr-1.5"></i>重试
      </AppButton>
    </div>

    <!-- Content -->
    <template v-else-if="requirement">
      <div class="space-y-6">
        <!-- ── Header: Status + Priority + Title ── -->
        <div class="flex flex-wrap items-center gap-2">
          <AppTag :type="'status-' + requirement.status" />
          <AppTag :type="'priority-' + requirement.priority" />
          <span class="text-label text-gray-400 font-mono ml-1">{{ requirement.code }}</span>
        </div>

        <!-- ── Meta Info Grid ── -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          <div>
            <span class="text-label text-gray-400 block mb-0.5">项目</span>
            <span class="text-body text-gray-700">{{ projectName }}</span>
          </div>
          <div>
            <span class="text-label text-gray-400 block mb-0.5">创建人</span>
            <span class="text-body text-gray-700">{{ requirement.creatorName }}</span>
          </div>
          <div>
            <span class="text-label text-gray-400 block mb-0.5">创建时间</span>
            <span class="text-body text-gray-700">{{ formatDate(requirement.createdAt) }}</span>
          </div>
          <div>
            <span class="text-label text-gray-400 block mb-0.5">计划提测日</span>
            <span class="text-body text-gray-700">{{ requirement.plannedLaunch ? formatDate(requirement.plannedLaunch) : '-' }}</span>
          </div>
          <div>
            <span class="text-label text-gray-400 block mb-0.5">计划上线日</span>
            <span class="text-body text-gray-700">{{ requirement.plannedOnline ? formatDate(requirement.plannedOnline) : '-' }}</span>
          </div>
          <div>
            <span class="text-label text-gray-400 block mb-0.5">更新时间</span>
            <span class="text-body text-gray-700">{{ formatDate(requirement.updatedAt) }}</span>
          </div>
        </div>

        <!-- ── Developers ── -->
        <div v-if="requirement.developers && requirement.developers.length > 0">
          <span class="text-label text-gray-400 block mb-2">开发人员</span>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="dev in requirement.developers"
              :key="dev.id || dev.userId"
              class="inline-flex items-center gap-2 bg-gray-50 rounded px-2.5 py-1.5"
            >
              <AppAvatar :name="dev.userName" size="sm" />
              <span class="text-body text-gray-700">{{ dev.userName }}</span>
              <AppTag :type="'role-' + dev.role" />
            </div>
          </div>
        </div>

        <!-- ── Description ── -->
        <div v-if="requirement.description">
          <span class="text-label text-gray-400 block mb-1">描述</span>
          <p class="text-body text-gray-700 whitespace-pre-wrap leading-relaxed m-0 bg-gray-50 rounded p-3">
            {{ requirement.description }}
          </p>
        </div>

        <!-- ── Tags ── -->
        <div v-if="requirement.tags && requirement.tags.length > 0">
          <span class="text-label text-gray-400 block mb-1.5">标签</span>
          <div class="flex flex-wrap gap-1.5">
            <AppTag
              v-for="tag in requirement.tags"
              :key="tag"
              type="role-frontend"
              class="!bg-gray-100 !text-gray-600"
            >
              {{ tag }}
            </AppTag>
          </div>
        </div>

        <!-- ── Status Transition Buttons ── -->
        <div v-if="availableTransitions.length > 0">
          <span class="text-label text-gray-400 block mb-2">状态流转</span>
          <div class="flex flex-wrap gap-2">
            <AppButton
              v-for="trans in availableTransitions"
              :key="trans.toStatus"
              variant="primary"
              size="sm"
              :loading="transitioning && transitionTarget === trans.toStatus"
              @click="confirmTransition(trans)"
            >
              <i class="fas fa-arrow-right mr-1.5"></i>
              {{ trans.label }}
            </AppButton>
          </div>
        </div>

        <!-- ── Divider ── -->
        <hr class="border-gray-100" />

        <!-- ── Status Transition Audit Timeline ── -->
        <div>
          <h4 class="text-title text-gray-700 m-0 mb-3 flex items-center gap-2">
            <i class="fas fa-history text-gray-400 text-sm"></i>
            操作记录
          </h4>

          <!-- Timeline empty -->
          <div v-if="transitions.length === 0" class="py-6 text-center">
            <i class="fas fa-clock text-2xl text-gray-200 mb-2"></i>
            <p class="text-body text-gray-400">暂无操作记录</p>
          </div>

          <!-- Timeline list -->
          <div v-else class="space-y-2">
            <AppCard v-for="t in transitions" :key="t.id">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-3 min-w-0">
                  <AppAvatar :name="t.operatorName" size="sm" class="mt-0.5 shrink-0" />
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-sm font-medium text-gray-700">{{ t.operatorName }}</span>
                      <span v-if="t.fromStatus" class="text-label text-gray-400 mx-0.5">
                        <AppTag :type="'status-' + t.fromStatus" class="!text-xs" />
                        <i class="fas fa-arrow-right text-xs mx-1 text-gray-300"></i>
                        <AppTag :type="'status-' + t.toStatus" class="!text-xs" />
                      </span>
                      <span v-else class="text-label text-gray-400">创建需求</span>
                    </div>
                    <p v-if="t.comment" class="text-sm text-gray-500 mt-1 m-0 leading-relaxed">
                      {{ t.comment }}
                    </p>
                  </div>
                </div>
                <span class="text-label text-gray-400 whitespace-nowrap shrink-0 mt-1">{{ formatDateTime(t.createdAt) }}</span>
              </div>
            </AppCard>
          </div>
        </div>

        <!-- ── Divider ── -->
        <hr class="border-gray-100" />

        <!-- ── Comments Section ── -->
        <div>
          <h4 class="text-title text-gray-700 m-0 mb-3 flex items-center gap-2">
            <i class="fas fa-comments text-gray-400 text-sm"></i>
            评论
            <span v-if="comments.length > 0" class="text-label text-gray-400 font-normal">
              ({{ comments.length }})
            </span>
          </h4>

          <!-- Comments empty -->
          <div v-if="comments.length === 0" class="py-6 text-center">
            <i class="fas fa-comment-dots text-2xl text-gray-200 mb-2"></i>
            <p class="text-body text-gray-400">暂无评论</p>
          </div>

          <!-- Comments list -->
          <div v-else class="space-y-4 mb-4">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="flex gap-3"
            >
              <AppAvatar :name="comment.authorName" size="sm" class="mt-0.5 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-body font-medium text-gray-700">{{ comment.authorName }}</span>
                  <span class="text-label text-gray-400">{{ formatDateTime(comment.createdAt) }}</span>
                </div>
                <div
                  class="text-body text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
                  v-html="highlightMentions(comment.content, comment.mentions)"
                ></div>
              </div>
            </div>
          </div>

          <!-- Add Comment Input -->
          <div class="flex items-start gap-3 pt-3 border-t border-gray-100">
            <AppAvatar :name="currentUserName" size="sm" class="mt-1 shrink-0" />
            <div class="flex-1 min-w-0">
              <textarea
                v-model="newComment"
                class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[60px] resize-none"
                placeholder="输入评论... 使用 @用户名 提及他人"
                rows="2"
                @keydown.ctrl.enter="handleAddComment"
                @keydown.meta.enter="handleAddComment"
              ></textarea>
              <div class="flex items-center justify-between mt-1.5">
                <span v-if="commentError" class="text-xs text-danger-500">{{ commentError }}</span>
                <span v-else></span>
                <AppButton
                  variant="primary"
                  size="sm"
                  :loading="commentSubmitting"
                  :disabled="!newComment.trim()"
                  @click="handleAddComment"
                >
                  <i class="fas fa-paper-plane mr-1.5"></i>
                  发送
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Footer ── -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <AppButton variant="ghost" size="sm" @click="openEditModal">
            <i class="fas fa-edit mr-1.5"></i>编辑
          </AppButton>
          <AppButton variant="danger" size="sm" :loading="deleting" @click="showDeleteConfirm = true">
            <i class="fas fa-trash-alt mr-1.5"></i>
            删除
          </AppButton>
        </div>
        <AppButton variant="secondary" @click="$emit('update:visible', false)">
          关闭
        </AppButton>
      </div>
    </template>
  </AppModal>

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
          确定要删除需求「{{ requirement?.code }} - {{ requirement?.title }}」吗？
        </p>
        <p class="text-sm text-gray-400 mt-1">删除后不可恢复。</p>
      </div>
    </div>
    <template #footer>
      <AppButton variant="secondary" @click="showDeleteConfirm = false">取消</AppButton>
      <AppButton variant="danger" :loading="deleting" @click="confirmDelete">确认删除</AppButton>
    </template>
  </AppModal>

  <!-- ── Edit Form Modal ── -->
  <AppModal
    :visible="showEditModal"
    title="编辑需求"
    width="640px"
    @update:visible="showEditModal = $event"
  >
    <form @submit.prevent="handleEditSubmit" class="space-y-5">
      <AppInput
        v-model="editForm.title"
        label="标题"
        placeholder="请输入需求标题"
        :error="editErrors.title"
      />
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">描述</label>
        <textarea
          v-model="editForm.description"
          class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[80px] resize-vertical"
          placeholder="请输入需求描述（选填）"
          rows="3"
        ></textarea>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">项目</label>
          <div class="text-body text-gray-700 py-2 px-3 bg-gray-50 rounded border border-gray-200">
            {{ projectName }}
          </div>
        </div>
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">优先级</label>
          <select
            v-model="editForm.priority"
            class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white appearance-none"
          >
            <option value="" disabled>请选择优先级</option>
            <option v-for="p in priorityOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">计划提测日</label>
          <input
            v-model="editForm.plannedLaunch"
            type="date"
            class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="block text-body text-gray-700 mb-1.5 font-medium">计划上线日</label>
          <input
            v-model="editForm.plannedOnline"
            type="date"
            class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">标签</label>
        <input
          v-model="editTagsInput"
          class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          placeholder="多个标签用逗号分隔，如：前端, 性能优化"
          @blur="parseEditTags"
        />
        <div v-if="editForm.tags.length > 0" class="flex flex-wrap gap-1.5 mt-2">
          <AppTag
            v-for="(tag, ti) in editForm.tags"
            :key="ti"
            type="role-frontend"
            class="!bg-gray-100 !text-gray-600"
          >
            {{ tag }}
          </AppTag>
        </div>
      </div>
      <div v-if="editErrors.form" class="text-sm text-danger-500">
        {{ editErrors.form }}
      </div>
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <AppButton variant="secondary" @click="showEditModal = false">取消</AppButton>
        <AppButton variant="primary" :loading="editSubmitting" type="submit">保存</AppButton>
      </div>
    </form>
  </AppModal>

  <!-- ── Transition Confirm Modal ── -->
  <AppModal
    :visible="showTransitionConfirm"
    title="确认状态变更"
    width="440px"
    @update:visible="showTransitionConfirm = $event"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 py-2">
        <AppTag v-if="pendingTransition" :type="'status-' + requirement?.status" />
        <i class="fas fa-arrow-right text-gray-300"></i>
        <AppTag v-if="pendingTransition" :type="'status-' + pendingTransition.toStatus" />
        <span v-if="pendingTransition" class="text-body text-gray-700 font-medium">{{ pendingTransition.label }}</span>
      </div>
      <div>
        <label class="block text-body text-gray-700 mb-1.5 font-medium">备注（选填）</label>
        <textarea
          v-model="transitionComment"
          class="w-full rounded border border-gray-300 px-3 py-2 text-body text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[60px] resize-vertical"
          placeholder="请输入变更备注..."
          rows="2"
        ></textarea>
      </div>
    </div>
    <template #footer>
      <AppButton variant="secondary" @click="showTransitionConfirm = false">取消</AppButton>
      <AppButton variant="primary" :loading="transitioning" @click="confirmTransitionAction">确认变更</AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  STATUS_FLOW,
  Priority,
  PRIORITY_LABELS,
} from '@pm-system/shared'
import type {
  RequirementStatus,
  Requirement,
  Comment,
  StatusTransition,
  StatusFlowItem,
} from '@pm-system/shared'
import { useRequirementsStore } from '@/stores/requirements'
import { useProjectsStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { getComments, createComment } from '@/api/comments'
import { getTransitions } from '@/api/requirements'

// ── Props ──
const props = withDefaults(defineProps<{
  visible: boolean
  requirementId: string
}>(), {
  visible: false,
  requirementId: '',
})

// ── Emits ──
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'deleted', id: string): void
  (e: 'updated', requirement: Requirement): void
}>()

// ── Stores ──
const requirementsStore = useRequirementsStore()
const projectsStore = useProjectsStore()
const authStore = useAuthStore()

// ── Requirement State ──
const requirement = ref<Requirement | null>(null)
const loading = ref(false)
const loadError = ref('')

// ── Transitions State ──
const transitions = ref<StatusTransition[]>([])

// ── Comments State ──
const comments = ref<Comment[]>([])
const newComment = ref('')
const commentSubmitting = ref(false)
const commentError = ref('')

// ── Delete State ──
const showDeleteConfirm = ref(false)
const deleting = ref(false)

// ── Edit State ──
const showEditModal = ref(false)
const editSubmitting = ref(false)
const editErrors = ref<Record<string, string>>({})
const editTagsInput = ref('')

interface EditFormData {
  title: string
  description: string
  projectId: string
  priority: string
  plannedLaunch: string
  plannedOnline: string
  tags: string[]
}

const editForm = ref<EditFormData>({
  title: '',
  description: '',
  projectId: '',
  priority: '',
  plannedLaunch: '',
  plannedOnline: '',
  tags: [],
})

// ── Transition State ──
const showTransitionConfirm = ref(false)
const pendingTransition = ref<StatusFlowItem | null>(null)
const transitionComment = ref('')
const transitioning = ref(false)
const transitionTarget = ref<string | null>(null)

// ── Computed ──
const currentUserName = computed(() => authStore.user?.name ?? '我')

const projectName = computed(() => {
  if (!requirement.value) return '-'
  return projectsStore.projects.find((p) => p.id === requirement.value!.projectId)?.name || '-'
})

const projectOptions = computed(() =>
  projectsStore.projects.map((p) => ({ label: p.name, value: p.id }))
)

const priorityOptions = computed(() =>
  Object.values(Priority).map((p) => ({
    label: PRIORITY_LABELS[p],
    value: p,
  }))
)

/**
 * Available transitions based on current status, user role, and assignment.
 */
const availableTransitions = computed<StatusFlowItem[]>(() => {
  if (!requirement.value || !authStore.user) return []
  const currentStatus = requirement.value.status as RequirementStatus
  const flow = STATUS_FLOW[currentStatus]
  if (!flow || flow.length === 0) return []

  return flow.filter((item) => {
    // Role check
    if (item.requiredRole !== authStore.user!.role) return false
    // Developer check
    if (item.requireDeveloper) {
      if (!requirement.value!.developers || requirement.value!.developers.length === 0) return false
      const isAssigned = requirement.value!.developers.some((d) => d.userId === authStore.user!.id)
      if (!isAssigned) return false
    }
    return true
  })
})

// ── Data Fetching ──
async function fetchData() {
  if (!props.requirementId) return
  loading.value = true
  loadError.value = ''
  try {
    const [req, trans, comm] = await Promise.all([
      requirementsStore.fetchRequirement(props.requirementId),
      getTransitions(props.requirementId),
      getComments(props.requirementId),
    ])
    requirement.value = req
    transitions.value = trans
    comments.value = comm
  } catch (err: any) {
    loadError.value = err?.message || '加载需求详情失败'
    requirement.value = null
    transitions.value = []
    comments.value = []
  } finally {
    loading.value = false
  }
}

// ── Delete ──
async function confirmDelete() {
  if (!requirement.value) return
  deleting.value = true
  try {
    await requirementsStore.deleteRequirement(requirement.value.id)
    showDeleteConfirm.value = false
    emit('deleted', requirement.value.id)
    emit('update:visible', false)
  } catch {
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}

// ── Edit ──
function openEditModal() {
  if (!requirement.value) return
  editForm.value = {
    title: requirement.value.title,
    description: requirement.value.description || '',
    projectId: requirement.value.projectId,
    priority: requirement.value.priority,
    plannedLaunch: requirement.value.plannedLaunch
      ? requirement.value.plannedLaunch.slice(0, 10)
      : '',
    plannedOnline: requirement.value.plannedOnline
      ? requirement.value.plannedOnline.slice(0, 10)
      : '',
    tags: [...requirement.value.tags],
  }
  editTagsInput.value = requirement.value.tags.join(', ')
  editErrors.value = {}
  showEditModal.value = true
}

function parseEditTags() {
  if (editTagsInput.value.trim()) {
    editForm.value.tags = editTagsInput.value
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean)
  } else {
    editForm.value.tags = []
  }
}

function validateEditForm(): boolean {
  const errors: Record<string, string> = {}
  if (!editForm.value.title.trim()) errors.title = '标题不能为空'
  editErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleEditSubmit() {
  parseEditTags()
  if (!validateEditForm()) return
  editSubmitting.value = true
  try {
    const updated = await requirementsStore.updateRequirement(props.requirementId, {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim() || undefined,
      priority: editForm.value.priority as any,
      plannedLaunch: editForm.value.plannedLaunch || undefined,
      plannedOnline: editForm.value.plannedOnline || undefined,
      tags: editForm.value.tags.length > 0 ? editForm.value.tags : undefined,
    })
    requirement.value = updated
    showEditModal.value = false
    emit('updated', updated)
  } catch (err: any) {
    editErrors.value.form = err?.message || '操作失败，请重试'
  } finally {
    editSubmitting.value = false
  }
}

// ── Transition ──
function confirmTransition(item: StatusFlowItem) {
  pendingTransition.value = item
  transitionComment.value = ''
  showTransitionConfirm.value = true
}

async function confirmTransitionAction() {
  if (!pendingTransition.value || !requirement.value) return
  transitioning.value = true
  transitionTarget.value = pendingTransition.value.toStatus
  try {
    const updated = await requirementsStore.transitionStatus(requirement.value.id, {
      toStatus: pendingTransition.value.toStatus,
      comment: transitionComment.value.trim() || undefined,
    })
    requirement.value = updated
    emit('updated', updated)
    showTransitionConfirm.value = false
    pendingTransition.value = null
    transitionComment.value = ''
    // Refresh transitions
    transitions.value = await getTransitions(requirement.value.id)
  } catch (err: any) {
    // Error is handled by store
  } finally {
    transitioning.value = false
    transitionTarget.value = null
  }
}

// ── Comments ──
async function handleAddComment() {
  const content = newComment.value.trim()
  if (!content || !requirement.value) return
  commentSubmitting.value = true
  commentError.value = ''
  try {
    const created = await createComment(requirement.value.id, content)
    comments.value.push(created)
    newComment.value = ''
  } catch (err: any) {
    commentError.value = err?.message || '发送评论失败'
  } finally {
    commentSubmitting.value = false
  }
}

// ── Helpers ──
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return dateStr.slice(0, 10)
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

/**
 * Highlight @mentions in comment content with styled spans.
 * Backend already returns parsed mentions; we match the names from the mentions array.
 */
function highlightMentions(content: string, mentions: Comment['mentions']): string {
  if (!mentions || mentions.length === 0) return escapeHtml(content)
  let result = escapeHtml(content)
  // Sort by name length descending to avoid partial overlap
  const sorted = [...mentions].sort((a, b) => b.name.length - a.name.length)
  for (const m of sorted) {
    const escapedName = escapeHtml(m.name)
    const pattern = new RegExp(`@${escapedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w\\u4e00-\\u9fff])`, 'g')
    result = result.replace(
      pattern,
      `<span class="text-primary-600 font-medium bg-primary-50 rounded-sm px-0.5">@${escapedName}</span>`,
    )
  }
  return result
}

function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// ── Watchers ──
watch(
  () => props.visible,
  (val) => {
    if (val && props.requirementId) {
      fetchData()
    }
    if (!val) {
      // Reset state on close
      requirement.value = null
      transitions.value = []
      comments.value = []
      newComment.value = ''
      showDeleteConfirm.value = false
      showTransitionConfirm.value = false
      showEditModal.value = false
      pendingTransition.value = null
      transitionComment.value = ''
      loadError.value = ''
      commentError.value = ''
      editErrors.value = {}
    }
  },
)
</script>
