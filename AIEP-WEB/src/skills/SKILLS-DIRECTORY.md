# Skills 总目录（统一检索）

本目录用于快速查找当前仓库可用 skills。

- `主线`：全流程默认强制使用
- `可选`：按场景触发
- `实验`：需负责人批准

**Skill 路径约定**：

| 范围 | 路径 |
|------|------|
| 总编排 `ai-full-process-design` | 项目 `.cursor/skills/` **与** 全局 `~/.cursor/skills/`（内容同步） |
| 六步阶段 Skill | `AIEP-WEB/src/skills/` |
| 域/移动 Skill | 项目 `.cursor/skills/` |

## 一、流程编排类

| Skill | 标签 | 路径 | 用途 |
|-------|------|------|------|
| **`ai-full-process-design`** | **总入口** | `.cursor/skills/ai-full-process-design/SKILL.md`（项目 + 全局 `~/.cursor/skills/` 同步） | 六步编排、platform_type、Gate、落盘 |
| `ai-dev-stage-gate` | 主线 | `AIEP-WEB/src/skills/ai-dev-stage-gate/SKILL.md` | 门禁 pass/fail/blocked |

## 二、AI 驱动开发核心阶段（标准六步）

| Skill | 步骤 | 路径 |
|-------|------|------|
| `requirements-clarification` | 1～2 | `AIEP-WEB/src/skills/requirements-clarification/SKILL.md` |
| SDD（07/11 模板，非独立 Skill） | 2 | `核心文档/AI+产品落地/02-子应用通用模板/` |
| `prd-design-generation` | **3～4**（03-PRD） | `AIEP-WEB/src/skills/prd-design-generation/SKILL.md` |
| `ui-generation` | **3～4**（step3/step4 模式） | `AIEP-WEB/src/skills/ui-generation/SKILL.md` |
| `code-development` | 5 | `AIEP-WEB/src/skills/code-development/SKILL.md` |
| `test-validation` | 5～6 | `AIEP-WEB/src/skills/test-validation/SKILL.md` |

## 三、移动端与域规范（`.cursor/skills/`）

| Skill | platform_type | 路径 |
|-------|---------------|------|
| `marketing-design-yxui` | web-marketing | `.cursor/skills/marketing-design-yxui/SKILL.md` |
| `ui-ux-pro-max` | web-mobile-h5（推荐） | `.cursor/skills/ui-ux-pro-max/SKILL.md` |
| `mobile-android-design` | native-android | `.cursor/skills/mobile-android-design/SKILL.md` |
| `mobile-ios-design` | native-ios | `.cursor/skills/mobile-ios-design/SKILL.md` |
| `prd-page-annotation` | 可选 | **`.cursor/skills/prd-page-annotation/SKILL.md`** |

## 四、专项技能（Web / Stitch）

| Skill | 路径 | 阶段 |
|-------|------|------|
| `stitch-design` | `AIEP-WEB/src/skills/stitch-design/SKILL.md` | 3 |
| `design-md` | `AIEP-WEB/src/skills/design-md/SKILL.md` | 3 |
| `enhance-prompt` | `AIEP-WEB/src/skills/enhance-prompt/SKILL.md` | 3 |

## 五、推荐调用顺序

1. **`ai-full-process-design`**（推断步骤、platform_type、加载形态 Skill）
2. **`ai-dev-stage-gate`**（步首/步末）
3. 当前步阶段 Skill（见上表）
4. 步末跑 [gates.md](../../.cursor/skills/ai-full-process-design/gates.md) 脚本

## 六、关键落盘文件（门禁）

| 文件 | 步骤 |
|------|------|
| `19-G2-A界面确认记录.md` | 4 |
| `20-G2-B技术补齐评审记录.md` | 2 |
| `gate-config.json` | 4-AI治理与审计 |

设计文档：`核心文档/AI+产品落地/01-AI全流程设计/AI+全流程设计-Skill设计文档.md`
