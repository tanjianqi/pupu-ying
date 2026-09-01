# 扑扑鹰 · GEO+SEO 优化服务商官网

> 本项目为扑扑鹰官方网站，技术栈升级为 [Astro](https://astro.build/) 静态站点生成器。
> 迁移设计文档见 [`docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md`](docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md)。

## 技术栈

- **框架**: Astro（静态站点生成器，Islands 架构）
- **样式**: Bootstrap 5 + 定制 theme.css（由原 style-ppy/common_style 合并去重）
- **交互**: jQuery 3.7 + GSAP/ScrollSmoother + Slick + AOS（保留为 vendor）
- **包管理**: npm

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 开发服务器 http://localhost:4321
npm run build    # 构建到 dist/（纯静态）
npm run preview  # 预览构建产物
```

## 目录结构

```
扑扑鹰/
├─ public/          # 静态资源（vendor 框架 + 图片字体）
├─ src/
│  ├─ layouts/      # 页面布局
│  ├─ components/   # 复用组件
│  ├─ data/         # 导航/案例/服务数据（JSON）
│  ├─ pages/        # 路由页面（.astro）
│  ├─ scripts/      # 业务脚本（main.js + pages/）
│  └─ styles/       # global.css + theme.css + pages/
├─ docs/            # 项目文档
│  ├─ superpowers/specs/   # 设计文档
│  ├─ migration-log.md     # 迁移进度表
│  └─ decisions.md         # 决策记录(ADR)
├─ legacy/          # 迁移期保留的原站对照（v1.0 前不删）
├─ astro.config.mjs
└─ package.json
```

> v0.1.0 阶段 `src/` `public/` 尚未建立，当前为原站 14 个 HTML + static/ 结构。

## 版本规范

- **版本号**: SemVer 严格 + 阶段化节奏（`v0.1.0` 基线 → `v1.0.0` 上线候选）
- **提交**: Conventional Commits（`feat / fix / refactor / chore / docs / style / test`）
- **Tag**: 每个阶段结束打 git tag，与版本号一致
- **变更日志**: 见 [CHANGELOG.md](CHANGELOG.md)

阶段映射：

| 版本 | 阶段 |
|---|---|
| v0.1.0 | 基线（git init + 现站快照） |
| v0.2.0 | Astro 脚手架 |
| v0.3.0 | 布局组件 |
| v0.4.0 | 首页迁移 |
| v0.5.0 | GEO/服务页 |
| v0.6.0 | 案例库（补回） |
| v0.7.0 | 排名查询（补回） |
| v0.8.0 | 资讯/团队/关于/其他 |
| v0.9.0 | 收尾校验 |
| v1.0.0 | 上线候选 |

## 代码规范

- 每个 `.astro` 组件顶部写职责注释（组件名/职责/依赖/Props）
- 每个 JS 模块顶部写 JSDoc 块（用途/依赖/导出）
- CSS 关键区块用块注释分隔
- 目录级用 README 或文件头注释说明职责

## 文档

- [设计文档](docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md)
- [变更日志](CHANGELOG.md)
- [迁移进度表](docs/migration-log.md)
- [决策记录](docs/decisions.md)
