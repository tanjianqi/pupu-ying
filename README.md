# 扑扑鹰 · GEO+SEO 优化服务商官网

> 本项目为扑扑鹰官方网站，技术栈升级为 [Astro](https://astro.build/) 静态站点生成器。
> 迁移设计文档见 [`docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md`](docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md)。

## 技术栈

- **框架**: Astro 5+（静态优先 + 按需服务端渲染，`@astrojs/node` standalone 适配器）
- **样式**: Bootstrap 5 + 定制 theme.css（由原 style-ppy/common_style 合并去重）
- **交互**: jQuery 3.7 + GSAP/ScrollTrigger/SplitText + Slick + AOS（保留为 vendor）
- **后端**: Astro API Routes（/api/rank + /api/contact）+ nodemailer（腾讯企业邮 SMTP）
- **包管理**: npm

## 快速开始

```bash
npm install      # 安装依赖
cp .env.example .env   # 复制环境变量模板（按需填 SMTP 凭证）
npm run dev      # 开发服务器 http://localhost:4321
npm run build    # 构建到 dist/（client 静态 + server entry.mjs）
npm run preview  # 预览构建产物
```

> 邮件功能（/api/contact）需在 `.env` 填入腾讯企业邮 SMTP 凭证后才能真实发信；凭证为空时自动降级为「校验通过未发信」模式。

## 生产部署

```bash
npm run deploy   # 一键部署（安装+构建+PM2 启动）
npm run start    # 启动 PM2 进程
npm run stop     # 停止 PM2 进程
npm run restart  # 重启 PM2 进程
npm run logs     # 查看实时日志
npm run status   # 查看进程状态
```

详细部署流程见 [docs/deployment.md](docs/deployment.md)（PM2 + Nginx 反代 + Let's Encrypt SSL）。

## 目录结构

```
扑扑鹰/
├─ public/          # 静态资源（vendor 框架 + 图片字体）
├─ src/
│  ├─ layouts/      # 页面布局
│  ├─ components/   # 复用组件
│  ├─ data/         # 导航/案例/服务/排名数据（JSON）
│  ├─ pages/        # 路由页面（.astro）+ api/（服务端端点 .ts）
│  ├─ scripts/      # 业务脚本（main.js + pages/）
│  └─ styles/       # global.css + theme.css + pages/
├─ deploy/          # 部署脚本与配置
│  ├─ deploy.sh     # 一键部署脚本
│  └─ nginx.conf    # Nginx 反代配置示例
├─ docs/            # 项目文档
│  ├─ superpowers/  # spec + plans
│  ├─ api.md        # API 端点文档
│  ├─ deployment.md # 部署指南
│  ├─ migration-log.md  # 迁移进度表
│  ├─ decisions.md  # 决策记录(ADR)
│  └─ qa-report.md  # 死链检查报告
├─ legacy/          # 迁移期保留的原站对照
├─ ecosystem.config.cjs  # PM2 进程配置
├─ .env.example     # 环境变量模板
├─ astro.config.mjs # Astro 配置（site + adapter + sitemap）
└─ package.json
```

## 版本规范

- **版本号**: SemVer 严格 + 阶段化节奏（`v0.1.0` 基线 → `v1.3.0` 生产部署就绪）
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
| v0.7.0 | 排名查询（补回，前端 mock） |
| v0.8.0 | 资讯/团队/关于/其他 |
| v0.9.0 | 收尾校验 |
| v1.0.0 | 上线候选（sitemap + SEO meta） |
| v1.0.1 | 已知遗留修复（0 WARN + ScrollSmoother 删除） |
| v1.1.0 | 后端 API 接通（/api/rank + /api/contact + node adapter） |
| v1.2.0 | 腾讯企业邮 SMTP 接入（nodemailer 真实发信） |
| v1.2.1 | API 文档完善 + rank 数据源可插拔 |
| v1.3.0 | 生产部署配置（PM2 + Nginx + 一键部署脚本） |

## 代码规范

- 每个 `.astro` 组件顶部写职责注释（组件名/职责/依赖/Props）
- 每个 JS 模块顶部写 JSDoc 块（用途/依赖/导出）
- 每个 API 端点（.ts）顶部写 @module / @职责 / @方法 / @环境变量
- CSS 关键区块用块注释分隔
- 目录级用 README 或文件头注释说明职责

## 文档

- [设计文档](docs/superpowers/specs/2026-09-01-ppy-astro-migration-design.md)
- [API 端点文档](docs/api.md)
- [部署指南](docs/deployment.md)
- [变更日志](CHANGELOG.md)
- [迁移进度表](docs/migration-log.md)
- [决策记录](docs/decisions.md)
- [QA 报告](docs/qa-report.md)
