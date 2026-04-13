import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/dist/arco.css'

import './style.css'
import App from './App.vue'
import router from './router'
import { initTheme } from './utils/theme'
import i18n from './apps/sample-app/i18n.js'
import pinia from './apps/sample-app/store/index.js'

initTheme()

const app = createApp(App)
app.use(i18n)
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(router)
app.use(pinia)
app.mount('#app')
