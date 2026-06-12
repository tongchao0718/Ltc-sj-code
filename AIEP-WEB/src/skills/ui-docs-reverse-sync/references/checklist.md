# 界面文档回写速查清单

> 完整说明见 [SKILL.md](../SKILL.md) · 话术见 [manual-trigger.md](manual-trigger.md)

## 启动

- [ ] **用户已人工触发**（非 Agent 自动）
- [ ] `npm run infer:process-step -- --app {app} --json`
- [ ] 确认模式：full | scoped | post-walkthrough | post-dev
- [ ] Read `platform_type` 形态 Skill
- [ ] 确认 PRD 是否冻结（冻结 → 变更标「待变更评审」）

## preview 阶段（默认）

- [ ] router 全量（或 scoped 变更链）已扫描
- [ ] 菜单/侧栏层级 ≤ 五级、名称无编号
- [ ] P0 页四态分支已读
- [ ] Mock/API 调用点已列（仅接口名）
- [ ] 差异表已输出（P0/P1）
- [ ] 拟改文件清单已列出
- [ ] **未**修改 01/03/04/映射表正文
- [ ] 已提示用户回复「确认回写」

## apply 阶段（人工确认后）

- [ ] 用户已说「确认回写」/「apply」/「直接回写」
- [ ] PRD 冻结且改 03 时已有「已知待变更评审」
- [ ] `04-界面设计文档.md` 页面清单与路由一致
- [ ] `04` P0 页说明与当前 UI 一致
- [ ] `04` §变更记录已追加
- [ ] `页面-路由-接口-数据表映射表.md` 无孤儿路由
- [ ] `03-PRD` 相关模块已更新（未越权改 API 字段）
- [ ] `01-需求说明书` 新页/新 SA 已同步（若有）
- [ ] `annotations/*.js` 已同步（若有 PrdAnnotation）
- [ ] `00-项目记忆.md` 已记 UI 决策（若有）
- [ ] `应用操作说明书.md`（post-dev / 步骤 6）

## 禁区

- [ ] **未**改 SDD 契约正文
- [ ] **未**标 PRD 冻结
- [ ] **未**代签 G2-A
- [ ] SDD 冲突已写入报告 §SDD 待办

## 收尾

- [ ] `04-AI治理与审计/界面文档同步报告.md` 已落盘
- [ ] 输出步末摘要（含 preview-only 或 apply 阶段）
- [ ] 建议：`design-review-pre-g2a` 或 `ui-acceptance-review`（按步骤）

## 结论

- [ ] preview-only → 待用户「确认回写」
- [ ] P0 差异已清零 → pass
- [ ] P0 未修复 → fail
- [ ] 缺前置 → blocked
