# 项目路径验证 Prompt

> 步骤 0 脚手架完成后，或新人首次打开仓库时使用。  
> **不含 LLM 型号要求** — AIEP 使用 Cursor / TRAE 订阅模型即可。

## 仓库根目录验证

将 `{repo-root}` 替换为实际绝对路径（或让 Agent 自行识别）：

```text
请帮我确认：你现在打开的项目，是不是 AIEP-DEV 仓库根目录（应包含根 package.json、AIEP-WEB/、核心文档/）。

不要修改任何文件，只检查目录结构。

若已在正确仓库，请只回复：已打开正确项目

若不是，请说明当前目录并提醒我在仓库根重新打开。
```

## 子应用立项后验证

将 `{app-code}`、`{folder}` 替换为实际值：

```text
请帮我确认子应用 {app-code} 已正确立项：

1. AIEP-WEB/src/apps/{folder}/ 存在且含 main.js
2. AIEP-WEB/src/docs/子应用文档/{app-code}/ 含四段目录（01～04）
3. 04-AI治理与审计/gate-config.json 存在

不要修改文件。若以上均满足，请只回复：子应用 {app-code} 立项正确

若有缺失，请列出缺项并建议运行 validate:sub-app-registry。
```

## 完成标准（步骤 0）

- [ ] Agent 确认仓库根或子应用路径正确
- [ ] `npm run validate:sub-app-registry -- --app {app-code}` exit 0
- [ ] `00-项目记忆.md` 已写入 `platform_type` 与 `folder`
