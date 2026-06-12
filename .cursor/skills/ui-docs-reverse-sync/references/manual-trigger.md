# 人工触发话术（ui-docs-reverse-sync）

> 本 Skill **仅人工触发**，改 UI 后 Agent **不会**自动回写文档。

## 推荐流程

```text
改完界面
  → 用户：「回写文档 {app-code} {页面}」
  → Agent：preview（差异表 + 拟改清单，不改文件）
  → 用户：「确认回写」
  → Agent：apply（落盘 + 界面文档同步报告.md）
```

## 触发话术表

| 场景 | 说法 | 模式 |
|------|------|------|
| 改完单页 | 「回写文档 ai-smart-crm 客户列表页」 | scoped |
| 改完多页 | 「回写文档 ai-smart-crm，路由 /customer/list 和 /customer/detail」 | scoped |
| 全应用 | 「全量回写文档 sample-app」 | full |
| G2-A 走查后 | 「走查改完界面，回改 PRD 和 04，ai-smart-crm」 | post-walkthrough |
| 联调/步骤 5 | 「联调改完界面，同步文档 ai-smart-crm」 | post-dev |
| 只看差异 | 「预览文档差异 ai-smart-crm」 | preview-only |
| 确认落盘 | 「确认回写」 / 「执行落盘」 / 「apply」 | apply |
| 跳过预览 | 「直接回写文档 ai-smart-crm 客户列表，跳过预览」 | apply（须复述清单） |
| 取消 | 「取消回写」 | — |
| Cursor Skill | `/ui-docs-reverse-sync` + 上表任一句 | 同左 |

## 确认词（进入 apply 阶段）

以下任一即可：

- 确认回写
- 执行落盘
- apply
- 按清单落盘
- OK，可以改了

## 冻结 PRD 额外确认

PRD 已为「冻结版」且拟改 `03-PRD` 正文时，须额外说：

- 「已知待变更评审，确认回写」

否则 Agent 只更新 04 / 映射表，03 差异写入报告 §6。

## 与自动 Skill 的边界

| 情况 | 行为 |
|------|------|
| 用户只说「改一下列表页样式」 | **不**自动回写；改 UI 即可 |
| 用户说「改列表页并回写文档」 | 触发本 Skill preview |
| 用户说「界面改后同步文档」 | 触发本 Skill preview |
| Agent 改 UI 后 | **不得**擅自 apply；可提示「说『回写文档 {app}』开始 preview」 |

## 参数省略规则

| 省略项 | Agent 推断方式 |
|--------|----------------|
| app-code | 当前打开文件路径、`infer:process-step`、对话上下文 |
| 页面/路由 | git diff、`views/` 最近修改、用户选中文件 |
| 模式 | 关键词（全量/走查/联调）或默认 scoped |
