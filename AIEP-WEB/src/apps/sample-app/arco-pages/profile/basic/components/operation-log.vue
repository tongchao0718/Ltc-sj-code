<template>
  <a-card class="general-card">
    <template #title>
      {{ $t('basicProfile.title.operationLog') }}
    </template>
    <a-spin :loading="loading" style="width: 100%">
      <a-table :data="renderData">
        <template #columns>
          <a-table-column
            :title="$t('basicProfile.column.contentNumber')"
            data-index="contentNumber"
          />
          <a-table-column
            :title="$t('basicProfile.column.updateContent')"
            data-index="updateContent"
          />
          <a-table-column :title="$t('basicProfile.column.status')" data-index="status">
            <template #cell="{ record }">
              <p v-if="record.status === 0">
                <span class="circle"></span>
                <span>{{ $t('basicProfile.cell.auditing') }}</span>
              </p>
              <p v-if="record.status === 1">
                <span class="circle pass"></span>
                <span>{{ $t('basicProfile.cell.pass') }}</span>
              </p>
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('basicProfile.column.updateTime')"
            data-index="updateTime"
          />
          <a-table-column :title="$t('basicProfile.column.operation')">
            <template #cell>
              <a-button type="text">{{ $t('basicProfile.cell.view') }}</a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-spin>
  </a-card>
</template>

<script setup>
import { ref } from 'vue'
import { queryOperationLog } from '../../../../api/profile.js'
import useLoading from '../../../../hooks/useLoading.js'

const { loading, setLoading } = useLoading(true)
const renderData = ref([])
const fetchData = async () => {
  try {
    const { data } = await queryOperationLog()
    renderData.value = data
  } catch (err) {
    /* empty */
  } finally {
    setLoading(false)
  }
}
fetchData()
</script>

<style scoped lang="less">
:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}

.circle {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
  background: rgb(var(--orange-6));
  vertical-align: middle;

  &.pass {
    background: rgb(var(--green-6));
  }
}
</style>
