/** 售电公司 Mock 主数据与业务数据 */

export const COMPANIES = [
  {
    id: 'c001',
    name: '山东华电售电有限公司',
    creditCode: '91370100MA3CXXXX01',
    registeredCapital: '5000万元',
    foundedAt: '2018-03-15',
    address: '济南市历下区经十路1000号',
    legalPerson: '张伟',
    companyType: '有限责任公司',
    businessScope: '售电业务；电力设施承装承修；能源管理咨询',
    term: '2018-03-15 至 长期',
    region: '济南',
    creditLevel: 'A',
    registeredCapitalLevel: '5000万元-2亿元'
  },
  {
    id: 'c002',
    name: '青岛绿能售电股份有限公司',
    creditCode: '91370200MA3CXXXX02',
    registeredCapital: '2.1亿元',
    foundedAt: '2016-08-20',
    address: '青岛市市南区香港中路88号',
    legalPerson: '李娜',
    companyType: '股份有限公司',
    businessScope: '售电；增量配电；综合能源服务',
    term: '2016-08-20 至 2046-08-19',
    region: '青岛',
    creditLevel: 'A',
    registeredCapitalLevel: '2亿元以上'
  },
  {
    id: 'c003',
    name: '烟台港能售电有限公司',
    creditCode: '91370600MA3CXXXX03',
    registeredCapital: '3000万元',
    foundedAt: '2019-11-01',
    address: '烟台市芝罘区南大街120号',
    legalPerson: '王强',
    companyType: '有限责任公司',
    businessScope: '售电业务',
    term: '2019-11-01 至 长期',
    region: '烟台',
    creditLevel: 'B',
    registeredCapitalLevel: '5000万元以下'
  },
  {
    id: 'c004',
    name: '潍坊恒信售电有限公司',
    creditCode: '91370700MA3CXXXX04',
    registeredCapital: '8000万元',
    foundedAt: '2017-05-10',
    address: '潍坊市奎文区胜利东街200号',
    legalPerson: '赵敏',
    companyType: '有限责任公司',
    businessScope: '售电；电力交易咨询',
    term: '2017-05-10 至 长期',
    region: '潍坊',
    creditLevel: 'B',
    registeredCapitalLevel: '5000万元-2亿元'
  },
  {
    id: 'c005',
    name: '临沂沂蒙售电有限公司',
    creditCode: '91371300MA3CXXXX05',
    registeredCapital: '4500万元',
    foundedAt: '2020-02-28',
    address: '临沂市兰山区金雀山路50号',
    legalPerson: '刘洋',
    companyType: '有限责任公司',
    businessScope: '售电业务',
    term: '2020-02-28 至 长期',
    region: '临沂',
    creditLevel: 'C',
    registeredCapitalLevel: '5000万元以下'
  }
]

export const BUSINESS_INFO_CATEGORIES = [
  '企业基本信息', '法律诉讼案件', '限制消费令', '失信被执行人', '破产重整',
  '经营异常', '行政处罚', '严重违法', '股权质押', '税收违法',
  '动产抵押', '欠税公告', '司法拍卖', '土地质押'
]

/** 按企业与分类生成工商接入 Mock 明细 */
export function buildBusinessInfoCategory(company, category, index) {
  const base = { companyName: company.name, creditCode: company.creditCode, dataSource: '天眼查', syncTime: '2026-06-06 08:30:00' }
  const seeds = {
    法律诉讼案件: [
      { caseNo: '（2025）鲁0102民初1234号', caseType: '买卖合同纠纷', role: '被告', court: '济南市历下区人民法院', filingDate: '2025-03-12', status: '审理中' },
      { caseNo: '（2024）鲁0203民初567号', caseType: '服务合同纠纷', role: '原告', court: '青岛市市南区人民法院', filingDate: '2024-11-08', status: '已结案' }
    ],
    限制消费令: [
      { docNo: '（2025）鲁01执限123号', subject: company.legalPerson, court: '济南市中级人民法院', issueDate: '2025-01-20', status: '已解除' }
    ],
    失信被执行人: [],
    破产重整: [],
    经营异常: [
      { reason: '未按规定公示年度报告', listedDate: '2024-06-15', authority: '济南市市场监督管理局', status: '已移出', removeDate: '2024-09-10' }
    ],
    行政处罚: [
      { docNo: '济市监罚〔2024〕018号', reason: '广告内容不符合规定', amount: '2万元', authority: '济南市市场监督管理局', penaltyDate: '2024-08-22' }
    ],
    严重违法: [],
    股权质押: [
      { pledgor: company.legalPerson, pledgee: '某银行济南分行', amount: '500万股', regDate: '2025-02-01', status: '有效' }
    ],
    税收违法: [],
    动产抵押: [
      { regNo: '370100202501001', amount: '800万元', scope: '生产设备', regDate: '2025-01-15', status: '有效' }
    ],
    欠税公告: [],
    司法拍卖: [
      { title: '办公设备一批', court: '济南市历下区人民法院', startPrice: '35万元', auctionDate: '2025-05-20', status: '已成交' }
    ],
    土地质押: []
  }

  if (category === '企业基本信息') {
    return { displayType: 'form', count: 1, rows: [company] }
  }

  let rows = seeds[category] || []
  // 按企业 id 微调条数，使不同企业展示略有差异
  const mod = parseInt(company.id.replace(/\D/g, ''), 10) || 1
  if (rows.length > 1 && mod % 2 === 0) rows = rows.slice(0, 1)
  if (category === '失信被执行人' && mod % 3 === 0) {
    rows = [{ docNo: '（2023）鲁01执恢88号', reason: '有履行能力而拒不履行', court: '济南市中级人民法院', listedDate: '2023-12-01', status: '已移除' }]
  }

  const columnMap = {
    法律诉讼案件: [
      { key: 'caseNo', label: '案号' }, { key: 'caseType', label: '案件类型' }, { key: 'role', label: '诉讼地位' },
      { key: 'court', label: '审理法院' }, { key: 'filingDate', label: '立案日期' }, { key: 'status', label: '状态', tag: true }
    ],
    限制消费令: [
      { key: 'docNo', label: '文书文号' }, { key: 'subject', label: '限制对象' }, { key: 'court', label: '执行法院' },
      { key: 'issueDate', label: '发布日期' }, { key: 'status', label: '状态', tag: true }
    ],
    失信被执行人: [
      { key: 'docNo', label: '案号' }, { key: 'reason', label: '失信情形' }, { key: 'court', label: '执行法院' },
      { key: 'listedDate', label: '列入日期' }, { key: 'status', label: '状态', tag: true }
    ],
    经营异常: [
      { key: 'reason', label: '列入原因' }, { key: 'listedDate', label: '列入日期' }, { key: 'authority', label: '决定机关' },
      { key: 'status', label: '状态', tag: true }, { key: 'removeDate', label: '移出日期' }
    ],
    行政处罚: [
      { key: 'docNo', label: '处罚文号' }, { key: 'reason', label: '处罚事由' }, { key: 'amount', label: '处罚金额' },
      { key: 'authority', label: '处罚机关' }, { key: 'penaltyDate', label: '处罚日期' }
    ],
    股权质押: [
      { key: 'pledgor', label: '出质人' }, { key: 'pledgee', label: '质权人' }, { key: 'amount', label: '出质数额' },
      { key: 'regDate', label: '登记日期' }, { key: 'status', label: '状态', tag: true }
    ],
    动产抵押: [
      { key: 'regNo', label: '登记编号' }, { key: 'amount', label: '担保金额' }, { key: 'scope', label: '抵押物' },
      { key: 'regDate', label: '登记日期' }, { key: 'status', label: '状态', tag: true }
    ],
    司法拍卖: [
      { key: 'title', label: '标的名称' }, { key: 'court', label: '处置法院' }, { key: 'startPrice', label: '起拍价' },
      { key: 'auctionDate', label: '拍卖日期' }, { key: 'status', label: '状态', tag: true }
    ]
  }

  return {
    displayType: 'table',
    count: rows.length,
    columns: columnMap[category] || [
      { key: 'docNo', label: '文号' }, { key: 'reason', label: '事由' }, { key: 'status', label: '状态', tag: true }
    ],
    rows: rows.map((r, i) => ({ id: `${category}-${index}-${i}`, ...base, ...r }))
  }
}

export function seedArrears() {
  return COMPANIES.flatMap((c, i) => [
    {
      id: `ar-${c.id}-1`,
      companyId: c.id,
      companyName: c.name,
      creditCode: c.creditCode,
      period: '2025-12',
      amount: 120000 + i * 15000,
      status: i % 2 === 0 ? '未结清' : '已结清',
      overdueDays: i % 2 === 0 ? 15 + i * 3 : 0
    }
  ])
}

export function seedGuarantees() {
  const today = new Date()
  return COMPANIES.map((c, i) => {
    const expire = new Date(today)
    expire.setDate(expire.getDate() + (i === 0 ? 12 : i === 1 ? 45 : 90 + i * 10))
    const diffDays = (expire - today) / 86400000
    const issue = new Date(expire)
    issue.setFullYear(issue.getFullYear() - 1)
    return {
      id: `g-${c.id}`,
      companyId: c.id,
      companyName: c.name,
      creditCode: c.creditCode,
      guaranteeNo: `BH2025${String(i + 1).padStart(4, '0')}`,
      amount: 500000 + i * 100000,
      bank: '中国工商银行济南分行',
      issueDate: issue.toISOString().slice(0, 10),
      expireDate: expire.toISOString().slice(0, 10),
      status: diffDays < 0 ? '到期' : diffDays <= 30 ? '临期' : '有效',
      region: c.region,
      creditLevel: c.creditLevel,
      registeredCapital: c.registeredCapital
    }
  })
}

export function seedAgencyScale() {
  return COMPANIES.map((c, i) => ({
    id: `as-${c.id}`,
    companyId: c.id,
    companyName: c.name,
    yearMonth: '2026-05',
    userCount: 1200 + i * 350,
    volume: 85000 + i * 12000,
    yoy: (5 + i).toFixed(1),
    rank: i + 1,
    userMarketShare: `${(8 + i * 1.2).toFixed(1)}%`,
    volumeMarketShare: `${(6 + i * 0.8).toFixed(1)}%`,
    mom: `${(1.2 + i * 0.3).toFixed(1)}%`,
    lastYearVolume: 78000 + i * 10000,
    top5Share: `${(32 + i).toFixed(1)}%`
  }))
}

export function seedTradeSettlement() {
  return COMPANIES.map((c, i) => ({
    id: `ts-${c.id}`,
    companyId: c.id,
    companyName: c.name,
    yearMonth: '2026-05',
    settleVolume: 11000 + i * 1500,
    settleFee: 4500000 + i * 520000,
    deviation: (1.2 + i * 0.3).toFixed(1),
    status: '已结算',
    purchaseCost: 4200000 + i * 500000,
    purchaseAvgPrice: 0.385 + i * 0.005,
    salesRevenue: 4500000 + i * 520000,
    salesAvgPrice: 0.412 + i * 0.004,
    payableFee: 280000 + i * 35000,
    unitMargin: 0.027 + i * 0.002
  }))
}

export function seedDailyPnl() {
  const rows = []
  COMPANIES.forEach((c, ci) => {
    for (let d = 1; d <= 28; d++) {
      const date = `2026-05-${String(d).padStart(2, '0')}`
      const purchaseCost = 140000 + d * 1200 + ci * 5000
      const salesRevenue = 155000 + d * 1300 + ci * 5500
      const profit = salesRevenue - purchaseCost
      rows.push({
        id: `pnl-${c.id}-${d}`,
        companyId: c.id,
        companyName: c.name,
        date,
        yearMonth: '2026-05',
        purchaseCost,
        salesRevenue,
        profit,
        margin: ((profit / salesRevenue) * 100).toFixed(2)
      })
    }
  })
  return rows
}

export function seedIntegrationTasks() {
  return {
    tianyancha: { name: '天眼查', lastSync: '2026-06-06 08:30:00', status: 'success', nextSync: '2026-06-07 08:00:00', count: 5 },
    tradeCenter: { name: '山东电力交易中心', lastSync: '2026-06-06 07:15:00', status: 'success', nextSync: '2026-06-07 07:00:00', count: 5 },
    marketing: { name: '营销2.0数据中台', lastSync: '2026-06-06 06:00:00', status: 'success', nextSync: '2026-06-07 06:00:00', count: 5 }
  }
}

export function seedAgreements() {
  return COMPANIES.slice(0, 4).map((c, i) => ({
    id: `ag-${c.id}`,
    companyId: c.id,
    companyName: c.name,
    code: `SD-XY-2025-${String(i + 1).padStart(4, '0')}`,
    templateVersion: 'V2.1',
    status: ['已生效', '待审核', '待续签', '已生效'][i],
    signedAt: '2025-01-15',
    expireAt: '2026-12-31',
    signDate: '2025-01-15',
    expireDate: '2026-12-31',
    issueDay: 15,
    payDay: 25,
    transferDay: 28,
    account: '6222 **** **** 1234'
  }))
}

export function seedReportTemplates() {
  return [
    { id: 'rt-1', name: '售电公司月度经营报告', scene: '经营分析', sections: 8, status: '启用', description: '涵盖购售电、代理规模、损益等核心经营指标', updatedAt: '2026-01-10 10:00:00' },
    { id: 'rt-2', name: '履约风险评估报告', scene: '风险管控', sections: 6, status: '启用', description: '保函、欠费、司法风险综合评估', updatedAt: '2026-02-15 14:30:00' },
    { id: 'rt-3', name: '区域市场对比报告', scene: '市场分析', sections: 5, status: '启用', description: '多企业关键指标横向对比', updatedAt: '2026-03-20 09:00:00' }
  ]
}

export function seedProfiles() {
  return COMPANIES.map((c, i) => ({
    companyId: c.id,
    companyName: c.name,
    region: c.region,
    creditLevel: c.creditLevel,
    tags: i === 4 ? ['欠费预警', '信用C级'] : i === 2 ? ['保函临期'] : ['运行正常'],
    summary: [
      { label: '代理用户', value: `${1200 + i * 350} 户` },
      { label: '结算电量', value: `${(11000 + i * 1500).toLocaleString()} MWh` },
      { label: '信用等级', value: c.creditLevel },
      { label: '风险标签', value: i === 4 ? '欠费' : '正常' }
    ],
    meta: {
      scale: c.registeredCapitalLevel,
      background: i % 2 === 0 ? '民营' : '国有',
      tradeMode: ['长协型', '竞价型', '现货型'][i % 3]
    },
    history: [
      { at: '2026-05-01', tag: '信用等级', from: 'B', to: c.creditLevel },
      { at: '2026-04-15', tag: '市场份额', from: '区域前20', to: i < 2 ? '区域前10' : '行业前50' }
    ]
  }))
}
