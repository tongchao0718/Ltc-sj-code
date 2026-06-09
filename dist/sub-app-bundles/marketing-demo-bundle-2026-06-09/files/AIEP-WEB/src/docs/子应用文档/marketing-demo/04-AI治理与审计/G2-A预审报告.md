# G2-A 预审报告 — marketing-demo

- **日期**：2026-06-08（回溯试跑，原 G2-A 已于 2026-04 人工通过）
- **platform_type**：web-marketing
- **构建**：`npm run build:marketing-demo` — exit 0（试跑日验证）
- **总评**：pass

## Blocking（须修复后再进步骤 4）

| ID | 页面/模块 | 问题 | 建议修复 |
|----|-----------|------|----------|
| — | — | 无 | — |

## Warning（带入客户走查）

| ID | 说明 |
|----|------|
| — | 无未处理 warning |

## 已通过项摘要

### U1～U6

| # | 检查项 | 结果 |
|---|--------|------|
| U1 | 页面清单 100% 有路由（29 路由页） | ✅ |
| U2 | 入口可达全部页面 | ✅ |
| U3 | P0 主流程可演示（接入→查询→分析→画像→报告→协议→履约） | ✅ |
| U4 | 关键页四态（loading/empty/error） | ✅ |
| U5 | `npm run build:marketing-demo` 通过 | ✅ |
| U6 | 文档与代码一致（PRD V1.1 冻结 + 04） | ✅ |

### R1～R5（资源库）

| # | 检查项 | 结果 |
|---|--------|------|
| R1 | `_resources/theme.json` + platform_type=web-marketing | ✅ |
| R2 | `components-manifest.json` 覆盖 15 个 Md* 组件 | ✅ |
| R3 | Mock 可追溯至 `_resources/mock-data/companies.json` + `mock/` | ✅ |
| R4 | 本报告已落盘 | ✅ |
| R5 | `00-项目记忆.md` 已更新 | ✅ |

### 视觉与文档（抽样）

| ID | 结果 | 说明 |
|----|------|------|
| V1 | ✅ | theme.json 与 marketing-demo.css `--yx-*` 一致 |
| V4 | ✅ | YXUI 24/16 间距、壳层 64/36/235/54 |
| D3 | ✅ | PRD V1.1 覆盖 MD-1～MD-23 |
| D4 | N/A | 页面标注未全量挂载（可选专项） |

## 建议 G2-A 走查顺序（归档）

1. 看板 Dashboard → 数据接入 MD-1
2. 九维查询 MD-2～10（抽样 3 页 + 全菜单可达）
3. 多维分析 MD-11～15
4. 业务画像 MD-16 → 一键报告 MD-17
5. 结算协议 MD-18～20 → 履约管控 MD-21～23

## 备注

本报告为 **Axhub Make 借鉴方案试跑** 时按 `design-review-pre-g2a` 规则回溯生成；`19-G2-A界面确认记录.md` 人工通过记录保持不变。
