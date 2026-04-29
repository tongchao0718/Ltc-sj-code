<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>使用帮助</h3>
        <button type="button" class="close-button" @click="close">×</button>
      </div>
      <div class="modal-body">
        <div class="help-section">
          <h4>设计人员指南</h4>
          <ul>
            <li>使用 Vue 3 Composition API 进行组件开发</li>
            <li>遵循项目的目录结构和命名规范</li>
            <li>使用 CSS 变量保持设计一致性</li>
            <li>确保组件的响应式设计</li>
            <li>编写清晰的组件文档</li>
          </ul>
        </div>
        <div class="help-section">
          <h4>评审专家指南</h4>
          <ul>
            <li>检查代码是否符合项目规范</li>
            <li>验证组件的功能和性能</li>
            <li>确保代码的可读性和可维护性</li>
            <li>检查是否存在潜在的安全问题</li>
            <li>提供建设性的反馈和建议</li>
          </ul>
        </div>
        <div class="version-info">
          <p>当前版本：V1.1.0</p>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-primary" @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}

.modal-content {
  background-color: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-modal);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-text-1);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-3);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-button:hover {
  background-color: var(--color-fill-1);
  color: var(--color-text-1);
}

.modal-body {
  padding: 1.5rem;
}

.help-section {
  margin-bottom: 2rem;
}

.help-section h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: var(--font-size-title-sm);
  font-weight: 600;
}

.help-section ul {
  padding-left: 1.5rem;
  margin: 0;
}

.help-section li {
  margin-bottom: 0.5rem;
  color: var(--color-text-2);
}

.version-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
</style>
