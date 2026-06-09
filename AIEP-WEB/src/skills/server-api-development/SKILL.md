---
name: server-api-development
description: >-
  步骤5后端：按 SDD API 契约在 AIEP-SERVER 实现 routes/controllers/services，
  统一 {code,message,data,requestId}，Mock 替换与 G2-B 边界对齐。Use for 后端、API、
  AIEP-SERVER、Express、接口实现、联调、server-api。
compatibility: AIEP-DEV；AIEP-SERVER/；Gate-2 已通过；Node>=18
metadata:
  aiep-step: "5"
  aiep-gate: G3
---

# 后端 API 实现（AIEP-SERVER · 步骤 5）

> **总编排**：`.cursor/skills/ai-full-process-design/SKILL.md`  
> **前端协作**：`code-development`（Mock → API 切换）  
> **契约真值**：`SDD-v*.md` + `SDD-v*.json` · **禁止**在 PRD/04 重复定义字段  
> **分层模板**：[references/layer-template.md](references/layer-template.md)

## 何时启用

- Gate-2 已通过，SDD § API 契约已定
- 步骤 5 需真实后端（非纯 Mock 前端 Demo）
- 用户要求「实现 API」「联调 AIEP-SERVER」

**纯 Mock 子应用**（如 marketing-demo）：可跳过本 Skill，在 SDD 声明 `mock/api.js` 即可。

## 必要输入

- `01-需求与设计/SDD-v*.json` → `api_contracts`
- `20-G2-B技术补齐评审记录.md`（后端边界、库表）
- 参考：`AIEP-SERVER/src/apps/sample-app/`

## 目录约定

```text
AIEP-SERVER/
├── app.js                          # 挂载 /api/{prefix}
└── src/apps/{module}/
    ├── routes/{module}Routes.js
    ├── controllers/{module}Controller.js
    └── services/{module}Service.js
```

`src/main/` 为平台级（users 等）；子应用模块放 `src/apps/{module}/`。

## 执行步骤

### 1. 从 SDD 提取 API 清单

每条 `api_contracts[]` 映射：

| SDD 字段 | 实现 |
|----------|------|
| `path` | Express route（注意 app.js 前缀，如 `/api/sample` + route `/`） |
| `method` | router.get/post/put/delete |
| `request` | controller 校验 + service 入参 |
| `response` | 统一结构（见下） |
| `acceptance_ref` | 对应 GWT / 测试 |

### 2. 实现三层（照 sample-app）

1. **routes**：仅路由表，引用 controller
2. **controllers**：HTTP 状态、参数提取、调用 service
3. **services**：业务逻辑、数据访问（可先内存/JSON，后接 DB）

### 3. 统一响应（SDD 强约束）

```javascript
// success
res.json({ code: 0, message: 'success', data: {...}, requestId: req.id || '' })
// fail
res.status(400).json({ code: 40001, message: '...', data: null, requestId: '' })
```

### 4. 注册到 app.js

```javascript
import fooRoutes from './src/apps/{module}/routes/fooRoutes.js';
app.use('/api/{prefix}', fooRoutes);
```

### 5. 前端 Mock 替换

在 `AIEP-WEB/src/apps/{folder}/api/` 或 store 中：

- 保留 Mock fallback 开关（dev 可切）
- 生产 build 走真实 `axios` baseURL（环境变量或 vite proxy）

### 6. 验证

```bash
npm run server:dev
npm run server:test          # 若有
curl http://localhost:3001/health
# 逐 API 冒烟 SDD 中 P0 路径
npm run validate:sdd -- --app {app-code} --gate G3
```

## 与 Gate 关系

| Gate | 后端要求 |
|------|----------|
| Gate-2 后 | 可开始契约对齐实现 |
| Gate-3 前 | API 与 SDD 一致，可供联调提测 |
| PRD 未冻结 | 不得对外发布联调版本 |

## 阶段门禁

- SDD API 与实现路径/字段一致
- P0 接口冒烟通过
- 前端 `code-development` 中 Mock 切换策略已文档化

## Agent 规则

- 不得擅自改 SDD 契约；变更须先改 SDD 再改代码
- 新子应用后端模块须同步 `app.js` import（无静默 404）
- 无 DB 时 service 层仍分离，便于后续接库

## 输出模板

```markdown
## 后端实现摘要
- **模块**：AIEP-SERVER/src/apps/{module}/
- **挂载前缀**：/api/{prefix}
- **已实现 API**：API-01 … API-N（对照 SDD）
- **前端切换**：{api 文件路径}
- **冒烟**：pass/fail
- **建议**：继续 test-validation / 前端联调
```
