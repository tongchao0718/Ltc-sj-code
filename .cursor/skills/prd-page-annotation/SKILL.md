---
name: prd-page-annotation
description: >-
  按功能点将 PRD 以角标浮窗挂到 UI：四段式（功能说明/交互逻辑/数据模型与标准编码/其他说明）；
  支持初始化、增量更新、浮窗内编辑（开发态）。落盘 03-PRD 与 annotations/*.js。
  Use for PRD标注、页面标注、功能点标注、初始化标注、标注更新、浮窗编辑、需求编号反向写入。
compatibility: AIEP-DEV；Node>=18；sample-app PrdAnnotation 为参考实现
metadata:
  aiep-step: "3-4"
  aiep-gate: none
---

# PRD 页面标注（prd-page-annotation）

> **参考实现**：`AIEP-WEB/src/apps/sample-app/components/PrdAnnotation/`  
> **数据文件**：`AIEP-WEB/src/apps/{app}/annotations/{app}Annotations.js`  
> **仓库副本**：`AIEP-WEB/src/skills/prd-page-annotation/`（与 `.cursor/skills/` 同步）

## 定位

将 **功能点**（非整页）以角标 + 浮窗挂到 UI 锚点，研发/客户走查时无需翻 PRD。  
**不替代** `03-PRD设计评审文档.md` 冻结与 `19-G2-A` 人工签字。

## AIEP 落盘路径（禁止仅用 prd.md）

| 用途 | 路径 |
|------|------|
| PRD 主文档 | `01-需求与设计/03-PRD设计评审文档.md` |
| SA 锚定 | `01-需求与设计/01-需求说明书.md` |
| 映射表 | `页面-路由-接口-数据表映射表.md`（Gate-3） |
| 契约 | `SDD-v*.json` / `SDD-Lite*.json` |
| 标注数据 | `src/apps/{app}/annotations/{app}Annotations.js` |
| 反向写入 | 在 01 / 03 表格或章节用 `[n]` 或 `SA-xx` 关联功能点；**一键复制**片段含 `app-code`（仅注释，UI 不展示） |

## 编号规则（三层）

| 层 | 格式 | 用途 |
|----|------|------|
| 角标显示 | `SA-xx` 数字部分或顺序 `id` | UI 角标文字 |
| 文档追溯 | `SA-xx`、`Mxx` | 需求说明书、PRD 模块 |
| 代码 `id` | 1～999 | `PrdAnnotationAnchor :id`、annotations 键 |

**禁止**自造与 01 不一致的 SA 编号。同一 **功能点** 一个角标；**同一页面可有多个功能点**（多个角标）。

## 浮窗四段式（强制结构）

每条标注 `sections` 四字段（空段可不展示）：

| 字段 key | 标题 | 写什么 |
|----------|------|--------|
| `functional` | 功能说明 | 展示内容、字段、状态、权限、四态 |
| `interaction` | 交互逻辑 | 点击/提交/校验/分页/联动/异常提示 |
| `dataModel` | 数据模型与标准编码引用 | 表名、接口（详见 SDD §x）、枚举、PRD 第七章编码 |
| `other` | 其他说明 | 验收 AT、NFR、走查备注 |

数据示例见 [reference.md](reference.md)。旧版 `markdown` 仍支持，加载时自动拆分为四段。

## 标注粒度：按功能点（非按整页）

| 策略 | 说明 |
|------|------|
| **推荐** | 每个可独立验收的功能点一个角标（如：筛选区、表格区、行操作、分页） |
| 锚点 | 该功能点 UI 容器右上角 |
| **禁止** | 在同一按钮上叠多个角标（行内「编辑」「删除」合并为「行操作」一个功能点） |
| 整页 | 仅当整页只有一个功能点时才一页一角标 |

同页多角标示例：`SearchTablePage` 上 `[2]` 筛选、`[3]` 表格 — 见 [examples.md](examples.md)。

## 浮窗内直接编辑（开发态）

参考实现已支持（`sample-app`）：

1. 开发模式或 `VITE_PRD_ANNOTATION_EDIT=true` 时，悬停角标即查看；浮窗底部 **编辑** / **保存**（两态切换）与 **一键复制**
2. **人工编辑为纯文本**：四段式字段直接写中文，换行分段；条目可用 `1. ` 或 `- ` 开头。**无需**写 `##`、`**` 等 Markdown。进入编辑时会把历史 Markdown 自动去符号转为可读纯文本。
3. 修改四段式字段 → **保存**（`localStorage` 暂存）
4. **一键复制** → 复制当前功能点 JS 片段（头部含 `@aiep-prd-annotation app-code=…`，**界面不展示**）→ Cursor 按 `target` 路径打开对应子应用 `annotations/*.js` 整段替换 → Git 提交（**无需 dev**）
5. 角标为 **16px 圆形数字**（原型标注样式）
6. 生产构建默认关闭编辑（`VITE_PRD_ANNOTATION_EDIT=false`）
7. **隐藏/显示标注**：布局挂载 `PrdAnnotationToggle`，右下角一键切换；偏好写入 `localStorage`

Agent 批量初始化仍走 Workflow A/B；**Agent 写入 sections 时也应用纯文本**（勿依赖 Markdown 标题/加粗）。人工微调可用浮窗编辑。

## Task Decision

指令不明确时询问：

- **Workflow A**：新页面/新功能点初始化标注  
- **Workflow B**：已有标注增量更新  
- **Workflow C**（可选）：仅浮窗内人工编辑，不改 Vue 锚点

## Workflow A：初始化标注

1. 从 `03-PRD` + `01-需求说明书` + SDD 列出 P0 **功能点清单**（非仅页面清单）
2. 为每个功能点分配 `id`、`featureId`（SA-xx）、`featureName`
3. 填写四段式 `sections`（契约细节写「详见 SDD §x」，勿在浮窗展开全文）
4. 在页面用 `PrdAnnotationAnchor :id="n"` 挂锚点（复用 sample-app 组件）
5. 反向写入：在 01/03 用 `[n]` 或 SA 列关联功能点；人工复制落盘时**必须先核对**复制头中的 `app-code`，避免写入错误子应用
6. **PRD 冻结前**：合并进 `03-PRD` 对应模块（`prd-design-generation` step4-freeze）

## Workflow B：增量更新

1. diff `03-PRD` / 功能点清单 / `annotations/*.js`
2. **样式锁**：不改角标 CSS 与浮窗尺寸
3. 新增功能点 → 新 `id` + 新锚点；删除 → 移除角标与映射；修改 → 只改 `sections`

## 实现指引

1. **复制** `sample-app/components/PrdAnnotation/` + `annotations/annotationFormat.js`、`annotationStore.js`、`annotationAppMeta.js`（**必改** `appCode` / `appFolder` / 文件名）
2. `annotations/{app}Annotations.js` 结构：

```javascript
export const APP_ANNOTATIONS = {
  2: {
    featureId: 'SA-2',
    featureName: '列表筛选与查询',
    moduleName: 'M02 列表查询',
    pageRoute: '/sample-app/list/search-table',
    sections: {
      functional: '…',
      interaction: '…',
      dataModel: '表 xxx；接口详见 SDD §3.2；标准编码见 PRD 第七章',
      other: '验收 AT-02 …'
    }
  }
}
```

3. 环境变量：`VITE_PRD_ANNOTATION`（显隐）、`VITE_PRD_ANNOTATION_EDIT`（编辑）

技术细节：[reference.md](reference.md) · 聚合示例：[examples.md](examples.md)

## 自检清单

- [ ] 按 **功能点** 而非仅按页面标注；同页多角标合理
- [ ] 四段式齐全或空段有理由
- [ ] SA-xx 与 01 一致；契约引用 SDD 而非浮窗臆造
- [ ] 同功能区域无重复角标
- [ ] 反向写入 01/03 或 annotations 已提交
- [ ] 浮窗：拖拽、仅 X 关闭、450px 宽、Teleport 防裁剪

## 阶段门禁

| 结论 | 条件 |
|------|------|
| pass | P0 功能点均有锚点 + 四段式可读 + SA 一致 |
| fail | 缺 P0 功能点或 SA 冲突 |
| blocked | 无 03-PRD 草案 / 无页面实现 |

本 Skill **不判定** G2-A / PRD 冻结。

## 关联技能

- 上游：`ui-generation`、`prd-design-generation`（step3-draft）
- 预审：`design-review-pre-g2a`（D4 标注 SA 一致）
- 走查：`ui-acceptance-review`
- 冻结：`prd-design-generation`（step4-freeze 合并浮窗进 PRD）

## 禁止

- 代签 `19-G2-A` 或标 PRD「冻结版」
- 浮窗编造接口字段（须引用 SDD）
- 生产环境默认开启浮窗编辑
