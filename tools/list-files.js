import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('=== 当前目录内容 ===');

try {
  const files = fs.readdirSync(__dirname);
  console.log('文件和目录:');
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    const stats = fs.statSync(filePath);
    const type = stats.isDirectory() ? '目录' : '文件';
    console.log(`${type}: ${file}`);
  });
  console.log('\n✅ 列出完成！');
} catch (error) {
  console.error('❌ 列出失败:', error.message);
}
