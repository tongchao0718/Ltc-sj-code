<template>
  <Teleport to="body">
    <Transition name="md-msg-fade">
      <div v-if="state.visible" class="md-message" :class="`md-message--${state.type}`">
        <span class="md-message-icon">{{ icon }}</span>
        <span>{{ state.text }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, computed } from 'vue'

const state = reactive({ visible: false, text: '', type: 'info' })
let timer

const icon = computed(() => {
  if (state.type === 'success') return '✓'
  if (state.type === 'warning') return '!'
  if (state.type === 'error') return '×'
  return 'ℹ'
})

function show(text, type = 'info', duration = 2800) {
  clearTimeout(timer)
  state.text = text
  state.type = type
  state.visible = true
  timer = setTimeout(() => { state.visible = false }, duration)
}

defineExpose({ show })
</script>

<style scoped>
.md-message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  justify-content: center;
}

.md-message--info { background: #edf5ff; color: #3a96fe; border: 1px solid #c6e2ff; }
.md-message--success { background: #f0faeb; color: #52c41a; border: 1px solid #e2f3d8; }
.md-message--warning { background: #fdf6ec; color: #e6a23d; border: 1px solid #faecd8; }
.md-message--error { background: #fef1f0; color: #f5222d; border: 1px solid #fde2e2; }

.md-message-icon {
  font-weight: 700;
  width: 18px;
  text-align: center;
}

.md-msg-fade-enter-active,
.md-msg-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.md-msg-fade-enter-from,
.md-msg-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
