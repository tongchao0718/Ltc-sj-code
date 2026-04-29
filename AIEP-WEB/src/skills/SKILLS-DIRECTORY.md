# Skills 总目录（统一检索）

本目录用于快速查找当前仓库可用 skills。  
标签说明：

- `主线`：全流程默认强制使用
- `可选`：按场景触发，不是每个任务都需要
- `实验`：仅在负责人批准时启用

## 一、流程编排类


| Skill               | 标签  | 路径                                      | 用途              | 触发关键词       |
| ------------------- | --- | --------------------------------------- | --------------- | ----------- |
| `ai-dev-stage-gate` | 主线  | `src/skills/ai-dev-stage-gate/SKILL.md` | AI 全流程阶段门禁与切换控制 | 阶段门禁、下一步、放行 |


## 二、AI 驱动开发核心阶段（标准六步）


| Skill                        | 标签  | 路径                                               | 用途                                | 触发关键词                      |
| ---------------------------- | --- | ------------------------------------------------ | --------------------------------- | -------------------------- |
| `requirements-clarification` | 主线  | `src/skills/requirements-clarification/SKILL.md` | 需求澄清与验收标准固化                       | 需求澄清、边界、用户故事               |
| `prd-design-generation`      | 主线  | `src/skills/prd-design-generation/SKILL.md`      | 结构化 PRD 设计生成                      | PRD、目标、指标、发布计划             |
| `ui-generation`              | 主线  | `src/skills/ui-generation/SKILL.md`              | 页面与交互规格生成（可吸收 `stitch-design` 产物） | 界面生成、页面规格、组件、stitch-design |
| `code-development`           | 主线  | `src/skills/code-development/SKILL.md`           | 可追溯代码开发与验证（含 G2-B 技术补齐评审）         | 编码实现、任务拆解、追溯               |
| `test-validation`            | 主线  | `src/skills/test-validation/SKILL.md`            | 测试验证与放行判断                         | 测试矩阵、回归、放行                 |


## 三、专项技能（按场景触发）


| Skill              | 标签  | 路径                                     | 用途                        | 推荐接入阶段       |
| ------------------ | --- | -------------------------------------- | ------------------------- | ------------ |
| `enhance-prompt`   | 可选  | `src/skills/enhance-prompt/SKILL.md`   | Stitch 提示词增强              | Define / UI  |
| `design-md`        | 可选  | `src/skills/design-md/SKILL.md`        | 设计系统文档 `DESIGN.md` 生成     | Define / UI  |
| `stitch-design`    | 可选  | `src/skills/stitch-design/SKILL.md`    | Stitch 设计统一入口（生成/编辑/设计系统） | UI           |
| `taste-design`     | 可选  | `src/skills/taste-design/SKILL.md`     | 高审美语义设计系统生成               | UI           |
| `react:components` | 可选  | `src/skills/react-components/SKILL.md` | Stitch 到 React 组件转换       | Develop      |
| `shadcn-ui`        | 可选  | `src/skills/shadcn-ui/SKILL.md`        | shadcn/ui 组件集成与规范         | Develop      |
| `remotion`         | 可选  | `src/skills/remotion/SKILL.md`         | 基于 Stitch 的 Remotion 视频生成 | Deliver      |
| `stitch-loop`      | 实验  | `src/skills/stitch-loop/SKILL.md`      | Stitch 循环式网站构建流程          | UI / Develop |


## 四、专项触发矩阵（建议）


| 触发场景               | 建议 skill 组合                                            |
| ------------------ | ------------------------------------------------------ |
| 新页面设计或改版（UI-first） | `enhance-prompt` -> `stitch-design` -> `ui-generation` |
| 需要统一设计语言           | `design-md`（必要时 `taste-design`）                        |
| 设计稿转前端组件           | `react:components`（必要时 `shadcn-ui`）                    |
| 汇报演示与 walkthrough  | `remotion`                                             |
| 连续页面自动迭代           | `stitch-loop`（需负责人批准）                                  |


## 五、推荐调用顺序（AI 产品研发）

1. `ai-dev-stage-gate`（确认当前阶段与缺失项）
2. 需求生成：执行 `requirements-clarification` 产出需求草案
3. 需求确认：执行 `requirements-clarification` + `prd-design-generation`，完成 SDD 与技术补齐结论
4. 界面生成/确认：执行 `ui-generation`（可先走 `stitch-design`），完成 G2-A
5. 开发测试：执行 `code-development` + `test-validation`
6. 发布上线：根据门禁结果执行发布检查与归档
7. 每步结束后再次调用 `ai-dev-stage-gate` 判定 pass/fail/blocked

## 六、维护规则

- 新增 skill 时，必须同步更新本目录
- 下线或重命名 skill 时，必须在本目录标注变更
- 若存在同类 skill，优先保留一个“标准入口”避免分叉

## 七、主线 Skill 执行统一约定（强制）

1. 模板路径参数：主线 skill（`requirements-clarification`、`prd-design-generation`、`ui-generation`、`code-development`、`test-validation`）统一支持 `{TEMPLATE_REPO_PATH}`。
2. 默认模板目录：未显式提供 `{TEMPLATE_REPO_PATH}` 时，默认使用 `核心文档/AI+产品落地/02-子应用通用模板/`。
3. 路径兜底规则：模板目录不存在时，不得中断执行；必须按对应模板章节自动生成同结构骨架。
4. 门禁状态枚举：主线门禁统一使用 `pass / fail / blocked`。
5. 状态口径：
  - `pass`：输入完整、产物齐备、可进入下一阶段；
  - `fail`：当前阶段产物不达标，但可在本阶段修订；
  - `blocked`：缺外部依赖/审批/关键前置，当前阶段无法推进。

