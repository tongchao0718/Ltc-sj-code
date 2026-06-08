#!/usr/bin/env node
/**
 * 子应用脚手架 — 生成标准目录并注册到主应用
 *
 * 用法:
 *   npm run scaffold:sub-app -- --name my-app --title "我的应用" --spec arco
 *   npm run scaffold:sub-app -- --name power-sales --title "售电系统" --spec marketing
 *
 * 参数:
 *   --name, --folder   目录名（kebab-case，必填）
 *   --title            展示名称（必填）
 *   --desc             应用中心描述
 *   --spec             marketing | arco（默认 arco）
 *   --app-code         SDD/gate 用 app_code（默认同 folder）
 *   --port             独立 dev 端口（默认 5180+hash）
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.join(__dirname, '..')
const WEB_SRC = path.join(WEB_ROOT, 'src')
const REPO_ROOT = path.join(WEB_ROOT, '..')

function parseArgs(argv) {
  const args = {
    folder: null,
    title: null,
    desc: '',
    spec: 'arco',
    appCode: null,
    port: null
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    if ((a === '--name' || a === '--folder') && argv[i + 1]) args.folder = next()
    else if (a === '--title' && argv[i + 1]) args.title = next()
    else if (a === '--desc' && argv[i + 1]) args.desc = next()
    else if (a === '--spec' && argv[i + 1]) args.spec = next()
    else if (a === '--app-code' && argv[i + 1]) args.appCode = next()
    else if (a === '--port' && argv[i + 1]) args.port = Number(next())
  }
  return args
}

function toPascalCase(str) {
  return str
    .split('-')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

function toCamelCase(str) {
  const p = toPascalCase(str)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function assertKebab(name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error(`folder 须为 kebab-case，收到: ${name}`)
  }
}

function writeFile(relPath, content) {
  const full = path.join(WEB_ROOT, relPath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
  console.log(`  ✓ ${relPath}`)
}

function appendSubAppEntry(entry) {
  const file = path.join(WEB_SRC, 'config/subApps.js')
  let text = fs.readFileSync(file, 'utf8')
  if (text.includes(`folder: '${entry.folder}'`) || text.includes(`folder: "${entry.folder}"`)) {
    throw new Error(`subApps.js 已存在 folder: ${entry.folder}`)
  }
  const block = `  {
    id: '${entry.id}',
    appCode: '${entry.appCode}',
    name: '${entry.title}',
    folder: '${entry.folder}',
    designSystem: '${entry.designSystem}',
    desc: '${entry.desc}',
    icon: '${entry.icon}',
    to: '/${entry.folder}/dashboard',
    tag: '界面设计中',
    tagClass: 'tag-warning',
    pageCount: 1
  }`
  const marker = 'export function routePrefixFromTo'
  const markerIdx = text.indexOf(marker)
  if (markerIdx === -1) {
    throw new Error('subApps.js 结构异常：未找到 routePrefixFromTo')
  }
  const closeIdx = text.lastIndexOf(']', markerIdx)
  if (closeIdx === -1) {
    throw new Error('subApps.js 结构异常：未找到 subApps 数组结束符')
  }
  text = `${text.slice(0, closeIdx)},\n${block}\n${text.slice(closeIdx)}`
  fs.writeFileSync(file, text)
  console.log('  ✓ src/config/subApps.js（新增条目）')
}

function appendRouterBlock(folder, pascal) {
  const file = path.join(WEB_SRC, 'router/index.js')
  let text = fs.readFileSync(file, 'utf8')
  if (text.includes(`path: '/${folder}'`)) {
    throw new Error(`router 已存在 /${folder}`)
  }
  const block = `  {
    path: '/${folder}',
    name: '${pascal}App',
    component: () => import('../apps/${folder}/${pascal}App.vue'),
    children: [
      { path: '', redirect: '/${folder}/dashboard' },
      {
        path: 'dashboard',
        name: '${pascal}Dashboard',
        component: () => import('../apps/${folder}/views/dashboard/DashboardPage.vue'),
        meta: { title: '工作台' }
      }
    ]
  }`
  const closeIdx = text.lastIndexOf(']')
  text = `${text.slice(0, closeIdx)},\n${block}\n${text.slice(closeIdx)}`
  fs.writeFileSync(file, text)
  console.log('  ✓ src/router/index.js（新增路由）')
}

function appendPackageScripts(folder) {
  const file = path.join(REPO_ROOT, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))
  const devKey = `dev:${folder}`
  const buildKey = `build:${folder}`
  if (pkg.scripts[devKey]) {
    console.log(`  · package.json 已有 ${devKey}，跳过`)
    return
  }
  pkg.scripts[devKey] = `cd AIEP-WEB && vite --config build/vite.${folder}.config.js`
  pkg.scripts[buildKey] = `cd AIEP-WEB && vite build --config build/vite.${folder}.config.js`
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`  ✓ package.json（${devKey} / ${buildKey}）`)
}

function specMeta(spec) {
  if (spec === 'marketing') {
    return {
      designSystem: 'marketing',
      icon: '⚡',
      specHint: '营销域：请对照 核心文档/框架核心文档/营销设计规范.md 与 marketing-demo 组件库扩展页面。'
    }
  }
  return {
    designSystem: 'arco',
    icon: '📋',
    specHint: '通用 B 端：请对照 核心文档/框架核心文档/系统设计规范.md 与 sample-app 扩展页面。'
  }
}

function generateAppFiles({ folder, title, spec, pascal, camel, port }) {
  const embedPrefix = `/${folder}`
  const isMarketing = spec === 'marketing'

  writeFile(
    `src/apps/${folder}/${pascal}App.vue`,
    `<template>
  <div class="${isMarketing ? 'marketing-demo-scope' : 'app-scope'} ${camel}-scope">
    <div class="${isMarketing ? 'md-shell' : 'app-layout'} ${camel}-layout">
      <aside class="${isMarketing ? 'md-sidebar' : 'app-sidebar'}" :class="{ '${isMarketing ? 'md-sidebar--collapsed' : 'app-sidebar--collapsed'}': sidebarCollapsed }" aria-label="${title}导航">
        <div class="${isMarketing ? 'md-topbar-brand' : 'sidebar-brand'}">
          <strong>${title}</strong>
          ${isMarketing ? '' : '<small>Web 管理台</small>'}
        </div>
        <nav class="${isMarketing ? '' : 'sidebar-nav'}">
          <router-link
            v-for="item in menuItems"
            :key="item.to"
            :to="\`\${base}\${item.to}\`"
            :class="isMarketing ? 'md-nav-link' : 'menu-link'"
            :active-class="isMarketing ? 'md-nav-link--active' : 'menu-link--active'"
            :title="sidebarCollapsed ? item.label : undefined"
          >
            <span v-if="isMarketing" class="md-nav-icon" aria-hidden="true">{{ item.icon }}</span>
            <span :class="isMarketing ? 'md-nav-text' : ''">{{ item.label }}</span>
          </router-link>
        </nav>
        <button type="button" class="${isMarketing ? 'md-layout-toggle' : 'sidebar-toggle'}" @click="toggleSidebar">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
      </aside>
      <main class="${isMarketing ? 'md-main' : 'app-content'}">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import './styles/${folder}.css'
import { use${pascal}Base } from './composables/use${pascal}Base.js'

const STORAGE_KEY = '${folder}-sidebar-collapsed'
const { base } = use${pascal}Base()
const sidebarCollapsed = ref(false)

const menuItems = [
  { to: '/dashboard', label: '工作台', icon: '🏠' }
]

onMounted(() => {
  try {
    sidebarCollapsed.value = localStorage.getItem(STORAGE_KEY) === 'true'
  } catch { /* ignore */ }
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  try {
    localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed.value))
  } catch { /* ignore */ }
}
</script>
`
  )

  writeFile(
    `src/apps/${folder}/composables/use${pascal}Base.js`,
    `import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const EMBED_PREFIX = '${embedPrefix}'

export function use${pascal}Base() {
  const route = useRoute()
  const router = useRouter()

  const base = computed(() => {
    const isStandalone =
      window.location.hash.startsWith('#/') || window.location.protocol === 'file:'
    return isStandalone ? '' : EMBED_PREFIX
  })

  const relPath = computed(() => {
    const p = route.path
    const b = base.value
    return b ? p.slice(b.length) || '/' : p
  })

  function appPath(sub) {
    const path = sub.startsWith('/') ? sub : \`/\${sub}\`
    return \`\${base.value}\${path}\`
  }

  function pushApp(sub) {
    return router.push(appPath(sub))
  }

  return { base, relPath, appPath, pushApp }
}
`
  )

  writeFile(
    `src/apps/${folder}/main.js`,
    `import { createApp } from 'vue'
import ${pascal}App from './${pascal}App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/dashboard',
      name: '${pascal}DashboardStandalone',
      component: () => import('./views/dashboard/DashboardPage.vue'),
      meta: { title: '工作台' }
    }
  ]
})

createApp(${pascal}App).use(router).mount('#app')
`
  )

  writeFile(
    `src/apps/${folder}/views/dashboard/DashboardPage.vue`,
    `<template>
  <div class="${camel}-page ${camel}-dashboard">
    <h1>${title}</h1>
    <p>子应用脚手架已就绪。请根据设计规范扩展菜单与页面。</p>
    <ul>
      <li>设计规范：{{ specLabel }}</li>
      <li>参考 Demo：{{ demoRef }}</li>
      <li>独立运行：<code>npm run dev:${folder}</code></li>
      <li>主应用嵌入：<code>/${folder}/dashboard</code></li>
    </ul>
  </div>
</template>

<script setup>
const specLabel = '${isMarketing ? '营销设计规范.md' : '系统设计规范.md'}'
const demoRef = '${isMarketing ? 'marketing-demo' : 'sample-app'}'
</script>
`
  )

  writeFile(
    `src/apps/${folder}/styles/${folder}.css`,
    isMarketing
      ? `@import '../marketing-demo/styles/marketing-demo.css';

.${camel}-scope {
  height: 100%;
  min-height: 0;
}

.${camel}-layout {
  display: flex;
  height: 100%;
  min-height: 0;
}

.${camel}-scope .md-sidebar {
  display: flex;
  flex-direction: column;
}

.${camel}-scope .md-layout-toggle {
  margin: 8px;
  border: 1px solid var(--yx-border);
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  padding: 6px;
}

.${camel}-dashboard {
  padding: 24px;
}
`
      : `.${camel}-scope {
  height: 100%;
  min-height: 0;
}

.${camel}-layout {
  display: flex;
  height: 100%;
  min-height: 0;
}

.${camel}-scope .app-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-2);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}

.${camel}-scope .app-sidebar--collapsed {
  width: 54px;
}

.${camel}-scope .sidebar-brand {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.${camel}-scope .sidebar-nav {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.${camel}-scope .menu-link {
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-button);
  color: var(--color-text-2);
  text-decoration: none;
}

.${camel}-scope .menu-link--active,
.${camel}-scope .menu-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.${camel}-scope .sidebar-toggle {
  margin: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-2);
  border-radius: var(--radius-button);
  cursor: pointer;
  padding: 6px;
}

.${camel}-scope .app-content {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

.${camel}-dashboard {
  padding: 24px;
}
`
  )

  writeFile(
    `build/${folder}.html`,
    `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/app-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="../src/apps/${folder}/main.js"></script>
  </body>
</html>
`
  )

  writeFile(
    `build/vite.${folder}.config.js`,
    `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const copyHtmlPlugin = () => ({
  name: 'copy-html-${folder}',
  closeBundle() {
    const distPath = resolve(__dirname, '../dist/${folder}')
    const buildPath = resolve(distPath, 'build')
    const writePair = (html) => {
      html = html.replace(/\\.\\.\\/assets\\//g, './assets/')
      fs.writeFileSync(resolve(distPath, '${folder}.html'), html)
      fs.writeFileSync(resolve(distPath, 'index.html'), html)
    }

    if (fs.existsSync(buildPath)) {
      const srcHtml = resolve(buildPath, '${folder}.html')
      if (fs.existsSync(srcHtml)) {
        writePair(fs.readFileSync(srcHtml, 'utf8'))
        fs.rmSync(buildPath, { recursive: true, force: true })
      }
    } else {
      const direct = resolve(distPath, '${folder}.html')
      if (fs.existsSync(direct)) writePair(fs.readFileSync(direct, 'utf8'))
    }
  }
})

export default defineConfig({
  plugins: [vue(), copyHtmlPlugin()],
  base: './',
  root: resolve(__dirname, '..'),
  build: {
    outDir: resolve(__dirname, '../dist/${folder}'),
    emptyOutDir: true,
    rollupOptions: {
      input: { main: resolve(__dirname, '${folder}.html') },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: { '@': resolve(__dirname, '../src') }
  },
  server: {
    port: ${port},
    open: '/build/${folder}.html'
  }
})
`
  )
}

function main() {
  const args = parseArgs(process.argv)
  if (!args.folder || !args.title) {
    console.error('用法: npm run scaffold:sub-app -- --name my-app --title "我的应用" [--spec arco|marketing]')
    process.exit(1)
  }

  assertKebab(args.folder)
  const spec = args.spec === 'marketing' ? 'marketing' : 'arco'
  const meta = specMeta(spec)
  const pascal = toPascalCase(args.folder)
  const camel = toCamelCase(args.folder)
  const appCode = args.appCode || args.folder
  const desc = args.desc || `${args.title} — 由脚手架生成，请按 ${meta.designSystem} 规范扩展。`
  const port = args.port || 5180 + (args.folder.length % 20)

  const appDir = path.join(WEB_SRC, 'apps', args.folder)
  if (fs.existsSync(appDir)) {
    console.error(`目录已存在: ${appDir}`)
    process.exit(1)
  }

  console.log(`\n脚手架：${args.title} (${args.folder}) · ${spec}\n`)

  generateAppFiles({ folder: args.folder, title: args.title, spec, pascal, camel, port })

  appendSubAppEntry({
    id: args.folder.replace(/-/g, '_'),
    appCode,
    title: args.title,
    folder: args.folder,
    designSystem: meta.designSystem,
    desc,
    icon: meta.icon
  })

  appendRouterBlock(args.folder, pascal)
  appendPackageScripts(args.folder)

  console.log('\n完成。后续步骤：')
  console.log(`  1. npm run validate:sub-app-registry -- --app ${appCode}`)
  console.log(`  2. npm run dev:${args.folder}   # 独立预览`)
  console.log('  3. npm run dev                  # 主应用嵌入验证')
  console.log(`  4. ${meta.specHint}`)
  console.log('')
}

main()
