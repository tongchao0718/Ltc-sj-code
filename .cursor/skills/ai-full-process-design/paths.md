# 落盘路径（ai-full-process-design）

## 文档根

`AIEP-WEB/src/docs/子应用文档/{app-code}/`

## 四段目录（强制）

```text
01-需求与设计/
02-研发与测试/
03-发布与复盘/
04-AI治理与审计/
```

## 按步骤最小文件

| 步骤 | 文件 |
|------|------|
| 1 | `01-需求与设计/01-需求说明书.md`（含 platform_type、flow_type） |
| 2 | `17-需求确认单.md`、`SDD-v*.md/json`、`20-G2-B技术补齐评审记录.md`、`04-AI治理与审计/SDD校验清单.md` |
| 3 | **全量可交互代码** + `03-PRD`（草案）、`04-界面设计文档.md`、`产品设计文档.md` |
| 4 | `19-G2-A界面确认记录.md`、`03-PRD`（冻结）、`页面-路由-接口-数据表映射表.md` |
| 5 | `详细设计文档.md`、`14-G3开发任务拆解表.md`、`验收脚本-GWT.md`、`G2-G3关卡自动门禁检查.md` |
| 6 | `03-发布与复盘/发布记录单.md`、`应用操作说明书.md` |

## 体验真值分工

- **评审主文档**：`03-PRD设计评审文档.md`
- **体验细节真值**：`04-界面设计文档.md` + 可交互原型
- **契约真值**：SDD（禁止在 04 重复 API 定义）

## 代码根（platform_type）

| 类型 | 路径 |
|------|------|
| web-* | `AIEP-WEB/src/apps/{app-code}/` |
| native-* | 需求说明书声明，如 `{app-code}-android/` |

## Skill 路径（唯一真值）

| 类型 | 路径 |
|------|------|
| 总编排 + 移动/域 | `.cursor/skills/` |
| 六步阶段 | `AIEP-WEB/src/skills/` |

`prd-page-annotation` 以 `.cursor/skills/prd-page-annotation/` 为准。

## gate-config

复制 `02-子应用通用模板/13-gate-config.json` → `04-AI治理与审计/gate-config.json`，校对 `paths`。
