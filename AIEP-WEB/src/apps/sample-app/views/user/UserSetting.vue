<template>
  <div class="page-setting">
    <div class="breadcrumb">
      <span>个人中心</span> / <span>用户设置</span>
    </div>
    <h1 class="page-title">用户设置</h1>
    <div class="content">
      <div class="layout">
      <aside class="submenu" aria-label="设置子菜单">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="sub-link"
          :class="{ active: active === tab.key }"
          @click="active = tab.key"
        >
          {{ tab.label }}
        </button>
      </aside>
      <section class="sub-panel ds-card">
        <h2 class="sub-title">{{ current.title }}</h2>
        <p class="sub-desc">{{ current.desc }}</p>

        <div v-if="active === 'basic'" class="pane">
          <h3 class="pane-h">基础信息</h3>
          <label class="row">
            <span class="lb">邮箱</span>
            <input type="email" class="inp" placeholder="请输入邮箱地址" />
          </label>
          <label class="row">
            <span class="lb">昵称</span>
            <input type="text" class="inp" placeholder="请输入您的昵称" />
          </label>
          <label class="row">
            <span class="lb">国家/地区</span>
            <select class="inp sel">
              <option value="">请选择</option>
              <option>中国</option>
              <option>其他</option>
            </select>
          </label>
          <label class="row">
            <span class="lb">所在区域</span>
            <select class="inp sel">
              <option value="">请选择</option>
              <option>华东</option>
              <option>华北</option>
            </select>
          </label>
          <label class="row">
            <span class="lb">具体地址</span>
            <input type="text" class="inp" placeholder="请输入您的地址" />
          </label>
          <label class="row full">
            <span class="lb">个人简介</span>
            <textarea class="txa" rows="4" placeholder="请输入您的个人简介，最多不超过200字。" />
          </label>
          <div class="actions">
            <button type="button" class="btn-primary btn-sm">保存</button>
            <button type="button" class="btn-secondary btn-sm">取消</button>
            <button type="button" class="btn-text btn-sm">重置</button>
          </div>
        </div>

        <div v-else-if="active === 'account'" class="pane">
          <h3 class="pane-h">账号信息</h3>
          <table class="kv">
            <tr>
              <td>账号ID</td>
              <td>100012345678</td>
            </tr>
            <tr>
              <td>注册时间</td>
              <td>2023-06-01 10:00:00</td>
            </tr>
            <tr>
              <td>实名认证</td>
              <td>已认证</td>
            </tr>
          </table>
        </div>

        <div v-else-if="active === 'password'" class="pane">
          <h3 class="pane-h">安全设置</h3>
          <ul class="sec-list">
            <li>
              <div>
                <div class="sec-t">登录密码</div>
                <div class="sec-d">已设置。密码至少6位字符，支持数字、字母和除空格外的特殊字符，且必须同时包含数字和大小写字母。</div>
              </div>
              <button type="button" class="btn-secondary btn-sm">修改</button>
            </li>
            <li>
              <div>
                <div class="sec-t">密保问题</div>
                <div class="sec-d">您暂未设置密保问题，密保问题可以有效的保护账号的安全。</div>
              </div>
              <button type="button" class="btn-primary btn-sm">设置</button>
            </li>
            <li>
              <div>
                <div class="sec-t">安全手机</div>
                <div class="sec-d">已绑定：138****8000</div>
              </div>
              <button type="button" class="btn-secondary btn-sm">修改</button>
            </li>
            <li>
              <div>
                <div class="sec-t">安全邮箱</div>
                <div class="sec-d">您暂未设置邮箱，绑定邮箱可以用来找回密码、接收通知等。</div>
              </div>
              <button type="button" class="btn-primary btn-sm">设置</button>
            </li>
          </ul>
        </div>

        <div v-else-if="active === 'message'" class="pane">
          <h3 class="pane-h">消息通知</h3>
          <label class="chk"><input type="checkbox" checked /> 系统通知</label>
          <label class="chk"><input type="checkbox" checked /> 邮件通知</label>
          <label class="chk"><input type="checkbox" /> 短信通知</label>
          <div class="actions">
            <button type="button" class="btn-primary btn-sm">保存</button>
          </div>
        </div>

        <div v-else-if="active === 'result'" class="pane">
          <h3 class="pane-h">结果页</h3>
          <p class="muted">流程结束后跳转的结果页模板与文案配置。</p>
          <router-link :to="`${base}/result/success`" class="btn-secondary btn-sm link-btn">查看成功页</router-link>
          <router-link :to="`${base}/result/error`" class="btn-text btn-sm link-btn">查看失败页</router-link>
        </div>

        <div v-else-if="active === 'data'" class="pane">
          <h3 class="pane-h">导出数据</h3>
          <div class="table-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>用户列表导出</td>
                  <td><span class="tag tag-success">已完成</span></td>
                  <td>2024-01-12 09:00</td>
                  <td><button type="button" class="btn-text btn-sm">下载</button></td>
                </tr>
                <tr>
                  <td>订单明细导出</td>
                  <td><span class="tag tag-muted">处理中</span></td>
                  <td>2024-01-12 10:30</td>
                  <td><button type="button" class="btn-text btn-sm" disabled>下载</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
// import ArcoDemoShell from '../../components/ArcoDemoShell.vue'

const route = useRoute()
const base = computed(() => (route.path.startsWith('/sample-app') ? '/sample-app' : ''))

const tabs = [
  { key: 'basic', label: '个人信息', title: '个人信息', desc: '管理您的昵称、联系方式与简介。' },
  { key: 'account', label: '账号设置', title: '账号设置', desc: '查看账号标识与注册信息。' },
  { key: 'password', label: '密码', title: '密码', desc: '登录密码与账号安全相关项。' },
  { key: 'message', label: '消息通知', title: '消息通知', desc: '选择接收通知的方式。' },
  { key: 'result', label: '结果页', title: '结果页', desc: '配置或预览流程结果页。' },
  { key: 'data', label: '导出数据', title: '导出数据', desc: '查看与下载数据导出任务。' }
]

const active = ref('basic')

const current = computed(() => tabs.find((x) => x.key === active.value) || tabs[0])
</script>

<style scoped>
.page-setting {
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
}

.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.submenu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 8px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.sub-link {
  text-align: left;
  padding: 10px 14px;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.sub-link:hover {
  background: #f0f0f0;
  color: #165DFF;
}

.sub-link.active {
  background: #f0f9ff;
  color: #165DFF;
  font-weight: 500;
}

.sub-panel {
  padding: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: none;
}

.sub-panel:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.sub-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.sub-desc {
  margin: 0 0 20px;
  font-size: 14px;
  color: #999;
  line-height: 1.57;
}

.pane-h {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.row.full {
  align-items: start;
}

.lb {
  font-size: 14px;
  color: #666;
}

.inp,
.txa {
  font-family: Arial, sans-serif;
  font-size: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 0 12px;
  max-width: 400px;
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

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.kv {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.kv td {
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
}

.kv td:first-child {
  width: 120px;
  background: #f0f0f0;
  color: #666;
}

.sec-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sec-list li {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e8e8e8;
}

.sec-list li:last-child {
  border-bottom: none;
}

.sec-t {
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.sec-d {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  max-width: 520px;
}

.chk {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.muted {
  color: #999;
  font-size: 14px;
  margin-bottom: 16px;
}

.link-btn {
  display: inline-flex;
  margin-right: 12px;
  text-decoration: none;
  align-items: center;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.tbl th,
.tbl td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

.tbl thead th {
  background: #f0f0f0;
  font-weight: 600;
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

.btn-text {
  background-color: transparent;
  border: none;
  color: #165DFF;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:disabled {
    color: #999;
    cursor: not-allowed;
  }
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  
  &.tag-success {
    background-color: #f0f9ff;
    color: #165DFF;
  }
  
  &.tag-muted {
    background-color: #f5f5f5;
    color: #999;
  }
}
</style>
