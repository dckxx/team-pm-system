import type {
  Priority,
  RequirementStatus,
  UserRole,
  DevRole,
} from './enums.js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  devRoles: DevRole[];
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  leadId: string;
  leadName: string;
  isActive: boolean;
  requirementCount: number;
  createdAt: string;
}

export interface RequirementDeveloper {
  id: string;
  requirementId: string;
  userId: string;
  userName: string;
  role: DevRole;
}

export interface Requirement {
  id: string;
  code: string;
  title: string;
  description: string;
  projectId: string;
  priority: Priority;
  status: RequirementStatus;
  creatorId: string;
  creatorName: string;
  plannedLaunch: string | null;
  plannedOnline: string | null;
  actualDevStart: string | null;
  actualDevEnd: string | null;
  actualTestStart: string | null;
  actualTestEnd: string | null;
  actualOnline: string | null;
  tags: string[];
  developers: RequirementDeveloper[];
  version: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Mention {
  userId: string;
  name: string;
}

export interface Comment {
  id: string;
  requirementId: string;
  authorId: string;
  authorName: string;
  content: string;
  mentions: Mention[];
  createdAt: string;
}

export interface StatusTransition {
  id: string;
  requirementId: string;
  fromStatus: RequirementStatus | null;
  toStatus: RequirementStatus;
  operatorId: string;
  operatorName: string;
  comment: string | null;
  createdAt: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface ChartTrendItem {
  date: string;
  created: number;
  launched: number;
}

export interface DashboardStats {
  totalRequirements: number;
  pendingReview: number;
  developing: number;
  testing: number;
  launched: number;
  myTasks: number;
  avgCycleTime: number | null;
}

export interface ReportData {
  statusDistribution: ChartDataItem[];
  priorityDistribution: ChartDataItem[];
  trend: ChartTrendItem[];
}

export interface KanbanColumn {
  status: RequirementStatus;
  title: string;
  items: Requirement[];
}

export interface KanbanDeveloper {
  userId: string;
  userName: string;
  items: Requirement[];
}

export interface KanbanData {
  byStatus: KanbanColumn[];
  byDeveloper: KanbanDeveloper[];
}

export interface UpcomingItem {
  id: string;
  code: string;
  title: string;
  status: RequirementStatus;
  plannedLaunch: string;
  overdue: boolean;
}
