/**
 * 扑扑鹰 联系表单提交 API 端点
 * @module api/contact
 * @职责 接收联系表单数据（name/email/brand/phone/message），校验后返回成功响应
 * @状态 v1.1.0 - 当前仅校验并返回成功，未发送真实邮件；后续接邮件服务时替换 sendMail
 * @方法 POST /api/contact  (Content-Type: application/json)
 */
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, '请求体不是合法 JSON');
  }

  // 提取并校验字段
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

  // v1.1.0: 此处仅返回成功，未真实发送邮件
  // TODO(后端): 接入邮件服务（如 Resend/SendGrid/SMTP），将表单数据发送至 geo@ppypaper.com
  // 示例: await sendMail({ to: 'geo@ppypaper.com', from: email, subject: `咨询-${brand}`, text: message })

  return new Response(
    JSON.stringify({
      ok: true,
      message: '提交成功！扑扑鹰团队将在 24 小时内联系您，请保持电话畅通。',
      received: { name, email, brand, phone, hasMessage: Boolean(str(message)) },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ ok: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
