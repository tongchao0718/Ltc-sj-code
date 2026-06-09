# export-import-sub-app 样例

## 标准导出（无 Git 交接）

```bash
npm run export:sub-app -- --app marketing-demo
# 产物：dist/sub-app-bundles/marketing-demo-bundle-{日期}/
```

带 zip（U 盘）：

```bash
npm run export:sub-app -- --app marketing-demo --zip
```

## 标准导入

```bash
npm run import:sub-app -- --bundle dist/sub-app-bundles/marketing-demo-bundle-2026-06-09 --dry-run
npm run import:sub-app -- --bundle dist/sub-app-bundles/marketing-demo-bundle-2026-06-09 --yes
npm run validate:sub-app-registry
npm run dev:marketing-demo
```

## app-code ≠ folder

```bash
npm run export:sub-app -- --app ai-smart-crm
# folder 为 ai-smart-crm-admin；bundle manifest 中 folder 字段为准
```

## 接收方仅有 bundle（框架未更新）

```bash
# 在 ltc-demo 根目录
node D:/handoff/marketing-demo-bundle-2026-06-09/integrate.mjs --yes
```

## 误用：应走 pack-sub-app

用户说「打包给客户看演示」→ **不要** export:sub-app：

```bash
npm run pack:sub-app -- --app marketing-demo
# 发 AIEP-WEB/dist/marketing-demo/
```

## partial 场景（同名已存在）

同仓库重复导入，subApps/router **skipped**，仅覆盖 files：

```
✓ subApps.js: skipped (subApps.js 已存在该 folder)
✓ router/index.js: skipped (router 已存在 /marketing-demo)
```

需覆盖注册时加 `--force`。

## blocked 场景

- 子应用未接入 router → 导出失败「未找到路由块」→ 先 `scaffold-sub-app` 或补 router
- 导入方无 `AIEP-WEB/scripts/import-sub-app.mjs` → 用 bundle 内 `integrate.mjs`，或先跑框架 `update.js`
