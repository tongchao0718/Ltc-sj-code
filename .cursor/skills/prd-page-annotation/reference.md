# PRD 页面标注 — 技术参考

## 浮窗四段式 UI

```text
┌─────────────────────────────────────────────┐
│ [2]  功能点：列表筛选与查询    SA-2          │
│ ─────────────────────────────────────────── │
│ 功能说明                                     │
│   筛选字段、按钮、布局…                       │
│ 交互逻辑                                     │
│   查询、重置、分页重置…                       │
│ 数据模型与标准编码引用                        │
│   表 sample_list_item；SDD §x；PRD 第七章     │
│ 其他说明                                     │
│   AT-02、NFR…                          [X]  │
│ [编辑] （开发态）                             │
└─────────────────────────────────────────────┘
```

## annotations 数据结构

```javascript
// AIEP-WEB/src/apps/{app}/annotations/{app}Annotations.js
export const APP_ANNOTATIONS = {
  2: {
    featureId: 'SA-2',           // 与 01-需求说明书一致
    featureName: '列表筛选与查询', // 功能点短名（浮窗标题）
    moduleName: 'M02 列表查询',   // PRD 模块（可选）
    pageRoute: '/app/list/search-table',
    sections: {
      functional: '…',   // 功能说明
      interaction: '…',  // 交互逻辑
      dataModel: '…',    // 数据模型 + SDD/标准编码引用
      other: '…'         // 其他说明
    }
  }
}
```

旧版仅 `markdown` 字段时，`annotationFormat.js` 会按标题拆入四段。

### 人工编辑：纯文本（非 Markdown）

| 场景 | 约定 |
|------|------|
| 浮窗编辑 | 四段式字段写**纯文本**；换行分段；条目用 `1. ` / `- ` / `1、` |
| 查看渲染 | `renderPrdMarkdown.js` 自动排版（段落、列表）；兼容历史 `##`、`**` 存量 |
| 进入编辑 | `sectionTextForEdit()` 去掉标题/加粗等符号，避免人工看到 Markdown 语法 |
| Agent 初始化 | `sections` 字段同样用纯文本，勿写 `### 功能说明` 等结构 |

```javascript
sections: {
  functional: '筛选区含名称、状态、日期三个字段。\n表格展示编号、名称、状态列。',
  interaction: '1. 点击查询刷新列表\n2. 重置清空条件',
  dataModel: '表 sample_list_item；详见 SDD 第 3 章',
  other: '验收 AT-02'
}
```

## 本地编辑与落盘

| 操作 | 存储 | 正式落盘 |
|------|------|----------|
| 保存到本地 | `localStorage`（`annotationStore.js`） | 否 |
| 复制代码片段 | 剪贴板（含 `app-code` 注释头，UI 不展示） | 按 `target` 路径粘贴进对应子应用 `*.js` 后 Git 提交 |
| Agent Workflow A/B | 直接改 `annotations/*.js` + 01/03 | 是 |

环境变量（`vite`）：

| 变量 | 默认（dev） | 说明 |
|------|-------------|------|
| `VITE_PRD_ANNOTATION` | 开启 | 显示角标 |
| `VITE_PRD_ANNOTATION_EDIT` | 开启 | 浮窗内编辑 |

## 设计系统（CSS 常量）

### 角标 `.prd-badge`

宽 450px 浮窗；角标 `rgb(250, 173, 20)`、10px 粗体、`top: -8px; right: -4px`；浮窗 `z-index: 9999`。

完整 CSS 见 `sample-app/components/PrdAnnotation/prd-annotation.css`。

## 定位与 Teleport

1. 默认：角标作为 `.prd-anchor` 子元素。
2. 祖先 `overflow: hidden`：角标 `Teleport` + `fixed` 坐标。
3. 浮窗默认角标左下方，视口溢出自动翻转。

## 多浮窗交互

| 行为 | 要求 |
|------|------|
| 打开 | `mouseenter` 角标 |
| 关闭 | 仅右上角 X |
| 拖拽 | 标题栏（编辑模式禁用拖拽） |
| 隔离 | `@mousedown.stop` `@click.stop` |

## 一键复制片段格式（含子应用标识）

复制内容**不在角标/浮窗展示**，仅写入剪贴板供 Cursor / Agent 落盘：

```javascript
// @aiep-prd-annotation app-code=sample-app annotation-id=2 feature-id=SA-2
// target: AIEP-WEB/src/apps/sample-app/annotations/sampleAppAnnotations.js
// action: 搜索「  2: {」整段替换（含本行尾逗号）
  2: {
    featureId: 'SA-2',
    featureName: '列表筛选与查询',
    sections: { … }
  },
```

| 字段 | 用途 |
|------|------|
| `app-code` | 防止多子应用间 `id` 重复时写错文件 |
| `annotation-id` | 与角标 `id`、文档 `[n]` 一致 |
| `feature-id` | 与 01 需求说明书 `SA-xx` 一致 |
| `target` | 落盘文件完整相对路径 |

元数据配置：`annotations/annotationAppMeta.js`（复制 PrdAnnotation 到新子应用时必改）。

## 反向写入文档

在 `01-需求说明书.md` / `03-PRD设计评审文档.md` 表格中：

```markdown
| [2] SA-2 | 列表筛选 | SearchTablePage 筛选区 | … |
```

角标 `id`、文档 `[n]`、`SA-xx` 三者可追溯。人工从浮窗复制落盘时，以复制头 `app-code` + `target` 为准，勿仅凭 `id` 或 `SA-xx` 猜测子应用。

## 参考实现文件

| 文件 | 作用 |
|------|------|
| `PrdAnnotationAnchor.vue` | 角标 + 浮窗 + 编辑 |
| `annotationAppMeta.js` | 子应用标识（复制片段用，UI 不展示） |
| `annotationStore.js` | 合并基准数据与 localStorage |
| `annotationFormat.js` | 四段式与 markdown 互转 |
| `renderPrdMarkdown.js` | 浮窗正文渲染（纯文本 + 兼容 Markdown 存量） |

## 禁止项

- 浮窗编造接口字段（写「详见 SDD §x」）
- 同一按钮多个角标
- 生产默认开启编辑
- 用 summary 替代 PRD 原文
