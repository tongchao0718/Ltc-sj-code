<template>
  <div class="md-list-page">
    <!-- 查询区 -->
    <div class="md-panel">
      <MdSectionTitle title="工商信息接入" />
      <p class="md-page-desc md-page-desc--panel">从天眼查等渠道接入 14 类工商信息，按企业查看分类明细</p>
      <MdFilterForm
        :filters="bizFilters"
        :form="filterForm"
        :loading="loading"
        :show-reset="false"
        :search-label="loading ? '同步中…' : '同步工商数据'"
        @search="doSync"
      />
    </div>

    <div v-if="loading && !tabs.length" class="md-loading">加载中…</div>

    <!-- 分类 + 明细 -->
    <div v-else class="md-bizinfo-layout">
      <div class="md-panel md-bizinfo-categories">
        <MdSectionTitle title="信息分类" />
        <ul class="md-bizinfo-cat-list">
          <li
            v-for="tab in tabs"
            :key="tab.category"
            class="md-bizinfo-cat-item"
            :class="{ 'md-bizinfo-cat-item--active': activeCategory === tab.category }"
            @click="activeCategory = tab.category"
          >
            <span class="md-bizinfo-cat-name">{{ tab.category }}</span>
            <span class="md-tag" :class="tab.count ? 'md-tag--info' : 'md-tag--success'">{{ tab.count }} 条</span>
          </li>
        </ul>
      </div>

      <div class="md-panel md-bizinfo-detail">
        <template v-if="activeTab">
          <MdSectionTitle :title="activeTab.category">
            <template #extra>
              <span class="md-tag md-tag--info">共 {{ activeTab.count }} 条记录</span>
            </template>
          </MdSectionTitle>

          <!-- 企业基本信息：表单视图 -->
          <MdFormView
            v-if="activeTab.displayType === 'form'"
            :items="activeTab.formItems"
            :columns="2"
          />

          <!-- 其他分类：表格 -->
          <template v-else-if="activeTab.count > 0">
            <div class="md-table-wrap">
              <table class="md-table">
                <thead>
                  <tr>
                    <th v-for="col in activeTab.columns" :key="col.key">{{ col.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in activeTab.rows" :key="row.id">
                    <td v-for="col in activeTab.columns" :key="col.key">
                      <span v-if="col.tag" class="md-tag" :class="tagClass(row[col.key])">{{ row[col.key] }}</span>
                      <span v-else>{{ row[col.key] ?? '-' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="md-bizinfo-meta">数据来源：天眼查 · 最近同步：2026-06-06 08:30:00</p>
          </template>

          <div v-else class="md-empty md-bizinfo-empty">
            <div class="md-bizinfo-empty-icon">✓</div>
            <p>暂无「{{ activeTab.category }}」相关记录</p>
            <p class="md-bizinfo-empty-sub">该企业在此分类下经营正常，无异常公示信息</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import MdSectionTitle from '../../components/MdSectionTitle.vue'
import MdFilterForm from '../../components/MdFilterForm.vue'
import MdFormView from '../../components/MdFormView.vue'
import { marketingStore as store } from '../../store/marketingStore.js'
import { getBusinessInfoTabs, syncIntegration } from '../../mock/api.js'
import { useMdMessage } from '../../composables/useMdMessage.js'

const msg = useMdMessage()
const filterForm = reactive({ companyId: store.companies[0]?.id })
const bizFilters = computed(() => [{
  key: 'companyId',
  label: '选择企业',
  type: 'select',
  allowEmpty: false,
  options: store.companies.map((c) => ({ value: c.id, label: c.name }))
}])
const tabs = ref([])
const loading = ref(false)
const activeCategory = ref('企业基本信息')

const activeTab = computed(() => tabs.value.find((t) => t.category === activeCategory.value))

function tagClass(v) {
  if (['有效', '已结案', '已移出', '已解除', '已移除', '已成交', '正常'].includes(v)) return 'md-tag--success'
  if (['审理中', '有效'].includes(v)) return 'md-tag--info'
  if (['列入', '未结清'].includes(v)) return 'md-tag--warning'
  return 'md-tag--info'
}

async function loadTabs() {
  loading.value = true
  tabs.value = await getBusinessInfoTabs(filterForm.companyId)
  if (!tabs.value.some((t) => t.category === activeCategory.value)) {
    activeCategory.value = '企业基本信息'
  }
  loading.value = false
}

async function doSync() {
  loading.value = true
  await syncIntegration('business')
  await loadTabs()
  msg.success('工商数据同步完成')
}

onMounted(loadTabs)
watch(() => filterForm.companyId, loadTabs)
</script>
