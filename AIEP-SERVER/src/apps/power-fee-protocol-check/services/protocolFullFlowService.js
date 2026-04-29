const runtimeStore = {
  annotations: [],
  ruleVersions: [],
  tasks: [],
  issues: [],
  optimizeIterations: [],
  parseResults: [],
  verifyResults: []
};

function nowText() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function buildId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

const protocolFullFlowService = {
  async annotateSample(payload = {}) {
    const row = {
      annotationId: buildId('anno'),
      sampleId: payload.sampleId || 'sample_demo_001',
      annotationResult: payload.annotationResult || 'valid',
      operator: payload.operator || 'LTC',
      createdAt: nowText()
    };
    runtimeStore.annotations.push(row);
    return row;
  },

  async publishRule(payload = {}) {
    const row = {
      publishId: buildId('rule_pub'),
      ruleId: payload.ruleId || 'rule_demo_001',
      versionNo: payload.versionNo || '1.0.0',
      changeNote: payload.changeNote || 'initial publish',
      publishedAt: nowText()
    };
    runtimeStore.ruleVersions.push(row);
    return row;
  },

  async generateTask(payload = {}) {
    const row = {
      taskId: buildId('task'),
      strategyId: payload.strategyId || 'strategy_demo_001',
      unitCodes: payload.unitCodes || ['UNIT001'],
      sceneCode: payload.sceneCode || 'SCENE_A',
      taskStatus: 'pending',
      createdAt: nowText()
    };
    runtimeStore.tasks.push(row);
    return row;
  },

  async governIssue(payload = {}) {
    const row = {
      governId: buildId('govern'),
      issueId: payload.issueId || 'issue_demo_001',
      ticketAction: payload.ticketAction || 'dispatch',
      assignee: payload.assignee || 'LTC',
      issueStatus: 'processing',
      operatedAt: nowText()
    };
    runtimeStore.issues.push(row);
    return row;
  },

  async iterateOptimize(payload = {}) {
    const row = {
      iterationId: buildId('iter'),
      feedbackId: payload.feedbackId || 'feedback_demo_001',
      sampleBatchId: payload.sampleBatchId || 'batch_demo_001',
      modelVersion: payload.modelVersion || 'model_v1',
      iterationStatus: 'running',
      createdAt: nowText()
    };
    runtimeStore.optimizeIterations.push(row);
    return row;
  },

  async runParse(payload = {}) {
    const row = {
      parseId: buildId('parse'),
      fileId: payload.fileId || 'file_demo_001',
      protocolType: payload.protocolType || 'TYPE_A',
      parseStatus: 'parsed',
      createdAt: nowText()
    };
    runtimeStore.parseResults.push(row);
    return row;
  },

  async runVerify(payload = {}) {
    const row = {
      verifyId: buildId('verify'),
      taskId: payload.taskId || 'task_demo_001',
      verifyMode: payload.verifyMode || 'full',
      verifyStatus: 'passed',
      createdAt: nowText()
    };
    runtimeStore.verifyResults.push(row);
    return row;
  }
};

export default protocolFullFlowService;
