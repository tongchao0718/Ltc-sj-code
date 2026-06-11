---
name: export-import-sub-app
description: >-
  子应用一键导出/集成：export:sub-app 打源码交接包，import:sub-app 或 bundle/integrate.mjs 一键接入。
  无 Git、离线/U 盘交接、子应用移交、export/import 时自动启用。Use for 导出子应用、导入子应用、
  交接、handoff、bundle、integrate.mjs、无 Git 协作、子应用工程迁移。
compatibility: AIEP-DEV 仓库根；Node>=18；须已 npm install；导入方须含 export/import 脚本（或 bundle 内 integrate.mjs）
metadata:
  aiep-step: gate
  aiep-gate: none
---

# 子应用导出 / 集成（export-import-sub-app）

> **总编排**：`.cursor/skills/ai-full-process-design/SKILL.md`  
> **脚本真值**：`AIEP-WEB/scripts/export-sub-app.mjs` · `import-sub-app.mjs` · `sub-app-bundle-shared.mjs`  
> **规范**：`核心文档/框架核心文档/子应用打包指南.md` §9  
> **检查单**：[references/handoff-checklist.md](references/handoff-checklist.md)  
> **样例**：[examples.md](examples.md)  
> **对立 Skill**：`pack-sub-app`（打 **dist 静态包**，非源码交接）

## 何时启用（自动 — 见 agent-skills-auto-exec）

- 用户要求 **导出 / 导入 / 交接 / 移交** 子应用工程
- 自然语言示例：**「导出子应用 marketing-demo」**、**「导入子应用 marketing-demo」**、**「把 marketing-demo 打包交给同事（源码）」**
- 用户执行或要求 **`npm run export:sub-app`** / **`npm run import:sub-app`**
- 用户提到 **无 Git**、**U 盘**、**离线协作**、**bundle**、**integrate.mjs**
- 步骤 3～6 需将子应用交给另一同事或另一份 ltc-demo 仓库

**不用于**：

- 打可部署静态页 → `pack-sub-app`（`pack:sub-app`）
- 同步框架本身 → 离线更新包 `update.js`（见《更新分发方案》）
- 从零新建子应用 → `scaffold-sub-app`

## 自然语言怎么说（规范真值）

在 Cursor / TRAE **Agent 对话**中直接说即可，**无需** `/export-import-sub-app` 或手写 npm。

### 推荐说法

| 意图 | 示例 |
|------|------|
| 导出源码包 | 「导出子应用 marketing-demo」 |
| 导出（默认 zip） | 「导出子应用 marketing-demo」 |
| 仅目录 | 「导出子应用 marketing-demo，不要 zip」→ `--no-zip` |
| 导入 | 「导入子应用 marketing-demo」 |
| 指定 bundle | 「导入子应用 marketing-demo，bundle 在 D:/handoff/xxx」 |
| 源码交接 | 「把 marketing-demo 子应用交给同事（源码）」 |
| 预览 | 「预览导入 marketing-demo」 |

### 与 pack-sub-app / update.js 的区分

| 用户意图 | 走哪条 | 怎么说 |
|----------|--------|--------|
| 源码交接（继续开发） | **本 Skill** | 「**导出**子应用 xxx」 |
| 静态演示 / 部署 | `pack-sub-app` | 「**打包**子应用 xxx」「导出**静态页**」 |
| 框架升级 | `update.js` | 「**更新框架**」 |

**易混**：「导出给客户看演示」→ `pack-sub-app`，不是本 Skill。Agent 须在语境不清时先确认。

完整表见 `核心文档/框架核心文档/子应用打包指南.md` §9.0。

## 与 pack-sub-app 的区别

| 目的 | 命令 | 产物 |
|------|------|------|
| **交接源码**（对方继续开发） | `export:sub-app` → `import:sub-app` | `dist/sub-app-bundles/{app-code}-bundle-{日期}/` |
| **交接静态页**（只看效果） | `pack:sub-app` | `AIEP-WEB/dist/{folder}/` |
| **同步框架** | `update.js` | `ltc-demo-update-v*.*/` |

## 一键命令（仓库根目录）

### 导出方（A）

```bash
npm run export:sub-app -- --app {app-code}
npm run export:sub-app -- --app marketing-demo
npm run export:sub-app -- --app {app-code} --out dist/my-handoff
```

### 接收方（B）

```bash
# 预览
npm run import:sub-app -- --bundle path/to/{app-code}-bundle-{日期} --dry-run

# 确认写入
npm run import:sub-app -- --bundle path/to/{app-code}-bundle-{日期} --yes

# 覆盖已有同名注册
npm run import:sub-app -- --bundle path/to/bundle --yes --force
```

**U 盘 / 未更新框架时**（bundle 自带脚本）：

```bash
node path/to/{app-code}-bundle-{日期}/integrate.mjs --yes
```

## app-code 与 folder

与 `pack-sub-app` 相同：`--app {app-code}` 从 `subApps.js` 解析 `folder`；`app-code ≠ folder` 时以 registry 为准（如 `ai-smart-crm` → `ai-smart-crm-admin`）。

## 导出包结构

```text
dist/sub-app-bundles/{app-code}-bundle-{日期}/
├── files/
│   ├── AIEP-WEB/src/apps/{folder}/
│   ├── AIEP-WEB/src/docs/子应用文档/{app-code}/
│   ├── AIEP-WEB/build/vite.{folder}.config.js
│   ├── AIEP-WEB/build/{folder}.html
│   └── AIEP-SERVER/src/apps/{folder}/   # 若存在
├── manifest.json          # subAppEntry、routerPrefix、packageScripts、files 清单
├── integration/
│   └── router-block.js    # 从 router/index.js 提取的顶层路由块
├── integrate.mjs          # 接收方可独立运行
└── README.md
```

## 执行步骤

### 导出（A）

1. **前置**：子应用已完成 `scaffold-sub-app` 接入（`subApps.js` + `router/index.js` + `build:{folder}`）
2. **可选校验**：`npm run validate:sub-app-registry -- --app {app-code}`
3. **导出**：

```bash
npm run export:sub-app -- --app {app-code}
```

4. **交接**：将 bundle 的 `.zip`（默认）或文件夹交给 B；附带 `README.md` 内命令

**导出失败常见原因**：

- `subApps.js` 无该 app-code
- `router/index.js` 无对应 `routerPrefix` 路由块（未完成接入）
- `src/apps/{folder}/` 不存在

### 导入（B）

1. 将 bundle 放到任意路径
2. **预览**：`npm run import:sub-app -- --bundle {path} --dry-run`
3. **写入**：`npm run import:sub-app -- --bundle {path} --yes`
4. **校验**：

```bash
npm run validate:sub-app-registry
npm run dev:{folder}
npm run dev    # 主应用嵌入验证（可选）
```

导入脚本行为：

- **导入前**检测是否已有同名子应用（`subApps.js` / `router` / 源码目录 / npm scripts）
- 有冲突时：**不默认写入**；终端交互选择，或非交互时要求 `--force` / `--files-only`
- 复制 `files/` → 仓库对应路径
- 合并 `subApps.js`（冲突时须 `--force` 或交互选「覆盖全部」）
- 合并 `router/index.js`（同上）
- 合并根 `package.json` 的 `dev:{folder}` / `build:{folder}`（同上）
- 运行 `sub-app-registry-validate.mjs`（`--files-only` 时不合并注册表、不跑此校验）

**冲突处理：**

| 选择 / 参数 | 行为 |
|-------------|------|
| 交互选 1 / `--force` | 覆盖源码 + 注册表 + 路由 + scripts |
| 交互选 2 / `--files-only` | 仅覆盖 bundle 内源码文件，不改注册表 |
| 交互选 3 / 取消 | 不写入任何文件 |
| `--dry-run` | 仅报告冲突与计划步骤 |

## 阶段门禁

| 条件 | 结果 |
|------|------|
| 导出成功，bundle 含 manifest + files + router-block | **pass** |
| 导入后 `validate:sub-app-registry` pass | **pass** |
| 导入后 `dev:{folder}` 可启动 | **pass**（建议人工冒烟） |
| 导出时无 router 块 / 无 subApps 条目 | **blocked** → 先完成 `scaffold-sub-app` 或手动接入 |
| 导入方仓库过旧，缺 `import-sub-app.mjs` 且无 bundle `integrate.mjs` | **blocked** → 先 `update.js` 更新框架 |
| 同名子应用已存在且未指定处理方式 | **blocked** → 交互选择或 `--force` / `--files-only`；**不再**静默 partial 导入 |

## Agent 规则

- **导出前**确认用户要交 **源码** 还是 **静态 dist**；后者走 `pack-sub-app`
- **导入前**若检测到同名子应用，须让用户选择：**覆盖全部** / **仅更新源码** / **取消**；非交互场景用 `--force` 或 `--files-only`
- **导入前**先 `--dry-run` 或说明冲突与将 skip/merge 的行为
- 不得将 bundle 等同于 Gate 通过或 PRD 冻结
- 交接后提醒 B 更新 `00-项目记忆.md` 与 `gate-config.json`（若文档目录已包含则随包带入）
- Windows 路径在命令中用引号包裹；bundle 内 README 已含说明

## 输出模板

```markdown
## 子应用交接摘要

- **方向**：导出 / 导入
- **app-code / folder**：{app-code} / {folder}
- **命令**：npm run export:sub-app -- --app {app-code} 或 import:sub-app -- --bundle {path} --yes
- **Bundle 路径**：dist/sub-app-bundles/{app-code}-bundle-{日期}/
- **注册表**：validate:sub-app-registry — pass / fail
- **dev 冒烟**：dev:{folder} — 建议人工确认
- **结论**：pass / fail / blocked / partial
```
