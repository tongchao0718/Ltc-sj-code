import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;
const outputPath = path.join(projectRoot, 'project-code-package.zip');

console.log('=== 创建项目代码包 ===');

// 检查并删除已存在的文件
if (fs.existsSync(outputPath)) {
  console.log('删除已存在的压缩包...');
  fs.unlinkSync(outputPath);
}

try {
  // 执行PowerShell命令
  const command = `Compress-Archive -Path * -DestinationPath "${outputPath}" -Exclude dist, node_modules, .git, .gitignore, *.log, project-code-package.zip, create-package-ps.js`;
  console.log(`执行命令: ${command}`);
  
  execSync(command, {
    cwd: projectRoot,
    shell: 'powershell.exe',
    stdio: 'inherit'
  });
  
  console.log('\n✅ 压缩完成！');
  console.log(`文件位置: ${outputPath}`);
  
  // 验证文件是否存在
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log('❌ 压缩文件未找到！');
  }
  
} catch (error) {
  console.error('❌ 压缩失败:', error.message);
  process.exit(1);
}
