---
name: release-readiness-review
description: >-
  发布就绪审计：步骤6发布前独立审查门禁链、测试链、产物链、文档链与回滚链；
  可选发布后冒烟（post-verify）。产出发布审核报告。不代签发布放行。
  Use for 发布审核、发布就绪、上线前检查、release review、Gate-4审计、发布审计、发布后冒烟、post-verify。
compatibility: AIEP-DEV；Node>=18；仓库根 npm 脚本
metadata:
  aiep-step: "6"
  aiep-gate: Gate-4
---

# 发布就绪审计（release-readiness-review）

> **规范**：`子应用打包指南.md` · `release-deployment` Skill  
> **落盘**：`03-发布与复盘/发布审核报告.md`  
> **定位**：发布前 **独立审计**（查、列问题、出报告）；**执行构建与填发布记录** 仍走 `release-deployment`

## 与相邻 Skill 分工

| Skill | 角色 |
|-------|------|
| `test-validation` | 步骤 5 功能测试与 go/no-go |
| `ui-acceptance-review`（regression） | 界面相对冻结 PRD 回归 |
| **本 Skill** | 步骤 6 **审计** Gate-4 就绪度 |
| `release-deployment` | 步骤 6 **执行** 构建、发布记录、回滚落盘 |
| `pack-sub-app` | 构建 + P1～P10 产物校验 |

## 何时启用

| 模式 | 触发 |
|------|------|
| **pre-release** | 步骤 6 初、执行 `release-deployment` **之前** |
| **post-verify** | 构建完成、发布记录填写前；对 `dist/{folder}/` 最小冒烟 |

用户说「发布审核 / 上线前检查 / 发布就绪」→ **pre-release**；说「发布后验证 / dist 冒烟」→ **post-verify**。

## 必要输入

| 输入 | 路径 |
|------|------|
| 测试验收 | `02-研发与测试/`（`验收脚本-GWT.md`、测试结论） |
| G2/G3 门禁 | `G2-G3关卡自动门禁检查.md` |
| PRD（冻结） | `03-PRD设计评审文档.md` |
| G2-A | `01-需求与设计/19-G2-A界面确认记录.md` |
| 界面回归（推荐） | `04-AI治理与审计/界面验收审核报告.md`（regression pass） |
| 发布记录草案 | `03-发布与复盘/发布记录单.md`（可空，审计后填写） |
| 操作说明书 | `03-发布与复盘/应用操作说明书.md` |
| 子应用代码 | `AIEP-WEB/src/apps/{app-code}/` |
| 构建产物（post-verify） | `AIEP-WEB/dist/{folder}/` |

## 必交付物

| 产物 | 路径 |
|------|------|
| 发布审核报告 | `03-发布与复盘/发布审核报告.md` |

模板见 [references/report-template.md](references/report-template.md)；速查见 [references/checklist.md](references/checklist.md)。

## 审计维度

### 轴 1 — 门禁链

| ID | 检查项 | 命令 / 动作 | 严重级 |
|----|--------|-------------|--------|
| G1 | Gate-2 复检 | `npm run validate:sdd -- --app {app} --gate G2` | blocking |
| G2 | Gate-3 复检 | `npm run validate:sdd -- --app {app} --gate G3` | blocking |
| G3 | 子应用注册表 | `npm run validate:sub-app-registry -- --app {app}` | blocking |
| G4 | G2-A 人工通过 | 读 `19-G2-A界面确认记录.md` | blocking |
| G5 | PRD 已冻结 | 读 `03-PRD` 版本与映射表 | blocking |

### 轴 2 — 测试链

| ID | 检查项 | 严重级 |
|----|--------|--------|
| T1 | `test-validation` 结论为 go 或 conditional go（条件已满足） | blocking |
| T2 | 无未关闭 P0 阻塞缺陷 | blocking |
| T3 | `npm test` exit 0（若项目启用） | warning |
| T4 | CI / `sdd-gate.yml` 结果（若有） | warning |

### 轴 3 — 产物链（pre-release 可仅查上次 build；post-verify 必查 dist）

| ID | 检查项 | 命令 / 动作 | 严重级 |
|----|--------|-------------|--------|
| P1 | 子应用打包 | `npm run pack:sub-app -- --app {app}` | blocking |
| P2 | all_pass + P1～P10 | pack 输出 | blocking |
| P3 | `dist/{folder}/index.html` 存在 | 文件检查 | blocking |
| P4 | 静态离线可打开（相对路径） | 打开或 head 检查 | blocking |
| P5 | 主应用构建（若嵌入） | `npm run build` | warning |

### 轴 4 — 文档与追溯链

| ID | 检查项 | 严重级 |
|----|--------|--------|
| D1 | 发布范围与冻结 PRD P0 一致 | blocking |
| D2 | 操作说明书与本次功能一致 | warning |
| D3 | 回滚方案可执行（tag/commit/上一版 dist） | blocking |
| D4 | 版本变更记录（若适用） | warning |

### 轴 5 — 发布后冒烟（post-verify 模式）

| ID | 检查项 | 严重级 |
|----|--------|--------|
| S1 | 首页/入口可加载，无白屏 | blocking |
| S2 | P0 主流程 3 步可走通（静态包） | blocking |
| S3 | 控制台无阻塞级 JS 错误 | blocking |
| S4 | 关键资源 404 检查 | warning |

## 执行步骤

1. `npm run infer:process-step -- --app {app-code} --json`。
2. 确认 `ui-acceptance-review` regression 为 pass（缺则先跑或标 warning）。
3. 确定模式：`pre-release` | `post-verify`。
4. **pre-release**：按轴 1～2、轴 4 执行脚本并读文档；轴 3 可查最近一次 pack 结果或当场执行 pack。
5. **post-verify**：在 `release-deployment` 构建完成后，对 `dist/{folder}/` 执行轴 5 + 轴 3 复检。
6. 填写 `发布审核报告.md`。
7. 输出 pass / fail / blocked；**pass** 后方可建议执行 `release-deployment` 填发布记录。

## 结论规则

| 结论 | 条件 |
|------|------|
| **pass** | 无 blocking；conditional go 条件已满足 |
| **fail** | 任一 blocking 未通过 |
| **blocked** | 缺测试结论 / PRD 未冻结 / G2-A 未通过 |

## Agent 规则

- **禁止**代签发布记录单「放行人」或写「发布已通过」
- **禁止**跳过 `validate:sdd` G2/G3 复检
- pre-release **fail** → 回步骤 5 或修复后重审，**不**执行 release-deployment
- post-verify **fail** → 不得标 Gate-4 pass

## 输出模板

```markdown
## 发布就绪审计摘要
- **app-code**：{app-code}
- **模式**：pre-release | post-verify
- **报告**：03-发布与复盘/发布审核报告.md
- **门禁链**：{n}/{n} pass
- **测试链**：{结论}
- **产物链**：pack all_pass {true|false}；dist 可访问 {true|false}
- **总评**：pass | fail | blocked
- **建议**：可执行 release-deployment / 须修复后重审
```

## 禁止

- 将本报告等同于发布放行签字
- 在无构建与测试证据时标 pass
- 用本 Skill 代替 `release-deployment` 执行发布动作
