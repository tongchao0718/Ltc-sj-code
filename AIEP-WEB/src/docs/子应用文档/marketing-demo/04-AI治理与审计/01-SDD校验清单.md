# marketing-demo SDD 校验清单

## 一、基础信息

- 项目：AIEP-DEV
- 子应用：`marketing-demo`
- `sdd_id`：SDD-20260606-MD-001
- 版本：1.0.0
- 评审时间：2026-06-06

## 二、结构完整性

| 检查项 | 结果 | 备注 |
|--------|------|------|
| 元信息完整 | 通过 | SDD-v1.0.md §1 |
| 范围 in/out | 通过 | Demo 全量 MD-1~23 |
| 功能点 F-01~F-08 | 通过 | 与 PRD 模块对齐 |
| API 契约 API-01~11 | 通过 | mock/api.js 实现 |
| 状态机 SM-01~03 | 通过 | 协议/履约/查询 |
| GWT AT-01~08, AT-22 | 通过 | 验收脚本-GWT.md |
| 映射表 | 通过 | 29 页 + API 路径 |
| 主应用注册 | 通过 | subApps.js + isSubAppEmbedPath |
| 界面冻结 | 通过 | 04-界面设计 V1.1 G2-A |

## 三、机读校验

```bash
npm run validate:sub-app-registry -- --app marketing-demo
npm run validate:sdd -- --app marketing-demo --gate G2
```

## 四、放行结论

- **G2**：步骤4 界面确认后 SDD/映射表定稿 → **通过**
- **G3**：待 QA 执行 AT-01~08、AT-22 后正式放行
