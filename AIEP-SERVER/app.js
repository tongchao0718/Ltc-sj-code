import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'AIEP Server is running' });
});

// 导入路由
import userRoutes from './src/main/routes/userRoutes.js';
import sampleRoutes from './src/apps/sample-app/routes/sampleRoutes.js';

// 使用路由
app.use('/api/users', userRoutes);
app.use('/api/sample', sampleRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AIEP Server is running on port ${PORT}`);
});

export default app;