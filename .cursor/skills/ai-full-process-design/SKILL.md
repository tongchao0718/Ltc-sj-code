---
name: ai-full-process-design
description: >-
  AIEP-DEV 子应用 AI+ 全流程总编排（需求生成→发布上线）：步骤推断、六步路由、Gate-1~4、
  G2-A/G2-B、platform_type、全量界面后再客户确认。Use for AI+全流程、六步、子应用立项、
  Gate、SDD、PRD冻结、界面确认、platform_type、web-marketing、web-mobile-h5、
  native-android、native-ios、Fast Track、infer:process-step、推进 {app-code}。
---

# AI+ 全流程设计（总编排）

> **安装**：项目 `.cursor/skills/ai-full-process-design/` + 全局 `~/.cursor/skills/ai-full-process-design/`（内容同步）  
> **权威细则**：`核心文档/AI+产品落地/01-AI全流程设计/AI+全流程设计-Skill设计文档.md`（V0.4+）  
> **执行**：[workflow.md](workflow.md) · **Gate**：[gates.md](gates.md) · **落盘**：[paths.md](paths.md) · **示例**：[examples.md](examples.md)

## 适用范围

- 目标仓库：**AIEP-DEV**（含 `AIEP-WEB`、`AIEP-SERVER`、根目录 npm 脚本）
- 非本仓库：提示切换工作区或先 `npm run scaffold:sub-app`

## 启动（每次必做 — 不可跳过）

```bash
npm run infer:process-step -- --app {app-code} --json
```

1. 读推断 JSON + `AIEP-WEB/src/docs/子应用文档/{app-code}/`
2. 读 `01-需求说明书.md` → **platform_type**、**flow_type**；缺失 → **`blocked`**
3. 输出 **阶段门禁状态块**（见 [reference.md §状态块](reference.md)）
4. Read 并执行本步 **阶段 Skill** + **形态 Skill**（见下表）
5. 步末跑关联脚本，记录 exit code
6. 步骤 4：无 PO/客户 G2-A「通过」→ **`blocked`**；禁止 Agent 自行冻结 PRD

## 六步与子 Skill

| 步 | 名称 | 阶段 Skill（Read SKILL.md） | 形态 Skill |
|----|------|----------------------------|------------|
| 1 | 需求生成 | `AIEP-WEB/src/skills/requirements-clarification/` | 按 platform_type |
| 2 | 需求确认 | 同上 + SDD 模板 07/11 | 写 `20-G2-B` |
| 3 | 界面生成 | `ui-generation`（step3）+ `prd-design-generation` | 见 workflow §3 |
| 4 | 界面确认 | `ui-generation`（step4） | 维护 `19-G2-A` |
| 5 | 开发测试 | `code-development` + `test-validation` | 形态审查 |
| 6 | 发布上线 | `ai-dev-stage-gate` | CI + 发布记录 |

**步骤 2 禁止**：用 `prd-design-generation` 代替 SDD 模板。

每步交付物与命令 → [workflow.md](workflow.md)

## 步骤推断（脚本真值）

| 条件 | 步骤 |
|------|------|
| 无 01-需求说明书 | 1 |
| 无 17 PO+TL 双签 | 2 |
| 全量界面或 PRD/04 未齐 | 3 |
| 无 19-G2-A 人工通过 或 PRD 未冻结 | 4 |
| 无测试验收文档 | 5 |
| 无发布记录 | 6 |

**硬规则**：有 PRD 草案但 U1～U6 未全过 → 仍在 **步骤 3**。

## 步骤 3 ↔ 4（硬约束）

- **步骤 3**：100% 页面可交互 + PRD/04 草案；U1～U6 全 ✅ 才可进步骤 4
- **步骤 4**：客户/PO 走查；核心产物 **`19-G2-A界面确认记录.md`**
- 含主流程弹窗/抽屉；纯 Tooltip 不计入页面清单

## 关键脚本（仓库根目录）

| 命令 | 用途 |
|------|------|
| `npm run infer:process-step -- --app {app}` | 推断当前步骤 |
| `npm run validate:sdd -- --app {app} --gate G2` | Gate-2 |
| `npm run validate:sdd -- --app {app} --gate G3` | Gate-3（19-G2-A、PRD 冻结、映射表） |
| `npm run validate:sub-app-registry -- --app {app}` | Web 注册 |
| `npm run build:{app}` | 构建 |
| `npm run coverage:acceptance -- --app {app}` | 验收覆盖 |

## 与 ai-dev-stage-gate 分工

| 能力 | ai-full-process-design | ai-dev-stage-gate |
|------|------------------------|-------------------|
| 推断步骤、路由 Skill、跑脚本 | ✅ 主责 | ❌ |
| pass/fail/blocked 判定 | 调用并展示 | ✅ 主责 |

**默认入口**：本 Skill；每步首尾调用 `ai-dev-stage-gate`。

## 失败处理

- `fail`：本步可修订后重跑脚本
- `blocked`：缺人工签批 / platform_type / 前置 Gate
- 契约变更：**先 SDD/PRD**，后代码
