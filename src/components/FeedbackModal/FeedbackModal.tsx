'use client';
// src/components/FeedbackModal/FeedbackModal.tsx
import { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => Promise<void>;
  title: string;
  subtitle?: string;
  placeholder?: string;
  submitLabel?: string;
  submitClassName?: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  placeholder = 'Describe what needs to change...',
  submitLabel = 'Submit Feedback',
  submitClassName = 'btn btn-danger',
}: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError('Feedback is required before submitting.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(feedback.trim());
      setFeedback('');
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFeedback('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={handleClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <label className="form-label">Feedback *</label>
          <textarea
            className="form-textarea"
            value={feedback}
            onChange={(e) => { setFeedback(e.target.value); setError(''); }}
            placeholder={placeholder}
            autoFocus
          />
          {error && (
            <p style={{ color: 'var(--status-rejected-text)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>{error}</p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose} disabled={loading}>Cancel</button>
          <button className={submitClassName} onClick={handleSubmit} disabled={loading || !feedback.trim()}>
            {loading ? 'Submitting...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
