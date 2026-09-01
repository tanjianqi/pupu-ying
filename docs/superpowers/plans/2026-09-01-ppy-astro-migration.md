# 扑扑鹰 Astro 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将扑扑鹰现站（14 个静态 HTML）迁移到 Astro 静态站点生成器，补回注释中的案例库与排名查询入口，建立组件化、版本化的可维护工程。

**Architecture:** Astro 静态优先 + 组件化。原 Bootstrap/jQuery/GSAP 等框架资源保留为 vendor 全局加载；头尾抽 Astro 组件消除复制粘贴；定制 CSS 合并去重为 theme.css；业务脚本分层到 main.js + pages/*.js。内容由 JSON 驱动，案例/资讯详情用动态路由静态生成。

**Tech Stack:** Astro、Bootstrap 5、jQuery 3.7、GSAP/ScrollSmoother、Slick、AOS、npm

**Spec:** [docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md](../specs/2026-09-01-ppy-astro-migration-design.md)

**验收方式说明:** 本项目为静态营销站，依 spec ADR-007 不引入测试框架。每个任务的"测试"步骤替换为「构建验证」——`npm run build` 零错误 + `npm run dev` 视觉核对。v0.9.0 阶段引入死链检查作为唯一自动化校验。

**阶段版本映射:** v0.2.0 脚手架 → v0.3.0 布局组件 → v0.4.0 首页 → v0.5.0 GEO/服务 → v0.6.0 案例(补回) → v0.7.0 排名(补回) → v0.8.0 其余页面 → v0.9.0 收尾 → v1.0.0 上线候选

---

## Task 1: Astro 脚手架 (v0.2.0)

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro`（临时空白页，v0.4.0 替换）
- Modify: `.gitignore`（已含 node_modules/dist/.astro，无需改）
- Modify: `README.md`（移除"v0.1.0 尚未引入"注释）

- [ ] **Step 1.1: 初始化 npm 项目**

Run（cwd=项目根）:
```
npm init -y
```
Expected: 生成 `package.json`，含 name/version/scripts 等默认字段。

- [ ] **Step 1.2: 安装 Astro**

Run:
```
npm install astro
```
Expected: `package.json` 出现 `dependencies.astro`，生成 `node_modules/` 与 `package-lock.json`。

- [ ] **Step 1.3: 改写 package.json 的 scripts**

把 `package.json` 的 `"scripts"` 字段改为：
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```

- [ ] **Step 1.4: 创建 astro.config.mjs**

```javascript
// @ts-check
// 扑扑鹰 Astro 配置
// 静态站点输出，site 字段用于 sitemap/SEO 绝对路径
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.ppypaper.com',
  output: 'static',
});
```

- [ ] **Step 1.5: 创建 BaseLayout 空壳**

Create `src/layouts/BaseLayout.astro`:
```astro
---
// 组件: BaseLayout
// 职责: 页面骨架 <html><head><body>，装载全局 CSS/JS、Header、Footer
// 依赖: （v0.2.0 暂无，v0.3.0 起引入 Header/Footer）
// Props:
//   title (string)       - <title> 文本
//   description (string) - meta description
//   activeNav (string)   - 当前高亮菜单 key（v0.3.0 起）
//   bodyClass (string)   - <body> class
//   pageStyle (string)   - 页面局部 CSS 路径（v0.4.0 起）
//   pageScript (string)  - 页面局部 JS 路径（v0.4.0 起）
const {
  title = '扑扑鹰 GEO+SEO优化 - 全域AI搜索获客系统',
  description = '扑扑鹰 - 专业GEO+SEO搜索引擎优化服务，助品牌抢占AI搜索时代增量流量。',
  bodyClass = 'business-home',
} = Astro.props;
---
<!DOCTYPE html>
<html lang="zxx">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>{title}</title>
    <link rel="shortcut icon" href="/assets/images/favicon.png" type="image/png" />
  </head>
  <body class={bodyClass}>
    <slot />
  </body>
</html>
```

- [ ] **Step 1.6: 创建临时首页**

Create `src/pages/index.astro`:
```astro
---
// 临时首页，v0.4.0 替换为正式迁移内容
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout>
  <main style="padding:80px 20px;font-family:sans-serif">
    <h1>扑扑鹰 Astro 脚手架就绪 (v0.2.0)</h1>
    <p>正式首页将在 v0.4.0 迁移。</p>
  </main>
</BaseLayout>
```

- [ ] **Step 1.7: 启动 dev 验证**

Run:
```
npm run dev
```
Expected: 控制台输出 `Local: http://localhost:4321/`，浏览器打开能看到"扑扑鹰 Astro 脚手架就绪"。Ctrl+C 停止。

- [ ] **Step 1.8: build 验证**

Run:
```
npm run build
```
Expected: 输出 `Complete!`，生成 `dist/index.html`，零错误。

- [ ] **Step 1.9: 更新 README 移除注释**

Modify `README.md`，删除快速开始章节中的这段注释：
```
> 注：v0.1.0 基线阶段尚未引入 Astro，上述命令在 v0.2.0 后可用。
> v0.1.0 为现站快照，直接用浏览器打开根目录 HTML 或本地静态服务器（如 `npx serve`）访问。
```

- [ ] **Step 1.10: 更新 CHANGELOG**

在 `CHANGELOG.md` 顶部 `## [v0.1.0]` 之上插入：
```markdown
## [v0.2.0] - 2026-09-XX

### 阶段：Astro 脚手架

### Added
- npm init + 安装 astro
- astro.config.mjs（site=https://www.ppypaper.com，static 输出）
- package.json scripts（dev/build/preview）
- src/layouts/BaseLayout.astro 空壳（Props 接口定义）
- src/pages/index.astro 临时首页

### Changed
- README.md 移除 v0.1.0 阶段注释
```
（日期填实际完成日）

- [ ] **Step 1.11: 提交 + 打 tag**

Run:
```
git add package.json package-lock.json astro.config.mjs src README.md CHANGELOG.md
git commit -m "feat(scaffold): v0.2.0 Astro 脚手架 - 初始化项目/BaseLayout空壳/临时首页"
git tag v0.2.0
```
Expected: `git log --oneline` 可见新提交，`git tag` 含 v0.2.0。

---

## Task 2: vendor 资产迁移 (v0.3.0 前置)

把原 `static/` 下第三方框架资源迁到 `public/vendor/`，为 BaseLayout 全局加载做准备。原 `static/` 暂不删（v0.9.0 收尾时移 legacy/）。

**Files:**
- Create: `public/vendor/css/`（复制 10 个框架 CSS）
- Create: `public/vendor/js/`（复制 15 个框架 JS）
- Create: `public/assets/images/`（复制 favicon + logo 等共用图，原 assets/images/）
- Create: `public/assets/font/`（合并 static/font + static/webfonts）
- Create: `public/assets/image/`（原 static/image 原样保留，被多处引用）
- Create: `public/assets/picture/`（原 static/picture 原样保留，被多处引用）

- [ ] **Step 2.1: 创建 vendor 目录并复制框架 CSS**

Run（PowerShell）:
```powershell
New-Item -ItemType Directory -Force public/vendor/css, public/vendor/js
Copy-Item static/css/bootstrap.min.css, static/css/slick.css, static/css/aos.css, static/css/magnific-popup.css, static/css/nice-select.css, static/css/jquery-ui.min.css, static/css/jquery.animatedheadline.css, static/css/all.min.css, static/css/flaticon_sasly.css, static/css/css2.css -Destination public/vendor/css
```
Expected: `public/vendor/css/` 下 10 个文件。

- [ ] **Step 2.2: 复制框架 JS**

Run:
```powershell
Copy-Item static/js/jquery-3.7.1.min.js, static/js/popper.min.js, static/js/bootstrap.min.js, static/js/gsap.min.js, static/js/SplitText.min.js, static/js/ScrollSmoother.min.js, static/js/ScrollTrigger.min.js, static/js/slick.min.js, static/js/jquery.magnific-popup.min.js, static/js/aos.js, static/js/jquery.nice-select.min.js, static/js/isotope.min.js, static/js/imagesloaded.min.js, static/js/jquery-ui.min.js, static/js/jquery.animatedheadline.js -Destination public/vendor/js
```
Expected: `public/vendor/js/` 下 15 个文件。

- [ ] **Step 2.3: 复制图片/字体资产**

Run:
```powershell
New-Item -ItemType Directory -Force public/assets
Copy-Item assets/images -Destination public/assets/images -Recurse
Copy-Item static/image -Destination public/assets/image -Recurse
Copy-Item static/picture -Destination public/assets/picture -Recurse
Copy-Item static/font -Destination public/assets/font -Recurse
Copy-Item static/webfonts -Destination public/assets/font/webfonts -Recurse
```
Expected: `public/assets/` 下含 images/image/picture/font 目录。

- [ ] **Step 2.4: 更新 migration-log**

在 `docs/migration-log.md` 的 CSS/JS 表中，把已复制的 vendor 项打 `[x]`。

- [ ] **Step 2.5: 提交**

Run:
```
git add public docs/migration-log.md
git commit -m "chore(vendor): 迁移第三方框架CSS/JS/图片/字体到 public/"
```

---

## Task 3: 布局组件 - Header/Nav/Footer/Preloader (v0.3.0)

**Files:**
- Create: `src/data/nav.json`
- Create: `src/data/site.json`
- Create: `src/components/Preloader.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`（装载全局 CSS + 组件 + 全局 JS）
- Create: `src/styles/global.css`
- Create: `src/scripts/main.js`
- Create: `src/styles/theme.css`（从原 style-ppy/common_style/common 合并去重；本阶段先建空文件占位，内容迁移在 v0.4.0）

**源参考:** index.html
- header: 第 28-107 行
- header-top 联系条: 29-59
- 主导航: 60-106（菜单注释在 84-85，需补回）
- footer: 738-821
- preloader: 22-26
- 全局 CSS 引用: 10-19
- 全局 JS 引用: 826-837

- [ ] **Step 3.1: 创建 nav.json（含补回入口）**

Create `src/data/nav.json`:
```json
[
  { "label": "扑扑鹰首页", "href": "/", "key": "home" },
  { "label": "GEO优化(AI SEO)", "href": null, "key": "geo", "children": [
    { "label": "GEO优化介绍", "href": "/geo", "key": "geo-intro" },
    { "label": "GEO服务支持", "href": "/geoservice", "key": "geoservice" }
  ]},
  { "label": "服务案例", "href": "/cases", "key": "cases" },
  { "label": "GEO排名查询", "href": "/rank", "key": "rank" },
  { "label": "关于扑扑鹰", "href": "/about", "key": "about" },
  { "label": "GEO干货资讯", "href": "/news", "key": "news" }
]
```

- [ ] **Step 3.2: 创建 site.json（站点联系信息）**

Create `src/data/site.json`:
```json
{
  "name": "扑扑鹰",
  "tagline": "专业领先的GEO(AI SEO)优化服务商",
  "email": "geo@ppypaper.com",
  "phone": "13397166330",
  "topLinks": [
    { "label": "关于我们", "href": "/about" },
    { "label": "常见问题", "href": "/faqs" },
    { "label": "服务支持", "href": "/geoservice" },
    { "label": "团队介绍", "href": "/team" }
  ]
}
```

- [ ] **Step 3.3: 创建 Preloader 组件**

Create `src/components/Preloader.astro`:
```astro
---
// 组件: Preloader
// 职责: 页面加载动画遮罩
// 依赖: /assets/picture/loader.png
---
<div class="preloader">
  <div class="loader">
    <img src="/assets/picture/loader.png" alt="扑扑鹰" />
  </div>
</div>
<div class="offcanvas__overlay"></div>
```

- [ ] **Step 3.4: 创建 Nav 组件**

Create `src/components/Nav.astro`:
```astro
---
// 组件: Nav
// 职责: 主菜单渲染，支持二级下拉，当前项高亮
// 依赖: src/data/nav.json
// Props: activeNav (string) - 当前高亮菜单 key
import nav from '../data/nav.json';
const { activeNav = '' } = Astro.props;
---
<nav class="main-menu">
  <ul>
    {nav.map((item) => (
      <li class={`menu-item has-children${item.key === activeNav ? ' current-menu-item' : ''}`}>
        {item.href ? <a href={item.href} aria-current={item.key === activeNav ? 'page' : undefined}>{item.label}</a> : <a href="#">{item.label}</a>}
        {item.children && (
          <ul class="sub-menu">
            {item.children.map((child) => (
              <li><a href={child.href} aria-current={child.key === activeNav ? 'page' : undefined}>{child.label}</a></li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
</nav>
```

- [ ] **Step 3.5: 创建 Header 组件**

Create `src/components/Header.astro`:
```astro
---
// 组件: Header
// 职责: 顶部联系条 + 主菜单 + 移动端 toggler + CTA 按钮
// 依赖: src/data/site.json, src/components/Nav.astro
// Props: activeNav (string)
import site from '../data/site.json';
import Nav from './Nav.astro';
const { activeNav = '' } = Astro.props;
---
<header class="header-area header-one">
  <div class="header-top">
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-7">
          <div class="top-left">
            <span><span>{site.name}</span>，{site.tagline}</span>
            <span><i class="fas fa-envelope"></i><a href={`mailto:${site.email}`}>{site.email}</a></span>
            <span><i class="fas fa-phone"></i>售前咨询：<a href={`tel:${site.phone}`}>{site.phone}</a></span>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="top-right">
            <ul class="top-nav-link">
              {site.topLinks.map((l) => <li><a href={l.href}>{l.label}</a></li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="header-navigation">
    <div class="nav-inner-menu">
      <div class="primary-menu">
        <div class="site-branding">
          <a href="/" class="brand-logo"><img src="/assets/picture/logo-main.png" alt="扑扑鹰" /></a>
        </div>
        <div class="sasly-nav-menu">
          <div class="sasly-menu-top d-flex justify-content-between d-block d-lg-none">
            <div class="site-branding">
              <a href="/" class="brand-logo"><img src="/assets/picture/logo-main.png" alt="扑扑鹰" /></a>
            </div>
            <div class="navbar-close"><i class="far fa-times"></i></div>
          </div>
          <Nav activeNav={activeNav} />
          <div class="sasly-nav-button mt-20 d-block d-md-none">
            <a href="/contact" class="theme-btn style-one">免费获取优化方案<i class="far fa-angle-double-right"></i></a>
          </div>
        </div>
        <div class="nav-right-item">
          <div class="nav-button d-none d-md-block">
            <a href="/contact" class="theme-btn style-one">免费获取优化方案<i class="far fa-angle-double-right"></i></a>
          </div>
          <div class="navbar-toggler"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>
  </div>
</header>
```

- [ ] **Step 3.6: 创建 Footer 组件**

读取 index.html 第 738-821 行获取真实 footer 内容，原样迁移，仅把内链 `xxx.html` 改为 `/xxx`。

Run（先读取）: 用 Read 工具读 `e:\geo\扑扑鹰\index.html` offset=738 limit=84。

Create `src/components/Footer.astro`（结构骨架，正文内容来自读到的 footer 原文）:
```astro
---
// 组件: Footer
// 职责: 页脚 - 公司信息/联系方式/友情链接/版权
// 依赖: src/data/site.json
import site from '../data/site.json';
---
<footer class="business-footer pt-100 primary-black-bg">
  <!-- 把 index.html 738-821 行内容原样粘贴，仅做以下替换： -->
  <!-- 1. about.html → /about, contact.html → /contact, news.html → /news, faqs.html → /faqs -->
  <!-- 2. geo.html → /geo, geoservice.html → /geoservice, team.html → /team -->
  <!-- 3. 案例列表.html → /cases（补回） -->
  <!-- 4. static/picture/ → /assets/picture/, static/image/ → /assets/image/ -->
  <!-- 5. 邮箱/电话用 {site.email}/{site.phone} 插值 -->
</footer>
```
（执行此步时把读到的 footer 原文填入注释下方，按上述 5 条规则替换。）

- [ ] **Step 3.7: 创建 global.css 与 theme.css 占位**

Create `src/styles/global.css`:
```css
/* === 扑扑鹰 global.css ===
   职责: reset + 全站通用变量/字体
   依赖: 无
   注: 框架样式由 vendor 提供，本文件仅放站点专属全局 */

/* === Reset / 基础 === */
body { margin: 0; }
img { max-width: 100%; height: auto; }
a { text-decoration: none; }
```

Create `src/styles/theme.css`:
```css
/* === 扑扑鹰 theme.css ===
   职责: 站点定制样式（由原 style-ppy.css / style-ppy1.css / common_style.css / common.css / style.css 合并去重）
   依赖: vendor CSS 已在 BaseLayout 全局加载
   注: v0.3.0 为占位空文件，内容迁移在 v0.4.0 首页迁移时按需从原文件搬运 */
```

- [ ] **Step 3.8: 创建 main.js（全站初始化）**

读取原 `static/js/common_script.js` 全文，把通用初始化逻辑（preloader 隐藏、navbar-toggler、菜单关闭、滚动动画 AOS init 等）迁移到 `src/scripts/main.js`，顶部写 JSDoc。

Create `src/scripts/main.js`（骨架）:
```javascript
/**
 * 扑扑鹰全站初始化脚本
 * @module main
 * @依赖 jquery, bootstrap, gsap/ScrollSmoother, aos
 * @导出 无（自动执行，由 BaseLayout 引入）
 * @来源 从原 static/js/common_script.js 迁移通用部分
 */
// 执行此步时：读 common_script.js，把其中 preloader/navbar/menu/aos 相关
// 初始化代码原样迁入，删除明显是页面特有的逻辑（页面特有逻辑归 pages/*.js）。
```

- [ ] **Step 3.9: 改造 BaseLayout 装载组件与全局资源**

Modify `src/layouts/BaseLayout.astro`（整体替换 v0.2.0 空壳）:
```astro
---
// 组件: BaseLayout
// 职责: 页面骨架，装载全局 CSS/JS + Preloader + Header + Footer
// 依赖: Preloader, Header, Footer, /vendor/css, /vendor/js, main.js
// Props: title/description/activeNav/bodyClass/pageStyle/pageScript
import Preloader from '../components/Preloader.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';
import '../styles/theme.css';
const {
  title = '扑扑鹰 GEO+SEO优化 - 全域AI搜索获客系统',
  description = '扑扑鹰 - 专业GEO+SEO搜索引擎优化服务，助品牌抢占AI搜索时代增量流量。',
  activeNav = '',
  bodyClass = 'business-home',
  pageStyle,
  pageScript,
} = Astro.props;
---
<!DOCTYPE html>
<html lang="zxx">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>{title}</title>
    <link rel="shortcut icon" href="/assets/images/favicon.png" type="image/png" />
    <!-- vendor CSS（保留原加载顺序） -->
    <link rel="stylesheet" href="/vendor/css/css2.css" />
    <link rel="stylesheet" href="/vendor/css/flaticon_sasly.css" />
    <link rel="stylesheet" href="/vendor/css/all.min.css" />
    <link rel="stylesheet" href="/vendor/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/vendor/css/slick.css" />
    <link rel="stylesheet" href="/vendor/css/magnific-popup.css" />
    <link rel="stylesheet" href="/vendor/css/aos.css" />
    {pageStyle && <link rel="stylesheet" href={pageStyle} />}
  </head>
  <body class={bodyClass}>
    <Preloader />
    <Header activeNav={activeNav} />
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <div class="line_wrap">
          <div class="line_item_one"></div>
          <div class="line_item"></div>
          <div class="line_item"></div>
          <div class="line_item"></div>
          <div class="line_item"></div>
        </div>
        <main><slot /></main>
        <Footer />
      </div>
    </div>
    <!-- vendor JS（保留原顺序，jQuery 先就绪） -->
    <script src="/vendor/js/jquery-3.7.1.min.js"></script>
    <script src="/vendor/js/popper.min.js"></script>
    <script src="/vendor/js/bootstrap.min.js"></script>
    <script src="/vendor/js/gsap.min.js"></script>
    <script src="/vendor/js/SplitText.min.js"></script>
    <script src="/vendor/js/ScrollSmoother.min.js"></script>
    <script src="/vendor/js/ScrollTrigger.min.js"></script>
    <script src="/vendor/js/slick.min.js"></script>
    <script src="/vendor/js/jquery.magnific-popup.min.js"></script>
    <script src="/vendor/js/aos.js"></script>
    <script>
      // 显式加载全站初始化（Astro 处理为模块）
      import '../scripts/main.js';
    </script>
    {pageScript && <script src={pageScript}></script>}
  </body>
</html>
```

- [ ] **Step 3.10: 临时首页验证头尾**

改 `src/pages/index.astro` 临时页为：
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout activeNav="home">
  <section style="padding:120px 20px;text-align:center">
    <h1>头尾组件就绪 (v0.3.0)</h1>
    <p>检查顶部联系条、主菜单（含补回的案例/排名入口）、页脚是否正常。</p>
  </section>
</BaseLayout>
```

- [ ] **Step 3.11: dev 验证**

Run: `npm run dev`
Expected: http://localhost:4321 显示顶部联系条（邮箱/电话）、主菜单含「服务案例」「GEO排名查询」两项（补回成功）、页脚完整、preloader 短暂出现后消失。菜单点击可跳转（目标页未建会 404，正常）。

- [ ] **Step 3.12: build 验证**

Run: `npm run build`
Expected: `Complete!` 零错误，`dist/` 生成。

- [ ] **Step 3.13: 更新 migration-log 组件抽取表**

把 BaseLayout/Preloader/Header/Nav/Footer 五项打 `[x]`，版本填 v0.3.0。

- [ ] **Step 3.14: 更新 CHANGELOG + 提交 + tag**

CHANGELOG 顶部插入 v0.3.0 段（Added: nav.json/site.json/Preloader/Nav/Header/Footer/BaseLayout改造/global.css/theme.css占位/main.js）。

Run:
```
git add src docs/migration-log.md CHANGELOG.md
git commit -m "feat(layout): v0.3.0 头尾组件化 + 补回案例/排名菜单入口 + main.js初始化"
git tag v0.3.0
```

---

## Task 4: 首页迁移 (v0.4.0)

**Files:**
- Modify: `src/pages/index.astro`（替换临时页）
- Create: `src/styles/pages/home.css`
- Create: `src/scripts/pages/home.js`
- Create: `src/components/CTASection.astro`
- Modify: `src/styles/theme.css`（从原 style-ppy/common_style/common/style 合并首页所需样式）

**源参考:** index.html 第 118-737 行（main 内所有 section）

- [ ] **Step 4.1: 创建 CTASection 通用组件**

读取 index.html 中"免费获取优化方案"CTA section（grep `免费获取优化方案` 定位），提取结构。

Create `src/components/CTASection.astro`:
```astro
---
// 组件: CTASection
// 职责: 通用"免费获取优化方案"行动号召区块
// 依赖: /assets/picture/cta1.jpg（或实际背景图）
// Props: title(string), desc(string)
const {
  title = '免费获取优化方案',
  desc = '留下需求，扑扑鹰团队 24h 内出具专属 GEO 优化方案',
} = Astro.props;
---
<section class="cta-banner bg_cover" style="background-image:url(/assets/picture/cta1.jpg)">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-8">
        <div class="cta-content">
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
      </div>
      <div class="col-lg-4 text-lg-right">
        <a href="/contact" class="theme-btn style-one">立即咨询<i class="far fa-angle-double-right"></i></a>
      </div>
    </div>
  </div>
</section>
```
（执行时按读到的真实 CTA 结构调整 class 与图片路径）

- [ ] **Step 4.2: 迁移首页 main 内容到 index.astro**

读取 index.html 第 118-737 行，把每个 `<section>` 原样迁入 `src/pages/index.astro` 的 `<BaseLayout><main>` slot，做以下替换：
1. `static/picture/` → `/assets/picture/`
2. `static/image/` → `/assets/image/`
3. 内链 `xxx.html` → `/xxx`
4. CTA section 替换为 `<CTASection />`（用 Step 4.1 组件）
5. 顶部加 `import CTASection from '../components/CTASection.astro';`
6. `<BaseLayout activeNav="home">`

- [ ] **Step 4.3: 迁移首页样式到 theme.css + home.css**

读取原 `static/css/style-ppy.css`、`style-ppy1.css`、`common_style.css`、`common.css`、`style.css`，把首页用到的样式规则合并到 `src/styles/theme.css`（通用部分）和 `src/styles/pages/home.css`（首页专属）。删除重复规则。

Create `src/styles/pages/home.css`:
```css
/* === 首页局部样式 === */
/* 从原 style-ppy.css 等搬运首页专属规则 */
```

- [ ] **Step 4.4: 迁移首页脚本到 home.js**

读取原 `static/js/theme5.js`（index.html 实际引用的是 theme5.js）+ `common_script.js` 中首页特有逻辑，迁到 `src/scripts/pages/home.js`，顶部写 JSDoc。

Create `src/scripts/pages/home.js`:
```javascript
/**
 * 首页脚本
 * @module pages/home
 * @依赖 jquery, gsap, ScrollSmoother, slick, aos
 * @来源 从原 static/js/theme5.js + common_script.js 首页部分迁移
 */
```

- [ ] **Step 4.5: 更新 index.astro 引用 home.css/home.js**

在 `src/pages/index.astro` 的 frontmatter 传 Props：
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import CTASection from '../components/CTASection.astro';
---
<BaseLayout activeNav="home" pageStyle="/src/styles/pages/home.css" pageScript="/src/scripts/pages/home.js">
  ...首页各 section...
</BaseLayout>
```
（注：Astro 中 pageStyle/pageScript 路径需用相对 import 或 public 路径；若用 import 语法则在 frontmatter import CSS，JS 用 `<script>` 标签。执行时按 Astro 实际机制调整 —— 推荐 CSS 用 `import '../styles/pages/home.css'`，JS 用 `<script>import '../scripts/pages/home.js'</script>`。）

- [ ] **Step 4.6: 核对 GSAP 授权（ADR 待决策项）**

检查 `public/vendor/js/ScrollSmoother.min.js` 文件头注释是否标注 GSAP Club 授权。若无授权，在 `docs/decisions.md` 追加 ADR-008 记录降级方案，并把 ScrollSmoother 调用改为 ScrollTrigger 实现。

- [ ] **Step 4.7: dev 视觉核对**

Run: `npm run dev`
打开 http://localhost:4321，与原 `index.html`（用浏览器打开原文件）逐屏对比：
- hero 区视觉/动画
- 服务卡片网格
- 案例展示
- 客户 logo 墙
- CTA 区
- 滚动动画（AOS/GSAP）
- 移动端响应式（devtools 375/768）

如有偏差，调整 theme.css/home.css 直到一致。

- [ ] **Step 4.8: build 验证**

Run: `npm run build`
Expected: 零错误，`dist/index.html` 生成。

- [ ] **Step 4.9: 更新 migration-log**

页面迁移表 index 行打 `[x]`；组件抽取表 CTASection 打 `[x]`；CSS/JS 表中 style.css/theme5.js/common_script.js 打勾并标注"已拆解"。

- [ ] **Step 4.10: CHANGELOG + 提交 + tag**

CHANGELOG 加 v0.4.0 段。Run:
```
git add src docs/migration-log.md CHANGELOG.md
git commit -m "feat(home): v0.4.0 首页迁移 + CTASection组件 + 首页样式/脚本分层"
git tag v0.4.0
```

---

## Task 5: GEO 介绍 + GEO 服务页 (v0.5.0)

**Files:**
- Create: `src/pages/geo.astro`
- Create: `src/pages/geoservice.astro`
- Create: `src/components/ServiceCard.astro`
- Create: `src/styles/pages/geo.css`
- Create: `src/styles/pages/geoservice.css`
- Create: `src/data/services.json`

**源参考:** geo.html、geoservice.html、服务.html（geoservice 与 服务.html 合并）

- [ ] **Step 5.1: 创建 services.json**

读取 geo.html / geoservice.html / 服务.html 中的服务卡片内容，结构化抽取。

Create `src/data/services.json`:
```json
[
  { "icon": "fa-xxx", "title": "...", "desc": "...", "href": "/geoservice#xxx" }
]
```
（执行时按真实卡片填充）

- [ ] **Step 5.2: 创建 ServiceCard 组件**

Create `src/components/ServiceCard.astro`:
```astro
---
// 组件: ServiceCard
// 职责: 服务卡片（图标+标题+描述+链接）
// 依赖: 无
// Props: icon(string), title(string), desc(string), href(string)
const { icon, title, desc, href } = Astro.props;
---
<div class="service-item">
  <div class="icon"><i class={`fas ${icon}`}></i></div>
  <h4><a href={href}>{title}</a></h4>
  <p>{desc}</p>
</div>
```
（执行时按原站卡片结构调整 class）

- [ ] **Step 5.3: 迁移 geo.astro**

读取 geo.html 全文，把 main 内容迁入 `src/pages/geo.astro`，规则同 Task 4（路径替换/内链改路由/CTA 用组件）。`<BaseLayout activeNav="geo-intro">`。抽取样式到 `src/styles/pages/geo.css`。

- [ ] **Step 5.4: 合并 geoservice.html + 服务.html → geoservice.astro**

读取两文件，对比内容（服务.html 可能是 geoservice 的旧版或补充），合并去重。迁入 `src/pages/geoservice.astro`，`<BaseLayout activeNav="geoservice">`。服务卡片用 `<ServiceCard>` 循环 `services.json` 渲染。样式抽到 `src/styles/pages/geoservice.css`。

- [ ] **Step 5.5: dev 视觉核对 + build 验证**

Run: `npm run dev`，核对 /geo 与 /geoservice 与原站一致。
Run: `npm run build`，零错误。

- [ ] **Step 5.6: 更新 migration-log + CHANGELOG + 提交 + tag**

migration-log 页面表 geo/geoservice/服务 三行打勾（服务.html 标注"已并入 geoservice"）；组件表 ServiceCard 打勾。
CHANGELOG 加 v0.5.0 段。
```
git add src docs/migration-log.md CHANGELOG.md
git commit -m "feat(geo): v0.5.0 GEO介绍+服务页迁移 + ServiceCard组件 + 合并服务.html"
git tag v0.5.0
```

---

## Task 6: 案例库补回 (v0.6.0)

**Files:**
- Create: `src/data/cases.json`
- Create: `src/components/CaseCard.astro`
- Create: `src/pages/cases/index.astro`
- Create: `src/pages/cases/[slug].astro`
- Create: `src/styles/pages/cases.css`
- Create: `src/scripts/pages/cases.js`

**源参考:** 案例列表.html、案例详情.html（作为视觉/结构参考，数据用 JSON 驱动）

- [ ] **Step 6.1: 创建 cases.json**

读取 案例列表.html / 案例详情.html，抽取案例数据。

Create `src/data/cases.json`:
```json
[
  {
    "slug": "case-1",
    "title": "...",
    "cover": "/assets/picture/case1.jpg",
    "summary": "...",
    "platform": "豆包",
    "date": "2026-08",
    "content": [
      { "type": "p", "text": "..." },
      { "type": "img", "src": "..." }
    ]
  }
]
```
（执行时按原站内容填充，至少 3-5 个案例）

- [ ] **Step 6.2: 创建 CaseCard 组件**

Create `src/components/CaseCard.astro`:
```astro
---
// 组件: CaseCard
// 职责: 案例卡片（封面+标题+摘要+平台+日期）
// Props: slug,title,cover,summary,platform,date
const { slug, title, cover, summary, platform, date } = Astro.props;
---
<a href={`/cases/${slug}`} class="case-card">
  <div class="thumb"><img src={cover} alt={title} /></div>
  <div class="content">
    <span class="platform">{platform}</span>
    <h4>{title}</h4>
    <p>{summary}</p>
    <span class="date">{date}</span>
  </div>
</a>
```

- [ ] **Step 6.3: 创建案例列表页**

Create `src/pages/cases/index.astro`:
```astro
---
// 页面: 案例列表
// 职责: 案例卡片墙 + 平台过滤
// 依赖: cases.json, CaseCard, BaseLayout
import BaseLayout from '../../layouts/BaseLayout.astro';
import CaseCard from '../../components/CaseCard.astro';
import cases from '../../data/cases.json';
const platforms = [...new Set(cases.map((c) => c.platform))];
---
<BaseLayout activeNav="cases" title="服务案例 - 扑扑鹰" pageStyle="/src/styles/pages/cases.css">
  <section class="case-list-area pt-120 pb-120">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <div class="section-title text-center mb-60">
            <h2>服务案例</h2>
          </div>
        </div>
      </div>
      <div class="case-filter mb-40 text-center">
        <button data-filter="all" class="active">全部</button>
        {platforms.map((p) => <button data-filter={p}>{p}</button>)}
      </div>
      <div class="row case-grid">
        {cases.map((c) => (
          <div class="col-lg-4 col-md-6 case-item" data-platform={c.platform}>
            <CaseCard {...c} />
          </div>
        ))}
      </div>
    </div>
  </section>
  <script>import '../../scripts/pages/cases.js';</script>
</BaseLayout>
```

- [ ] **Step 6.4: 创建案例详情动态路由**

Create `src/pages/cases/[slug].astro`:
```astro
---
// 页面: 案例详情（动态路由静态生成）
// 职责: 按 slug 生成每个案例详情页
// 依赖: cases.json, BaseLayout
import BaseLayout from '../../layouts/BaseLayout.astro';
import cases from '../../data/cases.json';
export function getStaticPaths() {
  if (!cases.length) return [];
  return cases.map((c) => ({ params: { slug: c.slug }, props: { case: c } }));
}
const { case: caseData } = Astro.props;
if (!caseData) {
  return <BaseLayout title="案例即将上线 - 扑扑鹰"><section class="pt-120 pb-120 text-center"><h1>案例即将上线</h1></section></BaseLayout>;
}
---
<BaseLayout activeNav="cases" title={`${caseData.title} - 扑扑鹰`} pageStyle="/src/styles/pages/cases.css">
  <section class="case-detail pt-120 pb-120">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <h1>{caseData.title}</h1>
          <div class="meta"><span>{caseData.platform}</span><span>{caseData.date}</span></div>
          {caseData.content.map((block) => (
            block.type === 'p' ? <p>{block.text}</p> : <img src={block.src} alt={caseData.title} />
          ))}
        </div>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 6.5: 创建 cases.js（过滤交互）**

Create `src/scripts/pages/cases.js`:
```javascript
/**
 * 案例列表过滤脚本
 * @module pages/cases
 * @依赖 jquery
 */
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.case-filter button');
  const items = document.querySelectorAll('.case-item');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach((item) => {
        const show = filter === 'all' || item.dataset.platform === filter;
        item.style.display = show ? '' : 'none';
      });
    });
  });
});
```

- [ ] **Step 6.6: dev/build 验证**

Run: `npm run dev`，访问 /cases（卡片墙+过滤）、点进 /cases/case-1（详情）。
Run: `npm run build`，零错误，`dist/cases/` 下生成 index.html + 每个案例目录。

- [ ] **Step 6.7: migration-log + CHANGELOG + 提交 + tag**

页面表 案例列表/案例详情 两行打勾（标注"补回，JSON驱动"）；组件表 CaseCard 打勾。
CHANGELOG 加 v0.6.0 段。
```
git add src docs/migration-log.md CHANGELOG.md
git commit -m "feat(cases): v0.6.0 补回案例库 - 列表+详情动态路由 + JSON驱动 + 平台过滤"
git tag v0.6.0
```

---

## Task 7: GEO 排名查询补回 (v0.7.0)

**Files:**
- Create: `src/pages/rank.astro`
- Create: `src/scripts/pages/rank.js`
- Create: `src/data/rank-mock.json`
- Create: `src/styles/pages/rank.css`

**说明:** 此页原站注释中无实体，为全新补建的前端 demo。

- [ ] **Step 7.1: 创建 mock 数据**

Create `src/data/rank-mock.json`:
```json
{
  "note": "演示数据，后端接口未接通",
  "results": [
    { "keyword": "GEO优化", "platform": "豆包", "rank": 1, "url": "example.com", "change": "+3" },
    { "keyword": "AI SEO", "platform": "DeepSeek", "rank": 2, "url": "example.com", "change": "+1" }
  ]
}
```

- [ ] **Step 7.2: 创建 rank.astro**

Create `src/pages/rank.astro`:
```astro
---
// 页面: GEO排名查询（补回，前端 demo）
// 职责: 关键词+平台表单，提交后展示 mock 排名结果
// 依赖: rank-mock.json, BaseLayout
import BaseLayout from '../layouts/BaseLayout.astro';
import mock from '../data/rank-mock.json';
---
<BaseLayout activeNav="rank" title="GEO排名查询 - 扑扑鹰" pageStyle="/src/styles/pages/rank.css">
  <section class="rank-page pt-120 pb-120">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="section-title text-center mb-60">
            <h2>GEO 排名查询</h2>
            <p>输入关键词，查询在主流 AI 搜索平台的排名表现</p>
          </div>
          <form id="rank-form" class="rank-form">
            <div class="form-group">
              <input type="text" id="rank-keyword" name="keyword" placeholder="输入关键词" required />
            </div>
            <div class="form-group">
              <select id="rank-platform" name="platform">
                <option value="all">全部平台</option>
                <option value="豆包">豆包</option>
                <option value="DeepSeek">DeepSeek</option>
                <option value="文心一言">文心一言</option>
              </select>
            </div>
            <button type="submit" class="theme-btn style-one">查询排名</button>
          </form>
          <div id="rank-result" class="rank-result mt-40" style="display:none">
            <p class="demo-note">* 演示数据，后端接口未接通</p>
            <table class="rank-table">
              <thead><tr><th>关键词</th><th>平台</th><th>排名</th><th>链接</th><th>变化</th></tr></thead>
              <tbody id="rank-tbody"></tbody>
            </table>
          </div>
          <!-- TODO(后端): 接通 /api/rank 接口后，删除 mock 引用与 demo-note -->
        </div>
      </div>
    </div>
  </section>
  <script is:inline define:vars={{ mock }}>
    import '../scripts/pages/rank.js';
  </script>
</BaseLayout>
```
（注：define:vars 把 mock 传给客户端脚本；执行时按 Astro 实际语法调整，或直接在 rank.js 里 fetch mock 文件）

- [ ] **Step 7.3: 创建 rank.js**

Create `src/scripts/pages/rank.js`:
```javascript
/**
 * GEO 排名查询表单交互
 * @module pages/rank
 * @依赖 无（纯原生 DOM）
 * @来源 新建（原站无此模块）
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rank-form');
  const keywordInput = document.getElementById('rank-keyword');
  const platformSelect = document.getElementById('rank-platform');
  const resultBox = document.getElementById('rank-result');
  const tbody = document.getElementById('rank-tbody');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const kw = keywordInput.value.trim();
    if (!kw) { alert('请输入关键词'); return; }
    const platform = platformSelect.value;

    // TODO(后端): 替换为真实接口 fetch('/api/rank?keyword=...&platform=...')
    const mock = await fetch('/src/data/rank-mock.json').then((r) => r.json());
    let rows = mock.results.filter((r) => r.keyword.includes(kw));
    if (platform !== 'all') rows = rows.filter((r) => r.platform === platform);

    tbody.innerHTML = rows.map((r) =>
      `<tr><td>${r.keyword}</td><td>${r.platform}</td><td>${r.rank}</td><td>${r.url}</td><td>${r.change}</td></tr>`
    ).join('');
    resultBox.style.display = 'block';
  });
});
```

- [ ] **Step 7.4: dev/build 验证**

Run: `npm run dev`，访问 /rank，输入"GEO"提交，看到表格+演示数据标注。
Run: `npm run build`，零错误。

- [ ] **Step 7.5: migration-log + CHANGELOG + 提交 + tag**

页面表 rank 行打勾（标注"补回，全新 demo"）。
CHANGELOG 加 v0.7.0 段。
```
git add src docs/migration-log.md CHANGELOG.md
git commit -m "feat(rank): v0.7.0 补回GEO排名查询 - 前端demo + mock数据 + 后端接口占位"
git tag v0.7.0
```

---

## Task 8: 其余页面迁移 (v0.8.0)

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/team.astro`
- Create: `src/pages/contact.astro`
- Create: `src/pages/faqs.astro`
- Create: `src/pages/news.astro`
- Create: `src/pages/news/[slug].astro`
- Create: `src/pages/materials.astro`
- Create: `src/pages/404.astro`
- Create: `src/data/news.json`
- Create: `src/scripts/pages/contact.js`（从 ajax-contact.js 迁移）
- Create: 各页对应 `src/styles/pages/*.css`

**源参考:** about.html, team.html, contact.html, faqs.html, news.html, news-art.html, 素材.html, 404.html

- [ ] **Step 8.1: about.astro**

读取 about.html，迁入 `src/pages/about.astro`，`<BaseLayout activeNav="about">`，规则同前。抽样式到 `src/styles/pages/about.css`。

- [ ] **Step 8.2: team.astro**

读取 team.html，迁入，`<BaseLayout activeNav="home">`（团队不在主菜单高亮，用 home 或空）。样式到 `team.css`。

- [ ] **Step 8.3: contact.astro + contact.js**

读取 contact.html + `static/js/ajax-contact.js`，迁入。表单提交脚本迁到 `src/scripts/pages/contact.js`，顶部 JSDoc。`<BaseLayout activeNav="home">`。

- [ ] **Step 8.4: faqs.astro**

读取 faqs.html，迁入。`<BaseLayout activeNav="home">`。

- [ ] **Step 8.5: news.astro + news/[slug].astro + news.json**

读取 news.html + news-art.html，结构化抽取资讯列表到 `src/data/news.json`。列表页 `src/pages/news.astro` 用 JSON 渲染卡片墙；详情页 `src/pages/news/[slug].astro` 用 getStaticPaths 生成。`<BaseLayout activeNav="news">`。

- [ ] **Step 8.6: materials.astro**

读取 素材.html，迁入 `src/pages/materials.astro`（英文路由）。`<BaseLayout activeNav="home">`。

- [ ] **Step 8.7: 404.astro**

读取 404.html，迁入 `src/pages/404.astro`，保留原 404 视觉。

- [ ] **Step 8.8: dev 逐页核对 + build 验证**

Run: `npm run dev`，逐页访问 /about /team /contact /faqs /news /news/xxx /materials /404，与原站对比。
Run: `npm run build`，零错误，`dist/` 下所有页生成。

- [ ] **Step 8.9: migration-log + CHANGELOG + 提交 + tag**

页面表剩余 8 行打勾。CHANGELOG 加 v0.8.0 段。
```
git add src docs/migration-log.md CHANGELOG.md
git commit -m "feat(pages): v0.8.0 迁移about/team/contact/faqs/news/materials/404 + 资讯动态路由"
git tag v0.8.0
```

---

## Task 9: 收尾校验 (v0.9.0)

**Files:**
- Create: `legacy/`（移入原 14 HTML + static/）
- Create: `docs/qa-report.md`
- Modify: 删除已确认无引用的 style1-5.css / theme1-5.js / default.css

- [ ] **Step 9.1: 删除冗余 CSS/JS（先验证无引用）**

全局搜索（用 Grep 工具）`src/` 与 `public/` 下是否还引用 `style1.css`~`style5.css`、`theme1.js`~`theme5.js`、`default.css`。若无引用：
Run:
```
Remove-Item static/css/style1.css,static/css/style2.css,static/css/style3.css,static/css/style4.css,static/css/style5.css,static/css/default.css
Remove-Item static/js/theme1.js,static/js/theme2.js,static/js/theme3.js,static/js/theme4.js,static/js/theme5.js
```
migration-log 对应行打勾。CHANGELOG 记 `refactor(css/js): 删除无引用的 style1-5/theme1-5/default`。

- [ ] **Step 9.2: 移原站到 legacy/**

Run:
```powershell
New-Item -ItemType Directory -Force legacy
Move-Item *.html legacy/ -Force
Move-Item static legacy/ -Force
Move-Item assets legacy/ -Force
```
（注：保留 legacy/ 作为对照，不删；v1.0 验收后再决定）

- [ ] **Step 9.3: 安装死链检查工具并扫描**

Run:
```
npm install -D linkinator
npx linkinator dist/ --recurse --silent > docs/qa-report.md
```
Expected: 报告中无 broken link。若有，修正后重扫。

- [ ] **Step 9.4: build 最终验证**

Run:
```
npm run build
```
Expected: 零错误零警告。

- [ ] **Step 9.5: 响应式核对**

`npm run preview`，devtools 三档（375/768/1280）目测关键页：首页/案例列表/排名/资讯。

- [ ] **Step 9.6: migration-log 已验证页面表全部打勾 + CHANGELOG + 提交 + tag**

CHANGELOG 加 v0.9.0 段（含 qa-report 链接）。
```
git add -A
git commit -m "chore(qa): v0.9.0 收尾 - 删除冗余CSS/JS + 移原站到legacy + 死链检查通过"
git tag v0.9.0
```

---

## Task 10: 上线候选 (v1.0.0)

**Files:**
- Create: `src/data/site.json` 已有，补充完整 SEO meta
- Modify: `astro.config.mjs`（加 sitemap 集成）
- Modify: 各页 frontmatter 补 `title`/`description`
- Modify: 文档定稿（README/CHANGELOG/decisions/migration-log）

- [ ] **Step 10.1: 安装 sitemap 集成**

Run:
```
npm install @astrojs/sitemap
```
Modify `astro.config.mjs`:
```javascript
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://www.ppypaper.com',
  output: 'static',
  integrations: [sitemap()],
});
```

- [ ] **Step 10.2: 核对各页 meta title/description**

逐页检查 frontmatter 传给 BaseLayout 的 `title`/`description` 是否完整且含关键词。

- [ ] **Step 10.3: build + 死链最终验证**

Run:
```
npm run build
npx linkinator dist/ --recurse --silent
```
Expected: 零错误，`dist/sitemap-index.xml` 生成。

- [ ] **Step 10.4: 文档定稿**

- README.md：更新版本表为最终状态
- CHANGELOG.md：加 v1.0.0 段（总结上线候选状态）
- docs/decisions.md：把"待决策项"（ScrollSmoother/MDX）更新为最终决策
- docs/migration-log.md：确认所有表 100% 打勾

- [ ] **Step 10.5: 提交 + tag v1.0.0**

```
git add -A
git commit -m "release: v1.0.0 上线候选 - sitemap + SEO meta + 文档定稿"
git tag v1.0.0
```

---

## Self-Review

**1. Spec coverage:**
- 8 章设计 → Task 1-10 全覆盖
- 16 页面（14+2）→ Task 4(1) + 5(2) + 6(2) + 7(1) + 8(8) = 14，加 404 共 15... 核对：index/geo/geoservice/cases-list/cases-detail/rank/about/team/contact/faqs/news/news-art/materials/404 = 14 原页 + rank 补回 = 15。spec 说"16 个页面（原 14 + 补回 2）"——案例列表+案例详情算 2 页补回，rank 算 1 页补回，共补回 3 页？实际 spec 表述为"14+2=16"，但案例列表/详情原本就有 HTML（注释中的菜单项指向它们），rank 是全新。重新核对 spec：补回的是"服务案例库"（含列表+详情）和"GEO排名查询"两个一级入口，案例库本身算 1 个补回入口但含 2 页，rank 算 1 页。故总页数 = 14 + rank(1) = 15，或按入口算 14+2=16。计划已覆盖全部页面，无遗漏。
- CSS 21 项 → Task 2 + Task 9 全覆盖
- JS 25 项 → Task 2 + Task 9 全覆盖
- 组件 8 个 → Task 1(BaseLayout) + 3(Preloader/Header/Nav/Footer) + 4(CTASection) + 5(ServiceCard) + 6(CaseCard) = 8，全覆盖
- 版本 v0.1→v1.0 → Task 1-10 对应 v0.2→v1.0，v0.1 已在构思阶段完成

**2. Placeholder scan:**
- 各组件/页面代码骨架完整，"执行时填充"处均有明确数据来源说明（读取哪个原文件）
- 无 TBD/TODO（rank.js 中的 TODO 是给后端的合理占位，spec 已规定 mock）
- 无"add appropriate error handling"类空话

**3. Type consistency:**
- nav.json 的 key 字段在 Nav/Header/各页 activeNav 一致（home/geo-intro/geoservice/cases/rank/about/news）
- BaseLayout Props 在各页调用一致（title/activeNav/pageStyle/pageScript）
- CaseCard Props 与 cases.json 字段一致（slug/title/cover/summary/platform/date）
- ServiceCard Props 与 services.json 一致（icon/title/desc/href）

无问题，计划可执行。
