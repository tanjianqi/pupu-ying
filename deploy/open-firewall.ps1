# 扑扑鹰 局域网访问防火墙放行脚本
# @职责 在 Windows 防火墙开放 4321 端口（Private 配置文件），允许局域网设备访问
# @使用 以管理员身份运行 PowerShell，然后执行：
#   PowerShell -ExecutionPolicy Bypass -File e:\geo\扑扑鹰\deploy\open-firewall.ps1
# @验证 运行后用其他设备访问 http://10.76.118.106:4321 测试

#Requires -RunAsAdministrator

$ruleName = "pupu-ying-4321"
$port = 4321

# 检查是否已存在规则
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Output "[!] 规则已存在，移除旧规则..."
    Remove-NetFirewallRule -DisplayName $ruleName
}

# 创建新规则：入站 / TCP / 4321 / 允许 / Private 配置
New-NetFirewallRule `
    -DisplayName $ruleName `
    -Description "扑扑鹰本地部署 - 局域网访问 4321 端口" `
    -Direction Inbound `
    -LocalPort $port `
    -Protocol TCP `
    -Action Allow `
    -Profile Private | Out-Null

Write-Output "[OK] 防火墙规则已添加：$ruleName"
Write-Output "[OK] 端口：$port (TCP, Private 配置文件)"
Write-Output ""
Write-Output "局域网访问地址："
Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.254|^172\.22' } |
    ForEach-Object { Write-Output "  http://$($_.IPAddress):$port" }
Write-Output ""
Write-Output "验证命令（在其他设备执行）："
Write-Output "  curl http://10.76.118.106:4321/api/rank?keyword=ping"
