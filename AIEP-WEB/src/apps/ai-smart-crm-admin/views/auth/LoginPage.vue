<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="logo">CRM</div>
        <h1>AI 智能 CRM</h1>
        <p>Web 管理台 · 独立账号登录</p>
      </div>
      <a-form :model="form" layout="vertical" @submit-success="onSubmit">
        <a-form-item field="account" label="账号 / 手机号" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model="form.account" placeholder="请输入账号" size="large" />
        </a-form-item>
        <a-form-item field="password" label="密码" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model="form.password" placeholder="请输入密码" size="large" />
        </a-form-item>
        <a-button type="primary" html-type="submit" long size="large" :loading="loading">
          登 录
        </a-button>
      </a-form>
      <p class="hint">演示账号：admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useCrmBase } from '../../composables/useCrmBase.js'

const { pushCrm } = useCrmBase()
const loading = ref(false)
const form = reactive({ account: '', password: '' })

function onSubmit() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    if (form.account && form.password) {
      Message.success('登录成功')
      pushCrm('/dashboard')
    }
  }, 400)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e4ecfc 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.08);
}

.login-brand {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 14px;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  line-height: 56px;
}

.login-brand h1 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}

.login-brand p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #64748b;
}

.hint {
  margin: 16px 0 0;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}
</style>
