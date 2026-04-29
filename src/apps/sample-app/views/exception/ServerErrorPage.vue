<template>
  <ArcoDemoShell variant="card" :crumbs="['异常页', '500']">
    <div class="ex-page">
      <div class="code">500</div>
      <p class="msg">抱歉，服务器出了点问题～</p>
      <router-link :to="`${base}/dashboard/workplace`" class="btn-primary btn-sm">返回</router-link>
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
  color: var(--color-warning);
  line-height: 1;
  margin-bottom: 16px;
}

.msg {
  color: var(--color-text-2);
  margin-bottom: 24px;
  font-size: var(--font-size-body);
}

.ex-page a {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
</style>
