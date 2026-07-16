import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site as siteMetadata } from './src/data/site.ts';

export default defineConfig({
  site: siteMetadata.canonicalOrigin,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: {
    format: 'directory'
  },
  vite: {
    build: {
      sourcemap: false
    }
  }
});
