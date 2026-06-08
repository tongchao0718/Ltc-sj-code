<template>
  <div>
    <h1 class="md-page-title">风险预警分析</h1>
    <p class="md-page-desc">欠费、保函临期、信用降级等多维风险监测</p>
    <div class="md-card">
      <table class="md-table">
        <thead><tr><th>企业</th><th>风险类型</th><th>等级</th><th>说明</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="r in risks" :key="r.id" :class="{ 'row-warning': r.level === '高' }">
            <td>{{ r.company }}</td>
            <td>{{ r.type }}</td>
            <td><span class="md-tag" :class="r.level === '高' ? 'md-tag--danger' : 'md-tag--warning'">{{ r.level }}</span></td>
            <td>{{ r.desc }}</td>
            <td><button type="button" class="md-link" @click="goProfile(r.companyId)">查看画像</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { useMarketingBase } from '../../composables/useMarketingBase.js'
import { useMarketingTabs } from '../../composables/useMarketingTabs.js'

const { pushMd } = useMarketingBase()
const { openTab } = useMarketingTabs()

const risks = computed(() => {
  const list = []
  store.arrears.filter((a) => a.status === '未结清').forEach((a) => {
    list.push({ id: a.id, company: a.companyName, companyId: a.companyId, type: '欠费', level: a.overdueDays > 20 ? '高' : '中', desc: `账期 ${a.period} 欠费 ${a.amount} 元` })
  })
  store.guarantees.filter((g) => g.status === '临期').forEach((g) => {
    list.push({ id: g.id, company: g.companyName, companyId: g.companyId, type: '保函临期', level: '高', desc: `${g.expireDate} 到期` })
  })
  return list
})

function goProfile(companyId) {
  openTab(`/profile/${companyId}`, '企业画像')
  pushMd(`/profile/${companyId}`)
}
</script>
