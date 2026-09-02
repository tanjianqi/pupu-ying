@echo off
chcp 65001 >nul
echo ============================================
echo   扑扑鹰 - 防火墙放行 4321 端口
echo ============================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] 需要管理员权限，正在提权...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [1/3] 添加防火墙规则...
powershell -ExecutionPolicy Bypass -Command "New-NetFirewallRule -DisplayName 'pupu-ying-4321' -Direction Inbound -LocalPort 4321 -Protocol TCP -Action Allow -Profile Private -Description 'pupu-ying LAN access' -ErrorAction SilentlyContinue | Out-Null; if (Get-NetFirewallRule -DisplayName 'pupu-ying-4321' -ErrorAction SilentlyContinue) { Write-Host '[OK] 规则添加成功' -ForegroundColor Green } else { Write-Host '[X] 规则添加失败' -ForegroundColor Red }"

echo.
echo [2/3] 验证规则...
netsh advfirewall firewall show rule name="pupu-ying-4321" | findstr /C:"规则名称" /C:"Local Port" /C:"操作" /C:"已启用"

echo.
echo [3/3] 局域网访问地址:
powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.254|^172\.22' } | ForEach-Object { Write-Host ('  http://' + $_.IPAddress + ':4321') -ForegroundColor Cyan }"

echo.
echo ============================================
echo   完成！请用其他设备访问上述地址验证
echo ============================================
pause
