const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  const errs = [], fails = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  pg.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/')) fails.push(r.status() + ' ' + r.url()) });
  const U = 'https://tourmaline-tartufo-8e3c69.netlify.app/';
  await pg.goto(U); await pg.fill('input[name=password]', 'My-Drop-Site'); await Promise.all([pg.waitForNavigation(), pg.press('input[name=password]', 'Enter')]);
  errs.length = 0;
  const r = await pg.goto(U + 'index.html', { waitUntil: 'load' }); console.log('status', r.status());
  await pg.waitForTimeout(3000); await pg.click('#btnNew').catch(e => console.log('nobtn', e.message)); await pg.waitForTimeout(1500);
  await pg.screenshot({ path: require('path').join(__dirname, '..', 'shots', 'live_phone.png') });
  for (const p of ['street3d.html', 'world2.js', 'hero_sprites.js', 'img/hero07_t_front.webp', 'learn_ui.js']) { const s = await pg.evaluate(async p => (await fetch(p)).status, p); console.log(p, s) }
  console.log(JSON.stringify({ errs, fails })); await b.close();
})();
