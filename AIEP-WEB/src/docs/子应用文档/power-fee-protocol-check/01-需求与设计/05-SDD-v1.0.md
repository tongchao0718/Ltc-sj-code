# power-fee-protocol-check SDD（V2.0）

## 1. 文档元信息

- sdd_id: SDD-20260428-EPA-001
- version: 2.0.0
- owner: 产品经理
- reviewer: 研发负责人
- date: 2026-04-28
- app_code: power-fee-protocol-check

### 1.1 技术与工程约束

- backend: Java + SpringBoot
- frontend: React
- database: MySQL
- middleware: Redis、Kafka（按场景启用）
- architecture: 分层架构（controller/service/service.impl/repository/entity/dto/vo）
- code_style: 统一下划线字段命名与接口返回结构

## 2. 业务范围

- in_scope: 协议模板、样本标注、规则管理、任务策略、识别核查、信息提取、信息解析、结果校核、问题治理、任务监控、结果监控、能力优化、协同复核
- out_of_scope: 跨系统结算核心改造
- business_goal: 建立标准化、可配置、可追溯的协议核查与治理平台
- success_metrics: 识别成功率、规则命中率、异常闭环率、任务成功率

## 3. 角色与权限

| 角色 | 可见范围 | 可执行动作 | 限制 |
|------|------|------|------|
| 业务管理员 | 模板、规则、任务、看板 | 模板配置、规则发布、策略维护 | 不可修改系统审计日志 |
| 核查人员 | 任务与异常页面 | 发起任务、查看进度、处理异常 | 不可发布规则 |
| 模型运营人员 | 样本、优化模块 | 标注复核、样本扩充、迭代登记 | 不可删除历史任务 |
| 审计人员 | 全链路日志 | 查看审计记录、导出报告 | 只读权限 |

## 4. 用户故事地图（User Story Map）

| 用户活动 | 用户任务 | 用户故事 | 对应需求（编号/名称） | 发布切片 | 验收引用 | 验收标准（摘要） |
|------|------|------|------|------|------|------|
| 配置核查标准 | 维护模板、样本、规则 | 作为业务管理员，我希望统一核查模板与规则，以便标准化开展核查 | SA-1/SA-2/SA-3 | MVP | AT-01/AT-02/AT-03 | Given 已配置模板与规则前置条件，When 执行模板保存与规则发布，Then 模板字段生效且规则版本可追溯 |
| 执行核查任务 | 配置并执行策略任务 | 作为核查人员，我希望系统自动生成并执行任务，以便提高核查效率 | SA-4/SA-5/SA-6 | MVP | AT-04/AT-05/AT-06 | Given 已配置策略与增量提取规则，When 发起批量任务，Then 任务生成成功并展示进度/成功率 |
| 识别并校核 | 解析协议并进行完整性、准确性校核 | 作为质检人员，我希望识别结果能自动校核并可人工复核，以便保障质量 | SA-7/SA-8/SA-9 | MVP | AT-07/AT-08/AT-09 | Given 协议文件已解析，When 执行完整性与准确性校核，Then 生成字段级校核结论与问题记录 |
| 治理与监控 | 问题治理、任务监控、结果监控 | 作为管理人员，我希望异常可治理、过程可监控、结果可量化，以便闭环管理 | SA-10/SA-11/SA-12 | MVP | AT-10/AT-11/AT-12 | Given 异常问题已入库，When 自动生成工单并进入监控，Then 可查询治理进度并输出看板报表 |
| 持续优化 | 协同复核与识别优化迭代 | 作为模型运营人员，我希望持续优化识别能力，以便提升准确率与稳定性 | SA-13/SA-14 | R1 | AT-13/AT-14 | Given 收集到复核反馈与错误样本，When 执行优化迭代并验证，Then 关键识别指标提升且可回溯 |

## 5. 功能点

| 功能ID | 名称 | 对应模块 | 对应需求 |
|------|------|------|------|
| F-01 | 协议模板库管理 | M01 | SA-1 |
| F-02 | 协议样本标注管理 | M02 | SA-2 |
| F-03 | 核查规则管理 | M03 | SA-3 |
| F-04 | 核查任务策略管理 | M04 | SA-4 |
| F-05 | 协议识别核查执行 | M05 | SA-5 |
| F-06 | 协议信息提取引擎 | M06 | SA-6 |
| F-07 | 协议信息解析 | M07 | SA-7 |
| F-08 | 识别结果校核 | M08 | SA-8 |
| F-09 | 识别问题结果记录 | M09 | SA-9 |
| F-10 | 问题分析及治理 | M10 | SA-10 |
| F-11 | 核查任务监控 | M11 | SA-11 |
| F-12 | 核查结果监控 | M12 | SA-12 |
| F-13 | 协议识别能力优化 | M13 | SA-13 |
| F-14 | 协同复核 | M14 | SA-14 |

## 6. API契约（字段级摘要）

| API ID | 路径 | 方法 | 请求参数 | 响应结构 | 错误码 |
|------|------|------|------|------|------|
| API-01 | /api/protocol/template/list | GET | type,pageNo,pageSize | code,message,data,requestId | 400/500 |
| API-02 | /api/protocol/sample/annotate | POST | sampleId,annotationResult,operator | code,message,data,requestId | 400/500 |
| API-03 | /api/protocol/rule/publish | POST | ruleId,versionNo,changeNote | code,message,data,requestId | 400/409/500 |
| API-04 | /api/protocol/task/generate | POST | strategyId,unitCodes,sceneCode | code,message,data,requestId | 400/409/500 |
| API-05 | /api/protocol/issue/govern | POST | issueId,ticketAction,assignee | code,message,data,requestId | 400/500 |
| API-06 | /api/protocol/optimize/iterate | POST | feedbackId,sampleBatchId,modelVersion | code,message,data,requestId | 400/500 |
| API-07 | /api/protocol/parse/run | POST | fileId,protocolType | code,message,data,requestId | 400/500 |
| API-08 | /api/protocol/verify/run | POST | taskId,verifyMode | code,message,data,requestId | 400/500 |

### 6.1 统一返回结构（强约束）

- success: `code=0`，`message=success`，`data=object`，`requestId=string`
- fail: `code!=0`，`message=错误信息`，`data` 可为空，`requestId=string`
- 所有写接口必须返回统一结构，并记录 `requestId` 用于链路追踪

## 7. 数据模型（摘要）

| 实体 | 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|------|
| protocol_template | template_code | string | 是 | 唯一 | 模板编码 |
| protocol_sample | sample_id | string | 是 | 唯一 | 样本ID |
| protocol_rule | rule_code | string | 是 | 唯一 | 规则编码 |
| protocol_task | task_id | string | 是 | 唯一 | 任务ID |
| protocol_issue | issue_id | string | 是 | 唯一 | 异常ID |
| optimize_iteration | iteration_id | string | 是 | 唯一 | 迭代ID |

### 7.1 数据库生成与命名规则

- table_naming: 业务表按语义命名，必要时使用 `t_` 前缀保持一致性
- column_naming: 字段统一下划线命名（snake_case）
- common_columns: `created_at`、`updated_at`（必要时补充 `created_by`、`updated_by`）
- key_rule: 主键字段遵循“`表名_id`”命名规则，不使用通用 `id`

## 8. 页面交互与状态机

| 页面 | 触发动作 | 状态流转 | 成功反馈 | 失败反馈 |
|------|------|------|------|------|
| 模板库页面 | 新增/编辑模板 | loading->success/empty/error | 保存成功提示并刷新列表 | 显示错误并可重试 |
| 任务策略页面 | 发起批量核查 | loading->success/error | 显示任务数量、进度、成功率 | 显示失败原因并支持重试 |
| 异常治理页面 | 处理异常工单 | loading->success/error | 工单状态更新并记录日志 | 显示异常处理失败原因 |

## 9. 异常处理策略

| 异常类型 | 触发条件 | 用户提示 | 系统动作 | 恢复动作 |
|------|------|------|------|------|
| 超时 | 接口响应超时 | 请求超时，请重试 | 记录超时日志并告警 | 重试 |
| 断网 | 网络不可达 | 当前网络不可用 | 进入离线保护态 | 恢复网络后重试 |
| 4xx | 参数或权限错误 | 请求参数或权限异常 | 记录业务错误日志 | 修正参数后重试 |
| 5xx | 服务内部异常 | 系统繁忙，请稍后再试 | 记录系统异常并触发告警 | 重试/回滚 |

### 9.1 业务异常定义

- exception_name: `BusinessException`
- fields: `code`、`message`
- usage: 用于承载可预期业务错误（如规则冲突、状态非法、幂等冲突）

## 10. 验收脚本（摘要）

| 验收ID | Given | When | Then |
|------|------|------|------|
| AT-01 | 进入模板库 | 新增模板并保存 | 字段标准与基准库同步成功 |
| AT-02 | 存在非结构化样本 | 执行样本预处理和标注 | 样本状态可追踪且可回溯 |
| AT-03 | 配置规则 | 发布新版本规则 | 自动生成版本并记录修改信息 |
| AT-04 | 配置任务策略 | 批量发起任务 | 展示任务进度与识别成功率 |
| AT-05 | 发现异常 | 系统自动归类推送 | 工单生成并可跟踪闭环 |
| AT-06 | 识别错误反馈 | 完成人机复核和迭代 | 形成优化记录并更新规则 |
| AT-07 | 协议文件入库 | 执行文字/表格/签章解析 | 输出结构化字段结果 |
| AT-08 | 识别结果待校核 | 执行完整性与准确性校核 | 输出校核结论并落库 |
| AT-09 | 存在异常数据项 | 执行问题记录 | 异常问题完整留痕 |
| AT-10 | 异常问题待处理 | 自动分类并生成工单 | 工单推送责任单位并跟踪 |
| AT-11 | 批量任务执行中 | 查看任务监控 | 可查看日志、告警、效率指标 |
| AT-12 | 核查任务完成 | 查看结果监控 | 形成问题汇总、质效与治理看板 |
| AT-13 | 识别准确率下降 | 执行样本分析与迭代优化 | 优化后识别效果提升 |
| AT-14 | 业务反馈识别错误 | 发起协同复核与纠偏 | 形成错误样本并更新易错字库 |

### 10.1 测试生成规则

- unit_test: Service 层核心逻辑必须覆盖（正常、边界、异常分支）
- api_test: 每个 API 至少 1 条成功用例 + 1 条失败用例
- error_code_test: 对关键业务错误码执行断言校验（如幂等冲突、状态流转冲突）

## 11. 风险与回滚

| 风险ID | 风险描述 | 等级 | 缓解措施 | 责任人 |
|------|------|------|------|------|
| R-01 | OCR 识别波动导致异常暴增 | high | 人机复核兜底 + 样本扩充 | 模型运营负责人 |
| R-02 | 规则误配置导致误报 | medium | 规则发布前双人复核 + 灰度发布 | 规则管理员 |
| R-03 | 任务批量失败影响进度 | medium | 任务重试机制 + 告警升级 | 研发负责人 |

- 回滚策略：关键版本发布后若出现 P0/P1 问题，30 分钟内回滚至上一稳定版本。  
- 预计回滚耗时：30 分钟内完成。  
- 回滚触发条件：核心链路不可用、任务成功率持续低于阈值、异常工单积压超阈值。  
