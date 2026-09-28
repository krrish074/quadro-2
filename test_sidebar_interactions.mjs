import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const routesToTest = [
  { name: 'Dashboard', path: '/dashboard', selector: 'h1, .top-header-title, .crew-balance-roster' },
  { name: 'Crew Deck', path: '/crew', selector: '.crew-member-card, .crew-deck' },
  { name: 'Log Expense', path: '/expenses', selector: 'form, .expense-form' },
  { name: 'Expense History', path: '/history', selector: '.history-list, .expense-history-table' },
  { name: 'Crew Debts', path: '/debts', selector: '.debt-item, .debt-list' },
  { name: 'Settlements', path: '/settlements', selector: '.settlement-plan, .settlements' },
  { name: 'Wanted Board', path: '/wanted', selector: '.wanted-poster, .wanted-board' },
  { name: 'Nami Reminders', path: '/reminders', selector: '.reminder-card, .nami-reminders' },
  { name: 'Haki', path: '/haki', selector: '.haki-container, .haki-dashboard' },
  { name: 'Settings', path: '/settings', selector: '.settings-section, .settings-page' }
];

async function runTests() {
  console.log('Testing Captain Console Sidebar Navigation & Interactions...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, message) {
    totalCount++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // 1. Initial Load
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });

  // Test Sidebar presence and dimensions
  const sidebarInfo = await page.evaluate(() => {
    const sb = document.querySelector('.sidebar');
    if (!sb) return null;
    const rect = sb.getBoundingClientRect();
    const style = window.getComputedStyle(sb);
    return {
      width: rect.width,
      height: rect.height,
      position: style.position,
      top: style.top
    };
  });

  assert(sidebarInfo !== null, 'Sidebar element exists in DOM');
  assert(sidebarInfo && Math.round(sidebarInfo.width) === 250, `Sidebar width is ~250px (actual: ${sidebarInfo?.width}px)`);
  assert(sidebarInfo && (sidebarInfo.position === 'sticky' || sidebarInfo.position === 'fixed'), 'Sidebar is sticky or fixed');

  // Test Brand Elements
  const brandInfo = await page.evaluate(() => {
    const mainTitle = document.querySelector('.sidebar-brand-main');
    const subTitle = document.querySelector('.sidebar-brand-sub');
    const tagline = document.querySelector('.sidebar-tagline');
    const emblem = document.querySelector('.sidebar-emblem-icon');
    return {
      main: mainTitle ? mainTitle.textContent.trim() : '',
      sub: subTitle ? subTitle.textContent.trim() : '',
      tagline: tagline ? tagline.textContent.replace(/\s+/g, ' ').trim() : '',
      emblem: emblem ? emblem.textContent.trim() : ''
    };
  });

  assert(brandInfo.emblem === '☠', `Brand emblem is ☠ (actual: "${brandInfo.emblem}")`);
  assert(brandInfo.main === 'GRAND LINE', `Brand main title is GRAND LINE (actual: "${brandInfo.main}")`);
  assert(brandInfo.sub === 'LEDGER', `Brand sub title is LEDGER (actual: "${brandInfo.sub}")`);
  assert(brandInfo.tagline.includes('MANAGE YOUR CREW') && brandInfo.tagline.includes('SPLIT YOUR BELI') && brandInfo.tagline.includes('SETTLE YOUR DEBTS'), 'Brand contains required 3-part tagline');

  // Test Navigation items across all sections
  for (const route of routesToTest) {
    const clicked = await page.evaluate((targetLabel) => {
      const items = Array.from(document.querySelectorAll('.sidebar-nav-item'));
      const item = items.find(el => el.textContent.includes(targetLabel));
      if (item) {
        item.click();
        return true;
      }
      return false;
    }, route.name);

    assert(clicked, `Clicked nav item: "${route.name}"`);
    await new Promise(r => setTimeout(r, 150));

    const currentUrl = page.url();
    assert(currentUrl.includes(route.path), `Route URL is correct for ${route.name} (${currentUrl})`);

    const hasContent = await page.evaluate(() => {
      const main = document.querySelector('.main-content');
      return main && main.children.length > 0;
    });
    assert(hasContent, `Page content loaded successfully for ${route.name}`);
  }

  // Test Voyage Switcher
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  const crewSelect = await page.$('#sidebar-crew-select');
  assert(crewSelect !== null, 'Crew selector dropdown exists in voyage card');

  // Test Sound Toggle
  const initialSoundText = await page.evaluate(() => {
    const btn = document.querySelector('.sidebar-sound-toggle-btn');
    return btn ? btn.textContent.trim() : '';
  });
  assert(initialSoundText.includes('Sound: ON') || initialSoundText.includes('ONLINE'), 'Sound toggle starts ON');

  await page.click('.sidebar-sound-toggle-btn');
  await new Promise(r => setTimeout(r, 100));

  const toggledSoundText = await page.evaluate(() => {
    const btn = document.querySelector('.sidebar-sound-toggle-btn');
    return btn ? btn.textContent.trim() : '';
  });
  assert(toggledSoundText.includes('Sound: OFF') || toggledSoundText.includes('MUTED'), `Sound toggled to OFF (actual: "${toggledSoundText}")`);

  // Toggle back to ON
  await page.click('.sidebar-sound-toggle-btn');
  await new Promise(r => setTimeout(r, 100));
  const restoredSoundText = await page.evaluate(() => {
    const btn = document.querySelector('.sidebar-sound-toggle-btn');
    return btn ? btn.textContent.trim() : '';
  });
  assert(restoredSoundText.includes('Sound: ON') || restoredSoundText.includes('ONLINE'), 'Sound toggled back to ON');

  // Test "+ NEW VOYAGE" button opens modal
  const newVoyageBtn = await page.$('.sidebar-btn-new-voyage');
  assert(newVoyageBtn !== null, '+ NEW VOYAGE button exists in sidebar voyage card');

  await page.click('.sidebar-btn-new-voyage');
  await new Promise(r => setTimeout(r, 200));

  const isModalOpen = await page.evaluate(() => {
    const modal = document.querySelector('.modal-backdrop, .modal-container');
    return modal !== null;
  });
  assert(isModalOpen, 'Clicking "+ NEW VOYAGE" in sidebar successfully opens New Voyage modal');

  await browser.close();
  console.log(`\n====================================================`);
  console.log(`INTERACTION TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
  console.log(`====================================================`);

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
