/**
 * GRAND LINE LEDGER - Application Global Context
 * Centralized state provider with actions for crews, members, expenses, and settlements.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadState, saveState, clearState } from '../utils/storage';
import { generateId, SoundEffects } from '../utils/helpers';
import { calculateBalances, calculateDebts, generateSettlementPlan } from '../utils/calculations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadState());
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const showToast = (message, duration = 3000) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, duration);
  };

  // Sound helper using current volume & sound toggle
  const playSound = (soundName) => {
    const fn = SoundEffects[soundName];
    if (fn) {
      fn(state.settings.volume, state.settings.sound);
    }
  };

  // Find active crew
  const currentCrew = state.crews.find(c => c.id === state.currentCrewId) || state.crews[0] || null;

  // Active crew calculations
  const financials = currentCrew ? calculateBalances(currentCrew) : { balances: {}, totalPaid: {}, totalOwed: {} };
  const debts = currentCrew ? calculateDebts(currentCrew) : [];
  const settlementPlan = currentCrew ? generateSettlementPlan(financials.balances) : [];

  /* ---------------- Crew Actions ---------------- */
  const createCrew = ({ name, description, logo = '☠️', color = '#d9a521' }) => {
    const newCrew = {
      id: generateId(),
      name,
      description,
      logo,
      color,
      createdDate: new Date().toISOString().slice(0, 10),
      archived: false,
      members: [],
      expenses: [],
      settlements: [],
      hakiLog: [],
      dismissedReminders: {}
    };

    setState(prev => ({
      ...prev,
      crews: [...prev.crews, newCrew],
      currentCrewId: newCrew.id
    }));

    playSound('join');
    showToast(`⚓ Welcome aboard the ${name}!`);
    return newCrew.id;
  };

  const deleteCrew = (crewId) => {
    setState(prev => {
      const remaining = prev.crews.filter(c => c.id !== crewId);
      const nextId = remaining.length ? remaining[0].id : null;
      return {
        ...prev,
        crews: remaining,
        currentCrewId: nextId
      };
    });
    playSound('leave');
    showToast('Crew disbanded.');
  };

  const renameCrew = (crewId, newName) => {
    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => c.id === crewId ? { ...c, name: newName } : c)
    }));
    showToast('Crew renamed successfully.');
  };

  const toggleArchiveCrew = (crewId) => {
    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => c.id === crewId ? { ...c, archived: !c.archived } : c)
    }));
  };

  const setCurrentCrewId = (crewId) => {
    setState(prev => ({
      ...prev,
      currentCrewId: crewId
    }));
    playSound('nav');
  };

  /* ---------------- Member Actions ---------------- */
  const addMember = (crewId, { name, nickname, avatar, customImage }) => {
    const member = {
      id: generateId(),
      name,
      nickname,
      avatar,
      customImage,
      hakiPoints: 0
    };

    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;
        return {
          ...c,
          members: [...c.members, member]
        };
      })
    }));

    playSound('join');
    showToast(`⚔️ ${name} enlisted into the crew!`);
  };

  const removeMember = (crewId, memberId) => {
    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;
        return {
          ...c,
          members: c.members.filter(m => m.id !== memberId)
        };
      })
    }));

    playSound('leave');
    showToast('Pirate removed from crew roster.');
  };

  /* ---------------- Expense Actions ---------------- */
  const addExpense = (crewId, expenseData) => {
    const newExpense = {
      id: generateId(),
      name: expenseData.name,
      amount: Number(expenseData.amount),
      date: expenseData.date || new Date().toISOString().slice(0, 10),
      category: expenseData.category || 'Other',
      participants: expenseData.participants || [],
      splitType: expenseData.splitType || 'equal',
      shares: expenseData.shares || {},
      payments: expenseData.payments || {},
      notes: expenseData.notes || ''
    };

    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;
        return {
          ...c,
          expenses: [...c.expenses, newExpense]
        };
      })
    }));

    playSound('coin');
    showToast(`🪙 Logged "${newExpense.name}"!`);
  };

  const editExpense = (crewId, expenseId, updatedData) => {
    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;
        return {
          ...c,
          expenses: c.expenses.map(e => {
            if (e.id !== expenseId) return e;
            return {
              ...e,
              ...updatedData,
              amount: Number(updatedData.amount)
            };
          })
        };
      })
    }));

    showToast('Expense updated successfully.');
  };

  const deleteExpense = (crewId, expenseId) => {
    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;
        return {
          ...c,
          expenses: c.expenses.filter(e => e.id !== expenseId)
        };
      })
    }));

    playSound('leave');
    showToast('Expense deleted. Balances updated.');
  };

  /* ---------------- Settlement Actions ---------------- */
  const recordSettlement = (crewId, { from, to, amount }) => {
    const settlement = {
      id: generateId(),
      from,
      to,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
      status: 'paid'
    };

    // Calculate Haki award
    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;

        const updatedMembers = c.members.map(m => {
          if (m.id === from) {
            return {
              ...m,
              hakiPoints: (m.hakiPoints || 0) + 10,
              glow: true
            };
          }
          return m;
        });

        const payerName = c.members.find(m => m.id === from)?.name || 'Pirate';
        const logEntry = `${payerName} earned +10 Haki for debt settlement!`;

        return {
          ...c,
          settlements: [...c.settlements, settlement],
          members: updatedMembers,
          hakiLog: [...(c.hakiLog || []), logEntry]
        };
      })
    }));

    playSound('pay');
    playSound('coin');
    showToast(`⚓ Settlement recorded! +10 Haki awarded!`);
  };

  const settleEntireCrew = (crewId) => {
    if (!settlementPlan.length) return;

    const today = new Date().toISOString().slice(0, 10);
    const newSettlements = settlementPlan.map(p => ({
      id: generateId(),
      from: p.from,
      to: p.to,
      amount: p.amount,
      date: today,
      status: 'paid'
    }));

    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;

        const updatedMembers = c.members.map(m => {
          const wasDebtor = settlementPlan.some(p => p.from === m.id);
          return wasDebtor
            ? { ...m, hakiPoints: (m.hakiPoints || 0) + 15, glow: true }
            : m;
        });

        return {
          ...c,
          settlements: [...c.settlements, ...newSettlements],
          members: updatedMembers,
          hakiLog: [...(c.hakiLog || []), `Whole crew settled debts! (+15 Haki to settled debtors)`]
        };
      })
    }));

    playSound('pay');
    showToast('⚓ The entire crew is settled! All debts cleared!');
  };

  /* ---------------- Settings & Miscellaneous ---------------- */
  const updateSettings = (newSettings) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
    showToast('Settings updated.');
  };

  const dismissNamiReminder = (crewId, memberId) => {
    setState(prev => ({
      ...prev,
      crews: prev.crews.map(c => {
        if (c.id !== crewId) return c;
        return {
          ...c,
          dismissedReminders: { ...(c.dismissedReminders || {}), [memberId]: true }
        };
      })
    }));
    showToast('Reminder dismissed for this week.');
  };

  const resetAllData = () => {
    clearState();
    setState(loadState());
    showToast('All application data reset to initial defaults.');
  };

  const value = {
    state,
    currentCrew,
    financials,
    debts,
    settlementPlan,
    toastMessage,
    showToast,
    playSound,
    createCrew,
    deleteCrew,
    renameCrew,
    toggleArchiveCrew,
    setCurrentCrewId,
    addMember,
    removeMember,
    addExpense,
    editExpense,
    deleteExpense,
    recordSettlement,
    settleEntireCrew,
    updateSettings,
    dismissNamiReminder,
    resetAllData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
