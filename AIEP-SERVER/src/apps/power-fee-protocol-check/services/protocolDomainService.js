/**
 * 电费协议核查领域服务：对齐详细设计中的实体与状态，进程内持久化（演示闭环）。
 * 生产环境可替换为真实 ORM / 消息队列，接口契约保持不变。
 */

function nowText() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function buildId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function paginate(list, pageNo, pageSize) {
  const p = Math.max(1, parseInt(pageNo, 10) || 1);
  const s = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  return {
    pageNo: p,
    pageSize: s,
    total: list.length,
    list: list.slice((p - 1) * s, p * s)
  };
}

const store = {
  templates: [
    {
      templateCode: 'TMP_PREPAID_A',
      templateName: '预存交费协议模板',
      templateType: 'TYPE_A',
      versionNo: '1.0.0',
      status: 'enabled',
      createdAt: '2026-04-28 09:00:00',
      updatedAt: '2026-04-28 10:00:00'
    },
    {
      templateCode: 'TMP_HIGH_POSTPAID_B',
      templateName: '高压后付费协议模板',
      templateType: 'TYPE_B',
      versionNo: '1.1.0',
      status: 'enabled',
      createdAt: '2026-04-28 09:30:00',
      updatedAt: '2026-04-28 11:30:00'
    },
    {
      templateCode: 'TMP_LOW_POSTPAID_C',
      templateName: '低压后付费协议模板',
      templateType: 'TYPE_C',
      versionNo: '0.9.2',
      status: 'draft',
      createdAt: '2026-04-28 10:00:00',
      updatedAt: '2026-04-28 14:20:00'
    }
  ],
  templateFields: [
    {
      templateCode: 'TMP_PREPAID_A',
      fieldCode: 'cust_name',
      fieldName: '客户名称',
      fieldType: 'string',
      requiredFlag: 1,
      sortNo: 1
    },
    {
      templateCode: 'TMP_PREPAID_A',
      fieldCode: 'pay_mode',
      fieldName: '交费方式',
      fieldType: 'enum',
      requiredFlag: 1,
      sortNo: 2
    }
  ],
  baselines: [
    {
      baselineId: 'BL_001',
      customerNo: 'CN10001',
      customerName: '演示用电客户',
      payMode: 'prepaid',
      orgCode: 'ORG01',
      updatedAt: '2026-04-28 12:00:00'
    }
  ],
  samples: [
    {
      sampleId: 'sample_demo_001',
      fileId: 'file_demo_001',
      protocolType: 'TYPE_A',
      sourceSystem: 'marketing',
      sampleStatus: 'collected',
      qualityScore: 92.5,
      createdAt: '2026-04-28 08:00:00'
    },
    {
      sampleId: 'sample_demo_002',
      fileId: 'file_demo_002',
      protocolType: 'TYPE_D',
      sourceSystem: 'archive',
      sampleStatus: 'preprocessed',
      qualityScore: 78.0,
      createdAt: '2026-04-28 08:10:00'
    }
  ],
  samplePreprocessLogs: [],
  annotations: [],
  rules: [
    {
      ruleId: 'rule_demo_001',
      ruleCode: 'RULE_INT_01',
      ruleName: '必填条款完整性',
      ruleType: 'integrity',
      templateType: 'TYPE_A',
      status: 'draft'
    },
    {
      ruleId: 'rule_demo_002',
      ruleCode: 'RULE_CON_01',
      ruleName: '档案一致性',
      ruleType: 'consistency',
      templateType: 'TYPE_B',
      status: 'enabled'
    }
  ],
  ruleVersions: [],
  strategies: [
    {
      strategyId: 'strategy_demo_001',
      strategyName: '月度增量核查',
      orgCode: 'ORG01',
      sceneCode: 'SCENE_A',
      executeMode: 'auto',
      status: 'enabled'
    },
    {
      strategyId: 'strategy_demo_005',
      strategyName: '存量分批核查',
      orgCode: 'ORG01',
      sceneCode: 'SCENE_CHECK',
      executeMode: 'batch',
      status: 'enabled'
    }
  ],
  tasks: [],
  taskDetails: [],
  checkPlans: [],
  extractObjects: [],
  extractLogs: [],
  parseResults: [],
  verifyResults: [],
  verifyItemDetails: [],
  problems: [],
  governanceTickets: [],
  ticketProcessLogs: [],
  taskMonitorLogs: [],
  resultMonitorAgg: {
    totalChecks: 0,
    passedVerify: 0,
    failedVerify: 0,
    openProblems: 0,
    openTickets: 0,
    totalParses: 0,
    totalTasks: 0,
    lastUpdatedAt: null
  },
  optimizeIterations: [],
  reviewTasks: [],
  errorCorpus: [],
  idempotency: new Map()
};

function bumpAgg(patch) {
  Object.assign(store.resultMonitorAgg, patch, { lastUpdatedAt: nowText() });
}

function logTicket(ticketId, action, operator, detail) {
  store.ticketProcessLogs.push({
    logId: buildId('tlog'),
    ticketId,
    action,
    operator: operator || 'system',
    detail: detail || '',
    createdAt: nowText()
  });
}

function logMonitor(taskId, level, message, meta) {
  store.taskMonitorLogs.push({
    logId: buildId('mon'),
    taskId: taskId || '-',
    level: level || 'info',
    message: message || '',
    meta: meta || {},
    createdAt: nowText()
  });
}

function verifyShouldFail(payload, parseRow) {
  if (payload.simulateMismatch === true) return true;
  if (payload.protocolType === 'TYPE_D' || parseRow?.protocolType === 'TYPE_D') return true;
  return false;
}

const protocolDomainService = {
  listTemplates(query = {}) {
    const { type = '', pageNo = 1, pageSize = 10 } = query;
    let list = [...store.templates];
    if (type) list = list.filter((t) => t.templateType === type);
    return paginate(list, pageNo, pageSize);
  },

  listTemplateFields(query = {}) {
    const { templateCode = '' } = query;
    let list = store.templateFields;
    if (templateCode) list = list.filter((f) => f.templateCode === templateCode);
    return { list };
  },

  listBaselines(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.baselines], pageNo, pageSize);
  },

  createTemplate(payload = {}) {
    const code = (payload.templateCode || '').trim();
    if (!code) {
      const e = new Error('templateCode 必填');
      e.code = 400;
      throw e;
    }
    if (store.templates.some((t) => t.templateCode === code)) {
      const e = new Error('模板编码已存在');
      e.code = 400;
      throw e;
    }
    const row = {
      templateCode: code,
      templateName: payload.templateName || code,
      templateType: payload.templateType || 'TYPE_A',
      versionNo: payload.versionNo || '0.0.1',
      status: payload.status || 'draft',
      createdAt: nowText(),
      updatedAt: nowText()
    };
    store.templates.push(row);
    return row;
  },

  updateTemplate(payload = {}) {
    const t = store.templates.find((x) => x.templateCode === payload.templateCode);
    if (!t) {
      const e = new Error('模板不存在');
      e.code = 404;
      throw e;
    }
    if (payload.templateName != null) t.templateName = payload.templateName;
    if (payload.templateType != null) t.templateType = payload.templateType;
    if (payload.versionNo != null) t.versionNo = payload.versionNo;
    if (payload.status != null) t.status = payload.status;
    t.updatedAt = nowText();
    return t;
  },

  deleteTemplate(payload = {}) {
    const i = store.templates.findIndex((x) => x.templateCode === payload.templateCode);
    if (i < 0) {
      const e = new Error('模板不存在');
      e.code = 404;
      throw e;
    }
    const t = store.templates[i];
    if (t.status === 'enabled') {
      const e = new Error('已启用模板不可删除，请先停用为草稿');
      e.code = 400;
      throw e;
    }
    store.templates.splice(i, 1);
    store.templateFields = store.templateFields.filter((f) => f.templateCode !== payload.templateCode);
    return { templateCode: payload.templateCode, deleted: true };
  },

  listSamples(query = {}) {
    const { protocolType = '', pageNo = 1, pageSize = 10 } = query;
    let list = [...store.samples];
    if (protocolType) list = list.filter((s) => s.protocolType === protocolType);
    return paginate(list, pageNo, pageSize);
  },

  preprocessSample(payload = {}) {
    const sampleId = payload.sampleId || 'sample_demo_001';
    const sample = store.samples.find((s) => s.sampleId === sampleId);
    if (!sample) {
      const err = new Error('样本不存在');
      err.code = 404;
      throw err;
    }
    sample.sampleStatus = 'preprocessed';
    const log = {
      sampleId,
      actionType: 'preprocess',
      actionResult: 'success',
      detailMsg: '去重与质检通过',
      createdAt: nowText()
    };
    store.samplePreprocessLogs.push(log);
    return { sampleId, sampleStatus: sample.sampleStatus, log };
  },

  async annotateSample(payload = {}) {
    const row = {
      annotationId: buildId('anno'),
      sampleId: payload.sampleId || 'sample_demo_001',
      annotationResult: payload.annotationResult || payload.annotationStatus || 'valid',
      operator: payload.operator || 'LTC',
      fieldCode: payload.fieldCode || '',
      annotationValue: payload.annotationValue || '',
      createdAt: nowText()
    };
    store.annotations.push(row);
    const s = store.samples.find((x) => x.sampleId === row.sampleId);
    if (s) s.sampleStatus = 'annotated';
    return row;
  },

  createSample(payload = {}) {
    const sampleId = (payload.sampleId || '').trim() || buildId('sample');
    if (store.samples.some((s) => s.sampleId === sampleId)) {
      const e = new Error('样本ID已存在');
      e.code = 400;
      throw e;
    }
    const row = {
      sampleId,
      fileId: payload.fileId || `file_${sampleId}`,
      protocolType: payload.protocolType || 'TYPE_A',
      sourceSystem: payload.sourceSystem || 'manual',
      sampleStatus: 'collected',
      qualityScore: payload.qualityScore != null ? Number(payload.qualityScore) : null,
      createdAt: nowText()
    };
    store.samples.push(row);
    return row;
  },

  updateSample(payload = {}) {
    const s = store.samples.find((x) => x.sampleId === payload.sampleId);
    if (!s) {
      const e = new Error('样本不存在');
      e.code = 404;
      throw e;
    }
    if (payload.fileId != null) s.fileId = payload.fileId;
    if (payload.protocolType != null) s.protocolType = payload.protocolType;
    if (payload.sourceSystem != null) s.sourceSystem = payload.sourceSystem;
    if (payload.qualityScore != null) s.qualityScore = Number(payload.qualityScore);
    return s;
  },

  deleteSample(payload = {}) {
    const s = store.samples.find((x) => x.sampleId === payload.sampleId);
    if (!s) {
      const e = new Error('样本不存在');
      e.code = 404;
      throw e;
    }
    s.sampleStatus = 'invalidated';
    s.invalidatedAt = nowText();
    return { sampleId: payload.sampleId, invalidated: true };
  },

  listRules(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.rules], pageNo, pageSize);
  },

  async publishRule(payload = {}) {
    const row = {
      publishId: buildId('rule_pub'),
      ruleId: payload.ruleId || 'rule_demo_001',
      versionNo: payload.versionNo || '1.0.0',
      changeNote: payload.changeNote || 'initial publish',
      publishedBy: payload.operator || 'LTC',
      publishedAt: nowText()
    };
    store.ruleVersions.push(row);
    const rule = store.rules.find((r) => r.ruleId === row.ruleId);
    if (rule) rule.status = 'enabled';
    return row;
  },

  createRule(payload = {}) {
    const ruleId = (payload.ruleId || '').trim() || buildId('rule');
    if (store.rules.some((r) => r.ruleId === ruleId)) {
      const e = new Error('规则ID已存在');
      e.code = 400;
      throw e;
    }
    const row = {
      ruleId,
      ruleCode: payload.ruleCode || 'RULE_NEW',
      ruleName: payload.ruleName || '新建规则',
      ruleType: payload.ruleType || 'integrity',
      templateType: payload.templateType || 'TYPE_A',
      status: 'draft'
    };
    store.rules.push(row);
    return row;
  },

  updateRule(payload = {}) {
    const r = store.rules.find((x) => x.ruleId === payload.ruleId);
    if (!r) {
      const e = new Error('规则不存在');
      e.code = 404;
      throw e;
    }
    if (r.status === 'enabled') {
      const e = new Error('已发布规则不可直接改内容，请先停用或新建草稿规则');
      e.code = 400;
      throw e;
    }
    if (payload.ruleCode != null) r.ruleCode = payload.ruleCode;
    if (payload.ruleName != null) r.ruleName = payload.ruleName;
    if (payload.ruleType != null) r.ruleType = payload.ruleType;
    if (payload.templateType != null) r.templateType = payload.templateType;
    return r;
  },

  deleteRule(payload = {}) {
    const i = store.rules.findIndex((x) => x.ruleId === payload.ruleId);
    if (i < 0) {
      const e = new Error('规则不存在');
      e.code = 404;
      throw e;
    }
    if (store.rules[i].status !== 'draft') {
      const e = new Error('仅草稿规则可删除');
      e.code = 400;
      throw e;
    }
    store.rules.splice(i, 1);
    return { ruleId: payload.ruleId, deleted: true };
  },

  listStrategies() {
    return { list: [...store.strategies] };
  },

  createStrategy(payload = {}) {
    const strategyId = (payload.strategyId || '').trim() || buildId('strategy');
    if (store.strategies.some((s) => s.strategyId === strategyId)) {
      const e = new Error('策略ID已存在');
      e.code = 400;
      throw e;
    }
    const row = {
      strategyId,
      strategyName: payload.strategyName || strategyId,
      orgCode: payload.orgCode || 'ORG01',
      sceneCode: payload.sceneCode || 'SCENE_A',
      executeMode: payload.executeMode || 'auto',
      status: payload.status || 'enabled'
    };
    store.strategies.push(row);
    return row;
  },

  updateStrategy(payload = {}) {
    const s = store.strategies.find((x) => x.strategyId === payload.strategyId);
    if (!s) {
      const e = new Error('策略不存在');
      e.code = 404;
      throw e;
    }
    if (payload.strategyName != null) s.strategyName = payload.strategyName;
    if (payload.orgCode != null) s.orgCode = payload.orgCode;
    if (payload.sceneCode != null) s.sceneCode = payload.sceneCode;
    if (payload.executeMode != null) s.executeMode = payload.executeMode;
    if (payload.status != null) s.status = payload.status;
    return s;
  },

  deleteStrategy(payload = {}) {
    const sid = payload.strategyId;
    const s = store.strategies.find((x) => x.strategyId === sid);
    if (!s) {
      const e = new Error('策略不存在');
      e.code = 404;
      throw e;
    }
    const hasTasks = store.tasks.some((t) => t.strategyId === sid);
    if (hasTasks) {
      s.status = 'disabled';
      return { strategyId: sid, disabled: true };
    }
    const i = store.strategies.findIndex((x) => x.strategyId === sid);
    store.strategies.splice(i, 1);
    return { strategyId: sid, deleted: true };
  },

  listTasks(query = {}) {
    const { taskStatus = '', pageNo = 1, pageSize = 10 } = query;
    let list = [...store.tasks];
    if (taskStatus) list = list.filter((t) => t.taskStatus === taskStatus);
    return paginate(list, pageNo, pageSize);
  },

  async generateTask(payload = {}) {
    const key = payload.idempotencyKey || payload.clientRequestId;
    if (key && store.idempotency.has(key)) {
      return store.idempotency.get(key);
    }
    const row = {
      taskId: buildId('task'),
      strategyId: payload.strategyId || 'strategy_demo_001',
      unitCodes: payload.unitCodes || ['UNIT001'],
      sceneCode: payload.sceneCode || 'SCENE_A',
      taskStatus: 'pending',
      totalCount: 10,
      successCount: 0,
      failedCount: 0,
      createdAt: nowText()
    };
    store.tasks.push(row);
    for (let i = 0; i < 3; i += 1) {
      store.taskDetails.push({
        detailId: buildId('td'),
        taskId: row.taskId,
        fileId: `file_${row.taskId}_${i}`,
        detailStatus: 'pending',
        createdAt: nowText()
      });
    }
    bumpAgg({ totalTasks: store.resultMonitorAgg.totalTasks + 1 });
    logMonitor(row.taskId, 'info', '任务已生成', { strategyId: row.strategyId });
    if (key) store.idempotency.set(key, row);
    return row;
  },

  listParseResults(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.parseResults].reverse(), pageNo, pageSize);
  },

  async runParse(payload = {}) {
    const row = {
      parseId: buildId('parse'),
      fileId: payload.fileId || 'file_demo_001',
      protocolType: payload.protocolType || 'TYPE_A',
      parseStatus: 'parsed',
      confidence: 0.94,
      structuredSummary: { custName: '示例', address: '示例地址' },
      createdAt: nowText()
    };
    store.parseResults.push(row);
    bumpAgg({ totalParses: store.resultMonitorAgg.totalParses + 1 });
    return row;
  },

  listVerifyResults(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.verifyResults].reverse(), pageNo, pageSize);
  },

  async runVerify(payload = {}) {
    const parseRef = payload.parseId
      ? store.parseResults.find((p) => p.parseId === payload.parseId)
      : store.parseResults.filter((p) => p.fileId === (payload.fileId || 'file_demo_001')).pop();

    const failed = verifyShouldFail(payload, parseRef);
    const verifyStatus = failed ? 'rejected' : 'passed';
    const row = {
      verifyId: buildId('verify'),
      taskId: payload.taskId || 'task_standalone',
      parseId: parseRef?.parseId || '',
      fileId: parseRef?.fileId || payload.fileId || 'file_demo_001',
      verifyMode: payload.verifyMode || 'full',
      verifyStatus,
      createdAt: nowText()
    };
    store.verifyResults.push(row);
    if (failed) {
      store.verifyItemDetails.push({
        itemId: buildId('vd'),
        verifyId: row.verifyId,
        fieldCode: 'pay_mode',
        expected: 'prepaid',
        actual: 'postpaid',
        reason: '档案字段不一致'
      });
    }
    return row;
  },

  /**
   * 核查执行闭环：计划 -> 解析 -> 校核 ->（失败则）问题建档 -> 监控日志 -> 汇总指标
   */
  async checkRun(payload = {}) {
    const operator = payload.operator || 'LTC';
    const fileId = payload.fileId || 'file_check_demo';
    const protocolType = payload.protocolType || 'TYPE_A';

    const plan = {
      planId: buildId('plan'),
      fileId,
      protocolType,
      planStatus: 'running',
      operator,
      createdAt: nowText()
    };
    store.checkPlans.push(plan);
    bumpAgg({ totalChecks: store.resultMonitorAgg.totalChecks + 1 });

    const parseRow = await protocolDomainService.runParse({ fileId, protocolType, operator });
    const verifyRow = await protocolDomainService.runVerify({
      taskId: payload.taskId,
      parseId: parseRow.parseId,
      fileId,
      protocolType,
      verifyMode: payload.verifyMode || 'full',
      simulateMismatch: payload.simulateMismatch
    });

    plan.planStatus = 'success';
    plan.parseId = parseRow.parseId;
    plan.verifyId = verifyRow.verifyId;

    let problemId = null;
    if (verifyRow.verifyStatus === 'rejected') {
      const prob = await protocolDomainService.createProblem({
        problemType: 'consistency',
        issueLevel: 'major',
        description: '校核未通过，自动生成问题单',
        fileId,
        verifyId: verifyRow.verifyId,
        operator
      });
      problemId = prob.problemId;
      bumpAgg({ failedVerify: store.resultMonitorAgg.failedVerify + 1, openProblems: store.problems.filter((p) => p.issueStatus !== 'closed').length });
    } else {
      bumpAgg({ passedVerify: store.resultMonitorAgg.passedVerify + 1 });
    }

    logMonitor(payload.taskId || plan.planId, verifyRow.verifyStatus === 'rejected' ? 'warn' : 'info', '核查计划执行完成', {
      planId: plan.planId,
      verifyStatus: verifyRow.verifyStatus
    });

    return {
      plan,
      parse: parseRow,
      verify: verifyRow,
      problemId
    };
  },

  async extractRun(payload = {}) {
    const obj = {
      objectId: buildId('ext_obj'),
      customerNo: payload.customerNo || 'CN_AUTO',
      protocolType: payload.protocolType || 'TYPE_A',
      extractStatus: 'ready',
      createdAt: nowText()
    };
    store.extractObjects.push(obj);
    const log = {
      logId: buildId('ext_log'),
      objectId: obj.objectId,
      message: '增量提取规则执行成功',
      createdAt: nowText()
    };
    store.extractLogs.push(log);
    logMonitor('-', 'info', '增量对象已入池', { objectId: obj.objectId });
    return { object: obj, log };
  },

  listExtractObjects(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.extractObjects].reverse(), pageNo, pageSize);
  },

  async createProblem(payload = {}) {
    const problemId = payload.problemId || payload.issueId || buildId('prob');
    const existing = store.problems.find((p) => p.problemId === problemId);
    if (existing) return existing;
    const row = {
      problemId,
      problemType: payload.problemType || 'integrity',
      issueLevel: payload.issueLevel || 'minor',
      issueStatus: 'new',
      description: payload.description || '协议核查异常',
      fileId: payload.fileId || '',
      verifyId: payload.verifyId || '',
      orgCode: payload.orgCode || 'ORG01',
      createdAt: nowText(),
      operator: payload.operator || 'system'
    };
    store.problems.push(row);
    bumpAgg({ openProblems: store.problems.filter((p) => p.issueStatus !== 'closed').length });
    return row;
  },

  listProblems(query = {}) {
    const { pageNo = 1, pageSize = 10, issueStatus = '' } = query;
    let list = [...store.problems].reverse();
    if (issueStatus) list = list.filter((p) => p.issueStatus === issueStatus);
    return paginate(list, pageNo, pageSize);
  },

  async governDispatch(payload = {}) {
    const problemId = payload.problemId || payload.issueId;
    let prob = store.problems.find((p) => p.problemId === problemId);
    if (!prob) {
      prob = await protocolDomainService.createProblem({
        problemId: problemId || buildId('prob'),
        description: payload.description || '派发前自动建档（演示闭环）',
        operator: payload.operator || payload.assignee
      });
    }
    const ticket = {
      ticketId: buildId('ticket'),
      problemId: prob.problemId,
      ticketStatus: 'assigned',
      assignee: payload.assignee || 'LTC',
      createdAt: nowText()
    };
    store.governanceTickets.push(ticket);
    prob.issueStatus = 'processing';
    logTicket(ticket.ticketId, 'dispatch', payload.operator, `指派给 ${ticket.assignee}`);
    bumpAgg({ openTickets: store.governanceTickets.filter((t) => !['closed', 'resolved'].includes(t.ticketStatus)).length });
    return { ticket, problem: prob };
  },

  governTransition(payload = {}) {
    const ticket = store.governanceTickets.find((t) => t.ticketId === payload.ticketId);
    if (!ticket) {
      const err = new Error('工单不存在');
      err.code = 404;
      throw err;
    }
    const action = payload.action || 'resolve';
    if (action === 'resolve') ticket.ticketStatus = 'resolved';
    if (action === 'close') ticket.ticketStatus = 'closed';
    if (action === 'processing') ticket.ticketStatus = 'processing';
    logTicket(ticket.ticketId, action, payload.operator, payload.remark || '');
    const prob = store.problems.find((p) => p.problemId === ticket.problemId);
    if (prob && ['closed', 'resolved'].includes(ticket.ticketStatus)) {
      prob.issueStatus = 'closed';
    }
    bumpAgg({
      openTickets: store.governanceTickets.filter((t) => !['closed', 'resolved'].includes(t.ticketStatus)).length,
      openProblems: store.problems.filter((p) => p.issueStatus !== 'closed').length
    });
    return { ticket, problem: prob };
  },

  listTickets(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.governanceTickets].reverse(), pageNo, pageSize);
  },

  /** 兼容旧路径：issue/govern */
  async governIssue(payload = {}) {
    const action = payload.ticketAction || 'dispatch';
    if (action === 'create') {
      const prob = await protocolDomainService.createProblem({
        issueId: payload.issueId,
        description: payload.remark || '人工登记问题',
        operator: payload.assignee
      });
      return { governId: buildId('gov'), problem: prob };
    }
    if (action === 'dispatch') {
      const r = await protocolDomainService.governDispatch({
        problemId: payload.issueId,
        assignee: payload.assignee,
        operator: payload.operator
      });
      return { governId: buildId('gov'), ticket: r.ticket };
    }
    if (action === 'review') {
      return protocolDomainService.reviewSubmit({
        reviewTaskId: payload.issueId,
        conclusion: 'corrected',
        operator: payload.assignee,
        corrections: payload.remark || ''
      });
    }
    const ticket = store.governanceTickets[store.governanceTickets.length - 1];
    if (ticket) {
      return protocolDomainService.governTransition({
        ticketId: ticket.ticketId,
        action: 'resolve',
        operator: payload.assignee
      });
    }
    return { governId: buildId('gov'), message: 'noop' };
  },

  listTaskMonitor(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.taskMonitorLogs].reverse(), pageNo, pageSize);
  },

  resultMonitorOverview() {
    return {
      ...store.resultMonitorAgg,
      problemsByLevel: {
        major: store.problems.filter((p) => p.issueLevel === 'major').length,
        minor: store.problems.filter((p) => p.issueLevel === 'minor').length
      },
      ticketByStatus: store.governanceTickets.reduce((acc, t) => {
        acc[t.ticketStatus] = (acc[t.ticketStatus] || 0) + 1;
        return acc;
      }, {})
    };
  },

  async iterateOptimize(payload = {}) {
    const row = {
      iterationId: buildId('iter'),
      feedbackId: payload.feedbackId || 'feedback_demo_001',
      sampleBatchId: payload.sampleBatchId || 'batch_demo_001',
      modelVersion: payload.modelVersion || 'model_v1',
      iterationStatus: 'running',
      metricsBefore: { errorRate: 0.12 },
      metricsAfter: { errorRate: 0.09 },
      createdAt: nowText()
    };
    store.optimizeIterations.push(row);
    return row;
  },

  listOptimizeIterations(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.optimizeIterations].reverse(), pageNo, pageSize);
  },

  reviewSubmit(payload = {}) {
    const task = {
      reviewTaskId: buildId('rev'),
      sourceId: payload.reviewTaskId || payload.sourceId || 'src_001',
      conclusion: payload.conclusion || 'accepted',
      corrections: payload.corrections || '',
      reviewer: payload.operator || 'LTC',
      createdAt: nowText()
    };
    store.reviewTasks.push(task);
    if (payload.corrections) {
      store.errorCorpus.push({
        corpusId: buildId('corp'),
        wrongToken: payload.corrections.slice(0, 32),
        rightToken: payload.corrections,
        createdAt: nowText()
      });
    }
    return task;
  },

  listReviews(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.reviewTasks].reverse(), pageNo, pageSize);
  },

  listErrorCorpus(query = {}) {
    const { pageNo = 1, pageSize = 10 } = query;
    return paginate([...store.errorCorpus].reverse(), pageNo, pageSize);
  }
};

export default protocolDomainService;
