---
name: 团队项目管理系统
description: 以「需求」为最小管理粒度的团队协作工具
colors:
  primary: "#165DFF"
  primary-deep: "#1d4ed8"
  success: "#00B42A"
  error: "#F53F3F"
  warning: "#F59E0B"
  secondary: "#8B5CF6"
  neutral-bg: "#F5F7FA"
  neutral-white: "#FFFFFF"
  ink-primary: "#1F2937"
  ink-secondary: "#374151"
  ink-muted: "#6B7280"
  ink-faint: "#9CA3AF"
  border: "#E5E7EB"
  p0: "#F53F3F"
  p1: "#F97316"
  p2: "#165DFF"
  p3: "#9CA3AF"
  status-pending: "#F59E0B"
  status-developing: "#165DFF"
  status-testing: "#8B5CF6"
  status-launched: "#00B42A"
  role-frontend: "#165DFF"
  role-backend: "#00B42A"
  role-data: "#F59E0B"
  role-pm: "#8B5CF6"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.neutral-white}"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.border}"
    textColor: "{colors.ink-primary}"
  card:
    backgroundColor: "{colors.neutral-white}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  tag:
    backgroundColor: "rgba(22, 93, 255, 0.1)"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  input:
    backgroundColor: "{colors.neutral-white}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input-focus:
    borderColor: "{colors.primary}"
    boxShadow: "0 0 0 3px rgba(22, 93, 255, 0.1)"
  nav-item-active:
    backgroundColor: "rgba(22, 93, 255, 0.12)"
    textColor: "{colors.primary}"
    borderRight: "3px solid {colors.primary}"
---

# 设计系统：团队项目管理系统

## 1. 概述

**创意北极星：「蓝本」**

以蓝色为锚点，以信息效率为核心的团队协作工具。设计上追求「专业不刻板，清晰不寡淡」—— 每个界面元素都有明确的目的，不做无意义的装饰，但也不沦为纯功能主义的枯燥表格。

蓝色主调贯穿始终，承载「可靠、专业、信任」的品牌情绪；辅助色系严格按语义分配，形成一套可预测的颜色密码，让用户在扫视的瞬间就能判断优先级、状态和角色。

**关键特征：**
- 信息密度中等偏高，但视觉层级清晰，扫视即得
- 扁平为主的框架，通过轻微阴影和边框增强可读性
- 组件风格一致，圆角克制（8px），避免过度圆润
- 颜色即信息：每种颜色都承载明确的语义角色
- 中文排版优先，系统字体栈确保跨平台中文渲染质量

## 2. 色彩

调性：蓝色锚定专业与信任，辅助色按语义严格分配，形成可预测的视觉编码。

### 主色
- **专注蓝** (#165DFF)：主色调。用于按钮主操作、链接、激活态、导航高亮、蓝色标签徽章。代表专业与信任。

### 辅助色（语义色）
- **生长绿** (#00B42A)：成功 / 上线。用于「已上线」状态标签、成功指标、正向趋势箭头。
- **警示红** (#F53F3F)：错误 / P0 紧急优先级。用于错误反馈、P0 标签、负向趋势箭头。
- **警示橙** (#F59E0B)：警告 / 待评审。用于「待评审」状态标签、P1 优先级、警告类信息。
- **空灵紫** (#8B5CF6)：测试中 / PM 角色。用于「测试中」状态标签、PM 职能徽章。

### 中性色
- **纯白** (#FFFFFF)：卡片、容器背景
- **极浅灰** (#F5F7FA)：页面背景、表格表头、侧边栏分割区
- **一级墨** (#1F2937)：主要文字，标题、表头
- **二级墨** (#374151)：正文
- **三级墨** (#6B7280)：次要文字，描述说明
- **四级墨** (#9CA3AF)：最淡文字，占位符、禁用态
- **边框** (#E5E7EB)：卡片、表格、容器边框
- **分割线** (#F3F4F6)：表格行分割

### 功能色（优先级系统）
- **P0 红** (#F53F3F)：紧急，带红色底纹
- **P1 橙** (#F97316)：高优先级，带橙色底纹
- **P2 蓝** (#165DFF)：中优先级（与主色同色），带蓝色底纹
- **P3 灰** (#9CA3AF)：普通优先级，带灰色底纹

### 命名规则
**「颜色即信息」规则。** 不使用纯装饰性颜色。每种颜色都有语义角色：蓝色 = 操作 / 开发中，绿色 = 完成 / 上线，红色 = 紧急 / 错误，橙色 = 警告 / 待审，紫色 = 测试 / PM。如果一种颜色不能通过"扫一眼就传达信息"的测试，就不应该使用。

## 3. 排版

**字体栈：** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

**字符风格：** 系统原生字体栈，跨平台中文渲染一致，无加载开销。单字重家族配合字号/字重层级构建清晰的信息层级。

### 层级
- **Display** (Bold 700, clamp(1.5rem, 2.5vw, 2rem), 1.25)：页面标题，仅用于仪表盘和功能模块主标题
- **Headline** (Bold 700, 20px, 1.3)：模块标题，如「需求管理」「看板视图」，出现在页面内容区顶部
- **Title** (SemiBold 600, 16px, 1.4)：卡片标题、侧边栏项、弹窗标题
- **Body** (Regular 400, 14px, 1.5)：正文内容、表格单元格、描述文本
- **Label** (Medium 500, 12px, 1.4, 0.01em)：标签、徽章文字、辅助信息
- **Code** (monospace, 12-14px)：需求编号、代码片段。使用 `font-mono` 类

### 命名规则
**「层级即关系」规则。** 不要为了突出而跳级使用字号。内容区块的标题用 Headline（20px），区块内部小标题用 Title（16px），正文用 Body（14px）。跳级会让信息关系混乱。

## 4. 层级

扁平为主，轻微阴影增强。容器之间通过边框（1px solid #E5E7EB）和背景色（白色容器在浅灰背景上）区分层级，而非大面积使用阴影。

### 阴影词汇
- **卡片阴影** (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`)：卡片 hover 时使用，提供轻微的抬起提示
- **弹窗阴影** (`box-shadow: 0 4px 24px rgba(0,0,0,0.15)`)：模态弹窗，与背景遮罩配合
- **下拉阴影** (`box-shadow: 0 2px 8px rgba(0,0,0,0.1)`)：下拉菜单、选择器浮层

### Z-index 体系
```
dropdown / tooltip    → 100
sticky header         → 10
modal backdrop        → 200
modal content         → 210
toast                 → 300
```

### 命名规则
**「扁平优先」规则。** 表面在静止状态无阴影，靠边框和背景色区分层级。阴影仅作为反馈（hover、focus）或层级暗示（弹窗、下拉）使用，不做装饰。

## 5. 组件

### 按钮

**特色：** 干脆、明确。主按钮饱满有力，次按钮克制内敛。

- **形状：** 圆角 8px (`rounded-lg`)
- **主按钮：** 专注蓝底白字 `#165DFF`，hover 加深至 `#1d4ed8`，active 缩放 0.96
- **次按钮：** 浅灰底深灰字 `bg-gray-100` → `text-gray-700`，hover 变深灰底
- **文字按钮：** 无背景，纯蓝色文字，hover 加深
- **禁用态：** 灰底 `#E5E7EB`，灰色文字 `#9CA3AF`，`cursor-not-allowed`

### 标签 / 徽章

**特色：** 轻量、紧凑。用于状态、优先级、角色标识。

- **形状：** 圆角 4px，2px 上内边距，8px 左右内边距
- **颜色：** 每种状态/优先级/角色有对应的语义色组合（底色 10% 透明度 + 满色文字）
- **字号：** 12px (text-xs)，字重 500

### 卡片 / 容器

**特色：** 信息容器，克制不抢眼。

- **形状：** 圆角 8px
- **背景：** 纯白 #FFFFFF
- **边框：** 1px solid #E5E7EB
- **内边距：** 16-20px（p-4 / p-5）
- **阴影：** 静止无阴影，hover 时叠加 `0 1px 3px rgba(0,0,0,0.08)`

### 输入框 / 选择器

**特色：** 干净、明确焦点态。

- **形状：** 圆角 8px，1px 边框 `border-gray-300`
- **内边距：** 12px 左右，8px 上下
- **焦点态：** 边框变专注蓝 + 3px 蓝色发光环 `box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1)`
- **字号：** 14px (text-sm)

### 数据表格

**特色：** 信息密集，扫视友好。

- **表头：** 极浅灰背景 `#F5F7FA`，字重 600，深灰文字
- **行：** 白色背景，hover 浅蓝底纹 `rgba(22, 93, 255, 0.04)`
- **选中行：** 较深蓝底纹 `rgba(22, 93, 255, 0.08)`
- **分割：** 表头下 1px 灰边，行间无分割线（极浅灰分割线 `#F3F4F6` 可选）

### 导航（侧边栏）

**特色：** 垂直菜单，激活态用右边框强调。

- **内边距：** 16px 左右，10px 上下
- **默认态：** 深灰文字 `text-gray-700`
- **Hover：** 浅蓝底纹 8%
- **激活态：** 10-12% 蓝底 + 3px 蓝色右边框

### 模态弹窗

**特色：** 聚焦内容，遮罩隔离。

- **遮罩：** 全屏半透明黑 `rgba(0,0,0,0.3-0.5)`
- **内容框：** 白色背景，圆角 8px，阴影 `0 4px 24px rgba(0,0,0,0.15)`
- **入场：** 缩放 0.95→1 + 淡入 0.3s

### 看板卡片

**特色：** 轻量卡片，强调拖拽交互。

- **形状：** 圆角 8px，浅灰背景 `bg-gray-50`，1px 浅灰边框
- **内容：** 需求编号（monospace 蓝色）+ 标题 + 优先级标签 + 开发人员标签
- **Hover：** 阴影增强至 `0 2px 8px rgba(0,0,0,0.1)`
- **看板列顶部分色条：** 4px 宽的语义色边框（待评审橙、开发中蓝、测试中紫、已上线绿）

## 6. 注意事项

### 应做：

- **要** 使用语义色编码：蓝色=操作/开发中，绿色=成功/上线，红色=紧急/错误，橙色=警告/待审，紫色=测试/PM
- **要** 保持圆角一致：按钮/卡片/输入框统一 8px，标签 4px
- **要** 保持扁平优先：静止时无阴影，hover 再加轻微阴影
- **要** 使用系统字体栈保证跨平台中文渲染质量
- **要** 确保表格行有 hover 高亮（4%）和选中高亮（8%）
- **要** 为所有按钮提供 hover 态反馈

### 禁止：

- **不要** 添加纯装饰性颜色 — 每种颜色必须有语义
- **不要** 使用大于 12px 的圆角（标签徽章除外，用 4px）
- **不要** 在静止卡片上使用阴影 — 层级靠边框区分
- **不要** 为大段正文使用灰色文字（低于 7:1 对比度）— 正文用 #374151，次级说明用 #6B7280
- **不要** 同时使用边框 + 大阴影做装饰 — 选其一
- **不要** 在侧边栏/导航中使用图标而不带文字标签
