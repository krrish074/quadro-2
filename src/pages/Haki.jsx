/**
 * GRAND LINE LEDGER - Haki Component
 * Financial reputation leaderboard, Haki progression ranks, and voyage honor logs
 */
import React from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { getHakiRank, formatBeli } from '../utils/helpers';
import { calculateBalances } from '../utils/calculations';

export default function Haki({ onOpenNewCrewModal }) {
  const { state, currentCrew, playSound } = useApp();

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create Crew to View Haki"
      />
    );
  }

  const members = currentCrew.members || [];
  const { balances } = calculateBalances(currentCrew);
  const currency = state.settings.currency || '฿';
  const hakiLog = currentCrew.hakiLog || [];

  // Sort members by Haki points descending
  const rankedMembers = [...members].sort((a, b) => (b.hakiPoints || 0) - (a.hakiPoints || 0));

  return (
    <div className="haki-page view-enter">
      <PageHeader
        icon="⚡"
        title="Haki Financial Leaderboard"
        subtitle={`Honor and discipline of the ${currentCrew.name} crew`}
      />

      {/* Intro Banner */}
      <div className="parchment-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(15,28,49,0.85))' }}>
        <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.6rem', color: 'var(--gold-light)', margin: '0 0 0.5rem 0' }}>
          ⚔️ The Will of Conquerors (Haki System)
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          In the Grand Line, true pirate strength isn't just about Devil Fruit powers—it's about honoring your tavern debts and clearing tabs! Pirates gain <strong>+10 Haki</strong> each time they settle an obligation, ascending through legendary ranks from Rookie to Conqueror.
        </p>
      </div>

      <div className="grid grid-2 gap-lg">
        {/* LEFT COLUMN: LEADERBOARD */}
        <div className="parchment-card">
          <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 1.25rem 0' }}>
            🏆 Crew Haki Rankings
          </h3>

          {rankedMembers.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              No crew members enlisted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {rankedMembers.map((member, index) => {
                const bal = balances[member.id] || 0;
                const points = member.hakiPoints || 0;
                const rank = getHakiRank(bal);
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

                return (
                  <div
                    key={member.id}
                    className="flex-between align-center"
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: index === 0 ? '1px solid var(--border-gold)' : '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div className="flex-row gap-md align-center">
                      <div style={{ fontSize: '1.25rem', width: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                        {medal}
                      </div>
                      <div style={{ fontSize: '1.6rem' }}>
                        {member.avatar || '🏴‍☠️'}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-parchment)', fontSize: '1.05rem' }}>
                          {member.name}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {member.role || 'Deckhand'} • {rank.badge} {rank.title}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)' }}>
                        {points} <small style={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>PTS</small>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: bal > 0.01 ? 'var(--credit-green)' : bal < -0.01 ? 'var(--debt-red)' : 'var(--text-muted)' }}>
                        Net: {bal > 0.01 ? '+' : ''}{formatBeli(bal, currency)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HAKI TIERS & LOGS */}
        <div>
          {/* Haki Tier Reference */}
          <div className="parchment-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 1rem 0' }}>
              ⚡ Haki Mastery Ranks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div className="flex-between align-center" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.85rem', borderRadius: '6px' }}>
                <div>
                  <strong>🥉 Rookie Pirate</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Starting level or carrying crew debts</div>
                </div>
                <span className="badge badge-neutral">0 - 49 PTS</span>
              </div>
              <div className="flex-between align-center" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.85rem', borderRadius: '6px' }}>
                <div>
                  <strong>👁️ Observation Haki (Kenbunshoku)</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Balanced books & prompt debt settlement</div>
                </div>
                <span className="badge badge-gold">50 - 119 PTS</span>
              </div>
              <div className="flex-between align-center" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.85rem', borderRadius: '6px' }}>
                <div>
                  <strong>🛡️ Armament Haki (Busoshoku)</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Consistently funding expeditions & prompt repayment</div>
                </div>
                <span className="badge badge-gold">120 - 249 PTS</span>
              </div>
              <div className="flex-between align-center" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.85rem', borderRadius: '6px' }}>
                <div>
                  <strong>👑 Conqueror's Haki (Haoshoku)</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Elite Quartermaster standing and flawless ledger discipline</div>
                </div>
                <span className="badge badge-credit">250+ PTS</span>
              </div>
            </div>
          </div>

          {/* Honor Log */}
          <div className="parchment-card">
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 1rem 0' }}>
              📜 Voyage Honor Log
            </h3>
            {hakiLog.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                No Haki milestones recorded yet. Settle debts to earn your place in the annals!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
                {[...hakiLog].reverse().map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: 'var(--gold-light)',
                      borderLeft: '3px solid var(--gold-primary)'
                    }}
                  >
                    ⚡ {entry}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
