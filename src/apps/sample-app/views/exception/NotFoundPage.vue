<template>
  <ArcoDemoShell variant="card" :crumbs="['异常页', '404']">
    <div class="ex-page">
      <div class="code">404</div>
      <p class="msg">抱歉，页面不见了～</p>
      <div class="row">
        <button type="button" class="btn-secondary btn-sm">重试</button>
        <router-link :to="`${base}/dashboard/workplace`" class="btn-primary btn-sm">返回</router-link>
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
.ex-page {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px 40px;
}

.code {
  font-size: 64px;
  font-weight: 700;
  color: var(--color-text-3);
  line-height: 1;
  margin-bottom: 16px;
}

.msg {
  color: var(--color-text-2);
  margin-bottom: 24px;
  font-size: var(--font-size-body);
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
</style>
