# 蓝本 - 团队项目管理系统

团队项目管理系统（蓝本）是一个面向中小规模研发团队的轻量级项目管理工具，提供需求管理、看板协作、统计报表等功能。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS |
| 后端 | NestJS + TypeScript + Prisma ORM |
| 数据库 | SQLite |
| 容器 | Docker + Docker Compose |
| 包管理 | pnpm workspace (monorepo) |

## 快速开始（本地开发）

**前置条件**: Node.js >= 18, pnpm >= 8

```bash
# 1. 安装依赖
pnpm install

# 2. 初始化数据库（创建 SQLite 表结构）
pnpm --filter @pm-system/backend exec prisma db push

# 3. 填充种子数据（预置账号见下方）
pnpm --filter @pm-system/backend exec prisma db seed

# 4. 启动开发服务
pnpm dev
```

后端开发服务器运行在 http://localhost:3000，前端 dev server 运行在 http://localhost:5173（已配置 /api 代理到后端）。

如果只需启动前端或后端之一：

```bash
pnpm --filter @pm-system/backend dev     # 后端 only
pnpm --filter @pm-system/frontend dev    # 前端 only
```

## Docker 部署

```bash
docker-compose up -d
```

首次启动会自动构建镜像并初始化。后端可通过 http://localhost:3000 访问，前端可通过 http://localhost:5173 访问（Vite HMR 模式）。如需生产部署，使用 Dockerfile 的 prod target 自行构建。

## 预置账号

| 角色 | 姓名 | 邮箱 | 密码 |
| --- | --- | --- | --- |
| 项目经理 | 张明 | zhangming@example.com | pm123456 |
| 前端开发 | 李浩 | lihao@example.com | dev123456 |
| 前端+后端开发 | 王婷 | wangting@example.com | dev123456 |
| 后端开发 | 陈伟 | chenwei@example.com | dev123456 |
| 前端+后端+数据开发 | 刘洋 | liuyang@example.com | dev123456 |

## 项目结构

```
team-pm-system/
├── packages/
│   ├── backend/          # NestJS 后端 (API :3000)
│   │   ├── prisma/       # Schema + migrations + seed
│   │   └── src/          # Modules (auth, users, projects, requirements, etc.)
│   ├── frontend/         # Vue 3 前端 (Vite :5173)
│   │   └── src/          # Views, components, stores, API client
│   └── shared/           # 共享类型、枚举、校验规则
├── docker-compose.yml    # Docker Compose (开发模式)
├── Dockerfile.backend    # 后端多阶段构建
├── Dockerfile.frontend   # 前端多阶段构建
└── nginx.conf            # Nginx SPA 配置 (生产部署)
```
