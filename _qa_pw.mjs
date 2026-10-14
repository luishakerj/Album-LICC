import { chromium } from './node_modules/playwright/index.mjs';

const URL = 'http://localhost:5055/';
const CHROME = process.env.USERPROFILE + '\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();

const consoleMsgs = [];
const failedReqs = [];
page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => consoleMsgs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', r => failedReqs.push(`${r.url()} :: ${r.failure()?.errorText}`));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('#login-view', { timeout: 15000 });

// Login simulado -> entra al album -> dispara cargarRecuerdos() -> Firestore
await page.evaluate(() => {
  const form = document.querySelector('#login-view form') || document.querySelector('form');
  form.requestSubmit ? form.requestSubmit() : form.submit();
});

await page.waitForSelector('#album-view.active', { timeout: 15000 });
await page.waitForTimeout(5000);

const result = await page.evaluate(() => {
  const warning = document.getElementById('db-warning');
  const grid = document.getElementById('photos-grid');
  return {
    albumActive: document.getElementById('album-view').classList.contains('active'),
    dbWarningShown: !!warning,
    dbWarningText: warning ? warning.innerText : null,
    photosGridHtmlLen: grid ? grid.innerHTML.length : null,
    counter: document.getElementById('photo-counter')?.innerText ?? null,
    cards: document.querySelectorAll('.photo-card').length,
  };
});

console.log('===== RESULTADO =====');
console.log(JSON.stringify(result, null, 2));
console.log('===== CONSOLA =====');
console.log(consoleMsgs.join('\n') || '(sin mensajes)');
console.log('===== PETICIONES FALLIDAS =====');
console.log(failedReqs.join('\n') || '(ninguna)');

await browser.close();
