# AI 驱动开发标准流程（Skill 编排）

## 阶段顺序

1. 需求生成：`requirements-clarification`
2. 需求确认：`requirements-clarification` + `prd-design-generation`
3. 界面生成：`ui-generation`
4. 界面确认：`ui-generation`
5. 开发测试：`code-development` + `test-validation`
6. 发布上线：基于门禁结论执行发布检查与归档

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

通过标准化的 skill 编排，让 AI 在“需求生成、需求确认、界面生成、界面确认、开发测试、发布上线”全流程中行为一致、结果可追踪、质量可复核。
