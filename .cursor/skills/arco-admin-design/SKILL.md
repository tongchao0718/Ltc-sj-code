---
name: arco-admin-design
description: >-
  Implements and audits web-admin sub-apps per Arco Design Vue and 系统设计规范.md.
  Use for web-admin、sample-app、ai-smart-crm、管理端、Arco、#165DFF、子应用嵌入主应用。
  Do NOT use for marketing (marketing-design-yxui) or shadcn (ui-styling).
---

# Web 管理端设计（Arco / web-admin）

## 权威来源（按优先级）

1. **项目真值文档**：`核心文档/框架核心文档/系统设计规范.md`
2. **子应用实现参考**：`AIEP-WEB/src/apps/sample-app/`（Arco 页面、`arco-pages/`）
3. **接入规范**：`核心文档/框架核心文档/主应用子应用接入规范.md`
4. **主应用壳**：`AIEP-WEB/src/App.vue`、`views/`（工作台、应用中心）

**不要用于**：营销域（→ `marketing-design-yxui`）、移动 H5（→ `ui-ux-pro-max` + Ant 移动章节）、shadcn/Tailwind（→ 非 AIEP 默认栈，勿混用 `ui-styling`）。

## 何时启用

- `platform_type=web-admin` 且步骤 ≥ 3（界面生成/确认/开发）
- 新建或审查 sample-app、ai-smart-crm 类管理端子应用
- 用户要求「按系统设计规范 / Arco 管理端」

## 快速决策

| 场景 | 规范 |
|------|------|
| 主色 | Arco `#165DFF`（禁止混用营销 `#124F9A`） |
| 组件库 | `@arco-design/web-vue` |
| 布局 | 子应用独立 Hash 路由 + 可嵌入主应用 `SUB_APP_EMBED_PREFIXES` |
| 列表页 | Arco `a-table` + `a-form` 查询区；间距见系统设计规范 |
| 状态 | loading / empty / error 四态 |
| 代码落盘 | `AIEP-WEB/src/apps/{folder}/` |

## 步骤 3～5 约束

**步骤 3（ui-generation step3）**

- 页面 100% 可交互；路由在子应用 `router/` 注册
- 样式优先 Arco 变量与 `系统设计规范.md` Token，避免引入 Tailwind/shadcn
- Mock 放 `mock/` 或 `_resources/mock-data/`，契约对齐 SDD

**步骤 5（code-development）**

- 保持 Vue 3 + Composition API 与 sample-app 一致
- 新增页面同步 `subApps.js` 的 `pageCount`（如有）
- 构建：`npm run build:{folder}` 必须通过

## 审查清单（步末可选）

- [ ] 主色与主应用 Arco 主题一致
- [ ] 未引入营销 YXUI 的 `--yx-*` Token
- [ ] 嵌入模式下顶栏/侧栏不重复主应用壳层
- [ ] P0 流程四态完整
- [ ] `validate:sub-app-registry` 通过

## 与 ui-styling 的区别

| | arco-admin-design（本 Skill） | ui-styling |
|---|------------------------------|------------|
| 栈 | Vue 3 + Arco | React + shadcn + Tailwind |
| 场景 | AIEP web-admin 子应用 | 外部 React 项目 |
| 路由 | workflow web-admin **必加载** | **不**作为 web-admin 默认 |
