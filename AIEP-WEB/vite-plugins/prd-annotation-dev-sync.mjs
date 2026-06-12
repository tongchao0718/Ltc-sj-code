/**
 * 开发态：接收浏览器浮窗 overrides，写入 JSON 并合并到 annotations/*.js
 * 仅 dev server 启用，生产构建不包含
 */
import {
  applyPrdAnnotationOverrides,
  writeOverridesJson
} from '../scripts/prd-annotation-shared.mjs'

const API_PREFIX = '/__prd-annotation'

export function prdAnnotationDevSyncPlugin() {
  return {
    name: 'prd-annotation-dev-sync',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(API_PREFIX)) {
          return next()
        }

        if (req.method === 'POST' && req.url === `${API_PREFIX}/sync`) {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}')
              const app = payload.app || 'sample-app'
              const overrides = payload.overrides || {}
              if (!overrides || typeof overrides !== 'object') {
                throw new Error('overrides 须为对象')
              }
              const overridesPath = writeOverridesJson(app, overrides)
              const result = await applyPrdAnnotationOverrides(app)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  ok: true,
                  overridesPath,
                  annotationsPath: result.annotationsPath,
                  overrideKeys: result.overrideKeys,
                  annotationCount: result.annotationCount
                })
              )
            } catch (e) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: e.message }))
            }
          })
          return
        }

        next()
      })
    }
  }
}
