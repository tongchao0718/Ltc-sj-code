# 触发示例（ai-full-process-design）

## 用户怎么说 → Agent 做什么

| 用户输入 | Agent 动作 |
|----------|------------|
| 「用 AI+ 全流程推进 marketing-demo」 | 读本 Skill → `infer:process-step` → 输出状态块 → 加载当前步 Skill |
| 「marketing-demo 现在到哪一步了？」 | 仅跑 `infer:process-step --json` + 状态块 |
| 「新建子应用 ltc-crm，web-admin」 | 步骤 1 → `requirements-clarification` → 写 01 + platform_type |
| 「帮做界面，还没给客户确认」 | 推断步骤 3 → `ui-generation` step3 → U1～U6 检查表 |
| 「客户确认了界面，可以开发」 | 步骤 4 → 检查 19-G2-A 是否人工通过 → 否则 blocked |
| 「跑一下 G3 门禁」 | `validate:sdd --gate G3` + 解读 gate-report.json |
| 「Fast Track 立项」 | flow_type=fast_track → 步骤 2 用 15-SDD-Lite |

## 标准会话开场（Agent 输出）

```markdown
## 阶段门禁状态
- **子应用**：marketing-demo
- **platform_type**：web-marketing
- **flow_type**：standard
- **当前步骤**：5 — 开发测试
- **推断依据**：infer:process-step evidence…
- **Gate-2**：pass · **Gate-3**：pass
- **门禁总评**：pass
- **缺失项**：G2-G3关卡自动门禁检查.md
- **下一动作**：补齐步骤 5 文档 → coverage:acceptance
- **形态 Skill**：marketing-design-yxui
- **脚本结果**：infer exit 0 · G3 exit 0 · build exit 0
```

## 禁止示例

| 错误做法 | 正确做法 |
|----------|----------|
| 有 PRD 无界面 → 进步骤 4 | blocked，退回步骤 3 |
| Agent 在 19-G2-A 写「PO 通过」 | blocked，等人工签字 |
| 步骤 2 用 prd-design-generation 写 SDD | 用模板 07/11 + 20-G2-B |
| 跳过 infer:process-step 直接写代码 | 先推断 + 状态块 |

## 试跑命令（marketing-demo）

```bash
npm run infer:process-step -- --app marketing-demo
npm run validate:sdd -- --app marketing-demo --gate G3
npm run build:marketing-demo
```
