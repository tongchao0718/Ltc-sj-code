---
name: sub-app-resources
description: >-
  初始化或校验子应用 _resources 资源库（theme.json、components-manifest、mock-data）。
  步骤 3 界面生成前/中调用，从 platform_type 与设计规范 Skill 提取 token。
  Use for _resources、资源库、theme.json、组件清单、mock-data bootstrap、子应用风格初始化。
---

# 子应用资源库（sub-app-resources）

> **规范**：`核心文档/AI+产品落地/01-AI全流程设计/子应用资源库规范.md`  
> **模板**：`核心文档/AI+产品落地/02-子应用通用模板/_resources/`  
> **编排**：由 `ai-full-process-design` 在步骤 3 入口调用；不替代 `ui-generation` 或形态 Skill。

## 何时启用

- 步骤 3 开始前：子应用尚无 `_resources/` 或 `theme.json` 过期
- 新增 P0 页面类型前：须扩展 `components-manifest.json`
- `platform_type` 变更后：须重建 `theme.json` 并记录变更
- 用户明确要求「初始化资源库 / bootstrap theme」

## 必要输入

| 输入 | 路径 |
|------|------|
| app-code | 用户指定 |
| platform_type | `01-需求与设计/01-需求说明书.md` |
| 设计规范 | 见规范 §五路由表 |
| 参考实现 | `marketing-demo` / `sample-app` 等 |

## 目标路径

```text
AIEP-WEB/src/apps/{app-code}/_resources/
├── README.md
├── theme.json
├── components-manifest.json
└── mock-data/
```

## Workflow A：初始化（目录不存在或 theme 缺失）

1. 读取 `platform_type`，加载对应 **形态 Skill**（`arco-admin-design` / `marketing-design-yxui` / `ui-ux-pro-max` 等）
2. 从规范文档与参考实现提取最小 token → 写入 `theme.json`
3. 扫描参考 demo 的组件目录 → 生成 `components-manifest.json` 初稿（仅列本应用将复用的项）
4. 按 SDD 草案 §数据模型 创建 `mock-data/{entity}.json` 骨架（无 SDD 时用占位并标注待补齐）
5. 写入 `_resources/README.md` 更新记录
6. 输出 **资源库初始化摘要**（见下）

## Workflow B：校验（目录已存在）

1. 比对 `theme.json.platform_type` 与需求说明书 — 不一致 → **fail**
2. 比对 P0 页面清单与 `components-manifest.json` — 缺组件 → 列出补齐项
3. 抽查 1～2 个 P0 页面样式是否使用 `theme.json` 中 token（硬编码主色视为 warning）
4. 输出 pass / fail / warning 清单

## 与 ui-generation 分工

| 能力 | sub-app-resources | ui-generation |
|------|-------------------|---------------|
| 建 `_resources/` | ✅ | ❌ |
| 生成页面 Vue 文件 | ❌ | ✅ |
| 写 04 / 产品设计 | ❌ | ✅ |
| Mock 运行时逻辑 | ❌ | ✅（可引用 mock-data） |

步骤 3 顺序：**本 Skill（A 或 B）→ ui-generation step3 → prd-design-generation**

## 输出：资源库初始化摘要

```markdown
## 资源库初始化摘要
- **子应用**：{app-code}
- **platform_type**：{…}
- **规范来源**：{文档路径}
- **参考实现**：{demo}
- **产物**：
  - `_resources/theme.json` — ✅
  - `_resources/components-manifest.json` — ✅（{N} 项）
  - `_resources/mock-data/` — ✅（{N} 个实体）
- **待人工确认**：{无 | 列表}
- **结论**：pass / fail
```

## 禁止

- 在 `theme.json` 中写 API 路径、错误码、权限规则
- 跳过形态 Skill 直接从记忆生成色板
- 用本 Skill 代替 U1～U6 或 G2-A
