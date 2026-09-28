/**
 * GRAND LINE LEDGER - Pure Financial Calculation Engine
 * 
 * Core Theorem of Ledger Balance:
 * Net Balance = (Amount Paid - Amount Owed) + (Settlements Paid - Settlements Received)
 * 
 * Mathematical Invariants:
 * 1. For each expense: Sum(Shares) === Amount.
 * 2. For each expense: Sum(Payments) === Amount.
 * 3. Total Crew Net Conservation: Sum(Balances) === 0.
 */

/**
 * Calculates net balance for every member in the crew.
 * @param {Object} crew 
 * @returns {Object} { [memberId]: number }
 */
export function calculateBalances(crew) {
  if (!crew) return {};

  const balances = {};
  const totalPaid = {};
  const totalOwed = {};

  // Initialize all known member IDs
  const allIds = new Set((crew.members || []).map(m => m.id));
  (crew.expenses || []).forEach(e => {
    Object.keys(e.shares || {}).forEach(id => allIds.add(id));
    Object.keys(e.payments || {}).forEach(id => allIds.add(id));
  });
  (crew.settlements || []).forEach(s => {
    if (s.from) allIds.add(s.from);
    if (s.to) allIds.add(s.to);
  });

  allIds.forEach(id => {
    balances[id] = 0;
    totalPaid[id] = 0;
    totalOwed[id] = 0;
  });

  // 1. Process expenses
  (crew.expenses || []).forEach(exp => {
    // Accumulate shares owed
    Object.entries(exp.shares || {}).forEach(([id, share]) => {
      totalOwed[id] = (totalOwed[id] || 0) + (Number(share) || 0);
    });

    // Accumulate payments made
    Object.entries(exp.payments || {}).forEach(([id, paid]) => {
      totalPaid[id] = (totalPaid[id] || 0) + (Number(paid) || 0);
    });
  });

  // Base balance = Paid - Owed
  allIds.forEach(id => {
    balances[id] = (totalPaid[id] || 0) - (totalOwed[id] || 0);
  });

  // 2. Adjust for settlements
  (crew.settlements || []).forEach(s => {
    if (s.status === 'paid') {
      const amt = Number(s.amount) || 0;
      balances[s.from] = (balances[s.from] || 0) + amt; // debtor paid money towards 0
      balances[s.to] = (balances[s.to] || 0) - amt;     // creditor received money towards 0
    }
  });

  // Clean precision tolerances
  allIds.forEach(id => {
    if (Math.abs(balances[id]) < 0.001) balances[id] = 0;
  });

  return { balances, totalPaid, totalOwed };
}

/**
 * Calculates itemized pairwise debts with traceable source expenses.
 * @param {Object} crew 
 * @returns {Array} List of { debtorId, creditorId, amount, sources }
 */
export function calculateDebts(crew) {
  if (!crew) return [];

  const pairMap = {}; // "debtorId>creditorId" -> { debtorId, creditorId, amount, sources }

  (crew.expenses || []).forEach(exp => {
    const net = {};

    Object.entries(exp.shares || {}).forEach(([id, share]) => {
      net[id] = (net[id] || 0) - (Number(share) || 0);
    });

    Object.entries(exp.payments || {}).forEach(([id, paid]) => {
      net[id] = (net[id] || 0) + (Number(paid) || 0);
    });

    const creditors = Object.entries(net).filter(([, v]) => v > 0.005);
    const debtors = Object.entries(net).filter(([, v]) => v < -0.005);
    const totalCredit = creditors.reduce((sum, [, v]) => sum + v, 0);

    if (totalCredit > 0.001) {
      debtors.forEach(([dId, dVal]) => {
        creditors.forEach(([cId, cVal]) => {
          const transfer = (-dVal * cVal) / totalCredit;
          const key = dId + '>' + cId;

          if (!pairMap[key]) {
            pairMap[key] = { debtorId: dId, creditorId: cId, amount: 0, sources: [] };
          }
          pairMap[key].amount += transfer;
          pairMap[key].sources.push({
            expenseName: exp.name,
            amount: transfer,
            expenseId: exp.id,
            date: exp.date,
            category: exp.category
          });
        });
      });
    }
  });

  // Apply settlements to reduce pairwise debts
  (crew.settlements || []).forEach(s => {
    if (s.status === 'paid') {
      const amt = Number(s.amount) || 0;
      const key = s.from + '>' + s.to;
      if (!pairMap[key]) {
        pairMap[key] = { debtorId: s.from, creditorId: s.to, amount: 0, sources: [] };
      }
      pairMap[key].amount -= amt;
      pairMap[key].sources.push({
        expenseName: 'Settlement Payment',
        amount: -amt,
        date: s.date,
        settlementId: s.id
      });
    }
  });

  // Net reciprocal debts between pairs (A owes B vs B owes A)
  const reconciled = [];
  const processed = new Set();

  Object.values(pairMap).forEach(p => {
    const pairId = [p.debtorId, p.creditorId].sort().join('<->');
    if (processed.has(pairId)) return;
    processed.add(pairId);

    const fwd = pairMap[p.debtorId + '>' + p.creditorId]?.amount || 0;
    const rev = pairMap[p.creditorId + '>' + p.debtorId]?.amount || 0;
    const net = fwd - rev;

    const fwdSrc = pairMap[p.debtorId + '>' + p.creditorId]?.sources || [];
    const revSrc = (pairMap[p.creditorId + '>' + p.debtorId]?.sources || []).map(s => ({ ...s, amount: -s.amount }));
    const combined = [...fwdSrc, ...revSrc];

    if (net > 0.01) {
      reconciled.push({
        debtorId: p.debtorId,
        creditorId: p.creditorId,
        amount: Math.round(net * 100) / 100,
        sources: combined
      });
    } else if (net < -0.01) {
      reconciled.push({
        debtorId: p.creditorId,
        creditorId: p.debtorId,
        amount: Math.round(-net * 100) / 100,
        sources: combined.map(s => ({ ...s, amount: -s.amount }))
      });
    }
  });

  return reconciled;
}

/**
 * BONUS 1: GRAPH-BASED DEBT SIMPLIFICATION ALGORITHM (Greedy Bilateral Netting)
 * 
 * Mathematical Formulation:
 * - Given a directed debt graph G = (V, E) where edge (u, v) with weight w represents u owing v.
 * - Raw transactions across expenses can require up to O(|V|^2) bilateral transfers with circular debts.
 * - Divergence / Net Balance at vertex v: Net(v) = TotalPaid(v) - TotalOwed(v).
 * - Ledger Conservation Law: Sum_{v in V} Net(v) === 0.
 * 
 * Simplification Strategy:
 * 1. Partition vertices into Creditors (Net > 0) and Debtors (Net < 0).
 * 2. Sort creditors and debtors in descending order of outstanding magnitude (Greedy Matching).
 * 3. Match the maximum debtor D with the maximum creditor C, executing transfer T = min(|Net(D)|, Net(C)).
 * 4. At each step, either the debtor's balance or creditor's balance is completely satisfied (reduced to 0).
 * 5. Guarantees termination in at most |V| - 1 transactions (spanning forest of settlement transfers),
 *    strictly minimizing total transactions compared to raw pairwise transactions.
 * 6. Conservation Invariant: Sum of all transfers received === Sum of all transfers paid.
 * 
 * @param {Object} balances - { [memberId]: netBalance }
 * @returns {Array} List of { from, to, amount }
 */
export function generateSettlementPlan(balances) {
  if (!balances) return [];

  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([id, bal]) => {
    if (bal > 0.01) {
      creditors.push({ id, amount: bal });
    } else if (bal < -0.01) {
      debtors.push({ id, amount: -bal });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const plan = [];
  let c = 0;
  let d = 0;

  const cr = creditors.map(x => ({ ...x }));
  const de = debtors.map(x => ({ ...x }));

  while (c < cr.length && d < de.length) {
    const payment = Math.min(cr[c].amount, de[d].amount);

    if (payment > 0.01) {
      plan.push({
        from: de[d].id,
        to: cr[c].id,
        amount: Math.round(payment * 100) / 100
      });
    }

    cr[c].amount -= payment;
    de[d].amount -= payment;

    if (cr[c].amount <= 0.01) c++;
    if (de[d].amount <= 0.01) d++;
  }

  return plan;
}

/**
 * Calculates total expenses in the crew.
 */
export function calculateTotalExpenses(crew) {
  if (!crew || !crew.expenses) return 0;
  return crew.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Calculates total settlements completed.
 */
export function calculateTotalSettled(crew) {
  if (!crew || !crew.settlements) return 0;
  return crew.settlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
}

/**
 * Computes categorical spending distribution.
 */
export function calculateCategorySpending(crew) {
  const result = {};
  if (!crew || !crew.expenses) return result;

  crew.expenses.forEach(e => {
    const cat = e.category || 'Other';
    result[cat] = (result[cat] || 0) + (Number(e.amount) || 0);
  });

  return result;
}

export function validateExpenseData(amountOrObj, sharesMap, paymentsMap, participantIds) {
  let total = 0;
  let shares = {};
  let payments = {};
  let participants = [];

  if (typeof amountOrObj === 'object' && amountOrObj !== null) {
    total = Number(amountOrObj.amount) || 0;
    shares = amountOrObj.shares || amountOrObj.splits || {};
    payments = amountOrObj.payments || {};
    participants = amountOrObj.participants || Object.keys(shares);
  } else {
    total = Number(amountOrObj) || 0;
    shares = sharesMap || {};
    payments = paymentsMap || {};
    participants = participantIds || [];
  }

  const errors = [];

  if (total <= 0) {
    errors.push('Amount must be greater than zero.');
  }

  if (!participants || !participants.length) {
    errors.push('Select at least one participant.');
  }

  const sumShares = (participants || []).reduce((sum, id) => sum + (Number(shares[id]) || 0), 0);
  const sumPayments = Object.values(payments || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const shareDiff = Math.abs(sumShares - total);
  const paymentDiff = Math.abs(sumPayments - total);

  const sharesValid = shareDiff < 0.05;
  const paymentsValid = paymentDiff < 0.05;

  if (total > 0 && !sharesValid) {
    errors.push(`Shares sum (${sumShares}) does not equal total amount (${total}).`);
  }

  if (total > 0 && !paymentsValid) {
    errors.push(`Payments sum (${sumPayments}) does not equal total amount (${total}).`);
  }

  return {
    isValid: errors.length === 0 && total > 0 && (participants && participants.length > 0),
    total,
    sumShares,
    sumPayments,
    shareDiff,
    paymentDiff,
    sharesValid,
    paymentsValid,
    errors
  };
}
