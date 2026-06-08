/** CRUD 页面配置 */
export const REGIONS = ['济南', '青岛', '烟台', '潍坊', '临沂', '淄博', '济宁', '泰安']

export const crudConfigs = {
  companies: {
    title: '基础信息管理',
    listTitle: '售电企业列表',
    entityName: '企业',
    apiKey: 'companies',
    filters: [
      { key: 'name', label: '企业名称', type: 'text', placeholder: '请输入企业名称' },
      { key: 'creditCode', label: '信用代码', type: 'text', placeholder: '请输入信用代码' },
      { key: 'region', label: '所属区域', type: 'select', options: REGIONS }
    ],
    columns: [
      { key: 'name', label: '企业名称' },
      { key: 'creditCode', label: '统一社会信用代码' },
      { key: 'region', label: '所属区域' },
      { key: 'registeredCapital', label: '注册资本' },
      { key: 'creditLevel', label: '信用等级', tag: true },
      { key: 'legalPerson', label: '法定代表人' }
    ],
    formFields: [
      { key: 'name', label: '企业名称', required: true, span: 2 },
      { key: 'creditCode', label: '统一社会信用代码', required: true },
      { key: 'region', label: '所属区域', type: 'select', options: REGIONS, required: true },
      { key: 'registeredCapital', label: '注册资本', required: true },
      { key: 'registeredCapitalLevel', label: '注册资本档位', type: 'select', options: ['5000万元以下', '5000万元-2亿元', '2亿元以上'] },
      { key: 'creditLevel', label: '信用等级', type: 'select', options: ['A', 'B', 'C'], required: true },
      { key: 'legalPerson', label: '法定代表人', required: true },
      { key: 'companyType', label: '企业类型', type: 'select', options: ['有限责任公司', '股份有限公司'] },
      { key: 'foundedAt', label: '成立日期', type: 'date' },
      { key: 'term', label: '营业期限', span: 2 },
      { key: 'address', label: '注册地址', span: 2 },
      { key: 'businessScope', label: '经营范围', type: 'textarea', span: 2 }
    ],
    detailFields: [
      { key: 'name', label: '企业名称' },
      { key: 'creditCode', label: '统一社会信用代码' },
      { key: 'region', label: '所属区域' },
      { key: 'registeredCapital', label: '注册资本' },
      { key: 'registeredCapitalLevel', label: '注册资本档位' },
      { key: 'creditLevel', label: '信用等级', tag: true },
      { key: 'legalPerson', label: '法定代表人' },
      { key: 'companyType', label: '企业类型' },
      { key: 'foundedAt', label: '成立日期' },
      { key: 'term', label: '营业期限', span: 2 },
      { key: 'address', label: '注册地址', span: 2 },
      { key: 'businessScope', label: '经营范围', span: 2 }
    ]
  },
  reportTemplates: {
    title: '报告模板管理',
    listTitle: '报告模板列表',
    entityName: '报告模板',
    apiKey: 'reportTemplates',
    filters: [
      { key: 'name', label: '模板名称', type: 'text', placeholder: '请输入模板名称' },
      { key: 'scene', label: '适用场景', type: 'text', placeholder: '请输入场景' },
      { key: 'status', label: '状态', type: 'select', options: ['启用', '停用'] }
    ],
    columns: [
      { key: 'name', label: '模板名称' },
      { key: 'scene', label: '适用场景' },
      { key: 'sections', label: '章节数' },
      { key: 'status', label: '状态', tag: true }
    ],
    formFields: [
      { key: 'name', label: '模板名称', required: true, span: 2 },
      { key: 'scene', label: '适用场景', required: true },
      { key: 'sections', label: '章节数', type: 'number', required: true },
      { key: 'status', label: '状态', type: 'select', options: ['启用', '停用'], required: true },
      { key: 'description', label: '模板说明', type: 'textarea', span: 2 }
    ],
    detailFields: [
      { key: 'name', label: '模板名称', span: 2 },
      { key: 'scene', label: '适用场景' },
      { key: 'sections', label: '章节数' },
      { key: 'status', label: '状态', tag: true },
      { key: 'description', label: '模板说明', span: 2 },
      { key: 'updatedAt', label: '更新时间', span: 2 }
    ]
  },
  agreementTemplates: {
    title: '结算协议模板管理',
    listTitle: '协议模板列表',
    entityName: '协议模板',
    apiKey: 'agreementTemplates',
    filters: [
      { key: 'name', label: '模板名称', type: 'text' },
      { key: 'scope', label: '适用范围', type: 'text' },
      { key: 'status', label: '状态', type: 'select', options: ['生效', '草稿', '停用'] }
    ],
    columns: [
      { key: 'name', label: '模板名称' },
      { key: 'version', label: '版本' },
      { key: 'scope', label: '适用范围' },
      { key: 'effectiveAt', label: '生效日期' },
      { key: 'status', label: '状态', tag: true }
    ],
    formFields: [
      { key: 'name', label: '模板名称', required: true, span: 2 },
      { key: 'version', label: '版本号', required: true, placeholder: '如 V2.1' },
      { key: 'scope', label: '适用范围', required: true, placeholder: '如 全省、济南' },
      { key: 'effectiveAt', label: '生效日期', type: 'date', required: true },
      { key: 'status', label: '状态', type: 'select', options: ['生效', '草稿', '停用'], required: true },
      { key: 'remark', label: '备注说明', type: 'textarea', span: 2 }
    ],
    detailFields: [
      { key: 'name', label: '模板名称', span: 2 },
      { key: 'version', label: '版本号' },
      { key: 'scope', label: '适用范围' },
      { key: 'effectiveAt', label: '生效日期' },
      { key: 'status', label: '状态', tag: true },
      { key: 'remark', label: '备注说明', span: 2 },
      { key: 'updatedAt', label: '更新时间', span: 2 }
    ]
  }
}
