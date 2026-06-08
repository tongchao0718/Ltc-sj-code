<template>
  <div class="md-list-page">
    <div class="md-panel md-panel--table">
      <MdSectionTitle title="业务画像列表" />
      <p class="md-page-desc" style="margin:-8px 0 16px 12px">售电公司综合业务画像入口，一键跳转详情</p>
      <div class="md-table-wrap">
        <table class="md-table">
          <thead>
            <tr><th>企业名称</th><th>所属区域</th><th>信用等级</th><th>风险标签</th><th style="width:100px">操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in store.profiles" :key="p.companyId">
              <td>{{ p.companyName }}</td>
              <td>{{ p.region }}</td>
              <td><span class="md-tag md-tag--info">{{ p.creditLevel }}</span></td>
              <td>{{ p.tags?.join('、') }}</td>
              <td class="md-table-actions">
                <button type="button" class="md-link" @click="go(p.companyId)">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import MdSectionTitle from '../../components/MdSectionTitle.vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { useMarketingBase } from '../../composables/useMarketingBase.js'
import { useMarketingTabs } from '../../composables/useMarketingTabs.js'

const { pushMd } = useMarketingBase()
const { openTab } = useMarketingTabs()

function go(id) {
  openTab(`/profile/${id}`, '企业画像')
  pushMd(`/profile/${id}`)
}
</script>
