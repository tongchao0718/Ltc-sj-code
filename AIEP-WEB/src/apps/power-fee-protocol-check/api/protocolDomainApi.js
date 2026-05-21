import axios from 'axios';

const reqCfg = { timeout: 15000, validateStatus: () => true };

async function get(url, params = {}) {
  try {
    const response = await axios.get(url, { params, ...reqCfg });
    return response.data;
  } catch (e) {
    return { code: 500, message: e.message || 'network error', data: null };
  }
}

async function post(url, data = {}) {
  try {
    const response = await axios.post(url, data, reqCfg);
    return response.data;
  } catch (e) {
    return { code: 500, message: e.message || 'network error', data: null };
  }
}

/** M01 */
export function fetchTemplateList(params) {
  return get('/api/protocol/template/list', params);
}
export function fetchTemplateFields(params) {
  return get('/api/protocol/template/fields', params);
}
export function fetchBaselineList(params) {
  return get('/api/protocol/template/baseline/list', params);
}
export function createTemplate(data) {
  return post('/api/protocol/template/create', data);
}
export function updateTemplate(data) {
  return post('/api/protocol/template/update', data);
}
export function deleteTemplate(data) {
  return post('/api/protocol/template/delete', data);
}
/** M02 */
export function fetchSampleList(params) {
  return get('/api/protocol/sample/list', params);
}
export function preprocessSample(data) {
  return post('/api/protocol/sample/preprocess', data);
}
export function annotateSample(data) {
  return post('/api/protocol/sample/annotate', data);
}
export function createSample(data) {
  return post('/api/protocol/sample/create', data);
}
export function updateSample(data) {
  return post('/api/protocol/sample/update', data);
}
export function deleteSample(data) {
  return post('/api/protocol/sample/delete', data);
}

/** M03 */
export function fetchRuleList(params) {
  return get('/api/protocol/rule/list', params);
}
export function publishRule(data) {
  return post('/api/protocol/rule/publish', data);
}
export function createRule(data) {
  return post('/api/protocol/rule/create', data);
}
export function updateRule(data) {
  return post('/api/protocol/rule/update', data);
}
export function deleteRule(data) {
  return post('/api/protocol/rule/delete', data);
}

/** M04 */
export function fetchStrategyList() {
  return get('/api/protocol/task/strategy/list');
}
export function fetchTaskList(params) {
  return get('/api/protocol/task/list', params);
}
export function generateTask(data) {
  return post('/api/protocol/task/generate', data);
}
export function createStrategy(data) {
  return post('/api/protocol/task/strategy/create', data);
}
export function updateStrategy(data) {
  return post('/api/protocol/task/strategy/update', data);
}
export function deleteStrategy(data) {
  return post('/api/protocol/task/strategy/delete', data);
}

/** M05 */
export function runCheckPlan(data) {
  return post('/api/protocol/check/run', data);
}

/** 解析 / 校核（可与 M05 分步组合使用） */
export function runParse(data) {
  return post('/api/protocol/parse/run', data);
}
export function runVerify(data) {
  return post('/api/protocol/verify/run', data);
}

/** 治理与优化（兼容旧 issue/govern） */
export function governIssue(data) {
  return post('/api/protocol/issue/govern', data);
}
export function iterateOptimize(data) {
  return post('/api/protocol/optimize/iterate', data);
}

/** M06 */
export function runExtract(data) {
  return post('/api/protocol/extract/run', data);
}
export function fetchExtractList(params) {
  return get('/api/protocol/extract/list', params);
}

/** M07 */
export function fetchParseList(params) {
  return get('/api/protocol/parse/list', params);
}

/** M08 */
export function fetchVerifyList(params) {
  return get('/api/protocol/verify/list', params);
}

/** M09 */
export function fetchProblemList(params) {
  return get('/api/protocol/problem/list', params);
}
export function createProblem(data) {
  return post('/api/protocol/problem/create', data);
}

/** M10 */
export function governDispatch(data) {
  return post('/api/protocol/govern/dispatch', data);
}
export function governTransition(data) {
  return post('/api/protocol/govern/transition', data);
}
export function fetchTicketList(params) {
  return get('/api/protocol/govern/ticket/list', params);
}

/** M11 */
export function fetchTaskMonitorList(params) {
  return get('/api/protocol/task-monitor/list', params);
}

/** M12 */
export function fetchResultMonitorOverview() {
  return get('/api/protocol/result-monitor/overview');
}

/** M13 */
export function fetchOptimizeList(params) {
  return get('/api/protocol/optimize/list', params);
}

/** M14 */
export function fetchReviewList(params) {
  return get('/api/protocol/review/list', params);
}
export function fetchErrorCorpus(params) {
  return get('/api/protocol/review/error-corpus', params);
}
export function reviewSubmit(data) {
  return post('/api/protocol/review/submit', data);
}
