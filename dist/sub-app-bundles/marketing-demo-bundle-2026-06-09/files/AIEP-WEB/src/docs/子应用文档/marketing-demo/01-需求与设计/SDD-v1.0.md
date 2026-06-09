# 售电公司营销分析 Demo SDD（V1.0）

## 1. 文档元信息

- `sdd_id`: SDD-20260606-MD-001
- `version`: 1.0.0
- `owner`: AI产品组
- `date`: 2026-06-06
- `app_code`: marketing-demo
- `requirement_ref`: 《01-需求说明书》V1.1-demo
- `prd_ref`: 《03-PRD设计评审文档》V1.1 冻结版

### 1.1 技术与工程约束

| 项 | 取值 |
|----|------|
| `frontend_stack` | Vue 3 + Vue Router + 营销 YXUI 作用域 CSS |
| `data_layer` | `mock/api.js` + `marketingStore`（localStorage 持久化） |
| `charts` | ECharts |
| `architecture` | 纯前端 Demo；Mock 契约可替换为 REST |
| `package_layout` | `AIEP-WEB/src/apps/marketing-demo/` |

## 2. 业务范围

- `in_scope`: MD-1～MD-23 全量 Demo；29 页面；Mock 闭环 C1～C6；独立 build + 主应用嵌入
- `out_of_scope`: 生产外部系统对接、短信/OCR/移动端/工作流引擎
- `business_goal`: 售电公司营销分析全链路可演示、可验收、可替换接口
- `success_metrics`: MD 全量交付；AT 通过率 100%；首屏 ≤3s（Mock）

## 3. 角色与权限（Demo）

| 角色 | 可见范围 | 可执行动作 |
|------|----------|------------|
| 营销业务人员 | 查询/导出 | 九维查询、导出 |
| 数据分析人员 | 分析/画像/报告 | 看板钻取、标签、报告 |
| 协议管理员 | 协议模块 | 模板 CRUD、四环节审核 |
| 履约管理员 | 履约模块 | 临期配置、流程、评估 |
| 系统管理员 | 接入/治理 | 同步、治理配置 |

## 4. 功能点清单

| 功能ID | 名称 | 需求 | 优先级 | 验收 |
|--------|------|------|--------|------|
| F-01 | 数据接入 | MD-1 | P0 | AT-01, AT-02 |
| F-02 | 九维查询 | MD-2~10 | P0 | AT-03 |
| F-03 | 多维分析 | MD-11~15 | P0 | AT-04 |
| F-04 | 业务画像 | MD-16 | P0 | AT-05 |
| F-05 | 一键报告 | MD-17 | P0 | AT-06 |
| F-06 | 结算协议 | MD-18~20 | P0 | AT-07 |
| F-07 | 履约管控 | MD-21~23 | P0 | AT-08 |
| F-08 | 主应用接入 | 嵌入规范 | P0 | AT-22 |

## 5. API 契约（Mock）

详见 `SDD-v1.0.json` → `api_contracts`；实现文件 `src/apps/marketing-demo/mock/api.js`。

## 6. 状态机

| ID | 名称 | 说明 |
|----|------|------|
| SM-01 | agreement-lifecycle | 协议四环节 |
| SM-02 | performance-process | 履约五节点 |
| SM-03 | query-page | 查询页四态 |

## 7. 验收标准

| ID | 摘要 | 优先级 |
|----|------|--------|
| AT-01~AT-08 | 各模块 Mock 闭环 | P0 |
| AT-22 | 主应用嵌入 + 注册表校验 | P0 |

完整 GWT 见 `02-研发与测试/验收脚本-GWT.md`。

## 8. 变更记录

| 版本 | 日期 | 摘要 |
|------|------|------|
| V1.0 | 2026-06-06 | G2-B 定稿：步骤4 界面冻结后进入 G3 |
