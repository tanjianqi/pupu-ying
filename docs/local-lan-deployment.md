# 扑扑鹰本地局域网部署指南（Windows）

> 版本：v1.7.0 | 更新：2026-09-02 | 适用：Windows 10/11 本机

本文档指导将扑扑鹰官网部署在 Windows 本机，并通过局域网（同一 WiFi/路由器下的其他设备）访问。适用于开发调试、内部演示、小型团队试用等场景，**不适用于公网生产环境**（生产部署见 [deployment.md](deployment.md)）。

---

## 目录

- [场景说明](#场景说明)
- [前置条件](#前置条件)
- [部署步骤](#部署步骤)
- [防火墙放行](#防火墙放行)
- [访问地址](#访问地址)
- [日常运维](#日常运维)
- [常见问题](#常见问题)

---

## 场景说明

| 场景 | 是否适用 |
|---|---|
| 本机开发调试 | ✅ 默认即用 |
| 局域网内其他设备访问（同事/家人/客户演示） | ✅ 本文档目标场景 |
| 公网访问（外网任意设备） | ❌ 需公网 IP + 端口映射或内网穿透 |
| 正式生产上线 | ❌ 用 [deployment.md](deployment.md)（Linux + Nginx + HTTPS） |

---

## 前置条件

- Windows 10/11
- Node.js 18+（本项目验证于 v24.11.1）
- npm 9+
- 已联网的 WiFi / 有线网络（需与其他设备处于同一局域网）

---

## 部署步骤

### 1. 安装依赖

```powershell
npm ci          # 或 npm install
```

### 2. 配置环境变量（可选）

```powershell
Copy-Item .env.example .env
notepad .env    # 按需填入 SMTP_USER / SMTP_PASS
```

> SMTP 凭证留空时，联系表单进入「校验通过未发信」降级模式，不影响站点访问。

### 3. 构建生产版本

```powershell
npm run build
```

构建产物：`dist/client/`（静态资源 + 页面）+ `dist/server/entry.mjs`（服务器入口）。

### 4. 启动 PM2 服务

```powershell
# 首次：安装 PM2（全局）
npm install -g pm2

# 启动
npm run start
# 或
pm2 start ecosystem.config.cjs
```

> `ecosystem.config.cjs` 中 `HOST` 已设为 `0.0.0.0`，允许局域网访问（v1.7.0 起）。

### 5. 查看本机内网 IP

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.254|^172\.22' } |
  Select-Object IPAddress, InterfaceAlias
```

输出中的 `WLAN`（WiFi）或 `以太网` 对应的 IP 即为局域网地址，例如 `192.168.111.73`。

---

## 防火墙放行

Windows 默认会拦截入站连接，需放行 4321 端口。提供两种方式：

### 方式一：双击脚本（推荐）

双击运行 `deploy/open-firewall.cmd`，弹出 UAC 窗口点「是」，脚本自动添加规则。

### 方式二：管理员 PowerShell 手动执行

1. Win 键 → 搜索 `PowerShell` → 右键 → **以管理员身份运行**
2. 执行：

```powershell
New-NetFirewallRule -DisplayName "pupu-ying-4321" -Direction Inbound -LocalPort 4321 -Protocol TCP -Action Allow -Profile Private
```

### 验证规则

```powershell
netsh advfirewall firewall show rule name="pupu-ying-4321"
```

看到 `Enabled: Yes` + `Action: Allow` 即成功。

---

## 访问地址

放行防火墙后，用其他设备（同一 WiFi）浏览器访问：

| 页面 | 地址 |
|---|---|
| 首页 | `http://<内网IP>:4321` |
| 联系页 | `http://<内网IP>:4321/contact` |
| 排名查询 | `http://<内网IP>:4321/rank` |
| 案例库 | `http://<内网IP>:4321/cases` |
| API-排名 | `http://<内网IP>:4321/api/rank?keyword=GEO优化` |

> 将 `<内网IP>` 替换为第 5 步查到的实际地址（如 `192.168.111.73`）。

---

## 日常运维

| 操作 | 命令 |
|---|---|
| 查看进程状态 | `npm run status` 或 `pm2 status` |
| 查看实时日志 | `npm run logs` 或 `pm2 logs pupu-ying` |
| 重启服务 | `npm run restart` |
| 停止服务 | `npm run stop` |
| 启动服务 | `npm run start` |
| 重新构建+重启 | `npm run build ; npm run restart` |

---

## 常见问题

### 1. 其他设备访问超时/无法连接

- 检查本机与设备是否同一局域网（同一 WiFi）
- 确认防火墙规则已添加（`netsh advfirewall firewall show rule name="pupu-ying-4321"`）
- 确认服务监听 `0.0.0.0`（`netstat -ano | findstr 4321`）
- 若网络类型为「公用」而非「专用」，需把防火墙规则 Profile 改为 Public 或在网络设置里切换为专用网络

### 2. 换 WiFi 后地址变化

路由器 DHCP 分配的 IP 会变。重新查 IP：

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^169\.254|^172\.22' -and $_.InterfaceAlias -notmatch 'Loopback' }
```

**根治方案**：在路由器后台为本机 MAC 绑定静态 IP，保证地址不变。

### 3. PowerShell 访问返回 502

本机系统代理干扰。用 `curl.exe --noproxy "*"` 绕过代理测试，或临时关闭系统代理。

### 4. 电脑重启后服务消失

PM2 默认不随开机自启。配置开机自启：

```powershell
pm2 save
pm2 startup
# 按提示复制执行返回的命令
```

---

## 相关文件

| 文件 | 说明 |
|---|---|
| [ecosystem.config.cjs](../ecosystem.config.cjs) | PM2 进程配置（HOST=0.0.0.0） |
| [deploy/open-firewall.cmd](../deploy/open-firewall.cmd) | 防火墙放行脚本（双击提权版） |
| [deploy/open-firewall.ps1](../deploy/open-firewall.ps1) | 防火墙放行脚本（PowerShell 版） |
| [.env.example](../.env.example) | 环境变量模板 |
| [deployment.md](deployment.md) | Linux 生产部署指南 |
