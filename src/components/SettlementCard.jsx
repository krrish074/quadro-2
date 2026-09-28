/**
 * GRAND LINE LEDGER - SettlementCard Component
 * Displays a completed settlement transaction receipt
 */
import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBeli, formatDate } from '../utils/helpers';

export default function SettlementCard({ settlement, onPrintInvoice }) {
  const { state, currentCrew } = useApp();
  const currency = state.settings.currency || '฿';

  const payerId = settlement.from || settlement.fromMemberId;
  const receiverId = settlement.to || settlement.toMemberId;

  const payer = currentCrew?.members.find(m => m.id === payerId);
  const receiver = currentCrew?.members.find(m => m.id === receiverId);

  const payerName = payer ? payer.name : (settlement.fromName || 'Pirate');
  const receiverName = receiver ? receiver.name : (settlement.toName || 'Pirate');

  return (
    <div className="parchment-card settlement-card view-enter" style={{ borderLeft: '4px solid var(--credit-green)', marginBottom: '0.85rem' }}>
      <div className="flex-between align-center flex-wrap gap-sm">
        <div className="flex-row gap-md align-center">
          <div
            style={{
              fontSize: '1.5rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(46, 204, 113, 0.15)',
              border: '1px solid var(--credit-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ⚓
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', color: 'var(--text-primary-dark)' }}>
              <strong>{payerName}</strong> transferred to <strong>{receiverName}</strong>
            </div>
            <div className="flex-row gap-xs align-center" style={{ fontSize: '0.82rem', color: 'var(--text-secondary-dark)', marginTop: '0.2rem' }}>
              <span>📅 {formatDate(settlement.date)}</span>
              {settlement.method && (
                <>
                  <span>•</span>
                  <span>Method: {settlement.method}</span>
                </>
              )}
              {settlement.note && (
                <>
                  <span>•</span>
                  <span style={{ fontStyle: 'italic' }}>"{settlement.note}"</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-row gap-md align-center">
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontFamily: 'var(--font-pirate)',
                fontSize: '1.5rem',
                color: 'var(--credit-green)'
              }}
            >
              {formatBeli(settlement.amount, currency)}
            </span>
            <div className="badge badge-credit" style={{ display: 'block', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              PAID & DISCHARGED
            </div>
          </div>

          {onPrintInvoice && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onPrintInvoice(settlement)}
              title="Wanted Poster Discharge Receipt"
            >
              📜 Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
