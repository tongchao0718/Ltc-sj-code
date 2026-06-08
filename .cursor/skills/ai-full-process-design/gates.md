# Gate 与脚本（ai-full-process-design）

> 完整工作流见 [workflow.md](workflow.md)

## 步骤推断

```bash
npm run infer:process-step -- --app {app-code} [--json]
```

## Gate 时间线（强制）

| Gate | 通过时机 | 最小产物 | 脚本 |
|------|----------|----------|------|
| Gate-1 | 步骤 2 结束 | 需求说明书 + 17-需求确认单 PO+TL 双签 + SDD 草案 | — |
| Gate-2 | 步骤 2 结束 | SDD 签署 + `20-G2-B` + SDD校验清单 | `npm run validate:sdd -- --app {app} --gate G2` |
| Gate-3 | 步骤 4 结束 | `19-G2-A` 人工通过 + PRD 冻结 + 映射表 | `npm run validate:sdd -- --app {app} --gate G3` |
| Gate-4 | 步骤 6 结束 | 测试验收 + CI 全绿 + 发布记录 | CI |

步骤 5 **入口**须复检 Gate-2 + Gate-3 均已 pass。

## 子门禁

- **G2-A** = Gate-3 界面确认（文件 `19-G2-A界面确认记录.md`）
- **G2-B** = Gate-2 技术补齐（文件 `20-G2-B技术补齐评审记录.md`）
- G2-A 或 G2-B 未 pass → 禁止 `code-development`（步骤 3 原型代码除外）

## 步骤 4 Agent 规则

- 无 PO/客户签字 → 门禁 **`blocked`**（不是 fail）
- **禁止** Agent 自行将 PRD 标为「冻结版」或 G2-A「通过」

## 红线

1. SDD 未签署 → 禁止全面开发与上线承诺  
2. PRD 未冻结 → 禁止联调提测  
3. 测试/CI/追溯链不完整 → 禁止发布  

## Web 附加（步骤 3）

```bash
npm run validate:sub-app-registry -- --app {app-code}
npm run build:{app-code}   # 须先在 package.json 注册
```

## 步骤 5

```bash
npm run validate:sdd -- --app {app-code} --gate G2
npm run validate:sdd -- --app {app-code} --gate G3
npm run coverage:acceptance -- --app {app-code}
```

命令均在**仓库根目录**执行。
