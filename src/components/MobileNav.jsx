/**
 * GRAND LINE LEDGER - Mobile Bottom Navigation Component
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { playSound } = useApp();

  const mobileNavItems = [
    { to: '/dashboard', icon: '🧭', label: 'Dashboard' },
    { to: '/crew', icon: '🏴‍☠️', label: 'Crew' },
    { to: '/expenses', icon: '💰', label: 'Expenses' },
    { to: '/debts', icon: '⚖️', label: 'Debts' },
    { to: '/settlements', icon: '⚓', label: 'Settle' },
    { to: '/history', icon: '📜', label: 'History' },
    { to: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <nav id="bottom-nav" aria-label="Mobile Navigation">
      {mobileNavItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => playSound('nav')}
          className={({ isActive }) => `bottom-nav-btn ${isActive ? 'active' : ''}`}
        >
          <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
