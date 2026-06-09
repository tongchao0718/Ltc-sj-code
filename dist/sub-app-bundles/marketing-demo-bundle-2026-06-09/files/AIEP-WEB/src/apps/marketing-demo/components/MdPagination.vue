<template>
  <div class="md-pagination-bar">
    <div class="md-pagination-left">
      <span>共 {{ total }} 条</span>
      <label class="md-pagination-size">
        <select :value="pageSize" class="md-select md-select--sm" @change="onSizeChange">
          <option v-for="n in pageSizes" :key="n" :value="n">{{ n }} 条/页</option>
        </select>
      </label>
    </div>
    <div class="md-pagination-right">
      <button type="button" class="md-page-btn" :disabled="pageNo <= 1" @click="emit('change', pageNo - 1)">‹</button>
      <button
        v-for="p in pageList"
        :key="p"
        type="button"
        class="md-page-btn"
        :class="{ 'md-page-btn--active': p === pageNo }"
        @click="emit('change', p)"
      >{{ p }}</button>
      <button type="button" class="md-page-btn" :disabled="pageNo >= totalPages" @click="emit('change', pageNo + 1)">›</button>
      <span class="md-pagination-goto">
        前往
        <input
          v-model.number="gotoVal"
          type="number"
          class="md-input md-input--sm"
          min="1"
          :max="totalPages"
          @keyup.enter="goPage"
        />
        页
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  pageNo: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  pageSizes: { type: Array, default: () => [10, 20, 50] }
})

const emit = defineEmits(['change', 'size-change'])

const gotoVal = ref(props.pageNo)
watch(() => props.pageNo, (v) => { gotoVal.value = v })

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pageList = computed(() => {
  const max = totalPages.value
  const cur = props.pageNo
  const pages = []
  for (let i = Math.max(1, cur - 1); i <= Math.min(max, cur + 1); i++) pages.push(i)
  return pages
})

function onSizeChange(e) {
  emit('size-change', Number(e.target.value))
}

function goPage() {
  const p = Math.min(Math.max(1, gotoVal.value || 1), totalPages.value)
  emit('change', p)
}
</script>
