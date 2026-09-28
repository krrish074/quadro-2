/**
 * GRAND LINE LEDGER - CrewMemberCard Component
 * Renders individual pirate cards with avatar, bounty, Haki rank, and net balance
 */
import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBeli, getHakiRank } from '../utils/helpers';

export default function CrewMemberCard({
  member,
  balance = 0,
  totalPaid = 0,
  totalOwed = 0,
  onRemove,
  onViewDetails
}) {
  const { state } = useApp();
  const currency = state.settings.currency || '฿';
  const excessiveThreshold = state.settings.excessiveThreshold || 1000;
  const haki = getHakiRank(balance);

  const isCreditor = balance > 0.01;
  const isDebtor = balance < -0.01;
  const isSettled = !isCreditor && !isDebtor;
  const isExcessiveDebt = isDebtor && Math.abs(balance) >= excessiveThreshold;

  return (
    <div className={`parchment-card crew-card ${isDebtor ? 'debt-border' : isCreditor ? 'credit-border' : ''}`}>
      <div className="flex-between align-center" style={{ marginBottom: '0.75rem' }}>
        <div className="flex-row gap-sm align-center">
          <div className="crew-avatar" title={member.name}>
            {member.avatar || '🏴‍☠️'}
          </div>
          <div>
            <h4 style={{ margin: 0, fontFamily: 'var(--font-pirate)', fontSize: '1.3rem', color: 'var(--text-primary-dark)' }}>
              {member.name}
            </h4>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary-dark)' }}>
              {member.role || 'Deckhand'}
            </div>
          </div>
        </div>

        <div className="haki-badge" title={haki.desc}>
          {haki.badge} {haki.title}
        </div>
      </div>

      {/* Balance Summary Pill */}
      <div
        style={{
          background: isCreditor
            ? 'rgba(46, 204, 113, 0.15)'
            : isDebtor
            ? 'rgba(231, 76, 60, 0.15)'
            : 'rgba(122, 86, 38, 0.08)',
          border: `1px solid ${
            isCreditor ? 'var(--credit-green)' : isDebtor ? 'var(--debt-red)' : 'var(--border-parchment)'
          }`,
          borderRadius: '8px',
          padding: '0.6rem 0.8rem',
          margin: '0.75rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Net Balance:</span>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: isCreditor ? 'var(--credit-green)' : isDebtor ? 'var(--debt-red)' : 'var(--text-primary-dark)'
          }}
        >
          {isCreditor ? `+${formatBeli(balance, currency)}` : isDebtor ? `-${formatBeli(Math.abs(balance), currency)}` : `${formatBeli(0, currency)}`}
        </span>
      </div>

      {/* Detailed numbers */}
      <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary-dark)', marginBottom: '0.8rem' }}>
        <div>
          <span>Total Paid: </span>
          <strong style={{ color: 'var(--gold-primary)' }}>{formatBeli(totalPaid, currency)}</strong>
        </div>
        <div>
          <span>Total Share: </span>
          <strong style={{ color: 'var(--text-primary-dark)' }}>{formatBeli(totalOwed, currency)}</strong>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex-between align-center" style={{ paddingTop: '0.5rem', borderTop: '1px dashed var(--border-parchment)' }}>
        <div>
          {isCreditor && <span className="badge badge-credit">RECEIVES SHARE</span>}
          {isDebtor && <span className="badge badge-debt">OWES CREW</span>}
          {isExcessiveDebt && (
            <span
              className="badge"
              style={{
                background: '#e74c3c',
                color: '#fff',
                marginLeft: '6px',
                fontWeight: 'bold',
                fontSize: '0.72rem',
                border: '1px solid #c0392b',
                boxShadow: '0 0 6px rgba(231,76,60,0.5)',
                display: 'inline-block'
              }}
              title={`Nami's Warning: Debt exceeds ฿${excessiveThreshold}!`}
            >
              🍊 NAMI'S DEBT WARNING
            </span>
          )}
          {isSettled && <span className="badge badge-neutral">BALANCED</span>}
        </div>

        <div className="flex-row gap-xs">
          {onViewDetails && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDetails(member)}
              title="View member ledger"
            >
              Ledger
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onRemove(member.id)}
              title="Walk the plank (Remove)"
            >
              Plank
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
