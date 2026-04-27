// 同步管理器模块

import { localDB } from '../database/local';
import { EventBus } from './NetworkStatus';

// 同步状态枚举
export const SyncStatus = {
  SYNCED: 'synced',        // 已同步
  PENDING: 'pending',      // 待同步
  SYNCING: 'syncing',      // 同步中
  CONFLICT: 'conflict',    // 冲突
  ERROR: 'error'           // 错误
};

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
  }

  // 检查是否在线
  isOnline() {
    return navigator.onLine;
  }

  // 检查是否有云端数据库
  hasCloudDB() {
    return !!import.meta.env.VITE_API_BASE_URL;
  }

  // 开始同步
  startSync(interval = 30000) { // 默认30秒
    // 清除之前的定时器
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // 设置新的定时器
    this.syncInterval = setInterval(() => {
      this.sync();
    }, interval);

    // 立即执行一次同步
    this.sync();

    console.log('同步管理器已启动，同步间隔：', interval / 1000, '秒');
  }

  // 停止同步
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('同步管理器已停止');
    }
  }

  // 执行同步
  async sync() {
    if (!this.isOnline() || !this.hasCloudDB() || this.isSyncing) {
      return;
    }

    try {
      this.isSyncing = true;
      console.log('开始同步数据...');

      // 1. 推送本地变更到云端
      await this.pushToCloud();

      // 2. 拉取云端变更到本地
      await this.pullFromCloud();

      console.log('同步完成');
    } catch (error) {
      console.error('同步失败:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // 推送本地变更到云端
  async pushToCloud() {
    try {
      // 获取所有待同步的数据
      const pendingProjects = await this.getPendingData('projects');
      const pendingAssets = await this.getPendingData('assets');
      const pendingSettings = await this.getPendingData('settings');

      const pendingData = [...pendingProjects, ...pendingAssets, ...pendingSettings];

      for (const item of pendingData) {
        try {
          // 这里应该调用云端API
          // 由于是演示，我们模拟成功
          console.log('推送数据到云端:', item);
          
          // 更新同步状态
          await this.updateSyncStatus(item.tableName, item.id, SyncStatus.SYNCED);
        } catch (error) {
          console.error('推送失败:', error);
          // 可以添加重试机制
        }
      }
    } catch (error) {
      console.error('推送数据失败:', error);
    }
  }

  // 拉取云端变更到本地
  async pullFromCloud() {
    try {
      // 这里应该调用云端API获取变更
      // 由于是演示，我们模拟没有变更
      console.log('拉取云端数据...');
    } catch (error) {
      console.error('拉取数据失败:', error);
    }
  }

  // 获取待同步的数据
  async getPendingData(tableName) {
    if (!localDB.db) {
      await localDB.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = localDB.db.transaction([tableName], 'readonly');
      const store = transaction.objectStore(tableName);
      const index = store.index ? store.index('_syncStatus') : null;

      if (index) {
        const request = index.getAll('pending');
        request.onsuccess = (event) => {
          resolve(event.target.result.map(item => ({
            ...item,
            tableName
          })));
        };
        request.onerror = (event) => {
          reject(new Error('获取待同步数据失败'));
        };
      } else {
        // 如果没有_syncStatus索引，获取所有数据
        const request = store.getAll();
        request.onsuccess = (event) => {
          resolve(event.target.result
            .filter(item => item._syncStatus === 'pending')
            .map(item => ({
              ...item,
              tableName
            }))
          );
        };
        request.onerror = (event) => {
          reject(new Error('获取待同步数据失败'));
        };
      }
    });
  }

  // 更新同步状态
  async updateSyncStatus(tableName, id, status) {
    if (!localDB.db) {
      await localDB.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = localDB.db.transaction([tableName], 'readwrite');
      const store = transaction.objectStore(tableName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        const item = event.target.result;
        if (item) {
          item._syncStatus = status;
          item._updatedAt = new Date().toISOString();
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve(item);
          updateRequest.onerror = () => reject(new Error('更新同步状态失败'));
        } else {
          reject(new Error('数据不存在'));
        }
      };

      request.onerror = (event) => {
        reject(new Error('获取数据失败'));
      };
    });
  }

  // 冲突解决策略
  resolveConflict(local, remote, strategy = 'LOCAL_WINS') {
    switch (strategy) {
      case 'LOCAL_WINS':
        return local; // 本地优先（默认）
      case 'REMOTE_WINS':
        return remote; // 云端优先
      case 'MERGE':
        return this.mergeData(local, remote); // 合并
      case 'ASK_USER':
        return this.askUserToResolve(local, remote); // 用户选择
      default:
        return local;
    }
  }

  // 合并数据
  mergeData(local, remote) {
    // 简单的合并策略：本地和远程的字段都保留，本地优先
    return {
      ...remote,
      ...local,
      _localVersion: Math.max(local._localVersion || 1, remote._localVersion || 1) + 1,
      _updatedAt: new Date().toISOString()
    };
  }

  // 询问用户解决冲突
  askUserToResolve(local, remote) {
    // 这里应该弹出对话框让用户选择
    // 由于是演示，我们默认选择本地版本
    console.log('冲突解决：选择本地版本');
    return local;
  }
}

// 导出同步管理器实例
export const syncManager = new SyncManager();
