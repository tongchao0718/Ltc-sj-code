# marketing-demo 验收脚本（GWT）

> 与 SDD-v1.0 `acceptance` 同构；G3 执行本脚本并记录结果。

## AT-01 三源同步

- **Given** 用户在接入总览页
- **When** 点击某数据源「立即同步」
- **Then** 出现 loading；syncLogs 新增一条；integration 对应源 lastSync 更新

## AT-02 工商 14 Tab

- **Given** 用户在工商信息接入页
- **When** 选择企业并打开详情
- **Then** 14 个 Tab 均可切换且有样例数据

## AT-03 九维查询四态

- **Given** 用户在任一 `/query/*` 页
- **When** 输入筛选条件并查询 / 清空 / 模拟无结果
- **Then** 展示 loading→success/empty/error；分页正确；导出按钮可触发

## AT-04 分析钻取

- **Given** 用户在分析看板页
- **When** 点击图表钻取或「查看明细」
- **Then** 打开明细弹窗或跳转对应查询页且带参

## AT-05 画像标签

- **Given** 用户在企业画像详情页
- **When** 新增或删除标签
- **Then** profiles 持久化；历史时间轴追加记录

## AT-06 报告生成与溯源

- **Given** 用户在报告生成页
- **When** 选择模板并生成
- **Then** 提示成功 fileName；溯源链接跳转查询页

## AT-07 协议四环节

- **Given** 用户在协议全生命周期页
- **When** 提交审核 / 通过 / 驳回
- **Then** 状态按 SM-01 流转；列表即时刷新

## AT-08 履约临期与评估

- **Given** 用户在保函临期页
- **When** 修改临期天数阈值
- **Then** expiryDays 持久化；列表过滤条数变化；评估页可生成六维报告

## AT-22 主应用嵌入

- **Given** `npm run validate:sub-app-registry -- --app marketing-demo` 通过
- **When** 主应用访问 `/marketing-demo/dashboard`
- **Then** 沉浸顶栏（32px）+ 子应用 YXUI 壳层 + 目标页正常；点击主应用 Logo 回 `/dashboard`

---

## 执行记录（G3 填写）

| AT | 执行日期 | 结果 | 执行人 | 备注 |
|----|----------|------|--------|------|
| AT-01 | | | | |
| AT-02 | | | | |
| AT-03 | | | | |
| AT-04 | | | | |
| AT-05 | | | | |
| AT-06 | | | | |
| AT-07 | | | | |
| AT-08 | | | | |
| AT-22 | | | | |
