/**
 * @file 资讯列表页脚本（news.js）
 * @description 资讯列表页分类过滤交互：点击顶部过滤按钮，按 data-category 属性显示/隐藏卡片；
 *              切换按钮 active 状态；无匹配卡片时显示空状态占位。
 *              纯原生 DOM 实现，不依赖 jQuery（虽然 jQuery 已全局加载）。
 * @module pages/news
 * @依赖 无（原生 DOM）
 * @导出 无（自动执行，由 news.astro 引入）
 */

(function () {
  'use strict';

  function initNewsFilter() {
    var filterBar = document.querySelector('.news-filter-bar');
    var listWrap = document.getElementById('news-list');
    var emptyPlaceholder = document.querySelector('.news-empty-placeholder');
    if (!filterBar || !listWrap) return;

    var buttons = filterBar.querySelectorAll('.news-filter-btn');
    // 卡片结构：#news-list > .col-xx > .blog-post-item[data-category]
    var cards = listWrap.querySelectorAll('[data-category]');

    function applyFilter(category) {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var cardCategory = card.getAttribute('data-category');
        var colWrapper = card.parentElement;
        var show = category === '全部' || cardCategory === category;
        colWrapper.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
      if (emptyPlaceholder) {
        emptyPlaceholder.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyFilter(btn.getAttribute('data-filter'));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsFilter);
  } else {
    initNewsFilter();
  }
})();
