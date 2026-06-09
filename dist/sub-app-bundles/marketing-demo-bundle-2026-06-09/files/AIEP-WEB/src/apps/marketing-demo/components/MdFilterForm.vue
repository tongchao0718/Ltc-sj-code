<template>
  <form class="md-filter-form" @submit.prevent="$emit('search')">
    <div class="md-filter-grid">
      <div v-for="f in filters" :key="f.key" class="md-form-item md-form-item--inline">
        <label :for="fieldId(f.key)">{{ f.label }}</label>
        <select
          v-if="f.type === 'select'"
          :id="fieldId(f.key)"
          v-model="form[f.key]"
          class="md-input md-select"
        >
          <option v-if="f.allowEmpty !== false" value="">{{ f.placeholder || '请选择' }}</option>
          <option v-for="opt in f.options" :key="opt.value ?? opt" :value="opt.value ?? opt">
            {{ opt.label ?? opt }}
          </option>
        </select>
        <input
          v-else-if="f.type === 'number'"
          :id="fieldId(f.key)"
          v-model.number="form[f.key]"
          class="md-input"
          type="number"
          :placeholder="f.placeholder || ''"
        />
        <input
          v-else
          :id="fieldId(f.key)"
          v-model="form[f.key]"
          class="md-input"
          :type="f.type === 'month' ? 'month' : 'text'"
          :placeholder="f.placeholder || `请输入${f.label}`"
        />
      </div>
      <div
        v-if="showActions"
        class="md-filter-actions"
        :class="{
          'md-filter-actions--newline': actionsOnNewLine,
          'md-filter-actions--row-end': actionsAtRowEnd
        }"
      >
        <button
          v-if="showReset"
          type="button"
          class="md-btn md-btn--secondary"
          :disabled="loading"
          @click="$emit('reset')"
        >重置</button>
        <button type="submit" class="md-btn md-btn--primary" :disabled="loading">
          {{ searchLabel }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filters: { type: Array, default: () => [] },
  form: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true },
  showReset: { type: Boolean, default: true },
  searchLabel: { type: String, default: '查询' }
})

defineEmits(['search', 'reset'])

/** 条件数为 3 的倍数（含 0）时，按钮组独占一行 */
const actionsOnNewLine = computed(() => {
  const n = props.filters.length
  return n === 0 || n % 3 === 0
})

/** 末行仅 1 个条件时，按钮组占第 3 列 */
const actionsAtRowEnd = computed(() => {
  const n = props.filters.length
  return n > 0 && n % 3 === 1 && !actionsOnNewLine.value
})

function fieldId(key) {
  return `md-filter-${key}`
}
</script>
