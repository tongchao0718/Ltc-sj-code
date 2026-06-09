# G2-A 预审速查清单

> 完整说明见 [SKILL.md](SKILL.md)。步骤 3→4 切换前逐项勾选。

## 构建与路由

- [ ] `npm run pack:sub-app -- --app {app}` all_pass（P1～P8）
- [ ] U1：页面清单 100% 有路由
- [ ] U2：入口可达全部页面
- [ ] U3：P0 主流程可演示
- [ ] U4：关键页四态齐全

## 资源库 R1～R5

- [ ] R1：`theme.json` + platform_type 一致
- [ ] R2：`components-manifest` 覆盖 P0
- [ ] R3：Mock 可追溯
- [ ] R4：`G2-A预审报告.md` 将落盘
- [ ] R5：`00-项目记忆.md` 已更新

## 文档与标注

- [ ] PRD 草案覆盖 P0 页面
- [ ] 04 与代码一致
- [ ] 标注 SA-xx 与需求说明书一致（若已标注）

## 结论

- [ ] 无 blocking → 可安排步骤 4 客户走查
- [ ] 有 blocking → 退回步骤 3 修复
