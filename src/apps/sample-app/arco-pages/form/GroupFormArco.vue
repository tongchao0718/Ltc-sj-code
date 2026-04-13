<template>
  <div class="container">
    <div class="breadcrumb">
      <span>表单页</span> / <span>分组表单</span>
    </div>
    <form ref="formRef" class="form">
      <div class="space">
        <div class="card general-card">
          <div class="card-title">
            视频设置
          </div>
          <div class="row">
            <div class="col">
              <div class="form-item">
                <label>视频模式</label>
                <select>
                  <option value="custom">自定义</option>
                  <option value="mode1">模式1</option>
                  <option value="mode2">模式2</option>
                </select>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>采集分辨率</label>
                <select>
                  <option value="resolution1">分辨率1</option>
                  <option value="resolution2">分辨率2</option>
                  <option value="resolution3">分辨率3</option>
                </select>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>采集帧率</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入采集帧率" />
                  <span class="append">fps</span>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="form-item">
                <label>编码分辨率</label>
                <select>
                  <option value="resolution1">分辨率1</option>
                  <option value="resolution2">分辨率2</option>
                  <option value="resolution3">分辨率3</option>
                </select>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>最小码率</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入最小码率" />
                  <span class="append">bps</span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>最大码率</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入最大码率" />
                  <span class="append">bps</span>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="form-item">
                <label>默认码率</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入默认码率" />
                  <span class="append">bps</span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>编码帧率</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入编码帧率" />
                  <span class="append">fps</span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>编码 profile</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入编码 profile" />
                  <span class="append">bps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card general-card">
          <div class="card-title">
            音频设置
          </div>
          <div class="row">
            <div class="col">
              <div class="form-item">
                <label>音频模式</label>
                <select>
                  <option value="custom">自定义</option>
                  <option value="mode1">模式1</option>
                  <option value="mode2">模式2</option>
                </select>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>采集声道数</label>
                <select>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>编码声道数</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入编码声道数" />
                  <span class="append">bps</span>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="form-item">
                <label>编码码率</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入编码码率" />
                  <span class="append">bps</span>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="form-item">
                <label>编码 profile</label>
                <div class="input-with-append">
                  <input type="text" placeholder="请输入编码 profile" />
                  <span class="append">fps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card general-card">
          <div class="card-title">
            描述
          </div>
          <div class="form-item">
            <label>参数描述</label>
            <textarea placeholder="请输入参数描述"></textarea>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="button-group">
          <button type="button" class="button">重置</button>
          <button type="button" class="button primary" :disabled="loading" @click="onSubmitClick">
            提交
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import ArcoBreadcrumb from '../../components/ArcoBreadcrumb.vue'
import useLoading from '../../hooks/useLoading.js'

const formData = ref({})
const formRef = ref()
const { loading, setLoading } = useLoading()

const onSubmitClick = async () => {
  setLoading(true)
  setTimeout(() => {
    setLoading(false)
  }, 1000)
}
</script>

<style scoped lang="less">
/* 与 vue-pro.arco.design/form/group 一致：底部留白避免被固定操作栏遮挡 */
.container {
  padding: 0 20px 80px 20px;
  overflow: hidden;
}

.breadcrumb {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.form {
  width: 100%;
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
  
  &-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
  
  & + .row {
    margin-top: 16px;
  }
}

.col {
  flex: 1;
  min-width: 300px;
  padding: 0 8px;
}

.form-item {
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
  }
  
  input,
  select,
  textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #165DFF;
      box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
    }
  }
  
  textarea {
    height: 100px;
    resize: vertical;
  }
}

.input-with-append {
  position: relative;
  
  .append {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    padding: 0 12px;
    line-height: 36px;
    background-color: #f5f5f5;
    border: 1px solid #e8e8e8;
    border-left: none;
    border-radius: 0 4px 4px 0;
    font-size: 14px;
    color: #666;
  }
  
  input {
    padding-right: 80px;
  }
}

.actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  padding: 14px 20px 14px 0;
  background: #f5f5f5;
  text-align: right;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
    
    &:disabled {
      background-color: #b3c6ff;
      border-color: #b3c6ff;
      cursor: not-allowed;
    }
  }
}
</style>
