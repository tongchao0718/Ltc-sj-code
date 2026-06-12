---
name: ui-docs-reverse-sync
description: >-
  界面改后文档回写：以实际 UI 代码为真值，批量同步 04、03-PRD、映射表等；默认先预览差异、人工确认后再落盘。
  Use for 界面改后同步文档、回改文档、UI回写文档、文档回写、/ui-docs-reverse-sync、确认回写、预览文档差异、docs reverse sync。
compatibility: AIEP-DEV；Node>=18；仓库根 npm 脚本
metadata:
  aiep-step: "3-6"
  aiep-gate: none
---

# 界面改后文档回写（ui-docs-reverse-sync）

> **规范**：`核心文档/框架核心文档/文档联动更新规范.md` · 双真值分工见 `prd-design-generation`  
> **落盘**：`04-AI治理与审计/界面文档同步报告.md`  
> **定位**：**UI 代码 → 文档** 批量回写；**不替代**正向 `ui-generation` / `prd-design-generation`，**不替代** `prd-page-annotation` 的角标细则  
> **触发方式**：**仅人工触发**（见 §人工触发）；Agent **不得**在改 UI 后自动落盘文档

## 人工触发（默认入口）

本 Skill **不自动执行**。须用户明确发起；Agent 读到触发语后立即 Read 本 Skill。

### 怎么说（无需记 Skill 名）

| 意图 | 说法示例 |
|------|----------|
| 改完某页，同步文档 | 「**回写文档** {app-code} **客户列表页**」 |
| 全量子应用 | 「**全量回写文档** {app-code}」 |
| 走查后 | 「**走查改完界面**，回改 PRD 和 04，{app-code}」 |
| 步骤 5 联调后 | 「**联调改完界面**，同步操作说明书，{app-code}」 |
| 仅看差异（不落盘） | 「**预览文档差异** {app-code}」 / 「**先看差异再回写**」 |
| 预览后落盘 | 「**确认回写**」 / 「**执行落盘**」 / 「**apply**」 |
| 显式 Skill 名（可选） | `/ui-docs-reverse-sync` 或 `@ui-docs-reverse-sync` |

**参数可写在同一句**：`app-code`、模式（scoped/full/post-walkthrough/post-dev）、页面/路由。缺省时 Agent 从 git diff 或当前打开文件推断。

### 两阶段门禁（强制）

| 阶段 | 用户触发 | Agent 动作 | 是否改文档 |
|------|----------|------------|------------|
| **① preview** | 上表「预览」或任意回写请求（**默认**） | 扫描 UI → 输出差异表 + 拟改清单 | **否** |
| **② apply** | 用户回复「**确认回写**」等 | 按清单落盘 + `界面文档同步报告.md` | **是** |

- 用户说「**直接回写**」「**跳过预览**」→ 可单阶段 apply，但须在回复中**复述拟改清单**后再写
- 用户仅说「预览」→ **禁止** apply，等确认
- PRD **冻结版**且含 03 正文变更 → apply 前须用户二次确认「已知待变更评审」

话术详表：[references/manual-trigger.md](references/manual-trigger.md)

## 与相邻 Skill 分工

| Skill | 方向 | 本 Skill 关系 |
|-------|------|---------------|
| `ui-generation` | 需求/SDD → 界面 | 上游；本 Skill 在其后做回写 |
| `prd-design-generation` | 界面+需求 → PRD 正向 | 互补；回写只改与 UI 不一致处 |
| `prd-page-annotation` | 标注 ↔ 03-PRD | 子集；回写含标注时 **委托** 其 Workflow B |
| `design-review-pre-g2a` | 预审（只读） | 回写后可再跑预审 |
| `ui-acceptance-review` | 验收审查（只读） | 回写后可再跑 regression |

## 何时启用

> **须人工触发**（§人工触发）。下表为模式选择，非自动启动条件。

| 模式 | 触发 | 典型步骤 |
|------|------|----------|
| **full** | 「全量同步文档」「整个子应用回写」 | 3～5 |
| **scoped** | 改完某页/某路由后「同步相关文档」 | 3～5 |
| **post-walkthrough** | G2-A 走查反馈已改界面，需回写 PRD/04 | 4 |
| **post-dev** | 步骤 5 联调/样式改动后文档滞后 | 5～6 |

用户未指定模式 → 默认 **scoped**（从 git diff 或用户描述推断变更页面）。

## 真值分工（强制）

| 内容 | 回写时以谁为准 | 写入哪份文档 |
|------|----------------|--------------|
| 页面布局、组件、四态、文案、交互 | **UI 代码** | `04-界面设计文档.md` |
| 路由、菜单、页面 ID | **router + subApps** | `04` §页面清单、`映射表` |
| 模块需求摘要、用户故事覆盖 | UI + 既有 01/03 | `03-PRD`（**不**写字段级 API） |
| API 路径、字段、错误码 | **SDD**（禁止仅从 Mock 臆造） | 仅更新映射表「接口名列」+「详见 SDD §x」 |
| 功能点四段式浮窗 | UI + 03/SDD 引用 | `annotations/*.js`（有标注时） |
| 操作步骤截图说明 | UI | `应用操作说明书.md`（步骤 5+） |

**PRD 已冻结**且 UI 与冻结版不一致 → 回写须标注「**待变更评审**」，**禁止** Agent 升版为冻结或代签 G2-A。

## 必要输入

| 输入 | 路径 |
|------|------|
| 界面代码 | `AIEP-WEB/src/apps/{app-code}/`（`router/`、`views/`、`components/`、菜单配置） |
| 路由注册 | `subApps.js` 或子应用 `router/index.js` |
| 需求锚定 | `01-需求与设计/01-需求说明书.md` |
| PRD | `01-需求与设计/03-PRD设计评审文档.md` |
| 体验真值 | `01-需求与设计/04-界面设计文档.md` |
| 映射表 | `01-需求与设计/页面-路由-接口-数据表映射表.md` |
| SDD | `01-需求与设计/SDD-v*.md` + `.json` |
| 标注（可选） | `src/apps/{app}/annotations/*Annotations.js` |
| 项目记忆 | `04-AI治理与审计/00-项目记忆.md` |
| 步骤推断 | `npm run infer:process-step -- --app {app-code} --json` |

**形态 Skill**（按 `platform_type` Read）：`arco-admin-design` / `marketing-design-yxui` / `ui-ux-pro-max` 等。

## 必交付物

| 产物 | 路径 |
|------|------|
| 界面文档同步报告 | `04-AI治理与审计/界面文档同步报告.md` |
| 已更新的关联文档 | 见 [references/doc-matrix.md](references/doc-matrix.md) |
| 变更摘要（步末输出） | Agent 回复 + 报告 §摘要 |

模板见 [references/report-template.md](references/report-template.md)；速查见 [references/checklist.md](references/checklist.md)。

## 执行步骤

### 阶段 ① preview（默认先做）

1. `npm run infer:process-step -- --app {app-code} --json` — 确认步骤与 PRD 是否已冻结。
2. 确定模式：`full` | `scoped` | `post-walkthrough` | `post-dev`。
3. **扫描 UI 真值**（scoped 仅扫变更路由及其引用链）：
   - 路由表 → 页面 ID、path、组件文件
   - 各 `.vue`：布局区块、表单字段、表格列、按钮、四态分支、权限/空态文案
   - 菜单/侧栏配置 → 层级与命名（**不带编号**，≤五级）
   - Mock / API 调用点 → 仅记录接口名，字段以 SDD 为准
4. **对照现有文档**，按 [doc-matrix.md](references/doc-matrix.md) 生成「UI vs 文档」差异表。
5. **输出 preview 摘要**（聊天 + 可选写入报告草稿 §3，**不**改正文文档）：
   - 拟改文件列表、每文件变更要点、P0/P1 分级
   - PRD 冻结时的「待变更评审」项
   - SDD 冲突项（若有）
6. **等待用户**回复「确认回写」/「执行落盘」/「apply」→ 进入阶段 ②；用户说「取消」→ 结束。

### 阶段 ② apply（人工确认后）

7. **按序回写**（单次提交尽量原子）：
   1. `04-界面设计文档.md` — 页面清单、分区说明、交互、四态
   2. `页面-路由-接口-数据表映射表.md` — 路由/页面/接口名列
   3. `01-需求说明书.md` — 仅当新增/删除页面或 SA 级功能点时
   4. `03-PRD设计评审文档.md` — 模块「（1）功能需求」「（3）界面设计」摘要；API 仍引用 SDD
   5. `annotations/*.js` — 有 `PrdAnnotation` 时，按 `prd-page-annotation` Workflow B
   6. `00-项目记忆.md` — 回写导致的已确认 UI 决策
   7. `03-发布与复盘/应用操作说明书.md` — post-dev / 步骤 6 前
8. **禁止擅自修改** `SDD-v*.md/json`；契约冲突 → 报告 §SDD 待办。
9. 填写/定稿 `界面文档同步报告.md`，输出 pass / fail / blocked。
10. 建议后续：步骤 3→4 前 → `design-review-pre-g2a`；步骤 5 后 → `ui-acceptance-review`（regression）。

## 结论规则

| 结论 | 条件 |
|------|------|
| **pass** | 差异表内 P0 项已全部回写或已标注「待 PO 确认」且 PO 可接受 |
| **fail** | P0 页面在文档中仍缺失；映射表路由与代码不一致未修复 |
| **blocked** | 无 UI 代码；无 01/04 任一文档且用户未授权新建；PRD 冻结但变更未获 PO 书面确认且用户要求直接改 PRD |

## Agent 规则

- **禁止**在未收到人工「确认回写」类指令时修改 01/03/04/映射表等正文（preview 阶段只读）
- **禁止**将 `03-PRD` 标为「冻结版」或修改 `19-G2-A` 签字
- **禁止**从 Mock 字段反向发明 SDD 契约
- **禁止**跳过同步报告直接改文档（须留痕 §变更清单）
- scoped 模式 **禁止**无关文档大段重写
- 回写 `03-PRD` 时保持模板章节结构，只改与 UI 相关的段落
- 与 `prd-page-annotation` 重叠时：角标/四段式 **委托** 该 Skill，避免双轨不一致

## 输出模板

```markdown
## 界面文档回写摘要
- **app-code**：{app-code}
- **阶段**：preview | apply
- **模式**：full | scoped | post-walkthrough | post-dev
- **platform_type**：{…}
- **推断步骤**：{0～6}
- **PRD 状态**：草案 | 冻结版（冻结则变更项已标「待变更评审」）
- **扫描范围**：{路由/文件列表}
- **报告**：04-AI治理与审计/界面文档同步报告.md
- **已更新文档**：{列表}
- **SDD 待办**：{n} 项（须单独走 SDD 流程）
- **总评**：pass | fail | blocked | preview-only（待确认）
- **待确认**：回复「确认回写」后执行 apply（preview 阶段必填）
- **建议下一步**：design-review-pre-g2a | ui-acceptance-review | PO 确认后 prd-design-generation step4-freeze
```

## 禁止

- 用本 Skill 代替 `prd-design-generation` 从零写 PRD
- 用本 Skill 代替 `ui-acceptance-review` 做验收签字
- 冻结 PRD 或代签 G2-A
- 无扫描证据的臆造文档内容

## 关联技能

- 子任务：`prd-page-annotation`（Workflow B）
- 回写后：`design-review-pre-g2a`（步骤 3 末）、`ui-acceptance-review`（步骤 4/5）
- 契约冲突：`sdd-generation` / `20-G2-B`

细节：[references/doc-matrix.md](references/doc-matrix.md) · [references/manual-trigger.md](references/manual-trigger.md) · 示例：[examples.md](examples.md)
