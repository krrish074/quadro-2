/**
 * GRAND LINE LEDGER - Command Header Component
 */
import React from 'react';
import { useApp } from '../context/AppContext';

export default function Header({ title, subtitle, actions }) {
  const { currentCrew } = useApp();

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="command-header view-enter">
      <div className="command-header-left">
        {currentCrew && (
          <div className="command-crew-logo">
            {currentCrew.logo || '☠️'}
          </div>
        )}
        <div className="command-title-group">
          <h1>{title || (currentCrew ? currentCrew.name : 'Grand Line Ledger')}</h1>
          <p className="command-subtitle">{subtitle || 'Pirate Financial Command Center'}</p>
        </div>
      </div>

      <div className="command-header-meta">
        {currentCrew && (
          <span className="active-voyage-badge">
            {currentCrew.archived ? 'Archived Voyage' : 'Active Voyage'}
          </span>
        )}
        <span className="current-date-tag">📅 {currentDate}</span>
        {actions && <div className="flex-row gap-sm">{actions}</div>}
      </div>
    </header>
  );
}
