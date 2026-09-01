/**
 * GEO 介绍页页面脚本
 * @module pages/geo
 * @依赖 jquery（BaseLayout 全局加载）
 * @来源 从原 static/js/theme4.js 迁移；本页无 <select>/slider/isotope 等控件，theme4.js 在本页为 no-op，故保留占位
 * @导出 无（自动执行，由 geo.astro 引入）
 */
(function ($) {
  'use strict';
  if (typeof $ === 'undefined') return;

  //===== Nice select（本页无 <select>，保留初始化以兼容未来扩展）
  if (typeof $.fn.niceSelect === 'function' && $('select').length) {
    $('select').niceSelect();
  }
})(window.jQuery);
