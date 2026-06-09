---
name: release-deployment
description: >-
  步骤6发布上线：Gate-4 检查、子应用/主应用构建、发布记录单、回滚方案与追溯归档。
  输入为测试验收通过 + CI 结果。Use for 发布上线、Gate-4、发布记录、打包发布、回滚、步骤6。
---

# 发布上线（步骤 6）

> **总编排**：`.cursor/skills/ai-full-process-design/SKILL.md`  
> **门禁 Skill**：`ai-dev-stage-gate`（Gate-4）  
> **前置**：步骤 5 `test-validation` 结论 go/conditional go；Gate-2 + Gate-3 已 pass

## 必要输入

- `02-研发与测试/` 测试验收结论（`验收脚本-GWT.md` 执行证据、`G2-G3关卡自动门禁检查.md`）
- `03-发布与复盘/应用操作说明书.md`（或待同步更新）
- 子应用 `{folder}` 与 `package.json` 中 `build:{folder}` 脚本
- 可选：`npm test`、CI 工作流结果（`.github/workflows/sdd-gate.yml`）

## 必交付物

| 产物 | 路径 |
|------|------|
| 发布记录单 | `03-发布与复盘/发布记录单.md` |
| 应用操作说明书 | `03-发布与复盘/应用操作说明书.md`（发布前更新） |
| 构建产物 | `AIEP-WEB/dist/{folder}/`（子应用独立包） |
| 版本变更（可选） | 按 `10-版本变更记录模板.md` 留痕 |

发布记录单结构参考：`AIEP-WEB/src/docs/子应用文档/marketing-demo/03-发布与复盘/发布记录单.md`

## 发布前检查清单（Gate-4）

按顺序执行并记录结果：

| # | 检查项 | 命令 / 动作 |
|---|--------|-------------|
| 1 | Gate-2 + Gate-3 复检 | `npm run validate:sdd -- --app {app} --gate G2` 与 `--gate G3` |
| 2 | 注册表 | `npm run validate:sub-app-registry -- --app {app}` |
| 3 | 单元测试 | `npm test` |
| 4 | 子应用构建 | `npm run pack:sub-app -- --app {app}`（含产物 P1～P10；见 `pack-sub-app`） |
| 5 | 主应用构建（若嵌入） | `npm run build` |
| 6 | 产物可访问 | 检查 `dist/{folder}/index.html` 或独立静态打开 |
| 7 | 操作说明书 | 与本次发布功能一致 |
| 8 | 回滚方案 | 记录上一版本 commit / dist 备份 / tag |

任一项 fail → **不得**标发布通过；回退步骤 5 或修复后重跑。

## 执行步骤

1. 读 `infer:process-step` 确认当前为步骤 6 且无缺失项。
2. 跑 §发布前检查清单，终端保留 exit code。
3. 按 `核心文档/框架核心文档/子应用打包指南.md` 确认构建配置（`build/vite.{folder}.config.js`）。
4. 填写 `发布记录单.md`：版本号、构建命令、产物路径、检查表、回滚、放行人（**Agent 不得代签放行**）。
5. 同步 `应用操作说明书.md` 中与本次发布相关的操作路径。
6. 输出 Gate-4 状态块：`ai-dev-stage-gate` 格式，门禁总评 pass/fail/blocked。
7. 更新 `00-项目记忆.md`（发布版本、已知问题、下一迭代）。

## Web 子应用构建要点

- 独立包：`npm run pack:sub-app -- --app {app}`（含 P1～P10；见 `pack-sub-app` Skill）
- 排错 vite 可用裸 `build:{folder}`，但 Gate-4 第 4 项须 `pack:sub-app` all_pass
- 嵌入主应用：确认 `subApps.js`、`router/index.js`、`App.vue` 已登记
- 相对路径：子应用 build 使用相对资源路径，支持静态离线打开

## 回滚方案（必写）

发布记录单须包含：

- **触发条件**：P0 不可用、构建无法访问、数据错误
- **回滚动作**：恢复 dist / git checkout / 重新部署上一 tag
- **责任人**：研发或运维负责人
- **验证**：回滚后最小冒烟步骤

## 阶段门禁

| 条件 | 结果 |
|------|------|
| 检查清单全 pass + 发布记录落盘 | **pass** → 六步完成 |
| 测试/构建 fail | **fail** → 回步骤 5 |
| 缺 PO/运维放行签字 | **blocked** |

## Agent 规则

- 不得在无构建证据时写「发布通过」
- 不得跳过 `validate:sdd` 复检
- 原生端 / 后端独立部署：在发布记录单注明渠道与产物路径（本 Skill 默认 Web 子应用）

## 输出模板

```markdown
## 步骤 6 完成摘要
- **发布版本**：{version}
- **构建命令**：npm run pack:sub-app -- --app {app}
- **产物**：AIEP-WEB/dist/{folder}/
- **Gate-4 检查**：{n}/8 pass
- **发布记录**：03-发布与复盘/发布记录单.md
- **门禁总评**：pass / fail / blocked
- **回滚**：{摘要}
```
