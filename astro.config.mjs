// @ts-check
// 扑扑鹰 Astro 配置
// v1.1.0: static 模式 (Astro 5 默认) + node adapter
//   - 页面默认静态预渲染
//   - API routes 通过 export const prerender = false 按需服务端渲染
// 部署: node adapter standalone 模式, 可转 serverless
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://www.ppypaper.com',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
});
