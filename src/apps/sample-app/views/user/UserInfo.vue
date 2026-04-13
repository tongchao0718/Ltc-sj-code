<template>
  <div class="page-narrow">
    <div class="breadcrumb">
      <span>个人中心</span> / <span>个人资料</span>
    </div>
    <h1 class="page-title">个人资料</h1>
    <div class="content">
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
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
// import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

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
.page-narrow {
  padding: 0 20px;
  max-width: 800px;
  margin: 0 auto;
}

.breadcrumb {
  margin: 16px 0;
  font-size: 14px;
  color: #666;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.content {
  margin-top: 0;
}

.content-card {
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 24px 28px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 24px;
}

.avatar-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.avatar-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165DFF, #4080ff);
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
  font-size: 12px;
  color: #999;
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
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.form-input,
.form-textarea {
  width: 100%;
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
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
  border-color: #165DFF;
  box-shadow: 0 0 0 2px #f0f9ff;
}

.form-input:disabled {
  background: #f0f0f0;
  color: #999;
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
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.form-footer {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  background-color: #165DFF;
  border: 1px solid #165DFF;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #4080ff;
    border-color: #4080ff;
  }
}

.btn-secondary {
  background-color: #fff;
  border: 1px solid #e8e8e8;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    border-color: #165DFF;
    color: #165DFF;
  }
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}
</style>
