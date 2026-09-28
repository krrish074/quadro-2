/**
 * GRAND LINE LEDGER - Main Application Root
 * React Router setup, Global Context, Layout Shell, and Global Modals
 */
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Navigation Components
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Modal from './components/Modal';

// Pages
import Dashboard from './pages/Dashboard';
import Crew from './pages/Crew';
import Expenses from './pages/Expenses';
import ExpenseHistory from './pages/ExpenseHistory';
import Debts from './pages/Debts';
import Settlements from './pages/Settlements';
import Haki from './pages/Haki';
import WantedBoard from './pages/WantedBoard';
import NamiReminders from './pages/NamiReminders';
import Settings from './pages/Settings';

import { JOLLY_ROGERS } from './data/characters';

function AppContent() {
  const { toastMessage, createCrew } = useApp();
  const navigate = useNavigate();

  // Global New Crew Modal
  const [isNewCrewModalOpen, setIsNewCrewModalOpen] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewDesc, setCrewDesc] = useState('');
  const [crewLogo, setCrewLogo] = useState('☠️');

  const handleCreateCrewSubmit = (e) => {
    e.preventDefault();
    if (!crewName.trim()) return;

    createCrew({
      name: crewName.trim(),
      description: crewDesc.trim(),
      logo: crewLogo
    });

    setCrewName('');
    setCrewDesc('');
    setCrewLogo('☠️');
    setIsNewCrewModalOpen(false);
    navigate('/crew');
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />

      {/* Main Operational Deck */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/crew" element={<Crew onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/expenses" element={<Expenses onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/history" element={<ExpenseHistory onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/debts" element={<Debts onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/settlements" element={<Settlements onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/haki" element={<Haki onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/wanted" element={<WantedBoard onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/reminders" element={<NamiReminders onOpenNewCrewModal={() => setIsNewCrewModalOpen(true)} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      {/* Coin Animation Particle Container */}
      <div id="coin-container" aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}></div>

      {/* Global Create New Voyage Modal */}
      <Modal
        isOpen={isNewCrewModalOpen}
        onClose={() => setIsNewCrewModalOpen(false)}
        title="🏴‍☠️ Set Sail: Create New Voyage"
        subtitle="Establish a new pirate crew and ledger to track shared adventures"
      >
        <form onSubmit={handleCreateCrewSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="new-crew-name">Voyage / Crew Name *</label>
            <input
              id="new-crew-name"
              type="text"
              className="form-control"
              placeholder="e.g. Straw Hat Pirates, Heart Pirates, Red Hair Fleet"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="new-crew-desc">Voyage Purpose / Mission</label>
            <input
              id="new-crew-desc"
              type="text"
              className="form-control"
              placeholder="e.g. Journey to Wano Kingdom, Finding the One Piece"
              value={crewDesc}
              onChange={(e) => setCrewDesc(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem' }}>Jolly Roger Flag</label>
            <div className="flex-row gap-xs">
              {JOLLY_ROGERS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`btn ${crewLogo === emoji ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '1.5rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => setCrewLogo(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewCrewModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              ⚓ Hoist the Jolly Roger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
