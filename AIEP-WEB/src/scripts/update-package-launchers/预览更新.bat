@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

if /i not "%~1"=="__RUN__" (
  start "LTC 框架更新 - 预览" cmd /k "%~f0" __RUN__
  exit /b 0
)

cd /d "%~dp0"
title LTC 框架更新 - 预览
color 0B

echo.
echo ========================================
echo   LTC 框架更新 - 预览（不修改任何文件）
echo ========================================
echo.
echo 当前目录: %CD%
echo 日志将写入: %~dp0预览更新-日志.txt
echo.

where node >nul 2>&1
if errorlevel 1 (
  color 0C
  echo [错误] 未找到 Node.js。请先安装 Node 18+ 并确保已加入 PATH。
  echo 下载: https://nodejs.org/
  echo.
  goto END
)

if not exist "%~dp0update.js" (
  color 0C
  echo [错误] 未找到 update.js，请确认更新包已完整解压。
  echo.
  goto END
)

echo 正在预览，请稍候...
echo.

node "%~dp0update-run-with-log.mjs" --dry-run
set EXITCODE=!ERRORLEVEL!

echo.
if !EXITCODE! equ 0 (
  echo 预览完成。确认无误后，双击「安装更新.bat」执行正式安装。
) else (
  color 0C
  echo [失败] 预览未成功，退出码: !EXITCODE!
  echo 请打开日志: %~dp0预览更新-日志.txt
)

:END
echo.
echo ========================================
echo 按任意键关闭此窗口
echo ========================================
pause >nul
endlocal
exit /b 0
