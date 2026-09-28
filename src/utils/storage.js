/**
 * GRAND LINE LEDGER - LocalStorage Persistence Service
 */

const STORAGE_KEY = 'grand_line_ledger_react_state';

const BENCHMARK_CREW = {
  id: 'crew_straw_hat',
  name: 'Straw Hat Crew',
  description: 'Voyage to the Grand Line & Laugh Tale',
  logo: '☠️',
  color: '#d9a521',
  createdDate: '2026-09-28',
  archived: false,
  members: [
    { id: 'm_luffy', name: 'Monkey D. Luffy', role: 'Captain', avatar: '🏴‍☠️', hakiPoints: 80 },
    { id: 'm_zoro',  name: 'Roronoa Zoro',     role: 'Swordsman', avatar: '⚔️', hakiPoints: 50 },
    { id: 'm_nami',  name: 'Nami',              role: 'Navigator', avatar: '🍊', hakiPoints: 95 },
    { id: 'm_sanji', name: 'Sanji',             role: 'Cook', avatar: '🚬', hakiPoints: 60 }
  ],
  expenses: [
    {
      id: 'exp_merry_dinner',
      name: 'Going Merry Dinner',
      amount: 1200,
      category: 'Food',
      date: '2026-09-28',
      participants: ['m_luffy', 'm_zoro', 'm_nami', 'm_sanji'],
      splitType: 'equal',
      shares: {
        m_luffy: 300,
        m_zoro: 300,
        m_nami: 300,
        m_sanji: 300
      },
      payments: {
        m_luffy: 1200
      },
      paidBy: 'm_luffy',
      notes: 'Grand feast at the Baratie floating restaurant'
    }
  ],
  settlements: [],
  hakiLog: [
    'Voyage commenced into the Grand Line!',
    'Monkey D. Luffy logged feast: Going Merry Dinner (฿1,200)'
  ],
  dismissedReminders: {}
};

export const INITIAL_STATE = {
  crews: [BENCHMARK_CREW],
  currentCrewId: 'crew_straw_hat',
  settings: {
    sound: true,
    volume: 0.4,
    animations: true,
    currency: '฿',
    overdueDays: 7,
    overduePenalty: 0,
    excessiveThreshold: 1000
  }
};

/**
 * Loads application state from localStorage or returns initial state.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_STATE,
        ...parsed,
        settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
        crews: Array.isArray(parsed.crews) ? parsed.crews : []
      };
    }
  } catch (err) {
    console.warn('Failed to read from localStorage:', err);
  }
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

/**
 * Saves application state to localStorage.
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
    return false;
  }
}

/**
 * Resets application state to default.
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
    return false;
  }
}
