import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function debug() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:5173/crew', { waitUntil: 'networkidle0' });

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
  });
  console.log('Buttons on /crew:', buttons);

  console.log('Clicking Enlist Pirate...');
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Enlist Pirate'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Clicked result:', clicked);

  await new Promise(r => setTimeout(r, 500));

  const modalHtml = await page.evaluate(() => {
    const modal = document.querySelector('.modal-backdrop');
    return modal ? modal.outerHTML : 'NO MODAL IN DOM';
  });
  console.log('Modal HTML:', modalHtml.slice(0, 300));

  await browser.close();
}

debug();
