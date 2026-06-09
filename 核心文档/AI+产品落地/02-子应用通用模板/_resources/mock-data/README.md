# Mock 数据目录

- 每个实体一个 JSON 文件（如 `customers.json`）
- 字段名须与 `SDD-v*.json` 或 `15-SDD-Lite.json` 中数据模型一致
- 步骤 5 接真实 API 后，可保留作 Vitest fixture 或 Storybook 数据

## 文件命名

`{entity}.json` — 小写单数或业务约定复数名

## 最小结构示例

```json
{
  "entity": "customer",
  "items": [
    { "id": "1", "name": "示例客户", "status": "active" }
  ]
}
```
