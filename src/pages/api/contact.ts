/**
 * 扑扑鹰 联系表单提交 API 端点
 * @module api/contact
 * @职责 接收联系表单数据（name/email/brand/phone/message），校验后通过腾讯企业邮 SMTP 发送邮件
 * @状态 v1.4.0 - 增加反垃圾三项：蜜罐字段 + IP 速率限制 + reCAPTCHA 可选
 * @方法 POST /api/contact  (Content-Type: application/json)
 * @环境变量 SMTP_HOST/SMTP_PORT/SMTP_SECURE/SMTP_USER/SMTP_PASS/SMTP_FROM_NAME/MAIL_TO（见 .env.example）
 *           RECAPTCHA_SECRET（可选，配置后启用 reCAPTCHA 校验）
 *           CONTACT_RATE_LIMIT_MAX（可选，默认 3 次/分钟）
 */
import 'dotenv/config'; // 加载 .env（仅本地开发/preview 需要；生产环境用系统环境变量）
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIP } from '../../utils/rate-limit';

export const prerender = false;

// ===== 速率限制配置 =====
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 秒窗口
const RATE_LIMIT_MAX = parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '3', 10); // 默认 3 次/分钟

// ===== reCAPTCHA 配置（可选）=====
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET?.trim();
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// 复用 transporter（避免每次请求重新创建连接池）
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST?.trim();
  const portStr = process.env.SMTP_PORT?.trim();
  const secureStr = process.env.SMTP_SECURE?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  // 凭证不完整时返回 null（降级为「仅校验不发信」模式）
  if (!host || !portStr || !user || !pass) {
    return null;
  }

  const port = parseInt(portStr, 10);
  const secure = secureStr !== 'false'; // 默认 true；显式 'false' 才禁用 SSL

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return transporter;
}

/**
 * 验证 reCAPTCHA token（如果配置了 secret）
 * @returns true 表示通过或未启用 reCAPTCHA；false 表示验证失败
 */
async function verifyRecaptcha(token: string | undefined, remoteIP: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET) return true; // 未配置 secret，跳过校验
  if (!token) return false;

  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: token,
      remoteip: remoteIP,
    });
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (e) {
    console.error('[/api/contact] reCAPTCHA 验证异常：', e);
    return false; // 验证服务异常时拒绝请求（fail-closed）
  }
}

export const POST: APIRoute = async ({ request }) => {
  // ===== 1. IP 速率限制（最外层，先于 body 解析）=====
  const clientIP = getClientIP(request.headers);
  const rl = rateLimit(clientIP, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: `提交过于频繁，请 ${rl.retryAfter} 秒后再试。`,
        retryAfter: rl.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Retry-After': String(rl.retryAfter),
        },
      }
    );
  }

  // ===== 2. 解析请求体 =====
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, '请求体不是合法 JSON');
  }

  // ===== 3. 蜜罐字段检测（防止机器人自动提交）=====
  // 前端表单含一个对用户隐藏的 website 字段，正常用户不会填写
  // 机器人扫描表单会填所有字段，一旦该字段非空则判定为机器人
  const honeypot = (body as any).website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    // 静默拒绝：返回成功响应但不发信，避免泄露检测机制
    console.warn(`[/api/contact] 蜜罐字段被填写，IP=${clientIP}，疑似机器人提交`);
    return new Response(
      JSON.stringify({
        ok: true,
        sent: false,
        message: '提交成功！扑扑鹰团队将在 24 小时内联系您，请保持电话畅通。',
        received: { blocked: true },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  // ===== 4. reCAPTCHA 校验（如果前端传了 token）=====
  const recaptchaToken = (body as any).recaptchaToken;
  const recaptchaOK = await verifyRecaptcha(recaptchaToken, clientIP);
  if (!recaptchaOK) {
    return jsonError(400, '人机验证失败，请刷新页面后重试');
  }

  // ===== 5. 提取并校验字段 =====
  const { name, email, brand, phone, message } = body || {};
  const missing: string[] = [];
  if (!str(name)) missing.push('name');
  if (!str(brand)) missing.push('brand');
  if (!str(phone)) missing.push('phone');
  if (!str(email)) missing.push('email');
  if (missing.length) {
    return jsonError(400, '缺少必填字段：' + missing.join(', '));
  }

  // 邮箱格式校验
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailReg.test(email.trim())) {
    return jsonError(400, '邮箱格式不正确');
  }

  // ===== 6. 发送邮件 =====
  const mail = getTransporter();
  if (!mail) {
    // 凭证未配置：降级为「校验通过但未发信」，便于本地开发/构建测试
    return new Response(
      JSON.stringify({
        ok: true,
        sent: false,
        message: '提交成功（开发模式：已校验通过，未实际发送邮件）。',
        received: { name, email, brand, phone, hasMessage: Boolean(str(message)) },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const to = process.env.MAIL_TO?.trim() || 'geo@ppypaper.com';
  const fromName = process.env.SMTP_FROM_NAME?.trim() || '扑扑鹰官网咨询';
  const fromUser = process.env.SMTP_USER!.trim();

  const subject = `[官网咨询] ${brand} - ${name}`;
  const textBody = [
    '扑扑鹰官网收到一条新咨询：',
    '',
    `姓名：${name}`,
    `品牌：${brand}`,
    `邮箱：${email}`,
    `电话：${phone}`,
    `留言：${str(message) || '（未填写）'}`,
    '',
    `提交时间：${new Date().toISOString()}`,
    `来源IP：${clientIP}`,
    `来源页：${request.headers.get('referer') || '(未知来源)'}`,
  ].join('\n');

  const htmlBody = [
    '<h3>扑扑鹰官网收到一条新咨询</h3>',
    '<table border="0" cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;">',
    row('姓名', name),
    row('品牌', brand),
    row('邮箱', `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`),
    row('电话', `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`),
    row('留言', message ? escapeHtml(message).replace(/\n/g, '<br>') : '（未填写）'),
    '</table>',
    '<hr>',
    `<p style="color:#888;font-size:12px;">提交时间：${new Date().toISOString()}<br>来源IP：${escapeHtml(clientIP)}<br>来源页：${escapeHtml(request.headers.get('referer') || '(未知来源)')}</p>`,
  ].join('');

  try {
    const info = await mail.sendMail({
      from: `"${fromName}" <${fromUser}>`,
      to,
      replyTo: email.trim(),
      subject,
      text: textBody,
      html: htmlBody,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        sent: true,
        messageId: info.messageId,
        message: '提交成功！扑扑鹰团队将在 24 小时内联系您，请保持电话畅通。',
        received: { name, email, brand, phone, hasMessage: Boolean(str(message)) },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } catch (e: any) {
    // SMTP 发送失败：返回 500，但不暴露内部错误细节给前端
    console.error('[/api/contact] 邮件发送失败：', e?.message || e);
    return new Response(
      JSON.stringify({
        ok: false,
        message: '提交失败：邮件发送异常，请稍后重试或直接联系 geo@ppypaper.com。',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};

// ===== 工具函数 =====
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function row(label: string, value: string): string {
  return (
    '<tr>' +
    `<td style="background:#f5f5f5;font-weight:bold;width:80px;">${escapeHtml(label)}</td>` +
    `<td>${value}</td>` +
    '</tr>'
  );
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ ok: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

