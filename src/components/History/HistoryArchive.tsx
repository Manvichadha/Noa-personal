'use client';
// src/app/founders/history/page.tsx
import { useState } from 'react';
import useSWR from 'swr';
import { ContentDraft, VideoDraft } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import EmptyState from '@/components/EmptyState/EmptyState';
import ContentCard from '@/components/ContentCard/ContentCard';
import { formatDistanceToNow, format } from 'date-fns';
import { Archive } from 'lucide-react';
import { getPlatformStatus } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const FOUNDER_ACTION_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
  approved:    { label: 'Approved',    className: 'founder-action-approved',    icon: '✓' },
  commented:   { label: 'Commented',   className: 'founder-action-commented',   icon: '✎' },
  disapproved: { label: 'Disapproved', className: 'founder-action-disapproved', icon: '✕' },
};

export default function HistoryArchive({ role = 'founder' }: { role?: 'noa' | 'founder' }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Founder sees items that are fully resolved by Founders or commented by Founders
  const FOUNDER_STATUSES = 'approved_founders,rejected_founders,posted,revision_requested_founders';
  
  // Noa sees items that Noa has resolved (approved by Noa -> goes to Founders, or rejected by Noa)
  // This includes things pending founders, and things fully resolved by founders.
  const NOA_STATUSES = 'rejected_permanently,rejected_noa,pending_founders,revision_requested_founders,approved_founders,rejected_founders,posted';

  const fetchStatuses = role === 'noa' ? NOA_STATUSES : FOUNDER_STATUSES;
  const statusArray = fetchStatuses.split(',');

  const { data: textData, isLoading: textLoading } = useSWR<ContentDraft[]>(
    `/api/content-drafts?status=${fetchStatuses}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: videoData, isLoading: videoLoading } = useSWR<VideoDraft[]>(
    `/api/video-drafts?status=${fetchStatuses}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const textItems: any[] = [];
  if (Array.isArray(textData)) {
    textData.forEach((d: any) => {
      const p = d.platformStatuses || {};
      
      const stLI = getPlatformStatus(p.linkedin, d.draftStatus);
      if (d.finalDraft?.linkedin && statusArray.includes(stLI)) {
        textItems.push({ ...d, _type: 'text', finalDraft: d.finalDraft.linkedin.postText || JSON.stringify(d.finalDraft.linkedin), draftStatus: stLI, platform: 'LinkedIn', jobId: d.jobId + '-li',
          noaFeedback: d.platformFeedbacks?.linkedin || d.noaFeedback,
          founderFeedback: d.founderFeedback,
        });
      }
      
      const stX = getPlatformStatus(p.x, d.draftStatus);
      if (d.finalDraft?.x && statusArray.includes(stX)) {
        textItems.push({ ...d, _type: 'text', finalDraft: d.finalDraft.x.postText || JSON.stringify(d.finalDraft.x), draftStatus: stX, platform: 'X', jobId: d.jobId + '-x',
          noaFeedback: d.platformFeedbacks?.x || d.noaFeedback,
          founderFeedback: d.founderFeedback,
        });
      }
      
      const stInsta = getPlatformStatus(p.instagram, d.draftStatus);
      if (d.finalDraft?.instagram && statusArray.includes(stInsta)) {
        textItems.push({ ...d, _type: 'text', finalDraft: d.finalDraft.instagram.caption || JSON.stringify(d.finalDraft.instagram), draftStatus: stInsta, platform: 'Instagram', jobId: d.jobId + '-insta',
          noaFeedback: d.platformFeedbacks?.instagram || d.noaFeedback,
          founderFeedback: d.founderFeedback,
        });
      }
    });
  }

  const allItems = [
    ...textItems,
    ...(Array.isArray(videoData) ? videoData.map(d => ({ ...d, _type: 'video' as const })) : []),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const filtered = allItems.filter(item => {
    if (typeFilter !== 'all' && item._type !== typeFilter) return false;
    if (statusFilter !== 'all' && item.draftStatus !== statusFilter) return false;
    if (platformFilter !== 'all' && ('platform' in item) && item.platform !== platformFilter) return false;
    if (startDate && new Date(item.updatedAt) < new Date(startDate)) return false;
    if (endDate && new Date(item.updatedAt) > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });

  const isLoading = textLoading || videoLoading;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{role === 'noa' ? "Noa's History" : "Founder History"}</h1>
        <p className="page-subtitle">{role === 'noa' ? "Content Noa has approved or rejected" : "All completed, approved, and rejected content"}</p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="text">Text</option>
          <option value="video">Video</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {role === 'noa' && <option value="pending_founders">Pending Founders</option>}
          {role === 'noa' && <option value="rejected_noa">Requires AI Edit</option>}
          {role === 'noa' && <option value="rejected_permanently">Discarded</option>}
          {role === 'founder' && <option value="revision_requested_founders">Commented</option>}
          <option value="approved_founders">Approved (Final)</option>
          <option value="rejected_founders">Rejected (Final)</option>
          <option value="posted">Posted</option>
        </select>
        <select className="filter-select" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
          <option value="all">All Platforms</option>
          <option value="X">X (Twitter)</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Instagram">Instagram</option>
        </select>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="date"
            className="filter-date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            placeholder="Start date"
          />
          <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>to</span>
          <input
            type="date"
            className="filter-date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            placeholder="End date"
          />
        </div>
        {(typeFilter !== 'all' || statusFilter !== 'all' || platformFilter !== 'all' || startDate || endDate) && (
          <button
            className="btn btn-ghost"
            onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setPlatformFilter('all'); setStartDate(''); setEndDate(''); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}{filtered.length !== allItems.length ? ` (filtered from ${allItems.length})` : ''}
        </p>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Archive size={48} color="#9ca3af" strokeWidth={1.5} />}
          title="No archived content"
          body="Completed, approved, and rejected content will appear here."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 16 }}>
          {filtered.map((item) => {
            if (item._type === 'text') {
              return (
                <ContentCard 
                  key={item.jobId} 
                  draft={item as any} 
                  actions={[]} 
                  mode={role === 'founder' ? 'founders' : 'noa'} 
                />
              );
            }

            const founderCfg = item.founderAction ? FOUNDER_ACTION_CONFIG[item.founderAction] : null;
            const timeAgo = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true });
            const exactDate = format(new Date(item.updatedAt), 'MMM d, yyyy · h:mm a');
            
            const contentPreview = (item as VideoDraft).videoUrl ? `Video URL: ${(item as VideoDraft).videoUrl}` : ((item as VideoDraft).finalDraft || '(No video prompt)');

            return (
              <div key={item.jobId} className="history-card">
                {/* Icon */}
                <div className="history-card-icon" style={{
                  background: item._type === 'video' ? '#ede9fe' : '#f0fdf4',
                  color: item._type === 'video' ? '#7c3aed' : '#15803d',
                }}>
                  {item._type === 'video' ? '🎬' : '📝'}
                </div>

                {/* Content */}
                <div className="history-card-content">
                  <div className="history-card-title">
                    {contentPreview}
                  </div>
                  <div className="history-card-meta">
                    <StatusBadge status={item.draftStatus} />
                    {'platform' in item && item.platform && (
                      <span className={`platform-badge platform-${(item.platform as string).toLowerCase()}`}>
                        {item.platform as string}
                      </span>
                    )}
                    <span className="iteration-badge">
                      {item.iterationCount + 1} iteration{item.iterationCount !== 0 ? 's' : ''}
                    </span>
                    {founderCfg && (
                      <span className={`founder-action-badge ${founderCfg.className}`}>
                        {founderCfg.icon} {founderCfg.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{timeAgo}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{exactDate}</span>
                  <code style={{ fontSize: 10, color: 'var(--text-tertiary)', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
                    {item.jobId}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
