---
name: marketing-design-yxui
description: >-
  Implements and audits marketing-domain Web UIs per YXUI / 营销设计规范 (YXUI #s0-#s26).
  Use when building or reviewing marketing-demo, 营销系统, 售电公司, YXUI tokens, list-query
  pages, MdFilterForm/MdModal, spacing 24/16px, or when user cites 营销设计规范.md or
  http://172.26.4.144:2280/tuyandesign/yxui.
---

# 营销设计规范（YXUI）Skill

## 权威来源（按优先级）

1. **项目真值文档**：`核心文档/框架核心文档/营销设计规范.md`（v1.1+）
2. **在线标注**：`http://172.26.4.144:2280/tuyandesign/yxui/`（Sketch MeaXure，`#s0`～`#s26`）
3. **子应用实现参考**：`AIEP-WEB/src/apps/marketing-demo/`（`Md*` 组件 + `marketing-demo.css`）

**冲突处理**：以在线 `#s14` 查询页、`#s3` 间距标注为准更新文档后再改代码。完整 Token 与验收项见 [reference.md](reference.md)。

## 何时启用

- 新建/修改 **marketing-demo** 或任意 **营销域** 子应用 UI
- 用户要求「按营销设计规范 / YXUI」审查、对齐、还原
- 列表页（查询 + 表格 + 分页）、弹窗、壳层布局、间距/配色问题

**不要用于**：主应用 Arco 页面（用 `系统设计规范.md`）、移动端 Ant 风格（用 `系统设计规范-ant.md`）。

## 快速决策

| 场景 | 规范 |
|------|------|
| 营销域子应用 | 本文档 + `--yx-*` Token |
| 主应用 / sample-app | Arco `#165DFF`，禁止混用主色 |
| 列表查询页 | `MdQueryLayout` / `MdCrudLayout` + `MdFilterForm` |
| 查询↔列表卡片间距 | **16px**（`--yx-spacing-section`） |
| 页面/侧栏↔内容间距 | **24px**（`--yx-spacing-page`，`md-body gap`） |
| 弹窗 | `MdModal`，蒙版 50%，标题栏 48px，**内容区居中**（非全屏 Teleport） |

## 壳层（#s2 布局）

| 区域 | 尺寸 |
|------|------|
| 顶栏 | 64px，`#124F9A` |
| 文档页签栏 | **36px**（壳层多页签） |
| 侧栏展开/收缩 | **235px / 54px**，收放需可用 + Tooltip |
| 侧栏/内容顶对齐 | 距页签栏 **24px**（面板整体下移，非菜单内 padding） |
| 侧栏↔内容 | **gap 24px**（禁止与 `md-main padding-left` 叠加成 48px） |

侧栏：inactive `#A3AFBC`，active `#3A96FE`，选中背景 `#ecf5ff`，分割线 `#3A96FE` 40%。

## 间距（#s3）

- 栅格基本单位 **8**；常用 **4 的倍数**
- 页面外缘 / 相邻模块：**24px**
- 列表「查询卡片 ↔ 列表卡片」：**16px**
- 卡片内边距：上 **20px**，左右下 **24px**

## 查询区（#s14 / §8.1）— 强制

**禁止**各页自写查询布局；使用 `MdFilterForm`。

| 项 | 值 |
|----|-----|
| 栅格 | 每行 **3 列** `repeat(3, minmax(0, 1fr))` |
| 表单项 | 标签左、控件右；标签 14px `#212121` |
| 重置/查询 | 计入同一 Grid，按 N 条件换行（见规范 §8.1 表） |
| 次按钮 | 边框 `#C6E2FF`，文字 `#3A96FE` |
| 主按钮 | 背景 `#3A96FE`，高与输入框对齐 |

**在线 #s14 数值（待代码对齐）**：查询区控件高 **28px**，横向间距 **20px**，纵向 **16px**，两按钮间距 **10px**。通用表单/弹窗可用 **32px**（#s13）。

## 色彩与字体（#s4/#s5）

- 主色 `#3A96FE`；hover `#1990FF`；active `#0252A8`
- 正文 **14px**；区块标题 **16px**；辅助 **12px**
- 输入框边框 `#C6E2FF`；聚焦 `#3A96FE`
- 列表表头 `#EDF5FF`（列表页）；表体 `#606266`

## 组件映射（marketing-demo）

| 规范 | 组件/文件 |
|------|-----------|
| 查询区 | `MdFilterForm.vue` |
| 列表页 | `MdQueryLayout.vue` / `MdCrudLayout.vue` |
| 区块标题 | `MdSectionTitle.vue`（4×16px 蓝条） |
| 分页 | `MdPagination.vue`（22×22，10/20/50） |
| 弹窗 | `MdModal.vue` / `MdDetailModal.vue` |
| 详情列表 #s26 | `MdDescriptions.vue` / `MdDetailView.vue` |
| 消息 #s24 | `MdMessage.vue` |
| 样式作用域 | `.marketing-demo-scope`、`.marketing-demo-portal` |
| CSS 变量 | `styles/marketing-demo.css` |

## 实现工作流

1. **读规范**：打开 `营销设计规范.md` 对应章节 + 本 skill 的 [reference.md](reference.md)
2. **复用组件**：列表页必须 `md-list-page` → 查询 `md-panel` + 列表 `md-panel--table`
3. **Token 优先**：改 CSS 变量，避免硬编码 `#3A96FE`
4. **四态**：loading / empty / error / success（§十）
5. **审查**：用 [audit-checklist.md](audit-checklist.md) 输出不符合项

## 审查工作流

用户要求「审查是否符合 YXUI / 营销设计规范」时：

1. 对照 `audit-checklist.md` 逐项检查代码与页面
2. 区分：**文档缺失** / **文档与在线冲突** / **实现未落地**
3. 输出表格：项 | 规范值 | 当前值 | 文件 | 优先级
4. 内网可访问时，以 `http://172.26.4.144:2280/tuyandesign/yxui/#sN` 抽检对应屏

## 已知实现缺口（审查时重点）

- 部分非列表页未走标准双卡片结构（Dashboard、Governance、Upload 等）
- 按钮五态（loading/disable 部分页面未覆盖）
- MdUpload 附件区（#s15）未独立组件化
- 内容一级 Tab 40px 样式已提供 `.md-content-tabs`，各页按需接入

## 规范文档维护

在线标注更新后：

1. 更新 `核心文档/框架核心文档/营销设计规范.md` §十四版本记录
2. 同步本 skill 的 `reference.md` 关键 Token 表
3. 再改 `marketing-demo` 实现

## 附加资源

- [reference.md](reference.md) — CSS 变量、#s 索引、数值冲突定稿表
- [audit-checklist.md](audit-checklist.md) — 验收清单（可勾选）
