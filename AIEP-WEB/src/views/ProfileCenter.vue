<template>
  <div class="page-shell profile-page">
    <router-link to="/dashboard" class="back-link">← 返回首页</router-link>
    <h1 class="page-title">个人中心</h1>
    <p class="page-subtitle">管理个人信息、账号与显示偏好（遵循《系统设计规范》示例风格）</p>

    <div class="profile-layout ds-card profile-card">
      <div class="profile-side">
        <div class="avatar-block">
          <div class="avatar-lg" :title="user.displayName">{{ avatarInitial }}</div>
          <button type="button" class="btn-secondary btn-sm" @click="onAvatarClick">更换头像</button>
        </div>
        <div class="side-meta">
          <strong>{{ user.displayName }}</strong>
          <span>{{ user.title }}</span>
          <span class="muted">{{ user.department }}</span>
        </div>
      </div>

      <div class="profile-main">
        <div class="tabs" role="tablist">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            role="tab"
            class="tab-btn"
            :class="{ 'tab-btn--active': activeTab === t.key }"
            @click="activeTab = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <div v-show="activeTab === 'info'" class="tab-panel">
          <form class="form-grid" @submit.prevent="saveProfile">
            <div class="form-row">
              <label class="form-label" for="pc-name">用户</label>
              <input id="pc-name" v-model="user.displayName" class="form-input" type="text" />
            </div>
            <div class="form-row">
              <label class="form-label" for="pc-title">身份</label>
              <input id="pc-title" v-model="user.title" class="form-input" type="text" />
            </div>
            <div class="form-row">
              <label class="form-label" for="pc-email">邮箱</label>
              <input id="pc-email" v-model="user.email" class="form-input" type="email" />
            </div>
            <div class="form-row">
              <label class="form-label" for="pc-phone">电话</label>
              <input id="pc-phone" v-model="user.phone" class="form-input" type="tel" />
            </div>
            <div class="form-row">
              <label class="form-label" for="pc-dept">部门</label>
              <select id="pc-dept" v-model="user.department" class="form-input">
                <option>设计开发部</option>
                <option>技术部</option>
                <option>产品部</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="resetProfile">取消</button>
              <button type="submit" class="btn-primary">保存</button>
            </div>
          </form>
        </div>

        <div v-show="activeTab === 'account'" class="tab-panel">
          <div class="form-row">
            <label class="form-label">用户名</label>
            <input class="form-input" type="text" value="demo.user" disabled />
          </div>
          <p class="hint">账号与租户绑定信息为占位说明，接入认证服务后在此扩展。</p>
        </div>

        <div v-show="activeTab === 'security'" class="tab-panel">
          <div class="form-row row-inline">
            <div>
              <div class="form-label">主题模式</div>
              <p class="hint">与《系统设计规范》主题系统一致，偏好保存在本地。</p>
            </div>
            <div class="theme-toggle">
              <button
                type="button"
                class="btn-secondary btn-sm"
                :class="{ 'is-on': theme === 'light' }"
                @click="setTheme('light')"
              >
                浅色
              </button>
              <button
                type="button"
                class="btn-secondary btn-sm"
                :class="{ 'is-on': theme === 'dark' }"
                @click="setTheme('dark')"
              >
                深色
              </button>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">登录二次验证</label>
            <label class="check-row">
              <input v-model="security.mfa" type="checkbox" />
              <span>开启 MFA（占位）</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { applyTheme, getStoredTheme } from '../utils/theme'

const tabs = [
  { key: 'info', label: '个人信息' },
  { key: 'account', label: '账号设置' },
  { key: 'security', label: '安全设置' }
]

const activeTab = ref('info')
const theme = ref('light')

const initialUser = {
  displayName: 'LTC',
  title: '超级个体',
  department: '设计开发部',
  email: 'demo@example.com',
  phone: '13800138000'
}

const user = reactive({ ...initialUser })
const backup = { ...initialUser }

const avatarInitial = computed(() => {
  const s = (user.displayName || '').trim()
  if (!s) return '?'
  return s.slice(0, 1).toUpperCase()
})

const security = reactive({
  mfa: false
})

onMounted(() => {
  theme.value = getStoredTheme()
  try {
    const saved = localStorage.getItem('ltc-demo-display-name')
    if (saved) user.displayName = saved
  } catch {
    /* ignore */
  }
})

function saveProfile() {
  Object.assign(backup, { ...user })
  try {
    localStorage.setItem('ltc-demo-display-name', user.displayName)
    window.dispatchEvent(new CustomEvent('ltc-profile-updated'))
  } catch {
    /* ignore */
  }
  alert('已保存个人信息（本地演示）')
}

function resetProfile() {
  Object.assign(user, { ...backup })
}

function setTheme(mode) {
  theme.value = mode
  applyTheme(mode)
}

function onAvatarClick() {
  alert('头像上传为占位功能，接入文件服务后实现。')
}
</script>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 16px;
  font-size: var(--font-size-body);
  color: var(--color-primary);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.profile-page {
  padding-top: 8px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.profile-card {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 32px;
  align-items: start;
  padding: 24px;
}

.profile-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border-right: 1px solid var(--color-border);
}

.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-lg {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--color-primary), var(--color-primary-light));
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.side-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-body);
  color: var(--color-text-1);
}

.side-meta .muted {
  color: var(--color-text-3);
  font-size: var(--font-size-caption);
}

.profile-main {
  min-width: 0;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  height: 40px;
  padding: 0 16px;
  border: none;
  background: transparent;
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-2);
  cursor: pointer;
  border-radius: var(--radius-button) var(--radius-button) 0 0;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.tab-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.tab-btn--active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  box-shadow: inset 0 -2px 0 var(--color-primary);
}

.form-grid {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row-inline {
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.form-label {
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-1);
}

.form-input {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: var(--font-size-body);
  color: var(--color-text-1);
  background: var(--color-bg-2);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-bg);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

select.form-input {
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.hint {
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
  line-height: 1.6;
}

.theme-toggle {
  display: flex;
  gap: 8px;
}

.theme-toggle .is-on {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-body);
  color: var(--color-text-2);
}

@media (max-width: 768px) {
  .profile-card {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 20px;
  }

  .profile-side {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 20px;
  }

  .avatar-lg {
    width: 72px;
    height: 72px;
    font-size: 28px;
  }

  .form-grid {
    max-width: none;
  }
}
</style>
