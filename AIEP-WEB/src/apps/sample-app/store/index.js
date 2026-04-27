import { createPinia } from 'pinia';

const pinia = createPinia();

// 暂时不使用持久化插件，先确保基本功能正常
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
// pinia.use(piniaPluginPersistedstate({
//   storage: localStorage,
// }));

export default pinia;