# 扑扑鹰 API 端点文档

> 版本：v1.2.0 | 更新：2026-09-02 | 状态：后端 API 接通 + 腾讯企业邮 SMTP

扑扑鹰官网在 Astro hybrid 模式下提供两个服务端 API 端点，由 `@astrojs/node` standalone 适配器驱动，页面默认静态预渲染，API 路由通过 `export const prerender = false` 按需服务端渲染。

---

## 目录

- [GET /api/rank](#get-apirank) — GEO 排名查询
- [POST /api/contact](#post-apicontact) — 联系表单提交
- [环境变量配置](#环境变量配置)
- [部署说明](#部署说明)
- [本地开发与测试](#本地开发与测试)

---

## GET /api/rank

GEO 排名查询端点。接收关键词与平台参数，返回品牌在主流 AI 搜索平台的排名表现。

**当前数据源**：`src/data/rank-mock.json`（演示数据）。后续接入真实数据源时，仅需替换 [src/pages/api/rank.ts](../src/pages/api/rank.ts) 中的数据加载逻辑，接口契约不变。

### 请求

```
GET /api/rank?keyword={关键词}&platform={平台}
```

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `keyword` | string | 是 | 查询关键词，如 `GEO优化` |
| `platform` | string | 否 | 平台过滤，默认 `全部`。可选：`豆包` / `DeepSeek` / `文心一言` / `通义千问` / `Kimi` / `全部` |

### 响应

**成功（200）**

```json
{
  "ok": true,
  "keyword": "GEO优化",
  "platform": "全部",
  "count": 2,
  "results": [
    { "keyword": "GEO优化", "platform": "豆包", "rank": 1, "url": "example.com", "change": "+3" },
    { "keyword": "GEO优化", "platform": "通义千问", "rank": 1, "url": "example.com", "change": "+2" }
  ]
}
```

**参数错误（400）**

```json
{ "ok": false, "message": "缺少必填参数 keyword" }
```

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `ok` | boolean | 请求是否成功 |
| `keyword` | string | 回显查询关键词 |
| `platform` | string | 回显过滤平台（`全部` 表示不限） |
| `count` | number | 匹配结果数 |
| `results[]` | array | 排名结果数组 |
| `results[].keyword` | string | 关键词 |
| `results[].platform` | string | AI 搜索平台名 |
| `results[].rank` | number | 排名位置（1 为最高） |
| `results[].url` | string | 品牌在该平台的展示链接 |
| `results[].change` | string | 排名变化（`+3` 升 / `-1` 降 / `0` 持平） |

### curl 示例

```bash
# 基本查询
curl "http://localhost:4321/api/rank?keyword=GEO%E4%BC%98%E5%8C%96&platform=%E5%85%A8%E9%83%A8"

# 指定平台
curl "http://localhost:4321/api/rank?keyword=AI%20SEO&platform=DeepSeek"

# 缺参数（应返回 400）
curl "http://localhost:4321/api/rank?platform=%E8%B1%86%E5%8C%85"
```

---

## POST /api/contact

联系表单提交端点。接收咨询表单 JSON，校验后通过腾讯企业邮 SMTP 发送邮件到 `MAIL_TO` 收件箱。

**邮件服务**：nodemailer + 腾讯企业邮 SMTP（`smtp.exmail.qq.com:465` SSL）。
**降级模式**：若 SMTP 凭证未配置，返回 `sent:false`（校验通过但未实际发信），便于本地开发。

### 请求

```
POST /api/contact
Content-Type: application/json
```

```json
{
  "name": "姓名",
  "email": "user@example.com",
  "brand": "品牌名",
  "phone": "13800138000",
  "message": "咨询内容（可选）"
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 | 联系人姓名 |
| `email` | string | 是 | 邮箱（需符合标准格式） |
| `brand` | string | 是 | 品牌名称 |
| `phone` | string | 是 | 联系电话 |
| `message` | string | 否 | 留言内容 |

### 响应

**提交成功（200，已发信）**

```json
{
  "ok": true,
  "sent": true,
  "messageId": "<xxx@qq.com>",
  "message": "提交成功！扑扑鹰团队将在 24 小时内联系您，请保持电话畅通。",
  "received": { "name": "姓名", "email": "user@example.com", "brand": "品牌", "phone": "13800138000", "hasMessage": true }
}
```

**提交成功（200，开发模式未发信）**

```json
{
  "ok": true,
  "sent": false,
  "message": "提交成功（开发模式：已校验通过，未实际发送邮件）。",
  "received": { ... }
}
```

**字段缺失（400）**

```json
{ "ok": false, "message": "缺少必填字段：brand, phone" }
```

**邮箱格式错误（400）**

```json
{ "ok": false, "message": "邮箱格式不正确" }
```

**非合法 JSON（400）**

```json
{ "ok": false, "message": "请求体不是合法 JSON" }
```

**SMTP 发送失败（500）**

```json
{ "ok": false, "message": "提交失败：邮件发送异常，请稍后重试或直接联系 geo@ppypaper.com。" }
```

> 500 响应不暴露内部错误细节，完整错误记录在服务器日志 `[/api/contact] 邮件发送失败：...`。

### 邮件内容

发送到 `MAIL_TO` 的邮件格式：

- **主题**：`[官网咨询] {brand} - {name}`
- **发件人**：`{SMTP_FROM_NAME} <{SMTP_USER}>`
- **回复到**：提交者邮箱（`replyTo: email`）
- **正文**：纯文本 + HTML 双版本
  - HTML 版本含表格排版（姓名/品牌/邮箱/电话/留言）
  - 邮箱字段含 `mailto:` 链接，电话字段含 `tel:` 链接
  - 底部附提交时间 + 来源页面

### curl 示例

```bash
# 提交咨询（Windows curl.exe）
curl.exe -s -X POST "http://localhost:4321/api/contact" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"测试\",\"email\":\"test@example.com\",\"brand\":\"品牌\",\"phone\":\"13800138000\",\"message\":\"咨询内容\"}"

# 从文件读取 JSON（避免 PowerShell 转义问题）
curl.exe -s -X POST "http://localhost:4321/api/contact" ^
  -H "Content-Type: application/json" ^
  --data-binary "@payload.json"
```

---

## 环境变量配置

复制 [.env.example](../.env.example) 为 `.env` 并填入凭证。`.env` 已在 `.gitignore` 中排除。

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `SMTP_HOST` | 是 | `smtp.exmail.qq.com` | SMTP 服务器地址 |
| `SMTP_PORT` | 是 | `465` | SMTP 端口（465=SSL / 587=STARTTLS） |
| `SMTP_SECURE` | 是 | `true` | 是否使用 SSL（465→true，587→false） |
| `SMTP_USER` | 是 | — | 发件邮箱完整地址（如 `system@ppypaper.com`） |
| `SMTP_PASS` | 是 | — | 客户端专用密码（非登录密码） |
| `SMTP_FROM_NAME` | 否 | `扑扑鹰官网咨询` | 发件人显示名 |
| `MAIL_TO` | 否 | `geo@ppypaper.com` | 联系表单邮件收件箱 |

### 腾讯企业邮客户端专用密码生成

1. 登录 https://exmail.qq.com
2. 进入「邮箱设置」→「客户端专用密码」
3. 点击「生成新密码」→ 复制 16 位密码
4. 粘贴到 `.env` 的 `SMTP_PASS=`

---

## 部署说明

### 构建产物

```
dist/
├── client/       # 静态资源 + 23 个预渲染 HTML 页面 + sitemap
└── server/       # 服务端 entrypoints（含 /api/rank + /api/contact）
    └── entry.mjs  # node standalone 启动入口
```

### 启动方式

```bash
# 构建
npm run build

# 启动 standalone 服务器（默认 4321 端口）
node ./dist/server/entry.mjs

# 指定端口
HOST=0.0.0.0 PORT=8080 node ./dist/server/entry.mjs
```

### 环境变量注入

**生产环境推荐**：用系统环境变量注入（无需 .env 文件）

```bash
# Linux/macOS
export SMTP_HOST=smtp.exmail.qq.com
export SMTP_USER=system@ppypaper.com
export SMTP_PASS=your_client_password
node ./dist/server/entry.mjs

# Windows PowerShell
$env:SMTP_HOST="smtp.exmail.qq.com"
$env:SMTP_USER="system@ppypaper.com"
$env:SMTP_PASS="your_client_password"
node ./dist/server/entry.mjs
```

**Serverless 部署**：在平台控制台配置环境变量（Vercel/Netlify/Cloudflare Workers 等）。

---

## 本地开发与测试

### 启动开发服务器

```bash
npm run dev      # 开发模式（热更新）
# 或
npm run build && npm run preview   # 预览构建产物
```

### 测试 API 端点

启动 preview 后，用 curl.exe（Windows）或 curl（Linux/macOS）测试：

```bash
# /api/rank 正常查询
curl "http://localhost:4321/api/rank?keyword=GEO%E4%BC%98%E5%8C%96"

# /api/rank 缺参数
curl "http://localhost:4321/api/rank?platform=%E8%B1%86%E5%8C%85"

# /api/contact 提交
curl -X POST "http://localhost:4321/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@example.com","brand":"品牌","phone":"13800138000"}'

# /api/contact 缺字段
curl -X POST "http://localhost:4321/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"bad-email"}'
```

### 降级模式说明

- **无 .env 文件** 或 **SMTP 凭证为空** → `/api/contact` 返回 `sent:false`，不实际发信
- **凭证错误** → 返回 500，服务器日志记录 SMTP 错误（如 `535 authentication failed`）
- **凭证正确** → 返回 `sent:true` + `messageId`，邮件发送到 `MAIL_TO`

---

## 后续扩展点

- [ ] `/api/rank` 接入真实数据源（替换 `rank-mock.json` 读取逻辑）
- [ ] `/api/contact` 接入数据库存储咨询记录（当前仅发邮件）
- [ ] 添加速率限制（防垃圾提交）
- [ ] 添加 reCAPTCHA 验证
- [ ] 邮件模板美化（品牌化 HTML 模板）

---

## 相关文件

| 文件 | 说明 |
|---|---|
| [astro.config.mjs](../astro.config.mjs) | Astro 配置 + node adapter |
| [src/pages/api/rank.ts](../src/pages/api/rank.ts) | GET /api/rank 端点 |
| [src/pages/api/contact.ts](../src/pages/api/contact.ts) | POST /api/contact 端点 |
| [src/scripts/pages/rank.js](../src/scripts/pages/rank.js) | 前端 rank 表单脚本 |
| [src/scripts/pages/contact.js](../src/scripts/pages/contact.js) | 前端 contact 表单脚本 |
| [src/data/rank-mock.json](../src/data/rank-mock.json) | rank 演示数据 |
| [.env.example](../.env.example) | 环境变量模板 |
