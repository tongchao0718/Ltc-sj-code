<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>关于我们</h3>
        <button type="button" class="close-button" @click="close">×</button>
      </div>
      <div class="modal-body">
        <div class="about-section">
          <div class="app-info">
            <h4>系统信息</h4>
            <p><strong>系统名称：</strong>应用系统</p>
            <p><strong>当前版本：</strong>V1.1.0</p>
            <p><strong>开发框架：</strong>Vue 3 + Vite</p>
          </div>
          <div class="app-description">
            <h4>系统描述</h4>
            <p>
              本系统是一个基于 Vue 3 的多子应用架构系统框架，旨在为企业级应用提供统一的管理平台，支持多个独立子应用的集成、管理和部署。
            </p>
            <p>系统特点：</p>
            <ul>
              <li>统一管理：为多个子应用提供统一的入口和管理界面</li>
              <li>独立部署：每个子应用可以独立打包和部署，减少耦合</li>
              <li>灵活扩展：支持快速添加新的子应用，满足业务需求的快速变化</li>
              <li>本地访问：子应用支持本地直接打开 HTML 文件运行，无需服务器</li>
              <li>标准化：提供统一的开发规范和打包配置，确保开发效率和质量</li>
            </ul>
          </div>
          <div class="team-info">
            <h4>开发团队</h4>
            <p><strong>团队名称：</strong>LS-SD-设计开发部-设计团队（LTC）</p>
            <p><strong>团队成员：</strong>设计开发部全体成员</p>
            <p><strong>联系方式：</strong>系统内部沟通平台</p>
          </div>
          <div class="copyright">
            <h4>版权信息</h4>
            <p>© 2024 应用系统. 保留所有权利.</p>
            <p>本系统仅供内部使用，未经授权不得用于其他用途。</p>
          </div>
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

.about-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-info,
.app-description,
.team-info,
.copyright {
  margin-bottom: 1rem;
}

.app-info h4,
.app-description h4,
.team-info h4,
.copyright h4 {
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-size: var(--font-size-title-sm);
  font-weight: 600;
}

.app-info p,
.team-info p,
.copyright p {
  margin-bottom: 0.5rem;
  color: var(--color-text-2);
}

.app-description p {
  margin-bottom: 1rem;
  color: var(--color-text-2);
}

.app-description ul {
  padding-left: 1.5rem;
  margin: 0;
}

.app-description li {
  margin-bottom: 0.5rem;
  color: var(--color-text-2);
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
