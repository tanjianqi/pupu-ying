/**
 * GEO 排名查询页页面脚本
 * @module pages/rank
 * @用途 处理 #rank-form 表单提交：校验关键词非空 → 按关键词+平台过滤硬编码 mock 数据 → 渲染结果表格 → 显示结果区
 * @依赖 无（纯原生 DOM，不依赖 jQuery）
 * @来源 mock 数据硬编码自 src/data/rank-mock.json（v0.7.0 演示数据，后端 /api/rank 未接通）
 * @导出 无（自动执行，由 rank.astro 通过 import 引入）
 */

//===== 演示数据（硬编码，与 src/data/rank-mock.json 同步）=====
const MOCK_RESULTS = [
  { keyword: 'GEO优化', platform: '豆包', rank: 1, url: 'example.com', change: '+3' },
  { keyword: 'AI SEO', platform: 'DeepSeek', rank: 2, url: 'example.com', change: '+1' },
  { keyword: '品牌优化', platform: '文心一言', rank: 3, url: 'example.com', change: '+5' },
  { keyword: 'GEO优化', platform: '通义千问', rank: 1, url: 'example.com', change: '+2' },
  { keyword: 'AI搜索', platform: 'Kimi', rank: 4, url: 'example.com', change: '-1' },
  { keyword: '品牌优化', platform: '豆包', rank: 2, url: 'example.com', change: '+1' }
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function changeClass(change) {
  if (!change) return 'rank-change-neutral';
  if (change.indexOf('+') === 0) return 'rank-change-up';
  if (change.indexOf('-') === 0) return 'rank-change-down';
  return 'rank-change-neutral';
}

function filterResults(keyword, platform) {
  const kw = keyword.trim().toLowerCase();
  return MOCK_RESULTS.filter((item) => {
    const kwMatch = !kw || String(item.keyword).toLowerCase().indexOf(kw) !== -1;
    const platMatch = platform === '全部' || item.platform === platform;
    return kwMatch && platMatch;
  });
}

function renderRows(rows) {
  const body = document.getElementById('rank-result-body');
  if (!body) return;
  if (!rows.length) {
    body.innerHTML =
      '<tr><td colspan="5" class="text-center rank-empty">未查询到匹配的排名数据</td></tr>';
    return;
  }
  body.innerHTML = rows
    .map(
      (row) =>
        '<tr>' +
        '<td>' + escapeHtml(row.keyword) + '</td>' +
        '<td>' + escapeHtml(row.platform) + '</td>' +
        '<td><span class="rank-num">' + escapeHtml(String(row.rank)) + '</span></td>' +
        '<td><a href="https://' + escapeHtml(row.url) + '" target="_blank" rel="noopener noreferrer" class="rank-link">' + escapeHtml(row.url) + '</a></td>' +
        '<td><span class="' + changeClass(row.change) + '">' + escapeHtml(row.change) + '</span></td>' +
        '</tr>'
    )
    .join('');
}

function showTip(show) {
  const tip = document.getElementById('rank-form-tip');
  if (!tip) return;
  if (show) {
    tip.hidden = false;
  } else {
    tip.hidden = true;
  }
}

function showResults(show) {
  const wrapper = document.getElementById('rank-result-wrapper');
  if (!wrapper) return;
  wrapper.hidden = !show;
}

function handleSubmit(event) {
  event.preventDefault();
  const keywordEl = document.getElementById('rank-keyword');
  const platformEl = document.getElementById('rank-platform');
  if (!keywordEl || !platformEl) return;

  const keyword = keywordEl.value || '';
  if (!keyword.trim()) {
    showTip(true);
    showResults(false);
    keywordEl.focus();
    return;
  }
  showTip(false);

  const platform = platformEl.value || '全部';
  const rows = filterResults(keyword, platform);
  renderRows(rows);
  showResults(true);

  // 滚动到结果区
  const wrapper = document.getElementById('rank-result-wrapper');
  if (wrapper && !wrapper.hidden && wrapper.scrollIntoView) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function init() {
  const form = document.getElementById('rank-form');
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
