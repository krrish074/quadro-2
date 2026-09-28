/**
 * GRAND LINE LEDGER - DebtCard Component
 * Displays bilateral debt relationship: Debtor -> Creditor -> Amount with quick settle action
 */
import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBeli } from '../utils/helpers';

export default function DebtCard({ debt, onSettle }) {
  const { state } = useApp();
  const currency = state.settings.currency || '฿';

  return (
    <div className="parchment-card debt-card view-enter" style={{ borderLeft: '4px solid var(--debt-red)', marginBottom: '0.85rem' }}>
      <div className="flex-between align-center flex-wrap gap-sm">
        {/* Debtor -> Arrow -> Creditor */}
        <div className="flex-row gap-md align-center">
          <div className="flex-row gap-xs align-center">
            <span style={{ fontSize: '1.5rem' }}>{debt.fromAvatar || '🏴‍☠️'}</span>
            <div>
              <strong style={{ color: 'var(--debt-red)', fontSize: '1.05rem' }}>{debt.fromName}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Owes Debt</div>
            </div>
          </div>

          <div style={{ fontSize: '1.3rem', color: 'var(--gold-primary)', padding: '0 0.5rem' }}>
            ➔
          </div>

          <div className="flex-row gap-xs align-center">
            <span style={{ fontSize: '1.5rem' }}>{debt.toAvatar || '👑'}</span>
            <div>
              <strong style={{ color: 'var(--credit-green)', fontSize: '1.05rem' }}>{debt.toName}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collects Share</div>
            </div>
          </div>
        </div>

        {/* Amount & Settle Button */}
        <div className="flex-row gap-md align-center">
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontFamily: 'var(--font-pirate)',
                fontSize: '1.6rem',
                color: 'var(--gold-light)'
              }}
            >
              {formatBeli(debt.amount, currency)}
            </span>
          </div>

          {onSettle && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onSettle(debt)}
            >
              ⚓ Settle Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
