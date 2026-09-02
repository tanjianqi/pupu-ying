# 变更日志

本文件记录扑扑鹰网站所有版本变更，遵循 [Keep a Changelog](https://keepachangelog.com/) 风格，版本号遵循 [SemVer](https://semver.org/)。

每个阶段结束打对应 git tag，阶段内变更以 Conventional Commits 提交。

---

## [v1.2.1] - 2026-09-02

### 阶段：API 文档完善 + rank 数据源可插拔

### Added
- **docs/api.md**：完整 API 端点文档
  - GET /api/rank：请求/响应/字段说明 + curl 示例
  - POST /api/contact：5 种响应场景 + 邮件内容格式 + curl 示例
  - 环境变量配置表 + 腾讯企业邮客户端专用密码生成步骤
  - 部署说明（构建产物结构 + standalone 启动 + 环境变量注入）
  - 本地开发与测试指南 + 降级模式说明
  - 后续扩展点清单

### Changed
- **README.md**：技术栈补充 Astro 5+/node adapter/nodemailer；快速开始添加 .env 配置；目录结构加 api/ 与 docs/api.md；版本阶段映射扩展到 v1.2.0；文档列表补 api.md + qa-report.md
- **src/pages/api/rank.ts**：数据源抽象为 loadRankData() 可插拔函数
  - 当前读 rank-mock.json，后续接真实数据源仅替换 loadRankData 实现
  - 新增 RankRow 类型定义
  - 新增数据源加载失败 503 响应
  - GET 改为 async 以兼容异步数据源
- **package.json**：1.2.0 → 1.2.1

### Build
- npm run build 通过，23 静态页面 + 服务端 entrypoints

---

## [v1.2.0] - 2026-09-02

### 阶段：腾讯企业邮 SMTP 接入（第 4 章续）

### Added
- **nodemailer 依赖**：生产依赖 nodemailer + 开发依赖 @types/nodemailer
- **dotenv 依赖**：用于在 preview/standalone 模式加载 .env 环境变量
- **.env.example 模板**：腾讯企业邮 SMTP 配置模板（SMTP_HOST/PORT/SECURE/USER/PASS/FROM_NAME/MAIL_TO）
  - 腾讯企业邮默认：smtp.exmail.qq.com:465（SSL），需生成「客户端专用密码」
- **contact.ts 邮件发送逻辑**：
  - nodemailer.createTransport 创建 SMTP 连接池（单例复用）
  - 邮件内容：纯文本 + HTML 双版本（HTML 表格排版，含 mailto/tel 链接）
  - replyTo 设为提交者邮箱，方便直接回复
  - 邮件主题格式：`[官网咨询] {品牌} - {姓名}`
  - 凭证不完整时自动降级为「校验通过未发信」模式（sent:false）

### Changed
- **src/pages/api/contact.ts**：v1.1.0 仅校验 → v1.2.0 接入 nodemailer 真实发送
  - 顶部 `import 'dotenv/config'` 加载 .env
  - getTransporter() 单例管理 SMTP 连接
  - sendMail 发送 + try/catch 错误处理
  - SMTP 失败返回 500 + 服务器日志 console.error（不暴露内部错误给前端）

### Security
- .env 已在 .gitignore 中排除，凭证不进入版本控制
- SMTP 失败响应不暴露内部错误细节，仅返回通用提示 + geo@ppypaper.com 备选联系方式
- 邮件 HTML 内容经 escapeHtml 转义防注入

### Build & Test
- npm run build 通过，23 静态页面 + 服务端 entrypoints
- 三种场景实测：
  - 无 .env 凭证 → 200, sent:false（开发模式降级）✓
  - 假凭证 SMTP 认证失败 → 500, "邮件发送异常"（错误处理）✓
  - 服务器日志正确记录 `535 Error: authentication failed` ✓

### 部署说明
- 部署时复制 .env.example 为 .env 并填入腾讯企业邮凭证：
  - SMTP_USER：发件邮箱（如 system@ppypaper.com）
  - SMTP_PASS：腾讯企业邮后台生成的「客户端专用密码」（非登录密码）
- 生产环境也可用系统环境变量注入（无需 .env 文件）
- MAIL_TO 默认 geo@ppypaper.com，可按需修改

---

## [v1.1.0] - 2026-09-02

### 阶段：后端 API 接通（第 4 章）

### Added
- **@astrojs/node 适配器**：astro.config.mjs 集成 standalone 模式，启用服务端渲染能力
- **src/pages/api/rank.ts**：GET /api/rank 端点
  - 接收 keyword + platform 查询参数，返回品牌在 AI 搜索平台的排名表现
  - 参数校验（keyword 必填，platform=全部 时不限平台）
  - 当前读取 src/data/rank-mock.json 演示数据
- **src/pages/api/contact.ts**：POST /api/contact 端点
  - 接收联系表单 JSON（name/email/brand/phone/message）
  - 字段校验（name/brand/email/phone 必填 + 邮箱格式校验）
  - 当前仅返回成功响应，未发送真实邮件（TODO: 接入邮件服务）

### Changed
- **src/scripts/pages/rank.js**：v0.7.0 硬编码 mock → v1.1.0 fetch /api/rank
  - 新增 loading 状态（查询中... + spinner）
  - 新增 try/catch 错误处理 + 表格内显示失败信息
  - 使用 URLSearchParams 构造查询字符串
- **src/scripts/pages/contact.js**：v0.8.0 mock 成功 → v1.1.0 fetch /api/contact
  - 新增 loading 状态（提交中... + spinner）
  - fetch POST + JSON payload，.then 链式处理成功/失败
  - 网络异常兜底提示
- **src/pages/rank.astro**：更新注释反映 v1.1.0 状态，移除 TODO 标记
- **astro.config.mjs**：添加 node adapter，移除已废弃的 output:'hybrid'（Astro 5+ 默认 static + 按需 SSR）
- **package.json**：1.0.1 → 1.1.0，新增 @astrojs/node 依赖

### Build & Test
- npm run build 通过，23 个静态页面 + 服务端 entrypoints 构建
- API 端点实测（preview 服务器）：
  - GET /api/rank?keyword=GEO优化&platform=全部 → 200, count=2 ✓
  - GET /api/rank?platform=豆包（缺 keyword） → 400, "缺少必填参数 keyword" ✓
  - GET /api/rank?keyword=AI SEO&platform=DeepSeek → 200, count=1 ✓
  - POST /api/contact（合法 JSON） → 200, "提交成功" ✓
  - POST /api/contact（缺 brand/phone） → 400, "缺少必填字段：brand, phone" ✓
  - POST /api/contact（邮箱格式错） → 400, "邮箱格式不正确" ✓
  - POST /api/contact（非合法 JSON） → 400, "请求体不是合法 JSON" ✓

### 部署说明
- node adapter standalone 模式构建产物在 dist/server/，可转 serverless 部署
- 邮件发送功能待接入（Resend/SendGrid/SMTP），当前 /api/contact 仅校验不入库不发信

---

## [v1.0.1] - 2026-09-02

### 阶段：已知遗留修复

### Fixed
- **theme.css 12 个 url() WARN 全部消除**：
  - 6 个存在图片（v_01/02/13/25/27/banner-home-bg3）+ 1 字体（DOUYUFont-Regular）从 legacy/static/ 复制到 public/assets/{image,font}/
  - 5 个原站缺失图片（v_26/29/30/31/35）创建 1x1 透明 PNG 占位
  - theme.css 15 处 `url('../image/` / `url('../font/` 统一改为 `url('/assets/image/` / `url('/assets/font/` 绝对路径

### Removed (ADR-008 执行)
- public/vendor/js/ScrollSmoother.min.js（GSAP Club 付费插件，未授权）
- BaseLayout.astro 中 ScrollSmoother.min.js script 加载
- main.js 中 `gsap.registerPlugin(..., ScrollSmoother)` 与 `ScrollSmoother.create(...)` 调用

### Changed
- theme.css 顶部添加 `html { scroll-behavior: smooth; }` 替代 ScrollSmoother 平滑滚动
- main.js 依赖注释移除 ScrollSmoother
- docs/decisions.md ADR-008 状态从「已采纳」改为「已执行」

### Build
- npm run build 通过，**0 WARN**（v1.0.0 时 12 个 WARN 全部消除）
- linkinator: 128 links, 0 broken
- package.json 1.0.0 → 1.0.1

### 残留状态
- 已知遗留全部清零，项目可正式部署

---

## [v1.0.0] - 2026-09-02

### 阶段：上线候选

### Added
- @astrojs/sitemap 集成（astro.config.mjs integrations）
- dist/sitemap-index.xml + sitemap-0.xml（构建产物，含 23 个页面 URL）
- 10 个关键页面 + 2 个动态路由详情页的 meta description（含关键词）
- ADR-008 ScrollSmoother 授权与降级决策
- ADR-009 资讯/案例正文格式保持 JSON 决策

### Changed
- README.md 移除 v0.1.0 阶段注释
- docs/decisions.md 待决策项转为 ADR-008/009 最终决策
- docs/migration-log.md 全部表 100% 打勾（CSS 21/21、JS 25/25、组件 8/8、页面 14/14）

### Build
- npm run build 通过，23 页面 + sitemap 生成
- linkinator 死链检查：129 links, 0 broken
- package.json 0.9.0 → 1.0.0

### 上线候选状态
- 全部 10 个阶段任务完成（v0.2.0 脚手架 → v1.0.0 上线候选）
- 23 个静态页面生成，0 死链
- sitemap.xml 就绪，SEO meta 完整
- 原站已移至 legacy/ 保留对照
- 已知遗留：theme.css 部分 url() WARN（非阻塞），ScrollSmoother 授权待确认（ADR-008）

---

## [v0.9.0] - 2026-09-02

### 阶段：收尾校验

### Deleted
- static/css/style1.css, style2.css, style3.css, style4.css, style5.css, default.css（确认无引用，style4/5 已有 public/vendor/css 副本）
- static/js/theme1.js, theme2.js, theme3.js, theme4.js, theme5.js（已合并到 src/scripts/）

### Moved
- 原 14 个 HTML（index/contact/404/news/news-art/team/about/faqs/geoservice/geo/素材/案例详情/案例列表/服务）→ legacy/
- 原 static/ → legacy/static/（第三方框架资源原文件，对照保留）
- 原 assets/ → legacy/assets/（原站共用图片/字体）

### Fixed
- favicon 404：原站无 favicon 文件，创建 SVG favicon（public/assets/images/favicon.svg），BaseLayout 改用 image/svg+xml
- /news?cat=xxx 死链：news.astro 分类链接改为 /news + data-cat 属性，客户端过滤
- /services 死链：geo.astro / geoservice.astro 中 2 处误链修正为 /contact

### Added
- docs/qa-report.md（linkinator 死链检查报告，129 links 0 broken）
- public/assets/images/favicon.svg（SVG favicon，深色背景 + 绿色 P 字母）
- linkinator devDependency

### Build
- npm run build 通过，23 页面静态生成
- linkinator 死链检查：129 links scanned, 0 broken

---

## [v0.8.0] - 2026-09-02

### 阶段：其余页面迁移（about / team / contact / faqs / news / materials / 404）

### Added
- src/pages/about.astro（关于扑扑鹰，迁移自 about.html）
- src/pages/team.astro（团队介绍，8 位成员数据驱动渲染）
- src/pages/contact.astro（联系我们，含表单字段重命名 name/email/brand/phone/message）
- src/scripts/pages/contact.js（原生 DOM 表单校验 + 邮箱格式 + mock 成功反馈）
- src/pages/faqs.astro（常见问题，3 分类 tab + accordion，JS 数据驱动）
- src/pages/news.astro（GEO 干货资讯列表，news.json 驱动 + 分类过滤）
- src/scripts/pages/news.js（原生 DOM 分类过滤交互）
- src/pages/news/[slug].astro（资讯详情动态路由，getStaticPaths 静态生成 6 篇）
- src/pages/materials.astro（设计素材参考页，保留原 Fintech 模板全部 section）
- src/pages/404.astro（404 错误页，保留原 error-page 文案与视觉）
- public/vendor/css/style4.css（Fintech 专属样式，materials.astro 通过 pageStyle 载入）
- public/vendor/css/style5.css（error-page 样式，404.astro 通过 pageStyle 载入）

### Changed
- migration-log: 7 个 v0.8.0 页面 + ajax-contact.js 打勾
- package.json version: 0.2.0 → 0.8.0
- 修复 about.astro 第 195 行 `<span class="font-200">` 未闭合标签
- 修复 news.astro 第 89 行 import 路径多写一级 `../`（应为 `../scripts/pages/news.js`）
- materials/404 页面 bodyClass 与 pageStyle 通过 BaseLayout Props 注入

### Build
- `npm run build` 通过，23 个页面静态生成（含 5 案例详情 + 6 资讯详情）
- 已知遗留 WARN：theme.css 内非首页 selector 的相对 url() 引用（v0.9.0 处理）

---

## [v0.7.0] - 2026-09-01

### 阶段：GEO 排名查询补回

### Added
- src/pages/rank.astro（GEO 排名查询页，关键词 + 平台表单）
- src/scripts/pages/rank.js（表单校验 + mock 数据渲染查询结果表格）
- src/data/rank-mock.json（演示用 mock 排名数据）

### Notes
- 前端 demo，结果来自硬编码 mock；后端 /api/rank 接口未接通，页面带 demo-note 标注

---

## [v0.6.0] - 2026-09-01

### 阶段：案例库补回

### Added
- src/data/cases.json（5 个案例，覆盖豆包/DeepSeek/文心一言/通义千问/Kimi）
- src/components/CaseCard.astro（Props: slug/title/cover/summary/platform/date）
- src/pages/cases/index.astro（案例列表卡片墙 + 平台过滤）
- src/pages/cases/[slug].astro（动态路由静态生成 5 个详情页）
- src/scripts/pages/cases.js（纯原生 DOM 平台过滤交互）

---

## [v0.5.0] - 2026-09-01

### 阶段：GEO 介绍 + 服务页

### Added
- src/data/services.json（3 条服务卡片数据）
- src/components/ServiceCard.astro（Props: icon/title/desc/href，set:html 支持富文本 desc）
- src/pages/geo.astro（GEO 介绍页，保留原站卡片 HTML 以保真）
- src/pages/geoservice.astro（GEO 服务页，以 geoservice.html 为主）
- src/scripts/pages/geo.js（theme4.js 迁移，本页无 select/slider 为占位）
- src/scripts/pages/geoservice.js（同上）

### Changed
- 服务.html 为英文模板，与 geoservice.html 完全不同，未合并
- geo/geoservice 均无 select/jquery-ui 控件，nice-select/jquery-ui 未按需加载（避免无效资源）
- migration-log: geo/geoservice/服务 三行 + ServiceCard + theme4.js 打勾

---

## [v0.4.0] - 2026-09-01

### 阶段：首页迁移

### Added
- src/components/CTASection.astro（通用 CTA 区块组件，Props: title/desc）
- src/pages/index.astro 首页正式迁移（5 个 section：hero/what-we/about/core-features/blogs + CTA）
- src/styles/theme.css 填充（5 个原 CSS 合并去重，约 10644 行）
- src/styles/pages/home.css（首页专属样式，约 269 行）
- src/scripts/pages/home.js（从 theme5.js 迁移首页脚本）

### Changed
- 删除 3 个注释 section（case-study-sb / testimonial-sb / key-features-sb）
- 路径全替换：static/picture/ → /assets/picture/，static/image/ → /assets/image/
- 内链全替换：xxx.html → /xxx
- migration-log: index 页面/CTASection/5个CSS/common_script.js/theme5.js 打勾

### Known Issues
- theme.css 中非首页 selector 的相对 url() 引起 Vite WARN，不影响首页渲染，v0.5.0+ 处理

---

## [v0.3.0] - 2026-09-01

### 阶段：布局组件

### Added
- src/data/nav.json（含补回的「服务案例」「GEO排名查询」菜单入口）
- src/data/site.json（公司信息/联系方式/topLinks）
- src/components/Preloader.astro
- src/components/Nav.astro（消费 nav.json，支持二级下拉 + 当前项高亮）
- src/components/Header.astro（顶部联系条 + 主菜单 + CTA + 移动端 toggler）
- src/components/Footer.astro（公司信息/联系方式/订阅/版权）
- src/styles/global.css（reset + 基础）
- src/styles/theme.css（占位，v0.4.0 填充）
- src/scripts/main.js（从 common_script.js 迁移全站初始化：菜单/preloader/offcanvas/magnific/gsap/aos）

### Changed
- BaseLayout.astro 改造：装载 vendor CSS/JS + Preloader + Header + Footer + main.js
- vendor script 标签加 is:inline（Astro 要求引用 public/ 资源需此指令）
- 首页临时改为头尾验证页

### Fixed
- vendor JS 引用 public/ 报错 → 全部加 is:inline 修复

---

## [v0.2.0] - 2026-09-01

### 阶段：Astro 脚手架

### Added
- npm init + 安装 astro（package.json name=pupu-ying，因 npm 拒绝中文目录名）
- astro.config.mjs（site=https://www.ppypaper.com，static 输出）
- package.json scripts（dev/build/preview/astro）
- src/layouts/BaseLayout.astro 空壳（Props 接口定义齐全）
- src/pages/index.astro 临时首页

### Changed
- README.md 移除 v0.1.0 阶段注释

---

## [v0.1.0] - 2026-09-01

### 阶段：基线

将扑扑鹰现站（原同事交接的 14 个静态 HTML + static/ 资源）纳入 git 版本控制，建立工程化基线。

### Added
- 初始化 git 仓库（`git init`）
- 新增 `.gitignore`（排除 node_modules / dist / .superpowers / backup / 模板 / 系统文件）
- 新增 `README.md` 项目说明（技术栈/启动/目录/版本规则）
- 新增 `CHANGELOG.md` 变更日志
- 新增 `docs/migration-log.md` 迁移进度表
- 新增 `docs/decisions.md` 决策记录（ADR）
- 新增设计文档 `docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md`

### 现状快照
- 根目录 14 个 HTML：index / about / geo / geoservice / 服务 / 案例列表 / 案例详情 / news / news-art / team / contact / faqs / 素材 / 404
- `static/` 下 css(21) / js(25) / font / image / picture / webfonts / file
- `assets/images/` 产品/特性/Logo 图
- `backup/` 已归档（.gitignore 排除）
- `模板/` 参考模板（.gitignore 排除）

### 已知遗留
- index.html 中「服务案例」「GEO排名查询」两个一级菜单项处于注释状态，将在 v0.6.0 / v0.7.0 补回
- 多套 CSS/JS 并存（style1-5 / theme1-5 模板残留），将在迁移期清理

---

## 后续阶段（规划中）

- [v0.2.0] Astro 脚手架
- [v0.3.0] 布局组件
- [v0.4.0] 首页迁移
- [v0.5.0] GEO/服务页
- [v0.6.0] 案例库（补回）
- [v0.7.0] 排名查询（补回）
- [v0.8.0] 资讯/团队/关于/其他
- [v0.9.0] 收尾校验
- [v1.0.0] 上线候选
