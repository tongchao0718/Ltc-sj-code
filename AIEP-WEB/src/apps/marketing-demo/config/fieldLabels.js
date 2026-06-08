/** 详情/弹窗字段中文标签（全应用统一） */
export const FIELD_LABELS = {
  id: '记录编号',
  companyId: '企业编号',
  name: '企业名称',
  companyName: '企业名称',
  creditCode: '统一社会信用代码',
  registeredCapital: '注册资本',
  registeredCapitalLevel: '注册资本档位',
  foundedAt: '成立日期',
  address: '注册地址',
  legalPerson: '法定代表人',
  companyType: '企业类型',
  businessScope: '经营范围',
  term: '营业期限',
  region: '所属区域',
  creditLevel: '信用等级',
  period: '账期',
  yearMonth: '月份',
  amount: '欠费金额(元)',
  status: '状态',
  overdueDays: '逾期天数',
  guaranteeNo: '保函编号',
  bank: '出具银行',
  issueDate: '出具日期',
  expireDate: '到期日期',
  userCount: '代理用户数',
  volume: '代理电量(MWh)',
  yoy: '同比(%)',
  rank: '区域排名',
  settleVolume: '结算电量(MWh)',
  settleFee: '结算电费(元)',
  deviation: '偏差率(%)',
  purchaseCost: '购电成本(元)',
  salesRevenue: '售电收入(元)',
  purchaseAvgPrice: '购电均价(元/kWh)',
  salesAvgPrice: '售电均价(元/kWh)',
  payableFee: '应付费用(元)',
  unitMargin: '单位毛利(元/kWh)',
  type: '套餐类型',
  packageName: '套餐名称',
  users: '用户数',
  avgPrice: '均价(元/kWh)',
  lawsuits: '诉讼案件数',
  executed: '被执行记录',
  dishonest: '失信记录',
  penalties: '行政处罚',
  creditReason: '评级说明',
  creditRecovery: '信用修复',
  date: '日期',
  profit: '损益(元)',
  margin: '毛利率(%)',
  code: '协议编号',
  templateVersion: '模板版本',
  signedAt: '签署日期',
  signDate: '签署日期',
  expireAt: '到期日期',
  expireDate: '协议到期日',
  issueDay: '出账日',
  payDay: '缴费日',
  transferDay: '过户日',
  account: '结算账户',
  remark: '备注',
  fileName: '附件名称',
  updatedAt: '更新时间'
}

/** 详情弹窗中不展示的内部字段 */
export const HIDDEN_DETAIL_KEYS = new Set(['id', 'companyId'])

/** 企业基础信息详情字段顺序 */
export const COMPANY_DETAIL_FIELDS = [
  { key: 'name', label: '企业名称' },
  { key: 'creditCode', label: '统一社会信用代码' },
  { key: 'region', label: '所属区域' },
  { key: 'registeredCapital', label: '注册资本' },
  { key: 'registeredCapitalLevel', label: '注册资本档位' },
  { key: 'creditLevel', label: '信用等级' },
  { key: 'legalPerson', label: '法定代表人' },
  { key: 'companyType', label: '企业类型' },
  { key: 'foundedAt', label: '成立日期' },
  { key: 'term', label: '营业期限' },
  { key: 'address', label: '注册地址' },
  { key: 'businessScope', label: '经营范围' }
]

export function formatDetailValue(value, format) {
  if (value === null || value === undefined || value === '') return '-'
  if (format === 'money' && typeof value === 'number') {
    return `${value.toLocaleString('zh-CN')} 元`
  }
  if (typeof value === 'number' && format !== 'raw') {
    return value.toLocaleString('zh-CN')
  }
  return String(value)
}

/**
 * 将数据对象转为详情展示项（中文标签、过滤内部字段）
 * @param {object} data
 * @param {Array<{key,label,format?,tag?}>} fieldDefs 优先使用的字段定义
 */
export function buildDetailItems(data, fieldDefs) {
  if (!data || typeof data !== 'object') return []

  let defs = fieldDefs
  if (!defs?.length) {
    defs = Object.keys(data)
      .filter((k) => !HIDDEN_DETAIL_KEYS.has(k))
      .map((k) => ({
        key: k,
        label: FIELD_LABELS[k] || k,
        format: typeof data[k] === 'number' && k.toLowerCase().includes('amount') ? 'money' : undefined
      }))
  }

  return defs
    .filter((d) => {
      const v = data[d.key]
      return v !== undefined && v !== null && v !== ''
    })
    .map((d) => ({
      label: d.label || FIELD_LABELS[d.key] || d.key,
      value: formatDetailValue(data[d.key], d.format),
      raw: data[d.key],
      tag: d.tag
    }))
}

/** 根据查询列配置 + 行数据补全详情字段 */
export function buildDetailItemsFromRow(row, columns = [], extraFields = []) {
  const colKeys = new Set(columns.map((c) => c.key))
  const defs = [
    ...columns,
    ...extraFields,
    ...Object.keys(row)
      .filter((k) => !colKeys.has(k) && !HIDDEN_DETAIL_KEYS.has(k) && FIELD_LABELS[k])
      .map((k) => ({ key: k, label: FIELD_LABELS[k] }))
  ]
  const seen = new Set()
  const unique = defs.filter((d) => {
    if (seen.has(d.key)) return false
    seen.add(d.key)
    return true
  })
  return buildDetailItems(row, unique)
}
