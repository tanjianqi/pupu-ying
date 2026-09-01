/**
 * GEO 排名查询页页面脚本
 * @module pages/rank
 * @用途 处理 #rank-form 表单提交：校验关键词非空 → fetch /api/rank → 渲染结果表格 → 显示结果区
 * @依赖 无（纯原生 DOM，不依赖 jQuery）
 * @来源 v1.1.0 改为 fetch /api/rank 端点（替代 v0.7.0 硬编码 mock）
 * @导出 无（自动执行，由 rank.astro 通过 import 引入）
 */

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
  tip.hidden = !show;
}

function showResults(show) {
  const wrapper = document.getElementById('rank-result-wrapper');
  if (!wrapper) return;
  wrapper.hidden = !show;
}

function setSubmitLoading(loading) {
  const btn = document.querySelector('#rank-form button[type="submit"]');
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '查询中... <i class="far fa-spinner fa-spin"></i>';
  } else {
    btn.disabled = false;
    if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
  }
}

async function handleSubmit(event) {
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

  // v1.1.0: fetch /api/rank 端点
  setSubmitLoading(true);
  try {
    const params = new URLSearchParams({ keyword: keyword.trim(), platform });
    const res = await fetch('/api/rank?' + params.toString());
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '查询失败（HTTP ' + res.status + '）');
    }
    const data = await res.json();
    if (!data.ok) throw new Error(data.message || '查询失败');
    renderRows(data.results || []);
    showResults(true);

    const wrapper = document.getElementById('rank-result-wrapper');
    if (wrapper && !wrapper.hidden && wrapper.scrollIntoView) {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (e) {
    const body = document.getElementById('rank-result-body');
    if (body) body.innerHTML = '<tr><td colspan="5" class="text-center text-danger">查询失败：' + escapeHtml(e.message || '未知错误') + '</td></tr>';
    showResults(true);
  } finally {
    setSubmitLoading(false);
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
