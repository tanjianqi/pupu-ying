// @ts-check
/**
 * 扑扑鹰 PM2 进程配置
 * @module ecosystem.config.cjs
 * @职责 生产环境进程管理：standalone node 服务器 + 自动重启 + 日志切割 + 开机自启
 * @使用 npm run start        → pm2 start ecosystem.config.cjs
 *       npm run stop         → pm2 stop ecosystem
 *       npm run restart      → pm2 restart ecosystem
 *       npm run logs         → pm2 logs ecosystem
 *       pm2 save + pm2 startup → 开机自启
 * @环境变量 .env 文件由 dotenv 在 entry.mjs 内加载，PM2 不重复注入
 * @版本 v1.3.0
 */
module.exports = {
  apps: [
    {
      name: 'pupu-ying',
      script: './dist/server/entry.mjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '4321',
      },
      // 日志配置：按天切割，保留 7 份
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      log_file_size: '10M',
      max_restarts: 10,
      min_uptime: '30s',
      kill_timeout: 5000,
    },
  ],
};
