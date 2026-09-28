import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const viewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900',  width: 1440, height: 900 },
  { name: '1280x800',  width: 1280, height: 800 },
  { name: '768x1024',  width: 768,  height: 1024 },
  { name: '390x844',   width: 390,  height: 844 }
];

async function capture() {
  console.log('Launching Edge from:', EDGE_PATH);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    console.log(`Setting viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    // Evaluate layout metrics
    const metrics = await page.evaluate(() => {
      const shell = document.querySelector('.app-shell');
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      const statsGrid = document.querySelector('.stats-grid');
      const twoColumns = document.querySelectorAll('.two-column');
      const balanceTable = document.querySelector('.balance-table');

      return {
        shellWidth: shell ? shell.offsetWidth : null,
        sidebarWidth: sidebar ? sidebar.offsetWidth : null,
        sidebarDisplay: sidebar ? window.getComputedStyle(sidebar).display : null,
        mainWidth: mainContent ? mainContent.offsetWidth : null,
        statsGridColumns: statsGrid ? window.getComputedStyle(statsGrid).gridTemplateColumns : null,
        twoColumnWidth: twoColumns[0] ? twoColumns[0].offsetWidth : null,
        hasBalanceTable: !!balanceTable,
        tableRows: balanceTable ? balanceTable.querySelectorAll('tbody tr').length : 0
      };
    });

    console.log(`[${vp.name}] Layout Metrics:`, JSON.stringify(metrics, null, 2));

    const filename = `screenshot_${vp.name}.png`;
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`Saved screenshot: ${filename}`);
  }

  await browser.close();
  console.log('All viewports captured successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
