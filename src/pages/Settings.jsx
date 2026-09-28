/**
 * GRAND LINE LEDGER - Settings Component
 * Currency preferences, Web Audio sound effects, volume slider, and Straw Hat Benchmark loader
 */
import React from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import { CURRENCIES } from '../data/characters';
import { spawnCoins } from '../utils/helpers';

export default function Settings() {
  const { state, updateSettings, resetAllData, playSound } = useApp();
  const [localThreshold, setLocalThreshold] = React.useState(String(state.settings.excessiveThreshold || 1000));

  React.useEffect(() => {
    if (state.settings.excessiveThreshold) {
      setLocalThreshold(String(state.settings.excessiveThreshold));
    }
  }, [state.settings.excessiveThreshold]);

  const handleCurrencyChange = (sym) => {
    updateSettings({ currency: sym });
    spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 18);
    playSound('coin');
  };

  const handleThresholdChange = (val) => {
    setLocalThreshold(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      updateSettings({ excessiveThreshold: num });
    }
  };

  const handleThresholdBlur = () => {
    const num = parseFloat(localThreshold);
    if (isNaN(num) || num <= 0) {
      setLocalThreshold('1000');
      updateSettings({ excessiveThreshold: 1000 });
    }
  };

  const handleSoundToggle = (enabled) => {
    updateSettings({ sound: enabled });
    if (enabled) {
      playSound('coin');
    }
  };

  const handleVolumeChange = (vol) => {
    updateSettings({ volume: parseFloat(vol) });
  };

  const handleLoadBenchmark = () => {
    if (window.confirm('Load official Straw Hat Pirates test benchmark (Luffy, Zoro, Nami, Sanji + ฿1,200 Going Merry dinner)? Current data will be replaced.')) {
      resetAllData();
      spawnCoins(window.innerWidth / 2, window.innerHeight / 2, 30);
      playSound('join');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('WIPE ALL DATA? This resets all voyages, expenses, and settlements to default state.')) {
      resetAllData();
    }
  };

  return (
    <div className="settings-page view-enter">
      <PageHeader
        icon="⚙️"
        title="Ledger Settings & Options"
        subtitle="Manage currency display, audio synthesizers, and voyage data"
      />

      <div className="grid grid-2 gap-lg">
        {/* LEFT COLUMN: CURRENCY & AUDIO */}
        <div>
          {/* Currency Configuration */}
          <div className="parchment-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 1rem 0' }}>
              💰 Denomination Currency
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Choose your preferred financial denomination across all ledgers:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {Object.entries(CURRENCIES).map(([key, curr]) => {
                const isSelected = (state.settings.currency || '฿') === curr.symbol;
                return (
                  <label
                    key={key}
                    className="flex-between align-center"
                    style={{
                      background: isSelected ? 'rgba(212,160,23,0.18)' : 'rgba(0,0,0,0.2)',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--border-gold)' : '1px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex-row gap-sm align-center">
                      <input
                        type="radio"
                        name="currency"
                        checked={isSelected}
                        onChange={() => handleCurrencyChange(curr.symbol)}
                      />
                      <strong style={{ color: 'var(--text-parchment)' }}>{curr.name}</strong>
                    </div>
                    <span style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-primary)' }}>
                      {curr.symbol}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sound & Audio Effects */}
          <div className="parchment-card">
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 1rem 0' }}>
              🔊 Sound Synthesis (Web Audio)
            </h3>
            <div className="flex-between align-center" style={{ marginBottom: '1.25rem' }}>
              <div>
                <strong>Interactive Sound Effects</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Plays coins, settlement fanfares, and ocean notes
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${state.settings.sound ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSoundToggle(!state.settings.sound)}
              >
                {state.settings.sound ? 'Enabled' : 'Muted'}
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="volume-slider">Volume Level ({Math.round((state.settings.volume || 0.4) * 100)}%)</label>
              <input
                id="volume-slider"
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                className="form-control"
                value={state.settings.volume || 0.4}
                onChange={(e) => handleVolumeChange(e.target.value)}
              />
            </div>
          </div>

          {/* Nami's Excessive Debt Warning Threshold */}
          <div className="parchment-card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: '#e67e22', margin: '0 0 0.5rem 0' }}>
              🍊 Nami's Debt Warning Threshold
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Define the debt threshold that triggers Nami's official "DEBT WARNING" red stamp across the ledger:
            </p>
            <div className="form-group">
              <label htmlFor="excessive-threshold">Excessive Debt Limit ({state.settings.currency || '฿'})</label>
              <input
                id="excessive-threshold"
                type="number"
                min="10"
                step="50"
                className="form-control"
                value={localThreshold}
                onChange={(e) => handleThresholdChange(e.target.value)}
                onBlur={handleThresholdBlur}
              />
              <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Currently set to {state.settings.currency || '฿'}{state.settings.excessiveThreshold || 1000}. When a pirate owes this amount or more, Nami's warning stamp displays automatically.
              </small>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BENCHMARK & STORAGE MANAGEMENT */}
        <div>
          {/* Straw Hat Test Benchmark */}
          <div className="parchment-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(212,160,23,0.12), rgba(15,28,49,0.85))' }}>
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--gold-light)', margin: '0 0 0.5rem 0' }}>
              🍖 Load Straw Hat Benchmark
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Instantly sets up the exact benchmark required in Section 21 of the specification:
              <br />
              • Crew: <strong>Straw Hat Crew</strong>
              <br />
              • Members: <strong>Luffy, Zoro, Nami, Sanji</strong>
              <br />
              • Expense: <strong>Going Merry Dinner (฿1,200)</strong> paid by Luffy
              <br />
              • Expected: Luffy +฿900, Zoro -฿300, Nami -฿300, Sanji -฿300
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleLoadBenchmark}
            >
              🚀 Load Straw Hat Test Benchmark
            </button>
          </div>

          {/* Reset All Data */}
          <div className="parchment-card">
            <h3 style={{ fontFamily: 'var(--font-pirate)', fontSize: '1.5rem', color: 'var(--debt-red)', margin: '0 0 0.5rem 0' }}>
              ⚠️ Danger Zone: Ledger Reset
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Clears localStorage and purges all voyages, members, expenses, and transaction logs.
            </p>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%' }}
              onClick={handleClearAll}
            >
              🗑️ Reset All Local Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
