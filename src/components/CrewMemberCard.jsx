/**
 * GRAND LINE LEDGER - CrewMemberCard Component
 * Modern fintech-inspired member card with clean financial layout
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

  const cardClass = `member-card crew-card ${isCreditor ? 'member-card--creditor' : isDebtor ? 'member-card--debtor' : ''}`;

  const balanceDisplay = isCreditor
    ? `+${formatBeli(balance, currency)}`
    : isDebtor
    ? `-${formatBeli(Math.abs(balance), currency)}`
    : formatBeli(0, currency);

  const balanceColorClass = isCreditor
    ? 'member-card__stat-value--positive'
    : isDebtor
    ? 'member-card__stat-value--negative'
    : 'member-card__stat-value--neutral';

  return (
    <div className={cardClass}>
      {/* Header: Avatar + Name + Rank */}
      <div className="member-card__header">
        <div className="member-card__identity">
          <div className="member-card__avatar">
            {member.avatar || '🏴‍☠️'}
          </div>
          <div>
            <h4 className="member-card__name">{member.name}</h4>
            <div className="member-card__role">{member.role || member.nickname || 'Deckhand'}</div>
          </div>
        </div>

        <div className="member-card__rank-badge" title={haki.desc}>
          {haki.badge} {haki.title}
        </div>
      </div>

      {/* Financial Summary: Paid / Share / Net Balance */}
      <div className="member-card__financials">
        <div className="member-card__stat">
          <div className="member-card__stat-label">Paid</div>
          <div className="member-card__stat-value member-card__stat-value--paid">
            {formatBeli(totalPaid, currency)}
          </div>
        </div>
        <div className="member-card__stat">
          <div className="member-card__stat-label">Share</div>
          <div className="member-card__stat-value member-card__stat-value--share">
            {formatBeli(totalOwed, currency)}
          </div>
        </div>
        <div className="member-card__stat">
          <div className="member-card__stat-label">Net</div>
          <div className={`member-card__stat-value ${balanceColorClass}`}>
            {balanceDisplay}
          </div>
        </div>
      </div>

      {/* Footer: Status + Actions */}
      <div className="member-card__footer">
        <div>
          {isCreditor && (
            <span className="member-card__status-badge member-card__status-badge--credit badge">
              RECEIVES SHARE
            </span>
          )}
          {isDebtor && !isExcessiveDebt && (
            <span className="member-card__status-badge member-card__status-badge--debt badge">
              OWES CREW
            </span>
          )}
          {isExcessiveDebt && (
            <span
              className="member-card__status-badge member-card__status-badge--warning badge"
              title={`Debt exceeds ${currency}${excessiveThreshold}`}
            >
              🍊 NAMI'S DEBT WARNING
            </span>
          )}
          {isSettled && (
            <span className="member-card__status-badge member-card__status-badge--balanced badge">
              BALANCED
            </span>
          )}
        </div>

        <div className="member-card__actions">
          {onViewDetails && (
            <button
              type="button"
              className="member-card__action-btn member-card__action-btn--ledger"
              onClick={() => onViewDetails(member)}
              title="View member ledger"
            >
              Ledger
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              className="member-card__action-btn member-card__action-btn--remove btn-danger"
              onClick={() => onRemove(member.id)}
              title="Remove member"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
