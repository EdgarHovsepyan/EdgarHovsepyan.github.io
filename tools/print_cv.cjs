// Prints the designed CV templates to PDF with headless Chromium.
// Needs the built site served at http://localhost:4173 (npm run build && npx vite preview)
// so the templates' /fonts and /assets URLs resolve.
//   node tools/print_cv.cjs
const fs = require('fs');
const { chromium } = require('playwright');

const jobs = [
  ['tools/cv-print-premium.html', 'public/cv/Edgar_Hovsepyan_CV.pdf'],
  ['tools/cv-print-branded.html', 'public/cv/Edgar_Hovsepyan_CV_Branded.pdf'],
];

(async () => {
  const browser = await chromium.launch();
  for (const [template, output] of jobs) {
    const page = await browser.newPage();
    await page.goto('http://localhost:4173/robots.txt');
    await page.setContent(fs.readFileSync(template, 'utf8'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const fit = await page.evaluate(() => {
      const sheet = document.querySelector('.page');
      return sheet ? { content: sheet.scrollHeight, box: sheet.clientHeight } : null;
    });
    await page.pdf({ path: output, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(output, fit ? `content ${fit.content}px in ${fit.box}px box` : '');
    await page.close();
  }
  await browser.close();
})();
