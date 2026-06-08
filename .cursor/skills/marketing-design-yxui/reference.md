# YXUI / 营销设计规范 — 参考速查

> 完整条文见 `核心文档/框架核心文档/营销设计规范.md`  
> 在线标注：http://172.26.4.144:2280/tuyandesign/yxui/

## #s 章节索引

| #s | 主题 | 关键数值 |
|----|------|----------|
| s0 | 封面 | — |
| s1 | 分辨率 | 1920×1080 基准 |
| s2 | 布局 | 235/54/64/36 |
| s3 | 间距 | 24 页面、16 双卡片、20/24 容器内 |
| s4 | 字体 | 14/16/12px |
| s5 | 色彩 | #3A96FE 主色 |
| s6 | 换肤 | 蓝/绿/紫/橙 |
| s7 | 按钮 | 28px 高、15px 左右 padding、5 态 |
| s8 | 表格 | 行高 36px、cell padding 10px、模块内 20/外 24 |
| s9 | 分页 | 22×22、10/20/50 |
| s10 | 标题 | 16px + 竖条 |
| s11 | 面包屑 | 14px、`/` #CFCFCF |
| s12 | 标签页 | 壳层 36px；内容一级 Tab **40px** |
| s13 | 输入框 | 32px（通用）；28px（查询 #s14） |
| s14 | 表单/查询 | 3 列、28px、横 20/纵 16、按钮 gap 10 |
| s15 | 上传 | 文件名/大小/状态/重试 |
| s16-22 | 选择器等 | 见主规范 §9.10-12 |
| s23 | 弹窗 | 内容区居中、蒙版 50%、176px 纯警告 |
| s24 | 消息提示 | 画板名「弹窗备份」= Alert/Toast |
| s25 | 流程图 | 节点色板 |
| s26 | 详情列表 | 标签右对齐、36px 行高、8px 行距 |

## CSS 变量（marketing-demo）

```css
--yx-primary: #3a96fe;
--yx-primary-hover: #1990ff;
--yx-primary-active: #0252a8;
--yx-primary-light: #edf5ff;
--yx-primary-border: #c6e2ff;
--yx-header-bg: #124f9a;
--yx-bg-page: #f5f7fa;
--yx-spacing-page: 24px;
--yx-spacing-section: 16px;
--yx-sidebar-width: 235px;
--yx-sidebar-collapsed: 54px;
--yx-header-height: 64px;
--yx-tab-height: 36px;
--yx-modal-header-height: 48px;
--yx-modal-footer-padding-top: 10px;
--yx-modal-footer-padding-bottom: 20px;
--yx-filter-cols: 3;
--yx-filter-gap-x: 20px;   /* YXUI #s14 */
--yx-filter-gap-y: 16px;
--yx-filter-actions-gap: 10px;
--yx-filter-control-height: 28px;
--yx-content-tab-height: 40px;
--yx-scrollbar-size: 6px;
```

## 数值定稿（文档 vs 在线）

| 项 | 在线 YXUI | 文档 v1.2 | demo |
|----|-----------|-----------|------|
| 查询控件高 | 28px #s14 | 28px | 28px |
| 查询横间距 | 20px #s14 | 20px | 20px |
| 按钮间距 | 10px #s14 | 10px | 10px |
| 查询↔列表 | 16px #s3 | 16px | 16px |
| 侧栏↔内容 | 24px | 24px | 24px |
| 文档页签 | 36px #s2 | 36px | 36px |
| 内容 Tab | 40px #s12 | 40px | `.md-content-tabs` |
| 弹窗位置 | 内容区 #s23 | 内容区 | `#md-modal-host` |
| 主题 | 蓝/绿 #s6 | 蓝/绿 | 顶栏切换 |

## 列表页结构

```
md-list-page (gap: 16px)
├── md-panel — 查询区
│   ├── MdSectionTitle
│   └── MdFilterForm
└── md-panel md-panel--table — 列表区
    ├── MdSectionTitle (+ extra 导出/新增)
    ├── md-table-wrap > md-table
    └── MdPagination
```

## 弹窗（#s23）

- 弹出：右侧**内容区**中间（不含侧栏+顶栏）
- 蒙版：`#000000` 50%
- 宽度：30% / 60% / 70% / 80% / 90%
- 标题栏：48px，左右 24px
- 底栏：右对齐；padding 上 10 / 下 20
- 简单警告：~176px，无操作按钮

## 与其他规范

| 文档 | 场景 |
|------|------|
| 营销设计规范.md | marketing-demo、营销域 |
| 系统设计规范.md | AIEP 主应用 Arco |
| 主应用子应用接入规范.md | 嵌入路由、作用域隔离 |
