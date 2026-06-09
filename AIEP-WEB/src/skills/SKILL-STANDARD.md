# AIEP Skill 编写规范（对齐 Agent Skills 开放标准）

> 权威外部标准：[agentskills.io](https://agentskills.io) · [Open Agent Skills Specification](https://openagentskills.dev/docs/specification)  
> 本仓库索引：`SKILLS-DIRECTORY.md` · 自动加载：`.cursor/rules/agent-skills-auto-exec.mdc`

## 1. 目录结构（渐进式披露）

每个 Skill 是一个目录，**至少**含 `SKILL.md`：

```text
{skill-name}/
├── SKILL.md              # 必填：frontmatter + 执行指令（建议 <500 行）
├── examples.md           # 可选：样例与误触发
├── references/           # 可选：长文档、检查单、API 契约（仅激活时 Read）
└── scripts/              # 可选：可执行脚本（Agent 按 SKILL 说明调用）
```

**原则**（来自 agentskills.io / Cursor / Microsoft Agent Framework）：

1. **Discovery**：Agent 启动只读 `name` + `description`
2. **Activation**：任务匹配时再 Read 全文 `SKILL.md`
3. **Execution**：必要时 Read `references/` 或运行 `scripts/`

## 2. SKILL.md frontmatter（必填）

```yaml
---
name: kebab-case-name          # 必须与目录名一致，≤64 字符
description: >-                # ≤1024 字符；写清「做什么 + 何时触发 + 关键词」
  步骤N… Use for 关键词1、关键词2。
compatibility: AIEP-DEV；Node>=18；仓库根 npm 脚本
metadata:
  aiep-step: "2"               # 0=立项 1~6=六步；gate=横切
  aiep-gate: G2                  # 可选：Gate-1~4 / G2-A / G2-B / none
---
```

### description 写法（触发可靠性）

- 含 **步骤编号**、**产物文件名**、**禁止项**、**中英文触发词**
- 坏例：`帮助写文档`
- 好例：`步骤2 SDD-v*.json + validate:sdd G2；禁止 prd-design-generation 代 SDD`

## 3. 正文推荐章节

| 章节 | 内容 |
|------|------|
| 适用步骤 / 何时启用 | 与 `ai-full-process-design` 步骤对齐 |
| 必要输入 | 路径、前置 Gate |
| 必交付物 | 落盘路径表 |
| 执行步骤 | 编号清单 + 精确 npm 命令 |
| 阶段门禁 | pass/fail/blocked 条件 |
| Agent 规则 | 禁止代签、禁止跳过脚本 |
| 输出模板 | 步末摘要 markdown |

细节 checklist 放 `references/`，勿堆在 SKILL.md。

## 4. AIEP 路径约定

| 类型 | 路径 |
|------|------|
| 总编排、形态、工作流 | `.cursor/skills/` |
| 六步阶段 Skill | `AIEP-WEB/src/skills/` |
| 模板真值 | `核心文档/AI+产品落地/02-子应用通用模板/` |
| 子应用文档 | `AIEP-WEB/src/docs/子应用文档/{app-code}/` |

## 5. 与 Rules 分工

| 机制 | 作用 |
|------|------|
| **Rules**（`.cursor/rules/*.mdc`） | 自动加载时机、禁止人工 sync |
| **Skill** | 步骤细则、模板、脚本、门禁 |
| **npm 脚本** | 可验证真值（infer / validate:sdd / build） |

Skill 写「做什么」；Rules 写「何时自动做」。

## 6. 新增 Skill 检查单

- [ ] `name` 与目录名一致
- [ ] `description` 含步骤 + 触发关键词
- [ ] 已登记 `SKILLS-DIRECTORY.md`
- [ ] 已更新 `agent-skills-auto-exec.mdc` 路由表（若为主线步骤）
- [ ] 已更新 `ai-full-process-design/workflow.md`
- [ ] 有 `examples.md` 或 `references/`（非 trivial Skill）
- [ ] 样例 app 路径可引用（marketing-demo / sample-app）

## 7. 外部优秀参考（择需借鉴，非拷贝）

| 来源 | 借鉴点 |
|------|--------|
| [agentskills/agentskills](https://github.com/agentskills/agentskills) | 开放标准、渐进式披露 |
| [anthropics/skills](https://github.com/anthropics/skills) | 参考实现、scripts/ 组织 |
| [awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills) | PR/CI/debug 类 workflow 拆分 |
| [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) | 设计链 scripts + references |
| AIEP 已有 `marketing-design-yxui` | 域规范 Skill 写法（权威文档 + 样例 app） |
| Axhub Make 体验层（附录 C-2） | 路径验证 Prompt、起步 tips、完成 checklist；**不**借鉴 LLM 选型 |

AIEP 六步主线 **不** 引入外部「通用 commit/PR」Skill 替代 `sdd-generation` / `ui-generation` 等域内 Skill。

## 8. Agent 与模型（AIEP 约定）

- **IDE**：Cursor 或 TRAE；打开 **仓库根目录**
- **模型**：使用 IDE **订阅自带模型**；Skill/Rules **不写**推荐 LLM 表或「反 Auto」条款
- ** onboarding**：`核心文档/框架核心文档/新手入门.md` · 步骤 0 路径验证见 `scaffold-sub-app/references/project-verify-prompt.md`
- **阶段 Skill 正文**：建议含 **本章完成标准** 3 条 checklist（见 `scaffold-sub-app/SKILL.md` 示例）
