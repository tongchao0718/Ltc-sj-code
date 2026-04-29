<<<<<<< HEAD
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
=======
# 应用系统架构

## 重要提示

**团队复制同一套工程（推荐）**：优先使用 Git 克隆或 Release 代码包 + **`npm ci`**，详见 **`快速初始化.md`**（最轻路径）。用 Cursor、Trae 等工具时，请先读根目录 **`AGENTS.md`**。

**从零手写整套项目时**：再对照 **`创建指南.md`**（请先读其中 **§1.2 与仓库对齐** 及 **§4.2.3 路由**，避免旧示例）。

## 项目概述

应用系统是一个基于 Vue 3 的多子应用架构系统框架，旨在为企业级应用提供统一的管理平台，支持多个独立子应用的集成、管理和部署。

### 核心特性

- **多子应用架构**：支持多个独立子应用的集成和管理
- **独立部署**：每个子应用可以独立打包和部署，减少耦合
- **本地访问**：子应用支持本地直接打开 HTML 文件运行，无需服务器
- **灵活扩展**：支持快速添加新的子应用，满足业务需求的快速变化
- **标准化**：提供统一的开发规范和打包配置，确保开发效率和质量

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **路由**：Vue Router 4
- **样式**：原生 CSS + CSS 变量
- **部署**：静态文件部署

## 快速开始

### 环境要求

- **Node.js 18.0 或更高版本**（与 Vite 6 一致）
- npm 8.0 或更高版本
- Git
- VS Code 或其他代码编辑器

### 安装依赖
>>>>>>> ab89e351ee982cffc447ecf1f325a95bc4846f8c

```bash
npm install
```

<<<<<<< HEAD
可选：一键安装前后端依赖

```bash
npm run install:all
```

### 2) 启动开发环境

启动前端主系统（默认端口 5173）：
=======
### 启动开发服务器

#### 主系统
>>>>>>> ab89e351ee982cffc447ecf1f325a95bc4846f8c

```bash
npm run dev
```
<<<<<<< HEAD

启动 sample-app 独立开发模式（默认端口 5174）：
=======
访问地址：http://localhost:5173

#### 子应用1
>>>>>>> ab89e351ee982cffc447ecf1f325a95bc4846f8c

```bash
npm run dev:sample-app
```

<<<<<<< HEAD
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
=======
### 打包构建

#### 主系统
>>>>>>> ab89e351ee982cffc447ecf1f325a95bc4846f8c

```bash
npm run build
```

<<<<<<< HEAD
产物位于前端工程默认 `dist` 目录（在 `AIEP-WEB` 内）。

### 子应用打包
=======
#### 子应用1
>>>>>>> ab89e351ee982cffc447ecf1f325a95bc4846f8c

```bash
npm run build:sample-app
```

<<<<<<< HEAD
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
=======
## 项目结构

```
app-system/
├── src/
│   ├── apps/             # 子应用目录
│   │   └── sample-app/    # 示例应用
│   ├── views/            # 主系统视图
│   ├── router/           # 主系统路由
│   └── style.css         # 全局样式
├── build/                # 打包配置
│   ├── sample-app.html    # sample-app 独立入口
│   └── vite.sample-app.config.js # sample-app 打包配置
├── dist/                 # 打包输出
└── package.json          # 项目配置
```

## 文档

### 核心文档

- **产品设计文档**：详细的产品设计方案和架构说明
- **需求说明**：功能需求和非功能需求的详细说明
- **创建指南**：完整的项目创建步骤和配置说明
- **使用说明**：系统使用方法和开发流程

### 打包相关文档

- **打包说明**：详细的打包步骤和方法
- **打包指南**：给编译器的打包指南

## 子应用开发

### 添加新子应用

1. **创建目录结构**：
   ```bash
   mkdir -p src/apps/{app-name}/views
   ```

2. **创建核心文件**：
   - `src/apps/{app-name}/{AppName}.vue`
   - `src/apps/{app-name}/main.js`
   - `src/apps/{app-name}/views/Home.vue`

3. **创建打包配置**：
   - `build/{app-name}.html`
   - `build/vite.{app-name}.config.js`

4. **更新 package.json**：
   ```json
   {
     "scripts": {
       "build:{app-name}": "vite build --config build/vite.{app-name}.config.js",
       "dev:{app-name}": "vite --config build/vite.{app-name}.config.js"
     }
   }
   ```

5. **更新主路由**：在 `src/router/index.js` 中添加新子应用路由

6. **更新应用中心**：在 `src/views/AppCenter.vue` 中添加新子应用卡片

**命名规则**：
- 子应用文件夹名应使用语义化的英文名
- 采用kebab-case命名风格（小写字母和连字符）
- 避免使用数字编号（如app1、app2等）
- 示例：`sample-app`、`user-management`、`data-analysis`

## 部署方案

### 主系统部署

1. 打包主系统：`npm run build`
2. 将 `dist/` 目录部署到任何静态文件服务器
3. 通过服务器地址访问

### 子应用部署

1. 打包子应用：`npm run build:sample-app`
2. **部署选项**：
   - **独立部署**：将 `dist/sample-app/` 目录部署到服务器
   - **本地运行**：直接打开 `dist/sample-app/index.html` 文件
   - **集成部署**：作为主系统的一部分部署

## 常见问题

### 本地访问空白页面

- 检查浏览器控制台是否有错误信息
- 确认打包配置中使用了 `base: './'`
- 尝试使用 `start.html` 文件
- 或启动本地服务器访问

### 路由跳转问题

- 检查路由配置是否正确
- 确认使用了正确的路由模式（Hash 模式用于本地访问）
- 检查路由路径是否正确

### 资源加载失败

- 检查资源文件路径是否正确
- 确认打包配置中使用了相对路径
- 检查网络连接是否正常

## 浏览器兼容性

| 浏览器 | 版本 | 支持情况 |
|--------|------|----------|
| Chrome | 90+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| IE 11 | - | ❌ 不支持 |

## 贡献指南

1. Fork 本项目
2. 创建 feature 分支
3. 提交代码
4. 发起 Pull Request

## 许可证

MIT License

## 联系我们

如有任何问题或建议，欢迎联系我们。
>>>>>>> ab89e351ee982cffc447ecf1f325a95bc4846f8c
