# AIEP-WEB 脚本

## 主应用子应用注册表

```bash
npm run validate:sub-app-registry
npm run validate:sub-app-registry -- --app ai-smart-crm
```

- 校验：`src/config/subApps.js` ↔ `router/index.js` ↔ `App.vue` 嵌入前缀 ↔ `AppCenter`/`Dashboard` 引用
- 规范：`核心文档/框架核心文档/主应用子应用接入规范.md`
- G2：当 `gate-config.g2_rules.require_main_app_registry: true` 时，`validate:sdd` 会自动调用

## SDD 门禁

```bash
# 仓库根目录
npm run validate:sdd -- --app sample-app --gate G2
npm run validate:sdd -- --app ai-smart-crm --gate G2
```

- 输入：`src/docs/子应用文档/<app>/04-AI治理与审计/gate-config.json`（或 `03-gate-config.json`）
- 输出：stdout JSON；若 `gate-config.pipeline.output_report` 已配置则写入 `gate-report.json`
- 契约：`核心文档/AI+产品落地/02-子应用通用模板/12-G2-G3自动门禁脚本契约模板.md`

## 验收覆盖矩阵

```bash
npm run coverage:acceptance -- --app sample-app
```

生成：`02-研发与测试/acceptance_coverage.csv`

## Schema

- `sdd.schema.json`：SDD JSON 结构参考（校验脚本当前为字段/映射逻辑校验，可后续接入 AJV）
