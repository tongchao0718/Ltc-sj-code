# sdd-generation 示例

## 标准路径（marketing-demo）

| 文件 | 路径 |
|------|------|
| SDD | `AIEP-WEB/src/docs/子应用文档/marketing-demo/01-需求与设计/SDD-v1.0.md` |
| JSON | 同目录 `SDD-v1.0.json` |
| G2-B | `20-G2-B技术补齐评审记录.md` |
| gate-config | `04-AI治理与审计/gate-config.json` |

## 命令

```bash
npm run infer:process-step -- --app marketing-demo --json
npm run validate:sdd -- --app marketing-demo --gate G2
```

## 常见 fail 与修复

| 脚本报错 | 修复 |
|----------|------|
| 缺 `app_code` | SDD JSON 与 gate-config 对齐 |
| API 无 acceptance_ref | features 与 api_contracts 补 AT 引用 |
| 路径不在 gate-config.paths | 按四段目录更新 paths |

## 误触发

用户说「写 PRD」在步骤 2 → 路由到 **禁止**；应写 SDD，PRD 在步骤 3 由 `prd-design-generation` 产出。
