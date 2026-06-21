import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  const salt = bcrypt.genSaltSync(10);

  // ─── Users ─────────────────────────────────────────────────────────────────
  // Data from team-project-management.html prototype: 5 team members
  const usersData = [
    {
      id: 'user-pm-001',
      name: '张明',
      email: 'zhangming@example.com',
      password: bcrypt.hashSync('pm123456', salt),
      role: 'pm' as const,
      devRoles: JSON.stringify([]),
    },
    {
      id: 'user-dev-lihao',
      name: '李浩',
      email: 'lihao@example.com',
      password: bcrypt.hashSync('dev123456', salt),
      role: 'dev' as const,
      devRoles: JSON.stringify(['frontend']),
    },
    {
      id: 'user-dev-wangting',
      name: '王婷',
      email: 'wangting@example.com',
      password: bcrypt.hashSync('dev123456', salt),
      role: 'dev' as const,
      devRoles: JSON.stringify(['frontend', 'backend']),
    },
    {
      id: 'user-dev-chenwei',
      name: '陈伟',
      email: 'chenwei@example.com',
      password: bcrypt.hashSync('dev123456', salt),
      role: 'dev' as const,
      devRoles: JSON.stringify(['backend']),
    },
    {
      id: 'user-dev-liuyang',
      name: '刘洋',
      email: 'liuyang@example.com',
      password: bcrypt.hashSync('dev123456', salt),
      role: 'dev' as const,
      devRoles: JSON.stringify(['data']),
    },
  ];

  const users = await prisma.$transaction(
    usersData.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        create: u,
        update: { name: u.name, role: u.role, devRoles: u.devRoles },
      }),
    ),
  );
  console.log(`  ✅ Created ${users.length} users`);

  // Build lookup map by name
  const userByName: Record<string, (typeof users)[0]> = {};
  for (const u of users) {
    userByName[u.name] = u;
  }

  // ─── Projects ──────────────────────────────────────────────────────────────
  // 5 projects from prototype, lead by 张明 (PM)
  const projectsData = [
    { id: 'proj-payment', name: '支付中台', description: '支付核心系统', leadName: '张明' as const },
    { id: 'proj-growth', name: '用户增长', description: '用户增长策略', leadName: '张明' as const },
    { id: 'proj-data', name: '数据平台', description: '数据处理平台', leadName: '张明' as const },
    { id: 'proj-risk', name: '风控系统', description: '风险控制系统', leadName: '张明' as const },
    { id: 'proj-merchant', name: '商家后台', description: '商家管理后台', leadName: '张明' as const },
  ];

  const projects = await prisma.$transaction(
    projectsData.map((p) =>
      prisma.project.upsert({
        where: { id: p.id },
        create: { id: p.id, name: p.name, description: p.description, leadId: userByName[p.leadName].id },
        update: { name: p.name, description: p.description, leadId: userByName[p.leadName].id },
      }),
    ),
  );
  console.log(`  ✅ Created ${projects.length} projects`);

  // Build lookup map by name
  const projectByName: Record<string, (typeof projects)[0]> = {};
  for (const p of projects) {
    projectByName[p.name] = p;
  }

  // ─── Requirements ──────────────────────────────────────────────────────────
  // All 17 requirements from the prototype.
  // Status mapping: 待评审→pending_review, 开发中→developing, 测试中→testing, 已上线→launched
  // Dates come from the HTML table and detail modals (team-project-management.html lines ~1025-1523 + reqData ~4396-4532)

  interface ReqInput {
    id: string;
    code: string;
    title: string;
    description: string;
    projectName: string;
    priority: string;
    status: string;
    plannedLaunch: string | null;
    plannedOnline: string | null;
    tags: string[];
    creatorName: string;   // mapped to the closest PM in our seed (张明)
    devAssignments: { devName: string; role: string }[];
  }

  const requirementsData: ReqInput[] = [
    {
      id: 'req-001',
      code: 'REQ-2025-001',
      title: '用户登录优化 - 支持验证码登录',
      description: '支持用户通过手机验证码进行登录，提升登录便捷性和安全性。需支持短信验证码和邮箱验证码两种方式，验证码有效期 5 分钟，同一手机号每分钟最多发送 1 条。',
      projectName: '用户增长',
      priority: 'P0',
      status: 'testing',
      plannedLaunch: '2025-06-01',
      plannedOnline: null,
      tags: ['登录', '安全', '验证码'],
      creatorName: '张明',
      devAssignments: [
        { devName: '李浩', role: 'frontend' },
        { devName: '王婷', role: 'backend' },
      ],
    },
    {
      id: 'req-002',
      code: 'REQ-2025-002',
      title: '支付渠道对接 - 微信支付V3',
      description: '对接微信支付V3接口，支持JSAPI支付、Native支付和H5支付三种模式。需完成商户号配置、回调处理、退款流程及对账文件生成。',
      projectName: '支付中台',
      priority: 'P1',
      status: 'developing',
      plannedLaunch: '2025-06-02',
      plannedOnline: null,
      tags: ['支付', '渠道', '微信'],
      creatorName: '张明',
      devAssignments: [
        { devName: '陈伟', role: 'backend' },
      ],
    },
    {
      id: 'req-003',
      code: 'REQ-2025-003',
      title: '用户画像数据看板',
      description: '构建用户画像数据看板，整合用户基础属性、行为特征、消费偏好等多维度数据，支持自定义筛选和可视化展示。',
      projectName: '数据平台',
      priority: 'P2',
      status: 'pending_review',
      plannedLaunch: '2025-06-03',
      plannedOnline: null,
      tags: ['数据', '看板', '画像'],
      creatorName: '张明',
      devAssignments: [
        { devName: '李浩', role: 'frontend' },
        { devName: '刘洋', role: 'data' },
      ],
    },
    {
      id: 'req-004',
      code: 'REQ-2025-004',
      title: '订单导出功能 - 支持Excel批量导出',
      description: '为订单管理模块增加Excel批量导出功能，支持按时间范围、订单状态、支付方式等条件筛选导出，单次最大导出10万条记录。',
      projectName: '支付中台',
      priority: 'P3',
      status: 'launched',
      plannedLaunch: null,
      plannedOnline: '2025-05-28',
      tags: ['导出', '订单', 'Excel'],
      creatorName: '张明',
      devAssignments: [
        { devName: '王婷', role: 'frontend' },
        { devName: '王婷', role: 'backend' },
      ],
    },
    {
      id: 'req-005',
      code: 'REQ-2025-005',
      title: '数据报表自动推送 - 每日邮件通知',
      description: '实现数据报表的自动生成和邮件推送功能。支持定时任务每日生成前一日业务报表，并通过邮件发送给指定收件人列表。',
      projectName: '数据平台',
      priority: 'P2',
      status: 'developing',
      plannedLaunch: '2025-06-04',
      plannedOnline: null,
      tags: ['报表', '通知', '邮件'],
      creatorName: '张明',
      devAssignments: [
        { devName: '刘洋', role: 'data' },
      ],
    },
    {
      id: 'req-006',
      code: 'REQ-2025-006',
      title: '权限管理模块升级',
      description: '对权限管理模块进行架构升级，支持基于角色的细粒度权限控制，优化权限分配和审批流程，提升系统安全性和可管理性。',
      projectName: '风控系统',
      priority: 'P1',
      status: 'pending_review',
      plannedLaunch: null,
      plannedOnline: null,
      tags: ['权限', '安全', '架构'],
      creatorName: '张明',
      devAssignments: [
        { devName: '陈伟', role: 'backend' },
      ],
    },
    {
      id: 'req-007',
      code: 'REQ-2025-007',
      title: '通知中心重构',
      description: '重构通知中心模块，提升消息推送的稳定性和可扩展性，新增多渠道通知支持和订阅配置功能，优化用户通知体验。',
      projectName: '用户增长',
      priority: 'P2',
      status: 'pending_review',
      plannedLaunch: null,
      plannedOnline: null,
      tags: ['通知', '重构', '消息'],
      creatorName: '张明',
      devAssignments: [
        { devName: '李浩', role: 'frontend' },
      ],
    },
    {
      id: 'req-008',
      code: 'REQ-2025-008',
      title: '对账系统优化',
      description: '对对账系统进行全面优化，提升对账效率和准确性。支持多渠道对账、自动差错处理、对账报告生成等功能。',
      projectName: '支付中台',
      priority: 'P1',
      status: 'pending_review',
      plannedLaunch: '2025-06-18',
      plannedOnline: null,
      tags: ['对账', '优化', '支付'],
      creatorName: '张明',
      devAssignments: [
        { devName: '陈伟', role: 'backend' },
      ],
    },
    {
      id: 'req-009',
      code: 'REQ-2025-009',
      title: 'A/B测试平台',
      description: '搭建A/B测试平台，支持用户分桶、实验配置、指标监控和结果分析。帮助产品团队进行数据驱动的决策。',
      projectName: '用户增长',
      priority: 'P2',
      status: 'pending_review',
      plannedLaunch: '2025-06-17',
      plannedOnline: null,
      tags: ['测试', '增长', '实验'],
      creatorName: '张明',
      devAssignments: [
        { devName: '王婷', role: 'frontend' },
      ],
    },
    {
      id: 'req-010',
      code: 'REQ-2025-010',
      title: '实时风控规则引擎',
      description: '构建实时风控规则引擎，支持可视化规则配置、实时交易检测、风险评分计算和自动拦截。需支持每秒万级吞吐。',
      projectName: '风控系统',
      priority: 'P0',
      status: 'developing',
      plannedLaunch: '2025-06-15',
      plannedOnline: null,
      tags: ['风控', '引擎', '实时'],
      creatorName: '张明',
      devAssignments: [
        { devName: '陈伟', role: 'backend' },
        { devName: '刘洋', role: 'data' },
      ],
    },
    {
      id: 'req-011',
      code: 'REQ-2025-011',
      title: '商家入驻流程改造',
      description: '重构商家入驻流程，简化资料提交步骤，引入OCR自动识别和智能审核，缩短入驻审核周期。',
      projectName: '商家后台',
      priority: 'P1',
      status: 'developing',
      plannedLaunch: '2025-06-14',
      plannedOnline: null,
      tags: ['商家', '入驻', '流程'],
      creatorName: '张明',
      devAssignments: [
        { devName: '李浩', role: 'frontend' },
        { devName: '王婷', role: 'backend' },
      ],
    },
    {
      id: 'req-012',
      code: 'REQ-2025-012',
      title: '数据报表导出优化',
      description: '优化大数据量报表导出性能，支持异步导出、断点续传、自定义模板配置。',
      projectName: '数据平台',
      priority: 'P3',
      status: 'testing',
      plannedLaunch: '2025-06-12',
      plannedOnline: null,
      tags: ['报表', '导出', '性能'],
      creatorName: '张明',
      devAssignments: [
        { devName: '刘洋', role: 'data' },
      ],
    },
    {
      id: 'req-013',
      code: 'REQ-2025-013',
      title: '消息通知中心',
      description: '建设统一的消息通知中心，整合短信、邮件、站内信、App Push等多通道通知能力，支持用户通知偏好设置。',
      projectName: '用户增长',
      priority: 'P1',
      status: 'pending_review',
      plannedLaunch: '2025-06-11',
      plannedOnline: null,
      tags: ['消息', '通知', '多通道'],
      creatorName: '张明',
      devAssignments: [
        { devName: '李浩', role: 'frontend' },
        { devName: '陈伟', role: 'backend' },
      ],
    },
    {
      id: 'req-014',
      code: 'REQ-2025-014',
      title: '支付路由策略升级',
      description: '升级支付路由策略，支持智能路由选择最优支付渠道，基于费率、成功率、响应时间等指标动态切换。',
      projectName: '支付中台',
      priority: 'P0',
      status: 'launched',
      plannedLaunch: null,
      plannedOnline: '2025-06-08',
      tags: ['支付', '路由', '策略'],
      creatorName: '张明',
      devAssignments: [
        { devName: '陈伟', role: 'backend' },
      ],
    },
    {
      id: 'req-015',
      code: 'REQ-2025-015',
      title: '用户画像V2',
      description: '用户画像系统V2版本升级，新增实时标签计算、人群圈选、画像API开放能力。',
      projectName: '数据平台',
      priority: 'P2',
      status: 'launched',
      plannedLaunch: null,
      plannedOnline: '2025-06-05',
      tags: ['画像', '数据', '升级'],
      creatorName: '张明',
      devAssignments: [
        { devName: '刘洋', role: 'data' },
      ],
    },
    {
      id: 'req-016',
      code: 'REQ-2025-016',
      title: '商家评分系统',
      description: '设计商家评分模型，综合考虑交易量、好评率、纠纷率、响应时间等维度，为商家分层运营提供数据支撑。',
      projectName: '商家后台',
      priority: 'P2',
      status: 'developing',
      plannedLaunch: '2025-06-03',
      plannedOnline: null,
      tags: ['评分', '商家', '模型'],
      creatorName: '张明',
      devAssignments: [
        { devName: '王婷', role: 'frontend' },
        { devName: '陈伟', role: 'backend' },
      ],
    },
    {
      id: 'req-017',
      code: 'REQ-2025-017',
      title: '风控黑白名单管理',
      description: '建设风控黑白名单管理系统，支持名单批量导入、自动过期、分级管理，提供查询和监控告警能力。',
      projectName: '风控系统',
      priority: 'P1',
      status: 'testing',
      plannedLaunch: '2025-06-01',
      plannedOnline: null,
      tags: ['风控', '名单', '黑白名单'],
      creatorName: '张明',
      devAssignments: [
        { devName: '陈伟', role: 'backend' },
      ],
    },
  ];

  for (const req of requirementsData) {
    const project = projectByName[req.projectName];
    const creator = userByName[req.creatorName];

    // Upsert requirement by unique code
    const created = await prisma.requirement.upsert({
      where: { code: req.code },
      create: {
        code: req.code,
        title: req.title,
        description: req.description,
        projectId: project.id,
        priority: req.priority,
        status: req.status,
        creatorId: creator.id,
        plannedLaunch: req.plannedLaunch,
        plannedOnline: req.plannedOnline,
        tags: JSON.stringify(req.tags),
      },
      update: {
        title: req.title,
        description: req.description,
        projectId: project.id,
        priority: req.priority,
        status: req.status,
        plannedLaunch: req.plannedLaunch,
        plannedOnline: req.plannedOnline,
        tags: JSON.stringify(req.tags),
      },
    });

    // Upsert developer assignments (RequirementDeveloper with @@unique([requirementId, userId, role]))
    for (const dev of req.devAssignments) {
      const devUser = userByName[dev.devName];
      await prisma.requirementDeveloper.upsert({
        where: {
          requirementId_userId_role: {
            requirementId: created.id,
            userId: devUser.id,
            role: dev.role,
          },
        },
        create: {
          requirementId: created.id,
          userId: devUser.id,
          role: dev.role,
        },
        update: {
          role: dev.role,
        },
      });
    }

    // Record initial status transition (if not already present)
    const existingTransition = await prisma.statusTransition.findFirst({
      where: {
        requirementId: created.id,
        fromStatus: null,
        toStatus: req.status,
        operatorId: creator.id,
      },
    });
    if (!existingTransition) {
      await prisma.statusTransition.create({
        data: {
          requirementId: created.id,
          fromStatus: null,
          toStatus: req.status,
          operatorId: creator.id,
          comment: '需求创建',
        },
      });
    }
  }

  console.log(`  ✅ Created ${requirementsData.length} requirements with developer assignments, and transitions`);

  // ─── Summary ───────────────────────────────────────────────────────────────
  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const reqCount = await prisma.requirement.count();
  const devAssignCount = await prisma.requirementDeveloper.count();
  const transitionCount = await prisma.statusTransition.count();

  console.log('\n📊 Seed Summary:');
  console.log(`   Users:         ${userCount}`);
  console.log(`   Projects:      ${projectCount}`);
  console.log(`   Requirements:  ${reqCount}`);
  console.log(`   Dev Assignments: ${devAssignCount}`);
  console.log(`   Transitions:   ${transitionCount}`);
  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
