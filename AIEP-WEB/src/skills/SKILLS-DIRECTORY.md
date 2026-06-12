# Skills 总目录（统一检索）

> **框架文档索引**：`核心文档/框架核心文档/文档清单.md` §5（Agent Skills 清单）。本节为**操作级真值**（步骤映射、调用顺序、落盘文件）；新增或废止 Skill 时须与 §5 **双向登记**。

本目录用于快速查找当前仓库可用 skills。

- `主线`：全流程默认强制使用
- `可选`：按场景触发
- `实验`：需负责人批准

**Skill 路径约定**：

| 范围 | 路径 |
|------|------|
| 总编排 `ai-full-process-design` | 项目 `.cursor/skills/`；**postinstall 自动**同步至 `~/.cursor/skills/` |
| 自动加载规范 | `.cursor/rules/agent-skills-auto-exec.mdc`（`alwaysApply: true`，禁止人工 `/skill-name`） |
| 六步阶段 Skill | `AIEP-WEB/src/skills/` |
| 域/移动 Skill | 项目 `.cursor/skills/` |

## 一、流程编排类

| Skill | 标签 | 路径 | 用途 |
|-------|------|------|------|
| **`ai-full-process-design`** | **总入口** | `.cursor/skills/ai-full-process-design/SKILL.md`（项目 + 全局 `~/.cursor/skills/` 同步） | 六步编排、platform_type、Gate、落盘 |
| `ai-dev-stage-gate` | 主线 | `AIEP-WEB/src/skills/ai-dev-stage-gate/SKILL.md` | 门禁 pass/fail/blocked |

## 二、AI 驱动开发核心阶段（标准六步 + 立项）

| Skill | 步骤 | 路径 |
|-------|------|------|
| **`scaffold-sub-app`** | **0 立项** | `AIEP-WEB/src/skills/scaffold-sub-app/SKILL.md` · [checklist](scaffold-sub-app/references/post-scaffold-checklist.md) · [路径验证 Prompt](scaffold-sub-app/references/project-verify-prompt.md) |
| `requirements-clarification` | 1～2 | `AIEP-WEB/src/skills/requirements-clarification/SKILL.md` |
| **`sdd-generation`** | **2** | `AIEP-WEB/src/skills/sdd-generation/SKILL.md` · [examples](sdd-generation/examples.md)（模板 07/11/15 见 `02-子应用通用模板/`） |
| `prd-design-generation` | **3～4**（step3-draft / step4-freeze） | `AIEP-WEB/src/skills/prd-design-generation/SKILL.md` · [examples](prd-design-generation/examples.md) |
| `ui-generation` | **3～4**（step3/step4 模式） | `AIEP-WEB/src/skills/ui-generation/SKILL.md` |
| `code-development` | 5 | `AIEP-WEB/src/skills/code-development/SKILL.md` |
| **`server-api-development`** | **5**（有真实后端时） | `AIEP-WEB/src/skills/server-api-development/SKILL.md` |
| `test-validation` | 5～6 | `AIEP-WEB/src/skills/test-validation/SKILL.md` |
| **`release-deployment`** | **6** | `AIEP-WEB/src/skills/release-deployment/SKILL.md` |
| **`pack-sub-app`** | **横切**（步骤 3 U5、6、按需） | `AIEP-WEB/src/skills/pack-sub-app/SKILL.md` · [examples](pack-sub-app/examples.md) · [checklist](pack-sub-app/references/post-pack-checklist.md) |
| **`export-import-sub-app`** | **横切**（无 Git 交接、导出/导入） | `AIEP-WEB/src/skills/export-import-sub-app/SKILL.md` · [examples](export-import-sub-app/examples.md) · [checklist](export-import-sub-app/references/handoff-checklist.md) |

## 三、移动端与域规范（`.cursor/skills/`）

| Skill | platform_type | 路径 |
|-------|---------------|------|
| `marketing-design-yxui` | web-marketing | `.cursor/skills/marketing-design-yxui/SKILL.md` |
| **`arco-admin-design`** | **web-admin** | **`.cursor/skills/arco-admin-design/SKILL.md`** |
| `ui-ux-pro-max` | web-mobile-h5（推荐） | `.cursor/skills/ui-ux-pro-max/SKILL.md` |
| `mobile-android-design` | native-android | `.cursor/skills/mobile-android-design/SKILL.md` |
| `mobile-ios-design` | native-ios | `.cursor/skills/mobile-ios-design/SKILL.md` |

## 三-B、工作流 Skill（借鉴 Axhub Make，步骤 3～6）

| Skill | 步骤 | 路径 |
|-------|------|------|
| `sub-app-resources` | 3 入口 | `.cursor/skills/sub-app-resources/SKILL.md` |
| `design-review-pre-g2a` | 3→4 | `.cursor/skills/design-review-pre-g2a/SKILL.md` |
| **`ui-acceptance-review`** | **4 / 5** | **`.cursor/skills/ui-acceptance-review/SKILL.md`** · [checklist](../../.cursor/skills/ui-acceptance-review/references/checklist.md) · [模板](../../.cursor/skills/ui-acceptance-review/references/report-template.md) |
| `project-memory` | 启动 + 3/4 | `.cursor/skills/project-memory/SKILL.md` |
| **`release-readiness-review`** | **6** | **`.cursor/skills/release-readiness-review/SKILL.md`** · [checklist](../../.cursor/skills/release-readiness-review/references/checklist.md) · [模板](../../.cursor/skills/release-readiness-review/references/report-template.md) |
| **`ui-docs-reverse-sync`** | **横切**（步骤 3～6，**仅人工触发**） | **`.cursor/skills/ui-docs-reverse-sync/SKILL.md`** · [manual-trigger](../../.cursor/skills/ui-docs-reverse-sync/references/manual-trigger.md) · [doc-matrix](../../.cursor/skills/ui-docs-reverse-sync/references/doc-matrix.md) |
| **`prd-page-annotation`** | **横切** | **`.cursor/skills/prd-page-annotation/SKILL.md`** |

规范：`核心文档/AI+产品落地/01-AI全流程设计/子应用资源库规范.md`

## 四、专项技能（Web / Stitch）

| Skill | 路径 | 阶段 / 标签 |
|-------|------|-------------|
| `stitch-design` | `AIEP-WEB/src/skills/stitch-design/SKILL.md` | 3 |
| `design-md` | `AIEP-WEB/src/skills/design-md/SKILL.md` | 3 |
| `enhance-prompt` | `AIEP-WEB/src/skills/enhance-prompt/SKILL.md` | 3 |
| `stitch-loop` | `AIEP-WEB/src/skills/stitch-loop/SKILL.md` | 实验 |
| `react-components` | `AIEP-WEB/src/skills/react-components/SKILL.md` | 实验 |
| `shadcn-ui` | `AIEP-WEB/src/skills/shadcn-ui/SKILL.md` | 实验 |
| `taste-design` | `AIEP-WEB/src/skills/taste-design/SKILL.md` | 实验 |
| `remotion` | `AIEP-WEB/src/skills/remotion/SKILL.md` | 实验 |
| `ui-styling` | `.cursor/skills/ui-styling/SKILL.md` | 可选 |

## 五、推荐调用顺序

1. **`ai-full-process-design`**（推断步骤、platform_type、加载形态 Skill）
2. **`project-memory`**（启动读取 `00-项目记忆.md`）
3. **`ai-dev-stage-gate`**（步首/步末）
4. 当前步阶段 Skill + 工作流 Skill（见上表）
5. 步末跑 [gates.md](../../.cursor/skills/ai-full-process-design/gates.md) 脚本

## 六、关键落盘文件（门禁）

| 文件 | 步骤 |
|------|------|
| `19-G2-A界面确认记录.md` | 4 |
| `20-G2-B技术补齐评审记录.md` | 2 |
| `gate-config.json` | 4-AI治理与审计 |

设计文档：`核心文档/AI+产品落地/01-AI全流程设计/AI+全流程设计-Skill设计文档.md`

**编写规范**：`SKILL-STANDARD.md`（对齐 [agentskills.io](https://agentskills.io) 开放标准）
