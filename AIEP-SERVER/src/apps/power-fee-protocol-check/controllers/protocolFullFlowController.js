import protocolFullFlowService from '../services/protocolFullFlowService.js';

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
  res.status(500).json({
    code: 500,
    message: error.message || 'internal error',
    data: null,
    requestId: requestId()
  });
}

const protocolFullFlowController = {
  async annotateSample(req, res) {
    try {
      const data = await protocolFullFlowService.annotateSample(req.body || {});
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  },

  async publishRule(req, res) {
    try {
      const data = await protocolFullFlowService.publishRule(req.body || {});
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  },

  async generateTask(req, res) {
    try {
      const data = await protocolFullFlowService.generateTask(req.body || {});
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  },

  async governIssue(req, res) {
    try {
      const data = await protocolFullFlowService.governIssue(req.body || {});
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  },

  async iterateOptimize(req, res) {
    try {
      const data = await protocolFullFlowService.iterateOptimize(req.body || {});
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  },

  async runParse(req, res) {
    try {
      const data = await protocolFullFlowService.runParse(req.body || {});
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  },

  async runVerify(req, res) {
    try {
      const data = await protocolFullFlowService.runVerify(req.body || {});
      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  }
};

export default protocolFullFlowController;
