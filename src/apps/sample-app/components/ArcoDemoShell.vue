<template>
  <div class="arco-page" :class="{ 'arco-page--plain': variant === 'plain' }">
    <nav v-if="crumbs.length" class="breadcrumb" aria-label="面包屑">
      <template v-for="(c, i) in crumbs" :key="i">
        <span v-if="i > 0" class="crumb-sep">/</span>
        <span :class="i === crumbs.length - 1 ? 'crumb-current' : 'crumb-muted'">{{ c }}</span>
      </template>
    </nav>

    <template v-if="variant === 'plain'">
      <div class="plain-slot">
        <slot />
      </div>
    </template>
    <section v-else class="panel ds-card">
      <h1 v-if="title" class="panel-title">{{ title }}</h1>
      <div class="panel-body">
        <slot />
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  /** 单卡片页用 h1 标题；plain 模式由页面内自行放标题 */
  title: { type: String, default: '' },
  crumbs: { type: Array, default: () => [] },
  variant: { type: String, default: 'card' }
})
</script>

<style scoped>
.arco-page {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 仪表盘 / 可视化等：与主内容区同宽，避免双列留白不一致 */
.arco-page--plain {
  max-width: none;
  margin: 0;
}

.breadcrumb {
  font-size: var(--font-size-body);
  margin-bottom: 16px;
}

.crumb-muted {
  color: var(--color-text-3);
}

.crumb-sep {
  margin: 0 8px;
  color: var(--color-text-4);
}

.crumb-current {
  color: var(--color-text-1);
  font-weight: 500;
}

.plain-slot {
  font-size: var(--font-size-body);
  color: var(--color-text-2);
}

.panel {
  padding: 24px 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-bg-2);
  box-shadow: var(--shadow-card);
}

.panel-title {
  margin: 0 0 20px;
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-text-1);
  line-height: 24px;
}

.panel-body {
  font-size: var(--font-size-body);
  color: var(--color-text-2);
  line-height: 1.57;
}
</style>
