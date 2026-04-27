// 本地数据库实现（IndexedDB）

let db = null;

// 数据库名称和版本
const DB_NAME = 'AICodingDB';
const DB_VERSION = 1;

// 数据库模式
const DB_SCHEMA = {
  projects: {
    keyPath: 'id',
    indexes: [
      { name: 'projectCode', keyPath: 'projectCode', unique: true },
      { name: 'ownerId', keyPath: 'ownerId' },
      { name: 'createTime', keyPath: 'createTime' }
    ]
  },
  assets: {
    keyPath: 'id',
    indexes: [
      { name: 'assetCode', keyPath: 'assetCode', unique: true },
      { name: 'assetType', keyPath: 'assetType' },
      { name: 'projectId', keyPath: 'projectId' }
    ]
  },
  settings: {
    keyPath: 'key',
    indexes: []
  },
  syncQueue: {
    keyPath: 'id',
    indexes: [
      { name: 'tableName', keyPath: 'tableName' },
      { name: 'timestamp', keyPath: 'timestamp' }
    ]
  },
  auditLogs: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId' },
      { name: 'operationType', keyPath: 'operationType' },
      { name: 'timestamp', keyPath: 'timestamp' }
    ]
  }
};

// 初始化IndexedDB
export function initIndexedDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB 不可用'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error('数据库打开失败'));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 创建存储对象
      for (const [storeName, storeConfig] of Object.entries(DB_SCHEMA)) {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, {
            keyPath: storeConfig.keyPath,
            autoIncrement: storeConfig.keyPath === 'id'
          });

          // 创建索引
          for (const index of storeConfig.indexes) {
            store.createIndex(index.name, index.keyPath, {
              unique: index.unique || false
            });
          }
        }
      }
    };
  });
}

// 获取数据库实例
export function getDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error('数据库打开失败'));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
  });
}

// 通用操作方法
class LocalDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await getDB();
  }

  // 添加数据
  async add(storeName, data) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({
        ...data,
        _syncStatus: 'synced',
        _localVersion: 1,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      });

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(new Error('添加数据失败'));
      };
    });
  }

  // 获取数据
  async get(storeName, id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(new Error('获取数据失败'));
      };
    });
  }

  // 获取所有数据
  async getAll(storeName) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(new Error('获取数据失败'));
      };
    });
  }

  // 更新数据
  async update(storeName, id, data) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = (event) => {
        const item = event.target.result;
        if (item) {
          const updatedItem = {
            ...item,
            ...data,
            _syncStatus: 'pending',
            _localVersion: (item._localVersion || 1) + 1,
            _updatedAt: new Date().toISOString()
          };
          const updateRequest = store.put(updatedItem);
          updateRequest.onsuccess = () => resolve(updatedItem);
          updateRequest.onerror = () => reject(new Error('更新数据失败'));
        } else {
          reject(new Error('数据不存在'));
        }
      };

      request.onerror = (event) => {
        reject(new Error('获取数据失败'));
      };
    });
  }

  // 删除数据
  async delete(storeName, id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = (event) => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject(new Error('删除数据失败'));
      };
    });
  }

  // 清空存储
  async clear(storeName) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = (event) => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject(new Error('清空数据失败'));
      };
    });
  }
}

// 导出数据库实例
export const localDB = new LocalDatabase();

// 导出便捷方法
export const projects = {
  add: (data) => localDB.add('projects', data),
  get: (id) => localDB.get('projects', id),
  getAll: () => localDB.getAll('projects'),
  update: (id, data) => localDB.update('projects', id, data),
  delete: (id) => localDB.delete('projects', id)
};

export const assets = {
  add: (data) => localDB.add('assets', data),
  get: (id) => localDB.get('assets', id),
  getAll: () => localDB.getAll('assets'),
  update: (id, data) => localDB.update('assets', id, data),
  delete: (id) => localDB.delete('assets', id)
};

export const settings = {
  add: (data) => localDB.add('settings', data),
  get: (key) => localDB.get('settings', key),
  getAll: () => localDB.getAll('settings'),
  update: (key, data) => localDB.update('settings', key, data),
  delete: (key) => localDB.delete('settings', key)
};
