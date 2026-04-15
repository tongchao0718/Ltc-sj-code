# 应用系统架构

## 重要提示

**团队复制同一套工程（推荐）**：优先使用 Git 克隆或 Release 代码包 + **`npm install`**，详见 **`框架核心文档/安装指南.md`**（最轻路径）。

**从零手写整套项目时**：再对照 **`框架核心文档/创建指南.md`**。

## 项目概述

应用系统是一个基于 Vue 3 的多子应用架构系统框架，旨在为企业级应用提供统一的管理平台，支持多个独立子应用的集成、管理和部署。

### 核心特性

- **多子应用架构**：支持多个独立子应用的集成和管理
- **独立部署**：每个子应用可以独立打包和部署，减少耦合
- **本地访问**：子应用支持本地直接打开 HTML 文件运行，无需服务器
- **灵活扩展**：支持快速添加新的子应用，满足业务需求的快速变化
- **标准化**：提供统一的开发规范和打包配置，确保开发效率和质量
- **国际化支持**：集成 Vue I18n，支持多语言切换
- **状态管理**：使用 Pinia 进行状态管理
- **图表可视化**：集成 ECharts 提供数据可视化能力
- **UI 组件库**：集成 Arco Design Vue 组件库

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite 6
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **国际化**：Vue I18n
- **UI 组件库**：Arco Design Vue
- **图表库**：ECharts
- **HTTP 客户端**：Axios
- **样式**：原生 CSS + CSS 变量 + Less
- **测试**：Vitest
- **部署**：静态文件部署

## 快速开始

### 环境要求

- **Node.js 18.0 或更高版本**（与 Vite 6 一致）
- npm 8.0 或更高版本
- Git
- VS Code 或其他代码编辑器

### 安装依赖

```bash
npm install
# 或使用项目提供的安装脚本
node install-deps.js
```

### 启动开发服务器

#### 主系统

```bash
npm run dev
```
访问地址：http://localhost:5173

#### 子应用

```bash
npm run dev:sample-app
```

### 打包构建

#### 主系统

```bash
npm run build
```

#### 子应用

```bash
npm run build:sample-app
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 监视模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 项目结构

```
AIEP-DEV/
├── src/
│   ├── apps/             # 子应用目录
│   │   └── sample-app/    # 示例应用
│   │       ├── api/       # API 服务
│   │       ├── arco-pages/ # Arco Design 页面
│   │       ├── components/ # 组件
│   │       ├── hooks/      # 自定义钩子
│   │       ├── locales/    # 国际化文件
│   │       ├── store/      # 状态管理
│   │       ├── styles/     # 样式文件
│   │       ├── utils/      # 工具函数
│   │       ├── views/      # 页面视图
│   │       ├── SampleApp.vue # 应用入口组件
│   │       ├── i18n.js     # 国际化配置
│   │       └── main.js     # 应用入口文件
│   ├── components/        # 主系统组件
│   ├── router/           # 主系统路由
│   ├── utils/            # 主系统工具函数
│   ├── views/            # 主系统视图
│   ├── App.vue           # 主系统根组件
│   ├── main.js           # 主系统入口文件
│   └── style.css         # 全局样式
├── build/                # 打包配置
│   ├── sample-app.html    # sample-app 独立入口
│   ├── start.html         # 启动页面
│   └── vite.sample-app.config.js # sample-app 打包配置
├── docs/                 # 文档目录
│   ├── 子应用文档/         # 子应用相关文档
│   └── 系统文档/           # 系统相关文档
├── public/               # 静态资源
├── scripts/              # 脚本文件
│   ├── create-update-package.js # 创建更新包
│   ├── rollback.js       # 回滚脚本
│   └── update.js         # 更新脚本
├── skills/               # 技能目录
├── 框架核心文档/           # 核心文档
├── dist/                 # 打包输出
├── package.json          # 项目配置
└── vite.config.js        # Vite 配置
```

## 文档

### 核心文档

- **框架核心文档/**：包含系统架构、创建指南、安装指南等核心文档
  - `产品设计文档.md`：详细的产品设计方案和架构说明
  - `需求说明.md`：功能需求和非功能需求的详细说明
  - `创建指南.md`：完整的项目创建步骤和配置说明
  - `安装指南.md`：环境安装和依赖配置说明
  - `使用说明.md`：系统使用方法和开发流程
  - `主应用打包指南.md`：主应用打包配置和部署说明
  - `子应用打包指南.md`：子应用打包配置和部署说明

### 子应用文档

- **docs/子应用文档/**：包含子应用相关的设计和使用文档
  - `sample-app/`：示例应用的详细文档
  - `通用模板/`：子应用文档模板

### 系统文档

- **docs/系统文档/**：包含系统相关的技术文档
  - `接口文档.md`：API 接口说明
  - `数据库设计文档.md`：数据库设计说明
  - `详细设计文档.md`：系统详细设计说明

## 子应用开发

### 添加新子应用

1. **创建目录结构**：
   ```bash
   mkdir -p src/apps/{app-name}/{api,components,hooks,locales,store,styles,utils,views}
   ```

2. **创建核心文件**：
   - `src/apps/{app-name}/{AppName}.vue`：应用入口组件
   - `src/apps/{app-name}/main.js`：应用入口文件
   - `src/apps/{app-name}/i18n.js`：国际化配置（可选）

3. **创建打包配置**：
   - `build/{app-name}.html`：应用独立入口 HTML
   - `build/vite.{app-name}.config.js`：应用打包配置

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

## 系统更新

### 执行更新

```bash
npm run update
```

### 回滚更新

```bash
npm run rollback
```

### 创建更新包

```bash
npm run create-update-package
```

## 常见问题

### 本地访问空白页面

- 检查浏览器控制台是否有错误信息
- 确认打包配置中使用了 `base: './'`
- 尝试使用 `build/start.html` 文件
- 或启动本地服务器访问

### 路由跳转问题

- 检查路由配置是否正确
- 确认使用了正确的路由模式（Hash 模式用于本地访问）
- 检查路由路径是否正确

### 资源加载失败

- 检查资源文件路径是否正确
- 确认打包配置中使用了相对路径
- 检查网络连接是否正常

### 测试失败

- 检查测试用例是否正确
- 确认依赖是否安装完整
- 查看测试错误信息并修复

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
