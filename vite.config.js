import { defineConfig } from 'vite';
import content from './src/content.js';
import { renderBody, renderHead, renderPreloader } from './src/ui/templates.js';

/**
 * Renders content.js into index.html at build/dev time (SEO + no-JS friendly)
 * and emits sitemap.xml / robots.txt using the site URL from content.js.
 */
function contentPlugin() {
  return {
    name: 'janvi-content',
    transformIndexHtml(html) {
      return html
        .replace('<!--head-->', renderHead(content))
        .replace('<!--preloader-->', renderPreloader(content))
        .replace('<!--app-->', renderBody(content));
    },
    generateBundle() {
      const url = content.site.url;
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', url).href}\n`,
      });
    },
  };
}

export default defineConfig({
  // Relative base works on GitHub Pages for both user sites and project sub-paths.
  base: './',
  plugins: [contentPlugin()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
