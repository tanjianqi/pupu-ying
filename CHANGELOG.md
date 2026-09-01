# 变更日志

本文件记录扑扑鹰网站所有版本变更，遵循 [Keep a Changelog](https://keepachangelog.com/) 风格，版本号遵循 [SemVer](https://semver.org/)。

每个阶段结束打对应 git tag，阶段内变更以 Conventional Commits 提交。

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
