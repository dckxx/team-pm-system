# 原型→产品级项目：团队项目管理系统

## TL;DR

> **Quick Summary**: 将单文件 HTML 原型（2000+行静态 mock）改造为 Vue 3 + NestJS 全栈 Monorepo 应用，覆盖 PRD 全部 6 个模块（仪表盘、需求管理、看板、团队、报表、最近投产），含 JWT 认证、RBAC 权限、审计日志、响应式布局。

> **Deliverables**:
> - Monorepo 项目骨架（pnpm workspace）
> - `packages/shared` — 共享类型、枚举、DTO、Zod 校验模式
> - `packages/backend` — NestJS REST API（10+ 端点，Prisma ORM，JWT 认证）
> - `packages/frontend` — Vue 3 SPA（6 个视图，Pinia 状态管理，Tailwind 设计系统）
> - Docker 开发环境（docker-compose）
> - Prisma 种子数据（5 用户 + 3 项目 + 17 需求）
> - 测试（Vitest + Jest）+ E2E QA（Playwright + curl）

> **Estimated Effort**: XL（35 个任务 + 4 个终审，7 个并行波次）
> **Parallel Execution**: YES — 7 波次，最大并发 10
> **Critical Path**: Monorepo 骨架 → Prisma Schema → Auth → Requirement CRUD → Frontend 视图 → 集成验证

---

## Context

### Original Request
用户：*"目前只是原型html, 所以现在根据已有的涉及规范和PRD,还有原型html来生成一个产品级项目"*

### Interview Summary
**Key Discussions**:
- 前端：Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia
- 后端：NestJS + TypeScript + Prisma + Passport(JWT)
- 数据库：SQLite（开发）/ Turso LibSQL（生产）
- 部署：Docker 容器
- 范围：全量 MVP（M1-M6 全部模块），超出 PRD 原本的 Phase 1 范围
- 测试：测试后补（Vitest 前端 + Jest 后端），Agent QA 必选

**Research Findings**:
- HTML 原型包含 5 个侧边栏导航 + 最近投产侧栏面板 + 4 个模态弹窗（创建/详情/删除/确认）
- 原型有 17 条示例需求、5 个用户、3 个项目，可作为种子数据
- 设计系统已有 9 个组件定义（Button, Tag, Card, Input, Table, Nav, Modal, KanbanCard, Avatar）
- PRD 定义了完整状态机、数据模型（5 实体）、RBAC 规则

### Metis Review
**Identified Gaps**（已融入计划）:
- developers JSON 字段 → 正规划为关联表 `RequirementDeveloper`
- 种子数据策略 → 任务 4：Prisma seed script
- API 契约缺失 → 任务 2：共享 DTO/types 即契约
- M4/M5/M6 验收标准 → 融入对应任务
- 软删除全局中间件 → 任务 13
- 并发状态变更乐观锁 → 任务 14
- @提及通知简化 → 仅存储+展示，不做实时推送

---

## Work Objectives

### Core Objective
将 HTML 原型转换为功能完整、可部署的产品级全栈单体应用，所有 PRD 定义的模块均可交互运行，包含认证、权限、审计。

### Concrete Deliverables
- `packages/shared/src/` — types.ts, enums.ts, dtos.ts, constants.ts, validators.ts
- `packages/backend/src/` — auth/, users/, projects/, requirements/, comments/, reports/, dashboard/
- `packages/backend/prisma/` — schema.prisma, seed.ts, migrations/
- `packages/frontend/src/` — views/（6 个）, components/（12+）, stores/（5 个）, router/
- `docker-compose.yml`, `Dockerfile.frontend`, `Dockerfile.backend`
- `.omo/evidence/` — 全部 QA 场景证据

### Definition of Done
- [ ] `pnpm dev` 一键启动前后端 + 数据库
- [ ] `bun run prisma:seed` 填充测试数据
- [ ] 登录（5 个用户均可）→ 仪表盘显示正确的统计数据
- [ ] 需求 CRUD 全流程：创建 → 列表筛选 → 详情评论 → 状态流转 → 软删除
- [ ] 看板拖拽流转（二次确认、越权阻止）
- [ ] 团队管理 + 统计报表（图表正确渲染）
- [ ] `docker-compose up` 一键部署
- [ ] 全部 37 个 QA 场景通过

### Must Have
- 完整的需求 CRUD API（含状态流转、乐观锁、审计日志）
- JWT 认证 + RBAC 权限（PM/Dev 角色分离）
- 所有 6 个前端视图（仪表盘、需求、看板、团队、报表、最近投产）
- Prisma 种子数据（与原型一致的 17 条需求）
- 设计令牌注入 Tailwind（颜色/阴影/字体/圆角与 DESIGN.md 一致）
- 软删除（需求编辑/删除保留审计追踪）
- 响应式布局（3 个断点：≥1024, 768-1023, <768）

### Must NOT Have (Guardrails)
- **NO** WebSocket/SSE/实时推送 — @提及仅存储+页面展示
- **NO** 文件上传/附件/富媒体
- **NO** 看板自定义列/泳道 — 固定 4 状态列
- **NO** 暗黑模式
- **NO** 批量操作（批量更新/删除）
- **NO** 通知中心/活动摘要
- **NO** Swagger/OpenAPI UI
- **NO** i18n 基础设施 — 全中文
- **NO** 跨包引用（frontend ⇏ backend, backend ⇏ frontend）
- **NO** JSON 列存储 developers 关系 — 必须用关联表
- **NO** 手写 CRUD 样板代码 — 用 NestJS CLI + Prisma 生成器

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO（项目当前无测试基础设施）
- **Automated tests**: Tests-after（功能完成后补测试）
- **Framework**: Vitest（前端）+ Jest（后端）+ Playwright（E2E QA）
- **Setup**: 在项目骨架阶段安装测试依赖，功能开发完成后写入测试

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright — 导航、交互、断言 DOM、截图
- **API/Backend**: Bash (curl) — 发送请求、断言状态码 + 响应字段
- **CLI/Database**: Bash (prisma studio/sqlite) — 查询验证数据一致性

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1（立即开始 — 项目骨架 + 基础设施，最大并行）:
├── Task 1: Monorepo 骨架搭建 [quick]
├── Task 2: Shared 共享类型包 [quick]
├── Task 3: Prisma Schema + 迁移 [quick]
├── Task 4: Prisma 种子脚本 [quick]
├── Task 5: NestJS 项目脚手架 [quick]
├── Task 6: Vue 3 项目脚手架 [quick]
├── Task 7: Tailwind 设计令牌注入 [quick]
├── Task 8: Docker 开发环境 [quick]

Wave 2（Wave 1 完成后 — 后端核心，最大并行）:
├── Task 9: Auth 认证模块 [quick]
├── Task 10: User 用户模块 [quick]
├── Task 11: Project 项目模块 [quick]
├── Task 12: RBAC 权限守卫 [quick]
├── Task 13: Prisma 软删除中间件 [quick]

Wave 3（Wave 2 完成后 — 后端功能，最大并行）:
├── Task 14: Requirement CRUD + 状态流转 + 乐观锁 [deep]
├── Task 15: Comment 评论模块 + @提及 [dead]
├── Task 16: StatusTransition 审计日志 [quick]
├── Task 17: Dashboard + Reports 统计端点 [quick]
├── Task 18: CSV 导出端点 [quick]

Wave 4（Wave 1 完成后，可与 Wave 2-3 并行 — 前端基础）:
├── Task 19: Vue Router + 布局组件 [visual-engineering]
├── Task 20: API Client + Axios 拦截器 [quick]
├── Task 21: Pinia 状态管理 stores [quick]
├── Task 22: 全局基础组件库 [visual-engineering]

Wave 5（Wave 4 + Wave 3 完成后 — 前端核心视图，最大并行）:
├── Task 23: 登录页 + 认证流程 [visual-engineering]
├── Task 24: 仪表盘视图 [visual-engineering]
├── Task 25: 需求列表 + 筛选栏 [visual-engineering]
├── Task 26: 创建/编辑需求表单 [visual-engineering]
├── Task 27: 需求详情 + 评论时间线 [visual-engineering]
├── Task 28: 看板视图（按状态 + 按开发人员）[visual-engineering]

Wave 6（Wave 5 完成后 — 前端辅助视图 + 测试，最大并行）:
├── Task 29: 团队管理视图 [visual-engineering]
├── Task 30: 统计报表视图 [visual-engineering]
├── Task 31: 响应式布局适配 [visual-engineering]
├── Task 32: 前端测试 (Vitest) [quick]
├── Task 33: 后端测试 (Jest) [quick]

Wave 7（Wave 6 完成后 — E2E + Docker，串行）:
├── Task 34: E2E QA 全场景 (Playwright + curl) [deep]
├── Task 35: Docker Compose 终态 + README [quick]

Wave FINAL（所有任务完成后 — 4 并行审查）:
├── Task F1: 计划合规审计 (oracle)
├── Task F2: 代码质量审查 (unspecified-high)
├── Task F3: 实操 QA (unspecified-high)
├── Task F4: 范围保真度检查 (deep)
-> 呈现结果 -> 获得用户明确 okay

Critical Path: Task 1 → Task 3 → Task 5 → Task 9 → Task 14 → Task 25 → Task 34 → F1-F4
Parallel Speedup: ~65% 比顺序快
Max Concurrent: 10（Wave 1）
```

### Dependency Matrix

- **1-8**: — — 9-31, 8（Wave 1 全部独立）
- **9-13**: 1, 3, 5 — 14-18, 5（后端核心，全部依赖骨架）
- **14**: 9, 10, 11, 12, 5 — 15-18, 25-28, 5
- **15**: 9, 14 — 27, 2
- **16**: 14 — 无（审计日志仅供查询）
- **17**: 14 — 24, 30, 2
- **19-22**: 1, 6 — 23-31, 9（前端基础全部独立）
- **23**: 1, 6, 19, 20, 21 — 24, 1
- **24**: 17, 21, 22, 23 — 无
- **25**: 14, 18, 21, 22 — 无
- **26**: 14, 21, 22 — 无
- **27**: 15, 21, 22 — 无
- **28**: 14, 21, 22 — 无
- **29**: 10, 21, 22 — 无
- **30**: 17, 21, 22 — 无
- **31**: 19, 22 — 无
- **32**: 23-31 — 34, 1
- **33**: 9-18 — 34, 1
- **34**: 32, 33 — 35, F1-F4
- **35**: 34 — F1-F4

### Agent Dispatch Summary

- **Wave 1**: 8 — T1-T8 → quick
- **Wave 2**: 5 — T9-T13 → quick
- **Wave 3**: 5 — T14 → deep, T15 → deep, T16-T18 → quick
- **Wave 4**: 4 — T19 → visual-engineering, T20-T21 → quick, T22 → visual-engineering
- **Wave 5**: 6 — T23-T28 → visual-engineering
- **Wave 6**: 5 — T29-T31 → visual-engineering, T32-T33 → quick
- **Wave 7**: 2 — T34 → deep, T35 → quick
- **FINAL**: 4 — F1 → oracle, F2 → unspecified-high, F3 → unspecified-high, F4 → deep

---

## TODOs

- [x] 1. Monorepo 骨架搭建 — pnpm workspace + 根配置

  **做什么**:
  - 创建根目录 `package.json`（`"private": true`, `"workspaces": ["packages/*"]`）
  - 创建 `pnpm-workspace.yaml`，声明 packages
  - 创建根 `tsconfig.base.json`（strict, ES2022, paths 别名 `@pm-system/shared`）
  - 创建根 `.eslintrc.cjs`（TypeScript + Vue 规则）
  - 创建根 `.prettierrc`（semi: true, singleQuote: true, tabWidth: 2）
  - `packages/shared/`, `packages/backend/`, `packages/frontend/` 目录 + 各自的 `package.json`
  - 安装根依赖：`typescript`, `eslint`, `prettier`, `turbo`（可选 monorepo 编排）
  - `.gitignore` 追加：`node_modules/`, `dist/`, `*.db`, `.env`

  **禁止做**:
  - 不写任何业务代码（类型、组件、端点 — 这些属于后续任务）
  - 不装框架特定依赖（Vue, NestJS, Prisma — 各子包独立管理）

  **推荐 Agent 配置**:
  - **类别**: `quick`
  - **技能**: `[]`

  **并行化**:
  - **可并行**: YES
  - **并行组**: Wave 1（与 Tasks 2-8 并行）
  - **阻塞**: Tasks 2-35（全部依赖此骨架）
  - **被阻塞**: None

  **参考**:
  - `pnpm workspace 官方文档`: https://pnpm.io/workspaces — workspace 配置语法
  - `PRD-team-project-management.md:1-58` — 项目上下文确认命名
  - `DESIGN.md` — 确认项目名为「团队项目管理系统」

  **验收标准**:
  - [ ] `pnpm install` 在根目录执行无错误
  - [ ] `packages/shared/package.json` 存在，name 为 `@pm-system/shared`
  - [ ] `packages/backend/package.json` 存在，name 为 `@pm-system/backend`
  - [ ] `packages/frontend/package.json` 存在，name 为 `@pm-system/frontend`

  **QA 场景**:
  ```
  场景: Monorepo 结构验证
    工具: Bash
    前置条件: 根目录执行 pnpm 可用
    步骤:
      1. Test-Path "packages/shared/package.json" → True
      2. Test-Path "packages/backend/package.json" → True
      3. Test-Path "packages/frontend/package.json" → True
      4. pnpm install → 无错误退出码 0
    预期结果: 三包子包 package.json 存在，pnpm install 成功
    失败指示: pnpm install 报错、目录缺失
    证据: .omo/evidence/task-1-monorepo-scaffold.txt
  ```

  **提交**: YES（与 Task 2 同组）
  - 消息: `chore: init pnpm monorepo with packages scaffold`
  - 文件: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `packages/*/package.json`

- [x] 2. Shared 共享类型包 — 枚举、接口、DTO、常量、校验

  **做什么**:
  - 在 `packages/shared/` 创建完整 TypeScript 类型定义：
  - `src/enums.ts`：Priority(P0/P1/P2/P3), RequirementStatus(pending_review/developing/testing/launched), UserRole(pm/dev), DevRole(frontend/backend/data)
  - `src/types.ts`：User, Project, Requirement, Comment, StatusTransition, RequirementDeveloper（关联表类型）
  - `src/dtos.ts`：CreateRequirementDto, UpdateRequirementDto, CreateCommentDto, LoginDto, PaginationDto, RequirementQueryDto
  - `src/constants.ts`：STATUS_FLOW（状态转换映射 + requiredRole）, PRIORITY_LABELS, STATUS_LABELS, ROLE_LABELS
  - `src/validators.ts`：Zod schema —— createRequirementSchema, updateRequirementSchema, loginSchema, paginationSchema, requirementCodeSchema（REQ-{YYYY}-{NNN} regex）
  - `src/index.ts`：统一导出
  - `package.json` 配置 `"main": "src/index.ts"`, `"types": "src/index.ts"`

  **禁止做**:
  - 不包含任何运行时逻辑（仅类型 + 纯校验）
  - 不引用任何框架（Vue, NestJS 依赖不得出现）
  - 不在 shared 包写 API client

  **推荐 Agent 配置**:
  - **类别**: `quick`
  - **技能**: `[]`

  **并行化**:
  - **可并行**: YES
  - **并行组**: Wave 1（与 Tasks 1, 3-8 并行）
  - **阻塞**: Tasks 3（Prisma 需要枚举）, 9-18（后端全部依赖）, 19-31（前端全部依赖）
  - **被阻塞**: Task 1（骨架目录需存在）

  **参考**:
  - `PRD-team-project-management.md:282-356` — §5 数据模型 / ERD（字段定义权威来源）
  - `PRD-team-project-management.md:361-388` — §6 状态机定义（STATUS_FLOW 常量）
  - `PRD-team-project-management.md:100-107` — M2.1 需求列表字段定义
  - `PRD-team-project-management.md:163-175` — M2.3 创建需求表单字段
  - `.impeccable/design.json:38-77` — 组件语义色编码（Priority/Status/Role 颜色映射）
  - `team-project-management.html:193-242` — 原型 CSS class 命名（priority-p0, status-pending, role-frontend → 枚举值参考）

  **验收标准**:
  - [ ] `pnpm --filter @pm-system/shared build` 编译无错误
  - [ ] 所有枚举值与 PRD 第 6 章状态机定义一致
  - [ ] requirementCodeSchema regex 匹配 `REQ-2025-001`，拒绝 `req-2025-001`
  - [ ] STATUS_FLOW 常量包含 4 个状态 + 允许的转换 + requiredRole

  **QA 场景**:
  ```
  场景: 枚举值完整性验证
    工具: Bash (node REPL)
    前置条件: pnpm --filter @pm-system/shared build 成功
    步骤:
      1. node -e "const e = require('./packages/shared/dist/enums.js'); console.log(Object.keys(e.Priority))"
      2. 验证输出包含 P0, P1, P2, P3
    预期结果: 4 个优先级枚举全部导出
    失败指示: 枚举缺失、编译失败
    证据: .omo/evidence/task-2-enums.txt

  场景: 需求编号正则校验
    工具: Bash (node REPL)
    前置条件: validators.ts 已编译
    步骤:
      1. 测试 validators.requirementCodeSchema.safeParse("REQ-2025-001") → success: true
      2. 测试 validators.requirementCodeSchema.safeParse("req-2025-001") → success: false
    预期结果: 大写 REQ 格式通过，小写拒绝
    证据: .omo/evidence/task-2-code-regex.txt
  ```

  **提交**: YES（与 Task 1 同组）
  - 消息: `feat(shared): add enums, types, DTOs, constants, validators`
  - 文件: `packages/shared/src/*`

- [x] 3. Prisma Schema + 数据库迁移 — 所有实体 + 关联表

  **做什么**:
  - 在 `packages/backend/prisma/schema.prisma` 定义完整数据模型：
  - **User**: id(UUID), name, email(unique), password(hashed), role(PM/Dev), devRoles(JSON——存储预设职能数组), avatarUrl, isActive
  - **Project**: id(UUID), name, description, leadId(FK→User), isActive
  - **Requirement**: 全部 PRD 字段(id, code→unique, title, description, projectId, priority, status, creatorId, planned_*, actual_*, tags(JSON), is_deleted, version(@version 乐观锁), createdAt, updatedAt)
  - **RequirementDeveloper**: junction table(id, requirementId, userId, role(DevRole 枚举), @@unique([requirementId, userId, role]))
  - **Comment**: id, requirementId, authorId, content, mentions(JSON), createdAt
  - **StatusTransition**: id, requirementId, fromStatus, toStatus, operatorId, comment, createdAt
  - 运行 `npx prisma migrate dev --name init` 生成迁移
  - 配置 SQLite 数据源：`datasource db { provider = "sqlite" url = "file:./dev.db" }`

  **禁止做**:
  - **NO** JSON 列存储 developers 关系 —— 必须用 RequirementDeveloper 关联表
  - **NO** `@updatedAt` 在 Requirement 上（用 version 字段做乐观锁，Prisma 会自动处理）
  - **NO** 外键 CASCADE DELETE —— 全部软删除，用中间件处理

  **推荐 Agent 配置**:
  - **类别**: `quick`
  - **技能**: `[]`

  **并行化**:
  - **可并行**: YES
  - **并行组**: Wave 1（与 Tasks 1-2, 4-8 并行，但 Task 2 共享枚举值影响）
  - **阻塞**: Tasks 4（种子脚本依赖 schema）, 9-18（后端全部依赖）
  - **被阻塞**: Task 1（骨架目录）, Task 2（枚举类型参考）

  **参考**:
  - `PRD-team-project-management.md:295-355` — §5 ERD 实体定义（每个实体的完整字段表）
  - `PRD-team-project-management.md:361-388` — §6 状态机（StatusTransition 的 from/to status 枚举值）
  - `Prisma 官方文档 — SQLite`: https://www.prisma.io/docs/orm/overview/databases/sqlite — SQLite provider 配置
  - `Prisma 官方文档 — @version`: https://www.prisma.io/docs/orm/prisma-schema/data-model/attributes#version — 乐观锁字段配置

  **验收标准**:
  - [ ] `npx prisma migrate dev` 执行无错误，生成 `migrations/` 目录
  - [ ] `npx prisma studio` 可打开浏览器查看空数据库
  - [ ] RequirementDeveloper 表有 `@@unique([requirementId, userId, role])` 约束
  - [ ] Requirement 表有 `version Int @default(0)` 字段

  **QA 场景**:
  ```
  场景: 数据库迁移验证
    工具: Bash
    前置条件: NestJS 骨架已存在
    步骤:
      1. cd packages/backend
      2. npx prisma migrate dev --name init → 退出码 0
      3. npx prisma db push --preview-feature → 确认 schema 同步
      4. sqlite3 prisma/dev.db ".tables" → 包含 User, Project, Requirement, RequirementDeveloper, Comment, StatusTransition
    预期结果: 6 张表全部存在，无错误
    失败指示: 迁移失败、表缺失、唯一约束缺失
    证据: .omo/evidence/task-3-schema-migration.txt
  ```

  **提交**: YES
  - 消息: `feat(db): add Prisma schema with all entities and junction table`
  - 文件: `packages/backend/prisma/schema.prisma`, `packages/backend/prisma/migrations/*`

- [x] 4. Prisma 种子脚本 — 原型数据填充

  **做什么**:
  - 创建 `packages/backend/prisma/seed.ts`：种子数据来源 `team-project-management.html`
  - 5 用户：张明(pm), 李浩(dev/frontend), 王婷(dev/frontend+backend), 陈伟(dev/backend), 刘洋(dev/data)，密码统一 bcrypt hash
  - 5 项目：支付中台、用户增长、数据平台、风控系统、商家后台
  - 17 需求：复刻原型表格数据(REQ-2025-001~017)，含 RequirementDeveloper 关联
  - 添加 `"prisma": { "seed": "ts-node prisma/seed.ts" }` 到 backend package.json

  **禁止做**: NO 明文密码；NO 创造原型不存在的假数据

  **推荐 Agent 配置**: `quick`

  **并行化**: Wave 1（Task 3 之后执行）| Blocks: T9-18 | Blocked By: T3

  **参考**: `team-project-management.html:1025-1523` — 17 条需求表格数据; `team-project-management.html:608-650` — 用户职能数据; `team-project-management.html:935-942` — 项目下拉选项

  **验收标准**:
  - [ ] `npx prisma db seed` → 退出码 0
  - [ ] sqlite3: User=5, Requirement=17, RequirementDeveloper≥17

  **QA 场景**:
  ```
  场景: 种子数据完整性验证
    工具: Bash
    步骤:
      1. cd packages/backend && npx prisma db seed → 退出码 0
      2. sqlite3 prisma/dev.db "SELECT COUNT(*) FROM User" → 5
      3. sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Requirement" → 17
      4. sqlite3 prisma/dev.db "SELECT COUNT(*) FROM RequirementDeveloper" → ≥ 17
    证据: .omo/evidence/task-4-seed-data.txt
  ```

  **提交**: YES — `feat(db): add seed script with prototype demo data`

- [x] 5. NestJS 项目脚手架 — PrismaService + 模块壳

  **做什么**:
  - `src/main.ts`（bootstrap, CORS, ValidationPipe）
  - `src/app.module.ts`（导入 PrismaModule + 所有业务模块壳）
  - `src/prisma/prisma.module.ts` + `prisma.service.ts`（全局单例 PrismaService）
  - `nest g resource` 生成 7 模块骨架：auth/users/projects/requirements/comments/dashboard/reports
  - `.env`：DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
  - 安装依赖：@nestjs/*, @prisma/client, passport, passport-jwt, bcryptjs, class-validator

  **禁止做**: NO 业务逻辑（仅空壳模块）

  **推荐 Agent 配置**: `quick`

  **并行化**: Wave 1 并行 | Blocks: T9-18 | Blocked By: T1

  **参考**: NestJS Prisma Recipe: https://docs.nestjs.com/recipes/prisma

  **验收标准**:
  - [ ] `pnpm start:dev` 启动无错误

  **QA 场景**:
  ```
  场景: NestJS 启动验证
    工具: Bash
    步骤: cd packages/backend && npx nest start 2>&1 → 含 "successfully started"
    证据: .omo/evidence/task-5-nestjs-bootstrap.txt
  ```

  **提交**: YES — `feat(backend): scaffold NestJS project with all module shells`

- [x] 6. Vue 3 项目脚手架 — Vite + Router + Pinia + Tailwind 入口

  **做什么**:
  - Vite + Vue 3 + TS 项目初始化
  - `vite.config.ts`：proxy `/api` → `localhost:3000`
  - `src/router/index.ts`：7 路由（/login, /dashboard, /requirements, /kanban, /team, /reports, /→/login）
  - 6 视图占位 + 5 store 占位 + components/ 目录
  - 安装：vue, vue-router, pinia, @vueuse/core, axios, @fortawesome/fontawesome-free

  **禁止做**: NO 视图内容实现（仅占位）

  **推荐 Agent 配置**: `quick`

  **并行化**: Wave 1 并行 | Blocks: T19-31 | Blocked By: T1

  **验收标准**:
  - [ ] `pnpm dev` 启动，7 路由可导航

  **QA 场景**:
  ```
  场景: Vue 开发服务器启动
    工具: Playwright
    步骤: 导航 /login, /dashboard, /requirements, /kanban, /team, /reports → 全部 200 无白屏
    证据: .omo/evidence/task-6-vue-scaffold.png
  ```

  **提交**: YES — `feat(frontend): scaffold Vue 3 project with Vite, Router, Pinia`

- [x] 7. Tailwind 设计令牌注入 — DESIGN.md → tailwind.config.ts

  **做什么**:
  - `tailwind.config.ts` 注入所有设计令牌：5 semantic colors (含 tonal ramp), typography(display/headline/title/body/label), boxShadow(card-hover/modal/dropdown), borderRadius(8px/4px), transitionTimingFunction(ease-standard), screens(sm/md/lg/xl)
  - 创建 `src/assets/main.css`（@tailwind directives + body font-family）
  - 数据来源：`.impeccable/design.json` 为权威来源

  **禁止做**: NO 自定义 CSS class 覆盖 Tailwind（全部走 config 注入）

  **推荐 Agent 配置**: `quick`

  **并行化**: Wave 1 并行 | Blocks: T22-31 | Blocked By: T1, T6

  **参考**: `.impeccable/design.json:6-36` — colorMeta, typographyMeta, shadows, motion, breakpoints; `DESIGN.md` — 设计规范

  **验收标准**:
  - [ ] grep "165DFF" tailwind.config.ts → found
  - [ ] grep "cubic-bezier" tailwind.config.ts → found

  **QA 场景**:
  ```
  场景: 令牌注入验证
    工具: Bash + Playwright
    步骤:
      1. grep "165DFF" packages/frontend/tailwind.config.ts
      2. grep "00B42A" packages/frontend/tailwind.config.ts
      3. Playwright: body bg-primary 渲染 #165DFF
    证据: .omo/evidence/task-7-tailwind-tokens.png
  ```

  **提交**: YES — `feat(frontend): inject design tokens into Tailwind config`

- [x] 8. Docker 开发环境 — docker-compose + Dockerfiles

  **做什么**:
  - 根目录 `docker-compose.yml`：frontend(5173) + backend(3000)
  - `Dockerfile.backend`：node:20-alpine, pnpm, prisma generate, nest start --watch
  - `Dockerfile.frontend`：node:20-alpine, pnpm, vite --host
  - `.dockerignore` + `.env.example`

  **禁止做**: NO 生产级多阶段构建

  **推荐 Agent 配置**: `quick`

  **并行化**: Wave 1 并行 | Blocks: T35 | Blocked By: None

  **验收标准**:
  - [ ] `docker-compose up` → 2 容器 running

  **QA 场景**:
  ```
  场景: Docker 启动
    工具: Bash
    步骤: docker-compose up -d → docker-compose ps → 2 services running
    证据: .omo/evidence/task-8-docker-compose.txt
  ```

  **提交**: YES — `chore: add Docker dev environment`

- [x] 9. Auth 认证模块 — JWT + Passport + 登录

  **做什么**:
  - `auth/auth.module.ts`：导入 PassportModule, JwtModule（secret + expiresIn 从 .env 读取）
  - `auth/auth.controller.ts`：POST /api/auth/login（验证→签发 JWT）
  - `auth/auth.service.ts`：validateUser + login
  - `auth/jwt.strategy.ts`：Passport JWTStrategy（Bearer token → payload 验证）
  - `auth/jwt-auth.guard.ts`：全局 JWT guard（除 /login 外默认鉴权）
  - 登录响应 `{ accessToken, user: { id, name, email, role, devRoles } }`

  **禁止做**: NO 注册端点（种子用户）；NO refresh token

  **推荐 Agent 配置**: `quick`

  **并行化**: Wave 2 并行 | Blocks: T10-18 | Blocked By: T5
  **参考**: NestJS Auth: https://docs.nestjs.com/security/authentication

  **验收标准**:
  - [ ] POST /api/auth/login → 200 + JWT token
  - [ ] 错误密码 → 401；无 token → 401

  **QA 场景**:
  ```
  场景: PM 登录成功
    工具: Bash (curl)
    步骤: curl -X POST localhost:3000/api/auth/login -d '{"email":"zhanglei@example.com","password":"pm123456"}' → 200 + accessToken + user.role=pm
    证据: .omo/evidence/task-9-login.json
  场景: 无效凭据
    工具: Bash (curl)
    步骤: 同上 password=wrong → 401 "Invalid credentials"
    证据: .omo/evidence/task-9-login-fail.txt
  ```

  **提交**: YES — `feat(backend): implement JWT auth with login`

- [x] 10. User 用户模块 — 列表/详情/更新

  **做什么**:
  - GET /api/users（列表含 devRoles + requirementCount）
  - GET /api/users/:id（详情）
  - PATCH /api/users/:id（更新角色/职能/isActive）

  **禁止做**: NO DELETE 用户；NO 密码修改

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 2 并行 | Blocks: T14, T29 | Blocked By: T5, T9

  **验收标准**: GET /api/users → 5 用户
  **QA 场景**:
  ```
  场景: 用户列表
    工具: Bash (curl)
    步骤: curl -H "Authorization: Bearer $TOKEN" localhost:3000/api/users → 200, length=5
    证据: .omo/evidence/task-10-users.json
  ```
  **提交**: YES — `feat(backend): implement users CRUD`

- [x] 11. Project 项目模块 — CRUD

  **做什么**: GET/POST/PATCH /api/projects；每个项目含 id, name, description, leadId, isActive, requirementCount

  **禁止做**: NO DELETE（仅 deactivate）

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 2 并行 | Blocks: T14, T26 | Blocked By: T5

  **QA 场景**: curl GET /api/projects → 200, data.length≥5
  **提交**: YES — `feat(backend): implement projects module`

- [x] 12. RBAC 权限守卫 — @Roles 装饰器 + RolesGuard

  **做什么**:
  - `auth/roles.decorator.ts`：`@Roles('pm')` 装饰器
  - `auth/roles.guard.ts`：根据 user.role 匹配所需角色
  - 权限规则：PM 可流转 pending_review→developing, testing→launched；DEV 仅 developing→testing
  - 应用到各 Controller 敏感端点，未授权→403

  **禁止做**: NO 数据库权限表（MVP 代码枚举）

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 2 并行 | Blocks: T14-18 | Blocked By: T5, T9

  **QA 场景**:
  ```
  场景: DEV 越权上线
    工具: Bash (curl)
    步骤: 李浩 token → PATCH transition to launched → 403
    证据: .omo/evidence/task-12-rbac.txt
  ```
  **提交**: YES — `feat(backend): implement RBAC roles guard`

- [x] 13. Prisma 软删除中间件 — 全局 is_deleted=false 过滤

  **做什么**:
  - PrismaService 注册 `$use` 中间件：Requirement 所有 find* 自动追加 `is_deleted: false`
  - 软删除时设 `is_deleted: true`（保留 Comment + StatusTransition）

  **禁止做**: NO 物理删除；NO CASCADE

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 2 并行 | Blocks: T14 | Blocked By: T3, T5

  **QA 场景**:
  ```
  场景: 软删除不返回
    工具: Bash (curl + sqlite3)
    步骤: 查询→软删除一条→GET 少一条→sqlite3 仍有记录
    证据: .omo/evidence/task-13-soft-delete.txt
  ```
  **提交**: YES — `feat(backend): add Prisma soft-delete middleware`

- [x] 14. Requirement CRUD + 状态流转 + 乐观锁

  **做什么**:
  - `requirements/requirements.controller.ts`：
    - GET /api/requirements（分页/筛选/排序/搜索）— QueryDto
    - GET /api/requirements/:id（详情+developers+comments+transitions）
    - POST /api/requirements（创建+关联 RequirementDeveloper）
    - PATCH /api/requirements/:id（更新基本字段）
    - PATCH /api/requirements/:id/transition（状态流转）
    - GET /api/requirements/kanban（看板数据：按状态+按开发人员聚合）
    - GET /api/requirements/upcoming（最近投产面板）
  - `requirements/requirements.service.ts`：
    - 分页查询：支持 status, priority, projectId, search(标题/编号) 过滤
    - 状态流转：验证 STATUS_FLOW 合法性 + RBAC 权限 + requireDeveloper 检查 + 乐观锁冲突检测（version 字段）
    - 流转成功时记录 StatusTransition
  - 乐观锁：更新时 where 条件含 `version: currentVersion`，Prisma 抛出 P2025 时返回 409 Conflict

  **禁止做**: NO 批量操作；NO 物理删除（全部走中间件软删除）

  **推荐 Agent 配置**: `deep` — 复杂状态机+乐观锁
  **并行化**: Wave 3 并行 | Blocks: T15-18, T25-28 | Blocked By: T9-13

  **参考**: PRD §6 状态机(STATUS_FLOW 映射+requireDeveloper 规则); PRD §5 Requirement ERD; PRD §2 M2.1-M2.4 需求管理AC

  **验收标准**:
  - [ ] POST /api/requirements → 201 + 新需求（code 自动生成 REQ-2026-XXX）
  - [ ] GET /api/requirements?status=developing → 仅返回开发中需求
  - [ ] 流转 developing→testing（DEV 执行）→ 200 + StatusTransition 记录
  - [ ] 并发流转冲突 → 409 Conflict
  - [ ] 越权流转 → 403

  **QA 场景**:
  ```
  场景: 创建需求
    工具: Bash (curl)
    步骤: POST /api/requirements -d '{"title":"新需求","projectId":"...","priority":"P1"}' → 201 + code 匹配 REQ-2026
    证据: .omo/evidence/task-14-create.json
  场景: 状态流转+乐观锁冲突
    工具: Bash (curl)
    步骤: 先后读取 version→同时更新→后提交者得 409
    证据: .omo/evidence/task-14-lock-conflict.txt
  场景: 分页筛选
    工具: Bash (curl)
    步骤: GET /api/requirements?status=developing&page=1&pageSize=5 → 200 + data<=5
    证据: .omo/evidence/task-14-pagination.json
  ```

  **提交**: YES — `feat(backend): implement requirement CRUD with state machine and optimistic locking`

- [x] 15. Comment 评论模块 + @提及

  **做什么**:
  - `comments/comments.controller.ts`：
    - POST /api/requirements/:id/comments（创建评论）
    - GET /api/requirements/:id/comments（分页评论时间线）
  - `comments/comments.service.ts`：
    - @提及解析：正则 `@([^\s]+)` 匹配中文名，写入 mentions(JSON: [{userId, name}])
    - 评论按 createdAt 升序排列
  - @提及功能：存储但不发通知（MVP Scope）

  **禁止做**: NO 通知推送；NO 实时 WebSocket

  **推荐 Agent 配置**: `deep`
  **并行化**: Wave 3 并行 | Blocks: T27 | Blocked By: T9, T14

  **参考**: PRD §2.4 F2.4 @提及通知; HTML prototype 评论结构

  **QA 场景**:
  ```
  场景: 创建评论+@提及
    工具: Bash (curl)
    步骤: POST /api/requirements/:id/comments -d '{"content":"@李浩 请review"}'
      → 201 + mentions=[{userId:...,name:"李浩"}]
    证据: .omo/evidence/task-15-comment.json
  ```
  **提交**: YES — `feat(backend): implement comments with @mention parsing`

- [x] 16. StatusTransition 审计日志

  **做什么**: GET /api/requirements/:id/transitions（只读审计时间线）; 每条含 fromStatus, toStatus, operatorId, operatorName, comment, createdAt；在 Requirement Service 中自动记录每次流转

  **禁止做**: NO 删除/编辑审计日志（只读）

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 3 并行 | Blocks: T27 | Blocked By: T14

  **QA 场景**: curl GET /api/requirements/:id/transitions → 200 + 含首条创建记录
  **提交**: YES — `feat(backend): implement status transition audit log`

- [x] 17. Dashboard + Reports 统计端点

  **做什么**:
  - GET /api/dashboard/stats（仪表盘）：totalRequirements, pendingReview, developing, testing, launched, myTasks(当前用户), avgCycleTime
  - GET /api/reports/status-distribution（饼图/柱状）：按状态统计数量
  - GET /api/reports/priority-distribution（饼图）：按优先级统计数量
  - GET /api/reports/trend（折线图）：按周/月统计新增+上线数量

  **禁止做**: NO 复杂聚合查询（如同比/环比）；NO drill-down

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 3 并行 | Blocks: T24, T30 | Blocked By: T14

  **参考**: PRD §3 M1 仪表盘AC; PRD §6 M6 统计报表AC

  **QA 场景**:
  ```
  场景: 仪表盘统计
    工具: Bash (curl)
    步骤: GET /api/dashboard/stats → 200 + {totalRequirements:17, pendingReview:N,...}
    证据: .omo/evidence/task-17-stats.json
  ```
  **提交**: YES — `feat(backend): implement dashboard and reports stats endpoints`

- [x] 18. CSV 导出端点 — 需求列表导出

  **做什么**: GET /api/requirements/export?status=&priority=&projectId=（流式 CSV 响应）；CSV 列：编号/标题/状态/优先级/项目/创建人/计划上线/实际上线/标签；Content-Type: text/csv；后端生成 CSV 字符串流式返回

  **禁止做**: NO Excel 格式（仅 CSV UTF-8 BOM）

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 3 并行 | Blocks: T25 | Blocked By: T14

  **QA 场景**:
  ```
  场景: CSV 导出
    工具: Bash (curl)
    步骤: curl -H "Authorization: Bearer $TOKEN" localhost:3000/api/requirements/export → 200 + Content-Type:text/csv + BOM
    证据: .omo/evidence/task-18-export.csv
  ```
  **提交**: YES — `feat(backend): implement CSV export endpoint`

- [x] 19. Vue Router + 布局组件 — 侧边栏 + 导航 + 全局 Layout

  **做什么**:
  - `src/App.vue`：Layout 组件（侧边栏 256px + 主内容区）
  - `src/components/layout/Sidebar.vue`：5 个导航项(仪表盘/需求管理/看板视图/团队管理/统计报表) + 图标 + active 高亮
  - `src/components/layout/Header.vue`：当前用户+退出按钮
  - `src/router/index.ts`：7 条路由(含 /login 不套 Layout, / → redirect /login, 其他 5 条套 Layout)
  - 路由守卫 `beforeEach`：未登录→/login, 已登录→放行

  **禁止做**: NO 面包屑（MVP 简化）；NO 多级菜单

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 4 并行 | Blocks: T23-31 | Blocked By: T6

  **参考**: DESIGN.md §Sidebar/Nav 组件; `team-project-management.html:168-192` — 侧边栏 HTML 结构; `.impeccable/design.json:sidebar`

  **QA 场景**:
  ```
  场景: 导航路由切换
    工具: Playwright
    步骤: 登录→点击侧边栏 5 个菜单项→每页 200 无报错
    证据: .omo/evidence/task-19-router.png
  场景: 未登录跳转
    工具: Playwright
    步骤: 直接访问 /dashboard → redirect /login
    证据: .omo/evidence/task-19-auth-redirect.png
  ```
  **提交**: YES — `feat(frontend): add Vue Router with sidebar layout and auth guard`

- [x] 20. API Client + Axios 拦截器

  **做什么**:
  - `src/api/client.ts`：Axios 实例（baseURL: /api, timeout: 10s）
  - Request 拦截器：自动注入 `Authorization: Bearer <token>`
  - Response 拦截器：401 → 清除 token 跳转 /login, 网络错误 → toast
  - `src/api/requirements.ts`：封装所有 Requirement API 调用
  - `src/api/auth.ts`：login()
  - `src/api/users.ts`：getUsers(), getUserById()
  - `src/api/projects.ts`：getProjects()

  **禁止做**: NO GraphQL client；NO 重复请求去重

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 4 并行 | Blocks: T23-31 | Blocked By: T6

  **QA 场景**:
  ```
  场景: 401 自动跳转
    工具: Playwright
    步骤: 伪造过期 token→访问 /api/requirements→自动跳转 /login
    证据: .omo/evidence/task-20-401-redirect.png
  ```
  **提交**: YES — `feat(frontend): add Axios client with auth interceptors`

- [x] 21. Pinia 状态管理 stores — 5 个 store 模块

  **做什么**:
  - `stores/auth.ts`：user, token, login(), logout(), isAuthenticated getter
  - `stores/requirements.ts`：list, filters, pagination, fetchRequirements(), create(), update(), transition()
  - `stores/projects.ts`：projects, fetchProjects()
  - `stores/users.ts`：users, fetchUsers()
  - `stores/ui.ts`：sidebarCollapsed, modal(open/close), toast 消息队列

  **禁止做**: NO localStorage 持久化（仅 cookie/token 由 API client 管理）；NO Vuex

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 4 并行 | Blocks: T23-31 | Blocked By: T6, T20

  **QA 场景**:
  ```
  场景: 登录后 store 状态更新
    工具: Playwright
    步骤: 登录→await useAuthStore().user !== null→断言 user.role=pm
    证据: .omo/evidence/task-21-pinia-auth.png
  ```
  **提交**: YES — `feat(frontend): implement Pinia stores`

- [x] 22. 全局基础组件库 — Button, Tag, Card, Input, Modal, Table 等

  **做什么**:
  - 创建 9 个全局组件（按 DESIGN.md 定义）：
    - **AppButton**：variant(primary/secondary/ghost/danger), size(sm/md/lg), loading, disabled
    - **AppTag**：type(priority P0-P3, status 4种, role 4种) —— 颜色来自 DESIGN token
    - **AppCard**：hover shadow, title slot, actions slot
    - **AppInput**：label, placeholder, error, prefix icon
    - **AppTable**：columns + data prop, 排序指示器, 空状态
    - **AppSelect**：options, placeholder, searchable
    - **AppModal**：Teleport, overlay, close + title + content + footer slots, ESC 关闭
    - **AppAvatar**：name 首字母 + 颜色映射, size(sm/md/lg)
    - **AppBadge**：count + color, dot 模式
  - 各组件对应 Storybook 示例（可选）

  **禁止做**: NO Font Awesome free — 用 `@fortawesome/fontawesome-free`；NO 自定义 CSS 覆盖 Tailwind

  **推荐 Agent 配置**: `visual-engineering` — 9 个视觉组件
  **并行化**: Wave 4 并行 | Blocks: T23-31 | Blocked By: T7

  **参考**: DESIGN.md §4 组件定义（每种组件的 variant/size/state）; `.impeccable/design.json:86-187` — HTML/CSS 示例代码; `team-project-management.html` — 原型中组件实例

  **QA 场景**:
  ```
  场景: 所有组件渲染
    工具: Playwright
    步骤: 创建展示页渲染 9 组件→截全页
    证据: .omo/evidence/task-22-components.png
  ```
  **提交**: YES — `feat(frontend): build 9 base components from design system`

- [x] 23. 登录页 + 认证流程

  **做什么**:
  - `views/Login.vue`：居中卡片布局（AppCard）、邮箱输入框、密码框、登录按钮(loading 态)、错误提示
  - 登录成功：存入 authStore → router.push /dashboard
  - 登录失败：显示后端错误信息
  - 已登录用户自动跳转 /dashboard
  - `stores/auth.ts` logout()：清除 token+user → router.push /login

  **禁止做**: NO 注册页面；NO 记住密码

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 5 并行 | Blocks: T24 | Blocked By: T19-22

  **参考**: DESIGN.md Login page layout; `.impeccable/design.json:card`

  **QA 场景**:
  ```
  场景: PM 登录
    工具: Playwright
    步骤: 打开 /login → 输入 zhanglei@example.com / pm123456 → 点击登录 → 跳转 /dashboard
    证据: .omo/evidence/task-23-login.png
  ```
  **提交**: YES — `feat(frontend): implement login page with auth flow`

- [x] 24. 仪表盘视图 — 统计卡片 + 最近投产侧栏

  **做什么**:
  - `views/Dashboard.vue`：
    - 顶部 4 统计卡片（总数/Pending/Developing/Launched）含 AppTag 状态色
    - "我的任务"区域：当前用户被分配的需求列表（按优先级排序）
    - 最近投产侧边面板：`GET /api/requirements/upcoming` 返回近期计划上线需求，逾期标红
    - 平均周期时间徽章

  **禁止做**: NO 可自定义仪表盘（固定布局）

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 5 并行 | Blocks: — | Blocked By: T17, T23

  **参考**: PRD §3 M1 仪表盘AC; `team-project-management.html:1606-1721` — 仪表盘原型

  **QA 场景**:
  ```
  场景: 统计卡片渲染
    工具: Playwright
    步骤: 登录 PM→验证 4 卡片数字与 API 一致→验证最近投产面板
    证据: .omo/evidence/task-24-dashboard.png
  ```
  **提交**: YES — `feat(frontend): implement dashboard view`

- [x] 25. 需求列表 + 筛选栏

  **做什么**:
  - `views/Requirements.vue`：
    - AppTable（columns: code, title, statusTag, priorityTag, project, creator, plannedLaunch, actions）
    - FilterBar：状态下拉、优先级下拉、项目下拉、搜索框（编号/标题）
    - PaginationBar：页码 + 每页条数（10/20/50 切换）
    - CSV 导出按钮：触发 GET /api/requirements/export 下载文件
    - 行操作：查看详情(modal)、编辑(modal)、删除(confirm modal)
    - 空状态："暂无匹配需求"

  **禁止做**: NO 行内编辑；NO 列自定义

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 5 并行 | Blocks: — | Blocked By: T14, T22

  **参考**: PRD §2 M2.1 需求列表AC; `team-project-management.html:1438-1574` — 原型表格

  **QA 场景**:
  ```
  场景: 筛选+分页
    工具: Playwright
    步骤: 打开需求管理→筛选 status=developing→验证表格数据→切换每页20条→验证
    证据: .omo/evidence/task-25-requirements.png
  ```
  **提交**: YES — `feat(frontend): implement requirements list with filters`

- [x] 26. 创建/编辑需求表单

  **做什么**:
  - `views/RequirementForm.vue`（Modal or 独立路由 /requirements/new, /requirements/:id/edit）：
  - 表单字段：标题、描述(Markdown textarea)、优先级、关联项目、开发人员(多选+职能角色)、计划上线时间、标签
  - 校验：Zod schema（从 shared 复用），前端实时校验+后端二次校验
  - 创建成功 → 刷新列表 + toast
  - 编辑：预填现有数据

  **禁止做**: NO 文件上传；NO 草稿保存

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 5 并行 | Blocks: — | Blocked By: T14, T22

  **参考**: PRD §2 M2.3 创建需求AC; `team-project-management.html:696-942` — 原型创建模态窗; shared/validators.ts Zod schemas

  **QA 场景**:
  ```
  场景: 创建需求
    工具: Playwright
    步骤: 打开创建→填写标题/项目/优先级→提交→列表第一条出现新需求→详情衔接到位
    证据: .omo/evidence/task-26-create-form.png
  场景: 校验错误
    工具: Playwright
    步骤: 空标题提交→显示"标题不能为空"
    证据: .omo/evidence/task-26-validation.png
  ```
  **提交**: YES — `feat(frontend): implement requirement create/edit form`

- [x] 27. 需求详情 + 评论时间线

  **做什么**:
  - `views/RequirementDetail.vue`（Modal or 独立路由 /requirements/:id）：
  - 需求字段展示（标题/状态/优先级/项目/创建人/时间）
  - 开发人员标签列表（人名 + 职能 RoleTag）
  - 状态流转按钮：当前允许的 transition 按钮 + 二次确认弹窗
  - 审计时间线：StatusTransition 历史记录
  - 评论时间线：评论列表 + @提及高亮 + 发表评论输入框
  - 操作：编辑(跳转编辑)、软删除(确认模态)

  **禁止做**: NO 评论删除/编辑（MVP 简化）

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 5 并行 | Blocks: — | Blocked By: T14, T15, T22

  **参考**: PRD §2 M2.2 + M2.4; `team-project-management.html:971-1391` — 原型详情模态

  **QA 场景**:
  ```
  场景: 详情+状态流转
    工具: Playwright
    步骤: PM 查看需求详情→点击"开始开发"→确认→状态变为 developing→审计时间线新增
    证据: .omo/evidence/task-27-detail.png
  场景: 发表评论+@提及
    工具: Playwright
    步骤: 输入"@李浩 测试"→发表→评论列表出现
    证据: .omo/evidence/task-27-comment.png
  ```
  **提交**: YES — `feat(frontend): implement requirement detail with timeline`

- [x] 28. 看板视图 — 拖拽 + 二次确认

  **做什么**:
  - `views/Kanban.vue`：
  - 双视图切换：按状态（4列） / 按开发人员（动态列）
  - 按状态：pending_review / developing / testing / launched 四列
  - 看板卡片：标题、优先级颜色、开发人员头像、计划上线日期
  - 拖拽：使用 vuedraggable@next，卡片拖到目标列
  - 二次确认：拖拽后弹出 AppModal“确认将需求从 X 流转到 Y？”→ 确认 → 调用 API
  - RBAC：如果拖拽不允许（DEV 拖到 launched），弹出 403 提示
  - 移动端：点击卡片 → 下拉选择目标状态 → 确认

  **禁止做**: NO 自定义列；NO 列内排序

  **推荐 Agent 配置**: `visual-engineering` — 复杂交互
  **并行化**: Wave 5 并行 | Blocks: — | Blocked By: T14, T22

  **参考**: PRD §4 M3 看板AC; `team-project-management.html:1725-1850` — 原型看板

  **QA 场景**:
  ```
  场景: 拖拽+确认流转
    工具: Playwright
    步骤: 拖拽 developing 列卡片到 testing 列→确认弹窗→确认→卡片移动成功
    证据: .omo/evidence/task-28-kanban-drag.png
  场景: 越权阻止
    工具: Playwright (DEV 用户)
    步骤: DEV 拖拽到 launched→弹窗报错→卡片回弹
    证据: .omo/evidence/task-28-kanban-deny.png
  ```
  **提交**: YES — `feat(frontend): implement kanban view with drag-and-drop`

- [x] 29. 团队管理视图

  **做什么**:
  - `views/Team.vue`：
  - 用户卡片/表格：姓名、角色(PM/Dev)、职能标签、头像、当前需求数、状态(活跃/停用)
  - 可操作（PM 可见）：编辑角色/职能、停用/激活用户
  - 每个用户点击展开分配详情

  **禁止做**: NO 工作量 Gantt 图；NO 邀请注册

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 6 并行 | Blocks: — | Blocked By: T10, T22

  **参考**: PRD §5 M5 团队管理; `team-project-management.html:1877-1924` — 原型团队面板

  **QA 场景**:
  ```
  场景: 团队列表渲染
    工具: Playwright
    步骤: PM 打开团队管理→5 用户卡片→李浩显示 requirementCount
    证据: .omo/evidence/task-29-team.png
  ```
  **提交**: YES — `feat(frontend): implement team management view`

- [x] 30. 统计报表视图 — ECharts 图表

  **做什么**:
  - `views/Reports.vue`：
  - 状态分布饼图/柱状图（4 状态 + 颜色映射 DESIGN token）
  - 优先级分布饼图（4 级 + 颜色映射）
  - 趋势折线图：x 轴时间(周/月切换)、y 轴新增+上线数量双线
  - ECharts 初始化：`echarts.init()` + 响应式 resize
  - 时间范围筛选器（可选 MVP）

  **禁止做**: NO 图表 drill-down/点击跳转；NO 导出图表

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 6 并行 | Blocks: — | Blocked By: T17, T22

  **参考**: PRD §6 M6 统计报表; ECharts: https://echarts.apache.org/en/api.html

  **QA 场景**:
  ```
  场景: 图表渲染
    工具: Playwright
    步骤: 打开统计报表→验证 3 图表均可见且无空白→截图
    证据: .omo/evidence/task-30-reports.png
  ```
  **提交**: YES — `feat(frontend): implement reports view with ECharts`

- [x] 31. 响应式布局适配 — 3 断点

  **做什么**:
  - 断点：≥1024px (desktop sidebar展开), 768-1023px (tablet sidebar折叠➔汉堡菜单), <768px (mobile 全屏)
  - Sidebar：≥1024 固定 256px; <1024 汉堡按钮 toggle overlay
  - Table：≥768 正常; <768 水平滚动
  - Kanban：<768 切换为列表+下拉选择状态
  - 表单：<768 全宽
  - Modal：<768 全屏

  **禁止做**: NO Tailwind 自定义断点（仅用 DESIGN.md 定义的 sm/md/lg/xl）

  **推荐 Agent 配置**: `visual-engineering`
  **并行化**: Wave 6 并行 | Blocks: — | Blocked By: T19, T22

  **参考**: DESIGN.md breakpoints: sm(640)/md(768)/lg(1024)/xl(1280)

  **QA 场景**:
  ```
  场景: 3 断点截图
    工具: Playwright (3 viewports)
    步骤: setViewport 1920x1080, 800x600, 375x667 → 各导航截图 → 确认无布局溢出
    证据: .omo/evidence/task-31-responsive-{size}.png
  ```
  **提交**: YES — `feat(frontend): implement responsive layout for 3 breakpoints`

- [x] 32. 前端测试 (Vitest) — 组件 + Store 单元测试

  **做什么**:
  - 配置 Vitest（jsdom 环境）+ @vue/test-utils
  - AppButton：测试 variant 渲染 class, loading 禁用, click 触发
  - AppTag：测试 type=priority-P0 渲染颜色 #F53F3F
  - authStore：测试 login 成功后 user 正确, logout 后 token=null
  - requirementsStore：测试 fetchRequirements 更新 list
  - AppModal：测试 open/close toggle, ESC 关闭
  - 覆盖 ≥50% 组件 + 100% store
  - 添加 `pnpm test:fe` 脚本

  **禁止做**: NO E2E（属 Task 34）

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 6 并行 | Blocks: T34 | Blocked By: T23-31

  **QA 场景**: `pnpm test:fe` → all pass
  **提交**: YES — `test(frontend): add Vitest unit tests`

- [x] 33. 后端测试 (Jest) — Controller + Service 单元测试

  **做什么**:
  - 配置 Jest（ts-jest）+ @nestjs/testing
  - AuthService：测试 validateUser 正确/错误, login 签 JWT
  - RequirementsService：测试 create 生成编号, transition 合法/非法/越权/乐观锁冲突
  - SoftDeleteMiddleware：测试 find 自动过滤 is_deleted
  - 每个 Service 至少 3 个测试用例
  - 添加 `pnpm test:be` 脚本

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 6 并行 | Blocks: T34 | Blocked By: T9-18

  **QA 场景**: `pnpm test:be` → all pass
  **提交**: YES — `test(backend): add Jest unit tests`

- [x] 34. E2E QA 全场景 — Playwright + curl 覆盖全部 31 个 QA Scenarios

  **做什么**:
  - 运行所有前序任务的 QA Scenarios（至少 31 个）
  - Playwright：Task 6, 19, 20, 21, 22, 23-31 共约 18 个场景
  - curl：Task 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 共约 13 个场景
  - 每个场景产出 evidence 文件到 `.omo/evidence/`
  - 验证证据文件存在性

  **禁止做**: NO 手动操作——全部自动化

  **推荐 Agent 配置**: `deep`
  **技能**: `["playwright"]`
  **并行化**: Wave 7 串行（依赖 T32, T33）| Blocks: F1-F4, T35 | Blocked By: T32, T33

  **参考**: 各 Task QA Scenarios 的 evidence 路径

  **验收标准**:
  - [ ] `.omo/evidence/` 下至少 31 个证据文件
  - [ ] 0 个关键失败场景

  **提交**: YES — `test(e2e): run all QA scenarios with evidence capture`

- [x] 35. Docker Compose 终态 + README

  **做什么**:
  - 更新 `docker-compose.yml`：添加 volumes（sqlite 数据持久化）+ env_file
  - 更新 `Dockerfile.backend`：multi-stage（dev + prod）+ prisma generate
  - 更新 `Dockerfile.frontend`：multi-stage build → nginx serve dist/
  - 根 `README.md`：项目简介 + 技术栈 + 快速开始(`pnpm install && pnpm dev`) + Docker 部署
  - 验证 `docker-compose up` → 前后端可访问

  **禁止做**: NO CI/CD（.github/workflows 超出 MVP 范围）

  **推荐 Agent 配置**: `quick`
  **并行化**: Wave 7 独立 | Blocks: F1-F4 | Blocked By: T34

  **QA 场景**:
  ```
  场景: Docker 一键启动
    工具: Bash
    步骤: docker-compose down -v && docker-compose up -d → curl localhost:3000/api 有响应 → curl localhost:5173 200
    证据: .omo/evidence/task-35-docker-final.txt
  ```
  **提交**: YES — `chore: finalize Docker and README`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files in .omo/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + ESLint + `pnpm test:fe && pnpm test:be`. Review all changed files for: `as any`, `@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together). Test edge cases: empty state, invalid input, rapid actions, concurrent access. Save to `.omo/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

**用户偏好**: 按功能点增量提交——每完成一个任务或一组关联任务即提交一版代码。使用 `git worktree` 隔离开发分支。

**分支策略**:
- `main` 分支保留计划文档（PRD/DESIGN/plan）
- `dev` worktree → 所有功能开发在此进行
- 每个 Wave 完成时合并到 `main`

**Group commits by Waves:**

| Wave | Tasks | Commit Message | Key Files |
|------|-------|---------------|-----------|
| 1 | 1-2 | `chore: init pnpm monorepo with shared types` | root configs, packages/shared/ |
| 1 | 3-4 | `feat(db): add Prisma schema and seed data` | prisma/ |
| 1 | 5 | `feat(backend): scaffold NestJS project` | packages/backend/src/ |
| 1 | 6-7 | `feat(frontend): scaffold Vue 3 with design tokens` | packages/frontend/ |
| 1 | 8 | `chore: add Docker dev environment` | docker-compose.yml |
| 2 | 9,12 | `feat(backend): implement JWT auth and RBAC` | auth/ |
| 2 | 10-11 | `feat(backend): implement users and projects CRUD` | users/, projects/ |
| 2 | 13 | `feat(backend): add Prisma soft-delete middleware` | prisma/ |
| 3 | 14 | `feat(backend): implement requirement CRUD with state machine` | requirements/ |
| 3 | 15-16 | `feat(backend): implement comments and audit log` | comments/ |
| 3 | 17-18 | `feat(backend): implement dashboard stats and CSV export` | dashboard/, reports/ |
| 4 | 19-22 | `feat(frontend): add router, API client, stores, components` | router/, api/, stores/, components/ |
| 5 | 23-24 | `feat(frontend): implement login and dashboard views` | views/Login, views/Dashboard |
| 5 | 25-27 | `feat(frontend): implement requirements views` | views/Requirements* |
| 5 | 28 | `feat(frontend): implement kanban view` | views/Kanban |
| 6 | 29-30 | `feat(frontend): implement team and reports views` | views/Team, views/Reports |
| 6 | 31 | `feat(frontend): implement responsive layout` | components/layout/ |
| 6 | 32-33 | `test: add frontend and backend unit tests` | **/__tests__/ |
| 7 | 34 | `test(e2e): run all QA scenarios with evidence` | .omo/evidence/ |
| 7 | 35 | `chore: finalize Docker and README` | docker/, README.md |

**Pre-commit check**: `pnpm lint && pnpm typecheck`

---

## Success Criteria

### Verification Commands
```bash
# 开发环境一键启动
pnpm install && pnpm dev

# 种子数据填充
cd packages/backend && npx prisma db seed

# PM 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zhanglei@example.com","password":"pm123456"}' 
# Expected: { "accessToken": "eyJ...", "user": { "role": "pm", ... } }

# 需求列表
curl http://localhost:3000/api/requirements?page=1&pageSize=10 \
  -H "Authorization: Bearer $TOKEN"
# Expected: { "data": [...], "total": 17, "page": 1 }

# 状态流转
curl -X PATCH http://localhost:3000/api/requirements/$ID/transition \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toStatus":"developing"}'
# Expected: 200, StatusTransition recorded

# 越权检测
curl ... -H "Authorization: Bearer DEV_TOKEN" -d '{"toStatus":"launched"}'
# Expected: 403 Forbidden

# Docker 部署
docker-compose up -d
# Expected: localhost:5173 200, localhost:3000 200
```

### Final Checklist
- [ ] All "Must Have" present (10 items)
- [ ] All "Must NOT Have" absent (10 items)
- [ ] 所有 35 个任务完成
- [ ] ≥31 QA 证据文件可在 `.omo/evidence/` 找到
- [ ] `pnpm typecheck` 无错误
- [ ] `pnpm lint` 无错误
- [ ] `pnpm test:fe && pnpm test:be` 全部通过
- [ ] `docker-compose up` 一键启动成功
- [ ] 6 个前端视图全部可交互
- [ ] F1-F4 全部 APPROVE

