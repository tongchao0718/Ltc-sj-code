<template>
  <MdModal :visible="visible" :title="title" :size="size" @close="$emit('close')">
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </MdModal>
</template>

<script setup>
import MdModal from './MdModal.vue'

defineProps({
  visible: Boolean,
  title: { type: String, default: '详情' },
  size: { type: String, default: 'md' }
})
defineEmits(['close'])
</script>
