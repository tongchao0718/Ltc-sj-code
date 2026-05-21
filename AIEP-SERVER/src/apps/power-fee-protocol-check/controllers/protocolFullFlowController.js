import protocolDomainService from '../services/protocolDomainService.js';

function requestId() {
  return `req_${Date.now()}`;
}

function ok(res, data) {
  res.status(200).json({
    code: 0,
    message: 'success',
    data,
    requestId: requestId()
  });
}

function fail(res, error) {
  const http = error.code === 404 ? 404 : error.code === 400 ? 400 : 500;
  const biz = error.code === 404 ? 404 : error.code === 400 ? 400 : 500;
  res.status(http).json({
    code: biz,
    message: error.message || 'internal error',
    data: null,
    requestId: requestId()
  });
}

function wrap(fn) {
  return async (req, res) => {
    try {
      const data = await fn(req.query || {}, req.body || {}, req);
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  };
}

const protocolFullFlowController = {
  annotateSample: wrap(async (_q, body) => protocolDomainService.annotateSample(body)),
  publishRule: wrap(async (_q, body) => protocolDomainService.publishRule(body)),
  generateTask: wrap(async (_q, body) => protocolDomainService.generateTask(body)),
  governIssue: wrap(async (_q, body) => protocolDomainService.governIssue(body)),
  iterateOptimize: wrap(async (_q, body) => protocolDomainService.iterateOptimize(body)),
  runParse: wrap(async (_q, body) => protocolDomainService.runParse(body)),
  runVerify: wrap(async (_q, body) => protocolDomainService.runVerify(body)),

  listSamples: wrap(async (query) => protocolDomainService.listSamples(query)),
  preprocessSample: wrap(async (_q, body) => protocolDomainService.preprocessSample(body)),
  listRules: wrap(async (query) => protocolDomainService.listRules(query)),
  listStrategies: wrap(async () => protocolDomainService.listStrategies()),
  listTasks: wrap(async (query) => protocolDomainService.listTasks(query)),
  checkRun: wrap(async (_q, body) => protocolDomainService.checkRun(body)),
  extractRun: wrap(async (_q, body) => protocolDomainService.extractRun(body)),
  listExtractObjects: wrap(async (query) => protocolDomainService.listExtractObjects(query)),
  listParseResults: wrap(async (query) => protocolDomainService.listParseResults(query)),
  listVerifyResults: wrap(async (query) => protocolDomainService.listVerifyResults(query)),
  createProblem: wrap(async (_q, body) => protocolDomainService.createProblem(body)),
  listProblems: wrap(async (query) => protocolDomainService.listProblems(query)),
  governDispatch: wrap(async (_q, body) => protocolDomainService.governDispatch(body)),
  governTransition: wrap(async (_q, body) => protocolDomainService.governTransition(body)),
  listTickets: wrap(async (query) => protocolDomainService.listTickets(query)),
  listTaskMonitor: wrap(async (query) => protocolDomainService.listTaskMonitor(query)),
  resultMonitorOverview: wrap(async () => protocolDomainService.resultMonitorOverview()),
  listOptimizeIterations: wrap(async (query) => protocolDomainService.listOptimizeIterations(query)),
  reviewSubmit: wrap(async (_q, body) => protocolDomainService.reviewSubmit(body)),
  listReviews: wrap(async (query) => protocolDomainService.listReviews(query)),
  listErrorCorpus: wrap(async (query) => protocolDomainService.listErrorCorpus(query)),

  createSample: wrap(async (_q, body) => protocolDomainService.createSample(body)),
  updateSample: wrap(async (_q, body) => protocolDomainService.updateSample(body)),
  deleteSample: wrap(async (_q, body) => protocolDomainService.deleteSample(body)),
  createRule: wrap(async (_q, body) => protocolDomainService.createRule(body)),
  updateRule: wrap(async (_q, body) => protocolDomainService.updateRule(body)),
  deleteRule: wrap(async (_q, body) => protocolDomainService.deleteRule(body)),
  createStrategy: wrap(async (_q, body) => protocolDomainService.createStrategy(body)),
  updateStrategy: wrap(async (_q, body) => protocolDomainService.updateStrategy(body)),
  deleteStrategy: wrap(async (_q, body) => protocolDomainService.deleteStrategy(body))
};

export default protocolFullFlowController;
