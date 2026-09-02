#!/usr/bin/env node
/**
 * 扑扑鹰生产部署脚本
 * @module deploy/deploy.sh
 * @职责 一键部署：安装依赖 → 构建 → 启动/重启 PM2 进程
 * @使用 bash deploy/deploy.sh（Linux/macOS）或 git bash（Windows）
 * @依赖 pm2（全局安装：npm install -g pm2）
 * @版本 v1.3.0
 */
set -e

echo "=== 扑扑鹰生产部署开始 ==="
echo ""

# 1. 检查 .env 是否存在
if [ ! -f ".env" ]; then
  echo "❌ .env 文件不存在，请先复制 .env.example 为 .env 并填入 SMTP 凭证"
  echo "   cp .env.example .env"
  exit 1
fi

# 2. 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
  echo "❌ PM2 未安装，请先全局安装：npm install -g pm2"
  exit 1
fi

# 3. 安装依赖
echo "▶ 安装依赖..."
npm install

# 4. 构建
echo "▶ 构建项目..."
npm run build

# 5. 创建日志目录
mkdir -p logs

# 6. 启动或重启 PM2
if pm2 describe pupu-ying &> /dev/null; then
  echo "▶ PM2 进程已存在，重启..."
  pm2 restart ecosystem.config.cjs
else
  echo "▶ 首次启动 PM2 进程..."
  pm2 start ecosystem.config.cjs
fi

# 7. 保存进程列表（开机自启用）
pm2 save

echo ""
echo "=== 部署完成 ==="
echo "  访问地址: http://127.0.0.1:4321"
echo "  查看日志: npm run logs"
echo "  停止服务: npm run stop"
echo "  开机自启: pm2 startup（按提示执行返回的命令）"
echo ""
