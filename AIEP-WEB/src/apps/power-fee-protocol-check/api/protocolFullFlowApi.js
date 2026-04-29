import axios from 'axios';

async function post(url, data) {
  const response = await axios.post(url, data, { timeout: 10000 });
  return response.data;
}

export function annotateSample(data) {
  return post('/api/protocol/sample/annotate', data);
}

export function publishRule(data) {
  return post('/api/protocol/rule/publish', data);
}

export function generateTask(data) {
  return post('/api/protocol/task/generate', data);
}

export function governIssue(data) {
  return post('/api/protocol/issue/govern', data);
}

export function iterateOptimize(data) {
  return post('/api/protocol/optimize/iterate', data);
}

export function runParse(data) {
  return post('/api/protocol/parse/run', data);
}

export function runVerify(data) {
  return post('/api/protocol/verify/run', data);
}
