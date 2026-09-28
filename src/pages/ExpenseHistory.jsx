/**
 * GRAND LINE LEDGER - ExpenseHistory Component
 * Chronological expense ledger with search, filtering by category/member, editing, and deletion
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import ExpenseCard from '../components/ExpenseCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../data/characters';
import { formatBeli } from '../utils/helpers';

export default function ExpenseHistory({ onOpenNewCrewModal }) {
  const { state, currentCrew, editExpense, deleteExpense } = useApp();
  const navigate = useNavigate();

  const members = currentCrew?.members || [];
  const expenses = currentCrew?.expenses || [];
  const currency = state.settings.currency || '฿';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Edit Modal State
  const [editingExpense, setEditingExpense] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');

  if (!currentCrew) {
    return (
      <EmptyState
        type="no-crew"
        onAction={onOpenNewCrewModal}
        actionLabel="Create Your Crew"
      />
    );
  }

  // Filtered expenses memo
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Search filter
      const desc = (exp.name || exp.description || '').toLowerCase();
      const matchSearch = !searchTerm || desc.includes(searchTerm.toLowerCase());

      // Category filter
      const matchCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;

      // Member filter
      const matchMember = selectedMemberId === 'ALL' ||
        (exp.participants || []).includes(selectedMemberId) ||
        (exp.paidBy === selectedMemberId) ||
        (exp.payments && exp.payments[selectedMemberId]);

      return matchSearch && matchCategory && matchMember;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [expenses, searchTerm, selectedCategory, selectedMemberId, sortBy]);

  const totalFilteredSum = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Edit Handlers
  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setEditName(exp.name || exp.description || '');
    setEditAmount(exp.amount.toString());
    setEditCategory(exp.category || 'Other');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    const num = parseFloat(editAmount);
    if (!num || num <= 0) return;

    // Proportionally update shares if equal split
    let updatedShares = { ...editingExpense.shares };
    if (editingExpense.splitType === 'equal' && editingExpense.participants?.length) {
      const shareEach = Math.round((num / editingExpense.participants.length) * 100) / 100;
      updatedShares = {};
      editingExpense.participants.forEach(pId => {
        updatedShares[pId] = shareEach;
      });
    }

    let updatedPayments = { ...editingExpense.payments };
    const payerId = editingExpense.paidBy || Object.keys(editingExpense.payments || {})[0];
    if (payerId) {
      updatedPayments = { [payerId]: num };
    }

    editExpense(currentCrew.id, editingExpense.id, {
      name: editName.trim(),
      amount: num,
      category: editCategory,
      shares: updatedShares,
      payments: updatedPayments
    });

    setEditingExpense(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Strike this expense from the ship ledger? Balances will be recalculated immediately.')) {
      deleteExpense(currentCrew.id, id);
    }
  };

  return (
    <div className="expense-history-page view-enter">
      <PageHeader
        icon="📜"
        title="Voyage Expense History"
        subtitle={`Historical ledger of ${expenses.length} logged expenses for ${currentCrew.name}`}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/expenses')}
          >
            💰 Log New Expense
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="parchment-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="grid grid-4 gap-md">
          {/* Search */}
          <div className="form-group">
            <label htmlFor="search-exp">Search Expenditures</label>
            <input
              id="search-exp"
              type="text"
              className="form-control"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="form-group">
            <label htmlFor="filter-cat">Category</label>
            <select
              id="filter-cat"
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Member Filter */}
          <div className="form-group">
            <label htmlFor="filter-mem">Crew Member</label>
            <select
              id="filter-mem"
              className="form-control"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="ALL">All Pirates</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group">
            <label htmlFor="sort-by">Sort Order</label>
            <select
              id="sort-by"
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Pill */}
        <div className="flex-between align-center" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-parchment)' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredExpenses.length}</strong> of {expenses.length} expenses
          </span>
          <span style={{ fontSize: '0.95rem' }}>
            Filtered Subtotal: <strong style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-pirate)', fontSize: '1.25rem' }}>
              {formatBeli(totalFilteredSum, currency)}
            </strong>
          </span>
        </div>
      </div>

      {/* Expense List */}
      {expenses.length === 0 ? (
        <EmptyState
          type="no-expenses"
          title="The Ledger is Blank"
          description="No expenses have been recorded for this crew yet. Log your first feast or ship repair!"
          actionLabel="Log First Expense"
          onAction={() => navigate('/expenses')}
        />
      ) : filteredExpenses.length === 0 ? (
        <div className="parchment-card text-center" style={{ padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
          <h4 style={{ fontFamily: 'var(--font-pirate)', color: 'var(--gold-light)' }}>
            No Matching Expenses Found
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try resetting your search query or filters.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedMemberId('ALL');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div>
          {filteredExpenses.map(exp => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ================= EDIT EXPENSE MODAL ================= */}
      {editingExpense && (
        <Modal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          title="✏️ Edit Logged Expense"
          subtitle={`Modifying ${editingExpense.name || editingExpense.description}`}
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="edit-name">Description</label>
              <input
                id="edit-name"
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-2 gap-md" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="edit-amount">Amount ({currency})</label>
                <input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-cat">Category</label>
                <select
                  id="edit-cat"
                  className="form-control"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingExpense(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
