/**
 * @file 联系页脚本（contact.js）
 * @description 联系表单提交处理：原生 DOM 校验必填项，submit 时阻止默认行为；
 *              后端接口未接通时给出 mock 成功提示（接口接通后改 action 即可）。
 *              字段：name/brand/email/phone/message（原 ajax-contact.js 因表单字段重名已废弃）。
 * @module pages/contact
 * @依赖 无（原生 DOM；jQuery 全局已就绪但本模块未使用）
 * @导出 无（自动执行，由 contact.astro 引入）
 * @来源 从原 static/js/ajax-contact.js 迁移并改为原生 DOM + mock 模式
 */

(function () {
  'use strict';

  function initContactForm() {
    var form = document.getElementById('contact-form');
    var messageBox = document.querySelector('.form-message');
    if (!form || !messageBox) return;

    function setMessage(text, type) {
      messageBox.textContent = text;
      messageBox.style.display = text ? 'block' : 'none';
      messageBox.classList.remove('success', 'error');
      if (type) messageBox.classList.add(type);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // 简单必填校验：浏览器原生 required 已处理，此处兜底
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var brand = form.querySelector('[name="brand"]');
      var phone = form.querySelector('[name="phone"]');
      if (!name.value.trim() || !email.value.trim() || !brand.value.trim() || !phone.value.trim()) {
        setMessage('请填写姓名、邮箱、品牌、电话四项必填信息。', 'error');
        return;
      }

      // 邮箱格式校验
      var emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email.value.trim())) {
        setMessage('请输入正确的邮箱地址。', 'error');
        return;
      }

      // TODO(后端): 接通后端表单接口后，替换为真实 fetch/POST 并去掉 mock 提示
      // mock 成功响应
      setMessage('提交成功！扑扑鹰团队将在 24 小时内联系您，请保持电话畅通。', 'success');
      form.reset();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
