<template>
  <div class="cl">
    <div class="breadcrumb">
      <span>列表页</span> / <span>卡片列表</span>
    </div>
    <h1 class="page-title">卡片列表</h1>
    <div class="content">
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
// import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

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
.cl {
  padding: 0 20px;
}

.breadcrumb {
  margin: 16px 0;
  font-size: 14px;
  color: #666;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.content {
  margin-top: 0;
  background: #ffffff;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tab {
  padding: 6px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #ffffff;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  font-family: Arial, sans-serif;
}

.tab.active {
  color: #165DFF;
  border-color: #165DFF;
  background: #f0f9ff;
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
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  background: #ffffff;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.card {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.card-tag {
  flex-shrink: 0;
  font-size: 12px;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  border-radius: 2px;
  background: #f0f9ff;
  color: #165DFF;
  font-weight: 500;
}

.card-meta {
  margin: 0 0 14px;
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-text {
  background-color: transparent;
  border: none;
  color: #165DFF;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}
</style>
