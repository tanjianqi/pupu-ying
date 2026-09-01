/**
 * @file 案例列表页脚本（cases.js）
 * @description 案例列表页平台过滤交互：点击顶部过滤按钮，按 data-platform 属性显示/隐藏卡片；
 *              切换按钮 active 状态；无匹配卡片时显示空状态占位。
 *              纯原生 DOM 实现，不依赖 jQuery（虽然 jQuery 已全局加载）。
 * @module pages/cases
 * @依赖 无（原生 DOM）
 * @导出 无（自动执行，由 cases/index.astro 引入）
 */

(function () {
  'use strict';

  function initCaseFilter() {
    var filterBar = document.querySelector('.case-filter-bar');
    var listWrap = document.getElementById('case-list');
    var emptyPlaceholder = document.querySelector('.case-empty-placeholder');
    if (!filterBar || !listWrap) return;

    var buttons = filterBar.querySelectorAll('.case-filter-btn');
    // 卡片结构：#case-list > .col-xx > .sasly-project-item[data-platform]
    // 隐藏时需操作外层 col 容器，避免留下空列占位
    var cards = listWrap.querySelectorAll('[data-platform]');

    function applyFilter(platform) {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var cardPlatform = card.getAttribute('data-platform');
        var colWrapper = card.parentElement;
        var show = platform === '全部' || cardPlatform === platform;
        // 显式设置 display，避免与 bootstrap 的 col display 冲突
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
    document.addEventListener('DOMContentLoaded', initCaseFilter);
  } else {
    initCaseFilter();
  }
})();
