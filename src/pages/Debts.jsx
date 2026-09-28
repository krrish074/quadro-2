/**
 * GRAND LINE LEDGER - Debts Component
 * Pairwise itemized debt matrix, traceable source expense audit, and bilateral settlement links
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import DebtCard from '../components/DebtCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { calculateDebts, calculateBalances } from '../utils/calculations';
import { formatBeli, spawnCoins } from '../utils/helpers';

export default function Debts({ onOpenNewCrewModal }) {
  const { state, currentCrew, recordSettlement, settleEntireCrew, playSound } = useApp();
  const navigate = useNavigate();

  const [settlingDebt, setSettlingDebt] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');

  // Traceable sources modal
  const [auditDebt, setAuditDebt] = useState(null);

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create a Crew to View Debts"
      />
    );
  }

  const currency = state.settings.currency || '฿';
  const members = currentCrew.members || [];
  const debts = calculateDebts(currentCrew);
  const { balances } = calculateBalances(currentCrew);

  const totalOutstanding = debts.reduce((sum, d) => sum + d.amount, 0);

  // Map avatar and names
  const enrichedDebts = debts.map(d => {
    const debtor = members.find(m => m.id === d.debtorId);
    const creditor = members.find(m => m.id === d.creditorId);
    return {
      ...d,
      fromName: debtor ? debtor.name : 'Unknown Pirate',
      fromAvatar: debtor ? debtor.avatar : '🏴‍☠️',
      toName: creditor ? creditor.name : 'Unknown Pirate',
      toAvatar: creditor ? creditor.avatar : '👑'
    };
  });

  const handleOpenSettle = (debt) => {
    setSettlingDebt(debt);
    setSettleAmount(debt.amount.toString());
    setSettleNote(`Settling tab with ${debt.toName}`);
  };

  const handleConfirmSettle = (e) => {
    e.preventDefault();
    if (!settlingDebt) return;
    const amt = parseFloat(settleAmount);
    if (!amt || amt <= 0) return;

    recordSettlement(currentCrew.id, {
      from: settlingDebt.debtorId,
      to: settlingDebt.creditorId,
      amount: amt
    });

    spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 20);
    setSettlingDebt(null);
  };

  const handleSettleAll = () => {
    if (window.confirm('Execute complete settlement for the entire crew? All outstanding balances will square to ฿0!')) {
      settleEntireCrew(currentCrew.id);
      spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 35);
    }
  };

  return (
    <div className="debts-page view-enter">
      <PageHeader
        icon="⚖️"
        title="Crew Debts & IOUs"
        subtitle={`Itemized pairwise balances and obligations within ${currentCrew.name}`}
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/settlements')}
            >
              ⚓ View Settlement Plan
            </button>
            {debts.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSettleAll}
              >
                🌊 Settle All Debts
              </button>
            )}
          </>
        }
      />

      {/* Summary KPI Banner */}
      <div className="card-ocean surface-ocean" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(231,76,60,0.15), rgba(15,28,49,0.95))', padding: '1.25rem 1.5rem' }}>
        <div className="flex-between align-center flex-wrap gap-md">
          <div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary-light)' }}>Total Pending Crew Obligations</div>
            <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2.2rem', color: 'var(--debt-red)' }}>
              {formatBeli(totalOutstanding, currency)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>
              {debts.length} Bilateral Debts Pending
            </span>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted-light)', marginTop: '0.35rem' }}>
              Conserves ledger: Sum of all credits equals sum of all debits
            </div>
          </div>
        </div>
      </div>

      {/* Debts List */}
      {debts.length === 0 ? (
        <EmptyState
          type="no-debts"
          title="The Seas are Clear!"
          description="Every pirate is fully square. There are no outstanding debts or tavern bills owed among your crew."
          actionLabel="Log a New Expense"
          onAction={() => navigate('/expenses')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {enrichedDebts.map(debt => (
            <div key={`${debt.debtorId}-${debt.creditorId}`}>
              <DebtCard
                debt={debt}
                onSettle={handleOpenSettle}
              />
              {debt.sources && debt.sources.length > 0 && (
                <div style={{ marginTop: '-0.5rem', marginBottom: '0.75rem', paddingLeft: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-link btn-sm"
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                    onClick={() => setAuditDebt(debt)}
                  >
                    🔍 Inspect {debt.sources.length} underlying expense source{debt.sources.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= SETTLE DEBT MODAL ================= */}
      {settlingDebt && (
        <Modal
          isOpen={!!settlingDebt}
          onClose={() => setSettlingDebt(null)}
          title="⚓ Execute Debt Settlement"
          subtitle={`${settlingDebt.fromName} paying ${settlingDebt.toName}`}
        >
          <form onSubmit={handleConfirmSettle}>
            <div className="flex-between align-center" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div className="flex-row gap-xs align-center">
                <span style={{ fontSize: '1.8rem' }}>{settlingDebt.fromAvatar}</span>
                <div>
                  <strong>{settlingDebt.fromName}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--debt-red)' }}>Debtor</div>
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', color: 'var(--gold-primary)' }}>➔</div>
              <div className="flex-row gap-xs align-center">
                <span style={{ fontSize: '1.8rem' }}>{settlingDebt.toAvatar}</span>
                <div>
                  <strong>{settlingDebt.toName}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--credit-green)' }}>Creditor</div>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="settle-amt">Payment Amount ({currency})</label>
              <input
                id="settle-amt"
                type="number"
                step="0.01"
                min="0.01"
                max={settlingDebt.amount}
                className="form-control"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-secondary-dark)' }}>
                Full debt: {formatBeli(settlingDebt.amount, currency)} (Partial payment permitted)
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="settle-note">Note / Den Den Mushi Memo</label>
              <input
                id="settle-note"
                type="text"
                className="form-control"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
              />
            </div>

            <div className="flex-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSettlingDebt(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                💰 Confirm Settlement (+10 Haki)
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= TRACEABLE EXPENSES AUDIT MODAL ================= */}
      {auditDebt && (
        <Modal
          isOpen={!!auditDebt}
          onClose={() => setAuditDebt(null)}
          title="🔍 Debt Origin Traceability"
          subtitle={`Trace origin of debt between ${auditDebt.fromName} and ${auditDebt.toName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
            {auditDebt.sources.map((src, i) => (
              <div
                key={i}
                className="flex-between align-center"
                style={{
                  background: 'rgba(122,86,38,0.08)',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${src.amount >= 0 ? 'var(--debt-red)' : 'var(--credit-green)'}`
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary-dark)' }}>{src.expenseName}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>
                    📅 {src.date} {src.category ? `• ${src.category}` : ''}
                  </div>
                </div>
                <strong style={{ color: src.amount >= 0 ? 'var(--debt-red)' : 'var(--credit-green)' }}>
                  {src.amount >= 0 ? '+' : ''}{formatBeli(src.amount, currency)}
                </strong>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAuditDebt(null)}
            >
              Close Trace
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
