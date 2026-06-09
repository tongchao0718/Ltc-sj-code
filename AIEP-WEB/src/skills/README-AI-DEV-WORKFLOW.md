# AI 驱动开发标准流程（Skill 编排）

**默认入口**：`.cursor/skills/ai-full-process-design/SKILL.md`

> **Skill 编写规范**：`AIEP-WEB/src/skills/SKILL-STANDARD.md`（对齐 agentskills.io）

## 阶段顺序

0. 子应用立项：`scaffold-sub-app`（新建时）
1. 需求生成：`requirements-clarification`（含 platform_type、flow_type）
2. 需求确认：`sdd-generation` + SDD/G2-B + `17-需求确认单` + **`validate:sdd --gate G2`**
3. 界面生成：`ui-generation` **step3** + `prd-design-generation`（PRD 草案）+ **全量可交互界面**
4. 界面确认：`ui-generation` **step4** + `19-G2-A` **人工确认** + **`validate:sdd --gate G3`**
5. 开发测试：`code-development` +（真实 API）`server-api-development` + `test-validation`（入口复检 Gate-2/3）
6. 发布上线：`release-deployment` + Gate-4 + CI

## 门禁规则

- 优先 **`ai-full-process-design`** + **`ai-dev-stage-gate`**
- 步骤 4 无人工 G2-A → **`blocked`**
- 步骤 2 **不用** `prd-design-generation` 代替 SDD

## 移动端

按 `platform_type` 加载 `.cursor/skills/` 下 mobile / marketing / ui-ux-pro-max（见 `SKILLS-DIRECTORY.md`）。

## 目标

六步行为一致、产物可追踪、Gate 可脚本校验。
