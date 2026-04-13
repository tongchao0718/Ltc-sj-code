<template>
  <div class="re">
    <div class="breadcrumb">
      <span>结果页</span> / <span>失败页</span>
    </div>
    <h1 class="page-title">失败页</h1>
    <div class="content">
      <div class="icon-wrap" aria-hidden="true">
        <span class="icon">!</span>
      </div>
      <h2 class="t1">提交失败</h2>
      <p class="t2">表单提交失败，请重试。</p>

      <div class="detail">
        <h3 class="dh">错误详情</h3>
        <ul class="dl">
          <li>当前域名未备案，备案流程请查看备案流程说明。</li>
          <li>你的用户组不具有进行此操作的权限。</li>
        </ul>
      </div>

      <div class="actions">
        <router-link :to="`${base}/dashboard/workplace`" class="btn-secondary btn-sm">回到首页</router-link>
        <button type="button" class="btn-primary btn-sm">返回修改</button>
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
.re {
  padding: 0 20px;
  text-align: center;
  max-width: 520px;
  margin: 0 auto;
}

.breadcrumb {
  margin: 16px 0;
  font-size: 14px;
  color: #666;
  text-align: left;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: left;
}

.content {
  margin-top: 0;
}

.icon-wrap {
  margin-bottom: 16px;
}

.icon {
  display: inline-flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(245, 63, 63, 0.12);
  color: #f53f3f;
  font-size: 32px;
  font-weight: 700;
}

.t1 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
}

.t2 {
  margin: 0 0 24px;
  color: #999;
  font-size: 14px;
}

.detail {
  text-align: left;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.dh {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.dl {
  margin: 0;
  padding-left: 18px;
  color: #666;
  font-size: 12px;
  line-height: 1.8;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.actions a {
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
