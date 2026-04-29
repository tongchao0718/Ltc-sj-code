import axios from 'axios';

const mockList = [
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
  }
];

function filterByType(list, type) {
  if (!type) return list;
  return list.filter((item) => item.templateType === type);
}

export async function fetchProtocolTemplateList(params = {}) {
  const query = {
    type: params.type || '',
    pageNo: params.pageNo || 1,
    pageSize: params.pageSize || 10
  };

  try {
    const response = await axios.get('/api/protocol/template/list', {
      params: query,
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    const filtered = filterByType(mockList, query.type);
    return {
      code: 0,
      message: 'success(mock)',
      data: {
        pageNo: Number(query.pageNo),
        pageSize: Number(query.pageSize),
        total: filtered.length,
        list: filtered
      },
      requestId: `mock_${Date.now()}`
    };
  }
}
