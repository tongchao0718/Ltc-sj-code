import protocolTemplateService from '../services/protocolTemplateService.js';

function buildRequestId() {
  return `req_${Date.now()}`;
}

const protocolTemplateController = {
  async list(req, res) {
    try {
      const data = await protocolTemplateService.listTemplates(req.query || {});
      res.status(200).json({
        code: 0,
        message: 'success',
        data,
        requestId: buildRequestId()
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message || 'internal error',
        data: null,
        requestId: buildRequestId()
      });
    }
  }
};

export default protocolTemplateController;
