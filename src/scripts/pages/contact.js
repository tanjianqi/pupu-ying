/**
 * 联系页脚本（contact.js）
 * @description 联系表单提交处理：原生 DOM 校验必填项 → fetch /api/contact → 显示成功/失败提示。
 *              字段：name/brand/email/phone/message + website(蜜罐)（原 ajax-contact.js 因表单字段重名已废弃）。
 * @module pages/contact
 * @依赖 无（原生 DOM；jQuery 全局已就绪但本模块未使用）
 * @导出 无（自动执行，由 contact.astro 引入）
 * @来源 v1.4.0 增加蜜罐字段发送 + 429 限流响应处理
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

    function setSubmitLoading(loading) {
      var btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      if (loading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '提交中... <i class="far fa-spinner fa-spin"></i>';
      } else {
        btn.disabled = false;
        if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // 简单必填校验：浏览器原生 required 已处理，此处兜底
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var brand = form.querySelector('[name="brand"]');
      var phone = form.querySelector('[name="phone"]');
      var message = form.querySelector('[name="message"]');
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

      // v1.4.0: fetch /api/contact 端点（含蜜罐字段 website）
      setSubmitLoading(true);
      var payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        brand: brand.value.trim(),
        phone: phone.value.trim(),
        message: message ? message.value.trim() : '',
        website: '',  // 蜜罐字段：正常用户不会填写此隐藏字段
      };

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { status: res.status, data: data };
          });
        })
        .then(function (result) {
          // v1.4.0: 429 速率限制特殊处理
          if (result.status === 429) {
            var retryAfter = (result.data && result.data.retryAfter) || 60;
            setMessage(result.data.message || ('提交过于频繁，请 ' + retryAfter + ' 秒后再试。'), 'error');
            return;
          }
          if (result.data && result.data.ok) {
            setMessage(result.data.message || '提交成功！', 'success');
            form.reset();
          } else {
            setMessage(result.data && result.data.message ? result.data.message : '提交失败，请稍后重试。', 'error');
          }
        })
        .catch(function () {
          setMessage('网络异常，请检查连接后重试。', 'error');
        })
        .finally(function () {
          setSubmitLoading(false);
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
