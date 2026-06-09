---
name: ai-dev-stage-gate
description: >-
  编排 AI 驱动开发六步门禁，输出 pass/fail/blocked。配合 ai-full-process-design 使用；
  含 Gate-1~4、G2-A/G2-B、U1~U6 检查引用。
---

# AI 开发阶段门禁编排

> 总编排与落盘：`.cursor/skills/ai-full-process-design/`（`gates.md`、`paths.md`）

## 阶段顺序（六步）

1. 需求生成 → `requirements-clarification`
2. 需求确认 → **`sdd-generation`** + SDD（07/11 或 15-Lite）+ `20-G2-B` + `17-需求确认单`（**非** prd-design-generation 代 SDD）
3. 界面生成 → `ui-generation` **step3** + 全量原型
4. 界面确认 → `ui-generation` **step4** + `19-G2-A` 人工确认
5. 开发测试 → `code-development` + `test-validation`（入口复检 Gate-2/3）
6. 发布上线 → **`release-deployment`** + Gate-4

## Gate 映射

| Gate | 步骤 | 关键文件 |
|------|------|----------|
| Gate-1 | 2 | 需求说明书、17-需求确认单 |
| Gate-2 | 2 末 | SDD 签署、20-G2-B、`validate:sdd --gate G2` |
| Gate-3 | 4 末 | 19-G2-A、PRD 冻结、映射表、`validate:sdd --gate G3` |
| Gate-4 | 6 | 测试验收、CI、发布记录 |

## UI-first 子门禁

1. **G2-B**（步骤 2）：`20-G2-B技术补齐评审记录.md`  
2. **G2-A**（步骤 4）：`19-G2-A界面确认记录.md`，**须人工**  
3. 二者未 pass → 禁止 `code-development`  
4. 步骤 3 原型代码 **允许**（不算步骤 5 开发）

## 步骤 4 特殊规则

- 缺客户/PO 确认 → **`blocked`**（不得标 PRD 冻结）  
- Agent 不得填写 G2-A「通过」

## 编排规则

1. 进入阶段前检查上一阶段产物与 Gate  
2. 输入缺失 → `blocked` 并列出缺失项  
3. 仅输出当前阶段必交付物  
4. 阶段末输出门禁状态块  

## 输出模板

```markdown
## 阶段门禁状态
- 当前阶段：
- platform_type：
- Gate-2：pass/fail/blocked
- Gate-3：pass/fail/blocked
- 必需输入：
- 必交付物：
- 门禁总评：pass / fail / blocked
- U1～U6：（步骤 3→4 时）
- 缺失项：
- 下一动作：
```

## 状态口径

- `pass`：可进下一步  
- `fail`：本步可修订  
- `blocked`：缺签批/依赖/前置 Gate  
