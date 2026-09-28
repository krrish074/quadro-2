/**
 * GRAND LINE LEDGER - ExpenseCard Component
 * Displays a single logged expense with breakdown, participants, and edit/delete actions
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBeli, formatDate, getCategoryMeta } from '../utils/helpers';

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const { state, currentCrew } = useApp();
  const [expanded, setExpanded] = useState(false);
  const currency = state.settings.currency || '฿';
  const catMeta = getCategoryMeta(expense.category);

  // Flexible property support
  const description = expense.name || expense.description || 'Ship Expense';
  const payerId = expense.paidBy || (expense.payments && Object.keys(expense.payments)[0]);
  const shares = expense.shares || expense.splits || {};
  const participants = expense.participants && expense.participants.length
    ? expense.participants
    : Object.keys(shares);

  // Find payer member
  const payer = currentCrew?.members.find(m => m.id === payerId);
  const payerName = payer ? payer.name : 'Unknown Pirate';
  const payerAvatar = payer ? payer.avatar : '🏴‍☠️';

  const participantCount = participants.length;

  return (
    <div className="parchment-card expense-card view-enter" style={{ marginBottom: '1rem' }}>
      <div className="flex-between align-center flex-wrap gap-sm">
        {/* Left: Category Icon + Description */}
        <div className="flex-row gap-md align-center">
          <div
            style={{
              fontSize: '1.75rem',
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: 'rgba(212, 160, 23, 0.12)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {catMeta.icon}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-parchment)' }}>
              {description}
            </h4>
            <div className="flex-row gap-xs align-center" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span className="badge badge-neutral" style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}>
                {catMeta.label}
              </span>
              <span>•</span>
              <span>📅 {formatDate(expense.date)}</span>
              <span>•</span>
              <span>Paid by <strong>{payerAvatar} {payerName}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex-row gap-md align-center">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.6rem', color: 'var(--gold-primary)' }}>
              {formatBeli(expense.amount, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {expense.splitType === 'custom' ? 'Custom Split' : `Equal Split (${participantCount} crew)`}
            </div>
          </div>

          <div className="flex-row gap-xs">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Hide shares' : 'View shares breakdown'}
            >
              {expanded ? '▲' : '▼ Shares'}
            </button>
            {onEdit && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(expense)}
                title="Edit Expense"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(expense.id)}
                title="Delete Expense"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Breakdown Section */}
      {expanded && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.8rem',
            borderTop: '1px dashed var(--border-parchment)',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ fontWeight: 'bold', color: 'var(--gold-light)', marginBottom: '0.5rem' }}>
            Crew Member Shares:
          </div>
          <div className="grid grid-2 gap-sm">
            {participants.map(pId => {
              const member = currentCrew?.members.find(m => m.id === pId);
              const share = shares[pId] !== undefined
                ? shares[pId]
                : (expense.amount / (participants.length || 1));

              const isPayer = pId === payerId;

              return (
                <div
                  key={pId}
                  className="flex-between align-center"
                  style={{
                    padding: '0.4rem 0.6rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '6px',
                    border: isPayer ? '1px solid rgba(212,160,23,0.4)' : '1px solid transparent'
                  }}
                >
                  <div className="flex-row gap-xs align-center">
                    <span>{member ? member.avatar : '🏴‍☠️'}</span>
                    <span>{member ? member.name : pId}</span>
                    {isPayer && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Payer</span>}
                  </div>
                  <strong style={{ color: 'var(--text-parchment)' }}>
                    {formatBeli(share, currency)}
                  </strong>
                </div>
              );
            })}
          </div>

          {expense.notes && (
            <div style={{ marginTop: '0.6rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Note: {expense.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
