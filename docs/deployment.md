# 扑扑鹰生产部署指南

> 版本：v1.3.0 | 更新：2026-09-02 | 适用：Linux 服务器（Ubuntu/Debian/CentOS）

本文档指导将扑扑鹰官网部署到生产环境，使用 PM2 进程管理 + Nginx 反向代理 + Let's Encrypt SSL。

---

## 目录

- [部署架构](#部署架构)
- [前置准备](#前置准备)
- [一键部署](#一键部署)
- [手动部署步骤](#手动部署步骤)
- [Nginx 反向代理配置](#nginx-反向代理配置)
- [SSL 证书配置](#ssl-证书配置)
- [开机自启](#开机自启)
- [日常运维命令](#日常运维命令)
- [故障排查](#故障排查)
- [回滚方案](#回滚方案)

---

## 部署架构

```
用户 → Nginx (443/HTTPS) → PM2 管理的 Node.js 进程 (127.0.0.1:4321)
                            ├─ 静态资源（dist/client/）
                            └─ API 端点（/api/rank + /api/contact）
                                  └─ 腾讯企业邮 SMTP
```

- **Nginx**：处理 HTTPS 终止、反向代理、静态资源缓存
- **PM2**：Node.js 进程管理，自动重启、日志切割、开机自启
- **Node.js standalone**：Astro 构建产物，服务端渲染 API + 托管静态资源

---

## 前置准备

### 服务器要求

- Linux 服务器（Ubuntu 20.04+ / Debian 11+ / CentOS 8+）
- Node.js 18+（推荐 20 LTS）
- npm 9+
- Nginx 1.18+
- 1GB+ 内存（构建时需要，运行时 256MB 足够）
- 10GB+ 磁盘空间

### 安装 Node.js 20 LTS

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 验证
node -v  # 应输出 v20.x.x
npm -v   # 应输出 10.x.x
```

### 安装 PM2（全局）

```bash
sudo npm install -g pm2
pm2 -v  # 应输出 5.x.x
```

### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS
sudo yum install -y nginx
```

---

## 一键部署

```bash
# 1. 克隆代码到服务器
git clone <仓库地址> /var/www/pupu-ying
cd /var/www/pupu-ying

# 2. 配置环境变量
cp .env.example .env
nano .env   # 填入 SMTP_USER 和 SMTP_PASS

# 3. 一键部署
npm run deploy
```

`npm run deploy` 会自动完成：安装依赖 → 构建 → 启动 PM2 进程。

---

## 手动部署步骤

### 1. 上传代码

```bash
# 方式一：git clone
git clone <仓库地址> /var/www/pupu-ying
cd /var/www/pupu-ying

# 方式二：本地构建后上传 dist/
# 本地：npm run build
# 上传 dist/ 和 package.json、ecosystem.config.cjs、.env 到服务器
```

### 2. 安装依赖

```bash
npm install --omit=dev   # 生产环境只装运行依赖
```

> 如果服务器有 Node.js 20+ 且需要本地构建，则用 `npm install`（含 devDependencies）。

### 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

填入腾讯企业邮凭证：

```
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=system@ppypaper.com
SMTP_PASS=你的客户端专用密码
SMTP_FROM_NAME=扑扑鹰官网咨询
MAIL_TO=geo@ppypaper.com
```

### 4. 构建

```bash
npm run build
```

构建产物：
- `dist/client/`：静态资源 + 23 个预渲染 HTML 页面 + sitemap
- `dist/server/entry.mjs`：Node.js standalone 服务器入口

### 5. 启动 PM2 进程

```bash
# 创建日志目录
mkdir -p logs

# 启动
npm run start
# 或
pm2 start ecosystem.config.cjs

# 查看状态
pm2 status
npm run status

# 查看日志
npm run logs
```

启动后服务监听 `127.0.0.1:4321`（仅本机访问，需 Nginx 反代对外）。

---

## Nginx 反向代理配置

### 1. 复制配置文件

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/pupu-ying.conf
sudo ln -s /etc/nginx/sites-available/pupu-ying.conf /etc/nginx/sites-enabled/
```

### 2. 修改配置（按实际域名和证书路径）

```bash
sudo nano /etc/nginx/sites-available/pupu-ying.conf
```

需要修改的字段：
- `server_name`：你的实际域名
- `ssl_certificate` / `ssl_certificate_key`：SSL 证书路径

### 3. 测试并重载

```bash
sudo nginx -t          # 测试配置语法
sudo systemctl reload nginx   # 重载
```

### 4. 防火墙放行

```bash
# Ubuntu (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## SSL 证书配置

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx   # Ubuntu/Debian

# 申请证书（自动修改 Nginx 配置）
sudo certbot --nginx -d www.ppypaper.com -d ppypaper.com

# 测试自动续期
sudo certbot renew --dry-run
```

证书到期前 30 天自动续期（certbot 会自动配置 cron）。

---

## 开机自启

```bash
# PM2 开机自启
pm2 startup
# 按提示执行返回的命令，例如：
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# 保存当前进程列表
pm2 save

# Nginx 开机自启
sudo systemctl enable nginx
```

---

## 日常运维命令

| 操作 | 命令 |
|---|---|
| 查看进程状态 | `npm run status` 或 `pm2 status` |
| 查看实时日志 | `npm run logs` 或 `pm2 logs pupu-ying` |
| 查看最近 100 行日志 | `pm2 logs pupu-ying --lines 100` |
| 重启服务 | `npm run restart` |
| 停止服务 | `npm run stop` |
| 启动服务 | `npm run start` |
| 重新部署（构建+重启） | `npm run deploy` |
| 查看 Nginx 状态 | `sudo systemctl status nginx` |
| 重载 Nginx 配置 | `sudo systemctl reload nginx` |
| 查看端口占用 | `ss -tlnp \| grep 4321` |

---

## 故障排查

### 1. PM2 进程启动失败

```bash
# 查看错误日志
pm2 logs pupu-ying --err --lines 50

# 常见原因：
# - .env 文件缺失或凭证为空 → /api/contact 降级模式但能启动
# - 端口 4321 被占用 → 修改 ecosystem.config.cjs 的 PORT
# - dist/server/entry.mjs 不存在 → 先 npm run build
```

### 2. 邮件发送失败（500 错误）

```bash
# 查看服务器日志中的 SMTP 错误
pm2 logs pupu-ying | grep "邮件发送失败"

# 常见 SMTP 错误：
# - 535 Error: authentication failed → SMTP_PASS 错误或未生成客户端专用密码
# - Connection timeout → 检查服务器到 smtp.exmail.qq.com:465 的网络
# - Invalid login → SMTP_USER 邮箱地址错误
```

### 3. Nginx 502 Bad Gateway

```bash
# 检查 Node.js 进程是否运行
pm2 status

# 检查端口是否监听
ss -tlnp | grep 4321

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 4. 构建失败

```bash
# 清理缓存
rm -rf dist node_modules/.astro
npm install
npm run build
```

### 5. 内存不足导致构建失败

```bash
# 查看内存
free -h

# 内存不足时，本地构建后上传 dist/ 到服务器
# 本地：npm run build
# 上传：dist/ + package.json + ecosystem.config.cjs + .env
```

---

## 回滚方案

### 1. 回滚到上一个版本

```bash
# 查看提交历史
git log --oneline -10

# 回滚到指定版本（保留代码改动）
git reset --hard <commit-hash>

# 重新构建并重启
npm run build
npm run restart
```

### 2. 回滚到上一个 tag

```bash
# 查看所有 tag
git tag -l

# 切换到上一个版本
git checkout v1.2.1
npm install
npm run build
npm run restart
```

### 3. 紧急停服

```bash
npm run stop
# Nginx 保持运行，会返回 502，避免错误页面暴露
```

---

## 相关文件

| 文件 | 说明 |
|---|---|
| [ecosystem.config.cjs](../ecosystem.config.cjs) | PM2 进程配置 |
| [deploy/deploy.sh](deploy/deploy.sh) | 一键部署脚本 |
| [deploy/nginx.conf](deploy/nginx.conf) | Nginx 反代配置示例 |
| [.env.example](../.env.example) | 环境变量模板 |
| [docs/api.md](api.md) | API 端点文档 |
