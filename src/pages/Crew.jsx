/**
 * GRAND LINE LEDGER - Crew Component
 * Full pirate crew roster management, enlisting, and individual balance ledgers
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import CrewMemberCard from '../components/CrewMemberCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CHARACTERS } from '../data/characters';
import { calculateBalances, calculateDebts } from '../utils/calculations';
import { formatBeli } from '../utils/helpers';

export default function Crew({ onOpenNewCrewModal }) {
  const {
    state,
    currentCrew,
    addMember,
    removeMember,
    renameCrew,
    toggleArchiveCrew,
    deleteCrew,
    playSound
  } = useApp();

  // Modals state
  const [isEnlistModalOpen, setIsEnlistModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Deckhand');
  const [newMemberAvatar, setNewMemberAvatar] = useState('🏴‍☠️');
  const [renameCrewName, setRenameCrewName] = useState('');

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Assemble Your Crew"
      />
    );
  }

  const currency = state.settings.currency || '฿';
  const members = currentCrew.members || [];
  const { balances, totalPaid, totalOwed } = calculateBalances(currentCrew);
  const debts = calculateDebts(currentCrew);

  // Quick pick One Piece preset
  const handleSelectPreset = (char) => {
    setNewMemberName(char.name);
    setNewMemberRole(char.role);
    setNewMemberAvatar(char.emoji);
  };

  const handleEnlistSubmit = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    addMember(currentCrew.id, {
      name: newMemberName.trim(),
      nickname: newMemberRole.trim(),
      avatar: newMemberAvatar
    });

    setNewMemberName('');
    setNewMemberRole('Deckhand');
    setNewMemberAvatar('🏴‍☠️');
    setIsEnlistModalOpen(false);
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renameCrewName.trim()) return;
    renameCrew(currentCrew.id, renameCrewName.trim());
    setIsRenameModalOpen(false);
  };

  const handleOpenRename = () => {
    setRenameCrewName(currentCrew.name);
    setIsRenameModalOpen(true);
  };

  const handleDeleteCrew = () => {
    if (window.confirm(`Scuttle the voyage "${currentCrew.name}"? This cannot be undone.`)) {
      deleteCrew(currentCrew.id);
    }
  };

  return (
    <div className="crew-page view-enter">
      {/* Page Header */}
      <PageHeader
        icon="🏴‍☠️"
        title="Crew Roster & Deckhands"
        subtitle={`Managing crew of the ${currentCrew.name}`}
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleOpenRename}
            >
              ✏️ Rename Voyage
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => toggleArchiveCrew(currentCrew.id)}
            >
              {currentCrew.archived ? '📂 Unarchive' : '📦 Archive'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEnlistModalOpen(true)}
            >
              ⚔️ Enlist Pirate
            </button>
          </>
        }
      />

      {/* Crew Overview Card */}
      <div className="card-ocean surface-ocean" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(15,28,49,0.95))', padding: '1.25rem 1.5rem' }}>
        <div className="flex-between align-center flex-wrap gap-md">
          <div className="flex-row gap-md align-center">
            <div style={{ fontSize: '2.5rem' }}>{currentCrew.logo || '☠️'}</div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-pirate)', fontSize: '1.8rem', color: 'var(--gold-bright)' }}>
                {currentCrew.name}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary-light)', fontSize: '0.9rem' }}>
                Formed on {currentCrew.createdDate || 'Grand Line'} • {members.length} Pirates Enlisted
              </p>
            </div>
          </div>

          <div className="flex-row gap-xs">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeleteCrew}
            >
              Scuttle Voyage (Delete)
            </button>
          </div>
        </div>
      </div>

      {/* Crew Members Grid */}
      {members.length === 0 ? (
        <EmptyState
          type="no-members"
          title="No Pirates on Deck"
          description="Your ship has no sailors! Enlist Luffy, Zoro, Nami, Sanji, or custom pirates to split expenses."
          actionLabel="Enlist First Pirate"
          onAction={() => setIsEnlistModalOpen(true)}
        />
      ) : (
        <div className="grid grid-3 gap-md">
          {members.map(member => (
            <CrewMemberCard
              key={member.id}
              member={member}
              balance={balances[member.id] || 0}
              totalPaid={totalPaid[member.id] || 0}
              totalOwed={totalOwed[member.id] || 0}
              onRemove={(id) => {
                if (window.confirm(`Force ${member.name} to walk the plank (remove from crew)?`)) {
                  removeMember(currentCrew.id, id);
                }
              }}
              onViewDetails={(m) => setSelectedMember(m)}
            />
          ))}
        </div>
      )}

      {/* ================= ENLIST PIRATE MODAL ================= */}
      <Modal
        isOpen={isEnlistModalOpen}
        onClose={() => setIsEnlistModalOpen(false)}
        title="⚔️ Enlist New Crew Member"
        subtitle="Sign on a brave pirate to share bounties and tavern bills"
      >
        <form onSubmit={handleEnlistSubmit}>
          {/* Quick Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary-dark)', marginBottom: '0.5rem' }}>
              Grand Line Legendary Presets:
            </label>
            <div className="flex-row gap-xs flex-wrap">
              {CHARACTERS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                  onClick={() => handleSelectPreset(c)}
                >
                  {c.emoji} {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="member-name">Pirate Name *</label>
            <input
              id="member-name"
              type="text"
              className="form-control"
              placeholder="e.g. Monkey D. Luffy"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-2 gap-md" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="member-role">Crew Role</label>
              <input
                id="member-role"
                type="text"
                className="form-control"
                placeholder="Captain, Cook, Navigator..."
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="member-avatar">Jolly Avatar Emoji</label>
              <select
                id="member-avatar"
                className="form-control"
                value={newMemberAvatar}
                onChange={(e) => setNewMemberAvatar(e.target.value)}
              >
                <option value="🏴‍☠️">🏴‍☠️ Pirate Flag</option>
                <option value="⚔️">⚔️ Swordsman</option>
                <option value="🍊">🍊 Navigator</option>
                <option value="🚬">🚬 Chef</option>
                <option value="🦌">🦌 Doctor</option>
                <option value="🌸">🌸 Archaeologist</option>
                <option value="🤖">🤖 Shipwright</option>
                <option value="💀">💀 Musician</option>
                <option value="🦈">🦈 Helmsman</option>
                <option value="👑">👑 Royalty</option>
                <option value="⚡">⚡ Lightning</option>
                <option value="🔥">🔥 Fire</option>
                <option value="🍖">🍖 Meat Master</option>
              </select>
            </div>
          </div>

          <div className="flex-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEnlistModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              ⚓ Welcome Aboard
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= RENAME VOYAGE MODAL ================= */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="✏️ Rename Voyage"
      >
        <form onSubmit={handleRenameSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="rename-input">New Voyage / Crew Name</label>
            <input
              id="rename-input"
              type="text"
              className="form-control"
              value={renameCrewName}
              onChange={(e) => setRenameCrewName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="flex-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsRenameModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Name
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MEMBER LEDGER DETAILS MODAL ================= */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`📜 ${selectedMember.avatar} ${selectedMember.name}'s Ledger`}
          subtitle={`Personal financial breakdown aboard ${currentCrew.name}`}
          maxWidth="700px"
        >
          {(() => {
            const mId = selectedMember.id;
            const bal = balances[mId] || 0;
            const paid = totalPaid[mId] || 0;
            const owed = totalOwed[mId] || 0;

            const memberExpenses = (currentCrew.expenses || []).filter(e =>
              (e.participants || []).includes(mId) || (e.paidBy === mId) || (e.payments && e.payments[mId])
            );

            const memberDebtsOwed = debts.filter(d => d.debtorId === mId);
            const memberDebtsReceivable = debts.filter(d => d.creditorId === mId);

            return (
              <div>
                {/* Stats summary */}
                <div className="grid grid-3 gap-sm" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(122,86,38,0.08)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>Total Paid</div>
                    <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.3rem', color: 'var(--gold-primary)' }}>
                      {formatBeli(paid, currency)}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(122,86,38,0.08)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>Total Share</div>
                    <div style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.3rem', color: 'var(--text-primary-dark)' }}>
                      {formatBeli(owed, currency)}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(122,86,38,0.08)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>Net Balance</div>
                    <div
                      style={{
                        fontFamily: 'var(--font-pirate)',
                        fontSize: '1.3rem',
                        color: bal > 0.01 ? 'var(--credit-green)' : bal < -0.01 ? 'var(--debt-red)' : 'var(--text-secondary-dark)'
                      }}
                    >
                      {bal > 0.01 ? `+${formatBeli(bal, currency)}` : bal < -0.01 ? `-${formatBeli(Math.abs(bal), currency)}` : formatBeli(0, currency)}
                    </div>
                  </div>
                </div>

                {/* Debts list for this member */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-pirate)', color: 'var(--text-primary-dark)', margin: '0 0 0.5rem 0' }}>
                    ⚖️ Active Debt Status:
                  </h4>
                  {memberDebtsOwed.length === 0 && memberDebtsReceivable.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>No outstanding debts with crewmates.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {memberDebtsOwed.map(d => {
                        const toMember = members.find(m => m.id === d.creditorId);
                        return (
                          <div key={d.creditorId} className="flex-between align-center" style={{ background: 'rgba(231,76,60,0.12)', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(231,76,60,0.35)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--debt-red)', fontWeight: 'bold' }}>
                              Owes {toMember ? toMember.name : 'Crewmate'}
                            </span>
                            <strong style={{ color: 'var(--debt-red)' }}>{formatBeli(d.amount, currency)}</strong>
                          </div>
                        );
                      })}
                      {memberDebtsReceivable.map(d => {
                        const fromMember = members.find(m => m.id === d.debtorId);
                        return (
                          <div key={d.debtorId} className="flex-between align-center" style={{ background: 'rgba(46,204,113,0.12)', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(46,204,113,0.35)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--credit-green)', fontWeight: 'bold' }}>
                              Receives from {fromMember ? fromMember.name : 'Crewmate'}
                            </span>
                            <strong style={{ color: 'var(--credit-green)' }}>{formatBeli(d.amount, currency)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Involved expenses */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-pirate)', color: 'var(--text-primary-dark)', margin: '0 0 0.5rem 0' }}>
                    💰 Associated Voyage Expenses ({memberExpenses.length}):
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {memberExpenses.map(e => (
                      <div key={e.id} className="flex-between align-center" style={{ background: 'rgba(122,86,38,0.08)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-primary-dark)' }}>{e.name || e.description} ({e.date})</span>
                        <strong style={{ color: 'var(--gold-primary)' }}>{formatBeli(e.amount, currency)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
