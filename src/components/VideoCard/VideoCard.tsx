'use client';
// src/components/VideoCard/VideoCard.tsx
import { useState } from 'react';
import { VideoDraft } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import FeedbackModal from '@/components/FeedbackModal/FeedbackModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  draft: VideoDraft;
  mode: 'noa_prompt' | 'noa_video' | 'founders';
  onApprove?: () => Promise<void>;
  onReject?: (feedback: string) => Promise<void>;
  onComment?: (feedback: string) => Promise<void>;
  onDisapprove?: () => Promise<void>;
}

export default function VideoCard({ draft, mode, onApprove, onReject, onComment, onDisapprove }: VideoCardProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [disapproveOpen, setDisapproveOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [agentExpanded, setAgentExpanded] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setApproving(true);
    try { await onApprove(); } finally { setApproving(false); }
  };

  const timeAgo = draft.updatedAt
    ? formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })
    : '';

  const isGenerating = draft.draftStatus === 'generating_video';

  const rejectConfig = {
    noa_prompt: {
      title: 'Reject Prompt & Regenerate',
      subtitle: 'Your feedback will be sent to the AI to generate a new Higgsfield prompt.',
      placeholder: 'What should change about this prompt? What visual direction do you want?',
      label: 'Reject Prompt',
    },
    noa_video: {
      title: 'Reject Video & Regenerate',
      subtitle: 'Your feedback will trigger a new prompt + video generation cycle.',
      placeholder: 'What\'s wrong with the video? What should be different?',
      label: 'Reject Video',
    },
    founders: {
      title: 'Comment & Request Revision',
      subtitle: 'This will send the content back for AI revision with your feedback.',
      placeholder: 'What should be revised?',
      label: 'Send for Revision',
    },
  }[mode];

  return (
    <>
      <div className="content-card">
        {/* Generation progress */}
        {(draft.generationStage && draft.generationStage !== 'complete') && (
          <div className="agent-progress">
            <div className="agent-progress-dots"><span/><span/><span/></div>
            <span className="agent-progress-label">
              {draft.generationStage === 'agent_1' && 'Agent 1 — Extracting data...'}
              {draft.generationStage === 'agent_2' && 'Agent 2 — Generating hooks...'}
              {draft.generationStage === 'agent_3' && 'Agent 3 — Writing Higgsfield prompt...'}
              {draft.generationStage === 'agent_4' && 'Agent 4 — Brand compliance...'}
              {draft.generationStage === 'higgsfield' && 'Higgsfield — Generating video...'}
              {draft.generationStage === 'socialbee' && 'SocialBee — Posting...'}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="content-card-header">
          <div className="content-card-meta">
            <StatusBadge status={draft.draftStatus} />
            {draft.iterationCount > 0 && (
              <span className="iteration-badge">Iteration #{draft.iterationCount + 1}</span>
            )}
          </div>
          <span className="card-timestamp">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {timeAgo}
          </span>
        </div>

        {/* Prompt block (always shown for prompt review; collapsible for video review) */}
        {mode === 'noa_prompt' && (
          <div className="content-card-body">
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Higgsfield Prompt
            </label>
            <div className="prompt-body-text">{draft.finalDraft || '(Generating prompt...)'}</div>
          </div>
        )}

        {/* Video player for video review / founders */}
        {(mode === 'noa_video' || mode === 'founders') && (
          <>
            {isGenerating || !draft.videoUrl ? (
              <div className="video-placeholder">
                <div className="video-generating-animation">
                  <span/><span/><span/>
                </div>
                <span>Generating video with Higgsfield...</span>
              </div>
            ) : (
              <div className="video-wrapper">
                <video
                  controls
                  muted
                  preload="metadata"
                  poster={draft.videoThumbnailUrl || undefined}
                  style={{ width: '100%', maxHeight: 340, borderRadius: 10 }}
                >
                  <source src={draft.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Collapsible prompt used */}
            <button className="collapsible-trigger" onClick={() => setPromptExpanded(!promptExpanded)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: promptExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              View Original Prompt
            </button>
            <div className={`collapsible-content${promptExpanded ? ' open' : ''}`}>
              <div style={{ padding: '0 18px 14px' }}>
                <div className="prompt-body-text">{draft.finalDraft}</div>
              </div>
            </div>
          </>
        )}

        {/* Previous feedback shown */}
        {draft.noaPromptFeedback && (
          <div style={{ padding: '0 18px 12px' }}>
            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
              <strong style={{ display: 'block', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Previous prompt feedback
              </strong>
              {draft.noaPromptFeedback}
            </div>
          </div>
        )}
        {draft.noaVideoFeedback && (
          <div style={{ padding: '0 18px 12px' }}>
            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
              <strong style={{ display: 'block', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Previous video feedback
              </strong>
              {draft.noaVideoFeedback}
            </div>
          </div>
        )}
        {draft.founderFeedback && (
          <div style={{ padding: '0 18px 12px' }}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#1e40af' }}>
              <strong style={{ display: 'block', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Founder comment
              </strong>
              {draft.founderFeedback}
            </div>
          </div>
        )}

        {/* Agent outputs collapsible */}
        {(draft.agent1Output || draft.agent2Output) && (
          <>
            <button className="collapsible-trigger" onClick={() => setAgentExpanded(!agentExpanded)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: agentExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Agent Pipeline Outputs
            </button>
            <div className={`collapsible-content${agentExpanded ? ' open' : ''}`}>
              <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Agent 1 — Extract & Tag', value: draft.agent1Output },
                  { label: 'Agent 2 — Ideation', value: draft.agent2Output },
                  { label: 'Agent 3 — Higgsfield Prompt', value: draft.agent3Output },
                  { label: 'Agent 4 — Brand Check', value: draft.agent4Output },
                ].filter(a => a.value).map(a => (
                  <div key={a.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', color: '#6b7280', marginBottom: 6 }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }}>
                      {a.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer actions */}
        {(onApprove || onReject || onComment || onDisapprove) && (
          <div className="content-card-footer">
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Job: <code style={{ fontSize: 11 }}>{draft.jobId}</code>
            </div>
            <div className="card-actions">
              {mode === 'noa_prompt' && onReject && (
                <button className="btn btn-ghost" onClick={() => setRejectOpen(true)}>✕ Reject Prompt</button>
              )}
              {mode === 'noa_prompt' && onApprove && (
                <button className="btn btn-success" onClick={handleApprove} disabled={approving}>
                  {approving ? 'Sending...' : '✓ Approve Prompt'}
                </button>
              )}
              {mode === 'noa_video' && onReject && (
                <button className="btn btn-ghost" onClick={() => setRejectOpen(true)}>✕ Reject Video</button>
              )}
              {mode === 'noa_video' && onApprove && (
                <button className="btn btn-success" onClick={handleApprove} disabled={approving}>
                  {approving ? 'Sending...' : '✓ Approve Video'}
                </button>
              )}
              {mode === 'founders' && onDisapprove && (
                <button className="btn btn-ghost" style={{ color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => setDisapproveOpen(true)}>
                  ✕ Disapprove
                </button>
              )}
              {mode === 'founders' && onComment && (
                <button className="btn btn-warning" onClick={() => setCommentOpen(true)}>✎ Comment</button>
              )}
              {mode === 'founders' && onApprove && (
                <button className="btn btn-success" onClick={handleApprove} disabled={approving}>
                  {approving ? 'Sending...' : '✓ Approve'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={onReject || onComment || (async () => {})}
        title={rejectConfig.title}
        subtitle={rejectConfig.subtitle}
        placeholder={rejectConfig.placeholder}
        submitLabel={rejectConfig.label}
        submitClassName={mode === 'founders' ? 'btn btn-warning' : 'btn btn-danger'}
      />
      {mode === 'founders' && (
        <FeedbackModal
          isOpen={commentOpen}
          onClose={() => setCommentOpen(false)}
          onSubmit={onComment!}
          title="Comment & Request Revision"
          subtitle="Your comment will be sent back to the AI agents as revision context."
          placeholder="What should be revised or changed?"
          submitLabel="Send for Revision"
          submitClassName="btn btn-warning"
        />
      )}
      <ConfirmDialog
        isOpen={disapproveOpen}
        onClose={() => setDisapproveOpen(false)}
        onConfirm={onDisapprove!}
        title="Disapprove Video"
        message="This will permanently end this video's workflow. The item will be archived. This cannot be undone."
        confirmLabel="Yes, Disapprove"
        confirmClassName="btn btn-danger"
      />
    </>
  );
}
