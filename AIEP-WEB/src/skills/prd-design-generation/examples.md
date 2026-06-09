# prd-design-generation 样例参照

## 落盘路径

```text
AIEP-WEB/src/docs/子应用文档/{app-code}/01-需求与设计/03-PRD设计评审文档.md
```

## standard 全量 — marketing-demo

| 项 | 内容 |
|----|------|
| 路径 | `子应用文档/marketing-demo/01-需求与设计/03-PRD设计评审文档.md` |
| flow_type | `standard` |
| 特点 | MD-1～23 全量；`文档状态` = **冻结版**；与 29 路由对齐 |
| 可借鉴 | 模块功能需求写法（M01～M06）、用户故事表（US-01～12） |
| 注意 | 章节编号与模板略有简化（缺 3.2 详述、六～八章）；**新子应用应严格按模板八章** |

## fast_track — sample-app

| 项 | 内容 |
|----|------|
| 路径 | `子应用文档/sample-app/01-需求与设计/03-PRD设计评审文档.md` |
| flow_type | `fast_track` |
| 特点 | 极简 PRD + 映射/契约摘要；配合 `15-SDD-Lite` |
| 可借鉴 | Fast Track 下 PRD 最小集：模块清单 + 映射摘要 + 评审结论 |

## step3-draft 文档信息示例

```markdown
| 文档状态 | 草案（步骤3，待 G2-A） |
| 关联文档 | `01-需求说明书.md`、`SDD-v1.0.md`、`SDD-v1.0.json`、`04-界面设计文档.md`（草案） |
```

## step4-freeze 文档信息示例

```markdown
| 文档状态 | **冻结版**（步骤4 PO 确认，YYYY-MM-DD） |
| 关联文档 | `01-需求说明书.md`、`SDD-v1.0`、`04-界面设计文档.md`（已冻结）、`页面-路由-接口-数据表映射表.md` |
```

## 8.2 接口契约正确写法

```markdown
| M01 | `/api/companies/query` | GET | 见 SDD-v1.0 §5.2 F-001 | 见 SDD JSON `apis[0]` |
```

**错误**：在 PRD 中展开 request/response 全字段（与 SDD 重复）。

## blocked 场景

- 用户说「先把 PRD 标冻结」但 `19-G2-A` 无 PO 通过 → **blocked**
- 步骤 2 用户说「写 SDD」却触发本 Skill → 改路由到 SDD 模板 07/11
