import protocolDomainService from './protocolDomainService.js';

const protocolTemplateService = {
  async listTemplates(query = {}) {
    return protocolDomainService.listTemplates(query || {});
  }
};

export default protocolTemplateService;
