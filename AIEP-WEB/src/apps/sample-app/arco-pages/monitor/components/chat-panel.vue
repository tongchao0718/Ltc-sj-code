<template>
  <a-card
    class="general-card chat-panel"
    :title="$t('monitor.title.chatPanel')"
    :bordered="false"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{
      height: '100%',
      paddingTop: '16px',
      display: 'flex',
      flexFlow: 'column',
    }"
  >
    <a-space :size="8">
      <a-select style="width: 86px" default-value="all">
        <a-option value="all">
          {{ $t('monitor.chat.options.all') }}
        </a-option>
      </a-select>
      <a-input-search
        :placeholder="$t('monitor.chat.placeholder.searchCategory')"
      />
      <a-button type="text">
          <IconDownload />
        </a-button>
    </a-space>
    <div class="chat-panel-content">
      <a-spin :loading="loading" style="width: 100%">
        <ChatList :render-list="chatData" />
      </a-spin>
    </div>
    <div class="chat-panel-footer">
      <a-space :size="8">
        <a-input>
          <template #suffix>
            <IconFaceSmileFill />
          </template>
        </a-input>
        <a-button type="primary">{{ $t('monitor.chat.update') }}</a-button>
      </a-space>
    </div>
  </a-card>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { queryChatList } from '../../../api/message.js'
import useLoading from '../../../hooks/useLoading.js'
import ChatList from './chat-list.vue'
import { IconDownload, IconFaceSmileFill } from '@arco-design/web-vue/es/icon'

const { t } = useI18n()
const { loading, setLoading } = useLoading(true)
const chatData = ref([])
const fetchData = async () => {
  try {
    const { data } = await queryChatList()
    chatData.value = data
  } catch (err) {
    /* empty */
  } finally {
    setLoading(false)
  }
}
fetchData()
</script>

<style scoped lang="less">
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    // padding: 20px;
    background-color: var(--color-bg-2);

    &-content {
      flex: 1;
      margin: 20px 0;
    }
  }
</style>
