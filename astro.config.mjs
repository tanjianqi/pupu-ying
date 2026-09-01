// @ts-check
// 扑扑鹰 Astro 配置
// 静态站点输出，site 字段用于 sitemap/SEO 绝对路径
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.ppypaper.com',
  output: 'static',
  integrations: [sitemap()],
});
