---
name: scaffold-sub-app
description: >-
  步骤0子应用立项：npm run scaffold:sub-app 生成 apps/、四段文档骨架、subApps/router/build 登记，
  并 validate:sub-app-registry。Use for 新建子应用、立项、scaffold、脚手架、注册子应用、app-code 初始化。
compatibility: AIEP-DEV 仓库根；Node>=18；须已 npm install
metadata:
  aiep-step: "0"
  aiep-gate: none
---

# 子应用立项脚手架（步骤 0）

> **总编排**：`.cursor/skills/ai-full-process-design/SKILL.md`  
> **脚本真值**：`AIEP-WEB/scripts/scaffold-sub-app.mjs`  
> **接入规范**：`核心文档/框架核心文档/主应用子应用接入规范.md`  
> **检查单**：[references/post-scaffold-checklist.md](references/post-scaffold-checklist.md)  
> **路径验证 Prompt**：[references/project-verify-prompt.md](references/project-verify-prompt.md)  
> **新人 onboarding**：`核心文档/框架核心文档/新手入门.md`

## 何时启用

- 新建子应用（尚无 `src/apps/{folder}/`）
- 用户说「立项」「脚手架」「注册到主应用」
- `ai-full-process-design` 检测到无子应用目录且需从零开始

**完成后进入步骤 1**：`requirements-clarification`

## 必要输入

| 参数 | 说明 |
|------|------|
| `--name` / `--folder` | kebab-case，如 `power-sales` |
| `--title` | 应用中心展示名 |
| `--spec` | `arco`（web-admin）或 `marketing`（web-marketing） |
| `--app-code` | 可选；默认同 folder；须与后续 gate-config 一致 |
| `--desc` | 可选；应用中心描述 |

## 执行步骤

### 1. 运行脚手架（仓库根目录）

```bash
npm run scaffold:sub-app -- --name {folder} --title "{展示名}" --spec arco
# 营销域：
npm run scaffold:sub-app -- --name {folder} --title "{展示名}" --spec marketing
```

脚本自动创建：

- `AIEP-WEB/src/apps/{folder}/`（入口、布局、dashboard、`_resources/`）
- `AIEP-WEB/build/vite.{folder}.config.js`、`build/{folder}.html`
- `subApps.js`、`router/index.js` 登记
- 根 `package.json` 的 `dev:{folder}` / `build:{folder}`

### 2. 初始化四段文档目录（脚本不自动建文档，Agent 必做）

从 `核心文档/AI+产品落地/02-子应用通用模板/` 复制并改名：

```text
AIEP-WEB/src/docs/子应用文档/{app-code}/
├── 01-需求与设计/
├── 02-研发与测试/
├── 03-发布与复盘/
└── 04-AI治理与审计/
```

至少落盘：

- `04-AI治理与审计/gate-config.json`（自模板 `13-gate-config.json`）
- `04-AI治理与审计/00-项目记忆.md`（自 `00-项目记忆模板.md`）

规范：`.cursor/rules/sub-app-doc-structure.mdc`

### 3. 校验注册

```bash
npm run validate:sub-app-registry -- --app {app-code}
npm run dev:{folder}
npm run dev    # 主应用嵌入验证
```

### 4. 写入项目记忆

Read `project-memory` → 更新 `00-项目记忆.md`：`platform_type`（arco→web-admin，marketing→web-marketing）、`folder`、`app-code`。

### 5. 路径验证（建议发给用户的 Prompt）

脚手架完成后，将 [references/project-verify-prompt.md](references/project-verify-prompt.md) 中 **子应用立项后验证** 模板发给 Agent，确认目录无误再进入步骤 1。

> AIEP **不规定 LLM 型号**；Cursor / TRAE 订阅模型即可。

## spec 与形态 Skill

| --spec | platform_type | 后续自动加载形态 Skill |
|--------|---------------|------------------------|
| `arco` | `web-admin` | `arco-admin-design` |
| `marketing` | `web-marketing` | `marketing-design-yxui` |

## 阶段门禁

| 条件 | 结果 |
|------|------|
| scaffold 成功 + 四段目录 + gate-config + validate:sub-app-registry pass | **pass** → 步骤 1 |
| folder 已存在 | **fail** → 换名或手动接入 |
| 缺文档四段 | **blocked** → 先补目录 |

## Agent 规则

- **必须**先 scaffold 再写业务代码（禁止手搓 router/subApps 漏登记）
- `--app-code` 与文档目录名、gate-config 全程一致
- 不得跳过 `validate:sub-app-registry`

## 本章完成标准

- [ ] `validate:sub-app-registry` 通过
- [ ] 四段文档目录 + `gate-config.json` + `00-项目记忆.md` 已落盘
- [ ] 用户可选：已用路径验证 Prompt 确认 Agent 工作区正确

## 输出模板

```markdown
## 步骤 0 完成摘要
- **folder**：{folder} · **app-code**：{app-code}
- **platform_type**：web-admin | web-marketing
- **脚手架**：npm run scaffold:sub-app …
- **注册表**：validate:sub-app-registry exit {code}
- **路径验证**：可选 — 见 project-verify-prompt.md
- **建议下一步**：步骤 1 requirements-clarification
- **新人指引**：核心文档/框架核心文档/新手入门.md
```
