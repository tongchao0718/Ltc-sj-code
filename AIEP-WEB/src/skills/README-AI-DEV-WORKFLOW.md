# AI 驱动开发标准流程（Skill 编排）

## 阶段顺序

1. `requirements-clarification`
2. `prd-design-generation`
3. `ui-generation`
4. `code-development`
5. `test-validation`

## 门禁规则

- 每一阶段必须先调用对应 skill
- 只有当前阶段的 Required Outputs 完整后，才允许进入下一阶段
- 阶段切换时，优先使用 `ai-dev-stage-gate` 进行门禁检查

## 推荐用法

1. 先调用 `ai-dev-stage-gate` 确认当前阶段和缺失项
2. 调用当前阶段 skill 生成标准交付物
3. 再调用 `ai-dev-stage-gate` 判断是否 pass
4. pass 后进入下一阶段

## 目标

通过标准化的 skill 编排，让 AI 在需求、设计、开发、测试全流程中行为一致、结果可追踪、质量可复核。
