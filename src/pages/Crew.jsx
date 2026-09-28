/**
 * GRAND LINE LEDGER - Crew Component
 * Modern fintech-inspired crew roster with clean professional layout
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CrewMemberCard from '../components/CrewMemberCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CHARACTERS } from '../data/characters';
import { calculateBalances, calculateDebts } from '../utils/calculations';
import { formatBeli } from '../utils/helpers';
import '../styles/crew-page.css';

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
    if (window.confirm(`Delete "${currentCrew.name}"? This action cannot be undone.`)) {
      deleteCrew(currentCrew.id);
    }
  };

  return (
    <div className="crew-page view-enter">
      {/* Page Header */}
      <div className="page-header flex-between flex-wrap gap-md" style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,207,64,0.1)' }}>
        <div>
          <h2 className="page-header-title" style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.75rem', color: 'var(--gold-bright)', margin: 0, letterSpacing: '0.5px' }}>
            Crew Roster & Deckhands
          </h2>
          <p className="page-header-subtitle" style={{ margin: '0.25rem 0 0 0', fontFamily: 'var(--font-sans)', color: 'var(--text-muted-light)', fontSize: '0.85rem', letterSpacing: '0.3px' }}>
            Managing crew of the {currentCrew.name}
          </p>
        </div>

        <div className="crew-header-actions">
          <button
            type="button"
            className="crew-btn crew-btn--secondary"
            onClick={handleOpenRename}
          >
            Rename Voyage
          </button>
          <button
            type="button"
            className="crew-btn crew-btn--secondary"
            onClick={() => toggleArchiveCrew(currentCrew.id)}
          >
            {currentCrew.archived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            type="button"
            className="crew-btn crew-btn--primary"
            onClick={() => setIsEnlistModalOpen(true)}
          >
            + Enlist Pirate
          </button>
        </div>
      </div>

      {/* Compact Voyage Summary Strip */}
      <div className="crew-voyage-strip">
        <div className="crew-voyage-strip__info">
          <div className="crew-voyage-strip__avatar">
            {currentCrew.logo || '☠️'}
          </div>
          <div>
            <div className="crew-voyage-strip__name">
              {currentCrew.name}
            </div>
            <div className="crew-voyage-strip__meta">
              <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
              <span className="crew-voyage-strip__meta-dot" />
              <span>Formed {currentCrew.createdDate || 'Unknown'}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="crew-voyage-strip__delete btn-danger"
          onClick={handleDeleteCrew}
        >
          Delete Voyage
        </button>
      </div>

      {/* Crew Members Grid */}
      {members.length === 0 ? (
        <EmptyState
          type="no-members"
          title="No Members Yet"
          description="Add crew members to start splitting expenses and tracking balances."
          actionLabel="Add First Member"
          onAction={() => setIsEnlistModalOpen(true)}
        />
      ) : (
        <div className="crew-members-grid">
          {members.map(member => (
            <CrewMemberCard
              key={member.id}
              member={member}
              balance={balances[member.id] || 0}
              totalPaid={totalPaid[member.id] || 0}
              totalOwed={totalOwed[member.id] || 0}
              onRemove={(id) => {
                if (window.confirm(`Remove ${member.name} from the crew?`)) {
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
        title="Add New Member"
        subtitle="Add a crew member to share expenses"
      >
        <form onSubmit={handleEnlistSubmit}>
          {/* Quick Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted-dark)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Presets
            </label>
            <div className="flex-row gap-xs flex-wrap">
              {CHARACTERS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => handleSelectPreset(c)}
                >
                  {c.emoji} {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="member-name" style={{ fontFamily: 'var(--font-sans)' }}>Name *</label>
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
              <label htmlFor="member-role" style={{ fontFamily: 'var(--font-sans)' }}>Role</label>
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
              <label htmlFor="member-avatar" style={{ fontFamily: 'var(--font-sans)' }}>Avatar</label>
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
              Add to Crew
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= RENAME VOYAGE MODAL ================= */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Voyage"
      >
        <form onSubmit={handleRenameSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="rename-input" style={{ fontFamily: 'var(--font-sans)' }}>Crew / Voyage Name</label>
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
          title={`${selectedMember.name}'s Ledger`}
          subtitle={`Financial breakdown in ${currentCrew.name}`}
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
                <div className="ledger-modal-stats">
                  <div className="ledger-modal-stat">
                    <div className="ledger-modal-stat__label">Total Paid</div>
                    <div className="ledger-modal-stat__value" style={{ color: 'var(--gold-primary)' }}>
                      {formatBeli(paid, currency)}
                    </div>
                  </div>
                  <div className="ledger-modal-stat">
                    <div className="ledger-modal-stat__label">Total Share</div>
                    <div className="ledger-modal-stat__value" style={{ color: 'var(--text-primary-dark)' }}>
                      {formatBeli(owed, currency)}
                    </div>
                  </div>
                  <div className="ledger-modal-stat">
                    <div className="ledger-modal-stat__label">Net Balance</div>
                    <div
                      className="ledger-modal-stat__value"
                      style={{
                        color: bal > 0.01 ? 'var(--credit-green)' : bal < -0.01 ? 'var(--debt-red)' : 'var(--text-secondary-dark)'
                      }}
                    >
                      {bal > 0.01 ? `+${formatBeli(bal, currency)}` : bal < -0.01 ? `-${formatBeli(Math.abs(bal), currency)}` : formatBeli(0, currency)}
                    </div>
                  </div>
                </div>

                {/* Debts list for this member */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary-dark)', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Debt Status
                  </h4>
                  {memberDebtsOwed.length === 0 && memberDebtsReceivable.length === 0 ? (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>No outstanding debts.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {memberDebtsOwed.map(d => {
                        const toMember = members.find(m => m.id === d.creditorId);
                        return (
                          <div key={d.creditorId} className="flex-between align-center" style={{ background: 'rgba(231,76,60,0.08)', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(231,76,60,0.2)' }}>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--debt-red)', fontWeight: 600 }}>
                              Owes {toMember ? toMember.name : 'Crewmate'}
                            </span>
                            <strong style={{ fontFamily: 'var(--font-sans)', color: 'var(--debt-red)' }}>{formatBeli(d.amount, currency)}</strong>
                          </div>
                        );
                      })}
                      {memberDebtsReceivable.map(d => {
                        const fromMember = members.find(m => m.id === d.debtorId);
                        return (
                          <div key={d.debtorId} className="flex-between align-center" style={{ background: 'rgba(46,204,113,0.08)', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(46,204,113,0.2)' }}>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--credit-green)', fontWeight: 600 }}>
                              Receives from {fromMember ? fromMember.name : 'Crewmate'}
                            </span>
                            <strong style={{ fontFamily: 'var(--font-sans)', color: 'var(--credit-green)' }}>{formatBeli(d.amount, currency)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Involved expenses */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary-dark)', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Expenses ({memberExpenses.length})
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {memberExpenses.map(e => (
                      <div key={e.id} className="flex-between align-center" style={{ background: 'rgba(122,86,38,0.06)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary-dark)' }}>{e.name || e.description} ({e.date})</span>
                        <strong style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold-primary)' }}>{formatBeli(e.amount, currency)}</strong>
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
