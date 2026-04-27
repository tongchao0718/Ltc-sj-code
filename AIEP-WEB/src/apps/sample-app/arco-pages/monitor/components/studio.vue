<template>
  <a-card class="general-card" :title="$t('monitor.title.studioPreview')">
    <template #extra>
      <icon-more />
    </template>
    <div class="studio-wrapper">
      <img
        src="http://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/c788fc704d32cf3b1136c7d45afc2669.png~tplv-uwbnlip3yd-webp.webp"
        class="studio-preview"
      />
      <div class="studio-bar">
        <div v-if="userInfo">
          <a-space :size="12">
            <a-avatar :size="24">
              <img :src="userInfo.avatar" alt="" />
            </a-avatar>
            <a-typography-text>
              {{ userInfo.name }} {{ $t('monitor.studioPreview.studio') }}
            </a-typography-text>
          </a-space>
        </div>
        <a-typography-text type="secondary">
          36,000 {{ $t('monitor.studioPreview.watching') }}
        </a-typography-text>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue'

const userInfo = computed(() => ({
  name: '用户名',
  avatar:
    'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/8361ee252d32a2a05082751e6de8e886.png~tplv-uwbnlip3yd-webp.webp'
}))
</script>

<style scoped lang="less">
.studio-wrapper {
  .studio-preview {
    display: block;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .studio-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
}
</style>
