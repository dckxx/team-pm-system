import { Priority, RequirementStatus, UserRole, DevRole } from './enums.js';

export interface StatusFlowItem {
  toStatus: RequirementStatus;
  requiredRole: UserRole;
  requireDeveloper: boolean;
  label: string;
}

/**
 * State machine: defines allowed transitions from each requirement status.
 * Keyed by the current status; each entry lists the possible next states.
 */
export const STATUS_FLOW: Record<RequirementStatus, StatusFlowItem[]> = {
  [RequirementStatus.PENDING_REVIEW]: [
    {
      toStatus: RequirementStatus.DEVELOPING,
      requiredRole: UserRole.PM,
      requireDeveloper: false,
      label: '开始开发',
    },
  ],
  [RequirementStatus.DEVELOPING]: [
    {
      toStatus: RequirementStatus.TESTING,
      requiredRole: UserRole.DEV,
      requireDeveloper: true,
      label: '提交测试',
    },
  ],
  [RequirementStatus.TESTING]: [
    {
      toStatus: RequirementStatus.LAUNCHED,
      requiredRole: UserRole.PM,
      requireDeveloper: false,
      label: '确认上线',
    },
  ],
  [RequirementStatus.LAUNCHED]: [],
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.P0]: '紧急',
  [Priority.P1]: '高',
  [Priority.P2]: '中',
  [Priority.P3]: '低',
};

export const STATUS_LABELS: Record<RequirementStatus, string> = {
  [RequirementStatus.PENDING_REVIEW]: '待评审',
  [RequirementStatus.DEVELOPING]: '开发中',
  [RequirementStatus.TESTING]: '测试中',
  [RequirementStatus.LAUNCHED]: '已上线',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.PM]: '项目经理',
  [UserRole.DEV]: '开发人员',
};

export const DEV_ROLE_LABELS: Record<DevRole, string> = {
  [DevRole.FRONTEND]: '前端',
  [DevRole.BACKEND]: '后端',
  [DevRole.DATA]: '数据',
};
