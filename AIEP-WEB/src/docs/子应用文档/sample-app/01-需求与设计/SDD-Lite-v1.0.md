# sample-app SDD-Lite（Fast Track）

- `sdd_id`: SDD-20260604-SA-LITE-001
- `version`: 1.0.0
- `owner`: 产品经理
- `reviewer`: 研发负责人
- `date`: 2026-06-04
- `app_code`: sample-app
- `track`: fast

## 2. 业务范围

- `in_scope`: 列表页导出任务状态展示与轮询
- `out_of_scope`: 新建导出引擎、跨子应用权限改造

## 3. API 契约摘要

| API ID | 路径 | 方法 | 请求要点 | 响应要点 | 错误码 |
|------|------|------|------|------|------|
| API-L01 | /api/export/task/status | GET | taskId | code/message/data/requestId | 400/404/500 |

## 4. 数据模型摘要

| 实体 | 关键字段 | 说明 |
|------|------|------|
| export_task | task_id, status, progress | 与列表导出操作关联 |

## 5. 验收脚本（P0）

| 验收ID | Given | When | Then |
|------|------|------|------|
| AT-L01 | 用户已发起导出 | 打开任务状态区域 | 展示进度且完成后可下载或提示失败 |

## 6. 风险与回滚

- 回滚：关闭导出状态 UI，保留原列表导出入口
- 触发：接口超时率 >5% 持续 30 分钟
