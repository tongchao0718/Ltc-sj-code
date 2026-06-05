# AI 智能 CRM 管理 SDD 校验清单

## 一、基础信息

- 项目：AIEP-DEV
- 子应用：`ai-smart-crm`
- `sdd_id`：SDD-20260605-CRM-001
- 版本：1.0.0
- 评审时间：2026-06-05
- 评审人：AI产品组（待研发/测试会签）

## 二、结构完整性校验

| 检查项 | 结果 | 备注 |
|------|------|------|
| 元信息完整（sdd_id/version/owner/date） | 通过 | SDD-v1.0.md §1 |
| 技术与工程约束已填写 | 通过 | uni-app + Vue3 Arco + Express + MongoDB |
| 范围完整（in_scope/out_of_scope） | 通过 | 与需求说明书 V1.2 一致 |
| 角色权限定义完整 | 通过 | 5 角色 + data_scope |
| 用户故事地图完整 | 通过 | story_map 3 条 + 需求书 10 条 |
| 功能点清单完整且可追溯 | 通过 | F-01~F-21 |
| API 契约完整 | 通过 | 16 条 MVP API + 统一返回结构 |
| 数据模型完整 | 通过 | 13 核心集合，详见数据库设计文档 |
| 状态机完整 | 通过 | 6 页面状态机 |
| 异常策略完整 | 通过 | 断网/超时/401/403/AI 配额/导入错误 |
| GWT 验收脚本完整 | 通过 | AT-01~AT-22（含主应用嵌入 AT-22） |
| 主应用注册完整 | 通过 | `subApps.js` + `validate:sub-app-registry` |
| 风险与回滚策略完整 | 通过 | R-01~R-04 |
| SDD §8 无纯 UI 越界 | 通过 | UI 在 PRD/产品设计文档 |
| SDD md 与 json 关键字段一致 | 通过 | `npm run validate:sdd` G2 passed |

## 三、质量与一致性校验

| 检查项 | 结果 | 备注 |
|------|------|------|
| 无占位符（`<...>`、`TODO`） | 通过 | |
| 用户故事与 SA/F 映射一致 | 通过 | 见 PRD §3.0 |
| 验收标准与 AT 一致 | 通过 | 与验收脚本-GWT 同构 |
| 功能点与 API 映射一致 | 通过 | 见映射表 |
| 功能点与 AT 映射一致 | 通过 | acceptance_ref 已绑 |
| 与需求确认单一致 | 待签 | PO/TL 双签后更新 |
| 与版本变更记录一致 | 通过 | PRD/SDD V1.0 |

## 四、机读校验

```bash
npm run validate:sub-app-registry -- --app ai-smart-crm
npm run validate:sdd -- --app ai-smart-crm --gate G2
# 结果：passed（2026-06-05，含 require_main_app_registry）
```

## 五、放行结论

- 评审结论：**有条件通过**（待 PO/TL 双签需求确认单后正式 G2 放行）
- 不通过原因：—
- 整改责任人：—
- 整改截止时间：—
- 复审时间：双签后
