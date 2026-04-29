<template>
  <ArcoDemoShell title="失败页" :crumbs="['结果页', '失败页']">
    <div class="re">
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
  </ArcoDemoShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

const route = useRoute()
const base = computed(() => (route.path.startsWith('/sample-app') ? '/sample-app' : ''))
</script>

<style scoped>
.re {
  text-align: center;
  max-width: 520px;
  margin: 0 auto;
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
  color: var(--color-danger);
  font-size: 32px;
  font-weight: 700;
}

.t1 {
  margin: 0 0 8px;
  font-size: var(--font-size-title-sm);
}

.t2 {
  margin: 0 0 24px;
  color: var(--color-text-3);
}

.detail {
  text-align: left;
  background: var(--color-fill-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px 20px;
  margin-bottom: 24px;
}

.dh {
  margin: 0 0 10px;
  font-size: var(--font-size-body);
  font-weight: 600;
}

.dl {
  margin: 0;
  padding-left: 18px;
  color: var(--color-text-2);
  font-size: var(--font-size-caption);
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
</style>
