<template>
  <div>
    <MdDetailModal :visible="modalVisible" title="协议详情" size="lg" @close="modalVisible = false">
      <template v-if="current">
        <MdModalSection title="基本信息">
          <MdFormView :items="agreementBasic" :columns="2" />
        </MdModalSection>
        <MdModalSection title="状态变更">
          <div class="md-form-stack">
            <div class="md-form-item">
              <label>目标状态</label>
              <select v-model="newStatus" class="md-select">
                <option>已生效</option>
                <option>待续签</option>
                <option>已终止</option>
              </select>
            </div>
            <div class="md-form-item">
              <label>备注说明</label>
              <input v-model="remark" class="md-input" placeholder="请输入变更备注（选填）" />
            </div>
          </div>
        </MdModalSection>
      </template>
      <template #footer>
        <button type="button" class="md-btn md-btn--ghost" @click="modalVisible = false">取消</button>
        <button type="button" class="md-btn md-btn--primary" :disabled="saving" @click="submit">{{ saving ? '提交中…' : '确认' }}</button>
      </template>
    </MdDetailModal>

    <div class="md-list-page">
      <div class="md-panel md-panel--table">
        <MdSectionTitle title="协议全生命周期" />
        <p class="md-page-desc" style="margin:-8px 0 16px 12px">起草 → 审核 → 签署 → 生效 → 续签/终止</p>
        <div class="md-table-wrap">
          <table class="md-table">
            <thead>
              <tr>
                <th>企业名称</th><th>协议编号</th><th>状态</th><th>签署日期</th><th>到期日</th><th style="width:160px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in store.agreements" :key="a.id">
                <td>{{ a.companyName }}</td>
                <td>{{ a.code }}</td>
                <td><span class="md-tag md-tag--info">{{ a.status }}</span></td>
                <td>{{ a.signedAt }}</td>
                <td>{{ a.expireAt }}</td>
                <td class="md-table-actions">
                  <button type="button" class="md-link" @click="openModal(a)">详情</button>
                  <button type="button" class="md-link" @click="openModal(a)">变更状态</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MdSectionTitle from '../../components/MdSectionTitle.vue'
import MdDetailModal from '../../components/MdDetailModal.vue'
import MdModalSection from '../../components/MdModalSection.vue'
import MdFormView from '../../components/MdFormView.vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { updateAgreementStatus } from '../../mock/api.js'
import { useMdMessage } from '../../composables/useMdMessage.js'
import { buildDetailItems } from '../../config/fieldLabels.js'

const msg = useMdMessage()
const modalVisible = ref(false)
const current = ref(null)
const newStatus = ref('已生效')
const remark = ref('')
const saving = ref(false)

const agreementBasic = computed(() => {
  if (!current.value) return []
  const a = current.value
  return buildDetailItems(a, [
    { key: 'companyName', label: '企业名称' },
    { key: 'code', label: '协议编号' },
    { key: 'status', label: '当前状态', tag: true },
    { key: 'signedAt', label: '签署日期' },
    { key: 'expireAt', label: '到期日期' },
    { key: 'templateVersion', label: '模板版本' },
    { key: 'account', label: '结算账户', span: 2 }
  ])
})

function openModal(a) {
  current.value = a
  newStatus.value = a.status === '待审核' ? '已生效' : a.status
  remark.value = ''
  modalVisible.value = true
}

async function submit() {
  saving.value = true
  await updateAgreementStatus(current.value.id, newStatus.value, remark.value)
  saving.value = false
  modalVisible.value = false
  msg.success('协议状态已更新')
}
</script>
