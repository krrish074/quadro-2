/**
 * GRAND LINE LEDGER - Settlements Component
 * Greedy bilateral settlement engine, execution cards, transaction history, and Wanted Poster invoice generation
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SettlementCard from '../components/SettlementCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { calculateBalances, generateSettlementPlan, calculateTotalSettled, calculateTotalExpenses } from '../utils/calculations';
import { formatBeli, spawnCoins } from '../utils/helpers';

export default function Settlements({ onOpenNewCrewModal }) {
  const { state, currentCrew, recordSettlement, settleEntireCrew, playSound } = useApp();
  const navigate = useNavigate();

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [isSummaryInvoiceOpen, setIsSummaryInvoiceOpen] = useState(false);

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create a Crew to Settle"
      />
    );
  }

  const currency = state.settings.currency || '฿';
  const members = currentCrew.members || [];
  const settlements = currentCrew.settlements || [];
  const { balances } = calculateBalances(currentCrew);
  const plan = generateSettlementPlan(balances);
  const totalSettled = calculateTotalSettled(currentCrew);

  const handleSettleOne = (item) => {
    recordSettlement(currentCrew.id, {
      from: item.from,
      to: item.to,
      amount: item.amount
    });
    spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 20);
  };

  const handleSettleAll = () => {
    if (window.confirm('Execute complete settlement for the entire crew? All outstanding balances will square to ฿0!')) {
      settleEntireCrew(currentCrew.id);
      spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 35);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="settlements-page view-enter">
      <PageHeader
        icon="⚓"
        title="Settlement Command Deck"
        subtitle={`Optimized debt resolution via Greedy Bilateral Matching for ${currentCrew.name}`}
        actions={
          <div className="flex-row gap-xs">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSummaryInvoiceOpen(true)}
            >
              📜 Export Wanted Poster Summary
            </button>
            {plan.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSettleAll}
              >
                🌊 Settle Entire Crew ({plan.length} Transfers)
              </button>
            )}
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-3 gap-md" style={{ marginBottom: '1.75rem' }}>
        <div className="parchment-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary-dark)', fontWeight: 'bold' }}>Required Transfers</div>
          <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2.2rem', color: plan.length ? 'var(--debt-red)' : 'var(--credit-green)' }}>
            {plan.length}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary-dark)' }}>
            {plan.length ? 'Transfers needed to balance' : 'All accounts balanced'}
          </div>
        </div>

        <div className="parchment-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary-dark)', fontWeight: 'bold' }}>Pending Clearance</div>
          <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2.2rem', color: 'var(--gold-primary)' }}>
            {formatBeli(plan.reduce((s, p) => s + p.amount, 0), currency)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary-dark)' }}>
            Minimal total cash flow
          </div>
        </div>

        <div className="parchment-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary-dark)', fontWeight: 'bold' }}>Historical Settled</div>
          <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2.2rem', color: 'var(--credit-green)' }}>
            {formatBeli(totalSettled, currency)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary-dark)' }}>
            {settlements.length} transactions executed
          </div>
        </div>
      </div>

      {/* Active Settlement Plan Section */}
      <div className="parchment-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between align-center" style={{ marginBottom: '1.25rem', borderBottom: '1px dashed var(--border-parchment)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--text-primary-dark)', margin: 0 }}>
              ⚡ Optimal Settlement Plan
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary-dark)', fontSize: '0.88rem' }}>
              Minimum number of bilateral payments calculated using greedy matching
            </p>
          </div>
          {plan.length > 0 && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSettleAll}
            >
              Clear All Debts
            </button>
          )}
        </div>

        {plan.length === 0 ? (
          <div className="text-center" style={{ padding: '2.5rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h4 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.6rem', color: 'var(--text-primary-dark)' }}>
              All Voyage Balances are Square!
            </h4>
            <p style={{ color: 'var(--text-secondary-dark)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
              No pirate owes any Beli. Everyone has contributed their rightful share of expenses.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/expenses')}
            >
              Log New Voyage Expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {plan.map((item, index) => {
              const fromMember = members.find(m => m.id === item.from);
              const toMember = members.find(m => m.id === item.to);

              return (
                <div
                  key={`${item.from}-${item.to}-${index}`}
                  className="flex-between align-center flex-wrap gap-md"
                  style={{
                    background: 'rgba(122,86,38,0.08)',
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--gold-primary)'
                  }}
                >
                  <div className="flex-row gap-md align-center">
                    <div className="flex-row gap-xs align-center">
                      <span style={{ fontSize: '1.75rem' }}>{fromMember ? fromMember.avatar : '🏴‍☠️'}</span>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--debt-red)' }}>
                          {fromMember ? fromMember.name : 'Pirate'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>Payer / Debtor</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '1.5rem', color: 'var(--gold-primary)', padding: '0 0.5rem' }}>
                      ➔
                    </div>

                    <div className="flex-row gap-xs align-center">
                      <span style={{ fontSize: '1.75rem' }}>{toMember ? toMember.avatar : '👑'}</span>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--credit-green)' }}>
                          {toMember ? toMember.name : 'Pirate'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>Recipient / Creditor</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-row gap-md align-center">
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.75rem', color: 'var(--gold-primary)' }}>
                        {formatBeli(item.amount, currency)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSettleOne(item)}
                    >
                      ⚓ Mark Paid (+10 Haki)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Settlements Ledger */}
      <div className="parchment-card">
        <div className="flex-between align-center" style={{ marginBottom: '1.25rem', borderBottom: '1px dashed var(--border-parchment)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--text-primary-dark)', margin: 0 }}>
              📜 Completed Settlement Records
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary-dark)', fontSize: '0.88rem' }}>
              Historical proof of discharge and Bounty clearance receipts
            </p>
          </div>
          <span className="badge badge-credit">{settlements.length} Recorded</span>
        </div>

        {settlements.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem 1rem', color: 'var(--text-secondary-dark)' }}>
            No settlements recorded yet in this voyage.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...settlements].reverse().map(st => (
              <SettlementCard
                key={st.id}
                settlement={st}
                onPrintInvoice={(s) => setActiveInvoice(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= WANTED POSTER INVOICE RECEIPT MODAL ================= */}
      {activeInvoice && (
        <Modal
          isOpen={!!activeInvoice}
          onClose={() => setActiveInvoice(null)}
          title="📜 Grand Line Discharge Receipt"
          maxWidth="550px"
        >
          {(() => {
            const payerId = activeInvoice.from || activeInvoice.fromMemberId;
            const receiverId = activeInvoice.to || activeInvoice.toMemberId;
            const payer = members.find(m => m.id === payerId);
            const receiver = members.find(m => m.id === receiverId);

            return (
              <div className="wanted-poster-invoice text-center" style={{ padding: '1.5rem', background: 'var(--parchment-light)', color: '#2c1e0e', borderRadius: '8px', border: '3px solid #8b6b3e' }}>
                <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2rem', letterSpacing: '4px', textTransform: 'uppercase', borderBottom: '2px solid #8b6b3e', paddingBottom: '0.5rem' }}>
                  WANTED
                </div>
                <div style={{ fontSize: '0.9rem', margin: '0.5rem 0', fontWeight: 'bold' }}>
                  MARINE HEADQUARTERS • SETTLEMENT DISCHARGE CERTIFICATE
                </div>

                <div style={{ fontSize: '3.5rem', margin: '1rem 0' }}>
                  {payer ? payer.avatar : '🏴‍☠️'}
                </div>

                <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.8rem', margin: '0.2rem 0' }}>
                  {payer ? payer.name : 'Pirate'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#6d5334', marginBottom: '1.25rem' }}>
                  Transferred full debt to <strong>{receiver ? receiver.name : 'Crewmate'}</strong>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.06)', padding: '0.75rem', borderRadius: '6px', margin: '1rem 0', border: '1px dashed #8b6b3e' }}>
                  <div style={{ fontSize: '0.85rem' }}>TOTAL DISCHARGED SUM:</div>
                  <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2rem', color: '#8b1e1e' }}>
                    {formatBeli(activeInvoice.amount, currency)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6d5334' }}>
                    Date: {activeInvoice.date} • Status: DISCHARGED & PAID
                  </div>
                </div>

                {/* Stamp */}
                <div
                  style={{
                    display: 'inline-block',
                    border: '3px solid #27ae60',
                    color: '#27ae60',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    padding: '0.4rem 1.25rem',
                    transform: 'rotate(-5deg)',
                    letterSpacing: '3px',
                    borderRadius: '4px',
                    margin: '0.75rem 0'
                  }}
                >
                  CLEARED & SETTLED
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveInvoice(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handlePrint}
                  >
                    🖨️ Print / Export Poster
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* ================= WANTED POSTER SETTLEMENT SUMMARY INVOICE MODAL ================= */}
      {isSummaryInvoiceOpen && (
        <Modal
          isOpen={isSummaryInvoiceOpen}
          onClose={() => setIsSummaryInvoiceOpen(false)}
          title="📜 Wanted Poster: Voyage Settlement Summary"
          maxWidth="650px"
        >
          <div
            className="wanted-poster-invoice text-center"
            style={{
              padding: '1.75rem',
              background: 'var(--parchment-light)',
              color: '#2c1e0e',
              borderRadius: '8px',
              border: '4px solid #8b6b3e',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
            }}
          >
            <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2.5rem', letterSpacing: '6px', textTransform: 'uppercase', borderBottom: '2px solid #8b6b3e', paddingBottom: '0.4rem', color: '#1a1005' }}>
              WANTED
            </div>
            <div style={{ fontSize: '0.85rem', margin: '0.5rem 0', fontWeight: 'bold', letterSpacing: '1px', color: '#6d5334' }}>
              MARINE HEADQUARTERS • VOYAGE SETTLEMENT SUMMARY INVOICE
            </div>

            <div style={{ fontSize: '2.8rem', margin: '0.75rem 0' }}>
              {currentCrew.logo || '☠️'}
            </div>

            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '2rem', margin: '0.2rem 0', color: '#1a1005' }}>
              {currentCrew.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#6d5334', marginBottom: '1.25rem' }}>
              Ledger Date: <strong>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong> • Crew Size: <strong>{members.length} Pirates</strong>
            </div>

            {/* Financial Overview Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
              <div style={{ background: 'rgba(0,0,0,0.06)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed #8b6b3e' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6d5334' }}>TOTAL VOYAGE EXPENDITURE</div>
                <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.75rem', color: '#2c1e0e' }}>
                  {formatBeli(calculateTotalExpenses(currentCrew), currency)}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.06)', padding: '0.75rem', borderRadius: '6px', border: '1px dashed #8b6b3e' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6d5334' }}>OUTSTANDING SETTLEMENT SUM</div>
                <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.75rem', color: plan.length ? '#8b1e1e' : '#27ae60' }}>
                  {formatBeli(plan.reduce((s, p) => s + p.amount, 0), currency)}
                </div>
              </div>
            </div>

            {/* Itemized Settlement Plan Transactions */}
            <div style={{ textAlign: 'left', margin: '1.25rem 0', background: 'rgba(0,0,0,0.04)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(139,107,62,0.3)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#543b1c', textTransform: 'uppercase' }}>
                📜 Required Settlement Transactions ({plan.length}):
              </div>

              {plan.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#27ae60', fontWeight: 'bold' }}>
                  ✨ All debts are fully settled! Zero transactions pending.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.map((item, idx) => {
                    const fromMember = members.find(m => m.id === item.from);
                    const toMember = members.find(m => m.id === item.to);
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.4rem 0.6rem',
                          background: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          border: '1px solid #d4c19c'
                        }}
                      >
                        <div>
                          <strong>{fromMember ? fromMember.name : 'Pirate'}</strong> (Payer)
                          <span style={{ color: '#8b6b3e', margin: '0 6px' }}>➔</span>
                          <strong>{toMember ? toMember.name : 'Pirate'}</strong> (Receiver)
                        </div>
                        <strong style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.2rem', color: '#8b1e1e' }}>
                          {formatBeli(item.amount, currency)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Official Wanted Poster Discharge Stamp */}
            <div
              style={{
                display: 'inline-block',
                border: `3px solid ${plan.length === 0 ? '#27ae60' : '#c0392b'}`,
                color: plan.length === 0 ? '#27ae60' : '#c0392b',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                padding: '0.4rem 1.5rem',
                transform: 'rotate(-4deg)',
                letterSpacing: '3px',
                borderRadius: '4px',
                margin: '0.85rem 0'
              }}
            >
              {plan.length === 0 ? 'CLEARED & SETTLED' : 'PENDING DISCHARGE'}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsSummaryInvoiceOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handlePrint}
              >
                🖨️ Print / Export Poster Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
