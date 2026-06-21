import { z } from 'zod';
import { Priority, RequirementStatus, DevRole } from './enums.js';

// ── Individual field schemas ──────────────────────────────────────────

export const requirementCodeSchema = z
  .string()
  .regex(/^REQ-\d{4}-\d{3}$/, '格式须为 REQ-{YYYY}-{NNN}');

// ── Auth ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 个字符'),
});

// ── Requirement CRUD ──────────────────────────────────────────────────

const developerAssignmentSchema = z.object({
  userId: z.string().min(1),
  role: z.nativeEnum(DevRole),
});

export const createRequirementSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 个字符'),
  description: z.string().optional(),
  projectId: z.string().min(1, '项目 ID 不能为空'),
  priority: z.nativeEnum(Priority),
  plannedLaunch: z.string().optional(),
  plannedOnline: z.string().optional(),
  tags: z.array(z.string()).optional(),
  developerIds: z.array(developerAssignmentSchema).optional(),
});

export const updateRequirementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  plannedLaunch: z.string().optional(),
  plannedOnline: z.string().optional(),
  tags: z.array(z.string()).optional(),
  developerIds: z.array(developerAssignmentSchema).optional(),
});

// ── Status transition ─────────────────────────────────────────────────

export const transitionSchema = z.object({
  toStatus: z.nativeEnum(RequirementStatus),
  version: z.number().int('版本号须为整数'),
  comment: z.string().optional(),
});

// ── Comment ───────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, '评论内容不能为空')
    .max(2000, '评论最多 2000 个字符'),
  mentions: z
    .array(
      z.object({
        userId: z.string().min(1),
        name: z.string().min(1),
      })
    )
    .optional(),
});

// ── Pagination ────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, '页码须大于等于 1'),
  pageSize: z.coerce
    .number()
    .refine((v) => [10, 20, 50].includes(v), '每页数量须为 10、20 或 50'),
});

// ── Derived types ─────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
export type UpdateRequirementInput = z.infer<typeof updateRequirementSchema>;
export type TransitionInput = z.infer<typeof transitionSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
