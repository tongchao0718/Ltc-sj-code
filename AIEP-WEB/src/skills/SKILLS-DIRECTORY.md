# Skills 总目录（统一检索）

本目录用于快速查找当前仓库可用 skills。  
标签说明：
- `主线`：全流程默认强制使用
- `可选`：按场景触发，不是每个任务都需要
- `实验`：仅在负责人批准时启用

## 一、流程编排类

| Skill | 标签 | 路径 | 用途 | 触发关键词 |
|---|---|---|---|---|
| `ai-dev-stage-gate` | 主线 | `src/skills/ai-dev-stage-gate/SKILL.md` | AI 全流程阶段门禁与切换控制 | 阶段门禁、下一步、放行 |

## 二、AI 驱动开发核心阶段（标准五步）

| Skill | 标签 | 路径 | 用途 | 触发关键词 |
|---|---|---|---|---|
| `requirements-clarification` | 主线 | `src/skills/requirements-clarification/SKILL.md` | 需求澄清与验收标准固化 | 需求澄清、边界、用户故事 |
| `prd-design-generation` | 主线 | `src/skills/prd-design-generation/SKILL.md` | 结构化 PRD 设计生成 | PRD、目标、指标、发布计划 |
| `ui-generation` | 主线 | `src/skills/ui-generation/SKILL.md` | 页面与交互规格生成 | 界面生成、页面规格、组件 |
| `code-development` | 主线 | `src/skills/code-development/SKILL.md` | 可追溯代码开发与验证（含 G2-B 技术补齐评审） | 编码实现、任务拆解、追溯 |
| `test-validation` | 主线 | `src/skills/test-validation/SKILL.md` | 测试验证与放行判断 | 测试矩阵、回归、放行 |

## 三、专项技能（按场景触发）

| Skill | 标签 | 路径 | 用途 | 推荐接入阶段 |
|---|---|---|---|---|
| `enhance-prompt` | 可选 | `src/skills/enhance-prompt/SKILL.md` | Stitch 提示词增强 | Define / UI |
| `design-md` | 可选 | `src/skills/design-md/SKILL.md` | 设计系统文档 `DESIGN.md` 生成 | Define / UI |
| `stitch-design` | 可选 | `src/skills/stitch-design/SKILL.md` | Stitch 设计统一入口（生成/编辑/设计系统） | UI |
| `taste-design` | 可选 | `src/skills/taste-design/SKILL.md` | 高审美语义设计系统生成 | UI |
| `react:components` | 可选 | `src/skills/react-components/SKILL.md` | Stitch 到 React 组件转换 | Develop |
| `shadcn-ui` | 可选 | `src/skills/shadcn-ui/SKILL.md` | shadcn/ui 组件集成与规范 | Develop |
| `remotion` | 可选 | `src/skills/remotion/SKILL.md` | 基于 Stitch 的 Remotion 视频生成 | Deliver |
| `stitch-loop` | 实验 | `src/skills/stitch-loop/SKILL.md` | Stitch 循环式网站构建流程 | UI / Develop |

## 四、专项触发矩阵（建议）

| 触发场景 | 建议 skill 组合 |
|---|---|
| 新页面设计或改版（UI-first） | `enhance-prompt` -> `stitch-design` -> `ui-generation` |
| 需要统一设计语言 | `design-md`（必要时 `taste-design`） |
| 设计稿转前端组件 | `react:components`（必要时 `shadcn-ui`） |
| 汇报演示与 walkthrough | `remotion` |
| 连续页面自动迭代 | `stitch-loop`（需负责人批准） |

## 五、推荐调用顺序（AI 产品研发）

1. `ai-dev-stage-gate`（确认当前阶段与缺失项）
2. 进入阶段 skill（按主线执行）
3. Define 阶段采用 UI-first：先 `ui-generation` 完成 G2-A，再通过 `code-development` 前置评审模式完成 G2-B
4. 若命中专项场景，按矩阵增加可选 skill
5. 结束后再次调用 `ai-dev-stage-gate` 判定 pass/fail
6. pass 才允许进入下一阶段

## 六、维护规则

- 新增 skill 时，必须同步更新本目录
- 下线或重命名 skill 时，必须在本目录标注变更
- 若存在同类 skill，优先保留一个“标准入口”避免分叉
