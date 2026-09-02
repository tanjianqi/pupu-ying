/**
 * 扑扑鹰 API 集成测试
 * @module tests/api/test.mjs
 * @职责 启动 preview 服务器 → 运行所有 API 测试用例 → 输出报告 → 关闭服务器
 * @覆盖 /api/rank（4 用例）+ /api/contact（6 用例）= 10 个用例
 * @使用 npm run test:api
 * @依赖 仅 Node.js 内置（fetch + child_process），无需额外安装
 * @版本 v1.5.0
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE_URL = 'http://127.0.0.1:4321';
const PREVIEW_PORT = 4321;

// ===== 测试结果统计 =====
let passed = 0;
let failed = 0;
const failures = [];

/**
 * 断言工具
 */
function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  ❌ ${message}`);
  }
}

/**
 * 发送 HTTP 请求并返回 { status, data }
 * @param path 请求路径
 * @param options { method, headers, body, ip }
 *   ip: 模拟客户端 IP（通过 X-Forwarded-For 头注入，用于隔离测试用例的速率限制配额）
 */
async function req(path, options = {}) {
  const url = BASE_URL + path;
  const headers = { ...options.headers };
  if (options.ip) {
    headers['X-Forwarded-For'] = options.ip;
  }
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { _raw: text };
  }
  return { status: res.status, data, headers: res.headers };
}

// ===== /api/rank 测试用例 =====
async function testRank() {
  console.log('\n=== GET /api/rank ===');

  // 用例 1: 正常查询
  console.log('\n[用例 1] 正常查询 keyword=GEO优化');
  {
    const r = await req('/api/rank?keyword=GEO%E4%BC%98%E5%8C%96');
    assert(r.status === 200, `应返回 200（实际 ${r.status}）`);
    assert(r.data.ok === true, '应返回 ok:true');
    assert(typeof r.data.count === 'number', '应包含 count 字段');
    assert(Array.isArray(r.data.results), 'results 应为数组');
    assert(r.data.keyword === 'GEO优化', `keyword 应回显（实际 ${r.data.keyword}）`);
  }

  // 用例 2: 指定平台过滤
  console.log('\n[用例 2] 指定平台 platform=豆包');
  {
    const r = await req('/api/rank?keyword=GEO%E4%BC%98%E5%8C%96&platform=%E8%B1%86%E5%8C%85');
    assert(r.status === 200, `应返回 200（实际 ${r.status}）`);
    assert(r.data.ok === true, '应返回 ok:true');
    assert(r.data.platform === '豆包', `platform 应回显豆包（实际 ${r.data.platform}）`);
    if (r.data.results.length > 0) {
      const allMatch = r.data.results.every((row) => row.platform === '豆包');
      assert(allMatch, '所有结果 platform 应为豆包');
    }
  }

  // 用例 3: 缺 keyword 参数
  console.log('\n[用例 3] 缺 keyword 参数');
  {
    const r = await req('/api/rank?platform=%E8%B1%86%E5%8C%85');
    assert(r.status === 400, `应返回 400（实际 ${r.status}）`);
    assert(r.data.ok === false, '应返回 ok:false');
    assert(typeof r.data.message === 'string' && r.data.message.includes('keyword'), 'message 应提示缺少 keyword');
  }

  // 用例 4: 不存在的 keyword
  console.log('\n[用例 4] 不存在的 keyword');
  {
    const r = await req('/api/rank?keyword=nonexistent12345');
    assert(r.status === 200, `应返回 200（实际 ${r.status}）`);
    assert(r.data.ok === true, '应返回 ok:true');
    assert(r.data.count === 0, `count 应为 0（实际 ${r.data.count}）`);
    assert(Array.isArray(r.data.results) && r.data.results.length === 0, 'results 应为空数组');
  }
}

// ===== /api/contact 测试用例 =====
async function testContact() {
  console.log('\n=== POST /api/contact ===');

  // 用例 5: 正常提交（开发模式降级，sent:false）
  console.log('\n[用例 5] 正常提交（开发模式降级）');
  {
    const r = await req('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ip: '10.0.0.5',  // 独立 IP 隔离速率限制
      body: {
        name: '测试用户',
        email: 'test@example.com',
        brand: '测试品牌',
        phone: '13800138000',
        message: '集成测试',
        website: '',  // 蜜罐字段为空
      },
    });
    assert(r.status === 200, `应返回 200（实际 ${r.status}）`);
    assert(r.data.ok === true, '应返回 ok:true');
    // 开发模式（无 SMTP 凭证）sent 应为 false；生产模式为 true
    assert(typeof r.data.sent === 'boolean', `sent 应为 boolean（实际 ${typeof r.data.sent}）`);
    assert(typeof r.data.message === 'string' && r.data.message.length > 0, '应包含 message');
  }

  // 用例 6: 缺字段
  console.log('\n[用例 6] 缺字段（缺 brand 和 phone）');
  {
    const r = await req('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ip: '10.0.0.6',
      body: {
        name: '测试',
        email: 'test@example.com',
        website: '',
      },
    });
    assert(r.status === 400, `应返回 400（实际 ${r.status}）`);
    assert(r.data.ok === false, '应返回 ok:false');
    assert(r.data.message.includes('brand') || r.data.message.includes('phone'), 'message 应提示缺失字段');
  }

  // 用例 7: 邮箱格式错误
  console.log('\n[用例 7] 邮箱格式错误');
  {
    const r = await req('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ip: '10.0.0.7',
      body: {
        name: '测试',
        email: 'bad-email',
        brand: '品牌',
        phone: '13800138000',
        website: '',
      },
    });
    assert(r.status === 400, `应返回 400（实际 ${r.status}）`);
    assert(r.data.ok === false, '应返回 ok:false');
    assert(r.data.message.includes('邮箱'), 'message 应提示邮箱格式错误');
  }

  // 用例 8: 非法 JSON
  console.log('\n[用例 8] 非法 JSON 请求体');
  {
    const r = await req('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ip: '10.0.0.8',
      body: '{not valid json',
    });
    assert(r.status === 400, `应返回 400（实际 ${r.status}）`);
    assert(r.data.ok === false, '应返回 ok:false');
    assert(r.data.message.includes('JSON'), 'message 应提示 JSON 格式错误');
  }

  // 用例 9: 蜜罐字段检测
  console.log('\n[用例 9] 蜜罐字段被填写（疑似机器人）');
  {
    const r = await req('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ip: '10.0.0.9',
      body: {
        name: '机器人',
        email: 'bot@example.com',
        brand: '品牌',
        phone: '13800138000',
        website: 'http://spam.com',  // 蜜罐字段非空
      },
    });
    assert(r.status === 200, `应返回 200（静默拒绝，实际 ${r.status}）`);
    assert(r.data.ok === true, '应返回 ok:true（静默成功）');
    assert(r.data.received && r.data.received.blocked === true, 'received.blocked 应为 true');
  }

  // 用例 10: 速率限制（连续提交触发 429）
  console.log('\n[用例 10] 速率限制（连续 4 次提交，第 4 次应 429）');
  {
    const payload = {
      name: '限流测试',
      email: 'rate@example.com',
      brand: '品牌',
      phone: '13800138000',
      website: '',
    };
    const results = [];
    // 使用独立 IP 测试限流，避免受前面用例影响
    for (let i = 0; i < 4; i++) {
      const r = await req('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ip: '10.0.0.10',  // 固定 IP，测试同一 IP 的限流
        body: payload,
      });
      results.push(r.status);
    }
    console.log(`    连续 4 次响应状态：${results.join(', ')}`);
    // 默认 3 次/分钟，前 3 次应 200，第 4 次应 429
    assert(results[0] === 200, `第 1 次应 200（实际 ${results[0]}）`);
    assert(results[1] === 200, `第 2 次应 200（实际 ${results[1]}）`);
    assert(results[2] === 200, `第 3 次应 200（实际 ${results[2]}）`);
    assert(results[3] === 429, `第 4 次应 429（实际 ${results[3]}）`);
  }
}

// ===== 服务器管理 =====
async function startServer() {
  console.log('启动 preview 服务器...');
  const proc = spawn('npm', ['run', 'preview', '--', '--port', PREVIEW_PORT, '--host', '127.0.0.1'], {
    stdio: 'pipe',
    shell: true,
  });

  // 等待服务器就绪（最多 30 秒）
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/rank?keyword=ping`);
      if (res.ok || res.status === 400) {
        console.log('服务器就绪');
        return proc;
      }
    } catch {
      // 服务器未启动，继续等待
    }
    await sleep(500);
  }
  throw new Error('服务器启动超时（30 秒）');
}

function stopServer(proc) {
  if (proc) {
    console.log('\n关闭 preview 服务器...');
    proc.kill('SIGTERM');
    // Windows 下需要强制杀进程树
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', proc.pid, '/f', '/t'], { stdio: 'ignore', shell: true });
    }
  }
}

// ===== 主流程 =====
async function main() {
  console.log('====================================');
  console.log('  扑扑鹰 API 集成测试 v1.5.0');
  console.log('====================================');

  let server;
  try {
    server = await startServer();

    await testRank();
    await testContact();

    // 输出报告
    console.log('\n====================================');
    console.log('  测试报告');
    console.log('====================================');
    console.log(`  通过：${passed}`);
    console.log(`  失败：${failed}`);
    console.log(`  总计：${passed + failed}`);
    if (failures.length > 0) {
      console.log('\n失败用例：');
      failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    }
    console.log('====================================');

    stopServer(server);
    // Windows 下子进程关闭可能触发 UV_HANDLE_CLOSING，强制退出避免非零退出码
    setTimeout(() => process.exit(failed > 0 ? 1 : 0), 500);
  } catch (e) {
    console.error('\n❌ 测试执行失败：', e.message);
    stopServer(server);
    setTimeout(() => process.exit(2), 500);
  }
}

main();
