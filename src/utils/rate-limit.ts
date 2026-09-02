/**
 * 速率限制器（内存滑动窗口）
 * @module utils/rate-limit
 * @职责 基于客户端 IP 的请求频率限制，防止 API 被滥用/垃圾提交
 * @原理 每个IP维护一个请求时间戳数组，滑出窗口外的旧记录，剩余数量超限则拒绝
 * @限制 单进程内存（PM2 fork 模式 1 实例时有效）；多实例需换 Redis 后端
 * @版本 v1.4.0
 */

interface RateBucket {
  timestamps: number[]; // 请求时间戳数组（ms）
}

// IP → bucket 映射
const buckets = new Map<string, RateBucket>();

// 定期清理过期 bucket（避免内存无限增长）
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 分钟清理一次
let lastCleanup = Date.now();

function cleanupExpired(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [ip, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length === 0) {
      buckets.delete(ip);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number; // 剩余可用次数
  resetAt: number;   // 最早请求过期时间（ms 时间戳）
  retryAfter: number; // 拒绝时建议等待秒数（0 表示未拒绝）
}

/**
 * 检查 IP 是否超出速率限制
 * @param ip 客户端 IP
 * @param windowMs 窗口大小（ms），默认 60s
 * @param maxRequests 窗口内最大请求数，默认 3
 * @returns RateLimitResult
 */
export function rateLimit(
  ip: string,
  windowMs: number = 60 * 1000,
  maxRequests: number = 3
): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now, windowMs);

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(ip, bucket);
  }

  // 滑出窗口外的旧记录
  const cutoff = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  const remaining = maxRequests - bucket.timestamps.length;
  if (remaining <= 0) {
    // 拒绝：计算最早请求何时过期
    const oldest = bucket.timestamps[0] || now;
    const resetAt = oldest + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - now) / 1000),
    };
  }

  // 放行：记录本次请求
  bucket.timestamps.push(now);
  const oldest = bucket.timestamps[0];
  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt: oldest + windowMs,
    retryAfter: 0,
  };
}

/**
 * 从请求头提取客户端 IP
 * @param headers Request headers
 * @returns IP 字符串，识别失败返回 'unknown'
 */
export function getClientIP(headers: Headers): string {
  // Nginx 反代场景：X-Forwarded-For 第一个 IP
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  // Cloudflare 等代理
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) return cfIP.trim();
  // 直连场景（开发）
  const realIP = headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  return 'unknown';
}
