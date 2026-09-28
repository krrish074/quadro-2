import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\krris\\.gemini\\antigravity-ide\\brain\\7a33ba98-55dd-42c0-8001-7a654964b925';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/crew', { waitUntil: 'networkidle0' });
  await new Promise(res => setTimeout(res, 1000));
  
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'crew_redesign_v1.png'), fullPage: false });
  console.log('Viewport screenshot saved.');

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'crew_redesign_v1_full.png'), fullPage: true });
  console.log('Full page screenshot saved.');

  await browser.close();
  console.log('Done!');
}

capture().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
