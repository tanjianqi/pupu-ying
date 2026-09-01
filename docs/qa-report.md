# 扑扑鹰 QA 报告 - v0.9.0

> 生成时间: 2026-09-02
> 工具: linkinator (npm devDependency)
> 扫描目标: dist/ (Astro 构建产物)

## 结果

✓ Successfully scanned 129 links in 0.38 seconds.
**0 broken links**

## 扫描范围

- 23 个静态页面（含首页/GEO/服务/案例列表+5详情/排名/关于/团队/联系/FAQ/资讯列表+6详情/素材/404）
- vendor CSS/JS 资源
- /assets/ 图片资源

## 修复记录

v0.9.0 收尾阶段修复的死链：

1. **favicon.png 404** — 原站无 favicon 文件，创建 SVG favicon (`public/assets/images/favicon.svg`)，BaseLayout 改用 `image/svg+xml` 引用
2. **/news?cat=xxx 404** — news.astro 分类链接改为 `/news` + `data-cat` 属性，由 news.js 客户端过滤
3. **/services 404** — geo.astro / geoservice.astro 中 2 处 `/services` 误链，修正为 `/contact`

## 已知遗留 WARN（非阻塞）

- theme.css 中部分非首页 selector 的相对 url() 引用（../image/xxx.png），Astro 构建时 WARN 但不影响运行时显示
- 计划 v1.0.0 阶段评估是否将相关图片移入 public/assets/ 消除 WARN
