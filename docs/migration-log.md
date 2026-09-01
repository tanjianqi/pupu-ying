# 迁移进度表

> 本表记录扑扑鹰网站从静态 HTML 迁移到 Astro 的逐项进度。
> 每完成一项打勾 `[x]`，删除冗余资源时同步记一条到 CHANGELOG。

---

## 页面迁移（16 项）

| 状态 | 原文件 | 目标路由 | 版本 |
|---|---|---|---|
| [ ] | index.html | src/pages/index.astro | v0.4.0 |
| [ ] | about.html | src/pages/about.astro | v0.8.0 |
| [ ] | geo.html | src/pages/geo.astro | v0.5.0 |
| [ ] | geoservice.html + 服务.html | src/pages/geoservice.astro | v0.5.0 |
| [ ] | 案例列表.html | src/pages/cases/index.astro（补回） | v0.6.0 |
| [ ] | 案例详情.html | src/pages/cases/[slug].astro（补回） | v0.6.0 |
| [ ] | —（注释中） | src/pages/rank.astro（补回） | v0.7.0 |
| [ ] | news.html | src/pages/news.astro | v0.8.0 |
| [ ] | news-art.html | src/pages/news/[slug].astro | v0.8.0 |
| [ ] | team.html | src/pages/team.astro | v0.8.0 |
| [ ] | contact.html | src/pages/contact.astro | v0.8.0 |
| [ ] | faqs.html | src/pages/faqs.astro | v0.8.0 |
| [ ] | 素材.html | src/pages/materials.astro | v0.8.0 |
| [ ] | 404.html | src/pages/404.astro | v0.8.0 |

---

## CSS 处置（21 项）

| 状态 | 文件 | 处置 | 去向 |
|---|---|---|---|
| [x] | bootstrap.min.css | 保留 vendor | public/vendor/css/ |
| [x] | slick.css | 保留 vendor | public/vendor/css/ |
| [x] | aos.css | 保留 vendor | public/vendor/css/ |
| [x] | magnific-popup.css | 保留 vendor | public/vendor/css/ |
| [x] | nice-select.css | 保留 vendor | public/vendor/css/ |
| [x] | jquery-ui.min.css | 保留 vendor | public/vendor/css/ |
| [x] | jquery.animatedheadline.css | 保留 vendor | public/vendor/css/ |
| [x] | all.min.css | 保留 vendor | public/vendor/css/ |
| [x] | flaticon_sasly.css | 保留 vendor | public/vendor/css/ |
| [x] | css2.css | 保留 vendor | public/vendor/css/ |
| [ ] | style-ppy.css | 合并去重 | src/styles/theme.css |
| [ ] | style-ppy1.css | 合并去重 | src/styles/theme.css |
| [ ] | common_style.css | 合并去重 | src/styles/theme.css |
| [ ] | common.css | 合并去重 | src/styles/theme.css |
| [ ] | style.css | 合并后删除 | src/styles/theme.css |
| [ ] | default.css | 验证无引用→删除 | 删除 |
| [ ] | style1.css | 验证无引用→删除 | 删除 |
| [ ] | style2.css | 验证无引用→删除 | 删除 |
| [ ] | style3.css | 验证无引用→删除 | 删除 |
| [ ] | style4.css | 验证无引用→删除 | 删除 |
| [ ] | style5.css | 验证无引用→删除 | 删除 |

---

## JS 处置（25 项）

| 状态 | 文件 | 处置 | 去向 |
|---|---|---|---|
| [x] | jquery-3.7.1.min.js | 保留 vendor | public/vendor/js/ |
| [x] | bootstrap.min.js | 保留 vendor | public/vendor/js/ |
| [x] | popper.min.js | 保留 vendor | public/vendor/js/ |
| [x] | gsap.min.js | 保留 vendor | public/vendor/js/ |
| [x] | ScrollSmoother.min.js | 保留 vendor（核对授权） | public/vendor/js/ |
| [x] | ScrollTrigger.min.js | 保留 vendor | public/vendor/js/ |
| [x] | SplitText.min.js | 保留 vendor | public/vendor/js/ |
| [x] | slick.min.js | 保留 vendor | public/vendor/js/ |
| [x] | aos.js | 保留 vendor | public/vendor/js/ |
| [x] | jquery.magnific-popup.min.js | 保留 vendor | public/vendor/js/ |
| [x] | jquery.nice-select.min.js | 保留 vendor | public/vendor/js/ |
| [x] | isotope.min.js | 保留 vendor | public/vendor/js/ |
| [x] | imagesloaded.min.js | 保留 vendor | public/vendor/js/ |
| [x] | jquery-ui.min.js | 保留 vendor | public/vendor/js/ |
| [x] | jquery.animatedheadline.js | 保留 vendor | public/vendor/js/ |
| [ ] | common_script.js | 拆解 | src/scripts/ |
| [ ] | theme.js | 拆解后删除 | 删除 |
| [ ] | theme1.js | 验证无引用→删除 | 删除 |
| [ ] | theme2.js | 验证无引用→删除 | 删除 |
| [ ] | theme3.js | 验证无引用→删除 | 删除 |
| [ ] | theme4.js | 验证无引用→删除 | 删除 |
| [ ] | theme5.js | 验证无引用→删除 | 删除 |
| [ ] | ajax-contact.js | 迁移 | src/scripts/pages/contact.js |

---

## 组件抽取（按需）

| 状态 | 组件 | 版本 |
|---|---|---|
| [x] | BaseLayout.astro | v0.2.0/v0.3.0 |
| [x] | Preloader.astro | v0.3.0 |
| [x] | Header.astro | v0.3.0 |
| [x] | Nav.astro | v0.3.0 |
| [x] | Footer.astro | v0.3.0 |
| [ ] | ServiceCard.astro | v0.5.0 |
| [ ] | CaseCard.astro | v0.6.0 |
| [ ] | CTASection.astro | v0.4.0 |

---

## 已验证页面（迁移后核对）

迁移完成后逐页核对视觉/交互，在此打勾。

| 状态 | 页面 | 核对人 | 日期 |
|---|---|---|---|
| [ ] | 首页 | | |
| [ ] | GEO 介绍 | | |
| [ ] | GEO 服务 | | |
| [ ] | 案例列表 | | |
| [ ] | 案例详情 | | |
| [ ] | 排名查询 | | |
| [ ] | 资讯列表 | | |
| [ ] | 资讯详情 | | |
| [ ] | 关于 | | |
| [ ] | 团队 | | |
| [ ] | 联系 | | |
| [ ] | 常见问题 | | |
| [ ] | 素材 | | |
| [ ] | 404 | | |
