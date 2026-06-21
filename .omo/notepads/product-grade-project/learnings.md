
## Task 1 — Monorepo Skeleton (2026-06-21)
- pnpm workspace root created with packages/* glob
- 3 sub-packages: @pm-system/shared, @pm-system/backend, @pm-system/frontend
- tsconfig.base.json with strict mode, ES2022 target, @pm-system/shared paths alias
- root deps: typescript@5.9.3, eslint@8.57.1, prettier@3.8.4
- pnpm install verified — all 4 workspace projects linked successfully

## Task 2 — Shared Types Package (2026-06-21)
- Created `packages/shared/src/` with 6 modules: enums, types, dtos, constants, validators, index
- Enums: Priority (P0-P3), RequirementStatus (4 states), UserRole (pm/dev), DevRole (frontend/backend/data)
- Types: 15 interfaces covering User, Project, Requirement, RequirementDeveloper, Comment, StatusTransition, DashboardStats, ReportData, KanbanData, UpcomingItem, ChartDataItem/TrendItem, Mention
- DTOs: 8 interfaces for request/response shapes (Login, Create/Update Requirement, Transition, Comment, Query, Pagination, PaginatedResponse, UpdateUser)
- Constants: STATUS_FLOW state machine (3 transitions with role mapping), 4 label maps (PRIORITY/STATUS/ROLE/DEV_ROLE)
- Validators: 7 Zod schemas (requirementCode regex, login, create/update requirement, transition, comment, pagination) + inferred input types
- Added zod@^3.23.0 as runtime dependency in shared/package.json

## Task 5 — NestJS Backend Scaffold (2026-06-21)
- Created `packages/backend/` with full NestJS project scaffold
- package.json: removed `"type": "module"` (NestJS uses CommonJS via ts-node), added all NestJS deps (@nestjs/common, core, platform-express, passport, jwt, @prisma/client, bcryptjs, class-validator, class-transformer, reflect-metadata, rxjs) and devDeps (@nestjs/cli, @nestjs/testing, prisma, ts-node, type defs)
- tsconfig.json: extends root tsconfig.base.json, overrides with CommonJS module, node moduleResolution, emitDecoratorMetadata + experimentalDecorators for NestJS
- .env: DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN=7d
- src/main.ts: bootstrap with CORS (origin:true, credentials:true), ValidationPipe (transform:true, whitelist:true), listen :3000
- src/app.module.ts: imports PrismaModule (global) + 7 business module shells
- src/prisma/: PrismaModule is @Global() so all modules inject PrismaService; PrismaService uses dynamic require of @prisma/client to avoid dependency on `prisma generate` — emits warning if client not generated
- 7 module shells (auth, users, projects, requirements, comments, dashboard, reports) each with module/controller/service stubs, no business logic
- Prisma CLI hangs on Windows (engine binary download issue) — worked around with dynamic require pattern and type stub declaration
- pnpm install and nest build both verified
- nest start verified: all 8 modules loaded, all 7 controllers registered, app listening on :3000

## Task 3 — Prisma Schema + Database Migration (2026-06-21)
- Wrote complete schema.prisma with 6 models: User, Project, Requirement, RequirementDeveloper (junction table), Comment, StatusTransition
- SQLite datasource: `file:./dev.db` (already configured in .env as DATABASE_URL)
- Key design decisions:
  - RequirementDeveloper junction table with `@@unique([requirementId, userId, role])` — not a JSON column
  - No `@updatedAt` on Requirement (version field handles optimistic locking)
  - No CASCADE DELETE anywhere (soft delete via middleware in Task 13)
  - devRoles and tags stored as JSON strings with `@default("[]")`
- Prisma CLI hung on Windows (engine binary download) — workaround: set `PRISMA_QUERY_ENGINE_BINARY` env var to pre-existing binary in pnpm store at `.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/query_engine-windows.dll.node`
- `npx prisma generate` succeeded, output to pnpm store
- `npx prisma db push --force-reset` succeeded, created SQLite tables
- Verified all 6 tables via PrismaClient query: Comment, Project, Requirement, RequirementDeveloper, StatusTransition, User
- Updated prisma.service.ts: replaced dynamic `require('@prisma/client')` with static `import { PrismaClient } from '@prisma/client'` and class extends PrismaClient
- Removed prisma-client.stub.d.ts (no longer needed)
- `pnpm nest build` verified — compiles cleanly

## Task 7 — Tailwind Design Token Injection (2026-06-21)
- Injected 4 semantic color systems with 9-step tonal ramps into tailwind.config.js theme.extend.colors: primary (#165DFF), success (#00B42A), warning (#FF7D00), danger (#F53F3F)
- Added Chinese-first fontFamily: PingFang SC, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif
- Added 5 typography scale tokens (display 32px, headline 24px, title 20px, body 14px, label 12px) with lineHeight and fontWeight
- Added 3 boxShadow tokens (card-hover, modal, dropdown) with semantic naming
- Added borderRadius DEFAULT=8px and sm=4px
- Added transitionTimingFunction ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1)
- Did NOT override screens (Tailwind defaults match design spec: sm=640, md=768, lg=1024, xl=1280)
- Updated main.css body font-family to match design system font stack
- design.json and DESIGN.md both consulted; design.json tonal ramps used (design.json uses error name instead of danger — task spec uses danger which was honored)

## Task 4 — Prisma Seed Script (2026-06-21)
- Created `packages/backend/prisma/seed.ts` — full seed script with 5 Users, 5 Projects, 17 Requirements
- Fixed an existing seed that had wrong PM email (`zhanglei` → `zhangming`) and missing descriptions
- Used `upsert` pattern for idempotency (by email for users, code for requirements, fixed IDs for projects)
- Used `prisma.$transaction` for user and project creation batches
- Status mapping: 待评审→pending_review, 开发中→in_development, 测试中→testing, 已上线→launched
- Planned dates: launched items get `plannedOnline`, others get `plannedLaunch` from prototype table
- REQ-2025-006 and 007 only appear in kanban (not in table or reqData) — assigned to 风控系统 and 用户增长 respectively, with reasonable descriptions
- Prototype has 5 PM-like creators (张明, 李明, 赵岩, 王强) but seed only has 张明 as PM — used 张明 for all creatorId
- `packages/backend/package.json` already had prisma seed config and all deps (bcryptjs, ts-node, @types/bcryptjs) pre-installed

## Task 11 — Project CRUD Module (2026-06-21)
- Projects controller/service/DTOs were already implemented as stubs with full logic
- Cleaned up: removed per-route `@UseGuards(JwtAuthGuard)` since global APP_GUARD (from T9) covers all routes
- Cleaned up: removed `PassportModule` import from projects.module.ts (unnecessary with global auth)
- DTO hardening: added `@IsNotEmpty()` to CreateProjectDto.name and .leadId to reject blank strings
- Key implementation decisions already in place:
  - GET list: filters `isActive: true`, includes `_count: { select: { requirements: true } }` → requirementCount
  - POST create: validates leadId exists via `User.findUnique`
  - PATCH update: validates leadId if provided, builds data map from defined fields only
  - NO delete endpoint — deactivation only via PATCH isActive=false
  - findById: returns NotFoundException if project not found or !isActive

## Task 12 — RBAC 权限守卫: @Roles 装饰器 + RolesGuard (2026-06-21)
- `roles.decorator.ts` already existed with correct implementation: `@Roles(...roles: string[])` sets metadata via `SetMetadata(ROLES_KEY, roles)`
- `roles.guard.ts` already existed with correct implementation:
  - Uses `Reflector.getAllAndOverride` to read `ROLES_KEY` metadata from handler and class
  - If no required roles (empty or undefined), returns `true` (allows access)
  - If no `req.user`, throws `ForbiddenException('Access denied: no authenticated user')`
  - If user.role not in required roles, throws `ForbiddenException` with detailed message
  - Throws `ForbiddenException` (NOT `UnauthorizedException`) as required
- Registered `RolesGuard` in `auth.module.ts` providers and exports
- Did NOT apply RolesGuard globally — it's per-controller via `@UseGuards(RolesGuard)`
- JwtStrategy already populates `req.user` with full User object (id, name, email, role, devRoles etc.)
- RolesGuard reads `user.role` (string: 'pm' or 'dev') from the authenticated user
- No controllers use `@Roles()` yet — that's added when specific endpoints need protection

## Task 13 — Prisma 软删除 Middleware (2026-06-21)
- PrismaService already had skeleton middleware: delete→update conversion, read filters, and a `softDelete()` method
- **Bug found & fixed**: Middleware had a "block direct update of isDeleted" section (lines 33-39) that stripped `isDeleted` from ALL update data — this broke `softDelete()` because it too calls `update({ data: { isDeleted: true } })`, making the update a no-op
- **Fix**: Removed the block entirely. The `delete→update` conversion already exits the middleware via `return next(...)` before reaching any other check, so it's unaffected. `softDelete()` now works correctly.
- Middleware design (unchanged):
  - Only applies to `Requirement` model (via `softDeleteModels = ['Requirement']`)
  - `delete` → `update` with `data: { isDeleted: true }`
  - `deleteMany` → `updateMany` with `data: { isDeleted: true }`
  - Read operations (`findUnique`, `findFirst`, `findMany`, `count`) auto-inject `where: { isDeleted: { not: true } }` unless `isDeleted` is explicitly specified in the where clause
  - `create`, `update`, `upsert`, `aggregate`, `groupBy` pass through unfiltered
- Verification approach: query all → soft-delete one → query again (one fewer) → sqlite3 confirms record exists with is_deleted=1

## Task 10 — User CRUD Module (2026-06-21)
- Users controller/service/module already had working stubs from Task 5 scaffold
- Controller had @UseGuards(JwtAuthGuard) at class level — redundant since APP_GUARD in app.module.ts is global (same cleanup as Task 11 Projects)
- Module had unnecessary PassportModule import — removed
- DTO hardened with @IsIn() validation: role in ['pm', 'dev'], devRoles each in ['frontend', 'backend', 'data']
- Service uses _count: { select: { requirementsAsDev: true } } for requirementCount (relation field name from Prisma schema)
- devRoles parsed from JSON string in parseUser() helper before returning
- findAll returns all users (no isActive filter — same as scaffold default)
- findById returns 404 if user not found
- PATCH: allows updating role, devRoles (stored as JSON string in Prisma), isActive, name, email, avatarUrl
- No DELETE endpoint, no password modification, no user creation

## Task 14 — Requirement CRUD + 状态流转 + 乐观锁 (2026-06-21)
- Requirements controller/service/DTOs already existed as stubs — enhanced with missing features
- Controller changes:
  - Added `@UseGuards(RolesGuard)` at class level (RolesGuard from AuthModule)
  - Added `@Roles('pm')` on POST create endpoint — DEV users get 403 Forbidden
  - Added `GET /api/requirements/kanban` — aggregates by 4 status columns + byDeveloper
  - Added `GET /api/requirements/upcoming` — pending_review|developing sorted by plannedOnline/plannedLaunch
  - Reordered routes so `kanban`/`upcoming` come before `:id` param route
- Service changes:
  - **findById**: Enhanced to include comments (with author name/email) and transitions (with operator name) fetched via separate Prisma queries from Comment and StatusTransition models
  - **update**: Added optimistic locking — accepts optional `version` field in DTO; if provided, uses `where: { id, version }` and increments version; catches Prisma P2025 → 409 Conflict
  - **transition**: Added complete state machine validation:
    1. Looks up STATUS_FLOW entry for current status
    2. Validates target status is in allowed transitions
    3. **RBAC check**: verifies operator.role === flowEntry.requiredRole (PM→pending_review→developing/testing→launched; DEV→developing→testing)
    4. **requireDeveloper check**: if flowEntry.requireDeveloper is true (developing→testing), verifies operator is in assigned developers list — throws ForbiddenException or BadRequestException if unmet
    5. Atomic optimistic locking via `where: { id, version: dto.version }` with P2025 → 409 Conflict
    6. Creates StatusTransition record after successful update
  - **getKanban**: Fetches all non-deleted requirements, groups by status (4 columns) and by developer (user + requirements array)
  - **getUpcoming**: Filters by status in ['pending_review', 'developing'], orders by plannedOnline ASC NULLS LAST, plannedLaunch ASC NULLS LAST
- DTO changes:
  - Added optional `version` field (IsInt, Min(0)) to UpdateRequirementDto
- Module changes:
  - Imported AuthModule in RequirementsModule for RolesGuard access (RolesGuard is exported from AuthModule)
- Optimistic locking approach: `data.version = { increment: 1 }` in Prisma update, combined with `where: { id, version: providedVersion }` — if version mismatch, Prisma throws P2025, caught and re-thrown as 409 Conflict
- Verification: All 7 endpoints tested via Invoke-RestMethod — pagination (18 total), filtering, kanban (6/5/4/3 per column), upcoming (11 items), detail with comments/transitions, RBAC on create (DEV→403), transition state machine, optimistic locking (wrong version→409)

## Task 17 — Dashboard + Reports 统计端点 (2026-06-21)
- Dashboard module already present with working `getStats()` and `getUpcoming()` — fixed 2 issues:
  - `myTasks`: was counting individual junction records (multi-role double-count), changed to `findMany({ distinct: ['requirementId'] }).then(r => r.length)` for distinct requirements
  - `avgCycleTime`: was using `createdAt` → `actualOnline`, spec requires `plannedLaunch` → `actualOnline`; also added `plannedLaunch: { not: null }` filter
- Reports module already present with working `getStatusDistribution()`, `getPriorityDistribution()`, `getTrend()` — fixed 1 issue:
  - `getTrend()`: was grouping by month for 12 months, changed to group by ISO week (Monday key) for last 12 weeks with `getMonday()` helper; fills all 12 weeks (even empty ones) for predictable chart rendering
- Both `dashboard.module.ts` and `reports.module.ts` imported `AuthModule` from `../auth/auth.module` for RolesGuard access (follows pattern from T14 requirements.module.ts)
- All endpoints: `GET /api/dashboard/stats`, `GET /api/reports/status-distribution`, `GET /api/reports/priority-distribution`, `GET /api/reports/trend` — verified via `nest build` (all 6 JS files emitted to dist/)
- Prisma soft-delete middleware auto-filters read queries but NOT `groupBy` — reports explicitly use `isDeleted: { not: true }` in where clause for groupBy operations
- `plannedLaunch` and `actualOnline` are `String?` (not DateTime) in schema — parse via `new Date()` in JS

## Task 16 — StatusTransition Audit Log (2026-06-21)
- `getTransitions()` method and `GET :id/transitions` endpoint already existed as part of T14 implementation
- Service: `getTransitions(id)` validates requirement exists (404 if not found), queries `statusTransition.findMany` with `include: { operator: { select: { id: true, name: true } } }`, orders by `createdAt: 'asc'`, returns flat `{ data: [...] }` with `operatorName` denormalized from the included relation
- Controller: `@Get(':id/transitions')` placed before `@Get(':id')` at line 58 (routes must be ordered specificity first in NestJS)
- Response shape matches requirement: id, requirementId, fromStatus (null for initial creation), toStatus, operatorId, operatorName, comment, createdAt — same shape used inside `findById` for the detail view
- Read-only endpoint — no POST/PATCH/DELETE allowed

## Task 19 — Vue Router + 布局组件: 侧边栏 + 导航 + 全局 Layout (2026-06-21)
- **Existing stubs were well-structured**: AppLayout.vue, Sidebar.vue, Header.vue already existed with most of the skeleton — confirmed the scaffold from T6 was thorough
- **Changes made to 3 files**:
  - `router/index.ts` — changed `/` redirect from `/login` to `/dashboard` (visitors land on dashboard, auth guard handles unauthenticated)
  - `Sidebar.vue` — logo text changed from "团队项目管理系统" to "蓝本" (matches design.json narrative northStar); active nav item now has a 3px left accent bar (`border-l-[3px] border-primary-500`) plus translucent highlight background (`bg-primary-50`) — inline with `.ds-nav-active` from design.json but using left border instead of right
  - `Header.vue` — simplified from dropdown-based user menu to direct display: app name "蓝本" on the left, user name + role badge (PM=`bg-primary-50 text-primary-600`, DEV=`bg-success-50 text-success-600`) + visible logout button on the right
- **Left unchanged**: App.vue (already correctly wraps non-login routes in `<AppLayout>`), AppLayout.vue (already correct with mobile responsive sidebar + header + main content slot)
- **Design system tokens used**: Tailwind semantic colors (primary/success), typography scale (title, body, label), boxShadow tokens, spacing scale (all via Tailwind)
- **Font Awesome**: Uses `@fortawesome/fontawesome-free` CSS import (not vue-fontawesome component) — icons via `<i class="fas fa-...">` consistent with existing usage
- **vue-tsc**: 0 new type errors from my changes (pre-existing errors in auth store type, API barrel export, and Dashboard.vue call signature remain)
- **Pre-existing build issues** (unrelated): `auth.ts` login() expects `accessToken`/`user` fields but `User` type doesn't have them; `api/index.ts` has duplicate `getUpcoming` export; `Dashboard.vue` calls `getRequirements()` with 0 args but expects 1

## Task 18 — CSV 导出端点 (2026-06-21)
- `exportCSV()` method and `@Get('export')` endpoint already existed from T14 but with different columns (当时设计为责任人/计划提测日/创建时间等字段)
- Updated to spec columns: 编号, 标题, 状态, 优先级, 项目, 创建人, 计划上线, 实际上线, 标签
- Key changes to exportCSV():
  - Added `actualOnline` and `creator` to Prisma select (were missing)
  - Added `tags` to select + JSON.parse() aware parsing in row builder
  - Removed `createdAt` and `developers` (not in spec)
  - Removed 负责人/计划提测日/创建时间 columns
  - Status/priority use Chinese labels via PRIORITY_LABELS/STATUS_LABELS from @pm-system/shared
  - 计划上线 column uses `plannedOnline ?? plannedLaunch ?? ''` (fallback)
  - Tags joined with `;` separator
- Controller endpoint was already correctly placed before `@Get(':id')` with `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="requirements.csv"` headers, UTF-8 BOM prefix (`\uFEFF`)
- `escapeCSV()` helper already existed — wraps in quotes if contains comma/quote/newline, doubles internal quotes
- No pagination on export (all matching results returned)
- Pre-existing build error in `create-comment.dto.ts` (TS2564: strictPropertyInitialization) unrelated to this task

## Task 20 — API Client + Axios 拦截器 (2026-06-21)
- Created `packages/frontend/src/api/client.ts` — Axios instance with `/api` baseURL, 10s timeout
- Request interceptor: auto-injects `Authorization: Bearer <token>` from `localStorage.getItem('token')`
- Response interceptor: 401 → clears token → `router.push('/login')` via direct router import
- Network/timeout errors: logged to console, re-thrown for component-level handling
- `auth.ts`: `login()` POSTs `/auth/login`, returns `{ accessToken, user }` — store handles localStorage
- `requirements.ts`: 9 CRUD+query functions — `getRequirements`, `getRequirementById`, `createRequirement`, `updateRequirement`, `transitionRequirement` (PATCH), `getKanbanData`, `getUpcoming`, `getTransitions`, `exportCsv` (blob), `deleteRequirement`
- `users.ts`: `getUsers()`, `getUserById()`, `updateUser()` (kept for store compatibility)
- `projects.ts`: `getProjects()`, `getProjectById()`, `createProject()`, `updateProject()`, `deleteProject()` (kept for store compatibility)
- All API responses typed using DTOs/interfaces from `@pm-system/shared` with `import type { ... }`
- Fixed store imports to use renamed API functions (e.g., `getRequirement`→`getRequirementById`, `exportRequirements`→`exportCsv`)
- `TransitionDto` uses `PATCH` per backend convention
- `getRequirements()` accepts `Record<string, unknown>` for flexible query params
- Pre-existing vite build error (shared package CJS re-export of enums) — not caused by this task
- `vue-tsc --noEmit` type-checks pass with 0 errors

## Task 15 — Comment 评论模块 + @提及 (2026-06-21)
- Created `packages/backend/src/comments/dto/create-comment.dto.ts` — DTO with `@IsString() @IsNotEmpty() content!: string`
- Modified `comments.service.ts`:
  - Changed `findByRequirement` sort from `createdAt: 'desc'` to `createdAt: 'asc'` (timeline view — oldest first)
  - Changed `parseMentions` from `findMany` with `contains` to `findFirst` with exact name match (per spec: "lookup user by name via Prisma user.findFirst({ where: { name: mentionedName } })") — reduces false positives
  - Removed `delete()` method (dead code / out of MVP scope)
  - Removed `ForbiddenException` import (no longer needed)
- Modified `comments.controller.ts`:
  - Removed DELETE endpoint (per spec: no deletion in MVP)
  - POST now uses validated `CreateCommentDto` instead of raw `@Body('content')`
  - Clean imports (removed `Delete` decorator)
- Modified `comments.module.ts`:
  - Imported `AuthModule` for future RolesGuard access (follows same pattern as RequirementsModule)
- Key patterns reused:
  - Requirement existence validation: `prismaService.requirement.findUnique` — throws NotFoundException (same pattern as requirements.service)
  - Mentions stored as JSON string via `JSON.stringify()` / parsed on read via `JSON.parse()` (same pattern as devRoles/tags in UsersService)
  - `commentSelect` includes author relation with `id`, `name`, `avatarUrl`
  - Global JWT auth via APP_GUARD — no per-route guards needed
- @mention regex: `/@([^\s]+)/g` — matches Chinese names and Western names, deduplicates via Set, looks up each unique name via `user.findFirst` with exact match
- Build verified: `pnpm --filter @pm-system/backend exec nest build` passes with 0 errors

## Task 29 — 团队管理视图 Team.vue (2026-06-21)
- Created `packages/frontend/src/views/Team.vue` — full team management view with:
  - Page header with title "团队管理" + search input for name + role filter (AppSelect)
  - Loading skeleton (8 animated card placeholders)
  - Empty state (no users vs no match)
  - Responsive card grid: 1 col (sm) / 2 cols (md) / 3 cols (lg) / 4 cols (xl)
  - Each card: avatar (AppAvatar with initials fallback), name, email, role badge (AppTag with role-pm/role-dev), devRoles tags, isActive status dot (success/gray), requirement count
- Detail modal (AppModal) opens on card click with:
  - User info: avatar, name, role tag, active status, email, requirement count, created date, devRoles tags
  - Assigned requirements section: fetches kanban data via `reqStore.fetchKanbanData()`, finds user's entry in `byDeveloper` array, displays list of requirements with code, title, and status tag — loading spinner while fetching, empty state when none
  - PM-only management section (hidden for DEV users and self):
    - Toggle active/inactive with AppButton (danger/primary variant)
    - Edit role with AppSelect (pm/dev options), immediately calls `store.updateUser()` on change
    - Edit devRoles with custom checkbox UI (since AppSelect doesn't support multiple), save button calls `store.updateUser()`
- Uses `ROLE_LABELS` and `DEV_ROLE_LABELS` from `@pm-system/shared` for display labels
- Uses `UserWithCount` type alias (`User & { requirementCount: number }`) to properly type the backend-returned `requirementCount` field (not in the base User interface)
- Router already configured at `/team`
- No workload Gantt chart, no invite/registration, no salary/HR features (per spec)
- Pre-existing type errors in `RequirementDetail.vue` and `Requirements.vue` unrelated to this task

## Task 22 — 前端组件库 (2026-06-21)
- Created `packages/frontend/src/components/common/` with 8 reusable components + barrel export
- **Button.vue**: 5 variants (primary/success/warning/danger/default), 3 sizes (sm/md/lg), ghost mode, loading spinner SVG, disabled state, active:scale-[0.98] feedback, focus ring via focus:ring-2
- **Input.vue**: v-model, label with required star, placeholder, error state (danger-500 border+ring), prefix slot (pl-10 when present), disabled state (gray bg + opacity)
- **Select.vue**: v-model, options array (SelectOption interface with value/label), placeholder as disabled first option, label, error state, native `<select>` with appearance-none + SVG chevron icon
- **Tag.vue**: 6 color variants (red=danger, orange=warning, blue=primary, green=success, yellow=amber, default=gray), rounded-sm (4px), text-xs py-0.5 px-2 sizing
- **Card.vue**: header slot (border-b separator) + default slot, optional hoverable (shadow-card-hover + cursor-pointer), padding toggle md(p-5)/lg(p-6), border + rounded-lg
- **Table.vue**: columns definition (ColumnDef: key/label/align/formatter), data rows, optional header toggle, striped rows, loading overlay with spinner, empty state, responsive overflow-x-auto, cell slots for custom rendering
- **Modal.vue**: v-model:visible pattern (prop: visible, emit: update:visible), title, showClose toggle, width sm/md/lg (max-w-sm/lg/2xl), teleport to body, overlay click + Escape key to close, Transition for enter/leave (fade + scale 0.95), body scroll lock
- **KanbanCard.vue**: compact card (bg-gray-50, rounded-lg, p-3, border), code (font-mono text-primary-500), title (line-clamp-2), priority Tag, developer avatar circles (overlapping, max 3 + overflow count), status badge (color-coded), hover:shadow-dropdown
- **Patterns reused from existing Pm* components**: `<script setup lang="ts">`, `withDefaults` + `defineProps` type annotations, `defineEmits`, `computed` for dynamic classes, no scoped CSS (except modal transitions), Tailwind utility classes only
- **Design token alignment**: All colors map to tailwind config tokens (primary/success/warning/danger at 50/500/600 levels), spacing uses Tailwind scale, border-radius uses rounded (4px) / rounded-lg (8px) per DESIGN.md
- **Build verification**: `vue-tsc --noEmit` — 0 errors in common/ components (pre-existing errors in api/ stores/ views/ unrelated)

## Task 21 — Pinia 状态管理 stores (2026-06-21)
- All 5 stores (`auth`, `requirements`, `projects`, `users`, `ui`) enhanced from T6 stubs with full implementations
- **auth.ts**: Already complete — `login(email, password)` calls `apiLogin` from `@/api/auth`, stores `accessToken` + `user`, `logout()` clears + router.push('/login'), `isAuthenticated` getter, token restored from localStorage on init
- **requirements.ts**: Enhanced with 3 additions:
  - `fetchKanbanData()`: calls `apiGetKanbanData()`, stores result in `kanbanData` ref (`KanbanData | null`)
  - `fetchUpcoming()`: calls `apiGetUpcoming()`, stores result in `upcoming` ref (`UpcomingItem[]`)
  - `transitionRequirement`: alias for `transitionStatus` (spec name compatibility)
  - Existing: full CRUD, client-side filters (projectId/status/priority/search), pagination (page/pageSize/total), optimistic-lock transition via `TransitionDto`
- **projects.ts**: Already complete — `fetchProjects()` calls `getProjects()`, plus create/update/delete
- **users.ts**: Already complete — `fetchUsers()` calls `getUsers()`, plus fetchById/updateUser
- **ui.ts**: Enhanced with 3 additions:
  - `showModal(name)`: alias for `openModal(name)`
  - `hideModal()`: alias for `closeModal()`
  - `addToast(message, type='info', duration=3000)`: new method with configurable auto-dismiss
  - Existing: sidebarCollapsed, toggleSidebar(), activeModal, toasts queue with auto-remove
- All stores use Pinia Composition API (`defineStore('name', () => { ... })`) with Vue 3 `ref`/`computed`
- API imports direct from `@/api/...` (not barrel) for `getKanbanData`/`getUpcoming` which are not in `@/api` barrel export
- `vue-tsc --noEmit` passes with 0 new errors

## Task 23 — 登录页 + 认证流程 (2026-06-21)
- Login.vue already had a complete implementation from T6 scaffold — no changes needed
- **Key features confirmed working**:
  - Centered card layout: `flex items-center justify-center min-h-screen` with `bg-gradient-to-br from-primary-50 via-primary-50/40 to-gray-100` gradient (enhanced over plain `bg-gray-50`)
  - AppCard with `shadow-dropdown` wraps the login form
  - AppInput for email (type="email") and password (type toggles text/password) with error states
  - Password visibility toggle (eye icon button, tabindex=-1 for tab flow)
  - AppButton with `:loading="submitting"` — spinner SVG from Button.vue
  - Error alert: `bg-danger-50 border-danger-200 text-danger-600` with fade transition
  - Validation: email regex pattern, password ≥ 6 chars, field-level errors
  - Auto-redirect on mount: `onMounted → authStore.isAuthenticated → router.replace('/dashboard')`
  - Submit: `authStore.login(email, password)` → `router.push('/dashboard')`
  - Error catch: `err?.response?.data?.message || err?.message || '登录失败，请检查邮箱和密码'`
  - Card mount animation: fade-slide (opacity 0→1 + translateY 20px→0, 0.5s cubic-bezier)
- **Design system alignment**: Uses Tailwind semantic colors (primary-50/500/600, danger-50/200/600, gray-400/700/800), typography tokens (text-headline, text-body), boxShadow token (shadow-dropdown for card)
- **AppCard usage**: No header slot used; default slot contains branding + form. `class="shadow-dropdown"` applied for subtle elevation (per DESIGN.md flat-priority approach, dropdown shadow is appropriate for a login card)
- **Pre-existing build issue**: vite build fails on `Requirements.vue` — `RequirementStatus` not re-exported from shared package CJS barrel. Unrelated to Login.vue (vue-tsc passes clean)

## Task 26 — 创建/编辑需求表单 (2026-06-21)
- Created `packages/frontend/src/views/RequirementFormModal.vue` — standalone modal form component extracted from inline form in Requirements.vue
- **Key design decisions**:
  - Uses `AppModal` (width="640px") with `v-model:visible` pattern and `@saved` emit for parent refresh
  - Props: `visible`, `mode` ('create'|'edit'), `requirement` (for edit pre-fill), `projects`, `users`
  - Form fields: title (AppInput), description (native textarea — AppInput doesn't support textarea), project (AppSelect), priority (AppSelect), plannedLaunch/plannedOnline (native date inputs), tags (comma-separated input with parse on blur), developers (multi-select combo: user select + role select + add button + removable list)
  - Validation via `createRequirementSchema.safeParse()` from `@pm-system/shared` Zod schemas — maps Zod field errors to component-level errors
  - Submit: calls `requirementsStore.createRequirement()` or `updateRequirement()` with toast on success
  - Developer assignment uses `devUserOptions` (filters out already-assigned users) and `devRoleOptions` from `DEV_ROLE_LABELS`
- **Modified Requirements.vue**: replaced ~86 lines of inline form with 8-line component declaration
- **Gotchas**:
  - `UpdateRequirementDto` shared interface doesn't include `version` field, but backend DTO does — used `as UpdateRequirementDto` cast to pass version for optimistic locking
  - `AppSelect` globally registered component lacks `error` prop (unlike `AppInput`) — error messages rendered as separate `<p>` elements below each select
  - `AppInput` doesn't support `type="date"` or textarea mode — used native `<input type="date">` and `<textarea>` with matching Tailwind styling
  - `watch` on `props.visible` needed `{ immediate: true }`? No — form resets when modal opens, no immediate needed since form starts hidden
- **Pre-existing type errors** (unchanged): `RequirementDetail.vue` references undefined functions (openEditModal, handleEditSubmit, priorityOptions, parseEditTags)

## Task 30 — 统计报表视图 ECharts 实现 (2026-06-21)
- Installed `echarts` as dependency in `packages/frontend/package.json` via pnpm
- Rewrote `packages/frontend/src/views/Reports.vue` to use ECharts instead of hand-rolled CSS/SVG charts:
  - **Status Distribution**: Doughnut pie chart (`radius: ['50%', '70%']`) with 4 status categories — colors match status tags from T25 (pending_review=warning/#FF7D00, developing=primary/#165DFF, testing=amber/#F7BA1E, launched=success/#00B42A)
  - **Priority Distribution**: Doughnut pie chart with 4 priority levels — P0=danger/#F53F3F, P1=warning/#FF7D00, P2=primary/#165DFF, P3=gray/#86909C
  - **Trend Line**: Dual-line chart with area fill gradients — x-axis category with week labels, y-axis integer count (`minInterval: 1`), created=primary blue, launched=success green
- Tooltip formatters use proper percentage display
- Resize handler via `window.addEventListener('resize', resizeCharts)` — all 3 charts resize on window change
- Clean lifecycle: `echarts.init()` in `onMounted` (after `nextTick()` to ensure DOM rendering), `.dispose()` in `onUnmounted`
- Loading skeletons preserved (conic-gradient placeholder circles + pulse bars)
- Empty states preserved (icon + text per chart card)
- Layout: 3 AppCard wrappers, 2 cols on desktop (pie charts) + full-width trend line
- `vue-tsc --noEmit` and `vite build` both pass cleanly (echarts chunk is ~1.1MB gzip'd to ~381KB — expected)

## Task 24 — 仪表盘视图 Dashboard.vue (2026-06-21)
- Enhanced `packages/frontend/src/views/Dashboard.vue` — switched upcoming data source from direct `getUpcoming()` API call (`/dashboard/upcoming`) to `requirementsStore.fetchUpcoming()` (`/requirements/upcoming`) per spec requirement
- **Changes made**:
  - Removed `getUpcoming` import from `@/api/dashboard` — no longer called directly
  - Removed local `upcoming` ref — replaced with `computed(() => requirementsStore.upcoming)` reading from Pinia store
  - Added `upcomingLoading` ref for isolated loading state in upcoming sidebar (separate from stat cards `loading`)
  - Split `fetchStats()` to only fetch `getDashboardStats()` (removed `getUpcoming()` from function)
  - Added `fetchUpcomingData()` — calls `requirementsStore.fetchUpcoming()`, manages its own loading/error states
  - Updated upcoming skeleton loading from `v-if="loading"` to `v-if="upcomingLoading"`
  - `onMounted` now calls all three in parallel: `fetchStats()`, `fetchUpcomingData()`, `fetchMyTasks()`
  - Error isolation: each data source handles its own errors independently — stats failure doesn't block upcoming, etc.
- **Design system alignment**:
  - 4 stat cards: `bg-primary-50` (total/developing), `bg-warning-50` (pendingReview), `bg-success-50` (launched)
  - AppTag used with `type="priority-{P0-P3}"` and `type="status-{status}"` auto-labeling
  - AppCard wraps My Tasks and Upcoming sections with header title + icon pattern
  - AppBadge for avgCycleTime display (primary-500 color)
  - Layout: 2/3 + 1/3 grid on lg, stacks single column on mobile
  - AppAvatar developer stack with negative spacing (`-space-x-1.5`)
- **Edge case handling**:
  - Loading skeletons for all 3 sections (stat cards, tasks, upcoming)
  - Empty states with icons and messages for each section
  - Error states with error message display
  - Overdue items in upcoming flagged with `bg-danger-50` background + red date text
  - All async errors caught gracefully with console.error fallback

## Task 25 — 需求列表 + 筛选栏 (2026-06-21)
- Enhanced `Requirements.vue` — fixed several issues from inline form extraction (T26):
  - **AppTag `:type` → `:color`**: All views in the codebase used `:type="'status-'+status"` but AppTag only accepts `color` prop (red/orange/blue/green/yellow/default). Fixed cell-status, cell-priority, and detail modal to use `:color` with proper mapping functions + `STATUS_LABELS`/`PRIORITY_LABELS` as slot content.
  - **Priority color mapping**: P0→red, P1→orange, P2→blue, P3→default (per spec)
  - **Status color mapping**: pending_review→yellow, developing→blue, testing→orange, launched→green
  - **Added 300ms debounced search**: Replaced button-triggered search with `watch(searchText)` + `setTimeout` debounce. Updates `filters.value.search` and resets page to 1, then calls `store.fetchRequirements()`.
  - **Fixed CSV export**: Was calling `store.exportCSV()` which didn't pass filters. Now imports `exportCsv` from `@/api/requirements` directly and calls `exportCsv(filters.value)` with full blob download flow (createObjectURL, anchor click, revoke).
  - **Empty text**: Changed from "暂无需求数据" to "暂无匹配需求" (both in AppTable empty-text and custom empty state).
  - **Pagination triggers fetch**: `changePage()` and `onPageSizeChange()` now call `store.fetchRequirements(filters.value)` to keep server in sync.
  - **Imports**: Added `watch` from vue, `exportCsv` from `@/api/requirements`; removed unused `applySearch` function.
- Built with Tailwind utility classes, no scoped CSS.
- `vue-tsc --noEmit` passes with 0 errors in Requirements.vue

## Task 28 — 看板视图 — 拖拽 + 二次确认 (2026-06-21)
- **Kanban.vue already existed** with a complete kanban board using native HTML5 Drag & Drop API — refactored to `vuedraggable@next` (v4.1.0, Vue 3 compatible)
- **安装**: `pnpm --filter @pm-system/frontend add vuedraggable@next` — adds SortableJS as transitive dependency
- **导入**: `import draggable from 'vuedraggable'` — used as local component in `<script setup>` (no global registration needed)
- **vuedraggable v4 API**:
  - Components: `<draggable v-model="arr" group="status" item-key="id" :sort="false">`
  - Slot: `<template #item="{ element: req }">` (element = array item, index also available)
  - Events: `@start` (SortableJS start), `@change` ({ added?, removed?, moved? }), `@end`
  - SortableJS options passed as props: `group`, `:sort`, `ghost-class="kanban-ghost"` (kebab-case auto-converted)
  - `v-model` uses `modelValue` prop + `update:modelValue` emit (replaces array); `:list` also available for direct splice mutation
- **关键设计模式 — localColumns + sync**:
  - Replaced `statusColumns` computed (read-only) with `localColumns` ref (writable for vuedraggable v-model binding)
  - `syncLocalColumns()`: reads `store.requirements`, filters by status, creates fresh arrays — called on mount, on cancel/revert, on confirm+API success
  - `watch(() => store.requirements, ...)` auto-syncs when store changes (guarded by `!showTransitionModal` to avoid reverting during decision)
- **拖拽确认流程 (confirm/cancel)**:
  1. `@start` → records `dragContext` ({ element, fromStatus }) by reading `localColumns[oldIndex]`
  2. vuedraggable mutates `localColumns` → card moves visually (immediate feedback)
  3. `@change` with `added` on target → validates transition + RBAC
  4. Invalid → `syncLocalColumns()` reverts + error toast
  5. Valid → shows confirmation modal
  6. Cancel → `closeTransitionModal()` calls `syncLocalColumns()` → card snaps back
  7. Confirm + API success → `syncLocalColumns()` → card stays
  8. Confirm + API failure → `syncLocalColumns()` → card snaps back + error in modal
- **视觉反馈**: `ghost-class="kanban-ghost"` — dashed blue border + 40% opacity + scale(0.98) on the placeholder element while dragging
- **保留的功能**:
  - 按状态/按负责人视图切换 (computed developerColumns unchanged)
  - 移动端点击卡片 → 选择目标状态 → 确认 (handleCardClick + mobile selector modal unchanged)
  - RBAC 权限检查 (checkRBAC, getTransitionRBACError, canDrag unchanged)
  - 状态流转确认弹窗 (transition req/targetStatus/comment/validationError/showTransitionModal unchanged)
  - 乐观锁版本冲突提示 (version in modal, 409 detection)
  - 全部 Tailwind utility classes, scoped CSS scrollbar styles, line-clamp
- **不使用的**: 原生 HTML5 drag events (dragstart/dragover/drop/dragend), dragOverColumn/draggingCardId/dragSourceStatus refs, kanban-column--drag-over styles — 全部移除
- **Build 验证**: `vue-tsc --noEmit` (0 errors), `vite build` (success, Kanban chunk 117kB including vuedraggable+sortablejs)

## Task 27 — 需求详情 + 评论时间线 (2026-06-21)
- Created `packages/frontend/src/views/RequirementDetail.vue` — full detail modal component with data fetching, status transitions, audit timeline, comment timeline, edit/delete actions
- **Architecture**: The component is a self-contained modal (wraps AppModal) that fetches its own data via `fetchData()`. Takes `visible` and `requirementId` props, emits `update:visible`, `updated`, `deleted`.
- **Feature sections** (all inside AppModal body):
  1. **Header**: status AppTag + priority AppTag + code (font-mono)
  2. **Meta grid**: project, creator, createdAt, plannedLaunch, plannedOnline, updatedAt (6 fields in 3-col grid)
  3. **Developers**: flex-wrap list of developer cards (AppAvatar + name + role tag), each in `bg-gray-50 rounded px-2.5 py-1.5`
  4. **Description**: whitespace-pre-wrap in bg-gray-50 rounded p-3
  5. **Tags**: flex-wrap AppTag list (role-frontend style with !bg-gray-100 override)
  6. **Status transitions**: AppButton per `availableTransitions` (filtered from STATUS_FLOW by user role + developer assignment)
     - Click → TransitionConfirmModal (from→to status tags + comment textarea + confirm)
     - Store handles optimistic lock version internally
  7. **Audit timeline**: AppCard list with AppAvatar + operatorName + from→to status tags + comment + time
  8. **Comment timeline**: scrollable list (max-h-[400px]) with avatar, name, time, v-html content with @mention highlighting
     - Regex-based: escape HTML first, then replace `@name` with `<span class="text-primary-600 font-medium">`
     - Backend also provides `mentions` array — used to match names with overlap protection (longest-first sort)
  9. **Comment input**: textarea + AppButton submit, Ctrl+Enter support, disabled when empty
  10. **Footer**: Edit (ghost) + Delete (danger) + Close buttons
- **Sub-modals**:
  - **Edit form modal** (640px): title, description, project (read-only), priority, dates, tags — submits via `store.updateRequirement()` with UpdateRequirementDto
  - **Delete confirm modal** (440px): warning icon + confirmation text, calls `store.deleteRequirement(id)`
  - **Transition confirm modal** (440px): from→to status display + comment textarea
- **Status color fix (AppTag.vue)**: Changed `pending_review` from gray to orange (`bg-warning-100 text-warning-600`) and `testing` from warning to amber (`bg-amber-100 text-amber-600`) per task spec color mapping.
- **Wiring in Requirements.vue**:
  - Replaced the old 15-line inline detail modal with `<RequirementDetail>` component
  - Changed `detailReq` (Requirement object) → `detailReqId` (string ID) — component fetches its own data
  - Added `onDetailUpdated()` / `onDetailDeleted()` handlers that call `store.fetchRequirements()` to refresh table
- **Data flow**: Component fetches requirement + transitions + comments independently via `Promise.all([store.fetchRequirement(), getTransitions(), getComments()])`
- **State reset**: watcher on `visible=false` resets all local state (requirement, transitions, comments, sub-modal visibility)
- **Sub-modals are also AppModals** with `@update:visible` pattern for closing
- `vue-tsc --noEmit` passes with 0 errors in both files

## Task 32 — 前端测试 (Vitest) — 组件 + Store 单元测试 (2026-06-21)
- Installed `vitest@2.1.9`, `@vue/test-utils@2.4.11`, `happy-dom` as devDeps in `packages/frontend`
- Created `vitest.config.ts` with `environment: 'happy-dom'`, `globals: true`, path aliases matching vite.config.ts (`@/` → `src/`, `@pm-system/shared` → `../shared/src`)
- Added `test:fe` script (`vitest run`) to `packages/frontend/package.json`
- **AppButton.test.ts** (3 tests):
  - `variant="primary"` → renders `bg-primary-500` class
  - `loading=true` → button is disabled + `.fa-spinner` element present
  - Click → emits `click` event
- **AppTag.test.ts** (3 tests):
  - `type="priority-P0"` → renders `bg-danger-100` + `text-danger-600` classes
  - `type="status-launched"` → renders `bg-success-100` + `text-success-600` classes
  - Display label renders correctly (`P0 紧急` → `wrapper.text()` contains string)
- **AppModal.test.ts** (4 tests):
  - `visible=false` → `.app-modal` not in DOM (v-if)
  - `visible=true` → found via `document.body.querySelector` (Teleport renders at body)
  - ESC keydown → emits `update:visible(false)` (handler on `document.addEventListener('keydown')`)
  - Overlay `.app-modal__overlay` click → emits `update:visible(false)`
  - **Key learning**: Teleport content renders at body level — use `attachTo: document.body` and query via `document.body.querySelector()` rather than `wrapper.find()` for teleported elements
- **authStore.test.ts** (2 tests):
  - `login()` success → `user` populated, `token` set, `localStorage` synced
  - `logout()` → `user` null, `token` null, `localStorage` cleared
  - Mocked `@/api/auth` (login, getMe) and `@/router` (push) via `vi.mock()`
- **requirementsStore.test.ts** (1 test):
  - `fetchRequirements()` → `requirements` array updated, `total` set to `res.length`
  - Mocked `@/api/requirements` (all exports) via `vi.mock()`
- **Gotchas**:
  - `vitest@4.x` requires vite 6+ — had to downgrade to `vitest@^2.0.0` for vite 5.4 compat
  - Store tests require `setActivePinia(createPinia())` in beforeEach for isolated state
  - Teleport in @vue/test-utils renders content at the target element — use `document.body.querySelector` to find teleported elements
  - `vi.mock()` factory pattern works with `import * as moduleApi` for `vi.mocked()` access in tests
- All 13 tests pass, `pnpm test:fe` verified from workspace root

## Task 31 — 响应式布局适配 3 断点 (2026-06-21)
- **3 breakpoints**: sm=640, md=768, lg=1024, xl=1280 (Tailwind defaults, DESIGN.md confirmed)
- **Sidebar.vue**: Changed from `w-64` to `w-full md:w-64` — on mobile (<768px) the sidebar fills full width as a fullscreen overlay; on tablet (768-1023px) it shows as a 256px panel sliding in from the left
- **AppLayout.vue**: Already had correct responsive structure (mobile sidebar overlay at `<lg` with backdrop + slide transition, desktop sidebar at `lg:ml-64` + `hidden lg:block`). Added uiStore sync: `watch(mobileOpen)` updates `uiStore.sidebarCollapsed` for cross-component awareness.
- **Modal.vue (common)**: Outer container padding changed from `p-4` to `p-0 md:p-4`. Panel changed from `rounded-lg max-h-[90vh]` to `h-full md:h-auto md:max-h-[90vh] md:rounded-lg`. On mobile: modal fills entire screen (fullscreen), on md+: normal rounded modal with padding.
- **AppModal.vue**: Same fullscreen pattern as common/Modal.vue — `p-0 md:p-4`, `h-full md:h-auto md:max-h-[90vh] md:rounded-lg`.
- **Kanban.vue**: Added responsive list views for <768px:
  - `isMobile` ref with `window.innerWidth < 768` check + resize listener (mounted/unmounted)
  - **By Status (mobile)**: Flat list grouped by status section headers (dot + label + count), each item shows priority tag, code, title, planned launch date, and chevron-right. Clicking opens the mobile status selector modal (existing `handleCardClick` + `mobileTransitions`).
  - **By Developer (mobile)**: Flat list grouped by developer (Avatar + name + count), items show priority tag, status tag, code, title. Same click → transition selector flow.
  - Desktop column views (drag-and-drop Kanban) preserved unchanged for ≥768px.
- **Table components**: `AppTable.vue` and `common/Table.vue` already had `overflow-x-auto` wrapper for horizontal scroll on small screens — no changes needed.
- **Forms (RequirementFormModal.vue)**: Already used `w-full` inputs and `grid-cols-1 sm:grid-cols-2` responsive grid — no changes needed.
- **Dashboard.vue**: Already used responsive grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` + `lg:grid-cols-3` for main content) — no changes needed.
- **Reports.vue**: Already used responsive layouts with `<details>` collapse toggle for trend table on mobile — no changes needed.
- **Requirements.vue**: Already used responsive filter grid and pagination — no changes needed.
- **uiStore**: `sidebarCollapsed`, `toggleSidebar()` already existed and are now synced with AppLayout's mobile overlay state.

## Task 33 — Backend Unit Tests (Jest): Controller + Service (2026-06-21)
- Created `packages/backend/jest.config.ts` with ts-jest preset, node test environment
- Added `moduleNameMapper` for `@pm-system/shared` → source files (shared package's `.js` extension imports require resolution mapping `'^(\\.{1,2}/.*)\\.js$': '$1'`)
- Installed `jest`, `ts-jest`, `@types/jest` as devDependencies via `pnpm --filter @pm-system/backend add -D jest @types/jest ts-jest`
- Added `"test:be": "jest --config jest.config.ts"` script to `packages/backend/package.json`
- **Auth service tests** (`src/auth/__tests__/auth.service.spec.ts` — 7 tests):
  - `validateUser` with valid userId → returns user without `password` field
  - `validateUser` with invalid userId → returns null
  - `validateUser` when user is inactive → returns null
  - `login` with correct credentials → returns `{ accessToken, user }` (no password in user), verifies JWT payload
  - `login` with unknown email → throws UnauthorizedException
  - `login` with wrong password → throws UnauthorizedException
  - `login` when user is inactive → throws UnauthorizedException
  - **Gotcha**: `bcryptjs` exports `compare` as non-configurable property — `jest.spyOn` fails with "Cannot redefine property". Solution: `jest.mock('bcryptjs', () => ({ compare: jest.fn() }))` at module level, then use `(bcrypt.compare as jest.Mock).mockResolvedValue(value)`
- **Requirements service tests** (`src/requirements/__tests__/requirements.service.spec.ts` — 7 tests):
  - `create` generates code in `REQ-2026-XXX` format, creates initial status transition
  - `create` increments code sequence from last existing code (`REQ-2026-005` → `REQ-2026-006`)
  - `create` throws BadRequestException when project not found
  - `transition` from `pending_review` to `developing` with PM role succeeds (version increment, status transition record created)
  - `transition` with invalid flow (`pending_review` → `testing`) → BadRequestException
  - `transition` with wrong role (DEV tries PM-required transition) → ForbiddenException (RBAC)
  - `transition` with version mismatch (optimistic locking) → ConflictException via Prisma P2025
  - `transition` when requirement not found → NotFoundException
- **Prisma service tests** (`src/prisma/__tests__/prisma.service.spec.ts` — 8 tests):
  - Middleware converts `delete` → `update` with `isDeleted: true` for Requirement model
  - Middleware converts `deleteMany` → `updateMany` with `isDeleted: true`
  - Middleware injects `isDeleted: { not: true }` filter on `findUnique`/`findMany` for Requirement (when not explicitly specified)
  - Middleware does NOT inject `isDeleted` filter when already explicitly set
  - Non-Requirement models (User, Comment) pass through unchanged
  - `create` action on Requirement passes through unfiltered
  - **Testing approach**: Intercepted `PrismaClient.prototype.$use` via `jest.spyOn` before instantiation to capture the middleware function, then called it directly with test params + mock `next` callback — avoids real DB connection
- All **23 tests pass** across 3 test suites, `npx jest --config jest.config.ts --verbose` verified
- `@nestjs/testing` was already in devDependencies — no install needed

## Task 35 — Docker Compose Final + README (2026-06-21)
- Updated `docker-compose.yml`:
  - Added `target: dev` to both `backend` and `frontend` build sections (explicit stage selection from multi-stage Dockerfiles)
  - Added `db-data` named volume for SQLite data persistence mounted at `/app/packages/backend/data`
  - Overrode `DATABASE_URL=file:./data/dev.db` in backend environment to point into the volume path
  - `depends_on` (frontend → backend) already existed
- `Dockerfile.backend`: 4-stage (base → builder → dev/prod):
  - base: node:20-alpine, corepack pnpm, manifest-only dependency install for layer caching
  - builder: compiles shared package (tsc), generates Prisma client, runs nest build
  - dev: extends builder, CMD `pnpm run start:dev`
  - prod: fresh node:20-alpine base, copies only dist + prisma + shared from builder, installs --prod, runs prisma generate, CMD `node dist/main`
- `Dockerfile.frontend`: 4-stage (base → builder → dev/prod):
  - builder: compiles shared, runs vite build → dist/
  - dev: extends builder, CMD `pnpm run dev -- --host`
  - prod: nginx:alpine, copies dist/ to /usr/share/nginx/html, applies nginx.conf, EXPOSE 80
- `nginx.conf`: SPA try_files + /api proxy_pass to http://backend:3000
- `README.md`: Chinese project intro, tech stack table, quick start (pnpm install → prisma db push → seed → dev), Docker deploy, 5 pre-set accounts table, project structure tree
- Key decisions:
  - SQLite volume path `/app/packages/backend/data` avoids conflict with bind-mounted source at `/app/packages/backend/`
  - Prod backend uses `node dist/main` (not `nest start`) to avoid shipping @nestjs/cli in prod image
  - Builder compiles shared first since workspace packages depend on it at build time
  - No CI/CD workflows, no emojis, no AI boilerplate in README (per spec)
