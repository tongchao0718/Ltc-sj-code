---
name: ui-acceptance-review
description: >-
  界面验收审核：辅助 PO/客户走查（pre-walkthrough / walkthrough-record）与步骤5界面回归（regression）。
  对照冻结 PRD、04、映射表与 G2-A预审报告；产出界面验收审核报告。不代签 19-G2-A。
  Use for 界面审核、界面验收、G2-A走查、走查辅助、界面回归、UI acceptance review、验收走查、步骤4确认、步骤5回归。
compatibility: AIEP-DEV；Node>=18；仓库根 npm 脚本
metadata:
  aiep-step: "4-5"
  aiep-gate: G2-A
---

# 界面验收审核（ui-acceptance-review）

> **规范**：`AI+全流程设计-Skill设计文档.md` · G2-A 人工签字真值 `19-G2-A界面确认记录.md`  
> **落盘**：`04-AI治理与审计/界面验收审核报告.md`  
> **定位**：辅助审查界面成果，**不替代** `design-review-pre-g2a`（步骤 3 AI 预审）与 **不代签** G2-A

## 与相邻 Skill 分工

| Skill | 阶段 | 角色 |
|-------|------|------|
| `design-review-pre-g2a` | 步骤 3→4 | AI 预审 → `G2-A预审报告.md` |
| **本 Skill** | 步骤 4 / 5 | 人审辅助、走查记录、开发后回归 |
| `ui-generation` step4 | 步骤 4 | G2-A 落盘与 PRD 冻结流程 |

## 何时启用

| 模式 | 触发 | 前置 |
|------|------|------|
| **pre-walkthrough** | 预审 pass 后、客户走查前 | `G2-A预审报告.md` 为 pass；建议开启 `VITE_PRD_ANNOTATION` 按功能点走查 |
| **walkthrough-record** | 走查进行中/结束后 | 步骤 4；有走查反馈或需整理议题 |
| **regression** | 步骤 5 开发后、发布前 | PRD 已冻结 + `19-G2-A` 人工通过 |

用户说「界面审核 / 验收走查 / G2-A 辅助」→ 默认 **walkthrough-record**；说「界面回归 / 开发后界面检查」→ **regression**。

## 必要输入

| 输入 | 路径 |
|------|------|
| 界面代码 | `AIEP-WEB/src/apps/{app-code}/` |
| 预审报告（pre / walkthrough） | `04-AI治理与审计/G2-A预审报告.md` |
| G2-A 记录 | `01-需求与设计/19-G2-A界面确认记录.md` |
| PRD | `03-PRD设计评审文档.md`（regression 须已冻结） |
| 体验文档 | `04-界面设计文档.md` |
| 映射表 | `01-需求与设计/` 内 PRD-SDD 映射（或项目约定路径） |
| 需求锚定 | `01-需求说明书.md`（页面清单、SA-xx） |
| 项目记忆 | `04-AI治理与审计/00-项目记忆.md` |
| 构建（regression 推荐） | `npm run pack:sub-app -- --app {app-code}` |

**形态 Skill**（按 `platform_type` 自动 Read）：`arco-admin-design` / `marketing-design-yxui` / `ui-ux-pro-max` 等。

## 必交付物

| 产物 | 路径 |
|------|------|
| 界面验收审核报告 | `04-AI治理与审计/界面验收审核报告.md` |
| 走查议题（pre 模式） | 写入报告 §走查议题 或单独 `G2-A走查议题清单.md` |
| 回归差异表（regression） | 写入报告 §回归差异 或 `界面回归差异表.md` |

模板见 [references/report-template.md](references/report-template.md)；速查见 [references/checklist.md](references/checklist.md)。

## 评审维度

### 轴 A — 走查与业务验收（pre-walkthrough / walkthrough-record）

| ID | 检查项 | 严重级 |
|----|--------|--------|
| W1 | 演示脚本覆盖 P0 主流程端到端 | blocking |
| W2 | 预审 blocking 已清零或已列入走查确认项 | blocking |
| W3 | 客户/PO 反馈已结构化（页面、模块、期望、优先级） | warning |
| W4 | 反馈项与 PRD 草案章节可对应 | warning |
| W5 | 待改项有明确修复责任与验收标准 | warning |

### 轴 B — 冻结后一致性（regression）

| ID | 检查项 | 严重级 |
|----|--------|--------|
| G1 | 页面清单与冻结 PRD 一致，无未登记新页 | blocking |
| G2 | P0 路由与映射表一致 | blocking |
| G3 | 关键字段/交互与冻结 PRD、04 一致 | blocking |
| G4 | G2-A 待改项已全部关闭或已书面延期 | blocking |
| G5 | 四态、空错、权限切换无退化 | blocking |
| G6 | `pack:sub-app` all_pass（P1～P8） | blocking |

### 轴 C — 域规范抽查（各模式可选 3 个 P0 页）

按 `platform_type` 对照形态 Skill：主色、间距、壳层、375 视口等。

## 执行步骤

1. `npm run infer:process-step -- --app {app-code} --json` 确认步骤与模式匹配。
2. Read `G2-A预审报告.md`（pre/walkthrough）或冻结 PRD + `19-G2-A`（regression）。
3. 确定模式：`pre-walkthrough` | `walkthrough-record` | `regression`。
4. **pre-walkthrough**：从预审 Warning 生成走查议题 + 演示顺序；不跑新 build（预审已跑）。
5. **walkthrough-record**：整理用户反馈 → 待改表 → 是否建议进入签字（仍须人工）。
6. **regression**：`npm run pack:sub-app -- --app {app-code}`；对照映射表与 G2-A 待改项逐项核对。
7. 按 [references/checklist.md](references/checklist.md) 勾选并记录证据（路由、文件、截图说明）。
8. 写入 `界面验收审核报告.md`，输出 pass / fail / blocked。

## 结论规则

| 结论 | 条件 |
|------|------|
| **pass** | 无 blocking；walkthrough 待改项已清零或已列入 G2-A 签字前修复清单且 PO 接受 |
| **fail** | 存在 blocking 或回归项未关闭 |
| **blocked** | 缺预审报告 / PRD 未冻结（regression）/ 无 G2-A 人工通过（regression）/ 无法 build |

**fail 或 blocked（regression）** → 不得建议进入步骤 6 发布。

## Agent 规则

- **禁止**填写 `19-G2-A`「通过」或 PRD「冻结」
- **禁止**在无 `G2-A预审报告.md` pass 时建议客户签字（pre 模式）
- regression 模式 **必须**有冻结 PRD 与 G2-A 人工通过证据
- 不重复执行 `design-review-pre-g2a` 全文预审；引用其结论，只补验收/回归轴

## 输出模板

```markdown
## 界面验收审核摘要
- **app-code**：{app-code}
- **模式**：pre-walkthrough | walkthrough-record | regression
- **platform_type**：{…}
- **报告**：04-AI治理与审计/界面验收审核报告.md
- **构建**：（regression）pack:sub-app all_pass {true|false}
- **总评**：pass | fail | blocked
- **blocking 数**：{n}
- **是否建议人工 G2-A 签字**：是/否（仅 walkthrough，签字仍须人工）
- **是否建议进入发布**：是/否（仅 regression pass 时可「是」）
```

## 禁止

- 将本报告等同于 `19-G2-A` 签字
- 用本 Skill 代替 `design-review-pre-g2a` 做步骤 3 收尾预审
- blocking 未清零时建议 PRD 冻结或发布
