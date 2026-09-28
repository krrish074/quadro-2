/**
 * GRAND LINE LEDGER - Themed Financial Plaque Component
 * Renders distinct visual metaphors for Total Spent, Owes, Is Owed, and Settled
 */
import React from 'react';

export default function StatCard({ label, value, subtitle, icon, variant = 'gold', onClick }) {
  // Metaphor icon mappings
  const defaultIcons = {
    gold: '🪙',
    spent: '💰',
    debt: '📜',
    credit: '💎',
    ocean: '⚓'
  };

  const displayIcon = icon || defaultIcons[variant] || '💰';

  return (
    <div
      className={`stat-card stat-plaque plaque-${variant} ${variant} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-header plaque-header">
        <span className="stat-card-label plaque-label">{label}</span>
        <div className="plaque-metaphor-icon" aria-hidden="true">
          <span className="stat-card-icon">{displayIcon}</span>
        </div>
      </div>
      <div className="stat-card-value plaque-value">{value}</div>
      {subtitle && <div className="stat-card-sub plaque-sub">{subtitle}</div>}
    </div>
  );
}
