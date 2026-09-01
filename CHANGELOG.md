# 变更日志

本文件记录扑扑鹰网站所有版本变更，遵循 [Keep a Changelog](https://keepachangelog.com/) 风格，版本号遵循 [SemVer](https://semver.org/)。

每个阶段结束打对应 git tag，阶段内变更以 Conventional Commits 提交。

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
