# 发布审核报告 — {app-code}

- **日期**：YYYY-MM-DD
- **模式**：pre-release | post-verify
- **发布版本**：{version}
- **审核人（人工）**：{发布负责人 — Agent 不代填}
- **总评**：pass | fail | blocked

## 一、发布范围

| 项 | 内容 |
|----|------|
| PRD 版本（冻结） | {…} |
| G2-A 状态 | 人工通过 |
| 发布范围摘要 | P0 功能列表 |
| 构建命令 | `npm run pack:sub-app -- --app {app}` |

## 二、门禁链

| ID | 检查项 | 命令/依据 | 结果 | 备注 |
|----|--------|-----------|------|------|
| G1 | Gate-2 | validate:sdd G2 | pass/fail | |
| G2 | Gate-3 | validate:sdd G3 | pass/fail | |
| G3 | 注册表 | validate:sub-app-registry | pass/fail | |
| G4 | G2-A | 19-G2-A | pass/fail | |
| G5 | PRD 冻结 | 03-PRD | pass/fail | |

## 三、测试链

| ID | 检查项 | 结果 | 备注 |
|----|--------|------|------|
| T1 | test-validation 结论 | go/conditional go/no-go | |
| T2 | P0 阻塞缺陷 | 0 / {n} | |
| T3 | npm test | pass/fail/skip | |
| T4 | 界面回归报告 | pass/fail/缺 | |

## 四、产物链

| ID | 检查项 | 结果 | 备注 |
|----|--------|------|------|
| P1 | pack:sub-app | all_pass true/false | |
| P2 | P1～P10 | {n}/10 | |
| P3 | dist/index.html | 存在/缺失 | |
| P4 | 静态可打开 | pass/fail | |
| P5 | 主应用 build | pass/fail/skip | |

**产物路径**：`AIEP-WEB/dist/{folder}/`

## 五、文档与追溯

| ID | 检查项 | 结果 |
|----|--------|------|
| D1 | 发布范围与 PRD 一致 | pass/fail |
| D2 | 操作说明书 | pass/fail/warning |
| D3 | 回滚方案 | pass/fail |
| D4 | 版本变更记录 | pass/fail/skip |

### 回滚方案摘要

- **触发条件**：…
- **回滚动作**：git checkout / 恢复 dist / tag …
- **验证步骤**：…

## 六、发布后冒烟（post-verify）

| ID | 检查项 | 结果 |
|----|--------|------|
| S1 | 入口无白屏 | pass/fail |
| S2 | P0 主流程 ≥3 步 | pass/fail |
| S3 | 控制台无阻塞错误 | pass/fail |
| S4 | 资源 404 | pass/fail |

## 七、Blocking 汇总

| ID | 问题 | 建议修复 |
|----|------|----------|
| … | … | … |

## 八、结论

- **blocking**：{n} 项
- **是否建议执行 release-deployment**：{是/否}
- **是否建议 Gate-4 pass**：{是/否 — 放行签字仍须在发布记录单人工完成}
- **下一动作**：…
