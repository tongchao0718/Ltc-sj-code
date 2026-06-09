# 打包后检查单（post-pack）



> 机读：`npm run validate:sub-app-pack -- --folder {folder}`  

> 一键：`npm run pack:sub-app -- --app {app-code}`



## 自动（脚本 P1～P10）



- [ ] P1 `dist/{folder}/`

- [ ] P2 `index.html`

- [ ] P3 `{folder}.html`

- [ ] P4 `assets/*.js`

- [ ] P5 无 `dist/{folder}/build/`

- [ ] P6 `index.html` 与 `{folder}.html` 为 `./assets/`

- [ ] P7 `start.html` + hash `./assets/*.js`

- [ ] P8 入口 HTML 无 `type="module"`，为 IIFE script

- [ ] P9 入口脚本在 `<body>` 内、**#app 之后**（防 IIFE 提前执行白屏）

- [ ] P10 `standaloneRoutes()` 存在时 path 均以 `/` 开头（防 `Invalid path` 白屏）



## 配置



- [ ] `base: './'`

- [ ] `format: 'iife'`

- [ ] `createSubAppCopyHtmlPlugin('{folder}')`

- [ ] `build/start.html` 存在

- [ ] `main.js` 使用 `createWebHashHistory()`



## 嵌入（pack 默认含注册表）



- [ ] `validate:sub-app-registry` pass（或 `--skip-registry` 仅本地调试）

- [ ] `npm run dev` → `/{folder}/...`



## 冒烟



- [ ] **`index.html` 可打开**（勿仅测 `start.html`；二者加载顺序不同）

- [ ] 控制台无 assets 404、无 `Invalid path`

- [ ] 独立 Hash 首页（如 `#/dashboard`）有内容


