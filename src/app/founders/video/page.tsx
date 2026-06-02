'use client';
// src/app/founders/video/page.tsx
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { VideoDraft } from '@/lib/types';
import VideoCard from '@/components/VideoCard/VideoCard';
import EmptyState from '@/components/EmptyState/EmptyState';
import Toast, { ToastMessage } from '@/components/Toast/Toast';
import { CheckCircle2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());
function generateId() { return Math.random().toString(36).slice(2); }

export default function FoundersVideoPage() {
  const { data, error, isLoading, mutate } = useSWR<VideoDraft[]>(
    '/api/video-drafts?status=pending_founders',
    fetcher,
    { refreshInterval: 30000 }
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts(prev => [...prev, { id: generateId(), type, message }]);
  };

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const patch = async (jobId: string, body: object) => {
    const res = await fetch(`/api/video-drafts/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  };

  const handleApprove = async (draft: VideoDraft) => {
    await patch(draft.jobId, {
      draftStatus: 'approved_founders',
      founderAction: 'approved',
    });
    addToast('success', 'Video approved sending to SocialBee for posting ✓');
    mutate();
  };

  const handleComment = async (draft: VideoDraft, feedback: string) => {
    await patch(draft.jobId, {
      draftStatus: 'revision_requested_founders',
      founderFeedback: feedback,
      founderAction: 'commented',
    });
    addToast('info', 'Comment sent AI will regenerate with your feedback');
    mutate();
  };

  const handleDisapprove = async (draft: VideoDraft) => {
    await patch(draft.jobId, {
      draftStatus: 'rejected_founders',
      founderAction: 'disapproved',
    });
    addToast('error', 'Video disapproved and workflow ended');
    mutate();
  };

  const drafts = Array.isArray(data) ? data : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Video Content Review</h1>
        <p className="page-subtitle">
          {isLoading ? 'Loading...' : `${drafts.length} video${drafts.length !== 1 ? 's' : ''} awaiting your decision`}
        </p>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
        border: '1px solid #c4b5fd',
        borderRadius: 10, padding: '8px 14px', marginBottom: 24,
        fontSize: 13, fontWeight: 600, color: '#4c1d95'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        Founder Team — Final Video Approval
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#fee2e2', borderRadius: 10, color: '#991b1b', marginBottom: 20, fontSize: 14 }}>
          ⚠ Failed to load. Check your MongoDB connection.
        </div>
      )}

      {isLoading ? (
        <div className="queue-grid">
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 400, borderRadius: 14 }} />)}
        </div>
      ) : drafts.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={48} color="#9ca3af" strokeWidth={1.5} />}
          title="No videos pending your review"
          body="Videos approved by Noa will appear here for your final decision."
        />
      ) : (
        <div className="queue-grid">
          {drafts.map((draft) => (
            <VideoCard
              key={draft.jobId}
              draft={draft}
              mode="founders"
              onApprove={() => handleApprove(draft)}
              onComment={(fb) => handleComment(draft, fb)}
              onDisapprove={() => handleDisapprove(draft)}
            />
          ))}
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
