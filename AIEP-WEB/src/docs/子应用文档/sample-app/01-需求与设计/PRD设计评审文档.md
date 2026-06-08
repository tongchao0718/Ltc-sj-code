# 示例应用（sample-app）PRD设计评审文档

> **Canonical**：`03-PRD设计评审文档.md`（推断脚本识别名）。本文件与之同步。

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | V1.0 |
| 文档状态 | **冻结版**（步骤4 G2-A · Fast Track 框架样例 2026-06-08） |
| 子应用 | sample-app |
| 主路由前缀 | /sample-app |

## 1. 模块编号清单（强制）

| 模块编号 | 模块名称 | 对应需求（编号/名称） | 页面标注 | 备注 |
|------|------|------|------|------|
| [1] M01 | 仪表盘工作台 | SA-1 / 仪表盘工作台 | WorkplacePage | 统计卡片与图表 |
| [2][3] M02 | 列表查询 | SA-2 / 列表查询 | SearchTablePage（筛选/列表） | 筛选、分页、排序 |
| [4] M03 | 表单提交 | SA-3 / 表单提交 | StepFormPage | 校验、提交、防重 |
| [5] M04 | 结果与异常 | SA-4 / 结果与异常页 | SuccessPage 等 | 结果反馈与回退 |
| [6] M05 | 构建发布 | SA-5 / 独立打包 | SampleApp 侧栏 | 构建验证与产物可访问 |

## 2. 评审会前检查清单

| 序号 | 检查项 | 责任角色 | 完成（Y/N） |
|------|------|------|------|
| 1 | 需求、产品、SDD 版本一致 | 产品 | N |
| 2 | 页面-路由-接口-数据表映射已更新 | 产研 | N |
| 3 | 模块编号与接口、物理模型已关联 | 研发 | N |
| 4 | 关键异常路径已定义 | 产研测 | N |

## 3. 页面-路由-接口-数据表映射（摘要）

| 模块编号 | 页面 | 路由 | 接口（建议） | 读写表 |
|------|------|------|------|------|
| M01 | WorkplacePage | /sample-app/dashboard/workplace | GET /api/dashboard/data | dashboard_metric_snapshot |
| M02 | SearchTablePage | /sample-app/list/search-table | GET /api/list/query | sample_list_item |
| M03 | StepFormPage | /sample-app/form/step | POST /api/form/submit | sample_form_record |
| M04 | Success/Error/403/404/500 | /sample-app/result/*, /sample-app/exception/* | GET /api/result/status | result_log |

## 4. 接口契约清单（摘要）

| 模块编号 | 接口 | 方法 | 关键入参 | 关键出参 | 错误码 |
|------|------|------|------|------|------|
| M01 | /api/dashboard/data | GET | dateRange | code/message/data/requestId | 400/500 |
| M02 | /api/list/query | GET | keyword,status,pageNo,pageSize | code/message/data/requestId | 400/500 |
| M03 | /api/form/submit | POST | formBody | code/message/data/requestId | 400/409/500 |

## 5. 评审结论

- 评审轮次：第1轮
- 评审结果：待评审
- 必改项：待评审后补充
