import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Must match the host production actually serves. Vercel redirects the apex
  // to www, so a non-www `site` would put a redirecting URL into every
  // canonical link and every sitemap entry.
  site: 'https://www.mtcedarbritishinternationalsch.com.ng',
  integrations: [sitemap()],
});
