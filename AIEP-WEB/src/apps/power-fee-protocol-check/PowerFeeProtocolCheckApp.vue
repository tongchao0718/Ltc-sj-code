<template>
  <div class="app-layout power-fee-scope">
    <aside class="app-sidebar" aria-label="侧栏菜单">
      <div class="sidebar-title">电费协议核查</div>
      <nav class="sidebar-nav">
        <section v-for="group in menuGroups" :key="group.title" class="menu-group">
          <div class="menu-group-title">{{ group.title }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="`${base}${item.to}`"
            class="menu-link"
            active-class="menu-link--active"
          >
            {{ item.label }}
          </router-link>
        </section>
      </nav>
    </aside>
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const base = computed(() => {
  const isStandalone = window.location.hash.startsWith('#/') || window.location.protocol === 'file:';
  return isStandalone ? '' : '/power-fee-protocol-check';
});

const menuGroups = [
  {
    title: '协议核查管理',
    items: [
      { label: '协议模板库管理', to: '/template' },
      { label: '样本标注管理', to: '/sample-annotation' },
      { label: '核查规则管理', to: '/rule-publish' },
      { label: '核查任务策略管理', to: '/task-strategy' }
    ]
  },
  {
    title: '异常分析及治理',
    items: [
      { label: '协议识别核查执行', to: '/check-execution' },
      { label: '协议信息提取引擎', to: '/module/M06' },
      { label: '协议信息解析', to: '/module/M07' },
      { label: '识别结果校核', to: '/module/M08' },
      { label: '识别问题结果记录', to: '/module/M09' },
      { label: '问题分析及治理', to: '/module/M10' },
      { label: '核查任务监控', to: '/module/M11' },
      { label: '核查结果监控', to: '/module/M12' }
    ]
  },
  {
    title: '识别能力优化',
    items: [
      { label: '能力优化迭代', to: '/module/M13' },
      { label: '协同复核', to: '/module/M14' }
    ]
  },
  {
    title: '辅助验证',
    items: [{ label: '全链路验证', to: '/full-flow' }]
  }
];
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100%;
  background: #f0f2f5;
}
.app-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 12px 10px;
}
.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.menu-group-title {
  font-size: 13px;
  line-height: 20px;
  color: #86909c;
  padding: 0 10px;
}
.menu-link {
  text-decoration: none;
  color: #4e5969;
  border-radius: 6px;
  padding: 7px 10px 7px 18px;
}
.menu-link:hover {
  background: #f2f3f5;
}
.menu-link--active {
  color: #165dff;
  background: #e8f3ff;
}
.app-content {
  flex: 1;
  min-width: 0;
  padding: 16px;
}
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  .app-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
  }
}
</style>
