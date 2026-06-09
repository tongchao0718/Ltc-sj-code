# 参考速查（ai-full-process-design）

## platform_type 路由

| platform_type | 设计规范 | 必加载形态 Skill |
|---------------|----------|------------------|
| `web-admin` | `系统设计规范.md` | **`arco-admin-design`** |
| `web-marketing` | `营销设计规范.md` | `marketing-design-yxui` |
| `web-mobile-h5` | `系统设计规范-ant.md` §九 | `ui-ux-pro-max`（推荐） |
| `native-android` | Material Design 3 | `mobile-android-design` |
| `native-ios` | Apple HIG | `mobile-ios-design` |

写入位置：`01-需求说明书.md` 元信息表。

## U1～U6（步骤 3→4 强制）

| # | 检查项 | 通过标准 |
|---|--------|----------|
| U1 | 页面清单完整 | PRD/04 每页面ID 有路由；含主流程弹窗/抽屉 |
| U2 | 可访问 | 入口可达全部页面，无 404/占位 |
| U3 | 主流程 | 每条 P0 用户故事可演示 |
| U4 | 四态 | 关键页 loading/empty/error |
| U5 | 可构建 | `npm run pack:sub-app -- --app {app}` all_pass（P1～P8） |
| U6 | 文档一致 | PRD 页面数与代码路由一致 |

任一项未过 → **blocked**，退回步骤 3。

## R1～R5（资源库，步骤 3→4 强制）

| # | 检查项 | 机读 |
|---|--------|------|
| R1 | `_resources/theme.json` + platform_type 一致 | `infer:process-step` → `resources_check.R1` |
| R2 | `components-manifest.json` entries 非空 | `resources_check.R2` |
| R3 | Mock 可追溯 mock-data 或 mock/ | `resources_check.R3` |
| R4 | `G2-A预审报告.md` 已落盘 | `resources_check.R4` |
| R5 | `00-项目记忆.md` 已存在 | `resources_check.R5` |

全量界面已齐但 R 未全过 → 推断仍为 **步骤 3**（`resources_check.all_pass: false`）。

## UM1～UM5（移动/原生追加）

| # | 检查项 |
|---|--------|
| UM1 | 触控 ≥ 44×44 或平台规范 |
| UM2 | 移动导航与 04 信息架构一致 |
| UM3 | H5 375px / 原生 simulator 可运行 |
| UM4 | 弱网/断网反馈 |
| UM5 | P0 主操作拇指可达 |

## Gate 时间线

| Gate | 时机 | 核心产物 |
|------|------|----------|
| Gate-1 | 步骤 2 末 | 17 双签 + SDD 草案 |
| Gate-2 | 步骤 2 末 | SDD 签署 + 20-G2-B + G2 脚本 |
| Gate-3 | 步骤 4 末 | 19-G2-A 人工通过 + PRD 冻结 + 映射表 |
| Gate-4 | 步骤 6 末 | 测试 + CI + 发布记录 |

## 阶段门禁状态块（强制格式）

```markdown
## 阶段门禁状态
- **子应用**：{app-code}
- **platform_type**：…
- **flow_type**：standard | fast_track
- **当前步骤**：{1~6 名称}
- **推断依据**：{infer:process-step evidence}
- **Gate-2**：pass/fail/blocked · **Gate-3**：…
- **门禁总评**：pass / fail / blocked
- **U1～U6**：… · **R1～R5**：… · **UM1～UM5**：N/A 或 …
- **resources_check**：`infer:process-step --json` → `all_pass` / `checks`
- **缺失项**：…
- **下一动作**：…
- **形态 Skill**：{已加载列表}
- **脚本结果**：infer / validate:sdd / build — exit code
```

## 步骤完成摘要

```markdown
## 步骤 {N} 完成摘要
- **产物路径**：…
- **模板来源**：…
- **脚本结果**：…
- **待 PO/TL 确认**：…
- **建议下一步**：步骤 {N+1} — {名称}
```

## Skill 索引

| 类型 | 路径 |
|------|------|
| 总编排（本 Skill） | `.cursor/skills/ai-full-process-design/` 或 `~/.cursor/skills/ai-full-process-design/` |
| 阶段 Skill | `AIEP-WEB/src/skills/`（见 SKILLS-DIRECTORY.md） |
| 域/移动 Skill | 项目 `.cursor/skills/`（marketing-design-yxui 等） |
| SDD 模板 | `核心文档/AI+产品落地/02-子应用通用模板/` |

## 双真值

- **契约**：SDD（API、数据模型、GWT）
- **体验**：03-PRD + 04-界面设计 + 可交互原型
- **禁止**在 04/PRD 重复定义 API（引用 SDD）

## 红线

1. SDD 未签署 → 禁止全面开发与上线承诺
2. PRD 未冻结 → 禁止联调提测
3. 测试/CI/追溯不完整 → 禁止发布
