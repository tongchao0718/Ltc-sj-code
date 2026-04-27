// 数据库初始化和配置

// 检测存储模式
export function detectStorageMode() {
  // 优先使用环境变量配置
  if (import.meta.env.VITE_STORAGE_MODE) {
    return import.meta.env.VITE_STORAGE_MODE;
  }

  // 检测是否配置了云端API地址
  if (import.meta.env.VITE_API_BASE_URL) {
    return 'cloud-sync';
  }

  // 默认纯离线模式
  return 'local-only';
}

// 初始化数据库
export async function initDatabase() {
  try {
    // 动态导入数据库模块，避免在非浏览器环境中执行
    if (typeof window !== 'undefined' && window.indexedDB) {
      const { initIndexedDB } = await import('./local');
      await initIndexedDB();
      console.log('本地数据库初始化成功');
    } else {
      console.log('IndexedDB 不可用，使用内存存储');
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

// 导出数据库实例
export let db = null;

export async function getDatabase() {
  if (!db) {
    if (typeof window !== 'undefined' && window.indexedDB) {
      const { getDB } = await import('./local');
      db = await getDB();
    }
  }
  return db;
}
