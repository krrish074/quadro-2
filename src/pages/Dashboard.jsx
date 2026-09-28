/**
 * GRAND LINE LEDGER - Ultimate Pirate Financial Command Center Dashboard
 * Visual Hierarchy:
 * 1. Hero Voyage Header (Cinematic Captain's Deck)
 * 2. Treasure Statistics (Themed Financial Plaques)
 * 3. Voyage Settlement Status (Horizontal Progress Track)
 * 4. Crew Treasury Ledger (Parchment Ledger Surface)
 * 5. Spending Visualization (Circular Donut SVG Chart)
 * 6. Debt Routes (Bilateral Nautical Sea Lanes)
 * 7. Captain's Logbook (Chronological Timeline)
 * 8. Quartermaster Quick Actions (Command Deck)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { formatBeli, formatDate, getCategoryMeta, spawnCoins } from '../utils/helpers';
import {
  calculateBalances,
  calculateDebts,
  calculateTotalExpenses,
  calculateTotalSettled,
  calculateCategorySpending
} from '../utils/calculations';

/* ---------------- Circular SVG Donut Chart Component ---------------- */
function SpendingDonutChart({ categorySpending, totalSpent, currency }) {
  const radius = 60;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius; // ~376.99
  
  const entries = Object.entries(categorySpending).filter(([_, amt]) => amt > 0);
  
  let accumulatedFraction = 0;
  const slices = entries.map(([cat, amt]) => {
    const meta = getCategoryMeta(cat);
    const fraction = totalSpent > 0 ? (amt / totalSpent) : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference * (1 - fraction)}`;
    const strokeDashoffset = -(accumulatedFraction * circumference);
    accumulatedFraction += fraction;
    return {
      cat,
      amt,
      meta,
      percent: Math.round(fraction * 100),
      strokeDasharray,
      strokeDashoffset,
      color: meta.color || '#d9a521'
    };
  });

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-chart-container">
        <svg viewBox="0 0 160 160" className="donut-svg">
          {/* Faint compass rose concentric guidelines */}
          <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(122,86,38,0.18)" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={strokeWidth} />
          
          {totalSpent === 0 ? (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="rgba(122,86,38,0.3)"
              strokeWidth={strokeWidth}
              strokeDasharray="4 6"
            />
          ) : (
            slices.map(slice => (
              <circle
                key={slice.cat}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                transform="rotate(-90 80 80)"
                className="donut-segment"
              >
                <title>{`${slice.cat}: ${formatBeli(slice.amt, currency)} (${slice.percent}%)`}</title>
              </circle>
            ))
          )}

          {/* Center Hole Information */}
          <g className="donut-center-group">
            <text x="80" y="72" textAnchor="middle" className="donut-center-label">TOTAL</text>
            <text x="80" y="93" textAnchor="middle" className="donut-center-value">
              {formatBeli(totalSpent, currency)}
            </text>
          </g>
        </svg>
      </div>

      {/* Legend Grid */}
      <div className="donut-legend-grid">
        {slices.length === 0 ? (
          <div className="empty-notice" style={{ gridColumn: 'span 2' }}>
            No provisions logged for this voyage yet.
          </div>
        ) : (
          slices.map(slice => (
            <div key={slice.cat} className="donut-legend-item">
              <span className="legend-bullet" style={{ backgroundColor: slice.color }}></span>
              <span className="legend-cat">{slice.meta.icon} {slice.cat}</span>
              <span className="legend-val">{formatBeli(slice.amt, currency)}</span>
              <span className="legend-pct">{slice.percent}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ onOpenNewCrewModal }) {
  const { state, currentCrew, playSound } = useApp();
  const navigate = useNavigate();

  // If no crew exists, show full-screen onboarding hero
  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create Your First Crew"
      />
    );
  }

  const currency = state.settings.currency || '฿';
  const members = currentCrew.members || [];
  const expenses = currentCrew.expenses || [];
  const settlements = currentCrew.settlements || [];

  // 1. Pure Financial Calculations
  const { balances, totalPaid, totalOwed } = calculateBalances(currentCrew);
  const debts = calculateDebts(currentCrew);
  const totalSpent = calculateTotalExpenses(currentCrew);
  const totalSettled = calculateTotalSettled(currentCrew);
  const categorySpending = calculateCategorySpending(currentCrew);

  // Captain / Primary balance
  const captain = members[0] || null;
  const captainBalance = captain ? (balances[captain.id] || 0) : 0;
  const captainOwes = captainBalance < -0.01 ? Math.abs(captainBalance) : 0;
  const captainOwed = captainBalance > 0.01 ? captainBalance : 0;

  // Outstanding Debt Calculation
  const totalPositiveDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  const outstandingAmount = Math.max(0, totalPositiveDebt);
  const percentSettled = totalSpent > 0
    ? Math.min(100, Math.round((totalSettled / totalSpent) * 100))
    : 100;

  // Max balance for mini balance bars
  const maxBalanceAbs = Math.max(...Object.values(balances).map(b => Math.abs(b)), 1);

  // Recent 5 Expenses
  const recentExpenses = [...expenses].reverse().slice(0, 5);

  const handleQuickNav = (path) => {
    playSound('nav');
    navigate(path);
  };

  const handleSettleAction = (e) => {
    spawnCoins(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 22);
    playSound('coin');
    navigate('/settlements');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="dashboard-wrapper">
      {/* ================= 1. HERO VOYAGE HEADER ================= */}
      <header className="dashboard-hero-header">
        <div className="hero-header-left">
          <div className="hero-crew-emblem" title={currentCrew.name}>
            {currentCrew.logo || '☠️'}
          </div>
          <div className="hero-crew-title-block">
            <div className="hero-crew-name-row">
              <h1 className="hero-crew-name">{currentCrew.name}</h1>
              <span className="hero-voyage-status-badge">
                <span className="status-ping" aria-hidden="true" />
                {currentCrew.archived ? 'Archived Voyage' : 'Active Voyage'}
              </span>
            </div>
            <p className="hero-voyage-subtitle">
              Voyage Financial Overview • Laugh Tale Expedition
            </p>
          </div>
        </div>

        <div className="hero-header-right">
          <div className="hero-date-plaque">
            <span>📅</span>
            <span>{currentDate}</span>
          </div>
          <div className="hero-action-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleQuickNav('/expenses')}
            >
              🪙 Log Expense
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSettleAction}
            >
              ⚓ Settle Debts
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. TREASURE STATISTICS (THEMED FINANCIAL PLAQUES) ================= */}
      <section className="treasure-stats-grid">
        <StatCard
          label="TOTAL SPENT"
          value={formatBeli(totalSpent, currency)}
          subtitle={`${expenses.length} voyage provisions recorded`}
          icon="💰"
          variant="spent"
          onClick={() => handleQuickNav('/history')}
        />
        <StatCard
          label="CAPTAIN OWES"
          value={formatBeli(captainOwes, currency)}
          subtitle={captain ? `${captain.name}'s active debt` : 'Voyage arrears'}
          icon="📜"
          variant="debt"
          onClick={() => handleQuickNav('/debts')}
        />
        <StatCard
          label="CAPTAIN IS OWED"
          value={formatBeli(captainOwed, currency)}
          subtitle={captain ? `Receivable by ${captain.name}` : 'Net crew surplus'}
          icon="💎"
          variant="credit"
          onClick={() => handleQuickNav('/debts')}
        />
        <StatCard
          label="TOTAL SETTLED"
          value={formatBeli(totalSettled, currency)}
          subtitle={`${settlements.length} maritime accords fulfilled`}
          icon="⚓"
          variant="settled"
          onClick={() => handleQuickNav('/settlements')}
        />
      </section>

      {/* ================= 3. VOYAGE SETTLEMENT STATUS ================= */}
      <section className="voyage-status-panel">
        <div className="voyage-status-header">
          <h3 className="voyage-status-title">
            <span>⚓</span>
            <span>Voyage Settlement Status</span>
          </h3>
          <div className="voyage-metrics-row">
            <div className="voyage-metric-badge">
              <span className="metric-label">Total Expenses:</span>
              <strong className="metric-value">{formatBeli(totalSpent, currency)} TOTAL</strong>
            </div>
            <span style={{ color: 'rgba(212,160,23,0.4)' }}>•</span>
            <div className="voyage-metric-badge">
              <span className="metric-label">Settled:</span>
              <strong className="metric-value" style={{ color: '#2ecc71' }}>
                {formatBeli(totalSettled, currency)} SETTLED
              </strong>
            </div>
            <span style={{ color: 'rgba(212,160,23,0.4)' }}>•</span>
            <div className="voyage-metric-badge">
              <span className="metric-label">Outstanding:</span>
              <strong className="metric-value" style={{ color: outstandingAmount > 0 ? '#ff6b6b' : '#2ecc71' }}>
                {formatBeli(outstandingAmount, currency)} OUTSTANDING
              </strong>
            </div>
            <span className="badge badge-gold" style={{ fontSize: '0.75rem', fontWeight: '800' }}>
              {percentSettled}% CLEARED
            </span>
          </div>
        </div>

        {/* Grand Line Sea Voyage Progress Track with Animated Ship Marker */}
        <div className="voyage-progress-container">
          <div className="voyage-progress-track">
            <div
              className="voyage-progress-fill"
              style={{ width: `${percentSettled}%` }}
            />
            <div
              className="voyage-ship-marker"
              style={{ left: `${Math.min(97, Math.max(3, percentSettled))}%` }}
              title={`Voyage clearance: ${percentSettled}%`}
            >
              ⛵
            </div>
          </div>
          <div className="voyage-waypoints-row">
            <span>Loguetown (0%)</span>
            <span>Reverse Mountain</span>
            <span>Grand Line Midpoint (50%)</span>
            <span>New World</span>
            <span>Laugh Tale (100%)</span>
          </div>
        </div>
      </section>

      {/* ================= 4. MAIN TWO-COLUMN ROW: CREW TREASURY & SPENDING ================= */}
      <div className="dashboard-two-col">
        {/* LEFT: CREW TREASURY LEDGER (PARCHMENT LEDGER SURFACE) */}
        <div className="treasury-ledger-card">
          <div className="ledger-header-row">
            <div className="ledger-title-group">
              <h3 className="ledger-title">📜 Crew Treasury Ledger</h3>
              <p className="ledger-subtitle">
                Individual account balances — Net = Total Paid - Total Share
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickNav('/crew')}
            >
              👥 Manage Crew
            </button>
          </div>

          {members.length === 0 ? (
            <div className="empty-notice">No crew members aboard yet. Enlist sailors to begin.</div>
          ) : (
            <div className="table-responsive">
              <table className="balance-table">
                <thead>
                  <tr>
                    <th style={{ width: '52px' }}>Pirate</th>
                    <th>Deckhand</th>
                    <th style={{ textAlign: 'right' }}>Total Paid</th>
                    <th style={{ textAlign: 'right' }}>Total Share</th>
                    <th style={{ textAlign: 'right', minWidth: '130px' }}>Net Balance</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => {
                    const bal = balances[member.id] || 0;
                    const paid = totalPaid[member.id] || 0;
                    const owed = totalOwed[member.id] || 0;
                    const isCreditor = bal > 0.01;
                    const isDebtor = bal < -0.01;
                    const balRatio = Math.min(100, Math.round((Math.abs(bal) / maxBalanceAbs) * 100));

                    return (
                      <tr key={member.id}>
                        <td>
                          <div className="treasury-avatar-frame" title={member.name}>
                            {member.avatar || '🏴‍☠️'}
                          </div>
                        </td>
                        <td>
                          <strong className="balance-name">{member.name}</strong>
                          <div className="balance-role">{member.role || 'Deckhand'}</div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--gold-primary)' }}>
                          {formatBeli(paid, currency)}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--ink-muted)' }}>
                          {formatBeli(owed, currency)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span
                            className="balance-amount-main"
                            style={{
                              color: isCreditor ? 'var(--green-credit)' : isDebtor ? 'var(--red-debt)' : 'inherit'
                            }}
                          >
                            {isCreditor ? `+${formatBeli(bal, currency)}` : isDebtor ? `-${formatBeli(Math.abs(bal), currency)}` : formatBeli(0, currency)}
                          </span>
                          {/* Visual mini-balance meter */}
                          <div className="balance-meter-track" title={`Balance proportion: ${balRatio}%`}>
                            <div
                              className={`balance-meter-fill ${isCreditor ? 'credit' : isDebtor ? 'debt' : ''}`}
                              style={{ width: `${balRatio}%` }}
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isCreditor && <span className="badge badge-credit">RECEIVES</span>}
                          {isDebtor && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                              <span className="badge badge-debt">OWES</span>
                              {Math.abs(bal) >= (state.settings.excessiveThreshold || 1000) && (
                                <span
                                  className="badge"
                                  style={{
                                    background: '#e74c3c',
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    boxShadow: '0 0 5px rgba(231,76,60,0.5)'
                                  }}
                                  title="Nami's Debt Warning: Tab exceeds limit!"
                                >
                                  🍊 NAMI WARNING
                                </span>
                              )}
                            </div>
                          )}
                          {!isCreditor && !isDebtor && <span className="badge badge-neutral">BALANCED</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT: SPENDING BREAKDOWN (CIRCULAR DONUT SVG CHART) */}
        <div className="spending-chart-card">
          <div className="ledger-header-row">
            <div className="ledger-title-group">
              <h3 className="ledger-title">📊 Spending Breakdown</h3>
              <p className="ledger-subtitle">Provisions across voyages</p>
            </div>
            <span className="badge badge-gold">{formatBeli(totalSpent, currency)}</span>
          </div>

          <SpendingDonutChart
            categorySpending={categorySpending}
            totalSpent={totalSpent}
            currency={currency}
          />
        </div>
      </div>

      {/* ================= 5. SECOND TWO-COLUMN ROW: DEBT ROUTES & CAPTAIN'S LOG ================= */}
      <div className="dashboard-two-col">
        {/* LEFT: DEBT ROUTES (BOUNTY / TREASURY SURFACE) */}
        <div className="debt-routes-card">
          <div className="debt-routes-header">
            <div>
              <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.65rem', color: 'var(--gold-bright)', margin: 0 }}>
                ⚓ Debt Routes & Settlement Flow
              </h3>
              <p style={{ margin: '2px 0 0 0', color: '#c9b486', fontSize: '0.84rem' }}>
                Bilateral navigational channels required to square the deck
              </p>
            </div>
            <div className="flex-row gap-xs">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickNav('/debts')}
              >
                View Debts
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSettleAction}
              >
                ⚡ Generate Settlement Plan
              </button>
            </div>
          </div>

          {debts.length === 0 ? (
            <div className="text-center" style={{ padding: '2.5rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌊</div>
              <h4 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-bright)' }}>
                Clear Skies Across the Grand Line
              </h4>
              <p style={{ color: '#a4916a', fontSize: '0.9rem' }}>
                All crew balances are squared away! No pirate owes anything.
              </p>
            </div>
          ) : (
            <div className="debt-routes-list">
              {debts.map(d => {
                const debtor = members.find(m => m.id === d.debtorId);
                const creditor = members.find(m => m.id === d.creditorId);

                return (
                  <div key={`${d.debtorId}-${d.creditorId}`} className="debt-route-item">
                    {/* Debtor Node */}
                    <div className="route-pirate-node">
                      <div className="route-avatar">{debtor ? debtor.avatar : '🏴‍☠️'}</div>
                      <div className="route-pirate-info">
                        <span className="route-pirate-name" style={{ color: '#ff7675' }}>
                          {debtor ? debtor.name : 'Debtor'}
                        </span>
                        <span className="route-pirate-role">Payer (Owes)</span>
                      </div>
                    </div>

                    {/* Animated Nautical Route Lane */}
                    <div className="route-channel">
                      <div className="route-line" />
                      <div className="route-ship-indicator" aria-hidden="true">⛵</div>
                      <div className="route-amount-pill">
                        {formatBeli(d.amount, currency)}
                      </div>
                    </div>

                    {/* Creditor Node */}
                    <div className="route-pirate-node">
                      <div className="route-avatar">{creditor ? creditor.avatar : '👑'}</div>
                      <div className="route-pirate-info">
                        <span className="route-pirate-name" style={{ color: '#55efc4' }}>
                          {creditor ? creditor.name : 'Creditor'}
                        </span>
                        <span className="route-pirate-role">Recipient</span>
                      </div>
                    </div>

                    {/* Settle Action */}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleSettleAction}
                    >
                      Settle Route
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: CAPTAIN'S LOGBOOK (PARCHMENT LEDGER SURFACE) */}
        <div className="captains-log-card">
          <div className="ledger-header-row">
            <div className="ledger-title-group">
              <h3 className="ledger-title">📜 Captain's Logbook</h3>
              <p className="ledger-subtitle">Chronological record of recent expenditures</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickNav('/history')}
            >
              Inspect Ledger
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="empty-notice">No expenditures recorded in this logbook yet.</div>
          ) : (
            <div className="logbook-entries-list">
              {recentExpenses.map(exp => {
                const payer = members.find(m => m.id === (exp.paidBy || Object.keys(exp.payments || {})[0]));
                const meta = getCategoryMeta(exp.category);

                return (
                  <div key={exp.id} className="logbook-entry-row">
                    <div className="logbook-entry-left">
                      <div className="logbook-seal" title={exp.category}>
                        {meta.icon}
                      </div>
                      <div>
                        <div className="recent-exp-title">{exp.name || exp.description}</div>
                        <div className="recent-exp-sub">
                          {payer ? payer.name : 'Unknown'} • {formatDate(exp.date)}
                        </div>
                      </div>
                    </div>
                    <span className="recent-exp-amount">
                      {formatBeli(exp.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= 6. QUARTERMASTER COMMAND ACTIONS ================= */}
      <section className="command-actions-deck">
        <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.65rem', color: 'var(--gold-bright)', margin: 0 }}>
          ⚓ Quartermaster Command Deck
        </h3>
        <p style={{ margin: '4px 0 0 0', color: '#c9b486', fontSize: '0.88rem' }}>
          Instant maritime operations to manage provisions, balance debts, and navigate the Grand Line
        </p>

        <div className="command-actions-grid">
          <div className="command-action-tile" onClick={() => handleQuickNav('/expenses')} role="button" tabIndex={0}>
            <span className="tile-icon">🪙</span>
            <span className="tile-label">LOG EXPENSE</span>
            <span className="tile-sub">Record shared provisions</span>
          </div>

          <div className="command-action-tile" onClick={() => handleQuickNav('/settlements')} role="button" tabIndex={0}>
            <span className="tile-icon">⚖️</span>
            <span className="tile-label">SETTLE DEBTS</span>
            <span className="tile-sub">Execute optimal transfers</span>
          </div>

          <div className="command-action-tile" onClick={() => handleQuickNav('/crew')} role="button" tabIndex={0}>
            <span className="tile-icon">👥</span>
            <span className="tile-label">MANAGE CREW</span>
            <span className="tile-sub">Enlist or plank pirates</span>
          </div>

          <div className="command-action-tile" onClick={() => handleQuickNav('/history')} role="button" tabIndex={0}>
            <span className="tile-icon">📜</span>
            <span className="tile-label">VIEW LOGBOOK</span>
            <span className="tile-sub">Browse full historical ledger</span>
          </div>
        </div>
      </section>
    </div>
  );
}
