---
name: sdd-generation
description: >-
  步骤2需求确认：从已确认需求说明书生成 SDD-v*.md + SDD-v*.json、17-需求确认单、20-G2-B，
  并跑 validate:sdd --gate G2。Fast Track 用 15-SDD-Lite + 18-登记单。
  禁止用 prd-design-generation 代替 SDD。Use for SDD、G2-B、Gate-2、需求确认、SDD签署、Fast Track SDD。
---

# SDD 生成与 G2-B 技术补齐（步骤 2）

> **总编排**：`.cursor/skills/ai-full-process-design/SKILL.md`  
> **前置 Skill**：`requirements-clarification`（步骤 1 已完成）  
> **禁止**：用 `prd-design-generation` 写 SDD 或代替模板 07/11

## 适用步骤

| 模式 | flow_type | SDD 模板 |
|------|-----------|----------|
| **standard** | `standard` | `07-SDD模板-可机读版.md` + `11-SDD-JSON模板.json` |
| **fast-track** | `fast_track` | `15-SDD-Lite模板.md` + `15-SDD-Lite.json` + `18-FastTrack登记单模板.md` |

## 必要输入

- `01-需求与设计/01-需求说明书.md`（含 **platform_type**、**flow_type**、P0 用户故事）
- 模板目录：`核心文档/AI+产品落地/02-子应用通用模板/`
- 样例（可选）：`AIEP-WEB/src/docs/子应用文档/marketing-demo/01-需求与设计/SDD-v1.0.md` + `.json`

## 必交付物（落盘路径）

| 产物 | 路径 |
|------|------|
| SDD 正文 | `01-需求与设计/SDD-v{version}.md` |
| SDD 机读 | `01-需求与设计/SDD-v{version}.json`（与 .md 同版本号） |
| 需求确认单 | `01-需求与设计/17-需求确认单.md`（PO+TL 双签） |
| G2-B 评审 | `01-需求与设计/20-G2-B技术补齐评审记录.md` |
| SDD 校验清单 | `04-AI治理与审计/SDD校验清单.md`（自 `08-SDD校验清单模板.md`） |
| gate-config | `04-AI治理与审计/gate-config.json`（自 `13-gate-config.json`，填 paths） |
| Fast Track 登记 | `01-需求与设计/18-FastTrack登记单.md`（仅 fast_track） |

**禁止**改写模板母版；从模板复制到子应用目录后填写。

## 模板调用要求（强制）

1. 从 `核心文档/AI+产品落地/02-子应用通用模板/` **复制** SDD / 17 / 20-G2-B / 08 / 13 等模板后填写。  
2. 模板不可读 → 输出 **`blocked`**；**禁止**自行发明 SDD 章节结构。  
3. 步骤 2 完成后须跑 `npm run validate:sdd -- --app {app-code} --gate G2`（内嵌 `validate:doc-template` 章节校验）。

## 执行步骤

1. 读 `01-需求说明书.md`，确认 `flow_type` 选 standard / fast_track 模板分支。
2. 复制 SDD 模板 → `SDD-v1.0.md`，按章节填写：
   - §1 元信息：`app_code`、前后端栈、目录布局（Web 子应用填 `AIEP-WEB/src/apps/{folder}/`）
   - §4～§5 用户故事 / 功能点：每条 P0 绑定 `AT-xx`
   - §6 API 契约：统一 `{ code, message, data, requestId }`
   - §7 数据模型（有写操作时必填）
   - §10 验收脚本 GWT（与 JSON `acceptance_tests` 一致）
3. 同步生成 `SDD-v1.0.json`：`app_code`、`features`、`api_contracts`、`acceptance_tests` 与 .md **字段级一致**。
4. 写 `17-需求确认单.md`：范围摘要 + 双签表（Agent **不得代签**，留空待 PO/TL）。
5. 写 `20-G2-B技术补齐评审记录.md`：B1～B5 检查项 + TL 签字位。
6. 初始化 `gate-config.json`：`app_code`、`paths` 与四段文档目录对齐（见 `sample-app/04-AI治理与审计/gate-config.json`）。
7. 跑门禁脚本，失败则修 SDD/JSON 后重跑：

```bash
npm run validate:sdd -- --app {app-code} --gate G2
```

8. 更新 `04-AI治理与审计/00-项目记忆.md`（经 `project-memory` Skill）。

## G2-B 检查项（B1～B5）

| # | 项 | 通过标准 |
|---|-----|----------|
| B1 | API 契约 | 每个 P0 功能有 API ID；路径/方法/错误码完整 |
| B2 | 数据模型 | 每个写操作有实体字段；主键命名符合 SDD §7.1 |
| B3 | 验收可测 | 每条 `AT-xx` 有 Given/When/Then；与 features 可追溯 |
| B4 | 风险回滚 | SDD 有风险与回滚章节（或 G2-B 备注） |
| B5 | 脚本门禁 | `validate:sdd --gate G2` exit 0 |

## Fast Track 附加约束

同时满足执行手册 §7 时才可用 `fast_track`：

- 影响页面 ≤ 2；不新增核心表；不改外部 API 主契约；≤ 3 人日

不满足 → 改 `flow_type: standard` 并用完整 SDD 07/11。

## 阶段门禁

满足以下全部才可进入 **步骤 3（界面生成）**：

- `17-需求确认单` PO+TL 双签（缺签 → **`blocked`**）
- `SDD-v*.md` + `.json` 落盘且互一致
- `20-G2-B` TL 结论为「同意进入签署」或等价
- `validate:sdd --gate G2` **pass**

**Gate-2 通过后**：允许契约类编码；**PRD 未冻结前不得联调提测**（见总编排 Gate 时间线）。

## Agent 规则

- 不得伪造 PO/TL/客户签字或日期
- SDD JSON 必须与 MD 同版本；禁止只写 MD 不写 JSON
- API 字段不得在 PRD/04 重复定义（双真值：契约看 SDD）
- 脚本 fail → 输出缺失字段清单，修订后重跑，不得跳过

## 输出模板（步末摘要）

```markdown
## 步骤 2 完成摘要
- **SDD**：01-需求与设计/SDD-v{x}.md + .json
- **G2-B**：20-G2-B技术补齐评审记录.md
- **17 双签**：{已签 / 待 PO / 待 TL}
- **validate:sdd G2**：exit {code}
- **待确认**：{签字 / 开放问题}
- **建议下一步**：步骤 3 — sub-app-resources → ui-generation
```

更多样例见 [examples.md](examples.md)。
