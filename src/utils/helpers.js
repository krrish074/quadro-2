/**
 * GRAND LINE LEDGER - UI & Formatting Helpers + Web Audio Synthesis
 */
import { CURRENCIES, HAKI_RANKS } from '../data/characters';

export function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

export function formatBeli(amount, symbol = '฿', decimals = 0) {
  if (isNaN(amount) || amount == null) amount = 0;
  const num = Number(amount);
  const formatted = decimals > 0
    ? num.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(num).toLocaleString('en-IN');
  return `${symbol}${formatted}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown Date';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function getCategoryMeta(category) {
  switch (category) {
    case 'Food':
      return { icon: '🍖', label: 'Food & Feasts' };
    case 'Travel':
      return { icon: '🗺️', label: 'Sea Travel & Log Pose' };
    case 'Accommodation':
      return { icon: '🏨', label: 'Inns & Port Lodging' };
    case 'Ship':
      return { icon: '⛵', label: 'Ship Repairs & Cola' };
    case 'Entertainment':
      return { icon: '🎪', label: 'Tavern Revelry & Music' };
    case 'Supplies':
      return { icon: '📦', label: 'Medicines & Ammo' };
    default:
      return { icon: '💰', label: 'General Sundries' };
  }
}

export function getHakiRank(balance = 0) {
  if (balance >= 1000) {
    return { title: "Conqueror's Haki", badge: '👑', desc: 'Supreme Quartermaster reputation' };
  } else if (balance >= 200) {
    return { title: 'Armament Haki', badge: '🛡️', desc: 'Sturdy financial discipline' };
  } else if (balance >= 0) {
    return { title: 'Observation Haki', badge: '👁️', desc: 'Balanced books & clear sea vision' };
  } else {
    return { title: 'Rookie Pirate', badge: '🥉', desc: 'Under debt notice' };
  }
}

export function getHakiRankTitle(points = 0) {
  const matched = [...HAKI_RANKS].reverse().find(r => points >= r[0]);
  return matched ? matched[1] : 'Rookie Pirate';
}

/* ---------------- Web Audio API Synthesizer ---------------- */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSynthesizedTones(notes, waveform = 'sine', volume = 0.5, soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    let time = ctx.currentTime;
    const masterVol = volume * 0.2;

    notes.forEach(([freq, duration, noteVol = 1]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, time);

      const targetGain = Math.max(0.0001, masterVol * noteVol);
      gain.gain.setValueAtTime(targetGain, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration + 0.05);

      time += duration * 0.82;
    });
  } catch (err) {
    console.warn('Audio tone synthesis issue:', err);
  }
}

export const SoundEffects = {
  coin: (vol, snd) => playSynthesizedTones([[988, 0.09], [1319, 0.25]], 'square', vol, snd),
  pay: (vol, snd) => playSynthesizedTones([[660, 0.1], [880, 0.1], [1175, 0.3]], 'triangle', vol, snd),
  part: (vol, snd) => playSynthesizedTones([[700, 0.15, 0.6]], 'sine', vol, snd),
  haki: (vol, snd) => playSynthesizedTones([[150, 0.18], [300, 0.18], [600, 0.18], [1200, 0.38]], 'sawtooth', vol, snd),
  nami: (vol, snd) => playSynthesizedTones([[220, 0.15], [196, 0.15], [147, 0.45, 1.2]], 'sawtooth', vol, snd),
  wanted: (vol, snd) => playSynthesizedTones([[110, 0.3], [90, 0.4]], 'square', vol, snd),
  nav: (vol, snd) => playSynthesizedTones([[300, 0.12, 0.4], [380, 0.15, 0.4]], 'sine', vol, snd),
  join: (vol, snd) => playSynthesizedTones([[520, 0.1], [780, 0.2]], 'triangle', vol, snd),
  leave: (vol, snd) => playSynthesizedTones([[500, 0.12], [350, 0.25]], 'triangle', vol, snd)
};

export function spawnCoins(xOrEl, y, count = 12) {
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if (typeof xOrEl === 'number') {
    startX = xOrEl;
    startY = typeof y === 'number' ? y : window.innerHeight / 2;
  } else if (xOrEl && xOrEl.getBoundingClientRect) {
    const rect = xOrEl.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  }

  const container = document.getElementById('coin-container') || document.body;
  const numCoins = typeof count === 'number' ? count : 12;

  for (let i = 0; i < numCoins; i++) {
    const coin = document.createElement('div');
    coin.className = 'coin-particle';
    coin.textContent = '🪙';
    coin.style.left = startX + 'px';
    coin.style.top = startY + 'px';

    const dx = (Math.random() * 300 - 150) + 'px';
    const dy = (-100 - Math.random() * 180) + 'px';
    coin.style.setProperty('--dx', dx);
    coin.style.setProperty('--dy', dy);
    coin.style.animationDelay = (i * 45) + 'ms';

    container.appendChild(coin);
    setTimeout(() => coin.remove(), 1600);
  }
}
