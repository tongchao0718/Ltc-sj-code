# pack-sub-app 样例

## 标准打包

```bash
npm run pack:sub-app -- --app sample-app --json
```

## app-code ≠ folder

```bash
# 文档与 gate 用 ai-smart-crm；构建目录为 ai-smart-crm-admin
npm run pack:sub-app -- --app ai-smart-crm
npm run pack:sub-app -- --folder ai-smart-crm-admin --skip-registry
```

## 仅校验 dist（CI 已 build 过）

```bash
npm run pack:sub-app -- --app marketing-demo --skip-build
```

## build 失败时的 JSON（勿误读 P 项）

```json
{
  "all_pass": false,
  "steps": [
    { "name": "build:sample-app", "pass": false, "exit_code": 1 },
    {
      "name": "validate:sub-app-pack",
      "skipped": true,
      "reason": "build 失败，跳过产物校验（避免旧 dist 误判为 pass）"
    }
  ]
}
```

## blocked 场景

- `package.json` 无 `build:{folder}` → 先 `scaffold-sub-app`
- P8 fail：HTML 仍含 `type="module"` → 检查 vite `format: 'iife'` 与 `createSubAppCopyHtmlPlugin`
