// Renders the static brand images from their HTML templates:
//   tools/og-image.html -> public/assets/og-image.png   (1200 x 630, social preview)
//   tools/banner.html   -> .github/media/banner.png     (1280 x 360, README banner)
// and takes the README hero screenshot from the running site.
// Needs the built site served so /fonts resolves:  node tools/render_og.cjs [port]
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const port = process.argv[2] || '4173';
  const origin = `http://localhost:${port}`;
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  for (const [template, output, width, height] of [
    ['tools/og-image.html', 'public/assets/og-image.png', 1200, 630],
    ['tools/banner.html', '.github/media/banner.png', 1280, 360],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`${origin}/robots.txt`);
    await page.setContent(fs.readFileSync(template, 'utf8'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: output });
    await page.close();
    console.log(output);
  }
  const hero = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await hero.goto(`${origin}/?gl=force`);
  await hero.waitForTimeout(9000);
  await hero.screenshot({ path: '.github/media/preview.png' });
  console.log('.github/media/preview.png');
  await browser.close();
})();
