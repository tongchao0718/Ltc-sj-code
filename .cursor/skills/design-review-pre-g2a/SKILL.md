---
name: design-review-pre-g2a
description: >-
  G2-A 前设计预审：视觉一致性、PRD/标注对齐、U1～U6 与 R1～R5 检查。
  步骤 3 收尾、进入步骤 4 客户确认前调用。输出 G2-A预审报告.md。
  Use for 设计预审、G2-A前评审、界面评审、design review、R1-R5、步骤3收尾检查。
---

# G2-A 前设计预审（design-review-pre-g2a）

> **规范**：`子应用资源库规范.md` §六 R1～R5 + `ai-full-process-design` U1～U6  
> **落盘**：`04-AI治理与审计/G2-A预审报告.md`  
> **定位**：AI 自动预审，**不替代** PO/客户签字（`19-G2-A界面确认记录.md` 仍须人工）

## 何时启用

- 步骤 3 宣称「全量界面已齐」，准备进入步骤 4 之前（**强制**）
- 客户走查前需要问题清单
- 用户要求「设计评审 / 预审 / review 界面」

## 必要输入

| 输入 | 路径 |
|------|------|
| 全量界面代码 | `AIEP-WEB/src/apps/{app-code}/` |
| 资源库 | `_resources/theme.json`、`components-manifest.json` |
| PRD 草案 | `03-PRD设计评审文档.md` |
| 体验细节 | `04-界面设计文档.md` |
| 需求锚定 | `01-需求说明书.md`（SA-xx、页面清单） |
| 页面标注 | 已挂载的 `prd-page-annotation`（若有） |
| 构建结果 | `npm run pack:sub-app -- --app {app-code}` all_pass（U5 / P1～P8） |

## 评审维度（双轴，借鉴 Axhub design-review）

### 轴 1 — 视觉与资源一致性

| ID | 检查项 | 严重级 |
|----|--------|--------|
| V1 | 主色/间距与 `theme.json` 一致 | blocking |
| V2 | P0 页使用 `components-manifest` 声明组件，无随意造轮子 | warning |
| V3 | 四态（loading/empty/error/success）视觉与规范一致 | blocking |
| V4 | 营销域：YXUI 24/16 间距、壳层尺寸 | blocking（web-marketing） |
| V5 | 移动 H5：375px 视口无横向溢出 | blocking（web-mobile-h5） |

### 轴 2 — 需求与文档一致性

| ID | 检查项 | 严重级 |
|----|--------|--------|
| D1 | 页面清单 100% 有路由可达（U1/U2） | blocking |
| D2 | P0 主流程可端到端演示（U3） | blocking |
| D3 | PRD 草案章节覆盖全部 P0 页面 | blocking |
| D4 | 页面标注 SA-xx 与需求说明书一致（若有标注） | blocking |
| D5 | 04 与代码交互一致，无「文档有、界面无」 | warning |
| D6 | Mock 字段与 SDD 数据模型一致 | warning |

### 轴 3 — 资源库（R1～R5）

| ID | 检查项 |
|----|--------|
| R1 | `theme.json` 存在且 platform_type 一致 |
| R2 | `components-manifest` 覆盖 P0 组件 |
| R3 | Mock 可追溯至 `_resources/mock-data` 或 `mock/` |
| R4 | 本报告将落盘（自指） |
| R5 | `00-项目记忆.md` 无过期待办 |

## 执行步骤

1. 运行 `npm run pack:sub-app -- --app {app-code}`，记录 all_pass 与 P1～P8
2. 按页面清单逐项核对路由与入口（U1/U2）
3. 对照 `theme.json` 抽查 P0 页主色与间距
4. 对照 `03-PRD` 与 `04` 查遗漏章节或页面
5. 若有标注：抽查 3 个模块的 SA-xx 与浮窗完整性
6. 汇总 blocking / warning / pass
7. 写入 `G2-A预审报告.md`

## 结论规则

| 结论 | 条件 |
|------|------|
| **pass** | 无 blocking；warning ≤ 3 且已列入 G2-A 走查议题 |
| **fail** | 存在任一 blocking |
| **blocked** | 缺 PRD 草案 / 页面清单 / 无法 build |

**fail 或 blocked** → `ai-full-process-design` **不得**建议进入步骤 4。

## 报告模板

落盘路径：`AIEP-WEB/src/docs/子应用文档/{app-code}/04-AI治理与审计/G2-A预审报告.md`

```markdown
# G2-A 预审报告 — {app-code}

- **日期**：YYYY-MM-DD
- **platform_type**：{…}
- **构建**：`npm run pack:sub-app -- --app {app}` — all_pass {true|false}（P1～P8）
- **总评**：pass | fail | blocked

## Blocking（须修复后再进步骤 4）

| ID | 页面/模块 | 问题 | 建议修复 |
|----|-----------|------|----------|
| … | … | … | … |

## Warning（带入客户走查）

| ID | 说明 |
|----|------|
| … | … |

## 已通过项摘要

- U1～U6：…
- R1～R5：…

## 建议 G2-A 走查顺序

1. …
```

## 禁止

- 将本报告等同于 `19-G2-A` 签字
- 在 blocking 未清零时建议 PRD 冻结
- 跳过 build 检查宣称 pass
