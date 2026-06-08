<template>
  <MdDetailModal :visible="visible" title="确认删除" size="sm" @close="$emit('cancel')">
    <p style="margin:0;line-height:1.8;color:#606266">{{ message }}</p>
    <template #footer>
      <button type="button" class="md-btn md-btn--ghost" @click="$emit('cancel')">取消</button>
      <button type="button" class="md-btn md-btn--primary" :disabled="loading" @click="$emit('confirm')">
        {{ loading ? '删除中…' : '确定删除' }}
      </button>
    </template>
  </MdDetailModal>
</template>

<script setup>
import MdDetailModal from './MdDetailModal.vue'

defineProps({
  visible: Boolean,
  message: { type: String, default: '确定要删除该记录吗？' },
  loading: Boolean
})
defineEmits(['cancel', 'confirm'])
</script>
