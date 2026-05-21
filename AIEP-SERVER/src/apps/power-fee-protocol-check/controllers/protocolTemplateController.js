import protocolTemplateService from '../services/protocolTemplateService.js';
import protocolDomainService from '../services/protocolDomainService.js';

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
  },

  async listFields(req, res) {
    try {
      const data = protocolDomainService.listTemplateFields(req.query || {});
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
  },

  async listBaseline(req, res) {
    try {
      const data = protocolDomainService.listBaselines(req.query || {});
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
  },

  async create(req, res) {
    try {
      const data = await protocolDomainService.createTemplate(req.body || {});
      res.status(200).json({
        code: 0,
        message: 'success',
        data,
        requestId: buildRequestId()
      });
    } catch (error) {
      const status = error.code === 400 ? 400 : error.code === 404 ? 404 : 500;
      res.status(status).json({
        code: error.code === 400 ? 400 : error.code === 404 ? 404 : 500,
        message: error.message || 'internal error',
        data: null,
        requestId: buildRequestId()
      });
    }
  },

  async update(req, res) {
    try {
      const data = await protocolDomainService.updateTemplate(req.body || {});
      res.status(200).json({
        code: 0,
        message: 'success',
        data,
        requestId: buildRequestId()
      });
    } catch (error) {
      const status = error.code === 400 ? 400 : error.code === 404 ? 404 : 500;
      res.status(status).json({
        code: error.code === 400 ? 400 : error.code === 404 ? 404 : 500,
        message: error.message || 'internal error',
        data: null,
        requestId: buildRequestId()
      });
    }
  },

  async remove(req, res) {
    try {
      const data = await protocolDomainService.deleteTemplate(req.body || {});
      res.status(200).json({
        code: 0,
        message: 'success',
        data,
        requestId: buildRequestId()
      });
    } catch (error) {
      const status = error.code === 400 ? 400 : error.code === 404 ? 404 : 500;
      res.status(status).json({
        code: error.code === 400 ? 400 : error.code === 404 ? 404 : 500,
        message: error.message || 'internal error',
        data: null,
        requestId: buildRequestId()
      });
    }
  }
};

export default protocolTemplateController;
