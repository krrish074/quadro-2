/**
 * GRAND LINE LEDGER - NamiReminders Component
 * Navigator & Treasurer Nami's strict debt enforcement, interest calculations, and warning dispatch
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { calculateBalances, generateSettlementPlan } from '../utils/calculations';
import { formatBeli, spawnCoins } from '../utils/helpers';

export default function NamiReminders({ onOpenNewCrewModal }) {
  const { state, currentCrew, dismissNamiReminder, recordSettlement, playSound } = useApp();
  const navigate = useNavigate();

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create Crew for Nami's Ledger"
      />
    );
  }

  const members = currentCrew.members || [];
  const currency = state.settings.currency || '฿';
  const { balances } = calculateBalances(currentCrew);
  const plan = generateSettlementPlan(balances);
  const dismissed = currentCrew.dismissedReminders || {};

  // Debtor members whose reminders have not been dismissed
  const activeDebtors = members.filter(m => (balances[m.id] || 0) < -0.01);
  const pendingReminders = activeDebtors.filter(m => !dismissed[m.id]);

  const handleSettleDebtor = (memberId) => {
    const transfers = plan.filter(p => p.from === memberId);
    if (!transfers.length) return;

    transfers.forEach(t => {
      recordSettlement(currentCrew.id, {
        from: t.from,
        to: t.to,
        amount: t.amount
      });
    });

    spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 25);
  };

  const handleDismiss = (memberId) => {
    dismissNamiReminder(currentCrew.id, memberId);
  };

  return (
    <div className="nami-reminders-page view-enter">
      <PageHeader
        icon="🍊"
        title="Nami's Debt Reminders"
        subtitle={`The Navigator's strict account book for ${currentCrew.name}`}
      />

      {/* Nami Treasurer Header Banner */}
      <div
        className="card-ocean surface-ocean"
        style={{
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(230, 126, 34, 0.22), rgba(15, 28, 49, 0.95))',
          border: '1.5px solid rgba(230, 126, 34, 0.45)',
          padding: '1.25rem 1.5rem'
        }}
      >
        <div className="flex-row gap-md align-center">
          <div style={{ fontSize: '3rem' }}>🍊</div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.6rem', color: 'var(--gold-bright)', margin: '0 0 0.25rem 0' }}>
              "Money comes first, friends come second!"
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary-light)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Nami tracks every single Beli borrowed on shore leave. Failure to clear your balance will result in a 300% pirate surcharge applied by the Cat Burglar!
            </p>
          </div>
        </div>
      </div>

      {/* Reminder Cards */}
      {pendingReminders.length === 0 ? (
        <div className="card-ocean surface-ocean text-center view-enter" style={{ padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🍊✨</div>
          <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.8rem', color: 'var(--credit-green)', margin: '0 0 0.5rem 0' }}>
            Nami is Satisfied!
          </h3>
          <p style={{ color: 'var(--text-secondary-light)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
            No overdue warnings are currently pending. All crew members have either settled up or had their notices dismissed.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Return to Command Center
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingReminders.map(member => {
            const debt = Math.abs(balances[member.id] || 0);
            const interest = Math.round(debt * 0.1 * 100) / 100; // 10% mock interest

            return (
              <div
                key={member.id}
                className="card-ocean surface-ocean view-enter"
                style={{
                  borderLeft: '5px solid #e67e22',
                  background: 'linear-gradient(135deg, rgba(230, 126, 34, 0.14), rgba(15, 38, 68, 0.95))',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <div className="flex-between align-center flex-wrap gap-md">
                  <div className="flex-row gap-md align-center">
                    <div style={{ fontSize: '2.5rem' }}>{member.avatar || '🏴‍☠️'}</div>
                    <div>
                      <div className="flex-row gap-xs align-center">
                        <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary-light)', letterSpacing: '0.5px' }}>
                          {member.name}
                        </strong>
                        <span className="badge badge-debt" style={{ fontSize: '0.72rem', fontWeight: '800' }}>
                          OVERDUE TAB
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary-light)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                        Base Debt: <strong style={{ color: 'var(--debt-red)' }}>{formatBeli(debt, currency)}</strong> + Nami's 10% Interest: <strong style={{ color: 'var(--gold-bright)' }}>{formatBeli(interest, currency)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex-row gap-sm align-center">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDismiss(member.id)}
                    >
                      Dismiss Warning
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSettleDebtor(member.id)}
                    >
                      ⚓ Settle Debt Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
