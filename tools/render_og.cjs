// Renders tools/og-image.html to public/assets/og-image.png (1200 x 630).
// Needs the built site served so /fonts resolves:  node tools/render_og.cjs [port]
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const port = process.argv[2] || '4173';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/robots.txt`);
  await page.setContent(fs.readFileSync('tools/og-image.html', 'utf8'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'public/assets/og-image.png' });
  await browser.close();
  console.log('public/assets/og-image.png');
})();
