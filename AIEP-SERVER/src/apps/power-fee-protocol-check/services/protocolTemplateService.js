const templates = [
  {
    templateCode: 'TMP_PREPAID_A',
    templateName: '预存交费协议模板',
    templateType: 'TYPE_A',
    versionNo: '1.0.0',
    status: 'enabled',
    updatedAt: '2026-04-28 10:00:00'
  },
  {
    templateCode: 'TMP_HIGH_POSTPAID_B',
    templateName: '高压后付费协议模板',
    templateType: 'TYPE_B',
    versionNo: '1.1.0',
    status: 'enabled',
    updatedAt: '2026-04-28 11:30:00'
  },
  {
    templateCode: 'TMP_LOW_POSTPAID_C',
    templateName: '低压后付费协议模板',
    templateType: 'TYPE_C',
    versionNo: '0.9.2',
    status: 'draft',
    updatedAt: '2026-04-28 14:20:00'
  }
];

function matchType(item, type) {
  if (!type) return true;
  return item.templateType === type;
}

function paginate(list, pageNo, pageSize) {
  const start = (pageNo - 1) * pageSize;
  return list.slice(start, start + pageSize);
}

const protocolTemplateService = {
  async listTemplates(query = {}) {
    const pageNo = Number(query.pageNo || 1);
    const pageSize = Number(query.pageSize || 10);
    const type = query.type || '';

    const filtered = templates.filter((item) => matchType(item, type));
    const rows = paginate(filtered, pageNo, pageSize);

    return {
      pageNo,
      pageSize,
      total: filtered.length,
      list: rows
    };
  }
};

export default protocolTemplateService;
