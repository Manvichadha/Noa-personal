'use client';
// src/components/ContentCard/ContentCard.tsx
import { useState } from 'react';
import { ContentDraft } from '@/lib/types';
import FeedbackModal from '@/components/FeedbackModal/FeedbackModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import { formatDistanceToNow } from 'date-fns';
import { getPlatformStatus } from '@/lib/utils';

interface ContentCardAction {
  label: string;
  className: string;
  onClick: () => void;
}

interface ContentCardProps {
  draft: ContentDraft;
  actions: ContentCardAction[];
  onApprove?: () => Promise<void>;
  onReject?: (feedback: string) => Promise<void>;
  onHardReject?: () => Promise<void>;
  onComment?: (feedback: string) => Promise<void>;
  onDisapprove?: () => Promise<void>;
  mode: 'noa';
}

const PLATFORM_COLORS: Record<string, { dot: string; text: string; label: string }> = {
  X:         { dot: '#000000', text: '#111827', label: 'X' },
  LinkedIn:  { dot: '#0077b5', text: '#0077b5', label: 'LinkedIn' },
  Instagram: { dot: '#e1306c', text: '#e1306c', label: 'Instagram' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ready_for_noa_review:        { label: 'Ready for review', color: '#f59e0b' },
  pending_noa:                 { label: 'Pending review',   color: '#f59e0b' },
  approved_noa:                { label: 'Approved',         color: '#10b981' },
  rejected_noa:                { label: 'Rejected',         color: '#f87171' },
  rejected_permanently:        { label: 'Rejected',         color: '#f87171' },
  posted:                      { label: 'Posted',           color: '#14b8a6' },
  scheduled:                   { label: 'Scheduled',        color: '#8b5cf6' },
  formatting_parse_failed:     { label: 'Formatting Error', color: '#f43f5e' },
};


export default function ContentCard({ draft, onApprove, onReject, onHardReject, onComment, onDisapprove, mode }: ContentCardProps) {
  const [rejectOpen, setRejectOpen]     = useState(false);
  const [hardRejectOpen, setHardRejectOpen] = useState(false);
  const [commentOpen, setCommentOpen]   = useState(false);
  const [disapproveOpen, setDisapproveOpen] = useState(false);
  const [approving, setApproving]       = useState(false);
  const [expanded, setExpanded]         = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setApproving(true);
    try { await onApprove(); } finally { setApproving(false); }
  };

  const timeAgo = draft.updatedAt
    ? formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })
    : '';

  const platform   = draft.platform || 'X';
  const platformCfg = PLATFORM_COLORS[platform] || PLATFORM_COLORS['X'];
  const pStatuses = (draft as any).platformStatuses || {};
  const vPlatform = (draft as any).virtualPlatform;
  const effectiveStatus = vPlatform
    ? getPlatformStatus(pStatuses[vPlatform], draft.draftStatus)
    : draft.draftStatus;
  const statusCfg   = STATUS_MAP[effectiveStatus] || { label: effectiveStatus, color: 'var(--text-tertiary)' };

  const hasAgentOutputs = draft.agent1Output || draft.agent2Output || draft.agent3Output;
  const hasActions = !!(onApprove || onReject || onHardReject || onComment || onDisapprove);

  const extractText = (val: unknown): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val !== 'object') return String(val);
    const clean = { ...(val as any) };
    delete clean.agentName; delete clean.jobId;
    delete clean.contentType; delete clean.status; delete clean.timestamp;
    const gather = (obj: any): string[] => {
      if (typeof obj === 'string') return [obj];
      if (typeof obj !== 'object' || !obj) return [];
      let r: string[] = [];
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === 'string') r.push(v);
        else if (typeof v === 'object') r = r.concat(gather(v));
      }
      return r;
    };
    return gather(clean).join('\n\n');
  };

  return (
    <>
      {/* Card shell */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        paddingBottom: hasActions ? 0 : 18,
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#e4e4e4';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
          (e.currentTarget as HTMLDivElement).style.borderColor = '#f0f0f0';
        }}
      >
        {/* Generating indicator */}
        {draft.draftStatus.includes('generating') && draft.generationStage && draft.generationStage !== 'complete' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 20px',
            background: '#111111',
            borderBottom: '1px solid #f5f5f5',
            fontSize: 12, color: '#888', fontWeight: 500,
          }}>
            <span style={{ display: 'flex', gap: 3 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 4, height: 4, borderRadius: '50%', background: '#bbb',
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                  display: 'inline-block',
                }} />
              ))}
            </span>
            {draft.generationStage === 'agent_1' && 'Extracting & categorising…'}
            {draft.generationStage === 'agent_2' && 'Generating hooks & angles…'}
            {draft.generationStage === 'agent_3' && 'Writing long-form copy…'}
            {draft.generationStage === 'agent_4' && 'Brand compliance check…'}
            {draft.generationStage === 'agent_5' && 'Platform formatting…'}
            {draft.generationStage === 'socialbee' && 'Sending to SocialBee…'}
          </div>
        )}

        {/* Header row — platform + time */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 0',
        }}>
          {/* Platform pill — minimal, no colored background */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: platformCfg.dot, flexShrink: 0,
              display: 'inline-block',
            }} />
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: '#ffffff', letterSpacing: '-0.01em',
            }}>
              {platformCfg.label}
            </span>
          </div>

          {/* Time */}
          <span style={{ fontSize: 11.5, color: '#aaa', fontWeight: 400 }}>
            {timeAgo}
          </span>
        </div>

        {/* Status row */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: statusCfg.color, flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {statusCfg.label}
          </span>
          {draft.iterationCount > 0 && (
            <span style={{
              marginLeft: 4, fontSize: 10.5, color: '#bbb',
              fontWeight: 500,
            }}>
              · Draft {draft.iterationCount + 1}
            </span>
          )}
        </div>

        {/* Body text */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{
            height: 160,
            overflowY: 'auto',
            fontSize: 13.5,
            lineHeight: 1.65,
            color: '#1a1a1a',
            background: '#111111',
            borderRadius: 10,
            padding: '12px 14px',
            border: '1px solid var(--border)',
            whiteSpace: 'pre-wrap',
            scrollbarWidth: 'thin',
            scrollbarColor: '#e5e5e5 transparent',
          }}>
            {draft.finalDraft || '(No content yet — pipeline running)'}
          </div>
        </div>



        {/* Previous Noa feedback */}
        {draft.noaFeedback && (
          <div style={{ padding: '10px 20px 0' }}>
            <div style={{
              background: '#eff2ff', borderRadius: 10,
              padding: '10px 14px', fontSize: 12.5, color: '#1e40af',
              border: '1px solid #a5b4fc',
            }}>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: 11, color: '#2B3CE3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Previous feedback
              </span>
              {draft.noaFeedback}
            </div>
          </div>
        )}

        {/* Agent pipeline outputs (collapsible) */}
        {hasAgentOutputs && (
          <div style={{ padding: '10px 20px 0' }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', color: '#aaa',
                fontSize: 11.5, fontWeight: 500,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#666')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
            >
              <svg
                width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Agent outputs
            </button>

            {expanded && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 4 }}>
                {[
                  { label: 'Extract & Tag',     value: draft.agent1Output },
                  { label: 'Ideation',          value: draft.agent2Output },
                  { label: 'Script',            value: draft.agent3Output },
                  { label: 'Brand Check',       value: draft.agent4Output },
                  { label: 'Platform Format',   value: draft.agent5Output },
                ].filter(a => a.value).map(a => (
                  <div key={a.label} style={{
                    background: '#141414', borderRadius: 8,
                    padding: '8px 12px', border: '1px solid #efefef',
                  }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#e4e4e7', whiteSpace: 'pre-wrap', maxHeight: 100, overflowY: 'auto', lineHeight: 1.5 }}>
                      {extractText(a.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {(onApprove || onReject || onHardReject || onComment || onDisapprove) && (
          <div style={{
            display: 'flex', gap: 8, padding: '14px 20px 16px',
            marginTop: 10,
            borderTop: '1px solid #f5f5f5',
          }}>
            {mode === 'noa' && onHardReject && (
              <button
                onClick={() => setHardRejectOpen(true)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 10,
                  border: '1px solid #e5e5e5', background: '#111111',
                  fontSize: 13, fontWeight: 500, color: '#555',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff0f0';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5';
                  (e.currentTarget as HTMLButtonElement).style.color = '#dc2626';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fafafa';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e5e5';
                  (e.currentTarget as HTMLButtonElement).style.color = '#555';
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Reject
              </button>
            )}
            {mode === 'noa' && onReject && (
              <button
                onClick={() => setRejectOpen(true)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 10,
                  border: '1px solid #e5e5e5', background: '#111111',
                  fontSize: 13, fontWeight: 500, color: '#555',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#cbd5e1';
                  (e.currentTarget as HTMLButtonElement).style.color = '#334155';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fafafa';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e5e5';
                  (e.currentTarget as HTMLButtonElement).style.color = '#555';
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                Edit
              </button>
            )}
            {mode === 'noa' && onApprove && (
              <button
                onClick={handleApprove}
                disabled={approving}
                style={{
                  flex: 1, padding: '9px', borderRadius: 10,
                  border: '1px solid #d1fae5', background: '#f0fdf4',
                  fontSize: 13, fontWeight: 500, color: '#16a34a',
                  cursor: approving ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  opacity: approving ? 0.6 : 1,
                }}
                onMouseEnter={e => {
                  if (!approving) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#dcfce7';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#86efac';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f0fdf4';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1fae5';
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {approving ? 'Approving…' : 'Approve'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSubmit={onReject!}
        title="Edit & Request Regeneration"
        subtitle="Your feedback will be sent back to the AI agents for revision."
        placeholder="What's wrong with this draft? What should change?"
        submitLabel="Edit & Regenerate"
        submitClassName="btn"
      />
      <ConfirmDialog
        isOpen={hardRejectOpen}
        onClose={() => setHardRejectOpen(false)}
        onConfirm={async () => {
          if (onHardReject) await onHardReject();
        }}
        title="Reject Content"
        message="This will permanently reject this content and it will not be shown again. This cannot be undone."
        confirmLabel="Yes, Reject"
        confirmClassName="btn btn-danger"
      />
      <FeedbackModal
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
        onSubmit={onComment!}
        title="Comment & Request Revision"
        subtitle="Your comment will be sent to the AI agents as additional context."
        placeholder="What should be revised or improved?"
        submitLabel="Send for Revision"
        submitClassName="btn btn-warning"
      />
      <ConfirmDialog
        isOpen={disapproveOpen}
        onClose={() => setDisapproveOpen(false)}
        onConfirm={onDisapprove!}
        title="Disapprove Content"
        message="This will permanently end this content's workflow. The item will be archived as rejected. This cannot be undone."
        confirmLabel="Yes, Disapprove"
        confirmClassName="btn btn-danger"
      />
    </>
  );
}
