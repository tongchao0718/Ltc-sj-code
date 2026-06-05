# AI 智能 CRM 管理 SDD（V1.0）

## 1. 文档元信息

- `sdd_id`: SDD-20260605-CRM-001
- `version`: 1.0.0
- `owner`: AI产品组
- `reviewer`: 研发负责人
- `date`: 2026-06-05
- `app_code`: ai-smart-crm
- `requirement_ref`: 《01-需求说明书》V1.2

### 1.1 技术与工程约束

| 项 | 取值 |
|----|------|
| `backend_stack` | Node.js 18+ + Express 4 + Mongoose 8 |
| `app_frontend_stack` | uni-app（Vue 3）+ uni-ui |
| `web_admin_stack` | Vue 3 + Vue Router + Pinia + Arco Design |
| `database` | MongoDB |
| `middleware` | Redis（缓存/限流，MVP 可选）；推送网关；AI 统一网关 |
| `architecture` | 前后端分离；APP/Web 共用 REST API；独立账号 JWT |
| `package_layout` | 后端 `AIEP-SERVER/src/apps/ai-smart-crm/{routes,controllers,services,models}`；Web `AIEP-WEB/src/apps/ai-smart-crm-admin/`；APP `AIEP-APP/ai-smart-crm/`（建议） |

## 2. 业务范围

- `in_scope`: APP 一线 CRM、AI 助手/建议/评分、推送、名片 OCR、Web 管理台、独立账号、双端打包（MVP）；合同/知识库/工单/预测（R1）
- `out_of_scope`: AIEP SSO、小程序、应用商店运营、财务 ERP、营销自动化全量
- `business_goal`: 双端协同的移动智能化 CRM，外勤作业 + 后台治理 + AI 增效
- `success_metrics`: APP 首屏≤2s、登录成功率≥99.5%、导入成功率≥98%、AI 建议采纳率≥30%、双端链路可追溯 100%

## 3. 角色与权限

| 角色 | 可见范围 | 可执行动作 | 限制 |
|------|----------|------------|------|
| 销售 | 本人数据 | 客户/线索/商机/跟进 CRUD；AI 助手 | 不可改系统配置 |
| 主管 | 本团队 | 以上 + 分配线索、团队简报 | 不可改全局配置 |
| 客服 | 授权客户 | 工单处理、客户查看 | 无商机金额编辑（可配置） |
| 管理员 | 全公司 | Web 配置、导入、用户管理 | — |
| 管理层 | 全公司 | 报表只读 | 无业务写入 |

`data_scope`: `SELF` | `TEAM` | `ALL`

## 4. 用户故事地图（落地版）

| 活动 | 任务 | 故事 | 需求 | 切片 | 验收 | 标准摘要 |
|------|------|------|------|------|------|----------|
| 每日开工 | 查看待办 | 外勤销售打开 APP 看待办 | SA-1 | MVP | AT-01 | 首页 KPI+待办可跳转 |
| 外勤跟进 | 电话后速记 | 2 步完成跟进 | SA-6 | MVP | AT-06 | 快速跟进保存成功 |
| 获客建档 | 扫名片 | OCR 生成线索 | SA-14 | MVP | AT-14 | 名片预填可保存 |
| 推进商机 | 改阶段 | 切换商机阶段 | SA-5 | MVP | AT-05 | 阶段变更+时间线 |
| AI 辅助 | 获取话术 | AI 推荐可复制 | SA-9 | MVP | AT-09 | 采纳留痕 |
| 智能跟进 | 推送建议 | 推送直达详情 | SA-10/17 | MVP | AT-10/17 | 深链可用 |
| 后台配置 | 维护规则 | Web 发布阶段配置 | SA-19 | MVP | AT-19 | APP 新商机阶段生效 |
| 账号开通 | 创建用户 | 管理员建号登录 APP | SA-20 | MVP | AT-20 | 权限隔离正确 |
| 批量治理 | 导入客户 | Web 导入+错误报告 | SA-19 | MVP | AT-19 | 行级错误可下载 |

## 5. 功能点清单

| 功能ID | 名称 | 功能需求 | 业务规则 | 优先级 | 验收 |
|--------|------|----------|----------|--------|------|
| F-01 | 销售工作台 | 聚合 KPI/待办/漏斗 | 按 data_scope 过滤 | P0 | AT-01 |
| F-02 | 客户管理 | 客户 CRUD+360° | 负责人必填；停用软删 | P0 | AT-02 |
| F-03 | 线索管理 | 线索 CRUD+公海+转化 | 公海规则 Web 配置 | P0 | AT-03 |
| F-04 | 联系人管理 | 联系人 CRUD | 主联系人唯一 | P0 | AT-04 |
| F-05 | 商机漏斗 | 列表/看板+阶段流转 | 阶段必填项校验 | P0 | AT-05 |
| F-06 | 活动跟进 | 活动记录+离线草稿 | 弱网本地队列同步 | P0 | AT-06 |
| F-07 | 合同回款 | 合同与回款登记 | R1 | P1 | AT-07 |
| F-08 | AI 画像评分 | 意向分+可解释 | AI 失败用缓存 | P0 | AT-08 |
| F-09 | AI 销售助手 | 话术/草稿生成 | 配额+敏感词 | P0 | AT-09 |
| F-10 | AI 跟进建议 | 建议推送与反馈 | 合并降噪 | P0 | AT-10 |
| F-11 | AI 销售预测 | 预测区间报表 | R1 | P1 | AT-11 |
| F-12 | AI 知识库 | 检索问答 | Web 维护 | P1 | AT-12 |
| F-13 | 服务工单 | 工单状态机 | R1 | P1 | AT-13 |
| F-14 | 移动数据采集 | OCR/通讯录/附件 | 去重校验 | P0 | AT-14 |
| F-15 | 报表简报 | 双端指标 | 口径统一 | P0 | AT-15 |
| F-16 | APP 设置 | 推送/离线/脱敏 | 本地+服务端 | P0 | AT-16 |
| F-17 | 消息推送 | 深链+回执 | 免打扰合并 | P0 | AT-17 |
| F-18 | APP 构建 | 双端安装包 | uni-app 工程 | P0 | AT-18 |
| F-19 | Web 管理台 | 配置/导入/报表 | 审计留痕 | P0 | AT-19 |
| F-20 | 独立账号认证 | 用户/角色/登录 | 独立 crm_user 域 | P0 | AT-20 |
| F-21 | Web 打包 | admin 子应用构建 | dist 产物 | P0 | AT-21 |

## 6. API 契约

**统一前缀**: `/api/ai-smart-crm`  
**统一返回**: `{ code, message, data, requestId }`；`code=0` 成功

### 6.1 认证（F-20）

| API ID | 路径 | 方法 | 请求 | 错误码 |
|--------|------|------|------|--------|
| API-A01 | `/auth/login` | POST | `account, password, clientType: app\|web` | 400/401/423 |
| API-A02 | `/auth/refresh` | POST | `refreshToken` | 401 |
| API-A03 | `/auth/logout` | POST | — | 401 |
| API-A04 | `/admin/users` | POST | `name, phone, roleIds, orgId, initialPassword` | 400/403 |

### 6.2 业务（MVP 摘要）

| API ID | 路径 | 方法 | 说明 |
|--------|------|------|------|
| API-01 | `/dashboard/summary` | GET | `dateRange, scope` → KPI+待办 |
| API-02 | `/customers` | GET/POST/PUT | 分页筛选/保存 |
| API-03 | `/customers/{id}` | GET | 360° 详情 |
| API-04 | `/leads` | GET/POST | 线索列表/创建 |
| API-05 | `/leads/{id}/claim` | POST | 公海领取 |
| API-06 | `/leads/{id}/convert` | POST | 转化 |
| API-07 | `/contacts` | GET/POST/PUT | 联系人 |
| API-08 | `/opportunities` | GET/POST/PUT | 商机 |
| API-09 | `/opportunities/{id}/stage` | PUT | `targetStage, reason?` |
| API-10 | `/activities` | GET/POST | 跟进记录 |
| API-11 | `/ai/scores/{customerId}` | GET | 画像评分 |
| API-12 | `/ai/assistant` | POST | `scene, contextId, prompt?` 流式 |
| API-13 | `/ai/suggestions` | GET/PUT | 列表/采纳忽略 |
| API-14 | `/ocr/business-card` | POST | `imageBase64` |
| API-15 | `/reports/brief` | GET | 简报 |
| API-16 | `/notifications/ack` | POST | 推送回执 |
| API-17 | `/admin/config/stages` | GET/PUT | 阶段配置发布 |
| API-18 | `/admin/config/pool` | GET/PUT | 公海规则 |
| API-19 | `/admin/import` | POST | `type, fileUrl` 异步 |
| API-20 | `/admin/import/{batchId}` | GET | 导入进度/错误 |
| API-21 | `/admin/dashboard` | GET | Web 仪表盘 |
| API-22 | `/admin/reports` | GET | 全量报表 |
| API-23 | `/admin/audit-logs` | GET | 审计 |

### 6.3 业务错误码（示例）

| code | 含义 |
|------|------|
| 1001 | 参数校验失败 |
| 1002 | 资源不存在 |
| 1003 | 状态不允许 |
| 1004 | 公海领取冲突 |
| 1005 | 主联系人冲突 |
| 1006 | AI 配额用尽 |
| 1007 | 导入行级错误（见 data.errors） |
| 1008 | 账号锁定 |

## 7. 数据模型

### 7.1 核心实体（MongoDB Collection）

| 实体 | 主键 | 核心字段 |
|------|------|----------|
| crm_user | user_id | account, password_hash, name, phone, role_ids[], org_id, status, settings |
| crm_organization | org_id | name, parent_id, path |
| crm_role | role_id | name, permissions[], data_scope |
| crm_customer | customer_id | name, type, industry, level, owner_id, tags[], status |
| crm_lead | lead_id | name, source, status, owner_id, score, pool_flag |
| crm_contact | contact_id | customer_id, name, phone, is_primary, decision_role |
| crm_opportunity | opportunity_id | customer_id, name, amount, stage_code, probability, owner_id, status |
| crm_activity | activity_id | customer_id, opportunity_id, type, content, next_follow_at |
| crm_ai_score | score_id | customer_id, score, level, factors[], scored_at |
| crm_ai_suggestion | suggestion_id | user_id, type, content, status, ref_type, ref_id |
| crm_ai_chat_log | log_id | user_id, scene, prompt_summary, adopted |
| crm_config_stage | config_id | stages[]{ code, name, order, color, required_fields } |
| crm_config_pool | config_id | reclaim_days, daily_limit, protect_days |
| crm_import_batch | batch_id | type, status, total, success, errors[] |
| crm_audit_log | log_id | operator_id, action, target, diff, created_at |
| crm_notification | notification_id | user_id, type, title, deeplink, read_at |

### 7.2 命名规则

- `table_naming`: 集合名 `crm_<entity>` snake_case
- `column_naming`: snake_case 字段
- `common_columns`: created_at, updated_at, created_by, updated_by
- `primary_key_rule`: `<entity>_id` 字符串 ObjectId 或 UUID

## 8. 页面交互与状态机（API 相关）

| 页面/接口 | 触发 | 状态流转 | 成功 | 失败 |
|-----------|------|----------|------|------|
| 首页 dashboard | onShow | idle→loading→success/empty/error | 渲染卡片 | 重试+缓存 |
| 客户列表 | 筛选/分页 | loading→success/empty | 列表更新 | Toast+保留筛选 |
| 商机改阶段 | PUT stage | submitting→success/error | 刷新详情 | 展示规则错误 |
| AI 助手 | POST assistant | idle→streaming→done/error | 可复制 | 停止+降级文案 |
| 导入批次 | POST import | pending→processing→done/fail | 进度条 | 下载错误行 |
| 登录 | POST login | submitting→success/error | 存 Token | 锁定提示 |

## 9. 异常处理策略

| 类型 | 触发 | 用户提示 | 系统动作 | 恢复 |
|------|------|----------|----------|------|
| 断网 | 无网络 | 网络不可用，已保存草稿 | 队列本地 | 恢复后同步 |
| 超时 | >10s | 请求超时 | 记日志 | 重试 |
| 401 | Token 失效 | 请重新登录 | 清 Token | 跳登录 |
| 403 | 无权限 | 无访问权限 | 拒绝 | 返回 |
| AI 限流 | 1006 | 今日 AI 次数已用完 | 拒绝 | 次日重置 |
| 导入失败 | 1007 | 部分行失败 | 写 batch errors | 下载修正 |

## 10. 验收脚本（GWT）

| ID | Given | When | Then | 优先级 |
|----|-------|------|------|--------|
| AT-01 | 销售已登录有商机 | 打开首页 | KPI 与待办渲染 | P0 |
| AT-02 | 销售权限 SELF | 查询客户 | 仅本人客户 | P0 |
| AT-03 | 公海有线索 | 领取 | 负责人更新+通知 | P0 |
| AT-04 | 客户有联系人 | 设新主联系人 | 唯一约束生效 | P0 |
| AT-05 | 商机在阶段 A | 改到 B | 时间线有记录 | P0 |
| AT-06 | 客户详情页 | 快速跟进提交 | 活动入库 | P0 |
| AT-08 | 客户有行为数据 | 查评分 | 分数+因子展示 | P0 |
| AT-09 | 客户详情 | 唤起 AI 助手 | 话术可复制+采纳记录 | P0 |
| AT-10 | 有停滞商机 | 查看建议 | 可采纳/忽略 | P0 |
| AT-14 | 清晰名片图 | OCR | 字段预填 | P0 |
| AT-17 | 有待跟进推送 | 点击通知 | 直达商机详情 | P0 |
| AT-18 | 执行 APP 构建 | 安装 | 核心页可访问 | P0 |
| AT-19 | 管理员上传模板 | 导入 | 成功/失败行报告 | P0 |
| AT-20 | 管理员建销售账号 | APP 登录 | 数据隔离正确 | P0 |
| AT-21 | build:ai-smart-crm-admin | 独立访问管理台 | 登录后仪表盘可用 | P0 |
| AT-22 | 主应用 dev + 注册表校验 | 应用中心或 `/ai-smart-crm-admin` | 嵌入布局正常；首页应用数=3 | P0 |

## 11. 风险与回滚

| 风险ID | 描述 | 等级 | 缓解 |
|--------|------|------|------|
| R-01 | 双端同期延期 | high | MVP 功能冻结；Web 先配置+账号 |
| R-02 | AI 网关不稳定 | medium | 缓存评分；助手降级 |
| R-03 | 推送通道差异 | medium | 抽象 PushAdapter |
| R-04 | 离线草稿冲突 | medium | 服务端优先+合并提示 |

- **回滚策略**: API 版本回退；Web 静态资源上一版本；APP 最低兼容版本强制升级
- **回滚耗时**: ≤30 分钟
- **触发条件**: P0 缺陷或登录/支付类故障

---

> 机读真值：`SDD-v1.0.json`；校验命令：`npm run validate:sdd -- --app ai-smart-crm --gate G2`
