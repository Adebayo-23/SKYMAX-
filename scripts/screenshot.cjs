const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    // Wait briefly for any client hydration UI changes
    await page.waitForTimeout(1000);
    const out = 'scripts/screenshot.png';
    await page.screenshot({ path: out, fullPage: true });
    console.log('Screenshot saved to', out);
    await browser.close();
  } catch (err) {
    console.error('Screenshot error:', err);
    process.exit(2);
  }
})();
