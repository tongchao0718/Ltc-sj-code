<template>
  <div class="container">
    <div class="breadcrumb">
      <span>详情页</span> / <span>基础详情页</span>
    </div>
    <div class="space">
      <div class="card general-card">
        <div class="card-header">
          <div class="card-title">表单标题</div>
          <div class="card-extra">
            <div class="button-group">
              <button type="button" class="button">取消</button>
              <button type="button" class="button primary">返回</button>
            </div>
          </div>
        </div>
        <div class="steps">
          <div class="step" :class="{ active: step >= 1 }">
            <div class="step-item">1</div>
            <div class="step-title">提交</div>
          </div>
          <div class="step" :class="{ active: step >= 2 }">
            <div class="step-item">2</div>
            <div class="step-title">审批</div>
          </div>
          <div class="step" :class="{ active: step >= 3 }">
            <div class="step-item">3</div>
            <div class="step-title">完成</div>
          </div>
        </div>
      </div>
      <div class="card general-card">
        <ProfileItem :loading="loading" :render-data="currentData" />
      </div>
      <div class="card general-card">
        <ProfileItem :loading="preLoading" type="pre" :render-data="preData" />
      </div>
      <OperationLog />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import ArcoBreadcrumb from '../../../components/ArcoBreadcrumb.vue'
import useLoading from '../../../hooks/useLoading.js'
// import { queryProfileBasic } from '../../../api/profile.js'
import ProfileItem from './components/profile-item.vue'
import OperationLog from './components/operation-log.vue'

const { loading, setLoading } = useLoading(true)
const { loading: preLoading, setLoading: preSetLoading } = useLoading(true)
const currentData = ref({})
const preData = ref({})
const step = ref(1)

const fetchCurrentData = async () => {
  try {
    // const { data } = await queryProfileBasic()
    // currentData.value = data
    step.value = 2
  } catch (err) {
    /* empty */
  } finally {
    setLoading(false)
  }
}
const fetchPreData = async () => {
  try {
    // const { data } = await queryProfileBasic()
    // preData.value = data
  } catch (err) {
    /* empty */
  } finally {
    preSetLoading(false)
  }
}
fetchCurrentData()
fetchPreData()
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
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

.card {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #fff;
  
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  &-title {
    font-size: 16px;
    font-weight: 500;
  }
  
  &-extra {
    flex-shrink: 0;
  }
}

.button-group {
  display: flex;
  gap: 12px;
}

.button {
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    border-color: #165DFF;
    color: #165DFF;
  }
  
  &.primary {
    background-color: #165DFF;
    border-color: #165DFF;
    color: #fff;
    
    &:hover {
      background-color: #4080ff;
      border-color: #4080ff;
    }
  }
}

.steps {
  display: flex;
  justify-content: space-between;
  max-width: 548px;
  margin: 0 auto 10px;
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    &-item {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #f5f5f5;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    &-title {
      font-size: 14px;
      color: #999;
    }
    
    &.active {
      .step-item {
        background-color: #165DFF;
        color: #fff;
      }
      
      .step-title {
        color: #165DFF;
      }
    }
  }
}
</style>
