<template>
  <ArcoDemoShell variant="plain" :crumbs="['个人中心', '个人资料']">
    <div class="page-narrow">
      <section class="content-card">
        <h2 class="card-title">基本信息</h2>

        <div class="avatar-row">
          <div class="avatar-wrap" aria-hidden="true">
            <span class="avatar-text">{{ avatarLetter }}</span>
          </div>
          <div class="avatar-actions">
            <button type="button" class="btn-primary btn-sm">更换头像</button>
            <p class="avatar-hint">支持 jpg、png，大小不超过 2MB</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-item">
            <label class="form-label" for="u-name">用户名</label>
            <input id="u-name" v-model="form.username" type="text" class="form-input" disabled />
          </div>
          <div class="form-item">
            <label class="form-label" for="u-nick">昵称</label>
            <input id="u-nick" v-model="form.nickname" type="text" class="form-input" placeholder="请输入昵称" />
          </div>
          <div class="form-item">
            <label class="form-label">性别</label>
            <div class="radio-row">
              <label class="radio-label"><input v-model="form.gender" type="radio" value="male" /> 男</label>
              <label class="radio-label"><input v-model="form.gender" type="radio" value="female" /> 女</label>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label" for="u-phone">联系电话</label>
            <input id="u-phone" v-model="form.phone" type="tel" class="form-input" placeholder="请输入手机号" />
          </div>
          <div class="form-item form-item--full">
            <label class="form-label" for="u-email">邮箱</label>
            <input id="u-email" v-model="form.email" type="email" class="form-input" placeholder="请输入邮箱" />
          </div>
          <div class="form-item form-item--full">
            <label class="form-label" for="u-org">单位</label>
            <input id="u-org" v-model="form.org" type="text" class="form-input" placeholder="请输入单位名称" />
          </div>
          <div class="form-item form-item--full">
            <label class="form-label" for="u-bio">个人简介</label>
            <textarea id="u-bio" v-model="form.bio" class="form-textarea" rows="4" placeholder="请输入个人简介" />
          </div>
        </div>

        <footer class="form-footer">
          <button type="button" class="btn-primary btn-sm" @click="onSave">保存</button>
          <button type="button" class="btn-secondary btn-sm" @click="onReset">重置</button>
        </footer>
      </section>
    </div>
  </ArcoDemoShell>
</template>

<script setup>
import { reactive, computed } from 'vue'
import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

const form = reactive({
  username: 'ltc_user',
  nickname: 'LTC',
  gender: 'male',
  phone: '',
  email: '',
  org: '设计开发部',
  bio: ''
})

const initial = { ...form }
const avatarLetter = computed(() => (form.nickname || form.username || 'U').slice(0, 1).toUpperCase())

function onSave() {
  window.alert('已保存（演示）')
}

function onReset() {
  Object.assign(form, initial)
}
</script>

<style scoped>
.content-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 24px 28px 28px;
  box-shadow: var(--shadow-card);
}

.card-title {
  margin: 0 0 24px;
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-text-1);
  line-height: 24px;
}

.avatar-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.avatar-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-text {
  user-select: none;
}

.avatar-actions {
  padding-top: 8px;
}

.avatar-hint {
  margin: 8px 0 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-item--full {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-2);
}

.form-input,
.form-textarea {
  width: 100%;
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  color: var(--color-text-1);
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 0 12px;
  height: 32px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-textarea {
  height: auto;
  padding: 8px 12px;
  line-height: 1.57;
  resize: vertical;
  min-height: 96px;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-bg);
}

.form-input:disabled {
  background: var(--color-fill-1);
  color: var(--color-text-3);
  cursor: not-allowed;
}

.radio-row {
  display: flex;
  gap: 24px;
  align-items: center;
  min-height: 32px;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-body);
  color: var(--color-text-1);
  cursor: pointer;
}

.form-footer {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
