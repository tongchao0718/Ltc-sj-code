<template>
  <ArcoDemoShell title="成功页" :crumbs="['结果页', '成功页']">
    <div class="rs">
      <div class="icon-wrap" aria-hidden="true">
        <span class="icon">✓</span>
      </div>
      <h2 class="t1">提交成功</h2>
      <p class="t2">表单提交成功！</p>

      <div class="progress">
        <div class="ph">当前进度</div>
        <ul class="timeline">
          <li v-for="(p, i) in phases" :key="p.k" class="ti" :class="p.state">
            <span class="dot" />
            <div>
              <div class="pn">{{ p.k }}</div>
              <div class="ps">{{ p.stateLabel }}</div>
            </div>
            <span v-if="i < phases.length - 1" class="line" />
          </li>
        </ul>
      </div>

      <div class="actions">
        <button type="button" class="btn-secondary btn-sm">打印结果</button>
        <router-link :to="`${base}/dashboard/workplace`" class="btn-primary btn-sm">返回项目列表</router-link>
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

const phases = [
  { k: '提交申请', state: 'done', stateLabel: '已完成' },
  { k: '直属领导审核', state: 'doing', stateLabel: '进行中' },
  { k: '购买证书', state: 'wait', stateLabel: '未开始' },
  { k: '安全测试', state: 'wait', stateLabel: '未开始' },
  { k: '正式上线', state: 'wait', stateLabel: '未开始' }
]
</script>

<style scoped>
.rs {
  text-align: center;
  max-width: 560px;
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
  background: rgba(0, 180, 42, 0.12);
  color: var(--color-success);
  font-size: 32px;
  font-weight: 700;
}

.t1 {
  margin: 0 0 8px;
  font-size: var(--font-size-title-sm);
  color: var(--color-text-1);
}

.t2 {
  margin: 0 0 28px;
  color: var(--color-text-3);
  font-size: var(--font-size-body);
}

.progress {
  text-align: left;
  background: var(--color-fill-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px 20px 20px;
  margin-bottom: 24px;
}

.ph {
  font-size: var(--font-size-body);
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-1);
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ti {
  position: relative;
  padding-left: 28px;
  padding-bottom: 16px;
}

.ti:last-child {
  padding-bottom: 0;
}

.dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-text-4);
}

.ti.done .dot {
  background: var(--color-success);
}

.ti.doing .dot {
  background: var(--color-primary);
}

.pn {
  font-size: var(--font-size-body);
  color: var(--color-text-1);
  font-weight: 500;
}

.ps {
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
  margin-top: 2px;
}

.line {
  position: absolute;
  left: 4px;
  top: 18px;
  bottom: -6px;
  width: 2px;
  background: var(--color-border);
}

.ti:last-child .line {
  display: none;
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
