import { createApp } from 'vue'
import MarketingDemoApp from './MarketingDemoApp.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { standaloneRoutes } from './routes.js'

const router = createRouter({
  history: createWebHashHistory(),
  routes: standaloneRoutes()
})

createApp(MarketingDemoApp).use(router).mount('#app')
