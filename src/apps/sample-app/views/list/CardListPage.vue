<template>
  <ArcoDemoShell title="卡片列表" :crumbs="['列表页', '卡片列表']">
    <div class="cl">
      <div class="tabs">
        <button
          v-for="t in tabs"
          :key="t"
          type="button"
          class="tab"
          :class="{ active: active === t }"
          @click="active = t"
        >
          {{ t }}
        </button>
      </div>
      <div class="search-row">
        <input v-model="q" type="search" class="search-inp" placeholder="搜索" />
      </div>
      <div class="cards">
        <article v-for="(c, i) in cardItems" :key="i" class="card">
          <div class="card-hd">
            <h3 class="card-name">{{ c.title }}</h3>
            <span v-if="c.tag" class="card-tag">{{ c.tag }}</span>
          </div>
          <p class="card-meta">{{ c.sub }}</p>
          <div class="card-actions">
            <button type="button" class="btn-text btn-sm">{{ c.primary }}</button>
            <button v-if="c.secondary" type="button" class="btn-text btn-sm">{{ c.secondary }}</button>
          </div>
        </article>
      </div>
    </div>
  </ArcoDemoShell>
</template>

<script setup>
import { computed, ref } from 'vue'
import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

const tabs = ['全部', '内容质检', '开通服务', '规则预置']
const active = ref('全部')
const q = ref('')

const cardItems = computed(() => {
  const base = [
    {
      title: '内容质检队列 A',
      sub: '点击创建质检内容队列',
      tag: '',
      primary: '质检',
      secondary: '删除'
    },
    {
      title: '开通服务 · 对象存储',
      sub: '对象存储与 CDN 加速',
      tag: '已开通',
      primary: '续约服务',
      secondary: '取消服务'
    },
    {
      title: '规则预置包 · 敏感词',
      sub: '文本类内容默认规则',
      tag: '已启用',
      primary: '删除',
      secondary: ''
    },
    {
      title: '内容质检队列 B',
      sub: '待配置抽检比例',
      tag: '',
      primary: '质检',
      secondary: '删除'
    },
    {
      title: '开通服务 · 直播转码',
      sub: '直播转码与录制',
      tag: '已过期',
      primary: '开通服务',
      secondary: ''
    },
    {
      title: '规则预置包 · 画面',
      sub: '视频画面合规检测',
      tag: '已启用',
      primary: '删除',
      secondary: ''
    }
  ]
  return base
})
</script>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  padding: 6px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-bg-2);
  font-size: var(--font-size-body);
  color: var(--color-text-2);
  cursor: pointer;
  font-family: inherit;
}

.tab.active {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  font-weight: 500;
}

.search-row {
  margin-bottom: 20px;
}

.search-inp {
  width: 100%;
  max-width: 320px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px;
  background: var(--color-bg-2);
}

.card-hd {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.card-name {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-text-1);
}

.card-tag {
  flex-shrink: 0;
  font-size: var(--font-size-caption);
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  border-radius: 2px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 500;
}

.card-meta {
  margin: 0 0 14px;
  font-size: var(--font-size-caption);
  color: var(--color-text-3);
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
