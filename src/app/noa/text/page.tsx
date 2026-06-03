'use client';
import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { ContentDraft } from '@/lib/types';
import ContentCard from '@/components/ContentCard/ContentCard';
import EmptyState from '@/components/EmptyState/EmptyState';
import Toast, { ToastMessage } from '@/components/Toast/Toast';
import { CheckCircle2 } from 'lucide-react';
import { getPlatformStatus } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function generateId() { return Math.random().toString(36).slice(2); }

const N8N_NOA_REVIEW_WEBHOOK = "http://168.144.71.48:5678/webhook/noa-review-decision";

async function handleNoaDecision(draft: any, decision: string, feedback: string = "") {
  try {
    const response = await fetch(N8N_NOA_REVIEW_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobId: draft.jobId,
        draftId: draft._id,
        decision: decision,
        platform: draft.virtualPlatform || draft.platform?.toLowerCase(),
        reviewerRole: "noa",
        feedback: feedback,
        reviewedAt: new Date().toISOString()
      })
    });
    const data = await response.json();
    console.log("n8n response:", data);
  } catch (err) {
    console.warn("n8n webhook error:", err);
  }
}

export default function NoaTextPage() {
  const { data, error, isLoading, mutate } = useSWR<ContentDraft[]>(
    '/api/content-drafts?status=ready_for_noa_review',
    fetcher,
    { refreshInterval: 30000 }
  );

  // Merge all docs with the same jobId — the API already does this, but
  // applying it here as well guards against any stale SWR cache returning
  // partial data from before the fix was deployed.
  const rawDrafts = Array.isArray(data)
    ? Object.values(
        data.reduce<Record<string, any>>((acc, doc) => {
          const key = String(doc.jobId);
          if (!acc[key]) { acc[key] = { ...doc }; return acc; }
          const existing = acc[key];
          // Merge per-platform objects (newer doc wins per key)
          const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
          const docTime      = new Date(doc.updatedAt     || doc.createdAt     || 0).getTime();
          const [older, newer] = docTime > existingTime ? [existing, doc] : [doc, existing];
          
          const finalDraft = { ...(older.finalDraft || {}) };
          if (newer.finalDraft) {
            for (const [p, c] of Object.entries(newer.finalDraft)) {
              if (c && typeof c === 'object' && ((c as any).postText !== '' && (c as any).caption !== '')) {
                finalDraft[p] = c;
              } else if (c && typeof c !== 'object') {
                finalDraft[p] = c;
              }
            }
          }

          const platformStatuses = { ...(older.platformStatuses || {}) };
          if (newer.platformStatuses) {
            for (const [p, s] of Object.entries(newer.platformStatuses)) {
              if (s) platformStatuses[p] = s;
            }
          }

          acc[key] = {
            ...newer,
            finalDraft,
            platformStatuses,
            platformFeedbacks: { ...(older.platformFeedbacks || {}), ...(newer.platformFeedbacks || {}) },
          };
          return acc;
        }, {})
      )
    : [];

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'linkedin' | 'x' | 'instagram'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [approvingAll, setApprovingAll] = useState(false);

  function usePersistentSessionCount(key: string) {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      const saved = localStorage.getItem(key);
      if (saved) setCount(parseInt(saved, 10));
    }, [key]);

    const updateCount = useCallback((increment: number | ((prev: number) => number)) => {
      setCount(prev => {
        const next = typeof increment === 'function' ? increment(prev) : prev + increment;
        localStorage.setItem(key, next.toString());
        return next;
      });
    }, [key]);

    return [count, updateCount] as const;
  }

  const [approvedSessionCount, setApprovedSessionCount] = usePersistentSessionCount('noa_text_approved');
  const [rejectedSessionCount, setRejectedSessionCount] = usePersistentSessionCount('noa_text_rejected');
  const [editedSessionCount, setEditedSessionCount] = usePersistentSessionCount('noa_text_edited');

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts(prev => [...prev, { id: generateId(), type, message }]);
  };

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const patch = async (jobId: string, body: object) => {
    const res = await fetch(`/api/content-drafts/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  };

  // Only update the single platform that was acted on.
  // MongoDB $set on platformStatuses.X only changes that one field —
  // the other platforms are untouched in the document.
  const getPlatformStatusesUpdates = (draft: any, targetStatus: string) => ({
    [draft.virtualPlatform]: targetStatus,
  });

  const handleApprove = async (draft: any) => {
    const updates = getPlatformStatusesUpdates(draft, 'pending_founders');
    await patch(draft.jobId, { platformStatuses: updates });
    addToast('success', `Content approved sent to Founder Team ✓`);
    setApprovedSessionCount(prev => prev + 1);
    mutate();
    handleNoaDecision(draft, "approve");
  };

  const handleReject = async (draft: any, feedback: string) => {
    const updates = getPlatformStatusesUpdates(draft, 'rejected_noa');
    await patch(draft.jobId, { 
      platformStatuses: updates,
      platformFeedbacks: { [draft.virtualPlatform]: feedback }
    });
    addToast('info', `Feedback sent AI will regenerate with your feedback`);
    setEditedSessionCount(prev => prev + 1);
    mutate();
    handleNoaDecision(draft, "edit", feedback);
  };

  const handleHardReject = async (draft: any) => {
    const updates = getPlatformStatusesUpdates(draft, 'rejected_permanently');
    await patch(draft.jobId, { 
      platformStatuses: updates,
    });
    addToast('info', `Content permanently rejected`);
    setRejectedSessionCount(prev => prev + 1);
    mutate();
    handleNoaDecision(draft, "reject");
  };
  const linkedInDrafts: any[] = [];
  const xDrafts: any[] = [];
  const instaDrafts: any[] = [];

  rawDrafts.forEach(d => {
    // Use 'no_status' as default so platforms without an explicit status entry
    // never accidentally show as "ready_for_noa_review" (which would happen if
    // we fell back to d.draftStatus and n8n had wiped sibling statuses).
    const sX = getPlatformStatus(d.platformStatuses?.x, 'no_status');
    const sLI = getPlatformStatus(d.platformStatuses?.linkedin, 'no_status');
    const sInsta = getPlatformStatus(d.platformStatuses?.instagram, 'no_status');

    if (sX === 'ready_for_noa_review' && d.finalDraft?.x) {
      xDrafts.push({ ...d, platform: 'X', virtualId: `${d.jobId}-x`, virtualPlatform: 'x', finalDraft: d.finalDraft.x.postText || JSON.stringify(d.finalDraft.x), noaFeedback: d.platformFeedbacks?.x || d.noaFeedback });
    }
    if (sLI === 'ready_for_noa_review' && d.finalDraft?.linkedin) {
      linkedInDrafts.push({ ...d, platform: 'LinkedIn', virtualId: `${d.jobId}-li`, virtualPlatform: 'linkedin', finalDraft: d.finalDraft.linkedin.postText || JSON.stringify(d.finalDraft.linkedin), noaFeedback: d.platformFeedbacks?.linkedin || d.noaFeedback });
    }
    if (sInsta === 'ready_for_noa_review' && d.finalDraft?.instagram) {
      instaDrafts.push({ ...d, platform: 'Instagram', virtualId: `${d.jobId}-insta`, virtualPlatform: 'instagram', finalDraft: d.finalDraft.instagram.caption || JSON.stringify(d.finalDraft.instagram), noaFeedback: d.platformFeedbacks?.instagram || d.noaFeedback });
    }
  });

  const totalDrafts = linkedInDrafts.length + xDrafts.length + instaDrafts.length;

  const handleApproveAll = async () => {
    const draftsToApprove = [
      ...(selectedPlatform === 'all' || selectedPlatform === 'linkedin' ? linkedInDrafts : []),
      ...(selectedPlatform === 'all' || selectedPlatform === 'x' ? xDrafts : []),
      ...(selectedPlatform === 'all' || selectedPlatform === 'instagram' ? instaDrafts : []),
    ];

    if (draftsToApprove.length === 0) {
      addToast('info', 'No drafts to approve in the current view');
      return;
    }

    setApprovingAll(true);
    try {
      addToast('info', `Approving all ${draftsToApprove.length} draft(s)...`);
      await Promise.all(draftsToApprove.map(async d => {
        const updates = getPlatformStatusesUpdates(d, 'pending_founders');
        await patch(d.jobId, { platformStatuses: updates });
        handleNoaDecision(d, "approve");
      }));
      setApprovedSessionCount(prev => prev + draftsToApprove.length);
      addToast('success', `Approved all ${draftsToApprove.length} draft(s) successfully ✓`);
      mutate();
    } catch (err) {
      addToast('error', 'Failed to approve some drafts');
    } finally {
      setApprovingAll(false);
    }
  };

  const sortDrafts = (drafts: any[]) => {
    return [...drafts].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
  };

  const sortedLinkedIn = sortDrafts(linkedInDrafts);
  const sortedX = sortDrafts(xDrafts);
  const sortedInsta = sortDrafts(instaDrafts);

  const PLATFORM_FILTERS: { key: 'all' | 'linkedin' | 'x' | 'instagram'; label: string; dot: string }[] = [
    { key: 'all',       label: 'All',       dot: '' },
    { key: 'linkedin',  label: 'LinkedIn',  dot: '#0077b5' },
    { key: 'x',        label: 'X',         dot: '#111827' },
    { key: 'instagram', label: 'Instagram', dot: '#e1306c' },
  ];

  return (
    <div style={{ padding: '36px 48px', maxWidth: 1400 }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
            Text Review
          </h1>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 4, fontWeight: 400 }}>
            {isLoading ? 'Loading…' : `${totalDrafts} draft${totalDrafts !== 1 ? 's' : ''} awaiting review`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => {
              setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest');
              addToast('info', `Sorted: ${sortBy === 'newest' ? 'oldest first' : 'newest first'}`);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 14px', borderRadius: 10,
              border: '1px solid #e8e8e8', background: '#fff',
              fontSize: 12.5, fontWeight: 500, color: '#555',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            Sort · {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </button>

          <button
            onClick={handleApproveAll}
            disabled={approvingAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 14px', borderRadius: 10,
              border: '1px solid #bbf7d0', background: '#f0fdf4',
              fontSize: 12.5, fontWeight: 500, color: '#16a34a',
              cursor: approvingAll ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', opacity: approvingAll ? 0.6 : 1,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {approvingAll ? 'Approving…' : 'Approve all'}
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 28, background: '#efefef', borderRadius: 14, overflow: 'hidden' }}>
        {[
          { label: 'Pending',  value: totalDrafts,          sub: 'awaiting review' },
          { label: 'Approved', value: approvedSessionCount, sub: 'this session' },
          { label: 'Rejected', value: rejectedSessionCount, sub: 'this session' },
          { label: 'Edited',   value: editedSessionCount,   sub: 'this session' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, padding: '18px 24px',
            background: '#fff',
            margin: '1px',
            borderRadius: i === 0 ? '13px 0 0 13px' : i === 3 ? '0 13px 13px 0' : '0',
          }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111', letterSpacing: '-0.5px', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11.5, color: '#ccc', marginTop: 6 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {PLATFORM_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setSelectedPlatform(f.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              border: selectedPlatform === f.key ? '1px solid #d8d8d8' : '1px solid transparent',
              background: selectedPlatform === f.key ? '#fff' : 'transparent',
              fontSize: 12.5, fontWeight: selectedPlatform === f.key ? 600 : 400,
              color: selectedPlatform === f.key ? '#111' : '#999',
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: selectedPlatform === f.key ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {f.dot && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.dot, flexShrink: 0, display: 'inline-block' }} />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '14px 18px', background: '#fff0f0', borderRadius: 10, color: '#dc2626', marginBottom: 20, fontSize: 13, border: '1px solid #fecaca' }}>
          ⚠ Failed to load. Check your MongoDB connection.
        </div>
      )}

      {/* Board: 3-column kanban for "all", full-width grid for a single platform */}
      {isLoading ? (
        <div className="kanban-board">
          {[1, 2, 3].map(i => (
            <div key={i} className="kanban-column">
              <div className="skeleton" style={{ height: 340, borderRadius: 14 }} />
            </div>
          ))}
        </div>
      ) : totalDrafts === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={48} color="#9ca3af" strokeWidth={1.5} />}
          title="Queue is clear!"
          body="No text content is pending your review right now."
        />
      ) : selectedPlatform === 'all' ? (
        /* ── All platforms: grouped by entry (row-based) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {(() => {
            const sortedRaw = [...rawDrafts].sort((a, b) => {
              const timeA = new Date(a.updatedAt || a.createdAt).getTime();
              const timeB = new Date(b.updatedAt || b.createdAt).getTime();
              return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
            });

            return sortedRaw.map(job => {
              const jobLI = linkedInDrafts.find(d => d.jobId === job.jobId);
              const jobX = xDrafts.find(d => d.jobId === job.jobId);
              const jobInsta = instaDrafts.find(d => d.jobId === job.jobId);

              if (!jobLI && !jobX && !jobInsta) return null;

              return (
                <div key={job.jobId} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Job Header */}
                  <div style={{
                    background: '#fff', borderRadius: 12, border: '1px solid #eaeaea',
                    padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>
                      {job.draftTitle || 'Draft Content'}
                    </h3>
                    <p style={{ fontSize: 13, color: '#666', marginTop: 4, margin: 0 }}>
                      {job.draftShortDescription || 'No description provided.'}
                    </p>
                  </div>

                  {/* 3-column Grid for Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {/* LinkedIn */}
                    <div>
                      {jobLI ? (
                        <ContentCard key={jobLI.virtualId} draft={jobLI} actions={[]} mode="noa"
                          onApprove={() => handleApprove(jobLI)}
                          onReject={feedback => handleReject(jobLI, feedback)}
                          onHardReject={() => handleHardReject(jobLI)}
                        />
                      ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: '#ccc', fontSize: 12.5, border: '1px dashed #eaeaea', borderRadius: 16 }}>
                          Not generated or already reviewed
                        </div>
                      )}
                    </div>

                    {/* X */}
                    <div>
                      {jobX ? (
                        <ContentCard key={jobX.virtualId} draft={jobX} actions={[]} mode="noa"
                          onApprove={() => handleApprove(jobX)}
                          onReject={feedback => handleReject(jobX, feedback)}
                          onHardReject={() => handleHardReject(jobX)}
                        />
                      ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: '#ccc', fontSize: 12.5, border: '1px dashed #eaeaea', borderRadius: 16 }}>
                          Not generated or already reviewed
                        </div>
                      )}
                    </div>

                    {/* Instagram */}
                    <div>
                      {jobInsta ? (
                        <ContentCard key={jobInsta.virtualId} draft={jobInsta} actions={[]} mode="noa"
                          onApprove={() => handleApprove(jobInsta)}
                          onReject={feedback => handleReject(jobInsta, feedback)}
                          onHardReject={() => handleHardReject(jobInsta)}
                        />
                      ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: '#ccc', fontSize: 12.5, border: '1px dashed #eaeaea', borderRadius: 16 }}>
                          Not generated or already reviewed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        /* ── Single platform: full-width 2-column responsive grid ── */
        (() => {
          const cfg = {
            linkedin:  { label: 'LinkedIn',   dot: '#0077b5', drafts: sortedLinkedIn },
            x:         { label: 'X (Twitter)', dot: '#111827', drafts: sortedX },
            instagram: { label: 'Instagram',   dot: '#e1306c', drafts: sortedInsta },
          }[selectedPlatform as 'linkedin' | 'x' | 'instagram'];

          return (
            <div>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, background: '#f5f5f5', borderRadius: 20, padding: '2px 9px', marginLeft: 4 }}>
                  {cfg.drafts.length}
                </span>
              </div>

              {cfg.drafts.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: '#ccc', fontSize: 13 }}>
                  No drafts pending for this platform
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
                  gap: 16,
                }}>
                  {cfg.drafts.map(draft => (
                    <div key={draft.virtualId} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginBottom: 12 }}>
                        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#111', margin: '0 0 2px 0' }}>
                          {draft.draftTitle || 'Draft Content'}
                        </h3>
                        <p style={{ fontSize: 12.5, color: '#666', margin: 0 }}>
                          {draft.draftShortDescription || 'No description provided.'}
                        </p>
                      </div>
                      <ContentCard draft={draft} actions={[]} mode="noa"
                        onApprove={() => handleApprove(draft)}
                        onReject={feedback => handleReject(draft, feedback)}
                        onHardReject={() => handleHardReject(draft)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

