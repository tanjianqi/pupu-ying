/**
 * 扑扑鹰全站初始化脚本
 * @module main
 * @依赖 jquery, bootstrap, gsap/ScrollSmoother/ScrollTrigger/SplitText, aos, magnific-popup
 * @导出 无（自动执行，由 BaseLayout 引入）
 * @来源 从原 static/js/common_script.js 迁移通用部分
 */
(function ($) {
  'use strict';

  //===== 主菜单交互（navbar-toggler / 二级下拉 / 关闭）
  function mainMenu() {
    var navContainer = $('.header-navigation'),
      navbarToggler = $('.navbar-toggler'),
      navMenu = $('.sasly-nav-menu'),
      closeIcon = $('.navbar-close');

    navbarToggler.on('click', function () {
      navbarToggler.toggleClass('active');
      navMenu.toggleClass('menu-on');
    });

    closeIcon.on('click', function () {
      navMenu.removeClass('menu-on');
      navbarToggler.removeClass('active');
    });

    navMenu.find('li a').each(function () {
      if ($(this).children('.dd-trigger').length < 1) {
        if ($(this).next().length > 0) {
          $(this).append('<span class="dd-trigger"><i class="far fa-angle-down"></i></span>');
        }
      }
    });

    navMenu.on('click', '.dd-trigger', function (e) {
      e.preventDefault();
      $(this).parent().parent().siblings().children('ul.sub-menu').slideUp();
      $(this).parent().next('ul.sub-menu').stop(true, true).slideToggle(350);
      $(this).toggleClass('sub-menu-open');
    });
  }

  //===== Offcanvas 覆盖层
  function offCanvas() {
    $('.navbar-toggler, .offcanvas__overlay, .navbar-close').on('click', function () {
      $('.offcanvas__overlay').toggleClass('overlay-open');
    });
    $('.offcanvas__overlay').on('click', function () {
      $('.navbar-toggler').removeClass('active');
      $('.sasly-nav-menu').removeClass('menu-on');
    });
    $('.panel-close-btn, .navbar-close').on('click', function () {
      $('.offcanvas__overlay').removeClass('overlay-open');
    });
  }

  //===== Preloader 淡出
  $(window).on('load', function () {
    $('.preloader').delay(500).fadeOut(500);
  });

  //===== Magnific Popup（视频/图片弹窗）
  if ($('.video-popup').length) {
    $('.video-popup').magnificPopup({ type: 'iframe', removalDelay: 300, mainClass: 'mfp-fade' });
  }
  if ($('.img-popup').length) {
    $('.img-popup').magnificPopup({ type: 'image', gallery: { enabled: true } });
  }

  //===== GSAP 平滑滚动 + 文字动画
  gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother);
  ScrollSmoother.create({ smooth: 1, effects: true, smoothTouch: 0.1 });

  if ($('.split').length > 0) {
    let mySplitText = new SplitText('.split', { type: 'chars' });
    let chars = mySplitText.chars;
    gsap.from(chars, {
      yPercent: 100, stagger: 0.065, ease: 'back.out', duration: 1,
      scrollTrigger: { trigger: '.split', start: 'top 50%' },
    });
  }

  if ($('.text-anm').length) {
    let staggerAmount = 0.02, translateXValue = 20, delayValue = 0.2, easeType = 'power2.out';
    document.querySelectorAll('.text-anm').forEach((element) => {
      let animationSplitText = new SplitText(element, { type: 'chars, words' });
      gsap.from(animationSplitText.chars, {
        duration: 1, delay: delayValue, x: translateXValue, autoAlpha: 0,
        stagger: staggerAmount, ease: easeType,
        scrollTrigger: { trigger: element, start: 'top 85%' },
      });
    });
  }

  //===== AOS 滚动动画初始化
  AOS.init();

  //===== Document Ready
  $(function () {
    mainMenu();
    offCanvas();
  });
})(window.jQuery);
