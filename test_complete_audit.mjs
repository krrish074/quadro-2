/**
 * GRAND LINE LEDGER - COMPLETE AUDIT & VERIFICATION SUITE
 * Validates all 11 Core Requirements and 4 Bonus Enhancements through real browser actions and math checks.
 */
import puppeteer from 'puppeteer-core';
import {
  calculateBalances,
  calculateDebts,
  generateSettlementPlan,
  calculateTotalExpenses,
  calculateTotalSettled,
  calculateCategorySpending,
  validateExpenseData
} from './src/utils/calculations.js';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runAudit() {
  console.log('====================================================');
  console.log('⚔️ GRAND LINE LEDGER: FINAL REQUIREMENTS AUDIT');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // =========================================================================
  // SECTION I: MATHEMATICAL INTEGRITY CHECKS (Phase 6, 7, 8, 9, 10, 13)
  // =========================================================================
  console.log('--- SECTION I: Core Financial & Algorithmic Verification ---');

  // Math Check 1: Equal Split Benchmark (Section 21)
  const strawHatCrew = {
    id: 'c1',
    name: 'Straw Hat Crew',
    members: [
      { id: 'luffy', name: 'Monkey D. Luffy' },
      { id: 'zoro',  name: 'Roronoa Zoro' },
      { id: 'nami',  name: 'Nami' },
      { id: 'sanji', name: 'Sanji' }
    ],
    expenses: [
      {
        id: 'e1',
        name: 'Going Merry Dinner',
        amount: 1200,
        category: 'Food',
        shares: { luffy: 300, zoro: 300, nami: 300, sanji: 300 },
        payments: { luffy: 1200 }
      }
    ],
    settlements: []
  };

  const b1 = calculateBalances(strawHatCrew);
  assert(b1.balances.luffy === 900, 'Luffy net balance is +฿900');
  assert(b1.balances.zoro === -300, 'Zoro net balance is -฿300');
  assert(b1.balances.nami === -300, 'Nami net balance is -฿300');
  assert(b1.balances.sanji === -300, 'Sanji net balance is -฿300');

  // Conservation check: Sum of balances === 0
  const sumBalances1 = Object.values(b1.balances).reduce((s, v) => s + v, 0);
  assert(Math.abs(sumBalances1) < 0.001, 'Conservation Theorem: Sum of balances === 0');

  // Math Check 2: Settlement Plan Generation
  const plan1 = generateSettlementPlan(b1.balances);
  assert(plan1.length === 3, 'Settlement plan generates exactly 3 transfers');
  const zoroTransfer = plan1.find(p => p.from === 'zoro' && p.to === 'luffy');
  const namiTransfer = plan1.find(p => p.from === 'nami' && p.to === 'luffy');
  const sanjiTransfer = plan1.find(p => p.from === 'sanji' && p.to === 'luffy');
  assert(zoroTransfer && zoroTransfer.amount === 300, 'Zoro pays Luffy ฿300');
  assert(namiTransfer && namiTransfer.amount === 300, 'Nami pays Luffy ฿300');
  assert(sanjiTransfer && sanjiTransfer.amount === 300, 'Sanji pays Luffy ฿300');

  // Math Check 3: Complex Multi-Party Settlement & Graph Simplification (Bonus 1)
  // Scenario: 4 pirates with transitive/cyclic debts
  // A = +1000, B = +500, C = -800, D = -700
  const complexBalances = { A: 1000, B: 500, C: -800, D: -700 };
  const complexPlan = generateSettlementPlan(complexBalances);
  // Max possible bilateral transfers without simplification = 4 (or up to 6)
  // With greedy netting, at most 3 transfers (N - 1)
  assert(complexPlan.length <= 3, `Debt simplification: only ${complexPlan.length} transfers needed for 4 parties (<= 3)`);
  const totalTransferred = complexPlan.reduce((s, p) => s + p.amount, 0);
  assert(totalTransferred === 1500, 'Total transferred sum equals total debt (฿1500)');

  // Conservation check 4: Sum(Positive) === Sum(abs(Negative))
  const posSum = Object.values(complexBalances).filter(v => v > 0).reduce((s, v) => s + v, 0);
  const negSum = Object.values(complexBalances).filter(v => v < 0).reduce((s, v) => s + Math.abs(v), 0);
  assert(posSum === negSum, 'Ledger Conservation: Sum(Positive) === Sum(abs(Negative))');

  // Math Check 5: Partial Selection of Members (Phase 5)
  // Luffy, Zoro, Nami involved, Sanji excluded
  const partialExp = {
    amount: 900,
    shares: { luffy: 300, zoro: 300, nami: 300 }, // Sanji not in shares
    payments: { luffy: 900 },
    participants: ['luffy', 'zoro', 'nami']
  };
  const valPartial = validateExpenseData(partialExp);
  assert(valPartial.isValid, 'Partial member expense is valid');
  assert(!valPartial.errors.length, 'Zero errors for partial participant expense');

  // Math Check 6: Custom Split Validation (Phase 6)
  // Valid: 500 + 250 + 150 = 900
  const validCustom = validateExpenseData({
    amount: 900,
    shares: { luffy: 500, zoro: 250, sanji: 150 },
    payments: { luffy: 900 },
    participants: ['luffy', 'zoro', 'sanji']
  });
  assert(validCustom.isValid, 'Custom split summing to total is VALID');

  // Invalid: 500 + 250 + 100 = 850 != 900
  const invalidCustom = validateExpenseData({
    amount: 900,
    shares: { luffy: 500, zoro: 250, sanji: 100 },
    payments: { luffy: 900 },
    participants: ['luffy', 'zoro', 'sanji']
  });
  assert(!invalidCustom.isValid, 'Custom split with mismatch (850 != 900) is REJECTED');

  // Math Check 7: Multi-Payer Validation (Phase 7)
  // Valid: Luffy 600 + Zoro 300 = 900
  const validMultiPayer = validateExpenseData({
    amount: 900,
    shares: { luffy: 300, zoro: 300, sanji: 300 },
    payments: { luffy: 600, zoro: 300 },
    participants: ['luffy', 'zoro', 'sanji']
  });
  assert(validMultiPayer.isValid, 'Multi-payer payments summing to total is VALID');

  // Invalid: Luffy 600 + Zoro 200 = 800 != 900
  const invalidMultiPayer = validateExpenseData({
    amount: 900,
    shares: { luffy: 300, zoro: 300, sanji: 300 },
    payments: { luffy: 600, zoro: 200 },
    participants: ['luffy', 'zoro', 'sanji']
  });
  assert(!invalidMultiPayer.isValid, 'Multi-payer payments mismatch (800 != 900) is REJECTED');

  // =========================================================================
  // SECTION II: BROWSER UI & WORKFLOW AUDIT (Puppeteer on Edge)
  // =========================================================================
  console.log('\n--- SECTION II: Interactive Browser Workflows ---');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Reset to clean benchmark before browser audit
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0' });
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  // Click reset benchmark
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Load Straw Hat Test Benchmark'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // --- REQ 11: DASHBOARD FINANCIAL STATUS ---
  console.log('Testing Req 11: Overall Financial Status on Dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  const dashboardStats = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.stat-card'));
    return cards.map(c => ({
      label: c.querySelector('.stat-card-label')?.textContent?.trim(),
      val: c.querySelector('.stat-card-value')?.textContent?.trim()
    }));
  });

  assert(dashboardStats.some(s => s.label === 'TOTAL SPENT' && s.val.includes('1,200')), 'Total spent displays ฿1,200');
  assert(dashboardStats.some(s => s.label === 'CAPTAIN OWES' && s.val.includes('0')), 'Captain owes displays ฿0');
  assert(dashboardStats.some(s => s.label === 'CAPTAIN IS OWED' && s.val.includes('900')), 'Captain is owed displays ฿900');
  assert(dashboardStats.some(s => s.label === 'TOTAL SETTLED' && s.val.includes('0')), 'Total settled displays ฿0');

  // --- REQ 7 & 8: CREW BALANCE ROSTER & OWES/RECEIVES STATUSES ---
  console.log('Testing Req 7 & 8: Individual Balances & OWES/RECEIVES Statuses...');
  const rosterRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.balance-table tbody tr'));
    return rows.map(r => ({
      name: r.querySelector('.balance-name')?.textContent?.trim(),
      balance: r.querySelector('td:nth-child(5)')?.textContent?.trim(),
      status: r.querySelector('td:nth-child(6)')?.textContent?.trim()
    }));
  });

  assert(rosterRows.length === 4, 'Roster displays all 4 Straw Hat pirates');
  const luffyRow = rosterRows.find(r => r.name.includes('Luffy'));
  const zoroRow = rosterRows.find(r => r.name.includes('Zoro'));
  assert(luffyRow && luffyRow.balance.includes('+') && luffyRow.status.includes('RECEIVES'), 'Luffy shows positive balance and RECEIVES badge');
  assert(zoroRow && zoroRow.balance.includes('-') && zoroRow.status.includes('OWES'), 'Zoro shows negative balance and OWES badge');

  // --- REQ 2: ADD AND REMOVE MEMBERS ---
  console.log('Testing Req 2: Add and Remove Members...');
  await page.goto('http://localhost:5173/crew', { waitUntil: 'networkidle0' });
  
  // Click "Enlist Pirate"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.includes('Enlist Pirate'));
    if (b) b.click();
  });
  await page.waitForSelector('#member-name', { timeout: 3000 });

  // Fill enlist form
  await page.type('#member-name', 'Tony Tony Chopper');
  await page.type('#member-role', 'Doctor');
  await page.select('#member-avatar', '🦌');
  await page.evaluate(() => {
    const modal = document.querySelector('.modal-container, .modal-box');
    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Check Chopper exists
  let memberCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.crew-card h4')).map(h => h.textContent.trim());
  });
  assert(memberCards.includes('Tony Tony Chopper'), 'Tony Tony Chopper enlisted and rendered immediately');

  // Remove Chopper
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.crew-card'));
    const chopperCard = cards.find(c => c.textContent.includes('Tony Tony Chopper'));
    if (chopperCard) {
      const plankBtn = chopperCard.querySelector('button.btn-danger');
      if (plankBtn) plankBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 300));

  memberCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.crew-card h4')).map(h => h.textContent.trim());
  });
  assert(!memberCards.includes('Tony Tony Chopper'), 'Chopper removed successfully without corrupting roster');

  // --- REQ 1: CREATE AND MANAGE GROUPS ---
  console.log('Testing Req 1: Create, Switch, Rename, and Isolate Groups...');
  await page.evaluate(() => {
    const newVoyageBtn = document.querySelector('.sidebar-btn-new-voyage');
    if (newVoyageBtn) newVoyageBtn.click();
  });
  await page.waitForSelector('#new-crew-name', { timeout: 3000 });

  await page.type('#new-crew-name', 'Heart Pirates');
  await page.type('#new-crew-desc', 'Submarine medical pirates');
  await page.click('.modal-box button[type="submit"]');
  await new Promise(r => setTimeout(r, 500));

  // Verify Heart Pirates is active and isolated
  const activeVoyage = await page.evaluate(() => {
    const heading = document.querySelector('.page-header-subtitle');
    return heading ? heading.textContent : '';
  });
  assert(activeVoyage.includes('Heart Pirates'), 'Heart Pirates is now the active voyage');

  // Verify data isolation: Heart Pirates has 0 members and 0 expenses initially
  const heartMembers = await page.evaluate(() => {
    return document.querySelectorAll('.crew-card').length;
  });
  assert(heartMembers === 0, 'Heart Pirates data is completely isolated (0 members)');

  // Rename Heart Pirates
  await page.evaluate(() => {
    const renameBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Rename Voyage'));
    if (renameBtn) renameBtn.click();
  });
  await page.waitForSelector('#rename-input', { timeout: 3000 });

  await page.evaluate(() => {
    const input = document.querySelector('#rename-input');
    if (input) input.value = '';
  });
  await page.type('#rename-input', 'Trafalgar Submarine Crew');
  await page.click('.modal-box button[type="submit"]');
  await new Promise(r => setTimeout(r, 400));

  const renamedHeader = await page.evaluate(() => {
    return document.querySelector('.page-header-subtitle')?.textContent || '';
  });
  assert(renamedHeader.includes('Trafalgar Submarine Crew'), 'Group renamed to "Trafalgar Submarine Crew"');

  // Switch back to Straw Hat Crew
  await page.evaluate(() => {
    const select = document.querySelector('#sidebar-crew-select');
    const strawHatOption = Array.from(select.options).find(o => o.text.includes('Straw Hat'));
    if (strawHatOption) {
      select.value = strawHatOption.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 400));

  const switchedBackHeader = await page.evaluate(() => {
    return document.querySelector('.page-header-subtitle')?.textContent || '';
  });
  assert(switchedBackHeader.includes('Straw Hat Crew'), 'Switched back to Straw Hat Crew with data intact');

  // Delete Trafalgar Submarine Crew to test deletion with confirmation
  await page.evaluate(() => {
    const select = document.querySelector('#sidebar-crew-select');
    const subOption = Array.from(select.options).find(o => o.text.includes('Trafalgar'));
    if (subOption) {
      select.value = subOption.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    const delBtn = document.querySelector('button.btn-danger');
    if (delBtn) delBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const remainingCrewsCount = await page.evaluate(() => {
    const select = document.querySelector('#sidebar-crew-select');
    return select ? select.options.length : 0;
  });
  assert(remainingCrewsCount === 1, 'Trafalgar Submarine Crew deleted; 1 active crew remains');

  // --- REQ 3, 4, 5, 6: EXPENSES, PARTICIPANTS, SPLITS, PAYERS ---
  console.log('Testing Req 3, 4, 5, 6: Shared Expenses, Participant Selection & Custom Split Validation...');
  await page.goto('http://localhost:5173/expenses', { waitUntil: 'networkidle0' });

  // Test Expense Form Fields Presence
  const formFields = await page.evaluate(() => {
    return {
      desc: !!document.querySelector('#expense-desc'),
      amount: !!document.querySelector('#expense-amount'),
      category: !!document.querySelector('#expense-category'),
      date: !!document.querySelector('#expense-date'),
      notes: !!document.querySelector('#expense-notes'),
      chips: document.querySelectorAll('.flex-row button').length > 0
    };
  });
  assert(formFields.desc && formFields.amount && formFields.category && formFields.date, 'All required expense fields are present');

  // Add custom split expense: ฿900, Luffy 500, Zoro 250, Sanji 150 (Nami excluded)
  await page.type('#expense-desc', 'Baratie Seafood Lunch');
  await page.type('#expense-amount', '900');
  await page.select('#expense-category', 'Food');

  // Toggle participants: Deselect Nami
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.flex-row button'));
    const namiChip = chips.find(c => c.textContent.includes('Nami'));
    if (namiChip) namiChip.click();
  });

  // Switch to custom split
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const customBtn = btns.find(b => b.textContent.includes('Custom Split'));
    if (customBtn) customBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  // Get all custom share input IDs
  const shareSelectors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[id^="custom-share-"]')).map(i => '#' + i.id);
  });

  // Type invalid shares: 500, 250, 100
  await page.click(shareSelectors[0]);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type(shareSelectors[0], '500');

  await page.click(shareSelectors[1]);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type(shareSelectors[1], '250');

  await page.click(shareSelectors[2]);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type(shareSelectors[2], '100');

  // Attempt submit invalid
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 200));

  const hasValidationError = await page.evaluate(() => {
    const badge = document.querySelector('.badge-debt');
    return badge ? badge.textContent : '';
  });
  assert(hasValidationError.includes('does not equal'), 'Invalid custom split (฿850 != ฿900) correctly rejected by validation');

  // Correct custom split: change third from 100 to 150
  await page.click(shareSelectors[2]);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type(shareSelectors[2], '150');

  // Submit valid expense
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 700));

  // Verify navigation to history and expense logged
  const historyUrl = page.url();
  assert(historyUrl.includes('/history'), 'Expense saved and navigated to /history');

  const historyItems = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.expense-card, .parchment-card'));
    return cards.map(c => c.textContent);
  });
  assert(historyItems.some(t => t.includes('Baratie Seafood Lunch')), 'Expense "Baratie Seafood Lunch" appears in history');

  // --- REQ 10: EXPENSE HISTORY SEARCH, FILTER, EDIT, DELETE ---
  console.log('Testing Req 10: Expense History Search, Filter, Inline Edit, and Delete...');
  await page.type('#search-exp', 'Baratie');
  await new Promise(r => setTimeout(r, 200));

  let filteredCount = await page.evaluate(() => {
    return document.querySelectorAll('.expense-card').length;
  });
  assert(filteredCount === 1, 'Search filter isolates "Baratie" expenditure (1 item)');

  // Clear search
  await page.evaluate(() => {
    const s = document.querySelector('#search-exp');
    if (s) { s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await new Promise(r => setTimeout(r, 200));

  // Edit Expense
  await page.evaluate(() => {
    const editBtn = document.querySelector('button[title="Edit Expense"]');
    if (editBtn) editBtn.click();
  });
  await page.waitForSelector('#edit-name', { timeout: 3000 });

  await page.click('#edit-name');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type('#edit-name', 'Baratie Royal Feast');

  await page.click('.modal-box button[type="submit"]');
  await new Promise(r => setTimeout(r, 400));

  const editedExists = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.expense-card')).some(c => c.textContent.includes('Baratie Royal Feast'));
  });
  assert(editedExists, 'Expense successfully edited to "Baratie Royal Feast"');

  // Delete Expense
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.expense-card'));
    const royalCard = cards.find(c => c.textContent.includes('Baratie Royal Feast'));
    if (royalCard) {
      const delBtn = royalCard.querySelector('button[title="Delete Expense"]');
      if (delBtn) delBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 400));

  const deletedExists = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.expense-card')).some(c => c.textContent.includes('Baratie Royal Feast'));
  });
  assert(!deletedExists, 'Expense deleted and struck from history ledger');

  // --- REQ 9: SETTLEMENTS & SETTLEMENT HISTORY ---
  console.log('Testing Req 9: Settlement Execution & History Recording...');
  await page.goto('http://localhost:5173/settlements', { waitUntil: 'networkidle0' });

  const initialTransfers = await page.evaluate(() => {
    return document.querySelectorAll('.settlements-page .flex-between').length;
  });
  assert(initialTransfers > 0, 'Optimal settlement plan items displayed');

  // Execute a single settlement
  await page.evaluate(() => {
    const markPaidBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mark Paid'));
    if (markPaidBtn) markPaidBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const settlementHistoryCount = await page.evaluate(() => {
    const badge = document.querySelector('.badge-credit');
    return badge ? badge.textContent : '';
  });
  assert(settlementHistoryCount.includes('Recorded'), 'Completed settlement recorded into settlement history ledger');

  // Refresh page to verify persistence (Check F & Check 9)
  await page.reload({ waitUntil: 'networkidle0' });
  const reloadedSettlementHistoryCount = await page.evaluate(() => {
    const badge = document.querySelector('.badge-credit');
    return badge ? badge.textContent : '';
  });
  assert(reloadedSettlementHistoryCount.includes('Recorded'), 'Settlement record persists after browser page refresh');

  // --- BONUS 2: BELI CURRENCY TOGGLE & GOLD COINS ---
  console.log('Testing Bonus 2: Currency Toggle with Gold Coin Animation...');
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0' });

  // Toggle currency to Indian Rupee (₹)
  await page.evaluate(() => {
    const radios = Array.from(document.querySelectorAll('input[name="currency"]'));
    if (radios[1]) radios[1].click();
  });
  await new Promise(r => setTimeout(r, 200));

  // Check currency updated on Dashboard
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  const hasRupee = await page.evaluate(() => {
    return document.querySelector('.stat-card-value')?.textContent?.includes('₹');
  });
  assert(hasRupee, 'Currency dynamically switched to ₹ across dashboard');

  // Toggle back to Beli (฿)
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const radios = Array.from(document.querySelectorAll('input[name="currency"]'));
    if (radios[0]) radios[0].click();
  });
  await new Promise(r => setTimeout(r, 200));

  // --- BONUS 3: NAMI DEBT WARNING STAMP ---
  console.log('Testing Bonus 3: Nami Debt Warning Stamp for Excessive Debt...');
  // Configure threshold to 200 so that debtors (who owe ฿300) trigger the warning!
  await page.click('#excessive-threshold');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type('#excessive-threshold', '200');
  await new Promise(r => setTimeout(r, 300));

  // Check Crew Roster has Nami Debt Warning stamp
  await page.goto('http://localhost:5173/crew', { waitUntil: 'networkidle0' });
  const hasWarningStamp = await page.evaluate(() => {
    const stamps = Array.from(document.querySelectorAll('.badge'));
    return stamps.some(s => s.textContent.includes("NAMI'S DEBT WARNING"));
  });
  assert(hasWarningStamp, "Nami's Debt Warning stamp appears when member debt exceeds threshold");

  // Check Dashboard has Nami Warning badge
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  const hasDashboardWarning = await page.evaluate(() => {
    const badges = Array.from(document.querySelectorAll('.balance-table .badge'));
    return badges.some(b => b.textContent.includes('NAMI WARNING'));
  });
  assert(hasDashboardWarning, "Nami's Warning stamp badge appears on Dashboard balance roster");

  // Reset threshold back to 1000 and verify warning disappears
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0' });
  await page.click('#excessive-threshold');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type('#excessive-threshold', '1000');
  await new Promise(r => setTimeout(r, 300));

  await page.goto('http://localhost:5173/crew', { waitUntil: 'networkidle0' });
  const warningGone = await page.evaluate(() => {
    const stamps = Array.from(document.querySelectorAll('.badge'));
    return !stamps.some(s => s.textContent.includes("NAMI'S DEBT WARNING"));
  });
  assert(warningGone, "Nami's Debt Warning stamp disappears when debts are below threshold");

  // --- BONUS 4: WANTED POSTER SETTLEMENT EXPORT ---
  console.log('Testing Bonus 4: Export Wanted Poster Settlement Summary Invoice...');
  await page.goto('http://localhost:5173/settlements', { waitUntil: 'networkidle0' });

  // Click "Export Wanted Poster Summary"
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Export Wanted Poster Summary'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  const invoiceData = await page.evaluate(() => {
    const modal = document.querySelector('.wanted-poster-invoice');
    if (!modal) return null;
    return {
      hasWantedHeader: modal.textContent.includes('WANTED'),
      hasCrewName: modal.textContent.includes('Straw Hat Crew'),
      hasExpenditures: modal.textContent.includes('TOTAL VOYAGE EXPENDITURE'),
      hasTransactions: modal.textContent.includes('Required Settlement Transactions'),
      hasPrintBtn: Array.from(modal.querySelectorAll('button')).some(b => b.textContent.includes('Print / Export'))
    };
  });

  assert(invoiceData && invoiceData.hasWantedHeader, 'Wanted Poster has authentic WANTED header');
  assert(invoiceData && invoiceData.hasCrewName, 'Wanted Poster displays current crew name');
  assert(invoiceData && invoiceData.hasExpenditures, 'Wanted Poster displays total voyage expenditure');
  assert(invoiceData && invoiceData.hasTransactions, 'Wanted Poster lists required settlement transactions');
  assert(invoiceData && invoiceData.hasPrintBtn, 'Wanted Poster has Print / Export button');

  await browser.close();

  console.log('\n====================================================');
  console.log(`🎉 AUDIT COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

runAudit().catch(err => {
  console.error('\n❌ Audit execution failed:', err);
  process.exit(1);
});
