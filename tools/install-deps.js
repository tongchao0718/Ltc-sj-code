#!/usr/bin/env node

/**
 * 自动安装缺失的依赖脚本
 * 该脚本会检测并安装项目所需的所有依赖
 */

import { execSync } from 'child_process';
import fs from 'fs';

// 依赖列表
const dependencies = [
  'vue@^3.5.13',
  'vue-router@^4.4.5',
  '@arco-design/web-vue@^2.57.0',
  'axios@^1.14.0',
  'echarts@^5.6.0',
  'less@^4.6.4',
  'vue-i18n@^9.14.5'
];

const devDependencies = [
  'vite@^6.0.3',
  '@vitejs/plugin-vue@^5.2.1',
  'terser@^5.46.1'
];

// 检测依赖是否已安装
function checkDependency(dep) {
  try {
    execSync(`npm list ${dep} --depth=0`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 安装依赖
function installDependency(dep, isDev = false) {
  const flag = isDev ? '--save-dev' : '';
  console.log(`正在安装 ${dep}...`);
  try {
    execSync(`npm install ${flag} ${dep}`, { stdio: 'inherit' });
    console.log(`${dep} 安装成功！`);
  } catch (error) {
    console.error(`${dep} 安装失败: ${error.message}`);
    process.exit(1);
  }
}

// 主函数
function main() {
  console.log('开始检测并安装缺失的依赖...\n');

  // 检测并安装核心依赖
  console.log('=== 检测核心依赖 ===');
  const missingDeps = dependencies.filter(dep => !checkDependency(dep));
  if (missingDeps.length > 0) {
    console.log(`缺失的核心依赖: ${missingDeps.join(', ')}`);
    missingDeps.forEach(dep => installDependency(dep));
  } else {
    console.log('所有核心依赖已安装');
  }

  // 检测并安装开发依赖
  console.log('\n=== 检测开发依赖 ===');
  const missingDevDeps = devDependencies.filter(dep => !checkDependency(dep));
  if (missingDevDeps.length > 0) {
    console.log(`缺失的开发依赖: ${missingDevDeps.join(', ')}`);
    missingDevDeps.forEach(dep => installDependency(dep, true));
  } else {
    console.log('所有开发依赖已安装');
  }

  console.log('\n=== 依赖安装完成 ===');
  console.log('你现在可以运行以下命令启动项目:');
  console.log('  npm run dev     # 启动开发服务器');
  console.log('  npm run build   # 构建项目');
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} else {
  // 直接执行main函数，确保脚本能够正常运行
  main();
}

export { main };
