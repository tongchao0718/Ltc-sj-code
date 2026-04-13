import axios from 'axios';

// Mock数据
const mockData = {
  '/api/user/info': {
    get: {
      success: true,
      data: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        avatar: 'https://via.placeholder.com/100'
      }
    }
  },
  '/api/dashboard/data': {
    get: {
      success: true,
      data: {
        totalContent: 1234,
        activeContent: 890,
        dailyComments: 156,
        growthRate: 12.5
      }
    }
  }
};

const apiService = {
  // 检测网络状态
  isOnline() {
    return navigator.onLine;
  },
  
  // 统一请求方法
  async request(config) {
    if (!this.isOnline()) {
      // 离线模式下返回Mock数据
      return this.getMockData(config.url, config.method || 'get');
    }
    
    try {
      const response = await axios({
        ...config,
        baseURL: '/api',
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      // 网络错误时返回Mock数据作为 fallback
      console.warn('Network error, using mock data:', error);
      return this.getMockData(config.url, config.method || 'get');
    }
  },
  
  // 获取Mock数据
  getMockData(url, method) {
    // 移除baseURL部分
    const relativeUrl = url.replace(/^\/api/, '');
    return mockData[relativeUrl]?.[method.toLowerCase()] || {
      success: false,
      message: 'No mock data available'
    };
  },
  
  // 快捷方法
  get(url, params) {
    return this.request({ method: 'get', url, params });
  },
  
  post(url, data) {
    return this.request({ method: 'post', url, data });
  },
  
  put(url, data) {
    return this.request({ method: 'put', url, data });
  },
  
  delete(url) {
    return this.request({ method: 'delete', url });
  }
};

export default apiService;