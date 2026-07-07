'use client';
// src/app/noa/video/page.tsx
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { VideoDraft } from '@/lib/types';
import VideoCard from '@/components/VideoCard/VideoCard';
import EmptyState from '@/components/EmptyState/EmptyState';
import Toast, { ToastMessage } from '@/components/Toast/Toast';
import { PenLine, Film } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());
function generateId() { return Math.random().toString(36).slice(2); }

export default function NoaVideoPage() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'video'>('prompt');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { data: promptData, isLoading: promptLoading, error: promptError, mutate: mutatePrompts } = useSWR<VideoDraft[]>(
    '/api/video-drafts?status=pending_noa_prompt',
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: videoData, isLoading: videoLoading, error: videoError, mutate: mutateVideos } = useSWR<VideoDraft[]>(
    '/api/video-drafts?status=pending_noa_video',
    fetcher,
    { refreshInterval: 30000 }
  );

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

  // Prompt actions
  const handleApprovePrompt = async (draft: VideoDraft) => {
    await patch(draft.jobId, { draftStatus: 'generating_video' });
    addToast('success', 'Prompt approved Higgsfield is generating the video ✓');
    mutatePrompts();
  };

  const handleRejectPrompt = async (draft: VideoDraft, feedback: string) => {
    await patch(draft.jobId, { draftStatus: 'rejected_noa_prompt', noaPromptFeedback: feedback });
    addToast('info', 'Prompt rejected AI will generate a new prompt');
    mutatePrompts();
  };

  // Video actions
  const handleApproveVideo = async (draft: VideoDraft) => {
    await patch(draft.jobId, { draftStatus: 'approved_noa' });
    addToast('success', 'Video approved ✓');
    mutateVideos();
  };

  const handleRejectVideo = async (draft: VideoDraft, feedback: string) => {
    await patch(draft.jobId, { draftStatus: 'rejected_noa_video', noaVideoFeedback: feedback });
    addToast('info', 'Video rejected AI will regenerate prompt and video');
    mutateVideos();
  };

  const prompts = Array.isArray(promptData) ? promptData : [];
  const videos = Array.isArray(videoData) ? videoData : [];
  const isLoading = activeTab === 'prompt' ? promptLoading : videoLoading;
  const hasError = activeTab === 'prompt' ? promptError : videoError;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Video Content Review</h1>
        <p className="page-subtitle">Review AI-generated prompts and Higgsfield videos</p>
      </div>

      {/* Sub-tabs */}
      <div className="pill-toggle-group">
        <button
          className={`pill-toggle${activeTab === 'prompt' ? ' active' : ''}`}
          onClick={() => setActiveTab('prompt')}
        >
          Prompt Review
          <span className="pill-count">{prompts.length}</span>
        </button>
        <button
          className={`pill-toggle${activeTab === 'video' ? ' active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          Video Review
          <span className="pill-count">{videos.length}</span>
        </button>
      </div>

      {hasError && (
        <div style={{ padding: '16px', background: '#450a0a', borderRadius: 10, color: '#fca5a5', marginBottom: 20, fontSize: 14 }}>
          ⚠ Failed to load. Check your MongoDB connection.
        </div>
      )}

      {/* Prompt Review Tab */}
      {activeTab === 'prompt' && (
        isLoading ? (
          <div className="queue-grid">
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 14 }} />)}
          </div>
        ) : prompts.length === 0 ? (
          <EmptyState
            icon={<PenLine size={48} color="#9ca3af" strokeWidth={1.5} />}
            title="No prompts pending review"
            body="When the AI pipeline generates a new Higgsfield prompt, it will appear here for your approval."
          />
        ) : (
          <div className="queue-grid">
            {prompts.map(draft => (
              <VideoCard
                key={draft.jobId}
                draft={draft}
                mode="noa_prompt"
                onApprove={() => handleApprovePrompt(draft)}
                onReject={(fb) => handleRejectPrompt(draft, fb)}
              />
            ))}
          </div>
        )
      )}

      {/* Video Review Tab */}
      {activeTab === 'video' && (
        isLoading ? (
          <div className="queue-grid">
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 14 }} />)}
          </div>
        ) : videos.length === 0 ? (
          <EmptyState
            icon={<Film size={48} color="#9ca3af" strokeWidth={1.5} />}
            title="No videos pending review"
            body="Videos generated by Higgsfield will appear here once they're ready for your approval."
          />
        ) : (
          <div className="queue-grid">
            {videos.map(draft => (
              <VideoCard
                key={draft.jobId}
                draft={draft}
                mode="noa_video"
                onApprove={() => handleApproveVideo(draft)}
                onReject={(fb) => handleRejectVideo(draft, fb)}
              />
            ))}
          </div>
        )
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
