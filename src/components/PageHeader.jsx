/**
 * GRAND LINE LEDGER - PageHeader Component
 * Consistent header across all operational screens
 */
import React from 'react';

export default function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <div className="page-header flex-between flex-wrap gap-md" style={{ marginBottom: '1.75rem' }}>
      <div className="flex-row gap-md align-center">
        {icon && (
          <div
            style={{
              fontSize: '2rem',
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(15,28,49,0.7))',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h2 className="page-header-title" style={{ fontFamily: 'var(--font-pirate)', fontSize: '2rem', color: 'var(--gold-bright)', margin: 0, letterSpacing: '1px' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="page-header-subtitle" style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary-light)', fontSize: '0.95rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="page-header-actions flex-row gap-sm flex-wrap align-center">
          {actions}
        </div>
      )}
    </div>
  );
}
