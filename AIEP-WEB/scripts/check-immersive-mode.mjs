#!/usr/bin/env node
/**
 * 审查沉浸模式：在 headless 浏览器中验证主顶栏高度与嵌入态 class
 */
import { chromium } from 'playwright'

const BASE = process.env.AIEP_DEV_URL || 'http://localhost:5173'

async function readLayout(page) {
  return page.evaluate(() => {
    const container = document.querySelector('.app-container')
    const header = document.querySelector('.app-header')
    const main = document.querySelector('.app-main')
    const subScope =
      document.querySelector('.marketing-demo-scope') ||
      document.querySelector('.app-layout') ||
      document.querySelector('.ai-smart-crm-scope')

    const cs = (el) => (el ? getComputedStyle(el) : null)
    const rect = (el) => (el ? el.getBoundingClientRect() : null)

    return {
      path: location.pathname,
      containerClass: container?.className || '',
      headerClass: header?.className || '',
      mainClass: main?.className || '',
      hasEmbedControls: !!document.querySelector('.embed-controls'),
      hasEmbedModeBtn: !!document.querySelector('.embed-mode-btn'),
      headerHeight: rect(header)?.height ?? null,
      containerPaddingTop: cs(container)?.paddingTop ?? null,
      mainHeight: rect(main)?.height ?? null,
      subScopeHeight: rect(subScope)?.height ?? null,
      viewportHeight: window.innerHeight,
      localStorage: {
        mode: localStorage.getItem('aiep-embed-header-mode'),
        peek: localStorage.getItem('aiep-embed-header-peek')
      }
    }
  })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  const report = { base: BASE, checks: [] }

  const pass = (name, ok, detail) => {
    report.checks.push({ name, ok, detail })
    console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  try {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.evaluate(() => {
      localStorage.removeItem('aiep-embed-header-mode')
      localStorage.removeItem('aiep-embed-header-peek')
    })

    let layout = await readLayout(page)
    pass('首页非嵌入态', !layout.mainClass.includes('app-main--embed'), layout.mainClass)
    pass('首页顶栏 56px', layout.headerHeight === 56, `实际 ${layout.headerHeight}px`)

    await page.goto(`${BASE}/marketing-demo/dashboard`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForSelector('.marketing-demo-scope', { timeout: 10000 })
    layout = await readLayout(page)

    pass('子应用嵌入态', layout.mainClass.includes('app-main--embed'), layout.mainClass)
    pass('默认沉浸收缩 class', layout.headerClass.includes('app-header--immersive-collapsed'), layout.headerClass)
    pass('沉浸顶栏 32px', layout.headerHeight === 32, `实际 ${layout.headerHeight}px`)
    pass('容器 padding-top 32px', layout.containerPaddingTop === '32px', layout.containerPaddingTop)
    pass('显示嵌入控制按钮', layout.hasEmbedControls && layout.hasEmbedModeBtn, '')
    pass(
      '子应用占满剩余高度',
      layout.subScopeHeight != null && layout.subScopeHeight >= layout.viewportHeight - 40,
      `sub=${layout.subScopeHeight}px viewport=${layout.viewportHeight}px`
    )

    await page.click('.embed-toggle-btn')
    await page.waitForTimeout(250)
    layout = await readLayout(page)
    pass('点击展开后顶栏 56px', layout.headerHeight === 56, `实际 ${layout.headerHeight}px`)
    pass('展开后移除收缩 class', !layout.headerClass.includes('app-header--immersive-collapsed'), layout.headerClass)

    await page.click('.embed-mode-btn')
    await page.waitForTimeout(250)
    layout = await readLayout(page)
    pass('平台模式顶栏 56px', layout.headerHeight === 56, `实际 ${layout.headerHeight}px`)
    pass('平台模式 localStorage', layout.localStorage.mode === 'platform', JSON.stringify(layout.localStorage))

    await page.click('.embed-mode-btn')
    await page.waitForTimeout(250)
    layout = await readLayout(page)
    pass('切回沉浸模式收缩', layout.headerHeight === 32, `实际 ${layout.headerHeight}px`)

    await page.goto(`${BASE}/app-center`, { waitUntil: 'networkidle' })
    await page.goto(`${BASE}/marketing-demo/dashboard`, { waitUntil: 'networkidle' })
    await page.waitForSelector('.marketing-demo-scope')
    layout = await readLayout(page)
    pass('离开再进入子应用自动收缩', layout.headerHeight === 32, `实际 ${layout.headerHeight}px`)

    await page.click('.embed-toggle-btn')
    await page.goto(`${BASE}/app-center`, { waitUntil: 'networkidle' })
    await page.goto(`${BASE}/marketing-demo/dashboard`, { waitUntil: 'networkidle' })
    layout = await readLayout(page)
    pass(
      '展开后离开再进入会重置收缩（已知行为）',
      layout.headerHeight === 32,
      `实际 ${layout.headerHeight}px；localStorage.peek=${layout.localStorage.peek}`
    )

    await page.goto(`${BASE}/sample-app/dashboard/workplace`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForSelector('.app-layout', { timeout: 10000 })
    layout = await readLayout(page)
    pass('sample-app 同样嵌入沉浸', layout.headerHeight === 32 && layout.mainClass.includes('app-main--embed'), `header=${layout.headerHeight}px`)
  } catch (err) {
    report.error = String(err)
    console.error('审查失败:', err.message)
    await browser.close()
    process.exit(1)
  }

  await browser.close()

  const failed = report.checks.filter((c) => !c.ok)
  console.log('\n---')
  console.log(`合计 ${report.checks.length} 项，失败 ${failed.length} 项`)
  process.exit(failed.length ? 1 : 0)
}

main()
