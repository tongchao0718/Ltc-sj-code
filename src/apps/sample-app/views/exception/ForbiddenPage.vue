<template>
  <div class="ex-page">
    <div class="breadcrumb">
      <span>异常页</span> / <span>403</span>
    </div>
    <h1 class="page-title">403</h1>
    <div class="content">
      <div class="code">403</div>
      <p class="msg">对不起，您没有访问该资源的权限</p>
      <router-link :to="`${base}/dashboard/workplace`" class="btn-primary btn-sm">返回</router-link>
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
  color: #165DFF;
  line-height: 1;
  margin-bottom: 16px;
}

.msg {
  color: #666;
  margin-bottom: 24px;
  font-size: 14px;
  max-width: 400px;
  line-height: 1.6;
}

.ex-page a {
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

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}
</style>
