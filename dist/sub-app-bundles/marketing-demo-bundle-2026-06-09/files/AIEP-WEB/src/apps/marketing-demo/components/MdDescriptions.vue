<template>
  <div class="md-descriptions" :class="{ 'md-descriptions--grid': columns === 2 }">
    <div v-for="item in items" :key="item.label" class="md-descriptions-row">
      <div class="md-descriptions-label">{{ item.label }}</div>
      <div class="md-descriptions-value">
        <span v-if="item.tag" class="md-tag" :class="tagClass(item.raw)">{{ item.value }}</span>
        <span v-else>{{ item.value }}</span>
      </div>
    </div>
    <div v-if="!items.length" class="md-descriptions-empty">暂无详情数据</div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Number, default: 1 }
})

function tagClass(v) {
  if (['A', '正常', '已结清', '已生效', '有效', '已结算'].includes(v)) return 'md-tag--success'
  if (['B', '预警', '未结清', '待审核', '待续签', '临期'].includes(v)) return 'md-tag--warning'
  if (['C', '高风险', '到期', '已终止'].includes(v)) return 'md-tag--danger'
  return 'md-tag--info'
}
</script>
