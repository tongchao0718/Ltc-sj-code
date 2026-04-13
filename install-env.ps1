# 检测并辅助安装 Node.js / Git（Windows）
# 请以管理员身份运行安装步骤（若需静默安装）

Write-Host "检测 Node.js 安装状态..."
try {
    $nodeVersion = node -v 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js 已安装: $nodeVersion"
    }
} catch {
    Write-Host "Node.js 未检测到，请从 https://nodejs.org/ 下载 LTS 安装包安装。"
}

Write-Host "检测 Git 安装状态..."
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "Git 已安装: $gitVersion"
    }
} catch {
    Write-Host "Git 未检测到，请从 https://git-scm.com/download/win 安装。"
}

Write-Host "验证 npm..."
try {
    npm -v
} catch {
    Write-Host "npm 不可用"
}

Write-Host "环境检测完成。"
