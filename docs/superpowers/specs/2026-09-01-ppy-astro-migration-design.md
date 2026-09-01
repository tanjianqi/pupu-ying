# 扑扑鹰网站 Astro 迁移设计文档

- **版本**: v0.1.0 (设计稿)
- **日期**: 2026-09-01
- **状态**: 待审核
- **作者**: 协作产出（用户 + 助手）

---

## 1. 背景与目标

### 1.1 项目现状

扑扑鹰是 GEO+SEO 优化服务商的官方营销站点，纯静态多页 HTML 站点。

- **页面规模**: 根目录 14 个静态 HTML（index / about / geo / geoservice / 服务 / 案例列表 / 案例详情 / news / news-art / team / contact / faqs / 素材 / 404）
- **技术栈**: Bootstrap 5 + jQuery 3.7 + GSAP/ScrollSmoother + Slick + AOS + Magnific Popup，纯静态无构建工具
- **定制资源**: `static/css/` 下 21 个 CSS，`static/js/` 下 25 个 JS，多套并存（style-ppy.css / style-ppy1.css / common_style.css / default.css / style1-5.css；theme.js / theme1-5.js 等）
- **工程化缺失**: 未 git init；无 README / CHANGELOG / 版本号；无构建/打包；backup/ 已归档；模板/ 为参考模板
- **遗留问题**: index.html 中「服务案例」「GEO排名查询」两个一级菜单项处于注释状态

### 1.2 构建目标

升级技术栈：将现有静态站点迁移到 **Astro** 静态站点生成器，引入构建工具链路与组件化开发模式，同时补回被注释掉的核心业务入口。

### 1.3 成功标准

1. `npm run build` 产出纯静态 `dist/`，零错误
2. 16 个页面（原 14 + 补回 2）全部可访问，视觉与原站一致或更优
3. `git log` 可见完整阶段化提交历史，每个版本有 tag
4. CHANGELOG.md 记录所有版本变更
5. 头尾/卡片组件化，无 14 页复制粘贴
6. 死链检查通过

### 1.4 YAGNI 边界（明确不做）

- 不做 i18n 多语言
- 不做 CMS 后台
- 不做 SSR/Edge Functions（纯静态）
- 不引入 TypeScript（除非后续交互复杂化）
- 不做 E2E 自动化测试（静态站人工核对足够）

---

## 2. 工程规范与版本策略

### 2.1 版本号（SemVer 严格 + 阶段化节奏）

- 初始基线 `v0.1.0` = git init + 现站快照（原 14 页原样纳入，作为回溯锚点）
- 此后每完成一个"大操作/阶段"升一档：`v0.2.0 / v0.3.0 ...`，PATCH 用于阶段内 bug 修复
- 阶段映射：v0.1 基线 → v0.2 Astro 脚手架 → v0.3 布局组件 → v0.4 首页 → v0.5 GEO/服务页 → v0.6 案例库(补回) → v0.7 排名查询(补回) → v0.8 资讯/团队/关于 → v0.9 收尾与校验 → v1.0 上线候选

### 2.2 Git 提交（Conventional Commits）

- 前缀：`feat / fix / refactor / chore / docs / style / test`
- 粒度：按"可独立验证的成果"一次提交，例 `feat(header): 抽公共头组件并补回案例/排名入口`
- 每个阶段结束打 git tag，tag 名与版本号一致
- 仅本地仓库，不强制远端

### 2.3 文档骨架

```
README.md                 项目说明/启动命令/目录/版本规则
CHANGELOG.md              按版本分组变更
docs/
├─ superpowers/specs/
│  └─ 2026-09-01-ppy-astro-migration-design.md   本设计文档
├─ migration-log.md       迁移进度表(页/CSS/JS 逐项打勾)
└─ decisions.md           关键决策记录(ADR 风格)
```

### 2.4 代码注释规范（硬约束②落地）

- 每个 `.astro` 组件顶部写职责注释：`<!-- 组件: Header | 职责: 顶部联系条+主菜单 | 依赖: nav.json -->`
- 每个 JS 模块顶部写 JSDoc 块：用途、依赖、导出
- CSS 关键区块用块注释分隔（如 `/* === 头部 === */`）
- 目录级加 README 或文件头注释说明该目录职责

---

## 3. 目标目录结构与构建链路

### 3.1 目标目录结构（Astro 项目）

```
扑扑鹰/
├─ public/                    # 不经构建处理的静态资源
│  ├─ vendor/                 # 第三方框架 JS/CSS（原样保留）
│  │  ├─ css/                 # bootstrap/slick/aos/magnific/nice-select/jquery-ui/animatedheadline
│  │  └─ js/                  # jquery/bootstrap/gsap+ScrollSmoother/slick/aos/magnific/isotope/imagesloaded/nice-select
│  ├─ assets/                 # 图片/字体
│  │  ├─ images/              # 原 assets/images + static/picture 合并去重
│  │  ├─ image/               # static/image 原样保留（被多处引用）
│  │  └─ font/                # static/font + webfonts
│  └─ favicon.png
├─ src/
│  ├─ layouts/
│  │  └─ BaseLayout.astro     # <html><head>骨架+全局CSS+preloader+Header+slot+Footer+全局JS
│  ├─ components/
│  │  ├─ Header.astro         # 顶部联系条+主菜单（消费 nav.json）
│  │  ├─ Footer.astro
│  │  ├─ Nav.astro            # 主菜单渲染（has-children 支持二级）
│  │  ├─ ServiceCard.astro    # 服务卡片复用
│  │  ├─ CaseCard.astro       # 案例卡片（补回模块用）
│  │  ├─ CTASection.astro     # "免费获取优化方案"通用CTA
│  │  └─ Preloader.astro
│  ├─ data/
│  │  ├─ nav.json             # 导航数据（含补回的案例/排名入口）
│  │  ├─ cases.json           # 案例数据（驱动案例列表/详情）
│  │  └─ services.json        # 服务数据
│  ├─ pages/
│  │  ├─ index.astro          # 首页
│  │  ├─ about.astro          # 关于（合并 about.html）
│  │  ├─ geo.astro            # GEO优化介绍
│  │  ├─ geoservice.astro     # GEO服务支持（原 geoservice.html + 服务.html 合并）
│  │  ├─ cases/               # 补回：服务案例
│  │  │  ├─ index.astro       # 案例列表
│  │  │  └─ [slug].astro      # 案例详情（动态路由）
│  │  ├─ rank.astro           # 补回：GEO排名查询（前端表单 demo）
│  │  ├─ news.astro           # 资讯列表（原 news.html）
│  │  ├─ news/[slug].astro    # 资讯详情（原 news-art.html）
│  │  ├─ team.astro
│  │  ├─ contact.astro
│  │  ├─ faqs.astro
│  │  ├─ materials.astro      # 素材.html → 英文路由
│  │  └─ 404.astro
│  ├─ scripts/
│  │  ├─ main.js              # 全站初始化（preloader/menu-toggle/滚动动画）
│  │  └─ pages/               # 页面级脚本
│  │     ├─ home.js
│  │     ├─ geo.js
│  │     └─ rank.js           # 排名查询表单交互
│  └─ styles/
│     ├─ global.css           # reset + 全站通用变量/字体
│     ├─ theme.css            # 由 style-ppy/style-ppy1/common_style 合并去重
│     └─ pages/               # 页面局部样式
│        ├─ home.css
│        ├─ geo.css
│        └─ ...
├─ docs/                      # 见 2.3 文档骨架
├─ astro.config.mjs           # Astro 配置（site/integrations）
├─ package.json               # 依赖 + scripts（dev/build/preview）
├─ .gitignore                 # 含 node_modules/ dist/ .superpowers/
└─ README.md
```

### 3.2 构建链路

- 包管理：npm
- 依赖：`astro`（核心），可选 `@astrojs/sitemap`（SEO 服务商必备）、`@astrojs/mdx`（资讯/案例用 MDX 写内容）、`@astrojs/compress`（CSS/JS 压缩）
- 脚本：
  - `npm run dev` → `astro dev`（默认 http://localhost:4321）
  - `npm run build` → `astro build` → 产物到 `dist/`（纯静态 HTML/CSS/JS）
  - `npm run preview` → `astro preview` 预览构建产物
- 旧文件处置：迁移完成后，原根目录 14 个 HTML 与 static/ 移入 `legacy/` 子目录作为对照，不删；待 v1.0 验收后再决定是否清理

### 3.3 关键设计取舍

- 路由：案例/资讯详情用动态路由 `[slug].astro`，内容由 `cases.json` / MDX 驱动，避免每个案例一个 HTML
- 模板/ 目录（参考模板）保留不动，不纳入构建
- backup/ 已归档，加入 .gitignore 避免误提交
- 补回的 `cases/` 与 `rank.astro` 对应确认的 B 方案
- `materials.astro`（原 素材.html）保留，因属业务页

---

## 4. 组件设计与数据流

### 4.1 BaseLayout.astro（页面骨架）

- 职责：输出 `<html>`/`<head>`/`<body>`，装载全局 CSS、preloader、Header、`<slot>`、Footer、全局 JS
- Props：`title`、`description`、`activeNav`（高亮当前菜单）、`bodyClass`、`pageStyle`（局部 CSS 路径）、`pageScript`（局部 JS 路径）
- 渲染顺序：preloader → Header → main(slot) → Footer → 全局 main.js → 可选 pageScript

### 4.2 Header.astro

- 消费 `nav.json`，渲染顶部联系条 + 主菜单
- 二级菜单支持：`has-children` 字段触发下拉
- 移动端：navbar-toggler 触发 offcanvas 菜单（沿用原交互逻辑，迁到 `main.js`）
- `activeNav` 与当前页匹配则加 `current-menu-item` 类

### 4.3 nav.json 结构（含补回入口）

```json
[
  { "label": "扑扑鹰首页", "href": "/" },
  { "label": "GEO优化(AI SEO)", "href": null, "children": [
    { "label": "GEO优化介绍", "href": "/geo" },
    { "label": "GEO服务支持", "href": "/geoservice" }
  ]},
  { "label": "服务案例", "href": "/cases" },
  { "label": "GEO排名查询", "href": "/rank" },
  { "label": "关于扑扑鹰", "href": "/about" },
  { "label": "GEO干货资讯", "href": "/news" }
]
```

### 4.4 Footer.astro

- 静态内容（公司信息/联系方式/友情链接）直接写在组件内
- 联系方式若需多处复用，抽 `src/data/site.json`（email/phone/地址）

### 4.5 ServiceCard.astro / CaseCard.astro

- Props 驱动渲染，无内部状态
- ServiceCard：`{ icon, title, desc, href }`
- CaseCard：`{ slug, title, cover, summary, platform, date }`

### 4.6 CTASection.astro

- 通用"免费获取优化方案"区块，全站复用，Props：`title`、`desc`（可选覆盖默认）

### 4.7 数据流

```
src/data/*.json  ──(build 时 import)──>  .astro 组件  ──>  静态 HTML
                                            ↑
                              pages/[slug].astro 用 getStaticPaths()
                              从 cases.json 生成所有案例详情页
```

- 全部构建期生成静态 HTML，无运行时数据获取
- 资讯/案例正文可用 MDX 文件（`src/content/` + Content Collections）替代纯 JSON，便于运营写长文 —— 默认先用 JSON，v1.0 前按需切 MDX

### 4.8 补回模块的具体形态

- `cases/index.astro`：卡片墙，`cases.json` 驱动，支持按平台过滤（前端 JS）
- `cases/[slug].astro`：`getStaticPaths()` 生成每个案例详情，正文从 JSON 字段渲染
- `rank.astro`：前端表单（关键词/平台选择），提交后用本地 mock 数据展示排名结果 demo；标注"演示数据"，后端接口预留注释占位

### 4.9 组件依赖关系

```
BaseLayout
  ├─ Preloader
  ├─ Header → Nav（消费 nav.json）
  └─ Footer
pages/*
  └─ <BaseLayout> 包裹
       └─ 各页内组合 ServiceCard / CaseCard / CTASection
```

### 4.10 注释规范落地

每个组件顶部：

```astro
---
// 组件: Header
// 职责: 顶部联系条 + 主菜单
// 依赖: src/data/nav.json, src/data/site.json
// Props: activeNav(string) - 当前高亮菜单 key
---
```

---

## 5. CSS 与 JS 迁移清单

### 5.1 CSS 处置清单（21 → 分层整合）

| 文件 | 处置 | 去向 |
|---|---|---|
| bootstrap.min.css | 保留 vendor | public/vendor/css/ |
| slick.css | 保留 vendor | public/vendor/css/ |
| aos.css | 保留 vendor | public/vendor/css/ |
| magnific-popup.css | 保留 vendor | public/vendor/css/ |
| nice-select.css | 保留 vendor | public/vendor/css/ |
| jquery-ui.min.css | 保留 vendor | public/vendor/css/ |
| jquery.animatedheadline.css | 保留 vendor | public/vendor/css/ |
| all.min.css (FontAwesome) | 保留 vendor | public/vendor/css/ |
| flaticon_sasly.css | 保留 vendor | public/vendor/css/ |
| css2.css (Google Fonts) | 保留 vendor | public/vendor/css/ |
| style-ppy.css / style-ppy1.css / common_style.css / common.css | **合并去重** → theme.css | src/styles/theme.css |
| default.css | 验证引用：多数页面未引 → 删除（迁移期记录） | 删除 |
| style.css | index 引用，多为模板默认样式 → 合并到 theme.css 后删除原文件 | 合并后删除 |
| style1.css ~ style5.css | 对应 theme1-5.js 的模板残留，验证无业务引用 → 删除 | 删除 |

迁移期每删一个文件，在 `docs/migration-log.md` 打勾记录，CHANGELOG 记一条 `refactor(css): 删除无引用的 style1-5.css`。

### 5.2 JS 处置清单（25 → 分层模块化）

| 文件 | 处置 | 去向 |
|---|---|---|
| jquery-3.7.1.min.js | 保留 vendor | public/vendor/js/ |
| bootstrap.min.js / popper.min.js | 保留 vendor | public/vendor/js/ |
| gsap.min.js / ScrollSmoother.min.js / ScrollTrigger.min.js / SplitText.min.js | 保留 vendor | public/vendor/js/ |
| slick.min.js | 保留 vendor | public/vendor/js/ |
| aos.js | 保留 vendor | public/vendor/js/ |
| jquery.magnific-popup.min.js | 保留 vendor | public/vendor/js/ |
| jquery.nice-select.min.js | 保留 vendor | public/vendor/js/ |
| isotope.min.js / imagesloaded.min.js | 保留 vendor | public/vendor/js/ |
| jquery-ui.min.js | 保留 vendor | public/vendor/js/ |
| jquery.animatedheadline.js | 保留 vendor | public/vendor/js/ |
| common_script.js | 拆解：通用初始化 → main.js，其余按页归位 | src/scripts/ |
| theme.js | 拆解到 pages/*.js，删除原文件 | 删除 |
| theme1-5.js | 模板残留，验证无引用 → 删除 | 删除 |
| ajax-contact.js | 迁到 src/scripts/contact.js | src/scripts/pages/ |

### 5.3 vendor JS 加载策略

- jQuery/Bootstrap/GSAP/AOS/Slick 通过 BaseLayout 全局加载（保留原顺序）
- 页面特有库（isotope/nice-select/magnific）在对应 page 的 `<script>` 内按需 import
- 主菜单/预loader/滚动动画初始化逻辑 → `src/scripts/main.js`，由 BaseLayout 用 Astro `<script>` 标签引入

---

## 6. 执行阶段

| 版本 | 阶段 | 产出 | 验收标准 |
|---|---|---|---|
| v0.1.0 | 基线 | git init + 现站快照 + .gitignore + README 骨架 + CHANGELOG 初始化 | `git log` 可见首次提交，14 页可访问 |
| v0.2.0 | Astro 脚手架 | npm init + 装 astro + astro.config + BaseLayout 空壳 + dev 跑通 | `npm run dev` 能打开空白首页 |
| v0.3.0 | 布局组件 | Header/Footer/Nav/Preloader + nav.json(含补回入口) + main.js | 所有页共用头尾，菜单可点 |
| v0.4.0 | 首页迁移 | index.astro + home.css + home.js + vendor 资产就位 | 首页视觉与原站一致 |
| v0.5.0 | GEO/服务页 | geo.astro + geoservice.astro + 合并 服务.html | 两页视觉一致，CSS 完成第一轮去重 |
| v0.6.0 | 案例库(补回) | cases/index + cases/[slug] + cases.json + CaseCard | 案例列表可访问，详情动态生成 |
| v0.7.0 | 排名查询(补回) | rank.astro + rank.js + mock 数据 | 表单可提交，展示 demo 结果 |
| v0.8.0 | 资讯/团队/关于/其他 | news + news/[slug] + team + about + contact + faqs + materials + 404 | 全部 14+2 页就绪 |
| v0.9.0 | 收尾校验 | 全站 build 通过 + 死链检查 + 响应式核对 + 删除 legacy 对照 | `npm run build` 零错误，产物可 preview |
| v1.0.0 | 上线候选 | 文档定稿 + sitemap + meta/SEO 完善 + tag | 可部署 |

每阶段结束：CHANGELOG 写一条 `## [v0.x.0] - 日期` + 变更摘要；`git tag v0.x.0`；`docs/migration-log.md` 更新进度表；阶段内多次 conventional commits。

---

## 7. 错误处理、测试、风险

### 7.1 错误处理

- 构建期错误（Astro 编译/模板）：`npm run dev` 热更新即时暴露，必须修到零错误才进入下一阶段
- 数据缺失：`cases.json` / `nav.json` 字段缺失时，组件用 `??` 默认值兜底，避免整页白屏；案例 `[slug].astro` 的 `getStaticPaths()` 若数据为空，回退渲染"案例即将上线"占位
- 404：`src/pages/404.astro` 统一处理，保留原站 404 视觉
- 排名查询表单：前端校验关键词非空，空提交给提示不发包；后端接口未接通时返回 mock 数据并明确标注"演示数据"
- 静态资源 404：迁移期逐页核对 `assets/images` 与 `static/picture` 引用，`docs/migration-log.md` 维护"已验证页面"清单

### 7.2 测试策略（轻量，匹配静态站）

- 不引入单元测试框架（YAGNI）
- 每阶段验收靠人工核对：`npm run preview` 打开每页，对照原站视觉/交互
- v0.9.0 收尾阶段加两项自动化检查：
  - `npm run build` 零错误零警告
  - 死链检查：用 `linkinator`（或 `broken-link-checker`）扫 `dist/`，输出报告
- 响应式：devtools 三档（375/768/1280）目测，关键页（首页/案例/排名）必查

### 7.3 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| style1-5.css / theme1-5.js 误删导致样式/交互丢失 | 中 | 删除前全局搜索引用，迁移期保留 `legacy/` 对照，发现问题可回退 git tag |
| Bootstrap/jQuery 全局加载与 Astro `<script>` 模块加载顺序冲突 | 中 | 框架库放 BaseLayout 底部传统 `<script src>`，业务脚本用 Astro `<script>` 模块，确保 jQuery 先就绪 |
| ScrollSmoother 为付费插件（GSAP Club）| 高 | 核对授权，若无授权则降级为免费 ScrollTrigger 实现平滑滚动，在 decisions.md 记录决策 |
| 案例详情动态路由静态生成失败 | 低 | `getStaticPaths()` 返回空数组时回退占位页，build 不中断 |
| 原 static/image 与 static/picture 命名混淆导致引用断裂 | 中 | 迁移期不重命名，原样保留目录；仅在新组件中统一用 `/assets/` 前缀，旧引用保持兼容 |
| backup/ 误提交 git | 低 | .gitignore 显式排除 backup/ 与 模板/ |

---

## 8. 决策记录

关键决策记录见 `docs/decisions.md`，本次设计阶段已确立的决策：

1. **技术栈**: 选 Astro（静态优先 + 组件化，契合 SEO 服务商定位）
2. **迁移范围**: 14 页 + 补回注释模块（服务案例库 + GEO 排名查询）
3. **CSS 策略**: 分层整合（vendor / theme / pages），删除模板残留 style1-5
4. **JS 策略**: 头尾组件化 + JS 分层模块化，删除 theme1-5
5. **版本策略**: SemVer 严格 + 阶段化节奏，Conventional Commits，每阶段 git tag
6. **包管理**: npm
7. **不做**: i18n / CMS / SSR / TypeScript / E2E（YAGNI）
