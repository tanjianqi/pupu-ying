# 决策记录（ADR）

> 记录扑扑鹰网站迁移过程中的关键架构决策。每条决策含背景、决策、理由、后果。
> 风格参考 ADR（Architecture Decision Record）。

---

## ADR-001 · 技术栈选 Astro

- **状态**: 已采纳（2026-09-01）
- **背景**: 扑扑鹰原为 14 页静态 HTML + Bootstrap/jQuery/GSAP，无构建工具、无组件化、多套 CSS/JS 混乱。需升级技术栈以提升可维护性。
- **决策**: 选用 Astro 静态站点生成器。
- **备选**:
  - Vite + 原生 HTML（MPA）：迁移最快但无组件系统，头尾仍复制粘贴
  - Vite + Vue 3：组件化最强但 SPA 对 SEO 不利，过度工程化
- **理由**: 扑扑鹰自身是 GEO/SEO 服务商，站点 SEO 必须硬；Astro 静态优先 + 组件化最契合，又能保留现有 Bootstrap/jQuery/GSAP 投入，迁移成本与长期收益平衡最佳。
- **后果**:
  - 正面：产物纯静态 HTML，SEO 极佳；组件复用消除复制粘贴；零 JS 默认输出性能高
  - 负面：需把 HTML 拆成 .astro 组件，有迁移成本；团队需熟悉 Astro 语法

---

## ADR-002 · 迁移范围 14 页 + 补回注释模块

- **状态**: 已采纳（2026-09-01）
- **背景**: index.html 中「服务案例」「GEO排名查询」两个一级菜单项处于注释状态，作为 GEO 服务商的核心叙事缺失。
- **决策**: 迁移现有 14 页基础上，补齐这两个一级入口为真实可用页面。
- **理由**: 补回模块正好盘活 GEO 服务商的核心叙事，工作量可控，迁移路径仍是 1:1，风险低。
- **后果**:
  - 正面：案例库（数据驱动卡片墙）+ 排名查询（前端 demo）补全业务闭环
  - 负面：v0.6.0/v0.7.0 额外两个阶段

---

## ADR-003 · CSS 分层整合

- **状态**: 已采纳（2026-09-01）
- **背景**: static/css/ 下 21 个 CSS 多套并存，含模板残留 style1-5。
- **决策**: 分三层处理：vendor（框架原样）/ theme（定制合并去重为 theme.css）/ pages（页面局部）。
- **理由**: 立即消除多套并存与死代码，又不陷入重写设计系统的泥潭。
- **后果**:
  - 正面：CSS 结构清晰，死代码清理
  - 负面：合并去重需逐文件核对引用，迁移期需谨慎

---

## ADR-004 · JS 头尾组件化 + 分层模块化

- **状态**: 已采纳（2026-09-01）
- **背景**: static/js/ 下 25 个 JS，含模板残留 theme1-5，无模块化，头尾在 14 页复制粘贴。
- **决策**: 头尾抽 Astro 组件；框架 JS 迁 vendor 全局加载；主题脚本拆解到 pages/*.js；通用初始化归 main.js；删除 theme1-5。
- **理由**: 头尾组件化是 Astro 最大收益点必须做；JS 分层 + 删冗余立即提升可维护性，不陷入重写。
- **后果**:
  - 正面：头尾复用、JS 可控、死代码清理
  - 负面：拆解 theme*.js 需理解原有逻辑

---

## ADR-005 · 版本策略：SemVer + 阶段化 + Conventional Commits

- **状态**: 已采纳（2026-09-01）
- **背景**: 用户硬约束：每次大操作版本号变化、改动写进文档、实时 git 提交全程可回溯。
- **决策**: SemVer 严格版本号（v0.1.0→v1.0.0），阶段化节奏（每阶段升 MINOR），Conventional Commits 前缀，每阶段打 git tag，CHANGELOG 按版本分组。
- **理由**: SemVer 严格满足版本号规范；阶段化对应迁移项目节奏；Conventional Commits + tag 满足可回溯；CHANGELOG 满足改动写进文档。
- **后果**:
  - 正面：完整可回溯的提交历史，每个版本有锚点
  - 负面：提交粒度需自律，不能随意堆砌

---

## ADR-006 · 包管理用 npm

- **状态**: 已采纳（2026-09-01）
- **背景**: 需选定包管理器。
- **决策**: 用 npm。
- **理由**: 无需 monorepo/复杂特性，npm 最通用，团队上手零成本。
- **后果**: 无 pnpm 的磁盘节省，但对单项目无影响。

---

## ADR-007 · YAGNI 边界

- **状态**: 已采纳（2026-09-01）
- **背景**: 静态营销站，避免过度工程化。
- **决策**: 明确不做 i18n / CMS / SSR / TypeScript / E2E 自动化测试。
- **理由**: 当前需求是迁移 + 补回模块，上述能力均非必需；后续交互复杂化时再评估。
- **后果**: 保持项目精简，聚焦迁移目标。

---

## ADR-008 · ScrollSmoother 授权与降级决策

- **状态**: 已执行（2026-09-02，v1.0.1 删除未授权 vendor 文件）
- **背景**: `public/vendor/js/ScrollSmoother.min.js` 为 GSAP Club 付费插件，需核对授权。v0.4.0 首页迁移时已加载该文件。
- **决策**: v1.0.1 删除 ScrollSmoother.min.js vendor 文件与所有 API 调用，改用原生 CSS `scroll-behavior: smooth` 实现平滑滚动。SplitText + ScrollTrigger 保留（GSAP 免费插件）。
- **执行**: 删除 public/vendor/js/ScrollSmoother.min.js；BaseLayout 移除 script 加载；main.js 移除 registerPlugin 与 ScrollSmoother.create 调用；theme.css 添加 `html { scroll-behavior: smooth; }`。
- **后果**: 全站滚动平滑改由浏览器原生实现，无授权风险。视觉上略有差异（无 GSAP 增强缓动），但功能完整。

---

## ADR-009 · 资讯/案例正文格式保持 JSON

- **状态**: 已采纳（2026-09-02，v1.0.0 定稿）
- **背景**: 资讯（news.json）与案例（cases.json）正文当前用 JSON 数组结构（content blocks: type=p/img）。
- **决策**: v1.0.0 保持 JSON 驱动，不引入 MDX / Content Collections。
- **理由**: 当前 5 案例 + 6 资讯体量小，JSON 编辑足够；引入 MDX 增加构建复杂度与团队学习成本，YAGNI。
- **后果**: 后续内容规模增长或需富文本编辑时再评估迁移 MDX。
