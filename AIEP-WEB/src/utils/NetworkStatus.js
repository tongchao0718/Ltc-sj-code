// 网络状态管理模块

import { ref, computed, readonly } from 'vue';

// 事件总线
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

const eventBus = new EventBus();

// 网络状态
const isOnline = ref(navigator.onLine);
const wasOffline = ref(false); // 记录是否曾经离线

// 监听网络状态变化
window.addEventListener('online', () => {
  isOnline.value = true;

  if (wasOffline.value) {
    // 从离线恢复，触发同步
    console.log('网络恢复，触发数据同步');
    eventBus.emit('network:restored');
  }
});

window.addEventListener('offline', () => {
  isOnline.value = false;
  wasOffline.value = true;
  console.log('网络断开，切换到离线模式');
  eventBus.emit('network:lost');
});

// 导出组合式函数
export function useNetworkStatus() {
  const networkStatus = computed(() => {
    if (isOnline.value) return 'online';
    return 'offline';
  });

  return {
    isOnline: readonly(isOnline),
    networkStatus,
    onNetworkRestored: (callback) => eventBus.on('network:restored', callback),
    onNetworkLost: (callback) => eventBus.on('network:lost', callback),
    offNetworkRestored: (callback) => eventBus.off('network:restored', callback),
    offNetworkLost: (callback) => eventBus.off('network:lost', callback)
  };
}

// 导出事件总线（用于其他模块）
export const EventBus = eventBus;

// 导出网络状态枚举
export const NetworkStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};
