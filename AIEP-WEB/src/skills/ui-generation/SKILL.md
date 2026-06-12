---
name: ui-generation
description: >-
  UI-first 两步：step3 全量可交互原型+界面文档；step4 客户确认+G2-A。输入为需求确认单+SDD+页面清单，
  非已冻结 PRD。配合 ai-full-process-design、prd-design-generation（03-PRD 草案）。
---

# 界面生成 / 界面确认

> 总编排：`.cursor/skills/ai-full-process-design/SKILL.md`

## 两种模式（调用时必须指定）

| 模式 | 步骤 | 输入 | 核心产出 |
|------|------|------|----------|
| **step3-prototype** | 3 界面生成 | 需求确认单、SDD、**全量页面清单** | **100% 可运行界面** + 04/产品设计 + PRD 草案配合 |
| **step4-confirm** | 4 界面确认 | step3 全量界面、PRD 草案 | **`19-G2-A界面确认记录.md`** + PRD 冻结 + 映射表 |

**禁止**：step3 仅 MVP 子集；step4 大规模新建页面；Agent 自签 G2-A。

## 模板调用要求（强制）

1. 从 `{TEMPLATE_REPO_PATH}` **复制**模板后填写（默认：`核心文档/AI+产品落地/02-子应用通用模板/`）。  
2. 本阶段必用模板：  
   - `04-界面设计文档`：无独立母版；**须含** `## 文档信息`、`## 页面清单`（或 `## 一、页面清单`）、`## 变更记录`（样例见 `sample-app`、`marketing-demo`）  
   - `02-产品设计文档模板.md`（可选轻量产出）  
   - `03-PRD` 由 **`prd-design-generation`（step3-draft）** 负责，本 Skill 不代写  
   - step4：`19-G2-A界面确认记录模板.md`  
3. 模板不可读 → 输出 **`blocked`**；**禁止**自行发明章节结构。  
4. 未按模板章节输出，阶段门禁判定为 `fail`；须跑 `npm run validate:doc-template -- --app {app-code} --gate G3`。  
5. 输出结果须回填子应用目录，不得改写模板母版。

## step3-prototype

### 必要输入

- `17-需求确认单`（Gate-1 已过）
- `SDD-v*.md`（草案即可，Gate-2 签署进行中或已完成）
- `01-需求说明书` 中的 **platform_type** 与页面/屏幕清单
- **`_resources/`**（由 `sub-app-resources` 先行初始化/校验）
- 设计规范：Arco / 营销 YXUI / Ant 移动 §九 / 原生 Skill

### 必交付物

1. **全量**可交互原型（非 MVP）  
2. 信息架构与 **100% 页面/屏幕** 清单  
3. 每页 loading/empty/error/success  
4. Web：`subApps` + 路由 + `npm run pack:sub-app -- --app {app-code}` 可过（U5，见 `pack-sub-app`）  

### 门禁（进入 step4 前）

- U1～U6 全 pass（见 ai-full-process-design 设计文档 §3.3）  
- R1～R5 全 pass（见 `子应用资源库规范.md` §六）  
- `design-review-pre-g2a` 结论 **pass**（`G2-A预审报告.md` 已落盘）  
- 移动类追加 UM1～UM5  

## step4-confirm

### 动作

1. 组织客户/PO **逐页**走查（会议/书面/标注）  
2. 填写 `01-需求与设计/19-G2-A界面确认记录.md`  
3. **`prd-design-generation`（step4-freeze）** 升版 `03-PRD` 冻结（仅 G2-A 人工通过后）  
4. 完成 `页面-路由-接口-数据表映射表.md`  
5. 运行 `npm run validate:sdd -- --app {app} --gate G3`

### 门禁

- G2-A 人工 **通过** → 才可 Gate-3 pass  
- 无人工确认 → **`blocked`**

## 阶段 Skill 协作

- 编码（Mock→真实 API）：**步骤 5** 使用 `code-development`，非本 Skill  
- Stitch：`stitch-design` 可选前置 step3  

## 输出结构（产品设计文档轻量）

见原 §02 模板：概述、信息架构、交互原则、设计风格、发布策略。
