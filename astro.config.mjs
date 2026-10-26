import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://www.xccxc.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [vue()],
  compressHTML: true,
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
