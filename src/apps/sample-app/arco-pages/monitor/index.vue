<template>
  <div class="container">
    <div class="breadcrumb">
      <span>仪表盘</span> / <span>实时监控</span>
    </div>
    <div class="layout">
      <div class="layout-left-side">
        <ChatPanel />
      </div>
      <div class="layout-content">
        <div class="space">
          <Studio />
          <DataStatistic />
        </div>
      </div>
      <div class="layout-right-side">
        <div class="space">
          <StudioStatus />
          <QuickOperation />
          <StudioInformation />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import ArcoBreadcrumb from '../../components/ArcoBreadcrumb.vue'
import ChatPanel from './components/chat-panel.vue'
import Studio from './components/studio.vue'
import DataStatistic from './components/data-statistic.vue'
import StudioStatus from './components/studio-status.vue'
import QuickOperation from './components/quick-operation.vue'
import StudioInformation from './components/studio-information.vue'
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
}

.layout {
  display: flex;

  &-left-side {
    flex-basis: 300px;
  }

  &-content {
    flex: 1;
    padding: 0 16px;
  }

  &-right-side {
    flex-basis: 280px;
  }
}

.breadcrumb {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.space {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

<style lang="less" scoped>
@media (max-width: 992px) {
  .layout {
    flex-wrap: wrap;
    &-left-side {
      flex: 1;
      flex-basis: 100%;
      margin-bottom: 16px;
    }

    &-content {
      flex: none;
      flex-basis: 100%;
      padding: 0;
      order: -1;
      margin-bottom: 16px;
    }

    &-right-side {
      flex-basis: 100%;
    }
  }
}
</style>
