<template>
  <Teleport to="#md-modal-host">
    <Transition name="md-modal-fade">
      <div v-if="visible" class="md-modal-mask marketing-demo-portal" @click.self="onClose">
        <div class="md-modal" :class="`md-modal--${size}`" role="dialog" aria-modal="true">
          <div class="md-modal-header">
            <span class="md-modal-title">{{ title }}</span>
            <button type="button" class="md-modal-close" aria-label="关闭" @click="onClose">×</button>
          </div>
          <div class="md-modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="md-modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: Boolean,
  title: { type: String, default: '详情' },
  size: { type: String, default: 'md' } // sm | md | lg
})

const emit = defineEmits(['close'])

function onClose() {
  emit('close')
}
</script>
