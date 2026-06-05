<template>
  <div class="preview-page">
    <header class="preview-head">
      <div>
        <h1>APP 移动端界面原型</h1>
        <p>基于 04-界面设计文档 · iOS/Android 双端视觉稿（375px）</p>
      </div>
      <a-space>
        <a-tag color="arcoblue">P-APP MVP</a-tag>
        <a-button type="outline" @click="pushCrm('/login')">返回管理台</a-button>
      </a-space>
    </header>

    <div class="phone-shell">
      <!-- 登录态模拟 -->
      <header v-if="screen === 'login'" class="m-header">
        <strong class="m-title">登录</strong>
      </header>
      <header v-else class="m-header">
        <button v-if="subScreen" type="button" class="m-btn-ghost" @click="subScreen = null">返回</button>
        <span v-else class="m-btn-ghost" />
        <strong class="m-title">{{ headerTitle }}</strong>
        <button type="button" class="m-btn-ghost" @click="onHeaderAction">{{ headerAction }}</button>
      </header>

      <div class="phone-body">
        <!-- 登录 -->
        <div v-if="screen === 'login'" class="m-login">
          <div class="m-logo">CRM</div>
          <h2>AI 智能 CRM</h2>
          <input class="m-inp" placeholder="账号 / 手机号" />
          <input class="m-inp" type="password" placeholder="密码" />
          <button type="button" class="m-btn-primary" @click="screen = 'home'; activeTab = 'home'">登录</button>
        </div>

        <!-- 首页 -->
        <div v-else-if="activeTab === 'home' && !subScreen" class="m-panel">
          <p class="m-greet">早上好，{{ crmStore.currentUser }}</p>
          <div class="m-kpi-scroll">
            <article v-for="k in kpis" :key="k.label" class="m-kpi-card">
              <span>{{ k.label }}</span>
              <strong>{{ k.value }}</strong>
            </article>
          </div>
          <section class="m-section">
            <h3>今日待办</h3>
            <article
              v-for="t in todos"
              :key="t.id"
              class="m-todo"
              :class="{ urgent: t.urgent }"
              @click="onTodoClick(t)"
            >
              <div>
                <strong>{{ t.title }}</strong>
                <small>{{ t.sub }}</small>
              </div>
              <span class="chev">›</span>
            </article>
          </section>
          <section class="m-section">
            <h3>AI 洞察</h3>
            <div class="m-insight">高意向：{{ topCustomer?.name || '—' }}（{{ topCustomer?.score || 0 }}分）</div>
          </section>
        </div>

        <!-- 客户 Tab -->
        <div v-else-if="activeTab === 'customer' && !subScreen" class="m-panel">
          <div class="m-seg">
            <button type="button" :class="{ on: custSeg === 'mine' }" @click="custSeg = 'mine'">我的客户</button>
            <button type="button" :class="{ on: custSeg === 'lead' }" @click="custSeg = 'lead'">线索</button>
            <button type="button" :class="{ on: custSeg === 'pool' }" @click="custSeg = 'pool'">公海</button>
          </div>
          <div class="m-search">🔍 搜索客户名称/手机</div>
          <article
            v-for="c in displayCustomers"
            :key="c.id"
            class="m-card"
            @click="openCustomer(c)"
          >
            <div class="m-avatar">{{ c.name.slice(0, 1) }}</div>
            <div class="m-card-body">
              <strong>{{ c.name }}</strong>
              <small>{{ c.industry }} · {{ c.owner || '公海' }}</small>
            </div>
            <span v-if="c.score" class="m-score">{{ c.score }}</span>
          </article>
        </div>

        <!-- 客户详情 -->
        <div v-else-if="subScreen === 'customer-detail'" class="m-panel m-detail">
          <div class="m-detail-head">
            <h2>{{ selectedCustomer?.name }}</h2>
            <span class="m-score-lg">{{ selectedCustomer?.score }}</span>
          </div>
          <div class="m-action-bar">
            <button type="button" @click="onCall">📞 外呼</button>
            <button type="button" @click="subScreen = 'follow-up'">✏️ 跟进</button>
            <button type="button" @click="subScreen = 'ai'">✨ AI</button>
          </div>
          <div class="m-tabs">
            <span :class="{ on: detailTab === 'overview' }" @click="detailTab = 'overview'">概览</span>
            <span :class="{ on: detailTab === 'opp' }" @click="detailTab = 'opp'">商机</span>
            <span :class="{ on: detailTab === 'timeline' }" @click="detailTab = 'timeline'">动态</span>
          </div>
          <template v-if="detailTab === 'overview'">
            <p class="m-ai-hint">AI：客户进入方案阶段，建议 48h 内发送报价摘要</p>
            <p class="m-meta-line">负责人：{{ selectedCustomer?.owner }} · 最近跟进 {{ selectedCustomer?.followAt }}</p>
          </template>
          <template v-else-if="detailTab === 'opp'">
            <article v-for="o in customerOpps" :key="o.id" class="m-opp-card small">
              <strong>{{ o.name }}</strong>
              <span class="m-stage">{{ o.stage }}</span>
            </article>
            <p v-if="!customerOpps.length" class="m-empty-hint">暂无关联商机</p>
          </template>
          <template v-else>
            <p v-if="selectedCustomer?.lastFollow" class="m-timeline-item">
              {{ selectedCustomer.lastFollow.at }} — {{ selectedCustomer.lastFollow.type }}：{{ selectedCustomer.lastFollow.content }}
            </p>
            <p class="m-timeline-item">2026-06-04 — 电话：确认方案需求</p>
          </template>
        </div>

        <!-- 商机 Tab -->
        <div v-else-if="activeTab === 'opportunity' && !subScreen" class="m-panel">
          <div class="m-seg">
            <button type="button" :class="{ on: oppView === 'list' }" @click="oppView = 'list'">列表</button>
            <button type="button" :class="{ on: oppView === 'board' }" @click="oppView = 'board'">看板</button>
          </div>
          <template v-if="oppView === 'list'">
            <article
              v-for="o in crmStore.opportunities"
              :key="o.id"
              class="m-opp-card"
              @click="openOpp(o)"
            >
              <strong>{{ o.name }}</strong>
              <small>{{ o.customer }}</small>
              <div class="m-opp-meta">
                <span class="m-stage">{{ o.stage }}</span>
                <span>{{ o.amount }}万 · {{ o.probability }}%</span>
              </div>
            </article>
          </template>
          <template v-else>
            <div v-for="col in boardColumns" :key="col.name" class="m-board-col">
              <h4>{{ col.name }} ({{ col.items.length }})</h4>
              <article v-for="o in col.items" :key="o.id" class="m-board-card" @click="openOpp(o)">
                {{ o.name }}
              </article>
            </div>
          </template>
        </div>

        <!-- 消息 Tab -->
        <div v-else-if="activeTab === 'message' && !subScreen" class="m-panel">
          <p v-if="!crmStore.messages.filter(m => !m.read).length" class="m-empty-hint">暂无未读消息</p>
          <article v-for="m in crmStore.messages.filter(x => !x.read)" :key="m.id" class="m-msg">
            <strong>{{ m.title }}</strong>
            <p>{{ m.body }}</p>
            <small>{{ m.time }}</small>
            <div v-if="m.type === 'ai'" class="m-msg-actions">
              <button type="button" @click="onAdoptMsg(m.id)">采纳</button>
              <button type="button" class="ghost" @click="onDismissMsg(m.id)">忽略</button>
            </div>
          </article>
        </div>

        <!-- 我的 Tab -->
        <div v-else-if="activeTab === 'mine' && !subScreen" class="m-panel">
          <div class="m-brief">
            <h3>本周简报</h3>
            <div class="m-brief-grid">
              <div><span>跟进</span><strong>18</strong></div>
              <div><span>赢单</span><strong>2</strong></div>
            </div>
          </div>
          <ul class="m-settings">
            <li @click="settings.notify = !settings.notify"><span>消息通知</span><span :class="{ on: settings.notify }">{{ settings.notify ? '开' : '关' }}</span></li>
            <li @click="settings.mask = !settings.mask"><span>隐私脱敏</span><span :class="{ on: settings.mask }">{{ settings.mask ? '开' : '关' }}</span></li>
            <li><span>版本</span><span>v1.0.0</span></li>
          </ul>
          <button type="button" class="m-btn-outline" @click="screen = 'login'; activeTab = 'home'">退出登录</button>
        </div>

        <!-- 快速跟进 -->
        <div v-else-if="subScreen === 'follow-up'" class="m-panel">
          <label class="m-label">活动类型</label>
          <div class="m-chips">
            <span
              v-for="t in ['电话', '拜访', '微信']"
              :key="t"
              :class="{ on: followType === t }"
              @click="followType = t"
            >{{ t }}</span>
          </div>
          <label class="m-label">跟进内容</label>
          <textarea v-model="followContent" class="m-textarea" rows="4" placeholder="记录本次沟通…" />
          <label class="m-label">下次跟进</label>
          <input v-model="followDate" class="m-inp" type="date" />
          <button type="button" class="m-btn-primary block" @click="saveFollowUp">保存</button>
        </div>

        <!-- AI 助手 -->
        <div v-else-if="subScreen === 'ai'" class="m-panel m-ai">
          <div class="m-chips">
            <span
              v-for="t in ['话术', '微信草稿', '异议']"
              :key="t"
              :class="{ on: aiTab === t }"
              @click="aiTab = t"
            >{{ t }}</span>
          </div>
          <div class="m-ai-bubble">{{ aiText }}</div>
          <div class="m-ai-actions">
            <button type="button" @click="copyAi">复制</button>
            <button type="button" class="primary" @click="adoptAi">采纳</button>
          </div>
        </div>

        <!-- 新建线索 -->
        <div v-else-if="subScreen === 'new-lead'" class="m-panel">
          <label class="m-label">线索名称</label>
          <input v-model="newLeadName" class="m-inp" placeholder="如：展会-某某科技" />
          <label class="m-label">来源</label>
          <div class="m-chips">
            <span
              v-for="s in ['展会', '官网', '转介绍']"
              :key="s"
              :class="{ on: newLeadSource === s }"
              @click="newLeadSource = s"
            >{{ s }}</span>
          </div>
          <button type="button" class="m-btn-primary block" @click="saveNewLead">保存</button>
        </div>

        <!-- 名片扫描 -->
        <div v-else-if="subScreen === 'scan-card'" class="m-panel m-scan">
          <div class="m-scan-frame">📷 对准名片</div>
          <p class="m-scan-hint">识别结果预览</p>
          <input v-model="scanName" class="m-inp" placeholder="公司名称" />
          <input v-model="scanPhone" class="m-inp" placeholder="联系电话" />
          <button type="button" class="m-btn-primary block" @click="saveScan">保存为客户</button>
        </div>

        <!-- 商机详情 -->
        <div v-else-if="subScreen === 'opp-detail'" class="m-panel m-detail">
          <h2>{{ selectedOpp?.name }}</h2>
          <p class="m-meta-line">{{ selectedOpp?.customer }} · {{ selectedOpp?.amount }}万</p>
          <div class="m-chips" style="margin-top:12px">
            <span
              v-for="s in crmStore.stages"
              :key="s.code"
              :class="{ on: selectedOpp?.stage === s.name }"
              @click="changeOppStage(s.name)"
            >{{ s.name }}</span>
          </div>
          <p v-if="toast" class="m-toast">{{ toast }}</p>
        </div>
      </div>

      <nav v-if="screen !== 'login'" class="m-tabbar">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          class="m-tab"
          :class="{ active: activeTab === t.key && !subScreen }"
          @click="switchTab(t.key)"
        >
          <span class="ico">{{ t.icon }}</span>
          <span>{{ t.label }}</span>
          <em v-if="t.key === 'message' && unreadCount" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</em>
        </button>
      </nav>

      <button
        v-if="screen !== 'login' && (activeTab === 'home' || activeTab === 'customer') && !subScreen"
        type="button"
        class="m-fab"
        aria-label="快捷操作"
        @click="fabOpen = !fabOpen"
      >
        +
      </button>
      <div v-if="fabOpen" class="m-fab-menu">
        <button type="button" @click="openFabFollow">记跟进</button>
        <button type="button" @click="subScreen = 'scan-card'; fabOpen = false">扫名片</button>
        <button type="button" @click="subScreen = 'new-lead'; fabOpen = false">新建线索</button>
      </div>
      <p v-if="toast && screen !== 'login'" class="m-toast-global">{{ toast }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { appKpis, appTodos } from '../../mock/crmMock.js'
import { useCrmBase } from '../../composables/useCrmBase.js'

const { pushCrm } = useCrmBase()
import {
  crmStore,
  unreadCount,
  addCustomer,
  addLead,
  addFollowUp,
  updateOpportunityStage,
  dismissMessage,
  adoptAiMessage
} from '../../store/crmStore.js'

const screen = ref('login')
const activeTab = ref('home')
const subScreen = ref(null)
const custSeg = ref('mine')
const selectedCustomer = ref(null)
const selectedOpp = ref(null)
const fabOpen = ref(false)
const oppView = ref('list')
const detailTab = ref('overview')
const followType = ref('电话')
const followContent = ref('')
const followDate = ref('')
const aiTab = ref('话术')
const newLeadName = ref('')
const newLeadSource = ref('展会')
const scanName = ref('智创科技有限公司')
const scanPhone = ref('13800001234')
const toast = ref('')
const settings = reactive({ notify: true, mask: true })

const tabs = [
  { key: 'home', label: '首页', icon: '⌂' },
  { key: 'customer', label: '客户', icon: '👤' },
  { key: 'opportunity', label: '商机', icon: '📊' },
  { key: 'message', label: '消息', icon: '💬' },
  { key: 'mine', label: '我的', icon: '☺' }
]

const kpis = computed(() => [
  { label: '待跟进', value: crmStore.customers.length },
  { label: '本周线索', value: crmStore.leads.length },
  { label: '在途金额', value: crmStore.opportunities.reduce((s, o) => s + o.amount, 0) + '万' },
  { label: '赢单率', value: '28%' }
])
const todos = appTodos

const topCustomer = computed(() =>
  [...crmStore.customers].sort((a, b) => b.score - a.score)[0]
)

const displayCustomers = computed(() => {
  if (custSeg.value === 'lead') {
    return crmStore.leads.filter((l) => !l.pool).map((l) => ({ ...l, industry: l.source }))
  }
  if (custSeg.value === 'pool') {
    return crmStore.leads.filter((l) => l.pool).map((l) => ({ ...l, industry: l.source, owner: '' }))
  }
  return crmStore.customers
})

const customerOpps = computed(() =>
  selectedCustomer.value
    ? crmStore.opportunities.filter((o) => o.customer === selectedCustomer.value.name)
    : []
)

const boardColumns = computed(() =>
  crmStore.stages
    .filter((s) => !['线索', '输单'].includes(s.name))
    .map((s) => ({
      name: s.name,
      items: crmStore.opportunities.filter((o) => o.stage === s.name)
    }))
)

const aiText = computed(() => {
  const name = selectedCustomer.value?.name || '客户'
  const map = {
    '话术': `您好，我是${crmStore.currentUser}，关于与${name}的合作方案，想跟您确认一下下一步安排…`,
    '微信草稿': `【${name}】张总您好，附件为更新版方案摘要，请查收。如有疑问随时联系。`,
    '异议': `针对价格顾虑：我们可按阶段交付，首期投入可降低 30%，并附 ROI 测算表。`
  }
  return map[aiTab.value]
})

const headerTitle = computed(() => {
  const titles = {
    'customer-detail': '客户详情',
    'follow-up': '快速跟进',
    'ai': 'AI 助手',
    'new-lead': '新建线索',
    'scan-card': '名片扫描',
    'opp-detail': '商机详情'
  }
  if (subScreen.value) return titles[subScreen.value] || 'CRM'
  const map = { home: '销售工作台', customer: '客户', opportunity: '商机', message: '消息', mine: '我的' }
  return map[activeTab.value] || 'CRM'
})

const headerAction = computed(() => {
  if (subScreen.value) return ' '
  if (activeTab.value === 'customer') return '新建'
  return ' '
})

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2200)
}

function switchTab(key) {
  activeTab.value = key
  subScreen.value = null
  fabOpen.value = false
}

function openCustomer(c) {
  selectedCustomer.value = crmStore.customers.find((x) => x.id === c.id) || c
  detailTab.value = 'overview'
  subScreen.value = 'customer-detail'
}

function openOpp(o) {
  selectedOpp.value = o
  subScreen.value = 'opp-detail'
}

function onHeaderAction() {
  if (activeTab.value === 'customer' && !subScreen.value) {
    subScreen.value = 'new-lead'
  }
}

function onCall() {
  showToast(`正在呼叫 ${selectedCustomer.value?.phone || '客户'}…`)
}

function saveFollowUp() {
  if (!followContent.value.trim()) {
    showToast('请填写跟进内容')
    return
  }
  if (selectedCustomer.value) {
    addFollowUp(selectedCustomer.value.id, followContent.value, followType.value)
    selectedCustomer.value = crmStore.customers.find((c) => c.id === selectedCustomer.value.id)
  }
  followContent.value = ''
  showToast('跟进已保存')
  subScreen.value = selectedCustomer.value ? 'customer-detail' : null
}

function copyAi() {
  navigator.clipboard?.writeText(aiText.value)
  showToast('已复制到剪贴板')
}

function adoptAi() {
  showToast('AI 话术已采纳，可前往消息查看')
  subScreen.value = 'customer-detail'
}

function saveNewLead() {
  if (!newLeadName.value.trim()) {
    showToast('请填写线索名称')
    return
  }
  addLead({ name: newLeadName.value, source: newLeadSource.value })
  newLeadName.value = ''
  showToast('线索已创建')
  subScreen.value = null
  activeTab.value = 'customer'
  custSeg.value = 'lead'
}

function saveScan() {
  const row = addCustomer({ name: scanName.value, phone: scanPhone.value, industry: '名片导入' })
  showToast(`客户「${row.name}」已保存`)
  subScreen.value = null
  activeTab.value = 'customer'
  openCustomer(row)
}

function openFabFollow() {
  if (!selectedCustomer.value && crmStore.customers[0]) {
    selectedCustomer.value = crmStore.customers[0]
  }
  subScreen.value = 'follow-up'
  fabOpen.value = false
}

function changeOppStage(stageName) {
  if (!selectedOpp.value) return
  updateOpportunityStage(selectedOpp.value.id, stageName)
  selectedOpp.value = crmStore.opportunities.find((o) => o.id === selectedOpp.value.id)
  showToast(`阶段已更新为 ${stageName}`)
}

function onAdoptMsg(id) {
  adoptAiMessage(id)
  showToast('已采纳 AI 建议')
}

function onDismissMsg(id) {
  dismissMessage(id)
  showToast('已忽略')
}

function onTodoClick(t) {
  if (t.type === 'follow' || t.type === 'ai') {
    activeTab.value = 'opportunity'
  } else if (t.type === 'lead') {
    activeTab.value = 'customer'
    custSeg.value = 'pool'
  }
}
</script>

<style scoped>
.preview-page {
  min-height: 100vh;
  background: #e8eef8;
  padding: 20px 24px 40px;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
}

.preview-head h1 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.preview-head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.phone-shell {
  max-width: 390px;
  margin: 0 auto;
  background: #f8fafc;
  border-radius: 28px;
  border: 8px solid #1e293b;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.2);
  min-height: 720px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.m-header {
  height: 48px;
  display: grid;
  grid-template-columns: 56px 1fr 56px;
  align-items: center;
  padding: 0 8px;
  background: #fff;
  border-bottom: 1px solid #e4ecfc;
}

.m-title {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
}

.m-btn-ghost {
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 14px;
  min-height: 44px;
  cursor: pointer;
}

.phone-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 72px;
}

.m-login {
  padding: 48px 24px;
  text-align: center;
}

.m-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  background: #2563eb;
  color: #fff;
  border-radius: 16px;
  line-height: 64px;
  font-weight: 700;
  font-size: 20px;
}

.m-login h2 {
  margin: 0 0 24px;
  font-size: 20px;
}

.m-inp {
  width: 100%;
  height: 48px;
  border: 1px solid #e4ecfc;
  border-radius: 10px;
  padding: 0 14px;
  margin-bottom: 12px;
  font-size: 16px;
  box-sizing: border-box;
}

.m-btn-primary {
  width: 100%;
  height: 48px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

.m-btn-primary.block { margin-top: 20px; }

.m-panel { padding: 16px; }

.m-greet {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.m-kpi-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 16px;
}

.m-kpi-card {
  flex: 0 0 100px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.08);
}

.m-kpi-card span {
  font-size: 12px;
  color: #64748b;
}

.m-kpi-card strong {
  display: block;
  font-size: 20px;
  color: #2563eb;
  margin-top: 4px;
}

.m-section h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #64748b;
}

.m-todo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  min-height: 44px;
}

.m-todo.urgent { border-left: 3px solid #dc2626; }

.m-todo strong { display: block; font-size: 14px; }
.m-todo small { color: #64748b; font-size: 12px; }

.m-insight {
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  color: #2563eb;
}

.m-seg {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.m-seg button {
  flex: 1;
  height: 36px;
  border: 1px solid #e4ecfc;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.m-seg button.on {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.m-search {
  background: #fff;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #94a3b8;
}

.m-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  min-height: 64px;
  cursor: pointer;
}

.m-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.m-card-body { flex: 1; min-width: 0; }
.m-card-body strong { display: block; font-size: 15px; }
.m-card-body small { color: #64748b; font-size: 12px; }

.m-score {
  font-weight: 700;
  color: #059669;
  font-size: 16px;
}

.m-action-bar {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.m-action-bar button {
  flex: 1;
  height: 44px;
  border: 1px solid #e4ecfc;
  background: #fff;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
}

.m-score-lg {
  font-size: 24px;
  font-weight: 700;
  color: #059669;
}

.m-detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.m-tabs span {
  margin-right: 16px;
  font-size: 14px;
  color: #64748b;
  padding-bottom: 8px;
}

.m-tabs span.on {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
  font-weight: 600;
}

.m-ai-hint {
  margin-top: 12px;
  font-size: 13px;
  color: #64748b;
  background: #f1f5fd;
  padding: 10px;
  border-radius: 8px;
}

.m-opp-card {
  background: #fff;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.m-opp-card strong { display: block; }
.m-opp-card small { color: #64748b; font-size: 12px; }

.m-opp-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
}

.m-stage {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 4px;
}

.m-msg {
  background: #fff;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.m-msg p { margin: 6px 0; font-size: 13px; color: #475569; }
.m-msg small { color: #94a3b8; font-size: 11px; }

.m-msg-actions { display: flex; gap: 8px; margin-top: 8px; }
.m-msg-actions button {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
.m-msg-actions button.ghost { background: #f1f5f9; color: #64748b; }

.m-brief {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.m-brief-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.m-brief-grid div {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.m-settings {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  background: #fff;
  border-radius: 12px;
}

.m-settings li {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  min-height: 44px;
  align-items: center;
}

.m-btn-outline {
  width: 100%;
  height: 44px;
  border: 1px solid #e4ecfc;
  background: #fff;
  border-radius: 10px;
  color: #dc2626;
  cursor: pointer;
}

.m-label { display: block; font-size: 13px; color: #64748b; margin: 12px 0 6px; }

.m-chips span {
  display: inline-block;
  padding: 6px 12px;
  margin-right: 8px;
  border-radius: 16px;
  background: #f1f5f9;
  font-size: 13px;
}

.m-chips span.on { background: #2563eb; color: #fff; }

.m-textarea {
  width: 100%;
  border: 1px solid #e4ecfc;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  box-sizing: border-box;
}

.m-ai-bubble {
  background: #fff;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
  border: 1px solid #e4ecfc;
}

.m-ai-actions { display: flex; gap: 10px; }
.m-ai-actions button {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e4ecfc;
  background: #fff;
  cursor: pointer;
}
.m-ai-actions button.primary { background: #2563eb; color: #fff; border: none; }

.m-tabbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  background: #fff;
  border-top: 1px solid #e4ecfc;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.m-tab {
  flex: 1;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #64748b;
  cursor: pointer;
  min-height: 44px;
  position: relative;
}

.m-tab.active { color: #2563eb; font-weight: 600; }
.m-tab .ico { font-size: 18px; line-height: 1; }

.badge {
  position: absolute;
  top: 4px;
  right: calc(50% - 22px);
  background: #dc2626;
  color: #fff;
  font-size: 10px;
  font-style: normal;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  line-height: 16px;
  text-align: center;
}

.m-fab {
  position: absolute;
  right: 16px;
  bottom: 68px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  border: none;
  font-size: 28px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  cursor: pointer;
}

.m-fab-menu {
  position: absolute;
  right: 16px;
  bottom: 132px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  overflow: hidden;
}

.m-fab-menu button {
  display: block;
  width: 120px;
  height: 44px;
  border: none;
  background: #fff;
  text-align: left;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

.m-tabs span { cursor: pointer; }
.m-settings li { cursor: pointer; }
.m-todo { cursor: pointer; }
.m-opp-card { cursor: pointer; }
.m-chips span { cursor: pointer; }

.m-meta-line { font-size: 13px; color: #64748b; margin-top: 8px; }
.m-empty-hint { text-align: center; color: #94a3b8; font-size: 13px; padding: 24px 0; }
.m-timeline-item { font-size: 13px; color: #475569; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
.m-opp-card.small { padding: 10px; }

.m-board-col { margin-bottom: 12px; }
.m-board-col h4 { font-size: 12px; color: #64748b; margin: 0 0 6px; }
.m-board-card {
  background: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  cursor: pointer;
  border-left: 3px solid #2563eb;
}

.m-scan-frame {
  height: 160px;
  background: #1e293b;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 12px;
}
.m-scan-hint { font-size: 12px; color: #64748b; margin-bottom: 8px; }

.m-toast, .m-toast-global {
  background: rgba(15, 23, 42, 0.88);
  color: #fff;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 8px;
  text-align: center;
}
.m-toast-global {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 72px;
  z-index: 20;
}
</style>
