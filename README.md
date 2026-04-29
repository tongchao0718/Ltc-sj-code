# AIEP-DEV 应用系统工程

## 项目概述

AIEP-DEV 是一个前后端分层的应用系统工程，采用“根目录统一调度 + 子目录独立实现”的组织方式：

- `AIEP-WEB`：前端主工程（Vue 3 + Vite 6）
- `AIEP-SERVER`：后端服务工程（Express）
- 根目录：统一命令入口、版本与更新脚本入口

当前仓库内置一个可演示的子应用 `sample-app`，支持：

- 在主系统中作为路由子模块嵌入运行
- 以独立静态应用方式打包和部署

## 核心能力

- 多子应用架构，便于业务模块独立扩展
- 子应用独立打包部署，降低主系统耦合
- 支持本地静态打开（子应用构建使用相对路径）
- 前端具备国际化、状态管理与可视化能力
- 后端采用标准分层（Route / Controller / Service）

## 技术栈

### 前端

- Vue 3
- Vite 6
- Vue Router 4
- Pinia
- Vue I18n
- Arco Design Vue
- ECharts
- Axios
- Vitest

### 后端

- Node.js
- Express
- CORS / Helmet / Morgan / Body-Parser

## 环境要求

- Node.js >= 18
- npm >= 8
- Git

## 快速开始

### 1) 安装依赖

```bash
npm install
```

可选：一键安装前后端依赖

```bash
npm run install:all
```

### 2) 启动开发环境

启动前端主系统（默认端口 5173）：

```bash
npm run dev
```

启动 sample-app 独立开发模式（默认端口 5174）：

```bash
npm run dev:sample-app
```

启动后端服务（默认端口 3001）：

```bash
npm run server:dev
```

## 常用命令

### 前端

```bash
# 主系统开发 / 打包 / 预览
npm run dev
npm run build
npm run preview

# sample-app 独立开发 / 打包
npm run dev:sample-app
npm run build:sample-app

# 测试
npm run test
npm run test:watch
npm run test:coverage
```

### 后端

```bash
npm run server:install
npm run server:dev
npm run server:start
npm run server:test
```

### 更新相关

```bash
npm run update
npm run rollback
npm run create-update-package
```

## 工程目录结构

```text
AIEP-DEV/
├── AIEP-WEB/                       # 前端主工程
│   ├── build/                      # 子应用独立构建配置与入口 HTML
│   ├── public/                     # 前端静态资源
│   ├── src/
│   │   ├── apps/sample-app/        # 示例子应用（可嵌入/可独立）
│   │   ├── components/             # 主系统公共组件
│   │   ├── router/                 # 主系统路由
│   │   ├── store/                  # 主系统状态管理
│   │   ├── utils/                  # 主系统工具
│   │   ├── views/                  # 主系统页面
│   │   ├── main.js                 # 主系统入口
│   │   └── App.vue                 # 主系统根组件
│   ├── vite.config.js              # 前端主构建配置
│   └── vite.config.test.js         # 前端测试配置
├── AIEP-SERVER/                    # 后端服务工程
│   ├── src/main/                   # 主模块（users 等）
│   ├── src/apps/sample-app/        # 示例模块接口
│   └── app.js                      # 服务入口
├── package.json                    # 根目录统一脚本入口
├── package-lock.json
├── framework-baseline.json         # 基线信息
└── README.md
```

## 前端架构说明

### 主系统（AIEP-WEB/src）

- `main.js`：注册 Router、Pinia、i18n、Arco 等能力
- `router/index.js`：定义主页面路由与 `/sample-app` 嵌套路由
- `App.vue`：应用级导航与布局壳

### 子应用（AIEP-WEB/src/apps/sample-app）

- `main.js`：子应用独立入口，使用 Hash 路由便于静态部署
- `SampleApp.vue`：子应用布局骨架
- `views/`、`arco-pages/`：业务页面
- `api/`：请求封装与 mock fallback
- `store/`：子应用状态管理

## 后端架构说明

- 入口：`AIEP-SERVER/app.js`
- 路由层：`src/**/routes`
- 控制层：`src/**/controllers`
- 服务层：`src/**/services`

默认提供健康检查接口：

- `GET /health`

示例 API 前缀：

- `GET /api/users`
- `GET /api/sample`

## 打包与部署

### 主系统打包

```bash
npm run build
```

产物位于前端工程默认 `dist` 目录（在 `AIEP-WEB` 内）。

### 子应用打包

```bash
npm run build:sample-app
```

产物位于：

- `AIEP-WEB/dist/sample-app/`

可直接访问：

- `index.html`
- `sample-app.html`
- `start.html`

## 新增子应用（最小步骤）

1. 在 `AIEP-WEB/src/apps/` 下创建新子应用目录
2. 添加 `{AppName}.vue`、`main.js`、`views/`、`store/`、`api/` 等基础结构
3. 在 `AIEP-WEB/build/` 下新增对应 HTML 入口与 Vite 配置
4. 在根目录 `package.json` 增加 `dev:{app}` / `build:{app}` 脚本
5. 在 `AIEP-WEB/src/router/index.js` 增加嵌入路由
6. 在 `AIEP-WEB/src/views/AppCenter.vue` 增加应用入口卡片

## 常见问题

### 子应用静态打开空白

- 确认子应用构建 `base` 为 `./`
- 优先从 `start.html` 或 `index.html` 进入
- 检查浏览器控制台静态资源路径

### 联调时接口不通

- 确认后端已启动（`npm run server:dev`）
- 确认接口前缀与前端请求路径一致
- 检查 CORS 与端口配置

### 测试失败

- 先执行 `npm install`，必要时 `npm run install:all`
- 使用 `npm run test` 查看首个失败用例后定位

## 许可证

MIT
