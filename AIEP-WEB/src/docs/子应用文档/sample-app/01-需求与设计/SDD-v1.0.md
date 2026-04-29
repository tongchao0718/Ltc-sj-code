# sample-app SDD（V1.0）

## 1. 文档元信息

- sdd_id: SDD-20260428-001
- version: 1.0.0
- owner: 产品经理
- reviewer: 研发负责人
- date: 2026-04-28
- app_code: sample-app

## 2. 业务范围

- in_scope: 仪表盘、列表查询、表单提交、结果异常、独立打包
- out_of_scope: 跨系统权限平台改造、复杂算法建模

## 3. 功能点清单

| 功能ID | 名称 | 优先级 | 对应需求 | 验收引用 |
|------|------|------|------|------|
| F-01 | 仪表盘数据展示 | P0 | SA-1 | AT-01 |
| F-02 | 列表筛选分页 | P0 | SA-2 | AT-02 |
| F-03 | 表单提交流程 | P0 | SA-3 | AT-03 |
| F-04 | 结果与异常反馈 | P1 | SA-4 | AT-04 |
| F-05 | 构建产物可访问 | P1 | SA-5 | AT-05 |

## 4. API契约（摘要）

| API ID | 路径 | 方法 | 请求 | 响应 |
|------|------|------|------|------|
| API-01 | /api/dashboard/data | GET | dateRange | code/message/data/requestId |
| API-02 | /api/list/query | GET | keyword,status,pageNo,pageSize | code/message/data/requestId |
| API-03 | /api/form/submit | POST | formBody | code/message/data/requestId |

## 5. 状态机

| 页面 | 状态 |
|------|------|
| WorkplacePage | loading/success/empty/error |
| SearchTablePage | loading/success/empty/error |
| StepFormPage | loading/success/error |

## 6. 异常策略

- timeout: 显示重试按钮
- network_offline: 显示离线提示
- 4xx: 显示可读错误并引导修正输入
- 5xx: 显示兜底提示并可重试

## 7. 验收脚本（GWT）

| 验收ID | Given | When | Then |
|------|------|------|------|
| AT-01 | 用户在工作台 | 页面加载完成 | 指标卡与图表成功渲染 |
| AT-02 | 用户在查询页 | 切换筛选条件 | 触发真实请求且分页重置到第一页 |
| AT-03 | 用户提交表单 | 接口返回失败 | 保留输入并展示可读错误 |

## 8. 回滚策略

- 发布后出现 P0/P1 问题时，30 分钟内回滚到上一个稳定版本。
