/**
 * GRAND LINE LEDGER - WantedBoard Component
 * One Piece style Wanted Posters generated dynamically from outstanding member debts
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { calculateBalances, generateSettlementPlan } from '../utils/calculations';
import { formatBeli, spawnCoins } from '../utils/helpers';

export default function WantedBoard({ onOpenNewCrewModal }) {
  const { state, currentCrew, recordSettlement, playSound } = useApp();
  const navigate = useNavigate();

  const [activePoster, setActivePoster] = useState(null);

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create Crew to View Wanted Board"
      />
    );
  }

  const members = currentCrew.members || [];
  const currency = state.settings.currency || '฿';
  const { balances } = calculateBalances(currentCrew);
  const plan = generateSettlementPlan(balances);

  // Filter members who owe money (debtors)
  const indebtedMembers = members.filter(m => (balances[m.id] || 0) < -0.01);
  const clearMembers = members.filter(m => (balances[m.id] || 0) >= -0.01);

  const handleSettleDebtor = (memberId) => {
    // Find transfers from this member
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
    setActivePoster(null);
  };

  return (
    <div className="wanted-board-page view-enter">
      <PageHeader
        icon="📌"
        title="Marine Bounty Board"
        subtitle={`Wanted posters for outstanding tavern tabs and uncollected debts aboard ${currentCrew.name}`}
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/settlements')}
          >
            ⚓ Open Settlements
          </button>
        }
      />

      {/* Intro Quote */}
      <div className="card-ocean surface-ocean" style={{ marginBottom: '1.75rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(231,76,60,0.18), rgba(15,28,49,0.95))', padding: '1.25rem 1.5rem' }}>
        <h4 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.45rem', color: 'var(--debt-red)', margin: '0 0 0.4rem 0' }}>
          ⚠️ "UNPAID BILLS WILL BRING MARINES TO OUR SHORE!"
        </h4>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary-light)' }}>
          Nami has issued official bounty notices. Pirates with negative balances are featured on the Wanted Board until their debts are paid to zero.
        </p>
      </div>

      {indebtedMembers.length === 0 ? (
        <div className="card-ocean surface-ocean text-center view-enter" style={{ padding: '3.5rem 1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '2rem', color: 'var(--credit-green)', margin: '0 0 0.5rem 0' }}>
            NO BOUNTIES ACTIVE!
          </h3>
          <p style={{ color: 'var(--text-secondary-light)', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            Every pirate in the crew has paid their debts. There are zero active bounties on the ship.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/expenses')}
          >
            Log New Expense
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.6rem', color: 'var(--gold-bright)', margin: '0 0 1rem 0' }}>
            ☠️ Active Debt Bounties ({indebtedMembers.length})
          </h3>
          <div className="grid grid-3 gap-lg">
            {indebtedMembers.map(member => {
              const debt = Math.abs(balances[member.id] || 0);

              return (
                <div
                  key={member.id}
                  className="wanted-poster-card"
                  style={{
                    background: '#f4e4ba',
                    color: '#2b1d0c',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-lg)',
                    border: '4px solid #8b6b3e',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top Wanted Text */}
                  <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2.2rem', letterSpacing: '4px', textTransform: 'uppercase', borderBottom: '2px solid #8b6b3e', paddingBottom: '0.2rem' }}>
                    WANTED
                  </div>

                  {/* Character Avatar Box */}
                  <div
                    style={{
                      background: '#e0c995',
                      border: '2px solid #8b6b3e',
                      borderRadius: '4px',
                      height: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '4.5rem',
                      margin: '0.8rem 0'
                    }}
                  >
                    {member.avatar || '🏴‍☠️'}
                  </div>

                  {/* DEAD OR ALIVE banner */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#543b1c' }}>
                    DEAD OR ALIVE
                  </div>

                  {/* Name */}
                  <h4 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.75rem', margin: '0.3rem 0 0.5rem 0', color: '#1a1005' }}>
                    {member.name}
                  </h4>

                  {/* Bounty Amount */}
                  <div style={{ borderTop: '2px solid #8b6b3e', paddingTop: '0.5rem', marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6d5027' }}>
                      Bounty / Unpaid Tab
                    </div>
                    <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '2rem', color: '#8b1e1e' }}>
                      {formatBeli(debt, currency)}-
                    </div>
                  </div>

                  {/* Stamp overlay */}
                  <div
                    style={{
                      border: '3px solid #c0392b',
                      color: '#c0392b',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      letterSpacing: '2px',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      transform: 'rotate(-8deg)',
                      display: 'inline-block',
                      marginBottom: '0.85rem'
                    }}
                  >
                    UNPAID DEBT
                  </div>

                  {/* Action */}
                  <div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => handleSettleDebtor(member.id)}
                    >
                      💰 Clear Tab ({formatBeli(debt, currency)})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Honorable / Balanced Crew Members */}
      {clearMembers.length > 0 && (
        <div className="parchment-card">
          <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.4rem', color: 'var(--text-primary-dark)', margin: '0 0 0.85rem 0' }}>
            🛡️ Honorable Crew Deckhands (No Active Bounties)
          </h3>
          <div className="grid grid-3 gap-md">
            {clearMembers.map(m => {
              const bal = balances[m.id] || 0;
              return (
                <div
                  key={m.id}
                  className="flex-between align-center"
                  style={{
                    background: 'rgba(122,86,38,0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(46,204,113,0.35)'
                  }}
                >
                  <div className="flex-row gap-xs align-center">
                    <span>{m.avatar}</span>
                    <strong style={{ color: 'var(--text-primary-dark)' }}>{m.name}</strong>
                  </div>
                  <span className="badge badge-credit">
                    {bal > 0.01 ? `Receives +${formatBeli(bal, currency)}` : 'Square (฿0)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
