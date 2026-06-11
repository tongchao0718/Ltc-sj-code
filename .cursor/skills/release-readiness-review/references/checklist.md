# 发布就绪审计速查清单

> 完整说明见 [SKILL.md](../SKILL.md)。

## 模式

- [ ] 构建前审计 → **pre-release**
- [ ] dist 已生成后冒烟 → **post-verify**

## 门禁链（pre-release）

- [ ] `npm run validate:sdd -- --app {app} --gate G2` → pass
- [ ] `npm run validate:sdd -- --app {app} --gate G3` → pass
- [ ] `npm run validate:sub-app-registry -- --app {app}` → pass
- [ ] `19-G2-A` 人工通过
- [ ] PRD 已冻结

## 测试链

- [ ] `test-validation` 结论：go / conditional go（条件已满足）
- [ ] 无未关闭 P0 阻塞缺陷
- [ ] `npm test`（若启用）
- [ ] 界面回归报告 regression pass（推荐）

## 产物链

- [ ] `npm run pack:sub-app -- --app {app}` all_pass
- [ ] P1～P10 全过
- [ ] `AIEP-WEB/dist/{folder}/index.html` 存在
- [ ] 静态离线可打开
- [ ] （嵌入）`npm run build` 成功

## 文档与追溯

- [ ] 发布范围 = 冻结 PRD P0
- [ ] 操作说明书已更新或列入发布同步项
- [ ] 回滚：tag/commit/上一版 dist 已记录

## post-verify 冒烟

- [ ] 入口无白屏
- [ ] P0 主流程 ≥3 步可走通
- [ ] 无阻塞级控制台错误
- [ ] 关键静态资源无 404

## 结论

- [ ] 无 blocking → pass → 可执行 `release-deployment`
- [ ] 有 blocking → fail
- [ ] 缺前置 → blocked
- [ ] **未**代签发布放行
