import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('开始测试备份操作...');

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(__filename);
console.log(`项目根目录: ${projectRoot}`);

const currentVersion = '1.2.1';
const backupDir = path.join(projectRoot, 'versions', `v${currentVersion}`);
console.log(`备份目录: ${backupDir}`);

try {
  // 创建备份目录
  if (!fs.existsSync(backupDir)) {
    console.log('创建备份目录...');
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('备份目录创建成功');
  } else {
    console.log('备份目录已存在');
  }
  
  // 测试写入文件
  const testFile = path.join(backupDir, 'test.txt');
  console.log(`测试文件路径: ${testFile}`);
  fs.writeFileSync(testFile, '测试备份文件');
  console.log('测试文件写入成功');
  
  // 验证文件是否存在
  if (fs.existsSync(testFile)) {
    console.log('测试文件存在');
  } else {
    console.log('测试文件不存在');
  }
  
  console.log('测试完成！');
} catch (error) {
  console.error('错误:', error);
}