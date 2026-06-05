## Summary

<!-- 简述变更；契约类改动须先更新 SDD/PRD -->

## SDD / PRD

- [ ] 非契约变更（文档/样式/注释等）
- [ ] 已更新 `SDD-v*.json`（及 `.md` 若双写）
- [ ] 已更新 `03-PRD` 或映射表（若涉及界面/联调）
- [ ] Fast Track 已附 `18-FastTrack登记单`

**SDD 引用（G3 建议填写）**：`SDD: <sdd_id>@<version>`

子应用：`<app-code>`

## 门禁（本地可跑）

```bash
npm run validate:sdd -- --app <app-code> --gate G2
```

## Test plan

- [ ] 自测通过
- [ ] 关键 GWT（AT-xx）已验证
