# 脚手架后检查单

## 代码侧

- [ ] `AIEP-WEB/src/apps/{folder}/main.js` 存在
- [ ] `AIEP-WEB/build/vite.{folder}.config.js` 存在
- [ ] `subApps.js` 含 `folder: '{folder}'`
- [ ] `router/index.js` 含 `path: '/{folder}'`
- [ ] `package.json` 含 `dev:{folder}`、`build:{folder}`

## 文档侧

- [ ] 四段目录已建（禁止根目录平铺）
- [ ] `gate-config.json` paths 与目录一致
- [ ] `00-项目记忆.md` 已初始化

## 命令

```bash
npm run validate:sub-app-registry -- --app {app-code}
npm run dev:{folder}
```

## 路径验证（可选）

- [ ] 已用 `references/project-verify-prompt.md` 让 Agent 确认仓库根或子应用路径
