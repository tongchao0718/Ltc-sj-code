/** 综合查询模块配置 */
export const queryConfigs = {
  basic: {
    title: '基础信息查询',
    desc: '按企业名称、统一社会信用代码查询售电公司工商登记信息',
    mode: 'companies',
    columns: [
      { key: 'name', label: '企业名称' },
      { key: 'creditCode', label: '统一社会信用代码' },
      { key: 'region', label: '所属区域' },
      { key: 'registeredCapital', label: '注册资本' },
      { key: 'creditLevel', label: '信用等级' },
      { key: 'legalPerson', label: '法定代表人' }
    ],
    filters: [{ key: 'keyword', label: '关键词', type: 'text', placeholder: '企业名称/信用代码' }]
  },
  arrears: {
    title: '欠费记录查询',
    desc: '查询售电公司历史欠费及结清状态',
    dataset: 'arrears',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'creditCode', label: '信用代码' },
      { key: 'period', label: '账期' },
      { key: 'amount', label: '欠费金额(元)', format: 'money' },
      { key: 'status', label: '状态', tag: true },
      { key: 'overdueDays', label: '逾期天数' }
    ],
    filters: [
      { key: 'companyName', label: '企业名称', type: 'text' },
      { key: 'yearMonth', label: '账期', type: 'month', placeholder: '2025-12' },
      { key: 'status', label: '状态', type: 'select', options: ['已结清', '未结清'] }
    ]
  },
  guarantee: {
    title: '履约保函查询',
    desc: '查询履约保函金额、有效期及临期状态',
    dataset: 'guarantees',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'amount', label: '保函金额(元)', format: 'money' },
      { key: 'bank', label: '出具银行' },
      { key: 'issueDate', label: '出具日期' },
      { key: 'expireDate', label: '到期日期' },
      { key: 'status', label: '状态', tag: true }
    ],
    filters: [
      { key: 'companyName', label: '企业名称', type: 'text' },
      { key: 'expiryDays', label: '临期天数≤', type: 'number', placeholder: '30' },
      { key: 'status', label: '状态', type: 'select', options: ['有效', '临期', '到期'] }
    ]
  },
  agencyScale: {
    title: '代理规模查询',
    desc: '查询代理用户数量、电量规模及同比',
    dataset: 'agencyScale',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'yearMonth', label: '月份' },
      { key: 'userCount', label: '代理用户数' },
      { key: 'volume', label: '代理电量(MWh)' },
      { key: 'yoy', label: '同比(%)' },
      { key: 'rank', label: '区域排名' }
    ],
    filters: [
      { key: 'companyName', label: '企业名称', type: 'text' },
      { key: 'yearMonth', label: '月份', type: 'month' }
    ]
  },
  tradeSettlement: {
    title: '交易结算查询',
    desc: '查询月度交易结算电量、电费及偏差',
    dataset: 'tradeSettlement',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'yearMonth', label: '月份' },
      { key: 'settleVolume', label: '结算电量(MWh)' },
      { key: 'settleFee', label: '结算电费(元)', format: 'money' },
      { key: 'deviation', label: '偏差率(%)' },
      { key: 'status', label: '状态', tag: true }
    ],
    filters: [
      { key: 'companyName', label: '企业名称', type: 'text' },
      { key: 'yearMonth', label: '月份', type: 'month' }
    ]
  },
  purchaseCost: {
    title: '购电成本明细',
    desc: '按企业查看购电成本分项明细（15+ 科目）',
    mode: 'purchaseCost',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'yearMonth', label: '月份' },
      { key: 'purchaseCost', label: '购电成本(元)', format: 'money' },
      { key: 'salesRevenue', label: '售电收入(元)', format: 'money' }
    ],
    filters: [{ key: 'companyName', label: '企业名称', type: 'text' }]
  },
  retailPackage: {
    title: '售电套餐查询',
    desc: '查询企业零售套餐类型、用户数及均价',
    mode: 'retailPackage',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'yearMonth', label: '月份' },
      { key: 'type', label: '套餐类型' },
      { key: 'name', label: '套餐名称' },
      { key: 'users', label: '用户数' },
      { key: 'volume', label: '电量(MWh)' },
      { key: 'avgPrice', label: '均价(元/kWh)' }
    ],
    filters: [{ key: 'companyName', label: '企业名称', type: 'text' }]
  },
  riskCredit: {
    title: '风险与信用查询',
    desc: '司法风险、行政处罚与信用等级综合查询',
    mode: 'riskCredit',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'yearMonth', label: '月份' },
      { key: 'lawsuits', label: '诉讼案件' },
      { key: 'executed', label: '被执行' },
      { key: 'dishonest', label: '失信' },
      { key: 'creditLevel', label: '信用等级', tag: true },
      { key: 'creditReason', label: '评级说明' }
    ],
    filters: [{ key: 'companyName', label: '企业名称', type: 'text' }]
  },
  dailyPnl: {
    title: '月内损益查询',
    desc: '查询售电公司月内每日损益曲线数据',
    dataset: 'dailyPnl',
    columns: [
      { key: 'companyName', label: '企业名称' },
      { key: 'date', label: '日期' },
      { key: 'purchaseCost', label: '购电成本(元)', format: 'money' },
      { key: 'salesRevenue', label: '售电收入(元)', format: 'money' },
      { key: 'profit', label: '损益(元)', format: 'money' },
      { key: 'margin', label: '毛利率(%)' }
    ],
    filters: [
      { key: 'companyName', label: '企业名称', type: 'text' },
      { key: 'yearMonth', label: '月份', type: 'month' }
    ]
  }
}
