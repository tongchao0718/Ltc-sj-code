# ui-docs-reverse-sync 示例

## 示例 0：标准两阶段（人工触发）

**用户**：「回写文档 ai-smart-crm 客户列表页」

**Agent（preview）**：

1. 扫描 `/customer/list` → 差异：04 缺新筛选字段、03 M03 文案过时
2. 输出拟改清单；**不改文件**
3. 提示：「回复 **确认回写** 后落盘」

**用户**：「确认回写」

**Agent（apply）**：更新 04、映射表、03 §M03 → 报告 pass

---

## 示例 1：scoped — 改完列表页后回写

**用户**：「我刚改了 ai-smart-crm 的客户列表页筛选和表格列，帮我把相关文档同步一下。」

**Agent 动作**：

1. preview → 输出差异表 → 等确认
2. apply：更新 `04` 该页 §筛选区、§表格列、§四态
3. 更新映射表对应行
4. 更新 `03-PRD` Mxx 模块「（1）功能需求」3～5 条摘要
5. 若有 `PrdAnnotationAnchor id=5` → 委托 `prd-page-annotation` Workflow B
6. 落盘 `界面文档同步报告.md` → pass

## 示例 2：post-walkthrough — G2-A 反馈改 UI

**用户**：「走查意见已改完界面，回改 PRD 和 04。」

**Agent 动作**：

1. 模式 `post-walkthrough`；Read `19-G2-A` 待改项
2. 对照待改项逐项扫描 UI
3. 回写 04 + 03 草案 + 映射表；`00-项目记忆` 记「走查定稿：xxx」
4. **不**标 PRD 冻结；建议 PO 确认后再 `prd-design-generation` step4-freeze

## 示例 3：PRD 已冻结 + UI 漂移

**用户**：「步骤 5 联调改了表单校验，同步文档。」

**Agent 动作**：

1. infer → 步骤 5；PRD = 冻结版
2. 模式 `post-dev`；回写 04 + 应用操作说明书
3. 03-PRD 差异写入报告 §6「待变更评审」，**不**改正文
4. 建议 `ui-acceptance-review` regression

## 误触发（不应只用本 Skill）

| 用户说法 | 应走 |
|----------|------|
| 「初始化 PRD 标注」 | `prd-page-annotation` Workflow A |
| 「G2-A 走查辅助」 | `ui-acceptance-review` |
| 「从零写 04」 | `ui-generation` step3 |
| 「修订 SDD 接口字段」 | `sdd-generation` |

## 步末摘要样例

```markdown
## 界面文档回写摘要
- **app-code**：ai-smart-crm
- **模式**：scoped
- **platform_type**：web-admin
- **推断步骤**：3
- **PRD 状态**：草案
- **扫描范围**：/customer/list, CustomerListPage.vue
- **报告**：04-AI治理与审计/界面文档同步报告.md
- **已更新文档**：04-界面设计文档.md、页面-路由-接口-数据表映射表.md、03-PRD §M03
- **SDD 待办**：0 项
- **总评**：pass
- **建议下一步**：design-review-pre-g2a
```
