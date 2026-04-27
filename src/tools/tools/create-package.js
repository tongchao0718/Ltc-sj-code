import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;
const tempDir = path.join(projectRoot, 'temp-package');
const outputPath = path.join(projectRoot, 'project-code-package.zip');

console.log('=== 创建项目代码包 ===');

// 排除的文件和目录
const excludePatterns = [
  'dist',
  'node_modules',
  '.git',
  'temp-package',
  'project-code-package.zip',
  'create-package.js',
  'create-package-ps.js',
  'list-files.js',
  'test-simple.js'
];

// 清理临时目录和已存在的压缩包
if (fs.existsSync(tempDir)) {
  console.log('清理临时目录...');
  fs.rmSync(tempDir, { recursive: true, force: true });
}

if (fs.existsSync(outputPath)) {
  console.log('删除已存在的压缩包...');
  fs.unlinkSync(outputPath);
}

// 创建临时目录
console.log('创建临时目录...');
fs.mkdirSync(tempDir, { recursive: true });

// 复制文件到临时目录
function copyFiles(srcDir, destDir) {
  const files = fs.readdirSync(srcDir);
  
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    
    // 检查是否需要排除
    if (excludePatterns.includes(file)) {
      console.log(`跳过: ${file}`);
      continue;
    }
    
    const stats = fs.statSync(srcPath);
    if (stats.isDirectory()) {
      console.log(`复制目录: ${file}`);
      fs.mkdirSync(destPath, { recursive: true });
      copyFiles(srcPath, destPath);
    } else {
      console.log(`复制文件: ${file}`);
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('复制文件到临时目录...');
copyFiles(projectRoot, tempDir);

// 压缩临时目录
try {
  const command = `Compress-Archive -Path "${tempDir}\*" -DestinationPath "${outputPath}"`;
  console.log(`\n执行压缩命令...`);
  
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
} finally {
  // 清理临时目录
  if (fs.existsSync(tempDir)) {
    console.log('\n清理临时目录...');
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
