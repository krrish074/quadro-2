/**
 * GRAND LINE LEDGER - Expenses Component
 * Log new shared expenses with live equal & custom split calculation, participant chips, and multi-payer options
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../data/characters';
import { formatBeli, spawnCoins } from '../utils/helpers';
import { validateExpenseData } from '../utils/calculations';

export default function Expenses({ onOpenNewCrewModal }) {
  const { state, currentCrew, addExpense, playSound } = useApp();
  const navigate = useNavigate();

  const members = currentCrew?.members || [];
  const currency = state.settings.currency || '฿';

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Primary payer or multiple payers
  const [payerType, setPayerType] = useState('single'); // 'single' | 'multiple'
  const [singlePayerId, setSinglePayerId] = useState('');
  const [customPayments, setCustomPayments] = useState({}); // { [memberId]: number }

  // Participants & Split Type
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom'
  const [customShares, setCustomShares] = useState({}); // { [memberId]: number }

  // Validation message
  const [validationError, setValidationError] = useState('');

  // Initialize defaults when crew or members change
  useEffect(() => {
    if (members.length > 0) {
      if (!singlePayerId) {
        setSinglePayerId(members[0].id);
      }
      if (selectedParticipants.length === 0) {
        setSelectedParticipants(members.map(m => m.id));
      }
    }
  }, [members]);

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create a Crew to Log Expenses"
      />
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        type="no-members"
        title="No Crew Members to Split With"
        description="You need at least 1 pirate aboard your ship to log and split expenses."
        actionLabel="Enlist Crew Members"
        onAction={() => navigate('/crew')}
      />
    );
  }

  const numAmount = parseFloat(amount) || 0;

  // Toggle participant selection
  const handleToggleParticipant = (memberId) => {
    setSelectedParticipants(prev => {
      const exists = prev.includes(memberId);
      if (exists) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAllParticipants = () => {
    setSelectedParticipants(members.map(m => m.id));
  };

  // Compute calculated shares
  const computedShares = {};
  if (splitType === 'equal') {
    const count = selectedParticipants.length || 1;
    const baseShare = Math.round((numAmount / count) * 100) / 100;
    let distributed = 0;
    selectedParticipants.forEach((id, idx) => {
      if (idx === selectedParticipants.length - 1) {
        // Remainder adjustment
        computedShares[id] = Math.round((numAmount - distributed) * 100) / 100;
      } else {
        computedShares[id] = baseShare;
        distributed += baseShare;
      }
    });
  } else {
    // Custom shares
    selectedParticipants.forEach(id => {
      computedShares[id] = parseFloat(customShares[id]) || 0;
    });
  }

  // Compute calculated payments
  const computedPayments = {};
  if (payerType === 'single') {
    if (singlePayerId) {
      computedPayments[singlePayerId] = numAmount;
    }
  } else {
    members.forEach(m => {
      computedPayments[m.id] = parseFloat(customPayments[m.id]) || 0;
    });
  }

  // Live totals validation check
  const totalSharesAssigned = Object.values(computedShares).reduce((s, v) => s + v, 0);
  const totalPaymentsAssigned = Object.values(computedPayments).reduce((s, v) => s + v, 0);

  const shareDifference = Math.round((numAmount - totalSharesAssigned) * 100) / 100;
  const paymentDifference = Math.round((numAmount - totalPaymentsAssigned) * 100) / 100;

  // Auto split evenly for custom shares
  const handleAutoSplitRemaining = () => {
    if (numAmount <= 0 || selectedParticipants.length === 0) return;
    const count = selectedParticipants.length;
    const each = Math.round((numAmount / count) * 100) / 100;
    const newShares = {};
    let running = 0;
    selectedParticipants.forEach((id, idx) => {
      if (idx === count - 1) {
        newShares[id] = Math.round((numAmount - running) * 100) / 100;
      } else {
        newShares[id] = each;
        running += each;
      }
    });
    setCustomShares(newShares);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (numAmount <= 0) {
      setValidationError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setValidationError('Please specify a description for this expense.');
      return;
    }

    if (selectedParticipants.length === 0) {
      setValidationError('Please select at least one crew member involved.');
      return;
    }

    // Prepare payload
    const expenseData = {
      name: description.trim(),
      amount: numAmount,
      date,
      category,
      participants: selectedParticipants,
      splitType,
      shares: computedShares,
      payments: computedPayments,
      paidBy: payerType === 'single' ? singlePayerId : Object.keys(computedPayments).find(k => computedPayments[k] > 0) || singlePayerId,
      notes: notes.trim()
    };

    const validation = validateExpenseData(expenseData);
    if (!validation.isValid) {
      setValidationError(validation.errors.join(' • '));
      return;
    }

    // Save expense
    addExpense(currentCrew.id, expenseData);

    // Coin shower & sound
    spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 25);
    playSound('coin');

    // Reset & navigate to history
    navigate('/history');
  };

  return (
    <div className="expenses-page view-enter">
      <PageHeader
        icon="💰"
        title="Log Crew Expense"
        subtitle={`Split tavern tabs, ship supplies, and treasure purchases for ${currentCrew.name}`}
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/history')}
          >
            📜 View Expense Ledger
          </button>
        }
      />

      <div className="grid grid-2 gap-lg">
        {/* LEFT COLUMN: EXPENSE ENTRY FORM */}
        <div className="parchment-card">
          <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 1.25rem 0' }}>
            📜 Expense Particulars
          </h3>

          {validationError && (
            <div className="badge badge-debt" style={{ width: '100%', padding: '0.65rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              ⚠️ {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Description & Amount */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="expense-desc">Description / Purchase *</label>
              <input
                id="expense-desc"
                type="text"
                className="form-control"
                placeholder="e.g. Going Merry Feast, Cola Barrels, Sea King Meat"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-2 gap-md" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="expense-amount">Total Amount ({currency}) *</label>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="expense-category">Category</label>
                <select
                  id="expense-category"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2 gap-md" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label htmlFor="expense-date">Date Logged</label>
                <input
                  id="expense-date"
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expense-notes">Notes / Receipt Ref</label>
                <input
                  id="expense-notes"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Paid at Baratie"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* ---------------- PAYER SELECTION ---------------- */}
            <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.18)', padding: '0.85rem', borderRadius: '8px' }}>
              <div className="flex-between align-center" style={{ marginBottom: '0.5rem' }}>
                <label style={{ margin: 0, fontWeight: 'bold', color: 'var(--gold-light)' }}>
                  👑 Who Paid the Bill?
                </label>
                <div className="flex-row gap-xs">
                  <button
                    type="button"
                    className={`btn btn-sm ${payerType === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPayerType('single')}
                  >
                    Single Payer
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${payerType === 'multiple' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPayerType('multiple')}
                  >
                    Multi-Payer
                  </button>
                </div>
              </div>

              {payerType === 'single' ? (
                <div className="form-group">
                  <select
                    className="form-control"
                    value={singlePayerId}
                    onChange={(e) => setSinglePayerId(e.target.value)}
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name} ({m.role || 'Pirate'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {members.map(m => (
                    <div key={m.id} className="flex-between align-center" style={{ fontSize: '0.85rem' }}>
                      <span>{m.avatar} {m.name}:</span>
                      <div className="flex-row gap-xs align-center">
                        <span>{currency}</span>
                        <input
                          id={`custom-payment-${m.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="form-control"
                          style={{ width: '110px', padding: '0.25rem 0.5rem' }}
                          value={customPayments[m.id] || ''}
                          onChange={(e) => setCustomPayments({
                            ...customPayments,
                            [m.id]: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                  ))}
                  {Math.abs(paymentDifference) > 0.01 && (
                    <div style={{ color: 'var(--debt-red)', fontSize: '0.8rem', textAlign: 'right' }}>
                      Remaining payment needed: {formatBeli(paymentDifference, currency)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ---------------- PARTICIPANTS & SPLIT TYPE ---------------- */}
            <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.18)', padding: '0.85rem', borderRadius: '8px' }}>
              <div className="flex-between align-center" style={{ marginBottom: '0.65rem' }}>
                <label style={{ margin: 0, fontWeight: 'bold', color: 'var(--gold-light)' }}>
                  👥 Crew Members Involved ({selectedParticipants.length})
                </label>
                <div className="flex-row gap-xs">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSelectAllParticipants}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${splitType === 'equal' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSplitType('equal')}
                  >
                    Equal Split
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${splitType === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSplitType('custom')}
                  >
                    Custom Split
                  </button>
                </div>
              </div>

              {/* Participant Chips */}
              <div className="flex-row gap-xs flex-wrap" style={{ marginBottom: '0.75rem' }}>
                {members.map(m => {
                  const isSelected = selectedParticipants.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ borderRadius: '20px', padding: '0.3rem 0.7rem' }}
                      onClick={() => handleToggleParticipant(m.id)}
                    >
                      {m.avatar} {m.name} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Split Inputs */}
              {splitType === 'custom' && (
                <div style={{ marginTop: '0.85rem', borderTop: '1px dashed var(--border-parchment)', paddingTop: '0.75rem' }}>
                  <div className="flex-between align-center" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Assign specific amount to each pirate:
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAutoSplitRemaining}
                    >
                      Split Evenly
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selectedParticipants.map(pId => {
                      const m = members.find(x => x.id === pId);
                      return (
                        <div key={pId} className="flex-between align-center" style={{ fontSize: '0.85rem' }}>
                          <span>{m ? m.avatar : '🏴‍☠️'} {m ? m.name : pId}</span>
                          <div className="flex-row gap-xs align-center">
                            <span>{currency}</span>
                            <input
                              id={`custom-share-${pId}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="form-control"
                              style={{ width: '110px', padding: '0.25rem 0.5rem' }}
                              value={customShares[pId] || ''}
                              onChange={(e) => setCustomShares({
                                ...customShares,
                                [pId]: parseFloat(e.target.value) || 0
                              })}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {Math.abs(shareDifference) > 0.01 && (
                    <div style={{ color: 'var(--debt-red)', fontSize: '0.8rem', textAlign: 'right', marginTop: '0.4rem' }}>
                      Remaining shares to allocate: {formatBeli(shareDifference, currency)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              🪙 Seal & Record Expense
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE REAL-TIME LEDGER PREVIEW */}
        <div>
          <div className="parchment-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 0.5rem 0' }}>
              ⚖️ Live Impact Preview
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Calculated balance shift for each crew member before saving
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {members.map(member => {
                const isParticipant = selectedParticipants.includes(member.id);
                const paid = computedPayments[member.id] || 0;
                const owed = isParticipant ? (computedShares[member.id] || 0) : 0;
                const delta = paid - owed;

                const isGainer = delta > 0.01;
                const isOwer = delta < -0.01;

                return (
                  <div
                    key={member.id}
                    className="flex-between align-center"
                    style={{
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(0,0,0,0.22)',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${isGainer ? 'var(--credit-green)' : isOwer ? 'var(--debt-red)' : 'var(--border-parchment)'}`
                    }}
                  >
                    <div className="flex-row gap-xs align-center">
                      <span>{member.avatar}</span>
                      <strong style={{ color: 'var(--text-parchment)' }}>{member.name}</strong>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
                      <div>
                        Paid: <strong>{formatBeli(paid, currency)}</strong> | Share: <strong>{formatBeli(owed, currency)}</strong>
                      </div>
                      <div
                        style={{
                          fontWeight: 'bold',
                          color: isGainer ? 'var(--credit-green)' : isOwer ? 'var(--debt-red)' : 'var(--text-muted)'
                        }}
                      >
                        Net Impact: {isGainer ? '+' : ''}{formatBeli(delta, currency)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.85rem',
                borderTop: '1px dashed var(--border-parchment)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.9rem'
              }}
            >
              <span>Total Recorded Sum:</span>
              <strong style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.3rem', color: 'var(--gold-primary)' }}>
                {formatBeli(numAmount, currency)}
              </strong>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="parchment-card" style={{ background: 'rgba(212, 160, 23, 0.06)' }}>
            <h4 style={{ fontFamily: 'var(--font-pirate)', color: 'var(--gold-light)', margin: '0 0 0.5rem 0' }}>
              💡 Pirate Navigator Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Equal split divides the bill perfectly among selected pirates. If someone skipped dinner or ordered extra cola, toggle to <strong>Custom Split</strong> to assign exact shares. The ledger guarantees mathematical conservation (Paid = Owed).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
