# 执行工作流（ai-full-process-design）

> Agent 按本文件 **顺序** 执行；速查见 [reference.md](reference.md)，示例见 [examples.md](examples.md)。

## 0. 启动清单（每次必做）

```bash
# 仓库根目录
npm run infer:process-step -- --app {app-code} --json
```

**新建子应用且无 `src/apps/{folder}/`**：先 Read **`scaffold-sub-app`** 并执行脚手架，再进入步骤 1。

1. 读 `{APP_DOCS_ROOT}` = `AIEP-WEB/src/docs/子应用文档/{app-code}/`
2. Read **`project-memory`** → `04-AI治理与审计/00-项目记忆.md`（缺失则 Workflow A 初始化）
3. 读 `01-需求说明书.md` → **platform_type**、**flow_type**；缺失 → `blocked`
4. 输出 [gates.md](gates.md) **阶段门禁状态块**（§9.1 模板）
5. 加载 **阶段 Skill** + **形态 Skill** + **工作流 Skill**（见 SKILL.md 表）
6. 用户指定目标步骤时：校验前置 Gate，不满足 → `blocked`

## 1. 步骤推断（§8.2）

| 条件 | 步骤 |
|------|------|
| 无 `src/apps/{folder}/` 且需新建 | **0**（scaffold-sub-app） |
| 无 01-需求说明书 | 1 |
| 无 17 双签 | 2 |
| 全量界面或 PRD/04 未齐 | 3 |
| 无 19-G2-A 通过 或 PRD 未冻结 | 4 |
| 无测试验收结论 | 5 |
| 无发布记录 | 6 |

**硬规则**：有 PRD 草案但界面未齐 → 仍在 **步骤 3**。

脚本真值：`npm run infer:process-step -- --app {app}`

## 2. 各步必交付与脚本

### 步骤 0 — 子应用立项

| 产物 | 路径 |
|------|------|
| 子应用源码 | `AIEP-WEB/src/apps/{folder}/` |
| 构建配置 | `AIEP-WEB/build/vite.{folder}.config.js` |
| 四段文档骨架 | `AIEP-WEB/src/docs/子应用文档/{app-code}/` |
| gate-config | `04-AI治理与审计/gate-config.json` |

**Skill**：Read **`scaffold-sub-app`**

```bash
npm run scaffold:sub-app -- --name {folder} --title "…" --spec arco|marketing
npm run validate:sub-app-registry -- --app {app-code}
```

---

### 步骤 1 — 需求生成

| 产物 | 路径 |
|------|------|
| 需求说明书 | `01-需求与设计/01-需求说明书.md` |

**必填元数据**：`platform_type`、`flow_type`

**形态 Skill**：按 platform_type 加载（见设计文档 §4.1.2）

---

### 步骤 2 — 需求确认 + SDD/G2-B

| 产物 | 路径 |
|------|------|
| 需求确认单 | `17-需求确认单.md`（PO+TL 双签） |
| SDD | `SDD-v*.md` + `SDD-v*.json` |
| G2-B | `20-G2-B技术补齐评审记录.md` |
| 校验清单 | `04-AI治理与审计/SDD校验清单.md` 或 `01-SDD校验清单.md` |

**Skill**：Read **`sdd-generation`**（standard / fast_track 分支）+ `requirements-clarification`（范围复核）

**禁止**：用 `prd-design-generation` 代替 SDD 模板 07/11。

```bash
npm run validate:sdd -- --app {app} --gate G2
```

Gate-1 + Gate-2 均 pass 才可进步骤 3。

---

### 步骤 3 — 界面生成（100% 可交互）

| 产物 | 路径 |
|------|------|
| 资源库 | `AIEP-WEB/src/apps/{app}/_resources/` |
| 全量原型代码 | `AIEP-WEB/src/apps/{app}/` |
| PRD 草案 | `03-PRD设计评审文档.md` |
| 界面设计 | `04-界面设计文档.md` |
| 产品设计 | `产品设计文档.md` |

**Skill 顺序**：

1. `sub-app-resources`（初始化或校验 `_resources/`）
2. `ui-generation`（**step3 模式**）
3. `prd-design-generation`（**step3-draft**，模板 03，非 SDD）
4. 可选：`prd-page-annotation`（原型即 PRD，标注反向同步 03-PRD）

**步骤 3→4 前置：U1～U6 全 ✅ + R1～R5 全 ✅ + 预审 pass**

| # | 检查项 |
|---|--------|
| R1 | `_resources/theme.json` 存在且 platform_type 一致 |
| R2 | `components-manifest.json` 覆盖 P0 组件 |
| R3 | Mock 可追溯至 `_resources/mock-data/` 或 `mock/` |
| R4 | `04-AI治理与审计/G2-A预审报告.md` 已落盘 |
| R5 | `00-项目记忆.md` 已更新 |

```bash
# 步骤 3 收尾（进入 4 前）
# Read design-review-pre-g2a → 产出 G2-A预审报告.md
```

| # | 检查项 |
|---|--------|
| U1 | 页面清单 100% 有路由（含主流程弹窗/抽屉） |
| U2 | 入口可达全部页面 |
| U3 | P0 主流程可演示 |
| U4 | 关键页四态（loading/empty/error） |
| U5 | `npm run pack:sub-app -- --app {app}` 通过（P1～P8） |
| U6 | 文档与代码一致 |

```bash
npm run pack:sub-app -- --app {app}
# 排错 vite 可用裸 build:{folder}，但 U5 须 pack:sub-app all_pass
```

---

### 步骤 4 — 界面确认（人工 G2-A）

| 产物 | 路径 |
|------|------|
| 预审报告 | `04-AI治理与审计/G2-A预审报告.md`（步骤 3 末已产出） |
| G2-A 举证 | `19-G2-A界面确认记录.md` |
| PRD 冻结 | `03-PRD` 标 **冻结版** |
| 映射表 | `页面-路由-接口-数据表映射表.md` |

**Skill**：`design-review-pre-g2a`（须已 pass）→ `ui-generation`（**step4 模式**）→ `prd-design-generation`（**step4-freeze**）→ `project-memory`（记录走查决策）

**Agent 规则**：
- 无 PO/客户「通过」→ **`blocked`**（不是 fail）
- **禁止** Agent 自行签字或标 PRD 冻结

```bash
npm run validate:sdd -- --app {app} --gate G3
```

---

### 步骤 5 — 开发测试

**入口复检**：Gate-2 + Gate-3 均已 pass。

| 产物 | 路径 |
|------|------|
| 详细设计 | `02-研发与测试/详细设计文档.md` |
| G3 任务表 | `14-G3开发任务拆解表.md` |
| 验收脚本 | `验收脚本-GWT.md` |
| 门禁检查 | `G2-G3关卡自动门禁检查.md` |

**Skill**：`code-development` +（SDD 声明真实 API 时）**`server-api-development`** + `test-validation`

```bash
npm run validate:sdd -- --app {app} --gate G2
npm run validate:sdd -- --app {app} --gate G3
npm run coverage:acceptance -- --app {app}
npm test
```

---

### 步骤 6 — 发布上线

| 产物 | 路径 |
|------|------|
| 发布记录 | `03-发布与复盘/发布记录单.md` |
| 操作说明 | `应用操作说明书.md` |

**Skill**：Read **`release-deployment`** → `ai-dev-stage-gate`（Gate-4）+ CI 全绿

## 3. platform_type → 形态 Skill

| platform_type | 形态 Skill |
|---------------|------------|
| web-admin | **`arco-admin-design`**（Arco + `系统设计规范.md`） |
| web-marketing | `marketing-design-yxui` |
| web-mobile-h5 | `ui-ux-pro-max`（推荐） |
| native-android | `mobile-android-design` |
| native-ios | `mobile-ios-design` |

路径：`.cursor/skills/{skill-name}/`

## 4. Fast Track

`flow_type=fast_track`：步骤 2 用 `15-SDD-Lite`；步骤 3/4 仍须全量界面 + G2-A。

## 5. 步骤完成输出

每步结束输出：
1. **阶段门禁状态块**（§9.1）
2. **步骤完成摘要**（§9.2）
3. 脚本命令与 exit code

仅 `pass` 时建议进入下一步（以用户指令为准）。

## 6. 试跑基准

`marketing-demo` @ 步骤 5（G2/G3 已通过，待发布记录）：

```bash
npm run infer:process-step -- --app marketing-demo
npm run validate:sdd -- --app marketing-demo --gate G3
npm run build:marketing-demo
```
