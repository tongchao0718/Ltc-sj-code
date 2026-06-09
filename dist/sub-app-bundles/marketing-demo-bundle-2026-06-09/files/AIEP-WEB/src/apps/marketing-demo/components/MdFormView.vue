<template>
  <div class="md-form-view" :class="`md-form-view--col-${columns}`">
    <div
      v-for="item in items"
      :key="item.label"
      class="md-form-view-item"
      :class="{ 'md-form-view-item--full': item.full || item.span === 2 }"
    >
      <label class="md-form-view-label">{{ item.label }}</label>
      <div class="md-form-view-value" :title="String(item.value ?? '')">
        <span v-if="item.tag" class="md-tag" :class="tagClass(item.raw)">{{ item.value }}</span>
        <span v-else>{{ item.value ?? '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Number, default: 2 }
})

function tagClass(v) {
  if (['A', '正常', '已结清', '已生效', '有效', '已结算', '启用'].includes(v)) return 'md-tag--success'
  if (['B', '预警', '未结清', '待审核', '待续签', '临期'].includes(v)) return 'md-tag--warning'
  if (['C', '高风险', '到期', '已终止', '停用'].includes(v)) return 'md-tag--danger'
  return 'md-tag--info'
}
</script>
