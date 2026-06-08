<template>
  <div class="md-list-page">
    <!-- 查询区 -->
    <div class="md-panel">
      <MdSectionTitle :title="config.title" />
      <MdFilterForm
        :filters="config.filters"
        :form="form"
        :loading="loading"
        @search="search"
        @reset="reset"
      />
    </div>

    <!-- 列表区 -->
    <div class="md-panel md-panel--table">
      <MdSectionTitle :title="listTitle">
        <template #extra>
          <button type="button" class="md-link" @click="openCreate">+ 新增{{ config.entityName }}</button>
        </template>
      </MdSectionTitle>

      <div v-if="loading" class="md-loading">加载中…</div>
      <div v-else-if="error" class="md-empty">{{ error }}</div>
      <div v-else-if="!rows.length" class="md-empty">暂无数据，可点击「新增{{ config.entityName }}」添加</div>
      <template v-else>
        <div class="md-table-wrap">
          <table class="md-table">
            <thead>
              <tr>
                <th v-for="col in config.columns" :key="col.key">{{ col.label }}</th>
                <th style="width:180px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td v-for="col in config.columns" :key="col.key">
                  <span v-if="col.tag" class="md-tag" :class="tagClass(row[col.key])">{{ row[col.key] ?? '-' }}</span>
                  <span v-else>{{ row[col.key] ?? '-' }}</span>
                </td>
                <td class="md-table-actions">
                  <button type="button" class="md-link" @click="openDetail(row)">详情</button>
                  <button type="button" class="md-link" @click="openEdit(row)">编辑</button>
                  <button type="button" class="md-link" style="color:#f5222d" @click="openDelete(row)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <MdPagination
          :total="total"
          :page-no="pageNo"
          :page-size="pageSize"
          @change="changePage"
          @size-change="changeSize"
        />
      </template>
    </div>

    <!-- 详情弹窗 -->
    <MdDetailModal :visible="detailVisible" :title="detailTitle" size="lg" @close="detailVisible = false">
      <MdDetailView :basic-items="detailItems" :basic-columns="2" />
    </MdDetailModal>

    <!-- 新增/编辑弹窗 -->
    <MdDetailModal :visible="formVisible" :title="formTitle" size="lg" @close="closeForm">
      <MdModalSection title="基本信息">
        <div class="md-form-stack md-form-grid">
          <div
            v-for="field in config.formFields"
            :key="field.key"
            class="md-form-item"
            :class="{ 'md-form-item--full': field.span === 2 }"
          >
            <label>{{ field.label }}<span v-if="field.required" class="md-required">*</span></label>
            <select
              v-if="field.type === 'select'"
              v-model="editForm[field.key]"
              class="md-select"
            >
              <option value="">请选择</option>
              <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="editForm[field.key]"
              class="md-textarea"
              :placeholder="field.placeholder || `请输入${field.label}`"
              rows="3"
            />
            <input
              v-else
              v-model="editForm[field.key]"
              class="md-input"
              :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
              :placeholder="field.placeholder || `请输入${field.label}`"
            />
          </div>
        </div>
      </MdModalSection>
      <template #footer>
        <button type="button" class="md-btn md-btn--ghost" @click="closeForm">取消</button>
        <button type="button" class="md-btn md-btn--primary" :disabled="saving" @click="submitForm">
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </template>
    </MdDetailModal>

    <!-- 删除确认 -->
    <MdConfirmModal
      :visible="deleteVisible"
      :message="deleteMessage"
      :loading="deleting"
      @cancel="deleteVisible = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import MdSectionTitle from './MdSectionTitle.vue'
import MdFilterForm from './MdFilterForm.vue'
import MdDetailModal from './MdDetailModal.vue'
import MdDetailView from './MdDetailView.vue'
import MdModalSection from './MdModalSection.vue'
import MdPagination from './MdPagination.vue'
import MdConfirmModal from './MdConfirmModal.vue'
import { crudList, crudCreate, crudUpdate, crudDelete } from '../mock/api.js'
import { buildDetailItems } from '../config/fieldLabels.js'
import { useMdMessage } from '../composables/useMdMessage.js'

const props = defineProps({
  config: { type: Object, required: true }
})

const msg = useMdMessage()
const listTitle = computed(() => props.config.listTitle || `${props.config.title.replace(/管理$/, '')}列表`)

const form = reactive(Object.fromEntries((props.config.filters || []).map((f) => [f.key, ''])))
const editForm = reactive({})
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const rows = ref([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)

const detailVisible = ref(false)
const detailTitle = ref('')
const detailItems = ref([])

const formVisible = ref(false)
const formMode = ref('create')
const editingId = ref(null)
const formTitle = computed(() => `${formMode.value === 'create' ? '新增' : '编辑'}${props.config.entityName}`)

const deleteVisible = ref(false)
const deleteTarget = ref(null)
const deleteMessage = computed(() =>
  deleteTarget.value ? `确定删除「${deleteTarget.value.name || deleteTarget.value.title || '该记录'}」吗？删除后不可恢复。` : ''
)

function tagClass(v) {
  if (['A', '启用', '生效', '正常'].includes(v)) return 'md-tag--success'
  if (['B', '草稿', '待审核'].includes(v)) return 'md-tag--warning'
  if (['C', '停用', '高风险'].includes(v)) return 'md-tag--danger'
  return 'md-tag--info'
}

function emptyForm() {
  const o = {}
  props.config.formFields.forEach((f) => { o[f.key] = f.type === 'number' ? null : '' })
  return o
}

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const res = await crudList(props.config.apiKey, { ...form, pageNo: pageNo.value, pageSize: pageSize.value })
    rows.value = res.rows
    total.value = res.total
  } catch (e) {
    error.value = '加载失败，请稍后重试'
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function search() {
  pageNo.value = 1
  fetchData()
}

function reset() {
  Object.keys(form).forEach((k) => { form[k] = '' })
  search()
}

function changePage(p) {
  pageNo.value = p
  fetchData()
}

function changeSize(size) {
  pageSize.value = size
  pageNo.value = 1
  fetchData()
}

function openDetail(row) {
  detailTitle.value = `${row.name || props.config.entityName} — 详情`
  detailItems.value = buildDetailItems(row, props.config.detailFields)
  detailVisible.value = true
}

function openCreate() {
  formMode.value = 'create'
  editingId.value = null
  Object.assign(editForm, emptyForm())
  formVisible.value = true
}

function openEdit(row) {
  formMode.value = 'edit'
  editingId.value = row.id
  Object.assign(editForm, emptyForm())
  props.config.formFields.forEach((f) => {
    editForm[f.key] = row[f.key] ?? (f.type === 'number' ? null : '')
  })
  formVisible.value = true
}

function closeForm() {
  formVisible.value = false
}

function validateForm() {
  for (const f of props.config.formFields) {
    if (f.required && (editForm[f.key] === '' || editForm[f.key] == null)) {
      msg.warning(`请填写${f.label}`)
      return false
    }
  }
  return true
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true
  try {
    const payload = { ...editForm }
    props.config.formFields.forEach((f) => {
      if (f.type === 'number' && payload[f.key] != null) payload[f.key] = Number(payload[f.key])
    })
    if (formMode.value === 'create') {
      await crudCreate(props.config.apiKey, payload)
      msg.success(`新增${props.config.entityName}成功`)
    } else {
      await crudUpdate(props.config.apiKey, editingId.value, payload)
      msg.success(`编辑${props.config.entityName}成功`)
    }
    formVisible.value = false
    fetchData()
  } catch (e) {
    msg.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

function openDelete(row) {
  deleteTarget.value = row
  deleteVisible.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await crudDelete(props.config.apiKey, deleteTarget.value.id)
    msg.success(`删除${props.config.entityName}成功`)
    deleteVisible.value = false
    fetchData()
  } catch (e) {
    msg.error('删除失败，请稍后重试')
  } finally {
    deleting.value = false
  }
}

fetchData()
</script>
