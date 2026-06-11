# 界面验收审核速查清单

> 完整说明见 [SKILL.md](../SKILL.md)。

## 模式选择

- [ ] 步骤 3 收尾 AI 预审 → 用 `design-review-pre-g2a`，**非本 Skill**
- [ ] 预审 pass 后安排走查 → **pre-walkthrough**
- [ ] 走查中/后整理反馈 → **walkthrough-record**
- [ ] 步骤 5 后、发布前 → **regression**

## pre-walkthrough

- [ ] `G2-A预审报告.md` 总评为 pass
- [ ] 预审 blocking 已清零
- [ ] 演示脚本：P0 主流程步骤 ≤15 步、每步有页面名
- [ ] 走查议题：预审 Warning + 业务风险点
- [ ] 建议走查顺序：主流程 → 关键四态 → P1 页面
- [ ] `00-项目记忆.md` 已读（否决项勿重复提案）

## walkthrough-record

- [ ] 每条反馈：页面 / 模块 / 现状 / 期望 / 优先级（P0/P1/P2）
- [ ] 反馈可映射到 PRD 章节或 SA-xx
- [ ] 待改项有验收标准（可测试描述）
- [ ] 区分「签字前必改」与「下一迭代」
- [ ] **未**代填 G2-A「通过」

## regression

- [ ] `19-G2-A` 含人工「通过」
- [ ] PRD 状态为冻结（版本号与映射表一致）
- [ ] `npm run pack:sub-app -- --app {app}` all_pass
- [ ] 页面清单 = 冻结 PRD 页面清单（无幽灵页/漏页）
- [ ] 映射表字段与界面展示一致（抽查 ≥3 个 P0 页）
- [ ] G2-A 走查待改项全部关闭或已书面延期
- [ ] P0 四态无退化（loading/empty/error/success）
- [ ] 域规范抽查 3 页（形态 Skill 对照）

## 结论

- [ ] 无 blocking → pass
- [ ] 有 blocking → fail，列出修复顺序
- [ ] 缺前置文档 → blocked
