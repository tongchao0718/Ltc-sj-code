<template>
  <div class="ex-page">
    <div class="breadcrumb">
      <span>异常页</span> / <span>404</span>
    </div>
    <h1 class="page-title">404</h1>
    <div class="content">
      <div class="code">404</div>
      <p class="msg">抱歉，页面不见了～</p>
      <div class="row">
        <button type="button" class="btn-secondary btn-sm">重试</button>
        <router-link :to="`${base}/dashboard/workplace`" class="btn-primary btn-sm">返回</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

const route = useRoute()
const base = computed(() => (route.path.startsWith('/sample-app') ? '/sample-app' : ''))
</script>

<style scoped>
.ex-page {
  padding: 0 20px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px 40px;
}

.breadcrumb {
  margin: 16px 0;
  font-size: 14px;
  color: #666;
  text-align: left;
  align-self: flex-start;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  align-self: flex-start;
}

.content {
  margin-top: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.code {
  font-size: 64px;
  font-weight: 700;
  color: #999;
  line-height: 1;
  margin-bottom: 16px;
}

.msg {
  color: #666;
  margin-bottom: 24px;
  font-size: 14px;
}

.row {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.row a {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
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
