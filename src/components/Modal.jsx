/**
 * GRAND LINE LEDGER - Modal Component
 * Reusable modal overlay with accessible ESC key handling and backdrop click
 */
import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, subtitle, children, footer, maxWidth = '620px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop active"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-box view-enter"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 id="modal-title" className="modal-title">
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close Modal"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
