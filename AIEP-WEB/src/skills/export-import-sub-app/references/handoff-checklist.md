# 子应用交接检查单（handoff）

> 导出：`npm run export:sub-app -- --app {app-code}`  
> 导入：`npm run import:sub-app -- --bundle {path} --yes`  
> 规范：`核心文档/框架核心文档/子应用打包指南.md` §9  
> **自然语言**：§9.0（对 Agent 怎么说、三种交接如何区分）

## Agent 自然语言（对同事怎么说）

无需 `/skill-name`。在 Agent 对话中：

| 意图 | 说法 |
|------|------|
| 导出源码 | 「导出子应用 {app-code}」 |
| 导出 zip | 「导出子应用 {app-code}，打成 zip」 |
| 导入 | 「导入子应用 {app-code}」 |
| 指定 bundle | 「导入子应用 {app-code}，bundle 在 {路径}」 |

**区分**：「打包子应用」= 静态 dist；「导出子应用（源码）」= 本检查单。详见打包指南 §9.0.2。

## 导出方（A）— 交接前

- [ ] 子应用已在 `subApps.js` 注册
- [ ] `router/index.js` 含顶层路由块（`/{folder}` 或 manifest 中 `routerPrefix`）
- [ ] `build/vite.{folder}.config.js`、`build/{folder}.html` 存在
- [ ] `npm run validate:sub-app-registry -- --app {app-code}` pass
- [ ] （建议）`npm run dev:{folder}` 本地冒烟
- [ ] `npm run export:sub-app -- --app {app-code}` 成功
- [ ] bundle 含 `manifest.json`、`files/`、`integration/router-block.js`、`integrate.mjs`、`README.md`
- [ ] 明确告知 B：交的是 **源码包** 还是 **静态 dist**（后者用 `pack:sub-app`）

## 接收方（B）— 集成后

- [ ] bundle 路径正确，`manifest.json` 可读
- [ ] （建议）`import:sub-app --dry-run` 预览
- [ ] `import:sub-app --yes` 或 `node bundle/integrate.mjs --yes` 完成
- [ ] `npm run validate:sub-app-registry` pass
- [ ] `npm run dev:{folder}` 独立运行正常
- [ ] `npm run dev` 主应用嵌入路由可达（可选）
- [ ] 阅读 `00-项目记忆.md`、确认 `gate-config.json` 与当前步骤一致
- [ ] 若需发布静态页，另跑 `npm run pack:sub-app -- --app {app-code}`

## 与框架更新的关系

| 场景 | 做法 |
|------|------|
| 只交子应用源码 | 本 Skill（export/import bundle） |
| 只交演示静态页 | `pack-sub-app` |
| B 的框架太旧 | 先 `update.js`，再 import bundle |
| A、B 都要最新框架 | 先发 `ltc-demo-update-*.zip`，再发 sub-app bundle |

## 选项速查

|  flag | 作用 |
|-------|------|
| `--zip`（export） | 额外生成 bundle.zip |
| `--out`（export） | 自定义输出目录 |
| `--dry-run`（import） | 检测冲突并预览计划，不写文件 |
| `--yes`（import / integrate.mjs） | 确认写入 |
| `--force`（import） | 覆盖已有 subApps / router / 源码 |
| `--files-only`（import） | 仅更新 bundle 源码，不改注册表 |
