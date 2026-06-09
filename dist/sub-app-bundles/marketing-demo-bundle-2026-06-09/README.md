# 营销系统 Demo（marketing-demo）子应用导出包

由 `npm run export:sub-app -- --app marketing-demo` 生成，用于无 Git / 离线交接。

## 接收方一键集成

1. 将整个 `marketing-demo-bundle-2026-06-09` 文件夹复制到 ltc-demo 仓库根目录同级或任意位置
2. 在 **ltc-demo 仓库根目录** 执行：

```bash
node marketing-demo-bundle-2026-06-09/integrate.mjs --yes
```

或（若已拉取最新框架）：

```bash
npm run import:sub-app -- --bundle marketing-demo-bundle-2026-06-09 --yes
```

3. 校验：

```bash
npm run validate:sub-app-registry
npm run dev:marketing-demo
```

## 包内容

| 路径 | 说明 |
|------|------|
| `files/` | 子应用源码、文档、vite 配置、HTML 入口 |
| `manifest.json` | 注册信息、npm scripts、文件清单 |
| `integration/router-block.js` | router/index.js 路由块 |
| `integrate.mjs` | 一键集成脚本 |

## 选项

`integrate.mjs --dry-run` 仅预览  
`integrate.mjs --yes` 确认写入  
`integrate.mjs --force` 覆盖已有同名子应用注册
