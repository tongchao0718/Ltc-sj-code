@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

rem 双击时在独立窗口中运行，结束后窗口保持打开
if /i not "%~1"=="__RUN__" (
  start "LTC 框架更新 - 安装" cmd /k "%~f0" __RUN__
  exit /b 0
)

cd /d "%~dp0"
title LTC 框架更新 - 安装
color 0A

echo.
echo ========================================
echo   LTC 框架更新 - 确认安装
echo ========================================
echo.
echo 当前目录: %CD%
echo 日志将写入: %~dp0安装更新-日志.txt
echo.
echo 建议先双击「预览更新.bat」查看将变更的内容。
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

set /p CONFIRM=确认安装请输入 Y 然后回车（其他键取消）: 
if /i not "!CONFIRM!"=="Y" (
  echo.
  echo 已取消，未修改任何文件。
  goto END
)

echo.
echo 正在安装，请稍候（可能需要数分钟，请勿关闭本窗口）...
echo 下方为实时进度；同时写入日志文件。
echo.

node "%~dp0update-run-with-log.mjs" --yes
set EXITCODE=!ERRORLEVEL!

echo.
if !EXITCODE! equ 0 (
  color 0A
  echo [成功] 框架更新已完成。
) else (
  color 0C
  echo [失败] 更新未成功完成，退出码: !EXITCODE!
  echo 请打开日志: %~dp0安装更新-日志.txt
  echo 若已有 backups 目录，另可查看 backups\v*\update.log
)

:END
echo.
echo ========================================
echo 按任意键关闭此窗口
echo ========================================
pause >nul
endlocal
exit /b 0
