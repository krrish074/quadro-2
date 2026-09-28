/**
 * GRAND LINE LEDGER - EmptyState Component
 * Visually impressive onboarding state & generic empty deck screen
 */
import React from 'react';

export default function EmptyState({
  type = 'no-crew', // 'no-crew' | 'no-members' | 'no-expenses' | 'no-debts'
  onAction,
  actionLabel = 'Create Your Crew',
  title,
  description
}) {
  if (type === 'no-crew') {
    return (
      <div className="onboarding-hero view-enter">
        <div className="onboarding-card">
          <div className="onboarding-jolly-roger">☠️</div>
          <h2 className="onboarding-title">YOUR VOYAGE AWAITS</h2>
          <p className="onboarding-subtitle">
            Assemble your pirate crew, conquer treacherous Grand Line spending, and ensure every single Beli is accounted for!
          </p>

          <div className="onboarding-features-grid">
            <div className="onboarding-feature-item">
              <span className="feature-icon">💰</span>
              <h4>Split Expenses</h4>
              <p>Equal or custom shares for ship feasts, sea repairs, and cola fuel.</p>
            </div>
            <div className="onboarding-feature-item">
              <span className="feature-icon">⚖️</span>
              <h4>Track Debts</h4>
              <p>Transparent balance ledger: exactly who owes whom across the seas.</p>
            </div>
            <div className="onboarding-feature-item">
              <span className="feature-icon">⚓</span>
              <h4>Bilateral Settlements</h4>
              <p>Greedy debt simplification to settle crew accounts in minimum steps.</p>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg pulse-glow"
              onClick={onAction}
            >
              🏴‍☠️ {actionLabel}
            </button>
          </div>

          <div className="onboarding-disclaimer">
            "A man's dream will never die... but unpaid tavern tabs will follow you to Laugh Tale!"
          </div>
        </div>
      </div>
    );
  }

  // Generic empty state for subviews
  return (
    <div className="parchment-card empty-state-box text-center view-enter" style={{ padding: '3.5rem 1.5rem', margin: '1.5rem 0' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>
        {type === 'no-members' ? '👥' : type === 'no-expenses' ? '📜' : type === 'no-debts' ? '🎉' : '🧭'}
      </div>
      <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.8rem', color: 'var(--gold-light)', margin: '0 0 0.5rem 0' }}>
        {title || 'The Deck is Quiet'}
      </h3>
      <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        {description || 'No entries logged in this voyage yet. Record your first action to update the crew ledger.'}
      </p>
      {onAction && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
