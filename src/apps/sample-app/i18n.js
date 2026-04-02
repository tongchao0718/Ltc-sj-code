import { createI18n } from 'vue-i18n'
import zhCN from './locales/arco-pro-zh-CN.js'

export default createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN
  }
})
