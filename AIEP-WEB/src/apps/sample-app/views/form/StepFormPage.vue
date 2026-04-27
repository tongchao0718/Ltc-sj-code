<template>
  <div class="sf">
    <div class="breadcrumb">
      <span>表单页</span> / <span>分步表单</span>
    </div>
    <h1 class="page-title">分步表单</h1>
    <div class="content">
      <ol class="steps">
        <li :class="{ on: step >= 1, cur: step === 1 }">
          <div class="st-title">选择基本信息</div>
          <div class="st-sub">创建渠道活动</div>
        </li>
        <li :class="{ on: step >= 2, cur: step === 2 }">
          <div class="st-title">输入渠道信息</div>
          <div class="st-sub">输入详细的渠道信息</div>
        </li>
        <li :class="{ on: step >= 3, cur: step === 3 }">
          <div class="st-title">完成创建</div>
          <div class="st-sub">创建成功</div>
        </li>
      </ol>

      <div v-if="step === 1" class="step-pane">
        <h3 class="pane-h">渠道表单说明</h3>
        <p class="pane-tip">
          广告商渠道推广支持追踪在第三方广告商投放广告下载 App 用户的场景，例如在今日头条渠道投放下载 App 广告，追踪通过在渠道下载激活 App 的用户。
        </p>
        <label class="row">
          <span class="lb">活动名称</span>
          <input v-model="s1.activityName" type="text" class="inp" placeholder="输入汉字、字母或数字，最多20字符" />
        </label>
        <label class="row">
          <span class="lb">渠道类型</span>
          <select v-model="s1.channelType" class="inp sel">
            <option value="">请选择渠道类型</option>
            <option value="a">应用商店</option>
            <option value="b">信息流</option>
          </select>
        </label>
        <label class="row">
          <span class="lb">推广时间</span>
          <input type="text" class="inp" placeholder="选择日期范围" readonly />
        </label>
      </div>

      <div v-else-if="step === 2" class="step-pane">
        <label class="row">
          <span class="lb">推广地址</span>
          <input v-model="s2.promoteLink" type="url" class="inp" placeholder="请输入推广页面地址" />
        </label>
        <p class="hint">网址必须以 http:// 或 https:// 开头</p>
        <label class="row">
          <span class="lb">广告来源</span>
          <input v-model="s2.advertisingSource" type="text" class="inp" placeholder="引荐来源地址：sohu、sina" />
        </label>
        <label class="row">
          <span class="lb">广告媒介</span>
          <input v-model="s2.advertisingMedia" type="text" class="inp" placeholder="营销媒介：cpc、banner、edm" />
        </label>
        <label class="row">
          <span class="lb">关键词</span>
          <input v-model="s2.keyword" type="text" class="inp" placeholder="请选择关键词" />
        </label>
        <label class="row row-check">
          <input v-model="s2.pushNotify" type="checkbox" />
          <span>推送提醒</span>
        </label>
        <label class="row row-block">
          <span class="lb">广告内容</span>
          <textarea v-model="s2.advertisingContent" class="txa" rows="4" placeholder="请输入广告内容介绍，最多不超过200字。" />
        </label>
      </div>

      <div v-else class="step-pane center">
        <h3 class="ok-title">提交成功</h3>
        <p class="ok-sub">表单提交成功！</p>
      </div>

      <div class="foot">
        <button v-if="step > 1 && step < 3" type="button" class="btn-secondary btn-sm" @click="step--">上一步</button>
        <button v-if="step < 2" type="button" class="btn-primary btn-sm" @click="step++">下一步</button>
        <button v-if="step === 2" type="button" class="btn-primary btn-sm" @click="step = 3">提交</button>
        <button v-if="step === 3" type="button" class="btn-primary btn-sm" @click="reset">再次创建</button>
        <button v-if="step === 3" type="button" class="btn-secondary btn-sm">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
// import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

const step = ref(1)

const s1 = reactive({ activityName: '', channelType: '' })
const s2 = reactive({
  promoteLink: '',
  advertisingSource: '',
  advertisingMedia: '',
  keyword: '',
  pushNotify: true,
  advertisingContent: ''
})

function reset() {
  step.value = 1
  s1.activityName = ''
  s1.channelType = ''
  s2.promoteLink = ''
  s2.advertisingSource = ''
  s2.advertisingMedia = ''
  s2.keyword = ''
  s2.advertisingContent = ''
}
</script>

<style scoped>
.sf {
  padding: 0 20px;
  max-width: 720px;
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
}

.steps {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 20px;
}

.steps li {
  flex: 1;
  min-width: 140px;
  opacity: 0.45;
}

.steps li.on {
  opacity: 1;
}

.steps li.cur .st-title {
  color: #165DFF;
  font-weight: 600;
}

.st-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.st-sub {
  font-size: 12px;
  color: #999;
}

.step-pane {
  min-height: 200px;
}

.step-pane.center {
  text-align: center;
  padding: 24px 0;
}

.pane-h {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.pane-tip {
  margin: 0 0 20px;
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}

.row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.row-block {
  align-items: start;
}

.row-check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.lb {
  color: #666;
  font-size: 14px;
}

.inp,
.txa {
  font-family: Arial, sans-serif;
  font-size: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 0 12px;
}

.inp {
  height: 32px;
}

.inp.sel {
  background: #f5f5f5;
  color: #333;
}

.txa {
  padding: 8px 12px;
  resize: vertical;
  min-height: 88px;
}

.hint {
  margin: -8px 0 16px 112px;
  font-size: 12px;
  color: #999;
}

.ok-title {
  margin: 0 0 8px;
  font-size: 16px;
}

.ok-sub {
  margin: 0;
  color: #999;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.btn-primary {
  background-color: #165DFF;
  border: 1px solid #165DFF;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #4080ff;
    border-color: #4080ff;
  }
}

.btn-secondary {
  background-color: #fff;
  border: 1px solid #e8e8e8;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    border-color: #165DFF;
    color: #165DFF;
  }
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}
</style>
