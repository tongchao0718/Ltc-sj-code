# PRD 页面标注 — 技术参考

## 浮窗信息架构

```text
┌─────────────────────────────────────────────┐
│ [1]  需求描述：筛选模块                      │  ← 编号样式 = 角标样式
│ ─────────────────────────────────────────── │  ← 浅灰分割线
│                                             │
│  （Markdown 正文：段落、列表、引用、加粗）    │
│                                             │
│  显示样式：...                               │
│  交互与排序：...                             │
│  业务定义：...                               │
│  备注：...                                   │
│                                        [X]  │
└─────────────────────────────────────────────┘
```

## Markdown 渲染（浮窗正文）

| 规则 | 值 |
|------|-----|
| 行高 | `line-height: 1.6` |
| 段间距 | `margin-bottom: 12px` |
| 加粗/斜体 | 与 `prd.md` 原文 1:1 |
| 列表 | 保留 `-` / `1.` 嵌套缩进 |
| 引用 `>` | `border-left: 3px solid #d9d9d9; padding-left: 12px; color: #666` |

状态色圆点（文字前）：

| 语义 | 圆点色 |
|------|--------|
| 成功/通过/绿色 | `#52c41a` |
| 失败/危险/红色 | `#ff4d4f` |
| 警告/橙色 | `#faad14` |
| 默认/灰色 | `#8c8c8c` |

## 设计系统（CSS 常量）

### 角标 `.prd-badge`

```css
.prd-badge {
  display: inline-block;
  vertical-align: top;
  position: absolute;
  top: -8px;
  right: -4px;
  z-index: 9998;
  background: rgb(250, 173, 20);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 14px;
  padding: 0 4px;
  border-radius: 2px;
  border: none;
  cursor: pointer;
  user-select: none;
}
```

### 浮窗 `.prd-tooltip`

```css
.prd-tooltip {
  position: fixed;
  z-index: 9999;
  width: 450px;
  max-height: 70vh;
  overflow: auto;
  background: #f0efef;
  border-radius: 4px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  padding: 12px 14px 14px;
  pointer-events: auto;
}
.prd-tooltip__close {
  position: absolute;
  top: 8px;
  right: 10px;
  cursor: pointer;
  line-height: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #666;
}
.prd-tooltip__divider {
  height: 1px;
  background: #e8e8e8;
  margin: 8px 0 12px;
}
```

### 锚点容器

```css
.prd-anchor {
  position: relative;
}
```

## 定位与 Teleport

1. 默认：角标作为 `.prd-anchor` 子元素，`position: absolute`。
2. 当祖先存在 `overflow: hidden` / `clip`：角标与浮窗均 `Teleport` 到 `document.body`，用 `getBoundingClientRect()` + `scrollX/scrollY` 计算 `fixed` 坐标。
3. 浮窗默认：角标左下角，偏移 `left = badgeRight - tooltipWidth`，`top = badgeBottom + 8px`。
4. 视口溢出：检测 `left/top/right/bottom`，翻转至角标另一侧。

## 多浮窗交互

| 行为 | 要求 |
|------|------|
| 打开 | 鼠标 `mouseenter` 角标 |
| 关闭 | 仅点击右上角 X |
| 唯一性 | 同一 `badgeId` 只保留一个 DOM 实例 |
| 并发 | 不同 `badgeId` 可同时打开 |
| 拖拽 | 标题栏 `mousedown` → `mousemove` 更新 `left/top` |
| 隔离 | 浮窗内 `@mousedown.stop` `@click.stop` `@wheel.stop` |

## prd.md 反向写入

- 在对应需求段落**起始处**插入编号标记：`[n]`（n 为 1–999）。
- 页面角标数字与文档 `[n]` 必须一致。
- Workflow B 删除需求时，同步删除文档中的 `[n]` 并重新核对连续性（是否重排由用户指令决定；默认保持原编号空洞，新增项用下一个可用号）。

示例：

```markdown
[3] ## 筛选区

- 支持按协议类型、状态查询...
```

## Vue 3 实现骨架（参考）

```vue
<template>
  <div ref="anchorRef" class="prd-anchor">
    <slot />
    <span
      v-if="useTeleport"
      class="prd-badge"
      :style="badgeStyle"
      @mouseenter="open"
    >{{ id }}</span>
    <span v-else class="prd-badge" @mouseenter="open">{{ id }}</span>
  </div>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="tipRef"
      class="prd-tooltip"
      :style="tipStyle"
      @mousedown.stop
      @click.stop
    >
      <button class="prd-tooltip__close" @click="close">×</button>
      <header><!-- 编号 + 需求描述 --></header>
      <div class="prd-tooltip__divider" />
      <div class="prd-tooltip__body" v-html="renderedMd" />
    </div>
  </Teleport>
</template>
```

Composable 建议导出：`registerAnchor(el, config)`、`openTooltip(id)`、`syncFromPrd(mdPath)`。

## 禁止项

- 不得用 `summary` 替代 PRD 原文
- 不得在同一模块挂多个角标
- Workflow B 不得改动颜色、尺寸、偏移、圆角等视觉参数
- 不得通过点击浮窗外区域或 Esc 关闭浮窗（仅 X）
