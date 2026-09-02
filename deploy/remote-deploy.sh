#!/usr/bin/env bash
# 扑扑鹰服务器端部署脚本
# @module deploy/remote-deploy.sh
# @职责 服务器端：安装依赖 → 重启 PM2 → 验证
# @使用 由 GitHub Actions deploy.yml 通过 SSH 调用
# @前置 CI 已通过 npm run build，dist/ 已通过 scp 同步到服务器
# @版本 v1.6.0
set -e

# 切换到部署目录（由调用方 cd 进入）
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/pupu-ying}"
cd "$DEPLOY_DIR" || { echo "❌ 部署目录不存在：$DEPLOY_DIR"; exit 1; }

echo "=== 扑扑鹰服务器端部署 ==="
echo "部署目录：$DEPLOY_DIR"
echo ""

# 1. 检查 .env 是否存在
if [ ! -f ".env" ]; then
  echo "❌ .env 文件不存在，请先配置环境变量"
  exit 1
fi

# 2. 检查 PM2
if ! command -v pm2 &> /dev/null; then
  echo "❌ PM2 未安装"
  exit 1
fi

# 3. 安装生产依赖（仅运行时依赖，构建在 CI 完成）
echo "▶ 安装生产依赖..."
npm install --omit=dev

# 4. 创建日志目录
mkdir -p logs

# 5. 重启 PM2 进程
if pm2 describe pupu-ying &> /dev/null; then
  echo "▶ PM2 进程已存在，重启..."
  pm2 restart ecosystem.config.cjs
else
  echo "▶ 首次启动 PM2 进程..."
  pm2 start ecosystem.config.cjs
fi

# 6. 保存进程列表
pm2 save

# 7. 等待启动并验证
echo "▶ 等待服务启动..."
sleep 3

# 本地健康检查（127.0.0.1）
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4321/api/rank?keyword=ping || echo "000")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "400" ]; then
  echo "✅ 本地健康检查通过（HTTP $STATUS）"
else
  echo "⚠️ 本地健康检查返回 $STATUS，查看日志：pm2 logs pupu-ying"
  # 不直接 exit 1，让 GitHub Actions 的远程健康检查做最终判断
fi

echo ""
echo "=== 部署完成 ==="
echo "  本地地址: http://127.0.0.1:4321"
echo "  查看日志: pm2 logs pupu-ying"
echo ""
