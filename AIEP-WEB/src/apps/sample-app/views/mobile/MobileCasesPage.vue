<template>
  <div class="mobile-case-page">
    <header class="page-head">
      <div>
        <h1>移动端功能案例</h1>
        <p>覆盖统计分析、审批流、工单和个人中心交互模板。</p>
      </div>
      <span class="device-tag">Mobile Demo</span>
    </header>

    <section class="phone-shell">
      <header class="mobile-header">
        <button type="button" class="header-btn ghost" :disabled="!canGoBack" @click="handleBack">
          返回
        </button>
        <strong class="header-title">{{ currentTitle }}</strong>
        <button type="button" class="header-btn" @click="handleCreate">
          {{ createText }}
        </button>
      </header>

      <div class="phone-content">
        <div class="phone-scroll">
          <div v-if="activeTab === 'analytics'" class="panel">
            <h2>统计分析</h2>
            <div class="kpi-grid">
              <article v-for="kpi in kpis" :key="kpi.key" class="kpi-card">
                <span class="kpi-name">{{ kpi.name }}</span>
                <strong class="kpi-value">{{ kpi.value }}</strong>
                <span class="kpi-trend" :class="{ up: kpi.trend > 0 }">
                  {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
                </span>
              </article>
            </div>
          </div>

          <div v-else-if="activeTab === 'approval'" class="panel">
            <h2>审批功能</h2>
            <div class="flow-list">
              <article
                v-for="item in approvalItems"
                :key="item.id"
                class="flow-card"
                :class="item.status"
              >
                <div class="flow-main">
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.applicant }} · {{ item.time }}</small>
                </div>
                <div class="flow-actions" v-if="item.status === 'pending'">
                  <button type="button" @click="handleApproval(item.id, 'approved')">通过</button>
                  <button type="button" class="ghost" @click="handleApproval(item.id, 'rejected')">驳回</button>
                </div>
                <span v-else class="status">{{ statusText[item.status] }}</span>
              </article>
            </div>
          </div>

          <div v-else-if="activeTab === 'ticket'" class="panel">
            <h2>工单功能</h2>
            <form class="ticket-form" @submit.prevent="submitTicket">
              <label>
                标题
                <input v-model="ticketForm.title" placeholder="例如：设备离线告警" />
              </label>
              <label>
                优先级
                <select v-model="ticketForm.priority">
                  <option value="P1">P1 - 紧急</option>
                  <option value="P2">P2 - 高</option>
                  <option value="P3">P3 - 中</option>
                </select>
              </label>
              <button type="submit">创建工单</button>
            </form>
            <ul class="ticket-list">
              <li v-for="ticket in tickets" :key="ticket.id">
                <div>
                  <strong>{{ ticket.title }}</strong>
                  <small>{{ ticket.priority }} · {{ ticket.status }}</small>
                </div>
                <button type="button" class="ghost" @click="toggleTicket(ticket.id)">
                  {{ ticket.status === '处理中' ? '关闭' : '重开' }}
                </button>
              </li>
            </ul>
          </div>

          <div v-else class="panel">
            <h2>个人中心</h2>
            <div class="profile">
              <div class="avatar">{{ profile.name.slice(0, 1) }}</div>
              <div>
                <strong>{{ profile.name }}</strong>
                <small>{{ profile.dept }}</small>
              </div>
            </div>
            <ul class="setting-list">
              <li v-for="item in profileSettings" :key="item.key">
                <span>{{ item.label }}</span>
                <button type="button" class="ghost" @click="item.enabled = !item.enabled">
                  {{ item.enabled ? '已开启' : '已关闭' }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <nav class="bottom-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="bottom-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const activeTab = ref('analytics')
const tabs = [
  { key: 'analytics', label: '统计分析' },
  { key: 'approval', label: '审批' },
  { key: 'ticket', label: '工单' },
  { key: 'profile', label: '个人中心' }
]
const tabTitleMap = {
  analytics: '移动端统计分析',
  approval: '移动端审批中心',
  ticket: '移动端工单中心',
  profile: '个人中心'
}
const createTextMap = {
  analytics: '筛选',
  approval: '新增',
  ticket: '新建',
  profile: '编辑'
}
const currentTitle = computed(() => tabTitleMap[activeTab.value] || '移动端案例')
const createText = computed(() => createTextMap[activeTab.value] || '新增')
const canGoBack = computed(() => activeTab.value !== 'analytics')

const kpis = [
  { key: 'visit', name: '日活', value: '12,860', trend: 7.1 },
  { key: 'task', name: '任务完成率', value: '92%', trend: 3.8 },
  { key: 'event', name: '告警处理', value: '328', trend: -2.4 },
  { key: 'satisfaction', name: '满意度', value: '98.2%', trend: 1.6 }
]

const statusText = {
  approved: '已通过',
  rejected: '已驳回'
}

const approvalItems = ref([
  { id: 1, title: '差旅报销审批', applicant: '王雷', time: '10:12', status: 'pending' },
  { id: 2, title: '采购申请审批', applicant: '李欣', time: '09:45', status: 'approved' },
  { id: 3, title: '预算追加审批', applicant: '刘宁', time: '昨天', status: 'rejected' }
])

function handleApproval(id, nextStatus) {
  const target = approvalItems.value.find((item) => item.id === id)
  if (target) target.status = nextStatus
}

function handleBack() {
  if (!canGoBack.value) return
  activeTab.value = 'analytics'
}

function handleCreate() {
  if (activeTab.value === 'approval') {
    approvalItems.value.unshift({
      id: Date.now(),
      title: '新增审批单',
      applicant: '当前用户',
      time: '刚刚',
      status: 'pending'
    })
    return
  }
  if (activeTab.value === 'ticket') {
    ticketForm.title = '新增工单'
    submitTicket()
    return
  }
  if (activeTab.value === 'profile') {
    profileSettings.value[0].enabled = !profileSettings.value[0].enabled
  }
}

const ticketForm = reactive({
  title: '',
  priority: 'P2'
})

const tickets = ref([
  { id: 1, title: '山东大屏数据延迟', priority: 'P1', status: '处理中' },
  { id: 2, title: '审批消息重复推送', priority: 'P2', status: '已关闭' }
])

function submitTicket() {
  if (!ticketForm.title.trim()) return
  tickets.value.unshift({
    id: Date.now(),
    title: ticketForm.title.trim(),
    priority: ticketForm.priority,
    status: '处理中'
  })
  ticketForm.title = ''
}

function toggleTicket(id) {
  const target = tickets.value.find((ticket) => ticket.id === id)
  if (!target) return
  target.status = target.status === '处理中' ? '已关闭' : '处理中'
}

const profile = {
  name: '张晨',
  dept: '数字化运营中心'
}

const profileSettings = ref([
  { key: 'msg', label: '消息通知', enabled: true },
  { key: 'geo', label: '位置服务', enabled: true },
  { key: 'finger', label: '指纹登录', enabled: false },
  { key: 'theme', label: '深色模式', enabled: false }
])
</script>

<style scoped>
.mobile-case-page {
  padding: 16px 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-head h1 {
  margin: 0;
  font-size: 20px;
}

.page-head p {
  margin: 4px 0 0;
  color: #4e5969;
  font-size: 13px;
}

.device-tag {
  font-size: 12px;
  color: #165dff;
  background: #e8f3ff;
  padding: 4px 10px;
  border-radius: 999px;
}

.phone-shell {
  margin: 0 auto;
  max-width: 420px;
  border: 1px solid #e5e6eb;
  border-radius: 24px;
  overflow: hidden;
  background: #fff;
  min-height: 670px;
  display: flex;
  flex-direction: column;
}

.mobile-header {
  height: 48px;
  padding: 0 10px;
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  align-items: center;
  border-bottom: 1px solid #e5e6eb;
  background: #fff;
}

.header-title {
  text-align: center;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.88);
}

.header-btn {
  height: 30px;
  padding: 0 8px;
  font-size: 12px;
}

.header-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.phone-content {
  flex: 1;
  min-height: 0;
  background: #f7f8fa;
}

.phone-scroll {
  height: 100%;
  overflow: auto;
  padding: 14px 14px 74px;
}

.bottom-nav {
  height: 56px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #e5e6eb;
  background: #fff;
}

.bottom-item {
  border: none;
  background: #fff;
  padding: 6px 4px;
  color: #4e5969;
  font-size: 13px;
}

.bottom-item.active {
  color: #165dff;
  font-weight: 600;
  box-shadow: inset 0 2px 0 #165dff;
}

.panel h2 {
  margin: 0 0 12px;
  font-size: 16px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.kpi-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  border: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.kpi-name,
.kpi-trend {
  font-size: 12px;
  color: #86909c;
}

.kpi-trend.up {
  color: #00b42a;
}

.kpi-value {
  margin: 8px 0;
  font-size: 18px;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flow-card {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  padding: 10px;
}

.flow-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flow-main small {
  color: #86909c;
}

.flow-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

button {
  border: none;
  border-radius: 6px;
  background: #165dff;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

button.ghost {
  background: #fff;
  color: #165dff;
  border: 1px solid #c9cdd4;
}

.status {
  margin-top: 8px;
  display: inline-block;
  font-size: 12px;
  color: #86909c;
}

.ticket-form {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.ticket-form label {
  display: grid;
  gap: 4px;
  font-size: 13px;
}

input,
select {
  height: 34px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 0 10px;
}

.ticket-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.ticket-list li {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ticket-list small {
  display: block;
  color: #86909c;
  margin-top: 2px;
}

.profile {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  background: #165dff;
}

.profile small {
  display: block;
  margin-top: 2px;
  color: #86909c;
}

.setting-list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.setting-list li {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
