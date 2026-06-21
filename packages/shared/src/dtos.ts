import type { Priority, RequirementStatus, UserRole, DevRole } from './enums.js';
import type { Mention } from './types.js';

// Auth
export interface LoginDto {
  email: string;
  password: string;
}

// Requirement CRUD
export interface DeveloperAssignment {
  userId: string;
  role: DevRole;
}

export interface CreateRequirementDto {
  title: string;
  description?: string;
  projectId: string;
  priority: Priority;
  plannedLaunch?: string;
  plannedOnline?: string;
  tags?: string[];
  developerIds?: DeveloperAssignment[];
}

export interface UpdateRequirementDto {
  title?: string;
  description?: string;
  priority?: Priority;
  plannedLaunch?: string;
  plannedOnline?: string;
  tags?: string[];
  developerIds?: DeveloperAssignment[];
}

// Status transition
export interface TransitionDto {
  toStatus: RequirementStatus;
  version: number;
  comment?: string;
}

// Comment
export interface CommentMention {
  userId: string;
  name: string;
}

export interface CreateCommentDto {
  content: string;
  mentions?: CommentMention[];
}

// Query / Pagination
export interface RequirementQueryDto {
  status?: RequirementStatus;
  priority?: Priority;
  projectId?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export interface PaginationDto {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationDto;
}

// User profile update
export interface UpdateUserDto {
  role?: UserRole;
  devRoles?: DevRole[];
  isActive?: boolean;
}
