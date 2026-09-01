/**
 * 扑扑鹰 GEO 排名查询 API 端点
 * @module api/rank
 * @职责 接收 keyword + platform 参数，返回品牌在 AI 搜索平台的排名表现
 * @状态 v1.1.0 - 当前读取 rank-mock.json 演示数据；后续接真实数据源时替换 data loader
 * @方法 GET /api/rank?keyword=xxx&platform=xxx
 */
import type { APIRoute } from 'astro';
import mockData from '../../data/rank-mock.json';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
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

  // 过滤 mock 数据（platform=全部 时不限平台）
  let results = mockData.results.filter((r) => r.keyword === keyword);
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
