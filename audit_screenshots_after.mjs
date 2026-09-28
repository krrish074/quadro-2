import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\krris\\.gemini\\antigravity-ide\\brain\\7a33ba98-55dd-42c0-8001-7a654964b925';

const routes = [
  { name: 'Dashboard', path: '/dashboard', file: 'audit_dashboard_after.png' },
  { name: 'Crew', path: '/crew', file: 'audit_crew_after.png' },
  { name: 'Expenses', path: '/expenses', file: 'audit_expenses_after.png' },
  { name: 'Expense History', path: '/history', file: 'audit_history_after.png' },
  { name: 'Crew Debts', path: '/debts', file: 'audit_debts_after.png' },
  { name: 'Settlements', path: '/settlements', file: 'audit_settlements_after.png' },
  { name: 'Haki', path: '/haki', file: 'audit_haki_after.png' },
  { name: 'Wanted Board', path: '/wanted', file: 'audit_wanted_after.png' },
  { name: 'Nami Reminders', path: '/reminders', file: 'audit_reminders_after.png' },
  { name: 'Settings', path: '/settings', file: 'audit_settings_after.png' }
];

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const r of routes) {
    const url = `http://localhost:5173${r.path}`;
    console.log(`Navigating to ${r.name}: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(res => setTimeout(res, 800));

    const outPath = path.join(ARTIFACT_DIR, r.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot to ${outPath}`);
  }

  await browser.close();
  console.log('All 10 post-fix screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
