/**
 * GRAND LINE LEDGER - Captain's Command Console Sidebar
 * Nautical Treasure Map + Captain's Command Console + Premium Fintech Dashboard
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Sidebar({ onOpenNewCrewModal }) {
  const { state, currentCrew, setCurrentCrewId, updateSettings, playSound } = useApp();
  const navigate = useNavigate();

  const sections = [
    {
      title: 'VOYAGE',
      icon: '⚓',
      items: [
        { to: '/dashboard', icon: '🧭', label: 'Dashboard' },
        { to: '/crew', icon: '🏴‍☠️', label: 'Crew Deck' },
        { to: '/expenses', icon: '💰', label: 'Log Expense' },
        { to: '/history', icon: '📜', label: "Captain's Log" }
      ]
    },
    {
      title: 'TREASURY',
      icon: '⚖',
      items: [
        { to: '/debts', icon: '⚖️', label: 'Crew Debts' },
        { to: '/settlements', icon: '⚓', label: 'Settlements' }
      ]
    },
    {
      title: 'BOUNTY',
      icon: '☠',
      items: [
        { to: '/wanted', icon: '📌', label: 'Wanted Board' },
        { to: '/reminders', icon: '🍊', label: 'Nami Reminders' },
        { to: '/haki', icon: '⚡', label: 'Haki' }
      ]
    },
    {
      title: 'SYSTEM',
      icon: '⚙',
      items: [
        { to: '/settings', icon: '⚙️', label: 'Settings' }
      ]
    }
  ];

  const handleCrewChange = (e) => {
    setCurrentCrewId(e.target.value);
  };

  const toggleSound = () => {
    updateSettings({ sound: !state.settings.sound });
    if (!state.settings.sound) {
      playSound('coin');
    }
  };

  const memberCount = currentCrew?.members?.length || 0;

  return (
    <aside className="sidebar" aria-label="Captain's Navigation Console">
      {/* 1. BRAND AREA */}
      <button
        type="button"
        className="sidebar-brand-box"
        onClick={() => { playSound('nav'); navigate('/dashboard'); }}
        aria-label="Grand Line Ledger Dashboard"
      >
        <div className="sidebar-emblem-wrapper">
          <span className="sidebar-emblem-icon" role="img" aria-label="Pirate Jolly Roger">☠</span>
        </div>
        <div className="sidebar-title-container">
          <span className="sidebar-brand-main">GRAND LINE</span>
          <span className="sidebar-brand-sub">LEDGER</span>
        </div>
        <div className="sidebar-tagline">
          <span>MANAGE YOUR CREW</span>
          <span>SPLIT YOUR BELI</span>
          <span>SETTLE YOUR DEBTS</span>
        </div>
      </button>

      {/* Decorative Gold Rope Divider */}
      <div className="sidebar-rope-divider" aria-hidden="true" />

      {/* 2. NAVIGATION MENU & SECTIONS */}
      <nav className="sidebar-nav-container">
        {sections.map(section => (
          <div key={section.title} className="sidebar-section-group">
            <div className="sidebar-section-header">
              <span className="sidebar-section-header-icon" aria-hidden="true">{section.icon}</span>
              <span>{section.title}</span>
              <span className="sidebar-section-line" aria-hidden="true" />
            </div>
            <div className="sidebar-section-items">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => playSound('nav')}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="sidebar-nav-item-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-nav-item-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. ACTIVE VOYAGE CARD */}
      <div className="sidebar-voyage-card">
        <div className="sidebar-voyage-header">
          <span className="sidebar-voyage-title">
            ⚓ ACTIVE VOYAGE
          </span>
          <span className="sidebar-voyage-status">
            <span className="sidebar-status-dot" aria-hidden="true" /> ACTIVE
          </span>
        </div>

        <div className="sidebar-crew-info">
          <div className="sidebar-crew-logo" aria-hidden="true">
            {currentCrew ? (currentCrew.logo || '☠️') : '☠️'}
          </div>
          <div className="sidebar-crew-details">
            <span className="sidebar-crew-name" title={currentCrew ? currentCrew.name : 'No Active Crew'}>
              {currentCrew ? currentCrew.name : 'No Active Crew'}
            </span>
            <span className="sidebar-crew-count">
              {memberCount} {memberCount === 1 ? 'Crew Member' : 'Crew Members'}
            </span>
          </div>
        </div>

        {/* Dynamic Crew Switcher Dropdown */}
        <select
          id="sidebar-crew-select"
          aria-label="Select active pirate crew"
          className="sidebar-crew-dropdown"
          value={currentCrew ? currentCrew.id : ''}
          onChange={handleCrewChange}
        >
          {state.crews.map(c => (
            <option key={c.id} value={c.id}>
              {c.logo || '☠️'} {c.name}
            </option>
          ))}
          {!state.crews.length && <option value="">No Active Crew</option>}
        </select>

        {/* 4. NEW VOYAGE BUTTON */}
        <button
          type="button"
          className="sidebar-btn-new-voyage"
          onClick={onOpenNewCrewModal}
        >
          + NEW VOYAGE
        </button>
      </div>

      {/* 5. SOUND CONTROL */}
      <div className="sidebar-sound-footer">
        <button
          type="button"
          className="sidebar-sound-toggle-btn"
          onClick={toggleSound}
          aria-label="Toggle Captain Console Audio"
        >
          <span>{state.settings.sound ? '🔊 Sound: ON' : '🔇 Sound: OFF'}</span>
          <span className={`sidebar-sound-indicator ${state.settings.sound ? 'on' : 'off'}`}>
            {state.settings.sound ? 'ONLINE' : 'MUTED'}
          </span>
        </button>
      </div>
    </aside>
  );
}
