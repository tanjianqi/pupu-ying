/**
 * 扑扑鹰 GEO 排名查询 API 端点
 * @module api/rank
 * @职责 接收 keyword + platform 参数，返回品牌在 AI 搜索平台的排名表现
 * @状态 v1.2.1 - 数据源抽象为 loadRankData()，当前读 rank-mock.json；
 *               后续接真实数据源时仅替换 loadRankData 实现，端点契约不变
 * @方法 GET /api/rank?keyword=xxx&platform=xxx
 */
import type { APIRoute } from 'astro';
import mockData from '../../data/rank-mock.json';

export const prerender = false;

// ===== 类型定义 =====
interface RankRow {
  keyword: string;
  platform: string;
  rank: number;
  url: string;
  change: string;
}

// ===== 可插拔数据源 =====
// 当前：读取本地 mock JSON
// 后续：可替换为数据库查询 / 第三方 API 调用 / 爬虫结果等
// 注意：替换时保持返回 Promise<RankRow[]>，端点过滤逻辑无需改动
async function loadRankData(): Promise<RankRow[]> {
  // mock 数据是同步导入的 JSON，包一层 Promise 保持异步签名一致
  return (mockData as { results: RankRow[] }).results;
}

export const GET: APIRoute = async ({ url }) => {
  // 解析查询参数
  const keyword = url.searchParams.get('keyword')?.trim() || '';
  const platform = url.searchParams.get('platform')?.trim() || '';

  // 参数校验：keyword 必填
  if (!keyword) {
    return new Response(
      JSON.stringify({ ok: false, message: '缺少必填参数 keyword' }),
      { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  // 加载数据源（当前 mock，后续可替换）
  let allRows: RankRow[];
  try {
    allRows = await loadRankData();
  } catch (e) {
    console.error('[/api/rank] 数据源加载失败：', e);
    return new Response(
      JSON.stringify({ ok: false, message: '数据源暂时不可用，请稍后重试' }),
      { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  // 过滤数据（platform=全部 时不限平台）
  let results = allRows.filter((r) => r.keyword === keyword);
  if (platform && platform !== '全部') {
    results = results.filter((r) => r.platform === platform);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      keyword,
      platform: platform || '全部',
      count: results.length,
      results,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
