# <子应用名称> SDD 模板（可机读版）

## 1. 文档元信息

- `sdd_id`:
- `version`:
- `owner`:
- `reviewer`:
- `date`:
- `app_code`: `<app-code>`

### 1.1 技术与工程约束（建议必填）

- `backend_stack`: `Java+SpringBoot` / `Python+FastAPI` / `Go`
- `frontend_stack`: `React` / `Vue`
- `database`: `MySQL` / `PostgreSQL`
- `middleware`: `Redis`、`Kafka`（按需）
- `architecture`: 分层架构
- `package_layout`: `controller/service/service.impl/repository/entity/dto/vo`

## 2. 业务范围

- `in_scope`:
- `out_of_scope`:
- `business_goal`:
- `success_metrics`:

## 3. 角色与权限

| 角色 | 可见范围 | 可执行动作 | 限制 |
|------|------|------|------|
|  |  |  |  |

## 4. 用户故事地图（User Story Map）

> 验收要求（强制）：每条用户故事需同时填写“验收引用”与“验收标准（摘要）”，并与第10章验收脚本保持一致。

| 用户活动（Activity） | 用户任务（Task） | 用户故事（Story） | 对应需求（需求编号/名称） | 发布切片（MVP/R1/R2） | 验收引用 | 验收标准（摘要） |
|------|------|------|------|------|------|------|
|  |  | 作为<角色>，我希望<目标>，以便<价值> | SA-1 / <需求名称> | MVP | AT-01 | Given<前置> When<动作> Then<可验证结果> |

## 5. 功能点清单

| 功能ID | 功能名称 | 优先级 | 前置条件 | 输出结果 | 验收引用 |
|------|------|------|------|------|------|
| F-01 |  | P0/P1/P2 |  |  | AT-01 |

## 6. API契约

| API ID | 路径 | 方法 | 请求参数 | 响应结构 | 错误码 |
|------|------|------|------|------|------|
| API-01 | `/api/...` | GET/POST/PUT/DELETE |  | `code/message/data/requestId` | 400/401/403/500 |

### 6.1 统一返回结构（强约束）

- `success`: `code=0`，`message=success`，`data=object`，`requestId=string`
- `fail`: `code!=0`，`message=错误信息`，`data`可为空，`requestId=string`
- 要求：所有接口必须返回统一结构，便于网关、日志、监控与测试统一处理

## 7. 数据模型

| 实体 | 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|------|
|  |  |  | 是/否 |  |  |

### 7.1 数据库生成与命名规则

- `table_naming`: 业务语义命名（必要时使用 `t_` 前缀）
- `column_naming`: 统一下划线命名（snake_case）
- `common_columns`: `created_at`、`updated_at`（按需加 `created_by`、`updated_by`）
- `primary_key_rule`: 主键字段命名使用“`表名_id`”，禁止通用 `id`

## 8. 页面交互与状态机

| 页面 | 触发动作 | 状态流转 | 成功反馈 | 失败反馈 |
|------|------|------|------|------|
|  |  | `loading->success/empty/error` |  |  |

## 9. 异常处理策略

| 异常类型 | 触发条件 | 用户提示 | 系统动作 | 恢复动作 |
|------|------|------|------|------|
| 超时 |  |  |  | 重试 |
| 断网 |  |  |  | 离线提示 |
| 4xx |  |  |  | 修正输入 |
| 5xx |  |  |  | 重试/回滚 |

### 9.1 业务异常定义

- `exception_name`: `BusinessException`
- `fields`: `code`、`message`
- 约束：业务可预期错误（参数、状态、幂等等）统一使用业务异常输出

## 10. 验收脚本（Given/When/Then）

| 验收ID | Given | When | Then | 优先级 |
|------|------|------|------|------|
| AT-01 |  |  |  | P0 |

### 10.1 测试生成规则

- `unit_test`: Service 层核心逻辑必须覆盖正常/边界/异常分支
- `api_test`: 每个 API 至少覆盖 1 条成功 + 1 条失败用例
- `error_code_assert`: 关键业务错误码必须断言

## 11. 风险与回滚

| 风险ID | 风险描述 | 等级 | 缓解措施 | 责任人 |
|------|------|------|------|------|
| R-01 |  | high/medium/low |  |  |

- 回滚策略：
- 预计回滚耗时：
- 回滚触发条件：
