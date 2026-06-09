---

name: pack-sub-app

description: >-

  子应用独立打包：validate:sub-app-registry → build:{folder} → validate:sub-app-pack P1-P10。

  步骤3 U5、步骤6 发布前、用户说打包/build 时自动启用。Use for 打包子应用、独立包、build、dist、

  pack:sub-app、U5可构建、静态部署、子应用打包指南。

compatibility: AIEP-DEV 仓库根；Node>=18；须已 npm install

metadata:

  aiep-step: gate

  aiep-gate: none

---



# 子应用打包（pack-sub-app）



> **总编排**：`.cursor/skills/ai-full-process-design/SKILL.md`  

> **脚本真值**：`AIEP-WEB/scripts/pack-sub-app.mjs` · `validate-sub-app-pack.mjs`  

> **规范**：`核心文档/框架核心文档/子应用打包指南.md`（§4.0 流程图）  

> **检查单**：[references/post-pack-checklist.md](references/post-pack-checklist.md)  

> **样例**：[examples.md](examples.md)  

> **立项对照**：`scaffold-sub-app`（步骤 0 创建 build 配置）



## 何时启用（自动 — 见 agent-skills-auto-exec）



- 用户执行或要求 **`npm run pack:sub-app`** / **`npm run build:{folder}`**

- 用户说「打包」「独立包」「dist」「静态部署」

- 步骤 3 **U5**、步骤 6 `release-deployment` 构建环节



**不用于**：主应用 `npm run build`（见 `主应用打包指南.md`）；**源码交接**（见 `export-import-sub-app` — 用户说「导出子应用」而非「打包」）

**与 export 区分**：用户说「打包子应用 / 静态页 / 给客户看演示」→ 本 Skill；「导出子应用（源码）/ 交给同事继续开发」→ `export-import-sub-app`。规范表见《子应用打包指南》§9.0.2。



## 一键命令（仓库根目录，优先于裸 build）



```bash

npm run pack:sub-app -- --app {app-code}

npm run pack:sub-app -- --folder {folder}



# 仅校验已有 dist（不重跑 vite）

npm run pack:sub-app -- --app {app-code} --skip-build



# 本地调试 vite 时跳过嵌入注册表

npm run pack:sub-app -- --app {app-code} --skip-registry



# 机读 JSON

npm run pack:sub-app -- --app {app-code} --json

```



`pack:sub-app` = 注册表校验 → `build:{folder}` → 产物 **P1～P10** 机读校验。  

**build 失败时跳过产物校验**，避免旧 `dist/` 误判为 pass（见打包指南 §4.0 流程图）。



## app-code 与 folder



通常一致；**不一致时**脚本从 `subApps.js` 解析 folder：



| 子应用 | app-code（`--app`、文档目录） | folder（`build:`、`dist/`） |

|--------|------------------------------|----------------------------|

| ai-smart-crm | `ai-smart-crm` | `ai-smart-crm-admin` |

| sample-app | `sample-app` | `sample-app` |



## 必要输入



| 项 | 说明 |

|----|------|

| `{folder}` | `subApps.js` 中 folder |

| `build/vite.{folder}.config.js` | `base: './'`、`createSubAppCopyHtmlPlugin('{folder}')`、IIFE |

| `build/{folder}.html` | Vite 入口 HTML |

| `build/start.html` | CDN/本地备选模板（插件复制到 dist） |

| 根 `package.json` | 含 `build:{folder}` |



## 执行步骤



### 1. 解析 folder



`--app {app-code}` → 读 `subApps.js` 得 folder；`--folder` 直接使用。



### 2. 注册表（`--skip-registry` 可跳过）



```bash

npm run validate:sub-app-registry -- --app {app-code}

```



### 3. 构建（`--skip-build` 可跳过）



```bash

npm run build:{folder}

```



失败 → **不跑**产物校验，直接 `fail`。



### 4. 产物校验 P1～P10



```bash

npm run validate:sub-app-pack -- --folder {folder} --json

```



**标准产物**：



```text

dist/{folder}/

├── {folder}.html

├── index.html

├── start.html

├── assets/main-*.js

└── （无 build/ 残留）

```



| # | 检查项 |

|---|--------|

| P1 | `dist/{folder}/` 存在 |

| P2 | `index.html` |

| P3 | `{folder}.html` |

| P4 | `assets/*.js` |

| P5 | 无残留 `build/` |

| P6 | `index.html` 与 `{folder}.html` 均为 `./assets/` |

| P7 | `start.html` + hash 后 `./assets/*.js` |

| P8 | 入口 HTML 为 IIFE `<script src="...">`，无 `type="module"` |

| P9 | 入口脚本在 `#app` 之后（禁止仅在 `<head>` 加载 IIFE，否则白屏） |

| P10 | `standaloneRoutes()` 独立路由 path 以 `/` 开头（禁止 `slice(1)`） |



插件：`build/sub-app-copy-html-plugin.mjs` → `createSubAppCopyHtmlPlugin('{folder}')`。

**白屏复盘（强制阅读）**：打包指南 **§5.4** — `marketing-demo` 曾出现 `index.html` 白屏：`Invalid path` + IIFE 在 head 提前执行。



### 5. 人工冒烟（建议）



- **必须**打开 `index.html` 冒烟（勿仅 `start.html`）；或 `npx serve AIEP-WEB/dist/{folder}`

- Hash 路由首页可达；`npm run dev` 验证嵌入 `/{folder}/...`



## 与六步关系



| 步骤 | 用法 |

|------|------|

| 3 界面生成 | **U5**：`pack:sub-app` all_pass |

| 6 发布上线 | `release-deployment` 构建环节 |



## 阶段门禁



| 条件 | 结果 |

|------|------|

| `pack:sub-app` all_pass | **pass** |

| build fail | **fail**（产物校验 skipped） |

| P1～P10 任一失败 | **fail** |

| 缺 `build:{folder}` | **blocked** → `scaffold-sub-app` |



## Agent 规则



- 打包优先 **`pack:sub-app`**，勿仅裸 `build` 并宣称 U5 通过

- build 失败时 **不得**引用上一次 dist 的 P 项作为本轮证据

- 不得将 pack pass 等同于 Gate-4 发布通过



## 输出模板



```markdown

## 子应用打包摘要

- **app-code / folder**：{app-code} / {folder}

- **命令**：npm run pack:sub-app -- --app {app-code}

- **注册表**：exit {code}（或 skipped）

- **构建**：build:{folder} — exit {code}（失败则产物校验 skipped）

- **产物校验 P1～P10**：pass / fail / skipped

- **产物路径**：AIEP-WEB/dist/{folder}/

- **结论**：pass / fail / blocked

```


