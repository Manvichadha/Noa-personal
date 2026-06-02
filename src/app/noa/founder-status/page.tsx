'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { ContentDraft, VideoDraft } from '@/lib/types';
import { format } from 'date-fns';
import EmptyState from '@/components/EmptyState/EmptyState';
import { StatusIcon } from '@/components/Sidebar/Sidebar';
import { getPlatformStatus } from '@/lib/utils';
import { FileText, Film } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function FounderStatusPage() {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Commented'>('All');
  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  const { data: textData, isLoading: textLoading } = useSWR<ContentDraft[]>('/api/content-drafts', fetcher, { refreshInterval: 60000 });
  const { data: videoData, isLoading: videoLoading } = useSWR<VideoDraft[]>('/api/video-drafts', fetcher, { refreshInterval: 60000 });

  const textItems: any[] = [];
  if (Array.isArray(textData)) {
    textData.forEach((d: any) => {
      const p = d.platformStatuses || {};
      if (d.finalDraft?.linkedin) {
        textItems.push({ ...d, _type: 'text', finalDraft: d.finalDraft.linkedin.postText || JSON.stringify(d.finalDraft.linkedin), draftStatus: getPlatformStatus(p.linkedin, d.draftStatus), platform: 'LinkedIn', jobId: d.jobId + '-li', founderFeedback: d.platformFeedbacks?.linkedin || d.founderFeedback });
      }
      if (d.finalDraft?.x) {
        textItems.push({ ...d, _type: 'text', finalDraft: d.finalDraft.x.postText || JSON.stringify(d.finalDraft.x), draftStatus: getPlatformStatus(p.x, d.draftStatus), platform: 'X', jobId: d.jobId + '-x', founderFeedback: d.platformFeedbacks?.x || d.founderFeedback });
      }
      if (d.finalDraft?.instagram) {
        textItems.push({ ...d, _type: 'text', finalDraft: d.finalDraft.instagram.caption || JSON.stringify(d.finalDraft.instagram), draftStatus: getPlatformStatus(p.instagram, d.draftStatus), platform: 'Instagram', jobId: d.jobId + '-insta', founderFeedback: d.platformFeedbacks?.instagram || d.founderFeedback });
      }
    });
  }

  const allItems = [
    ...textItems,
    ...(Array.isArray(videoData) ? videoData.map(d => ({ ...d, _type: 'video' as const })) : []),
  ].filter(item => {
    // Only include items that have reached founders (or were rejected/commented by them)
    return item.draftStatus === 'pending_founders' ||
           item.draftStatus === 'approved_founders' ||
           item.draftStatus === 'posted' ||
           item.draftStatus === 'rejected_founders' ||
           item.draftStatus === 'revision_requested_founders';
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const pendingItems = allItems.filter(i => i.draftStatus === 'pending_founders');
  const approvedItems = allItems.filter(i => i.draftStatus === 'approved_founders' || i.draftStatus === 'posted');
  const rejectedItems = allItems.filter(i => i.draftStatus === 'rejected_founders');
  const commentedItems = allItems.filter(i => i.draftStatus === 'revision_requested_founders');

  const filteredItems = filter === 'All' ? allItems
    : filter === 'Pending' ? pendingItems
    : filter === 'Approved' ? approvedItems
    : filter === 'Rejected' ? rejectedItems
    : commentedItems;

  const getStatusBadge = (status: string) => {
    if (status === 'pending_founders') return <span className="badge badge-pending-founders"><span className="badge-dot" />Pending</span>;
    if (status === 'approved_founders' || status === 'posted') return <span className="badge badge-approved"><span className="badge-dot" />Approved</span>;
    if (status === 'rejected_founders') return <span className="badge badge-rejected"><span className="badge-dot" />Rejected</span>;
    if (status === 'revision_requested_founders') return <span className="badge badge-revision"><span className="badge-dot" />Commented</span>;
    return <span className="badge">{status}</span>;
  };

  const getTitle = (item: any) => {
    const prefix = item._type === 'text' ? 'Content Draft' : (item.videoUrl ? 'Video Draft' : 'Video Prompt');
    const snippet = item._type === 'text' ? (item.finalDraft || '(No text)') : (item.finalDraft || '(No prompt)');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item._type === 'text' ? <FileText size={18} strokeWidth={1.5} /> : <Film size={18} strokeWidth={1.5} />}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{prefix}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {snippet}
          </div>
        </div>
      </div>
    );
  };

  const isLoading = textLoading || videoLoading;

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <h1 className="page-title">Founder Status</h1>
        <p className="page-subtitle">Track the approval state of all content sent to the Founder Team</p>
      </div>

      <div className="pill-toggle-group" style={{ marginBottom: 32 }}>
        <button className={`pill-toggle ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
          All <span className="pill-count">{allItems.length}</span>
        </button>
        <button className={`pill-toggle ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>
          Pending <span className="pill-count">{pendingItems.length}</span>
        </button>
        <button className={`pill-toggle ${filter === 'Approved' ? 'active' : ''}`} onClick={() => setFilter('Approved')}>
          Approved <span className="pill-count">{approvedItems.length}</span>
        </button>
        <button className={`pill-toggle ${filter === 'Commented' ? 'active' : ''}`} onClick={() => setFilter('Commented')}>
          Commented <span className="pill-count">{commentedItems.length}</span>
        </button>
        <button className={`pill-toggle ${filter === 'Rejected' ? 'active' : ''}`} onClick={() => setFilter('Rejected')}>
          Rejected <span className="pill-count">{rejectedItems.length}</span>
        </button>
      </div>

      <div className="tracker-table-wrapper">
        <table className="tracker-table">
          <thead>
            <tr>
              <th>Content</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>Loading...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState icon={<StatusIcon />} title="No items found" body="There are no items matching this status filter." />
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.jobId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ width: '45%' }}>{getTitle(item)}</td>
                  <td style={{ width: '20%' }}>{format(new Date(item.updatedAt), 'MMM dd, yyyy')}</td>
                  <td style={{ width: '20%' }}>{getStatusBadge(item.draftStatus)}</td>
                  <td style={{ width: '15%' }}>
                    {item.draftStatus === 'revision_requested_founders' && item.founderFeedback && (
                      <button className="btn btn-ghost" onClick={() => setSelectedComment(item.founderFeedback!)} style={{ fontSize: 12, padding: '6px 12px' }}>
                        View Comment
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedComment && (
        <div className="modal-overlay" onClick={() => setSelectedComment(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Founder Comment</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedComment(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {selectedComment}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedComment(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
