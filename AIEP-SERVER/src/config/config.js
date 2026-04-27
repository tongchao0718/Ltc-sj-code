// 配置文件

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },
  
  // 数据库配置
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/aiep',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;