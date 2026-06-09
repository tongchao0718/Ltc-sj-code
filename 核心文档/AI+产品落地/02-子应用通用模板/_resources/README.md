# {app-code} 资源库

> **起步提示**（新子应用）
> - 对 Agent 说：**推进 {app-code}** — 总编排自动加载当前步骤 Skill
> - 步骤 3 前由 `sub-app-resources` 校验/补全本目录
> - 一任务一新对话；改界面时附带截图或浏览器页面上下文
> - AIEP 使用 Cursor/TRAE 订阅模型，**无需自选 LLM 型号**

> 本目录为子应用 **体验层可复用真值**（借鉴 Axhub Make resources 模式）。  
> 规范：`核心文档/AI+产品落地/01-AI全流程设计/子应用资源库规范.md`  
> 维护 Skill：`sub-app-resources`（`.cursor/skills/sub-app-resources/`）  
> 新人指引：`核心文档/框架核心文档/新手入门.md`

## 文件说明

| 文件 | 职责 |
|------|------|
| `theme.json` | 色板、间距、字号、圆角 token |
| `components-manifest.json` | 本应用组件清单与使用场景 |
| `mock-data/` | 步骤 3 演示数据（字段对齐 SDD） |

## 权威来源

- **platform_type**：`<填写：web-admin | web-marketing | web-mobile-h5 | …>`
- **设计规范**：`<填写规范文档路径>`
- **参考实现**：`<填写 demo 子应用，如 marketing-demo>`

## 更新记录

| 日期 | 版本 | 变更摘要 | 操作人 |
|------|------|----------|--------|
| YYYY-MM-DD | 1.0 | 脚手架初始化 | Agent |
