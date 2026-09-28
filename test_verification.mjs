/**
 * GRAND LINE LEDGER - Comprehensive Automated Verification Test
 * Tests core calculation logic, bilateral debt resolution, greedy settlement plan,
 * and conservation invariant (Sum of balances === 0).
 */
import {
  calculateBalances,
  calculateDebts,
  generateSettlementPlan,
  calculateTotalExpenses,
  calculateTotalSettled,
  calculateCategorySpending,
  validateExpenseData
} from './src/utils/calculations.js';

console.log('====================================================');
console.log('⚔️ GRAND LINE LEDGER - AUTOMATED TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

// ---------------- TEST 1: Section 21 Benchmark Scenario ----------------
console.log('--- TEST 1: Section 21 Benchmark Scenario ---');
const benchmarkCrew = {
  id: 'crew_strawhats',
  name: 'Straw Hat Crew',
  members: [
    { id: 'm_luffy', name: 'Luffy', avatar: '🏴‍☠️' },
    { id: 'm_zoro',  name: 'Zoro',  avatar: '⚔️' },
    { id: 'm_nami',  name: 'Nami',  avatar: '🍊' },
    { id: 'm_sanji', name: 'Sanji', avatar: '🚬' }
  ],
  expenses: [
    {
      id: 'exp_merry_dinner',
      name: 'Going Merry Dinner',
      amount: 1200,
      category: 'Food',
      date: '2026-09-28',
      participants: ['m_luffy', 'm_zoro', 'm_nami', 'm_sanji'],
      splitType: 'equal',
      shares: {
        m_luffy: 300,
        m_zoro: 300,
        m_nami: 300,
        m_sanji: 300
      },
      payments: {
        m_luffy: 1200
      },
      paidBy: 'm_luffy'
    }
  ],
  settlements: []
};

const res1 = calculateBalances(benchmarkCrew);
console.log('Initial Balances:', res1.balances);

assert(res1.balances['m_luffy'] === 900, 'Luffy balance is +฿900');
assert(res1.balances['m_zoro'] === -300, 'Zoro balance is -฿300');
assert(res1.balances['m_nami'] === -300, 'Nami balance is -฿300');
assert(res1.balances['m_sanji'] === -300, 'Sanji balance is -฿300');

// Conservation check
const sumBalances = Object.values(res1.balances).reduce((s, v) => s + v, 0);
assert(Math.abs(sumBalances) < 0.001, `Conservation Theorem: Sum of balances === 0 (${sumBalances})`);

// Plan check
const plan1 = generateSettlementPlan(res1.balances);
console.log('Generated Settlement Plan:', plan1);

assert(plan1.length === 3, 'Settlement plan has exactly 3 transfers');
assert(plan1.some(p => p.from === 'm_zoro' && p.to === 'm_luffy' && p.amount === 300), 'Zoro → Luffy ฿300');
assert(plan1.some(p => p.from === 'm_nami' && p.to === 'm_luffy' && p.amount === 300), 'Nami → Luffy ฿300');
assert(plan1.some(p => p.from === 'm_sanji' && p.to === 'm_luffy' && p.amount === 300), 'Sanji → Luffy ฿300');

// Settle all check
benchmarkCrew.settlements = plan1.map(p => ({
  id: 'set_' + p.from + '_' + p.to,
  from: p.from,
  to: p.to,
  amount: p.amount,
  status: 'paid'
}));

const resAfterSettle = calculateBalances(benchmarkCrew);
console.log('Post-Settlement Balances:', resAfterSettle.balances);
assert(resAfterSettle.balances['m_luffy'] === 0, 'Post-settle Luffy balance is ฿0');
assert(resAfterSettle.balances['m_zoro'] === 0, 'Post-settle Zoro balance is ฿0');
assert(resAfterSettle.balances['m_nami'] === 0, 'Post-settle Nami balance is ฿0');
assert(resAfterSettle.balances['m_sanji'] === 0, 'Post-settle Sanji balance is ฿0');


// ---------------- TEST 2: Custom Split and Multi-Payers ----------------
console.log('\n--- TEST 2: Custom Split and Multi-Payers ---');
const customCrew = {
  id: 'crew_custom',
  name: 'Custom Fleet',
  members: [
    { id: 'm1', name: 'Pirate 1' },
    { id: 'm2', name: 'Pirate 2' },
    { id: 'm3', name: 'Pirate 3' }
  ],
  expenses: [
    {
      id: 'exp_custom_1',
      name: 'Shipyard Timber',
      amount: 1000,
      category: 'Ship',
      participants: ['m1', 'm2', 'm3'],
      splitType: 'custom',
      shares: {
        m1: 500,
        m2: 300,
        m3: 200
      },
      payments: {
        m1: 600,
        m2: 400
      }
    }
  ],
  settlements: []
};

const res2 = calculateBalances(customCrew);
console.log('Custom Balances:', res2.balances);
// m1: paid 600, share 500 -> +100
// m2: paid 400, share 300 -> +100
// m3: paid 0,   share 200 -> -200
assert(res2.balances['m1'] === 100, 'm1 net balance is +100');
assert(res2.balances['m2'] === 100, 'm2 net balance is +100');
assert(res2.balances['m3'] === -200, 'm3 net balance is -200');

const plan2 = generateSettlementPlan(res2.balances);
console.log('Custom Settlement Plan:', plan2);
assert(plan2.length === 2, 'Settlement plan has 2 transfers');
assert(plan2.every(p => p.from === 'm3'), 'Both transfers are from m3 to creditors');


// ---------------- TEST 3: Validation Engine ----------------
console.log('\n--- TEST 3: Validation Engine ---');
const validExp = {
  name: 'Treasure Map',
  amount: 500,
  participants: ['m1', 'm2'],
  splitType: 'equal',
  shares: { m1: 250, m2: 250 },
  payments: { m1: 500 }
};
const val1 = validateExpenseData(validExp);
assert(val1.isValid === true, 'Valid expense data passes validation');

const invalidExp = {
  name: '',
  amount: 0,
  participants: [],
  shares: { m1: 100 },
  payments: { m1: 500 }
};
const val2 = validateExpenseData(invalidExp);
assert(val2.isValid === false, 'Invalid expense data fails validation with error messages');


// ---------------- TEST 4: Category Spending ----------------
console.log('\n--- TEST 4: Category Spending ---');
const catSpending = calculateCategorySpending({
  expenses: [
    { category: 'Food', amount: 300 },
    { category: 'Food', amount: 200 },
    { category: 'Ship', amount: 500 }
  ]
});
assert(catSpending['Food'] === 500, 'Food spending aggregated correctly (฿500)');
assert(catSpending['Ship'] === 500, 'Ship spending aggregated correctly (฿500)');

console.log('\n====================================================');
console.log(`FINAL RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================');
if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
